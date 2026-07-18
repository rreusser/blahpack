/**
* @license Apache-2.0
*
* Copyright (c) 2026 Ricky Reusser.
*
* Derived from the LAPACK 3.12.0 reference implementation (BSD-3-Clause).
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/

/* eslint-disable no-restricted-syntax, stdlib/first-unit-test, stdlib/require-globals, camelcase, no-mixed-operators, no-underscore-dangle */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import dgesvd from './../lib/ndarray.js';

// FIXTURES //

import m0_quick_return from './fixtures/m0_quick_return.json' with { type: 'json' };
import _1x1_edge_case from './fixtures/1x1_edge_case.json' with { type: 'json' };
import _4x3_full_svd from './fixtures/4x3_full_svd.json' with { type: 'json' };
import _4x3_compact_svd from './fixtures/4x3_compact_svd.json' with { type: 'json' };
import _4x3_overwrite_u from './fixtures/4x3_overwrite_u.json' with { type: 'json' };
import _4x3_values_only from './fixtures/4x3_values_only.json' with { type: 'json' };
import _3x4_full_svd from './fixtures/3x4_full_svd.json' with { type: 'json' };
import _3x4_compact_svd from './fixtures/3x4_compact_svd.json' with { type: 'json' };
import _3x3_full_svd from './fixtures/3x3_full_svd.json' with { type: 'json' };
import _4x3_s_o from './fixtures/4x3_s_o.json' with { type: 'json' };
import _4x3_a_s from './fixtures/4x3_a_s.json' with { type: 'json' };
import _3x4_n_s from './fixtures/3x4_n_s.json' with { type: 'json' };
import _3x4_s_n from './fixtures/3x4_s_n.json' with { type: 'json' };
import _4x3_n_a from './fixtures/4x3_n_a.json' with { type: 'json' };
import _3x4_a_n from './fixtures/3x4_a_n.json' with { type: 'json' };

// FUNCTIONS //

function assertClose( actual, expected, tol, msg ) {
	const err = Math.abs( actual - expected );
	const relErr = err / Math.max( Math.abs( expected ), 1.0 );
	assert.ok( relErr <= tol, msg + ': expected ' + expected + ', got ' + actual + ' (relErr=' + relErr + ')' );
}

function assertArrayClose( actual, expected, tol, msg ) {
	let i;
	assert.equal( actual.length, expected.length, msg + ': length mismatch: actual ' + actual.length + ' vs expected ' + expected.length );
	for ( i = 0; i < expected.length; i++ ) {
		assertClose( actual[ i ], expected[ i ], tol, msg + '[' + i + ']' );
	}
}

/**
* Compute matrix product C = A * B (column-major).
*
* @param {number} M - rows of A and C
* @param {number} N - cols of B and C
* @param {number} K - cols of A and rows of B
* @param {Float64Array} A - M-by-K in column major (lda = M)
* @param {Float64Array} B - K-by-N in column major (ldb = K)
* @returns {Float64Array} C - M-by-N in column major (ldc = M)
*/
function matmul( M, N, K, A, B ) {
	const C = new Float64Array( M * N );
	let i, j, k;
	for ( j = 0; j < N; j++ ) {
		for ( k = 0; k < K; k++ ) {
			for ( i = 0; i < M; i++ ) {
				C[ i + j * M ] += A[ i + k * M ] * B[ k + j * K ];
			}
		}
	}
	return C;
}

/**
* Create an M-by-N diagonal matrix from vector d (in column-major).
*/
function diagMatrix( M, N, d ) {
	const A = new Float64Array( M * N );
	let i;
	const minmn = Math.min( M, N );
	for ( i = 0; i < minmn; i++ ) {
		A[ i + i * M ] = d[ i ];
	}
	return A;
}

/**
* Verify A ≈ U * diag(S) * VT within tolerance.
*
* @param {number} M - rows
* @param {number} N - cols
* @param {Float64Array} A_orig - original matrix M-by-N column-major
* @param {Float64Array} Uarr - U matrix in column-major, M-by-ku columns
* @param {number} ku - number of columns in U
* @param {Float64Array} sarr - singular values (length minmn)
* @param {Float64Array} VTarr - VT matrix in column-major, kv-by-N
* @param {number} kv - number of rows in VT
* @param {number} tol - tolerance
* @param {string} label - label for messages
*/
function verifySVD( M, N, A_orig, Uarr, ku, sarr, VTarr, kv, tol, label ) {
	const minmn = Math.min( M, N );
	// Reconstruct: A_approx = U * diag(S) * VT
	// U is M-by-ku, S is ku, VT is kv-by-N (with ku=kv=minmn for compact)
	const SIGMA = diagMatrix( ku, kv, sarr );
	const USIGMA = matmul( M, kv, ku, Uarr, SIGMA );
	const A_approx = matmul( M, N, kv, USIGMA, VTarr );
	let i;
	let maxErr = 0;
	for ( i = 0; i < M * N; i++ ) {
		const err = Math.abs( A_approx[ i ] - A_orig[ i ] );
		if ( err > maxErr ) {
			maxErr = err;
		}
	}
	assert.ok( maxErr < tol, label + ': ||A - U*S*VT||_max = ' + maxErr + ' > ' + tol );
}

/**
* Verify U^T * U ≈ I (orthogonality).
*/
function verifyOrthogonal( M, N, Uarr, tol, label ) {
	// U is M-by-N, compute U^T * U = N-by-N
	const UTU = new Float64Array( N * N );
	let i, j, k;
	for ( j = 0; j < N; j++ ) {
		for ( i = 0; i < N; i++ ) {
			let sum = 0;
			for ( k = 0; k < M; k++ ) {
				sum += Uarr[ k + i * M ] * Uarr[ k + j * M ];
			}
			UTU[ i + j * N ] = sum;
		}
	}
	for ( j = 0; j < N; j++ ) {
		for ( i = 0; i < N; i++ ) {
			const expected = ( i === j ) ? 1.0 : 0.0;
			const err = Math.abs( UTU[ i + j * N ] - expected );
			assert.ok( err < tol, label + ': U^T*U[' + i + ',' + j + '] = ' + UTU[ i + j * N ] + ', expected ' + expected );
		}
	}
}

