/* eslint-disable no-restricted-syntax, stdlib/first-unit-test, max-len, id-length, max-depth, max-params */

/**
* Property-based validation for dgelq2, following the /blahpack-validate process.
*
* Step 0 classification: `d` -> real scalar; `ge` -> general dense
* (schemes.dense, logical.general); `lq2` (unblocked LQ factorization) ->
* reconstruction A = L * Q AND orthonormality of Q.
*
* A = L * Q is an EXACT algebraic identity for ANY general M-by-N A (it is the
* definition of the Householder LQ process), so conditioning is irrelevant and
* plain random general A suffices.
*
* Reflector convention (real): on exit A holds, on/below the diagonal, the
* M-by-N lower-trapezoidal L; above the diagonal, row i (i = 0..k-1,
* k = min(M,N)) stores the essential part of the elementary reflector v_i (a ROW
* vector) with an implicit 1 on the diagonal and implicit zeros before column i.
* H(i) = I - tau_i * v_iᵀ * v_i (v_i a row), applied to the trailing block from
* the RIGHT, and Q = H(k-1) * ... * H(1) * H(0), so A = L * Q. Reconstruction and
* Q are both formed by the SAME right-application loop (i = k-1 downto 0), started
* from L and from the identity respectively; the loop uses conj(v) in the inner
* product so it is bit-identical to the complex sibling under the real trait.
*/

import test from 'node:test';
import { RNG, scalar as S, logical, schemes, ref, check, layoutInvariant, SIZES_SMALL } from '../../../../../test/harness/index.js';
import { checked } from '../../../../../test/harness/ledger.js';
import dgelq2 from './../lib/ndarray.js';

var sc = S.real; // d-routine
var LogicalMatrix = logical.LogicalMatrix;
var ROUTINE = 'dgelq2';


// HELPERS //

// (M,N) sweep: squares straddling unroll thresholds + rectangular (M<N, M>N) +
// zero-dimension corners.
var PAIRS = [];
SIZES_SMALL.forEach( function sq( n ) {
	PAIRS.push( [ n, n ] );
});
[ [ 5, 8 ], [ 8, 5 ], [ 3, 7 ], [ 7, 3 ], [ 16, 33 ], [ 33, 16 ], [ 1, 5 ], [ 5, 1 ], [ 0, 0 ], [ 0, 4 ], [ 4, 0 ] ].forEach( function rect( p ) {
	PAIRS.push( p );
});

// Read the essential Householder row v_i (length N): 0 before col i, implicit 1
// on the diagonal, and the stored strict-upper entries A(i,i+1:N-1) after it.
function reflectorRow( R, i, N ) {
	var v = [];
	var j;
	for ( j = 0; j < N; j++ ) {
		if ( j < i ) {
			v.push( sc.zero );
		} else if ( j === i ) {
			v.push( sc.one );
		} else {
			v.push( R.read( i, j ) );
		}
	}
	return v;
}

// Right-apply H(i)ᴴ: Mtx := Mtx - conj(tau) * (Mtx * conj(v)) * v, where v is a
// row vector of length Mtx.cols. Faithful to C*H(i)ᴴ = C - conj(tau) (C v) vᴴ,
// since A = L * H(k-1)ᴴ ... H(0)ᴴ (for real, conj(tau)=tau and conj(v)=v).
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

// Read the M-by-N lower-trapezoidal factor L (on/below diagonal; zero above).
function readL( R, M, N ) {
	var L = new LogicalMatrix( sc, M, N );
	var i;
	var j;
	for ( j = 0; j < N; j++ ) {
		for ( i = 0; i < M; i++ ) {
			L.set( i, j, ( i >= j ) ? R.read( i, j ) : sc.zero );
		}
	}
	return L;
}

// Arec = L * Q, formed by right-applying H(k-1)...H(0) to L (i = k-1 downto 0).
function reconstruct( R, taus, M, N, k ) {
	var L = readL( R, M, N );
	var i;
	for ( i = k - 1; i >= 0; i-- ) {
		applyHRight( L, reflectorRow( R, i, N ), taus[ i ] );
	}
	return L;
}

