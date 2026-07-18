/**
* Property-based validation for zgebrd, following the /blahpack-validate process.
*
* Step 0 classification: `z` -> complex scalar; `ge` -> general dense
* (schemes.dense, logical.general); `brd` (BLOCKED reduction to bidiagonal form
* by TWO sets of Householder reflectors) -> reconstruction A = Q*B*Pᴴ AND
* orthonormality QᴴQ = I and PᴴP = I.
*
* zgebrd (blocked; dlabrd panel + dgemm trailing update + dgebd2 tail) reduces a general M x N matrix A to bidiagonal B by an orthogonal
* transformation Qᴴ·A·P = B, so A = Q·B·Pᴴ. If M >= N, B is UPPER bidiagonal
* (Q = H(1)…H(n), P = G(1)…G(n-1)); if M < N, B is LOWER bidiagonal
* (Q = H(1)…H(m-1), P = G(1)…G(m)). H(i) = I − tauq·v·vᴴ, G(i) = I − taup·u·uᴴ,
* with (per the reference Further Details, 0-based here):
*
*   UPPER (M>=N): v_t (len M): v[<t]=0, v[t]=1, v[>t]=A(:,t) (strict lower col t);
*                 u_t (len N): u[<=t]=0, u[t+1]=1, u[>t+1]=A(t,:) (row t, cols>t+1).
*   LOWER (M<N):  v_t (len M): v[<=t]=0, v[t+1]=1, v[>t+1]=A(:,t) (col t, rows>t+1);
*                 u_t (len N): u[<t]=0, u[t]=1, u[>t]=A(t,:) (row t, cols>t).
*
* Passing reconstruction A = Q·B·Pᴴ proves BOTH reflector sets AND d/e are read
* with the correct convention.
*/

import test from 'node:test';

// from lib/<pkg>/base/<routine>/test/ the repo root is five levels up:
import { RNG, scalar as S, logical, schemes, check, layoutInvariant } from '../../../../../test/harness/index.js';
import { matmul as refMatmul } from '../../../../../test/harness/reference.js';
import { checked } from '../../../../../test/harness/ledger.js';
import { assertWorkspaceSufficient, poisonedWork } from '../../../../../test/harness/workspace.js';
import zgebrd from './../lib/ndarray.js';

const sc = S.complex; // z-routine
const LogicalMatrix = logical.LogicalMatrix;
const NB = 32; // hardcoded default block size in lib/base.js


// SIZE SWEEP //

// (M,N) sweep straddling small unrolled-remainder crossovers, in BOTH orientations
// (M >= N -> upper bidiagonal; M < N -> lower bidiagonal) plus square and corner.
const PAIRS = [];
[ 1, 2, 3, 5, 8, 16, 17, 33, 64 ].forEach( function sq( n ) {
	PAIRS.push( [ n, n ] );
} );
[ [ 8, 3 ], [ 17, 8 ], [ 33, 17 ], [ 64, 20 ], [ 40, 33 ],
	[ 3, 8 ], [ 8, 17 ], [ 17, 33 ], [ 20, 64 ], [ 33, 40 ],
	[ 1, 1 ], [ 0, 0 ], [ 0, 3 ], [ 3, 0 ] ].forEach( function rect( p ) {
	PAIRS.push( p );
} );

const ALL_LAYOUTS = schemes.dense.layouts();
const TIGHT_VEC = { 'stride': 1, 'lead': 0, 'tail': 0 };


// HELPERS //

// WORK for the BLOCKED reduction: the optimal blocked path needs (M+N)*NB; sizing
// WORK to that guarantees the blocked path is taken whenever min(M,N) > NB. (The
// unblocked fallback needs only max(M,N); this is always >= that.)
function workLen( M, N ) {
	return Math.max( 1, ( M + N ) * NB, M, N );
}

