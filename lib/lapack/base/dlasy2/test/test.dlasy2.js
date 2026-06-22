/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dlasy2 from './../lib/dlasy2.js';


// TESTS //

test( 'dlasy2 is a function', function t() {
	assert.strictEqual( typeof dlasy2, 'function', 'is a function' );
});

test( 'dlasy2 has expected arity', function t() {
	assert.strictEqual( dlasy2.length, 15, 'has expected arity' );
});
