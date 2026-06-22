/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dgebrd from './../lib/ndarray.js';

// FIXTURES //

import upper_4x3 from './fixtures/upper_4x3.json' with { type: 'json' };
import lower_3x4 from './fixtures/lower_3x4.json' with { type: 'json' };
import square_3x3 from './fixtures/square_3x3.json' with { type: 'json' };
import one_by_one from './fixtures/one_by_one.json' with { type: 'json' };
import upper_35x33 from './fixtures/upper_35x33.json' with { type: 'json' };
import lower_33x35 from './fixtures/lower_33x35.json' with { type: 'json' };

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
* Builds a column-major Float64Array from a flat column-major array.
*/
function colMajor( arr ) {
	return new Float64Array( arr );
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

test( 'dgebrd: 4x3 upper bidiagonal (M > N)', function t() {
	var TAUQ;
	var TAUP;
	var WORK;
	var info;
	var tc;
	var M;
	var N;
	var A;
	var d;
	var e;

	tc = upper_4x3;
	M = 4;
	N = 3;
	A = colMajor([
		2.0,
		1.0,
		3.0,
		1.0,
		1.0,
		4.0,
		2.0,
		3.0,
		3.0,
		2.0,
		5.0,
		1.0
	]);
	d = new Float64Array( 3 );
	e = new Float64Array( 2 );
	TAUQ = new Float64Array( 3 );
	TAUP = new Float64Array( 3 );
	WORK = new Float64Array( 100 );
	info = dgebrd( M, N, A, 1, M, 0, d, 1, 0, e, 1, 0, TAUQ, 1, 0, TAUP, 1, 0, WORK, 1, 0, 100 ); // eslint-disable-line max-len
	assert.equal( info, tc.INFO, 'INFO' );
	assertArrayClose( toArray( A ), tc.A, 1e-14, 'A' );
	assertArrayClose( toArray( d ), tc.D, 1e-14, 'D' );
	assertArrayClose( toArray( e ), tc.E, 1e-14, 'E' );
	assertArrayClose( toArray( TAUQ ), tc.TAUQ, 1e-14, 'TAUQ' );
	assertArrayClose( toArray( TAUP ), tc.TAUP, 1e-14, 'TAUP' );
});

test( 'dgebrd: 3x4 lower bidiagonal (M < N)', function t() {
	var TAUQ;
	var TAUP;
	var WORK;
	var info;
	var tc;
	var M;
	var N;
	var A;
	var d;
	var e;

	tc = lower_3x4;
	M = 3;
	N = 4;
	A = colMajor([
		2.0,
		4.0,
		1.0,
		1.0,
		2.0,
		5.0,
		3.0,
		1.0,
		2.0,
		1.0,
		3.0,
		4.0
	]);
	d = new Float64Array( 3 );
	e = new Float64Array( 2 );
	TAUQ = new Float64Array( 3 );
	TAUP = new Float64Array( 3 );
	WORK = new Float64Array( 100 );
	info = dgebrd( M, N, A, 1, M, 0, d, 1, 0, e, 1, 0, TAUQ, 1, 0, TAUP, 1, 0, WORK, 1, 0, 100 ); // eslint-disable-line max-len
	assert.equal( info, tc.INFO, 'INFO' );
	assertArrayClose( toArray( A ), tc.A, 1e-14, 'A' );
	assertArrayClose( toArray( d ), tc.D, 1e-14, 'D' );
	assertArrayClose( toArray( e ), tc.E, 1e-14, 'E' );
	assertArrayClose( toArray( TAUQ ), tc.TAUQ, 1e-14, 'TAUQ' );
	assertArrayClose( toArray( TAUP ), tc.TAUP, 1e-14, 'TAUP' );
});

test( 'dgebrd: 3x3 square', function t() {
	var TAUQ;
	var TAUP;
	var WORK;
	var info;
	var tc;
	var M;
	var N;
	var A;
	var d;
	var e;

	tc = square_3x3;
	M = 3;
	N = 3;
	A = colMajor([
		5.0,
		3.0,
		1.0,
		2.0,
		4.0,
		3.0,
		1.0,
		2.0,
		6.0
	]);
	d = new Float64Array( 3 );
	e = new Float64Array( 2 );
	TAUQ = new Float64Array( 3 );
	TAUP = new Float64Array( 3 );
	WORK = new Float64Array( 100 );
	info = dgebrd( M, N, A, 1, M, 0, d, 1, 0, e, 1, 0, TAUQ, 1, 0, TAUP, 1, 0, WORK, 1, 0, 100 ); // eslint-disable-line max-len
	assert.equal( info, tc.INFO, 'INFO' );
	assertArrayClose( toArray( A ), tc.A, 1e-14, 'A' );
	assertArrayClose( toArray( d ), tc.D, 1e-14, 'D' );
	assertArrayClose( toArray( e ), tc.E, 1e-14, 'E' );
	assertArrayClose( toArray( TAUQ ), tc.TAUQ, 1e-14, 'TAUQ' );
	assertArrayClose( toArray( TAUP ), tc.TAUP, 1e-14, 'TAUP' );
});

test( 'dgebrd: 1x1 matrix', function t() {
	var TAUQ;
	var TAUP;
	var WORK;
	var info;
	var tc;
	var A;
	var d;
	var e;

	tc = one_by_one;
	A = colMajor([ 7.0 ]);
	d = new Float64Array( 1 );
	e = new Float64Array( 0 );
	TAUQ = new Float64Array( 1 );
	TAUP = new Float64Array( 1 );
	WORK = new Float64Array( 10 );
	info = dgebrd( 1, 1, A, 1, 1, 0, d, 1, 0, e, 1, 0, TAUQ, 1, 0, TAUP, 1, 0, WORK, 1, 0, 10 ); // eslint-disable-line max-len
	assert.equal( info, tc.INFO, 'INFO' );
	assertArrayClose( toArray( A ), tc.A, 1e-14, 'A' );
	assertArrayClose( toArray( d ), tc.D, 1e-14, 'D' );
	assertArrayClose( toArray( TAUQ ), tc.TAUQ, 1e-14, 'TAUQ' );
	assertArrayClose( toArray( TAUP ), tc.TAUP, 1e-14, 'TAUP' );
});

test( 'dgebrd: M=0 quick return', function t() {
	var TAUQ;
	var TAUP;
	var WORK;
	var info;
	var A;
	var d;
	var e;

	A = new Float64Array( 1 );
	d = new Float64Array( 1 );
	e = new Float64Array( 1 );
	TAUQ = new Float64Array( 1 );
	TAUP = new Float64Array( 1 );
	WORK = new Float64Array( 1 );
	info = dgebrd( 0, 3, A, 1, 1, 0, d, 1, 0, e, 1, 0, TAUQ, 1, 0, TAUP, 1, 0, WORK, 1, 0, 1 ); // eslint-disable-line max-len
	assert.equal( info, 0, 'INFO' );
});

test( 'dgebrd: N=0 quick return', function t() {
	var TAUQ;
	var TAUP;
	var WORK;
	var info;
	var A;
	var d;
	var e;

	A = new Float64Array( 1 );
	d = new Float64Array( 1 );
	e = new Float64Array( 1 );
	TAUQ = new Float64Array( 1 );
	TAUP = new Float64Array( 1 );
	WORK = new Float64Array( 1 );
	info = dgebrd( 3, 0, A, 1, 1, 0, d, 1, 0, e, 1, 0, TAUQ, 1, 0, TAUP, 1, 0, WORK, 1, 0, 1 ); // eslint-disable-line max-len
	assert.equal( info, 0, 'INFO' );
});

test( 'dgebrd: 35x33 upper bidiagonal (blocked path, M > N)', function t() {
	var minmn;
	var TAUQ;
	var TAUP;
	var WORK;
	var info;
	var tc;
	var M;
	var N;
	var A;
	var d;
	var e;
	var i;
	var j;

	tc = upper_35x33;
	M = 35;
	N = 33;
	minmn = Math.min( M, N );
	A = new Float64Array( M * N );
	d = new Float64Array( minmn );
	e = new Float64Array( minmn - 1 );
	TAUQ = new Float64Array( minmn );
	TAUP = new Float64Array( minmn );
	WORK = new Float64Array( ( M + N ) * 32 + 100 );
	for ( j = 0; j < N; j++ ) {
		for ( i = 0; i < M; i++ ) {
			if ( i === j ) {
				A[ j * M + i ] = ( i + 1 ) + ( j + 1 ) + 10 + Math.sin( ( i + 1 ) + 2 * ( j + 1 ) ); // eslint-disable-line max-len
			} else {
				A[ j * M + i ] = Math.sin( ( i + 1 ) + 2 * ( j + 1 ) );
			}
		}
	}
	info = dgebrd( M, N, A, 1, M, 0, d, 1, 0, e, 1, 0, TAUQ, 1, 0, TAUP, 1, 0, WORK, 1, 0, WORK.length ); // eslint-disable-line max-len
	assert.equal( info, tc.INFO, 'INFO' );
	assertArrayClose( toArray( d ), tc.D, 1e-10, 'D' );
	assertArrayClose( toArray( e ), tc.E, 1e-10, 'E' );
	assertArrayClose( toArray( TAUQ ), tc.TAUQ, 1e-10, 'TAUQ' );
	assertArrayClose( toArray( TAUP ), tc.TAUP, 1e-10, 'TAUP' );
});

test( 'dgebrd: 33x35 lower bidiagonal (blocked path, M < N)', function t() {
	var minmn;
	var TAUQ;
	var TAUP;
	var WORK;
	var info;
	var tc;
	var M;
	var N;
	var A;
	var d;
	var e;
	var i;
	var j;

	tc = lower_33x35;
	M = 33;
	N = 35;
	minmn = Math.min( M, N );
	A = new Float64Array( M * N );
	d = new Float64Array( minmn );
	e = new Float64Array( minmn - 1 );
	TAUQ = new Float64Array( minmn );
	TAUP = new Float64Array( minmn );
	WORK = new Float64Array( ( M + N ) * 32 + 100 );
	for ( j = 0; j < N; j++ ) {
		for ( i = 0; i < M; i++ ) {
			if ( i === j ) {
				A[ j * M + i ] = ( i + 1 ) + ( j + 1 ) + 10 + Math.sin( ( i + 1 ) + 2 * ( j + 1 ) ); // eslint-disable-line max-len
			} else {
				A[ j * M + i ] = Math.sin( ( i + 1 ) + 2 * ( j + 1 ) );
			}
		}
	}
	info = dgebrd( M, N, A, 1, M, 0, d, 1, 0, e, 1, 0, TAUQ, 1, 0, TAUP, 1, 0, WORK, 1, 0, WORK.length ); // eslint-disable-line max-len
	assert.equal( info, tc.INFO, 'INFO' );
	assertArrayClose( toArray( d ), tc.D, 1e-10, 'D' );
	assertArrayClose( toArray( e ), tc.E, 1e-10, 'E' );
	assertArrayClose( toArray( TAUQ ), tc.TAUQ, 1e-10, 'TAUQ' );
	assertArrayClose( toArray( TAUP ), tc.TAUP, 1e-10, 'TAUP' );
});

test( 'dgebrd: 35x33 with limited workspace (falls back to unblocked)', function t() { // eslint-disable-line max-len
	var minmn;
	var TAUQ;
	var TAUP;
	var WORK;
	var info;
	var tc;
	var M;
	var N;
	var A;
	var d;
	var e;
	var i;
	var j;

	tc = upper_35x33;
	M = 35;
	N = 33;
	minmn = Math.min( M, N );
	A = new Float64Array( M * N );
	d = new Float64Array( minmn );
	e = new Float64Array( minmn - 1 );
	TAUQ = new Float64Array( minmn );
	TAUP = new Float64Array( minmn );
	WORK = new Float64Array( 100 );
	for ( j = 0; j < N; j++ ) {
		for ( i = 0; i < M; i++ ) {
			if ( i === j ) {
				A[ j * M + i ] = ( i + 1 ) + ( j + 1 ) + 10 + Math.sin( ( i + 1 ) + 2 * ( j + 1 ) ); // eslint-disable-line max-len
			} else {
				A[ j * M + i ] = Math.sin( ( i + 1 ) + 2 * ( j + 1 ) );
			}
		}
	}
	info = dgebrd( M, N, A, 1, M, 0, d, 1, 0, e, 1, 0, TAUQ, 1, 0, TAUP, 1, 0, WORK, 1, 0, 100 ); // eslint-disable-line max-len
	assert.equal( info, tc.INFO, 'INFO' );
	assertArrayClose( toArray( d ), tc.D, 1e-10, 'D' );
	assertArrayClose( toArray( e ), tc.E, 1e-10, 'E' );
	assertArrayClose( toArray( TAUQ ), tc.TAUQ, 1e-10, 'TAUQ' );
	assertArrayClose( toArray( TAUP ), tc.TAUP, 1e-10, 'TAUP' );
});

test( 'dgebrd: 35x33 with partially limited workspace (reduced NB)', function t() { // eslint-disable-line max-len
	var minmn;
	var lwork;
	var TAUQ;
	var TAUP;
	var WORK;
	var info;
	var tc;
	var M;
	var N;
	var A;
	var d;
	var e;
	var i;
	var j;

	tc = upper_35x33;
	M = 35;
	N = 33;
	minmn = Math.min( M, N );
	A = new Float64Array( M * N );
	d = new Float64Array( minmn );
	e = new Float64Array( minmn - 1 );
	TAUQ = new Float64Array( minmn );
	TAUP = new Float64Array( minmn );
	lwork = ( M + N ) * 4;
	WORK = new Float64Array( lwork );
	for ( j = 0; j < N; j++ ) {
		for ( i = 0; i < M; i++ ) {
			if ( i === j ) {
				A[ j * M + i ] = ( i + 1 ) + ( j + 1 ) + 10 + Math.sin( ( i + 1 ) + 2 * ( j + 1 ) ); // eslint-disable-line max-len
			} else {
				A[ j * M + i ] = Math.sin( ( i + 1 ) + 2 * ( j + 1 ) );
			}
		}
	}
	info = dgebrd( M, N, A, 1, M, 0, d, 1, 0, e, 1, 0, TAUQ, 1, 0, TAUP, 1, 0, WORK, 1, 0, lwork ); // eslint-disable-line max-len
	assert.equal( info, tc.INFO, 'INFO' );
	assertArrayClose( toArray( d ), tc.D, 1e-10, 'D' );
	assertArrayClose( toArray( e ), tc.E, 1e-10, 'E' );
	assertArrayClose( toArray( TAUQ ), tc.TAUQ, 1e-10, 'TAUQ' );
	assertArrayClose( toArray( TAUP ), tc.TAUP, 1e-10, 'TAUP' );
});

