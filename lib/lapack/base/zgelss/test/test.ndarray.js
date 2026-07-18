/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import zgelss from './../lib/ndarray.js';
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

test( 'zgelss: underdetermined N>M path 2b (small workspace, direct bidiag)', function t() { // eslint-disable-line max-len

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

test( 'zgelss: underdetermined path 2b with nrhs>1', function t() {

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
