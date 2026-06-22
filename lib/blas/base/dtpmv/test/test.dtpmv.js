/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dtpmv from './../lib/dtpmv.js';


// TESTS //

test( 'dtpmv is a function', function t() {
	assert.strictEqual( typeof dtpmv, 'function', 'is a function' );
});

test( 'dtpmv has expected arity', function t() {
	assert.strictEqual( dtpmv.length, 8, 'has expected arity' );
});

test( 'dtpmv throws TypeError for invalid uplo', function t() {
	assert.throws( function throws() {
		dtpmv( 'invalid', 'no-transpose', 'non-unit', new Float64Array( 4 ), new Float64Array( 4 ), 1, 2, 1 );
	}, TypeError );
});

test( 'dtpmv throws TypeError for invalid trans', function t() {
	assert.throws( function throws() {
		dtpmv( 'upper', 'invalid', 'non-unit', new Float64Array( 4 ), new Float64Array( 4 ), 1, 2, 1 );
	}, TypeError );
});

test( 'dtpmv throws TypeError for invalid diag', function t() {
	assert.throws( function throws() {
		dtpmv( 'upper', 'no-transpose', 'invalid', new Float64Array( 4 ), new Float64Array( 4 ), 1, 2, 1 );
	}, TypeError );
});

test( 'dtpmv throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		dtpmv( 'upper', 'no-transpose', 'non-unit', -1, new Float64Array( 4 ), 1, 2, 1 );
	}, RangeError );
});
