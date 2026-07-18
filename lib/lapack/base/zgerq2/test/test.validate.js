/* eslint-disable no-restricted-syntax, stdlib/first-unit-test, max-len, id-length, max-depth, max-params */

/**
* Property-based validation for zgerq2, following the /blahpack-validate process.
*
* Step 0 classification: `z` -> complex scalar; `ge` -> general dense
* (schemes.dense, logical.general); `rq2` (UNBLOCKED RQ factorization) ->
* reconstruction A = R * Q AND orthonormality of the (square) Q.
*
* RQ REFLECTOR CONVENTION (from data/lapack-3.12.0/SRC/zgerq2.f, restricted to
* the validated M <= N case so k = min(M,N) = M):
*
*   - On exit the upper triangle of the top-right M-by-M block A(0:M-1, N-M:N-1)
*     holds R: row i carries R in columns j >= N-M+i (the "RQ diagonal" sits at
*     column p_i = N-M+i), and everything strictly left of it is the reflector.
*   - Reflector i (i = 0..k-1) lives in ROW i, columns 0..p_i-1 (its essential
*     part), with an implicit 1 at column p_i and zeros beyond. dgerqf/zgerq2
*     store conj(v) there (zgerq2 conjugates the row before/after via the complex
*     ZLACGV; for the real trait conj is a no-op), so applyHRight below reads the
*     stored value directly as `v` and lets its conj()'d dot / plain-v update
*     realize C := C * H(i)ᴴ where the true reflector is vv = conj(v).
*   - Each H(i) = I - tau_i * vv * vvᴴ, and (zgerq2.f Further Details)
*     Q = H(1) H(2) ... H(k)  ==>  A = R * H(1)ᴴ H(2)ᴴ ... H(k)ᴴ. So BOTH the
*     reconstruction (started from R) and Q (started from I_N) come from the SAME
*     right-application loop taken FORWARD, i = 0 -> k-1 (the OPPOSITE order to LQ
*     dgelqf's H(k)...H(1)); this is verified empirically (backward order gives
*     O(1) relative error). Q is a full N-by-N unitary, so assertOrthonormal (which
*     checks QᴴQ = I) applies directly.
*
* A = R * Q is an EXACT algebraic identity for ANY general M-by-N A, so plain
* random general A suffices at every (M,N); zgerq2 is unblocked so there is no
* block threshold to straddle, but the (M,N) sweep still spans the unrolled
* remainder crossovers and larger sizes.
*/

import test from 'node:test';
import { RNG, scalar as S, logical, schemes, check, layoutInvariant } from '../../../../../test/harness/index.js';
import { checked } from '../../../../../test/harness/ledger.js';
import { assertWorkspaceSufficient, poisonedWork } from '../../../../../test/harness/workspace.js';
import zgerq2 from './../lib/ndarray.js';

const sc = S.complex; // z-routine
const LogicalMatrix = logical.LogicalMatrix;
const ROUTINE = 'zgerq2';


// HELPERS //

// Unblocked WORK need: zgerq2's dlarf('Right', ...) scratch is at most M.
function workLen( M ) {
	return Math.max( 1, M );
}

// Poisoned (NaN) array of scalar values, so an unwritten output slot reads NaN.
function poison( k ) {
	const a = [];
	let i;
	for ( i = 0; i < k; i++ ) {
		a.push( ( sc.name === 'complex' ) ? { 're': NaN, 'im': NaN } : NaN );
	}
	return a;
}

// (M,N) sweep, M <= N only: squares + wide rectangles + zero-dimension corners.
const PAIRS = [];
[ 0, 1, 2, 3, 5, 8, 16, 17, 31, 32, 33, 48, 64, 100 ].forEach( function sq( n ) {
	PAIRS.push( [ n, n ] );
});
[ [ 3, 7 ], [ 5, 8 ], [ 8, 16 ], [ 16, 33 ], [ 33, 64 ], [ 40, 65 ], [ 2, 6 ], [ 1, 5 ], [ 17, 40 ], [ 0, 4 ] ].forEach( function rect( p ) {
	PAIRS.push( p );
});

// Read the essential Householder row v_i (length N): stored essential part in
// columns 0..p-1 (p = N-M+i), implicit 1 at column p, zeros after.
function reflectorRow( R, i, M, N ) {
	const p = N - M + i;
	const v = [];
	let j;
	for ( j = 0; j < N; j++ ) {
		if ( j < p ) {
			v.push( R.read( i, j ) );
		} else if ( j === p ) {
			v.push( sc.one );
		} else {
			v.push( sc.zero );
		}
	}
	return v;
}

