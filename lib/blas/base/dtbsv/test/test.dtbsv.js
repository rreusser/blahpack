/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dtbsv from './../lib/dtbsv.js';


// TESTS //

test( 'dtbsv is a function', function t() {
	assert.strictEqual( typeof dtbsv, 'function', 'is a function' );
});

test( 'dtbsv has expected arity', function t() {
	assert.strictEqual( dtbsv.length, 10, 'has expected arity' );
});

test( 'dtbsv throws TypeError for invalid order', function t() {
	assert.throws( function throws() {
		dtbsv( 'invalid', 'upper', 'no-transpose', 'non-unit', new Float64Array( 4 ), new Float64Array( 4 ), new Float64Array( 4 ), 2, 2, 1 );
	}, TypeError );
});

test( 'dtbsv throws TypeError for invalid uplo', function t() {
	assert.throws( function throws() {
		dtbsv( 'row-major', 'invalid', 'no-transpose', 'non-unit', new Float64Array( 4 ), new Float64Array( 4 ), new Float64Array( 4 ), 2, 2, 1 );
	}, TypeError );
});

test( 'dtbsv throws TypeError for invalid trans', function t() {
	assert.throws( function throws() {
		dtbsv( 'row-major', 'upper', 'invalid', 'non-unit', new Float64Array( 4 ), new Float64Array( 4 ), new Float64Array( 4 ), 2, 2, 1 );
	}, TypeError );
});

test( 'dtbsv throws TypeError for invalid diag', function t() {
	assert.throws( function throws() {
		dtbsv( 'row-major', 'upper', 'no-transpose', 'invalid', new Float64Array( 4 ), new Float64Array( 4 ), new Float64Array( 4 ), 2, 2, 1 );
	}, TypeError );
});

test( 'dtbsv throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		dtbsv( 'row-major', 'upper', 'no-transpose', 'non-unit', -1, new Float64Array( 4 ), new Float64Array( 4 ), 2, 2, 1 );
	}, RangeError );
});

test( 'dtbsv throws RangeError for negative K', function t() {
	assert.throws( function throws() {
		dtbsv( 'row-major', 'upper', 'no-transpose', 'non-unit', new Float64Array( 4 ), -1, new Float64Array( 4 ), 2, 2, 1 );
	}, RangeError );
});
