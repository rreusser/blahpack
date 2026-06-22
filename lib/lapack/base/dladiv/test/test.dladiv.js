/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dladiv from './../lib/dladiv.js';


// TESTS //

test( 'dladiv is a function', function t() {
	assert.strictEqual( typeof dladiv, 'function', 'is a function' );
});

test( 'dladiv has expected arity', function t() {
	assert.strictEqual( dladiv.length, 5, 'has expected arity' );
});
