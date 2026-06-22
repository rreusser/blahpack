/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dsptrd from './../lib/dsptrd.js';


// TESTS //

test( 'dsptrd is a function', function t() {
	assert.strictEqual( typeof dsptrd, 'function', 'is a function' );
});

test( 'dsptrd has expected arity', function t() {
	assert.strictEqual( dsptrd.length, 6, 'has expected arity' );
});

test( 'dsptrd throws TypeError for invalid uplo', function t() {
	assert.throws( function throws() {
		dsptrd( 'invalid', new Float64Array( 4 ), new Float64Array( 4 ), 2, 2, new Float64Array( 4 ) );
	}, TypeError );
});

test( 'dsptrd throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		dsptrd( 'upper', -1, new Float64Array( 4 ), 2, 2, new Float64Array( 4 ) );
	}, RangeError );
});
