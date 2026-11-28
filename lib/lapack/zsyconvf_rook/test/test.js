/* eslint-disable no-restricted-syntax, camelcase */


// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import zsyconvf_rook from './../lib/index.js';


// TESTS //

test( 'main export is a function', function t() {
	assert.strictEqual( typeof zsyconvf_rook, 'function', 'main export is a function' ); // eslint-disable-line max-len
});

test( 'main export has an strided method', function t() {
	assert.strictEqual( typeof zsyconvf_rook.strided, 'function', 'has strided method' ); // eslint-disable-line max-len
});

test( 'main export arity matches the layout wrapper', function t() {
	assert.strictEqual( zsyconvf_rook.length, 10, 'main arity' );
});

test( 'main export strided arity matches base signature', function t() {
	assert.strictEqual( zsyconvf_rook.strided.length, 13, 'strided arity' );
});
