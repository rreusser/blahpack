/* eslint-disable no-restricted-syntax, stdlib/first-unit-test, max-len, id-length, max-depth, max-params */

/**
* Property-based validation for zgelqt3, following the /blahpack-validate process.
*
* Step 0 classification: `z` -> complex scalar; `ge` -> general dense
* (schemes.dense, logical.general); `lqt3` (RECURSIVE compact-WY LQ) ->
* reconstruction A = L * Q AND unitarity of Q, validated at TWO levels.
*
* zgelqt3 recursively computes, for a general complex M-by-N matrix A (M <= N),
* the compact-WY LQ factorization. On exit the lower trapezoid of A holds the
* M-by-N lower-trapezoidal L; above the diagonal, row i (i = 0..K-1, K = M) holds
* the essential part of the ROW Householder reflector v_i with an implicit 1 on
* the diagonal, H(i) = I - tau_i * v_iᴴ * v_i applied from the RIGHT, and
* Q = H(K-1) * ... * H(0), so A = L * Q. Unlike the blocked drivers, zgelqt3
* produces a SINGLE K-by-K upper-triangular compact-WY factor T (one block,
* K = M) alongside V.
*
* Two orthogonal oracles are asserted:
*   1. PER-REFLECTOR baseline (identical to zgelq2/zgelqf): tau_i = T(i,i);
*      reconstruct A = L*Q and build Q by right-applying H(K-1)..H(0) (conj(tau)
*      matters for complex). Asserts A = L*Q and QᴴQ = I.
*   2. BLOCK-T oracle: build Q a SECOND way from the FULL K-by-K T as the complex
*      LQ compact-WY block reflector Q = I - Vᴴ * Tᴴ * V (V = K-by-N unit-upper
*      row reflectors). This exercises the ENTIRE upper-triangular T storage
*      (diagonal AND strict-upper), not just the tau diagonal, and is required to
*      (a) reconstruct A = L*Q and (b) match the per-reflector Q to backward
*      error. The empirically-verified transpose placement is Tᴴ (conjugate
*      transpose); T and Tᵀ both fail.
*
* A = L * Q is an EXACT algebraic identity for ANY general M-by-N A (M <= N), so
* conditioning is irrelevant and plain random general A suffices.
*/

import test from 'node:test';

import { RNG, scalar as S, logical, schemes, check, layoutInvariant, SIZES_SMALL } from '../../../../../test/harness/index.js';
import { checked } from '../../../../../test/harness/ledger.js';
import zgelqt3 from './../lib/ndarray.js';

const sc = S.complex; // z-routine
const LogicalMatrix = logical.LogicalMatrix;
const ROUTINE = 'zgelqt3';
const ALL_LAYOUTS = schemes.dense.layouts();

// (M,N) sweep with M <= N (recursive kernel requires M <= N): squares from
// SIZES_SMALL plus wide rectangles (M < N) straddling the recursion split.
const PAIRS = [];
SIZES_SMALL.forEach( function sq( n ) {
	PAIRS.push( [ n, n ] );
} );
[ [ 1, 5 ], [ 2, 7 ], [ 3, 5 ], [ 3, 8 ], [ 5, 8 ], [ 5, 16 ], [ 8, 16 ], [ 8, 17 ], [ 16, 33 ], [ 17, 33 ], [ 33, 64 ], [ 5, 64 ] ].forEach( function rect( p ) {
	PAIRS.push( p );
} );


// HELPERS //

// Allocate a POISONED dense (output-only) T buffer of `rows` x `cols` with the
// given physical layout. A T slot the routine fails to write reads back NaN and
// trips assertFinite.
function allocT( rows, cols, layout ) {
	const A = schemes.denseAlloc( sc, rows, cols, layout );
	return {
		'data': A.data,
		'args': [ A.s1, A.s2, A.offset ],
		'read': function read( i, j ) {
			return sc.read( A.data, A.addr( i, j ) );
		}
	};
}

