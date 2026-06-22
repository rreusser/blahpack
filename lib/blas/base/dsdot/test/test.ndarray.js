/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dsdot from './../lib/ndarray.js';

// FIXTURES //

import basic from './fixtures/basic.json' with { type: 'json' };
import n_zero from './fixtures/n_zero.json' with { type: 'json' };
import n_one from './fixtures/n_one.json' with { type: 'json' };
import stride from './fixtures/stride.json' with { type: 'json' };
import neg_inc from './fixtures/neg_inc.json' with { type: 'json' };

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

test( 'dsdot: basic', function t() {
	var result;
	var tc;
	var x;
	var y;

	tc = basic;
	x = new Float64Array( [ 1.0, 2.0, 3.0, 4.0, 5.0 ] );
	y = new Float64Array( [ 2.0, 3.0, 4.0, 5.0, 6.0 ] );
	result = dsdot( 5, x, 1, 0, y, 1, 0 );
	assertClose( result, tc.result, 1e-14, 'result' );
});

test( 'dsdot: n_zero', function t() {
	var result;
	var tc;
	var x;
	var y;

	tc = n_zero;
	x = new Float64Array( [ 1.0, 2.0, 3.0, 4.0, 5.0 ] );
	y = new Float64Array( [ 2.0, 3.0, 4.0, 5.0, 6.0 ] );
	result = dsdot( 0, x, 1, 0, y, 1, 0 );
	assertClose( result, tc.result, 1e-14, 'result' );
});

test( 'dsdot: n_one', function t() {
	var result;
	var tc;
	var x;
	var y;

	tc = n_one;
	x = new Float64Array( [ 3.0 ] );
	y = new Float64Array( [ 7.0 ] );
	result = dsdot( 1, x, 1, 0, y, 1, 0 );
	assertClose( result, tc.result, 1e-14, 'result' );
});

test( 'dsdot: stride', function t() {
	var result;
	var tc;
	var x;
	var y;

	tc = stride;
	x = new Float64Array( [ 1.0, 0.0, 2.0, 0.0, 3.0 ] );
	y = new Float64Array( [ 4.0, 0.0, 5.0, 0.0, 6.0 ] );
	result = dsdot( 3, x, 2, 0, y, 2, 0 );
	assertClose( result, tc.result, 1e-14, 'result' );
});

test( 'dsdot: neg_inc', function t() {
	var result;
	var tc;
	var x;
	var y;

	tc = neg_inc;
	x = new Float64Array( [ 1.0, 2.0, 3.0 ] );
	y = new Float64Array( [ 4.0, 5.0, 6.0 ] );
	result = dsdot( 3, x, -1, 2, y, 1, 0 );
	assertClose( result, tc.result, 1e-14, 'result' );
});
