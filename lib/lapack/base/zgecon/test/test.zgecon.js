/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import zgecon from './../lib/zgecon.js';


// TESTS //

test( 'zgecon is a function', function t() {
	assert.strictEqual( typeof zgecon, 'function', 'is a function' );
});

test( 'zgecon has expected arity', function t() {
	assert.strictEqual( zgecon.length, 2, 'has expected arity' );
});
