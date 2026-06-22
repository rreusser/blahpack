/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import zhseqr from './../lib/zhseqr.js';


// TESTS //

test( 'zhseqr is a function', function t() {
	assert.strictEqual( typeof zhseqr, 'function', 'is a function' );
});

test( 'zhseqr has expected arity', function t() {
	assert.strictEqual( zhseqr.length, 14, 'has expected arity' );
});

test( 'zhseqr throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		zhseqr( 2, 2, -1, 2, 2, new Float64Array( 4 ), 2, 2, 1, new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, 2 );
	}, RangeError );
});
