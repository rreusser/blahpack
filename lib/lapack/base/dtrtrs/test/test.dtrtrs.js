/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dtrtrs from './../lib/dtrtrs.js';


// TESTS //

test( 'dtrtrs is a function', function t() {
	assert.strictEqual( typeof dtrtrs, 'function', 'is a function' );
});

test( 'dtrtrs has expected arity', function t() {
	assert.strictEqual( dtrtrs.length, 10, 'has expected arity' );
});

test( 'dtrtrs throws TypeError for invalid order', function t() {
	assert.throws( function throws() {
		dtrtrs( 'invalid', 'upper', 'no-transpose', 'non-unit', new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2 );
	}, TypeError );
});

test( 'dtrtrs throws TypeError for invalid uplo', function t() {
	assert.throws( function throws() {
		dtrtrs( 'row-major', 'invalid', 'no-transpose', 'non-unit', new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2 );
	}, TypeError );
});

test( 'dtrtrs throws TypeError for invalid trans', function t() {
	assert.throws( function throws() {
		dtrtrs( 'row-major', 'upper', 'invalid', 'non-unit', new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2 );
	}, TypeError );
});

test( 'dtrtrs throws TypeError for invalid diag', function t() {
	assert.throws( function throws() {
		dtrtrs( 'row-major', 'upper', 'no-transpose', 'invalid', new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2 );
	}, TypeError );
});

test( 'dtrtrs throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		dtrtrs( 'row-major', 'upper', 'no-transpose', 'non-unit', -1, 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2 );
	}, RangeError );
});

test( 'dtrtrs throws RangeError for negative nrhs', function t() {
	assert.throws( function throws() {
		dtrtrs( 'row-major', 'upper', 'no-transpose', 'non-unit', new Float64Array( 4 ), -1, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2 );
	}, RangeError );
});
