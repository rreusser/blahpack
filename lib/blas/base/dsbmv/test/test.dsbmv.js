/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dsbmv from './../lib/dsbmv.js';


// TESTS //

test( 'dsbmv is a function', function t() {
	assert.strictEqual( typeof dsbmv, 'function', 'is a function' );
});

test( 'dsbmv has expected arity', function t() {
	assert.strictEqual( dsbmv.length, 12, 'has expected arity' );
});

test( 'dsbmv throws TypeError for invalid order', function t() {
	assert.throws( function throws() {
		dsbmv( 'invalid', 'upper', new Float64Array( 4 ), new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, 2, 1, 2, 2, 1 );
	}, TypeError );
});

test( 'dsbmv throws TypeError for invalid uplo', function t() {
	assert.throws( function throws() {
		dsbmv( 'row-major', 'invalid', new Float64Array( 4 ), new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, 2, 1, 2, 2, 1 );
	}, TypeError );
});

test( 'dsbmv throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		dsbmv( 'row-major', 'upper', -1, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, 2, 1, 2, 2, 1 );
	}, RangeError );
});

test( 'dsbmv throws RangeError for negative K', function t() {
	assert.throws( function throws() {
		dsbmv( 'row-major', 'upper', new Float64Array( 4 ), -1, 2, new Float64Array( 4 ), 2, 2, 1, 2, 2, 1 );
	}, RangeError );
});
