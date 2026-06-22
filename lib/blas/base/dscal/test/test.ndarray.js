/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dscal from './../lib/ndarray.js';


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

test( 'dscal: main export is a function', function t() {
	assert.strictEqual( typeof dscal, 'function' );
});

test( 'dscal: N=0 returns x unchanged', function t() {
	var out;
	var x;

	x = new Float64Array( [ 1, 2, 3 ] );
	out = dscal( 0, 2.0, x, 1, 0 );
	assert.strictEqual( out, x );
	assert.deepStrictEqual( toArray( x ), [ 1, 2, 3 ] );
});

test( 'dscal: throws RangeError for N<0', function t() {
	var x = new Float64Array( [ 1, 2, 3 ] );
	assert.throws( function () {
		dscal( -1, 2.0, x, 1, 0 );
	}, RangeError );
});

test( 'dscal: basic scaling (N=3, da=2, unit stride)', function t() {
	var out;
	var x;

	x = new Float64Array( [ 1, 2, 3 ] );
	out = dscal( 3, 2.0, x, 1, 0 );
	assert.strictEqual( out, x, 'returns x' );
	assert.deepStrictEqual( toArray( x ), [ 2, 4, 6 ] );
});

test( 'dscal: N=1', function t() {
	var x = new Float64Array( [ 5 ] );
	dscal( 1, 3.0, x, 1, 0 );
	assert.strictEqual( x[ 0 ], 15.0 );
});

test( 'dscal: da=0 zeros the vector', function t() {
	var x = new Float64Array( [ 1, 2, 3 ] );
	dscal( 3, 0.0, x, 1, 0 );
	assert.deepStrictEqual( toArray( x ), [ 0, 0, 0 ] );
});

test( 'dscal: da=1 is identity', function t() {
	var x = new Float64Array( [ 1, 2, 3 ] );
	dscal( 3, 1.0, x, 1, 0 );
	assert.deepStrictEqual( toArray( x ), [ 1, 2, 3 ] );
});

test( 'dscal: unrolled path (N=7, unit stride)', function t() {
	// N=7: m=2 remainder, then one block of 5
	var x = new Float64Array( [ 1, 2, 3, 4, 5, 6, 7 ] );
	dscal( 7, 2.0, x, 1, 0 );
	assert.deepStrictEqual( toArray( x ), [ 2, 4, 6, 8, 10, 12, 14 ] );
});

test( 'dscal: unrolled path (N=5, exact multiple)', function t() {
	// M = 5%5 = 0, remainder loop skipped
	var x = new Float64Array( [ 1, 2, 3, 4, 5 ] );
	dscal( 5, 3.0, x, 1, 0 );
	assert.deepStrictEqual( toArray( x ), [ 3, 6, 9, 12, 15 ] );
});

test( 'dscal: unrolled path (N=10, two blocks)', function t() {
	var x = new Float64Array( [ 1, 2, 3, 4, 5, 6, 7, 8, 9, 10 ] );
	dscal( 10, -1.0, x, 1, 0 );
	assert.deepStrictEqual( toArray( x ), [ -1, -2, -3, -4, -5, -6, -7, -8, -9, -10 ] ); // eslint-disable-line max-len
});

test( 'dscal: non-unit stride (strideX=2)', function t() {
	// x = [1, _, 3, _, 5], strideX=2 → scales x[0], x[2], x[4]
	var x = new Float64Array( [ 1, 99, 3, 99, 5 ] );
	dscal( 3, 2.0, x, 2, 0 );
	assert.deepStrictEqual( toArray( x ), [ 2, 99, 6, 99, 10 ] );
});

test( 'dscal: negative stride', function t() {
	var x = new Float64Array( [ 1, 2, 3 ] );
	dscal( 3, 2.0, x, -1, 2 );
	assert.deepStrictEqual( toArray( x ), [ 2, 4, 6 ] );
});

test( 'dscal: offsetX non-zero', function t() {
	var x = new Float64Array( [ 99, 1, 2, 3 ] );
	dscal( 3, 10.0, x, 1, 1 );
	assert.deepStrictEqual( toArray( x ), [ 99, 10, 20, 30 ] );
});

test( 'dscal: negative da', function t() {
	var x = new Float64Array( [ 1, -2, 3 ] );
	dscal( 3, -2.0, x, 1, 0 );
	assert.deepStrictEqual( toArray( x ), [ -2, 4, -6 ] );
});
