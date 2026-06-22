/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dswap from './../lib/ndarray.js';

// FIXTURES //

import basic from './fixtures/basic.json' with { type: 'json' };
import negative_stride from './fixtures/negative_stride.json' with { type: 'json' };
import n_zero from './fixtures/n_zero.json' with { type: 'json' };
import n_one from './fixtures/n_one.json' with { type: 'json' };

// FUNCTIONS //

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
		assert.ok(Math.abs( actual[ i ] - expected[ i ] ) <= tol, msg + '[' + i + ']: expected ' + expected[ i ] + ', got ' + actual[ i ]);
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

test( 'dswap: main export is a function', function t() {
	assert.strictEqual( typeof dswap, 'function' );
});

test( 'dswap: basic swap (N=5, stride=1)', function t() {
	var tc = basic;
	var x = new Float64Array( [ 1.0, 2.0, 3.0, 4.0, 5.0 ] );
	var y = new Float64Array( [ 6.0, 7.0, 8.0, 9.0, 10.0 ] );
	dswap( 5, x, 1, 0, y, 1, 0 );
	assertArrayClose( toArray( x ), tc.x, 1e-14, 'x' );
	assertArrayClose( toArray( y ), tc.y, 1e-14, 'y' );
});

test( 'dswap: negative stride (N=3, strideX=2, strideY=-1)', function t() {
	var tc = negative_stride;

	// Fortran: x = [1,0,2,0,3] stride=2, y = [4,5,6] stride=-1

	// With negative stride in Fortran, y starts from the end

	// JS base.js: offsetY should point to last element for negative stride
	var x = new Float64Array( [ 1.0, 0.0, 2.0, 0.0, 3.0 ] );
	var y = new Float64Array( [ 4.0, 5.0, 6.0 ] );
	dswap( 3, x, 2, 0, y, -1, 2 );
	assertArrayClose( toArray( x ), tc.x, 1e-14, 'x' );
	assertArrayClose( toArray( y ), tc.y, 1e-14, 'y' );
});

test( 'dswap: N=0 quick return (vectors unchanged)', function t() {
	var tc = n_zero;
	var x = new Float64Array( [ 1.0, 2.0, 3.0 ] );
	var y = new Float64Array( [ 4.0, 5.0, 6.0 ] );
	dswap( 0, x, 1, 0, y, 1, 0 );
	assertArrayClose( toArray( x ), tc.x, 1e-14, 'x' );
	assertArrayClose( toArray( y ), tc.y, 1e-14, 'y' );
});

test( 'dswap: N=1', function t() {
	var tc = n_one;
	var x = new Float64Array( [ 42.0 ] );
	var y = new Float64Array( [ 99.0 ] );
	dswap( 1, x, 1, 0, y, 1, 0 );
	assertArrayClose( toArray( x ), tc.x, 1e-14, 'x' );
	assertArrayClose( toArray( y ), tc.y, 1e-14, 'y' );
});

test( 'dswap: returns y', function t() {
	var result;
	var x;
	var y;

	x = new Float64Array( [ 1.0, 2.0 ] );
	y = new Float64Array( [ 3.0, 4.0 ] );
	result = dswap( 2, x, 1, 0, y, 1, 0 );
	assert.strictEqual( result, y );
});

test( 'dswap: offset parameters work', function t() {
	var x = new Float64Array( [ 99.0, 1.0, 2.0 ] );
	var y = new Float64Array( [ 99.0, 3.0, 4.0 ] );
	dswap( 2, x, 1, 1, y, 1, 1 );
	assert.strictEqual( x[ 0 ], 99.0 ); // unchanged
	assert.strictEqual( x[ 1 ], 3.0 );
	assert.strictEqual( x[ 2 ], 4.0 );
	assert.strictEqual( y[ 0 ], 99.0 ); // unchanged
	assert.strictEqual( y[ 1 ], 1.0 );
	assert.strictEqual( y[ 2 ], 2.0 );
});

test( 'dswap: non-unit positive strides', function t() {
	// x = [1, _, 2, _, 3], strideX=2
	// y = [4, _, _, 5, _, _, 6], strideY=3
	var x = new Float64Array( [ 1.0, 0.0, 2.0, 0.0, 3.0 ] );
	var y = new Float64Array( [ 4.0, 0.0, 0.0, 5.0, 0.0, 0.0, 6.0 ] );
	dswap( 3, x, 2, 0, y, 3, 0 );
	assert.strictEqual( x[ 0 ], 4.0 );
	assert.strictEqual( x[ 2 ], 5.0 );
	assert.strictEqual( x[ 4 ], 6.0 );
	assert.strictEqual( y[ 0 ], 1.0 );
	assert.strictEqual( y[ 3 ], 2.0 );
	assert.strictEqual( y[ 6 ], 3.0 );
});

test( 'dswap: throws RangeError for N<0', function t() {
	var x = new Float64Array( [ 1.0, 2.0 ] );
	var y = new Float64Array( [ 3.0, 4.0 ] );
	assert.throws( function() {
		dswap( -1, x, 1, 0, y, 1, 0 );
	}, RangeError );
});
