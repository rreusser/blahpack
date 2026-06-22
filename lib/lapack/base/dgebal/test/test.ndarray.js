/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dgebal from './../lib/ndarray.js';

// FIXTURES //

import n1 from './fixtures/n1.json' with { type: 'json' };
import job_n from './fixtures/job_n.json' with { type: 'json' };
import job_p from './fixtures/job_p.json' with { type: 'json' };
import job_s from './fixtures/job_s.json' with { type: 'json' };
import job_b from './fixtures/job_b.json' with { type: 'json' };
import diagonal from './fixtures/diagonal.json' with { type: 'json' };
import perm_and_scale from './fixtures/perm_and_scale.json' with { type: 'json' };
import col_isolation from './fixtures/col_isolation.json' with { type: 'json' };

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
* Build a column-major Float64Array from column arrays.
*
* @param {number} N - matrix order
* @param {Array<Array<number>>} cols - array of column arrays (each length N)
* @returns {Float64Array} column-major matrix
*/
function buildMatrix( N, cols ) {
	var out = new Float64Array( N * N );
	var i;
	var j;
	for ( j = 0; j < cols.length; j++ ) {
		for ( i = 0; i < N; i++ ) {
			out[ i + ( j * N ) ] = cols[ j ][ i ];
		}
	}
	return out;
}

