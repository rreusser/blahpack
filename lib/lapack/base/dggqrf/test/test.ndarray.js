

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dggqrf from './../lib/ndarray.js';

// FIXTURES //

import basic_3x3 from './fixtures/basic_3x3.json' with { type: 'json' };
import m_gt_n from './fixtures/m_gt_n.json' with { type: 'json' };
import m_lt_n from './fixtures/m_lt_n.json' with { type: 'json' };
import n_zero from './fixtures/n_zero.json' with { type: 'json' };
import n_one from './fixtures/n_one.json' with { type: 'json' };
import tall_skinny from './fixtures/tall_skinny.json' with { type: 'json' };

// FUNCTIONS //

function assertClose( actual, expected, tol, msg ) {
	var relErr = Math.abs( actual - expected ) / Math.max( Math.abs( expected ), 1.0 );
	assert.ok( relErr <= tol, msg + ': expected ' + expected + ', got ' + actual );
}

function assertArrayClose( actual, expected, tol, msg ) {
	var i;
	assert.equal( actual.length, expected.length, msg + ': length mismatch' );
	for ( i = 0; i < expected.length; i++ ) {
		assertClose( actual[ i ], expected[ i ], tol, msg + '[' + i + ']' );
	}
}

/**
* Packs a column-major matrix from a flat (column-major) array into a
* Float64Array with LDA=N (packed, no padding).
*
* @param {Array} flat - column-major flat array (N*M elements, from Fortran with LDA=N rows used)
* @param {number} N - rows
* @param {number} cols - columns
* @returns {Float64Array} packed array
*/
function packMatrix( flat, N, cols ) {
	// Fixture matrices are already packed column-major (LDA = N rows)
	return new Float64Array( flat );
}

/**
* Helper to call dggqrf.
*/
function callDggqrf( N, M, P, aFlat, bFlat ) {
	var WORK = new Float64Array( Math.max( 1, Math.max( N, M, P ) * 64 ) );
	var TAUA = new Float64Array( Math.min( N, M ) );
	var TAUB = new Float64Array( Math.min( N, P ) );
	var lwork = WORK.length;
	var A = new Float64Array( aFlat );
	var B = new Float64Array( bFlat );
	var info;

	// Column-major: strideA1=1, strideA2=N
	info = dggqrf( N, M, P, A, 1, N, 0, TAUA, 1, 0, B, 1, N, 0, TAUB, 1, 0, WORK, 1, 0, lwork );
	return {
		info: info,
		A: Array.prototype.slice.call( A ),
		TAUA: Array.prototype.slice.call( TAUA ),
		B: Array.prototype.slice.call( B ),
		TAUB: Array.prototype.slice.call( TAUB )
	};
}

/**
* Builds a column-major flat array for an N-by-M matrix from row-major input values.
* Input: array of [row][col] values in row-major, stored into column-major.
*/
function colMajor( N, M, rowMajorValues ) {
	var out = new Array( N * M );
	var i;
	var j;
	for ( j = 0; j < M; j++ ) {
		for ( i = 0; i < N; i++ ) {
			out[ j * N + i ] = rowMajorValues[ i * M + j ];
		}
	}
	return out;
}

// TESTS //

test( 'dggqrf: basic_3x3', function t() {
	var tc = basic_3x3;
	var A = colMajor( 3, 3, [
		2, 1, 3,
		1, 4, 2,
		3, 2, 5
	]);
	var B = colMajor( 3, 3, [
		1, 2, 1,
		3, 1, 2,
		2, 3, 1
	]);
	var res = callDggqrf( 3, 3, 3, A, B );
	assert.equal( res.info, tc.info, 'info' );
	assertArrayClose( res.A, tc.A, 1e-14, 'A' );
	assertArrayClose( res.TAUA, tc.TAUA, 1e-14, 'TAUA' );
	assertArrayClose( res.B, tc.B, 1e-14, 'B' );
	assertArrayClose( res.TAUB, tc.TAUB, 1e-14, 'TAUB' );
});

