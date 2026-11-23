/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import zgelss from './../lib/ndarray.js';
import zgeqrf from './../../zgeqrf/lib/base.js';
import zgelqf from './../../zgelqf/lib/base.js';
import { computeWorkSize } from './../lib/base.js';

// FIXTURES //

import overdetermined_full_rank from './fixtures/overdetermined_full_rank.json' with { type: 'json' };
import overdetermined_rank_deficient from './fixtures/overdetermined_rank_deficient.json' with { type: 'json' };
import underdetermined from './fixtures/underdetermined.json' with { type: 'json' };
import square_3x3 from './fixtures/square_3x3.json' with { type: 'json' };
import multiple_rhs from './fixtures/multiple_rhs.json' with { type: 'json' };
import m_zero from './fixtures/m_zero.json' with { type: 'json' };
import n_zero from './fixtures/n_zero.json' with { type: 'json' };
import overdetermined_tall from './fixtures/overdetermined_tall.json' with { type: 'json' };
import underdetermined_wide from './fixtures/underdetermined_wide.json' with { type: 'json' };

// FUNCTIONS //

/**
* Allocates a caller-owned complex WORK buffer of the minimum required size.
*
* @private
* @param {NonNegativeInteger} M - number of rows
* @param {NonNegativeInteger} N - number of columns
* @param {NonNegativeInteger} nrhs - number of right hand sides
* @returns {Complex128Array} workspace
*/
function mkW( M, N, nrhs ) {
	return new Complex128Array( computeWorkSize( M, N, nrhs ) );
}

/**
* Allocates a caller-owned real RWORK buffer of the minimum required size.
*
* @private
* @param {NonNegativeInteger} M - number of rows
* @param {NonNegativeInteger} N - number of columns
* @returns {Float64Array} real workspace
*/
function mkR( M, N ) {
	return new Float64Array( Math.max( 1, 5 * Math.min( M, N ) ) );
}

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
	assert.ok( relErr <= tol, msg + ': expected ' + expected + ', got ' + actual + ' (relErr=' + relErr + ')' ); // eslint-disable-line max-len
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
* Returns a deterministic, well-conditioned complex column-major matrix.
*
* @private
* @param {NonNegativeInteger} M - number of rows
* @param {NonNegativeInteger} N - number of columns
* @returns {Complex128Array} matrix
*/
function makeMatrix( M, N ) {
	const A = new Complex128Array( M * N );
	const v = reinterpret( A, 0 );
	let i;
	for ( i = 0; i < M * N; i++ ) {
		v[ 2 * i ] = ( ( i * 7 ) % 11 ) - 5;
		v[ ( 2 * i ) + 1 ] = ( ( i * 3 ) % 5 ) - 2;
	}
	for ( i = 0; i < Math.min( M, N ); i++ ) {
		v[ 2 * ( i + ( i * M ) ) ] += 10.0;
	}
	return A;
}

/**
* Returns a deterministic complex column-major right-hand side matrix (`ldb`-by-`nrhs`, first `M` rows set).
*
* @private
* @param {NonNegativeInteger} M - rows set
* @param {NonNegativeInteger} ldb - leading dimension
* @param {NonNegativeInteger} nrhs - number of columns
* @returns {Complex128Array} matrix
*/
function makeRHS( M, ldb, nrhs ) {
	const B = new Complex128Array( ldb * nrhs );
	const v = reinterpret( B, 0 );
	let i;
	let k;
	for ( k = 0; k < nrhs; k++ ) {
		for ( i = 0; i < M; i++ ) {
			v[ 2 * ( i + ( k * ldb ) ) ] = ( ( ( i + k ) % 4 ) + 1 );
			v[ ( 2 * ( i + ( k * ldb ) ) ) + 1 ] = ( ( i * k ) % 3 ) - 1;
		}
	}
	return B;
}

