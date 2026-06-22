/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dlasd5 from './../lib/dlasd5.js';


// TESTS //

test( 'dlasd5 is a function', function t() {
	assert.strictEqual( typeof dlasd5, 'function', 'is a function' );
});

test( 'dlasd5 has expected arity', function t() {
	assert.strictEqual( dlasd5.length, 11, 'has expected arity' );
});
