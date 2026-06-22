/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import zsyconv from './../lib/zsyconv.js';


// TESTS //

test( 'zsyconv is a function', function t() {
	assert.strictEqual( typeof zsyconv, 'function', 'is a function' );
});

test( 'zsyconv has expected arity', function t() {
	assert.strictEqual( zsyconv.length, 9, 'has expected arity' );
});

test( 'zsyconv throws TypeError for invalid uplo', function t() {
	assert.throws( function throws() {
		zsyconv( 'invalid', 2, new Float64Array( 4 ), new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, new Float64Array( 4 ), 1 );
	}, TypeError );
});

test( 'zsyconv throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		zsyconv( 'upper', 2, -1, new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, new Float64Array( 4 ), 1 );
	}, RangeError );
});
