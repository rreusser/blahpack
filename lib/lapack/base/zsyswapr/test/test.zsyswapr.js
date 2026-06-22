/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import zsyswapr from './../lib/zsyswapr.js';


// TESTS //

test( 'zsyswapr is a function', function t() {
	assert.strictEqual( typeof zsyswapr, 'function', 'is a function' );
});

test( 'zsyswapr has expected arity', function t() {
	assert.strictEqual( zsyswapr.length, 7, 'has expected arity' );
});

test( 'zsyswapr throws TypeError for invalid order', function t() {
	assert.throws( function throws() {
		zsyswapr( 'invalid', 'upper', 2, new Complex128Array( 4 ), 2, 0, 1 );
	}, TypeError );
});

test( 'zsyswapr throws TypeError for invalid uplo', function t() {
	assert.throws( function throws() {
		zsyswapr( 'row-major', 'invalid', 2, new Complex128Array( 4 ), 2, 0, 1 );
	}, TypeError );
});

test( 'zsyswapr throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		zsyswapr( 'row-major', 'upper', -1, new Complex128Array( 4 ), 2, 0, 1 );
	}, RangeError );
});
