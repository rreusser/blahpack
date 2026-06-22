/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import dsytrsRook from './../lib/index.js';


// TESTS //

test( 'main export is a function', function t() {
	assert.strictEqual( typeof dsytrsRook, 'function', 'main export is a function' );
});

test( 'main export has an ndarray method', function t() {
	assert.strictEqual( typeof dsytrsRook.ndarray, 'function', 'has ndarray method' );
});

test( 'main export and ndarray are distinct functions', function t() {
	assert.notStrictEqual( dsytrsRook, dsytrsRook.ndarray, 'are distinct' );
	assert.strictEqual( typeof dsytrsRook.ndarray, 'function', 'is a function' );
});
