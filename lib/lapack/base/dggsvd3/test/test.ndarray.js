/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import dggsvd3 from './../lib/ndarray.js';

// FIXTURES //

import basic_3x3_2x3 from './fixtures/basic_3x3_2x3.json' with { type: 'json' };
import _2x3_3x3 from './fixtures/2x3_3x3.json' with { type: 'json' };
import no_uvq from './fixtures/no_uvq.json' with { type: 'json' };
import diag_4x4 from './fixtures/diag_4x4.json' with { type: 'json' };

// FUNCTIONS //

/**
* Asserts that two numbers are approximately equal.
*
* @private
* @param {*} actual - actual value
* @param {*} expected - expected value
* @param {number} tol - tolerance
* @param {string} msg - assertion message
*/
function assertClose( actual, expected, tol, msg ) {
	const relErr = Math.abs( actual - expected ) / Math.max( Math.abs( expected ), 1.0 ); // eslint-disable-line max-len
	assert.ok( relErr <= tol, msg + ': expected ' + expected + ', got ' + actual );
}

/**
* Asserts that two arrays are element-wise approximately equal.
*
* @private
* @param {*} actual - actual value
* @param {*} offset - offset
* @param {*} stride - stride
* @param {*} expected - expected value
* @param {*} n - n
* @param {number} tol - tolerance
* @param {string} msg - assertion message
*/
function assertArrayClose( actual, offset, stride, expected, n, tol, msg ) {
	let i;
	for ( i = 0; i < n; i++ ) {
		assertClose( actual[ offset + ( i * stride ) ], expected[ i ], tol, msg + '[' + i + ']' ); // eslint-disable-line max-len
	}
}

// TESTS //

test( 'dggsvd3: basic 3x3 A, 2x3 B', function t() {

	const tc = basic_3x3_2x3;
	const M = 3;
	const N = 3;
	const P = 2;
	const A = new Float64Array( M * N );
	A[ 0 + 0*M ] = 1.0;
	A[ 0 + 1*M ] = 2.0;
	A[ 0 + 2*M ] = 3.0;
	A[ 1 + 0*M ] = 4.0;
	A[ 1 + 1*M ] = 5.0;
	A[ 1 + 2*M ] = 6.0;
	A[ 2 + 0*M ] = 7.0;
	A[ 2 + 1*M ] = 8.0;
	A[ 2 + 2*M ] = 10.0;
	const B = new Float64Array( P * N );
	B[ 0 + 0*P ] = 1.0;
	B[ 0 + 1*P ] = 0.0;
	B[ 0 + 2*P ] = 1.0;
	B[ 1 + 0*P ] = 0.0;
	B[ 1 + 1*P ] = 1.0;
	B[ 1 + 2*P ] = 1.0;
	const ALPHA = new Float64Array( N );
	const BETA = new Float64Array( N );
	const U = new Float64Array( M * M );
	const V = new Float64Array( P * P );
	const Q = new Float64Array( N * N );
	const WORK = new Float64Array( 200 );
	const IWORK = new Int32Array( N );
	const K = new Int32Array( 1 );
	const L = new Int32Array( 1 );
	const info = dggsvd3( 'compute-U', 'compute-V', 'compute-Q', M, N, P, K, L, A, 1, M, 0, B, 1, P, 0, ALPHA, 1, 0, BETA, 1, 0, U, 1, M, 0, V, 1, P, 0, Q, 1, N, 0, WORK, 1, 0, IWORK, 1, 0 );
	assert.equal( info, tc.info );
	assert.equal( K[ 0 ], tc.k );
	assert.equal( L[ 0 ], tc.l );
	assertArrayClose( ALPHA, 0, 1, tc.alpha, N, 1e-2, 'alpha' );
	assertArrayClose( BETA, 0, 1, tc.beta, N, 1e-2, 'beta' );
});

test( 'dggsvd3: 2x3 A, 3x3 B', function t() {

	const tc = _2x3_3x3;
	const M = 2;
	const N = 3;
	const P = 3;
	const A = new Float64Array( M * N );
	A[ 0 + 0*M ] = 2.0;
	A[ 0 + 1*M ] = 1.0;
	A[ 0 + 2*M ] = 0.0;
	A[ 1 + 0*M ] = 0.0;
	A[ 1 + 1*M ] = 3.0;
	A[ 1 + 2*M ] = 1.0;
	const B = new Float64Array( P * N );
	B[ 0 + 0*P ] = 1.0;
	B[ 0 + 1*P ] = 2.0;
	B[ 0 + 2*P ] = 3.0;
	B[ 1 + 0*P ] = 4.0;
	B[ 1 + 1*P ] = 5.0;
	B[ 1 + 2*P ] = 6.0;
	B[ 2 + 0*P ] = 7.0;
	B[ 2 + 1*P ] = 8.0;
	B[ 2 + 2*P ] = 10.0;
	const ALPHA = new Float64Array( N );
	const BETA = new Float64Array( N );
	const U = new Float64Array( M * M );
	const V = new Float64Array( P * P );
	const Q = new Float64Array( N * N );
	const WORK = new Float64Array( 200 );
	const IWORK = new Int32Array( N );
	const K = new Int32Array( 1 );
	const L = new Int32Array( 1 );
	const info = dggsvd3( 'compute-U', 'compute-V', 'compute-Q', M, N, P, K, L, A, 1, M, 0, B, 1, P, 0, ALPHA, 1, 0, BETA, 1, 0, U, 1, M, 0, V, 1, P, 0, Q, 1, N, 0, WORK, 1, 0, IWORK, 1, 0 );
	assert.equal( info, tc.info );
	assert.equal( K[ 0 ], tc.k );
	assert.equal( L[ 0 ], tc.l );
	assertArrayClose( ALPHA, 0, 1, tc.alpha, N, 1e-2, 'alpha' );
	assertArrayClose( BETA, 0, 1, tc.beta, N, 1e-2, 'beta' );
});

