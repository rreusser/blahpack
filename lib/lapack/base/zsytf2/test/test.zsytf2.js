/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import zsytf2 from './../lib/zsytf2.js';


// TESTS //

test( 'zsytf2 is a function', function t() {
	assert.strictEqual( typeof zsytf2, 'function', 'is a function' );
});

test( 'zsytf2 has expected arity', function t() {
	assert.strictEqual( zsytf2.length, 7, 'has expected arity' );
});

test( 'zsytf2 throws TypeError for invalid order', function t() {
	assert.throws( function throws() {
		zsytf2( 'invalid', 'upper', new Float64Array( 4 ), new Float64Array( 4 ), 2, new Float64Array( 4 ), 1 );
	}, TypeError );
});

test( 'zsytf2 throws TypeError for invalid uplo', function t() {
	assert.throws( function throws() {
		zsytf2( 'row-major', 'invalid', new Float64Array( 4 ), new Float64Array( 4 ), 2, new Float64Array( 4 ), 1 );
	}, TypeError );
});

test( 'zsytf2 throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		zsytf2( 'row-major', 'upper', -1, new Float64Array( 4 ), 2, new Float64Array( 4 ), 1 );
	}, RangeError );
});
