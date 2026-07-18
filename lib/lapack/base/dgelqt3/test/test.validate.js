/* eslint-disable no-restricted-syntax, stdlib/first-unit-test, max-len, id-length, max-depth, max-params */

/**
* Property-based validation for dgelqt3, following the /blahpack-validate process.
*
* Step 0 classification: `d` -> real scalar; `ge` -> general dense
* (schemes.dense, logical.general); `lqt3` (RECURSIVE compact-WY LQ) ->
* reconstruction A = L * Q AND orthonormality of Q, PLUS validation of the full
* compact-WY block factor T.
*
* dgelqt3 recursively computes, for a real M-by-N matrix A with M <= N, the
* compact-WY LQ factorization. On exit the lower trapezoid of A holds the M-by-M
* lower-triangular L (min(M,N)=M since M<=N); strict-upper row i holds the
* essential Householder ROW reflector v_i (implicit 1 on the diagonal); and the
* SINGLE M-by-M (K=M) upper-triangular array T holds the FULL compact-WY block
* reflector factor for the whole panel (one block, nb = K). The block reflector
* for the whole panel is H = I - Vᴴ Tᵀ V, with V the K-by-N unit-upper-row matrix,
* and A = L * Q where Q = H(K-1) ... H(0) = H (the block form).
*
* Two-level oracle:
*   1. PER-REFLECTOR baseline (identical to the validated dgelqf/dgelq2 oracle):
*      tau_i = T(i,i) (the diagonal of the single K-by-K block T). Reconstruct
*      A = L * Q and build Q from the identity by RIGHT-applying H(i) (i=K-1
*      downto 0), each H(i) = I - conj(tau_i) v_iᴴ v_i (conj is a no-op under the
*      real trait). Assert A = L*Q (reconstruction) and QᴴQ = I (orthonormality).
*   2. BLOCK-T validation: build Q a SECOND way from the FULL K-by-K T as the LQ
*      compact-WY form H = I - Vᴴ Tᵀ V (V = K-by-N unit-upper rows). This uses the
*      whole strict-upper T that the recursion builds (T3 = -T1 Y1ᵀ Y2 T2 blocks),
*      not just the tau diagonal. Require it to match the per-reflector Q to
*      backward-error tolerance. (Empirically the Tᵀ placement is the one that
*      matches; I - Vᴴ T V does NOT — see the exploration recorded in this file's
*      history.)
*
* A = L * Q is an EXACT algebraic identity for ANY general M-by-N A with M <= N,
* so conditioning is irrelevant and plain random general A suffices. dgelqt3 has
* NO nb parameter and NO WORK argument (the recursion carries its own scratch in
* the unused corner of T), so there is no nb sweep and no Step-4c workspace test:
* L3 is reached via reconstruction + orthonormality (L2) plus the
* layout-invariance fuzz (L3).
*/

import test from 'node:test';

import { RNG, scalar as S, logical, schemes, check, layoutInvariant, SIZES_SMALL } from '../../../../../test/harness/index.js';
import { checked } from '../../../../../test/harness/ledger.js';
import dgelqt3 from './../lib/ndarray.js';

var sc = S.real; // d-routine
var LogicalMatrix = logical.LogicalMatrix;
var ROUTINE = 'dgelqt3';
var ALL_LAYOUTS = schemes.dense.layouts();

// (M,N) sweep with M <= N (dgelqt3 requires M <= N): squares from SIZES_SMALL
// plus wide rectangles (M < N) straddling the recursion split points.
var PAIRS = [];
SIZES_SMALL.forEach( function sq( n ) {
	PAIRS.push( [ n, n ] );
} );
[ [ 1, 5 ], [ 2, 7 ], [ 3, 8 ], [ 5, 8 ], [ 5, 16 ], [ 8, 16 ], [ 16, 33 ], [ 17, 33 ], [ 3, 64 ], [ 33, 64 ] ].forEach( function rect( p ) {
	PAIRS.push( p );
} );


// HELPERS //

// Allocate a POISONED dense (output-only) K x K T buffer with the given physical
// layout. Nothing is pre-written, so a T slot the routine fails to write reads
// back NaN and trips assertFinite.
function allocT( K, layout ) {
	var A = schemes.denseAlloc( sc, K, K, layout );
	return {
		'data': A.data,
		'args': [ A.s1, A.s2, A.offset ],
		'read': function read( i, j ) {
			return sc.read( A.data, A.addr( i, j ) );
		}
	};
}

// Read the essential Householder ROW v_i (length N): 0 before col i, implicit 1
// on the diagonal, stored strict-upper entries A(i,i+1:N-1) after it.
function reflectorRow( Ard, i, N ) {
	var v = [];
	var j;
	for ( j = 0; j < N; j++ ) {
		if ( j < i ) {
			v.push( sc.zero );
		} else if ( j === i ) {
			v.push( sc.one );
		} else {
			v.push( Ard.read( i, j ) );
		}
	}
	return v;
}

