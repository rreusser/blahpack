/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dtpttf from './../lib/dtpttf.js';


// TESTS //

test( 'dtpttf is a function', function t() {
	assert.strictEqual( typeof dtpttf, 'function', 'is a function' );
});

test( 'dtpttf has expected arity', function t() {
	assert.strictEqual( dtpttf.length, 7, 'has expected arity' );
});

test( 'dtpttf throws TypeError for invalid uplo', function t() {
	assert.throws( function throws() {
		dtpttf( 'column-major', 2, 'invalid', new Float64Array( 4 ), new Float64Array( 4 ), new Float64Array( 4 ), 1 );
	}, TypeError );
});

test( 'dtpttf throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		dtpttf( 'column-major', 'no-transpose', 'upper', -1, new Float64Array( 4 ), new Float64Array( 4 ), 1 );
	}, RangeError );
});

test( 'dtpttf throws TypeError for row-major order (packed storage is column-major only) and leaves its arguments untouched', function t() {
	const AP = new Float64Array( [ 2.0, 1.0, 3.0, 4.0, 5.0, 6.0 ] );
	const ARF = new Float64Array( 6 );
	const orig = new Float64Array( AP );
	assert.throws( function throws() {
		dtpttf( 'row-major', 'no-transpose', 'upper', 3, AP, ARF, 1 );
	}, function check( err ) {
		assert.ok( err instanceof TypeError, 'is a TypeError' );
		assert.match( err.message, /First argument must be 'column-major'; packed storage is LAPACK column-major packed\. Value: `row-major`/ );
		return true;
	});
	assert.deepStrictEqual( AP, orig, 'AP unchanged' );
	assert.deepStrictEqual( ARF, new Float64Array( 6 ), 'ARF unchanged' );
});
