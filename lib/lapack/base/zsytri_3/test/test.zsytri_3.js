/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import zsytri3 from './../lib/zsytri_3.js';


// TESTS //

test( 'zsytri3 is a function', function t() {
	assert.strictEqual( typeof zsytri3, 'function', 'is a function' );
});

test( 'zsytri3 throws TypeError for invalid order', function t() {
	assert.throws( function throws() {
		zsytri3( 'invalid', 'lower', 1, new Complex128Array( 1 ), 1, new Complex128Array( 1 ), 1, new Int32Array( 1 ), 1, 0, new Complex128Array( 12 ), 1, 12 );
	}, TypeError );
});

test( 'zsytri3 throws TypeError for invalid uplo', function t() {
	assert.throws( function throws() {
		zsytri3( 'column-major', 'invalid', 1, new Complex128Array( 1 ), 1, new Complex128Array( 1 ), 1, new Int32Array( 1 ), 1, 0, new Complex128Array( 12 ), 1, 12 );
	}, TypeError );
});

test( 'zsytri3 throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		zsytri3( 'column-major', 'lower', -1, new Complex128Array( 1 ), 1, new Complex128Array( 1 ), 1, new Int32Array( 1 ), 1, 0, new Complex128Array( 12 ), 1, 12 );
	}, RangeError );
});
