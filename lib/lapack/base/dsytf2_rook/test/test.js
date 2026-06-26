/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */


// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import dsytf2Rook from './../lib/index.js';


// TESTS //

test( 'main export is a function', function t() {
	assert.strictEqual( typeof dsytf2Rook, 'function', 'main export is a function' ); // eslint-disable-line max-len
});

test( 'main export has an ndarray method', function t() {
	assert.strictEqual( typeof dsytf2Rook.ndarray, 'function', 'has ndarray method' ); // eslint-disable-line max-len
});

test( 'main export and ndarray are distinct functions', function t() {
	assert.notStrictEqual( dsytf2Rook, dsytf2Rook.ndarray, 'are distinct' );
	assert.strictEqual( typeof dsytf2Rook.ndarray, 'function', 'is a function' );
});