// A poisoned (NaN) vector of `sc` scalar values (A reflectors / tauq / taup).
function poison( k ) {
	const a = [];
	let i;
	for ( i = 0; i < k; i++ ) {
		a.push( ( sc.name === 'complex' ) ? { 're': NaN, 'im': NaN } : NaN );
	}
	return a;
}

// A poisoned (NaN) REAL vector (d / e are always real, even for z-routines).
function poisonR( k ) {
	const a = [];
	let i;
	for ( i = 0; i < k; i++ ) {
		a.push( NaN );
	}
	return a;
}

// Mtx := H·Mtx where H = I − tau·v·vᴴ, i.e. Mtx -= tau·v·(vᴴ·Mtx).
function applyH( Mtx, v, tau ) {
	const rows = Mtx.rows;
	const cols = Mtx.cols;
	let w, tw, c, r;
	for ( c = 0; c < cols; c++ ) {
		w = sc.zero; // w = vᴴ·Mtx[:,c]
		for ( r = 0; r < rows; r++ ) {
			w = sc.add( w, sc.mul( sc.conj( v[ r ] ), Mtx.get( r, c ) ) );
		}
		tw = sc.mul( tau, w );
		for ( r = 0; r < rows; r++ ) {
			Mtx.set( r, c, sc.sub( Mtx.get( r, c ), sc.mul( v[ r ], tw ) ) );
		}
	}
}

// Q reflector vector v_t (length M), per the upper/lower convention above.
function readVQ( Ar, M, upper, t ) {
	const v = new Array( M );
	let r;
	for ( r = 0; r < M; r++ ) {
		if ( upper ) {
			v[ r ] = ( r < t ) ? sc.zero : ( ( r === t ) ? sc.one : Ar.read( r, t ) );
		} else {
			v[ r ] = ( r <= t ) ? sc.zero : ( ( r === t + 1 ) ? sc.one : Ar.read( r, t ) );
		}
	}
	return v;
}

// P reflector vector u_t (length N), per the upper/lower convention above.
//
// COMPLEX subtlety: zgebd2 wraps the G-reflector generation/application in
// ZLACGV, so the reduction APPLIES G' = I − taup·u'·u'ᴴ but the row LEFT in A is
// conj(u') (the documented `u`). To reproduce the applied P we read conj(stored),
// i.e. sc.conj on the A entries. For the real routine sc.conj is the identity, so
// this is a no-op there (zgebrd unaffected).
function readUP( Ar, N, upper, t ) {
	const u = new Array( N );
	let c;
	for ( c = 0; c < N; c++ ) {
		if ( upper ) {
			u[ c ] = ( c <= t ) ? sc.zero : ( ( c === t + 1 ) ? sc.one : sc.conj( Ar.read( t, c ) ) );
		} else {
			u[ c ] = ( c < t ) ? sc.zero : ( ( c === t ) ? sc.one : sc.conj( Ar.read( t, c ) ) );
		}
	}
	return u;
}

// Form an orthonormal matrix (dim x dim) = R(0)·R(1)···R(count-1) applied to I,
// where R(t) = I − tau_t·vec_t·vec_tᴴ. Fold reflectors right-to-left.
function buildOrtho( dim, count, readVec, taus ) {
	const Q = new LogicalMatrix( sc, dim, dim );
	let t, i, j;
	for ( j = 0; j < dim; j++ ) {
		for ( i = 0; i < dim; i++ ) {
			Q.set( i, j, ( i === j ) ? sc.one : sc.zero );
		}
	}
	for ( t = count - 1; t >= 0; t-- ) {
		applyH( Q, readVec( t ), taus[ t ] );
	}
	return Q;
}

