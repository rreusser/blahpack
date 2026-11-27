/* eslint-disable no-restricted-syntax */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import dlae2 from './../lib/dlae2.js';


// TESTS //

test( 'dlae2 is a function', function t() {
	assert.strictEqual( typeof dlae2, 'function', 'is a function' );
});

test( 'dlae2 has expected arity', function t() {
	assert.strictEqual( dlae2.length, 5, 'has expected arity' );
});
