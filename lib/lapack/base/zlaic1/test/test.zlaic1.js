/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import zlaic1 from './../lib/zlaic1.js';


// TESTS //

test( 'zlaic1 is a function', function t() {
	assert.strictEqual( typeof zlaic1, 'function', 'is a function' );
});

test( 'zlaic1 has expected arity', function t() {
	assert.strictEqual( zlaic1.length, 11, 'has expected arity' );
});
