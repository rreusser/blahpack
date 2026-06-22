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
import workspace_query from './fixtures/workspace_query.json' with { type: 'json' };

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
	var relErr = Math.abs( actual - expected ) / Math.max( Math.abs( expected ), 1.0 ); // eslint-disable-line max-len
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
	var i;
	for ( i = 0; i < n; i++ ) {
		assertClose( actual[ offset + ( i * stride ) ], expected[ i ], tol, msg + '[' + i + ']' ); // eslint-disable-line max-len
	}
}

// TESTS //

test( 'dggsvd3: basic 3x3 A, 2x3 B', function t() {
	var ALPHA;
	var IWORK;
	var BETA;
	var WORK;
	var info;
	var tc;
	var M;
	var N;
	var P;
	var A;
	var B;
	var U;
	var V;
	var Q;
	var K;
	var L;

	tc = basic_3x3_2x3;
	M = 3;
	N = 3;
	P = 2;
	A = new Float64Array( M * N );
	A[ 0 + 0*M ] = 1.0;
	A[ 0 + 1*M ] = 2.0;
	A[ 0 + 2*M ] = 3.0;
	A[ 1 + 0*M ] = 4.0;
	A[ 1 + 1*M ] = 5.0;
	A[ 1 + 2*M ] = 6.0;
	A[ 2 + 0*M ] = 7.0;
	A[ 2 + 1*M ] = 8.0;
	A[ 2 + 2*M ] = 10.0;
	B = new Float64Array( P * N );
	B[ 0 + 0*P ] = 1.0;
	B[ 0 + 1*P ] = 0.0;
	B[ 0 + 2*P ] = 1.0;
	B[ 1 + 0*P ] = 0.0;
	B[ 1 + 1*P ] = 1.0;
	B[ 1 + 2*P ] = 1.0;
	ALPHA = new Float64Array( N );
	BETA = new Float64Array( N );
	U = new Float64Array( M * M );
	V = new Float64Array( P * P );
	Q = new Float64Array( N * N );
	WORK = new Float64Array( 200 );
	IWORK = new Int32Array( N );
	K = new Int32Array( 1 );
	L = new Int32Array( 1 );
	info = dggsvd3( 'compute-U', 'compute-V', 'compute-Q', M, N, P, K, L, A, 1, M, 0, B, 1, P, 0, ALPHA, 1, 0, BETA, 1, 0, U, 1, M, 0, V, 1, P, 0, Q, 1, N, 0, WORK, 1, 0, 200, IWORK, 1, 0 );
	assert.equal( info, tc.info );
	assert.equal( K[ 0 ], tc.k );
	assert.equal( L[ 0 ], tc.l );
	assertArrayClose( ALPHA, 0, 1, tc.alpha, N, 1e-2, 'alpha' );
	assertArrayClose( BETA, 0, 1, tc.beta, N, 1e-2, 'beta' );
});

test( 'dggsvd3: 2x3 A, 3x3 B', function t() {
	var ALPHA;
	var IWORK;
	var BETA;
	var WORK;
	var info;
	var tc;
	var M;
	var N;
	var P;
	var A;
	var B;
	var U;
	var V;
	var Q;
	var K;
	var L;

	tc = _2x3_3x3;
	M = 2;
	N = 3;
	P = 3;
	A = new Float64Array( M * N );
	A[ 0 + 0*M ] = 2.0;
	A[ 0 + 1*M ] = 1.0;
	A[ 0 + 2*M ] = 0.0;
	A[ 1 + 0*M ] = 0.0;
	A[ 1 + 1*M ] = 3.0;
	A[ 1 + 2*M ] = 1.0;
	B = new Float64Array( P * N );
	B[ 0 + 0*P ] = 1.0;
	B[ 0 + 1*P ] = 2.0;
	B[ 0 + 2*P ] = 3.0;
	B[ 1 + 0*P ] = 4.0;
	B[ 1 + 1*P ] = 5.0;
	B[ 1 + 2*P ] = 6.0;
	B[ 2 + 0*P ] = 7.0;
	B[ 2 + 1*P ] = 8.0;
	B[ 2 + 2*P ] = 10.0;
	ALPHA = new Float64Array( N );
	BETA = new Float64Array( N );
	U = new Float64Array( M * M );
	V = new Float64Array( P * P );
	Q = new Float64Array( N * N );
	WORK = new Float64Array( 200 );
	IWORK = new Int32Array( N );
	K = new Int32Array( 1 );
	L = new Int32Array( 1 );
	info = dggsvd3( 'compute-U', 'compute-V', 'compute-Q', M, N, P, K, L, A, 1, M, 0, B, 1, P, 0, ALPHA, 1, 0, BETA, 1, 0, U, 1, M, 0, V, 1, P, 0, Q, 1, N, 0, WORK, 1, 0, 200, IWORK, 1, 0 );
	assert.equal( info, tc.info );
	assert.equal( K[ 0 ], tc.k );
	assert.equal( L[ 0 ], tc.l );
	assertArrayClose( ALPHA, 0, 1, tc.alpha, N, 1e-2, 'alpha' );
	assertArrayClose( BETA, 0, 1, tc.beta, N, 1e-2, 'beta' );
});

