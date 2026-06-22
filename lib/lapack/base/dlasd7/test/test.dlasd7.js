/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dlasd7 from './../lib/dlasd7.js';


// TESTS //

test( 'dlasd7 is a function', function t() {
	assert.strictEqual( typeof dlasd7, 'function', 'is a function' );
});

test( 'dlasd7 has expected arity', function t() {
	assert.strictEqual( dlasd7.length, 22, 'has expected arity' );
});
