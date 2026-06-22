/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dlarft from './../lib/dlarft.js';


// TESTS //

test( 'dlarft is a function', function t() {
	assert.strictEqual( typeof dlarft, 'function', 'is a function' );
});

test( 'dlarft has expected arity', function t() {
	assert.strictEqual( dlarft.length, 11, 'has expected arity' );
});

test( 'dlarft throws TypeError for invalid order', function t() {
	assert.throws( function throws() {
		dlarft( 'invalid', 2, 2, new Float64Array( 4 ), new Float64Array( 4 ), new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, new Float64Array( 4 ), 2 );
	}, TypeError );
});

test( 'dlarft throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		dlarft( 'row-major', 2, 2, -1, new Float64Array( 4 ), new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, new Float64Array( 4 ), 2 );
	}, RangeError );
});

test( 'dlarft throws RangeError for negative K', function t() {
	assert.throws( function throws() {
		dlarft( 'row-major', 2, 2, new Float64Array( 4 ), -1, new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, new Float64Array( 4 ), 2 );
	}, RangeError );
});
