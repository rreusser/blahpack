/* eslint-disable no-restricted-syntax, stdlib/first-unit-test, max-len, id-length, max-depth, max-params */

/**
* Property-based validation for dgerqf, following the /blahpack-validate process.
*
* Step 0 classification: `d` -> real scalar; `ge` -> general dense
* (schemes.dense, logical.general); `rqf` (BLOCKED RQ factorization) ->
* reconstruction A = R * Q AND orthonormality of the (square) Q.
*
* The BLOCKED driver produces EXACTLY the same factored representation as the
* unblocked sibling dgerq2 (it merely batches the reflector application through
* dlarft/dlarfb, an optimized dgemm), so the oracle is IDENTICAL to dgerq2's
* validated one. RQ REFLECTOR CONVENTION (from data/lapack-3.12.0/SRC/dgerq2.f,
* restricted to the validated M <= N case so k = min(M,N) = M):
*
*   - On exit the upper triangle of the top-right M-by-M block A(0:M-1, N-M:N-1)
*     holds R: row i carries R in columns j >= N-M+i (the "RQ diagonal" at column
*     p_i = N-M+i); everything strictly left of it is the reflector.
*   - Reflector i (i = 0..k-1) lives in ROW i, columns 0..p_i-1 (essential part),
*     with an implicit 1 at column p_i and zeros beyond; conj(v) is stored there
*     (real trait: conj is a no-op), and applyHRight reads it directly as `v`.
*   - H(i) = I - tau_i * vv * vvᴴ with vv = conj(v), and Q = H(1) H(2) ... H(k)
*     ==> A = R * H(1)ᴴ H(2)ᴴ ... H(k)ᴴ. BOTH reconstruction (from R) and Q (from
*     I_N) come from the SAME right-application loop taken FORWARD, i = 0 -> k-1
*     (OPPOSITE to LQ dgelqf). Q is a full N-by-N unitary, so assertOrthonormal
*     (checks QᴴQ = I) applies directly.
*
* A = R * Q is an EXACT algebraic identity for ANY general A, so plain random
* general A suffices; the block size is hardcoded NB = 32, so the blocked path is
* taken whenever min(M,N) = M > 32. The (M,N) sweep straddles that threshold.
*/

import test from 'node:test';
import { RNG, scalar as S, logical, schemes, check, layoutInvariant } from '../../../../../test/harness/index.js';
import { checked } from '../../../../../test/harness/ledger.js';
import { assertWorkspaceSufficient, poisonedWork } from '../../../../../test/harness/workspace.js';
import dgerqf from './../lib/ndarray.js';

var sc = S.real; // d-routine
var LogicalMatrix = logical.LogicalMatrix;
var ROUTINE = 'dgerqf';
var NB = 32; // hardcoded block size in lib/base.js


// HELPERS //

// WORK need for the blocked path: base.js stores the NB-by-NB block-reflector T
// factor INSIDE WORK, after the ldwork*nb (= M*NB) main scratch, so the total is
// M*NB + NB*NB; the unblocked fallback (M <= NB) needs only max(1,M).
function workLen( M ) {
	return ( M > NB ) ? ( ( M * NB ) + ( NB * NB ) ) : Math.max( 1, M );
}

// Poisoned (NaN) array of scalar values, so an unwritten output slot reads NaN.
function poison( k ) {
	var a = [];
	var i;
	for ( i = 0; i < k; i++ ) {
		a.push( ( sc.name === 'complex' ) ? { 're': NaN, 'im': NaN } : NaN );
	}
	return a;
}

// (M,N) sweep, M <= N only: squares (incl. LARGE ones > NB=32 that exercise the
// blocked dlarft/dlarfb path) + wide rectangles crossing the threshold + zero
// corners.
var PAIRS = [];
[ 0, 1, 2, 3, 5, 8, 16, 17, 31, 32, 33, 48, 63, 64, 65, 100 ].forEach( function sq( n ) {
	PAIRS.push( [ n, n ] );
});
[ [ 3, 7 ], [ 5, 8 ], [ 16, 33 ], [ 33, 64 ], [ 40, 65 ], [ 48, 100 ], [ 33, 100 ], [ 64, 100 ], [ 2, 6 ], [ 1, 5 ], [ 0, 4 ] ].forEach( function rect( p ) {
	PAIRS.push( p );
});

