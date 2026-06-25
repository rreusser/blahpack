/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dhseqr from './../lib/dhseqr.js';


// TESTS //

test( 'dhseqr is a function', function t() {
	assert.strictEqual( typeof dhseqr, 'function', 'is a function' );
});

test( 'dhseqr has expected arity', function t() {
	assert.strictEqual( dhseqr.length, 15, 'has expected arity' );
});

test( 'dhseqr throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		dhseqr( 2, 2, -1, 2, 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, new Float64Array( 4 ), 1, new Float64Array( 4 ), 2 );
	}, RangeError );
});
