/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dlaqr0 from './../lib/dlaqr0.js';


// TESTS //

test( 'dlaqr0 is a function', function t() {
	assert.strictEqual( typeof dlaqr0, 'function', 'is a function' );
});

test( 'dlaqr0 has expected arity', function t() {
	assert.strictEqual( dlaqr0.length, 1, 'has expected arity' );
});
