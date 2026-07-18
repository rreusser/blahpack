/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dspr2 from './../lib/ndarray.js';

// FIXTURES //

import upper_basic from './fixtures/upper_basic.json' with { type: 'json' };
import lower_basic from './fixtures/lower_basic.json' with { type: 'json' };
import upper_alpha from './fixtures/upper_alpha.json' with { type: 'json' };
import lower_alpha from './fixtures/lower_alpha.json' with { type: 'json' };
import n_zero from './fixtures/n_zero.json' with { type: 'json' };
import alpha_zero from './fixtures/alpha_zero.json' with { type: 'json' };
import n_one from './fixtures/n_one.json' with { type: 'json' };
import upper_stride from './fixtures/upper_stride.json' with { type: 'json' };
import lower_stride from './fixtures/lower_stride.json' with { type: 'json' };
import upper_4x4 from './fixtures/upper_4x4.json' with { type: 'json' };
import lower_4x4 from './fixtures/lower_4x4.json' with { type: 'json' };
import upper_zeros from './fixtures/upper_zeros.json' with { type: 'json' };

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
* @param {*} expected - expected value
* @param {number} tol - tolerance
* @param {string} msg - assertion message
*/
function assertArrayClose( actual, expected, tol, msg ) {
	let i;
	assert.equal( actual.length, expected.length, msg + ': length mismatch' );
	for ( i = 0; i < expected.length; i++ ) {
		assertClose( actual[ i ], expected[ i ], tol, msg + '[' + i + ']' );
	}
}

// TESTS //

test( 'dspr2: upper_basic (uplo=U, N=3, alpha=1, unit strides)', function t() {
	const tc = upper_basic;
	const AP = new Float64Array( [ 1, 2, 5, 3, 6, 9 ] );
	const x = new Float64Array( [ 1, 2, 3 ] );
	const y = new Float64Array( [ 4, 5, 6 ] );

	dspr2( 'upper', 3, 1.0, x, 1, 0, y, 1, 0, AP, 1, 0 );
	assertArrayClose( AP, tc.AP, 1e-14, 'AP' );
});

test( 'dspr2: lower_basic (uplo=L, N=3, alpha=1, unit strides)', function t() {
	const tc = lower_basic;
	const AP = new Float64Array( [ 1, 2, 3, 5, 6, 9 ] );
	const x = new Float64Array( [ 1, 2, 3 ] );
	const y = new Float64Array( [ 4, 5, 6 ] );

	dspr2( 'lower', 3, 1.0, x, 1, 0, y, 1, 0, AP, 1, 0 );
	assertArrayClose( AP, tc.AP, 1e-14, 'AP' );
});

test( 'dspr2: upper_alpha (uplo=U, N=3, alpha=2.5)', function t() {
	const tc = upper_alpha;
	const AP = new Float64Array( [ 1, 2, 5, 3, 6, 9 ] );
	const x = new Float64Array( [ 1, 2, 3 ] );
	const y = new Float64Array( [ 0.5, 1.5, 2.5 ] );

	dspr2( 'upper', 3, 2.5, x, 1, 0, y, 1, 0, AP, 1, 0 );
	assertArrayClose( AP, tc.AP, 1e-14, 'AP' );
});

test( 'dspr2: lower_alpha (uplo=L, N=3, alpha=0.5)', function t() {
	const tc = lower_alpha;
	const AP = new Float64Array( [ 1, 2, 3, 5, 6, 9 ] );
	const x = new Float64Array( [ 2, 3, 4 ] );
	const y = new Float64Array( [ 1, -1, 2 ] );

	dspr2( 'lower', 3, 0.5, x, 1, 0, y, 1, 0, AP, 1, 0 );
	assertArrayClose( AP, tc.AP, 1e-14, 'AP' );
});

test( 'dspr2: n_zero (quick return)', function t() {
	const tc = n_zero;
	const AP = new Float64Array( [ 99 ] );
	const x = new Float64Array( [ 2 ] );
	const y = new Float64Array( [ 1 ] );

	dspr2( 'upper', 0, 1.0, x, 1, 0, y, 1, 0, AP, 1, 0 );
	assertArrayClose( AP, tc.AP, 1e-14, 'AP' );
});

