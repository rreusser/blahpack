/* eslint-disable no-restricted-syntax */


// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import dsyconRook from './../lib/index.js';


// TESTS //

test( 'main export is a function', function t() {
	assert.strictEqual( typeof dsyconRook, 'function', 'main export is a function' ); // eslint-disable-line max-len
});

test( 'main export has an strided method', function t() {
	assert.strictEqual( typeof dsyconRook.strided, 'function', 'has strided method' ); // eslint-disable-line max-len
});

test( 'main export expected arity', function t() {
	assert.strictEqual( dsyconRook.length, 11, 'main has expected arity' );
	assert.strictEqual( dsyconRook.strided.length, 17, 'strided has expected arity' ); // eslint-disable-line max-len
});
