/* eslint-disable no-restricted-syntax */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dtptri from './../lib/dtptri.js';


// TESTS //

test( 'dtptri is a function', function t() {
	assert.strictEqual( typeof dtptri, 'function', 'is a function' );
});

test( 'dtptri has expected arity', function t() {
	assert.strictEqual( dtptri.length, 5, 'has expected arity' );
});

test( 'dtptri throws TypeError for invalid uplo', function t() {
	assert.throws( function throws() {
		dtptri( 'column-major', 'invalid', 'non-unit', new Float64Array( 4 ), new Float64Array( 4 ) );
	}, TypeError );
});

test( 'dtptri throws TypeError for invalid diag', function t() {
	assert.throws( function throws() {
		dtptri( 'column-major', 'upper', 'invalid', new Float64Array( 4 ), new Float64Array( 4 ) );
	}, TypeError );
});

test( 'dtptri throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		dtptri( 'column-major', 'upper', 'non-unit', -1, new Float64Array( 4 ) );
	}, RangeError );
});

test( 'dtptri throws TypeError for row-major order (packed storage is column-major only) and leaves its arguments untouched', function t() {
	const AP = new Float64Array( [ 2.0, 1.0, 3.0, 4.0, 5.0, 6.0 ] );
	const orig = new Float64Array( AP );
	assert.throws( function throws() {
		dtptri( 'row-major', 'upper', 'non-unit', 3, AP );
	}, function check( err ) {
		assert.ok( err instanceof TypeError, 'is a TypeError' );
		assert.match( err.message, /First argument must be 'column-major'; packed storage is LAPACK column-major packed\. Value: `row-major`/ );
		return true;
	});
	assert.deepStrictEqual( AP, orig, 'AP unchanged' );
});
