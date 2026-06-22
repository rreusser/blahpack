/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dgeqrf from './../lib/ndarray.js';

// FIXTURES //

import _3x3 from './fixtures/3x3.json' with { type: 'json' };
import _4x3 from './fixtures/4x3.json' with { type: 'json' };
import n_zero from './fixtures/n_zero.json' with { type: 'json' };
import large_65x65 from './fixtures/large_65x65.json' with { type: 'json' };

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
	var relErr;
	var i;
	for ( i = 0; i < expected.length; i++ ) {
		relErr = Math.abs( actual[ i ] - expected[ i ] ) / Math.max( Math.abs( expected[ i ] ), 1.0 ); // eslint-disable-line max-len
		if ( relErr > tol ) {
			throw new Error( msg + '[' + i + ']: expected ' + expected[ i ] + ', got ' + actual[ i ] ); // eslint-disable-line max-len
		}
	}
}

/**
* ExtractMatrix.
*
* @private
* @param {*} A - A
* @param {*} M - M
* @param {*} N - N
* @param {*} lda - lda
* @returns {*} result
*/
function extractMatrix( A, M, N, lda ) {
	var out = [];
	var i; var j;
	for ( j = 0; j < N; j++ ) {
		for ( i = 0; i < M; i++ ) {
			out.push( A[ i + j * lda ] );
		}
	}
	return out;
}

test( 'dgeqrf: 3x3', function t() {
	var WORK;
	var info;
	var TAU;
	var tc;
	var A;

	tc = _3x3;
	A = new Float64Array( 3 * 3 );
	A[ 0 ] = 2;
	A[ 1 ] = 1;
	A[ 2 ] = 3;
	A[ 3 ] = 1;
	A[ 4 ] = 4;
	A[ 5 ] = 2;
	A[ 6 ] = 3;
	A[ 7 ] = 2;
	A[ 8 ] = 5;
	TAU = new Float64Array( 3 );
	WORK = new Float64Array( 3 * 32 );
	info = dgeqrf( 3, 3, A, 1, 3, 0, TAU, 1, 0, WORK, 1, 0 );
	assert.strictEqual( info, tc.INFO );
	assertArrayClose( extractMatrix( A, 3, 3, 3 ), tc.A, 1e-14, 'A' );
	assertArrayClose( TAU, tc.TAU, 1e-14, 'TAU' );
});

test( 'dgeqrf: 4x3', function t() {
	var WORK;
	var info;
	var TAU;
	var tc;
	var A;

	tc = _4x3;
	A = new Float64Array( 4 * 3 );
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
	TAU = new Float64Array( 3 );
	WORK = new Float64Array( 3 * 32 );
	info = dgeqrf( 4, 3, A, 1, 4, 0, TAU, 1, 0, WORK, 1, 0 );
	assert.strictEqual( info, tc.INFO );
	assertArrayClose( extractMatrix( A, 4, 3, 4 ), tc.A, 1e-14, 'A' );
	assertArrayClose( TAU, tc.TAU, 1e-14, 'TAU' );
});

test( 'dgeqrf: N=0', function t() {
	var WORK;
	var info;
	var TAU;
	var tc;
	var A;

	tc = n_zero;
	A = new Float64Array( 9 );
	TAU = new Float64Array( 3 );
	WORK = new Float64Array( 32 );
	info = dgeqrf( 3, 0, A, 1, 3, 0, TAU, 1, 0, WORK, 1, 0 );
	assert.strictEqual( info, tc.INFO );
});

test( 'dgeqrf: 3x3 with WORK=null (internal allocation)', function t() {
	var info;
	var TAU;
	var tc;
	var A;

	tc = _3x3;
	A = new Float64Array( 3 * 3 );
	A[ 0 ] = 2;
	A[ 1 ] = 1;
	A[ 2 ] = 3;
	A[ 3 ] = 1;
	A[ 4 ] = 4;
	A[ 5 ] = 2;
	A[ 6 ] = 3;
	A[ 7 ] = 2;
	A[ 8 ] = 5;
	TAU = new Float64Array( 3 );
	info = dgeqrf( 3, 3, A, 1, 3, 0, TAU, 1, 0, null, 1, 0 );
	assert.strictEqual( info, tc.INFO );
	assertArrayClose( extractMatrix( A, 3, 3, 3 ), tc.A, 1e-14, 'A' );
	assertArrayClose( TAU, tc.TAU, 1e-14, 'TAU' );
});

test( 'dgeqrf: 3x3 with too-small WORK (internal reallocation)', function t() {
	var WORK;
	var info;
	var TAU;
	var tc;
	var A;

	tc = _3x3;
	A = new Float64Array( 3 * 3 );
	A[ 0 ] = 2;
	A[ 1 ] = 1;
	A[ 2 ] = 3;
	A[ 3 ] = 1;
	A[ 4 ] = 4;
	A[ 5 ] = 2;
	A[ 6 ] = 3;
	A[ 7 ] = 2;
	A[ 8 ] = 5;
	TAU = new Float64Array( 3 );
	WORK = new Float64Array( 1 );
	info = dgeqrf( 3, 3, A, 1, 3, 0, TAU, 1, 0, WORK, 1, 0 );
	assert.strictEqual( info, tc.INFO );
	assertArrayClose( extractMatrix( A, 3, 3, 3 ), tc.A, 1e-14, 'A' );
	assertArrayClose( TAU, tc.TAU, 1e-14, 'TAU' );
});

test( 'dgeqrf: large 65x65 (blocked path)', function t() {
	var WORK;
	var info;
	var LDA;
	var TAU;
	var tc;
	var M;
	var N;
	var A;
	var i;
	var j;

	tc = large_65x65;
	M = 65;
	N = 65;
	LDA = 70;
	A = new Float64Array( LDA * N );
	for ( j = 0; j < N; j++ ) {
		for ( i = 0; i < M; i++ ) {
			if ( i === j ) {
				A[ i + j * LDA ] = 10.0;
			} else {
				A[ i + j * LDA ] = 1.0 / ( Math.abs( i - j ) + 1 );
			}
		}
	}
	TAU = new Float64Array( Math.min( M, N ) );
	WORK = new Float64Array( N * 32 );
	info = dgeqrf( M, N, A, 1, LDA, 0, TAU, 1, 0, WORK, 1, 0 );
	assert.strictEqual( info, tc.INFO );
	assertArrayClose( extractMatrix( A, M, N, LDA ), tc.A, 1e-12, 'A' );
	assertArrayClose( TAU, tc.TAU, 1e-12, 'TAU' );
});
