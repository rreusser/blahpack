/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import zlaev2 from './../lib/zlaev2.js';


// TESTS //

test( 'zlaev2 is a function', function t() {
	assert.strictEqual( typeof zlaev2, 'function', 'is a function' );
});

test( 'zlaev2 has expected arity', function t() {
	assert.strictEqual( zlaev2.length, 3, 'has expected arity' );
});
