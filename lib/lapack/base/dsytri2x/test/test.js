/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import dsytri2x from './../lib/index.js';


// TESTS //

test( 'main export is a function', function t() {
	assert.strictEqual( typeof dsytri2x, 'function', 'main export is a function' );
});

test( 'main export has an ndarray method', function t() {
	assert.strictEqual( typeof dsytri2x.ndarray, 'function', 'has ndarray method' ); // eslint-disable-line max-len
});

test( 'ndarray method is a function', function t() {
	assert.strictEqual( typeof dsytri2x.ndarray, 'function', 'ndarray method is a function' ); // eslint-disable-line max-len
});