// Build the full M x N bidiagonal B: diagonal = d; upper -> super-diagonal = e,
// lower -> sub-diagonal = e. d/e are plain real numbers wrapped via fromReal.
function buildB( dvals, evals, M, N, upper ) {
	const B = new LogicalMatrix( sc, M, N );
	const mn = Math.min( M, N );
	let i;
	for ( i = 0; i < mn; i++ ) {
		B.set( i, i, sc.fromReal( dvals[ i ] ) );
	}
	for ( i = 0; i < mn - 1; i++ ) {
		if ( upper ) {
			B.set( i, i + 1, sc.fromReal( evals[ i ] ) );
		} else {
			B.set( i + 1, i, sc.fromReal( evals[ i ] ) );
		}
	}
	return B;
}

// Read the full factored A (M x N) back into a LogicalMatrix.
function readFull( Ar, M, N ) {
	const F = new LogicalMatrix( sc, M, N );
	let i, j;
	for ( j = 0; j < N; j++ ) {
		for ( i = 0; i < M; i++ ) {
			F.set( i, j, Ar.read( i, j ) );
		}
	}
	return F;
}


// DRIVER //

// Realize inputs, run the routine, and return everything needed by the checks.
function runOne( M, N, layout, seed ) {
	const mn = Math.min( M, N );
	const rng = new RNG( seed );
	const A0 = logical.general( sc, rng, M, N );
	const Ar = schemes.dense.realize( sc, A0, { 'part': 'full' }, layout );
	const Dr = schemes.realizeVector( S.real, poisonR( mn ), TIGHT_VEC );
	const Er = schemes.realizeVector( S.real, poisonR( Math.max( 0, mn - 1 ) ), TIGHT_VEC );
	const Qr = schemes.realizeVector( sc, poison( mn ), TIGHT_VEC );
	const Pr = schemes.realizeVector( sc, poison( mn ), TIGHT_VEC );
	const Wr = schemes.realizeVector( sc, poison( workLen( M, N ) ), TIGHT_VEC );

	zgebrd( M, N, Ar.data, Ar.args[ 0 ], Ar.args[ 1 ], Ar.args[ 2 ], Dr.data, Dr.args[ 0 ], Dr.args[ 1 ], Er.data, Er.args[ 0 ], Er.args[ 1 ], Qr.data, Qr.args[ 0 ], Qr.args[ 1 ], Pr.data, Pr.args[ 0 ], Pr.args[ 1 ], Wr.data, Wr.args[ 0 ], Wr.args[ 1 ] );

	return { 'A0': A0, 'Ar': Ar, 'Dr': Dr, 'Er': Er, 'Qr': Qr, 'Pr': Pr, 'mn': mn };
}


// Steps 2/3/5: reconstruction A = Q·B·Pᴴ + orthonormality QᴴQ = I, PᴴP = I,
// across the (M,N) sweep (upper + lower) and every dense storage layout.
test( 'zgebrd: A = Q·B·Pᴴ, QᴴQ = I, PᴴP = I ((M,N) sweep x all layouts)', function t() {
	PAIRS.forEach( function eachPair( pr ) {
		const M = pr[ 0 ];
		const N = pr[ 1 ];
		const upper = ( M >= N );
		ALL_LAYOUTS.forEach( function eachLayout( layout, li ) {
			const r = runOne( M, N, layout, 0x100 + ( M * 100 ) + N );
			const mn = r.mn;
			const nQ = upper ? mn : Math.max( 0, mn - 1 );
			const nP = upper ? Math.max( 0, mn - 1 ) : mn;
			const label = 'zgebrd M=' + M + ' N=' + N + ' (' + ( upper ? 'upper' : 'lower' ) + ') layout=' + li;

			const tauq = [];
			const taup = [];
			const dvals = [];
			const evals = [];
			let i;
			for ( i = 0; i < mn; i++ ) {
				tauq.push( r.Qr.read( i ) );
				taup.push( r.Pr.read( i ) );
				dvals.push( r.Dr.read( i ) );
			}
			for ( i = 0; i < mn - 1; i++ ) {
				evals.push( r.Er.read( i ) );
			}

			const Q = buildOrtho( M, nQ, function rv( tt ) {
				return readVQ( r.Ar, M, upper, tt );
			}, tauq );
			const P = buildOrtho( N, nP, function ru( tt ) {
				return readUP( r.Ar, N, upper, tt );
			}, taup );

			checked( 'zgebrd', 'orthonormal', function run() {
				check.assertOrthonormal( sc, Q, { 'label': label + ' Q' } );
			} );
			checked( 'zgebrd', 'orthonormal', function run() {
				check.assertOrthonormal( sc, P, { 'label': label + ' P' } );
			} );

			const B = buildB( dvals, evals, M, N, upper );
			const recon = refMatmul( sc, refMatmul( sc, Q, B, {} ), P, { 'transb': 'c' } );
			checked( 'zgebrd', 'reconstruct', function run() {
				check.assertReconstruct( sc, recon, r.A0, { 'label': label, 'factor': 100 } );
			} );
		} );
	} );
} );


