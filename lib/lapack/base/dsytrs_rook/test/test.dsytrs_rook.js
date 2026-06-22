/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import dsytrsRook from './../lib/dsytrs_rook.js';


// TESTS //

test( 'dsytrs_rook is a function', function t() {
	assert.strictEqual( typeof dsytrsRook, 'function', 'is a function' );
});

test( 'dsytrs_rook has expected arity', function t() {
	assert.strictEqual( dsytrsRook.length, 10, 'has expected arity' );
});

test( 'dsytrs_rook throws TypeError for invalid order', function t() {
	assert.throws( function throws() {
		dsytrsRook( 'invalid', 'upper', 2, 1, new Float64Array( 4 ), 2, new Int32Array( 2 ), 1, new Float64Array( 2 ), 2 );
	}, TypeError );
});

test( 'dsytrs_rook throws TypeError for invalid uplo', function t() {
	assert.throws( function throws() {
		dsytrsRook( 'row-major', 'invalid', 2, 1, new Float64Array( 4 ), 2, new Int32Array( 2 ), 1, new Float64Array( 2 ), 2 );
	}, TypeError );
});

test( 'dsytrs_rook throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		dsytrsRook( 'row-major', 'upper', -1, 1, new Float64Array( 4 ), 2, new Int32Array( 2 ), 1, new Float64Array( 2 ), 2 );
	}, RangeError );
});

test( 'dsytrs_rook throws RangeError for negative nrhs', function t() {
	assert.throws( function throws() {
		dsytrsRook( 'row-major', 'upper', 2, -1, new Float64Array( 4 ), 2, new Int32Array( 2 ), 1, new Float64Array( 2 ), 2 );
	}, RangeError );
});

test( 'dsytrs_rook throws RangeError for too small LDA', function t() {
	assert.throws( function throws() {
		dsytrsRook( 'column-major', 'upper', 3, 1, new Float64Array( 9 ), 2, new Int32Array( 3 ), 1, new Float64Array( 3 ), 3 );
	}, RangeError );
});

test( 'dsytrs_rook throws RangeError for too small LDB', function t() {
	assert.throws( function throws() {
		dsytrsRook( 'column-major', 'upper', 3, 1, new Float64Array( 9 ), 3, new Int32Array( 3 ), 1, new Float64Array( 3 ), 2 );
	}, RangeError );
});

test( 'dsytrs_rook column-major small solve', function t() {
	var ipiv;
	var info;
	var A;
	var b;
	A = new Float64Array( [ 4.0 ] );
	b = new Float64Array( [ 8.0 ] );
	ipiv = new Int32Array( [ 0 ] );
	info = dsytrsRook( 'column-major', 'lower', 1, 1, A, 1, ipiv, 1, b, 1 );
	assert.equal( info, 0, 'info' );
	assert.equal( b[ 0 ], 2.0, 'b' );
});

test( 'dsytrs_rook row-major small solve', function t() {
	var ipiv;
	var info;
	var A;
	var b;
	A = new Float64Array( [ 4.0 ] );
	b = new Float64Array( [ 8.0 ] );
	ipiv = new Int32Array( [ 0 ] );
	info = dsytrsRook( 'row-major', 'lower', 1, 1, A, 1, ipiv, 1, b, 1 );
	assert.equal( info, 0, 'info' );
	assert.equal( b[ 0 ], 2.0, 'b' );
});
