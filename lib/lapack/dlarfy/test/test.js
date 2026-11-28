/* eslint-disable no-restricted-syntax */


// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import dlarfy from './../lib/index.js';


// TESTS //

test( 'main export is a function', function t() {
	assert.strictEqual( typeof dlarfy, 'function', 'main export is a function' );
});

test( 'main export has an strided method', function t() {
	assert.strictEqual( typeof dlarfy.strided, 'function', 'has strided method' );
});

test( 'main and strided have the expected arity', function t() {
	assert.strictEqual( dlarfy.length, 9, 'main has arity 9' );
	assert.strictEqual( dlarfy.strided.length, 13, 'strided has arity 13' );
});
