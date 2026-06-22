/* eslint-disable no-restricted-syntax, stdlib/first-unit-test, camelcase */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import zsyconvf_rook from './../lib/index.js';


// TESTS //

test( 'main export is a function', function t() {
	assert.strictEqual( typeof zsyconvf_rook, 'function', 'main export is a function' ); // eslint-disable-line max-len
});

test( 'main export has an ndarray method', function t() {
	assert.strictEqual( typeof zsyconvf_rook.ndarray, 'function', 'has ndarray method' ); // eslint-disable-line max-len
});

test( 'main export arity matches the layout wrapper', function t() {
	assert.strictEqual( zsyconvf_rook.length, 11, 'main arity' );
});

test( 'main export ndarray arity matches base signature', function t() {
	assert.strictEqual( zsyconvf_rook.ndarray.length, 13, 'ndarray arity' );
});
