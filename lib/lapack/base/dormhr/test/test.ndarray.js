/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dormhr from './../lib/ndarray.js';

// FIXTURES //

import hess_factors from './fixtures/hess_factors.json' with { type: 'json' };
import left_notrans from './fixtures/left_notrans.json' with { type: 'json' };
import left_trans from './fixtures/left_trans.json' with { type: 'json' };
import right_notrans from './fixtures/right_notrans.json' with { type: 'json' };
import right_trans from './fixtures/right_trans.json' with { type: 'json' };
import left_notrans_rect from './fixtures/left_notrans_rect.json' with { type: 'json' };
import right_trans_rect from './fixtures/right_trans_rect.json' with { type: 'json' };
import hess_factors_partial from './fixtures/hess_factors_partial.json' with { type: 'json' };
import left_notrans_partial from './fixtures/left_notrans_partial.json' with { type: 'json' };
import right_trans_partial from './fixtures/right_trans_partial.json' with { type: 'json' };

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
* Creates an identity matrix of size n stored column-major in a Float64Array.
*
* @param {integer} n - matrix size
* @param {integer} lda - leading dimension (>= n)
* @returns {Float64Array} identity matrix
*/
function eye( n, lda ) {
	var out = new Float64Array( lda * n );
	var i;
	for ( i = 0; i < n; i++ ) {
		out[ i + ( i * lda ) ] = 1.0;
	}
	return out;
}

/**
* Extracts M-by-N submatrix from column-major flat array.
* The fixture stores column-major with M rows per column.
*
* @param {Float64Array} arr - flat column-major array
* @param {integer} lda - leading dimension
* @param {integer} m - rows
* @param {integer} n - cols
* @returns {Array} extracted values
*/
function extractColMajor( arr, lda, m, n ) {
	var out = [];
	var i;
	var j;
	for ( j = 0; j < n; j++ ) {
		for ( i = 0; i < m; i++ ) {
			out.push( arr[ i + ( j * lda ) ] );
		}
	}
	return out;
}

// TESTS //

// Load Hessenberg factors from full reduction (ILO=1, IHI=5, 5x5 matrix, LDA=6)
var hf = hess_factors;

// hf.a is the full 6x5 column-major Hessenberg output (stored as 30 elements, LDA=6) // eslint-disable-line max-len

// hf.tau has 4 elements (TAU(1:4) from dgehrd with N=5)

test( 'dormhr: left, no-transpose (Q * I)', function t() {
	var WORK;
	var info;
	var TAU;
	var tc;
	var A;
	var C;

	tc = left_notrans;
	A = new Float64Array( hf.a );
	TAU = new Float64Array( hf.tau );
	C = eye( 5, 6 );
	WORK = new Float64Array( 1000 );
	info = dormhr( 'left', 'no-transpose', 5, 5, 1, 5, A, 1, 6, 0, TAU, 1, 0, C, 1, 6, 0, WORK, 1, 0, 1000 ); // eslint-disable-line max-len
	assert.equal( info, 0, 'info' );
	assertArrayClose( extractColMajor( C, 6, 5, 5 ), tc.c, 1e-14, 'c' );
});

test( 'dormhr: left, transpose (Q^T * I)', function t() {
	var WORK;
	var info;
	var TAU;
	var tc;
	var A;
	var C;

	tc = left_trans;
	A = new Float64Array( hf.a );
	TAU = new Float64Array( hf.tau );
	C = eye( 5, 6 );
	WORK = new Float64Array( 1000 );
	info = dormhr( 'left', 'transpose', 5, 5, 1, 5, A, 1, 6, 0, TAU, 1, 0, C, 1, 6, 0, WORK, 1, 0, 1000 ); // eslint-disable-line max-len
	assert.equal( info, 0, 'info' );
	assertArrayClose( extractColMajor( C, 6, 5, 5 ), tc.c, 1e-14, 'c' );
});

