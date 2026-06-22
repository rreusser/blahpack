/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import dsytriRook from './../lib/dsytri_rook.js';


// TESTS //

test( 'dsytri_rook is a function', function t() {
	assert.strictEqual( typeof dsytriRook, 'function', 'is a function' );
});

test( 'dsytri_rook has expected arity', function t() {
	assert.strictEqual( dsytriRook.length, 8, 'has expected arity' );
});

test( 'dsytri_rook throws TypeError for invalid order', function t() {
	assert.throws( function throws() {
		dsytriRook( 'invalid', 'upper', 2, new Float64Array( 4 ), 2, new Int32Array( 2 ), 1, new Float64Array( 2 ) );
	}, TypeError );
});

test( 'dsytri_rook throws TypeError for invalid uplo', function t() {
	assert.throws( function throws() {
		dsytriRook( 'row-major', 'invalid', 2, new Float64Array( 4 ), 2, new Int32Array( 2 ), 1, new Float64Array( 2 ) );
	}, TypeError );
});

test( 'dsytri_rook throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		dsytriRook( 'row-major', 'upper', -1, new Float64Array( 4 ), 2, new Int32Array( 2 ), 1, new Float64Array( 2 ) );
	}, RangeError );
});

test( 'dsytri_rook throws RangeError for too small LDA', function t() {
	assert.throws( function throws() {
		dsytriRook( 'column-major', 'upper', 3, new Float64Array( 9 ), 2, new Int32Array( 3 ), 1, new Float64Array( 3 ) );
	}, RangeError );
});

test( 'dsytri_rook quick return for N=0', function t() {
	var info = dsytriRook( 'column-major', 'upper', 0, new Float64Array( 0 ), 1, new Int32Array( 0 ), 1, new Float64Array( 0 ) );
	assert.equal( info, 0, 'info' );
});

test( 'dsytri_rook 1x1 column-major', function t() {
	var ipiv;
	var work;
	var info;
	var A;
	A = new Float64Array( [ 4.0 ] );
	ipiv = new Int32Array( [ 0 ] );
	work = new Float64Array( 1 );
	info = dsytriRook( 'column-major', 'upper', 1, A, 1, ipiv, 1, work );
	assert.equal( info, 0, 'info' );
	assert.equal( A[ 0 ], 0.25, 'A[0]' );
});

test( 'dsytri_rook 1x1 row-major', function t() {
	var ipiv;
	var work;
	var info;
	var A;
	A = new Float64Array( [ 4.0 ] );
	ipiv = new Int32Array( [ 0 ] );
	work = new Float64Array( 1 );
	info = dsytriRook( 'row-major', 'upper', 1, A, 1, ipiv, 1, work );
	assert.equal( info, 0, 'info' );
	assert.equal( A[ 0 ], 0.25, 'A[0]' );
});
