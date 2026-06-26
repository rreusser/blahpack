/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */


// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import dsytrs3 from './../lib/index.js';


// TESTS //

test( 'main export is a function', function t() {
	assert.strictEqual( typeof dsytrs3, 'function', 'main export is a function' );
});

test( 'main export has an ndarray method', function t() {
	assert.strictEqual( typeof dsytrs3.ndarray, 'function', 'has ndarray method' );
});

test( 'ndarray method is a function', function t() {
	assert.strictEqual( typeof dsytrs3.ndarray, 'function', 'ndarray method is a function' ); // eslint-disable-line max-len
});
