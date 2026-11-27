/* eslint-disable no-restricted-syntax */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import dlaisnan from './../lib/dlaisnan.js';


// TESTS //

test( 'dlaisnan is a function', function t() {
	assert.strictEqual( typeof dlaisnan, 'function', 'is a function' );
});

test( 'dlaisnan has expected arity', function t() {
	assert.strictEqual( dlaisnan.length, 2, 'has expected arity' );
});
