/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dlaqr5 from './../lib/dlaqr5.js';


// TESTS //

test( 'dlaqr5 is a function', function t() {
	assert.strictEqual( typeof dlaqr5, 'function', 'is a function' );
});

test( 'dlaqr5 has expected arity', function t() {
	assert.strictEqual( dlaqr5.length, 6, 'has expected arity' );
});
