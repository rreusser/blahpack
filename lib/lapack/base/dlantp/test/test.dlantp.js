/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dlantp from './../lib/dlantp.js';


// TESTS //

test( 'dlantp is a function', function t() {
	assert.strictEqual( typeof dlantp, 'function', 'is a function' );
});

test( 'dlantp has expected arity', function t() {
	assert.strictEqual( dlantp.length, 6, 'has expected arity' );
});

test( 'dlantp throws TypeError for invalid norm', function t() {
	assert.throws( function throws() {
		dlantp( 'invalid', 'upper', 'non-unit', new Float64Array( 4 ), new Float64Array( 4 ), new Float64Array( 4 ) );
	}, TypeError );
});

test( 'dlantp throws TypeError for invalid uplo', function t() {
	assert.throws( function throws() {
		dlantp( 'max', 'invalid', 'non-unit', new Float64Array( 4 ), new Float64Array( 4 ), new Float64Array( 4 ) );
	}, TypeError );
});

test( 'dlantp throws TypeError for invalid diag', function t() {
	assert.throws( function throws() {
		dlantp( 'max', 'upper', 'invalid', new Float64Array( 4 ), new Float64Array( 4 ), new Float64Array( 4 ) );
	}, TypeError );
});

test( 'dlantp throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		dlantp( 'max', 'upper', 'non-unit', -1, new Float64Array( 4 ), new Float64Array( 4 ) );
	}, RangeError );
});
