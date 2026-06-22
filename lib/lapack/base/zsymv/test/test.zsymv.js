/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import zsymv from './../lib/zsymv.js';


// TESTS //

test( 'zsymv is a function', function t() {
	assert.strictEqual( typeof zsymv, 'function', 'is a function' );
});

test( 'zsymv has expected arity', function t() {
	assert.strictEqual( zsymv.length, 10, 'has expected arity' );
});

test( 'zsymv throws TypeError for invalid uplo', function t() {
	assert.throws( function throws() {
		zsymv( 'invalid', new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, 2, 1, 2, 2, 1 );
	}, TypeError );
});

test( 'zsymv throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		zsymv( 'upper', -1, 2, new Float64Array( 4 ), 2, 2, 1, 2, 2, 1 );
	}, RangeError );
});
