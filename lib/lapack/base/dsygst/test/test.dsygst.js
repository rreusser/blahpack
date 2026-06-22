/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dsygst from './../lib/dsygst.js';


// TESTS //

test( 'dsygst is a function', function t() {
	assert.strictEqual( typeof dsygst, 'function', 'is a function' );
});

test( 'dsygst has expected arity', function t() {
	assert.strictEqual( dsygst.length, 7, 'has expected arity' );
});

test( 'dsygst throws TypeError for invalid uplo', function t() {
	assert.throws( function throws() {
		dsygst( 2, 'invalid', new Float64Array( 4 ), new Float64Array( 4 ), 2, new Float64Array( 4 ), 2 );
	}, TypeError );
});

test( 'dsygst throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		dsygst( 2, 'upper', -1, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2 );
	}, RangeError );
});