// Input matrices used in the Fortran tests:
// 4x3 matrix (column-major):
// A = [ 5  1  2 ]
//     [ 1  6  1 ]
//     [ 2  1  7 ]
//     [ 1  1  1 ]
const A43 = new Float64Array([ 5, 1, 2, 1, 1, 6, 1, 1, 2, 1, 7, 1 ]);

// 3x4 matrix (column-major):
// A = [ 5  1  2  1 ]
//     [ 1  6  1  2 ]
//     [ 2  1  7  1 ]
const A34 = new Float64Array([ 5, 1, 2, 1, 6, 1, 2, 1, 7, 1, 2, 1 ]);

// 3x3 matrix (column-major):
// A = [ 5  1  2 ]
//     [ 1  6  1 ]
//     [ 2  1  7 ]
const A33 = new Float64Array([ 5, 1, 2, 1, 6, 1, 2, 1, 7 ]);

function copyArray( src ) {
	return new Float64Array( src );
}

/**
* Allocate a workspace buffer of sufficient size for dgesvd with M rows and N columns.
*
* @param {number} M - number of rows
* @param {number} N - number of columns
* @returns {Float64Array} workspace buffer
*/
function makeWork( M, N ) {
	const minmn = Math.min( M, N );
	const maxmn = Math.max( M, N );
	const wsz = Math.max( 1, 5 * minmn, ( 3 * minmn ) + maxmn, ( 2 * maxmn * maxmn ) + ( 3 * maxmn ) + maxmn );
	return new Float64Array( wsz );
}

// TESTS //

test( 'dgesvd: quick return for M=0', function t() {
	const tc = m0_quick_return;
	const A = new Float64Array( 1 );
	const s = new Float64Array( 1 );
	const U = new Float64Array( 1 );
	const VT = new Float64Array( 1 );
	const work = new Float64Array( 1 ); // M=0 triggers quick return before work is used
	const info = dgesvd( 'none', 'none', 0, 3, A, 1, 1, 0, s, 1, 0, U, 1, 1, 0, VT, 1, 1, 0, work, 1, 0 );
	assert.equal( info, tc.info );
});

test( 'dgesvd: quick return for N=0', function t() {
	const A = new Float64Array( 1 );
	const s = new Float64Array( 1 );
	const U = new Float64Array( 1 );
	const VT = new Float64Array( 1 );
	const work = new Float64Array( 1 ); // N=0 triggers quick return before work is used
	const info = dgesvd( 'none', 'none', 3, 0, A, 1, 3, 0, s, 1, 0, U, 1, 1, 0, VT, 1, 1, 0, work, 1, 0 );
	assert.equal( info, 0 );
});

test( 'dgesvd: 1x1 edge case', function t() {
	const tc = _1x1_edge_case;
	const M = 1;
	const N = 1;
	const A = new Float64Array([ 3.0 ]);
	const s = new Float64Array( 1 );
	const U = new Float64Array( 1 );
	const VT = new Float64Array( 1 );
	const work = makeWork( M, N );
	const info = dgesvd( 'all-columns', 'all-rows', M, N, A, 1, 1, 0, s, 1, 0, U, 1, 1, 0, VT, 1, 1, 0, work, 1, 0 );
	assert.equal( info, tc.info );
	assertArrayClose( Array.from( s ), tc.s, 1e-14, 's' );
});

test( 'dgesvd: 4x3 full SVD (JOBU=A, JOBVT=A) — Path 9', function t() {
	const tc = _4x3_full_svd;
	const M = 4;
	const N = 3;
	const minmn = 3;
	const A = copyArray( A43 );
	const A_orig = copyArray( A43 );
	const s = new Float64Array( minmn );
	const U = new Float64Array( M * M );
	const VT = new Float64Array( N * N );

	const work = makeWork( M, N );
	const info = dgesvd( 'all-columns', 'all-rows', M, N, A, 1, M, 0, s, 1, 0, U, 1, M, 0, VT, 1, N, 0, work, 1, 0 );
	assert.equal( info, 0 );

	// Singular values must match fixture exactly
	assertArrayClose( Array.from( s ), tc.s, 1e-13, 's' );

	// Verify mathematical property: A ≈ U * diag(S) * VT
	verifySVD( M, N, A_orig, U, M, s, VT, N, 1e-12, 'reconstruction' );

	// Verify orthogonality
	verifyOrthogonal( M, M, U, 1e-13, 'U orthogonality' );
	verifyOrthogonal( N, N, VT, 1e-13, 'VT orthogonality' );
});

test( 'dgesvd: 4x3 compact SVD (JOBU=S, JOBVT=S) — Path 6', function t() {
	const tc = _4x3_compact_svd;
	const M = 4;
	const N = 3;
	const minmn = 3;
	const A = copyArray( A43 );
	const A_orig = copyArray( A43 );
	const s = new Float64Array( minmn );
	const U = new Float64Array( M * minmn );
	const VT = new Float64Array( minmn * N );

	const work = makeWork( M, N );
	const info = dgesvd( 'economy', 'economy', M, N, A, 1, M, 0, s, 1, 0, U, 1, M, 0, VT, 1, minmn, 0, work, 1, 0 );
	assert.equal( info, 0 );

	assertArrayClose( Array.from( s ), tc.s, 1e-13, 's' );
	verifySVD( M, N, A_orig, U, minmn, s, VT, minmn, 1e-12, 'reconstruction' );

	// U columns should be orthonormal: U^T * U = I_minmn
	verifyOrthogonal( M, minmn, U, 1e-13, 'U orthogonality' );
});

