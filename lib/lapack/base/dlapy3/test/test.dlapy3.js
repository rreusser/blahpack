/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dlapy3 from './../lib/dlapy3.js';


// TESTS //

test( 'dlapy3 is a function', function t() {
	assert.strictEqual( typeof dlapy3, 'function', 'is a function' );
});

test( 'dlapy3 has expected arity', function t() {
	assert.strictEqual( dlapy3.length, 3, 'has expected arity' );
});