test( 'dormhr: right, no-transpose (I * Q)', function t() {
	var WORK;
	var info;
	var TAU;
	var tc;
	var A;
	var C;

	tc = right_notrans;
	A = new Float64Array( hf.a );
	TAU = new Float64Array( hf.tau );
	C = eye( 5, 6 );
	WORK = new Float64Array( 1000 );
	info = dormhr( 'right', 'no-transpose', 5, 5, 1, 5, A, 1, 6, 0, TAU, 1, 0, C, 1, 6, 0, WORK, 1, 0, 1000 ); // eslint-disable-line max-len
	assert.equal( info, 0, 'info' );
	assertArrayClose( extractColMajor( C, 6, 5, 5 ), tc.c, 1e-14, 'c' );
});

test( 'dormhr: right, transpose (I * Q^T)', function t() {
	var WORK;
	var info;
	var TAU;
	var tc;
	var A;
	var C;

	tc = right_trans;
	A = new Float64Array( hf.a );
	TAU = new Float64Array( hf.tau );
	C = eye( 5, 6 );
	WORK = new Float64Array( 1000 );
	info = dormhr( 'right', 'transpose', 5, 5, 1, 5, A, 1, 6, 0, TAU, 1, 0, C, 1, 6, 0, WORK, 1, 0, 1000 ); // eslint-disable-line max-len
	assert.equal( info, 0, 'info' );
	assertArrayClose( extractColMajor( C, 6, 5, 5 ), tc.c, 1e-14, 'c' );
});

test( 'dormhr: left, no-transpose, rectangular C (5x3)', function t() {
	var WORK;
	var info;
	var TAU;
	var tc;
	var A;
	var C;

	tc = left_notrans_rect;
	A = new Float64Array( hf.a );
	TAU = new Float64Array( hf.tau );
	C = new Float64Array( 6 * 3 );
	C[ 0 ] = 1.0;
	C[ 1 ] = 3.0;
	C[ 2 ] = -1.0;
	C[ 3 ] = 2.0;
	C[ 4 ] = 0.5;
	C[ 6 ] = 2.0;
	C[ 7 ] = 0.0;
	C[ 8 ] = 4.0;
	C[ 9 ] = -1.0;
	C[ 10 ] = 1.5;
	C[ 12 ] = -0.5;
	C[ 13 ] = 1.0;
	C[ 14 ] = 2.0;
	C[ 15 ] = 3.0;
	C[ 16 ] = -2.0;
	WORK = new Float64Array( 1000 );
	info = dormhr( 'left', 'no-transpose', 5, 3, 1, 5, A, 1, 6, 0, TAU, 1, 0, C, 1, 6, 0, WORK, 1, 0, 1000 ); // eslint-disable-line max-len
	assert.equal( info, 0, 'info' );
	assertArrayClose( extractColMajor( C, 6, 5, 3 ), tc.c, 1e-14, 'c' );
});

test( 'dormhr: right, transpose, rectangular C (3x5)', function t() {
	var WORK;
	var info;
	var TAU;
	var tc;
	var A;
	var C;

	tc = right_trans_rect;
	A = new Float64Array( hf.a );
	TAU = new Float64Array( hf.tau );
	C = new Float64Array( 6 * 5 );
	C[ 0 ] = 1.0;
	C[ 1 ] = 0.0;
	C[ 2 ] = 2.0;
	C[ 6 ] = 2.0;
	C[ 7 ] = 1.0;
	C[ 8 ] = -1.0;
	C[ 12 ] = -1.0;
	C[ 13 ] = 3.0;
	C[ 14 ] = 0.0;
	C[ 18 ] = 4.0;
	C[ 19 ] = -2.0;
	C[ 20 ] = 1.0;
	C[ 24 ] = 0.5;
	C[ 25 ] = 1.5;
	C[ 26 ] = -0.5;
	WORK = new Float64Array( 1000 );
	info = dormhr( 'right', 'transpose', 3, 5, 1, 5, A, 1, 6, 0, TAU, 1, 0, C, 1, 6, 0, WORK, 1, 0, 1000 ); // eslint-disable-line max-len
	assert.equal( info, 0, 'info' );
	assertArrayClose( extractColMajor( C, 6, 3, 5 ), tc.c, 1e-14, 'c' );
});