test( 'dgesvd: 4x3 JOBU=O, JOBVT=S — Path 3', function t() {
	const tc = _4x3_overwrite_u;
	const M = 4;
	const N = 3;
	const minmn = 3;
	const A = copyArray( A43 );
	const A_orig = copyArray( A43 );
	const s = new Float64Array( minmn );
	const U = new Float64Array( 1 ); // unused when JOBU='O'
	const VT = new Float64Array( minmn * N );

	const work = makeWork( M, N );
	const info = dgesvd( 'overwrite', 'economy', M, N, A, 1, M, 0, s, 1, 0, U, 1, 1, 0, VT, 1, minmn, 0, work, 1, 0 );
	assert.equal( info, 0 );

	assertArrayClose( Array.from( s ), tc.s, 1e-13, 's' );

	// U is stored in A: M-by-minmn columns
	const Uarr = new Float64Array( M * minmn );
	let i;
	for ( i = 0; i < M * minmn; i++ ) {
		Uarr[ i ] = A[ i ];
	}
	verifySVD( M, N, A_orig, Uarr, minmn, s, VT, minmn, 1e-12, 'reconstruction' );
});

test( 'dgesvd: 4x3 JOBU=N, JOBVT=N — Path 1 (values only)', function t() {
	const tc = _4x3_values_only;
	const M = 4;
	const N = 3;
	const minmn = 3;
	const A = copyArray( A43 );
	const s = new Float64Array( minmn );
	const U = new Float64Array( 1 );
	const VT = new Float64Array( 1 );

	const work = makeWork( M, N );
	const info = dgesvd( 'none', 'none', M, N, A, 1, M, 0, s, 1, 0, U, 1, 1, 0, VT, 1, 1, 0, work, 1, 0 );
	assert.equal( info, 0 );

	assertArrayClose( Array.from( s ), tc.s, 1e-13, 's' );
});

test( 'dgesvd: 3x4 full SVD (JOBU=A, JOBVT=A) — Path 9t', function t() {
	const tc = _3x4_full_svd;
	const M = 3;
	const N = 4;
	const minmn = 3;
	const A = copyArray( A34 );
	const A_orig = copyArray( A34 );
	const s = new Float64Array( minmn );
	const U = new Float64Array( M * M );
	const VT = new Float64Array( N * N );

	const work = makeWork( M, N );
	const info = dgesvd( 'all-columns', 'all-rows', M, N, A, 1, M, 0, s, 1, 0, U, 1, M, 0, VT, 1, N, 0, work, 1, 0 );
	assert.equal( info, 0 );

	assertArrayClose( Array.from( s ), tc.s, 1e-13, 's' );
	verifySVD( M, N, A_orig, U, M, s, VT, N, 1e-12, 'reconstruction' );
	verifyOrthogonal( M, M, U, 1e-13, 'U orthogonality' );
	verifyOrthogonal( N, N, VT, 1e-13, 'VT orthogonality' );
});

test( 'dgesvd: 3x4 compact SVD (JOBU=S, JOBVT=S) — Path 6t', function t() {
	const tc = _3x4_compact_svd;
	const M = 3;
	const N = 4;
	const minmn = 3;
	const A = copyArray( A34 );
	const A_orig = copyArray( A34 );
	const s = new Float64Array( minmn );
	const U = new Float64Array( M * minmn );
	const VT = new Float64Array( minmn * N );

	const work = makeWork( M, N );
	const info = dgesvd( 'economy', 'economy', M, N, A, 1, M, 0, s, 1, 0, U, 1, M, 0, VT, 1, minmn, 0, work, 1, 0 );
	assert.equal( info, 0 );

	assertArrayClose( Array.from( s ), tc.s, 1e-13, 's' );
	verifySVD( M, N, A_orig, U, minmn, s, VT, minmn, 1e-12, 'reconstruction' );
	verifyOrthogonal( M, minmn, U, 1e-13, 'U orthogonality' );
});

test( 'dgesvd: 3x3 full SVD (square) — Path 10', function t() {
	const tc = _3x3_full_svd;
	const M = 3;
	const N = 3;
	const minmn = 3;
	const A = copyArray( A33 );
	const A_orig = copyArray( A33 );
	const s = new Float64Array( minmn );
	const U = new Float64Array( M * M );
	const VT = new Float64Array( N * N );

	const work = makeWork( M, N );
	const info = dgesvd( 'all-columns', 'all-rows', M, N, A, 1, M, 0, s, 1, 0, U, 1, M, 0, VT, 1, N, 0, work, 1, 0 );
	assert.equal( info, 0 );

	assertArrayClose( Array.from( s ), tc.s, 1e-13, 's' );
	verifySVD( M, N, A_orig, U, M, s, VT, N, 1e-12, 'reconstruction' );
	verifyOrthogonal( M, M, U, 1e-13, 'U orthogonality' );
	verifyOrthogonal( N, N, VT, 1e-13, 'VT orthogonality' );
});

test( 'dgesvd: 4x3 JOBU=S, JOBVT=O — Path 5', function t() {
	const tc = _4x3_s_o;
	const M = 4;
	const N = 3;
	const minmn = 3;
	const A = copyArray( A43 );
	const A_orig = copyArray( A43 );
	const s = new Float64Array( minmn );
	const U = new Float64Array( M * minmn );
	const VT = new Float64Array( 1 ); // unused

	const work = makeWork( M, N );
	const info = dgesvd( 'economy', 'overwrite', M, N, A, 1, M, 0, s, 1, 0, U, 1, M, 0, VT, 1, 1, 0, work, 1, 0 );
	assert.equal( info, 0 );

	assertArrayClose( Array.from( s ), tc.s, 1e-13, 's' );

	// VT is stored in first N rows of A (N-by-N)
	const VTarr = new Float64Array( N * N );
	let i;
	for ( i = 0; i < N * N; i++ ) {
		// A is M-by-N column-major; first N rows of each column
		const col = Math.floor( i / N );
		const row = i % N;
		VTarr[ row + col * N ] = A[ row + col * M ];
	}
	verifySVD( M, N, A_orig, U, minmn, s, VTarr, N, 1e-12, 'reconstruction' );
});

