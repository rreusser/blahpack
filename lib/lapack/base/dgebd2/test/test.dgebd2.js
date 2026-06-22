/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dgebd2 from './../lib/dgebd2.js';


// TESTS //

test( 'dgebd2 is a function', function t() {
	assert.strictEqual( typeof dgebd2, 'function', 'is a function' );
});

test( 'dgebd2 has expected arity', function t() {
	assert.strictEqual( dgebd2.length, 15, 'has expected arity' );
});

test( 'dgebd2 throws TypeError for invalid order', function t() {
	assert.throws( function throws() {
		dgebd2( 'invalid', new Float64Array( 4 ), new Float64Array( 4 ), new Float64Array( 4 ), 2, 2, 1, 2, 1, new Float64Array( 4 ), 1, new Float64Array( 4 ), 1, new Float64Array( 4 ), 1 );
	}, TypeError );
});

test( 'dgebd2 throws RangeError for negative M', function t() {
	assert.throws( function throws() {
		dgebd2( 'row-major', -1, new Float64Array( 4 ), new Float64Array( 4 ), 2, 2, 1, 2, 1, new Float64Array( 4 ), 1, new Float64Array( 4 ), 1, new Float64Array( 4 ), 1 );
	}, RangeError );
});

test( 'dgebd2 throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		dgebd2( 'row-major', new Float64Array( 4 ), -1, new Float64Array( 4 ), 2, 2, 1, 2, 1, new Float64Array( 4 ), 1, new Float64Array( 4 ), 1, new Float64Array( 4 ), 1 );
	}, RangeError );
});
