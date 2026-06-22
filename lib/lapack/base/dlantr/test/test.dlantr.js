/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dlantr from './../lib/dlantr.js';


// TESTS //

test( 'dlantr is a function', function t() {
	assert.strictEqual( typeof dlantr, 'function', 'is a function' );
});

test( 'dlantr has expected arity', function t() {
	assert.strictEqual( dlantr.length, 2, 'has expected arity' );
});