/**
* Asserts that `X` satisfies the least-squares normal equations `A^H*(A*X - B) = 0` (column-major `A`, M-by-N; `B`, `X` with leading dimension `ldb`).
*
* @private
* @param {Complex128Array} A - original matrix
* @param {NonNegativeInteger} M - rows
* @param {NonNegativeInteger} N - columns
* @param {Complex128Array} B - original right-hand sides
* @param {Complex128Array} X - solutions
* @param {NonNegativeInteger} nrhs - number of right-hand sides
* @param {PositiveInteger} ldb - leading dimension of `B` and `X`
* @param {string} msg - assertion message
*/
function assertNormalEquations( A, M, N, B, X, nrhs, ldb, msg ) {
	const av = reinterpret( A, 0 );
	const bv = reinterpret( B, 0 );
	const xv = reinterpret( X, 0 );
	const rr = new Float64Array( M );
	const ri = new Float64Array( M );
	let scale;
	let ar;
	let ai;
	let gr;
	let gi;
	let xr;
	let xi;
	let i;
	let j;
	let k;
	for ( k = 0; k < nrhs; k++ ) {
		scale = 1.0;
		for ( i = 0; i < M; i++ ) {
			rr[ i ] = -bv[ 2 * ( i + ( k * ldb ) ) ];
			ri[ i ] = -bv[ ( 2 * ( i + ( k * ldb ) ) ) + 1 ];
			for ( j = 0; j < N; j++ ) {
				ar = av[ 2 * ( i + ( j * M ) ) ];
				ai = av[ ( 2 * ( i + ( j * M ) ) ) + 1 ];
				xr = xv[ 2 * ( j + ( k * ldb ) ) ];
				xi = xv[ ( 2 * ( j + ( k * ldb ) ) ) + 1 ];
				rr[ i ] += ( ar * xr ) - ( ai * xi );
				ri[ i ] += ( ar * xi ) + ( ai * xr );
				scale = Math.max( scale, Math.abs( ar * xr ) + Math.abs( ai * xi ) + Math.abs( ar * xi ) + Math.abs( ai * xr ) );
			}
		}
		for ( j = 0; j < N; j++ ) {
			gr = 0.0;
			gi = 0.0;
			for ( i = 0; i < M; i++ ) {
				ar = av[ 2 * ( i + ( j * M ) ) ];
				ai = av[ ( 2 * ( i + ( j * M ) ) ) + 1 ];
				gr += ( ar * rr[ i ] ) + ( ai * ri[ i ] );
				gi += ( ar * ri[ i ] ) - ( ai * rr[ i ] );
			}
			assert.ok( Math.hypot( gr, gi ) <= 1e-12 * scale * M * N * 10, msg + ': A^H*r[' + j + ',' + k + '] = ' + gr + ',' + gi );
		}
	}
}

/**
* Converts a column-major complex matrix (leading dimension `ld`) to row-major (leading dimension `cols`).
*
* @private
* @param {Complex128Array} X - column-major matrix
* @param {NonNegativeInteger} rows - number of rows
* @param {NonNegativeInteger} cols - number of columns
* @param {PositiveInteger} ld - leading dimension of `X`
* @returns {Complex128Array} row-major matrix
*/
function toRowMajor( X, rows, cols, ld ) {
	const out = new Complex128Array( rows * cols );
	const xv = reinterpret( X, 0 );
	const ov = reinterpret( out, 0 );
	let i;
	let j;
	for ( j = 0; j < cols; j++ ) {
		for ( i = 0; i < rows; i++ ) {
			ov[ 2 * ( ( i * cols ) + j ) ] = xv[ 2 * ( ( j * ld ) + i ) ];
			ov[ ( 2 * ( ( i * cols ) + j ) ) + 1 ] = xv[ ( 2 * ( ( j * ld ) + i ) ) + 1 ];
		}
	}
	return out;
}

