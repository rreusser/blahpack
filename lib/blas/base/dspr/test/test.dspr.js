/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dspr from './../lib/dspr.js';


// TESTS //

test( 'dspr is a function', function t() {
	assert.strictEqual( typeof dspr, 'function', 'is a function' );
});

test( 'dspr has expected arity', function t() {
	assert.strictEqual( dspr.length, 7, 'has expected arity' );
});

test( 'dspr throws TypeError for invalid uplo', function t() {
	assert.throws( function throws() {
		dspr( 'invalid', new Float64Array( 4 ), 2, 2, 1, new Float64Array( 4 ), 1 );
	}, TypeError );
});

test( 'dspr throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		dspr( 'upper', -1, 2, 2, 1, new Float64Array( 4 ), 1 );
	}, RangeError );
});
