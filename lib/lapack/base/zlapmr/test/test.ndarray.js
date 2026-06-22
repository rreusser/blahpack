/**
* @license Apache-2.0
*
* Copyright (c) 2025 The Stdlib Authors.
*/

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import zlapmr from './../lib/ndarray.js';

// FIXTURES //

import forward_4x3 from './fixtures/forward_4x3.json' with { type: 'json' };
import backward_4x3 from './fixtures/backward_4x3.json' with { type: 'json' };
import identity_3x2 from './fixtures/identity_3x2.json' with { type: 'json' };
import reverse_fwd_4x2 from './fixtures/reverse_fwd_4x2.json' with { type: 'json' };
import reverse_bwd_4x2 from './fixtures/reverse_bwd_4x2.json' with { type: 'json' };
import cyclic_fwd_5x2 from './fixtures/cyclic_fwd_5x2.json' with { type: 'json' };
import cyclic_bwd_5x2 from './fixtures/cyclic_bwd_5x2.json' with { type: 'json' };

// FUNCTIONS //

function assertArrayClose( actual, expected, tol, msg ) {
	var relErr;
	var i;
	assert.equal( actual.length, expected.length, msg + ': length mismatch' );
	for ( i = 0; i < expected.length; i += 1 ) {
		relErr = Math.abs( actual[ i ] - expected[ i ] ) / Math.max( Math.abs( expected[ i ] ), 1.0 );
		assert.ok( relErr <= tol, msg + '[' + i + ']: expected ' + expected[ i ] + ', got ' + actual[ i ] );
	}
}

/**
* Load a dense M-by-N complex matrix (column-major) into a Complex128Array with LDA stride.
*
* @param {Array} data - interleaved re/im data (2*M*N doubles in column-major order)
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
	for ( j = 0; j < N; j += 1 ) {
		for ( i = 0; i < M; i += 1 ) {
			Av[ ( j * LDA + i ) * 2 ] = data[ ( j * M + i ) * 2 ];
			Av[ ( j * LDA + i ) * 2 + 1 ] = data[ ( j * M + i ) * 2 + 1 ];
		}
	}
	return A;
}

/**
* Extract M-by-N submatrix from Complex128Array with leading dim LDA.
*
* @returns {Array} interleaved re/im values in column-major order (2*M*N doubles)
*/
function extractComplexMatrix( A, LDA, M, N ) {
	var Av = reinterpret( A, 0 );
	var out = [];
	var i;
	var j;
	for ( j = 0; j < N; j += 1 ) {
		for ( i = 0; i < M; i += 1 ) {
			out.push( Av[ ( j * LDA + i ) * 2 ] );
			out.push( Av[ ( j * LDA + i ) * 2 + 1 ] );
		}
	}
	return out;
}

// TESTS //

test( 'zlapmr is a function', function t() {
	assert.equal( typeof zlapmr, 'function' );
});

test( 'zlapmr: forward permutation 4x3', function t() {
	var tc = forward_4x3;
	var M = 4;
	var N = 3;
	var LDA = M;

	// Input complex matrix (column-major, M=4, N=3):
	// row 0: (1+2i), (9+10i), (17+18i)
	// row 1: (3+4i), (11+12i), (19+20i)
	// row 2: (5+6i), (13+14i), (21+22i)
	// row 3: (7+8i), (15+16i), (23+24i)
	var Xdata = [
		1, 2, 3, 4, 5, 6, 7, 8,
		9, 10, 11, 12, 13, 14, 15, 16,
		17, 18, 19, 20, 21, 22, 23, 24
	];
	var X = loadComplexMatrix( Xdata, M, N, LDA );

	// K = [3, 1, 4, 2] in Fortran (1-based) -> [2, 0, 3, 1] in JS (0-based)
	var K = new Int32Array( [ 2, 0, 3, 1 ] );

	zlapmr( true, M, N, X, 1, LDA, 0, K, 1, 0 );

	var out = extractComplexMatrix( X, LDA, M, N );
	assertArrayClose( out, tc.X, 1e-14, 'X' );
});

test( 'zlapmr: backward permutation 4x3', function t() {
	var tc = backward_4x3;
	var M = 4;
	var N = 3;
	var LDA = M;

	var Xdata = [
		1, 2, 3, 4, 5, 6, 7, 8,
		9, 10, 11, 12, 13, 14, 15, 16,
		17, 18, 19, 20, 21, 22, 23, 24
	];
	var X = loadComplexMatrix( Xdata, M, N, LDA );

	// K = [3, 1, 4, 2] -> [2, 0, 3, 1] (0-based)
	var K = new Int32Array( [ 2, 0, 3, 1 ] );

	zlapmr( false, M, N, X, 1, LDA, 0, K, 1, 0 );

	var out = extractComplexMatrix( X, LDA, M, N );
	assertArrayClose( out, tc.X, 1e-14, 'X' );
});

