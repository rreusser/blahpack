/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dgelq2 from './../lib/ndarray.js';

// FIXTURES //

import _3x4 from './fixtures/3x4.json' with { type: 'json' };
import _4x3 from './fixtures/4x3.json' with { type: 'json' };
import _3x3 from './fixtures/3x3.json' with { type: 'json' };
import _1x4 from './fixtures/1x4.json' with { type: 'json' };
import _3x1 from './fixtures/3x1.json' with { type: 'json' };
import m_zero from './fixtures/m_zero.json' with { type: 'json' };
import n_zero from './fixtures/n_zero.json' with { type: 'json' };
import _1x1 from './fixtures/1x1.json' with { type: 'json' };
import _2x5 from './fixtures/2x5.json' with { type: 'json' };

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
	const relErr = Math.abs( actual - expected ) / Math.max( Math.abs( expected ), 1.0 ); // eslint-disable-line max-len
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
	let i;
	assert.equal( actual.length, expected.length, msg + ': length mismatch' );
	for ( i = 0; i < expected.length; i++ ) {
		assertClose( actual[ i ], expected[ i ], tol, msg + '[' + i + ']' );
	}
}

/**
* Create a column-major matrix from row-order input values.
*
* @param {number} M - rows
* @param {number} N - cols
* @param {Array} vals - row-major values (M*N)
* @returns {Float64Array} column-major flat array with LDA=M
*/
function colMajor( M, N, vals ) {
	const out = new Float64Array( M * N );
	let i, j;
	for ( i = 0; i < M; i++ ) {
		for ( j = 0; j < N; j++ ) {
			out[ j * M + i ] = vals[ i * N + j ];
		}
	}
	return out;
}

