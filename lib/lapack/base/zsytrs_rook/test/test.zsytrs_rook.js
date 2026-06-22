/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import zsytrsRook from './../lib/zsytrs_rook.js';


// TESTS //

test( 'zsytrs_rook is a function', function t() {
	assert.strictEqual( typeof zsytrsRook, 'function', 'is a function' );
});

test( 'zsytrs_rook has expected arity', function t() {
	assert.strictEqual( zsytrsRook.length, 10, 'has expected arity' );
});

test( 'zsytrs_rook throws TypeError for invalid order', function t() {
	assert.throws( function throws() {
		zsytrsRook( 'invalid', 'upper', 2, 1, new Complex128Array( 4 ), 2, new Int32Array( 2 ), 1, new Complex128Array( 2 ), 2 );
	}, TypeError );
});

test( 'zsytrs_rook throws TypeError for invalid uplo', function t() {
	assert.throws( function throws() {
		zsytrsRook( 'row-major', 'invalid', 2, 1, new Complex128Array( 4 ), 2, new Int32Array( 2 ), 1, new Complex128Array( 2 ), 2 );
	}, TypeError );
});

test( 'zsytrs_rook throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		zsytrsRook( 'row-major', 'upper', -1, 1, new Complex128Array( 4 ), 2, new Int32Array( 2 ), 1, new Complex128Array( 2 ), 2 );
	}, RangeError );
});

test( 'zsytrs_rook throws RangeError for negative nrhs', function t() {
	assert.throws( function throws() {
		zsytrsRook( 'row-major', 'upper', 2, -1, new Complex128Array( 4 ), 2, new Int32Array( 2 ), 1, new Complex128Array( 2 ), 2 );
	}, RangeError );
});

test( 'zsytrs_rook throws RangeError for too small LDA', function t() {
	assert.throws( function throws() {
		zsytrsRook( 'column-major', 'upper', 3, 1, new Complex128Array( 9 ), 2, new Int32Array( 3 ), 1, new Complex128Array( 3 ), 3 );
	}, RangeError );
});

test( 'zsytrs_rook throws RangeError for too small LDB', function t() {
	assert.throws( function throws() {
		zsytrsRook( 'column-major', 'upper', 3, 1, new Complex128Array( 9 ), 3, new Int32Array( 3 ), 1, new Complex128Array( 3 ), 2 );
	}, RangeError );
});

test( 'zsytrs_rook column-major small solve', function t() {
	// 1x1 complex symmetric matrix [3+2i], solve (3+2i)*x = (1+1i)
	var ipiv;
	var info;
	var A;
	var b;
	A = new Complex128Array( [ 3.0, 2.0 ] );
	b = new Complex128Array( [ 1.0, 1.0 ] );
	ipiv = new Int32Array( [ 0 ] );
	info = zsytrsRook( 'column-major', 'upper', 1, 1, A, 1, ipiv, 1, b, 1 );
	assert.equal( info, 0, 'info' );
});

test( 'zsytrs_rook row-major small solve', function t() {
	var ipiv;
	var info;
	var A;
	var b;
	A = new Complex128Array( [ 3.0, 2.0 ] );
	b = new Complex128Array( [ 1.0, 1.0 ] );
	ipiv = new Int32Array( [ 0 ] );
	info = zsytrsRook( 'row-major', 'upper', 1, 1, A, 1, ipiv, 1, b, 1 );
	assert.equal( info, 0, 'info' );
});
