/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import zsytf2Rook from './../lib/zsytf2_rook.js';


// TESTS //

test( 'zsytf2Rook is a function', function t() {
	assert.strictEqual( typeof zsytf2Rook, 'function', 'is a function' );
});

test( 'zsytf2Rook has expected arity', function t() {
	assert.strictEqual( zsytf2Rook.length, 8, 'has expected arity' );
});

test( 'zsytf2Rook throws TypeError for invalid order', function t() {
	assert.throws( function throws() {
		zsytf2Rook( 'invalid', 'upper', 2, new Float64Array( 4 ), 2, 2, 2, 2 );
	}, TypeError );
});

test( 'zsytf2Rook throws TypeError for invalid uplo', function t() {
	assert.throws( function throws() {
		zsytf2Rook( 'row-major', 'invalid', 2, new Float64Array( 4 ), 2, 2, 2, 2 );
	}, TypeError );
});

test( 'zsytf2Rook throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		zsytf2Rook( 'row-major', 'upper', -1, new Float64Array( 4 ), 2, 2, 2, 2 );
	}, RangeError );
});
