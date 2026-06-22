/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import zsycon3 from './../lib/zsycon_3.js';


// TESTS //

test( 'zsycon3 is a function', function t() {
	assert.strictEqual( typeof zsycon3, 'function', 'is a function' );
});

test( 'zsycon3 has expected arity', function t() {
	assert.strictEqual( zsycon3.length, 13, 'has expected arity' );
});

test( 'zsycon3 throws TypeError for invalid order', function t() {
	assert.throws( function throws() {
		zsycon3( 'invalid', 'upper', 2, new Complex128Array( 4 ), 2, new Complex128Array( 2 ), 1, new Int32Array( 2 ), 1, 1.0, new Float64Array( 1 ), new Complex128Array( 4 ), 1 );
	}, TypeError );
});

test( 'zsycon3 throws TypeError for invalid uplo', function t() {
	assert.throws( function throws() {
		zsycon3( 'column-major', 'invalid', 2, new Complex128Array( 4 ), 2, new Complex128Array( 2 ), 1, new Int32Array( 2 ), 1, 1.0, new Float64Array( 1 ), new Complex128Array( 4 ), 1 );
	}, TypeError );
});

test( 'zsycon3 throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		zsycon3( 'column-major', 'upper', -1, new Complex128Array( 4 ), 2, new Complex128Array( 2 ), 1, new Int32Array( 2 ), 1, 1.0, new Float64Array( 1 ), new Complex128Array( 4 ), 1 );
	}, RangeError );
});

test( 'zsycon3 throws RangeError for LDA < max(1,N)', function t() {
	assert.throws( function throws() {
		zsycon3( 'column-major', 'upper', 4, new Complex128Array( 16 ), 2, new Complex128Array( 4 ), 1, new Int32Array( 4 ), 1, 1.0, new Float64Array( 1 ), new Complex128Array( 8 ), 1 );
	}, RangeError );
});
