/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import ztrmv from './../lib/ztrmv.js';


// TESTS //

test( 'ztrmv is a function', function t() {
	assert.strictEqual( typeof ztrmv, 'function', 'is a function' );
});

test( 'ztrmv has expected arity', function t() {
	assert.strictEqual( ztrmv.length, 9, 'has expected arity' );
});

test( 'ztrmv throws TypeError for invalid order', function t() {
	assert.throws( function throws() {
		ztrmv( 'invalid', 'upper', 'no-transpose', 'non-unit', new Float64Array( 4 ), new Float64Array( 4 ), 2, 2, 1 );
	}, TypeError );
});

test( 'ztrmv throws TypeError for invalid uplo', function t() {
	assert.throws( function throws() {
		ztrmv( 'row-major', 'invalid', 'no-transpose', 'non-unit', new Float64Array( 4 ), new Float64Array( 4 ), 2, 2, 1 );
	}, TypeError );
});

test( 'ztrmv throws TypeError for invalid trans', function t() {
	assert.throws( function throws() {
		ztrmv( 'row-major', 'upper', 'invalid', 'non-unit', new Float64Array( 4 ), new Float64Array( 4 ), 2, 2, 1 );
	}, TypeError );
});

test( 'ztrmv throws TypeError for invalid diag', function t() {
	assert.throws( function throws() {
		ztrmv( 'row-major', 'upper', 'no-transpose', 'invalid', new Float64Array( 4 ), new Float64Array( 4 ), 2, 2, 1 );
	}, TypeError );
});

test( 'ztrmv throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		ztrmv( 'row-major', 'upper', 'no-transpose', 'non-unit', -1, new Float64Array( 4 ), 2, 2, 1 );
	}, RangeError );
});
