/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import zlatrs from './../lib/zlatrs.js';


// TESTS //

test( 'zlatrs is a function', function t() {
	assert.strictEqual( typeof zlatrs, 'function', 'is a function' );
});

test( 'zlatrs has expected arity', function t() {
	assert.strictEqual( zlatrs.length, 2, 'has expected arity' );
});
