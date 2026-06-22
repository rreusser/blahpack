/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import zlarnv from './../lib/zlarnv.js';


// TESTS //

test( 'zlarnv is a function', function t() {
	assert.strictEqual( typeof zlarnv, 'function', 'is a function' );
});

test( 'zlarnv has expected arity', function t() {
	assert.strictEqual( zlarnv.length, 6, 'has expected arity' );
});

test( 'zlarnv throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		zlarnv( 2, 2, 1, -1, 2, 1 );
	}, RangeError );
});
