/* eslint-disable no-restricted-syntax */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import zlargv from './../lib/zlargv.js';


// TESTS //

test( 'zlargv is a function', function t() {
	assert.strictEqual( typeof zlargv, 'function', 'is a function' );
});

test( 'zlargv has expected arity', function t() {
	assert.strictEqual( zlargv.length, 7, 'has expected arity' );
});

test( 'zlargv throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		zlargv( -1, 2, 1, 2, 1, 2, 1 );
	}, RangeError );
});
