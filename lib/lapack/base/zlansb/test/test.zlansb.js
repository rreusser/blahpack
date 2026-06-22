/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import zlansb from './../lib/zlansb.js';


// TESTS //

test( 'zlansb is a function', function t() {
	assert.strictEqual( typeof zlansb, 'function', 'is a function' );
});

test( 'zlansb has expected arity', function t() {
	assert.strictEqual( zlansb.length, 7, 'has expected arity' );
});

test( 'zlansb throws TypeError for invalid norm', function t() {
	assert.throws( function throws() {
		zlansb( 'invalid', 'upper', new Float64Array( 4 ), new Float64Array( 4 ), new Float64Array( 4 ), 2, new Float64Array( 4 ) );
	}, TypeError );
});

test( 'zlansb throws TypeError for invalid uplo', function t() {
	assert.throws( function throws() {
		zlansb( 'max', 'invalid', new Float64Array( 4 ), new Float64Array( 4 ), new Float64Array( 4 ), 2, new Float64Array( 4 ) );
	}, TypeError );
});

test( 'zlansb throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		zlansb( 'max', 'upper', -1, new Float64Array( 4 ), new Float64Array( 4 ), 2, new Float64Array( 4 ) );
	}, RangeError );
});

test( 'zlansb throws RangeError for negative K', function t() {
	assert.throws( function throws() {
		zlansb( 'max', 'upper', new Float64Array( 4 ), -1, new Float64Array( 4 ), 2, new Float64Array( 4 ) );
	}, RangeError );
});
