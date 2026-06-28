/**
* @license Apache-2.0
*
* Copyright (c) 2026 Ricky Reusser.
*
* Derived from the LAPACK 3.12.0 reference implementation (BSD-3-Clause).
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*/

/* eslint-disable node/no-sync */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import zlag2c from './../lib/ndarray.js';


// FIXTURES //

var fixtureDir = path.join( import.meta.dirname, '..', '..', '..', '..', '..', 'test', 'fixtures' );
var fixtureText = readFileSync( path.join( fixtureDir, 'zlag2c.jsonl' ), 'utf8' );
var fixtureLines = fixtureText.split( '\n' );
var FIXTURES = {};

( function parseAll() {
	var line;
	var obj;
	var i;
	for ( i = 0; i < fixtureLines.length; i++ ) {
		line = fixtureLines[ i ];
		if ( line.length === 0 ) {
			continue;
		}
		obj = JSON.parse( line );
		FIXTURES[ obj.name ] = obj;
	}
})();


// FUNCTIONS //

/**
* Asserts that two arrays are elementwise close within a tolerance.
*
* @private
* @param {ArrayLike} actual - actual values
* @param {ArrayLike} expected - expected values
* @param {number} tol - relative tolerance
* @param {string} msg - error message prefix
*/
function assertArrayClose( actual, expected, tol, msg ) {
	var abse;
	var diff;
	var ok;
	var i;
	assert.equal( actual.length, expected.length, msg + ': length mismatch' );
	for ( i = 0; i < expected.length; i++ ) {
		abse = Math.abs( expected[ i ] );
		diff = Math.abs( actual[ i ] - expected[ i ] );
		ok = diff <= ( tol * Math.max( abse, 1 ) );
		assert.ok( ok, msg + '[' + i + ']: expected ' + expected[ i ] + ', got ' + actual[ i ] );
	}
}

/**
* Packs the M-by-N leading submatrix of a Complex128Array with LDSA leading.
* dimension into a flat interleaved [re, im, re, im, ...] JS array.
*
* @private
* @param {Complex128Array} SA - array
* @param {integer} M - rows
* @param {integer} N - cols
* @param {integer} LDSA - leading dimension
* @returns {Array} interleaved packed values
*/
function packedSA( SA, M, N, LDSA ) {
	var view;
	var out;
	var i;
	var j;
	view = reinterpret( SA, 0 );
	out = [];
	for ( j = 0; j < N; j++ ) {
		for ( i = 0; i < M; i++ ) {
			out.push( view[ 2 * ( i + ( j * LDSA ) ) ] );
			out.push( view[ ( 2 * ( i + ( j * LDSA ) ) ) + 1 ] );
		}
	}
	return out;
}


// TESTS //

test( 'zlag2c: basic_3x3', function t() {
	var tc;
	var M;
	var N;
	var LDA;
	var LDSA;
	var A;
	var Av;
	var SA;
	var info;
	var i;
	var j;
	tc = FIXTURES.basic_3x3;
	M = 3;
	N = 3;
	LDA = 4;
	LDSA = 4;
	A = new Complex128Array( LDA * N );
	Av = reinterpret( A, 0 );
	for ( j = 0; j < N; j++ ) {
		for ( i = 0; i < M; i++ ) {
			Av[ 2 * ( i + ( j * LDA ) ) ] = ( i + 1 ) + ( 0.1 * ( j + 1 ) );
			Av[ ( 2 * ( i + ( j * LDA ) ) ) + 1 ] = -( i + 1 ) + ( 0.5 * ( j + 1 ) );
		}
	}
	SA = new Complex128Array( LDSA * N );
	info = zlag2c( M, N, A, 1, LDA, 0, SA, 1, LDSA, 0 );
	assert.equal( info, tc.info, 'info' );
	assertArrayClose( packedSA( SA, M, N, LDSA ), tc.sa, 1e-6, 'sa' );
});

test( 'zlag2c: rect_2x4', function t() {
	var tc;
	var M;
	var N;
	var LDA;
	var LDSA;
	var A;
	var Av;
	var SA;
	var info;
	var i;
	var j;
	tc = FIXTURES.rect_2x4;
	M = 2;
	N = 4;
	LDA = 4;
	LDSA = 4;
	A = new Complex128Array( LDA * N );
	Av = reinterpret( A, 0 );
	for ( j = 0; j < N; j++ ) {
		for ( i = 0; i < M; i++ ) {
			Av[ 2 * ( i + ( j * LDA ) ) ] = 0.5 * ( i + 1 ) * ( j + 1 );
			Av[ ( 2 * ( i + ( j * LDA ) ) ) + 1 ] = 0.25 * ( ( i + 1 ) + ( j + 1 ) );
		}
	}
	SA = new Complex128Array( LDSA * N );
	info = zlag2c( M, N, A, 1, LDA, 0, SA, 1, LDSA, 0 );
	assert.equal( info, tc.info, 'info' );
	assertArrayClose( packedSA( SA, M, N, LDSA ), tc.sa, 1e-6, 'sa' );
});

