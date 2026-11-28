/**
* @license Apache-2.0
*
* Copyright (c) 2026 Ricky Reusser.
*
* Derived from the LAPACK 3.12.0 reference implementation (BSD-3-Clause).
*/

/* eslint-disable no-restricted-syntax */

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
		const kb = new Int32Array( 1 );
		zlasyfRook( 'invalid', 'upper', 2, 2, kb, new Complex128Array( 4 ), 2, new Int32Array( 2 ), 1, new Complex128Array( 4 ), 2 );
	}, TypeError );
});

test( 'zlasyf_rook throws TypeError for invalid uplo', function t() {
	assert.throws( function throws() {
		const kb = new Int32Array( 1 );
		zlasyfRook( 'row-major', 'invalid', 2, 2, kb, new Complex128Array( 4 ), 2, new Int32Array( 2 ), 1, new Complex128Array( 4 ), 2 );
	}, TypeError );
});

test( 'zlasyf_rook throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		const kb = new Int32Array( 1 );
		zlasyfRook( 'row-major', 'upper', -1, 2, kb, new Complex128Array( 4 ), 2, new Int32Array( 2 ), 1, new Complex128Array( 4 ), 2 );
	}, RangeError );
});

test( 'zlasyf_rook throws RangeError for negative nb', function t() {
	assert.throws( function throws() {
		const kb = new Int32Array( 1 );
		zlasyfRook( 'row-major', 'upper', 2, -1, kb, new Complex128Array( 4 ), 2, new Int32Array( 2 ), 1, new Complex128Array( 4 ), 2 );
	}, RangeError );
});

test( 'zlasyf_rook row-major throws RangeError for LDA < N', function t() {
	assert.throws( function throws() {
		const kb = new Int32Array( 1 );
		zlasyfRook( 'row-major', 'upper', 4, 2, kb, new Complex128Array( 16 ), 2, new Int32Array( 4 ), 1, new Complex128Array( 8 ), 2 );
	}, RangeError );
});

test( 'zlasyf_rook row-major throws RangeError for LDW < nb', function t() {
	assert.throws( function throws() {
		const kb = new Int32Array( 1 );
		zlasyfRook( 'row-major', 'upper', 4, 4, kb, new Complex128Array( 16 ), 4, new Int32Array( 4 ), 1, new Complex128Array( 16 ), 2 );
	}, RangeError );
});

test( 'zlasyf_rook column-major: factors a small complex symmetric matrix', function t() {
	const kb = new Int32Array( 1 );

	// 2x2 column-major: A(0,0)=4+0i, A(1,0)=1+0.1i, A(0,1)=1+0.1i, A(1,1)=3+0i
	const A = new Complex128Array( [ 4.0, 0.0, 1.0, 0.1, 1.0, 0.1, 3.0, 0.0 ] );
	const IPIV = new Int32Array( 2 );
	const W = new Complex128Array( 4 );

	const result = zlasyfRook( 'column-major', 'lower', 2, 2, kb, A, 2, IPIV, 1, W, 2 );
	assert.equal( result, 0 );
	assert.equal( kb[ 0 ], 2 );
});