// Read the essential Householder row v_i (length N): stored essential in columns
// 0..p-1 (p = N-M+i), implicit 1 at column p, zeros after.
function reflectorRow( R, i, M, N ) {
	var p = N - M + i;
	var v = [];
	var j;
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

// Right-apply H(i)ᴴ: Mtx := Mtx - conj(tau) * (Mtx * conj(v)) * v (true reflector
// vv = conj(v)); this is C * H(i)ᴴ = C - conj(tau) (C vv) vvᴴ.
function applyHRight( Mtx, v, tau ) {
	var rows = Mtx.rows;
	var cols = Mtx.cols;
	var ctau = sc.conj( tau );
	var coef;
	var dot;
	var r;
	var j;
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

// Read the M-by-N upper-trapezoidal factor R (R at columns j >= N-M+i in row i).
function readR( R, M, N ) {
	var Rm = new LogicalMatrix( sc, M, N );
	var i;
	var j;
	for ( j = 0; j < N; j++ ) {
		for ( i = 0; i < M; i++ ) {
			Rm.set( i, j, ( j >= ( N - M + i ) ) ? R.read( i, j ) : sc.zero );
		}
	}
	return Rm;
}

// Arec = R * H(1)ᴴ ... H(k)ᴴ, formed by right-applying reflectors to R FORWARD.
function reconstruct( R, taus, M, N, k ) {
	var Mtx = readR( R, M, N );
	var i;
	for ( i = 0; i < k; i++ ) {
		applyHRight( Mtx, reflectorRow( R, i, M, N ), taus[ i ] );
	}
	return Mtx;
}

// Q = H(1)ᴴ ... H(k)ᴴ (N-by-N unitary), formed by right-applying to I_N FORWARD.
function buildQ( R, taus, M, N, k ) {
	var Q = new LogicalMatrix( sc, N, N );
	var i;
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
	var F = new LogicalMatrix( sc, M, N );
	var i;
	var j;
	for ( j = 0; j < N; j++ ) {
		for ( i = 0; i < M; i++ ) {
			F.set( i, j, R.read( i, j ) );
		}
	}
	return F;
}

// Factor a fresh general A (seed from size) at a dense layout with a WORK buffer
// of length `wlen`.
function factor( M, N, layout, wlen, doPoison ) {
	var k = Math.min( M, N );
	var rng = new RNG( 0x100 + ( M * 100 ) + N );
	var A0 = logical.general( sc, rng, M, N );
	var R = schemes.dense.realize( sc, A0, { 'part': 'full' }, layout );
	var TAU = schemes.realizeVector( sc, poison( k ), { 'stride': 1, 'lead': 0, 'tail': 0 } );
	var work = ( doPoison ) ? poisonedWork( sc, wlen ) : schemes.realizeVector( sc, new Array( wlen ).fill( sc.zero ), { 'stride': 1, 'lead': 0, 'tail': 0 } ).data;
	dgerqf( M, N, R.data, R.args[ 0 ], R.args[ 1 ], R.args[ 2 ], TAU.data, TAU.args[ 0 ], TAU.args[ 1 ], work, 1, 0 );
	var taus = [];
	var i;
	for ( i = 0; i < k; i++ ) {
		taus.push( TAU.read( i ) );
	}
	return { 'R': R, 'taus': taus, 'A0': A0, 'k': k };
}


// TESTS //

// Steps 2-3 (L2): reconstruction A = R*Q AND orthonormality of Q across the
// (M,N) sweep (blocked and unblocked) and every dense storage layout.
test( 'dgerqf: RQ reconstruction A=R*Q and orthonormal Q ((M,N) sweep x all layouts)', function t() {
	PAIRS.forEach( function eachPair( pr ) {
		var M = pr[ 0 ];
		var N = pr[ 1 ];
		schemes.dense.layouts().forEach( function eachLayout( layout, li ) {
			var f = factor( M, N, layout, workLen( M ) );
			var lbl = ROUTINE + ' M=' + M + ' N=' + N + ' layout=' + li;
			checked( ROUTINE, 'reconstruct', function run() {
				check.assertReconstruct( sc, reconstruct( f.R, f.taus, M, N, f.k ), f.A0, { 'label': lbl + ' A=R*Q' } );
			});
			checked( ROUTINE, 'orthonormal', function run() {
				check.assertOrthonormal( sc, buildQ( f.R, f.taus, M, N, f.k ), { 'label': lbl + ' Q unitary' } );
			});
		});
	});
});

// Step 4 (L3): layout-invariance fuzz on genuinely BLOCKED sizes (M > 32, each
// triggering dlarft/dlarfb). Within a storage-order family the factored A must be
// bit-exact across offset, leading-dim padding, and stride SIGN; the col<->row
// FLIP legitimately reorders the dlarfb->dgemm accumulation (~1 ULP), so
// cross-order agreement is certified by the reconstruction property above. TAU is
// fuzzed over positive-stride layouts; WORK over UNIT-stride layouts only, because
// base.js passes stride 1 (not strideWork) to dlarfb, so a non-unit WORK stride is
// out of contract on the blocked path.
var VLAYOUTS = schemes.vectorLayouts();
var TAULAYOUTS = VLAYOUTS.filter( function posStride( L ) {
	return ( L.stride === void 0 ? 1 : L.stride ) > 0;
});
var WLAYOUTS = VLAYOUTS.filter( function unitStride( L ) {
	return ( L.stride === void 0 ? 1 : L.stride ) === 1;
});
var colLayouts = schemes.dense.layouts().filter( function isCol( L ) {
	return L.order !== 'row';
});
var rowLayouts = schemes.dense.layouts().filter( function isRow( L ) {
	return L.order === 'row';
});

test( 'dgerqf: bit-exact within storage-order family (col / row), blocked path', function t() {
	[ [ 40, 50 ], [ 48, 64 ], [ 33, 48 ], [ 64, 80 ] ].forEach( function eachSize( sz ) {
		runInvariance( colLayouts, 'col', sz[ 0 ], sz[ 1 ] );
		runInvariance( rowLayouts, 'row', sz[ 0 ], sz[ 1 ] );
	});
});

function runInvariance( variants, fam, M, N ) {
	var k = Math.min( M, N );
	var SEED = 0xF00D + ( M * 17 ) + N;
	checked( ROUTINE, 'layout-invariance', function run() {
		layoutInvariant( variants, function build( layout, i ) {
			var rng = new RNG( SEED ); // identical values every variant
			var A0 = logical.general( sc, rng, M, N );
			var R = schemes.dense.realize( sc, A0, { 'part': 'full' }, layout );
			var TAU = schemes.realizeVector( sc, poison( k ), TAULAYOUTS[ i % TAULAYOUTS.length ] );
			var WORK = schemes.realizeVector( sc, new Array( workLen( M ) ).fill( sc.zero ), WLAYOUTS[ i % WLAYOUTS.length ] );
			dgerqf( M, N, R.data, R.args[ 0 ], R.args[ 1 ], R.args[ 2 ], TAU.data, TAU.args[ 0 ], TAU.args[ 1 ], WORK.data, WORK.args[ 0 ], WORK.args[ 1 ] );
			return check.flattenLogical( sc, readFull( R, M, N ) );
		}, { 'label': ROUTINE + ' layout invariance ' + fam + '-major ' + M + 'x' + N } );
	});
}

// Step 4c: workspace conformance. The blocked path consumes a WORK scratch whose
// advertised minimum the wrapper enforces (throwing below it); that minimum must
// actually SUFFICE. Probe it from the throw boundary, then run at EXACTLY that
// length with a POISONED buffer and require finite output — a too-small claim
// over-reads poisoned padding -> NaN. Also assert reconstruction at the minimum.
// Uses a square blocked case and a wide (M<N) blocked case.
test( 'dgerqf: advertised WORK minimum suffices on the blocked path (poisoned)', function t() {
	[ [ 80, 80 ], [ 40, 100 ] ].forEach( function eachCase( c ) {
		var M = c[ 0 ];
		var N = c[ 1 ];
		var label = ROUTINE + ' WORK-sufficiency ' + M + 'x' + N;
		var min = assertWorkspaceSufficient( function run( wlen ) {
			var f = factor( M, N, schemes.dense.layouts()[ 0 ], wlen, true );
			var flat = check.flattenLogical( sc, readFull( f.R, M, N ) );
			var i;
			for ( i = 0; i < f.taus.length; i++ ) {
				flat = flat.concat( sc.components( f.taus[ i ] ) );
			}
			return flat;
		}, {}, label );

		var f = factor( M, N, schemes.dense.layouts()[ 0 ], min, true );
		check.assertReconstruct( sc, reconstruct( f.R, f.taus, M, N, f.k ), f.A0, { 'label': label + ' A=R*Q @ WORK=' + min } );
	});
});
