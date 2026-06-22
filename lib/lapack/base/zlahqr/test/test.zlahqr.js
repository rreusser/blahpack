/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import zlahqr from './../lib/zlahqr.js';


// TESTS //

test( 'zlahqr is a function', function t() {
	assert.strictEqual( typeof zlahqr, 'function', 'is a function' );
});

test( 'zlahqr has expected arity', function t() {
	assert.strictEqual( zlahqr.length, 2, 'has expected arity' );
});
