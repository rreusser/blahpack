/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dlansf from './../lib/dlansf.js';


// TESTS //

test( 'dlansf is a function', function t() {
	assert.strictEqual( typeof dlansf, 'function', 'is a function' );
});

test( 'dlansf has expected arity', function t() {
	assert.strictEqual( dlansf.length, 6, 'has expected arity' );
});

test( 'dlansf throws TypeError for invalid norm', function t() {
	assert.throws( function throws() {
		dlansf( 'invalid', 'no-transpose', 'upper', new Float64Array( 4 ), new Float64Array( 4 ), new Float64Array( 4 ) );
	}, TypeError );
});

test( 'dlansf throws TypeError for invalid transr', function t() {
	assert.throws( function throws() {
		dlansf( 'max', 'invalid', 'upper', new Float64Array( 4 ), new Float64Array( 4 ), new Float64Array( 4 ) );
	}, TypeError );
});

test( 'dlansf throws TypeError for invalid uplo', function t() {
	assert.throws( function throws() {
		dlansf( 'max', 'no-transpose', 'invalid', new Float64Array( 4 ), new Float64Array( 4 ), new Float64Array( 4 ) );
	}, TypeError );
});

test( 'dlansf throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		dlansf( 'max', 'no-transpose', 'upper', -1, new Float64Array( 4 ), new Float64Array( 4 ) );
	}, RangeError );
});
