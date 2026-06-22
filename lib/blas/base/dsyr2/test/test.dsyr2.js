/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dsyr2 from './../lib/dsyr2.js';


// TESTS //

test( 'dsyr2 is a function', function t() {
	assert.strictEqual( typeof dsyr2, 'function', 'is a function' );
});

test( 'dsyr2 has expected arity', function t() {
	assert.strictEqual( dsyr2.length, 10, 'has expected arity' );
});

test( 'dsyr2 throws TypeError for invalid order', function t() {
	assert.throws( function throws() {
		dsyr2( 'invalid', 'upper', new Float64Array( 4 ), 2, 2, 1, 2, 1, new Float64Array( 4 ), 2 );
	}, TypeError );
});

test( 'dsyr2 throws TypeError for invalid uplo', function t() {
	assert.throws( function throws() {
		dsyr2( 'row-major', 'invalid', new Float64Array( 4 ), 2, 2, 1, 2, 1, new Float64Array( 4 ), 2 );
	}, TypeError );
});

test( 'dsyr2 throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		dsyr2( 'row-major', 'upper', -1, 2, 2, 1, 2, 1, new Float64Array( 4 ), 2 );
	}, RangeError );
});
