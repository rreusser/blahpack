/* eslint-disable no-restricted-syntax */

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
	assert.strictEqual( zlahefRook.length, 11, 'has expected arity' );
});

test( 'throws TypeError for invalid order', function t() {
	assert.throws( function throws() {
		const kb = new Int32Array( 1 );
		zlahefRook( 'invalid', 'upper', 2, 2, kb, new Complex128Array( 4 ), 2, new Int32Array( 2 ), 1, new Complex128Array( 4 ), 2 );
	}, TypeError );
});

test( 'throws TypeError for invalid uplo', function t() {
	assert.throws( function throws() {
		const kb = new Int32Array( 1 );
		zlahefRook( 'column-major', 'invalid', 2, 2, kb, new Complex128Array( 4 ), 2, new Int32Array( 2 ), 1, new Complex128Array( 4 ), 2 );
	}, TypeError );
});

test( 'throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		const kb = new Int32Array( 1 );
		zlahefRook( 'column-major', 'upper', -1, 2, kb, new Complex128Array( 4 ), 2, new Int32Array( 2 ), 1, new Complex128Array( 4 ), 2 );
	}, RangeError );
});

test( 'throws RangeError for invalid LDA in row-major', function t() {
	assert.throws( function throws() {
		const kb = new Int32Array( 1 );
		zlahefRook( 'row-major', 'upper', 4, 2, kb, new Complex128Array( 16 ), 2, new Int32Array( 4 ), 1, new Complex128Array( 8 ), 4 );
	}, RangeError );
});

test( 'throws RangeError for invalid LDW in row-major', function t() {
	assert.throws( function throws() {
		const kb = new Int32Array( 1 );
		zlahefRook( 'row-major', 'upper', 4, 4, kb, new Complex128Array( 16 ), 4, new Int32Array( 4 ), 1, new Complex128Array( 8 ), 2 );
	}, RangeError );
});

test( 'returns {info, kb} for a 2x2 Hermitian lower case (column-major)', function t() {
	const kb = new Int32Array( 1 );
	const A = new Complex128Array( [ 2.0, 0.0, 1.0, 0.5, 0.0, 0.0, 3.0, 0.0 ] );
	const IPIV = new Int32Array( 2 );
	const W = new Complex128Array( 4 );
	const result = zlahefRook( 'column-major', 'lower', 2, 2, kb, A, 2, IPIV, 1, W, 2 );
	assert.equal( result, 0, 'info' );
	assert.equal( kb[ 0 ], 2, 'kb' );
});

test( 'returns {info, kb} for a 2x2 Hermitian upper case (row-major)', function t() {
	const kb = new Int32Array( 1 );
	const A = new Complex128Array( [ 2.0, 0.0, 1.0, -0.5, 0.0, 0.0, 3.0, 0.0 ] );
	const IPIV = new Int32Array( 2 );
	const W = new Complex128Array( 4 );
	const result = zlahefRook( 'row-major', 'upper', 2, 2, kb, A, 2, IPIV, 1, W, 2 );
	assert.equal( result, 0, 'info' );
	assert.equal( kb[ 0 ], 2, 'kb' );
});