test( 'dgesvd: 4x3 JOBU=A, JOBVT=S — Path 9', function t() {
	const tc = _4x3_a_s;
	const M = 4;
	const N = 3;
	const minmn = 3;
	const A = copyArray( A43 );
	const A_orig = copyArray( A43 );
	const s = new Float64Array( minmn );
	const U = new Float64Array( M * M );
	const VT = new Float64Array( minmn * N );

	const work = makeWork( M, N );
	const info = dgesvd( 'all-columns', 'economy', M, N, A, 1, M, 0, s, 1, 0, U, 1, M, 0, VT, 1, minmn, 0, work, 1, 0 );
	assert.equal( info, 0 );

	assertArrayClose( Array.from( s ), tc.s, 1e-13, 's' );
	verifySVD( M, N, A_orig, U, M, s, VT, minmn, 1e-12, 'reconstruction' );
	verifyOrthogonal( M, M, U, 1e-13, 'U orthogonality' );
});

test( 'dgesvd: 3x4 JOBU=N, JOBVT=S — Path 4t', function t() {
	const tc = _3x4_n_s;
	const M = 3;
	const N = 4;
	const minmn = 3;
	const A = copyArray( A34 );
	const s = new Float64Array( minmn );
	const U = new Float64Array( 1 );
	const VT = new Float64Array( minmn * N );

	const work = makeWork( M, N );
	const info = dgesvd( 'none', 'economy', M, N, A, 1, M, 0, s, 1, 0, U, 1, 1, 0, VT, 1, minmn, 0, work, 1, 0 );
	assert.equal( info, 0 );

	assertArrayClose( Array.from( s ), tc.s, 1e-13, 's' );
});

test( 'dgesvd: 3x4 JOBU=S, JOBVT=N — Path 1t (with U)', function t() {
	const tc = _3x4_s_n;
	const M = 3;
	const N = 4;
	const minmn = 3;
	const A = copyArray( A34 );
	const s = new Float64Array( minmn );
	const U = new Float64Array( M * minmn );
	const VT = new Float64Array( 1 );

	const work = makeWork( M, N );
	const info = dgesvd( 'economy', 'none', M, N, A, 1, M, 0, s, 1, 0, U, 1, M, 0, VT, 1, 1, 0, work, 1, 0 );
	assert.equal( info, 0 );

	assertArrayClose( Array.from( s ), tc.s, 1e-13, 's' );
	verifyOrthogonal( M, minmn, U, 1e-13, 'U orthogonality' );
});

test( 'dgesvd: 4x3 JOBU=N, JOBVT=A — Path 1 (with VT)', function t() {
	const tc = _4x3_n_a;
	const M = 4;
	const N = 3;
	const minmn = 3;
	const A = copyArray( A43 );
	const s = new Float64Array( minmn );
	const U = new Float64Array( 1 );
	const VT = new Float64Array( N * N );

	const work = makeWork( M, N );
	const info = dgesvd( 'none', 'all-rows', M, N, A, 1, M, 0, s, 1, 0, U, 1, 1, 0, VT, 1, N, 0, work, 1, 0 );
	assert.equal( info, 0 );

	assertArrayClose( Array.from( s ), tc.s, 1e-13, 's' );
	verifyOrthogonal( N, N, VT, 1e-13, 'VT orthogonality' );
});

test( 'dgesvd: 3x4 JOBU=A, JOBVT=N — Path 1t (with full U)', function t() {
	const tc = _3x4_a_n;
	const M = 3;
	const N = 4;
	const minmn = 3;
	const A = copyArray( A34 );
	const s = new Float64Array( minmn );
	const U = new Float64Array( M * M );
	const VT = new Float64Array( 1 );

	const work = makeWork( M, N );
	const info = dgesvd( 'all-columns', 'none', M, N, A, 1, M, 0, s, 1, 0, U, 1, M, 0, VT, 1, 1, 0, work, 1, 0 );
	assert.equal( info, 0 );

	assertArrayClose( Array.from( s ), tc.s, 1e-13, 's' );
	verifyOrthogonal( M, M, U, 1e-13, 'U orthogonality' );
});

test( 'dgesvd: 4x3 JOBU=O, JOBVT=N — Path 2', function t() {
	const M = 4;
	const N = 3;
	const minmn = 3;
	const A = copyArray( A43 );
	const A_orig = copyArray( A43 );
	const s = new Float64Array( minmn );
	const U = new Float64Array( 1 );
	const VT = new Float64Array( 1 );

	const work = makeWork( M, N );
	const info = dgesvd( 'overwrite', 'none', M, N, A, 1, M, 0, s, 1, 0, U, 1, 1, 0, VT, 1, 1, 0, work, 1, 0 );
	assert.equal( info, 0 );

	// Singular values should match the known values
	const tc = _4x3_values_only;
	assertArrayClose( Array.from( s ), tc.s, 1e-13, 's' );

	// U overwrites A — verify orthogonality of first minmn columns
	const Uarr = new Float64Array( M * minmn );
	let i;
	for ( i = 0; i < M * minmn; i++ ) {
		Uarr[ i ] = A[ i ];
	}
	verifyOrthogonal( M, minmn, Uarr, 1e-13, 'U orthogonality' );
});

test( 'dgesvd: 4x3 JOBU=A, JOBVT=O — Path 8', function t() {
	const M = 4;
	const N = 3;
	const minmn = 3;
	const A = copyArray( A43 );
	const A_orig = copyArray( A43 );
	const s = new Float64Array( minmn );
	const U = new Float64Array( M * M );
	const VT = new Float64Array( 1 );

	const work = makeWork( M, N );
	const info = dgesvd( 'all-columns', 'overwrite', M, N, A, 1, M, 0, s, 1, 0, U, 1, M, 0, VT, 1, 1, 0, work, 1, 0 );
	assert.equal( info, 0 );

	const tc = _4x3_values_only;
	assertArrayClose( Array.from( s ), tc.s, 1e-13, 's' );

	// VT stored in first N rows of A
	const VTarr = new Float64Array( N * N );
	let i, col, row;
	for ( i = 0; i < N * N; i++ ) {
		col = Math.floor( i / N );
		row = i % N;
		VTarr[ row + col * N ] = A[ row + col * M ];
	}
	verifySVD( M, N, A_orig, U, M, s, VTarr, N, 1e-12, 'reconstruction' );
	verifyOrthogonal( M, M, U, 1e-13, 'U orthogonality' );
});

