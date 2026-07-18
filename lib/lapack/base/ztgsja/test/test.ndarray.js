/* eslint-disable no-restricted-syntax, stdlib/first-unit-test, max-len */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import ztgsja from './../lib/ndarray.js';

// FIXTURES //

import basic_3x3 from './fixtures/basic_3x3.json' with { type: 'json' };
import k0_l2 from './fixtures/k0_l2.json' with { type: 'json' };
import k2_l1 from './fixtures/k2_l1.json' with { type: 'json' };
import no_uvq from './fixtures/no_uvq.json' with { type: 'json' };
import m_k_l_negative from './fixtures/m_k_l_negative.json' with { type: 'json' };
import larger_complex from './fixtures/larger_complex.json' with { type: 'json' };

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
* @param {Float64Array} actual - actual values
* @param {number} offset - offset in actual array
* @param {number} stride - stride in actual array
* @param {Array} expected - expected values
* @param {number} n - number of elements
* @param {number} tol - tolerance
* @param {string} msg - assertion message
*/
function assertArrayClose( actual, offset, stride, expected, n, tol, msg ) {
	let i;
	for ( i = 0; i < n; i++ ) {
		assertClose( actual[ offset + ( i * stride ) ], expected[ i ], tol, msg + '[' + i + ']' ); // eslint-disable-line max-len
	}
}

/**
* Sets a complex element in a Complex128Array (column-major, 0-based).
*
* @private
* @param {Complex128Array} arr - complex array
* @param {number} stride1 - row stride (complex elements)
* @param {number} stride2 - column stride (complex elements)
* @param {number} offset - offset (complex elements)
* @param {number} i - row index (0-based)
* @param {number} j - column index (0-based)
* @param {number} re - real part
* @param {number} im - imaginary part
*/
function cset( arr, stride1, stride2, offset, i, j, re, im ) {
	const idx = ( offset + ( i * stride1 ) + ( j * stride2 ) ) * 2;
	const v = reinterpret( arr, 0 );
	v[ idx ] = re;
	v[ idx + 1 ] = im;
}

// TESTS //

test( 'ztgsja: basic 3x3 with K=1, L=2', function t() {

	const tc = basic_3x3;
	const M = 3;
	const P = 2;
	const N = 3;
	const K = 1;
	const L = 2;
	const A = new Complex128Array( M * N );
	cset( A, 1, M, 0, 0, 1, 3.0, 0.5 );
	cset( A, 1, M, 0, 0, 2, 1.0, 0.25 );
	cset( A, 1, M, 0, 1, 2, 4.0, 0.0 );
	const B = new Complex128Array( P * N );
	cset( B, 1, P, 0, 0, 1, 2.0, 0.3 );
	cset( B, 1, P, 0, 0, 2, 0.5, 0.1 );
	cset( B, 1, P, 0, 1, 2, 3.0, 0.0 );
	const ALPHA = new Float64Array( N );
	const BETA = new Float64Array( N );
	const U = new Complex128Array( M * M );
	const V = new Complex128Array( P * P );
	const Q = new Complex128Array( N * N );
	const WORK = new Complex128Array( 2 * N );
	const ncycle = new Int32Array( 1 );
	const info = ztgsja( 'initialize', 'initialize', 'initialize', M, P, N, K, L, A, 1, M, 0, B, 1, P, 0, 1e-14, 1e-14, ALPHA, 1, 0, BETA, 1, 0, U, 1, M, 0, V, 1, P, 0, Q, 1, N, 0, WORK, 1, 0, ncycle ); // eslint-disable-line max-len
	assert.equal( info, tc.info );
	assert.equal( ncycle[ 0 ], tc.ncycle );
	assertArrayClose( ALPHA, 0, 1, tc.alpha, N, 1e-12, 'alpha' );
	assertArrayClose( BETA, 0, 1, tc.beta, N, 1e-12, 'beta' );
});

