/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */


// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import zsyconRook from './../lib/index.js';


// TESTS //

test( 'main export is a function', function t() {
	assert.strictEqual( typeof zsyconRook, 'function', 'main export is a function' ); // eslint-disable-line max-len
});

test( 'main export has an ndarray method', function t() {
	assert.strictEqual( typeof zsyconRook.ndarray, 'function', 'has ndarray method' ); // eslint-disable-line max-len
});

test( 'main export expected arity', function t() {
	assert.strictEqual( zsyconRook.length, 12, 'main has expected arity' );
	assert.strictEqual( zsyconRook.ndarray.length, 14, 'ndarray has expected arity' ); // eslint-disable-line max-len
});
