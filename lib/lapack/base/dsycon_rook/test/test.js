/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import dsyconRook from './../lib/index.js';


// TESTS //

test( 'main export is a function', function t() {
	assert.strictEqual( typeof dsyconRook, 'function', 'main export is a function' );
});

test( 'main export has an ndarray method', function t() {
	assert.strictEqual( typeof dsyconRook.ndarray, 'function', 'has ndarray method' );
});

test( 'main export expected arity', function t() {
	assert.strictEqual( dsyconRook.length, 15, 'main has expected arity' );
	assert.strictEqual( dsyconRook.ndarray.length, 17, 'ndarray has expected arity' );
});