test( 'ztgsja: K=0, L=2', function t() {

	const tc = k0_l2;
	const M = 2;
	const P = 2;
	const N = 2;
	const K = 0;
	const L = 2;
	const A = new Complex128Array( M * N );
	cset( A, 1, M, 0, 0, 0, 5.0, 1.0 );
	cset( A, 1, M, 0, 0, 1, 2.0, 0.5 );
	cset( A, 1, M, 0, 1, 1, 3.0, 0.0 );
	const B = new Complex128Array( P * N );
	cset( B, 1, P, 0, 0, 0, 4.0, 0.0 );
	cset( B, 1, P, 0, 0, 1, 1.0, 0.25 );
	cset( B, 1, P, 0, 1, 1, 2.0, 0.0 );
	const ALPHA = new Float64Array( N );
	const BETA = new Float64Array( N );
	const U = new Complex128Array( M * M );
	const V = new Complex128Array( P * P );
	const Q = new Complex128Array( N * N );
	const WORK = new Complex128Array( 2 * N );
	const ncycle = new Int32Array( 1 );
	const info = ztgsja( 'initialize', 'initialize', 'initialize', M, P, N, K, L, A, 1, M, 0, B, 1, P, 0, 1e-14, 1e-14, ALPHA, 1, 0, BETA, 1, 0, U, 1, M, 0, V, 1, P, 0, Q, 1, N, 0, WORK, 1, 0, ncycle ); // eslint-disable-line max-len
	assert.equal( info, tc.info );
	assertArrayClose( ALPHA, 0, 1, tc.alpha, N, 1e-12, 'alpha' );
	assertArrayClose( BETA, 0, 1, tc.beta, N, 1e-12, 'beta' );
});

test( 'ztgsja: K=2, L=1', function t() {

	const tc = k2_l1;
	const M = 4;
	const P = 2;
	const N = 4;
	const K = 2;
	const L = 1;
	const A = new Complex128Array( M * N );
	cset( A, 1, M, 0, 0, 2, 1.0, 0.0 );
	cset( A, 1, M, 0, 1, 3, 2.0, 0.5 );
	cset( A, 1, M, 0, 2, 3, 5.0, 0.0 );
	const B = new Complex128Array( P * N );
	cset( B, 1, P, 0, 0, 3, 3.0, 0.0 );
	const ALPHA = new Float64Array( N );
	const BETA = new Float64Array( N );
	const U = new Complex128Array( M * M );
	const V = new Complex128Array( P * P );
	const Q = new Complex128Array( N * N );
	const WORK = new Complex128Array( 2 * N );
	const ncycle = new Int32Array( 1 );
	const info = ztgsja( 'initialize', 'initialize', 'initialize', M, P, N, K, L, A, 1, M, 0, B, 1, P, 0, 1e-14, 1e-14, ALPHA, 1, 0, BETA, 1, 0, U, 1, M, 0, V, 1, P, 0, Q, 1, N, 0, WORK, 1, 0, ncycle ); // eslint-disable-line max-len
	assert.equal( info, tc.info );
	assertArrayClose( ALPHA, 0, 1, tc.alpha, N, 1e-12, 'alpha' );
	assertArrayClose( BETA, 0, 1, tc.beta, N, 1e-12, 'beta' );
});

test( 'ztgsja: no U/V/Q', function t() {

	const tc = no_uvq;
	const M = 2;
	const P = 2;
	const N = 2;
	const K = 0;
	const L = 2;
	const A = new Complex128Array( M * N );
	cset( A, 1, M, 0, 0, 0, 5.0, 1.0 );
	cset( A, 1, M, 0, 0, 1, 2.0, 0.5 );
	cset( A, 1, M, 0, 1, 1, 3.0, 0.0 );
	const B = new Complex128Array( P * N );
	cset( B, 1, P, 0, 0, 0, 4.0, 0.0 );
	cset( B, 1, P, 0, 0, 1, 1.0, 0.25 );
	cset( B, 1, P, 0, 1, 1, 2.0, 0.0 );
	const ALPHA = new Float64Array( N );
	const BETA = new Float64Array( N );
	const U = new Complex128Array( 1 );
	const V = new Complex128Array( 1 );
	const Q = new Complex128Array( 1 );
	const WORK = new Complex128Array( 2 * N );
	const ncycle = new Int32Array( 1 );
	const info = ztgsja( 'none', 'none', 'none', M, P, N, K, L, A, 1, M, 0, B, 1, P, 0, 1e-14, 1e-14, ALPHA, 1, 0, BETA, 1, 0, U, 1, 1, 0, V, 1, 1, 0, Q, 1, 1, 0, WORK, 1, 0, ncycle ); // eslint-disable-line max-len
	assert.equal( info, tc.info );
	assertArrayClose( ALPHA, 0, 1, tc.alpha, N, 1e-12, 'alpha' );
	assertArrayClose( BETA, 0, 1, tc.beta, N, 1e-12, 'beta' );
});

