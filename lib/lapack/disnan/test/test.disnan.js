/* eslint-disable no-restricted-syntax */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import disnan from './../lib/disnan.js';


// TESTS //

test( 'disnan is a function', function t() {
	assert.strictEqual( typeof disnan, 'function', 'is a function' );
});

test( 'disnan has expected arity', function t() {
	assert.strictEqual( disnan.length, 1, 'has expected arity' );
});