test( 'dggqrf: m_gt_n', function t() {
	var tc = m_gt_n;
	var A = colMajor( 3, 4, [
		2, 1, 3, 1,
		1, 4, 2, 3,
		3, 2, 5, 2
	]);
	var B = colMajor( 3, 3, [
		1, 2, 1,
		3, 1, 2,
		2, 3, 1
	]);
	var res = callDggqrf( 3, 4, 3, A, B );
	assert.equal( res.info, tc.info, 'info' );
	assertArrayClose( res.A, tc.A, 1e-14, 'A' );
	assertArrayClose( res.TAUA, tc.TAUA, 1e-14, 'TAUA' );
	assertArrayClose( res.B, tc.B, 1e-14, 'B' );
	assertArrayClose( res.TAUB, tc.TAUB, 1e-14, 'TAUB' );
});

test( 'dggqrf: m_lt_n', function t() {
	var tc = m_lt_n;
	var A = colMajor( 4, 3, [
		2, 1, 3,
		1, 4, 2,
		3, 2, 5,
		1, 3, 1
	]);
	var B = colMajor( 4, 4, [
		1, 2, 1, 3,
		3, 1, 2, 1,
		2, 3, 1, 2,
		1, 2, 3, 1
	]);
	var res = callDggqrf( 4, 3, 4, A, B );
	assert.equal( res.info, tc.info, 'info' );
	assertArrayClose( res.A, tc.A, 1e-14, 'A' );
	assertArrayClose( res.TAUA, tc.TAUA, 1e-14, 'TAUA' );
	assertArrayClose( res.B, tc.B, 1e-14, 'B' );
	assertArrayClose( res.TAUB, tc.TAUB, 1e-14, 'TAUB' );
});

test( 'dggqrf: n_zero', function t() {
	var tc = n_zero;
	var A = [];
	var B = [];
	var WORK = new Float64Array( 64 );
	var TAUA = new Float64Array( 0 );
	var TAUB = new Float64Array( 0 );
	var info = dggqrf( 0, 3, 3, new Float64Array( 0 ), 1, 0, 0, TAUA, 1, 0, new Float64Array( 0 ), 1, 0, 0, TAUB, 1, 0, WORK, 1, 0, 64 );
	assert.equal( info, tc.info, 'info' );
});

test( 'dggqrf: n_one', function t() {
	var tc = n_one;
	var A = [ 5.0 ];
	var B = [ 3.0 ];
	var res = callDggqrf( 1, 1, 1, A, B );
	assert.equal( res.info, tc.info, 'info' );
	assertArrayClose( res.A, tc.A, 1e-14, 'A' );
	assertArrayClose( res.TAUA, tc.TAUA, 1e-14, 'TAUA' );
	assertArrayClose( res.B, tc.B, 1e-14, 'B' );
	assertArrayClose( res.TAUB, tc.TAUB, 1e-14, 'TAUB' );
});

test( 'dggqrf: tall_skinny', function t() {
	var tc = tall_skinny;
	var A = colMajor( 5, 2, [
		1, 2,
		3, 1,
		2, 3,
		1, 1,
		2, 2
	]);
	var B = colMajor( 5, 3, [
		1, 0.5, 2,
		0.5, 3, 1,
		2, 1, 1,
		1, 2, 0.5,
		3, 1, 2
	]);
	var res = callDggqrf( 5, 2, 3, A, B );
	assert.equal( res.info, tc.info, 'info' );
	assertArrayClose( res.A, tc.A, 1e-14, 'A' );
	assertArrayClose( res.TAUA, tc.TAUA, 1e-14, 'TAUA' );
	assertArrayClose( res.B, tc.B, 1e-14, 'B' );
	assertArrayClose( res.TAUB, tc.TAUB, 1e-14, 'TAUB' );
});
