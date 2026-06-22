/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dsymv from './../lib/dsymv.js';


// TESTS //

test( 'dsymv is a function', function t() {
	assert.strictEqual( typeof dsymv, 'function', 'is a function' );
});

test( 'dsymv has expected arity', function t() {
	assert.strictEqual( dsymv.length, 11, 'has expected arity' );
});

test( 'dsymv throws TypeError for invalid order', function t() {
	assert.throws( function throws() {
		dsymv( 'invalid', 'upper', new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, 2, 1, 2, 2, 1 );
	}, TypeError );
});

test( 'dsymv throws TypeError for invalid uplo', function t() {
	assert.throws( function throws() {
		dsymv( 'row-major', 'invalid', new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, 2, 1, 2, 2, 1 );
	}, TypeError );
});

test( 'dsymv throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		dsymv( 'row-major', 'upper', -1, 2, new Float64Array( 4 ), 2, 2, 1, 2, 2, 1 );
	}, RangeError );
});
