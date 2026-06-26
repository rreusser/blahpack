
/* eslint-disable no-restricted-syntax, stdlib/first-unit-test, camelcase */


// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import dla_gbamv from './../lib/index.js';


// TESTS //

test( 'main export is a function', function t() {
	assert.strictEqual( typeof dla_gbamv, 'function', 'main export is a function' ); // eslint-disable-line max-len
});

test( 'main export has an ndarray method', function t() {
	assert.strictEqual( typeof dla_gbamv.ndarray, 'function', 'has ndarray method' ); // eslint-disable-line max-len
});

test( 'main export has expected arity (14)', function t() {
	assert.strictEqual( dla_gbamv.length, 14, 'has expected arity' );
});

test( 'ndarray method has expected arity (17)', function t() {
	assert.strictEqual( dla_gbamv.ndarray.length, 17, 'ndarray has expected arity' ); // eslint-disable-line max-len
});
