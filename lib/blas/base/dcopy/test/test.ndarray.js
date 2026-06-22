/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dcopy from './../lib/ndarray.js';


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

test( 'dcopy: main export is a function', function t() {
	assert.strictEqual( typeof dcopy, 'function' );
});

test( 'dcopy: N=0 returns y unchanged', function t() {
	var out;
	var x;
	var y;

	x = new Float64Array( [ 1, 2, 3 ] );
	y = new Float64Array( [ 99, 99, 99 ] );
	out = dcopy( 0, x, 1, 0, y, 1, 0 );
	assert.strictEqual( out, y );
	assert.deepStrictEqual( toArray( y ), [ 99, 99, 99 ] );
});

test( 'dcopy: throws RangeError for N<0', function t() {
	var x = new Float64Array( [ 1, 2, 3 ] );
	var y = new Float64Array( [ 99, 99, 99 ] );
	assert.throws( function() {
		dcopy( -1, x, 1, 0, y, 1, 0 );
	}, RangeError );
});

test( 'dcopy: basic copy (N=3, unit stride)', function t() {
	var out;
	var x;
	var y;

	x = new Float64Array( [ 1, 2, 3 ] );
	y = new Float64Array( 3 );
	out = dcopy( 3, x, 1, 0, y, 1, 0 );
	assert.strictEqual( out, y, 'returns y' );
	assert.deepStrictEqual( toArray( y ), [ 1, 2, 3 ] );
});

test( 'dcopy: N=1', function t() {
	var x = new Float64Array( [ 42 ] );
	var y = new Float64Array( 1 );
	dcopy( 1, x, 1, 0, y, 1, 0 );
	assert.strictEqual( y[ 0 ], 42 );
});

test( 'dcopy: unrolled path (N=10, unit stride)', function t() {
	var x = new Float64Array( [ 1, 2, 3, 4, 5, 6, 7, 8, 9, 10 ] );
	var y = new Float64Array( 10 );
	dcopy( 10, x, 1, 0, y, 1, 0 );
	assert.deepStrictEqual( toArray( y ), [ 1, 2, 3, 4, 5, 6, 7, 8, 9, 10 ] );
});

test( 'dcopy: unrolled path (N=7, exact multiple)', function t() {
	var x = new Float64Array( [ 1, 2, 3, 4, 5, 6, 7 ] );
	var y = new Float64Array( 7 );
	dcopy( 7, x, 1, 0, y, 1, 0 );
	assert.deepStrictEqual( toArray( y ), [ 1, 2, 3, 4, 5, 6, 7 ] );
});

test( 'dcopy: unrolled path (N=14, two blocks)', function t() {
	var x = new Float64Array( 14 );
	var y = new Float64Array( 14 );
	var i;
	for ( i = 0; i < 14; i++ ) {
		x[ i ] = i + 1;
	}
	dcopy( 14, x, 1, 0, y, 1, 0 );
	for ( i = 0; i < 14; i++ ) {
		assert.strictEqual( y[ i ], i + 1 );
	}
});

test( 'dcopy: non-unit stride (strideX=2, strideY=3)', function t() {
	var x = new Float64Array( [ 1, 99, 2, 99, 3 ] );
	var y = new Float64Array( [ 0, 0, 0, 0, 0, 0, 0 ] );
	dcopy( 3, x, 2, 0, y, 3, 0 );
	assert.strictEqual( y[ 0 ], 1 );
	assert.strictEqual( y[ 3 ], 2 );
	assert.strictEqual( y[ 6 ], 3 );
});

test( 'dcopy: negative stride', function t() {
	var x = new Float64Array( [ 3, 2, 1 ] );
	var y = new Float64Array( 3 );
	dcopy( 3, x, -1, 2, y, 1, 0 );
	assert.deepStrictEqual( toArray( y ), [ 1, 2, 3 ] );
});

test( 'dcopy: offsetX and offsetY', function t() {
	var x = new Float64Array( [ 99, 1, 2, 3 ] );
	var y = new Float64Array( [ 99, 99, 0, 0, 0 ] );
	dcopy( 3, x, 1, 1, y, 1, 2 );
	assert.deepStrictEqual( toArray( y ), [ 99, 99, 1, 2, 3 ] );
});

test( 'dcopy: does not modify source', function t() {
	var x = new Float64Array( [ 1, 2, 3 ] );
	var y = new Float64Array( 3 );
	dcopy( 3, x, 1, 0, y, 1, 0 );
	assert.deepStrictEqual( toArray( x ), [ 1, 2, 3 ] );
});
