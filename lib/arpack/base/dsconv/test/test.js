

/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import dsconv from './../lib/index.js';


// TESTS //

test( 'main export is a function', function t() {
	assert.strictEqual( typeof dsconv, 'function', 'main export is a function' );
});

test( 'main export has an ndarray method', function t() {
	assert.strictEqual( typeof dsconv.ndarray, 'function', 'has ndarray method' );
});
