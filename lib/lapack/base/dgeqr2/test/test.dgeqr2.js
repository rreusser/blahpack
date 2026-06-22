/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dgeqr2 from './../lib/dgeqr2.js';


// TESTS //

test( 'dgeqr2 is a function', function t() {
	assert.strictEqual( typeof dgeqr2, 'function', 'is a function' );
});

test( 'dgeqr2 has expected arity', function t() {
	assert.strictEqual( dgeqr2.length, 9, 'has expected arity' );
});

test( 'dgeqr2 throws TypeError for invalid order', function t() {
	assert.throws( function throws() {
		dgeqr2( 'invalid', new Float64Array( 4 ), new Float64Array( 4 ), new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, new Float64Array( 4 ), 1 );
	}, TypeError );
});

test( 'dgeqr2 throws RangeError for negative M', function t() {
	assert.throws( function throws() {
		dgeqr2( 'row-major', -1, new Float64Array( 4 ), new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, new Float64Array( 4 ), 1 );
	}, RangeError );
});

test( 'dgeqr2 throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		dgeqr2( 'row-major', new Float64Array( 4 ), -1, new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, new Float64Array( 4 ), 1 );
	}, RangeError );
});
