/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import zgelss from './../lib/zgelss.js';


// FUNCTIONS //

/**
* Returns a deterministic complex column-major matrix.
*
* @private
* @param {NonNegativeInteger} rows - number of rows
* @param {NonNegativeInteger} cols - number of columns
* @param {number} seed - seed
* @returns {Complex128Array} matrix
*/
function cmatrix( rows, cols, seed ) {
	const out = new Float64Array( 2 * rows * cols );
	let i;
	for ( i = 0; i < out.length; i++ ) {
		out[ i ] = Math.sin( ( seed * ( i + 1 ) ) + ( 0.37 * i * i ) ) + ( ( i % 5 === 0 ) ? 3.0 : 0.0 );
	}
	return new Complex128Array( out.buffer );
}

/**
* Converts a column-major complex matrix to row-major.
*
* @private
* @param {Complex128Array} X - column-major matrix (leading dimension `rows`)
* @param {NonNegativeInteger} rows - number of rows
* @param {NonNegativeInteger} cols - number of columns
* @returns {Complex128Array} row-major matrix (leading dimension `cols`)
*/
function toRowMajor( X, rows, cols ) {
	const out = new Complex128Array( rows * cols );
	const xv = reinterpret( X, 0 );
	const ov = reinterpret( out, 0 );
	let i;
	let j;
	for ( j = 0; j < cols; j++ ) {
		for ( i = 0; i < rows; i++ ) {
			ov[ 2 * ( ( i * cols ) + j ) ] = xv[ 2 * ( ( j * rows ) + i ) ];
			ov[ ( 2 * ( ( i * cols ) + j ) ) + 1 ] = xv[ ( 2 * ( ( j * rows ) + i ) ) + 1 ];
		}
	}
	return out;
}


// TESTS //

test( 'zgelss is a function', function t() {
	assert.strictEqual( typeof zgelss, 'function', 'is a function' );
});

test( 'zgelss has expected arity', function t() {
	assert.strictEqual( zgelss.length, 14, 'has expected arity' );
});

test( 'zgelss throws RangeError for negative M', function t() {
	assert.throws( function throws() {
		zgelss( 'column-major', -1, 2, 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, -1.0, [ 0 ], new Float64Array( 4 ), new Float64Array( 4 ) );
	}, RangeError );
});

test( 'zgelss throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		zgelss( 'column-major', 2, -1, 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, -1.0, [ 0 ], new Float64Array( 4 ), new Float64Array( 4 ) );
	}, RangeError );
});

test( 'zgelss throws RangeError for negative nrhs', function t() {
	assert.throws( function throws() {
		zgelss( 'column-major', 2, 2, -1, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, -1.0, [ 0 ], new Float64Array( 4 ), new Float64Array( 4 ) );
	}, RangeError );
});

test( 'zgelss throws TypeError for invalid order', function t() {
	assert.throws( function throws() {
		zgelss( 'invalid', 2, 2, 1, new Complex128Array( 4 ), 2, new Complex128Array( 2 ), 2, new Float64Array( 2 ), 1, -1.0, [ 0 ], null, null );
	}, TypeError );
});

test( 'zgelss throws RangeError for invalid LDA', function t() {
	assert.throws( function throws() {
		zgelss( 'column-major', 3, 2, 1, new Complex128Array( 6 ), 2, new Complex128Array( 3 ), 3, new Float64Array( 2 ), 1, -1.0, [ 0 ], null, null );
	}, RangeError );
	assert.throws( function throws() {
		zgelss( 'row-major', 3, 2, 1, new Complex128Array( 6 ), 1, new Complex128Array( 3 ), 1, new Float64Array( 2 ), 1, -1.0, [ 0 ], null, null );
	}, RangeError );
});

test( 'zgelss throws RangeError for invalid LDB', function t() {
	assert.throws( function throws() {
		zgelss( 'column-major', 2, 3, 1, new Complex128Array( 6 ), 2, new Complex128Array( 3 ), 2, new Float64Array( 2 ), 1, -1.0, [ 0 ], null, null );
	}, RangeError );
	assert.throws( function throws() {
		zgelss( 'row-major', 2, 3, 2, new Complex128Array( 6 ), 3, new Complex128Array( 6 ), 1, new Float64Array( 2 ), 1, -1.0, [ 0 ], null, null );
	}, RangeError );
});

