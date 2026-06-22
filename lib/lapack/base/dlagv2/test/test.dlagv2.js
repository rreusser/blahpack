/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dlagv2 from './../lib/dlagv2.js';


// TESTS //

test( 'dlagv2 is a function', function t() {
	assert.strictEqual( typeof dlagv2, 'function', 'is a function' );
});

test( 'dlagv2 has expected arity', function t() {
	assert.strictEqual( dlagv2.length, 7, 'has expected arity' );
});
