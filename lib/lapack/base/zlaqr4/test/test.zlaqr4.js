/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import zlaqr4 from './../lib/zlaqr4.js';


// TESTS //

test( 'zlaqr4 is a function', function t() {
	assert.strictEqual( typeof zlaqr4, 'function', 'is a function' );
});

test( 'zlaqr4 has expected arity', function t() {
	assert.strictEqual( zlaqr4.length, 2, 'has expected arity' );
});
