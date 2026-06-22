/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dlapy2 from './../lib/dlapy2.js';


// TESTS //

test( 'dlapy2 is a function', function t() {
	assert.strictEqual( typeof dlapy2, 'function', 'is a function' );
});

test( 'dlapy2 has expected arity', function t() {
	assert.strictEqual( dlapy2.length, 2, 'has expected arity' );
});
