/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dlagts from './../lib/dlagts.js';


// TESTS //

test( 'dlagts is a function', function t() {
	assert.strictEqual( typeof dlagts, 'function', 'is a function' );
});

test( 'dlagts has expected arity', function t() {
	assert.strictEqual( dlagts.length, 15, 'has expected arity' );
});

test( 'dlagts throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		dlagts( 2, -1, 2, 1, 2, 1, 2, 1, 2, 1, new Float64Array( 4 ), 1, 2, 1, 2 );
	}, RangeError );
});
