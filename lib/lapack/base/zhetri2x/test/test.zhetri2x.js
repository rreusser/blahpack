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
import zhetri2x from './../lib/zhetri2x.js';


// TESTS //

test( 'main export is a function', function t() {
	assert.strictEqual( typeof zhetri2x, 'function', 'main export is a function' );
});

test( 'zhetri2x has expected arity', function t() {
	assert.strictEqual( zhetri2x.length, 11, 'has expected arity' );
});

test( 'zhetri2x throws TypeError for invalid order', function t() {
	assert.throws( function throws() {
		zhetri2x( 'invalid', 'upper', 1, new Complex128Array( 1 ), 1, new Int32Array( 1 ), 1, 0, new Complex128Array( 10 ), 1, 2 );
	}, TypeError );
});

test( 'zhetri2x throws TypeError for invalid uplo', function t() {
	assert.throws( function throws() {
		zhetri2x( 'row-major', 'invalid', 1, new Complex128Array( 1 ), 1, new Int32Array( 1 ), 1, 0, new Complex128Array( 10 ), 1, 2 );
	}, TypeError );
});

test( 'zhetri2x throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		zhetri2x( 'row-major', 'upper', -1, new Complex128Array( 1 ), 1, new Int32Array( 1 ), 1, 0, new Complex128Array( 10 ), 1, 2 );
	}, RangeError );
});

test( 'zhetri2x throws RangeError when LDA < max(1,N)', function t() {
	assert.throws( function throws() {
		zhetri2x( 'column-major', 'upper', 3, new Complex128Array( 9 ), 1, new Int32Array( 3 ), 1, 0, new Complex128Array( 30 ), 1, 2 );
	}, RangeError );
});

test( 'zhetri2x performs trivial inversion (N=1, column-major, lower)', function t() {
	var ldwork;
	var IPIV;
	var WORK;
	var info;
	var nb;
	var A;
	nb = 2;
	ldwork = 1 + nb + 1;
	A = new Complex128Array( [ 4.0, 0.0 ] );
	IPIV = new Int32Array( [ 0 ] );
	WORK = new Complex128Array( ldwork * ( nb + 3 ) );
	info = zhetri2x( 'column-major', 'lower', 1, A, 1, IPIV, 1, 0, WORK, 1, nb );
	assert.strictEqual( info, 0, 'info' );
	assert.ok( Math.abs( A.get( 0 ).re - 0.25 ) < 1e-15, 'inv(4+0i) = 0.25' );
	assert.strictEqual( A.get( 0 ).im, 0.0, 'imag part is zero' );
});

test( 'zhetri2x supports row-major layout (LDA swap)', function t() {
	var ldwork;
	var IPIV;
	var WORK;
	var info;
	var nb;
	var A;

	// For row-major, LDA is the row length and strideA1=LDA, strideA2=1. For a 1x1 it makes no difference.
	nb = 2;
	ldwork = 1 + nb + 1;
	A = new Complex128Array( [ 2.0, 0.0 ] );
	IPIV = new Int32Array( [ 0 ] );
	WORK = new Complex128Array( ldwork * ( nb + 3 ) );
	info = zhetri2x( 'row-major', 'upper', 1, A, 1, IPIV, 1, 0, WORK, 1, nb );
	assert.strictEqual( info, 0, 'info' );
	assert.ok( Math.abs( A.get( 0 ).re - 0.5 ) < 1e-15, 'inv(2+0i) = 0.5' );
});
