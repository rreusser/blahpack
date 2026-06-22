/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import zlartv from './../lib/zlartv.js';


// TESTS //

test( 'zlartv is a function', function t() {
	assert.strictEqual( typeof zlartv, 'function', 'is a function' );
});

test( 'zlartv has expected arity', function t() {
	assert.strictEqual( zlartv.length, 8, 'has expected arity' );
});

test( 'zlartv throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		zlartv( -1, 2, 1, 2, 1, 2, 2, 1 );
	}, RangeError );
});