/**
* Solves the same problem column-major and row-major with `WORK` of exactly `computeWorkSize` elements and asserts both agree and solve the normal equations.
*
* @private
* @param {NonNegativeInteger} M - rows
* @param {NonNegativeInteger} N - columns
* @param {NonNegativeInteger} nrhs - number of right-hand sides
*/
function checkLayouts( M, N, nrhs ) {
	const ldb = Math.max( M, N );
	const A0 = makeMatrix( M, N );
	const B0 = makeRHS( M, ldb, nrhs );
	const Ac = new Complex128Array( A0 );
	const Bc = new Complex128Array( B0 );
	const Ar = toRowMajor( A0, M, N, M );
	const Br = toRowMajor( B0, ldb, nrhs, ldb );
	const Sc = new Float64Array( Math.min( M, N ) );
	const Sr = new Float64Array( Math.min( M, N ) );
	const rc = [ 0 ];
	const rr = [ 0 ];
	let info = zgelss( M, N, nrhs, Ac, 1, M, 0, Bc, 1, ldb, 0, Sc, 1, 0, -1.0, rc, mkW( M, N, nrhs ), 1, 0, mkR( M, N ), 1, 0 );
	assert.strictEqual( info, 0, 'column-major info' );
	assertNormalEquations( A0, M, N, B0, Bc, nrhs, ldb, 'column-major' );
	info = zgelss( M, N, nrhs, Ar, N, 1, 0, Br, nrhs, 1, 0, Sr, 1, 0, -1.0, rr, mkW( M, N, nrhs ), 1, 0, mkR( M, N ), 1, 0 );
	assert.strictEqual( info, 0, 'row-major info' );
	assert.strictEqual( rr[ 0 ], rc[ 0 ], 'rank' );
	assertArrayClose( toArray( Sr ), toArray( Sc ), 1e-13, 'S' );
	assertArrayClose( toArray( reinterpret( Br, 0 ) ).slice( 0, 2 * N * nrhs ), toArray( reinterpret( toRowMajor( Bc, N, nrhs, ldb ), 0 ) ), 1e-12, 'X' );
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

test( 'zgelss: main export is a function', function t() {
	assert.strictEqual( typeof zgelss, 'function' );
});

test( 'zgelss: overdetermined full rank (4x2), single RHS', function t() {

	const tc = overdetermined_full_rank;
	const A = new Complex128Array([
		1,
		1,
		3,
		0,
		5,
		2,
		7,
		0,
		2,
		0,
		4,
		-1,
		6,
		0,
		8,
		1
	]);
	const B = new Complex128Array([
		1, 1, 2, 0, 3, -1, 4, 0
	]);
	const S = new Float64Array( 2 );
	const rank = [ 0 ];
	const info = zgelss( 4, 2, 1, A, 1, 4, 0, B, 1, 4, 0, S, 1, 0, -1.0, rank, mkW( 4, 2, 1 ), 1, 0, mkR( 4, 2 ), 1, 0 ); // eslint-disable-line max-len
	assert.strictEqual( info, tc.info );
	assert.strictEqual( rank[ 0 ], tc.rank );
	assertArrayClose( toArray( S ), tc.s, 1e-10, 's' );
	assertArrayClose( toArray( reinterpret( B, 0 ) ).slice( 0, 4 ), tc.x, 1e-10, 'x' ); // eslint-disable-line max-len
});

test( 'zgelss: overdetermined rank-deficient (4x2)', function t() {

	const tc = overdetermined_rank_deficient;
	const A = new Complex128Array([
		1,
		0,
		2,
		1,
		3,
		0,
		4,
		-1,
		2,
		0,
		4,
		2,
		6,
		0,
		8,
		-2
	]);
	const B = new Complex128Array([
		1, 0, 2, 1, 3, 0, 4, -1
	]);
	const S = new Float64Array( 2 );
	const rank = [ 0 ];
	const info = zgelss( 4, 2, 1, A, 1, 4, 0, B, 1, 4, 0, S, 1, 0, 0.01, rank, mkW( 4, 2, 1 ), 1, 0, mkR( 4, 2 ), 1, 0 ); // eslint-disable-line max-len
	assert.strictEqual( info, tc.info );
	assert.strictEqual( rank[ 0 ], tc.rank );
	assertArrayClose( toArray( S ), tc.s, 1e-10, 's' );
	assertArrayClose( toArray( reinterpret( B, 0 ) ).slice( 0, 4 ), tc.x, 1e-10, 'x' ); // eslint-disable-line max-len
});

test( 'zgelss: underdetermined (2x4), single RHS', function t() {

	const tc = underdetermined;
	const A = new Complex128Array([
		1,
		0,
		0,
		0,
		0,
		0,
		1,
		1,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0
	]);
	const B = new Complex128Array( 4 );
	const Bv = reinterpret( B, 0 );
	Bv[ 0 ] = 1.0;
	Bv[ 1 ] = 1.0;
	Bv[ 2 ] = 2.0;
	Bv[ 3 ] = 0.0;
	const S = new Float64Array( 2 );
	const rank = [ 0 ];
	const info = zgelss( 2, 4, 1, A, 1, 2, 0, B, 1, 4, 0, S, 1, 0, -1.0, rank, mkW( 2, 4, 1 ), 1, 0, mkR( 2, 4 ), 1, 0 ); // eslint-disable-line max-len
	assert.strictEqual( info, tc.info );
	assert.strictEqual( rank[ 0 ], tc.rank );
	assertArrayClose( toArray( S ), tc.s, 1e-10, 's' );
	assertArrayClose( toArray( reinterpret( B, 0 ) ).slice( 0, 8 ), tc.x, 1e-10, 'x' ); // eslint-disable-line max-len
});

test( 'zgelss: square 3x3, single RHS', function t() {

	const tc = square_3x3;
	const A = new Complex128Array([
		4,
		0,
		1,
		1,
		0,
		0,
		1,
		-1,
		5,
		0,
		2,
		1,
		0,
		0,
		2,
		-1,
		6,
		0
	]);
	const B = new Complex128Array([
		1, 1, 2, 0, 3, -1
	]);
	const S = new Float64Array( 3 );
	const rank = [ 0 ];
	const info = zgelss( 3, 3, 1, A, 1, 3, 0, B, 1, 3, 0, S, 1, 0, -1.0, rank, mkW( 3, 3, 1 ), 1, 0, mkR( 3, 3 ), 1, 0 ); // eslint-disable-line max-len
	assert.strictEqual( info, tc.info );
	assert.strictEqual( rank[ 0 ], tc.rank );
	assertArrayClose( toArray( S ), tc.s, 1e-10, 's' );
	assertArrayClose( toArray( reinterpret( B, 0 ) ).slice( 0, 6 ), tc.x, 1e-10, 'x' ); // eslint-disable-line max-len
});

test( 'zgelss: multiple RHS (3x3, 2 RHS)', function t() {

	const tc = multiple_rhs;
	const A = new Complex128Array([
		4,
		0,
		1,
		0,
		0,
		0,
		1,
		0,
		5,
		0,
		2,
		0,
		0,
		0,
		2,
		0,
		6,
		0
	]);
	const B = new Complex128Array([
		1,
		1,
		2,
		0,
		3,
		0,
		2,
		0,
		3,
		-1,
		4,
		1
	]);
	const S = new Float64Array( 3 );
	const rank = [ 0 ];
	const info = zgelss( 3, 3, 2, A, 1, 3, 0, B, 1, 3, 0, S, 1, 0, -1.0, rank, mkW( 3, 3, 2 ), 1, 0, mkR( 3, 3 ), 1, 0 ); // eslint-disable-line max-len
	assert.strictEqual( info, tc.info );
	assert.strictEqual( rank[ 0 ], tc.rank );
	assertArrayClose( toArray( S ), tc.s, 1e-10, 's' );
	assertArrayClose( toArray( reinterpret( B, 0 ) ).slice( 0, 12 ), tc.x, 1e-10, 'x' ); // eslint-disable-line max-len
});

test( 'zgelss: M=0 edge case', function t() {

	const tc = m_zero;
	const A = new Complex128Array( 1 );
	const B = new Complex128Array( 3 );
	const S = new Float64Array( 1 );
	const rank = [ 0 ];
	const info = zgelss( 0, 3, 1, A, 1, 1, 0, B, 1, 3, 0, S, 1, 0, -1.0, rank, mkW( 0, 3, 1 ), 1, 0, mkR( 0, 3 ), 1, 0 ); // eslint-disable-line max-len
	assert.strictEqual( info, tc.info );
	assert.strictEqual( rank[ 0 ], tc.rank );
});

test( 'zgelss: N=0 edge case', function t() {

	const tc = n_zero;
	const A = new Complex128Array( 3 );
	const B = new Complex128Array( 3 );
	const S = new Float64Array( 1 );
	const rank = [ 0 ];
	const info = zgelss( 3, 0, 1, A, 1, 3, 0, B, 1, 3, 0, S, 1, 0, -1.0, rank, mkW( 3, 0, 1 ), 1, 0, mkR( 3, 0 ), 1, 0 ); // eslint-disable-line max-len
	assert.strictEqual( info, tc.info );
	assert.strictEqual( rank[ 0 ], tc.rank );
});

test( 'zgelss: overdetermined tall 6x2 (QR path)', function t() {

	const tc = overdetermined_tall;
	const A = new Complex128Array([
		1,
		0,
		0,
		1,
		1,
		1,
		2,
		0,
		1,
		-1,
		0,
		0,
		0,
		0,
		1,
		0,
		1,
		-1,
		1,
		1,
		2,
		0,
		0,
		0
	]);
	const B = new Complex128Array([
		1, 0, 1, 1, 2, 0, 3, -1, 3, 0, 0, 0
	]);
	const S = new Float64Array( 2 );
	const rank = [ 0 ];
	const info = zgelss( 6, 2, 1, A, 1, 6, 0, B, 1, 6, 0, S, 1, 0, -1.0, rank, mkW( 6, 2, 1 ), 1, 0, mkR( 6, 2 ), 1, 0 ); // eslint-disable-line max-len
	assert.strictEqual( info, tc.info );
	assert.strictEqual( rank[ 0 ], tc.rank );
	assertArrayClose( toArray( S ), tc.s, 1e-10, 's' );
	assertArrayClose( toArray( reinterpret( B, 0 ) ).slice( 0, 4 ), tc.x, 1e-10, 'x' ); // eslint-disable-line max-len
});

test( 'zgelss: all-zero matrix', function t() {

	const A = new Complex128Array( 4 );
	const B = new Complex128Array( [ 1, 0, 2, 0 ] );
	const S = new Float64Array( 2 );
	const rank = [ 0 ];
	const info = zgelss( 2, 2, 1, A, 1, 2, 0, B, 1, 2, 0, S, 1, 0, -1.0, rank, mkW( 2, 2, 1 ), 1, 0, mkR( 2, 2 ), 1, 0 ); // eslint-disable-line max-len
	assert.strictEqual( info, 0 );
	assert.strictEqual( rank[ 0 ], 0 );
	assert.strictEqual( S[ 0 ], 0.0 );
	assert.strictEqual( S[ 1 ], 0.0 );
	const Bv = reinterpret( B, 0 );
	assert.strictEqual( Bv[ 0 ], 0.0 );
	assert.strictEqual( Bv[ 1 ], 0.0 );
	assert.strictEqual( Bv[ 2 ], 0.0 );
	assert.strictEqual( Bv[ 3 ], 0.0 );
});

test( 'zgelss: underdetermined 3x4 (N >= MNTHR = 4: LQ path 2a), single RHS', function t() {

	const A = new Complex128Array([
		2,
		0,
		1,
		1,
		0,
		0,
		1,
		-1,
		3,
		0,
		1,
		0,
		0,
		0,
		1,
		1,
		4,
		0,
		0,
		0,
		0,
		0,
		1,
		-1
	]);
	const B = new Complex128Array( 4 );
	const Bv = reinterpret( B, 0 );
	Bv[ 0 ] = 1.0;
	Bv[ 1 ] = 0.0;
	Bv[ 2 ] = 2.0;
	Bv[ 3 ] = 1.0;
	Bv[ 4 ] = 3.0;
	Bv[ 5 ] = -1.0;
	const S = new Float64Array( 3 );
	const rank = [ 0 ];
	const info = zgelss( 3, 4, 1, A, 1, 3, 0, B, 1, 4, 0, S, 1, 0, -1.0, rank, mkW( 3, 4, 1 ), 1, 0, mkR( 3, 4 ), 1, 0 ); // eslint-disable-line max-len
	assert.strictEqual( info, 0 );
	assert.ok( rank[ 0 ] > 0, 'rank should be positive' );
	assert.ok( S[ 0 ] >= S[ 1 ], 'singular values should be decreasing' );
	assert.ok( S[ 1 ] >= S[ 2 ], 'singular values should be decreasing' );
});

test( 'zgelss: overdetermined nrhs>1 chunk path (M >= N)', function t() {

	const A = new Complex128Array([
		4,
		0,
		1,
		0,
		0,
		0,
		1,
		0,
		5,
		0,
		2,
		0,
		0,
		0,
		2,
		0,
		6,
		0
	]);
	const B = new Complex128Array([
		1,
		0,
		2,
		0,
		3,
		0,
		4,
		0,
		5,
		0,
		6,
		0
	]);
	const S = new Float64Array( 3 );
	const rank = [ 0 ];
	const WORK = new Complex128Array( computeWorkSize( 3, 3, 2 ) );
	const RWORK = new Float64Array( 20 );
	const info = zgelss( 3, 3, 2, A, 1, 3, 0, B, 1, 3, 0, S, 1, 0, -1.0, rank, WORK, 1, 0, RWORK, 1, 0 ); // eslint-disable-line max-len
	assert.strictEqual( info, 0 );
	assert.strictEqual( rank[ 0 ], 3 );
});

test( 'zgelss: underdetermined 3x4 (LQ path 2a) with nrhs>1', function t() {

	const A = new Complex128Array([
		2,
		0,
		1,
		0,
		0,
		0,
		1,
		0,
		3,
		0,
		1,
		0,
		0,
		0,
		1,
		0,
		4,
		0,
		0,
		0,
		0,
		0,
		1,
		0
	]);
	const B = new Complex128Array([
		1,
		0,
		2,
		0,
		3,
		0,
		0,
		0,
		4,
		0,
		5,
		0,
		6,
		0,
		0,
		0
	]);
	const S = new Float64Array( 3 );
	const rank = [ 0 ];
	const info = zgelss( 3, 4, 2, A, 1, 3, 0, B, 1, 4, 0, S, 1, 0, -1.0, rank, mkW( 3, 4, 2 ), 1, 0, mkR( 3, 4 ), 1, 0 ); // eslint-disable-line max-len
	assert.strictEqual( info, 0 );
	assert.ok( rank[ 0 ] > 0 );
});

test( 'zgelss: path 2a nrhs>1 (LQ path, multiple RHS)', function t() {

	const A = new Complex128Array([
		1,
		0,
		0,
		0,
		0,
		0,
		1,
		0,
		1,
		0,
		0,
		0,
		0,
		0,
		1,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0
	]);
	const B = new Complex128Array([
		1,
		0,
		2,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		3,
		0,
		4,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0
	]);
	const S = new Float64Array( 2 );
	const rank = [ 0 ];
	const info = zgelss( 2, 6, 2, A, 1, 2, 0, B, 1, 6, 0, S, 1, 0, -1.0, rank, mkW( 2, 6, 2 ), 1, 0, mkR( 2, 6 ), 1, 0 ); // eslint-disable-line max-len
	assert.strictEqual( info, 0 );
	assert.ok( rank[ 0 ] > 0 );
});

test( 'zgelss: tiny A norm (scale up path)', function t() {

	const scale = 1e-300;
	const A = new Complex128Array([
		4 * scale,
		0,
		1 * scale,
		0,
		1 * scale,
		0,
		3 * scale,
		0
	]);
	const B = new Complex128Array([
		1 * scale, 0, 2 * scale, 0
	]);
	const S = new Float64Array( 2 );
	const rank = [ 0 ];
	const info = zgelss( 2, 2, 1, A, 1, 2, 0, B, 1, 2, 0, S, 1, 0, -1.0, rank, mkW( 2, 2, 1 ), 1, 0, mkR( 2, 2 ), 1, 0 ); // eslint-disable-line max-len
	assert.strictEqual( info, 0 );
	assert.strictEqual( rank[ 0 ], 2 );
});

test( 'zgelss: large A norm (scale down path)', function t() {

	const scale = 1e295;
	const A = new Complex128Array([
		4 * scale,
		0,
		1 * scale,
		0,
		1 * scale,
		0,
		3 * scale,
		0
	]);
	const B = new Complex128Array([
		1 * scale, 0, 2 * scale, 0
	]);
	const S = new Float64Array( 2 );
	const rank = [ 0 ];
	const info = zgelss( 2, 2, 1, A, 1, 2, 0, B, 1, 2, 0, S, 1, 0, -1.0, rank, mkW( 2, 2, 1 ), 1, 0, mkR( 2, 2 ), 1, 0 ); // eslint-disable-line max-len
	assert.strictEqual( info, 0 );
	assert.strictEqual( rank[ 0 ], 2 );
});

test( 'zgelss: underdetermined wide 2x6 (LQ path)', function t() {

	const tc = underdetermined_wide;
	const A = new Complex128Array([
		1,
		0,
		0,
		0,
		0,
		0,
		1,
		-1,
		1,
		1,
		0,
		0,
		0,
		0,
		1,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0
	]);
	const B = new Complex128Array( 6 );
	const Bv = reinterpret( B, 0 );
	Bv[ 0 ] = 2.0;
	Bv[ 1 ] = 1.0;
	Bv[ 2 ] = 4.0;
	Bv[ 3 ] = -1.0;
	const S = new Float64Array( 2 );
	const rank = [ 0 ];
	const info = zgelss( 2, 6, 1, A, 1, 2, 0, B, 1, 6, 0, S, 1, 0, -1.0, rank, mkW( 2, 6, 1 ), 1, 0, mkR( 2, 6 ), 1, 0 ); // eslint-disable-line max-len
	assert.strictEqual( info, tc.info );
	assert.strictEqual( rank[ 0 ], tc.rank );
	assertArrayClose( toArray( S ), tc.s, 1e-10, 's' );
	assertArrayClose( toArray( reinterpret( B, 0 ) ).slice( 0, 12 ), tc.x, 1e-10, 'x' ); // eslint-disable-line max-len
});

test( 'zgelss: row-major and column-major agree with WORK of exactly computeWorkSize (path 1, path 2b; nrhs > 1 full and chunked GEMM)', function t() {
	// The full-GEMM gate is LWORK >= LDB*NRHS (zgelss.f), LDB being max(M,N), the row extent of B; it used `strideB2*nrhs`, which is 1*nrhs in row-major.
	checkLayouts( 5, 4, 3 ); // path 1 (M < MNTHR = 6), full GEMM
	checkLayouts( 5, 4, 40 ); // path 1, chunked GEMM: max(M,N)*nrhs = 200 > computeWorkSize = 168
	checkLayouts( 4, 5, 3 ); // path 2b (N < MNTHR = 6), full GEMM
	checkLayouts( 4, 5, 40 ); // path 2b, chunked GEMM
	checkLayouts( 4, 5, 1 ); // path 2b, single RHS (ZGEMV)
	checkLayouts( 5, 4, 1 ); // path 1, single RHS
});

test( 'zgelss: M=4, N=3 takes the QR path (MNTHR = INT(1.6*MIN(M,N)) = 4)', function t() {
	// MNTHR was rounded (5) instead of truncated (4), skipping the QR preconditioning. On the QR path row 3 of A keeps the ZGEQRF reflectors.
	const M = 4;
	const N = 3;
	const A0 = makeMatrix( M, N );
	const B0 = makeRHS( M, M, 1 );
	const A = new Complex128Array( A0 );
	const B = new Complex128Array( B0 );
	const S = new Float64Array( N );
	const rank = [ 0 ];
	const info = zgelss( M, N, 1, A, 1, M, 0, B, 1, M, 0, S, 1, 0, -1.0, rank, mkW( M, N, 1 ), 1, 0, mkR( M, N ), 1, 0 );
	assert.strictEqual( info, 0, 'info' );
	assert.strictEqual( rank[ 0 ], N, 'rank' );
	assertNormalEquations( A0, M, N, B0, B, 1, M, 'x' );

	const QR = new Complex128Array( A0 );
	zgeqrf( M, N, QR, 1, M, 0, new Complex128Array( N ), 1, 0, new Complex128Array( 1000 ), 1, 0 );
	const av = reinterpret( A, 0 );
	const qv = reinterpret( QR, 0 );
	let j;
	for ( j = 0; j < N; j++ ) {
		assert.strictEqual( av[ 2 * ( 3 + ( j * M ) ) ], qv[ 2 * ( 3 + ( j * M ) ) ], 'Re A[3,' + j + ']' );
		assert.strictEqual( av[ ( 2 * ( 3 + ( j * M ) ) ) + 1 ], qv[ ( 2 * ( 3 + ( j * M ) ) ) + 1 ], 'Im A[3,' + j + ']' );
	}
});

test( 'zgelss: M=3, N=4 takes the LQ path 2a (MNTHR = 4)', function t() {
	// With MNTHR rounded to 5 the LQ path (2a) was skipped. On path 2a A holds the ZGELQF factorization on exit.
	const M = 3;
	const N = 4;
	const A0 = makeMatrix( M, N );
	const B0 = makeRHS( M, N, 1 );
	const A = new Complex128Array( A0 );
	const B = new Complex128Array( B0 );
	const S = new Float64Array( M );
	const rank = [ 0 ];
	const info = zgelss( M, N, 1, A, 1, M, 0, B, 1, N, 0, S, 1, 0, -1.0, rank, mkW( M, N, 1 ), 1, 0, mkR( M, N ), 1, 0 );
	assert.strictEqual( info, 0, 'info' );
	assert.strictEqual( rank[ 0 ], M, 'rank' );
	assertNormalEquations( A0, M, N, B0, B, 1, N, 'x' );

	const LQ = new Complex128Array( A0 );
	zgelqf( M, N, LQ, 1, M, 0, new Complex128Array( M ), 1, 0, new Complex128Array( 1000 ), 1, 0 );
	assert.deepStrictEqual( toArray( reinterpret( A, 0 ) ), toArray( reinterpret( LQ, 0 ) ), 'A' );
});

test( 'zgelss: the path follows the caller\'s WORK length (LWORK), not a fixed size', function t() {
	// M=1, N=2, nrhs=100: path 2a needs LWORK >= 3*M+M*M+MAX(M,NRHS,N-2*M) = 104 (zgelss.f), above computeWorkSize = 102. The workspace size used to be fixed at computeWorkSize, so a larger caller WORK never reached path 2a.
	const M = 1;
	const N = 2;
	const nrhs = 100;
	const A0 = makeMatrix( M, N );
	const B0 = makeRHS( M, N, nrhs );
	const LQ = new Complex128Array( A0 );
	const sizes = [ computeWorkSize( M, N, nrhs ), 150, 1000 ]; // path 2b; path 2a chunked GEMM; path 2a full GEMM
	const X = [];
	let info;
	let A;
	let B;
	let i;
	zgelqf( M, N, LQ, 1, M, 0, new Complex128Array( M ), 1, 0, new Complex128Array( 1000 ), 1, 0 );
	assert.strictEqual( sizes[ 0 ], 102, 'computeWorkSize' );
	for ( i = 0; i < sizes.length; i++ ) {
		A = new Complex128Array( A0 );
		B = new Complex128Array( B0 );
		info = zgelss( M, N, nrhs, A, 1, M, 0, B, 1, N, 0, new Float64Array( 1 ), 1, 0, -1.0, [ 0 ], new Complex128Array( sizes[ i ] ), 1, 0, mkR( M, N ), 1, 0 );
		assert.strictEqual( info, 0, 'info' );
		assertNormalEquations( A0, M, N, B0, B, nrhs, N, 'lwork=' + sizes[ i ] );
		if ( i === 0 ) {
			assert.notDeepStrictEqual( toArray( reinterpret( A, 0 ) ), toArray( reinterpret( LQ, 0 ) ), 'path 2b leaves A bidiagonalized' );
		} else {
			assert.deepStrictEqual( toArray( reinterpret( A, 0 ) ), toArray( reinterpret( LQ, 0 ) ), 'path 2a leaves the LQ factorization in A' );
		}
		X.push( toArray( reinterpret( B, 0 ) ) );
	}
	assertArrayClose( X[ 1 ], X[ 0 ], 1e-12, 'X (2a chunked vs 2b)' );
	assertArrayClose( X[ 2 ], X[ 0 ], 1e-12, 'X (2a full vs 2b)' );
});

test( 'zgelss: throws RangeError when RWORK is missing or too small', function t() {
	assert.throws( function badRWork() {
		zgelss( 2, 2, 1, new Complex128Array( 4 ), 1, 2, 0, new Complex128Array( 2 ), 1, 2, 0, new Float64Array( 2 ), 1, 0, -1.0, [ 0 ], mkW( 2, 2, 1 ), 1, 0, new Float64Array( 9 ), 1, 0 );
	}, RangeError );
	assert.throws( function nullRWork() {
		zgelss( 2, 2, 1, new Complex128Array( 4 ), 1, 2, 0, new Complex128Array( 2 ), 1, 2, 0, new Float64Array( 2 ), 1, 0, -1.0, [ 0 ], mkW( 2, 2, 1 ), 1, 0, null, 1, 0 );
	}, RangeError );
});