test( 'dgesvd: 4x3 JOBU=S, JOBVT=N — Path 4', function t() {
	const M = 4;
	const N = 3;
	const minmn = 3;
	const A = copyArray( A43 );
	const s = new Float64Array( minmn );
	const U = new Float64Array( M * minmn );
	const VT = new Float64Array( 1 );

	const work = makeWork( M, N );
	const info = dgesvd( 'economy', 'none', M, N, A, 1, M, 0, s, 1, 0, U, 1, M, 0, VT, 1, 1, 0, work, 1, 0 );
	assert.equal( info, 0 );

	const tc = _4x3_values_only;
	assertArrayClose( Array.from( s ), tc.s, 1e-13, 's' );
	verifyOrthogonal( M, minmn, U, 1e-13, 'U orthogonality' );
});

test( 'dgesvd: 4x3 JOBU=A, JOBVT=N — Path 7', function t() {
	const M = 4;
	const N = 3;
	const minmn = 3;
	const A = copyArray( A43 );
	const s = new Float64Array( minmn );
	const U = new Float64Array( M * M );
	const VT = new Float64Array( 1 );

	const work = makeWork( M, N );
	const info = dgesvd( 'all-columns', 'none', M, N, A, 1, M, 0, s, 1, 0, U, 1, M, 0, VT, 1, 1, 0, work, 1, 0 );
	assert.equal( info, 0 );

	const tc = _4x3_values_only;
	assertArrayClose( Array.from( s ), tc.s, 1e-13, 's' );
	verifyOrthogonal( M, M, U, 1e-13, 'U orthogonality' );
});

test( 'dgesvd: 4x3 JOBU=N, JOBVT=S — Path 1 (N with S)', function t() {
	const M = 4;
	const N = 3;
	const minmn = 3;
	const A = copyArray( A43 );
	const s = new Float64Array( minmn );
	const U = new Float64Array( 1 );
	const VT = new Float64Array( minmn * N );

	const work = makeWork( M, N );
	const info = dgesvd( 'none', 'economy', M, N, A, 1, M, 0, s, 1, 0, U, 1, 1, 0, VT, 1, minmn, 0, work, 1, 0 );
	assert.equal( info, 0 );

	const tc = _4x3_values_only;
	assertArrayClose( Array.from( s ), tc.s, 1e-13, 's' );
});

test( 'dgesvd: 3x4 JOBU=N, JOBVT=N (values only) — Path 1t', function t() {
	const M = 3;
	const N = 4;
	const minmn = 3;
	const A = copyArray( A34 );
	const s = new Float64Array( minmn );
	const U = new Float64Array( 1 );
	const VT = new Float64Array( 1 );

	const work = makeWork( M, N );
	const info = dgesvd( 'none', 'none', M, N, A, 1, M, 0, s, 1, 0, U, 1, 1, 0, VT, 1, 1, 0, work, 1, 0 );
	assert.equal( info, 0 );

	const tc = _3x4_full_svd;
	assertArrayClose( Array.from( s ), tc.s, 1e-13, 's' );
});

test( 'dgesvd: 3x4 JOBU=N, JOBVT=A — Path 7t', function t() {
	const M = 3;
	const N = 4;
	const minmn = 3;
	const A = copyArray( A34 );
	const s = new Float64Array( minmn );
	const U = new Float64Array( 1 );
	const VT = new Float64Array( N * N );

	const work = makeWork( M, N );
	const info = dgesvd( 'all-columns', 'all-rows', M, N, A, 1, M, 0, s, 1, 0, U, 1, M, 0, VT, 1, N, 0, work, 1, 0 );
	// re-use 3x4 full SVD test
	assert.equal( info, 0 );

	const tc = _3x4_full_svd;
	assertArrayClose( Array.from( s ), tc.s, 1e-13, 's' );
});

test( 'dgesvd: 3x4 JOBU=O, JOBVT=S — Path 5t', function t() {
	const M = 3;
	const N = 4;
	const minmn = 3;
	const A = copyArray( A34 );
	const A_orig = copyArray( A34 );
	const s = new Float64Array( minmn );
	const U = new Float64Array( 1 );
	const VT = new Float64Array( minmn * N );

	const work = makeWork( M, N );
	const info = dgesvd( 'overwrite', 'economy', M, N, A, 1, M, 0, s, 1, 0, U, 1, 1, 0, VT, 1, minmn, 0, work, 1, 0 );
	assert.equal( info, 0 );

	const tc = _3x4_full_svd;
	assertArrayClose( Array.from( s ), tc.s, 1e-13, 's' );

	// U overwrites A (M-by-M)
	const Uarr = new Float64Array( M * M );
	let i;
	for ( i = 0; i < M * M; i++ ) {
		Uarr[ i ] = A[ i ];
	}
	verifySVD( M, N, A_orig, Uarr, M, s, VT, minmn, 1e-12, 'reconstruction' );
});

test( 'dgesvd: 3x4 JOBU=S, JOBVT=A — Path 9t', function t() {
	const M = 3;
	const N = 4;
	const minmn = 3;
	const A = copyArray( A34 );
	const A_orig = copyArray( A34 );
	const s = new Float64Array( minmn );
	const U = new Float64Array( M * minmn );
	const VT = new Float64Array( N * N );

	const work = makeWork( M, N );
	const info = dgesvd( 'economy', 'all-rows', M, N, A, 1, M, 0, s, 1, 0, U, 1, M, 0, VT, 1, N, 0, work, 1, 0 );
	assert.equal( info, 0 );

	const tc = _3x4_full_svd;
	assertArrayClose( Array.from( s ), tc.s, 1e-13, 's' );
	verifySVD( M, N, A_orig, U, minmn, s, VT, N, 1e-12, 'reconstruction' );
});

