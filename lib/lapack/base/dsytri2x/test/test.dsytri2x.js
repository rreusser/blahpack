/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dsytri2x from './../lib/dsytri2x.js';


// TESTS //

test( 'dsytri2x is a function', function t() {
	assert.strictEqual( typeof dsytri2x, 'function', 'is a function' );
});

test( 'dsytri2x has expected arity', function t() {
	assert.strictEqual( dsytri2x.length, 11, 'has expected arity' );
});

test( 'dsytri2x throws TypeError for invalid order', function t() {
	assert.throws( function throws() {
		dsytri2x( 'invalid', 'upper', 2, new Float64Array( 4 ), 2, 2, 2, 2, new Float64Array( 4 ), 2, 2 );
	}, TypeError );
});

test( 'dsytri2x throws TypeError for invalid uplo', function t() {
	assert.throws( function throws() {
		dsytri2x( 'row-major', 'invalid', 2, new Float64Array( 4 ), 2, 2, 2, 2, new Float64Array( 4 ), 2, 2 );
	}, TypeError );
});

test( 'dsytri2x throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		dsytri2x( 'row-major', 'upper', -1, new Float64Array( 4 ), 2, 2, 2, 2, new Float64Array( 4 ), 2, 2 );
	}, RangeError );
});
