/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dsteqr from './../lib/dsteqr.js';


// TESTS //

test( 'dsteqr is a function', function t() {
	assert.strictEqual( typeof dsteqr, 'function', 'is a function' );
});

test( 'dsteqr has expected arity', function t() {
	assert.strictEqual( dsteqr.length, 11, 'has expected arity' );
});

test( 'dsteqr throws TypeError for invalid order', function t() {
	assert.throws( function throws() {
		dsteqr( 'invalid', 2, new Float64Array( 4 ), 2, 1, 2, 1, new Float64Array( 4 ), 2, new Float64Array( 4 ), 1 );
	}, TypeError );
});

test( 'dsteqr throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		dsteqr( 'row-major', 2, -1, 2, 1, 2, 1, new Float64Array( 4 ), 2, new Float64Array( 4 ), 1 );
	}, RangeError );
});
