
/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dsytf2Rook from './../lib/dsytf2_rook.js';


// TESTS //

test( 'dsytf2Rook is a function', function t() {
	assert.strictEqual( typeof dsytf2Rook, 'function', 'is a function' );
});

test( 'dsytf2Rook has expected arity', function t() {
	assert.strictEqual( dsytf2Rook.length, 8, 'has expected arity' );
});

test( 'dsytf2Rook throws TypeError for invalid order', function t() {
	assert.throws( function throws() {
		dsytf2Rook( 'invalid', 'upper', 2, new Float64Array( 4 ), 2, 2, 2, 2 );
	}, TypeError );
});

test( 'dsytf2Rook throws TypeError for invalid uplo', function t() {
	assert.throws( function throws() {
		dsytf2Rook( 'row-major', 'invalid', 2, new Float64Array( 4 ), 2, 2, 2, 2 );
	}, TypeError );
});

test( 'dsytf2Rook throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		dsytf2Rook( 'row-major', 'upper', -1, new Float64Array( 4 ), 2, 2, 2, 2 );
	}, RangeError );
});
