/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import zpbcon from './../lib/zpbcon.js';


// TESTS //

test( 'zpbcon is a function', function t() {
	assert.strictEqual( typeof zpbcon, 'function', 'is a function' );
});

test( 'zpbcon has expected arity', function t() {
	assert.strictEqual( zpbcon.length, 2, 'has expected arity' );
});
