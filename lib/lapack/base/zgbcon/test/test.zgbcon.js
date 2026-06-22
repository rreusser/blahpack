/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import zgbcon from './../lib/zgbcon.js';


// TESTS //

test( 'zgbcon is a function', function t() {
	assert.strictEqual( typeof zgbcon, 'function', 'is a function' );
});

test( 'zgbcon has expected arity', function t() {
	assert.strictEqual( zgbcon.length, 2, 'has expected arity' );
});