// Essential Householder ROW v_i (length N): 0 before col i, implicit 1 on the
// diagonal, stored strict-upper entries A(i,i+1:N-1) after it.
function reflectorRow( Ard, i, N ) {
	const v = [];
	let j;
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

// Right-apply H(i)ᴴ: Mtx := Mtx - conj(tau) * (Mtx * conj(v)) * v, faithful to
// A = L * H(K-1)ᴴ ... H(0)ᴴ (conj(v)/conj(tau) required for complex).
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

// M-by-N lower-trapezoidal factor L (on/below diagonal; zero above).
function readL( Ard, M, N ) {
	const L = new LogicalMatrix( sc, M, N );
	let i, j;
	for ( j = 0; j < N; j++ ) {
		for ( i = 0; i < M; i++ ) {
			L.set( i, j, ( i >= j ) ? Ard.read( i, j ) : sc.zero );
		}
	}
	return L;
}

// V (K-by-N): unit-upper-trapezoidal Householder ROWS from the factored A.
function readV( Ard, K, N ) {
	const V = new LogicalMatrix( sc, K, N );
	let i, j;
	for ( i = 0; i < K; i++ ) {
		for ( j = 0; j < N; j++ ) {
			V.set( i, j, ( j < i ) ? sc.zero : ( j === i ? sc.one : Ard.read( i, j ) ) );
		}
	}
	return V;
}

// Read the full factored A (M x N) back into a LogicalMatrix.
function readFull( Ard, M, N ) {
	const F = new LogicalMatrix( sc, M, N );
	let i, j;
	for ( j = 0; j < N; j++ ) {
		for ( i = 0; i < M; i++ ) {
			F.set( i, j, Ard.read( i, j ) );
		}
	}
	return F;
}

// Flatten the meaningful (upper-triangular) K-by-K T entries in a fixed order,
// for a layout-invariant bit-exact comparison (skips unused lower slots).
function flattenT( Tread, K ) {
	const out = [];
	let comp, a, b, k;
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

// PER-REFLECTOR reconstruct A = L*Q by right-applying H(K-1)..H(0) to L.
function reconstruct( Ard, taus, M, N, K ) {
	const L = readL( Ard, M, N );
	let i;
	for ( i = K - 1; i >= 0; i-- ) {
		applyHRight( L, reflectorRow( Ard, i, N ), taus[ i ] );
	}
	return L;
}

// PER-REFLECTOR Q = H(K-1)..H(0) applied to the N-by-N identity (N-by-N unitary).
function buildQ( Ard, taus, N, K ) {
	const Q = new LogicalMatrix( sc, N, N );
	let i;
	for ( i = 0; i < N; i++ ) {
		Q.set( i, i, sc.one );
	}
	for ( i = K - 1; i >= 0; i-- ) {
		applyHRight( Q, reflectorRow( Ard, i, N ), taus[ i ] );
	}
	return Q;
}

// BLOCK-T Q (N-by-N) from the FULL K-by-K compact-WY T: Q = I - Vᴴ * Tᴴ * V,
// V the K-by-N unit-upper row reflectors, T upper-triangular. (Tᴴ verified
// empirically; T and Tᵀ fail.) (Vᴴ T V)(p,q) = sum_{a,b} conj(V(a,p)) Tᴴ(a,b) V(b,q),
// with Tᴴ(a,b) = conj(T(b,a)) nonzero only for b <= a.
function buildQblock( V, Tread, K, N ) {
	const Q = new LogicalMatrix( sc, N, N );
	let cVap, thab, s, p, q, a, b;
	for ( p = 0; p < N; p++ ) {
		for ( q = 0; q < N; q++ ) {
			Q.set( p, q, ( p === q ) ? sc.one : sc.zero );
		}
	}
	for ( p = 0; p < N; p++ ) {
		for ( q = 0; q < N; q++ ) {
			s = sc.zero;
			for ( a = 0; a < K; a++ ) {
				cVap = sc.conj( V.get( a, p ) );
				if ( cVap.re === 0 && cVap.im === 0 ) {
					continue;
				}
				for ( b = 0; b <= a; b++ ) { // Tᴴ(a,b) = conj(T(b,a)), nonzero for b <= a
					thab = sc.conj( Tread( b, a ) );
					s = sc.add( s, sc.mul( sc.mul( cVap, thab ), V.get( b, q ) ) );
				}
			}
			Q.set( p, q, sc.sub( Q.get( p, q ), s ) );
		}
	}
	return Q;
}

// Matrix product L (M-by-N) * Q (N-by-N) -> M-by-N.
function matmulLQ( L, Q, M, N ) {
	const out = new LogicalMatrix( sc, M, N );
	let s, i, j, p;
	for ( i = 0; i < M; i++ ) {
		for ( j = 0; j < N; j++ ) {
			s = sc.zero;
			for ( p = 0; p < N; p++ ) {
				s = sc.add( s, sc.mul( L.get( i, p ), Q.get( p, j ) ) );
			}
			out.set( i, j, s );
		}
	}
	return out;
}

// Factor a fresh general A (M <= N) at a given dense layout; returns realized A
// and T storage, the diagonal tau values, the original matrix, and K.
function factor( M, N, layout ) {
	const K = M; // K = min(M,N) = M since M <= N
	const rng = new RNG( 0x100 + ( M * 1000 ) + N );
	const A0 = logical.general( sc, rng, M, N );
	const Ar = schemes.dense.realize( sc, A0, { 'part': 'full' }, layout );
	const Tr = allocT( K, K, layout );
	zgelqt3( M, N, Ar.data, Ar.args[ 0 ], Ar.args[ 1 ], Ar.args[ 2 ], Tr.data, Tr.args[ 0 ], Tr.args[ 1 ], Tr.args[ 2 ] );
	const taus = [];
	let i;
	for ( i = 0; i < K; i++ ) {
		taus.push( Tr.read( i, i ) );
	}
	return { 'Ar': Ar, 'Tr': Tr, 'taus': taus, 'A0': A0, 'K': K };
}


// TESTS //

// Level-1 oracle (per-reflector) + Level-2 oracle (block-T), across the (M,N)
// sweep (M <= N) and every dense storage layout (backward-error tolerance;
// bit-exactness is deferred to the layout-invariance test below).
test( 'zgelqt3: A=L*Q, unitary Q, and block-T reconstruction ((M,N) x all layouts)', function t() {
	PAIRS.forEach( function eachPair( pr ) {
		const M = pr[ 0 ];
		const N = pr[ 1 ];
		ALL_LAYOUTS.forEach( function eachLayout( layout, li ) {
			const f = factor( M, N, layout );
			const K = f.K;
			const lbl = ROUTINE + ' M=' + M + ' N=' + N + ' layout=' + li;

			// Level 1: per-reflector reconstruction + unitarity.
			checked( ROUTINE, 'reconstruct', function run() {
				check.assertReconstruct( sc, reconstruct( f.Ar, f.taus, M, N, K ), f.A0, { 'label': lbl + ' A=L*Q' } );
			} );
			checked( ROUTINE, 'orthonormal', function run() {
				check.assertOrthonormal( sc, buildQ( f.Ar, f.taus, N, K ), { 'label': lbl + ' Q unitary' } );
			} );

			// Level 2: full block-T reflector Q = I - Vᴴ Tᴴ V must both
			// reconstruct A = L*Qblock AND match the per-reflector Q.
			const V = readV( f.Ar, K, N );
			const Qblock = buildQblock( V, f.Tr.read, K, N );
			checked( ROUTINE, 'blockT-reconstruct', function run() {
				check.assertReconstruct( sc, matmulLQ( readL( f.Ar, M, N ), Qblock, M, N ), f.A0, { 'label': lbl + ' A=L*Qblock', 'factor': 100 } );
			} );
			checked( ROUTINE, 'blockT-matches-Q', function run() {
				check.assertReconstruct( sc, Qblock, buildQ( f.Ar, f.taus, N, K ), { 'label': lbl + ' Qblock=Qperref', 'factor': 100 } );
			} );
		} );
	} );
} );


// Step 4 (L3): layout-invariance fuzz. zgelqt3 -> zlarfg + ztrmm/zgemm, whose
// optimized kernels pick their summation form from operand strides, so the
// col<->row storage flip legitimately reorders the arithmetic (~1 ULP) while the
// reconstruction property above proves the flipped result is still correct.
// Therefore assert BIT-EXACTNESS only WITHIN a storage-order family (col vs row);
// this still fuzzes offset, leading-dim padding, and stride sign. A and T layouts
// are fuzzed together. zgelqt3 has NO WORK argument, so there is no Step-4c test.
const colLayouts = ALL_LAYOUTS.filter( function isCol( L ) {
	return L.order !== 'row';
} );
const rowLayouts = ALL_LAYOUTS.filter( function isRow( L ) {
	return L.order === 'row';
} );

test( 'zgelqt3: bit-exact within storage-order family (col / row)', function t() {
	[ [ 16, 33 ], [ 17, 33 ], [ 33, 64 ], [ 8, 16 ] ].forEach( function eachSize( sz ) {
		runInvariance( colLayouts, 'col', sz[ 0 ], sz[ 1 ] );
		runInvariance( rowLayouts, 'row', sz[ 0 ], sz[ 1 ] );
	} );
} );

function runInvariance( variants, fam, M, N ) {
	const K = M;
	const SEED = 0xF00D + ( M * 17 ) + N;
	checked( ROUTINE, 'layout-invariance', function run() {
		layoutInvariant( variants, function build( layout, i ) {
			const rng = new RNG( SEED ); // identical values every variant
			const A0 = logical.general( sc, rng, M, N );
			const Ar = schemes.dense.realize( sc, A0, { 'part': 'full' }, layout );
			const Tr = allocT( K, K, variants[ ( i + 1 ) % variants.length ] );
			zgelqt3( M, N, Ar.data, Ar.args[ 0 ], Ar.args[ 1 ], Ar.args[ 2 ], Tr.data, Tr.args[ 0 ], Tr.args[ 1 ], Tr.args[ 2 ] );
			return check.flattenLogical( sc, readFull( Ar, M, N ) ).concat( flattenT( Tr.read, K ) );
		}, { 'label': ROUTINE + ' layout invariance ' + fam + '-major ' + M + 'x' + N } );
	} );
}