test( 'zlag2c: rect_4x2', function t() {
	var tc;
	var M;
	var N;
	var LDA;
	var LDSA;
	var A;
	var Av;
	var SA;
	var info;
	var i;
	var j;
	tc = FIXTURES.rect_4x2;
	M = 4;
	N = 2;
	LDA = 4;
	LDSA = 4;
	A = new Complex128Array( LDA * N );
	Av = reinterpret( A, 0 );
	for ( j = 0; j < N; j++ ) {
		for ( i = 0; i < M; i++ ) {
			Av[ 2 * ( i + ( j * LDA ) ) ] = ( i + 1 ) * 0.7;
			Av[ ( 2 * ( i + ( j * LDA ) ) ) + 1 ] = -( j + 1 ) * 1.3;
		}
	}
	SA = new Complex128Array( LDSA * N );
	info = zlag2c( M, N, A, 1, LDA, 0, SA, 1, LDSA, 0 );
	assert.equal( info, tc.info, 'info' );
	assertArrayClose( packedSA( SA, M, N, LDSA ), tc.sa, 1e-6, 'sa' );
});

test( 'zlag2c: m_zero', function t() {
	var tc;
	var A;
	var SA;
	var info;
	tc = FIXTURES.m_zero;
	A = new Complex128Array( 12 );
	SA = new Complex128Array( 12 );
	info = zlag2c( 0, 3, A, 1, 4, 0, SA, 1, 4, 0 );
	assert.equal( info, tc.info, 'info' );
});

test( 'zlag2c: n_zero', function t() {
	var tc;
	var A;
	var SA;
	var info;
	tc = FIXTURES.n_zero;
	A = new Complex128Array( 12 );
	SA = new Complex128Array( 12 );
	info = zlag2c( 3, 0, A, 1, 4, 0, SA, 1, 4, 0 );
	assert.equal( info, tc.info, 'info' );
});

test( 'zlag2c: one_by_one', function t() {
	var tc;
	var A;
	var Av;
	var SA;
	var info;
	tc = FIXTURES.one_by_one;
	A = new Complex128Array( 1 );
	Av = reinterpret( A, 0 );
	Av[ 0 ] = 3.14159265358979;
	Av[ 1 ] = -2.71828182845904;
	SA = new Complex128Array( 1 );
	info = zlag2c( 1, 1, A, 1, 1, 0, SA, 1, 1, 0 );
	assert.equal( info, tc.info, 'info' );
	assertArrayClose( packedSA( SA, 1, 1, 1 ), tc.sa, 1e-6, 'sa' );
});

test( 'zlag2c: overflow_real', function t() {
	var tc;
	var A;
	var v;
	var SA;
	var info;
	tc = FIXTURES.overflow_real;
	A = new Complex128Array( 4 );
	v = reinterpret( A, 0 );
	v[ 0 ] = 1;
	v[ 1 ] = 2;
	v[ 2 ] = 3;
	v[ 3 ] = 4;
	v[ 4 ] = 1e300;
	v[ 5 ] = 0;
	v[ 6 ] = 5;
	v[ 7 ] = 6;
	SA = new Complex128Array( 4 );
	info = zlag2c( 2, 2, A, 1, 2, 0, SA, 1, 2, 0 );
	assert.equal( info, tc.info, 'info' );
});

test( 'zlag2c: overflow_imag', function t() {
	var tc;
	var A;
	var v;
	var SA;
	var info;
	tc = FIXTURES.overflow_imag;
	A = new Complex128Array( 4 );
	v = reinterpret( A, 0 );
	v[ 0 ] = 1;
	v[ 1 ] = 2;
	v[ 2 ] = 3;
	v[ 3 ] = 4;
	v[ 4 ] = 1;
	v[ 5 ] = 1e300;
	v[ 6 ] = 5;
	v[ 7 ] = 6;
	SA = new Complex128Array( 4 );
	info = zlag2c( 2, 2, A, 1, 2, 0, SA, 1, 2, 0 );
	assert.equal( info, tc.info, 'info' );
});

