/* eslint-disable no-restricted-syntax */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import zladiv from './../lib/zladiv.js';


// TESTS //

test( 'zladiv is a function', function t() {
	assert.strictEqual( typeof zladiv, 'function', 'is a function' );
});

test( 'zladiv has expected arity', function t() {
	assert.strictEqual( zladiv.length, 3, 'has expected arity' );
});
