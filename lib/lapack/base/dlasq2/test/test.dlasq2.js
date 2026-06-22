/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dlasq2 from './../lib/dlasq2.js';


// TESTS //

test( 'dlasq2 is a function', function t() {
	assert.strictEqual( typeof dlasq2, 'function', 'is a function' );
});

test( 'dlasq2 has expected arity', function t() {
	assert.strictEqual( dlasq2.length, 3, 'has expected arity' );
});

test( 'dlasq2 throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		dlasq2( -1, 2, 1 );
	}, RangeError );
});
