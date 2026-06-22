/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dlansy from './../lib/dlansy.js';


// TESTS //

test( 'dlansy is a function', function t() {
	assert.strictEqual( typeof dlansy, 'function', 'is a function' );
});

test( 'dlansy has expected arity', function t() {
	assert.strictEqual( dlansy.length, 8, 'has expected arity' );
});

test( 'dlansy throws TypeError for invalid order', function t() {
	assert.throws( function throws() {
		dlansy( 'invalid', 'max', 'upper', new Float64Array( 4 ), new Float64Array( 4 ), 2, new Float64Array( 4 ), 1 );
	}, TypeError );
});

test( 'dlansy throws TypeError for invalid norm', function t() {
	assert.throws( function throws() {
		dlansy( 'row-major', 'invalid', 'upper', new Float64Array( 4 ), new Float64Array( 4 ), 2, new Float64Array( 4 ), 1 );
	}, TypeError );
});

test( 'dlansy throws TypeError for invalid uplo', function t() {
	assert.throws( function throws() {
		dlansy( 'row-major', 'max', 'invalid', new Float64Array( 4 ), new Float64Array( 4 ), 2, new Float64Array( 4 ), 1 );
	}, TypeError );
});

test( 'dlansy throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		dlansy( 'row-major', 'max', 'upper', -1, new Float64Array( 4 ), 2, new Float64Array( 4 ), 1 );
	}, RangeError );
});
