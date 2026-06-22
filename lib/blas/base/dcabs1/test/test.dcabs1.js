/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dcabs1 from './../lib/dcabs1.js';


// TESTS //

test( 'dcabs1 is a function', function t() {
	assert.strictEqual( typeof dcabs1, 'function', 'is a function' );
});

test( 'dcabs1 has expected arity', function t() {
	assert.strictEqual( dcabs1.length, 1, 'has expected arity' );
});
