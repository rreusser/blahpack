/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */


// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import dorm22 from './../lib/index.js';


// TESTS //

test( 'main export is a function', function t() {
	assert.strictEqual( typeof dorm22, 'function', 'main export is a function' );
});

test( 'main export has an ndarray method', function t() {
	assert.strictEqual( typeof dorm22.ndarray, 'function', 'has ndarray method' );
});

test( 'main export arity', function t() {
	assert.strictEqual( dorm22.length, 14, 'has expected arity' );
	assert.strictEqual( dorm22.ndarray.length, 18, 'ndarray has expected arity' );
});