test( 'dggsvd3: no U/V/Q', function t() {

	const tc = no_uvq;
	const M = 3;
	const N = 3;
	const P = 2;
	const A = new Float64Array( M * N );
	A[ 0 + 0*M ] = 1.0;
	A[ 0 + 1*M ] = 2.0;
	A[ 0 + 2*M ] = 3.0;
	A[ 1 + 0*M ] = 4.0;
	A[ 1 + 1*M ] = 5.0;
	A[ 1 + 2*M ] = 6.0;
	A[ 2 + 0*M ] = 7.0;
	A[ 2 + 1*M ] = 8.0;
	A[ 2 + 2*M ] = 10.0;
	const B = new Float64Array( P * N );
	B[ 0 + 0*P ] = 1.0;
	B[ 0 + 1*P ] = 0.0;
	B[ 0 + 2*P ] = 1.0;
	B[ 1 + 0*P ] = 0.0;
	B[ 1 + 1*P ] = 1.0;
	B[ 1 + 2*P ] = 1.0;
	const ALPHA = new Float64Array( N );
	const BETA = new Float64Array( N );
	const U = new Float64Array( 1 );
	const V = new Float64Array( 1 );
	const Q = new Float64Array( 1 );
	const WORK = new Float64Array( 200 );
	const IWORK = new Int32Array( N );
	const K = new Int32Array( 1 );
	const L = new Int32Array( 1 );
	const info = dggsvd3( 'none', 'none', 'none', M, N, P, K, L, A, 1, M, 0, B, 1, P, 0, ALPHA, 1, 0, BETA, 1, 0, U, 1, 1, 0, V, 1, 1, 0, Q, 1, 1, 0, WORK, 1, 0, IWORK, 1, 0 );
	assert.equal( info, tc.info );
	assert.equal( K[ 0 ], tc.k );
	assert.equal( L[ 0 ], tc.l );
	assertArrayClose( ALPHA, 0, 1, tc.alpha, N, 1e-2, 'alpha' );
	assertArrayClose( BETA, 0, 1, tc.beta, N, 1e-2, 'beta' );
});

test( 'dggsvd3: diagonal 4x4 A, 3x4 B', function t() {
	let i;

	const tc = diag_4x4;
	const M = 4;
	const N = 4;
	const P = 3;
	const A = new Float64Array( M * N );
	A[ 0 + 0*M ] = 1.0;
	A[ 1 + 1*M ] = 2.0;
	A[ 2 + 2*M ] = 3.0;
	A[ 3 + 3*M ] = 4.0;
	const B = new Float64Array( P * N );
	B[ 0 + 0*P ] = 1.0;
	B[ 0 + 1*P ] = 1.0;
	B[ 1 + 1*P ] = 1.0;
	B[ 1 + 2*P ] = 1.0;
	B[ 2 + 2*P ] = 1.0;
	B[ 2 + 3*P ] = 1.0;
	const ALPHA = new Float64Array( N );
	const BETA = new Float64Array( N );
	const U = new Float64Array( M * M );
	const V = new Float64Array( P * P );
	const Q = new Float64Array( N * N );
	const WORK = new Float64Array( 200 );
	const IWORK = new Int32Array( N );
	const K = new Int32Array( 1 );
	const L = new Int32Array( 1 );
	const info = dggsvd3( 'compute-U', 'compute-V', 'compute-Q', M, N, P, K, L, A, 1, M, 0, B, 1, P, 0, ALPHA, 1, 0, BETA, 1, 0, U, 1, M, 0, V, 1, P, 0, Q, 1, N, 0, WORK, 1, 0, IWORK, 1, 0 );
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
		const sumsq = ( ALPHA[ i ] * ALPHA[ i ] ) + ( BETA[ i ] * BETA[ i ] );
		assertClose( sumsq, 1.0, 1e-10, 'alpha^2+beta^2=1 at ' + i );
	}
});
