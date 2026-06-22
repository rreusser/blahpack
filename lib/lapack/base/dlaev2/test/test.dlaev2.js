/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dlaev2 from './../lib/dlaev2.js';


// TESTS //

test( 'dlaev2 is a function', function t() {
	assert.strictEqual( typeof dlaev2, 'function', 'is a function' );
});

test( 'dlaev2 has expected arity', function t() {
	assert.strictEqual( dlaev2.length, 3, 'has expected arity' );
});
