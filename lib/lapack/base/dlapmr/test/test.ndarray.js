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
import dlapmr from './../lib/ndarray.js';

// FIXTURES //

import forward_4x3 from './fixtures/forward_4x3.json' with { type: 'json' };
import backward_4x3 from './fixtures/backward_4x3.json' with { type: 'json' };
import identity_3x2 from './fixtures/identity_3x2.json' with { type: 'json' };
import reverse_fwd_4x2 from './fixtures/reverse_fwd_4x2.json' with { type: 'json' };
import reverse_bwd_4x2 from './fixtures/reverse_bwd_4x2.json' with { type: 'json' };
import cyclic_fwd_5x2 from './fixtures/cyclic_fwd_5x2.json' with { type: 'json' };
import cyclic_bwd_5x2 from './fixtures/cyclic_bwd_5x2.json' with { type: 'json' };
// MMAX in Fortran test (leading dimension of X)
const MMAX = 5;

// FUNCTIONS //

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
	let relErr, i;
	assert.equal( actual.length, expected.length, msg + ': length mismatch' );
	for ( i = 0; i < expected.length; i += 1 ) {
		relErr = Math.abs( actual[ i ] - expected[ i ] ) / Math.max( Math.abs( expected[ i ] ), 1.0 ); // eslint-disable-line max-len
		assert.ok( relErr <= tol, msg + '[' + i + ']: expected ' + expected[ i ] + ', got ' + actual[ i ] ); // eslint-disable-line max-len
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
	for ( j = 0; j < N; j += 1 ) {
		for ( i = 0; i < M; i += 1 ) {
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
	for ( j = 0; j < N; j += 1 ) {
		for ( i = 0; i < M; i += 1 ) {
			out.push( A[ j * LDA + i ] );
		}
	}
	return out;
}

/**
* Extract M-by-N submatrix from fixture's X (which has LDA=MMAX=5).
*/
function extractFixtureX( tc ) {
	return extractMatrix( tc.X, MMAX, tc.M, tc.N );
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

test( 'dlapmr is a function', function t() {
	assert.equal( typeof dlapmr, 'function' );
});

test( 'dlapmr: forward permutation 4x3', function t() {

	const tc = forward_4x3;
	const M = 4;
	const N = 3;
	const LDA = M;
	const Xdata = [ 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12 ];
	const X = loadMatrix( Xdata, M, N, LDA );
	const K = new Int32Array([ 2, 0, 3, 1 ]);
	dlapmr( true, M, N, X, 1, LDA, 0, K, 1, 0 );
	const out = extractMatrix( X, LDA, M, N );
	assertArrayClose( out, extractFixtureX( tc ), 1e-14, 'X' );
});

test( 'dlapmr: backward permutation 4x3', function t() {

	const tc = backward_4x3;
	const M = 4;
	const N = 3;
	const LDA = M;
	const Xdata = [ 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12 ];
	const X = loadMatrix( Xdata, M, N, LDA );
	const K = new Int32Array([ 2, 0, 3, 1 ]);
	dlapmr( false, M, N, X, 1, LDA, 0, K, 1, 0 );
	const out = extractMatrix( X, LDA, M, N );
	assertArrayClose( out, extractFixtureX( tc ), 1e-14, 'X' );
});

test( 'dlapmr: identity permutation 3x2', function t() {

	const tc = identity_3x2;
	const M = 3;
	const N = 2;
	const LDA = M;
	const Xdata = [ 10, 20, 30, 40, 50, 60 ];
	const X = loadMatrix( Xdata, M, N, LDA );
	const K = new Int32Array([ 0, 1, 2 ]);
	dlapmr( true, M, N, X, 1, LDA, 0, K, 1, 0 );
	const out = extractMatrix( X, LDA, M, N );
	assertArrayClose( out, extractFixtureX( tc ), 1e-14, 'X' );
});

test( 'dlapmr: M=1 quick return', function t() {

	const M = 1;
	const N = 3;
	const LDA = M;
	const X = loadMatrix( [ 42, 43, 44 ], M, N, LDA );
	const K = new Int32Array([ 0 ]);
	dlapmr( true, M, N, X, 1, LDA, 0, K, 1, 0 );
	const out = extractMatrix( X, LDA, M, N );
	assertArrayClose( out, [ 42, 43, 44 ], 1e-14, 'X' );
});

test( 'dlapmr: M=0 quick return', function t() {
	const X = new Float64Array( 1 );
	const K = new Int32Array( 1 );

	// Should not throw or modify anything
	dlapmr( true, 0, 3, X, 1, 1, 0, K, 1, 0 );
	assert.ok( true, 'no error' );
});

test( 'dlapmr: reverse permutation forward 4x2', function t() {

	const tc = reverse_fwd_4x2;
	const M = 4;
	const N = 2;
	const LDA = M;
	const Xdata = [ 1, 2, 3, 4, 5, 6, 7, 8 ];
	const X = loadMatrix( Xdata, M, N, LDA );
	const K = new Int32Array([ 3, 2, 1, 0 ]);
	dlapmr( true, M, N, X, 1, LDA, 0, K, 1, 0 );
	const out = extractMatrix( X, LDA, M, N );
	assertArrayClose( out, extractFixtureX( tc ), 1e-14, 'X' );
});

test( 'dlapmr: reverse permutation backward 4x2', function t() {

	const tc = reverse_bwd_4x2;
	const M = 4;
	const N = 2;
	const LDA = M;
	const Xdata = [ 1, 2, 3, 4, 5, 6, 7, 8 ];
	const X = loadMatrix( Xdata, M, N, LDA );
	const K = new Int32Array([ 3, 2, 1, 0 ]);
	dlapmr( false, M, N, X, 1, LDA, 0, K, 1, 0 );
	const out = extractMatrix( X, LDA, M, N );
	assertArrayClose( out, extractFixtureX( tc ), 1e-14, 'X' );
});

test( 'dlapmr: cyclic permutation forward 5x2', function t() {

	const tc = cyclic_fwd_5x2;
	const M = 5;
	const N = 2;
	const LDA = M;
	const Xdata = [ 10, 20, 30, 40, 50, 11, 21, 31, 41, 51 ];
	const X = loadMatrix( Xdata, M, N, LDA );
	const K = new Int32Array([ 1, 2, 3, 4, 0 ]);
	dlapmr( true, M, N, X, 1, LDA, 0, K, 1, 0 );
	const out = extractMatrix( X, LDA, M, N );
	assertArrayClose( out, extractFixtureX( tc ), 1e-14, 'X' );
});

test( 'dlapmr: cyclic permutation backward 5x2', function t() {

	const tc = cyclic_bwd_5x2;
	const M = 5;
	const N = 2;
	const LDA = M;
	const Xdata = [ 10, 20, 30, 40, 50, 11, 21, 31, 41, 51 ];
	const X = loadMatrix( Xdata, M, N, LDA );
	const K = new Int32Array([ 1, 2, 3, 4, 0 ]);
	dlapmr( false, M, N, X, 1, LDA, 0, K, 1, 0 );
	const out = extractMatrix( X, LDA, M, N );
	assertArrayClose( out, extractFixtureX( tc ), 1e-14, 'X' );
});

test( 'dlapmr: non-unit stride for X', function t() {
	let i, j;

	const tc = forward_4x3;
	const strideX2 = 8;
	const strideX1 = 2;
	const Xdata = [ 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12 ];
	const M = 4;
	const N = 3;
	const X = new Float64Array( strideX2 * N );
	for ( j = 0; j < N; j += 1 ) {
		for ( i = 0; i < M; i += 1 ) {
			X[ i * strideX1 + j * strideX2 ] = Xdata[ j * M + i ];
		}
	}
	const K = new Int32Array([ 2, 0, 3, 1 ]);
	dlapmr( true, M, N, X, strideX1, strideX2, 0, K, 1, 0 );
	const out = [];
	for ( j = 0; j < N; j += 1 ) {
		for ( i = 0; i < M; i += 1 ) {
			out.push( X[ i * strideX1 + j * strideX2 ] );
		}
	}
	assertArrayClose( out, extractFixtureX( tc ), 1e-14, 'X strided' );
});

test( 'dlapmr: non-zero offset', function t() {
	let i, j;

	const tc = forward_4x3;
	const Xdata = [ 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12 ];
	const off = 7;
	const LDA = 4;
	const M = 4;
	const N = 3;
	const X = new Float64Array( off + LDA * N );
	for ( j = 0; j < N; j += 1 ) {
		for ( i = 0; i < M; i += 1 ) {
			X[ off + j * LDA + i ] = Xdata[ j * M + i ];
		}
	}
	const K = new Int32Array([ 99, 2, 0, 3, 1 ]);
	dlapmr( true, M, N, X, 1, LDA, off, K, 1, 1 );
	const out = [];
	for ( j = 0; j < N; j += 1 ) {
		for ( i = 0; i < M; i += 1 ) {
			out.push( X[ off + j * LDA + i ] );
		}
	}
	assertArrayClose( out, extractFixtureX( tc ), 1e-14, 'X with offset' );
});

test( 'dlapmr: K is restored after forward permutation', function t() {
	const LDA = 4;
	const M = 4;
	const N = 2;

	const X = new Float64Array([ 1, 2, 3, 4, 5, 6, 7, 8 ]);
	const K = new Int32Array([ 2, 0, 3, 1 ]);

	dlapmr( true, M, N, X, 1, LDA, 0, K, 1, 0 );

	// K should be restored to original values
	assert.deepStrictEqual( toArray( K ), [ 2, 0, 3, 1 ], 'K restored' );
});

test( 'dlapmr: K is restored after backward permutation', function t() {
	const LDA = 4;
	const M = 4;
	const N = 2;

	const X = new Float64Array([ 1, 2, 3, 4, 5, 6, 7, 8 ]);
	const K = new Int32Array([ 2, 0, 3, 1 ]);

	dlapmr( false, M, N, X, 1, LDA, 0, K, 1, 0 );

	assert.deepStrictEqual( toArray( K ), [ 2, 0, 3, 1 ], 'K restored' );
});

test( 'dlapmr: non-unit stride for K', function t() {

	const tc = forward_4x3;
	const Xdata = [ 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12 ];
	const LDA = 4;
	const M = 4;
	const N = 3;
	const X = loadMatrix( Xdata, M, N, LDA );
	const K = new Int32Array([ 2, 99, 0, 99, 3, 99, 1, 99 ]);
	dlapmr( true, M, N, X, 1, LDA, 0, K, 2, 0 );
	const out = extractMatrix( X, LDA, M, N );
	assertArrayClose( out, extractFixtureX( tc ), 1e-14, 'X with strided K' );
	assert.equal( K[ 0 ], 2, 'K[0] restored' );
	assert.equal( K[ 2 ], 0, 'K[2] restored' );
	assert.equal( K[ 4 ], 3, 'K[4] restored' );
	assert.equal( K[ 6 ], 1, 'K[6] restored' );
});
