/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dlaisnan from './../lib/dlaisnan.js';


// TESTS //

test( 'dlaisnan is a function', function t() {
	assert.strictEqual( typeof dlaisnan, 'function', 'is a function' );
});

test( 'dlaisnan has expected arity', function t() {
	assert.strictEqual( dlaisnan.length, 2, 'has expected arity' );
});