// Step 4: layout-invariance on the BLOCKED path. zgebrd -> dlabrd (dgemv/dger) +
// dgemm trailing update, whose optimized kernels pick their summation form by
// operand strides, so the col<->row storage FLIP legitimately reorders arithmetic
// (~1 ULP) while the property above proves the flipped result is still correct.
// Assert BIT-EXACTNESS only WITHIN a storage-order family (col vs row); this still
// fuzzes offset, leading-dim padding, and stride SIGN. Do BOTH an M>=N (upper) and
// an M<N (lower) BLOCKED shape (min > NB=32). d/e/tauq/taup layouts fuzzed in
// parallel; WORK stays tight & generously sized so the block-size decision (which
// depends on the effective LWORK) is identical across every variant.
const colLayouts = ALL_LAYOUTS.filter( function isCol( L ) {
	return L.order !== 'row';
} );
const rowLayouts = ALL_LAYOUTS.filter( function isRow( L ) {
	return L.order === 'row';
} );
const VEC_LAYOUTS = schemes.vectorLayouts();

function flatAll( r, M, N ) {
	const out = check.flattenLogical( sc, readFull( r.Ar, M, N ) );
	const mn = r.mn;
	let i, c, k;
	for ( i = 0; i < mn; i++ ) {
		out.push( r.Dr.read( i ) );
	}
	for ( i = 0; i < mn - 1; i++ ) {
		out.push( r.Er.read( i ) );
	}
	for ( i = 0; i < mn; i++ ) {
		c = sc.components( r.Qr.read( i ) );
		for ( k = 0; k < c.length; k++ ) {
			out.push( c[ k ] );
		}
	}
	for ( i = 0; i < mn; i++ ) {
		c = sc.components( r.Pr.read( i ) );
		for ( k = 0; k < c.length; k++ ) {
			out.push( c[ k ] );
		}
	}
	return out;
}

// runOne but with fuzzed output-vector layouts (index i) and a fixed tight WORK.
function runInvariant( M, N, layout, vi, seed ) {
	const mn = Math.min( M, N );
	const rng = new RNG( seed );
	const A0 = logical.general( sc, rng, M, N );
	const Ar = schemes.dense.realize( sc, A0, { 'part': 'full' }, layout );
	const dl = VEC_LAYOUTS[ vi % VEC_LAYOUTS.length ];
	const el = VEC_LAYOUTS[ ( vi + 1 ) % VEC_LAYOUTS.length ];
	const ql = VEC_LAYOUTS[ ( vi + 2 ) % VEC_LAYOUTS.length ];
	const pl = VEC_LAYOUTS[ ( vi + 3 ) % VEC_LAYOUTS.length ];
	const Dr = schemes.realizeVector( S.real, poisonR( mn ), dl );
	const Er = schemes.realizeVector( S.real, poisonR( Math.max( 0, mn - 1 ) ), el );
	const Qr = schemes.realizeVector( sc, poison( mn ), ql );
	const Pr = schemes.realizeVector( sc, poison( mn ), pl );
	const Wr = schemes.realizeVector( sc, poison( workLen( M, N ) ), TIGHT_VEC );

	zgebrd( M, N, Ar.data, Ar.args[ 0 ], Ar.args[ 1 ], Ar.args[ 2 ], Dr.data, Dr.args[ 0 ], Dr.args[ 1 ], Er.data, Er.args[ 0 ], Er.args[ 1 ], Qr.data, Qr.args[ 0 ], Qr.args[ 1 ], Pr.data, Pr.args[ 0 ], Pr.args[ 1 ], Wr.data, Wr.args[ 0 ], Wr.args[ 1 ] );

	return { 'Ar': Ar, 'Dr': Dr, 'Er': Er, 'Qr': Qr, 'Pr': Pr, 'mn': mn };
}

