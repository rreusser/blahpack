/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dscal from './../lib/dscal.js';


// FUNCTIONS //

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

test( 'dscal is a function', function t() {
	assert.strictEqual( typeof dscal, 'function', 'is a function' );
});

test( 'dscal has expected arity', function t() {
	assert.strictEqual( dscal.length, 4, 'has expected arity' );
});

test( 'dscal throws RangeError for negative N', function t() {
	var x = new Float64Array( [ 1, 2, 3 ] );
	assert.throws( function throws() {
		dscal( -1, 2.0, x, 1 );
	}, RangeError );
});

test( 'dscal returns x unchanged for N=0', function t() {
	var x = new Float64Array( [ 1, 2, 3 ] );
	var out = dscal( 0, 2.0, x, 1 );
	assert.strictEqual( out, x );
	assert.deepStrictEqual( toArray( x ), [ 1, 2, 3 ] );
});

test( 'dscal scales a vector', function t() {
	var x = new Float64Array( [ 1, 2, 3 ] );
	var out = dscal( 3, 2.0, x, 1 );
	assert.strictEqual( out, x, 'returns x' );
	assert.deepStrictEqual( toArray( x ), [ 2, 4, 6 ] );
});

test( 'dscal supports non-unit stride', function t() {
	// strideX=2 → scales x[0], x[2], x[4]
	var x = new Float64Array( [ 1, 99, 3, 99, 5 ] );
	dscal( 3, 2.0, x, 2 );
	assert.deepStrictEqual( toArray( x ), [ 2, 99, 6, 99, 10 ] );
});

test( 'dscal supports negative stride', function t() {
	var x = new Float64Array( [ 1, 2, 3 ] );
	dscal( 3, 2.0, x, -1 );
	assert.deepStrictEqual( toArray( x ), [ 2, 4, 6 ] );
});
