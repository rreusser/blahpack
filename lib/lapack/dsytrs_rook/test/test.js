/* eslint-disable no-restricted-syntax */


// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import dsytrsRook from './../lib/index.js';


// TESTS //

test( 'main export is a function', function t() {
	assert.strictEqual( typeof dsytrsRook, 'function', 'main export is a function' ); // eslint-disable-line max-len
});

test( 'main export has an strided method', function t() {
	assert.strictEqual( typeof dsytrsRook.strided, 'function', 'has strided method' ); // eslint-disable-line max-len
});

test( 'main export and strided are distinct functions', function t() {
	assert.notStrictEqual( dsytrsRook, dsytrsRook.strided, 'are distinct' );
	assert.strictEqual( typeof dsytrsRook.strided, 'function', 'is a function' );
});
