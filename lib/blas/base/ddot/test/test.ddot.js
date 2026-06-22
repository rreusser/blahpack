/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import ddot from './../lib/ddot.js';


// TESTS //

test( 'ddot is a function', function t() {
	assert.strictEqual( typeof ddot, 'function', 'is a function' );
});

test( 'ddot has expected arity', function t() {
	assert.strictEqual( ddot.length, 5, 'has expected arity' );
});

test( 'ddot throws RangeError for negative N', function t() {
	var x = new Float64Array( [ 1, 2, 3 ] );
	var y = new Float64Array( [ 4, 5, 6 ] );
	assert.throws( function throws() {
		ddot( -1, x, 1, y, 1 );
	}, RangeError );
});

test( 'ddot returns 0 for N=0', function t() {
	var x = new Float64Array( [ 1, 2, 3 ] );
	var y = new Float64Array( [ 4, 5, 6 ] );
	assert.strictEqual( ddot( 0, x, 1, y, 1 ), 0.0 );
});

test( 'ddot computes basic dot product', function t() {
	// 1*4 + 2*5 + 3*6 = 32
	var x = new Float64Array( [ 1, 2, 3 ] );
	var y = new Float64Array( [ 4, 5, 6 ] );
	assert.strictEqual( ddot( 3, x, 1, y, 1 ), 32.0 );
});

test( 'ddot supports non-unit stride', function t() {
	// x = [1, _, 3, _, 5], strideX=2 → 1, 3, 5
	// y = [2, 4, 6], strideY=1
	// Dot = 1*2 + 3*4 + 5*6 = 44
	var x = new Float64Array( [ 1, 99, 3, 99, 5 ] );
	var y = new Float64Array( [ 2, 4, 6 ] );
	assert.strictEqual( ddot( 3, x, 2, y, 1 ), 44.0 );
});

test( 'ddot supports negative stride', function t() {
	// strideX=-1 reads x in reverse: x[2], x[1], x[0] = 1, 2, 3
	// y = [4, 5, 6], strideY=1 reads y[0], y[1], y[2] = 4, 5, 6
	// Dot = 1*4 + 2*5 + 3*6 = 32
	var x = new Float64Array( [ 3, 2, 1 ] );
	var y = new Float64Array( [ 4, 5, 6 ] );
	assert.strictEqual( ddot( 3, x, -1, y, 1 ), 32.0 );
});
