/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import zgebal from './../lib/ndarray.js';

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
* Build a column-major Complex128Array from interleaved re/im column data.
*
* @param {number} N - matrix order
* @param {number} LDA - leading dimension (in complex elements)
* @param {Array<Array<number>>} cols - array of column data, each is interleaved [re0,im0,re1,im1,...] of length 2*N
* @returns {Complex128Array} column-major matrix with LDA rows
*/
function buildComplexMatrix( N, LDA, cols ) {
	var out = new Complex128Array( LDA * cols.length );
	var col;
	var ov = reinterpret( out, 0 );
	var i;
	var j;
	for ( j = 0; j < cols.length; j++ ) {
		col = cols[ j ];
		for ( i = 0; i < N; i++ ) {
			ov[ ( j * LDA + i ) * 2 ] = col[ i * 2 ];
			ov[ ( j * LDA + i ) * 2 + 1 ] = col[ i * 2 + 1 ];
		}
	}
	return out;
}

/**
* Extract column j (0-based) as interleaved Float64 array of length 2*N.
*/
function extractColumn( A, N, LDA, j ) {
	var out = [];
	var av = reinterpret( A, 0 );
	var i;
	for ( i = 0; i < N; i++ ) {
		out.push( av[ ( j * LDA + i ) * 2 ] );
		out.push( av[ ( j * LDA + i ) * 2 + 1 ] );
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

test( 'zgebal: n0 - N=0 quick return', function t() {
	var result;
	var SCALE;
	var A;

	A = new Complex128Array( 0 );
	SCALE = new Float64Array( 0 );
	result = zgebal( 'both', 0, A, 1, 1, 0, SCALE, 1, 0 );
	assert.equal( result.info, 0, 'info' );
	assert.equal( result.ilo, 1, 'ilo' );
	assert.equal( result.ihi, 0, 'ihi' );
});

test( 'zgebal: n1 - N=1', function t() {
	var result;
	var SCALE;
	var tc;
	var av;
	var A;

	tc = n1;
	A = new Complex128Array( 1 );
	av = reinterpret( A, 0 );
	av[ 0 ] = 5.0;
	av[ 1 ] = 3.0;
	SCALE = new Float64Array( 1 );
	result = zgebal( 'both', 1, A, 1, 1, 0, SCALE, 1, 0 );
	assert.equal( result.info, tc.info, 'info' );
	assert.equal( result.ilo, tc.ilo, 'ilo' );
	assert.equal( result.ihi, tc.ihi, 'ihi' );
	assertArrayClose( toArray( SCALE ), tc.scale, 1e-14, 'scale' );
	assertArrayClose( toArray( av ).slice( 0, 2 ), tc.A, 1e-14, 'A' );
});

test( 'zgebal: job_n - JOB=N no balancing', function t() {
	var result;
	var SCALE;
	var tc;
	var A;

	tc = job_n;
	A = buildComplexMatrix( 3, 3, [
		[ 1.0, 0.5, 4.0, 2.0, 7.0, 0.0 ],
		[ 2.0, 1.0, 5.0, 0.0, 8.0, 3.0 ],
		[ 3.0, 0.0, 6.0, 1.5, 9.0, 0.5 ]
	]);
	SCALE = new Float64Array( 3 );
	result = zgebal( 'none', 3, A, 1, 3, 0, SCALE, 1, 0 );
	assert.equal( result.info, tc.info, 'info' );
	assert.equal( result.ilo, tc.ilo, 'ilo' );
	assert.equal( result.ihi, tc.ihi, 'ihi' );
	assertArrayClose( toArray( SCALE ), tc.scale, 1e-14, 'scale' );
});

test( 'zgebal: job_p - JOB=P permute only', function t() {
	var result;
	var SCALE;
	var tc;
	var A;

	tc = job_p;
	A = buildComplexMatrix( 4, 4, [
		[ 1.0, 0.5, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0 ],
		[ 2.0, 1.0, 5.0, 2.0, 8.0, 1.0, 0.0, 0.0 ],
		[ 3.0, 0.0, 6.0, 0.0, 9.0, 0.5, 0.0, 0.0 ],
		[ 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 4.0, 3.0 ]
	]);
	SCALE = new Float64Array( 4 );
	result = zgebal( 'permute', 4, A, 1, 4, 0, SCALE, 1, 0 );
	assert.equal( result.info, tc.info, 'info' );
	assert.equal( result.ilo, tc.ilo, 'ilo' );
	assert.equal( result.ihi, tc.ihi, 'ihi' );
	assertArrayClose( toArray( SCALE ), tc.scale, 1e-14, 'scale' );
	assertArrayClose( extractColumn( A, 4, 4, 0 ), tc.A1, 1e-14, 'A col 1' );
	assertArrayClose( extractColumn( A, 4, 4, 1 ), tc.A2, 1e-14, 'A col 2' );
	assertArrayClose( extractColumn( A, 4, 4, 2 ), tc.A3, 1e-14, 'A col 3' );
	assertArrayClose( extractColumn( A, 4, 4, 3 ), tc.A4, 1e-14, 'A col 4' );
});

test( 'zgebal: job_s - JOB=S scale only', function t() {
	var result;
	var SCALE;
	var tc;
	var A;

	tc = job_s;
	A = buildComplexMatrix( 3, 3, [
		[ 1.0, 0.5, 1000.0, 500.0, 0.0, 0.0 ],
		[ 0.0, 0.0, 1.0, 0.5, 1000.0, 200.0 ],
		[ 0.0, 0.0, 0.0, 0.0, 1.0, 0.5 ]
	]);
	SCALE = new Float64Array( 3 );
	result = zgebal( 'scale', 3, A, 1, 3, 0, SCALE, 1, 0 );
	assert.equal( result.info, tc.info, 'info' );
	assert.equal( result.ilo, tc.ilo, 'ilo' );
	assert.equal( result.ihi, tc.ihi, 'ihi' );
	assertArrayClose( toArray( SCALE ), tc.scale, 1e-14, 'scale' );
	assertArrayClose( extractColumn( A, 3, 3, 0 ), tc.A1, 1e-14, 'A col 1' );
	assertArrayClose( extractColumn( A, 3, 3, 1 ), tc.A2, 1e-14, 'A col 2' );
	assertArrayClose( extractColumn( A, 3, 3, 2 ), tc.A3, 1e-14, 'A col 3' );
});

test( 'zgebal: job_b - JOB=B both permute and scale', function t() {
	var result;
	var SCALE;
	var tc;
	var A;

	tc = job_b;
	A = buildComplexMatrix( 4, 4, [
		[ 1.0, 0.0, 100.0, 50.0, 0.0, 0.0, 0.0, 0.0 ],
		[ 0.0, 0.0, 2.0, 1.0, 0.01, 0.005, 0.0, 0.0 ],
		[ 0.0, 0.0, 300.0, 100.0, 3.0, 0.5, 0.0, 0.0 ],
		[ 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 4.0, 2.0 ]
	]);
	SCALE = new Float64Array( 4 );
	result = zgebal( 'both', 4, A, 1, 4, 0, SCALE, 1, 0 );
	assert.equal( result.info, tc.info, 'info' );
	assert.equal( result.ilo, tc.ilo, 'ilo' );
	assert.equal( result.ihi, tc.ihi, 'ihi' );
	assertArrayClose( toArray( SCALE ), tc.scale, 1e-14, 'scale' );
	assertArrayClose( extractColumn( A, 4, 4, 0 ), tc.A1, 1e-14, 'A col 1' );
	assertArrayClose( extractColumn( A, 4, 4, 1 ), tc.A2, 1e-14, 'A col 2' );
	assertArrayClose( extractColumn( A, 4, 4, 2 ), tc.A3, 1e-14, 'A col 3' );
	assertArrayClose( extractColumn( A, 4, 4, 3 ), tc.A4, 1e-14, 'A col 4' );
});

test( 'zgebal: diagonal - already balanced matrix', function t() {
	var result;
	var SCALE;
	var tc;
	var A;

	tc = diagonal;
	A = buildComplexMatrix( 3, 3, [
		[ 2.0, 1.0, 0.0, 0.0, 0.0, 0.0 ],
		[ 0.0, 0.0, 3.0, 2.0, 0.0, 0.0 ],
		[ 0.0, 0.0, 0.0, 0.0, 5.0, 0.5 ]
	]);
	SCALE = new Float64Array( 3 );
	result = zgebal( 'both', 3, A, 1, 3, 0, SCALE, 1, 0 );
	assert.equal( result.info, tc.info, 'info' );
	assert.equal( result.ilo, tc.ilo, 'ilo' );
	assert.equal( result.ihi, tc.ihi, 'ihi' );
	assertArrayClose( toArray( SCALE ), tc.scale, 1e-14, 'scale' );
});

test( 'zgebal: perm_and_scale - 5x5 with permutations on both ends', function t() { // eslint-disable-line max-len
	var result;
	var SCALE;
	var tc;
	var A;

	tc = perm_and_scale;
	A = buildComplexMatrix( 5, 5, [
		[ 1.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0 ],
		[ 0.0, 0.0, 2.0, 1.0, 0.001, 0.0005, 0.0, 0.0, 0.0, 0.0 ],
		[ 0.0, 0.0, 1000.0, 500.0, 3.0, 1.0, 0.002, 0.001, 0.0, 0.0 ],
		[ 0.0, 0.0, 0.0, 0.0, 500.0, 250.0, 4.0, 2.0, 0.0, 0.0 ],
		[ 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 5.0, 0.0 ]
	]);
	SCALE = new Float64Array( 5 );
	result = zgebal( 'both', 5, A, 1, 5, 0, SCALE, 1, 0 );
	assert.equal( result.info, tc.info, 'info' );
	assert.equal( result.ilo, tc.ilo, 'ilo' );
	assert.equal( result.ihi, tc.ihi, 'ihi' );
	assertArrayClose( toArray( SCALE ), tc.scale, 1e-14, 'scale' );
	assertArrayClose( extractColumn( A, 5, 5, 0 ), tc.A1, 1e-14, 'A col 1' );
	assertArrayClose( extractColumn( A, 5, 5, 1 ), tc.A2, 1e-14, 'A col 2' );
	assertArrayClose( extractColumn( A, 5, 5, 2 ), tc.A3, 1e-14, 'A col 3' );
	assertArrayClose( extractColumn( A, 5, 5, 3 ), tc.A4, 1e-14, 'A col 4' );
	assertArrayClose( extractColumn( A, 5, 5, 4 ), tc.A5, 1e-14, 'A col 5' );
});

test( 'zgebal: col_isolation - JOB=P with column isolation', function t() {
	var result;
	var SCALE;
	var tc;
	var A;

	tc = col_isolation;
	A = buildComplexMatrix( 4, 4, [
		[ 7.0, 1.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0 ],
		[ 1.0, 0.5, 4.0, 2.0, 6.0, 1.0, 0.0, 0.0 ],
		[ 2.0, 0.0, 5.0, 0.0, 8.0, 0.5, 0.0, 0.0 ],
		[ 3.0, 1.0, 0.0, 0.0, 0.0, 0.0, 9.0, 3.0 ]
	]);
	SCALE = new Float64Array( 4 );
	result = zgebal( 'permute', 4, A, 1, 4, 0, SCALE, 1, 0 );
	assert.equal( result.info, tc.info, 'info' );
	assert.equal( result.ilo, tc.ilo, 'ilo' );
	assert.equal( result.ihi, tc.ihi, 'ihi' );
	assertArrayClose( toArray( SCALE ), tc.scale, 1e-14, 'scale' );
	assertArrayClose( extractColumn( A, 4, 4, 0 ), tc.A1, 1e-14, 'A col 1' );
	assertArrayClose( extractColumn( A, 4, 4, 1 ), tc.A2, 1e-14, 'A col 2' );
	assertArrayClose( extractColumn( A, 4, 4, 2 ), tc.A3, 1e-14, 'A col 3' );
	assertArrayClose( extractColumn( A, 4, 4, 3 ), tc.A4, 1e-14, 'A col 4' );
});
