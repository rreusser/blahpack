/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import zlaqr0 from './../lib/zlaqr0.js';


// TESTS //

test( 'zlaqr0 is a function', function t() {
	assert.strictEqual( typeof zlaqr0, 'function', 'is a function' );
});

test( 'zlaqr0 has expected arity', function t() {
	assert.strictEqual( zlaqr0.length, 2, 'has expected arity' );
});
