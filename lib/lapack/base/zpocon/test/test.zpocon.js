/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import zpocon from './../lib/zpocon.js';


// TESTS //

test( 'zpocon is a function', function t() {
	assert.strictEqual( typeof zpocon, 'function', 'is a function' );
});

test( 'zpocon has expected arity', function t() {
	assert.strictEqual( zpocon.length, 2, 'has expected arity' );
});
