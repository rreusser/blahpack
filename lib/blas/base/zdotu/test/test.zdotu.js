/* eslint-disable no-restricted-syntax */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import zdotu from './../lib/zdotu.js';


// TESTS //

test( 'zdotu is a function', function t() {
	assert.strictEqual( typeof zdotu, 'function', 'is a function' );
});

test( 'zdotu has expected arity', function t() {
	assert.strictEqual( zdotu.length, 5, 'has expected arity' );
});

test( 'zdotu throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		zdotu( -1, 2, 1, 2, 1 );
	}, RangeError );
});
