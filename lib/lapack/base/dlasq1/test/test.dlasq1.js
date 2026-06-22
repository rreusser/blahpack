/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dlasq1 from './../lib/dlasq1.js';


// TESTS //

test( 'dlasq1 is a function', function t() {
	assert.strictEqual( typeof dlasq1, 'function', 'is a function' );
});

test( 'dlasq1 has expected arity', function t() {
	assert.strictEqual( dlasq1.length, 7, 'has expected arity' );
});

test( 'dlasq1 throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		dlasq1( -1, 2, 1, 2, 1, new Float64Array( 4 ), 1 );
	}, RangeError );
});
