/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import zgeequ from './../lib/zgeequ.js';


// TESTS //

test( 'zgeequ is a function', function t() {
	assert.strictEqual( typeof zgeequ, 'function', 'is a function' );
});

test( 'zgeequ has expected arity', function t() {
	assert.strictEqual( zgeequ.length, 2, 'has expected arity' );
});
