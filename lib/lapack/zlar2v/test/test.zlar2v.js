/* eslint-disable no-restricted-syntax */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import zlar2v from './../lib/zlar2v.js';


// TESTS //

test( 'zlar2v is a function', function t() {
	assert.strictEqual( typeof zlar2v, 'function', 'is a function' );
});

test( 'zlar2v has expected arity', function t() {
	assert.strictEqual( zlar2v.length, 11, 'has expected arity' );
});

test( 'zlar2v throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		zlar2v( -1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1 );
	}, RangeError );
});
