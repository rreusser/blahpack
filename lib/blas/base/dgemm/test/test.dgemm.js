/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dgemm from './../lib/dgemm.js';


// TESTS //

test( 'dgemm is a function', function t() {
	assert.strictEqual( typeof dgemm, 'function', 'is a function' );
});

test( 'dgemm has expected arity', function t() {
	assert.strictEqual( dgemm.length, 14, 'has expected arity' );
});

test( 'dgemm throws TypeError for invalid order', function t() {
	assert.throws( function throws() {
		dgemm( 'invalid', 'no-transpose', 'no-transpose', new Float64Array( 4 ), new Float64Array( 4 ), new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, 2, new Float64Array( 4 ), 2 );
	}, TypeError );
});

test( 'dgemm throws TypeError for invalid transa', function t() {
	assert.throws( function throws() {
		dgemm( 'row-major', 'invalid', 'no-transpose', new Float64Array( 4 ), new Float64Array( 4 ), new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, 2, new Float64Array( 4 ), 2 );
	}, TypeError );
});

test( 'dgemm throws TypeError for invalid transb', function t() {
	assert.throws( function throws() {
		dgemm( 'row-major', 'no-transpose', 'invalid', new Float64Array( 4 ), new Float64Array( 4 ), new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, 2, new Float64Array( 4 ), 2 );
	}, TypeError );
});

test( 'dgemm throws RangeError for negative M', function t() {
	assert.throws( function throws() {
		dgemm( 'row-major', 'no-transpose', 'no-transpose', -1, new Float64Array( 4 ), new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, 2, new Float64Array( 4 ), 2 );
	}, RangeError );
});

test( 'dgemm throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		dgemm( 'row-major', 'no-transpose', 'no-transpose', new Float64Array( 4 ), -1, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, 2, new Float64Array( 4 ), 2 );
	}, RangeError );
});

test( 'dgemm throws RangeError for negative K', function t() {
	assert.throws( function throws() {
		dgemm( 'row-major', 'no-transpose', 'no-transpose', new Float64Array( 4 ), new Float64Array( 4 ), -1, 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, 2, new Float64Array( 4 ), 2 );
	}, RangeError );
});
