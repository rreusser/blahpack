/**
* @license Apache-2.0
*
* Copyright (c) 2025 The Stdlib Authors.
*/

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import zlapmt from './../lib/ndarray.js';

// FIXTURES //

import forward_3x4 from './fixtures/forward_3x4.json' with { type: 'json' };
import backward_3x4 from './fixtures/backward_3x4.json' with { type: 'json' };
import identity_2x3 from './fixtures/identity_2x3.json' with { type: 'json' };
import reverse_fwd_2x4 from './fixtures/reverse_fwd_2x4.json' with { type: 'json' };
import reverse_bwd_2x4 from './fixtures/reverse_bwd_2x4.json' with { type: 'json' };
import cyclic_fwd_2x5 from './fixtures/cyclic_fwd_2x5.json' with { type: 'json' };

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
* Load a dense M-by-N complex matrix (column-major, interleaved re/im) into a
* Complex128Array with leading dimension LDA (in complex elements).
*
* @param {Array} data - interleaved re/im column-major data (2*M*N elements)
* @param {number} M - rows
* @param {number} N - columns
* @param {number} LDA - leading dimension (>= M), in complex elements
* @returns {Complex128Array} buffer of size LDA*N complex elements
*/
function loadComplexMatrix( data, M, N, LDA ) {
	var A = new Complex128Array( LDA * N );
	var Av = reinterpret( A, 0 );
	var i;
	var j;
	for ( j = 0; j < N; j++ ) {
		for ( i = 0; i < M; i++ ) {
			Av[ ( j * LDA + i ) * 2 ] = data[ ( j * M + i ) * 2 ];
			Av[ ( j * LDA + i ) * 2 + 1 ] = data[ ( j * M + i ) * 2 + 1 ];
		}
	}
	return A;
}

/**
* Extract M-by-N submatrix from a Complex128Array with leading dim LDA.
*
* @returns {Array} interleaved re/im in column-major order (2*M*N elements)
*/
function extractComplexMatrix( A, LDA, M, N ) {
	var Av = reinterpret( A, 0 );
	var out = [];
	var i;
	var j;
	for ( j = 0; j < N; j++ ) {
		for ( i = 0; i < M; i++ ) {
			out.push( Av[ ( j * LDA + i ) * 2 ] );
			out.push( Av[ ( j * LDA + i ) * 2 + 1 ] );
		}
	}
	return out;
}

// TESTS //

test( 'zlapmt is a function', function t() {
	assert.equal( typeof zlapmt, 'function' );
});

test( 'zlapmt: forward permutation 3x4', function t() {
	var tc = forward_3x4;
	var M = 3;
	var N = 4;
	var LDA = 4;

	// Input matrix (column-major complex):
	// col 0: (1+2i), (3+4i), (5+6i)
	// col 1: (7+8i), (9+10i), (11+12i)
	// col 2: (13+14i), (15+16i), (17+18i)
	// col 3: (19+20i), (21+22i), (23+24i)
	var Xdata = [
		1, 2, 3, 4, 5, 6,
		7, 8, 9, 10, 11, 12,
		13, 14, 15, 16, 17, 18,
		19, 20, 21, 22, 23, 24
	];
	var X = loadComplexMatrix( Xdata, M, N, LDA );

	// K = [3, 1, 4, 2] in Fortran (1-based) -> [2, 0, 3, 1] in JS (0-based)
	var K = new Int32Array([ 2, 0, 3, 1 ]);

	zlapmt( true, M, N, X, 1, LDA, 0, K, 1, 0 );

	var out = extractComplexMatrix( X, LDA, M, N );
	assertArrayClose( out, tc.X, 1e-14, 'X' );
});

test( 'zlapmt: backward permutation 3x4', function t() {
	var tc = backward_3x4;
	var M = 3;
	var N = 4;
	var LDA = 4;

	var Xdata = [
		1, 2, 3, 4, 5, 6,
		7, 8, 9, 10, 11, 12,
		13, 14, 15, 16, 17, 18,
		19, 20, 21, 22, 23, 24
	];
	var X = loadComplexMatrix( Xdata, M, N, LDA );

	// K = [3, 1, 4, 2] -> [2, 0, 3, 1] (0-based)
	var K = new Int32Array([ 2, 0, 3, 1 ]);

	zlapmt( false, M, N, X, 1, LDA, 0, K, 1, 0 );

	var out = extractComplexMatrix( X, LDA, M, N );
	assertArrayClose( out, tc.X, 1e-14, 'X' );
});

