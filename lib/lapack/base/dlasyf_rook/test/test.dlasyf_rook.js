/**
* @license Apache-2.0
*
* Copyright (c) 2025 The Stdlib Authors.
*/

/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import dlasyfRook from './../lib/dlasyf_rook.js';


// TESTS //

test( 'dlasyf_rook is a function', function t() {
	assert.strictEqual( typeof dlasyfRook, 'function', 'is a function' );
});

test( 'dlasyf_rook throws TypeError for invalid order', function t() {
	assert.throws( function throws() {
		dlasyfRook( 'invalid', 'upper', 2, 2, new Float64Array( 4 ), 2, new Int32Array( 2 ), new Float64Array( 4 ), 2 );
	}, TypeError );
});

test( 'dlasyf_rook throws TypeError for invalid uplo', function t() {
	assert.throws( function throws() {
		dlasyfRook( 'row-major', 'invalid', 2, 2, new Float64Array( 4 ), 2, new Int32Array( 2 ), new Float64Array( 4 ), 2 );
	}, TypeError );
});

test( 'dlasyf_rook throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		dlasyfRook( 'row-major', 'upper', -1, 2, new Float64Array( 4 ), 2, new Int32Array( 2 ), new Float64Array( 4 ), 2 );
	}, RangeError );
});

test( 'dlasyf_rook throws RangeError for negative nb', function t() {
	assert.throws( function throws() {
		dlasyfRook( 'row-major', 'upper', 2, -1, new Float64Array( 4 ), 2, new Int32Array( 2 ), new Float64Array( 4 ), 2 );
	}, RangeError );
});

test( 'dlasyf_rook row-major throws RangeError for LDA < N', function t() {
	assert.throws( function throws() {
		dlasyfRook( 'row-major', 'upper', 4, 2, new Float64Array( 16 ), 2, new Int32Array( 4 ), new Float64Array( 8 ), 2 );
	}, RangeError );
});

test( 'dlasyf_rook row-major throws RangeError for LDW < nb', function t() {
	assert.throws( function throws() {
		dlasyfRook( 'row-major', 'upper', 4, 4, new Float64Array( 16 ), 4, new Int32Array( 4 ), new Float64Array( 16 ), 2 );
	}, RangeError );
});

test( 'dlasyf_rook column-major: factors a small SPD matrix', function t() {
	var result;
	var A;
	var W;
	var IPIV;

	// 2x2 matrix [[4, 1], [1, 3]] in column-major
	A = new Float64Array( [ 4.0, 1.0, 1.0, 3.0 ] );
	IPIV = new Int32Array( 2 );
	W = new Float64Array( 4 );

	result = dlasyfRook( 'column-major', 'lower', 2, 2, A, 2, IPIV, W, 2 );
	assert.equal( result.info, 0 );
	assert.equal( result.kb, 2 );
});
