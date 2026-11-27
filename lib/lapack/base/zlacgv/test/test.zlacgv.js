/* eslint-disable no-restricted-syntax */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import zlacgv from './../lib/zlacgv.js';


// TESTS //

test( 'zlacgv is a function', function t() {
	assert.strictEqual( typeof zlacgv, 'function', 'is a function' );
});

test( 'zlacgv has expected arity', function t() {
	assert.strictEqual( zlacgv.length, 3, 'has expected arity' );
});

test( 'zlacgv throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		zlacgv( -1, 2, 1 );
	}, RangeError );
});
