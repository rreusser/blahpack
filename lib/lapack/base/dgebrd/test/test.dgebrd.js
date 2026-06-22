/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dgebrd from './../lib/dgebrd.js';


// TESTS //

test( 'dgebrd is a function', function t() {
	assert.strictEqual( typeof dgebrd, 'function', 'is a function' );
});

test( 'dgebrd has expected arity', function t() {
	assert.strictEqual( dgebrd.length, 16, 'has expected arity' );
});

test( 'dgebrd throws TypeError for invalid order', function t() {
	assert.throws( function throws() {
		dgebrd( 'invalid', new Float64Array( 4 ), new Float64Array( 4 ), new Float64Array( 4 ), 2, 2, 1, 2, 1, new Float64Array( 4 ), 1, new Float64Array( 4 ), 1, new Float64Array( 4 ), 1, 2 );
	}, TypeError );
});

test( 'dgebrd throws RangeError for negative M', function t() {
	assert.throws( function throws() {
		dgebrd( 'row-major', -1, new Float64Array( 4 ), new Float64Array( 4 ), 2, 2, 1, 2, 1, new Float64Array( 4 ), 1, new Float64Array( 4 ), 1, new Float64Array( 4 ), 1, 2 );
	}, RangeError );
});

test( 'dgebrd throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		dgebrd( 'row-major', new Float64Array( 4 ), -1, new Float64Array( 4 ), 2, 2, 1, 2, 1, new Float64Array( 4 ), 1, new Float64Array( 4 ), 1, new Float64Array( 4 ), 1, 2 );
	}, RangeError );
});
