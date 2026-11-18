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
	assert.strictEqual( dsptrd.length, 10, 'has expected arity' );
});

test( 'dsptrd throws TypeError for invalid uplo', function t() {
	assert.throws( function throws() {
		dsptrd( 'column-major', 'invalid', new Float64Array( 4 ), new Float64Array( 4 ), 2, 1, 2, 1, new Float64Array( 4 ), 1 );
	}, TypeError );
});

test( 'dsptrd throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		dsptrd( 'column-major', 'upper', -1, new Float64Array( 4 ), 2, 1, 2, 1, new Float64Array( 4 ), 1 );
	}, RangeError );
});