test( 'zgebrd: bit-exact within storage-order family (col / row), upper + lower', function t() {
	[ [ 40, 36 ], [ 36, 40 ] ].forEach( function eachShape( pr ) {
		const M = pr[ 0 ];
		const N = pr[ 1 ];
		const tag = ( M >= N ) ? 'upper' : 'lower';
		runFamily( colLayouts, 'col', M, N, tag );
		runFamily( rowLayouts, 'row', M, N, tag );
	} );

	function runFamily( variants, fam, M, N, tag ) {
		checked( 'zgebrd', 'layout-invariance', function run() {
			layoutInvariant( variants, function build( layout, i ) {
				const r = runInvariant( M, N, layout, i, 0xF00D );
				return flatAll( r, M, N );
			}, { 'label': 'zgebrd layout invariance ' + fam + '-major ' + tag + ' (M=' + M + ' N=' + N + ')' } );
		} );
	}
} );


// Step 4c: WORKSPACE CONFORMANCE (plain assertion, NOT `checked`). The blocked
// zgebrd derives its effective NB from the WORK length actually provided: the
// optimal blocked path needs (M+N)*NB, a reduced-NB blocked path runs down to
// (M+N)*2, and below that it falls back to the unblocked kernel (needing only
// max(M,N)). The ndarray wrapper advertises the UNBLOCKED minimum max(1,M,N); this
// asserts that advertised minimum truly suffices (poisoned WORK at exactly that
// length -> finite + reconstruction), AND separately probes the reduced-NB and
// full blocked WORK boundaries with a poisoned buffer so any over-read past the
// X/Y partition (an under-count NaN leak on the blocked path) fails loudly.
function reconstructAt( M, N, len, seed ) {
	const mn = Math.min( M, N );
	const upper = ( M >= N );
	const rng = new RNG( seed );
	const A0 = logical.general( sc, rng, M, N );
	const Ar = schemes.dense.realize( sc, A0, { 'part': 'full' }, null );
	const Dr = schemes.realizeVector( S.real, poisonR( mn ), TIGHT_VEC );
	const Er = schemes.realizeVector( S.real, poisonR( Math.max( 0, mn - 1 ) ), TIGHT_VEC );
	const Qr = schemes.realizeVector( sc, poison( mn ), TIGHT_VEC );
	const Pr = schemes.realizeVector( sc, poison( mn ), TIGHT_VEC );
	const Wr = poisonedWork( sc, len );

	zgebrd( M, N, Ar.data, Ar.args[ 0 ], Ar.args[ 1 ], Ar.args[ 2 ], Dr.data, Dr.args[ 0 ], Dr.args[ 1 ], Er.data, Er.args[ 0 ], Er.args[ 1 ], Qr.data, Qr.args[ 0 ], Qr.args[ 1 ], Pr.data, Pr.args[ 0 ], Pr.args[ 1 ], Wr, 1, 0 );

	const nQ = upper ? mn : Math.max( 0, mn - 1 );
	const nP = upper ? Math.max( 0, mn - 1 ) : mn;
	const tauq = [];
	const taup = [];
	const dvals = [];
	const evals = [];
	let i;
	for ( i = 0; i < mn; i++ ) {
		tauq.push( Qr.read( i ) );
		taup.push( Pr.read( i ) );
		dvals.push( Dr.read( i ) );
	}
	for ( i = 0; i < mn - 1; i++ ) {
		evals.push( Er.read( i ) );
	}
	const Q = buildOrtho( M, nQ, function rv( tt ) {
		return readVQ( Ar, M, upper, tt );
	}, tauq );
	const P = buildOrtho( N, nP, function ru( tt ) {
		return readUP( Ar, N, upper, tt );
	}, taup );
	const B = buildB( dvals, evals, M, N, upper );
	return refMatmul( sc, refMatmul( sc, Q, B, {} ), P, { 'transb': 'c' } );
}

