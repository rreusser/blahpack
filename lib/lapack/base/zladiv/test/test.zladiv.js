/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import zladiv from './../lib/zladiv.js';


// TESTS //

test( 'zladiv is a function', function t() {
	assert.strictEqual( typeof zladiv, 'function', 'is a function' );
});

test( 'zladiv has expected arity', function t() {
	assert.strictEqual( zladiv.length, 6, 'has expected arity' );
});
