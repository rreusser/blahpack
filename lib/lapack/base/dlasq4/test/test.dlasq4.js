/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dlasq4 from './../lib/dlasq4.js';


// TESTS //

test( 'dlasq4 is a function', function t() {
	assert.strictEqual( typeof dlasq4, 'function', 'is a function' );
});

test( 'dlasq4 has expected arity', function t() {
	assert.strictEqual( dlasq4.length, 15, 'has expected arity' );
});
