/**
* @license Apache-2.0
*
* Copyright (c) 2025 The Stdlib Authors.
*/

/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import zlasyfRook from './../lib/zlasyf_rook.js';


// TESTS //

test( 'zlasyf_rook is a function', function t() {
	assert.strictEqual( typeof zlasyfRook, 'function', 'is a function' );
});

test( 'zlasyf_rook throws TypeError for invalid order', function t() {
	assert.throws( function throws() {
		zlasyfRook( 'invalid', 'upper', 2, 2, new Complex128Array( 4 ), 2, new Int32Array( 2 ), new Complex128Array( 4 ), 2 );
	}, TypeError );
});

test( 'zlasyf_rook throws TypeError for invalid uplo', function t() {
	assert.throws( function throws() {
		zlasyfRook( 'row-major', 'invalid', 2, 2, new Complex128Array( 4 ), 2, new Int32Array( 2 ), new Complex128Array( 4 ), 2 );
	}, TypeError );
});

test( 'zlasyf_rook throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		zlasyfRook( 'row-major', 'upper', -1, 2, new Complex128Array( 4 ), 2, new Int32Array( 2 ), new Complex128Array( 4 ), 2 );
	}, RangeError );
});

test( 'zlasyf_rook throws RangeError for negative nb', function t() {
	assert.throws( function throws() {
		zlasyfRook( 'row-major', 'upper', 2, -1, new Complex128Array( 4 ), 2, new Int32Array( 2 ), new Complex128Array( 4 ), 2 );
	}, RangeError );
});

test( 'zlasyf_rook row-major throws RangeError for LDA < N', function t() {
	assert.throws( function throws() {
		zlasyfRook( 'row-major', 'upper', 4, 2, new Complex128Array( 16 ), 2, new Int32Array( 4 ), new Complex128Array( 8 ), 2 );
	}, RangeError );
});

test( 'zlasyf_rook row-major throws RangeError for LDW < nb', function t() {
	assert.throws( function throws() {
		zlasyfRook( 'row-major', 'upper', 4, 4, new Complex128Array( 16 ), 4, new Int32Array( 4 ), new Complex128Array( 16 ), 2 );
	}, RangeError );
});

test( 'zlasyf_rook column-major: factors a small complex symmetric matrix', function t() {
	var result;
	var IPIV;
	var A;
	var W;

	// 2x2 column-major: A(0,0)=4+0i, A(1,0)=1+0.1i, A(0,1)=1+0.1i, A(1,1)=3+0i
	A = new Complex128Array( [ 4.0, 0.0, 1.0, 0.1, 1.0, 0.1, 3.0, 0.0 ] );
	IPIV = new Int32Array( 2 );
	W = new Complex128Array( 4 );

	result = zlasyfRook( 'column-major', 'lower', 2, 2, A, 2, IPIV, W, 2 );
	assert.equal( result.info, 0 );
	assert.equal( result.kb, 2 );
});
