/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import ztbmv from './../lib/ztbmv.js';


// TESTS //

test( 'ztbmv is a function', function t() {
	assert.strictEqual( typeof ztbmv, 'function', 'is a function' );
});

test( 'ztbmv has expected arity', function t() {
	assert.strictEqual( ztbmv.length, 10, 'has expected arity' );
});

test( 'ztbmv throws TypeError for invalid order', function t() {
	assert.throws( function throws() {
		ztbmv( 'invalid', 'upper', 'no-transpose', 'non-unit', new Float64Array( 4 ), new Float64Array( 4 ), new Float64Array( 4 ), 2, 2, 1 );
	}, TypeError );
});

test( 'ztbmv throws TypeError for invalid uplo', function t() {
	assert.throws( function throws() {
		ztbmv( 'row-major', 'invalid', 'no-transpose', 'non-unit', new Float64Array( 4 ), new Float64Array( 4 ), new Float64Array( 4 ), 2, 2, 1 );
	}, TypeError );
});

test( 'ztbmv throws TypeError for invalid trans', function t() {
	assert.throws( function throws() {
		ztbmv( 'row-major', 'upper', 'invalid', 'non-unit', new Float64Array( 4 ), new Float64Array( 4 ), new Float64Array( 4 ), 2, 2, 1 );
	}, TypeError );
});

test( 'ztbmv throws TypeError for invalid diag', function t() {
	assert.throws( function throws() {
		ztbmv( 'row-major', 'upper', 'no-transpose', 'invalid', new Float64Array( 4 ), new Float64Array( 4 ), new Float64Array( 4 ), 2, 2, 1 );
	}, TypeError );
});

test( 'ztbmv throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		ztbmv( 'row-major', 'upper', 'no-transpose', 'non-unit', -1, new Float64Array( 4 ), new Float64Array( 4 ), 2, 2, 1 );
	}, RangeError );
});

test( 'ztbmv throws RangeError for negative K', function t() {
	assert.throws( function throws() {
		ztbmv( 'row-major', 'upper', 'no-transpose', 'non-unit', new Float64Array( 4 ), -1, new Float64Array( 4 ), 2, 2, 1 );
	}, RangeError );
});
