/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import zhetri3 from './../lib/zhetri_3.js';


// TESTS //

test( 'zhetri3 is a function', function t() {
	assert.strictEqual( typeof zhetri3, 'function', 'is a function' );
});

test( 'zhetri3 throws TypeError for invalid order', function t() {
	assert.throws( function throws() {
		zhetri3( 'invalid', 'lower', 1, new Complex128Array( 1 ), 1, new Complex128Array( 1 ), 1, new Int32Array( 1 ), 1, 0, new Complex128Array( 12 ), 1, 12 );
	}, TypeError );
});

test( 'zhetri3 throws TypeError for invalid uplo', function t() {
	assert.throws( function throws() {
		zhetri3( 'column-major', 'invalid', 1, new Complex128Array( 1 ), 1, new Complex128Array( 1 ), 1, new Int32Array( 1 ), 1, 0, new Complex128Array( 12 ), 1, 12 );
	}, TypeError );
});

test( 'zhetri3 throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		zhetri3( 'column-major', 'lower', -1, new Complex128Array( 1 ), 1, new Complex128Array( 1 ), 1, new Int32Array( 1 ), 1, 0, new Complex128Array( 12 ), 1, 12 );
	}, RangeError );
});