// Right-apply H(i)ᴴ: Mtx := Mtx - conj(tau) * (Mtx * conj(v)) * v, where v is a
// row vector of length Mtx.cols and the true reflector is vv = conj(v). This is
// C * H(i)ᴴ = C - conj(tau) (C vv) vvᴴ (complex: conj(tau) and conj(v) are genuine).
function applyHRight( Mtx, v, tau ) {
	const rows = Mtx.rows;
	const cols = Mtx.cols;
	const ctau = sc.conj( tau );
	let coef, dot, r, j;
	for ( r = 0; r < rows; r++ ) {
		dot = sc.zero;
		for ( j = 0; j < cols; j++ ) {
			dot = sc.add( dot, sc.mul( Mtx.get( r, j ), sc.conj( v[ j ] ) ) );
		}
		coef = sc.mul( ctau, dot );
		for ( j = 0; j < cols; j++ ) {
			Mtx.set( r, j, sc.sub( Mtx.get( r, j ), sc.mul( coef, v[ j ] ) ) );
		}
	}
}

// Read the M-by-N upper-trapezoidal factor R (R sits at columns j >= N-M+i in
// row i; strictly-left entries are the reflectors and read as zero).
function readR( R, M, N ) {
	const Rm = new LogicalMatrix( sc, M, N );
	let i, j;
	for ( j = 0; j < N; j++ ) {
		for ( i = 0; i < M; i++ ) {
			Rm.set( i, j, ( j >= ( N - M + i ) ) ? R.read( i, j ) : sc.zero );
		}
	}
	return Rm;
}

// Arec = R * H(1)ᴴ ... H(k)ᴴ, formed by right-applying reflectors to R FORWARD
// (i = 0 -> k-1).
function reconstruct( R, taus, M, N, k ) {
	const Mtx = readR( R, M, N );
	let i;
	for ( i = 0; i < k; i++ ) {
		applyHRight( Mtx, reflectorRow( R, i, M, N ), taus[ i ] );
	}
	return Mtx;
}

// Q = H(1)ᴴ ... H(k)ᴴ (N-by-N unitary), formed by right-applying the reflectors
// to the N-by-N identity FORWARD.
function buildQ( R, taus, M, N, k ) {
	const Q = new LogicalMatrix( sc, N, N );
	let i;
	for ( i = 0; i < N; i++ ) {
		Q.set( i, i, sc.one );
	}
	for ( i = 0; i < k; i++ ) {
		applyHRight( Q, reflectorRow( R, i, M, N ), taus[ i ] );
	}
	return Q;
}

// Read the full factored A (M x N) back into a LogicalMatrix.
function readFull( R, M, N ) {
	const F = new LogicalMatrix( sc, M, N );
	let i, j;
	for ( j = 0; j < N; j++ ) {
		for ( i = 0; i < M; i++ ) {
			F.set( i, j, R.read( i, j ) );
		}
	}
	return F;
}

// Factor a fresh general A (seed from size) at a given dense layout and a WORK
// buffer of length `wlen`, returning the realized storage, tau values, and the
// original matrix.
function factor( M, N, layout, wlen, doPoison ) {
	const k = Math.min( M, N );
	const rng = new RNG( 0x100 + ( M * 100 ) + N );
	const A0 = logical.general( sc, rng, M, N );
	const R = schemes.dense.realize( sc, A0, { 'part': 'full' }, layout );
	const TAU = schemes.realizeVector( sc, poison( k ), { 'stride': 1, 'lead': 0, 'tail': 0 } );
	const work = ( doPoison ) ? poisonedWork( sc, wlen ) : schemes.realizeVector( sc, new Array( wlen ).fill( sc.zero ), { 'stride': 1, 'lead': 0, 'tail': 0 } ).data;
	zgerq2( M, N, R.data, R.args[ 0 ], R.args[ 1 ], R.args[ 2 ], TAU.data, TAU.args[ 0 ], TAU.args[ 1 ], work, 1, 0 );
	const taus = [];
	let i;
	for ( i = 0; i < k; i++ ) {
		taus.push( TAU.read( i ) );
	}
	return { 'R': R, 'taus': taus, 'A0': A0, 'k': k };
}


// TESTS //

