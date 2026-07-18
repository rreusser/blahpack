/* eslint-disable no-restricted-syntax, stdlib/first-unit-test, max-len */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import zggsvd3 from './../lib/ndarray.js';


// FIXTURES //

import fxBasic from './fixtures/basic_3x3_2x3.json' with { type: 'json' };
import fxMltP from './fixtures/m_lt_p.json' with { type: 'json' };
import fxNoUVQ from './fixtures/no_uvq.json' with { type: 'json' };
import fxDiag from './fixtures/diag_4x4.json' with { type: 'json' };


// FUNCTIONS //

/**
* Asserts two numbers are approximately equal.
*
* @private
* @param {number} actual - actual
* @param {number} expected - expected
* @param {number} tol - tolerance
* @param {string} msg - message
*/
function assertClose( actual, expected, tol, msg ) {
	const relErr = Math.abs( actual - expected ) / Math.max( Math.abs( expected ), 1.0 );
	assert.ok( relErr <= tol, msg + ': expected ' + expected + ', got ' + actual );
}

/**
* Asserts two arrays are element-wise close.
*
* @private
* @param {Float64Array} actual - actual
* @param {NonNegativeInteger} offset - offset
* @param {integer} stride - stride
* @param {Array<number>} expected - expected
* @param {NonNegativeInteger} n - length
* @param {number} tol - tolerance
* @param {string} msg - message
*/
function assertArrayClose( actual, offset, stride, expected, n, tol, msg ) {
	let i;
	for ( i = 0; i < n; i++ ) {
		assertClose( actual[ offset + ( i * stride ) ], expected[ i ], tol, msg + '[' + i + ']' );
	}
}


// TESTS //

test( 'zggsvd3: basic 3x3 A, 2x3 B (complex)', function t() {

	const tc = fxBasic;
	const M = 3;
	const N = 3;
	const P = 2;
	const A = new Complex128Array( M * N );
	A.set( [ 1.0, 0.5 ], 0 + ( 0 * M ) );
	A.set( [ 4.0, 0.0 ], 1 + ( 0 * M ) );
	A.set( [ 7.0, -0.5 ], 2 + ( 0 * M ) );
	A.set( [ 2.0, 0.0 ], 0 + ( 1 * M ) );
	A.set( [ 5.0, 1.0 ], 1 + ( 1 * M ) );
	A.set( [ 8.0, 0.0 ], 2 + ( 1 * M ) );
	A.set( [ 3.0, -0.5 ], 0 + ( 2 * M ) );
	A.set( [ 6.0, 0.0 ], 1 + ( 2 * M ) );
	A.set( [ 10.0, 0.5 ], 2 + ( 2 * M ) );
	const B = new Complex128Array( P * N );
	B.set( [ 1.0, 0.0 ], 0 + ( 0 * P ) );
	B.set( [ 0.0, 0.0 ], 1 + ( 0 * P ) );
	B.set( [ 0.0, 0.0 ], 0 + ( 1 * P ) );
	B.set( [ 1.0, 0.0 ], 1 + ( 1 * P ) );
	B.set( [ 1.0, 0.5 ], 0 + ( 2 * P ) );
	B.set( [ 1.0, -0.5 ], 1 + ( 2 * P ) );

	const ALPHA = new Float64Array( N );
	const BETA = new Float64Array( N );
	const U = new Complex128Array( M * M );
	const V = new Complex128Array( P * P );
	const Q = new Complex128Array( N * N );
	const WORK = new Complex128Array( 500 );
	const RWORK = new Float64Array( 4 * N );
	const IWORK = new Int32Array( N );
	const K = new Int32Array( 1 );
	const L = new Int32Array( 1 );
	const info = zggsvd3( 'compute-U', 'compute-V', 'compute-Q', M, N, P, K, L, A, 1, M, 0, B, 1, P, 0, ALPHA, 1, 0, BETA, 1, 0, U, 1, M, 0, V, 1, P, 0, Q, 1, N, 0, WORK, 1, 0, RWORK, 1, 0, IWORK, 1, 0 );
	assert.equal( info, tc.info );
	assert.equal( K[ 0 ], tc.k );
	assert.equal( L[ 0 ], tc.l );
	assertArrayClose( ALPHA, 0, 1, tc.alpha, N, 1e-10, 'alpha' );
	assertArrayClose( BETA, 0, 1, tc.beta, N, 1e-10, 'beta' );
});

