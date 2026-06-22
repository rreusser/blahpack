/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import zsytf2rk from './../lib/zsytf2_rk.js';


// TESTS //

test( 'zsytf2_rk is a function', function t() {
	assert.strictEqual( typeof zsytf2rk, 'function', 'is a function' );
});

test( 'zsytf2_rk has expected arity', function t() {
	assert.strictEqual( zsytf2rk.length, 10, 'has expected arity' );
});

test( 'zsytf2_rk throws TypeError for invalid order', function t() {
	assert.throws( function throws() {
		zsytf2rk( 'invalid', 'upper', 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, 2, 2, 2 );
	}, TypeError );
});

test( 'zsytf2_rk throws TypeError for invalid uplo', function t() {
	assert.throws( function throws() {
		zsytf2rk( 'row-major', 'invalid', 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, 2, 2, 2 );
	}, TypeError );
});

test( 'zsytf2_rk throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		zsytf2rk( 'row-major', 'upper', -1, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, 2, 2, 2 );
	}, RangeError );
});