// Right-apply H(i)ᴴ: Mtx := Mtx - conj(tau) * (Mtx * conj(v)) * v, v a row vector
// of length Mtx.cols (conj is a no-op under the real trait).
function applyHRight( Mtx, v, tau ) {
	var ctau = sc.conj( tau );
	var coef;
	var dot;
	var r;
	var j;
	for ( r = 0; r < Mtx.rows; r++ ) {
		dot = sc.zero;
		for ( j = 0; j < Mtx.cols; j++ ) {
			dot = sc.add( dot, sc.mul( Mtx.get( r, j ), sc.conj( v[ j ] ) ) );
		}
		coef = sc.mul( ctau, dot );
		for ( j = 0; j < Mtx.cols; j++ ) {
			Mtx.set( r, j, sc.sub( Mtx.get( r, j ), sc.mul( coef, v[ j ] ) ) );
		}
	}
}

// M-by-N lower-trapezoidal factor L (on/below diagonal; zero above).
function readL( Ard, M, N ) {
	var L = new LogicalMatrix( sc, M, N );
	var i;
	var j;
	for ( j = 0; j < N; j++ ) {
		for ( i = 0; i < M; i++ ) {
			L.set( i, j, ( i >= j ) ? Ard.read( i, j ) : sc.zero );
		}
	}
	return L;
}

// Read the full factored A (M x N) back into a LogicalMatrix.
function readFull( Ard, M, N ) {
	var F = new LogicalMatrix( sc, M, N );
	var i;
	var j;
	for ( j = 0; j < N; j++ ) {
		for ( i = 0; i < M; i++ ) {
			F.set( i, j, Ard.read( i, j ) );
		}
	}
	return F;
}

// Per-reflector reconstruction: Arec = L * H(K-1) ... H(0) (i = K-1 downto 0).
function reconstruct( Ard, taus, M, N, K ) {
	var L = readL( Ard, M, N );
	var i;
	for ( i = K - 1; i >= 0; i-- ) {
		applyHRight( L, reflectorRow( Ard, i, N ), taus[ i ] );
	}
	return L;
}

// Per-reflector Q (N x N) = H(K-1) ... H(0) applied to I_N.
function buildQ( Ard, taus, N, K ) {
	var Q = new LogicalMatrix( sc, N, N );
	var i;
	for ( i = 0; i < N; i++ ) {
		Q.set( i, i, sc.one );
	}
	for ( i = K - 1; i >= 0; i-- ) {
		applyHRight( Q, reflectorRow( Ard, i, N ), taus[ i ] );
	}
	return Q;
}

// V (K x N): unit-upper-trapezoidal Householder ROWS from the factored A.
function readV( Ard, K, N ) {
	var V = new LogicalMatrix( sc, K, N );
	var i;
	var j;
	for ( i = 0; i < K; i++ ) {
		for ( j = 0; j < N; j++ ) {
			V.set( i, j, ( j < i ) ? sc.zero : ( j === i ? sc.one : Ard.read( i, j ) ) );
		}
	}
	return V;
}

// Block-T Q (N x N) = I - Vᴴ Tᵀ V, the LQ compact-WY block reflector built from
// the FULL K-by-K upper-triangular T (single block). For the real trait Vᴴ = Vᵀ.
function blockQ( Ard, Tread, K, N ) {
	var V = readV( Ard, K, N );
	var Q = new LogicalMatrix( sc, N, N );
	var VtTt;
	var s;
	var a;
	var b;
	var p;
	for ( a = 0; a < N; a++ ) {
		for ( b = 0; b < N; b++ ) {
			Q.set( a, b, ( a === b ) ? sc.one : sc.zero );
		}
	}
	// VtTt[n][k] = ( Vᵀ Tᵀ )[n][k] = sum_p V[p][n] * T[k][p]  (T upper triangular).
	VtTt = [];
	for ( a = 0; a < N; a++ ) {
		VtTt.push( [] );
		for ( b = 0; b < K; b++ ) {
			s = sc.zero;
			for ( p = 0; p < K; p++ ) {
				s = sc.add( s, sc.mul( V.get( p, a ), Tread( b, p ) ) );
			}
			VtTt[ a ].push( s );
		}
	}
	// Q -= ( Vᵀ Tᵀ ) V : (N x K)(K x N).
	for ( a = 0; a < N; a++ ) {
		for ( b = 0; b < N; b++ ) {
			s = sc.zero;
			for ( p = 0; p < K; p++ ) {
				s = sc.add( s, sc.mul( VtTt[ a ][ p ], V.get( p, b ) ) );
			}
			Q.set( a, b, sc.sub( Q.get( a, b ), s ) );
		}
	}
	return Q;
}

