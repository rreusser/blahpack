/**
* Property-based validation for dgebrd, following the /blahpack-validate process.
*
* Step 0 classification: `d` -> real scalar; `ge` -> general dense
* (schemes.dense, logical.general); `brd` (BLOCKED reduction to bidiagonal form
* by TWO sets of Householder reflectors) -> reconstruction A = Q*B*Pᴴ AND
* orthonormality QᴴQ = I and PᴴP = I.
*
* dgebrd (blocked; dlabrd panel + dgemm trailing update + dgebd2 tail) reduces a general M x N matrix A to bidiagonal B by an orthogonal
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
import dgebrd from './../lib/ndarray.js';

var sc = S.real; // d-routine
var LogicalMatrix = logical.LogicalMatrix;
var NB = 32; // hardcoded default block size in lib/base.js


// SIZE SWEEP //

// (M,N) sweep straddling small unrolled-remainder crossovers, in BOTH orientations
// (M >= N -> upper bidiagonal; M < N -> lower bidiagonal) plus square and corner.
var PAIRS = [];
[ 1, 2, 3, 5, 8, 16, 17, 33, 64 ].forEach( function sq( n ) {
	PAIRS.push( [ n, n ] );
} );
[ [ 8, 3 ], [ 17, 8 ], [ 33, 17 ], [ 64, 20 ], [ 40, 33 ],
	[ 3, 8 ], [ 8, 17 ], [ 17, 33 ], [ 20, 64 ], [ 33, 40 ],
	[ 1, 1 ], [ 0, 0 ], [ 0, 3 ], [ 3, 0 ] ].forEach( function rect( p ) {
	PAIRS.push( p );
} );

var ALL_LAYOUTS = schemes.dense.layouts();
var TIGHT_VEC = { 'stride': 1, 'lead': 0, 'tail': 0 };


// HELPERS //

// WORK for the BLOCKED reduction: the optimal blocked path needs (M+N)*NB; sizing
// WORK to that guarantees the blocked path is taken whenever min(M,N) > NB. (The
// unblocked fallback needs only max(M,N); this is always >= that.)
function workLen( M, N ) {
	return Math.max( 1, ( M + N ) * NB, M, N );
}

// A poisoned (NaN) vector of `sc` scalar values (A reflectors / tauq / taup).
function poison( k ) {
	var a = [];
	var i;
	for ( i = 0; i < k; i++ ) {
		a.push( ( sc.name === 'complex' ) ? { 're': NaN, 'im': NaN } : NaN );
	}
	return a;
}

// A poisoned (NaN) REAL vector (d / e are always real, even for z-routines).
function poisonR( k ) {
	var a = [];
	var i;
	for ( i = 0; i < k; i++ ) {
		a.push( NaN );
	}
	return a;
}

// Mtx := H·Mtx where H = I − tau·v·vᴴ, i.e. Mtx -= tau·v·(vᴴ·Mtx).
function applyH( Mtx, v, tau ) {
	var rows = Mtx.rows;
	var cols = Mtx.cols;
	var w;
	var tw;
	var c;
	var r;
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
	var v = new Array( M );
	var r;
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
// this is a no-op there (dgebrd unaffected).
function readUP( Ar, N, upper, t ) {
	var u = new Array( N );
	var c;
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
	var Q = new LogicalMatrix( sc, dim, dim );
	var t;
	var i;
	var j;
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
	var B = new LogicalMatrix( sc, M, N );
	var mn = Math.min( M, N );
	var i;
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
	var F = new LogicalMatrix( sc, M, N );
	var i;
	var j;
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
	var mn = Math.min( M, N );
	var rng = new RNG( seed );
	var A0 = logical.general( sc, rng, M, N );
	var Ar = schemes.dense.realize( sc, A0, { 'part': 'full' }, layout );
	var Dr = schemes.realizeVector( S.real, poisonR( mn ), TIGHT_VEC );
	var Er = schemes.realizeVector( S.real, poisonR( Math.max( 0, mn - 1 ) ), TIGHT_VEC );
	var Qr = schemes.realizeVector( sc, poison( mn ), TIGHT_VEC );
	var Pr = schemes.realizeVector( sc, poison( mn ), TIGHT_VEC );
	var Wr = schemes.realizeVector( sc, poison( workLen( M, N ) ), TIGHT_VEC );

	dgebrd( M, N, Ar.data, Ar.args[ 0 ], Ar.args[ 1 ], Ar.args[ 2 ], Dr.data, Dr.args[ 0 ], Dr.args[ 1 ], Er.data, Er.args[ 0 ], Er.args[ 1 ], Qr.data, Qr.args[ 0 ], Qr.args[ 1 ], Pr.data, Pr.args[ 0 ], Pr.args[ 1 ], Wr.data, Wr.args[ 0 ], Wr.args[ 1 ] );

	return { 'A0': A0, 'Ar': Ar, 'Dr': Dr, 'Er': Er, 'Qr': Qr, 'Pr': Pr, 'mn': mn };
}


// Steps 2/3/5: reconstruction A = Q·B·Pᴴ + orthonormality QᴴQ = I, PᴴP = I,
// across the (M,N) sweep (upper + lower) and every dense storage layout.
test( 'dgebrd: A = Q·B·Pᴴ, QᴴQ = I, PᴴP = I ((M,N) sweep x all layouts)', function t() {
	PAIRS.forEach( function eachPair( pr ) {
		var M = pr[ 0 ];
		var N = pr[ 1 ];
		var upper = ( M >= N );
		ALL_LAYOUTS.forEach( function eachLayout( layout, li ) {
			var r = runOne( M, N, layout, 0x100 + ( M * 100 ) + N );
			var mn = r.mn;
			var nQ = upper ? mn : Math.max( 0, mn - 1 );
			var nP = upper ? Math.max( 0, mn - 1 ) : mn;
			var label = 'dgebrd M=' + M + ' N=' + N + ' (' + ( upper ? 'upper' : 'lower' ) + ') layout=' + li;

			var tauq = [];
			var taup = [];
			var dvals = [];
			var evals = [];
			var i;
			for ( i = 0; i < mn; i++ ) {
				tauq.push( r.Qr.read( i ) );
				taup.push( r.Pr.read( i ) );
				dvals.push( r.Dr.read( i ) );
			}
			for ( i = 0; i < mn - 1; i++ ) {
				evals.push( r.Er.read( i ) );
			}

			var Q = buildOrtho( M, nQ, function rv( tt ) {
				return readVQ( r.Ar, M, upper, tt );
			}, tauq );
			var P = buildOrtho( N, nP, function ru( tt ) {
				return readUP( r.Ar, N, upper, tt );
			}, taup );

			checked( 'dgebrd', 'orthonormal', function run() {
				check.assertOrthonormal( sc, Q, { 'label': label + ' Q' } );
			} );
			checked( 'dgebrd', 'orthonormal', function run() {
				check.assertOrthonormal( sc, P, { 'label': label + ' P' } );
			} );

			var B = buildB( dvals, evals, M, N, upper );
			var recon = refMatmul( sc, refMatmul( sc, Q, B, {} ), P, { 'transb': 'c' } );
			checked( 'dgebrd', 'reconstruct', function run() {
				check.assertReconstruct( sc, recon, r.A0, { 'label': label, 'factor': 100 } );
			} );
		} );
	} );
} );


// Step 4: layout-invariance on the BLOCKED path. dgebrd -> dlabrd (dgemv/dger) +
// dgemm trailing update, whose optimized kernels pick their summation form by
// operand strides, so the col<->row storage FLIP legitimately reorders arithmetic
// (~1 ULP) while the property above proves the flipped result is still correct.
// Assert BIT-EXACTNESS only WITHIN a storage-order family (col vs row); this still
// fuzzes offset, leading-dim padding, and stride SIGN. Do BOTH an M>=N (upper) and
// an M<N (lower) BLOCKED shape (min > NB=32). d/e/tauq/taup layouts fuzzed in
// parallel; WORK stays tight & generously sized so the block-size decision (which
// depends on the effective LWORK) is identical across every variant.
var colLayouts = ALL_LAYOUTS.filter( function isCol( L ) {
	return L.order !== 'row';
} );
var rowLayouts = ALL_LAYOUTS.filter( function isRow( L ) {
	return L.order === 'row';
} );
var VEC_LAYOUTS = schemes.vectorLayouts();

function flatAll( r, M, N ) {
	var out = check.flattenLogical( sc, readFull( r.Ar, M, N ) );
	var mn = r.mn;
	var i;
	var c;
	var k;
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
	var mn = Math.min( M, N );
	var rng = new RNG( seed );
	var A0 = logical.general( sc, rng, M, N );
	var Ar = schemes.dense.realize( sc, A0, { 'part': 'full' }, layout );
	var dl = VEC_LAYOUTS[ vi % VEC_LAYOUTS.length ];
	var el = VEC_LAYOUTS[ ( vi + 1 ) % VEC_LAYOUTS.length ];
	var ql = VEC_LAYOUTS[ ( vi + 2 ) % VEC_LAYOUTS.length ];
	var pl = VEC_LAYOUTS[ ( vi + 3 ) % VEC_LAYOUTS.length ];
	var Dr = schemes.realizeVector( S.real, poisonR( mn ), dl );
	var Er = schemes.realizeVector( S.real, poisonR( Math.max( 0, mn - 1 ) ), el );
	var Qr = schemes.realizeVector( sc, poison( mn ), ql );
	var Pr = schemes.realizeVector( sc, poison( mn ), pl );
	var Wr = schemes.realizeVector( sc, poison( workLen( M, N ) ), TIGHT_VEC );

	dgebrd( M, N, Ar.data, Ar.args[ 0 ], Ar.args[ 1 ], Ar.args[ 2 ], Dr.data, Dr.args[ 0 ], Dr.args[ 1 ], Er.data, Er.args[ 0 ], Er.args[ 1 ], Qr.data, Qr.args[ 0 ], Qr.args[ 1 ], Pr.data, Pr.args[ 0 ], Pr.args[ 1 ], Wr.data, Wr.args[ 0 ], Wr.args[ 1 ] );

	return { 'Ar': Ar, 'Dr': Dr, 'Er': Er, 'Qr': Qr, 'Pr': Pr, 'mn': mn };
}

test( 'dgebrd: bit-exact within storage-order family (col / row), upper + lower', function t() {
	[ [ 40, 36 ], [ 36, 40 ] ].forEach( function eachShape( pr ) {
		var M = pr[ 0 ];
		var N = pr[ 1 ];
		var tag = ( M >= N ) ? 'upper' : 'lower';
		runFamily( colLayouts, 'col', M, N, tag );
		runFamily( rowLayouts, 'row', M, N, tag );
	} );

	function runFamily( variants, fam, M, N, tag ) {
		checked( 'dgebrd', 'layout-invariance', function run() {
			layoutInvariant( variants, function build( layout, i ) {
				var r = runInvariant( M, N, layout, i, 0xF00D );
				return flatAll( r, M, N );
			}, { 'label': 'dgebrd layout invariance ' + fam + '-major ' + tag + ' (M=' + M + ' N=' + N + ')' } );
		} );
	}
} );


// Step 4c: WORKSPACE CONFORMANCE (plain assertion, NOT `checked`). The blocked
// dgebrd derives its effective NB from the WORK length actually provided: the
// optimal blocked path needs (M+N)*NB, a reduced-NB blocked path runs down to
// (M+N)*2, and below that it falls back to the unblocked kernel (needing only
// max(M,N)). The ndarray wrapper advertises the UNBLOCKED minimum max(1,M,N); this
// asserts that advertised minimum truly suffices (poisoned WORK at exactly that
// length -> finite + reconstruction), AND separately probes the reduced-NB and
// full blocked WORK boundaries with a poisoned buffer so any over-read past the
// X/Y partition (an under-count NaN leak on the blocked path) fails loudly.
function reconstructAt( M, N, len, seed ) {
	var mn = Math.min( M, N );
	var upper = ( M >= N );
	var rng = new RNG( seed );
	var A0 = logical.general( sc, rng, M, N );
	var Ar = schemes.dense.realize( sc, A0, { 'part': 'full' }, null );
	var Dr = schemes.realizeVector( S.real, poisonR( mn ), TIGHT_VEC );
	var Er = schemes.realizeVector( S.real, poisonR( Math.max( 0, mn - 1 ) ), TIGHT_VEC );
	var Qr = schemes.realizeVector( sc, poison( mn ), TIGHT_VEC );
	var Pr = schemes.realizeVector( sc, poison( mn ), TIGHT_VEC );
	var Wr = poisonedWork( sc, len );

	dgebrd( M, N, Ar.data, Ar.args[ 0 ], Ar.args[ 1 ], Ar.args[ 2 ], Dr.data, Dr.args[ 0 ], Dr.args[ 1 ], Er.data, Er.args[ 0 ], Er.args[ 1 ], Qr.data, Qr.args[ 0 ], Qr.args[ 1 ], Pr.data, Pr.args[ 0 ], Pr.args[ 1 ], Wr, 1, 0 );

	var nQ = upper ? mn : Math.max( 0, mn - 1 );
	var nP = upper ? Math.max( 0, mn - 1 ) : mn;
	var tauq = [];
	var taup = [];
	var dvals = [];
	var evals = [];
	var i;
	for ( i = 0; i < mn; i++ ) {
		tauq.push( Qr.read( i ) );
		taup.push( Pr.read( i ) );
		dvals.push( Dr.read( i ) );
	}
	for ( i = 0; i < mn - 1; i++ ) {
		evals.push( Er.read( i ) );
	}
	var Q = buildOrtho( M, nQ, function rv( tt ) {
		return readVQ( Ar, M, upper, tt );
	}, tauq );
	var P = buildOrtho( N, nP, function ru( tt ) {
		return readUP( Ar, N, upper, tt );
	}, taup );
	var B = buildB( dvals, evals, M, N, upper );
	return refMatmul( sc, refMatmul( sc, Q, B, {} ), P, { 'transb': 'c' } );
}

test( 'dgebrd: advertised WORK minimum suffices + blocked-path workspace boundaries (Step 4c)', function t() {
	[ [ 80, 80 ], [ 100, 40 ], [ 40, 100 ] ].forEach( function eachCase( pr ) {
		var M = pr[ 0 ];
		var N = pr[ 1 ];
		var mn = Math.min( M, N );
		var SEED = 0xB10C + ( M * 7 ) + N;
		var label = 'dgebrd WORK-min M=' + M + ' N=' + N;

		if ( mn <= NB ) {
			throw new Error( label + ': case is not on the blocked path (min<=NB); pick larger dims' );
		}

		// The wrapper's advertised minimum (max(1,M,N), unblocked fallback) must
		// produce fully-finite output at a poisoned buffer of exactly that length.
		function run( len ) {
			var rng = new RNG( SEED );
			var A0 = logical.general( sc, rng, M, N );
			var Ar = schemes.dense.realize( sc, A0, { 'part': 'full' }, null );
			var Dr = schemes.realizeVector( S.real, poisonR( mn ), TIGHT_VEC );
			var Er = schemes.realizeVector( S.real, poisonR( Math.max( 0, mn - 1 ) ), TIGHT_VEC );
			var Qr = schemes.realizeVector( sc, poison( mn ), TIGHT_VEC );
			var Pr = schemes.realizeVector( sc, poison( mn ), TIGHT_VEC );
			var Wr = poisonedWork( sc, len );
			dgebrd( M, N, Ar.data, Ar.args[ 0 ], Ar.args[ 1 ], Ar.args[ 2 ], Dr.data, Dr.args[ 0 ], Dr.args[ 1 ], Er.data, Er.args[ 0 ], Er.args[ 1 ], Qr.data, Qr.args[ 0 ], Qr.args[ 1 ], Pr.data, Pr.args[ 0 ], Pr.args[ 1 ], Wr, 1, 0 );
			return check.flattenLogical( sc, readFull( Ar, M, N ) );
		}
		var minLen = assertWorkspaceSufficient( run, {}, label );
		check.assertReconstruct( sc, reconstructAt( M, N, minLen, SEED ), reconGold( M, N, SEED ), { 'label': label + ' (WORK=' + minLen + ')', 'factor': 100 } );

		// Explicit blocked-path boundaries: reduced-NB minimum (M+N)*2 and optimal
		// (M+N)*NB. A poisoned buffer at each must give finite output AND reconstruct
		// (proving no over-read past the X/Y WORK partition).
		[ ( M + N ) * 2, ( M + N ) * NB ].forEach( function eachLen( len ) {
			var recon = reconstructAt( M, N, len, SEED );
			check.assertReconstruct( sc, recon, reconGold( M, N, SEED ), { 'label': label + ' blocked WORK=' + len, 'factor': 100 } );
		} );
	} );

	// Independent gold copy of A0 for the reconstruction target.
	function reconGold( M, N, seed ) {
		return logical.general( sc, new RNG( seed ), M, N );
	}
} );
