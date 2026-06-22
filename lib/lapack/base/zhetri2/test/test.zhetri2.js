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
import zhetri2 from './../lib/zhetri2.js';


// TESTS //

test( 'main export is a function', function t() {
	assert.strictEqual( typeof zhetri2, 'function', 'main export is a function' );
});

test( 'zhetri2 has expected arity', function t() {
	assert.strictEqual( zhetri2.length, 10, 'has expected arity' );
});

test( 'zhetri2 throws TypeError for invalid order', function t() {
	assert.throws( function throws() {
		zhetri2( 'invalid', 'upper', 1, new Complex128Array( 1 ), 1, new Int32Array( 1 ), 1, 0, new Complex128Array( 1 ), 1 );
	}, TypeError );
});

test( 'zhetri2 throws TypeError for invalid uplo', function t() {
	assert.throws( function throws() {
		zhetri2( 'row-major', 'invalid', 1, new Complex128Array( 1 ), 1, new Int32Array( 1 ), 1, 0, new Complex128Array( 1 ), 1 );
	}, TypeError );
});

test( 'zhetri2 throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		zhetri2( 'row-major', 'upper', -1, new Complex128Array( 1 ), 1, new Int32Array( 1 ), 1, 0, new Complex128Array( 1 ), 1 );
	}, RangeError );
});

test( 'zhetri2 throws RangeError when LDA < max(1,N)', function t() {
	assert.throws( function throws() {
		zhetri2( 'column-major', 'upper', 3, new Complex128Array( 9 ), 1, new Int32Array( 3 ), 1, 0, new Complex128Array( 3 ), 1 );
	}, RangeError );
});

test( 'zhetri2 performs trivial inversion (N=1, column-major, lower)', function t() {
	var IPIV;
	var WORK;
	var info;
	var A;
	A = new Complex128Array( [ 4.0, 0.0 ] );
	IPIV = new Int32Array( [ 0 ] );
	WORK = new Complex128Array( 1 );
	info = zhetri2( 'column-major', 'lower', 1, A, 1, IPIV, 1, 0, WORK, 1 );
	assert.strictEqual( info, 0, 'info' );
	assert.ok( Math.abs( A.get( 0 ).re - 0.25 ) < 1e-15, 'inv(4+0i) = 0.25' );
	assert.strictEqual( A.get( 0 ).im, 0.0, 'imag part is zero' );
});

test( 'zhetri2 supports row-major layout (LDA swap)', function t() {
	var IPIV;
	var WORK;
	var info;
	var A;
	A = new Complex128Array( [ 2.0, 0.0 ] );
	IPIV = new Int32Array( [ 0 ] );
	WORK = new Complex128Array( 1 );
	info = zhetri2( 'row-major', 'upper', 1, A, 1, IPIV, 1, 0, WORK, 1 );
	assert.strictEqual( info, 0, 'info' );
	assert.ok( Math.abs( A.get( 0 ).re - 0.5 ) < 1e-15, 'inv(2+0i) = 0.5' );
});
