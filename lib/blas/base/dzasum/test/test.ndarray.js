/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import dzasum from './../lib/ndarray.js';

// FIXTURES //

import basic from './fixtures/basic.json' with { type: 'json' };
import n_zero from './fixtures/n_zero.json' with { type: 'json' };
import n_one from './fixtures/n_one.json' with { type: 'json' };
import stride2 from './fixtures/stride2.json' with { type: 'json' };

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

// TESTS //

test( 'dzasum: basic', function t() {
	var result;
	var tc;
	var zx;

	tc = basic;
	zx = new Complex128Array( [ 1.0, 2.0, 3.0, -4.0, -5.0, 6.0 ] );
	result = dzasum( 3, zx, 1, 0 );
	assertClose( result, tc.result, 1e-14, 'result' );
});

test( 'dzasum: n_zero', function t() {
	var result;
	var tc;
	var zx;

	tc = n_zero;
	zx = new Complex128Array( [ 1.0, 2.0, 3.0, -4.0, -5.0, 6.0 ] );
	result = dzasum( 0, zx, 1, 0 );
	assertClose( result, tc.result, 1e-14, 'result' );
});

test( 'dzasum: n_one', function t() {
	var result;
	var tc;
	var zx;

	tc = n_one;
	zx = new Complex128Array( [ 3.0, 4.0 ] );
	result = dzasum( 1, zx, 1, 0 );
	assertClose( result, tc.result, 1e-14, 'result' );
});

test( 'dzasum: stride2', function t() {
	var result;
	var tc;
	var zx;

	tc = stride2;
	zx = new Complex128Array( [ 1.0, 1.0, 99.0, 99.0, 2.0, 3.0 ] );
	result = dzasum( 2, zx, 2, 0 );
	assertClose( result, tc.result, 1e-14, 'result' );
});
