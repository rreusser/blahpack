
/* eslint-disable no-restricted-syntax, stdlib/first-unit-test, camelcase */


// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import dla_syrcond from './../lib/index.js';


// TESTS //

test( 'main export is a function', function t() {
	assert.strictEqual( typeof dla_syrcond, 'function', 'main export is a function' ); // eslint-disable-line max-len
});

test( 'main export has an ndarray method', function t() {
	assert.strictEqual( typeof dla_syrcond.ndarray, 'function', 'has ndarray method' ); // eslint-disable-line max-len
});

test( 'main export has expected arity (18)', function t() {
	assert.strictEqual( dla_syrcond.length, 18, 'has expected arity' );
});

test( 'ndarray method has expected arity (23)', function t() {
	assert.strictEqual( dla_syrcond.ndarray.length, 23, 'ndarray has expected arity' ); // eslint-disable-line max-len
});
