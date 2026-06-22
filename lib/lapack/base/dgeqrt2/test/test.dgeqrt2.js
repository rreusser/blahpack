
/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dgeqrt2 from './../lib/dgeqrt2.js';


// TESTS //

test( 'dgeqrt2 is a function', function t() {
	assert.strictEqual( typeof dgeqrt2, 'function', 'is a function' );
});

test( 'dgeqrt2 has expected arity', function t() {
	assert.strictEqual( dgeqrt2.length, 7, 'has expected arity' );
});

test( 'dgeqrt2 throws TypeError for invalid order', function t() {
	assert.throws( function throws() {
		dgeqrt2( 'invalid', 2, 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2 );
	}, TypeError );
});

test( 'dgeqrt2 throws RangeError for negative M', function t() {
	assert.throws( function throws() {
		dgeqrt2( 'row-major', -1, 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2 );
	}, RangeError );
});

test( 'dgeqrt2 throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		dgeqrt2( 'row-major', 2, -1, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2 );
	}, RangeError );
});
