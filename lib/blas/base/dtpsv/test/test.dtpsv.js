/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dtpsv from './../lib/dtpsv.js';


// TESTS //

test( 'dtpsv is a function', function t() {
	assert.strictEqual( typeof dtpsv, 'function', 'is a function' );
});

test( 'dtpsv has expected arity', function t() {
	assert.strictEqual( dtpsv.length, 8, 'has expected arity' );
});

test( 'dtpsv throws TypeError for invalid uplo', function t() {
	assert.throws( function throws() {
		dtpsv( 'invalid', 'no-transpose', 'non-unit', new Float64Array( 4 ), new Float64Array( 4 ), 1, 2, 1 );
	}, TypeError );
});

test( 'dtpsv throws TypeError for invalid trans', function t() {
	assert.throws( function throws() {
		dtpsv( 'upper', 'invalid', 'non-unit', new Float64Array( 4 ), new Float64Array( 4 ), 1, 2, 1 );
	}, TypeError );
});

test( 'dtpsv throws TypeError for invalid diag', function t() {
	assert.throws( function throws() {
		dtpsv( 'upper', 'no-transpose', 'invalid', new Float64Array( 4 ), new Float64Array( 4 ), 1, 2, 1 );
	}, TypeError );
});

test( 'dtpsv throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		dtpsv( 'upper', 'no-transpose', 'non-unit', -1, new Float64Array( 4 ), 1, 2, 1 );
	}, RangeError );
});
