/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dtptrs from './../lib/dtptrs.js';


// TESTS //

test( 'dtptrs is a function', function t() {
	assert.strictEqual( typeof dtptrs, 'function', 'is a function' );
});

test( 'dtptrs has expected arity', function t() {
	assert.strictEqual( dtptrs.length, 9, 'has expected arity' );
});

test( 'dtptrs throws TypeError for invalid order', function t() {
	assert.throws( function throws() {
		dtptrs( 'invalid', 'upper', 'no-transpose', 'non-unit', new Float64Array( 4 ), 2, new Float64Array( 4 ), new Float64Array( 4 ), 2 );
	}, TypeError );
});

test( 'dtptrs throws TypeError for invalid uplo', function t() {
	assert.throws( function throws() {
		dtptrs( 'row-major', 'invalid', 'no-transpose', 'non-unit', new Float64Array( 4 ), 2, new Float64Array( 4 ), new Float64Array( 4 ), 2 );
	}, TypeError );
});

test( 'dtptrs throws TypeError for invalid trans', function t() {
	assert.throws( function throws() {
		dtptrs( 'row-major', 'upper', 'invalid', 'non-unit', new Float64Array( 4 ), 2, new Float64Array( 4 ), new Float64Array( 4 ), 2 );
	}, TypeError );
});

test( 'dtptrs throws TypeError for invalid diag', function t() {
	assert.throws( function throws() {
		dtptrs( 'row-major', 'upper', 'no-transpose', 'invalid', new Float64Array( 4 ), 2, new Float64Array( 4 ), new Float64Array( 4 ), 2 );
	}, TypeError );
});

test( 'dtptrs throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		dtptrs( 'row-major', 'upper', 'no-transpose', 'non-unit', -1, 2, new Float64Array( 4 ), new Float64Array( 4 ), 2 );
	}, RangeError );
});

test( 'dtptrs throws RangeError for negative nrhs', function t() {
	assert.throws( function throws() {
		dtptrs( 'row-major', 'upper', 'no-transpose', 'non-unit', new Float64Array( 4 ), -1, new Float64Array( 4 ), new Float64Array( 4 ), 2 );
	}, RangeError );
});
