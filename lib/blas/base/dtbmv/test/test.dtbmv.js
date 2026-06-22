/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dtbmv from './../lib/dtbmv.js';


// TESTS //

test( 'dtbmv is a function', function t() {
	assert.strictEqual( typeof dtbmv, 'function', 'is a function' );
});

test( 'dtbmv has expected arity', function t() {
	assert.strictEqual( dtbmv.length, 10, 'has expected arity' );
});

test( 'dtbmv throws TypeError for invalid order', function t() {
	assert.throws( function throws() {
		dtbmv( 'invalid', 'upper', 'no-transpose', 'non-unit', new Float64Array( 4 ), new Float64Array( 4 ), new Float64Array( 4 ), 2, 2, 1 );
	}, TypeError );
});

test( 'dtbmv throws TypeError for invalid uplo', function t() {
	assert.throws( function throws() {
		dtbmv( 'row-major', 'invalid', 'no-transpose', 'non-unit', new Float64Array( 4 ), new Float64Array( 4 ), new Float64Array( 4 ), 2, 2, 1 );
	}, TypeError );
});

test( 'dtbmv throws TypeError for invalid trans', function t() {
	assert.throws( function throws() {
		dtbmv( 'row-major', 'upper', 'invalid', 'non-unit', new Float64Array( 4 ), new Float64Array( 4 ), new Float64Array( 4 ), 2, 2, 1 );
	}, TypeError );
});

test( 'dtbmv throws TypeError for invalid diag', function t() {
	assert.throws( function throws() {
		dtbmv( 'row-major', 'upper', 'no-transpose', 'invalid', new Float64Array( 4 ), new Float64Array( 4 ), new Float64Array( 4 ), 2, 2, 1 );
	}, TypeError );
});

test( 'dtbmv throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		dtbmv( 'row-major', 'upper', 'no-transpose', 'non-unit', -1, new Float64Array( 4 ), new Float64Array( 4 ), 2, 2, 1 );
	}, RangeError );
});

test( 'dtbmv throws RangeError for negative K', function t() {
	assert.throws( function throws() {
		dtbmv( 'row-major', 'upper', 'no-transpose', 'non-unit', new Float64Array( 4 ), -1, new Float64Array( 4 ), 2, 2, 1 );
	}, RangeError );
});
