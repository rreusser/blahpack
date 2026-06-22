/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import dlaruv from './../lib/ndarray.js';

// FIXTURES //

import basic_5 from './fixtures/basic_5.json' with { type: 'json' };
import basic_10 from './fixtures/basic_10.json' with { type: 'json' };

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

test( 'dlaruv: basic_5', function t() {
	var iseed = new Int32Array( [ 1, 1, 1, 1 ] );
	var tc = basic_5;
	var x = new Float64Array( 5 );

	dlaruv( iseed, 1, 0, 5, x, 1, 0 );

	assertArrayClose( x, tc.x, 1e-14, 'x' );
	assert.deepEqual( toArray( iseed ), tc.iseed_out, 'iseed_out' );
});

test( 'dlaruv: basic_10', function t() {
	var iseed = new Int32Array( [ 123, 456, 789, 1011 ] );
	var tc = basic_10;
	var x = new Float64Array( 10 );

	dlaruv( iseed, 1, 0, 10, x, 1, 0 );

	assertArrayClose( x, tc.x, 1e-14, 'x' );
	assert.deepEqual( toArray( iseed ), tc.iseed_out, 'iseed_out' );
});

test( 'dlaruv: n_equals_0', function t() {
	var iseed = new Int32Array( [ 1, 1, 1, 1 ] );
	var x = new Float64Array( 1 );

	dlaruv( iseed, 1, 0, 0, x, 1, 0 );

	// Seed should be unchanged
	assert.deepEqual( toArray( iseed ), [ 1, 1, 1, 1 ], 'iseed unchanged' );
});
