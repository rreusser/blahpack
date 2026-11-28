/* eslint-disable no-restricted-syntax */


// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import zsyconRook from './../lib/index.js';


// TESTS //

test( 'main export is a function', function t() {
	assert.strictEqual( typeof zsyconRook, 'function', 'main export is a function' ); // eslint-disable-line max-len
});

test( 'main export has an strided method', function t() {
	assert.strictEqual( typeof zsyconRook.strided, 'function', 'has strided method' ); // eslint-disable-line max-len
});

test( 'main export expected arity', function t() {
	assert.strictEqual( zsyconRook.length, 10, 'main has expected arity' );
	assert.strictEqual( zsyconRook.strided.length, 14, 'strided has expected arity' ); // eslint-disable-line max-len
});
