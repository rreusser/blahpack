/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import dtgsja from './../lib/ndarray.js';

// FIXTURES //

import basic_3x3 from './fixtures/basic_3x3.json' with { type: 'json' };
import k0_l2 from './fixtures/k0_l2.json' with { type: 'json' };
import k2_l1 from './fixtures/k2_l1.json' with { type: 'json' };
import no_uvq from './fixtures/no_uvq.json' with { type: 'json' };
import m_k_l_negative from './fixtures/m_k_l_negative.json' with { type: 'json' };

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

test( 'dtgsja: basic 3x3 with K=1, L=2', function t() {
	var ncycle;
	var ALPHA;
	var BETA;
	var WORK;
	var info;
	var tc;
	var M;
	var P;
	var N;
	var K;
	var L;
	var A;
	var B;
	var U;
	var V;
	var Q;

	tc = basic_3x3;
	M = 3;
	P = 2;
	N = 3;
	K = 1;
	L = 2;
	A = new Float64Array( M * N );
	A[ 0 + 0*M ] = 0.0;
	A[ 0 + 1*M ] = 3.0;
	A[ 0 + 2*M ] = 1.0;
	A[ 1 + 0*M ] = 0.0;
	A[ 1 + 1*M ] = 0.0;
	A[ 1 + 2*M ] = 4.0;
	A[ 2 + 0*M ] = 0.0;
	A[ 2 + 1*M ] = 0.0;
	A[ 2 + 2*M ] = 0.0;
	B = new Float64Array( P * N );
	B[ 0 + 0*P ] = 0.0;
	B[ 0 + 1*P ] = 2.0;
	B[ 0 + 2*P ] = 0.5;
	B[ 1 + 0*P ] = 0.0;
	B[ 1 + 1*P ] = 0.0;
	B[ 1 + 2*P ] = 3.0;
	ALPHA = new Float64Array( N );
	BETA = new Float64Array( N );
	U = new Float64Array( M * M );
	V = new Float64Array( P * P );
	Q = new Float64Array( N * N );
	WORK = new Float64Array( 2 * N );
	ncycle = new Int32Array( 1 );
	info = dtgsja( 'initialize', 'initialize', 'initialize', M, P, N, K, L, A, 1, M, 0, B, 1, P, 0, 1e-14, 1e-14, ALPHA, 1, 0, BETA, 1, 0, U, 1, M, 0, V, 1, P, 0, Q, 1, N, 0, WORK, 1, 0, ncycle );
	assert.equal( info, tc.info );
	assert.equal( ncycle[ 0 ], tc.ncycle );
	assertArrayClose( ALPHA, 0, 1, tc.alpha, N, 1e-12, 'alpha' );
	assertArrayClose( BETA, 0, 1, tc.beta, N, 1e-12, 'beta' );
});

test( 'dtgsja: K=0, L=2', function t() {
	var ncycle;
	var ALPHA;
	var BETA;
	var WORK;
	var info;
	var tc;
	var M;
	var P;
	var N;
	var K;
	var L;
	var A;
	var B;
	var U;
	var V;
	var Q;

	tc = k0_l2;
	M = 2;
	P = 2;
	N = 2;
	K = 0;
	L = 2;
	A = new Float64Array( M * N );
	A[ 0 + 0*M ] = 5.0;
	A[ 0 + 1*M ] = 2.0;
	A[ 1 + 0*M ] = 0.0;
	A[ 1 + 1*M ] = 3.0;
	B = new Float64Array( P * N );
	B[ 0 + 0*P ] = 4.0;
	B[ 0 + 1*P ] = 1.0;
	B[ 1 + 0*P ] = 0.0;
	B[ 1 + 1*P ] = 2.0;
	ALPHA = new Float64Array( N );
	BETA = new Float64Array( N );
	U = new Float64Array( M * M );
	V = new Float64Array( P * P );
	Q = new Float64Array( N * N );
	WORK = new Float64Array( 2 * N );
	ncycle = new Int32Array( 1 );
	info = dtgsja( 'initialize', 'initialize', 'initialize', M, P, N, K, L, A, 1, M, 0, B, 1, P, 0, 1e-14, 1e-14, ALPHA, 1, 0, BETA, 1, 0, U, 1, M, 0, V, 1, P, 0, Q, 1, N, 0, WORK, 1, 0, ncycle );
	assert.equal( info, tc.info );
	assertArrayClose( ALPHA, 0, 1, tc.alpha, N, 1e-12, 'alpha' );
	assertArrayClose( BETA, 0, 1, tc.beta, N, 1e-12, 'beta' );
});

