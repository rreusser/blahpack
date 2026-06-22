/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dlanv2 from './../lib/dlanv2.js';


// TESTS //

test( 'dlanv2 is a function', function t() {
	assert.strictEqual( typeof dlanv2, 'function', 'is a function' );
});

test( 'dlanv2 has expected arity', function t() {
	assert.strictEqual( dlanv2.length, 4, 'has expected arity' );
});
