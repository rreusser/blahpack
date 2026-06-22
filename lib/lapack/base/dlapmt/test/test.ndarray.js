/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

/**
* @license Apache-2.0
*
* Copyright (c) 2025 The Stdlib Authors.
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
	var relErr = Math.abs( actual - expected ) / Math.max( Math.abs( expected ), 1.0 ); // eslint-disable-line max-len
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
	var i;
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
	var A = new Float64Array( LDA * N );
	var i;
	var j;
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
	var out = [];
	var i;
	var j;
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
	var LDA = 4; // MMAX in Fortran test
	var M = tc.M;
	var N = tc.N;
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
	var out = [];
	var i;
	for ( i = 0; i < arr.length; i++ ) {
		out.push( arr[ i ] );
	}
	return out;
}

// TESTS //

test( 'dlapmt: forward permutation 3x4', function t() {
	var Xdata;
	var LDA;
	var out;
	var tc;
	var M;
	var N;
	var X;
	var K;

	tc = forward_3x4;
	M = 3;
	N = 4;
	LDA = 4;
	Xdata = [ 1, 2, 3, 5, 6, 7, 9, 10, 11, 13, 14, 15 ];
	X = loadMatrix( Xdata, M, N, LDA );
	K = new Int32Array([ 2, 0, 3, 1 ]);
	dlapmt( true, M, N, X, 1, LDA, 0, K, 1, 0 );
	out = extractMatrix( X, LDA, M, N );
	assertArrayClose( out, extractFixtureX( tc ), 1e-14, 'X' );
});

test( 'dlapmt: backward permutation 3x4', function t() {
	var Xdata;
	var LDA;
	var out;
	var tc;
	var M;
	var N;
	var X;
	var K;

	tc = backward_3x4;
	M = 3;
	N = 4;
	LDA = 4;
	Xdata = [ 1, 2, 3, 5, 6, 7, 9, 10, 11, 13, 14, 15 ];
	X = loadMatrix( Xdata, M, N, LDA );
	K = new Int32Array([ 2, 0, 3, 1 ]);
	dlapmt( false, M, N, X, 1, LDA, 0, K, 1, 0 );
	out = extractMatrix( X, LDA, M, N );
	assertArrayClose( out, extractFixtureX( tc ), 1e-14, 'X' );
});

test( 'dlapmt: identity permutation 2x3', function t() {
	var Xdata;
	var LDA;
	var out;
	var tc;
	var M;
	var N;
	var X;
	var K;

	tc = identity_2x3;
	M = 2;
	N = 3;
	LDA = 4;
	Xdata = [ 10, 20, 30, 40, 50, 60 ];
	X = loadMatrix( Xdata, M, N, LDA );
	K = new Int32Array([ 0, 1, 2 ]);
	dlapmt( true, M, N, X, 1, LDA, 0, K, 1, 0 );
	out = extractMatrix( X, LDA, M, N );
	assertArrayClose( out, extractFixtureX( tc ), 1e-14, 'X' );
});

test( 'dlapmt: N=1 quick return', function t() {
	var LDA;
	var out;
	var M;
	var N;
	var X;
	var K;

	M = 3;
	N = 1;
	LDA = 4;
	X = loadMatrix( [ 42, 43, 44 ], M, N, LDA );
	K = new Int32Array([ 0 ]);
	dlapmt( true, M, N, X, 1, LDA, 0, K, 1, 0 );
	out = extractMatrix( X, LDA, M, N );
	assertArrayClose( out, [ 42, 43, 44 ], 1e-14, 'X' );
});

test( 'dlapmt: N=0 quick return', function t() {
	var X = new Float64Array( 1 );
	var K = new Int32Array( 1 );

	// Should not throw or modify anything
	dlapmt( true, 3, 0, X, 1, 4, 0, K, 1, 0 );
	assert.ok( true, 'no error' );
});

test( 'dlapmt: reverse permutation forward 2x4', function t() {
	var Xdata;
	var LDA;
	var out;
	var tc;
	var M;
	var N;
	var X;
	var K;

	tc = reverse_fwd_2x4;
	M = 2;
	N = 4;
	LDA = 4;
	Xdata = [ 1, 2, 3, 4, 5, 6, 7, 8 ];
	X = loadMatrix( Xdata, M, N, LDA );
	K = new Int32Array([ 3, 2, 1, 0 ]);
	dlapmt( true, M, N, X, 1, LDA, 0, K, 1, 0 );
	out = extractMatrix( X, LDA, M, N );
	assertArrayClose( out, extractFixtureX( tc ), 1e-14, 'X' );
});

test( 'dlapmt: reverse permutation backward 2x4', function t() {
	var Xdata;
	var LDA;
	var out;
	var tc;
	var M;
	var N;
	var X;
	var K;

	tc = reverse_bwd_2x4;
	M = 2;
	N = 4;
	LDA = 4;
	Xdata = [ 1, 2, 3, 4, 5, 6, 7, 8 ];
	X = loadMatrix( Xdata, M, N, LDA );
	K = new Int32Array([ 3, 2, 1, 0 ]);
	dlapmt( false, M, N, X, 1, LDA, 0, K, 1, 0 );
	out = extractMatrix( X, LDA, M, N );
	assertArrayClose( out, extractFixtureX( tc ), 1e-14, 'X' );
});

test( 'dlapmt: cyclic permutation forward 2x5', function t() {
	var Xdata;
	var LDA;
	var out;
	var tc;
	var M;
	var N;
	var X;
	var K;

	tc = cyclic_fwd_2x5;
	M = 2;
	N = 5;
	LDA = 4;
	Xdata = [ 10, 11, 20, 21, 30, 31, 40, 41, 50, 51 ];
	X = loadMatrix( Xdata, M, N, LDA );
	K = new Int32Array([ 1, 2, 3, 4, 0 ]);
	dlapmt( true, M, N, X, 1, LDA, 0, K, 1, 0 );
	out = extractMatrix( X, LDA, M, N );
	assertArrayClose( out, extractFixtureX( tc ), 1e-14, 'X' );
});

test( 'dlapmt: non-unit stride for X', function t() {
	var strideX1;
	var strideX2;
	var Xdata;
	var out;
	var tc;
	var M;
	var N;
	var X;
	var K;
	var i;
	var j;

	tc = forward_3x4;
	M = 3;
	N = 4;
	strideX1 = 2;
	strideX2 = strideX1 * M;
	Xdata = [ 1, 2, 3, 5, 6, 7, 9, 10, 11, 13, 14, 15 ];
	X = new Float64Array( strideX2 * N );
	for ( j = 0; j < N; j++ ) {
		for ( i = 0; i < M; i++ ) {
			X[ i * strideX1 + j * strideX2 ] = Xdata[ j * M + i ];
		}
	}
	K = new Int32Array([ 2, 0, 3, 1 ]);
	dlapmt( true, M, N, X, strideX1, strideX2, 0, K, 1, 0 );
	out = [];
	for ( j = 0; j < N; j++ ) {
		for ( i = 0; i < M; i++ ) {
			out.push( X[ i * strideX1 + j * strideX2 ] );
		}
	}
	assertArrayClose( out, extractFixtureX( tc ), 1e-14, 'X strided' );
});

test( 'dlapmt: non-zero offset', function t() {
	var Xdata;
	var LDA;
	var off;
	var out;
	var tc;
	var M;
	var N;
	var X;
	var K;
	var i;
	var j;

	tc = forward_3x4;
	M = 3;
	N = 4;
	LDA = 4;
	off = 5;
	Xdata = [ 1, 2, 3, 5, 6, 7, 9, 10, 11, 13, 14, 15 ];
	X = new Float64Array( off + LDA * N );
	for ( j = 0; j < N; j++ ) {
		for ( i = 0; i < M; i++ ) {
			X[ off + j * LDA + i ] = Xdata[ j * M + i ];
		}
	}
	K = new Int32Array([ 0, 2, 0, 3, 1 ]);
	dlapmt( true, M, N, X, 1, LDA, off, K, 1, 1 );
	out = [];
	for ( j = 0; j < N; j++ ) {
		for ( i = 0; i < M; i++ ) {
			out.push( X[ off + j * LDA + i ] );
		}
	}
	assertArrayClose( out, extractFixtureX( tc ), 1e-14, 'X with offset' );
});

test( 'dlapmt: K is restored after forward permutation', function t() {
	var LDA = 2;
	var M = 2;
	var N = 4;
	var K;
	var X;

	X = new Float64Array([ 1, 2, 3, 4, 5, 6, 7, 8 ]);
	K = new Int32Array([ 2, 0, 3, 1 ]);

	dlapmt( true, M, N, X, 1, LDA, 0, K, 1, 0 );

	// K should be restored to original values
	assert.deepStrictEqual( toArray( K ), [ 2, 0, 3, 1 ], 'K restored' );
});

test( 'dlapmt: K is restored after backward permutation', function t() {
	var LDA = 2;
	var M = 2;
	var N = 4;
	var K;
	var X;

	X = new Float64Array([ 1, 2, 3, 4, 5, 6, 7, 8 ]);
	K = new Int32Array([ 2, 0, 3, 1 ]);

	dlapmt( false, M, N, X, 1, LDA, 0, K, 1, 0 );

	assert.deepStrictEqual( toArray( K ), [ 2, 0, 3, 1 ], 'K restored' );
});
