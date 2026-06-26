/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dasum from './../lib/ndarray.js';

test( 'dasum: main export is a function', function t() {
	assert.strictEqual( typeof dasum, 'function' );
});

test( 'dasum: basic (N=5, unit stride, all positive)', function t() {
	var x = new Float64Array( [ 1, 2, 3, 4, 5 ] );
	assert.strictEqual( dasum( 5, x, 1, 0 ), 15.0 );
});

test( 'dasum: mixed signs (N=5, unit stride)', function t() {
	var x = new Float64Array( [ -1, 2, -3, 4, -5 ] );
	assert.strictEqual( dasum( 5, x, 1, 0 ), 15.0 );
});

test( 'dasum: N=0 returns 0', function t() {
	var x = new Float64Array( [ 1, 2, 3 ] );
	assert.strictEqual( dasum( 0, x, 1, 0 ), 0.0 );
});

test( 'dasum: throws RangeError for N<0', function t() {
	var x = new Float64Array( [ 1, 2, 3 ] );
	assert.throws( function () {
		dasum( -1, x, 1, 0 );
	}, RangeError );
});

test( 'dasum: N=1', function t() {
	var x = new Float64Array( [ 42.0 ] );
	assert.strictEqual( dasum( 1, x, 1, 0 ), 42.0 );
});

test( 'dasum: N=1 with negative value', function t() {
	var x = new Float64Array( [ -7.5 ] );
	assert.strictEqual( dasum( 1, x, 1, 0 ), 7.5 );
});

test( 'dasum: non-unit stride (stride=2)', function t() {
	// x = [1, 99, 2, 99, 3], stride=2 => values 1, 2, 3
	var x = new Float64Array( [ 1, 99, 2, 99, 3 ] );
	assert.strictEqual( dasum( 3, x, 2, 0 ), 6.0 );
});

test( 'dasum: stride <= 0 returns 0', function t() {
	var x = new Float64Array( [ 1, 2, 3 ] );
	assert.strictEqual( dasum( 3, x, 0, 0 ), 0.0 );
});

test( 'dasum: unrolled path (N=7, remainder=1 + one block of 6)', function t() {
	var x = new Float64Array( [ 1, -2, 3, -4, 5, -6, 7 ] );

	// Sum of abs = 1+2+3+4+5+6+7 = 28
	assert.strictEqual( dasum( 7, x, 1, 0 ), 28.0 );
});

test( 'dasum: unrolled path (N=6, exact multiple)', function t() {
	var x = new Float64Array( [ 1, 2, 3, 4, 5, 6 ] );

	// m=0, so remainder loop skipped, one full block
	assert.strictEqual( dasum( 6, x, 1, 0 ), 21.0 );
});

test( 'dasum: unrolled path (N=12, two full blocks)', function t() {
	var x = new Float64Array( [ 1, -1, 2, -2, 3, -3, 4, -4, 5, -5, 6, -6 ] );

	// Sum = 2*(1+2+3+4+5+6) = 42
	assert.strictEqual( dasum( 12, x, 1, 0 ), 42.0 );
});

test( 'dasum: unrolled path (N=13)', function t() {
	var x = new Float64Array( 13 );
	var i;
	for ( i = 0; i < 13; i++ ) {
		x[ i ] = i + 1;
	}
	// Sum = 13*14/2 = 91
	assert.strictEqual( dasum( 13, x, 1, 0 ), 91.0 );
});

test( 'dasum: all zeros', function t() {
	var x = new Float64Array( 5 );
	assert.strictEqual( dasum( 5, x, 1, 0 ), 0.0 );
});

test( 'dasum: offset', function t() {
	// x = [99, 1, 2, 3], offset=1
	var x = new Float64Array( [ 99, 1, 2, 3 ] );
	assert.strictEqual( dasum( 3, x, 1, 1 ), 6.0 );
});

test( 'dasum: stride=3 with offset', function t() {
	var x = new Float64Array( [ 0, 1, 0, 0, -2, 0, 0, 3, 0 ] );
	// stride=3, offset=1 => values 1, -2, 3 => sum = 6
	assert.strictEqual( dasum( 3, x, 3, 1 ), 6.0 );
});
