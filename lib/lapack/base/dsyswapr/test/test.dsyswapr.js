/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dsyswapr from './../lib/dsyswapr.js';


// TESTS //

test( 'dsyswapr is a function', function t() {
	assert.strictEqual( typeof dsyswapr, 'function', 'is a function' );
});

test( 'dsyswapr has expected arity', function t() {
	assert.strictEqual( dsyswapr.length, 7, 'has expected arity' );
});

test( 'dsyswapr throws TypeError for invalid order', function t() {
	assert.throws( function throws() {
		dsyswapr( 'invalid', 'upper', 2, new Float64Array( 4 ), 2, 2, 2 );
	}, TypeError );
});

test( 'dsyswapr throws TypeError for invalid uplo', function t() {
	assert.throws( function throws() {
		dsyswapr( 'row-major', 'invalid', 2, new Float64Array( 4 ), 2, 2, 2 );
	}, TypeError );
});

test( 'dsyswapr throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		dsyswapr( 'row-major', 'upper', -1, new Float64Array( 4 ), 2, 2, 2 );
	}, RangeError );
});
