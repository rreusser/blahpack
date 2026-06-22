/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import zgelss from './../lib/ndarray.js';

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
	var i;
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
	var out = [];
	var i;
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
	var rank;
	var info;
	var tc;
	var A;
	var B;
	var S;

	tc = overdetermined_full_rank;
	A = new Complex128Array([
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
	B = new Complex128Array([
		1, 1, 2, 0, 3, -1, 4, 0
	]);
	S = new Float64Array( 2 );
	rank = [ 0 ];
	info = zgelss( 4, 2, 1, A, 1, 4, 0, B, 1, 4, 0, S, 1, 0, -1.0, rank, null, 1, 0, 0, null, 1, 0 ); // eslint-disable-line max-len
	assert.strictEqual( info, tc.info );
	assert.strictEqual( rank[ 0 ], tc.rank );
	assertArrayClose( toArray( S ), tc.s, 1e-10, 's' );
	assertArrayClose( toArray( reinterpret( B, 0 ) ).slice( 0, 4 ), tc.x, 1e-10, 'x' ); // eslint-disable-line max-len
});

test( 'zgelss: overdetermined rank-deficient (4x2)', function t() {
	var rank;
	var info;
	var tc;
	var A;
	var B;
	var S;

	tc = overdetermined_rank_deficient;
	A = new Complex128Array([
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
	B = new Complex128Array([
		1, 0, 2, 1, 3, 0, 4, -1
	]);
	S = new Float64Array( 2 );
	rank = [ 0 ];
	info = zgelss( 4, 2, 1, A, 1, 4, 0, B, 1, 4, 0, S, 1, 0, 0.01, rank, null, 1, 0, 0, null, 1, 0 ); // eslint-disable-line max-len
	assert.strictEqual( info, tc.info );
	assert.strictEqual( rank[ 0 ], tc.rank );
	assertArrayClose( toArray( S ), tc.s, 1e-10, 's' );
	assertArrayClose( toArray( reinterpret( B, 0 ) ).slice( 0, 4 ), tc.x, 1e-10, 'x' ); // eslint-disable-line max-len
});

test( 'zgelss: underdetermined (2x4), single RHS', function t() {
	var rank;
	var info;
	var tc;
	var Bv;
	var A;
	var B;
	var S;

	tc = underdetermined;
	A = new Complex128Array([
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
	B = new Complex128Array( 4 );
	Bv = reinterpret( B, 0 );
	Bv[ 0 ] = 1.0;
	Bv[ 1 ] = 1.0;
	Bv[ 2 ] = 2.0;
	Bv[ 3 ] = 0.0;
	S = new Float64Array( 2 );
	rank = [ 0 ];
	info = zgelss( 2, 4, 1, A, 1, 2, 0, B, 1, 4, 0, S, 1, 0, -1.0, rank, null, 1, 0, 0, null, 1, 0 ); // eslint-disable-line max-len
	assert.strictEqual( info, tc.info );
	assert.strictEqual( rank[ 0 ], tc.rank );
	assertArrayClose( toArray( S ), tc.s, 1e-10, 's' );
	assertArrayClose( toArray( reinterpret( B, 0 ) ).slice( 0, 8 ), tc.x, 1e-10, 'x' ); // eslint-disable-line max-len
});

test( 'zgelss: square 3x3, single RHS', function t() {
	var rank;
	var info;
	var tc;
	var A;
	var B;
	var S;

	tc = square_3x3;
	A = new Complex128Array([
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
	B = new Complex128Array([
		1, 1, 2, 0, 3, -1
	]);
	S = new Float64Array( 3 );
	rank = [ 0 ];
	info = zgelss( 3, 3, 1, A, 1, 3, 0, B, 1, 3, 0, S, 1, 0, -1.0, rank, null, 1, 0, 0, null, 1, 0 ); // eslint-disable-line max-len
	assert.strictEqual( info, tc.info );
	assert.strictEqual( rank[ 0 ], tc.rank );
	assertArrayClose( toArray( S ), tc.s, 1e-10, 's' );
	assertArrayClose( toArray( reinterpret( B, 0 ) ).slice( 0, 6 ), tc.x, 1e-10, 'x' ); // eslint-disable-line max-len
});

test( 'zgelss: multiple RHS (3x3, 2 RHS)', function t() {
	var rank;
	var info;
	var tc;
	var A;
	var B;
	var S;

	tc = multiple_rhs;
	A = new Complex128Array([
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
	B = new Complex128Array([
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
	S = new Float64Array( 3 );
	rank = [ 0 ];
	info = zgelss( 3, 3, 2, A, 1, 3, 0, B, 1, 3, 0, S, 1, 0, -1.0, rank, null, 1, 0, 0, null, 1, 0 ); // eslint-disable-line max-len
	assert.strictEqual( info, tc.info );
	assert.strictEqual( rank[ 0 ], tc.rank );
	assertArrayClose( toArray( S ), tc.s, 1e-10, 's' );
	assertArrayClose( toArray( reinterpret( B, 0 ) ).slice( 0, 12 ), tc.x, 1e-10, 'x' ); // eslint-disable-line max-len
});

test( 'zgelss: M=0 edge case', function t() {
	var rank;
	var info;
	var tc;
	var A;
	var B;
	var S;

	tc = m_zero;
	A = new Complex128Array( 1 );
	B = new Complex128Array( 3 );
	S = new Float64Array( 1 );
	rank = [ 0 ];
	info = zgelss( 0, 3, 1, A, 1, 1, 0, B, 1, 3, 0, S, 1, 0, -1.0, rank, null, 1, 0, 0, null, 1, 0 ); // eslint-disable-line max-len
	assert.strictEqual( info, tc.info );
	assert.strictEqual( rank[ 0 ], tc.rank );
});

test( 'zgelss: N=0 edge case', function t() {
	var rank;
	var info;
	var tc;
	var A;
	var B;
	var S;

	tc = n_zero;
	A = new Complex128Array( 3 );
	B = new Complex128Array( 3 );
	S = new Float64Array( 1 );
	rank = [ 0 ];
	info = zgelss( 3, 0, 1, A, 1, 3, 0, B, 1, 3, 0, S, 1, 0, -1.0, rank, null, 1, 0, 0, null, 1, 0 ); // eslint-disable-line max-len
	assert.strictEqual( info, tc.info );
	assert.strictEqual( rank[ 0 ], tc.rank );
});

test( 'zgelss: overdetermined tall 6x2 (QR path)', function t() {
	var rank;
	var info;
	var tc;
	var A;
	var B;
	var S;

	tc = overdetermined_tall;
	A = new Complex128Array([
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
	B = new Complex128Array([
		1, 0, 1, 1, 2, 0, 3, -1, 3, 0, 0, 0
	]);
	S = new Float64Array( 2 );
	rank = [ 0 ];
	info = zgelss( 6, 2, 1, A, 1, 6, 0, B, 1, 6, 0, S, 1, 0, -1.0, rank, null, 1, 0, 0, null, 1, 0 ); // eslint-disable-line max-len
	assert.strictEqual( info, tc.info );
	assert.strictEqual( rank[ 0 ], tc.rank );
	assertArrayClose( toArray( S ), tc.s, 1e-10, 's' );
	assertArrayClose( toArray( reinterpret( B, 0 ) ).slice( 0, 4 ), tc.x, 1e-10, 'x' ); // eslint-disable-line max-len
});

test( 'zgelss: all-zero matrix', function t() {
	var rank;
	var info;
	var Bv;
	var A;
	var B;
	var S;

	A = new Complex128Array( 4 );
	B = new Complex128Array( [ 1, 0, 2, 0 ] );
	S = new Float64Array( 2 );
	rank = [ 0 ];
	info = zgelss( 2, 2, 1, A, 1, 2, 0, B, 1, 2, 0, S, 1, 0, -1.0, rank, null, 1, 0, 0, null, 1, 0 ); // eslint-disable-line max-len
	assert.strictEqual( info, 0 );
	assert.strictEqual( rank[ 0 ], 0 );
	assert.strictEqual( S[ 0 ], 0.0 );
	assert.strictEqual( S[ 1 ], 0.0 );
	Bv = reinterpret( B, 0 );
	assert.strictEqual( Bv[ 0 ], 0.0 );
	assert.strictEqual( Bv[ 1 ], 0.0 );
	assert.strictEqual( Bv[ 2 ], 0.0 );
	assert.strictEqual( Bv[ 3 ], 0.0 );
});

test( 'zgelss: underdetermined N>M path 2b (small workspace, direct bidiag)', function t() { // eslint-disable-line max-len
	var rank;
	var info;
	var Bv;
	var A;
	var B;
	var S;

	A = new Complex128Array([
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
	B = new Complex128Array( 4 );
	Bv = reinterpret( B, 0 );
	Bv[ 0 ] = 1.0;
	Bv[ 1 ] = 0.0;
	Bv[ 2 ] = 2.0;
	Bv[ 3 ] = 1.0;
	Bv[ 4 ] = 3.0;
	Bv[ 5 ] = -1.0;
	S = new Float64Array( 3 );
	rank = [ 0 ];
	info = zgelss( 3, 4, 1, A, 1, 3, 0, B, 1, 4, 0, S, 1, 0, -1.0, rank, null, 1, 0, 0, null, 1, 0 ); // eslint-disable-line max-len
	assert.strictEqual( info, 0 );
	assert.ok( rank[ 0 ] > 0, 'rank should be positive' );
	assert.ok( S[ 0 ] >= S[ 1 ], 'singular values should be decreasing' );
	assert.ok( S[ 1 ] >= S[ 2 ], 'singular values should be decreasing' );
});

test( 'zgelss: overdetermined nrhs>1 chunk path (M >= N)', function t() {
	var RWORK;
	var rank;
	var WORK;
	var info;
	var A;
	var B;
	var S;

	A = new Complex128Array([
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
	B = new Complex128Array([
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
	S = new Float64Array( 3 );
	rank = [ 0 ];
	WORK = new Complex128Array( 10 );
	RWORK = new Float64Array( 20 );
	info = zgelss( 3, 3, 2, A, 1, 3, 0, B, 1, 3, 0, S, 1, 0, -1.0, rank, WORK, 1, 0, 10, RWORK, 1, 0 ); // eslint-disable-line max-len
	assert.strictEqual( info, 0 );
	assert.strictEqual( rank[ 0 ], 3 );
});

test( 'zgelss: underdetermined path 2b with nrhs>1', function t() {
	var rank;
	var info;
	var A;
	var B;
	var S;

	A = new Complex128Array([
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
	B = new Complex128Array([
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
	S = new Float64Array( 3 );
	rank = [ 0 ];
	info = zgelss( 3, 4, 2, A, 1, 3, 0, B, 1, 4, 0, S, 1, 0, -1.0, rank, null, 1, 0, 0, null, 1, 0 ); // eslint-disable-line max-len
	assert.strictEqual( info, 0 );
	assert.ok( rank[ 0 ] > 0 );
});

test( 'zgelss: path 2a nrhs>1 (LQ path, multiple RHS)', function t() {
	var rank;
	var info;
	var A;
	var B;
	var S;

	A = new Complex128Array([
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
	B = new Complex128Array([
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
	S = new Float64Array( 2 );
	rank = [ 0 ];
	info = zgelss( 2, 6, 2, A, 1, 2, 0, B, 1, 6, 0, S, 1, 0, -1.0, rank, null, 1, 0, 0, null, 1, 0 ); // eslint-disable-line max-len
	assert.strictEqual( info, 0 );
	assert.ok( rank[ 0 ] > 0 );
});

test( 'zgelss: tiny A norm (scale up path)', function t() {
	var scale;
	var rank;
	var info;
	var A;
	var B;
	var S;

	scale = 1e-300;
	A = new Complex128Array([
		4 * scale,
		0,
		1 * scale,
		0,
		1 * scale,
		0,
		3 * scale,
		0
	]);
	B = new Complex128Array([
		1 * scale, 0, 2 * scale, 0
	]);
	S = new Float64Array( 2 );
	rank = [ 0 ];
	info = zgelss( 2, 2, 1, A, 1, 2, 0, B, 1, 2, 0, S, 1, 0, -1.0, rank, null, 1, 0, 0, null, 1, 0 ); // eslint-disable-line max-len
	assert.strictEqual( info, 0 );
	assert.strictEqual( rank[ 0 ], 2 );
});

test( 'zgelss: large A norm (scale down path)', function t() {
	var scale;
	var rank;
	var info;
	var A;
	var B;
	var S;

	scale = 1e295;
	A = new Complex128Array([
		4 * scale,
		0,
		1 * scale,
		0,
		1 * scale,
		0,
		3 * scale,
		0
	]);
	B = new Complex128Array([
		1 * scale, 0, 2 * scale, 0
	]);
	S = new Float64Array( 2 );
	rank = [ 0 ];
	info = zgelss( 2, 2, 1, A, 1, 2, 0, B, 1, 2, 0, S, 1, 0, -1.0, rank, null, 1, 0, 0, null, 1, 0 ); // eslint-disable-line max-len
	assert.strictEqual( info, 0 );
	assert.strictEqual( rank[ 0 ], 2 );
});

test( 'zgelss: underdetermined wide 2x6 (LQ path)', function t() {
	var rank;
	var info;
	var tc;
	var Bv;
	var A;
	var B;
	var S;

	tc = underdetermined_wide;
	A = new Complex128Array([
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
	B = new Complex128Array( 6 );
	Bv = reinterpret( B, 0 );
	Bv[ 0 ] = 2.0;
	Bv[ 1 ] = 1.0;
	Bv[ 2 ] = 4.0;
	Bv[ 3 ] = -1.0;
	S = new Float64Array( 2 );
	rank = [ 0 ];
	info = zgelss( 2, 6, 1, A, 1, 2, 0, B, 1, 6, 0, S, 1, 0, -1.0, rank, null, 1, 0, 0, null, 1, 0 ); // eslint-disable-line max-len
	assert.strictEqual( info, tc.info );
	assert.strictEqual( rank[ 0 ], tc.rank );
	assertArrayClose( toArray( S ), tc.s, 1e-10, 's' );
	assertArrayClose( toArray( reinterpret( B, 0 ) ).slice( 0, 12 ), tc.x, 1e-10, 'x' ); // eslint-disable-line max-len
});
