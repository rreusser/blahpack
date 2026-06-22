/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import zlatrd from './../lib/zlatrd.js';


// TESTS //

test( 'zlatrd is a function', function t() {
	assert.strictEqual( typeof zlatrd, 'function', 'is a function' );
});

test( 'zlatrd has expected arity', function t() {
	assert.strictEqual( zlatrd.length, 12, 'has expected arity' );
});

test( 'zlatrd throws TypeError for invalid order', function t() {
	assert.throws( function throws() {
		zlatrd( 'invalid', 'upper', new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, 2, 1, new Float64Array( 4 ), 1, new Float64Array( 4 ), 2 );
	}, TypeError );
});

test( 'zlatrd throws TypeError for invalid uplo', function t() {
	assert.throws( function throws() {
		zlatrd( 'row-major', 'invalid', new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, 2, 1, new Float64Array( 4 ), 1, new Float64Array( 4 ), 2 );
	}, TypeError );
});

test( 'zlatrd throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		zlatrd( 'row-major', 'upper', -1, 2, new Float64Array( 4 ), 2, 2, 1, new Float64Array( 4 ), 1, new Float64Array( 4 ), 2 );
	}, RangeError );
});