// Q = H(k-1)...H(0), formed by right-applying the reflectors to the N-by-N
// identity. Each H(i) is N-by-N unitary, so Q is a full square unitary matrix
// (both rows and columns orthonormal).
function buildQ( R, taus, N, k ) {
	var Q = new LogicalMatrix( sc, N, N );
	var i;
	for ( i = 0; i < N; i++ ) {
		Q.set( i, i, sc.one );
	}
	for ( i = k - 1; i >= 0; i-- ) {
		applyHRight( Q, reflectorRow( R, i, N ), taus[ i ] );
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


// TESTS //

// Steps 2-3: reconstruction A = L*Q AND orthonormality of Q across the (M,N)
// sweep and every dense storage layout. dgelq2 has no pivot search, so all seven
// layouts (incl. negative row stride) are in contract; bit-exactness across the
// col<->row flip is deferred to the layout-invariance test below.
test( 'dgelq2: LQ reconstruction A=L*Q and orthonormal Q ((M,N) sweep x all layouts)', function t() {
	PAIRS.forEach( function eachPair( pr ) {
		var M = pr[ 0 ];
		var N = pr[ 1 ];
		var k = Math.min( M, N );
		schemes.dense.layouts().forEach( function eachLayout( layout, li ) {
			var rng = new RNG( 0x100 + ( M * 100 ) + N ); // reproducible; log on failure
			var A0 = logical.general( sc, rng, M, N );
			var R = schemes.dense.realize( sc, A0, { 'part': 'full' }, layout );
			var TAU = schemes.realizeVector( sc, new Array( k ).fill( sc.zero ), { 'stride': 1, 'lead': 0, 'tail': 0 } );
			var WORK = schemes.realizeVector( sc, new Array( Math.max( 1, M ) ).fill( sc.zero ), { 'stride': 1, 'lead': 0, 'tail': 0 } );

			dgelq2( M, N, R.data, R.args[ 0 ], R.args[ 1 ], R.args[ 2 ], TAU.data, TAU.args[ 0 ], TAU.args[ 1 ], WORK.data, WORK.args[ 0 ], WORK.args[ 1 ] );

			var taus = [];
			var i;
			for ( i = 0; i < k; i++ ) {
				taus.push( TAU.read( i ) );
			}
			var lbl = ROUTINE + ' M=' + M + ' N=' + N + ' layout=' + li;

			checked( ROUTINE, 'reconstruct', function run() {
				check.assertReconstruct( sc, reconstruct( R, taus, M, N, k ), A0, { 'label': lbl + ' A=L*Q' } );
			});
			checked( ROUTINE, 'orthonormal', function run() {
				check.assertOrthonormal( sc, buildQ( R, taus, N, k ), { 'label': lbl + ' Q unitary' } );
			});
		});
	});
});

// Step 4: layout-invariance fuzz. Within a single storage-order family the
// factored A must be bit-exact across offset, leading-dim padding, and stride
// SIGN; the col<->row FLIP legitimately reorders the optimized dlarf inner
// dgemv/dger loops (~1 ULP), so cross-order agreement is certified by the
// reconstruction property above, not bit-equality (see dpotf2/dgels LEARNINGS).
// TAU and WORK vector layouts are fuzzed in parallel; they must not perturb A.
var VLAYOUTS = schemes.vectorLayouts();
// WORK's length guard in ndarray.js is stride-naive (`WORK.length - offsetWork`),
// so a negative-stride WORK (offset at the high end) is rejected as too short even
// when the strided span fits. Fuzz WORK only over positive-stride layouts (still
// exercises non-unit stride, lead, and tail); TAU has no such guard.
var WLAYOUTS = VLAYOUTS.filter( function posStride( L ) {
	return ( L.stride === void 0 ? 1 : L.stride ) > 0;
});
var colLayouts = schemes.dense.layouts().filter( function isCol( L ) {
	return L.order !== 'row';
});
var rowLayouts = schemes.dense.layouts().filter( function isRow( L ) {
	return L.order === 'row';
});

test( 'dgelq2: bit-exact within storage-order family (col / row)', function t() {
	[ [ 5, 8 ], [ 8, 5 ], [ 6, 6 ], [ 4, 9 ] ].forEach( function eachSize( sz ) {
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
			var TAU = schemes.realizeVector( sc, new Array( k ).fill( sc.zero ), VLAYOUTS[ i % VLAYOUTS.length ] );
			var WORK = schemes.realizeVector( sc, new Array( Math.max( 1, M ) ).fill( sc.zero ), WLAYOUTS[ ( i + 1 ) % WLAYOUTS.length ] );
			dgelq2( M, N, R.data, R.args[ 0 ], R.args[ 1 ], R.args[ 2 ], TAU.data, TAU.args[ 0 ], TAU.args[ 1 ], WORK.data, WORK.args[ 0 ], WORK.args[ 1 ] );
			return check.flattenLogical( sc, readFull( R, M, N ) );
		}, { 'label': ROUTINE + ' layout invariance ' + fam + '-major ' + M + 'x' + N } );
	});
}
