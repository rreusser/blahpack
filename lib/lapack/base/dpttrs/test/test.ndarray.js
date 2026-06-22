/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dpttrs from './../lib/ndarray.js';

// FIXTURES //

import basic_5x5_single_rhs from './fixtures/basic_5x5_single_rhs.json' with { type: 'json' };
import multi_rhs_3 from './fixtures/multi_rhs_3.json' with { type: 'json' };
import n_eq_1 from './fixtures/n_eq_1.json' with { type: 'json' };
import n_eq_0 from './fixtures/n_eq_0.json' with { type: 'json' };
import nrhs_eq_0 from './fixtures/nrhs_eq_0.json' with { type: 'json' };

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

// TESTS //

test( 'dpttrs: basic_5x5_single_rhs', function t() {
	var info;
	var tc;
	var d;
	var e;
	var b;

	tc = basic_5x5_single_rhs;
	d = new Float64Array( [ 4.0, 3.0, 2.0, 3.0, 4.0 ] );
	e = new Float64Array( [ 0.5, -0.5, 0.25, -0.25 ] );
	b = new Float64Array( [ 8.0, 5.5, 7.25, 10.25, 17.9375 ] );
	info = dpttrs( 5, 1, d, 1, 0, e, 1, 0, b, 1, 5, 0 );
	assert.equal( info, tc.info, 'info' );
	assertArrayClose( b, new Float64Array( tc.x ), 1e-14, 'x' );
});

test( 'dpttrs: multi_rhs_3', function t() {
	var info;
	var tc;
	var d;
	var e;
	var b;

	tc = multi_rhs_3;
	d = new Float64Array( [ 4.0, 3.0, 2.0, 3.0, 4.0 ] );
	e = new Float64Array( [ 0.5, -0.5, 0.25, -0.25 ] );
	b = new Float64Array([
		8.0,
		5.5,
		7.25,
		10.25,
		17.9375,
		28.0,
		21.5,
		3.25,
		7.0,
		2.6875,
		8.0,
		5.5,
		-1.25,
		8.125,
		1.9375
	]);
	info = dpttrs( 5, 3, d, 1, 0, e, 1, 0, b, 1, 5, 0 );
	assert.equal( info, tc.info, 'info' );
	assertArrayClose( b, new Float64Array( tc.x ), 1e-14, 'x' );
});

test( 'dpttrs: n_eq_1', function t() {
	var info;
	var tc;
	var d;
	var e;
	var b;

	tc = n_eq_1;
	d = new Float64Array( [ 3.0 ] );
	e = new Float64Array( [] );
	b = new Float64Array( [ 9.0 ] );
	info = dpttrs( 1, 1, d, 1, 0, e, 1, 0, b, 1, 1, 0 );
	assert.equal( info, tc.info, 'info' );
	assertArrayClose( b, new Float64Array( tc.x ), 1e-14, 'x' );
});

test( 'dpttrs: n_eq_0', function t() {
	var info;
	var tc;
	var d;
	var e;
	var b;

	tc = n_eq_0;
	d = new Float64Array( [] );
	e = new Float64Array( [] );
	b = new Float64Array( [ 42.0 ] );
	info = dpttrs( 0, 1, d, 1, 0, e, 1, 0, b, 1, 1, 0 );
	assert.equal( info, tc.info, 'info' );
	assert.equal( b[ 0 ], 42.0, 'b unchanged' );
});

test( 'dpttrs: nrhs_eq_0', function t() {
	var info;
	var tc;
	var d;
	var e;
	var b;

	tc = nrhs_eq_0;
	d = new Float64Array( [ 4.0, 3.0 ] );
	e = new Float64Array( [ 0.5 ] );
	b = new Float64Array( [ 42.0 ] );
	info = dpttrs( 2, 0, d, 1, 0, e, 1, 0, b, 1, 2, 0 );
	assert.equal( info, tc.info, 'info' );
	assert.equal( b[ 0 ], 42.0, 'b unchanged' );
});

test( 'dpttrs: non-unit strides and offsets', function t() {
	var expected;
	var info;
	var d;
	var e;
	var b;

	d = new Float64Array( [ 0.0, 4.0, 3.0, 2.0, 3.0, 4.0 ] );
	e = new Float64Array( [ 0.0, 0.5, -0.5, 0.25, -0.25 ] );
	b = new Float64Array( [ 8.0, 5.5, 7.25, 10.25, 17.9375 ] );
	expected = new Float64Array( [ 1.0, 2.0, 3.0, 4.0, 5.0 ] );
	info = dpttrs( 5, 1, d, 1, 1, e, 1, 1, b, 1, 5, 0 );
	assert.equal( info, 0, 'info' );
	assertArrayClose( b, expected, 1e-14, 'x' );
});
