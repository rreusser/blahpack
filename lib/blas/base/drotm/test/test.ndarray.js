/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import drotm from './../lib/ndarray.js';

// FIXTURES //

import flag_neg1 from './fixtures/flag_neg1.json' with { type: 'json' };
import flag_zero from './fixtures/flag_zero.json' with { type: 'json' };
import flag_one from './fixtures/flag_one.json' with { type: 'json' };
import flag_neg2 from './fixtures/flag_neg2.json' with { type: 'json' };
import n_zero from './fixtures/n_zero.json' with { type: 'json' };
import stride2 from './fixtures/stride2.json' with { type: 'json' };
import neg_stride from './fixtures/neg_stride.json' with { type: 'json' };

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
* @param {*} expected - expected value
* @param {number} tol - tolerance
* @param {string} msg - assertion message
*/
function assertArrayClose( actual, expected, tol, msg ) {
	var i;
	assert.equal( actual.length, expected.length, msg + ': length mismatch' );
	for ( i = 0; i < expected.length; i++ ) {
		assertClose( actual[ i ], expected[ i ], tol, msg + '[' + i + ']' );
	}
}

/**
* Converts a typed array to a plain array.
*
* @private
* @param {TypedArray} arr - input array
* @returns {Array} output array
*/
function toArray( arr ) {
	var out = [];
	var i;
	for ( i = 0; i < arr.length; i++ ) {
		out.push( arr[ i ] );
	}
	return out;
}

// TESTS //

test( 'drotm: flag_neg1', function t() {
	var dparam;
	var tc;
	var dx;
	var dy;

	tc = flag_neg1;
	dx = new Float64Array( [ 1.0, 2.0, 3.0 ] );
	dy = new Float64Array( [ 4.0, 5.0, 6.0 ] );
	dparam = new Float64Array( [ -1.0, 2.0, -1.0, 3.0, 0.5 ] );

	drotm( 3, dx, 1, 0, dy, 1, 0, dparam, 1, 0 );
	assertArrayClose( toArray( dx ), tc.dx, 1e-14, 'dx' );
	assertArrayClose( toArray( dy ), tc.dy, 1e-14, 'dy' );
});

test( 'drotm: flag_zero', function t() {
	var dparam;
	var tc;
	var dx;
	var dy;

	tc = flag_zero;
	dx = new Float64Array( [ 1.0, 2.0, 3.0 ] );
	dy = new Float64Array( [ 4.0, 5.0, 6.0 ] );
	dparam = new Float64Array( [ 0.0, 0.0, -0.5, 0.25, 0.0 ] );

	drotm( 3, dx, 1, 0, dy, 1, 0, dparam, 1, 0 );
	assertArrayClose( toArray( dx ), tc.dx, 1e-14, 'dx' );
	assertArrayClose( toArray( dy ), tc.dy, 1e-14, 'dy' );
});

test( 'drotm: flag_one', function t() {
	var dparam;
	var tc;
	var dx;
	var dy;

	tc = flag_one;
	dx = new Float64Array( [ 1.0, 2.0, 3.0 ] );
	dy = new Float64Array( [ 4.0, 5.0, 6.0 ] );
	dparam = new Float64Array( [ 1.0, 0.5, 0.0, 0.0, 2.0 ] );

	drotm( 3, dx, 1, 0, dy, 1, 0, dparam, 1, 0 );
	assertArrayClose( toArray( dx ), tc.dx, 1e-14, 'dx' );
	assertArrayClose( toArray( dy ), tc.dy, 1e-14, 'dy' );
});

test( 'drotm: flag_neg2', function t() {
	var dparam;
	var tc;
	var dx;
	var dy;

	tc = flag_neg2;
	dx = new Float64Array( [ 1.0, 2.0, 3.0 ] );
	dy = new Float64Array( [ 4.0, 5.0, 6.0 ] );
	dparam = new Float64Array( [ -2.0, 0.0, 0.0, 0.0, 0.0 ] );

	drotm( 3, dx, 1, 0, dy, 1, 0, dparam, 1, 0 );
	assertArrayClose( toArray( dx ), tc.dx, 1e-14, 'dx' );
	assertArrayClose( toArray( dy ), tc.dy, 1e-14, 'dy' );
});

test( 'drotm: n_zero', function t() {
	var dparam;
	var tc;
	var dx;
	var dy;

	tc = n_zero;
	dx = new Float64Array( [ 1.0, 2.0, 3.0 ] );
	dy = new Float64Array( [ 4.0, 5.0, 6.0 ] );
	dparam = new Float64Array( [ -1.0, 2.0, -1.0, 3.0, 0.5 ] );

	drotm( 0, dx, 1, 0, dy, 1, 0, dparam, 1, 0 );
	assertArrayClose( toArray( dx ), tc.dx, 1e-14, 'dx' );
	assertArrayClose( toArray( dy ), tc.dy, 1e-14, 'dy' );
});

test( 'drotm: stride2', function t() {
	var dparam;
	var tc;
	var dx;
	var dy;

	tc = stride2;
	dx = new Float64Array( [ 1.0, 0.0, 2.0, 0.0 ] );
	dy = new Float64Array( [ 3.0, 0.0, 4.0, 0.0 ] );
	dparam = new Float64Array( [ -1.0, 2.0, -1.0, 3.0, 0.5 ] );

	drotm( 2, dx, 2, 0, dy, 2, 0, dparam, 1, 0 );
	assertArrayClose( toArray( dx ), tc.dx, 1e-14, 'dx' );
	assertArrayClose( toArray( dy ), tc.dy, 1e-14, 'dy' );
});

test( 'drotm: neg_stride', function t() {
	var dparam;
	var tc;
	var dx;
	var dy;

	tc = neg_stride;
	dx = new Float64Array( [ 1.0, 2.0, 3.0 ] );
	dy = new Float64Array( [ 4.0, 5.0, 6.0 ] );
	dparam = new Float64Array( [ 0.0, 0.0, -0.5, 0.25, 0.0 ] );

	// Fortran call: drotm(3, dx, -1, dy, 1, dparam)

	// Negative stride for x means start from the end: offset = (N-1)*|stride| = 2
	drotm( 3, dx, -1, 2, dy, 1, 0, dparam, 1, 0 );
	assertArrayClose( toArray( dx ), tc.dx, 1e-14, 'dx' );
	assertArrayClose( toArray( dy ), tc.dy, 1e-14, 'dy' );
});
