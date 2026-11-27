/* eslint-disable no-restricted-syntax */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
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
