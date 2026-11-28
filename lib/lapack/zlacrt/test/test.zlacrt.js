/* eslint-disable no-restricted-syntax */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import zlacrt from './../lib/zlacrt.js';


// TESTS //

test( 'zlacrt is a function', function t() {
	assert.strictEqual( typeof zlacrt, 'function', 'is a function' );
});

test( 'zlacrt has expected arity', function t() {
	assert.strictEqual( zlacrt.length, 7, 'has expected arity' );
});

test( 'zlacrt throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		zlacrt( -1, 2, 1, 2, 1, 2, 2 );
	}, RangeError );
});
