/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dsbtrd from './../lib/dsbtrd.js';


// TESTS //

test( 'dsbtrd is a function', function t() {
	assert.strictEqual( typeof dsbtrd, 'function', 'is a function' );
});

test( 'dsbtrd has expected arity', function t() {
	assert.strictEqual( dsbtrd.length, 12, 'has expected arity' );
});

test( 'dsbtrd throws TypeError for invalid order', function t() {
	assert.throws( function throws() {
		dsbtrd( 'invalid', 2, 'upper', new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, 2, 2, new Float64Array( 4 ), 2, new Float64Array( 4 ) );
	}, TypeError );
});

test( 'dsbtrd throws TypeError for invalid uplo', function t() {
	assert.throws( function throws() {
		dsbtrd( 'row-major', 2, 'invalid', new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, 2, 2, new Float64Array( 4 ), 2, new Float64Array( 4 ) );
	}, TypeError );
});

test( 'dsbtrd throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		dsbtrd( 'row-major', 2, 'upper', -1, 2, new Float64Array( 4 ), 2, 2, 2, new Float64Array( 4 ), 2, new Float64Array( 4 ) );
	}, RangeError );
});
