/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import zlaqr1 from './../lib/zlaqr1.js';


// TESTS //

test( 'zlaqr1 is a function', function t() {
	assert.strictEqual( typeof zlaqr1, 'function', 'is a function' );
});

test( 'zlaqr1 has expected arity', function t() {
	assert.strictEqual( zlaqr1.length, 2, 'has expected arity' );
});
