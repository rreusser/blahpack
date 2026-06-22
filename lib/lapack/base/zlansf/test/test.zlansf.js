/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import zlansf from './../lib/zlansf.js';


// TESTS //

test( 'zlansf is a function', function t() {
	assert.strictEqual( typeof zlansf, 'function', 'is a function' );
});

test( 'zlansf has expected arity', function t() {
	assert.strictEqual( zlansf.length, 6, 'has expected arity' );
});

test( 'zlansf throws TypeError for invalid norm', function t() {
	assert.throws( function throws() {
		zlansf( 'invalid', 'no-transpose', 'upper', new Float64Array( 4 ), new Float64Array( 4 ), new Float64Array( 4 ) );
	}, TypeError );
});

test( 'zlansf throws TypeError for invalid transr', function t() {
	assert.throws( function throws() {
		zlansf( 'max', 'invalid', 'upper', new Float64Array( 4 ), new Float64Array( 4 ), new Float64Array( 4 ) );
	}, TypeError );
});

test( 'zlansf throws TypeError for invalid uplo', function t() {
	assert.throws( function throws() {
		zlansf( 'max', 'no-transpose', 'invalid', new Float64Array( 4 ), new Float64Array( 4 ), new Float64Array( 4 ) );
	}, TypeError );
});

test( 'zlansf throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		zlansf( 'max', 'no-transpose', 'upper', -1, new Float64Array( 4 ), new Float64Array( 4 ) );
	}, RangeError );
});
