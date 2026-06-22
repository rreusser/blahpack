/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import zlartg from './../lib/zlartg.js';


// TESTS //

test( 'zlartg is a function', function t() {
	assert.strictEqual( typeof zlartg, 'function', 'is a function' );
});

test( 'zlartg has expected arity', function t() {
	assert.strictEqual( zlartg.length, 10, 'has expected arity' );
});
