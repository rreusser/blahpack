/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dlasq3 from './../lib/dlasq3.js';


// TESTS //

test( 'dlasq3 is a function', function t() {
	assert.strictEqual( typeof dlasq3, 'function', 'is a function' );
});

test( 'dlasq3 has expected arity', function t() {
	assert.strictEqual( dlasq3.length, 21, 'has expected arity' );
});
