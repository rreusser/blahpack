/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dstevr from './../lib/dstevr.js';


// TESTS //

test( 'dstevr is a function', function t() {
	assert.strictEqual( typeof dstevr, 'function', 'is a function' );
});

test( 'dstevr has expected arity', function t() {
	assert.strictEqual( dstevr.length, 25, 'has expected arity' );
});

test( 'dstevr throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		dstevr( 2, 2, -1, 2, 1, 2, 1, 2, 2, 2, 2, 2, 2, 2, 1, new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, new Float64Array( 4 ), 1, 2, new Float64Array( 4 ), 1, 2 );
	}, RangeError );
});
