/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dsfrk from './../lib/dsfrk.js';


// TESTS //

test( 'dsfrk is a function', function t() {
	assert.strictEqual( typeof dsfrk, 'function', 'is a function' );
});

test( 'dsfrk has expected arity', function t() {
	assert.strictEqual( dsfrk.length, 10, 'has expected arity' );
});

test( 'dsfrk throws TypeError for invalid uplo', function t() {
	assert.throws( function throws() {
		dsfrk( 2, 'invalid', 'no-transpose', new Float64Array( 4 ), new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, 2, new Float64Array( 4 ) );
	}, TypeError );
});

test( 'dsfrk throws TypeError for invalid trans', function t() {
	assert.throws( function throws() {
		dsfrk( 2, 'upper', 'invalid', new Float64Array( 4 ), new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, 2, new Float64Array( 4 ) );
	}, TypeError );
});

test( 'dsfrk throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		dsfrk( 2, 'upper', 'no-transpose', -1, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, 2, new Float64Array( 4 ) );
	}, RangeError );
});

test( 'dsfrk throws RangeError for negative K', function t() {
	assert.throws( function throws() {
		dsfrk( 2, 'upper', 'no-transpose', new Float64Array( 4 ), -1, 2, new Float64Array( 4 ), 2, 2, new Float64Array( 4 ) );
	}, RangeError );
});
