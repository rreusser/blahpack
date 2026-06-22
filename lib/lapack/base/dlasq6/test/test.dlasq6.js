/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dlasq6 from './../lib/dlasq6.js';


// TESTS //

test( 'dlasq6 is a function', function t() {
	assert.strictEqual( typeof dlasq6, 'function', 'is a function' );
});

test( 'dlasq6 has expected arity', function t() {
	assert.strictEqual( dlasq6.length, 5, 'has expected arity' );
});