test( 'dtgsja: K=2, L=1', function t() {
	var ncycle;
	var ALPHA;
	var BETA;
	var WORK;
	var info;
	var tc;
	var M;
	var P;
	var N;
	var K;
	var L;
	var A;
	var B;
	var U;
	var V;
	var Q;

	tc = k2_l1;
	M = 4;
	P = 2;
	N = 4;
	K = 2;
	L = 1;
	A = new Float64Array( M * N );
	A[ 0 + 2*M ] = 1.0;
	A[ 1 + 3*M ] = 2.0;
	A[ 2 + 3*M ] = 5.0;
	B = new Float64Array( P * N );
	B[ 0 + 3*P ] = 3.0;
	ALPHA = new Float64Array( N );
	BETA = new Float64Array( N );
	U = new Float64Array( M * M );
	V = new Float64Array( P * P );
	Q = new Float64Array( N * N );
	WORK = new Float64Array( 2 * N );
	ncycle = new Int32Array( 1 );
	info = dtgsja( 'initialize', 'initialize', 'initialize', M, P, N, K, L, A, 1, M, 0, B, 1, P, 0, 1e-14, 1e-14, ALPHA, 1, 0, BETA, 1, 0, U, 1, M, 0, V, 1, P, 0, Q, 1, N, 0, WORK, 1, 0, ncycle );
	assert.equal( info, tc.info );
	assertArrayClose( ALPHA, 0, 1, tc.alpha, N, 1e-12, 'alpha' );
	assertArrayClose( BETA, 0, 1, tc.beta, N, 1e-12, 'beta' );
});

test( 'dtgsja: no U/V/Q', function t() {
	var ncycle;
	var ALPHA;
	var BETA;
	var WORK;
	var info;
	var tc;
	var M;
	var P;
	var N;
	var K;
	var L;
	var A;
	var B;
	var U;
	var V;
	var Q;

	tc = no_uvq;
	M = 2;
	P = 2;
	N = 2;
	K = 0;
	L = 2;
	A = new Float64Array( M * N );
	A[ 0 + 0*M ] = 5.0;
	A[ 0 + 1*M ] = 2.0;
	A[ 1 + 0*M ] = 0.0;
	A[ 1 + 1*M ] = 3.0;
	B = new Float64Array( P * N );
	B[ 0 + 0*P ] = 4.0;
	B[ 0 + 1*P ] = 1.0;
	B[ 1 + 0*P ] = 0.0;
	B[ 1 + 1*P ] = 2.0;
	ALPHA = new Float64Array( N );
	BETA = new Float64Array( N );
	U = new Float64Array( 1 );
	V = new Float64Array( 1 );
	Q = new Float64Array( 1 );
	WORK = new Float64Array( 2 * N );
	ncycle = new Int32Array( 1 );
	info = dtgsja( 'none', 'none', 'none', M, P, N, K, L, A, 1, M, 0, B, 1, P, 0, 1e-14, 1e-14, ALPHA, 1, 0, BETA, 1, 0, U, 1, 1, 0, V, 1, 1, 0, Q, 1, 1, 0, WORK, 1, 0, ncycle );
	assert.equal( info, tc.info );
	assertArrayClose( ALPHA, 0, 1, tc.alpha, N, 1e-12, 'alpha' );
	assertArrayClose( BETA, 0, 1, tc.beta, N, 1e-12, 'beta' );
});

test( 'dtgsja: M-K-L < 0 case', function t() {
	var ncycle;
	var ALPHA;
	var BETA;
	var WORK;
	var info;
	var tc;
	var M;
	var P;
	var N;
	var K;
	var L;
	var A;
	var B;
	var U;
	var V;
	var Q;

	tc = m_k_l_negative;
	M = 2;
	P = 3;
	N = 4;
	K = 1;
	L = 2;
	A = new Float64Array( M * N );
	A[ 0 + 2*M ] = 2.0;
	A[ 0 + 3*M ] = 1.0;
	A[ 1 + 3*M ] = 4.0;
	B = new Float64Array( P * N );
	B[ 0 + 2*P ] = 3.0;
	B[ 0 + 3*P ] = 0.5;
	B[ 1 + 3*P ] = 2.0;
	ALPHA = new Float64Array( N );
	BETA = new Float64Array( N );
	U = new Float64Array( M * M );
	V = new Float64Array( P * P );
	Q = new Float64Array( N * N );
	WORK = new Float64Array( 2 * N );
	ncycle = new Int32Array( 1 );
	info = dtgsja( 'initialize', 'initialize', 'initialize', M, P, N, K, L, A, 1, M, 0, B, 1, P, 0, 1e-14, 1e-14, ALPHA, 1, 0, BETA, 1, 0, U, 1, M, 0, V, 1, P, 0, Q, 1, N, 0, WORK, 1, 0, ncycle );
	assert.equal( info, tc.info );
	assertArrayClose( ALPHA, 0, 1, tc.alpha, N, 1e-12, 'alpha' );
	assertArrayClose( BETA, 0, 1, tc.beta, N, 1e-12, 'beta' );
});
