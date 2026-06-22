/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import zlaqr5 from './../lib/zlaqr5.js';


// TESTS //

test( 'zlaqr5 is a function', function t() {
	assert.strictEqual( typeof zlaqr5, 'function', 'is a function' );
});

test( 'zlaqr5 has expected arity', function t() {
	assert.strictEqual( zlaqr5.length, 2, 'has expected arity' );
});
