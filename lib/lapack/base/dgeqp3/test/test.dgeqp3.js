/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dgeqp3 from './../lib/dgeqp3.js';


// TESTS //

test( 'dgeqp3 is a function', function t() {
	assert.strictEqual( typeof dgeqp3, 'function', 'is a function' );
});

test( 'dgeqp3 has expected arity', function t() {
	assert.strictEqual( dgeqp3.length, 10, 'has expected arity' );
});

test( 'dgeqp3 throws RangeError for negative M', function t() {
	assert.throws( function throws() {
		dgeqp3( -1, new Float64Array( 4 ), new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, new Float64Array( 4 ), 1 );
	}, RangeError );
});

test( 'dgeqp3 throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		dgeqp3( new Float64Array( 4 ), -1, new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, new Float64Array( 4 ), 1 );
	}, RangeError );
});
