/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dlatps from './../lib/dlatps.js';


// TESTS //

test( 'dlatps is a function', function t() {
	assert.strictEqual( typeof dlatps, 'function', 'is a function' );
});

test( 'dlatps has expected arity', function t() {
	assert.strictEqual( dlatps.length, 12, 'has expected arity' );
});

test( 'dlatps throws TypeError for invalid uplo', function t() {
	assert.throws( function throws() {
		dlatps( 'column-major', 'invalid', 'no-transpose', 'non-unit', 'N', new Float64Array( 4 ), new Float64Array( 4 ), 2, 1, 2, new Float64Array( 4 ), 1 );
	}, TypeError );
});

test( 'dlatps throws TypeError for invalid trans', function t() {
	assert.throws( function throws() {
		dlatps( 'column-major', 'upper', 'invalid', 'non-unit', 'N', new Float64Array( 4 ), new Float64Array( 4 ), 2, 1, 2, new Float64Array( 4 ), 1 );
	}, TypeError );
});

test( 'dlatps throws TypeError for invalid diag', function t() {
	assert.throws( function throws() {
		dlatps( 'column-major', 'upper', 'no-transpose', 'invalid', 'N', new Float64Array( 4 ), new Float64Array( 4 ), 2, 1, 2, new Float64Array( 4 ), 1 );
	}, TypeError );
});

test( 'dlatps throws TypeError for invalid normin', function t() {
	assert.throws( function throws() {
		dlatps( 'column-major', 'upper', 'no-transpose', 'non-unit', 'invalid', new Float64Array( 4 ), new Float64Array( 4 ), 2, 1, 2, new Float64Array( 4 ), 1 );
	}, TypeError );
});

test( 'dlatps throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		dlatps( 'column-major', 'upper', 'no-transpose', 'non-unit', 'no', -1, new Float64Array( 4 ), 2, 1, 2, new Float64Array( 4 ), 1 );
	}, RangeError );
});

test( 'dlatps throws TypeError for row-major order (packed storage is column-major only) and leaves its arguments untouched', function t() {
	const AP = new Float64Array( [ 2.0, 1.0, 3.0, 4.0, 5.0, 6.0 ] );
	const x = new Float64Array( [ 1.0, 2.0, 3.0 ] );
	const scale = new Float64Array( 1 );
	const CNORM = new Float64Array( 3 );
	const orig = new Float64Array( AP );
	assert.throws( function throws() {
		dlatps( 'row-major', 'upper', 'no-transpose', 'non-unit', 'no', 3, AP, x, 1, scale, CNORM, 1 );
	}, function check( err ) {
		assert.ok( err instanceof TypeError, 'is a TypeError' );
		assert.match( err.message, /First argument must be 'column-major'; packed storage is LAPACK column-major packed\. Value: `row-major`/ );
		return true;
	});
	assert.deepStrictEqual( AP, orig, 'AP unchanged' );
	assert.deepStrictEqual( x, new Float64Array( [ 1.0, 2.0, 3.0 ] ), 'x unchanged' );
});
