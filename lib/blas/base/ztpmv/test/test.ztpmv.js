/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import ztpmv from './../lib/ztpmv.js';


// TESTS //

test( 'ztpmv is a function', function t() {
	assert.strictEqual( typeof ztpmv, 'function', 'is a function' );
});

test( 'ztpmv has expected arity', function t() {
	assert.strictEqual( ztpmv.length, 8, 'has expected arity' );
});

test( 'ztpmv throws TypeError for invalid uplo', function t() {
	assert.throws( function throws() {
		ztpmv( 'invalid', 'no-transpose', 'non-unit', new Float64Array( 4 ), new Float64Array( 4 ), 1, 2, 1 );
	}, TypeError );
});

test( 'ztpmv throws TypeError for invalid trans', function t() {
	assert.throws( function throws() {
		ztpmv( 'upper', 'invalid', 'non-unit', new Float64Array( 4 ), new Float64Array( 4 ), 1, 2, 1 );
	}, TypeError );
});

test( 'ztpmv throws TypeError for invalid diag', function t() {
	assert.throws( function throws() {
		ztpmv( 'upper', 'no-transpose', 'invalid', new Float64Array( 4 ), new Float64Array( 4 ), 1, 2, 1 );
	}, TypeError );
});

test( 'ztpmv throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		ztpmv( 'upper', 'no-transpose', 'non-unit', -1, new Float64Array( 4 ), 1, 2, 1 );
	}, RangeError );
});
