/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dlaqz1 from './../lib/dlaqz1.js';


// TESTS //

test( 'dlaqz1 is a function', function t() {
	assert.strictEqual( typeof dlaqz1, 'function', 'is a function' );
});

test( 'dlaqz1 has expected arity', function t() {
	assert.strictEqual( dlaqz1.length, 12, 'has expected arity' );
});

test( 'dlaqz1 throws TypeError for invalid order', function t() {
	assert.throws( function throws() {
		dlaqz1( 'invalid', new Float64Array( 9 ), 3, new Float64Array( 9 ), 3, 1, 2, 0, 1, 1, new Float64Array( 3 ), 1 );
	}, TypeError );
});

test( 'dlaqz1 throws RangeError when LDA < 3', function t() {
	assert.throws( function throws() {
		dlaqz1( 'column-major', new Float64Array( 9 ), 2, new Float64Array( 9 ), 3, 1, 2, 0, 1, 1, new Float64Array( 3 ), 1 );
	}, RangeError );
});

test( 'dlaqz1 throws RangeError when LDB < 3', function t() {
	assert.throws( function throws() {
		dlaqz1( 'column-major', new Float64Array( 9 ), 3, new Float64Array( 9 ), 2, 1, 2, 0, 1, 1, new Float64Array( 3 ), 1 );
	}, RangeError );
});

test( 'dlaqz1 returns v', function t() {
	var out;
	var A = new Float64Array( [ 4, 2, 0, 1, 5, 3, 0.5, 1, 6 ] );
	var B = new Float64Array( [ 2, 0, 0, 0.5, 3, 0, 0.1, 0.5, 4 ] );
	var v = new Float64Array( 3 );
	out = dlaqz1( 'column-major', A, 3, B, 3, 1, 2, 0, 1, 1, v, 1 );
	assert.strictEqual( out, v, 'returns v' );
});
