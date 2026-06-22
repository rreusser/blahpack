/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dtbtrs from './../lib/dtbtrs.js';


// TESTS //

test( 'dtbtrs is a function', function t() {
	assert.strictEqual( typeof dtbtrs, 'function', 'is a function' );
});

test( 'dtbtrs has expected arity', function t() {
	assert.strictEqual( dtbtrs.length, 11, 'has expected arity' );
});

test( 'dtbtrs throws TypeError for invalid order', function t() {
	assert.throws( function throws() {
		dtbtrs( 'invalid', 'upper', 'no-transpose', 'non-unit', new Float64Array( 4 ), 2, 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2 );
	}, TypeError );
});

test( 'dtbtrs throws TypeError for invalid uplo', function t() {
	assert.throws( function throws() {
		dtbtrs( 'row-major', 'invalid', 'no-transpose', 'non-unit', new Float64Array( 4 ), 2, 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2 );
	}, TypeError );
});

test( 'dtbtrs throws TypeError for invalid trans', function t() {
	assert.throws( function throws() {
		dtbtrs( 'row-major', 'upper', 'invalid', 'non-unit', new Float64Array( 4 ), 2, 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2 );
	}, TypeError );
});

test( 'dtbtrs throws TypeError for invalid diag', function t() {
	assert.throws( function throws() {
		dtbtrs( 'row-major', 'upper', 'no-transpose', 'invalid', new Float64Array( 4 ), 2, 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2 );
	}, TypeError );
});

test( 'dtbtrs throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		dtbtrs( 'row-major', 'upper', 'no-transpose', 'non-unit', -1, 2, 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2 );
	}, RangeError );
});

test( 'dtbtrs throws RangeError for negative nrhs', function t() {
	assert.throws( function throws() {
		dtbtrs( 'row-major', 'upper', 'no-transpose', 'non-unit', new Float64Array( 4 ), 2, -1, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2 );
	}, RangeError );
});
