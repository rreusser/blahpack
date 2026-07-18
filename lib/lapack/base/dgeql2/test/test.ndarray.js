/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dgeql2 from './../lib/ndarray.js';
const ndarrayFn = dgeql2;

// FIXTURES //

import _3x2 from './fixtures/3x2.json' with { type: 'json' };
import _2x2 from './fixtures/2x2.json' with { type: 'json' };
import n_zero from './fixtures/n_zero.json' with { type: 'json' };
import m_zero from './fixtures/m_zero.json' with { type: 'json' };
import _4x3 from './fixtures/4x3.json' with { type: 'json' };
import _2x3 from './fixtures/2x3.json' with { type: 'json' };

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
	for ( i = 0; i < expected.length; i++ ) {
		relErr = Math.abs( actual[ i ] - expected[ i ] ) / Math.max( Math.abs( expected[ i ] ), 1.0 ); // eslint-disable-line max-len
		if ( relErr > tol ) {
			throw new Error( msg + '[' + i + ']: expected ' + expected[ i ] + ', got ' + actual[ i ] ); // eslint-disable-line max-len
		}
	}
}

/**
* Extracts a column-major M-by-N submatrix from a flat array with leading dimension lda.
*
* @private
* @param {*} A - A
* @param {*} M - M
* @param {*} N - N
* @param {*} lda - lda
* @returns {*} result
*/
function extractMatrix( A, M, N, lda ) {
	const out = [];
	let i, j;
	for ( j = 0; j < N; j++ ) {
		for ( i = 0; i < M; i++ ) {
			out.push( A[ i + j * lda ] );
		}
	}
	return out;
}

test( 'base is a function', function t() {
	assert.strictEqual( typeof dgeql2, 'function', 'is a function' );
});

test( 'ndarray is a function', function t() {
	assert.strictEqual( typeof ndarrayFn, 'function', 'is a function' );
});

test( 'dgeql2: 3x2', function t() {

	const tc = _3x2;
	const A = new Float64Array( 3 * 2 );
	A[ 0 ] = 1;
	A[ 1 ] = 3;
	A[ 2 ] = 5;
	A[ 3 ] = 2;
	A[ 4 ] = 4;
	A[ 5 ] = 6;
	const TAU = new Float64Array( 2 );
	const WORK = new Float64Array( 2 );
	const info = dgeql2( 3, 2, A, 1, 3, 0, TAU, 1, 0, WORK, 1, 0 );
	assert.strictEqual( info, tc.INFO );
	assertArrayClose( extractMatrix( A, 3, 2, 3 ), tc.A, 1e-14, 'A' );
	assertArrayClose( TAU, tc.TAU, 1e-14, 'TAU' );
});

test( 'dgeql2: 2x2', function t() {

	const tc = _2x2;
	const A = new Float64Array( 2 * 2 );
	A[ 0 ] = 4;
	A[ 1 ] = 3;
	A[ 2 ] = 1;
	A[ 3 ] = 2;
	const TAU = new Float64Array( 2 );
	const WORK = new Float64Array( 2 );
	const info = dgeql2( 2, 2, A, 1, 2, 0, TAU, 1, 0, WORK, 1, 0 );
	assert.strictEqual( info, tc.INFO );
	assertArrayClose( extractMatrix( A, 2, 2, 2 ), tc.A, 1e-14, 'A' );
	assertArrayClose( TAU, tc.TAU, 1e-14, 'TAU' );
});

test( 'dgeql2: N=0', function t() {

	const tc = n_zero;
	const A = new Float64Array( 2 );
	const TAU = new Float64Array( 2 );
	const WORK = new Float64Array( 2 );
	const info = dgeql2( 2, 0, A, 1, 2, 0, TAU, 1, 0, WORK, 1, 0 );
	assert.strictEqual( info, tc.INFO );
});

test( 'dgeql2: M=0', function t() {

	const tc = m_zero;
	const A = new Float64Array( 2 );
	const TAU = new Float64Array( 2 );
	const WORK = new Float64Array( 2 );
	const info = dgeql2( 0, 2, A, 1, 1, 0, TAU, 1, 0, WORK, 1, 0 );
	assert.strictEqual( info, tc.INFO );
});

test( 'dgeql2: 4x3', function t() {

	const tc = _4x3;
	const A = new Float64Array( 4 * 3 );
	A[ 0 ] = 2;
	A[ 1 ] = 1;
	A[ 2 ] = 3;
	A[ 3 ] = 1;
	A[ 4 ] = 1;
	A[ 5 ] = 4;
	A[ 6 ] = 2;
	A[ 7 ] = 3;
	A[ 8 ] = 3;
	A[ 9 ] = 2;
	A[ 10 ] = 5;
	A[ 11 ] = 1;
	const TAU = new Float64Array( 3 );
	const WORK = new Float64Array( 3 );
	const info = dgeql2( 4, 3, A, 1, 4, 0, TAU, 1, 0, WORK, 1, 0 );
	assert.strictEqual( info, tc.INFO );
	assertArrayClose( extractMatrix( A, 4, 3, 4 ), tc.A, 1e-14, 'A' );
	assertArrayClose( TAU, tc.TAU, 1e-14, 'TAU' );
});

test( 'dgeql2: 2x3 (wide matrix, M < N)', function t() {

	const tc = _2x3;
	const A = new Float64Array( 2 * 3 );
	A[ 0 ] = 1;
	A[ 1 ] = 4;
	A[ 2 ] = 2;
	A[ 3 ] = 5;
	A[ 4 ] = 3;
	A[ 5 ] = 6;
	const TAU = new Float64Array( 2 );
	const WORK = new Float64Array( 3 );
	const info = dgeql2( 2, 3, A, 1, 2, 0, TAU, 1, 0, WORK, 1, 0 );
	assert.strictEqual( info, tc.INFO );
	assertArrayClose( extractMatrix( A, 2, 3, 2 ), tc.A, 1e-14, 'A' );
	assertArrayClose( TAU, tc.TAU, 1e-14, 'TAU' );
});
