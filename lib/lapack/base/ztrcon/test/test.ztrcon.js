/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import ztrcon from './../lib/ztrcon.js';


// TESTS //

test( 'ztrcon is a function', function t() {
	assert.strictEqual( typeof ztrcon, 'function', 'is a function' );
});

test( 'ztrcon has expected arity', function t() {
	assert.strictEqual( ztrcon.length, 2, 'has expected arity' );
});
