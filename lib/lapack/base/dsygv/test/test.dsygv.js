/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dsygv from './../lib/dsygv.js';


// TESTS //

test( 'dsygv is a function', function t() {
	assert.strictEqual( typeof dsygv, 'function', 'is a function' );
});

test( 'dsygv has expected arity', function t() {
	assert.strictEqual( dsygv.length, 13, 'has expected arity' );
});

test( 'dsygv throws TypeError for invalid uplo', function t() {
	assert.throws( function throws() {
		dsygv( 2, 2, 'invalid', new Float64Array( 4 ), new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, 2, 1, new Float64Array( 4 ), 1, 2 );
	}, TypeError );
});

test( 'dsygv throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		dsygv( 2, 2, 'upper', -1, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, 2, 1, new Float64Array( 4 ), 1, 2 );
	}, RangeError );
});
