/* eslint-disable no-restricted-syntax */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import dlar2v from './../lib/dlar2v.js';


// TESTS //

test( 'dlar2v is a function', function t() {
	assert.strictEqual( typeof dlar2v, 'function', 'is a function' );
});

test( 'dlar2v has expected arity', function t() {
	assert.strictEqual( dlar2v.length, 11, 'has expected arity' );
});

test( 'dlar2v throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		dlar2v( -1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1 );
	}, RangeError );
});