test( 'zlag2c: overflow_neg_real', function t() {
	var tc;
	var A;
	var v;
	var SA;
	var info;
	tc = FIXTURES.overflow_neg_real;
	A = new Complex128Array( 4 );
	v = reinterpret( A, 0 );
	v[ 0 ] = -1e300;
	v[ 1 ] = 0;
	v[ 2 ] = 3;
	v[ 3 ] = 4;
	v[ 4 ] = 1;
	v[ 5 ] = 0;
	v[ 6 ] = 5;
	v[ 7 ] = 6;
	SA = new Complex128Array( 4 );
	info = zlag2c( 2, 2, A, 1, 2, 0, SA, 1, 2, 0 );
	assert.equal( info, tc.info, 'info' );
});

test( 'zlag2c: overflow_neg_imag', function t() {
	var tc;
	var A;
	var v;
	var SA;
	var info;
	tc = FIXTURES.overflow_neg_imag;
	A = new Complex128Array( 4 );
	v = reinterpret( A, 0 );
	v[ 0 ] = 1;
	v[ 1 ] = -1e300;
	v[ 2 ] = 3;
	v[ 3 ] = 4;
	v[ 4 ] = 1;
	v[ 5 ] = 0;
	v[ 6 ] = 5;
	v[ 7 ] = 6;
	SA = new Complex128Array( 4 );
	info = zlag2c( 2, 2, A, 1, 2, 0, SA, 1, 2, 0 );
	assert.equal( info, tc.info, 'info' );
});

test( 'zlag2c: tiny_values', function t() {
	var tc;
	var M;
	var N;
	var LDA;
	var LDSA;
	var A;
	var Av;
	var SA;
	var info;
	var i;
	var j;
	tc = FIXTURES.tiny_values;
	M = 3;
	N = 2;
	LDA = 4;
	LDSA = 4;
	A = new Complex128Array( LDA * N );
	Av = reinterpret( A, 0 );
	for ( j = 0; j < N; j++ ) {
		for ( i = 0; i < M; i++ ) {
			Av[ 2 * ( i + ( j * LDA ) ) ] = 1e-30 * ( i + 1 );
			Av[ ( 2 * ( i + ( j * LDA ) ) ) + 1 ] = 1e-30 * ( j + 1 );
		}
	}
	SA = new Complex128Array( LDSA * N );
	info = zlag2c( M, N, A, 1, LDA, 0, SA, 1, LDSA, 0 );
	assert.equal( info, tc.info, 'info' );
	assertArrayClose( packedSA( SA, M, N, LDSA ), tc.sa, 1e-6, 'sa' );
});

test( 'zlag2c: row-major via transposed strides', function t() {
	var M;
	var N;
	var A;
	var Av;
	var SA;
	var sv;
	var info;
	var expRe;
	var expIm;
	var i;
	var j;
	M = 2;
	N = 3;
	A = new Complex128Array( M * N );
	Av = reinterpret( A, 0 );
	for ( i = 0; i < M; i++ ) {
		for ( j = 0; j < N; j++ ) {
			Av[ 2 * ( ( i * N ) + j ) ] = ( i + 1 ) + ( 0.1 * ( j + 1 ) );
			Av[ ( 2 * ( ( i * N ) + j ) ) + 1 ] = -( j + 1 );
		}
	}
	SA = new Complex128Array( M * N );
	info = zlag2c( M, N, A, N, 1, 0, SA, N, 1, 0 );
	assert.equal( info, 0, 'info' );
	sv = reinterpret( SA, 0 );
	for ( i = 0; i < M; i++ ) {
		for ( j = 0; j < N; j++ ) {
			expRe = Math.fround( ( i + 1 ) + ( 0.1 * ( j + 1 ) ) );
			expIm = Math.fround( -( j + 1 ) );
			assert.equal( sv[ 2 * ( ( i * N ) + j ) ], expRe, 're[' + i + ',' + j + ']' );
			assert.equal( sv[ ( 2 * ( ( i * N ) + j ) ) + 1 ], expIm, 'im[' + i + ',' + j + ']' );
		}
	}
});

test( 'zlag2c: validates M', function t() {
	var A = new Complex128Array( 4 );
	var SA = new Complex128Array( 4 );
	assert.throws( function throwsNegM() {
		zlag2c( -1, 2, A, 1, 2, 0, SA, 1, 2, 0 );
	}, RangeError );
});

test( 'zlag2c: validates N', function t() {
	var A = new Complex128Array( 4 );
	var SA = new Complex128Array( 4 );
	assert.throws( function throwsNegN() {
		zlag2c( 2, -1, A, 1, 2, 0, SA, 1, 2, 0 );
	}, RangeError );
});