test( 'dormhr: M=0 quick return', function t() {
	var WORK;
	var info;
	var TAU;
	var A;
	var C;

	A = new Float64Array( hf.a );
	TAU = new Float64Array( hf.tau );
	C = new Float64Array( 1 );
	WORK = new Float64Array( 10 );
	info = dormhr( 'left', 'no-transpose', 0, 5, 1, 0, A, 1, 6, 0, TAU, 1, 0, C, 1, 6, 0, WORK, 1, 0, 10 ); // eslint-disable-line max-len
	assert.equal( info, 0, 'info' );
});

test( 'dormhr: N=0 quick return', function t() {
	var WORK;
	var info;
	var TAU;
	var A;
	var C;

	A = new Float64Array( hf.a );
	TAU = new Float64Array( hf.tau );
	C = new Float64Array( 1 );
	WORK = new Float64Array( 10 );
	info = dormhr( 'left', 'no-transpose', 5, 0, 1, 5, A, 1, 6, 0, TAU, 1, 0, C, 1, 6, 0, WORK, 1, 0, 10 ); // eslint-disable-line max-len
	assert.equal( info, 0, 'info' );
});

test( 'dormhr: NH=0 quick return (ILO=IHI)', function t() {
	var expected;
	var WORK;
	var info;
	var TAU;
	var A;
	var C;

	A = new Float64Array( hf.a );
	TAU = new Float64Array( hf.tau );
	C = eye( 5, 6 );
	WORK = new Float64Array( 10 );
	info = dormhr( 'left', 'no-transpose', 5, 5, 3, 3, A, 1, 6, 0, TAU, 1, 0, C, 1, 6, 0, WORK, 1, 0, 10 ); // eslint-disable-line max-len
	assert.equal( info, 0, 'info' );
	expected = eye( 5, 6 );
	assertArrayClose( extractColMajor( C, 6, 5, 5 ), extractColMajor( expected, 6, 5, 5 ), 1e-14, 'c unchanged' ); // eslint-disable-line max-len
});

// Load partial Hessenberg factors (ILO=2, IHI=4, 5x5 matrix, LDA=6)
var hfp = hess_factors_partial;

test( 'dormhr: left, no-transpose, partial (ILO=2, IHI=4)', function t() {
	var WORK;
	var info;
	var TAU;
	var tc;
	var A;
	var C;

	tc = left_notrans_partial;
	A = new Float64Array( hfp.a2 );
	TAU = new Float64Array( hfp.tau2 );
	C = eye( 5, 6 );
	WORK = new Float64Array( 1000 );
	info = dormhr( 'left', 'no-transpose', 5, 5, 2, 4, A, 1, 6, 0, TAU, 1, 0, C, 1, 6, 0, WORK, 1, 0, 1000 ); // eslint-disable-line max-len
	assert.equal( info, 0, 'info' );
	assertArrayClose( extractColMajor( C, 6, 5, 5 ), tc.c, 1e-14, 'c' );
});

test( 'dormhr: right, transpose, partial (ILO=2, IHI=4)', function t() {
	var WORK;
	var info;
	var TAU;
	var tc;
	var A;
	var C;

	tc = right_trans_partial;
	A = new Float64Array( hfp.a2 );
	TAU = new Float64Array( hfp.tau2 );
	C = eye( 5, 6 );
	WORK = new Float64Array( 1000 );
	info = dormhr( 'right', 'transpose', 5, 5, 2, 4, A, 1, 6, 0, TAU, 1, 0, C, 1, 6, 0, WORK, 1, 0, 1000 ); // eslint-disable-line max-len
	assert.equal( info, 0, 'info' );
	assertArrayClose( extractColMajor( C, 6, 5, 5 ), tc.c, 1e-14, 'c' );
});
