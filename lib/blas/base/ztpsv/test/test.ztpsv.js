/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import ztpsv from './../lib/ztpsv.js';


// TESTS //

test( 'ztpsv is a function', function t() {
	assert.strictEqual( typeof ztpsv, 'function', 'is a function' );
});

test( 'ztpsv has expected arity', function t() {
	assert.strictEqual( ztpsv.length, 8, 'has expected arity' );
});

test( 'ztpsv throws TypeError for invalid uplo', function t() {
	assert.throws( function throws() {
		ztpsv( 'invalid', 'no-transpose', 'non-unit', new Float64Array( 4 ), new Float64Array( 4 ), 1, 2, 1 );
	}, TypeError );
});

test( 'ztpsv throws TypeError for invalid trans', function t() {
	assert.throws( function throws() {
		ztpsv( 'upper', 'invalid', 'non-unit', new Float64Array( 4 ), new Float64Array( 4 ), 1, 2, 1 );
	}, TypeError );
});

test( 'ztpsv throws TypeError for invalid diag', function t() {
	assert.throws( function throws() {
		ztpsv( 'upper', 'no-transpose', 'invalid', new Float64Array( 4 ), new Float64Array( 4 ), 1, 2, 1 );
	}, TypeError );
});

test( 'ztpsv throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		ztpsv( 'upper', 'no-transpose', 'non-unit', -1, new Float64Array( 4 ), 1, 2, 1 );
	}, RangeError );
});