// Steps 2-3 (L2): reconstruction A = R*Q AND orthonormality of Q across the
// (M,N) sweep and every dense storage layout.
test( 'zgerq2: RQ reconstruction A=R*Q and orthonormal Q ((M,N) sweep x all layouts)', function t() {
	PAIRS.forEach( function eachPair( pr ) {
		const M = pr[ 0 ];
		const N = pr[ 1 ];
		schemes.dense.layouts().forEach( function eachLayout( layout, li ) {
			const f = factor( M, N, layout, workLen( M ) );
			const lbl = ROUTINE + ' M=' + M + ' N=' + N + ' layout=' + li;
			checked( ROUTINE, 'reconstruct', function run() {
				check.assertReconstruct( sc, reconstruct( f.R, f.taus, M, N, f.k ), f.A0, { 'label': lbl + ' A=R*Q' } );
			});
			checked( ROUTINE, 'orthonormal', function run() {
				check.assertOrthonormal( sc, buildQ( f.R, f.taus, M, N, f.k ), { 'label': lbl + ' Q unitary' } );
			});
		});
	});
});

// Step 4 (L3): layout-invariance fuzz. zgerq2 -> dlarf -> dgemv/dger, whose
// optimized summation form is chosen by operand strides, so the col<->row FLIP
// legitimately reorders the arithmetic (~1 ULP); assert BIT-EXACTNESS only WITHIN
// a storage-order family (col / row), which still fuzzes offset, leading-dim
// padding, and stride SIGN. Cross-order correctness is certified by the
// reconstruction property above. TAU is fuzzed over positive-stride layouts; WORK
// over positive-stride layouts (the ndarray WORK-length guard measures
// length - offset, which a negative stride would spuriously fail).
const VLAYOUTS = schemes.vectorLayouts();
const TAULAYOUTS = VLAYOUTS.filter( function posStride( L ) {
	return ( L.stride === void 0 ? 1 : L.stride ) > 0;
});
const WLAYOUTS = TAULAYOUTS;
const colLayouts = schemes.dense.layouts().filter( function isCol( L ) {
	return L.order !== 'row';
});
const rowLayouts = schemes.dense.layouts().filter( function isRow( L ) {
	return L.order === 'row';
});

test( 'zgerq2: bit-exact within storage-order family (col / row)', function t() {
	[ [ 8, 12 ], [ 12, 12 ], [ 5, 9 ], [ 17, 20 ] ].forEach( function eachSize( sz ) {
		runInvariance( colLayouts, 'col', sz[ 0 ], sz[ 1 ] );
		runInvariance( rowLayouts, 'row', sz[ 0 ], sz[ 1 ] );
	});
});

function runInvariance( variants, fam, M, N ) {
	const k = Math.min( M, N );
	const SEED = 0xF00D + ( M * 17 ) + N;
	checked( ROUTINE, 'layout-invariance', function run() {
		layoutInvariant( variants, function build( layout, i ) {
			const rng = new RNG( SEED ); // identical values every variant
			const A0 = logical.general( sc, rng, M, N );
			const R = schemes.dense.realize( sc, A0, { 'part': 'full' }, layout );
			const TAU = schemes.realizeVector( sc, poison( k ), TAULAYOUTS[ i % TAULAYOUTS.length ] );
			const WORK = schemes.realizeVector( sc, new Array( workLen( M ) ).fill( sc.zero ), WLAYOUTS[ i % WLAYOUTS.length ] );
			zgerq2( M, N, R.data, R.args[ 0 ], R.args[ 1 ], R.args[ 2 ], TAU.data, TAU.args[ 0 ], TAU.args[ 1 ], WORK.data, WORK.args[ 0 ], WORK.args[ 1 ] );
			return check.flattenLogical( sc, readFull( R, M, N ) );
		}, { 'label': ROUTINE + ' layout invariance ' + fam + '-major ' + M + 'x' + N } );
	});
}

// Step 4c: workspace sufficiency. The advertised WORK minimum (max(1,M)) must
// actually suffice with a POISONED buffer — an off-by-one in the dlarf scratch
// would over-read poison -> NaN. Also assert reconstruction holds at that minimum.
test( 'zgerq2: advertised WORK minimum suffices (poisoned)', function t() {
	[ [ 8, 12 ], [ 16, 40 ] ].forEach( function eachCase( c ) {
		const M = c[ 0 ];
		const N = c[ 1 ];
		const label = ROUTINE + ' WORK-sufficiency ' + M + 'x' + N;
		const min = assertWorkspaceSufficient( function run( wlen ) {
			const f = factor( M, N, schemes.dense.layouts()[ 0 ], wlen, true );
			let flat = check.flattenLogical( sc, readFull( f.R, M, N ) );
			let i;
			for ( i = 0; i < f.taus.length; i++ ) {
				flat = flat.concat( sc.components( f.taus[ i ] ) );
			}
			return flat;
		}, {}, label );

		const f = factor( M, N, schemes.dense.layouts()[ 0 ], min, true );
		check.assertReconstruct( sc, reconstruct( f.R, f.taus, M, N, f.k ), f.A0, { 'label': label + ' A=R*Q @ WORK=' + min } );
	});
});
