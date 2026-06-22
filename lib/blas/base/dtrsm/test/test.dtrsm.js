/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dtrsm from './../lib/dtrsm.js';


// TESTS //

test( 'dtrsm is a function', function t() {
	assert.strictEqual( typeof dtrsm, 'function', 'is a function' );
});

test( 'dtrsm has expected arity', function t() {
	assert.strictEqual( dtrsm.length, 12, 'has expected arity' );
});

test( 'dtrsm throws TypeError for invalid order', function t() {
	assert.throws( function throws() {
		dtrsm( 'invalid', 'left', 'upper', 'no-transpose', 'non-unit', new Float64Array( 4 ), new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2 );
	}, TypeError );
});

test( 'dtrsm throws TypeError for invalid side', function t() {
	assert.throws( function throws() {
		dtrsm( 'row-major', 'invalid', 'upper', 'no-transpose', 'non-unit', new Float64Array( 4 ), new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2 );
	}, TypeError );
});

test( 'dtrsm throws TypeError for invalid uplo', function t() {
	assert.throws( function throws() {
		dtrsm( 'row-major', 'left', 'invalid', 'no-transpose', 'non-unit', new Float64Array( 4 ), new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2 );
	}, TypeError );
});

test( 'dtrsm throws TypeError for invalid transa', function t() {
	assert.throws( function throws() {
		dtrsm( 'row-major', 'left', 'upper', 'invalid', 'non-unit', new Float64Array( 4 ), new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2 );
	}, TypeError );
});

test( 'dtrsm throws TypeError for invalid diag', function t() {
	assert.throws( function throws() {
		dtrsm( 'row-major', 'left', 'upper', 'no-transpose', 'invalid', new Float64Array( 4 ), new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2 );
	}, TypeError );
});

test( 'dtrsm throws RangeError for negative M', function t() {
	assert.throws( function throws() {
		dtrsm( 'row-major', 'left', 'upper', 'no-transpose', 'non-unit', -1, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2 );
	}, RangeError );
});

test( 'dtrsm throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		dtrsm( 'row-major', 'left', 'upper', 'no-transpose', 'non-unit', new Float64Array( 4 ), -1, 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2 );
	}, RangeError );
});
