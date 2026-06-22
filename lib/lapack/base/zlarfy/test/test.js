/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import zlarfy from './../lib/index.js';


// TESTS //

test( 'main export is a function', function t() {
	assert.strictEqual( typeof zlarfy, 'function', 'main export is a function' );
});

test( 'main export has an ndarray method', function t() {
	assert.strictEqual( typeof zlarfy.ndarray, 'function', 'has ndarray method' );
});

test( 'main and ndarray have the expected arity', function t() {
	assert.strictEqual( zlarfy.length, 10, 'main has arity 10' );
	assert.strictEqual( zlarfy.ndarray.length, 13, 'ndarray has arity 13' );
});
