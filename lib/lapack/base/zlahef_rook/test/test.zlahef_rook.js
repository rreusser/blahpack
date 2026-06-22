/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import zlahefRook from './../lib/zlahef_rook.js';


// TESTS //

test( 'main export is a function', function t() {
	assert.strictEqual( typeof zlahefRook, 'function', 'is a function' );
});

test( 'has expected arity', function t() {
	assert.strictEqual( zlahefRook.length, 9, 'has expected arity' );
});

test( 'throws TypeError for invalid order', function t() {
	assert.throws( function throws() {
		zlahefRook( 'invalid', 'upper', 2, 2, new Complex128Array( 4 ), 2, new Int32Array( 2 ), new Complex128Array( 4 ), 2 );
	}, TypeError );
});

test( 'throws TypeError for invalid uplo', function t() {
	assert.throws( function throws() {
		zlahefRook( 'column-major', 'invalid', 2, 2, new Complex128Array( 4 ), 2, new Int32Array( 2 ), new Complex128Array( 4 ), 2 );
	}, TypeError );
});

test( 'throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		zlahefRook( 'column-major', 'upper', -1, 2, new Complex128Array( 4 ), 2, new Int32Array( 2 ), new Complex128Array( 4 ), 2 );
	}, RangeError );
});

test( 'throws RangeError for invalid LDA in row-major', function t() {
	assert.throws( function throws() {
		zlahefRook( 'row-major', 'upper', 4, 2, new Complex128Array( 16 ), 2, new Int32Array( 4 ), new Complex128Array( 8 ), 4 );
	}, RangeError );
});

test( 'throws RangeError for invalid LDW in row-major', function t() {
	assert.throws( function throws() {
		zlahefRook( 'row-major', 'upper', 4, 4, new Complex128Array( 16 ), 4, new Int32Array( 4 ), new Complex128Array( 8 ), 2 );
	}, RangeError );
});

test( 'returns {info, kb} for a 2x2 Hermitian lower case (column-major)', function t() {
	var result;
	var IPIV;
	var A;
	var W;
	A = new Complex128Array( [ 2.0, 0.0, 1.0, 0.5, 0.0, 0.0, 3.0, 0.0 ] );
	IPIV = new Int32Array( 2 );
	W = new Complex128Array( 4 );
	result = zlahefRook( 'column-major', 'lower', 2, 2, A, 2, IPIV, W, 2 );
	assert.equal( result.info, 0, 'info' );
	assert.equal( result.kb, 2, 'kb' );
});

test( 'returns {info, kb} for a 2x2 Hermitian upper case (row-major)', function t() {
	var result;
	var IPIV;
	var A;
	var W;
	A = new Complex128Array( [ 2.0, 0.0, 1.0, -0.5, 0.0, 0.0, 3.0, 0.0 ] );
	IPIV = new Int32Array( 2 );
	W = new Complex128Array( 4 );
	result = zlahefRook( 'row-major', 'upper', 2, 2, A, 2, IPIV, W, 2 );
	assert.equal( result.info, 0, 'info' );
	assert.equal( result.kb, 2, 'kb' );
});
