/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dlabad from './../lib/dlabad.js';


// TESTS //

test( 'dlabad is a function', function t() {
	assert.strictEqual( typeof dlabad, 'function', 'is a function' );
});

test( 'dlabad has expected arity', function t() {
	assert.strictEqual( dlabad.length, 2, 'has expected arity' );
});