/**
* Extract column-major sub-matrix of size M x N from flat array with leading dim LDA.
*
* @param {Float64Array} A - flat array
* @param {number} LDA - leading dimension
* @param {number} M - rows to extract
* @param {number} N - cols to extract
* @returns {Array} M*N values in column-major order
*/
function extractMatrix( A, LDA, M, N ) {
	const out = [];
	let i, j;
	for ( j = 0; j < N; j++ ) {
		for ( i = 0; i < M; i++ ) {
			out.push( A[ j * LDA + i ] );
		}
	}
	return out;
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

test( 'dgelq2: 3x4 (M < N, well-conditioned)', function t() {

	const tc = _3x4;
	const A = new Float64Array( 6 * 4 );
	A[ 0 * 6 + 0 ] = 2.0;
	A[ 1 * 6 + 0 ] = 1.0;
	A[ 2 * 6 + 0 ] = 3.0;
	A[ 3 * 6 + 0 ] = 1.0;
	A[ 0 * 6 + 1 ] = 1.0;
	A[ 1 * 6 + 1 ] = 4.0;
	A[ 2 * 6 + 1 ] = 2.0;
	A[ 3 * 6 + 1 ] = 3.0;
	A[ 0 * 6 + 2 ] = 3.0;
	A[ 1 * 6 + 2 ] = 2.0;
	A[ 2 * 6 + 2 ] = 5.0;
	A[ 3 * 6 + 2 ] = 2.0;
	const TAU = new Float64Array( 3 );
	const WORK = new Float64Array( 3 );
	const info = dgelq2( 3, 4, A, 1, 6, 0, TAU, 1, 0, WORK, 1, 0 );
	assert.equal( info, tc.INFO, 'INFO' );
	assertArrayClose( extractMatrix( A, 6, 3, 4 ), tc.A, 1e-14, 'A' );
	assertArrayClose( toArray( TAU ), tc.TAU, 1e-14, 'TAU' );
});

test( 'dgelq2: 4x3 (M > N)', function t() {

	const tc = _4x3;
	const A = new Float64Array( 6 * 3 );
	A[ 0 * 6 + 0 ] = 2.0;
	A[ 1 * 6 + 0 ] = 1.0;
	A[ 2 * 6 + 0 ] = 3.0;
	A[ 0 * 6 + 1 ] = 1.0;
	A[ 1 * 6 + 1 ] = 4.0;
	A[ 2 * 6 + 1 ] = 2.0;
	A[ 0 * 6 + 2 ] = 3.0;
	A[ 1 * 6 + 2 ] = 2.0;
	A[ 2 * 6 + 2 ] = 5.0;
	A[ 0 * 6 + 3 ] = 1.0;
	A[ 1 * 6 + 3 ] = 3.0;
	A[ 2 * 6 + 3 ] = 1.0;
	const TAU = new Float64Array( 3 );
	const WORK = new Float64Array( 4 );
	const info = dgelq2( 4, 3, A, 1, 6, 0, TAU, 1, 0, WORK, 1, 0 );
	assert.equal( info, tc.INFO, 'INFO' );
	assertArrayClose( extractMatrix( A, 6, 4, 3 ), tc.A, 1e-14, 'A' );
	assertArrayClose( toArray( TAU ), tc.TAU, 1e-14, 'TAU' );
});

test( 'dgelq2: 3x3 (square)', function t() {

	const tc = _3x3;
	const A = new Float64Array( 6 * 3 );
	A[ 0 * 6 + 0 ] = 4.0;
	A[ 1 * 6 + 0 ] = 1.0;
	A[ 2 * 6 + 0 ] = 2.0;
	A[ 0 * 6 + 1 ] = 1.0;
	A[ 1 * 6 + 1 ] = 3.0;
	A[ 2 * 6 + 1 ] = 1.0;
	A[ 0 * 6 + 2 ] = 2.0;
	A[ 1 * 6 + 2 ] = 1.0;
	A[ 2 * 6 + 2 ] = 5.0;
	const TAU = new Float64Array( 3 );
	const WORK = new Float64Array( 3 );
	const info = dgelq2( 3, 3, A, 1, 6, 0, TAU, 1, 0, WORK, 1, 0 );
	assert.equal( info, tc.INFO, 'INFO' );
	assertArrayClose( extractMatrix( A, 6, 3, 3 ), tc.A, 1e-14, 'A' );
	assertArrayClose( toArray( TAU ), tc.TAU, 1e-14, 'TAU' );
});

test( 'dgelq2: 1x4 (single row)', function t() {

	const tc = _1x4;
	const A = new Float64Array( 6 * 4 );
	A[ 0 * 6 + 0 ] = 1.0;
	A[ 1 * 6 + 0 ] = 2.0;
	A[ 2 * 6 + 0 ] = 3.0;
	A[ 3 * 6 + 0 ] = 4.0;
	const TAU = new Float64Array( 1 );
	const WORK = new Float64Array( 1 );
	const info = dgelq2( 1, 4, A, 1, 6, 0, TAU, 1, 0, WORK, 1, 0 );
	assert.equal( info, tc.INFO, 'INFO' );
	assertArrayClose( extractMatrix( A, 6, 1, 4 ), tc.A, 1e-14, 'A' );
	assertArrayClose( toArray( TAU ), tc.TAU, 1e-14, 'TAU' );
});

test( 'dgelq2: 3x1 (single column)', function t() {

	const tc = _3x1;
	const A = new Float64Array( 6 * 1 );
	A[ 0 * 6 + 0 ] = 2.0;
	A[ 0 * 6 + 1 ] = 3.0;
	A[ 0 * 6 + 2 ] = 4.0;
	const TAU = new Float64Array( 1 );
	const WORK = new Float64Array( 3 );
	const info = dgelq2( 3, 1, A, 1, 6, 0, TAU, 1, 0, WORK, 1, 0 );
	assert.equal( info, tc.INFO, 'INFO' );
	assertArrayClose( extractMatrix( A, 6, 3, 1 ), tc.A, 1e-14, 'A' );
	assertArrayClose( toArray( TAU ), tc.TAU, 1e-14, 'TAU' );
});

test( 'dgelq2: M=0 (quick return)', function t() {

	const tc = m_zero;
	const A = new Float64Array( 1 );
	const TAU = new Float64Array( 1 );
	const WORK = new Float64Array( 1 );
	const info = dgelq2( 0, 3, A, 1, 1, 0, TAU, 1, 0, WORK, 1, 0 );
	assert.equal( info, tc.INFO, 'INFO' );
});

test( 'dgelq2: N=0 (quick return)', function t() {

	const tc = n_zero;
	const A = new Float64Array( 1 );
	const TAU = new Float64Array( 1 );
	const WORK = new Float64Array( 1 );
	const info = dgelq2( 3, 0, A, 1, 6, 0, TAU, 1, 0, WORK, 1, 0 );
	assert.equal( info, tc.INFO, 'INFO' );
});

test( 'dgelq2: 1x1', function t() {

	const tc = _1x1;
	const A = new Float64Array( 6 );
	A[ 0 ] = 7.0;
	const TAU = new Float64Array( 1 );
	const WORK = new Float64Array( 1 );
	const info = dgelq2( 1, 1, A, 1, 6, 0, TAU, 1, 0, WORK, 1, 0 );
	assert.equal( info, tc.INFO, 'INFO' );
	assertArrayClose( extractMatrix( A, 6, 1, 1 ), tc.A, 1e-14, 'A' );
	assertArrayClose( toArray( TAU ), tc.TAU, 1e-14, 'TAU' );
});

test( 'dgelq2: 2x5 (wide)', function t() {

	const tc = _2x5;
	const A = new Float64Array( 6 * 5 );
	A[ 0 * 6 + 0 ] = 1.0;
	A[ 1 * 6 + 0 ] = 2.0;
	A[ 2 * 6 + 0 ] = 3.0;
	A[ 3 * 6 + 0 ] = 4.0;
	A[ 4 * 6 + 0 ] = 5.0;
	A[ 0 * 6 + 1 ] = 6.0;
	A[ 1 * 6 + 1 ] = 7.0;
	A[ 2 * 6 + 1 ] = 8.0;
	A[ 3 * 6 + 1 ] = 9.0;
	A[ 4 * 6 + 1 ] = 10.0;
	const TAU = new Float64Array( 2 );
	const WORK = new Float64Array( 2 );
	const info = dgelq2( 2, 5, A, 1, 6, 0, TAU, 1, 0, WORK, 1, 0 );
	assert.equal( info, tc.INFO, 'INFO' );
	assertArrayClose( extractMatrix( A, 6, 2, 5 ), tc.A, 1e-14, 'A' );
	assertArrayClose( toArray( TAU ), tc.TAU, 1e-14, 'TAU' );
});

test( 'dgelq2: compact layout (LDA=M, no padding)', function t() {

	const A = colMajor( 3, 3, [
		4,
		1,
		2,
		1,
		3,
		1,
		2,
		1,
		5
	]);
	const TAU = new Float64Array( 3 );
	const WORK = new Float64Array( 3 );
	const info = dgelq2( 3, 3, A, 1, 3, 0, TAU, 1, 0, WORK, 1, 0 );
	const tc = _3x3;
	assert.equal( info, tc.INFO, 'INFO' );
	assertArrayClose( toArray( A ), tc.A, 1e-14, 'A' );
	assertArrayClose( toArray( TAU ), tc.TAU, 1e-14, 'TAU' );
});

test( 'dgelq2: non-zero offset', function t() {

	const A = new Float64Array( 3 + 4 * 2 );
	A[ 3 ] = 4.0;
	A[ 4 ] = 1.0;
	A[ 7 ] = 1.0;
	A[ 8 ] = 3.0;
	const TAU = new Float64Array( 4 );
	const WORK = new Float64Array( 4 );
	const info = dgelq2( 2, 2, A, 1, 4, 3, TAU, 1, 1, WORK, 1, 0 );
	assert.equal( info, 0, 'INFO' );
	assert.ok( !isNaN( TAU[ 1 ] ), 'TAU[1] is a number' );
	assert.ok( !isNaN( TAU[ 2 ] ), 'TAU[2] is a number' );
});
