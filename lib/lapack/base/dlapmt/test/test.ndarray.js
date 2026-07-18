/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

/**
* @license Apache-2.0
*
* Copyright (c) 2026 Ricky Reusser.
*
* Derived from the LAPACK 3.12.0 reference implementation (BSD-3-Clause).
*/

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import dlapmt from './../lib/ndarray.js';

// FIXTURES //

import forward_3x4 from './fixtures/forward_3x4.json' with { type: 'json' };
import backward_3x4 from './fixtures/backward_3x4.json' with { type: 'json' };
import identity_2x3 from './fixtures/identity_2x3.json' with { type: 'json' };
import reverse_fwd_2x4 from './fixtures/reverse_fwd_2x4.json' with { type: 'json' };
import reverse_bwd_2x4 from './fixtures/reverse_bwd_2x4.json' with { type: 'json' };
import cyclic_fwd_2x5 from './fixtures/cyclic_fwd_2x5.json' with { type: 'json' };

// FUNCTIONS //

/**
* Asserts that two numbers are approximately equal.
*
* @private
* @param {*} actual - actual value
* @param {*} expected - expected value
* @param {number} tol - tolerance
* @param {string} msg - assertion message
*/
function assertClose( actual, expected, tol, msg ) {
	const relErr = Math.abs( actual - expected ) / Math.max( Math.abs( expected ), 1.0 ); // eslint-disable-line max-len
	assert.ok( relErr <= tol, msg + ': expected ' + expected + ', got ' + actual );
}

/**
* Asserts that two arrays are element-wise approximately equal.
*
* @private
* @param {*} actual - actual value
* @param {*} expected - expected value
* @param {number} tol - tolerance
* @param {string} msg - assertion message
*/
function assertArrayClose( actual, expected, tol, msg ) {
	let i;
	assert.equal( actual.length, expected.length, msg + ': length mismatch' );
	for ( i = 0; i < expected.length; i++ ) {
		assertClose( actual[ i ], expected[ i ], tol, msg + '[' + i + ']' );
	}
}

/**
* Load a dense M-by-N matrix (column-major) into a Float64Array with LDA stride.
*
* @param {Array} data - dense column-major data (M*N elements)
* @param {number} M - rows
* @param {number} N - columns
* @param {number} LDA - leading dimension (>= M)
* @returns {Float64Array} buffer of size LDA*N
*/
function loadMatrix( data, M, N, LDA ) {
	const A = new Float64Array( LDA * N );
	let i, j;
	for ( j = 0; j < N; j++ ) {
		for ( i = 0; i < M; i++ ) {
			A[ j * LDA + i ] = data[ j * M + i ];
		}
	}
	return A;
}

/**
* Extract M-by-N submatrix from flat column-major array with leading dim LDA.
*
* @returns {Array} extracted values in column-major order (M*N elements)
*/
function extractMatrix( A, LDA, M, N ) {
	const out = [];
	let i, j;
	for ( j = 0; j < N; j++ ) {
		for ( i = 0; i < M; i++ ) {
			out.push( A[ j * LDA + i ] );
		}
	}
	return out;
}

/**
* Extract M-by-N submatrix from fixture's X (which has LDA=MMAX=4).
*/
function extractFixtureX( tc ) {
	const LDA = 4; // MMAX in Fortran test
	const M = tc.M;
	const N = tc.N;
	return extractMatrix( tc.X, LDA, M, N );
}

/**
* Converts a typed array to a plain array.
*
* @private
* @param {TypedArray} arr - input array
* @returns {Array} output array
*/
function toArray( arr ) {
	const out = [];
	let i;
	for ( i = 0; i < arr.length; i++ ) {
		out.push( arr[ i ] );
	}
	return out;
}

// TESTS //

test( 'dlapmt: forward permutation 3x4', function t() {

	const tc = forward_3x4;
	const M = 3;
	const N = 4;
	const LDA = 4;
	const Xdata = [ 1, 2, 3, 5, 6, 7, 9, 10, 11, 13, 14, 15 ];
	const X = loadMatrix( Xdata, M, N, LDA );
	const K = new Int32Array([ 2, 0, 3, 1 ]);
	dlapmt( true, M, N, X, 1, LDA, 0, K, 1, 0 );
	const out = extractMatrix( X, LDA, M, N );
	assertArrayClose( out, extractFixtureX( tc ), 1e-14, 'X' );
});

test( 'dlapmt: backward permutation 3x4', function t() {

	const tc = backward_3x4;
	const M = 3;
	const N = 4;
	const LDA = 4;
	const Xdata = [ 1, 2, 3, 5, 6, 7, 9, 10, 11, 13, 14, 15 ];
	const X = loadMatrix( Xdata, M, N, LDA );
	const K = new Int32Array([ 2, 0, 3, 1 ]);
	dlapmt( false, M, N, X, 1, LDA, 0, K, 1, 0 );
	const out = extractMatrix( X, LDA, M, N );
	assertArrayClose( out, extractFixtureX( tc ), 1e-14, 'X' );
});

test( 'dlapmt: identity permutation 2x3', function t() {

	const tc = identity_2x3;
	const M = 2;
	const N = 3;
	const LDA = 4;
	const Xdata = [ 10, 20, 30, 40, 50, 60 ];
	const X = loadMatrix( Xdata, M, N, LDA );
	const K = new Int32Array([ 0, 1, 2 ]);
	dlapmt( true, M, N, X, 1, LDA, 0, K, 1, 0 );
	const out = extractMatrix( X, LDA, M, N );
	assertArrayClose( out, extractFixtureX( tc ), 1e-14, 'X' );
});

