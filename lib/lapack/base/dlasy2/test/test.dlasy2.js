/* eslint-disable no-restricted-syntax */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import dlasy2 from './../lib/dlasy2.js';


// TESTS //

test( 'dlasy2 is a function', function t() {
	assert.strictEqual( typeof dlasy2, 'function', 'is a function' );
});

test( 'dlasy2 has expected arity', function t() {
	assert.strictEqual( dlasy2.length, 16, 'has expected arity' );
});
