/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dsyconv from './../lib/dsyconv.js';


// TESTS //

test( 'dsyconv is a function', function t() {
	assert.strictEqual( typeof dsyconv, 'function', 'is a function' );
});

test( 'dsyconv has expected arity', function t() {
	assert.strictEqual( dsyconv.length, 9, 'has expected arity' );
});

test( 'dsyconv throws TypeError for invalid uplo', function t() {
	assert.throws( function throws() {
		dsyconv( 'invalid', 2, new Float64Array( 4 ), new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, new Float64Array( 4 ), 1 );
	}, TypeError );
});

test( 'dsyconv throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		dsyconv( 'upper', 2, -1, new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, new Float64Array( 4 ), 1 );
	}, RangeError );
});
