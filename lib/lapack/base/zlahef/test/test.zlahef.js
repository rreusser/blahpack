/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import zlahef from './../lib/zlahef.js';


// TESTS //

test( 'zlahef is a function', function t() {
	assert.strictEqual( typeof zlahef, 'function', 'is a function' );
});

test( 'zlahef has expected arity', function t() {
	assert.strictEqual( zlahef.length, 2, 'has expected arity' );
});
