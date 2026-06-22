/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dsytrd from './../lib/dsytrd.js';


// TESTS //

test( 'dsytrd is a function', function t() {
	assert.strictEqual( typeof dsytrd, 'function', 'is a function' );
});

test( 'dsytrd has expected arity', function t() {
	assert.strictEqual( dsytrd.length, 11, 'has expected arity' );
});

test( 'dsytrd throws TypeError for invalid order', function t() {
	assert.throws( function throws() {
		dsytrd( 'invalid', 'upper', new Float64Array( 4 ), new Float64Array( 4 ), 2, 2, 1, 2, 1, new Float64Array( 4 ), 1 );
	}, TypeError );
});

test( 'dsytrd throws TypeError for invalid uplo', function t() {
	assert.throws( function throws() {
		dsytrd( 'row-major', 'invalid', new Float64Array( 4 ), new Float64Array( 4 ), 2, 2, 1, 2, 1, new Float64Array( 4 ), 1 );
	}, TypeError );
});

test( 'dsytrd throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		dsytrd( 'row-major', 'upper', -1, new Float64Array( 4 ), 2, 2, 1, 2, 1, new Float64Array( 4 ), 1 );
	}, RangeError );
});
