/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import dlarz from './../lib/index.js';


// TESTS //

test( 'main export is a function', function t() {
	assert.strictEqual( typeof dlarz, 'function', 'main export is a function' );
});

test( 'main export has an ndarray method', function t() {
	assert.strictEqual( typeof dlarz.ndarray, 'function', 'has ndarray method' );
});

test( 'main and ndarray exports differ', function t() {
	assert.notStrictEqual( dlarz, dlarz.ndarray, 'main and ndarray are distinct functions' );
});