test( 'zlapmr: identity permutation 3x2', function t() {
	var tc = identity_3x2;
	var M = 3;
	var N = 2;
	var LDA = M;

	var Xdata = [
		10, 20, 30, 40, 50, 60,
		70, 80, 90, 100, 110, 120
	];
	var X = loadComplexMatrix( Xdata, M, N, LDA );

	// K = [1, 2, 3] -> [0, 1, 2] (0-based)
	var K = new Int32Array( [ 0, 1, 2 ] );

	zlapmr( true, M, N, X, 1, LDA, 0, K, 1, 0 );

	var out = extractComplexMatrix( X, LDA, M, N );
	assertArrayClose( out, tc.X, 1e-14, 'X' );
});

test( 'zlapmr: M=1 quick return', function t() {
	var M = 1;
	var N = 3;
	var LDA = M;

	var Xdata = [ 42, 43, 44, 45, 46, 47 ];
	var X = loadComplexMatrix( Xdata, M, N, LDA );
	var K = new Int32Array( [ 0 ] );

	zlapmr( true, M, N, X, 1, LDA, 0, K, 1, 0 );

	var out = extractComplexMatrix( X, LDA, M, N );
	assertArrayClose( out, [ 42, 43, 44, 45, 46, 47 ], 1e-14, 'X' );
});

test( 'zlapmr: M=0 quick return', function t() {
	var X = new Complex128Array( 1 );
	var K = new Int32Array( 1 );

	// Should not throw or modify anything
	zlapmr( true, 0, 3, X, 1, 1, 0, K, 1, 0 );
	assert.ok( true, 'no error' );
});

test( 'zlapmr: reverse permutation forward 4x2', function t() {
	var tc = reverse_fwd_4x2;
	var M = 4;
	var N = 2;
	var LDA = M;

	var Xdata = [
		1, 2, 3, 4, 5, 6, 7, 8,
		9, 10, 11, 12, 13, 14, 15, 16
	];
	var X = loadComplexMatrix( Xdata, M, N, LDA );

	// K = [4, 3, 2, 1] -> [3, 2, 1, 0] (0-based)
	var K = new Int32Array( [ 3, 2, 1, 0 ] );

	zlapmr( true, M, N, X, 1, LDA, 0, K, 1, 0 );

	var out = extractComplexMatrix( X, LDA, M, N );
	assertArrayClose( out, tc.X, 1e-14, 'X' );
});

test( 'zlapmr: reverse permutation backward 4x2', function t() {
	var tc = reverse_bwd_4x2;
	var M = 4;
	var N = 2;
	var LDA = M;

	var Xdata = [
		1, 2, 3, 4, 5, 6, 7, 8,
		9, 10, 11, 12, 13, 14, 15, 16
	];
	var X = loadComplexMatrix( Xdata, M, N, LDA );

	// K = [4, 3, 2, 1] -> [3, 2, 1, 0] (0-based)
	var K = new Int32Array( [ 3, 2, 1, 0 ] );

	zlapmr( false, M, N, X, 1, LDA, 0, K, 1, 0 );

	var out = extractComplexMatrix( X, LDA, M, N );
	assertArrayClose( out, tc.X, 1e-14, 'X' );
});

test( 'zlapmr: cyclic permutation forward 5x2', function t() {
	var tc = cyclic_fwd_5x2;
	var M = 5;
	var N = 2;
	var LDA = M;

	var Xdata = [
		10, 11, 20, 21, 30, 31, 40, 41, 50, 51,
		12, 13, 22, 23, 32, 33, 42, 43, 52, 53
	];
	var X = loadComplexMatrix( Xdata, M, N, LDA );

	// K = [2, 3, 4, 5, 1] -> [1, 2, 3, 4, 0] (0-based)
	var K = new Int32Array( [ 1, 2, 3, 4, 0 ] );

	zlapmr( true, M, N, X, 1, LDA, 0, K, 1, 0 );

	var out = extractComplexMatrix( X, LDA, M, N );
	assertArrayClose( out, tc.X, 1e-14, 'X' );
});

test( 'zlapmr: cyclic permutation backward 5x2', function t() {
	var tc = cyclic_bwd_5x2;
	var M = 5;
	var N = 2;
	var LDA = M;

	var Xdata = [
		10, 11, 20, 21, 30, 31, 40, 41, 50, 51,
		12, 13, 22, 23, 32, 33, 42, 43, 52, 53
	];
	var X = loadComplexMatrix( Xdata, M, N, LDA );

	// K = [2, 3, 4, 5, 1] -> [1, 2, 3, 4, 0] (0-based)
	var K = new Int32Array( [ 1, 2, 3, 4, 0 ] );

	zlapmr( false, M, N, X, 1, LDA, 0, K, 1, 0 );

	var out = extractComplexMatrix( X, LDA, M, N );
	assertArrayClose( out, tc.X, 1e-14, 'X' );
});