test( 'dgesvd: 3x4 JOBU=A, JOBVT=S — Path 6t', function t() {
	const M = 3;
	const N = 4;
	const minmn = 3;
	const A = copyArray( A34 );
	const A_orig = copyArray( A34 );
	const s = new Float64Array( minmn );
	const U = new Float64Array( M * M );
	const VT = new Float64Array( minmn * N );

	const work = makeWork( M, N );
	const info = dgesvd( 'all-columns', 'economy', M, N, A, 1, M, 0, s, 1, 0, U, 1, M, 0, VT, 1, minmn, 0, work, 1, 0 );
	assert.equal( info, 0 );

	const tc = _3x4_full_svd;
	assertArrayClose( Array.from( s ), tc.s, 1e-13, 's' );
	verifySVD( M, N, A_orig, U, M, s, VT, minmn, 1e-12, 'reconstruction' );
	verifyOrthogonal( M, M, U, 1e-13, 'U orthogonality' );
});

test( 'dgesvd: larger matrix to exercise direct path 10 (M >= N, M not much larger)', function t() {
	// 4x4 matrix — square, so M >= N but mnthr = 1.6*4 = 6.4 > 4, so direct path
	const M = 4;
	const N = 4;
	const minmn = 4;
	const A = new Float64Array([
		10, 1, 2, 1,
		1, 9, 1, 2,
		2, 1, 8, 1,
		1, 2, 1, 7
	]);
	const A_orig = copyArray( A );
	const s = new Float64Array( minmn );
	const U = new Float64Array( M * M );
	const VT = new Float64Array( N * N );

	const work = makeWork( M, N );
	const info = dgesvd( 'all-columns', 'all-rows', M, N, A, 1, M, 0, s, 1, 0, U, 1, M, 0, VT, 1, N, 0, work, 1, 0 );
	assert.equal( info, 0 );

	// Singular values should be positive and in descending order
	let i;
	for ( i = 0; i < minmn; i++ ) {
		assert.ok( s[ i ] >= 0, 's[' + i + '] should be non-negative' );
	}
	for ( i = 0; i < minmn - 1; i++ ) {
		assert.ok( s[ i ] >= s[ i + 1 ], 's should be in descending order' );
	}

	verifySVD( M, N, A_orig, U, M, s, VT, N, 1e-12, 'reconstruction' );
	verifyOrthogonal( M, M, U, 1e-13, 'U orthogonality' );
	verifyOrthogonal( N, N, VT, 1e-13, 'VT orthogonality' );
});

test( 'dgesvd: 3x4 JOBU=O, JOBVT=A — Path 8t', function t() {
	const M = 3;
	const N = 4;
	const minmn = 3;
	const A = copyArray( A34 );
	const A_orig = copyArray( A34 );
	const s = new Float64Array( minmn );
	const U = new Float64Array( 1 );
	const VT = new Float64Array( N * N );

	const work = makeWork( M, N );
	const info = dgesvd( 'overwrite', 'all-rows', M, N, A, 1, M, 0, s, 1, 0, U, 1, 1, 0, VT, 1, N, 0, work, 1, 0 );
	assert.equal( info, 0 );

	const tc = _3x4_full_svd;
	assertArrayClose( Array.from( s ), tc.s, 1e-13, 's' );

	// U overwrites A (M-by-M)
	const Uarr = new Float64Array( M * M );
	let i;
	for ( i = 0; i < M * M; i++ ) {
		Uarr[ i ] = A[ i ];
	}
	verifySVD( M, N, A_orig, Uarr, M, s, VT, N, 1e-12, 'reconstruction' );
	verifyOrthogonal( N, N, VT, 1e-13, 'VT orthogonality' );
});

test( 'dgesvd: 3x4 JOBU=A, JOBVT=A with direct path (M < N, not much)', function t() {
	// 3x4 where N not much larger than M — triggers path 10t
	// mnthr = 1.6 * 3 = 4.8, N=4 < 4.8 so direct path
	const M = 3;
	const N = 4;
	const minmn = 3;
	const A = copyArray( A34 );
	const A_orig = copyArray( A34 );
	const s = new Float64Array( minmn );
	const U = new Float64Array( M * M );
	const VT = new Float64Array( N * N );

	const work = makeWork( M, N );
	const info = dgesvd( 'all-columns', 'all-rows', M, N, A, 1, M, 0, s, 1, 0, U, 1, M, 0, VT, 1, N, 0, work, 1, 0 );
	assert.equal( info, 0 );

	verifySVD( M, N, A_orig, U, M, s, VT, N, 1e-12, 'reconstruction' );
	verifyOrthogonal( M, M, U, 1e-13, 'U orthogonality' );
});

test( 'dgesvd: 3x4 JOBU=O, JOBVT=N — Path 1t (U overwrite, no VT)', function t() {
	const M = 3;
	const N = 4;
	const minmn = 3;
	const A = copyArray( A34 );
	const s = new Float64Array( minmn );
	const U = new Float64Array( 1 );
	const VT = new Float64Array( 1 );

	const work = makeWork( M, N );
	const info = dgesvd( 'overwrite', 'none', M, N, A, 1, M, 0, s, 1, 0, U, 1, 1, 0, VT, 1, 1, 0, work, 1, 0 );
	assert.equal( info, 0 );

	const tc = _3x4_full_svd;
	assertArrayClose( Array.from( s ), tc.s, 1e-13, 's' );
});

test( 'dgesvd: 4x3 JOBU=N, JOBVT=O — Path 1 (VT overwrite)', function t() {
	const M = 4;
	const N = 3;
	const minmn = 3;
	const A = copyArray( A43 );
	const A_orig = copyArray( A43 );
	const s = new Float64Array( minmn );
	const U = new Float64Array( 1 );
	const VT = new Float64Array( 1 );

	// This is invalid per Fortran (can't have both O), but JOBU='N', JOBVT='O' is valid:
	// Path 1 with JOBU=N, when wntvo is true, generates P^T in A
	const work = makeWork( M, N );
	const info = dgesvd( 'none', 'overwrite', M, N, A, 1, M, 0, s, 1, 0, U, 1, 1, 0, VT, 1, 1, 0, work, 1, 0 );
	assert.equal( info, 0 );

	const tc = _4x3_values_only;
	assertArrayClose( Array.from( s ), tc.s, 1e-13, 's' );
});

