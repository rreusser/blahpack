/* eslint-disable no-restricted-syntax */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import dlasq5 from './../lib/dlasq5.js';


// TESTS //

test( 'dlasq5 is a function', function t() {
	assert.strictEqual( typeof dlasq5, 'function', 'is a function' );
});

test( 'dlasq5 has expected arity', function t() {
	assert.strictEqual( dlasq5.length, 15, 'has expected arity' );
});