test( 'zlapmt: identity permutation 2x3', function t() {
	var tc = identity_2x3;
	var M = 2;
	var N = 3;
	var LDA = 4;

	var Xdata = [
		10, 11, 20, 21,
		30, 31, 40, 41,
		50, 51, 60, 61
	];
	var X = loadComplexMatrix( Xdata, M, N, LDA );

	// K = [1, 2, 3] -> [0, 1, 2] (0-based)
	var K = new Int32Array([ 0, 1, 2 ]);

	zlapmt( true, M, N, X, 1, LDA, 0, K, 1, 0 );

	var out = extractComplexMatrix( X, LDA, M, N );
	assertArrayClose( out, tc.X, 1e-14, 'X' );
});

test( 'zlapmt: N=1 quick return', function t() {
	var M = 3;
	var N = 1;
	var LDA = 4;

	var X = loadComplexMatrix( [ 42, 43, 44, 45, 46, 47 ], M, N, LDA );
	var K = new Int32Array([ 0 ]);

	zlapmt( true, M, N, X, 1, LDA, 0, K, 1, 0 );

	var out = extractComplexMatrix( X, LDA, M, N );
	assertArrayClose( out, [ 42, 43, 44, 45, 46, 47 ], 1e-14, 'X' );
});

test( 'zlapmt: N=0 quick return', function t() {
	var X = new Complex128Array( 1 );
	var K = new Int32Array( 1 );

	// Should not throw or modify anything
	zlapmt( true, 3, 0, X, 1, 4, 0, K, 1, 0 );
	assert.ok( true, 'no error' );
});

test( 'zlapmt: reverse permutation forward 2x4', function t() {
	var tc = reverse_fwd_2x4;
	var M = 2;
	var N = 4;
	var LDA = 4;

	var Xdata = [
		1, 0.5, 2, 1.5,
		3, 2.5, 4, 3.5,
		5, 4.5, 6, 5.5,
		7, 6.5, 8, 7.5
	];
	var X = loadComplexMatrix( Xdata, M, N, LDA );

	// K = [4, 3, 2, 1] -> [3, 2, 1, 0] (0-based)
	var K = new Int32Array([ 3, 2, 1, 0 ]);

	zlapmt( true, M, N, X, 1, LDA, 0, K, 1, 0 );

	var out = extractComplexMatrix( X, LDA, M, N );
	assertArrayClose( out, tc.X, 1e-14, 'X' );
});

test( 'zlapmt: reverse permutation backward 2x4', function t() {
	var tc = reverse_bwd_2x4;
	var M = 2;
	var N = 4;
	var LDA = 4;

	var Xdata = [
		1, 0.5, 2, 1.5,
		3, 2.5, 4, 3.5,
		5, 4.5, 6, 5.5,
		7, 6.5, 8, 7.5
	];
	var X = loadComplexMatrix( Xdata, M, N, LDA );

	// K = [4, 3, 2, 1] -> [3, 2, 1, 0] (0-based)
	var K = new Int32Array([ 3, 2, 1, 0 ]);

	zlapmt( false, M, N, X, 1, LDA, 0, K, 1, 0 );

	var out = extractComplexMatrix( X, LDA, M, N );
	assertArrayClose( out, tc.X, 1e-14, 'X' );
});

test( 'zlapmt: cyclic permutation forward 2x5', function t() {
	var tc = cyclic_fwd_2x5;
	var M = 2;
	var N = 5;
	var LDA = 4;

	var Xdata = [
		10, 1, 11, 2,
		20, 3, 21, 4,
		30, 5, 31, 6,
		40, 7, 41, 8,
		50, 9, 51, 10
	];
	var X = loadComplexMatrix( Xdata, M, N, LDA );

	// K = [2, 3, 4, 5, 1] -> [1, 2, 3, 4, 0] (0-based)
	var K = new Int32Array([ 1, 2, 3, 4, 0 ]);

	zlapmt( true, M, N, X, 1, LDA, 0, K, 1, 0 );

	var out = extractComplexMatrix( X, LDA, M, N );
	assertArrayClose( out, tc.X, 1e-14, 'X' );
});

