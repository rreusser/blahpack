/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import dlagtf from './../lib/ndarray.js';

// FIXTURES //

import basic_5x5 from './fixtures/basic_5x5.json' with { type: 'json' };
import n_equals_1 from './fixtures/n_equals_1.json' with { type: 'json' };

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

test( 'dlagtf: basic 5x5', function t() {
	var info;
	var tc;
	var IN;
	var a;
	var b;
	var c;
	var d;

	tc = basic_5x5;
	a = new Float64Array( [ 2.0, 2.0, 2.0, 2.0, 2.0 ] );
	b = new Float64Array( [ 1.0, 1.0, 1.0, 1.0 ] );
	c = new Float64Array( [ 1.0, 1.0, 1.0, 1.0 ] );
	d = new Float64Array( 3 );
	IN = new Int32Array( 5 );
	info = dlagtf( 5, a, 1, 0, 2.0, b, 1, 0, c, 1, 0, 0.0, d, 1, 0, IN, 1, 0 );
	assert.equal( info, tc.info, 'info' );
	assertArrayClose( a, tc.a, 1e-14, 'a' );
	assertArrayClose( b, tc.b, 1e-14, 'b' );
	assertArrayClose( c, tc.c, 1e-14, 'c' );
	assertArrayClose( d, tc.d, 1e-14, 'd' );
	assert.deepEqual( toArray( IN ), tc.in, 'IN' );
});

test( 'dlagtf: N=1', function t() {
	var info;
	var tc;
	var IN;
	var a;
	var b;
	var c;
	var d;

	tc = n_equals_1;
	a = new Float64Array( [ 5.0 ] );
	b = new Float64Array( 1 );
	c = new Float64Array( 1 );
	d = new Float64Array( 1 );
	IN = new Int32Array( 1 );
	info = dlagtf( 1, a, 1, 0, 3.0, b, 1, 0, c, 1, 0, 0.0, d, 1, 0, IN, 1, 0 );
	assert.equal( info, tc.info, 'info' );
	assertClose( a[ 0 ], tc.a[ 0 ], 1e-14, 'a[0]' );
	assert.equal( IN[ 0 ], tc.in[ 0 ], 'IN[0]' );
});

test( 'dlagtf: N=0', function t() {
	var info;
	var IN;
	var a;
	var b;
	var c;
	var d;

	a = new Float64Array( 1 );
	b = new Float64Array( 1 );
	c = new Float64Array( 1 );
	d = new Float64Array( 1 );
	IN = new Int32Array( 1 );
	info = dlagtf( 0, a, 1, 0, 0.0, b, 1, 0, c, 1, 0, 0.0, d, 1, 0, IN, 1, 0 );
	assert.equal( info, 0, 'info' );
});
