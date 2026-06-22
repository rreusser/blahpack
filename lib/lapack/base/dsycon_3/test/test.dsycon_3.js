/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import dsycon3 from './../lib/dsycon_3.js';


// TESTS //

test( 'dsycon3 is a function', function t() {
	assert.strictEqual( typeof dsycon3, 'function', 'is a function' );
});

test( 'dsycon3 has expected arity', function t() {
	assert.strictEqual( dsycon3.length, 15, 'has expected arity' );
});

test( 'dsycon3 throws TypeError for invalid order', function t() {
	assert.throws( function throws() {
		dsycon3( 'invalid', 'upper', 2, new Float64Array( 4 ), 2, new Float64Array( 2 ), 1, new Int32Array( 2 ), 1, 1.0, new Float64Array( 1 ), new Float64Array( 4 ), 1, new Int32Array( 2 ), 1 );
	}, TypeError );
});

test( 'dsycon3 throws TypeError for invalid uplo', function t() {
	assert.throws( function throws() {
		dsycon3( 'column-major', 'invalid', 2, new Float64Array( 4 ), 2, new Float64Array( 2 ), 1, new Int32Array( 2 ), 1, 1.0, new Float64Array( 1 ), new Float64Array( 4 ), 1, new Int32Array( 2 ), 1 );
	}, TypeError );
});

test( 'dsycon3 throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		dsycon3( 'column-major', 'upper', -1, new Float64Array( 4 ), 2, new Float64Array( 2 ), 1, new Int32Array( 2 ), 1, 1.0, new Float64Array( 1 ), new Float64Array( 4 ), 1, new Int32Array( 2 ), 1 );
	}, RangeError );
});

test( 'dsycon3 throws RangeError for LDA < max(1,N)', function t() {
	assert.throws( function throws() {
		dsycon3( 'column-major', 'upper', 4, new Float64Array( 16 ), 2, new Float64Array( 4 ), 1, new Int32Array( 4 ), 1, 1.0, new Float64Array( 1 ), new Float64Array( 8 ), 1, new Int32Array( 4 ), 1 );
	}, RangeError );
});
