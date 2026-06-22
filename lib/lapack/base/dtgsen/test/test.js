/* eslint-disable max-len, max-lines-per-function, max-statements, max-lines, no-restricted-syntax, stdlib/first-unit-test */


// MODULES //

import test from 'node:test';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import Uint8Array from '@stdlib/array/uint8/lib/index.js';
import dtgsen from './../lib/base.js';


// FIXTURES //

var fixtureDir = path.join( import.meta.dirname, '..', '..', '..', '..', '..', 'test', 'fixtures' ); // eslint-disable-line max-len
var lines = readFileSync( path.join( fixtureDir, 'dtgsen.jsonl' ), 'utf8' ).trim().split( '\n' ); // eslint-disable-line node/no-sync
var fixture = lines.map( function parse( line ) {
	return JSON.parse( line );
} );


// FUNCTIONS //

/**
* Returns a test case from the fixture data.
*
* @private
* @param {string} name - test case name
* @returns {*} result
*/
function findCase( name ) {
	return fixture.find( function find( t ) { return t.name === name;
	} );
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
* Creates a column-major N-by-N identity matrix.
*/
function eye( N ) {
	var out = new Float64Array( N * N );
	var i;
	for ( i = 0; i < N; i++ ) {
		out[ i + i * N ] = 1.0;
	}
	return out;
}

/**
* Extracts N values from a Float64Array starting at offset with stride.
*/
function extractArray( arr, offset, stride, n ) {
	var out = [];
	var i;
	for ( i = 0; i < n; i++ ) {
		out.push( arr[ offset + i * stride ] );
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

test( 'dtgsen: ijob0_select13 - reorder only, select eigenvalues 1 and 3', function t() { // eslint-disable-line max-len
	var ALPHAR;
	var ALPHAI;
	var SELECT;
	var result;
	var IWORK;
	var WORK;
	var BETA;
	var DIF;
	var tc;
	var pl;
	var pr;
	var A;
	var B;
	var M;
	var N;
	var Q;
	var Z;

	tc = findCase( 'ijob0_select13' );
	N = 4;
	A = new Float64Array( N * N );
	A[ 0 + 0 * N ] = 1.0;
	A[ 0 + 1 * N ] = 0.5;
	A[ 0 + 2 * N ] = 0.3;
	A[ 0 + 3 * N ] = 0.2;
	A[ 1 + 1 * N ] = 2.0;
	A[ 1 + 2 * N ] = 0.4;
	A[ 1 + 3 * N ] = 0.1;
	A[ 2 + 2 * N ] = 3.0;
	A[ 2 + 3 * N ] = 0.6;
	A[ 3 + 3 * N ] = 4.0;
	B = new Float64Array( N * N );
	B[ 0 + 0 * N ] = 1.0;
	B[ 0 + 1 * N ] = 0.2;
	B[ 0 + 2 * N ] = 0.1;
	B[ 0 + 3 * N ] = 0.05;
	B[ 1 + 1 * N ] = 1.5;
	B[ 1 + 2 * N ] = 0.3;
	B[ 1 + 3 * N ] = 0.15;
	B[ 2 + 2 * N ] = 2.0;
	B[ 2 + 3 * N ] = 0.4;
	B[ 3 + 3 * N ] = 2.5;
	Q = eye( N );
	Z = eye( N );
	SELECT = new Uint8Array( [ 1, 0, 1, 0 ] );
	ALPHAR = new Float64Array( N );
	ALPHAI = new Float64Array( N );
	BETA = new Float64Array( N );
	M = new Int32Array( 1 );
	pl = new Float64Array( 1 );
	pr = new Float64Array( 1 );
	DIF = new Float64Array( 2 );
	WORK = new Float64Array( 500 );
	IWORK = new Int32Array( 500 );
	result = dtgsen( 0, true, true, SELECT, 1, 0, N, A, 1, N, 0, B, 1, N, 0, ALPHAR, 1, 0, ALPHAI, 1, 0, BETA, 1, 0, Q, 1, N, 0, Z, 1, N, 0, M, pl, pr, DIF, 1, 0, WORK, 1, 0, 500, IWORK, 1, 0, 500 ); // eslint-disable-line max-len
	assert.equal( result, tc.info, 'info' );
	assert.equal( M[ 0 ], tc.M, 'M' );
	assertArrayClose( toArray( A ), tc.A, 1e-13, 'A' );
	assertArrayClose( toArray( B ), tc.B, 1e-13, 'B' );
	assertArrayClose( toArray( Q ), tc.Q, 1e-13, 'Q' );
	assertArrayClose( toArray( Z ), tc.Z, 1e-13, 'Z' );
	assertArrayClose( toArray( ALPHAR ).slice( 0, N ), tc.ALPHAR, 1e-13, 'ALPHAR' ); // eslint-disable-line max-len
	assertArrayClose( toArray( ALPHAI ).slice( 0, N ), tc.ALPHAI, 1e-13, 'ALPHAI' ); // eslint-disable-line max-len
	assertArrayClose( toArray( BETA ).slice( 0, N ), tc.BETA, 1e-13, 'BETA' );
});

test( 'dtgsen: ijob0_complex_pair - reorder with 2x2 block', function t() {
	var ALPHAR;
	var ALPHAI;
	var SELECT;
	var result;
	var IWORK;
	var WORK;
	var BETA;
	var DIF;
	var tc;
	var pl;
	var pr;
	var A;
	var B;
	var M;
	var N;
	var Q;
	var Z;

	tc = findCase( 'ijob0_complex_pair' );
	N = 4;
	A = new Float64Array( N * N );
	A[ 0 + 0 * N ] = 1.0;
	A[ 0 + 1 * N ] = 0.5;
	A[ 0 + 2 * N ] = 0.3;
	A[ 0 + 3 * N ] = 0.2;
	A[ 1 + 1 * N ] = 2.0;
	A[ 1 + 2 * N ] = 0.4;
	A[ 1 + 3 * N ] = 0.1;
	A[ 2 + 2 * N ] = 4.0;
	A[ 2 + 3 * N ] = 1.5;
	A[ 3 + 2 * N ] = -1.5;
	A[ 3 + 3 * N ] = 4.0;
	B = new Float64Array( N * N );
	B[ 0 + 0 * N ] = 1.0;
	B[ 0 + 1 * N ] = 0.2;
	B[ 0 + 2 * N ] = 0.1;
	B[ 0 + 3 * N ] = 0.05;
	B[ 1 + 1 * N ] = 1.5;
	B[ 1 + 2 * N ] = 0.3;
	B[ 1 + 3 * N ] = 0.15;
	B[ 2 + 2 * N ] = 2.0;
	B[ 2 + 3 * N ] = 0.4;
	B[ 3 + 3 * N ] = 2.5;
	Q = eye( N );
	Z = eye( N );
	SELECT = new Uint8Array( [ 0, 0, 1, 1 ] );
	ALPHAR = new Float64Array( N );
	ALPHAI = new Float64Array( N );
	BETA = new Float64Array( N );
	M = new Int32Array( 1 );
	pl = new Float64Array( 1 );
	pr = new Float64Array( 1 );
	DIF = new Float64Array( 2 );
	WORK = new Float64Array( 500 );
	IWORK = new Int32Array( 500 );
	result = dtgsen( 0, true, true, SELECT, 1, 0, N, A, 1, N, 0, B, 1, N, 0, ALPHAR, 1, 0, ALPHAI, 1, 0, BETA, 1, 0, Q, 1, N, 0, Z, 1, N, 0, M, pl, pr, DIF, 1, 0, WORK, 1, 0, 500, IWORK, 1, 0, 500 ); // eslint-disable-line max-len
	assert.equal( result, tc.info, 'info' );
	assert.equal( M[ 0 ], tc.M, 'M' );
	assertArrayClose( toArray( A ), tc.A, 1e-13, 'A' );
	assertArrayClose( toArray( B ), tc.B, 1e-13, 'B' );
	assertArrayClose( toArray( Q ), tc.Q, 1e-13, 'Q' );
	assertArrayClose( toArray( Z ), tc.Z, 1e-13, 'Z' );
	assertArrayClose( toArray( ALPHAR ).slice( 0, N ), tc.ALPHAR, 1e-13, 'ALPHAR' ); // eslint-disable-line max-len
	assertArrayClose( toArray( ALPHAI ).slice( 0, N ), tc.ALPHAI, 1e-13, 'ALPHAI' ); // eslint-disable-line max-len
	assertArrayClose( toArray( BETA ).slice( 0, N ), tc.BETA, 1e-13, 'BETA' );
});

test( 'dtgsen: ijob1_pl_pr - compute PL and PR', function t() {
	var ALPHAR;
	var ALPHAI;
	var SELECT;
	var result;
	var IWORK;
	var WORK;
	var BETA;
	var DIF;
	var tc;
	var pl;
	var pr;
	var A;
	var B;
	var M;
	var N;
	var Q;
	var Z;

	tc = findCase( 'ijob1_pl_pr' );
	N = 4;
	A = new Float64Array( N * N );
	A[ 0 + 0 * N ] = 1.0;
	A[ 0 + 1 * N ] = 0.5;
	A[ 0 + 2 * N ] = 0.3;
	A[ 0 + 3 * N ] = 0.2;
	A[ 1 + 1 * N ] = 2.0;
	A[ 1 + 2 * N ] = 0.4;
	A[ 1 + 3 * N ] = 0.1;
	A[ 2 + 2 * N ] = 3.0;
	A[ 2 + 3 * N ] = 0.6;
	A[ 3 + 3 * N ] = 4.0;
	B = new Float64Array( N * N );
	B[ 0 + 0 * N ] = 1.0;
	B[ 0 + 1 * N ] = 0.2;
	B[ 0 + 2 * N ] = 0.1;
	B[ 0 + 3 * N ] = 0.05;
	B[ 1 + 1 * N ] = 1.5;
	B[ 1 + 2 * N ] = 0.3;
	B[ 1 + 3 * N ] = 0.15;
	B[ 2 + 2 * N ] = 2.0;
	B[ 2 + 3 * N ] = 0.4;
	B[ 3 + 3 * N ] = 2.5;
	Q = eye( N );
	Z = eye( N );
	SELECT = new Uint8Array( [ 1, 1, 0, 0 ] );
	ALPHAR = new Float64Array( N );
	ALPHAI = new Float64Array( N );
	BETA = new Float64Array( N );
	M = new Int32Array( 1 );
	pl = new Float64Array( 1 );
	pr = new Float64Array( 1 );
	DIF = new Float64Array( 2 );
	WORK = new Float64Array( 500 );
	IWORK = new Int32Array( 500 );
	result = dtgsen( 1, true, true, SELECT, 1, 0, N, A, 1, N, 0, B, 1, N, 0, ALPHAR, 1, 0, ALPHAI, 1, 0, BETA, 1, 0, Q, 1, N, 0, Z, 1, N, 0, M, pl, pr, DIF, 1, 0, WORK, 1, 0, 500, IWORK, 1, 0, 500 ); // eslint-disable-line max-len
	assert.equal( result, tc.info, 'info' );
	assert.equal( M[ 0 ], tc.M, 'M' );
	assertClose( pl[ 0 ], tc.PL, 1e-13, 'PL' );
	assertClose( pr[ 0 ], tc.PR, 1e-13, 'PR' );
	assertArrayClose( toArray( A ), tc.A, 1e-13, 'A' );
	assertArrayClose( toArray( B ), tc.B, 1e-13, 'B' );
	assertArrayClose( toArray( ALPHAR ).slice( 0, N ), tc.ALPHAR, 1e-13, 'ALPHAR' ); // eslint-disable-line max-len
	assertArrayClose( toArray( ALPHAI ).slice( 0, N ), tc.ALPHAI, 1e-13, 'ALPHAI' ); // eslint-disable-line max-len
	assertArrayClose( toArray( BETA ).slice( 0, N ), tc.BETA, 1e-13, 'BETA' );
});

test( 'dtgsen: ijob4_dif_frobenius - compute PL, PR, DIF via Frobenius', function t() { // eslint-disable-line max-len
	var ALPHAR;
	var ALPHAI;
	var SELECT;
	var result;
	var IWORK;
	var WORK;
	var BETA;
	var DIF;
	var tc;
	var pl;
	var pr;
	var A;
	var B;
	var M;
	var N;
	var Q;
	var Z;

	tc = findCase( 'ijob4_dif_frobenius' );
	N = 4;
	A = new Float64Array( N * N );
	A[ 0 + 0 * N ] = 1.0;
	A[ 0 + 1 * N ] = 0.5;
	A[ 0 + 2 * N ] = 0.3;
	A[ 0 + 3 * N ] = 0.2;
	A[ 1 + 1 * N ] = 2.0;
	A[ 1 + 2 * N ] = 0.4;
	A[ 1 + 3 * N ] = 0.1;
	A[ 2 + 2 * N ] = 3.0;
	A[ 2 + 3 * N ] = 0.6;
	A[ 3 + 3 * N ] = 4.0;
	B = new Float64Array( N * N );
	B[ 0 + 0 * N ] = 1.0;
	B[ 0 + 1 * N ] = 0.2;
	B[ 0 + 2 * N ] = 0.1;
	B[ 0 + 3 * N ] = 0.05;
	B[ 1 + 1 * N ] = 1.5;
	B[ 1 + 2 * N ] = 0.3;
	B[ 1 + 3 * N ] = 0.15;
	B[ 2 + 2 * N ] = 2.0;
	B[ 2 + 3 * N ] = 0.4;
	B[ 3 + 3 * N ] = 2.5;
	Q = eye( N );
	Z = eye( N );
	SELECT = new Uint8Array( [ 1, 1, 0, 0 ] );
	ALPHAR = new Float64Array( N );
	ALPHAI = new Float64Array( N );
	BETA = new Float64Array( N );
	M = new Int32Array( 1 );
	pl = new Float64Array( 1 );
	pr = new Float64Array( 1 );
	DIF = new Float64Array( 2 );
	WORK = new Float64Array( 500 );
	IWORK = new Int32Array( 500 );
	result = dtgsen( 4, true, true, SELECT, 1, 0, N, A, 1, N, 0, B, 1, N, 0, ALPHAR, 1, 0, ALPHAI, 1, 0, BETA, 1, 0, Q, 1, N, 0, Z, 1, N, 0, M, pl, pr, DIF, 1, 0, WORK, 1, 0, 500, IWORK, 1, 0, 500 ); // eslint-disable-line max-len
	assert.equal( result, tc.info, 'info' );
	assert.equal( M[ 0 ], tc.M, 'M' );
	assertClose( pl[ 0 ], tc.PL, 1e-13, 'PL' );
	assertClose( pr[ 0 ], tc.PR, 1e-13, 'PR' );
	assertArrayClose( toArray( DIF ), tc.DIF, 1e-13, 'DIF' );
	assertArrayClose( toArray( A ), tc.A, 1e-13, 'A' );
	assertArrayClose( toArray( B ), tc.B, 1e-13, 'B' );
	assertArrayClose( toArray( ALPHAR ).slice( 0, N ), tc.ALPHAR, 1e-13, 'ALPHAR' ); // eslint-disable-line max-len
	assertArrayClose( toArray( ALPHAI ).slice( 0, N ), tc.ALPHAI, 1e-13, 'ALPHAI' ); // eslint-disable-line max-len
	assertArrayClose( toArray( BETA ).slice( 0, N ), tc.BETA, 1e-13, 'BETA' );
});

test( 'dtgsen: ijob5_dif_onenorm - compute PL, PR, DIF via one-norm', function t() { // eslint-disable-line max-len
	var ALPHAR;
	var ALPHAI;
	var SELECT;
	var result;
	var IWORK;
	var WORK;
	var BETA;
	var DIF;
	var tc;
	var pl;
	var pr;
	var A;
	var B;
	var M;
	var N;
	var Q;
	var Z;

	tc = findCase( 'ijob5_dif_onenorm' );
	N = 4;
	A = new Float64Array( N * N );
	A[ 0 + 0 * N ] = 1.0;
	A[ 0 + 1 * N ] = 0.5;
	A[ 0 + 2 * N ] = 0.3;
	A[ 0 + 3 * N ] = 0.2;
	A[ 1 + 1 * N ] = 2.0;
	A[ 1 + 2 * N ] = 0.4;
	A[ 1 + 3 * N ] = 0.1;
	A[ 2 + 2 * N ] = 3.0;
	A[ 2 + 3 * N ] = 0.6;
	A[ 3 + 3 * N ] = 4.0;
	B = new Float64Array( N * N );
	B[ 0 + 0 * N ] = 1.0;
	B[ 0 + 1 * N ] = 0.2;
	B[ 0 + 2 * N ] = 0.1;
	B[ 0 + 3 * N ] = 0.05;
	B[ 1 + 1 * N ] = 1.5;
	B[ 1 + 2 * N ] = 0.3;
	B[ 1 + 3 * N ] = 0.15;
	B[ 2 + 2 * N ] = 2.0;
	B[ 2 + 3 * N ] = 0.4;
	B[ 3 + 3 * N ] = 2.5;
	Q = eye( N );
	Z = eye( N );
	SELECT = new Uint8Array( [ 1, 1, 0, 0 ] );
	ALPHAR = new Float64Array( N );
	ALPHAI = new Float64Array( N );
	BETA = new Float64Array( N );
	M = new Int32Array( 1 );
	pl = new Float64Array( 1 );
	pr = new Float64Array( 1 );
	DIF = new Float64Array( 2 );
	WORK = new Float64Array( 500 );
	IWORK = new Int32Array( 500 );
	result = dtgsen( 5, true, true, SELECT, 1, 0, N, A, 1, N, 0, B, 1, N, 0, ALPHAR, 1, 0, ALPHAI, 1, 0, BETA, 1, 0, Q, 1, N, 0, Z, 1, N, 0, M, pl, pr, DIF, 1, 0, WORK, 1, 0, 500, IWORK, 1, 0, 500 ); // eslint-disable-line max-len
	assert.equal( result, tc.info, 'info' );
	assert.equal( M[ 0 ], tc.M, 'M' );
	assertClose( pl[ 0 ], tc.PL, 1e-13, 'PL' );
	assertClose( pr[ 0 ], tc.PR, 1e-13, 'PR' );
	assertArrayClose( toArray( DIF ), tc.DIF, 1e-13, 'DIF' );
	assertArrayClose( toArray( A ), tc.A, 1e-13, 'A' );
	assertArrayClose( toArray( B ), tc.B, 1e-13, 'B' );
	assertArrayClose( toArray( ALPHAR ).slice( 0, N ), tc.ALPHAR, 1e-13, 'ALPHAR' ); // eslint-disable-line max-len
	assertArrayClose( toArray( ALPHAI ).slice( 0, N ), tc.ALPHAI, 1e-13, 'ALPHAI' ); // eslint-disable-line max-len
	assertArrayClose( toArray( BETA ).slice( 0, N ), tc.BETA, 1e-13, 'BETA' );
});

test( 'dtgsen: all_selected - M=N quick return with DIF', function t() {
	var ALPHAR;
	var ALPHAI;
	var SELECT;
	var result;
	var IWORK;
	var WORK;
	var BETA;
	var DIF;
	var tc;
	var pl;
	var pr;
	var A;
	var B;
	var M;
	var N;
	var Q;
	var Z;

	tc = findCase( 'all_selected' );
	N = 3;
	A = new Float64Array( N * N );
	A[ 0 + 0 * N ] = 1.0;
	A[ 0 + 1 * N ] = 0.5;
	A[ 0 + 2 * N ] = 0.3;
	A[ 1 + 1 * N ] = 2.0;
	A[ 1 + 2 * N ] = 0.4;
	A[ 2 + 2 * N ] = 3.0;
	B = new Float64Array( N * N );
	B[ 0 + 0 * N ] = 1.0;
	B[ 0 + 1 * N ] = 0.2;
	B[ 0 + 2 * N ] = 0.1;
	B[ 1 + 1 * N ] = 1.5;
	B[ 1 + 2 * N ] = 0.3;
	B[ 2 + 2 * N ] = 2.0;
	Q = eye( N );
	Z = eye( N );
	SELECT = new Uint8Array( [ 1, 1, 1 ] );
	ALPHAR = new Float64Array( N );
	ALPHAI = new Float64Array( N );
	BETA = new Float64Array( N );
	M = new Int32Array( 1 );
	pl = new Float64Array( 1 );
	pr = new Float64Array( 1 );
	DIF = new Float64Array( 2 );
	WORK = new Float64Array( 500 );
	IWORK = new Int32Array( 500 );
	result = dtgsen( 4, true, true, SELECT, 1, 0, N, A, 1, N, 0, B, 1, N, 0, ALPHAR, 1, 0, ALPHAI, 1, 0, BETA, 1, 0, Q, 1, N, 0, Z, 1, N, 0, M, pl, pr, DIF, 1, 0, WORK, 1, 0, 500, IWORK, 1, 0, 500 ); // eslint-disable-line max-len
	assert.equal( result, tc.info, 'info' );
	assert.equal( M[ 0 ], tc.M, 'M' );
	assertClose( pl[ 0 ], tc.PL, 1e-13, 'PL' );
	assertClose( pr[ 0 ], tc.PR, 1e-13, 'PR' );
	assertArrayClose( toArray( DIF ), tc.DIF, 1e-13, 'DIF' );
	assertArrayClose( toArray( ALPHAR ).slice( 0, N ), tc.ALPHAR, 1e-13, 'ALPHAR' ); // eslint-disable-line max-len
	assertArrayClose( toArray( ALPHAI ).slice( 0, N ), tc.ALPHAI, 1e-13, 'ALPHAI' ); // eslint-disable-line max-len
	assertArrayClose( toArray( BETA ).slice( 0, N ), tc.BETA, 1e-13, 'BETA' );
});

test( 'dtgsen: none_selected - M=0 quick return', function t() {
	var ALPHAR;
	var ALPHAI;
	var SELECT;
	var result;
	var IWORK;
	var WORK;
	var BETA;
	var DIF;
	var tc;
	var pl;
	var pr;
	var A;
	var B;
	var M;
	var N;
	var Q;
	var Z;

	tc = findCase( 'none_selected' );
	N = 3;
	A = new Float64Array( N * N );
	A[ 0 + 0 * N ] = 1.0;
	A[ 0 + 1 * N ] = 0.5;
	A[ 0 + 2 * N ] = 0.3;
	A[ 1 + 1 * N ] = 2.0;
	A[ 1 + 2 * N ] = 0.4;
	A[ 2 + 2 * N ] = 3.0;
	B = new Float64Array( N * N );
	B[ 0 + 0 * N ] = 1.0;
	B[ 0 + 1 * N ] = 0.2;
	B[ 0 + 2 * N ] = 0.1;
	B[ 1 + 1 * N ] = 1.5;
	B[ 1 + 2 * N ] = 0.3;
	B[ 2 + 2 * N ] = 2.0;
	Q = eye( N );
	Z = eye( N );
	SELECT = new Uint8Array( [ 0, 0, 0 ] );
	ALPHAR = new Float64Array( N );
	ALPHAI = new Float64Array( N );
	BETA = new Float64Array( N );
	M = new Int32Array( 1 );
	pl = new Float64Array( 1 );
	pr = new Float64Array( 1 );
	DIF = new Float64Array( 2 );
	WORK = new Float64Array( 500 );
	IWORK = new Int32Array( 500 );
	result = dtgsen( 1, true, true, SELECT, 1, 0, N, A, 1, N, 0, B, 1, N, 0, ALPHAR, 1, 0, ALPHAI, 1, 0, BETA, 1, 0, Q, 1, N, 0, Z, 1, N, 0, M, pl, pr, DIF, 1, 0, WORK, 1, 0, 500, IWORK, 1, 0, 500 ); // eslint-disable-line max-len
	assert.equal( result, tc.info, 'info' );
	assert.equal( M[ 0 ], tc.M, 'M' );
	assertClose( pl[ 0 ], tc.PL, 1e-13, 'PL' );
	assertClose( pr[ 0 ], tc.PR, 1e-13, 'PR' );
	assertArrayClose( toArray( ALPHAR ).slice( 0, N ), tc.ALPHAR, 1e-13, 'ALPHAR' ); // eslint-disable-line max-len
	assertArrayClose( toArray( ALPHAI ).slice( 0, N ), tc.ALPHAI, 1e-13, 'ALPHAI' ); // eslint-disable-line max-len
	assertArrayClose( toArray( BETA ).slice( 0, N ), tc.BETA, 1e-13, 'BETA' );
});

test( 'dtgsen: n1_trivial - N=1', function t() {
	var ALPHAR;
	var ALPHAI;
	var SELECT;
	var result;
	var IWORK;
	var WORK;
	var BETA;
	var DIF;
	var pl;
	var pr;
	var tc;
	var A;
	var B;
	var M;
	var Q;
	var Z;

	tc = findCase( 'n1_trivial' );
	A = new Float64Array( [ 5.0 ] );
	B = new Float64Array( [ 2.0 ] );
	Q = new Float64Array( [ 1.0 ] );
	Z = new Float64Array( [ 1.0 ] );
	SELECT = new Uint8Array( [ 1 ] );
	ALPHAR = new Float64Array( 1 );
	ALPHAI = new Float64Array( 1 );
	BETA = new Float64Array( 1 );
	M = new Int32Array( 1 );
	pl = new Float64Array( 1 );
	pr = new Float64Array( 1 );
	DIF = new Float64Array( 2 );
	WORK = new Float64Array( 500 );
	IWORK = new Int32Array( 500 );
	result = dtgsen( 0, true, true, SELECT, 1, 0, 1, A, 1, 1, 0, B, 1, 1, 0, ALPHAR, 1, 0, ALPHAI, 1, 0, BETA, 1, 0, Q, 1, 1, 0, Z, 1, 1, 0, M, pl, pr, DIF, 1, 0, WORK, 1, 0, 500, IWORK, 1, 0, 500 ); // eslint-disable-line max-len
	assert.equal( result, tc.info, 'info' );
	assert.equal( M[ 0 ], tc.M, 'M' );
	assertArrayClose( toArray( ALPHAR ), tc.ALPHAR, 1e-13, 'ALPHAR' );
	assertArrayClose( toArray( ALPHAI ), tc.ALPHAI, 1e-13, 'ALPHAI' );
	assertArrayClose( toArray( BETA ), tc.BETA, 1e-13, 'BETA' );
});

test( 'dtgsen: select_behind_complex - select eigenvalues behind 2x2 block', function t() { // eslint-disable-line max-len
	var ALPHAR;
	var ALPHAI;
	var SELECT;
	var result;
	var IWORK;
	var WORK;
	var BETA;
	var DIF;
	var tc;
	var pl;
	var pr;
	var A;
	var B;
	var M;
	var N;
	var Q;
	var Z;

	tc = findCase( 'select_behind_complex' );
	N = 4;
	A = new Float64Array( N * N );
	A[ 0 + 0 * N ] = 4.0;
	A[ 0 + 1 * N ] = 1.5;
	A[ 0 + 2 * N ] = 0.3;
	A[ 0 + 3 * N ] = 0.2;
	A[ 1 + 0 * N ] = -1.5;
	A[ 1 + 1 * N ] = 4.0;
	A[ 1 + 2 * N ] = 0.4;
	A[ 1 + 3 * N ] = 0.1;
	A[ 2 + 2 * N ] = 1.0;
	A[ 2 + 3 * N ] = 0.6;
	A[ 3 + 3 * N ] = 2.0;
	B = new Float64Array( N * N );
	B[ 0 + 0 * N ] = 2.0;
	B[ 0 + 1 * N ] = 0.4;
	B[ 0 + 2 * N ] = 0.1;
	B[ 0 + 3 * N ] = 0.05;
	B[ 1 + 1 * N ] = 2.5;
	B[ 1 + 2 * N ] = 0.3;
	B[ 1 + 3 * N ] = 0.15;
	B[ 2 + 2 * N ] = 1.0;
	B[ 2 + 3 * N ] = 0.2;
	B[ 3 + 3 * N ] = 1.5;
	Q = eye( N );
	Z = eye( N );
	SELECT = new Uint8Array( [ 0, 0, 1, 1 ] );
	ALPHAR = new Float64Array( N );
	ALPHAI = new Float64Array( N );
	BETA = new Float64Array( N );
	M = new Int32Array( 1 );
	pl = new Float64Array( 1 );
	pr = new Float64Array( 1 );
	DIF = new Float64Array( 2 );
	WORK = new Float64Array( 500 );
	IWORK = new Int32Array( 500 );
	result = dtgsen( 0, true, true, SELECT, 1, 0, N, A, 1, N, 0, B, 1, N, 0, ALPHAR, 1, 0, ALPHAI, 1, 0, BETA, 1, 0, Q, 1, N, 0, Z, 1, N, 0, M, pl, pr, DIF, 1, 0, WORK, 1, 0, 500, IWORK, 1, 0, 500 ); // eslint-disable-line max-len
	assert.equal( result, tc.info, 'info' );
	assert.equal( M[ 0 ], tc.M, 'M' );
	assertArrayClose( toArray( A ), tc.A, 1e-13, 'A' );
	assertArrayClose( toArray( B ), tc.B, 1e-13, 'B' );
	assertArrayClose( toArray( ALPHAR ).slice( 0, N ), tc.ALPHAR, 1e-13, 'ALPHAR' ); // eslint-disable-line max-len
	assertArrayClose( toArray( ALPHAI ).slice( 0, N ), tc.ALPHAI, 1e-13, 'ALPHAI' ); // eslint-disable-line max-len
	assertArrayClose( toArray( BETA ).slice( 0, N ), tc.BETA, 1e-13, 'BETA' );
});

test( 'dtgsen: ijob2_dif_frobenius - compute DIF via Frobenius (IDIFJB)', function t() { // eslint-disable-line max-len
	var ALPHAR;
	var ALPHAI;
	var SELECT;
	var result;
	var IWORK;
	var WORK;
	var BETA;
	var DIF;
	var tc;
	var pl;
	var pr;
	var A;
	var B;
	var M;
	var N;
	var Q;
	var Z;

	tc = findCase( 'ijob2_dif_frobenius' );
	N = 4;
	A = new Float64Array( N * N );
	A[ 0 + 0 * N ] = 1.0;
	A[ 0 + 1 * N ] = 0.5;
	A[ 0 + 2 * N ] = 0.3;
	A[ 0 + 3 * N ] = 0.2;
	A[ 1 + 1 * N ] = 2.0;
	A[ 1 + 2 * N ] = 0.4;
	A[ 1 + 3 * N ] = 0.1;
	A[ 2 + 2 * N ] = 3.0;
	A[ 2 + 3 * N ] = 0.6;
	A[ 3 + 3 * N ] = 4.0;
	B = new Float64Array( N * N );
	B[ 0 + 0 * N ] = 1.0;
	B[ 0 + 1 * N ] = 0.2;
	B[ 0 + 2 * N ] = 0.1;
	B[ 0 + 3 * N ] = 0.05;
	B[ 1 + 1 * N ] = 1.5;
	B[ 1 + 2 * N ] = 0.3;
	B[ 1 + 3 * N ] = 0.15;
	B[ 2 + 2 * N ] = 2.0;
	B[ 2 + 3 * N ] = 0.4;
	B[ 3 + 3 * N ] = 2.5;
	Q = eye( N );
	Z = eye( N );
	SELECT = new Uint8Array( [ 1, 0, 0, 0 ] );
	ALPHAR = new Float64Array( N );
	ALPHAI = new Float64Array( N );
	BETA = new Float64Array( N );
	M = new Int32Array( 1 );
	pl = new Float64Array( 1 );
	pr = new Float64Array( 1 );
	DIF = new Float64Array( 2 );
	WORK = new Float64Array( 500 );
	IWORK = new Int32Array( 500 );
	result = dtgsen( 2, true, true, SELECT, 1, 0, N, A, 1, N, 0, B, 1, N, 0, ALPHAR, 1, 0, ALPHAI, 1, 0, BETA, 1, 0, Q, 1, N, 0, Z, 1, N, 0, M, pl, pr, DIF, 1, 0, WORK, 1, 0, 500, IWORK, 1, 0, 500 ); // eslint-disable-line max-len
	assert.equal( result, tc.info, 'info' );
	assert.equal( M[ 0 ], tc.M, 'M' );
	assertArrayClose( toArray( DIF ), tc.DIF, 1e-13, 'DIF' );
	assertArrayClose( toArray( ALPHAR ).slice( 0, N ), tc.ALPHAR, 1e-13, 'ALPHAR' ); // eslint-disable-line max-len
	assertArrayClose( toArray( ALPHAI ).slice( 0, N ), tc.ALPHAI, 1e-13, 'ALPHAI' ); // eslint-disable-line max-len
	assertArrayClose( toArray( BETA ).slice( 0, N ), tc.BETA, 1e-13, 'BETA' );
});

test( 'dtgsen: ijob3_onenorm_plpr - compute DIF via one-norm + PL/PR', function t() { // eslint-disable-line max-len
	var ALPHAR;
	var ALPHAI;
	var SELECT;
	var result;
	var IWORK;
	var WORK;
	var BETA;
	var DIF;
	var tc;
	var pl;
	var pr;
	var A;
	var B;
	var M;
	var N;
	var Q;
	var Z;

	tc = findCase( 'ijob3_onenorm_plpr' );
	N = 4;
	A = new Float64Array( N * N );
	A[ 0 + 0 * N ] = 1.0;
	A[ 0 + 1 * N ] = 0.5;
	A[ 0 + 2 * N ] = 0.3;
	A[ 0 + 3 * N ] = 0.2;
	A[ 1 + 1 * N ] = 2.0;
	A[ 1 + 2 * N ] = 0.4;
	A[ 1 + 3 * N ] = 0.1;
	A[ 2 + 2 * N ] = 3.0;
	A[ 2 + 3 * N ] = 0.6;
	A[ 3 + 3 * N ] = 4.0;
	B = new Float64Array( N * N );
	B[ 0 + 0 * N ] = 1.0;
	B[ 0 + 1 * N ] = 0.2;
	B[ 0 + 2 * N ] = 0.1;
	B[ 0 + 3 * N ] = 0.05;
	B[ 1 + 1 * N ] = 1.5;
	B[ 1 + 2 * N ] = 0.3;
	B[ 1 + 3 * N ] = 0.15;
	B[ 2 + 2 * N ] = 2.0;
	B[ 2 + 3 * N ] = 0.4;
	B[ 3 + 3 * N ] = 2.5;
	Q = eye( N );
	Z = eye( N );
	SELECT = new Uint8Array( [ 1, 1, 0, 0 ] );
	ALPHAR = new Float64Array( N );
	ALPHAI = new Float64Array( N );
	BETA = new Float64Array( N );
	M = new Int32Array( 1 );
	pl = new Float64Array( 1 );
	pr = new Float64Array( 1 );
	DIF = new Float64Array( 2 );
	WORK = new Float64Array( 500 );
	IWORK = new Int32Array( 500 );
	result = dtgsen( 3, true, true, SELECT, 1, 0, N, A, 1, N, 0, B, 1, N, 0, ALPHAR, 1, 0, ALPHAI, 1, 0, BETA, 1, 0, Q, 1, N, 0, Z, 1, N, 0, M, pl, pr, DIF, 1, 0, WORK, 1, 0, 500, IWORK, 1, 0, 500 ); // eslint-disable-line max-len
	assert.equal( result, tc.info, 'info' );
	assert.equal( M[ 0 ], tc.M, 'M' );
	assertClose( pl[ 0 ], tc.PL, 1e-13, 'PL' );
	assertClose( pr[ 0 ], tc.PR, 1e-13, 'PR' );
	assertArrayClose( toArray( DIF ), tc.DIF, 1e-13, 'DIF' );
	assertArrayClose( toArray( ALPHAR ).slice( 0, N ), tc.ALPHAR, 1e-13, 'ALPHAR' ); // eslint-disable-line max-len
	assertArrayClose( toArray( ALPHAI ).slice( 0, N ), tc.ALPHAI, 1e-13, 'ALPHAI' ); // eslint-disable-line max-len
	assertArrayClose( toArray( BETA ).slice( 0, N ), tc.BETA, 1e-13, 'BETA' );
});

test( 'dtgsen: negative_b_diag - sign flip path', function t() {
	var ALPHAR;
	var ALPHAI;
	var SELECT;
	var result;
	var IWORK;
	var WORK;
	var BETA;
	var DIF;
	var tc;
	var pl;
	var pr;
	var A;
	var B;
	var M;
	var N;
	var Q;
	var Z;

	tc = findCase( 'negative_b_diag' );
	N = 3;
	A = new Float64Array( N * N );
	A[ 0 + 0 * N ] = 2.0;
	A[ 0 + 1 * N ] = 0.5;
	A[ 0 + 2 * N ] = 0.3;
	A[ 1 + 1 * N ] = 3.0;
	A[ 1 + 2 * N ] = 0.4;
	A[ 2 + 2 * N ] = 1.0;
	B = new Float64Array( N * N );
	B[ 0 + 0 * N ] = -1.0;
	B[ 0 + 1 * N ] = 0.2;
	B[ 0 + 2 * N ] = 0.1;
	B[ 1 + 1 * N ] = 1.5;
	B[ 1 + 2 * N ] = 0.3;
	B[ 2 + 2 * N ] = -2.0;
	Q = eye( N );
	Z = eye( N );
	SELECT = new Uint8Array( [ 1, 0, 0 ] );
	ALPHAR = new Float64Array( N );
	ALPHAI = new Float64Array( N );
	BETA = new Float64Array( N );
	M = new Int32Array( 1 );
	pl = new Float64Array( 1 );
	pr = new Float64Array( 1 );
	DIF = new Float64Array( 2 );
	WORK = new Float64Array( 500 );
	IWORK = new Int32Array( 500 );
	result = dtgsen( 0, true, true, SELECT, 1, 0, N, A, 1, N, 0, B, 1, N, 0, ALPHAR, 1, 0, ALPHAI, 1, 0, BETA, 1, 0, Q, 1, N, 0, Z, 1, N, 0, M, pl, pr, DIF, 1, 0, WORK, 1, 0, 500, IWORK, 1, 0, 500 ); // eslint-disable-line max-len
	assert.equal( result, tc.info, 'info' );
	assert.equal( M[ 0 ], tc.M, 'M' );
	assertArrayClose( toArray( A ), tc.A, 1e-13, 'A' );
	assertArrayClose( toArray( B ), tc.B, 1e-13, 'B' );
	assertArrayClose( toArray( Q ), tc.Q, 1e-13, 'Q' );
	assertArrayClose( toArray( ALPHAR ).slice( 0, N ), tc.ALPHAR, 1e-13, 'ALPHAR' ); // eslint-disable-line max-len
	assertArrayClose( toArray( ALPHAI ).slice( 0, N ), tc.ALPHAI, 1e-13, 'ALPHAI' ); // eslint-disable-line max-len
	assertArrayClose( toArray( BETA ).slice( 0, N ), tc.BETA, 1e-13, 'BETA' );
});

test( 'dtgsen: error returns for invalid parameters', function t() {
	var SELECT;
	var ALPHAR;
	var ALPHAI;
	var result;
	var IWORK;
	var WORK;
	var BETA;
	var DIF;
	var pl;
	var pr;
	var A;
	var B;
	var M;
	var Q;
	var Z;

	A = new Float64Array( 4 );
	B = new Float64Array( 4 );
	Q = new Float64Array( 4 );
	Z = new Float64Array( 4 );
	SELECT = new Uint8Array( 2 );
	ALPHAR = new Float64Array( 2 );
	ALPHAI = new Float64Array( 2 );
	BETA = new Float64Array( 2 );
	M = new Int32Array( 1 );
	pl = new Float64Array( 1 );
	pr = new Float64Array( 1 );
	DIF = new Float64Array( 2 );
	WORK = new Float64Array( 500 );
	IWORK = new Int32Array( 500 );
	result = dtgsen( -1, true, true, SELECT, 1, 0, 2, A, 1, 2, 0, B, 1, 2, 0, ALPHAR, 1, 0, ALPHAI, 1, 0, BETA, 1, 0, Q, 1, 2, 0, Z, 1, 2, 0, M, pl, pr, DIF, 1, 0, WORK, 1, 0, 500, IWORK, 1, 0, 500 ); // eslint-disable-line max-len
	assert.equal( result, -1, 'invalid ijob' );
	result = dtgsen( 6, true, true, SELECT, 1, 0, 2, A, 1, 2, 0, B, 1, 2, 0, ALPHAR, 1, 0, ALPHAI, 1, 0, BETA, 1, 0, Q, 1, 2, 0, Z, 1, 2, 0, M, pl, pr, DIF, 1, 0, WORK, 1, 0, 500, IWORK, 1, 0, 500 ); // eslint-disable-line max-len
	assert.equal( result, -1, 'invalid ijob > 5' );
	result = dtgsen( 0, true, true, SELECT, 1, 0, -1, A, 1, 2, 0, B, 1, 2, 0, ALPHAR, 1, 0, ALPHAI, 1, 0, BETA, 1, 0, Q, 1, 2, 0, Z, 1, 2, 0, M, pl, pr, DIF, 1, 0, WORK, 1, 0, 500, IWORK, 1, 0, 500 ); // eslint-disable-line max-len
	assert.equal( result, -5, 'negative N' );
});
