/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import drotmg from './../lib/drotmg.js';


// TESTS //

test( 'drotmg is a function', function t() {
	assert.strictEqual( typeof drotmg, 'function', 'is a function' );
});

test( 'drotmg has expected arity', function t() {
	assert.strictEqual( drotmg.length, 4, 'has expected arity' );
});