test( 'zlapmt: K is restored after forward permutation', function t() {
	var M = 2;
	var N = 4;
	var LDA = 2;
	var K;
	var X;

	X = new Complex128Array( [ 1, 0, 2, 0, 3, 0, 4, 0, 5, 0, 6, 0, 7, 0, 8, 0 ] );
	K = new Int32Array([ 2, 0, 3, 1 ]);

	zlapmt( true, M, N, X, 1, LDA, 0, K, 1, 0 );

	// K should be restored to original values
	assert.deepStrictEqual( Array.from( K ), [ 2, 0, 3, 1 ], 'K restored' );
});

test( 'zlapmt: K is restored after backward permutation', function t() {
	var M = 2;
	var N = 4;
	var LDA = 2;
	var K;
	var X;

	X = new Complex128Array( [ 1, 0, 2, 0, 3, 0, 4, 0, 5, 0, 6, 0, 7, 0, 8, 0 ] );
	K = new Int32Array([ 2, 0, 3, 1 ]);

	zlapmt( false, M, N, X, 1, LDA, 0, K, 1, 0 );

	assert.deepStrictEqual( Array.from( K ), [ 2, 0, 3, 1 ], 'K restored' );
});

test( 'zlapmt: non-unit stride for X (strideX1=2)', function t() {
	var tc = forward_3x4;
	var M = 3;
	var N = 4;
	var strideX1 = 2; // complex elements
	var strideX2 = strideX1 * M; // 6 complex elements
	var Xdata = [
		1, 2, 3, 4, 5, 6,
		7, 8, 9, 10, 11, 12,
		13, 14, 15, 16, 17, 18,
		19, 20, 21, 22, 23, 24
	];
	var out;
	var Xv;
	var X;
	var K;
	var i;
	var j;

	X = new Complex128Array( strideX2 * N );
	Xv = reinterpret( X, 0 );
	for ( j = 0; j < N; j++ ) {
		for ( i = 0; i < M; i++ ) {
			Xv[ ( i * strideX1 + j * strideX2 ) * 2 ] = Xdata[ ( j * M + i ) * 2 ];
			Xv[ ( i * strideX1 + j * strideX2 ) * 2 + 1 ] = Xdata[ ( j * M + i ) * 2 + 1 ];
		}
	}

	K = new Int32Array([ 2, 0, 3, 1 ]);
	zlapmt( true, M, N, X, strideX1, strideX2, 0, K, 1, 0 );

	out = [];
	for ( j = 0; j < N; j++ ) {
		for ( i = 0; i < M; i++ ) {
			out.push( Xv[ ( i * strideX1 + j * strideX2 ) * 2 ] );
			out.push( Xv[ ( i * strideX1 + j * strideX2 ) * 2 + 1 ] );
		}
	}
	assertArrayClose( out, tc.X, 1e-14, 'X strided' );
});

test( 'zlapmt: non-zero offset', function t() {
	var tc = forward_3x4;
	var M = 3;
	var N = 4;
	var LDA = 4;
	var off = 5; // complex-element offset
	var Xdata = [
		1, 2, 3, 4, 5, 6,
		7, 8, 9, 10, 11, 12,
		13, 14, 15, 16, 17, 18,
		19, 20, 21, 22, 23, 24
	];
	var out;
	var Xv;
	var X;
	var K;
	var i;
	var j;

	X = new Complex128Array( off + LDA * N );
	Xv = reinterpret( X, 0 );
	for ( j = 0; j < N; j++ ) {
		for ( i = 0; i < M; i++ ) {
			Xv[ ( off + j * LDA + i ) * 2 ] = Xdata[ ( j * M + i ) * 2 ];
			Xv[ ( off + j * LDA + i ) * 2 + 1 ] = Xdata[ ( j * M + i ) * 2 + 1 ];
		}
	}

	K = new Int32Array([ 0, 2, 0, 3, 1 ]); // offset by 1
	zlapmt( true, M, N, X, 1, LDA, off, K, 1, 1 );

	out = [];
	for ( j = 0; j < N; j++ ) {
		for ( i = 0; i < M; i++ ) {
			out.push( Xv[ ( off + j * LDA + i ) * 2 ] );
			out.push( Xv[ ( off + j * LDA + i ) * 2 + 1 ] );
		}
	}
	assertArrayClose( out, tc.X, 1e-14, 'X with offset' );
});