test( 'zggsvd3: M < P case (2x3 A, 3x3 B)', function t() {

	const tc = fxMltP;
	const M = 2;
	const N = 3;
	const P = 3;
	const A = new Complex128Array( M * N );
	A.set( [ 2.0, 0.5 ], 0 + ( 0 * M ) );
	A.set( [ 0.0, 0.0 ], 1 + ( 0 * M ) );
	A.set( [ 1.0, 0.0 ], 0 + ( 1 * M ) );
	A.set( [ 3.0, -0.5 ], 1 + ( 1 * M ) );
	A.set( [ 0.0, 0.0 ], 0 + ( 2 * M ) );
	A.set( [ 1.0, 0.0 ], 1 + ( 2 * M ) );
	const B = new Complex128Array( P * N );
	B.set( [ 1.0, 0.0 ], 0 + ( 0 * P ) );
	B.set( [ 4.0, -0.5 ], 1 + ( 0 * P ) );
	B.set( [ 7.0, 0.0 ], 2 + ( 0 * P ) );
	B.set( [ 2.0, 0.5 ], 0 + ( 1 * P ) );
	B.set( [ 5.0, 0.0 ], 1 + ( 1 * P ) );
	B.set( [ 8.0, -0.5 ], 2 + ( 1 * P ) );
	B.set( [ 3.0, 0.0 ], 0 + ( 2 * P ) );
	B.set( [ 6.0, 0.5 ], 1 + ( 2 * P ) );
	B.set( [ 10.0, 0.0 ], 2 + ( 2 * P ) );

	const ALPHA = new Float64Array( N );
	const BETA = new Float64Array( N );
	const U = new Complex128Array( M * M );
	const V = new Complex128Array( P * P );
	const Q = new Complex128Array( N * N );
	const WORK = new Complex128Array( 500 );
	const RWORK = new Float64Array( 4 * N );
	const IWORK = new Int32Array( N );
	const K = new Int32Array( 1 );
	const L = new Int32Array( 1 );
	const info = zggsvd3( 'compute-U', 'compute-V', 'compute-Q', M, N, P, K, L, A, 1, M, 0, B, 1, P, 0, ALPHA, 1, 0, BETA, 1, 0, U, 1, M, 0, V, 1, P, 0, Q, 1, N, 0, WORK, 1, 0, RWORK, 1, 0, IWORK, 1, 0 );
	assert.equal( info, tc.info );
	assert.equal( K[ 0 ], tc.k );
	assert.equal( L[ 0 ], tc.l );
	assertArrayClose( ALPHA, 0, 1, tc.alpha, N, 1e-10, 'alpha' );
	assertArrayClose( BETA, 0, 1, tc.beta, N, 1e-10, 'beta' );
});

