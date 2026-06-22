/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import zsytrfRook from './../lib/zsytrf_rook.js';


// TESTS //

test( 'zsytrf_rook is a function', function t() {
	assert.strictEqual( typeof zsytrfRook, 'function', 'is a function' );
});

test( 'zsytrf_rook has expected arity', function t() {
	assert.strictEqual( zsytrfRook.length, 7, 'has expected arity' );
});

test( 'zsytrf_rook throws TypeError for invalid order', function t() {
	assert.throws( function throws() {
		zsytrfRook( 'invalid', 'upper', 2, new Complex128Array( 4 ), 2, new Int32Array( 2 ), 1 ); // eslint-disable-line max-len
	}, TypeError );
});

test( 'zsytrf_rook throws TypeError for invalid uplo', function t() {
	assert.throws( function throws() {
		zsytrfRook( 'row-major', 'invalid', 2, new Complex128Array( 4 ), 2, new Int32Array( 2 ), 1 ); // eslint-disable-line max-len
	}, TypeError );
});

test( 'zsytrf_rook throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		zsytrfRook( 'row-major', 'upper', -1, new Complex128Array( 4 ), 2, new Int32Array( 2 ), 1 ); // eslint-disable-line max-len
	}, RangeError );
});

test( 'zsytrf_rook throws RangeError for too-small LDA', function t() {
	assert.throws( function throws() {
		zsytrfRook( 'row-major', 'upper', 4, new Complex128Array( 16 ), 1, new Int32Array( 4 ), 1 ); // eslint-disable-line max-len
	}, RangeError );
});

test( 'zsytrf_rook returns 0 for N=0', function t() {
	var info = zsytrfRook( 'column-major', 'upper', 0, new Complex128Array( 1 ), 1, new Int32Array( 1 ), 1 ); // eslint-disable-line max-len
	assert.strictEqual( info, 0, 'info is 0' );
});

test( 'zsytrf_rook column-major basic 2x2', function t() {
	var IPIV;
	var info;
	var A;
	IPIV = new Int32Array( 2 );
	A = new Complex128Array( [ 4.0, 0.0, 1.0, 0.0, 1.0, 0.0, 3.0, 0.0 ] );
	info = zsytrfRook( 'column-major', 'lower', 2, A, 2, IPIV, 1 );
	assert.strictEqual( info, 0, 'info' );
});

test( 'zsytrf_rook row-major basic 2x2 (transposes via swapped strides)', function t() {
	var IPIV;
	var info;
	var A;
	IPIV = new Int32Array( 2 );
	A = new Complex128Array( [ 4.0, 0.0, 1.0, 0.0, 1.0, 0.0, 3.0, 0.0 ] );
	info = zsytrfRook( 'row-major', 'lower', 2, A, 2, IPIV, 1 );
	assert.strictEqual( info, 0, 'info' );
});
