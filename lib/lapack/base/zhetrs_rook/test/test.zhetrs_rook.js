/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import zhetrsRook from './../lib/zhetrs_rook.js';


// TESTS //

test( 'zhetrs_rook is a function', function t() {
	assert.strictEqual( typeof zhetrsRook, 'function', 'is a function' );
});

test( 'zhetrs_rook has expected arity', function t() {
	assert.strictEqual( zhetrsRook.length, 10, 'has expected arity' );
});

test( 'zhetrs_rook throws TypeError for invalid order', function t() {
	assert.throws( function throws() {
		zhetrsRook( 'invalid', 'upper', 2, 1, new Complex128Array( 4 ), 2, new Int32Array( 2 ), 1, new Complex128Array( 2 ), 2 );
	}, TypeError );
});

test( 'zhetrs_rook throws TypeError for invalid uplo', function t() {
	assert.throws( function throws() {
		zhetrsRook( 'row-major', 'invalid', 2, 1, new Complex128Array( 4 ), 2, new Int32Array( 2 ), 1, new Complex128Array( 2 ), 2 );
	}, TypeError );
});

test( 'zhetrs_rook throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		zhetrsRook( 'row-major', 'upper', -1, 1, new Complex128Array( 4 ), 2, new Int32Array( 2 ), 1, new Complex128Array( 2 ), 2 );
	}, RangeError );
});

test( 'zhetrs_rook throws RangeError for negative nrhs', function t() {
	assert.throws( function throws() {
		zhetrsRook( 'row-major', 'upper', 2, -1, new Complex128Array( 4 ), 2, new Int32Array( 2 ), 1, new Complex128Array( 2 ), 2 );
	}, RangeError );
});

test( 'zhetrs_rook throws RangeError for too small LDA', function t() {
	assert.throws( function throws() {
		zhetrsRook( 'column-major', 'upper', 3, 1, new Complex128Array( 9 ), 2, new Int32Array( 3 ), 1, new Complex128Array( 3 ), 3 );
	}, RangeError );
});

test( 'zhetrs_rook throws RangeError for too small LDB', function t() {
	assert.throws( function throws() {
		zhetrsRook( 'column-major', 'upper', 3, 1, new Complex128Array( 9 ), 3, new Int32Array( 3 ), 1, new Complex128Array( 3 ), 2 );
	}, RangeError );
});

test( 'zhetrs_rook column-major small solve', function t() {
	// Hermitian 1x1 matrix [3+0i], solve 3*x = (1+1i)
	var ipiv;
	var info;
	var A;
	var b;
	A = new Complex128Array( [ 3.0, 0.0 ] );
	b = new Complex128Array( [ 1.0, 1.0 ] );
	ipiv = new Int32Array( [ 0 ] );
	info = zhetrsRook( 'column-major', 'upper', 1, 1, A, 1, ipiv, 1, b, 1 );
	assert.equal( info, 0, 'info' );
});

test( 'zhetrs_rook row-major small solve', function t() {
	var ipiv;
	var info;
	var A;
	var b;
	A = new Complex128Array( [ 3.0, 0.0 ] );
	b = new Complex128Array( [ 1.0, 1.0 ] );
	ipiv = new Int32Array( [ 0 ] );
	info = zhetrsRook( 'row-major', 'upper', 1, 1, A, 1, ipiv, 1, b, 1 );
	assert.equal( info, 0, 'info' );
});