test( 'dlapmt: N=1 quick return', function t() {

	const M = 3;
	const N = 1;
	const LDA = 4;
	const X = loadMatrix( [ 42, 43, 44 ], M, N, LDA );
	const K = new Int32Array([ 0 ]);
	dlapmt( true, M, N, X, 1, LDA, 0, K, 1, 0 );
	const out = extractMatrix( X, LDA, M, N );
	assertArrayClose( out, [ 42, 43, 44 ], 1e-14, 'X' );
});

test( 'dlapmt: N=0 quick return', function t() {
	const X = new Float64Array( 1 );
	const K = new Int32Array( 1 );

	// Should not throw or modify anything
	dlapmt( true, 3, 0, X, 1, 4, 0, K, 1, 0 );
	assert.ok( true, 'no error' );
});

test( 'dlapmt: reverse permutation forward 2x4', function t() {

	const tc = reverse_fwd_2x4;
	const M = 2;
	const N = 4;
	const LDA = 4;
	const Xdata = [ 1, 2, 3, 4, 5, 6, 7, 8 ];
	const X = loadMatrix( Xdata, M, N, LDA );
	const K = new Int32Array([ 3, 2, 1, 0 ]);
	dlapmt( true, M, N, X, 1, LDA, 0, K, 1, 0 );
	const out = extractMatrix( X, LDA, M, N );
	assertArrayClose( out, extractFixtureX( tc ), 1e-14, 'X' );
});

test( 'dlapmt: reverse permutation backward 2x4', function t() {

	const tc = reverse_bwd_2x4;
	const M = 2;
	const N = 4;
	const LDA = 4;
	const Xdata = [ 1, 2, 3, 4, 5, 6, 7, 8 ];
	const X = loadMatrix( Xdata, M, N, LDA );
	const K = new Int32Array([ 3, 2, 1, 0 ]);
	dlapmt( false, M, N, X, 1, LDA, 0, K, 1, 0 );
	const out = extractMatrix( X, LDA, M, N );
	assertArrayClose( out, extractFixtureX( tc ), 1e-14, 'X' );
});

test( 'dlapmt: cyclic permutation forward 2x5', function t() {

	const tc = cyclic_fwd_2x5;
	const M = 2;
	const N = 5;
	const LDA = 4;
	const Xdata = [ 10, 11, 20, 21, 30, 31, 40, 41, 50, 51 ];
	const X = loadMatrix( Xdata, M, N, LDA );
	const K = new Int32Array([ 1, 2, 3, 4, 0 ]);
	dlapmt( true, M, N, X, 1, LDA, 0, K, 1, 0 );
	const out = extractMatrix( X, LDA, M, N );
	assertArrayClose( out, extractFixtureX( tc ), 1e-14, 'X' );
});

test( 'dlapmt: non-unit stride for X', function t() {
	let i, j;

	const tc = forward_3x4;
	const M = 3;
	const N = 4;
	const strideX1 = 2;
	const strideX2 = strideX1 * M;
	const Xdata = [ 1, 2, 3, 5, 6, 7, 9, 10, 11, 13, 14, 15 ];
	const X = new Float64Array( strideX2 * N );
	for ( j = 0; j < N; j++ ) {
		for ( i = 0; i < M; i++ ) {
			X[ i * strideX1 + j * strideX2 ] = Xdata[ j * M + i ];
		}
	}
	const K = new Int32Array([ 2, 0, 3, 1 ]);
	dlapmt( true, M, N, X, strideX1, strideX2, 0, K, 1, 0 );
	const out = [];
	for ( j = 0; j < N; j++ ) {
		for ( i = 0; i < M; i++ ) {
			out.push( X[ i * strideX1 + j * strideX2 ] );
		}
	}
	assertArrayClose( out, extractFixtureX( tc ), 1e-14, 'X strided' );
});

test( 'dlapmt: non-zero offset', function t() {
	let i, j;

	const tc = forward_3x4;
	const M = 3;
	const N = 4;
	const LDA = 4;
	const off = 5;
	const Xdata = [ 1, 2, 3, 5, 6, 7, 9, 10, 11, 13, 14, 15 ];
	const X = new Float64Array( off + LDA * N );
	for ( j = 0; j < N; j++ ) {
		for ( i = 0; i < M; i++ ) {
			X[ off + j * LDA + i ] = Xdata[ j * M + i ];
		}
	}
	const K = new Int32Array([ 0, 2, 0, 3, 1 ]);
	dlapmt( true, M, N, X, 1, LDA, off, K, 1, 1 );
	const out = [];
	for ( j = 0; j < N; j++ ) {
		for ( i = 0; i < M; i++ ) {
			out.push( X[ off + j * LDA + i ] );
		}
	}
	assertArrayClose( out, extractFixtureX( tc ), 1e-14, 'X with offset' );
});

test( 'dlapmt: K is restored after forward permutation', function t() {
	const LDA = 2;
	const M = 2;
	const N = 4;

	const X = new Float64Array([ 1, 2, 3, 4, 5, 6, 7, 8 ]);
	const K = new Int32Array([ 2, 0, 3, 1 ]);

	dlapmt( true, M, N, X, 1, LDA, 0, K, 1, 0 );

	// K should be restored to original values
	assert.deepStrictEqual( toArray( K ), [ 2, 0, 3, 1 ], 'K restored' );
});

test( 'dlapmt: K is restored after backward permutation', function t() {
	const LDA = 2;
	const M = 2;
	const N = 4;

	const X = new Float64Array([ 1, 2, 3, 4, 5, 6, 7, 8 ]);
	const K = new Int32Array([ 2, 0, 3, 1 ]);

	dlapmt( false, M, N, X, 1, LDA, 0, K, 1, 0 );

	assert.deepStrictEqual( toArray( K ), [ 2, 0, 3, 1 ], 'K restored' );
});