test( 'zgelss: row-major matches column-major (overdetermined and underdetermined)', function t() {
	const cases = [ [ 5, 3, 2 ], [ 3, 5, 2 ] ];
	let infoC, infoR, rankC, rankR, ldb, Sc, Sr, Ac, Bc, Ar, Br, M, N, k, c;
	for ( k = 0; k < cases.length; k++ ) {
		c = cases[ k ];
		M = c[ 0 ];
		N = c[ 1 ];
		ldb = Math.max( M, N );
		Ac = cmatrix( M, N, 0.7 + k );
		Bc = cmatrix( ldb, c[ 2 ], 1.9 + k );
		Ar = toRowMajor( Ac, M, N );
		Br = toRowMajor( Bc, ldb, c[ 2 ] );
		Sc = new Float64Array( Math.min( M, N ) );
		Sr = new Float64Array( Math.min( M, N ) );
		rankC = [ 0 ];
		rankR = [ 0 ];
		infoC = zgelss( 'column-major', M, N, c[ 2 ], Ac, M, Bc, ldb, Sc, 1, -1.0, rankC, null, null );
		infoR = zgelss( 'row-major', M, N, c[ 2 ], Ar, N, Br, c[ 2 ], Sr, 1, -1.0, rankR, null, null );
		assert.strictEqual( infoR, infoC, 'info' );
		assert.deepStrictEqual( rankR, rankC, 'rank' );
		assert.deepStrictEqual( Sr, Sc, 'S case ' + k );
		assert.deepStrictEqual( reinterpret( Br, 0 ), reinterpret( toRowMajor( Bc, ldb, c[ 2 ] ), 0 ), 'B case ' + k );
	}
});

test( 'zgelss: negative strideS writes singular values in reverse', function t() {
	const M = 3;
	const N = 5;
	const A1 = cmatrix( M, N, 0.5 );
	const A2 = cmatrix( M, N, 0.5 );
	const B1 = cmatrix( N, 1, 0.9 );
	const B2 = cmatrix( N, 1, 0.9 );
	const S1 = new Float64Array( M );
	const S2 = new Float64Array( M );
	zgelss( 'column-major', M, N, 1, A1, M, B1, N, S1, 1, -1.0, [ 0 ], null, null );
	zgelss( 'column-major', M, N, 1, A2, M, B2, N, S2, -1, -1.0, [ 0 ], null, null );
	assert.deepStrictEqual( Array.from( S2 ).reverse(), Array.from( S1 ), 'S reversed' );
});

test( 'zgelss: row-major with a tight caller WORK (LWORK >= MINWRK but < max(M,N)*nrhs) matches column-major', function t() {
	// zgelss.f takes the full ZGEMM only when LWORK >= LDB*NRHS, LDB being max(M,N), the row extent of B. The check used `strideB2*nrhs`, which is 1*nrhs in row-major, so the full GEMM wrote N*nrhs elements into a WORK too small for them and B came back NaN.
	const cases = [ [ 5, 4, 40 ], [ 4, 5, 40 ] ]; // path 1 and path 2b (both below MNTHR = 6)
	const lwork = 100; // >= MINWRK = 2*min(M,N) + max(M,N,nrhs) = 48, < max(M,N)*nrhs = 200
	let infoC, infoR, ldb, Sc, Sr, Ac, Bc, Ar, Br, Bn, X, Y, Z, M, N, k, c, i;
	for ( k = 0; k < cases.length; k++ ) {
		c = cases[ k ];
		M = c[ 0 ];
		N = c[ 1 ];
		ldb = Math.max( M, N );
		Ac = cmatrix( M, N, 0.3 + k );
		Bc = cmatrix( ldb, c[ 2 ], 1.1 + k );
		Ar = toRowMajor( Ac, M, N );
		Br = toRowMajor( Bc, ldb, c[ 2 ] );
		Bn = new Complex128Array( Bc );
		Sc = new Float64Array( Math.min( M, N ) );
		Sr = new Float64Array( Math.min( M, N ) );
		zgelss( 'column-major', M, N, c[ 2 ], new Complex128Array( Ac ), M, Bn, ldb, new Float64Array( Math.min( M, N ) ), 1, -1.0, [ 0 ], null, null );
		infoC = zgelss( 'column-major', M, N, c[ 2 ], Ac, M, Bc, ldb, Sc, 1, -1.0, [ 0 ], new Complex128Array( lwork ), null );
		infoR = zgelss( 'row-major', M, N, c[ 2 ], Ar, N, Br, c[ 2 ], Sr, 1, -1.0, [ 0 ], new Complex128Array( lwork ), null );
		assert.strictEqual( infoC, 0, 'column-major info' );
		assert.strictEqual( infoR, 0, 'row-major info' );
		X = reinterpret( Br, 0 );
		Y = reinterpret( toRowMajor( Bc, ldb, c[ 2 ] ), 0 );
		Z = reinterpret( toRowMajor( Bn, ldb, c[ 2 ] ), 0 );
		for ( i = 0; i < 2 * N * c[ 2 ]; i++ ) {
			assert.ok( Math.abs( X[ i ] - Y[ i ] ) <= 1e-12 * ( 1.0 + Math.abs( Y[ i ] ) ), 'case ' + k + ': row-major X[' + i + '] = ' + X[ i ] + ', column-major ' + Y[ i ] );
			assert.ok( Math.abs( Y[ i ] - Z[ i ] ) <= 1e-12 * ( 1.0 + Math.abs( Z[ i ] ) ), 'case ' + k + ': tight-WORK X[' + i + '] = ' + Y[ i ] + ', null-WORK ' + Z[ i ] );
		}
		for ( i = 0; i < Sc.length; i++ ) {
			assert.ok( Math.abs( Sr[ i ] - Sc[ i ] ) <= 1e-13 * Sc[ 0 ], 'case ' + k + ': S[' + i + ']' );
		}
	}
});
