/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import dgbtrf from '../../dgbtrf/lib/base.js';
import dgbtrs from './../lib/ndarray.js';
var ndarrayFn = dgbtrs;

// FIXTURES //

import tridiag_4x4_1rhs from './fixtures/tridiag_4x4_1rhs.json' with { type: 'json' };
import tridiag_4x4_2rhs from './fixtures/tridiag_4x4_2rhs.json' with { type: 'json' };
import tridiag_4x4_trans from './fixtures/tridiag_4x4_trans.json' with { type: 'json' };
import pentadiag_5x5_1rhs from './fixtures/pentadiag_5x5_1rhs.json' with { type: 'json' };
import pentadiag_5x5_trans from './fixtures/pentadiag_5x5_trans.json' with { type: 'json' };
import pivot_2x2 from './fixtures/pivot_2x2.json' with { type: 'json' };

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
* Multiply banded matrix A (in original form) times vector x and check A*x = b.
* A is specified in its original dense band storage before factorization.
*/
function bandMatVec( N, kl, ku, ABrows, x ) {
	// ABrows is a 2D array [LDAB][N] stored column-major as flat array with LDAB rows // eslint-disable-line max-len
	var bandRow;
	var result = new Float64Array( N );
	var LDAB = 2 * kl + ku + 1;
	var kv = ku + kl;
	var i;
	var j;

	for ( j = 0; j < N; j++ ) {
		for ( i = Math.max( 0, j - ku ); i < Math.min( N, j + kl + 1 ); i++ ) {
			// A(i,j) is stored at AB(kv + i - j, j) (0-based)
			bandRow = kv + i - j;
			result[ i ] += ABrows[ bandRow + j * LDAB ] * x[ j ];
		}
	}
	return result;
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

test( 'dgbtrs: N=0 quick return', function t() {
	var IPIV;
	var info;
	var AB;
	var B;

	AB = new Float64Array( 16 );
	IPIV = new Int32Array( 4 );
	B = new Float64Array( 4 );
	info = dgbtrs( 'no-transpose', 0, 1, 1, 1, AB, 1, 4, 0, IPIV, 1, 0, B, 1, 4, 0 ); // eslint-disable-line max-len
	assert.equal( info, 0 );
});

test( 'dgbtrs: NRHS=0 quick return', function t() {
	var IPIV;
	var info;
	var AB;
	var B;

	AB = new Float64Array( 16 );
	IPIV = new Int32Array( 4 );
	B = new Float64Array( 4 );
	info = dgbtrs( 'no-transpose', 4, 1, 1, 0, AB, 1, 4, 0, IPIV, 1, 0, B, 1, 4, 0 ); // eslint-disable-line max-len
	assert.equal( info, 0 );
});

test( 'dgbtrs: tridiag_4x4_1rhs (verify A*x = b)', function t() {
	var AB_orig;
	var IPIV;
	var info;
	var tc;
	var AB;
	var Ax;
	var b;
	var B;

	tc = tridiag_4x4_1rhs;
	AB_orig = new Float64Array([
		0.0,
		0.0,
		4.0,
		-1.0,
		0.0,
		-1.0,
		4.0,
		-1.0,
		0.0,
		-1.0,
		4.0,
		-1.0,
		0.0,
		-1.0,
		4.0,
		0.0
	]);
	AB = new Float64Array( AB_orig );
	b = new Float64Array( [ 1.0, 2.0, 3.0, 4.0 ] );
	IPIV = new Int32Array( 4 );
	dgbtrf( 4, 4, 1, 1, AB, 1, 4, 0, IPIV, 1, 0 );
	B = new Float64Array( b );
	info = dgbtrs( 'no-transpose', 4, 1, 1, 1, AB, 1, 4, 0, IPIV, 1, 0, B, 1, 4, 0 ); // eslint-disable-line max-len
	assert.equal( info, 0 );
	assertArrayClose( toArray( B ), tc.x, 1e-14, 'x' );
	Ax = bandMatVec( 4, 1, 1, AB_orig, B );
	assertArrayClose( toArray( Ax ), toArray( b ), 1e-12, 'A*x=b' );
});

test( 'dgbtrs: tridiag_4x4_2rhs', function t() {
	var AB_orig;
	var IPIV;
	var info;
	var tc;
	var AB;
	var b0;
	var b1;
	var x0;
	var x1;
	var B;

	tc = tridiag_4x4_2rhs;
	AB_orig = new Float64Array([
		0.0,
		0.0,
		4.0,
		-1.0,
		0.0,
		-1.0,
		4.0,
		-1.0,
		0.0,
		-1.0,
		4.0,
		-1.0,
		0.0,
		-1.0,
		4.0,
		0.0
	]);
	AB = new Float64Array( AB_orig );
	IPIV = new Int32Array( 4 );
	dgbtrf( 4, 4, 1, 1, AB, 1, 4, 0, IPIV, 1, 0 );
	B = new Float64Array([
		1.0,
		2.0,
		3.0,
		4.0,  // column 0
		4.0,
		3.0,
		2.0,
		1.0   // column 1
	]);
	b0 = new Float64Array( [ 1.0, 2.0, 3.0, 4.0 ] );
	b1 = new Float64Array( [ 4.0, 3.0, 2.0, 1.0 ] );
	info = dgbtrs( 'no-transpose', 4, 1, 1, 2, AB, 1, 4, 0, IPIV, 1, 0, B, 1, 4, 0 ); // eslint-disable-line max-len
	assert.equal( info, 0 );
	assertArrayClose( toArray( B ), tc.x, 1e-14, 'x' );
	x0 = B.slice( 0, 4 );
	x1 = B.slice( 4, 8 );
	assertArrayClose( toArray( bandMatVec( 4, 1, 1, AB_orig, x0 ) ), toArray( b0 ), 1e-12, 'A*x0=b0' ); // eslint-disable-line max-len
	assertArrayClose( toArray( bandMatVec( 4, 1, 1, AB_orig, x1 ) ), toArray( b1 ), 1e-12, 'A*x1=b1' ); // eslint-disable-line max-len
});

test( 'dgbtrs: tridiag_4x4_trans (verify A^T*x = b)', function t() {
	var AB_orig;
	var IPIV;
	var info;
	var tc;
	var AB;
	var Ax;
	var B;
	var b;

	tc = tridiag_4x4_trans;
	AB_orig = new Float64Array([
		0.0,
		0.0,
		4.0,
		-1.0,
		0.0,
		-1.0,
		4.0,
		-1.0,
		0.0,
		-1.0,
		4.0,
		-1.0,
		0.0,
		-1.0,
		4.0,
		0.0
	]);
	AB = new Float64Array( AB_orig );
	IPIV = new Int32Array( 4 );
	dgbtrf( 4, 4, 1, 1, AB, 1, 4, 0, IPIV, 1, 0 );
	B = new Float64Array( [ 1.0, 2.0, 3.0, 4.0 ] );
	b = new Float64Array( B );
	info = dgbtrs( 'transpose', 4, 1, 1, 1, AB, 1, 4, 0, IPIV, 1, 0, B, 1, 4, 0 );
	assert.equal( info, 0 );
	assertArrayClose( toArray( B ), tc.x, 1e-14, 'x' );
	Ax = bandMatVec( 4, 1, 1, AB_orig, B );
	assertArrayClose( toArray( Ax ), toArray( b ), 1e-12, 'A^T*x=b' );
});

test( 'dgbtrs: pentadiag_5x5_1rhs (verify A*x = b)', function t() {
	var AB_orig;
	var IPIV;
	var info;
	var tc;
	var AB;
	var Ax;
	var b;
	var B;

	tc = pentadiag_5x5_1rhs;
	AB_orig = new Float64Array( 7 * 5 );
	AB_orig[ 4 ] = 6.0;
	AB_orig[ 5 ] = -2.0;
	AB_orig[ 6 ] = 1.0;
	AB_orig[ 7 + 3 ] = -2.0;
	AB_orig[ 7 + 4 ] = 6.0;
	AB_orig[ 7 + 5 ] = -2.0;
	AB_orig[ 7 + 6 ] = 1.0;
	AB_orig[ 14 + 2 ] = 1.0;
	AB_orig[ 14 + 3 ] = -2.0;
	AB_orig[ 14 + 4 ] = 6.0;
	AB_orig[ 14 + 5 ] = -2.0;
	AB_orig[ 14 + 6 ] = 1.0;
	AB_orig[ 21 + 2 ] = 1.0;
	AB_orig[ 21 + 3 ] = -2.0;
	AB_orig[ 21 + 4 ] = 6.0;
	AB_orig[ 21 + 5 ] = -2.0;
	AB_orig[ 28 + 2 ] = 1.0;
	AB_orig[ 28 + 3 ] = -2.0;
	AB_orig[ 28 + 4 ] = 6.0;
	AB = new Float64Array( AB_orig );
	IPIV = new Int32Array( 5 );
	dgbtrf( 5, 5, 2, 2, AB, 1, 7, 0, IPIV, 1, 0 );
	b = new Float64Array( [ 1.0, 2.0, 3.0, 4.0, 5.0 ] );
	B = new Float64Array( b );
	info = dgbtrs( 'no-transpose', 5, 2, 2, 1, AB, 1, 7, 0, IPIV, 1, 0, B, 1, 5, 0 ); // eslint-disable-line max-len
	assert.equal( info, 0 );
	assertArrayClose( toArray( B ), tc.x, 1e-14, 'x' );
	Ax = bandMatVec( 5, 2, 2, AB_orig, B );
	assertArrayClose( toArray( Ax ), toArray( b ), 1e-12, 'A*x=b' );
});

test( 'dgbtrs: pentadiag_5x5_trans', function t() {
	var AB_orig;
	var IPIV;
	var info;
	var tc;
	var AB;
	var b;
	var B;

	tc = pentadiag_5x5_trans;
	AB_orig = new Float64Array( 7 * 5 );
	AB_orig[ 4 ] = 6.0;
	AB_orig[ 5 ] = -2.0;
	AB_orig[ 6 ] = 1.0;
	AB_orig[ 7 + 3 ] = -2.0;
	AB_orig[ 7 + 4 ] = 6.0;
	AB_orig[ 7 + 5 ] = -2.0;
	AB_orig[ 7 + 6 ] = 1.0;
	AB_orig[ 14 + 2 ] = 1.0;
	AB_orig[ 14 + 3 ] = -2.0;
	AB_orig[ 14 + 4 ] = 6.0;
	AB_orig[ 14 + 5 ] = -2.0;
	AB_orig[ 14 + 6 ] = 1.0;
	AB_orig[ 21 + 2 ] = 1.0;
	AB_orig[ 21 + 3 ] = -2.0;
	AB_orig[ 21 + 4 ] = 6.0;
	AB_orig[ 21 + 5 ] = -2.0;
	AB_orig[ 28 + 2 ] = 1.0;
	AB_orig[ 28 + 3 ] = -2.0;
	AB_orig[ 28 + 4 ] = 6.0;
	AB = new Float64Array( AB_orig );
	IPIV = new Int32Array( 5 );
	dgbtrf( 5, 5, 2, 2, AB, 1, 7, 0, IPIV, 1, 0 );
	b = new Float64Array( [ 1.0, 2.0, 3.0, 4.0, 5.0 ] );
	B = new Float64Array( b );
	info = dgbtrs( 'transpose', 5, 2, 2, 1, AB, 1, 7, 0, IPIV, 1, 0, B, 1, 5, 0 );
	assert.equal( info, 0 );
	assertArrayClose( toArray( B ), tc.x, 1e-14, 'x' );
});

test( 'dgbtrs: pivot_2x2 (verify A*x = b)', function t() {
	var AB_orig;
	var IPIV;
	var info;
	var tc;
	var AB;
	var b;
	var B;

	tc = pivot_2x2;
	AB_orig = new Float64Array( 4 * 2 );
	AB_orig[ 2 ] = 1.0;
	AB_orig[ 3 ] = 3.0;
	AB_orig[ 4 + 1 ] = 2.0;
	AB_orig[ 4 + 2 ] = 4.0;
	AB = new Float64Array( AB_orig );
	IPIV = new Int32Array( 2 );
	dgbtrf( 2, 2, 1, 1, AB, 1, 4, 0, IPIV, 1, 0 );
	b = new Float64Array( [ 5.0, 11.0 ] );
	B = new Float64Array( b );
	info = dgbtrs( 'no-transpose', 2, 1, 1, 1, AB, 1, 4, 0, IPIV, 1, 0, B, 1, 2, 0 ); // eslint-disable-line max-len
	assert.equal( info, 0 );
	assertArrayClose( toArray( B ), tc.x, 1e-14, 'x' );
	assert.equal( B[ 0 ], 1.0 );
	assert.equal( B[ 1 ], 2.0 );
});

test( 'dgbtrs: pivot_2x2 transpose (verify A^T*x = b)', function t() {
	var IPIV;
	var info;
	var AB;
	var B;

	AB = new Float64Array( 4 * 2 );
	AB[ 2 ] = 1.0;
	AB[ 3 ] = 3.0;
	AB[ 4 + 1 ] = 2.0;
	AB[ 4 + 2 ] = 4.0;
	IPIV = new Int32Array( 2 );
	dgbtrf( 2, 2, 1, 1, AB, 1, 4, 0, IPIV, 1, 0 );
	B = new Float64Array( [ 7.0, 10.0 ] );
	info = dgbtrs( 'transpose', 2, 1, 1, 1, AB, 1, 4, 0, IPIV, 1, 0, B, 1, 2, 0 );
	assert.equal( info, 0 );
	assertClose( B[ 0 ], 1.0, 1e-14, 'x[0]' );
	assertClose( B[ 1 ], 2.0, 1e-14, 'x[1]' );
});

test( 'dgbtrs: KL=0 no-L path transpose', function t() {
	var IPIV;
	var info;
	var AB;
	var B;

	AB = new Float64Array([
		0.0,
		2.0,
		1.0,
		3.0
	]);
	IPIV = new Int32Array( 2 );
	dgbtrf( 2, 2, 0, 1, AB, 1, 2, 0, IPIV, 1, 0 );
	B = new Float64Array( [ 4.0, 7.0 ] );
	info = dgbtrs( 'transpose', 2, 0, 1, 1, AB, 1, 2, 0, IPIV, 1, 0, B, 1, 2, 0 );
	assert.equal( info, 0 );
	assertClose( B[ 0 ], 2.0, 1e-14, 'x[0]' );
	assertClose( B[ 1 ], 5.0 / 3.0, 1e-14, 'x[1]' );
});

test( 'dgbtrs: KL=0 no-L path', function t() {
	var IPIV;
	var info;
	var AB;
	var B;

	AB = new Float64Array([
		0.0,
		2.0,   // col 0: [superdiag=0, diag=2]
		1.0,
		3.0    // col 1: [superdiag=1, diag=3]
	]);
	IPIV = new Int32Array( 2 );
	dgbtrf( 2, 2, 0, 1, AB, 1, 2, 0, IPIV, 1, 0 );
	B = new Float64Array( [ 5.0, 6.0 ] );
	info = dgbtrs( 'no-transpose', 2, 0, 1, 1, AB, 1, 2, 0, IPIV, 1, 0, B, 1, 2, 0 ); // eslint-disable-line max-len
	assert.equal( info, 0 );
	assertClose( B[ 0 ], 1.5, 1e-14, 'x[0]' );
	assertClose( B[ 1 ], 2.0, 1e-14, 'x[1]' );
});

// ndarray validation tests

test( 'dgbtrs: ndarray throws TypeError for invalid trans', function t() {
	var IPIV = new Int32Array( 4 );
	var AB = new Float64Array( 16 );
	var B = new Float64Array( 4 );
	assert.throws( function throws() {
		ndarrayFn( 'invalid', 4, 1, 1, 1, AB, 1, 4, 0, IPIV, 1, 0, B, 1, 4, 0 );
	}, TypeError );
});

test( 'dgbtrs: ndarray throws RangeError for negative N', function t() {
	var IPIV = new Int32Array( 4 );
	var AB = new Float64Array( 16 );
	var B = new Float64Array( 4 );
	assert.throws( function throws() {
		ndarrayFn( 'no-transpose', -1, 1, 1, 1, AB, 1, 4, 0, IPIV, 1, 0, B, 1, 4, 0 );
	}, RangeError );
});