test( 'dggsvd3: no U/V/Q', function t() {
	var ALPHA;
	var IWORK;
	var BETA;
	var WORK;
	var info;
	var tc;
	var M;
	var N;
	var P;
	var A;
	var B;
	var U;
	var V;
	var Q;
	var K;
	var L;

	tc = no_uvq;
	M = 3;
	N = 3;
	P = 2;
	A = new Float64Array( M * N );
	A[ 0 + 0*M ] = 1.0;
	A[ 0 + 1*M ] = 2.0;
	A[ 0 + 2*M ] = 3.0;
	A[ 1 + 0*M ] = 4.0;
	A[ 1 + 1*M ] = 5.0;
	A[ 1 + 2*M ] = 6.0;
	A[ 2 + 0*M ] = 7.0;
	A[ 2 + 1*M ] = 8.0;
	A[ 2 + 2*M ] = 10.0;
	B = new Float64Array( P * N );
	B[ 0 + 0*P ] = 1.0;
	B[ 0 + 1*P ] = 0.0;
	B[ 0 + 2*P ] = 1.0;
	B[ 1 + 0*P ] = 0.0;
	B[ 1 + 1*P ] = 1.0;
	B[ 1 + 2*P ] = 1.0;
	ALPHA = new Float64Array( N );
	BETA = new Float64Array( N );
	U = new Float64Array( 1 );
	V = new Float64Array( 1 );
	Q = new Float64Array( 1 );
	WORK = new Float64Array( 200 );
	IWORK = new Int32Array( N );
	K = new Int32Array( 1 );
	L = new Int32Array( 1 );
	info = dggsvd3( 'none', 'none', 'none', M, N, P, K, L, A, 1, M, 0, B, 1, P, 0, ALPHA, 1, 0, BETA, 1, 0, U, 1, 1, 0, V, 1, 1, 0, Q, 1, 1, 0, WORK, 1, 0, 200, IWORK, 1, 0 );
	assert.equal( info, tc.info );
	assert.equal( K[ 0 ], tc.k );
	assert.equal( L[ 0 ], tc.l );
	assertArrayClose( ALPHA, 0, 1, tc.alpha, N, 1e-2, 'alpha' );
	assertArrayClose( BETA, 0, 1, tc.beta, N, 1e-2, 'beta' );
});

test( 'dggsvd3: diagonal 4x4 A, 3x4 B', function t() {
	var ALPHA;
	var IWORK;
	var BETA;
	var WORK;
	var info;
	var kval;
	var lval;
	var tc;
	var M;
	var N;
	var P;
	var A;
	var B;
	var U;
	var V;
	var Q;
	var K;
	var L;
	var i;

	tc = diag_4x4;
	M = 4;
	N = 4;
	P = 3;
	A = new Float64Array( M * N );
	A[ 0 + 0*M ] = 1.0;
	A[ 1 + 1*M ] = 2.0;
	A[ 2 + 2*M ] = 3.0;
	A[ 3 + 3*M ] = 4.0;
	B = new Float64Array( P * N );
	B[ 0 + 0*P ] = 1.0;
	B[ 0 + 1*P ] = 1.0;
	B[ 1 + 1*P ] = 1.0;
	B[ 1 + 2*P ] = 1.0;
	B[ 2 + 2*P ] = 1.0;
	B[ 2 + 3*P ] = 1.0;
	ALPHA = new Float64Array( N );
	BETA = new Float64Array( N );
	U = new Float64Array( M * M );
	V = new Float64Array( P * P );
	Q = new Float64Array( N * N );
	WORK = new Float64Array( 200 );
	IWORK = new Int32Array( N );
	K = new Int32Array( 1 );
	L = new Int32Array( 1 );
	info = dggsvd3( 'compute-U', 'compute-V', 'compute-Q', M, N, P, K, L, A, 1, M, 0, B, 1, P, 0, ALPHA, 1, 0, BETA, 1, 0, U, 1, M, 0, V, 1, P, 0, Q, 1, N, 0, WORK, 1, 0, 200, IWORK, 1, 0 );
	assert.equal( info, tc.info );
	assert.equal( K[ 0 ], tc.k );
	assert.equal( L[ 0 ], tc.l );
	kval = K[ 0 ];
	lval = L[ 0 ];
	for ( i = 0; i < kval; i++ ) {
		assertClose( ALPHA[ i ], 1.0, 1e-12, 'alpha[' + i + '] = 1' );
		assertClose( BETA[ i ], 0.0, 1e-12, 'beta[' + i + '] = 0' );
	}
	for ( i = kval; i < kval + lval; i++ ) {
		var sumsq = ( ALPHA[ i ] * ALPHA[ i ] ) + ( BETA[ i ] * BETA[ i ] );
		assertClose( sumsq, 1.0, 1e-10, 'alpha^2+beta^2=1 at ' + i );
	}
});

test( 'dggsvd3: workspace query', function t() {
	var ALPHA;
	var IWORK;
	var BETA;
	var WORK;
	var info;
	var tc;
	var M;
	var N;
	var P;
	var A;
	var B;
	var U;
	var V;
	var Q;
	var K;
	var L;

	tc = workspace_query;
	M = 3;
	N = 3;
	P = 2;
	A = new Float64Array( M * N );
	B = new Float64Array( P * N );
	ALPHA = new Float64Array( N );
	BETA = new Float64Array( N );
	U = new Float64Array( M * M );
	V = new Float64Array( P * P );
	Q = new Float64Array( N * N );
	WORK = new Float64Array( 200 );
	IWORK = new Int32Array( N );
	K = new Int32Array( 1 );
	L = new Int32Array( 1 );
	info = dggsvd3( 'compute-U', 'compute-V', 'compute-Q', M, N, P, K, L, A, 1, M, 0, B, 1, P, 0, ALPHA, 1, 0, BETA, 1, 0, U, 1, M, 0, V, 1, P, 0, Q, 1, N, 0, WORK, 1, 0, -1, IWORK, 1, 0 );
	assert.equal( info, tc.info );
	assert.ok( WORK[ 0 ] >= 1, 'optimal lwork >= 1' );
});
