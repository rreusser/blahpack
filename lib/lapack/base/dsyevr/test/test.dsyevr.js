/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dsyevr from './../lib/dsyevr.js';


// TESTS //

test( 'dsyevr is a function', function t() {
	assert.strictEqual( typeof dsyevr, 'function', 'is a function' );
});

test( 'dsyevr has expected arity', function t() {
	assert.strictEqual( dsyevr.length, 24, 'has expected arity' );
});

test( 'dsyevr throws TypeError for invalid uplo', function t() {
	assert.throws( function throws() {
		dsyevr( 2, 2, 'invalid', new Float64Array( 4 ), new Float64Array( 4 ), 2, 2, 2, 2, 2, 2, 2, 2, 1, new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, new Float64Array( 4 ), 1, 2, new Float64Array( 4 ), 1, 2 );
	}, TypeError );
});

test( 'dsyevr throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		dsyevr( 2, 2, 'upper', -1, new Float64Array( 4 ), 2, 2, 2, 2, 2, 2, 2, 2, 1, new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, new Float64Array( 4 ), 1, 2, new Float64Array( 4 ), 1, 2 );
	}, RangeError );
});
