/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import zsytri2x from './../lib/zsytri2x.js';


// TESTS //

test( 'zsytri2x is a function', function t() {
	assert.strictEqual( typeof zsytri2x, 'function', 'is a function' );
});

test( 'zsytri2x has expected arity', function t() {
	assert.strictEqual( zsytri2x.length, 11, 'has expected arity' );
});

test( 'zsytri2x throws TypeError for invalid order', function t() {
	assert.throws( function throws() {
		zsytri2x( 'invalid', 'upper', 2, new Complex128Array( 4 ), 2, new Int32Array( 2 ), 1, 0, new Complex128Array( 10 ), 1, 1 );
	}, TypeError );
});

test( 'zsytri2x throws TypeError for invalid uplo', function t() {
	assert.throws( function throws() {
		zsytri2x( 'column-major', 'invalid', 2, new Complex128Array( 4 ), 2, new Int32Array( 2 ), 1, 0, new Complex128Array( 10 ), 1, 1 );
	}, TypeError );
});

test( 'zsytri2x throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		zsytri2x( 'column-major', 'upper', -1, new Complex128Array( 4 ), 2, new Int32Array( 2 ), 1, 0, new Complex128Array( 10 ), 1, 1 );
	}, RangeError );
});

test( 'zsytri2x throws RangeError for LDA < max(1,N)', function t() {
	assert.throws( function throws() {
		zsytri2x( 'column-major', 'upper', 3, new Complex128Array( 4 ), 1, new Int32Array( 3 ), 1, 0, new Complex128Array( 20 ), 1, 1 );
	}, RangeError );
});

test( 'zsytri2x returns 0 on N=0', function t() {
	var info = zsytri2x( 'column-major', 'upper', 0, new Complex128Array( 1 ), 1, new Int32Array( 1 ), 1, 0, new Complex128Array( 1 ), 1, 1 );
	assert.equal( info, 0 );
});