test( 'zlapmr: non-unit stride for X', function t() {
	var tc = forward_4x3;
	var strideX2 = 8;
	var strideX1 = 2;
	var Xdata = [
		1, 2, 3, 4, 5, 6, 7, 8,
		9, 10, 11, 12, 13, 14, 15, 16,
		17, 18, 19, 20, 21, 22, 23, 24
	];
	var M = 4;
	var N = 3;
	var out;
	var Xv;
	var X;
	var K;
	var i;
	var j;

	X = new Complex128Array( strideX2 * N );
	Xv = reinterpret( X, 0 );
	for ( j = 0; j < N; j += 1 ) {
		for ( i = 0; i < M; i += 1 ) {
			Xv[ ( i * strideX1 + j * strideX2 ) * 2 ] = Xdata[ ( j * M + i ) * 2 ];
			Xv[ ( i * strideX1 + j * strideX2 ) * 2 + 1 ] = Xdata[ ( j * M + i ) * 2 + 1 ];
		}
	}

	K = new Int32Array( [ 2, 0, 3, 1 ] );
	zlapmr( true, M, N, X, strideX1, strideX2, 0, K, 1, 0 );

	out = [];
	for ( j = 0; j < N; j += 1 ) {
		for ( i = 0; i < M; i += 1 ) {
			out.push( Xv[ ( i * strideX1 + j * strideX2 ) * 2 ] );
			out.push( Xv[ ( i * strideX1 + j * strideX2 ) * 2 + 1 ] );
		}
	}
	assertArrayClose( out, tc.X, 1e-14, 'X strided' );
});

test( 'zlapmr: non-zero offset', function t() {
	var tc = forward_4x3;
	var Xdata = [
		1, 2, 3, 4, 5, 6, 7, 8,
		9, 10, 11, 12, 13, 14, 15, 16,
		17, 18, 19, 20, 21, 22, 23, 24
	];
	var off = 7;
	var LDA = 4;
	var M = 4;
	var N = 3;
	var out;
	var Xv;
	var X;
	var K;
	var i;
	var j;

	X = new Complex128Array( off + LDA * N );
	Xv = reinterpret( X, 0 );
	for ( j = 0; j < N; j += 1 ) {
		for ( i = 0; i < M; i += 1 ) {
			Xv[ ( off + j * LDA + i ) * 2 ] = Xdata[ ( j * M + i ) * 2 ];
			Xv[ ( off + j * LDA + i ) * 2 + 1 ] = Xdata[ ( j * M + i ) * 2 + 1 ];
		}
	}

	// K with offset 1: first element is padding
	K = new Int32Array( [ 99, 2, 0, 3, 1 ] );
	zlapmr( true, M, N, X, 1, LDA, off, K, 1, 1 );

	out = [];
	for ( j = 0; j < N; j += 1 ) {
		for ( i = 0; i < M; i += 1 ) {
			out.push( Xv[ ( off + j * LDA + i ) * 2 ] );
			out.push( Xv[ ( off + j * LDA + i ) * 2 + 1 ] );
		}
	}
	assertArrayClose( out, tc.X, 1e-14, 'X with offset' );
});

test( 'zlapmr: K is restored after forward permutation', function t() {
	var LDA = 4;
	var M = 4;
	var N = 2;
	var K;
	var X;

	X = new Complex128Array( LDA * N );
	K = new Int32Array( [ 2, 0, 3, 1 ] );

	zlapmr( true, M, N, X, 1, LDA, 0, K, 1, 0 );

	// K should be restored to original values
	assert.deepStrictEqual( Array.from( K ), [ 2, 0, 3, 1 ], 'K restored' );
});

test( 'zlapmr: K is restored after backward permutation', function t() {
	var LDA = 4;
	var M = 4;
	var N = 2;
	var K;
	var X;

	X = new Complex128Array( LDA * N );
	K = new Int32Array( [ 2, 0, 3, 1 ] );

	zlapmr( false, M, N, X, 1, LDA, 0, K, 1, 0 );

	assert.deepStrictEqual( Array.from( K ), [ 2, 0, 3, 1 ], 'K restored' );
});

test( 'zlapmr: non-unit stride for K', function t() {
	var tc = forward_4x3;
	var Xdata = [
		1, 2, 3, 4, 5, 6, 7, 8,
		9, 10, 11, 12, 13, 14, 15, 16,
		17, 18, 19, 20, 21, 22, 23, 24
	];
	var LDA = 4;
	var M = 4;
	var N = 3;
	var out;
	var X;
	var K;

	X = loadComplexMatrix( Xdata, M, N, LDA );

	// K = [2, 0, 3, 1] interleaved with padding: stride=2
	K = new Int32Array( [ 2, 99, 0, 99, 3, 99, 1, 99 ] );

	zlapmr( true, M, N, X, 1, LDA, 0, K, 2, 0 );

	out = extractComplexMatrix( X, LDA, M, N );
	assertArrayClose( out, tc.X, 1e-14, 'X with strided K' );

	// K should be restored
	assert.equal( K[ 0 ], 2, 'K[0] restored' );
	assert.equal( K[ 2 ], 0, 'K[2] restored' );
	assert.equal( K[ 4 ], 3, 'K[4] restored' );
	assert.equal( K[ 6 ], 1, 'K[6] restored' );
});
