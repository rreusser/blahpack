/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import zsyconvf from './../lib/zsyconvf.js';


// TESTS //

test( 'zsyconvf is a function', function t() {
	assert.strictEqual( typeof zsyconvf, 'function', 'is a function' );
});

test( 'zsyconvf has expected arity', function t() {
	assert.strictEqual( zsyconvf.length, 11, 'has expected arity' );
});

test( 'zsyconvf throws TypeError for invalid order', function t() {
	assert.throws( function throws() {
		zsyconvf( 'invalid', 'upper', 'no-transpose', 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, 2, 2, 2 );
	}, TypeError );
});

test( 'zsyconvf throws TypeError for invalid uplo', function t() {
	assert.throws( function throws() {
		zsyconvf( 'row-major', 'invalid', 'no-transpose', 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, 2, 2, 2 );
	}, TypeError );
});

test( 'zsyconvf throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		zsyconvf( 'row-major', 'upper', 'no-transpose', -1, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, 2, 2, 2 );
	}, RangeError );
});