test( 'zggsvd3: no U/V/Q', function t() {

	const tc = fxNoUVQ;
	const M = 3;
	const N = 3;
	const P = 2;
	const A = new Complex128Array( M * N );
	A.set( [ 1.0, 0.5 ], 0 + ( 0 * M ) );
	A.set( [ 4.0, 0.0 ], 1 + ( 0 * M ) );
	A.set( [ 7.0, -0.5 ], 2 + ( 0 * M ) );
	A.set( [ 2.0, 0.0 ], 0 + ( 1 * M ) );
	A.set( [ 5.0, 1.0 ], 1 + ( 1 * M ) );
	A.set( [ 8.0, 0.0 ], 2 + ( 1 * M ) );
	A.set( [ 3.0, -0.5 ], 0 + ( 2 * M ) );
	A.set( [ 6.0, 0.0 ], 1 + ( 2 * M ) );
	A.set( [ 10.0, 0.5 ], 2 + ( 2 * M ) );
	const B = new Complex128Array( P * N );
	B.set( [ 1.0, 0.0 ], 0 + ( 0 * P ) );
	B.set( [ 0.0, 0.0 ], 1 + ( 0 * P ) );
	B.set( [ 0.0, 0.0 ], 0 + ( 1 * P ) );
	B.set( [ 1.0, 0.0 ], 1 + ( 1 * P ) );
	B.set( [ 1.0, 0.5 ], 0 + ( 2 * P ) );
	B.set( [ 1.0, -0.5 ], 1 + ( 2 * P ) );

	const ALPHA = new Float64Array( N );
	const BETA = new Float64Array( N );
	const U = new Complex128Array( 1 );
	const V = new Complex128Array( 1 );
	const Q = new Complex128Array( 1 );
	const WORK = new Complex128Array( 500 );
	const RWORK = new Float64Array( 4 * N );
	const IWORK = new Int32Array( N );
	const K = new Int32Array( 1 );
	const L = new Int32Array( 1 );
	const info = zggsvd3( 'none', 'none', 'none', M, N, P, K, L, A, 1, M, 0, B, 1, P, 0, ALPHA, 1, 0, BETA, 1, 0, U, 1, 1, 0, V, 1, 1, 0, Q, 1, 1, 0, WORK, 1, 0, RWORK, 1, 0, IWORK, 1, 0 );
	assert.equal( info, tc.info );
	assert.equal( K[ 0 ], tc.k );
	assert.equal( L[ 0 ], tc.l );
	assertArrayClose( ALPHA, 0, 1, tc.alpha, N, 1e-10, 'alpha' );
	assertArrayClose( BETA, 0, 1, tc.beta, N, 1e-10, 'beta' );
});

test( 'zggsvd3: 4x4 diagonal A, 3x4 bidiagonal B', function t() {
	let sumsq, i;

	const tc = fxDiag;
	const M = 4;
	const N = 4;
	const P = 3;
	const A = new Complex128Array( M * N );
	A.set( [ 1.0, 0.0 ], 0 + ( 0 * M ) );
	A.set( [ 2.0, 0.0 ], 1 + ( 1 * M ) );
	A.set( [ 3.0, 0.0 ], 2 + ( 2 * M ) );
	A.set( [ 4.0, 0.0 ], 3 + ( 3 * M ) );
	const B = new Complex128Array( P * N );
	B.set( [ 1.0, 0.0 ], 0 + ( 0 * P ) );
	B.set( [ 1.0, 0.0 ], 0 + ( 1 * P ) );
	B.set( [ 1.0, 0.0 ], 1 + ( 1 * P ) );
	B.set( [ 1.0, 0.0 ], 1 + ( 2 * P ) );
	B.set( [ 1.0, 0.0 ], 2 + ( 2 * P ) );
	B.set( [ 1.0, 0.0 ], 2 + ( 3 * P ) );

	const ALPHA = new Float64Array( N );
	const BETA = new Float64Array( N );
	const U = new Complex128Array( M * M );
	const V = new Complex128Array( P * P );
	const Q = new Complex128Array( N * N );
	const WORK = new Complex128Array( 500 );
	const RWORK = new Float64Array( 4 * N );
	const IWORK = new Int32Array( N );
	const K = new Int32Array( 1 );
	const L = new Int32Array( 1 );
	const info = zggsvd3( 'compute-U', 'compute-V', 'compute-Q', M, N, P, K, L, A, 1, M, 0, B, 1, P, 0, ALPHA, 1, 0, BETA, 1, 0, U, 1, M, 0, V, 1, P, 0, Q, 1, N, 0, WORK, 1, 0, RWORK, 1, 0, IWORK, 1, 0 );
	assert.equal( info, tc.info );
	assert.equal( K[ 0 ], tc.k );
	assert.equal( L[ 0 ], tc.l );
	const kval = K[ 0 ];
	const lval = L[ 0 ];
	for ( i = 0; i < kval; i++ ) {
		assertClose( ALPHA[ i ], 1.0, 1e-12, 'alpha[' + i + '] = 1' );
		assertClose( BETA[ i ], 0.0, 1e-12, 'beta[' + i + '] = 0' );
	}
	for ( i = kval; i < kval + lval; i++ ) {
		sumsq = ( ALPHA[ i ] * ALPHA[ i ] ) + ( BETA[ i ] * BETA[ i ] );
		assertClose( sumsq, 1.0, 1e-10, 'alpha^2+beta^2=1 at ' + i );
	}
});
