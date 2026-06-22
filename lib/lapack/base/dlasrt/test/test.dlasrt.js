/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dlasrt from './../lib/dlasrt.js';


// TESTS //

test( 'dlasrt is a function', function t() {
	assert.strictEqual( typeof dlasrt, 'function', 'is a function' );
});

test( 'dlasrt has expected arity', function t() {
	assert.strictEqual( dlasrt.length, 4, 'has expected arity' );
});

test( 'dlasrt throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		dlasrt( 2, -1, 2, 1 );
	}, RangeError );
});