test( 'dspr2: alpha_zero (quick return)', function t() {
	const tc = alpha_zero;
	const AP = new Float64Array( [ 99 ] );
	const x = new Float64Array( [ 2 ] );
	const y = new Float64Array( [ 1 ] );

	dspr2( 'upper', 3, 0.0, x, 1, 0, y, 1, 0, AP, 1, 0 );
	assertArrayClose( AP, tc.AP, 1e-14, 'AP' );
});

test( 'dspr2: n_one (N=1)', function t() {
	const tc = n_one;
	const AP = new Float64Array( [ 5 ] );
	const x = new Float64Array( [ 3 ] );
	const y = new Float64Array( [ 2 ] );

	dspr2( 'upper', 1, 1.0, x, 1, 0, y, 1, 0, AP, 1, 0 );
	assertArrayClose( AP, tc.AP, 1e-14, 'AP' );
});

test( 'dspr2: upper_stride (uplo=U, N=3, incx=2, incy=2)', function t() {
	const tc = upper_stride;
	const AP = new Float64Array( [ 1, 2, 5, 3, 6, 9 ] );
	const x = new Float64Array( [ 1, 0, 2, 0, 3, 0 ] );
	const y = new Float64Array( [ 4, 0, 5, 0, 6, 0 ] );

	dspr2( 'upper', 3, 1.0, x, 2, 0, y, 2, 0, AP, 1, 0 );
	assertArrayClose( AP, tc.AP, 1e-14, 'AP' );
});

test( 'dspr2: lower_stride (uplo=L, N=3, incx=2, incy=3)', function t() {
	const tc = lower_stride;
	const AP = new Float64Array( [ 1, 2, 3, 5, 6, 9 ] );
	const x = new Float64Array( [ 1, 0, 2, 0, 3, 0 ] );
	const y = new Float64Array( [ 4, 0, 0, 5, 0, 0, 6, 0, 0 ] );

	dspr2( 'lower', 3, 1.0, x, 2, 0, y, 3, 0, AP, 1, 0 );
	assertArrayClose( AP, tc.AP, 1e-14, 'AP' );
});

test( 'dspr2: upper_4x4 (uplo=U, N=4)', function t() {
	const tc = upper_4x4;
	const AP = new Float64Array( [ 1, 2, 5, 3, 6, 8, 4, 7, 9, 10 ] );
	const x = new Float64Array( [ 1, -1, 2, -2 ] );
	const y = new Float64Array( [ 3, 0.5, -1, 1.5 ] );

	dspr2( 'upper', 4, 1.0, x, 1, 0, y, 1, 0, AP, 1, 0 );
	assertArrayClose( AP, tc.AP, 1e-14, 'AP' );
});

test( 'dspr2: lower_4x4 (uplo=L, N=4)', function t() {
	const tc = lower_4x4;
	const AP = new Float64Array( [ 1, 2, 3, 4, 5, 6, 7, 8, 9, 10 ] );
	const x = new Float64Array( [ 1, -1, 2, -2 ] );
	const y = new Float64Array( [ 3, 0.5, -1, 1.5 ] );

	dspr2( 'lower', 4, 1.0, x, 1, 0, y, 1, 0, AP, 1, 0 );
	assertArrayClose( AP, tc.AP, 1e-14, 'AP' );
});

test( 'dspr2: upper_zeros (skip branch when x[j]=0 and y[j]=0)', function t() {
	const tc = upper_zeros;
	const AP = new Float64Array( [ 1, 2, 5, 3, 6, 9 ] );
	const x = new Float64Array( [ 0, 2, 0 ] );
	const y = new Float64Array( [ 0, 5, 0 ] );

	dspr2( 'upper', 3, 1.0, x, 1, 0, y, 1, 0, AP, 1, 0 );
	assertArrayClose( AP, tc.AP, 1e-14, 'AP' );
});

test( 'dspr2: returns AP', function t() {

	const AP = new Float64Array( [ 1 ] );
	const x = new Float64Array( [ 1 ] );
	const y = new Float64Array( [ 1 ] );
	const result = dspr2( 'upper', 1, 1.0, x, 1, 0, y, 1, 0, AP, 1, 0 );
	assert.equal( result, AP );
});
