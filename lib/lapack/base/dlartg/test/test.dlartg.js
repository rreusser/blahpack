/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dlartg from './../lib/dlartg.js';


// TESTS //

test( 'dlartg is a function', function t() {
	assert.strictEqual( typeof dlartg, 'function', 'is a function' );
});

test( 'dlartg has expected arity', function t() {
	assert.strictEqual( dlartg.length, 2, 'has expected arity' );
});