/**
* Extract column j (0-based) from a column-major N x N matrix.
*
* @param {Float64Array} A - matrix
* @param {number} N - order
* @param {number} j - column index (0-based)
* @returns {Array<number>} column values
*/
function getCol( A, N, j ) {
	var out = [];
	var i;
	for ( i = 0; i < N; i++ ) {
		out.push( A[ i + ( j * N ) ] );
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
	var out = [];
	var i;
	for ( i = 0; i < arr.length; i++ ) {
		out.push( arr[ i ] );
	}
	return out;
}

// TESTS //

test( 'dgebal: n0 (N=0 quick return)', function t() {
	var result;
	var SCALE;
	var A;

	SCALE = new Float64Array( 1 );
	A = new Float64Array( 1 );
	result = dgebal( 'both', 0, A, 1, 0, 0, SCALE, 1, 0 );
	assert.equal( result.info, 0, 'info' );
	assert.equal( result.ilo, 1, 'ilo' );
	assert.equal( result.ihi, 0, 'ihi' );
});

test( 'dgebal: n1 (N=1)', function t() {
	var result;
	var SCALE;
	var tc;
	var A;

	tc = n1;
	A = new Float64Array( [ 5.0 ] );
	SCALE = new Float64Array( 1 );
	result = dgebal( 'both', 1, A, 1, 1, 0, SCALE, 1, 0 );
	assert.equal( result.info, tc.info, 'info' );
	assert.equal( result.ilo, tc.ilo, 'ilo' );
	assert.equal( result.ihi, tc.ihi, 'ihi' );
	assertArrayClose( toArray( SCALE ), tc.scale, 1e-14, 'scale' );
});

test( 'dgebal: job_n (JOB=N, no balancing)', function t() {
	var result;
	var SCALE;
	var tc;
	var N;
	var A;

	tc = job_n;
	N = 3;
	A = buildMatrix( N, [
		[ 1, 4, 7 ],
		[ 2, 5, 8 ],
		[ 3, 6, 9 ]
	]);
	SCALE = new Float64Array( N );
	result = dgebal( 'none', N, A, 1, N, 0, SCALE, 1, 0 );
	assert.equal( result.info, tc.info, 'info' );
	assert.equal( result.ilo, tc.ilo, 'ilo' );
	assert.equal( result.ihi, tc.ihi, 'ihi' );
	assertArrayClose( toArray( SCALE ), tc.scale, 1e-14, 'scale' );
});

test( 'dgebal: job_p (JOB=P, permute only)', function t() {
	var result;
	var SCALE;
	var tc;
	var N;
	var A;

	tc = job_p;
	N = 4;
	A = buildMatrix( N, [
		[ 1, 0, 0, 0 ],  // col 1
		[ 2, 5, 8, 0 ],  // col 2
		[ 3, 6, 9, 0 ],  // col 3
		[ 0, 0, 0, 4 ]   // col 4
	]);
	SCALE = new Float64Array( N );
	result = dgebal( 'permute', N, A, 1, N, 0, SCALE, 1, 0 );
	assert.equal( result.info, tc.info, 'info' );
	assert.equal( result.ilo, tc.ilo, 'ilo' );
	assert.equal( result.ihi, tc.ihi, 'ihi' );
	assertArrayClose( toArray( SCALE ), tc.scale, 1e-14, 'scale' );
	assertArrayClose( getCol( A, N, 0 ), tc.A, 1e-14, 'A col1' );
	assertArrayClose( getCol( A, N, 1 ), tc.A2, 1e-14, 'A col2' );
	assertArrayClose( getCol( A, N, 2 ), tc.A3, 1e-14, 'A col3' );
	assertArrayClose( getCol( A, N, 3 ), tc.A4, 1e-14, 'A col4' );
});

test( 'dgebal: job_s (JOB=S, scale only)', function t() {
	var result;
	var SCALE;
	var tc;
	var N;
	var A;

	tc = job_s;
	N = 3;
	A = buildMatrix( N, [
		[ 1, 1000, 0 ],      // col 1
		[ 0, 1, 1000 ],      // col 2
		[ 0, 0, 1 ]          // col 3
	]);
	SCALE = new Float64Array( N );
	result = dgebal( 'scale', N, A, 1, N, 0, SCALE, 1, 0 );
	assert.equal( result.info, tc.info, 'info' );
	assert.equal( result.ilo, tc.ilo, 'ilo' );
	assert.equal( result.ihi, tc.ihi, 'ihi' );
	assertArrayClose( toArray( SCALE ), tc.scale, 1e-14, 'scale' );
	assertArrayClose( getCol( A, N, 0 ), tc.A1, 1e-14, 'A col1' );
	assertArrayClose( getCol( A, N, 1 ), tc.A2, 1e-14, 'A col2' );
	assertArrayClose( getCol( A, N, 2 ), tc.A3, 1e-14, 'A col3' );
});

test( 'dgebal: job_b (JOB=B, both permute and scale)', function t() {
	var result;
	var SCALE;
	var tc;
	var N;
	var A;

	tc = job_b;
	N = 4;
	A = buildMatrix( N, [
		[ 1, 100, 0, 0 ],       // col 1
		[ 0, 2, 0.01, 0 ],      // col 2
		[ 0, 300, 3, 0 ],       // col 3
		[ 0, 0, 0, 4 ]          // col 4
	]);
	SCALE = new Float64Array( N );
	result = dgebal( 'both', N, A, 1, N, 0, SCALE, 1, 0 );
	assert.equal( result.info, tc.info, 'info' );
	assert.equal( result.ilo, tc.ilo, 'ilo' );
	assert.equal( result.ihi, tc.ihi, 'ihi' );
	assertArrayClose( toArray( SCALE ), tc.scale, 1e-14, 'scale' );
	assertArrayClose( getCol( A, N, 0 ), tc.A1, 1e-14, 'A col1' );
	assertArrayClose( getCol( A, N, 1 ), tc.A2, 1e-14, 'A col2' );
	assertArrayClose( getCol( A, N, 2 ), tc.A3, 1e-14, 'A col3' );
	assertArrayClose( getCol( A, N, 3 ), tc.A4, 1e-14, 'A col4' );
});

test( 'dgebal: diagonal (already balanced diagonal matrix)', function t() {
	var result;
	var SCALE;
	var tc;
	var N;
	var A;

	tc = diagonal;
	N = 3;
	A = buildMatrix( N, [
		[ 2, 0, 0 ],
		[ 0, 3, 0 ],
		[ 0, 0, 5 ]
	]);
	SCALE = new Float64Array( N );
	result = dgebal( 'both', N, A, 1, N, 0, SCALE, 1, 0 );
	assert.equal( result.info, tc.info, 'info' );
	assert.equal( result.ilo, tc.ilo, 'ilo' );
	assert.equal( result.ihi, tc.ihi, 'ihi' );
	assertArrayClose( toArray( SCALE ), tc.scale, 1e-14, 'scale' );
});

test( 'dgebal: perm_and_scale (5x5 with permutations on both ends)', function t() { // eslint-disable-line max-len
	var result;
	var SCALE;
	var tc;
	var N;
	var A;

	tc = perm_and_scale;
	N = 5;
	A = buildMatrix( N, [
		[ 1, 0, 0, 0, 0 ],         // col 1
		[ 0, 2, 0.001, 0, 0 ],     // col 2
		[ 0, 1000, 3, 0.002, 0 ],  // col 3
		[ 0, 0, 500, 4, 0 ],       // col 4
		[ 0, 0, 0, 0, 5 ]          // col 5
	]);
	SCALE = new Float64Array( N );
	result = dgebal( 'both', N, A, 1, N, 0, SCALE, 1, 0 );
	assert.equal( result.info, tc.info, 'info' );
	assert.equal( result.ilo, tc.ilo, 'ilo' );
	assert.equal( result.ihi, tc.ihi, 'ihi' );
	assertArrayClose( toArray( SCALE ), tc.scale, 1e-14, 'scale' );
	assertArrayClose( getCol( A, N, 0 ), tc.A1, 1e-14, 'A col1' );
	assertArrayClose( getCol( A, N, 1 ), tc.A2, 1e-14, 'A col2' );
	assertArrayClose( getCol( A, N, 2 ), tc.A3, 1e-14, 'A col3' );
	assertArrayClose( getCol( A, N, 3 ), tc.A4, 1e-14, 'A col4' );
	assertArrayClose( getCol( A, N, 4 ), tc.A5, 1e-14, 'A col5' );
});

test( 'dgebal: col_isolation (JOB=P with column isolation)', function t() {
	var result;
	var SCALE;
	var tc;
	var N;
	var A;

	tc = col_isolation;
	N = 4;
	A = buildMatrix( N, [
		[ 7, 0, 0, 0 ],  // col 1
		[ 1, 4, 6, 0 ],  // col 2
		[ 2, 5, 8, 0 ],  // col 3
		[ 3, 0, 0, 9 ]   // col 4
	]);
	SCALE = new Float64Array( N );
	result = dgebal( 'permute', N, A, 1, N, 0, SCALE, 1, 0 );
	assert.equal( result.info, tc.info, 'info' );
	assert.equal( result.ilo, tc.ilo, 'ilo' );
	assert.equal( result.ihi, tc.ihi, 'ihi' );
	assertArrayClose( toArray( SCALE ), tc.scale, 1e-14, 'scale' );
	assertArrayClose( getCol( A, N, 0 ), tc.A1, 1e-14, 'A col1' );
	assertArrayClose( getCol( A, N, 1 ), tc.A2, 1e-14, 'A col2' );
	assertArrayClose( getCol( A, N, 2 ), tc.A3, 1e-14, 'A col3' );
	assertArrayClose( getCol( A, N, 3 ), tc.A4, 1e-14, 'A col4' );
});
