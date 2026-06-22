/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import zlatbs from './../lib/zlatbs.js';


// TESTS //

test( 'zlatbs is a function', function t() {
	assert.strictEqual( typeof zlatbs, 'function', 'is a function' );
});

test( 'zlatbs has expected arity', function t() {
	assert.strictEqual( zlatbs.length, 2, 'has expected arity' );
});
