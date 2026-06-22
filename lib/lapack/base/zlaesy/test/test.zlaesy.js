/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import zlaesy from './../lib/zlaesy.js';


// TESTS //

test( 'zlaesy is a function', function t() {
	assert.strictEqual( typeof zlaesy, 'function', 'is a function' );
});

test( 'zlaesy has expected arity', function t() {
	assert.strictEqual( zlaesy.length, 3, 'has expected arity' );
});