test( 'zgebrd: advertised WORK minimum suffices + blocked-path workspace boundaries (Step 4c)', function t() {
	[ [ 80, 80 ], [ 100, 40 ], [ 40, 100 ] ].forEach( function eachCase( pr ) {
		const M = pr[ 0 ];
		const N = pr[ 1 ];
		const mn = Math.min( M, N );
		const SEED = 0xB10C + ( M * 7 ) + N;
		const label = 'zgebrd WORK-min M=' + M + ' N=' + N;

		if ( mn <= NB ) {
			throw new Error( label + ': case is not on the blocked path (min<=NB); pick larger dims' );
		}

		// The wrapper's advertised minimum (max(1,M,N), unblocked fallback) must
		// produce fully-finite output at a poisoned buffer of exactly that length.
		function run( len ) {
			const rng = new RNG( SEED );
			const A0 = logical.general( sc, rng, M, N );
			const Ar = schemes.dense.realize( sc, A0, { 'part': 'full' }, null );
			const Dr = schemes.realizeVector( S.real, poisonR( mn ), TIGHT_VEC );
			const Er = schemes.realizeVector( S.real, poisonR( Math.max( 0, mn - 1 ) ), TIGHT_VEC );
			const Qr = schemes.realizeVector( sc, poison( mn ), TIGHT_VEC );
			const Pr = schemes.realizeVector( sc, poison( mn ), TIGHT_VEC );
			const Wr = poisonedWork( sc, len );
			zgebrd( M, N, Ar.data, Ar.args[ 0 ], Ar.args[ 1 ], Ar.args[ 2 ], Dr.data, Dr.args[ 0 ], Dr.args[ 1 ], Er.data, Er.args[ 0 ], Er.args[ 1 ], Qr.data, Qr.args[ 0 ], Qr.args[ 1 ], Pr.data, Pr.args[ 0 ], Pr.args[ 1 ], Wr, 1, 0 );
			return check.flattenLogical( sc, readFull( Ar, M, N ) );
		}
		const minLen = assertWorkspaceSufficient( run, {}, label );
		check.assertReconstruct( sc, reconstructAt( M, N, minLen, SEED ), reconGold( M, N, SEED ), { 'label': label + ' (WORK=' + minLen + ')', 'factor': 100 } );

		// Explicit blocked-path boundaries: reduced-NB minimum (M+N)*2 and optimal
		// (M+N)*NB. A poisoned buffer at each must give finite output AND reconstruct
		// (proving no over-read past the X/Y WORK partition).
		[ ( M + N ) * 2, ( M + N ) * NB ].forEach( function eachLen( len ) {
			const recon = reconstructAt( M, N, len, SEED );
			check.assertReconstruct( sc, recon, reconGold( M, N, SEED ), { 'label': label + ' blocked WORK=' + len, 'factor': 100 } );
		} );
	} );

	// Independent gold copy of A0 for the reconstruction target.
	function reconGold( M, N, seed ) {
		return logical.general( sc, new RNG( seed ), M, N );
	}
} );
