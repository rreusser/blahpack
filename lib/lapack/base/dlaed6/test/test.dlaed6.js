/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dlaed6 from './../lib/dlaed6.js';


// TESTS //

test( 'dlaed6 is a function', function t() {
	assert.strictEqual( typeof dlaed6, 'function', 'is a function' );
});

test( 'dlaed6 has expected arity', function t() {
	assert.strictEqual( dlaed6.length, 7, 'has expected arity' );
});
