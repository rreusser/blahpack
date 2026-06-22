/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import ddot from './../lib/ndarray.js';

test( 'ddot: main export is a function', function t() {
	assert.strictEqual( typeof ddot, 'function' );
});

test( 'ddot: N=0 returns 0', function t() {
	var x = new Float64Array( [ 1, 2, 3 ] );
	var y = new Float64Array( [ 4, 5, 6 ] );
	assert.strictEqual( ddot( 0, x, 1, 0, y, 1, 0 ), 0.0 );
});

test( 'ddot: throws RangeError for N<0', function t() {
	var x = new Float64Array( [ 1, 2, 3 ] );
	var y = new Float64Array( [ 4, 5, 6 ] );
	assert.throws( function () {
		ddot( -1, x, 1, 0, y, 1, 0 );
	}, RangeError );
});

test( 'ddot: basic dot product (N=3, unit stride)', function t() {
	// 1*4 + 2*5 + 3*6 = 4 + 10 + 18 = 32
	var x = new Float64Array( [ 1, 2, 3 ] );
	var y = new Float64Array( [ 4, 5, 6 ] );
	assert.strictEqual( ddot( 3, x, 1, 0, y, 1, 0 ), 32.0 );
});

test( 'ddot: N=1', function t() {
	var x = new Float64Array( [ 7 ] );
	var y = new Float64Array( [ 3 ] );
	assert.strictEqual( ddot( 1, x, 1, 0, y, 1, 0 ), 21.0 );
});

test( 'ddot: unrolled path (N>=5, unit stride)', function t() {
	// N=7: remainder m=2, then one unrolled block of 5
	var x = new Float64Array( [ 1, 2, 3, 4, 5, 6, 7 ] );
	var y = new Float64Array( [ 1, 1, 1, 1, 1, 1, 1 ] );

	// Sum = 1+2+3+4+5+6+7 = 28
	assert.strictEqual( ddot( 7, x, 1, 0, y, 1, 0 ), 28.0 );
});

test( 'ddot: unrolled path (N=5, exact multiple)', function t() {
	// M = 5%5 = 0, so remainder loop doesn't execute
	var x = new Float64Array( [ 2, 2, 2, 2, 2 ] );
	var y = new Float64Array( [ 3, 3, 3, 3, 3 ] );
	assert.strictEqual( ddot( 5, x, 1, 0, y, 1, 0 ), 30.0 );
});

test( 'ddot: unrolled path (N=10, two blocks)', function t() {
	var x = new Float64Array( 10 );
	var y = new Float64Array( 10 );
	var i;
	for ( i = 0; i < 10; i++ ) {
		x[ i ] = i + 1;
		y[ i ] = 1;
	}
	// Sum = 1+2+...+10 = 55
	assert.strictEqual( ddot( 10, x, 1, 0, y, 1, 0 ), 55.0 );
});

test( 'ddot: non-unit stride (strideX=2)', function t() {
	// x = [1, _, 3, _, 5], strideX=2 → values 1, 3, 5
	// y = [2, 4, 6], strideY=1
	// Dot = 1*2 + 3*4 + 5*6 = 2 + 12 + 30 = 44
	var x = new Float64Array( [ 1, 99, 3, 99, 5 ] );
	var y = new Float64Array( [ 2, 4, 6 ] );
	assert.strictEqual( ddot( 3, x, 2, 0, y, 1, 0 ), 44.0 );
});

test( 'ddot: negative stride', function t() {
	// x = [3, 2, 1], strideX=-1, offsetX=2 → reads x[2],x[1],x[0] = 1,2,3
	// y = [4, 5, 6], strideY=1
	// Dot = 1*4 + 2*5 + 3*6 = 32
	var x = new Float64Array( [ 3, 2, 1 ] );
	var y = new Float64Array( [ 4, 5, 6 ] );
	assert.strictEqual( ddot( 3, x, -1, 2, y, 1, 0 ), 32.0 );
});

test( 'ddot: offsetX and offsetY', function t() {
	// x = [_, 1, 2, 3], offsetX=1
	// y = [_, _, 4, 5, 6], offsetY=2
	var x = new Float64Array( [ 99, 1, 2, 3 ] );
	var y = new Float64Array( [ 99, 99, 4, 5, 6 ] );
	assert.strictEqual( ddot( 3, x, 1, 1, y, 1, 2 ), 32.0 );
});

test( 'ddot: orthogonal vectors', function t() {
	var x = new Float64Array( [ 1, 0, 0 ] );
	var y = new Float64Array( [ 0, 1, 0 ] );
	assert.strictEqual( ddot( 3, x, 1, 0, y, 1, 0 ), 0.0 );
});