test( 'dgesvd: 3x4 JOBU=S, JOBVT=O — Path 5t', function t() {
	const M = 3;
	const N = 4;
	const minmn = 3;
	const A = copyArray( A34 );
	const A_orig = copyArray( A34 );
	const s = new Float64Array( minmn );
	const U = new Float64Array( M * minmn );
	const VT = new Float64Array( 1 );

	const work = makeWork( M, N );
	const info = dgesvd( 'economy', 'overwrite', M, N, A, 1, M, 0, s, 1, 0, U, 1, M, 0, VT, 1, 1, 0, work, 1, 0 );
	assert.equal( info, 0 );

	const tc = _3x4_full_svd;
	assertArrayClose( Array.from( s ), tc.s, 1e-13, 's' );
	verifyOrthogonal( M, minmn, U, 1e-13, 'U orthogonality' );
});

test( 'dgesvd: 3x4 JOBU=A, JOBVT=O — Path 8t (with full U)', function t() {
	const M = 3;
	const N = 4;
	const minmn = 3;
	const A = copyArray( A34 );
	const A_orig = copyArray( A34 );
	const s = new Float64Array( minmn );
	const U = new Float64Array( M * M );
	const VT = new Float64Array( 1 );

	const work = makeWork( M, N );
	const info = dgesvd( 'all-columns', 'overwrite', M, N, A, 1, M, 0, s, 1, 0, U, 1, M, 0, VT, 1, 1, 0, work, 1, 0 );
	assert.equal( info, 0 );

	const tc = _3x4_full_svd;
	assertArrayClose( Array.from( s ), tc.s, 1e-13, 's' );
	verifyOrthogonal( M, M, U, 1e-13, 'U orthogonality' );
});

// Additional tests to exercise Path 10 (M >= N, direct bidiag) with overwrite options.
// Path 10 is used when M >= N but M < mnthr = floor(1.6*N).
// For M=3, N=3: mnthr = floor(1.6*3) = 4, M=3 < 4: path 10 is used.

test( 'dgesvd: 3x3 JOBU=O, JOBVT=N — Path 10, wntuo', function t() {
	const M = 3;
	const N = 3;
	const minmn = 3;
	const A = copyArray( A33 );
	const A_orig = copyArray( A33 );
	const s = new Float64Array( minmn );
	const U = new Float64Array( 1 );
	const VT = new Float64Array( 1 );

	const work = makeWork( M, N );
	const info = dgesvd( 'overwrite', 'none', M, N, A, 1, M, 0, s, 1, 0, U, 1, 1, 0, VT, 1, 1, 0, work, 1, 0 );
	assert.equal( info, 0 );

	const tc = _3x3_full_svd;
	assertArrayClose( Array.from( s ), tc.s, 1e-13, 's' );

	// U overwrites A
	const Uarr = new Float64Array( M * minmn );
	let i;
	for ( i = 0; i < M * minmn; i++ ) {
		Uarr[ i ] = A[ i ];
	}
	verifyOrthogonal( M, minmn, Uarr, 1e-13, 'U orthogonality' );
});

test( 'dgesvd: 3x3 JOBU=S, JOBVT=O — Path 10, wntvo', function t() {
	const M = 3;
	const N = 3;
	const minmn = 3;
	const A = copyArray( A33 );
	const A_orig = copyArray( A33 );
	const s = new Float64Array( minmn );
	const U = new Float64Array( M * minmn );
	const VT = new Float64Array( 1 );

	const work = makeWork( M, N );
	const info = dgesvd( 'economy', 'overwrite', M, N, A, 1, M, 0, s, 1, 0, U, 1, M, 0, VT, 1, 1, 0, work, 1, 0 );
	assert.equal( info, 0 );

	const tc = _3x3_full_svd;
	assertArrayClose( Array.from( s ), tc.s, 1e-13, 's' );

	// VT stored in A (N-by-N)
	const VTarr = new Float64Array( N * N );
	let i;
	for ( i = 0; i < N * N; i++ ) {
		VTarr[ i ] = A[ i ];
	}
	verifySVD( M, N, A_orig, U, minmn, s, VTarr, N, 1e-12, 'reconstruction' );
});

test( 'dgesvd: 3x3 JOBU=O, JOBVT=S — Path 10, wntuo+wntvas', function t() {
	const M = 3;
	const N = 3;
	const minmn = 3;
	const A = copyArray( A33 );
	const A_orig = copyArray( A33 );
	const s = new Float64Array( minmn );
	const U = new Float64Array( 1 );
	const VT = new Float64Array( minmn * N );

	const work = makeWork( M, N );
	const info = dgesvd( 'overwrite', 'economy', M, N, A, 1, M, 0, s, 1, 0, U, 1, 1, 0, VT, 1, minmn, 0, work, 1, 0 );
	assert.equal( info, 0 );

	const tc = _3x3_full_svd;
	assertArrayClose( Array.from( s ), tc.s, 1e-13, 's' );

	// U overwrites A
	const Uarr = new Float64Array( M * minmn );
	let i;
	for ( i = 0; i < M * minmn; i++ ) {
		Uarr[ i ] = A[ i ];
	}
	verifySVD( M, N, A_orig, Uarr, minmn, s, VT, minmn, 1e-12, 'reconstruction' );
});

// Path 10t with overwrite options: need M < N and N < mnthr = floor(1.6*M)
// For M=4, N=5: mnthr = floor(1.6*4) = 6, N=5 < 6: path 10t
const A45 = new Float64Array([
	8, 1, 2, 1,
	1, 7, 1, 2,
	2, 1, 9, 1,
	1, 2, 1, 6,
	1, 1, 1, 1
]);

