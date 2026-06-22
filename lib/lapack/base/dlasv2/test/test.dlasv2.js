/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dlasv2 from './../lib/dlasv2.js';


// TESTS //

test( 'dlasv2 is a function', function t() {
	assert.strictEqual( typeof dlasv2, 'function', 'is a function' );
});

test( 'dlasv2 has expected arity', function t() {
	assert.strictEqual( dlasv2.length, 3, 'has expected arity' );
});
