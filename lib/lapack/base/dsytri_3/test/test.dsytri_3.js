/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import dsytri3 from './../lib/dsytri_3.js';


// TESTS //

test( 'dsytri3 is a function', function t() {
	assert.strictEqual( typeof dsytri3, 'function', 'is a function' );
});

test( 'dsytri3 throws TypeError for invalid order', function t() {
	assert.throws( function throws() {
		dsytri3( 'invalid', 'lower', 1, new Float64Array( 1 ), 1, new Float64Array( 1 ), 1, new Int32Array( 1 ), 1, 0, new Float64Array( 12 ), 1, 12 );
	}, TypeError );
});

test( 'dsytri3 throws TypeError for invalid uplo', function t() {
	assert.throws( function throws() {
		dsytri3( 'column-major', 'invalid', 1, new Float64Array( 1 ), 1, new Float64Array( 1 ), 1, new Int32Array( 1 ), 1, 0, new Float64Array( 12 ), 1, 12 );
	}, TypeError );
});

test( 'dsytri3 throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		dsytri3( 'column-major', 'lower', -1, new Float64Array( 1 ), 1, new Float64Array( 1 ), 1, new Int32Array( 1 ), 1, 0, new Float64Array( 12 ), 1, 12 );
	}, RangeError );
});