test( 'dgesvd: 4x5 JOBU=O, JOBVT=S — Path 10t, wntuo', function t() {
	const M = 4;
	const N = 5;
	const minmn = 4;
	const A = copyArray( A45 );
	const A_orig = copyArray( A45 );
	const s = new Float64Array( minmn );
	const U = new Float64Array( 1 );
	const VT = new Float64Array( minmn * N );

	const work = makeWork( M, N );
	const info = dgesvd( 'overwrite', 'economy', M, N, A, 1, M, 0, s, 1, 0, U, 1, 1, 0, VT, 1, minmn, 0, work, 1, 0 );
	assert.equal( info, 0 );

	// Verify singular values are positive and descending
	let i;
	for ( i = 0; i < minmn; i++ ) {
		assert.ok( s[ i ] >= 0 );
	}
	for ( i = 0; i < minmn - 1; i++ ) {
		assert.ok( s[ i ] >= s[ i + 1 ] );
	}

	// U overwrites A (M-by-M)
	const Uarr = new Float64Array( M * M );
	for ( i = 0; i < M * M; i++ ) {
		Uarr[ i ] = A[ i ];
	}
	verifySVD( M, N, A_orig, Uarr, M, s, VT, minmn, 1e-12, 'reconstruction' );
});

test( 'dgesvd: 4x5 JOBU=S, JOBVT=O — Path 10t, wntvo', function t() {
	const M = 4;
	const N = 5;
	const minmn = 4;
	const A = copyArray( A45 );
	const A_orig = copyArray( A45 );
	const s = new Float64Array( minmn );
	const U = new Float64Array( M * minmn );
	const VT = new Float64Array( 1 );

	const work = makeWork( M, N );
	const info = dgesvd( 'economy', 'overwrite', M, N, A, 1, M, 0, s, 1, 0, U, 1, M, 0, VT, 1, 1, 0, work, 1, 0 );
	assert.equal( info, 0 );

	let i;
	for ( i = 0; i < minmn; i++ ) {
		assert.ok( s[ i ] >= 0 );
	}

	verifyOrthogonal( M, minmn, U, 1e-13, 'U orthogonality' );
});

test( 'dgesvd: 4x5 JOBU=A, JOBVT=A — Path 10t full', function t() {
	const M = 4;
	const N = 5;
	const minmn = 4;
	const A = copyArray( A45 );
	const A_orig = copyArray( A45 );
	const s = new Float64Array( minmn );
	const U = new Float64Array( M * M );
	const VT = new Float64Array( N * N );

	const work = makeWork( M, N );
	const info = dgesvd( 'all-columns', 'all-rows', M, N, A, 1, M, 0, s, 1, 0, U, 1, M, 0, VT, 1, N, 0, work, 1, 0 );
	assert.equal( info, 0 );

	verifySVD( M, N, A_orig, U, M, s, VT, N, 1e-12, 'reconstruction' );
	verifyOrthogonal( M, M, U, 1e-13, 'U orthogonality' );
	verifyOrthogonal( N, N, VT, 1e-13, 'VT orthogonality' );
});

test( 'dgesvd: 4x5 JOBU=S, JOBVT=S — Path 10t compact', function t() {
	const M = 4;
	const N = 5;
	const minmn = 4;
	const A = copyArray( A45 );
	const A_orig = copyArray( A45 );
	const s = new Float64Array( minmn );
	const U = new Float64Array( M * minmn );
	const VT = new Float64Array( minmn * N );

	const work = makeWork( M, N );
	const info = dgesvd( 'economy', 'economy', M, N, A, 1, M, 0, s, 1, 0, U, 1, M, 0, VT, 1, minmn, 0, work, 1, 0 );
	assert.equal( info, 0 );

	verifySVD( M, N, A_orig, U, minmn, s, VT, minmn, 1e-12, 'reconstruction' );
});

// 3x5 matrix for LQ path tests (M=3, N=5, mnthr=floor(1.6*3)=4, N=5>=4 => LQ path)
const A35 = new Float64Array([
	8, 1, 2,
	1, 7, 1,
	2, 1, 9,
	1, 2, 1,
	1, 1, 1
]);

test( 'dgesvd: 3x5 JOBU=N, JOBVT=O — Path 2t', function t() {
	const M = 3;
	const N = 5;
	const minmn = 3;
	const A = copyArray( A35 );
	const s = new Float64Array( minmn );
	const U = new Float64Array( 1 );
	const VT = new Float64Array( 1 );

	const work = makeWork( M, N );
	const info = dgesvd( 'none', 'overwrite', M, N, A, 1, M, 0, s, 1, 0, U, 1, 1, 0, VT, 1, 1, 0, work, 1, 0 );
	assert.equal( info, 0 );

	let i;
	for ( i = 0; i < minmn; i++ ) {
		assert.ok( s[ i ] >= 0, 's[' + i + '] >= 0' );
	}
	for ( i = 0; i < minmn - 1; i++ ) {
		assert.ok( s[ i ] >= s[ i + 1 ], 's descending' );
	}
});

test( 'dgesvd: 3x5 JOBU=S, JOBVT=O — Path 3t', function t() {
	const M = 3;
	const N = 5;
	const minmn = 3;
	const A = copyArray( A35 );
	const A_orig = copyArray( A35 );
	const s = new Float64Array( minmn );
	const U = new Float64Array( M * minmn );
	const VT = new Float64Array( 1 );

	const work = makeWork( M, N );
	const info = dgesvd( 'economy', 'overwrite', M, N, A, 1, M, 0, s, 1, 0, U, 1, M, 0, VT, 1, 1, 0, work, 1, 0 );
	assert.equal( info, 0 );

	let i;
	for ( i = 0; i < minmn; i++ ) {
		assert.ok( s[ i ] >= 0 );
	}
	verifyOrthogonal( M, minmn, U, 1e-13, 'U orthogonality' );
});

test( 'dgesvd: 3x5 JOBU=N, JOBVT=A — Path 7t', function t() {
	const M = 3;
	const N = 5;
	const minmn = 3;
	const A = copyArray( A35 );
	const A_orig = copyArray( A35 );
	const s = new Float64Array( minmn );
	const U = new Float64Array( 1 );
	const VT = new Float64Array( N * N );

	const work = makeWork( M, N );
	const info = dgesvd( 'none', 'all-rows', M, N, A, 1, M, 0, s, 1, 0, U, 1, 1, 0, VT, 1, N, 0, work, 1, 0 );
	assert.equal( info, 0 );

	let i;
	for ( i = 0; i < minmn; i++ ) {
		assert.ok( s[ i ] >= 0 );
	}
	verifyOrthogonal( N, N, VT, 1e-13, 'VT orthogonality' );
});
