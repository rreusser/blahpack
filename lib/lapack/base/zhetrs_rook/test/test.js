/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */


// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import zhetrsRook from './../lib/index.js';


// TESTS //

test( 'main export is a function', function t() {
	assert.strictEqual( typeof zhetrsRook, 'function', 'main export is a function' ); // eslint-disable-line max-len
});

test( 'main export has an ndarray method', function t() {
	assert.strictEqual( typeof zhetrsRook.ndarray, 'function', 'has ndarray method' ); // eslint-disable-line max-len
});

test( 'main export and ndarray are distinct functions', function t() {
	assert.notStrictEqual( zhetrsRook, zhetrsRook.ndarray, 'are distinct' );
	assert.strictEqual( typeof zhetrsRook.ndarray, 'function', 'is a function' );
});
