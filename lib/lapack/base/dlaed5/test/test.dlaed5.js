/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dlaed5 from './../lib/dlaed5.js';


// TESTS //

test( 'dlaed5 is a function', function t() {
	assert.strictEqual( typeof dlaed5, 'function', 'is a function' );
});

test( 'dlaed5 has expected arity', function t() {
	assert.strictEqual( dlaed5.length, 6, 'has expected arity' );
});