// Flatten the meaningful (upper-triangular) entries of the single K-by-K block T,
// in a fixed order, for a layout-invariant bit-exact comparison (skips poisoned
// unused lower slots).
function flattenT( Tread, K ) {
	var out = [];
	var comp;
	var a;
	var b;
	var k;
	for ( b = 0; b < K; b++ ) {
		for ( a = 0; a <= b; a++ ) {
			comp = sc.components( Tread( a, b ) );
			for ( k = 0; k < comp.length; k++ ) {
				out.push( comp[ k ] );
			}
		}
	}
	return out;
}

// TESTS //

// Steps 2-3 (L2): per-reflector reconstruction A = L*Q AND orthonormality of Q,
// PLUS block-T validation (block Q == per-reflector Q), across the (M,N) sweep
// (M <= N) and every dense storage layout. Backward-error tolerance;
// bit-exactness across the col<->row flip is deferred to the invariance test.
test( 'dgelqt3: A=L*Q, orthonormal Q, and block-T Q ((M,N) sweep, M<=N, x all layouts)', function t() {
	PAIRS.forEach( function eachPair( pr ) {
		var M = pr[ 0 ];
		var N = pr[ 1 ];
		ALL_LAYOUTS.forEach( function eachLayout( layout, li ) {
			var K = Math.min( M, N );
			var rng = new RNG( 0x100 + ( M * 100 ) + N );
			var A0 = logical.general( sc, rng, M, N );
			var Ar = schemes.dense.realize( sc, A0, { 'part': 'full' }, layout );
			var Tr = allocT( K, layout );

			dgelqt3( M, N, Ar.data, Ar.args[ 0 ], Ar.args[ 1 ], Ar.args[ 2 ], Tr.data, Tr.args[ 0 ], Tr.args[ 1 ], Tr.args[ 2 ] );

			var taus = [];
			var i;
			for ( i = 0; i < K; i++ ) {
				taus.push( Tr.read( i, i ) );
			}
			var lbl = ROUTINE + ' M=' + M + ' N=' + N + ' layout=' + li;

			// Level 1: per-reflector reconstruction and orthonormality.
			var Qref = buildQ( Ar, taus, N, K );
			checked( ROUTINE, 'reconstruct', function run() {
				check.assertReconstruct( sc, reconstruct( Ar, taus, M, N, K ), A0, { 'label': lbl + ' A=L*Q' } );
			} );
			checked( ROUTINE, 'orthonormal', function run() {
				check.assertOrthonormal( sc, Qref, { 'label': lbl + ' Q unitary' } );
			} );

			// Level 2: block-T Q from the FULL K-by-K T must equal per-reflector Q.
			checked( ROUTINE, 'block-T', function run() {
				check.assertReconstruct( sc, blockQ( Ar, Tr.read, K, N ), Qref, { 'label': lbl + ' block-T Q (I - Vᴴ Tᵀ V)' } );
			} );
		} );
	} );
} );


// Step 4 (L3): layout-invariance fuzz. dgelqt3 -> dlarfg + dgemm/dtrmm, whose
// optimized kernels pick their summation form from operand strides, so the
// col<->row storage flip legitimately reorders the arithmetic (~1 ULP) while the
// reconstruction property above proves the flipped result is still correct.
// Therefore assert BIT-EXACTNESS only WITHIN a storage-order family (col vs row);
// this still fuzzes offset, leading-dim padding, and stride SIGN. A and T layouts
// are fuzzed together. dgelqt3 has NO WORK argument, so there is no Step-4c
// workspace test.
var colLayouts = ALL_LAYOUTS.filter( function isCol( L ) {
	return L.order !== 'row';
} );
var rowLayouts = ALL_LAYOUTS.filter( function isRow( L ) {
	return L.order === 'row';
} );

test( 'dgelqt3: bit-exact within storage-order family (col / row)', function t() {
	[ [ 16, 16 ], [ 17, 33 ], [ 8, 20 ] ].forEach( function eachSize( sz ) {
		runInvariance( colLayouts, 'col', sz[ 0 ], sz[ 1 ] );
		runInvariance( rowLayouts, 'row', sz[ 0 ], sz[ 1 ] );
	} );
} );

function runInvariance( variants, fam, M, N ) {
	var K = Math.min( M, N );
	var SEED = 0xF00D + ( M * 17 ) + N;
	checked( ROUTINE, 'layout-invariance', function run() {
		layoutInvariant( variants, function build( layout, i ) {
			var rng = new RNG( SEED ); // identical values every variant
			var A0 = logical.general( sc, rng, M, N );
			var Ar = schemes.dense.realize( sc, A0, { 'part': 'full' }, layout );
			var Tr = allocT( K, variants[ ( i + 1 ) % variants.length ] );
			dgelqt3( M, N, Ar.data, Ar.args[ 0 ], Ar.args[ 1 ], Ar.args[ 2 ], Tr.data, Tr.args[ 0 ], Tr.args[ 1 ], Tr.args[ 2 ] );
			return check.flattenLogical( sc, readFull( Ar, M, N ) ).concat( flattenT( Tr.read, K ) );
		}, { 'label': ROUTINE + ' layout invariance ' + fam + '-major ' + M + 'x' + N } );
	} );
}