test( 'ztgsja: M-K-L < 0 case', function t() {

	const tc = m_k_l_negative;
	const M = 2;
	const P = 3;
	const N = 4;
	const K = 1;
	const L = 2;
	const A = new Complex128Array( M * N );
	cset( A, 1, M, 0, 0, 2, 2.0, 0.0 );
	cset( A, 1, M, 0, 0, 3, 1.0, 0.5 );
	cset( A, 1, M, 0, 1, 3, 4.0, 0.0 );
	const B = new Complex128Array( P * N );
	cset( B, 1, P, 0, 0, 2, 3.0, 0.0 );
	cset( B, 1, P, 0, 0, 3, 0.5, 0.1 );
	cset( B, 1, P, 0, 1, 3, 2.0, 0.0 );
	const ALPHA = new Float64Array( N );
	const BETA = new Float64Array( N );
	const U = new Complex128Array( M * M );
	const V = new Complex128Array( P * P );
	const Q = new Complex128Array( N * N );
	const WORK = new Complex128Array( 2 * N );
	const ncycle = new Int32Array( 1 );
	const info = ztgsja( 'initialize', 'initialize', 'initialize', M, P, N, K, L, A, 1, M, 0, B, 1, P, 0, 1e-14, 1e-14, ALPHA, 1, 0, BETA, 1, 0, U, 1, M, 0, V, 1, P, 0, Q, 1, N, 0, WORK, 1, 0, ncycle ); // eslint-disable-line max-len
	assert.equal( info, tc.info );
	assertArrayClose( ALPHA, 0, 1, tc.alpha, N, 1e-12, 'alpha' );
	assertArrayClose( BETA, 0, 1, tc.beta, N, 1e-12, 'beta' );
});

test( 'ztgsja: larger complex with K=1, L=3', function t() {

	const tc = larger_complex;
	const M = 4;
	const P = 3;
	const N = 4;
	const K = 1;
	const L = 3;
	const A = new Complex128Array( M * N );
	cset( A, 1, M, 0, 0, 1, 2.0, 0.5 );
	cset( A, 1, M, 0, 0, 2, 1.0, 0.0 );
	cset( A, 1, M, 0, 0, 3, 0.5, 0.3 );
	cset( A, 1, M, 0, 1, 2, 3.0, 0.0 );
	cset( A, 1, M, 0, 1, 3, 1.0, 0.2 );
	cset( A, 1, M, 0, 2, 3, 4.0, 0.0 );
	const B = new Complex128Array( P * N );
	cset( B, 1, P, 0, 0, 1, 1.0, 0.0 );
	cset( B, 1, P, 0, 0, 2, 0.5, 0.1 );
	cset( B, 1, P, 0, 0, 3, 0.2, 0.0 );
	cset( B, 1, P, 0, 1, 2, 2.0, 0.0 );
	cset( B, 1, P, 0, 1, 3, 0.3, 0.15 );
	cset( B, 1, P, 0, 2, 3, 1.5, 0.0 );
	const ALPHA = new Float64Array( N );
	const BETA = new Float64Array( N );
	const U = new Complex128Array( M * M );
	const V = new Complex128Array( P * P );
	const Q = new Complex128Array( N * N );
	const WORK = new Complex128Array( 2 * N );
	const ncycle = new Int32Array( 1 );
	const info = ztgsja( 'initialize', 'initialize', 'initialize', M, P, N, K, L, A, 1, M, 0, B, 1, P, 0, 1e-14, 1e-14, ALPHA, 1, 0, BETA, 1, 0, U, 1, M, 0, V, 1, P, 0, Q, 1, N, 0, WORK, 1, 0, ncycle ); // eslint-disable-line max-len
	assert.equal( info, tc.info );
	assert.equal( ncycle[ 0 ], tc.ncycle );
	assertArrayClose( ALPHA, 0, 1, tc.alpha, N, 1e-12, 'alpha' );
	assertArrayClose( BETA, 0, 1, tc.beta, N, 1e-12, 'beta' );
});
