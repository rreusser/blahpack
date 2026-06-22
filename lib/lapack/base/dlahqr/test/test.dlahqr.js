/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dlahqr from './../lib/dlahqr.js';


// TESTS //

test( 'dlahqr is a function', function t() {
	assert.strictEqual( typeof dlahqr, 'function', 'is a function' );
});

test( 'dlahqr has expected arity', function t() {
	assert.strictEqual( dlahqr.length, 15, 'has expected arity' );
});

test( 'dlahqr throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		dlahqr( 2, 2, -1, 2, 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, new Float64Array( 4 ), 1, 2, 2, new Float64Array( 4 ), 2 );
	}, RangeError );
});
