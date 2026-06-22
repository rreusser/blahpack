/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import zheconRook from './../lib/index.js';


// TESTS //

test( 'main export is a function', function t() {
	assert.strictEqual( typeof zheconRook, 'function', 'main export is a function' );
});

test( 'main export has an ndarray method', function t() {
	assert.strictEqual( typeof zheconRook.ndarray, 'function', 'has ndarray method' );
});

test( 'main export expected arity', function t() {
	assert.strictEqual( zheconRook.length, 12, 'main has expected arity' );
	assert.strictEqual( zheconRook.ndarray.length, 14, 'ndarray has expected arity' );
});
