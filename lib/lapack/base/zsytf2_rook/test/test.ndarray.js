/* eslint-disable no-restricted-syntax, stdlib/first-unit-test, max-len, max-lines, node/no-sync */

// MODULES //

import test from 'node:test';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import zsytf2Rook from './../lib/ndarray.js';


// FIXTURES //

var fixtureDir = path.join( import.meta.dirname, '..', '..', '..', '..', '..', 'test', 'fixtures' );
var lines = readFileSync( path.join( fixtureDir, 'zsytf2_rook.jsonl' ), 'utf8' ).trim().split( '\n' );
var fixture = lines.map( function parse( line ) {
	return JSON.parse( line );
});


// FUNCTIONS //

/**
* Find a fixture case by name.
*
* @private
* @param {string} name - case name
* @returns {Object} fixture case
*/
function findCase( name ) {
	return fixture.find( function find( t ) {
		return t.name === name;
	});
}

/**
* Assert that two numbers are approximately equal.
*
* @private
* @param {number} actual - actual value
* @param {number} expected - expected value
* @param {number} tol - tolerance
* @param {string} msg - assertion message
*/
function assertClose( actual, expected, tol, msg ) {
	var relErr = Math.abs( actual - expected ) / Math.max( Math.abs( expected ), 1.0 );
	assert.ok( relErr <= tol, msg + ': expected ' + expected + ', got ' + actual );
}

/**
* Assert that two arrays are element-wise approximately equal.
*
* @private
* @param {Object} actual - actual array
* @param {Array} expected - expected array
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
* Extract an n-by-n submatrix from a Fortran LDA-strided complex output array.
*
* @private
* @param {Array} data - interleaved re/im values with leading dimension `lda`
* @param {integer} n - matrix order
* @param {integer} lda - Fortran leading dimension
* @returns {Array} interleaved re/im for the n-by-n submatrix
*/
function extractSubmatrix( data, n, lda ) {
	var out = [];
	var i;
	var j;
	for ( j = 0; j < n; j++ ) {
		for ( i = 0; i < n; i++ ) {
			out.push( data[ (j * lda * 2) + (i * 2) ] );
			out.push( data[ (j * lda * 2) + (i * 2) + 1 ] );
		}
	}
	return out;
}

/**
* Convert Fortran 1-based IPIV to 0-based JS IPIV.
*
* @private
* @param {Array} fipiv - Fortran IPIV values
* @returns {Array} JS IPIV values
*/
function convertIPIV( fipiv ) {
	var out = [];
	var i;
	for ( i = 0; i < fipiv.length; i++ ) {
		if ( fipiv[ i ] > 0 ) {
			out.push( fipiv[ i ] - 1 );
		} else {
			out.push( fipiv[ i ] );
		}
	}
	return out;
}

/**
* Convert a typed array to a plain array.
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

test( 'zsytf2Rook: upper_4x4', function t() {
	var expected;
	var IPIV;
	var info;
	var Av;
	var tc;
	var A;
	var n;

	tc = findCase( 'upper_4x4' );
	n = 4;
	A = new Complex128Array([
		4,
		1,
		0,
		0,
		0,
		0,
		0,
		0,
		1,
		2,
		5,
		-1,
		0,
		0,
		0,
		0,
		3,
		-1,
		2,
		1,
		7,
		2,
		0,
		0,
		0.5,
		0.5,
		1,
		-2,
		3,
		1,
		6,
		-2
	]);
	IPIV = new Int32Array( n );
	info = zsytf2Rook( 'upper', n, A, 1, n, 0, IPIV, 1, 0 );
	assert.equal( info, tc.info, 'info' );
	expected = extractSubmatrix( tc.A, n, 6 );
	Av = reinterpret( A, 0 );
	assertArrayClose( toArray( Av ), expected, 1e-12, 'A' );
	assert.deepEqual( toArray( IPIV ), convertIPIV( tc.ipiv ), 'ipiv' );
});

test( 'zsytf2Rook: lower_4x4', function t() {
	var expected;
	var IPIV;
	var info;
	var Av;
	var tc;
	var A;
	var n;

	tc = findCase( 'lower_4x4' );
	n = 4;
	A = new Complex128Array([
		4,
		1,
		1,
		2,
		3,
		-1,
		0.5,
		0.5,
		0,
		0,
		5,
		-1,
		2,
		1,
		1,
		-2,
		0,
		0,
		0,
		0,
		7,
		2,
		3,
		1,
		0,
		0,
		0,
		0,
		0,
		0,
		6,
		-2
	]);
	IPIV = new Int32Array( n );
	info = zsytf2Rook( 'lower', n, A, 1, n, 0, IPIV, 1, 0 );
	assert.equal( info, tc.info, 'info' );
	expected = extractSubmatrix( tc.A, n, 6 );
	Av = reinterpret( A, 0 );
	assertArrayClose( toArray( Av ), expected, 1e-12, 'A' );
	assert.deepEqual( toArray( IPIV ), convertIPIV( tc.ipiv ), 'ipiv' );
});

test( 'zsytf2Rook: n0 quick return', function t() {
	var IPIV;
	var info;
	var A;

	A = new Complex128Array( 0 );
	IPIV = new Int32Array( 0 );
	info = zsytf2Rook( 'upper', 0, A, 1, 1, 0, IPIV, 1, 0 );
	assert.equal( info, 0, 'info' );
});

test( 'zsytf2Rook: n1', function t() {
	var IPIV;
	var info;
	var Av;
	var tc;
	var A;

	tc = findCase( 'n1' );
	A = new Complex128Array([ 3.0, 2.0 ]);
	IPIV = new Int32Array( 1 );
	info = zsytf2Rook( 'upper', 1, A, 1, 1, 0, IPIV, 1, 0 );
	assert.equal( info, tc.info, 'info' );
	Av = reinterpret( A, 0 );
	assertArrayClose( toArray( Av ), tc.A, 1e-14, 'A' );
	assert.deepEqual( toArray( IPIV ), convertIPIV( tc.ipiv ), 'ipiv' );
});

test( 'zsytf2Rook: singular_upper', function t() {
	var expected;
	var IPIV;
	var info;
	var Av;
	var tc;
	var A;
	var n;

	tc = findCase( 'singular_upper' );
	n = 3;
	A = new Complex128Array([
		0,
		0,
		0,
		0,
		0,
		0,
		1,
		1,
		3,
		1,
		0,
		0,
		2,
		0,
		1,
		1,
		2,
		-1
	]);
	IPIV = new Int32Array( n );
	info = zsytf2Rook( 'upper', n, A, 1, n, 0, IPIV, 1, 0 );
	assert.equal( info, tc.info, 'info' );
	expected = extractSubmatrix( tc.A, n, 6 );
	Av = reinterpret( A, 0 );
	assertArrayClose( toArray( Av ), expected, 1e-12, 'A' );
	assert.deepEqual( toArray( IPIV ), convertIPIV( tc.ipiv ), 'ipiv' );
});

test( 'zsytf2Rook: lower_6x6', function t() {
	var expected;
	var IPIV;
	var info;
	var Av;
	var tc;
	var A;
	var n;

	tc = findCase( 'lower_6x6' );
	n = 6;
	A = new Complex128Array([
		0.01,
		0,
		5,
		-1,
		1,
		1,
		0.5,
		-0.5,
		2,
		0,
		1,
		-1,
		0,
		0,
		0.02,
		0.01,
		2,
		-1,
		1,
		1,
		1.5,
		-0.5,
		0,
		-3,
		0,
		0,
		0,
		0,
		8,
		1,
		3,
		0,
		0,
		2,
		1,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		7,
		-1,
		1,
		0.5,
		2,
		-2,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		6,
		0.5,
		0.5,
		1,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		5,
		0
	]);
	IPIV = new Int32Array( n );
	info = zsytf2Rook( 'lower', n, A, 1, n, 0, IPIV, 1, 0 );
	assert.equal( info, tc.info, 'info' );
	expected = extractSubmatrix( tc.A, n, 6 );
	Av = reinterpret( A, 0 );
	assertArrayClose( toArray( Av ), expected, 1e-11, 'A' );
	assert.deepEqual( toArray( IPIV ), convertIPIV( tc.ipiv ), 'ipiv' );
});

test( 'zsytf2Rook: upper_6x6', function t() {
	var expected;
	var IPIV;
	var info;
	var Av;
	var tc;
	var A;
	var n;

	tc = findCase( 'upper_6x6' );
	n = 6;
	A = new Complex128Array( 36 );
	Av = reinterpret( A, 0 );
	Av[ 0 ] = 0.01;
	Av[ 1 ] = 0.0;
	Av[ 12 ] = 5.0;
	Av[ 13 ] = -1.0;
	Av[ 14 ] = 0.02;
	Av[ 15 ] = 0.01;
	Av[ 24 ] = 1.0;
	Av[ 25 ] = 1.0;
	Av[ 26 ] = 2.0;
	Av[ 27 ] = -1.0;
	Av[ 28 ] = 8.0;
	Av[ 29 ] = 1.0;
	Av[ 36 ] = 0.5;
	Av[ 37 ] = -0.5;
	Av[ 38 ] = 1.0;
	Av[ 39 ] = 1.0;
	Av[ 40 ] = 3.0;
	Av[ 41 ] = 0.0;
	Av[ 42 ] = 7.0;
	Av[ 43 ] = -1.0;
	Av[ 48 ] = 2.0;
	Av[ 49 ] = 0.0;
	Av[ 50 ] = 1.5;
	Av[ 51 ] = -0.5;
	Av[ 52 ] = 0.0;
	Av[ 53 ] = 2.0;
	Av[ 54 ] = 1.0;
	Av[ 55 ] = 0.5;
	Av[ 56 ] = 6.0;
	Av[ 57 ] = 0.5;
	Av[ 60 ] = 1.0;
	Av[ 61 ] = -1.0;
	Av[ 62 ] = 0.0;
	Av[ 63 ] = -3.0;
	Av[ 64 ] = 1.0;
	Av[ 65 ] = 0.0;
	Av[ 66 ] = 2.0;
	Av[ 67 ] = -2.0;
	Av[ 68 ] = 0.5;
	Av[ 69 ] = 1.0;
	Av[ 70 ] = 5.0;
	Av[ 71 ] = 0.0;
	IPIV = new Int32Array( n );
	info = zsytf2Rook( 'upper', n, A, 1, n, 0, IPIV, 1, 0 );
	assert.equal( info, tc.info, 'info' );
	expected = extractSubmatrix( tc.A, n, 6 );
	Av = reinterpret( A, 0 );
	assertArrayClose( toArray( Av ), expected, 1e-11, 'A' );
	assert.deepEqual( toArray( IPIV ), convertIPIV( tc.ipiv ), 'ipiv' );
});


// SNAPSHOT TESTS //

// Crafted symmetric (NOT Hermitian) matrices designed to exercise rook

// Pivoting paths (2x2 pivots, P!=K rook chase, P!=KK second swap, complex

// 2x2 update with imaginary-dominant divisors).

// Snapshots were captured from the reference JS implementation after it

// Was independently validated against Fortran fixtures above.

/**
* Build a column-major complex symmetric Complex128Array from an [i,j,re,im] entry list.
*
* @private
* @param {NonNegativeInteger} N - matrix order
* @param {Array} entries - entry list
* @returns {Complex128Array} matrix
*/
function buildSym( N, entries ) {
	var A = new Complex128Array( N * N );
	var Av = reinterpret( A, 0 );
	var i;
	var j;
	var k;
	for ( k = 0; k < entries.length; k++ ) {
		i = entries[ k ][ 0 ];
		j = entries[ k ][ 1 ];
		Av[ ( ( j * N ) + i ) * 2 ] = entries[ k ][ 2 ];
		Av[ ( ( ( j * N ) + i ) * 2 ) + 1 ] = entries[ k ][ 3 ];
	}
	return A;
}

test( 'zsytf2Rook: indef_zero_diag_upper_4x4 (forces 2x2 pivot search)', function t() {
	var IPIV;
	var info;
	var Av;
	var A;
	A = buildSym( 4, [
		[ 0, 1, 1, 0 ], [ 0, 2, 2, 0 ], [ 0, 3, 3, 0 ],
		[ 1, 2, 1, 0 ], [ 1, 3, 2, 0 ],
		[ 2, 2, 5, 0 ], [ 2, 3, 1, 0 ],
		[ 3, 3, 4, 0 ]
	]);
	IPIV = new Int32Array( 4 );
	info = zsytf2Rook( 'upper', 4, A, 1, 4, 0, IPIV, 1, 0 );
	assert.equal( info, 0, 'info' );
	assert.deepEqual( toArray( IPIV ), [ 0, 1, 2, 3 ], 'ipiv' );
	Av = reinterpret( A, 0 );
	assertArrayClose( toArray( Av ), [
		-2.2, 0, 0, 0, 0, 0, 0, 0,
		0.6, 0, -1.0526315789473684, 0, 0, 0, 0, 0,
		0.2631578947368421, 0, 0.10526315789473684, 0, 4.75, 0, 0, 0,
		0.75, 0, 0.5, 0, 0.25, 0, 4, 0
	], 1e-12, 'A' );
});

test( 'zsytf2Rook: indef_zero_diag_lower_4x4 (lower rook search)', function t() {
	var IPIV;
	var info;
	var Av;
	var A;
	A = buildSym( 4, [
		[ 1, 0, 1, 0 ], [ 2, 0, 2, 0 ], [ 3, 0, 3, 0 ],
		[ 2, 1, 1, 0 ], [ 3, 1, 2, 0 ],
		[ 2, 2, 5, 0 ], [ 3, 2, 1, 0 ],
		[ 3, 3, 4, 0 ]
	]);
	IPIV = new Int32Array( 4 );
	info = zsytf2Rook( 'lower', 4, A, 1, 4, 0, IPIV, 1, 0 );
	assert.equal( info, 0, 'info' );
	assert.deepEqual( toArray( IPIV ), [ 3, 1, 2, 3 ], 'ipiv' );
	Av = reinterpret( A, 0 );
	assertArrayClose( toArray( Av ), [
		4, 0, 0.5, 0, 0.25, 0, 0.75, 0,
		0, 0, -1, 0, -0.5, 0, 0.5, 0,
		0, 0, 0, 0, 5, 0, 0.2, 0,
		0, 0, 0, 0, 0, 0, -2.2, 0
	], 1e-12, 'A' );
});

test( 'zsytf2Rook: rook_chase_upper_5x5 (P!=K rook chase, 2x2 pivot)', function t() {
	var IPIV;
	var info;
	var Av;
	var A;
	A = buildSym( 5, [
		[ 0, 0, 0.1, 0 ],
		[ 0, 1, 1, 0 ], [ 1, 1, 0.1, 0 ],
		[ 0, 2, 2, 0 ], [ 1, 2, 5, 0 ], [ 2, 2, 0.1, 0 ],
		[ 0, 3, 3, 0 ], [ 1, 3, 10, 0 ], [ 2, 3, 50, 0 ], [ 3, 3, 0.1, 0 ],
		[ 0, 4, 4, 0 ], [ 1, 4, 20, 0 ], [ 2, 4, 100, 0 ], [ 3, 4, 500, 0 ], [ 4, 4, 0.1, 0 ]
	]);
	IPIV = new Int32Array( 5 );
	info = zsytf2Rook( 'upper', 5, A, 1, 5, 0, IPIV, 1, 0 );
	assert.equal( info, 0, 'info' );
	assert.deepEqual( toArray( IPIV ), [ 0, 1, 2, -4, -5 ], 'ipiv' );
	Av = reinterpret( A, 0 );
	assertClose( Av[ 0 ], 1.215767121190106, 1e-12, 'A[0,0]' );
	assertClose( Av[ ( ( 4 * 5 ) + 4 ) * 2 ], 0.1, 1e-12, 'A[4,4]' );
});

test( 'zsytf2Rook: rook_chase_lower_5x5 (P!=K rook chase, 2x2 pivot)', function t() {
	var IPIV;
	var info;
	var Av;
	var A;
	A = buildSym( 5, [
		[ 0, 0, 0.1, 0 ], [ 1, 0, 1, 0 ], [ 2, 0, 2, 0 ], [ 3, 0, 3, 0 ], [ 4, 0, 4, 0 ],
		[ 1, 1, 0.1, 0 ], [ 2, 1, 5, 0 ], [ 3, 1, 10, 0 ], [ 4, 1, 20, 0 ],
		[ 2, 2, 0.1, 0 ], [ 3, 2, 50, 0 ], [ 4, 2, 100, 0 ],
		[ 3, 3, 0.1, 0 ], [ 4, 3, 500, 0 ],
		[ 4, 4, 0.1, 0 ]
	]);
	IPIV = new Int32Array( 5 );
	info = zsytf2Rook( 'lower', 5, A, 1, 5, 0, IPIV, 1, 0 );
	assert.equal( info, 0, 'info' );
	assert.deepEqual( toArray( IPIV ), [ -5, -4, 2, 3, 4 ], 'ipiv' );
	Av = reinterpret( A, 0 );
	assertClose( Av[ 0 ], 0.1, 1e-12, 'A[0,0]' );
	assertClose( Av[ ( ( 4 * 5 ) + 4 ) * 2 ], 1.215767121190106, 1e-12, 'A[4,4]' );
});

test( 'zsytf2Rook: complex_indef_upper_4x4 (complex 2x2 pivots, no conjugation)', function t() {
	var IPIV;
	var info;
	var Av;
	var A;
	A = buildSym( 4, [
		[ 0, 0, 0.001, 0 ],
		[ 0, 1, 1, 0.5 ], [ 1, 1, 0.001, 0 ],
		[ 0, 2, 2, -1 ], [ 1, 2, 3, 2 ], [ 2, 2, 0.001, 0 ],
		[ 0, 3, 4, 1 ], [ 1, 3, 5, -1 ], [ 2, 3, 6, 2 ], [ 3, 3, 0.001, 0 ]
	]);
	IPIV = new Int32Array( 4 );
	info = zsytf2Rook( 'upper', 4, A, 1, 4, 0, IPIV, 1, 0 );
	assert.equal( info, 0, 'info' );
	assert.deepEqual( toArray( IPIV ), [ 0, 1, -3, -4 ], 'ipiv' );
	Av = reinterpret( A, 0 );
	assertClose( Av[ 0 ], -1.9428498651450765, 1e-12, 'A[0,0] re' );
	assertClose( Av[ 1 ], 0.8608644723722252, 1e-12, 'A[0,0] im' );
	assertClose( Av[ ( ( 3 * 4 ) + 3 ) * 2 ], 0.001, 1e-12, 'A[3,3]' );
});

test( 'zsytf2Rook: complex_indef_lower_4x4 (complex sym lower)', function t() {
	var IPIV;
	var info;
	var Av;
	var A;
	A = buildSym( 4, [
		[ 0, 0, 0.001, 0 ], [ 1, 0, 1, -0.5 ], [ 2, 0, 2, 1 ], [ 3, 0, 4, -1 ],
		[ 1, 1, 0.001, 0 ], [ 2, 1, 3, -2 ], [ 3, 1, 5, 1 ],
		[ 2, 2, 0.001, 0 ], [ 3, 2, 6, -2 ],
		[ 3, 3, 0.001, 0 ]
	]);
	IPIV = new Int32Array( 4 );
	info = zsytf2Rook( 'lower', 4, A, 1, 4, 0, IPIV, 1, 0 );
	assert.equal( info, 0, 'info' );
	assert.deepEqual( toArray( IPIV ), [ -4, -3, 2, 3 ], 'ipiv' );
	Av = reinterpret( A, 0 );
	assertClose( Av[ 0 ], 0.001, 1e-12, 'A[0,0]' );
	assertClose( Av[ ( ( 3 * 4 ) + 3 ) * 2 ], -1.9428498651450765, 1e-12, 'A[3,3] re' );
	assertClose( Av[ ( ( 3 * 4 ) + 3 ) * 2 + 1 ], -0.8608644723722252, 1e-12, 'A[3,3] im' );
});

test( 'zsytf2Rook: zero column upper (info nonzero, last col)', function t() {
	var IPIV;
	var info;
	var A;

	// Last column entirely zero -> upper k=N-1 fails, info=N
	A = buildSym( 3, [
		[ 0, 0, 4, 0 ],
		[ 0, 1, 1, 0 ], [ 1, 1, 3, 0 ]

		// No j=2 entries: column 2 all zero.
	]);
	IPIV = new Int32Array( 3 );
	info = zsytf2Rook( 'upper', 3, A, 1, 3, 0, IPIV, 1, 0 );
	assert.equal( info, 3, 'info=3 (last zero column, 1-based)' );
});

test( 'zsytf2Rook: zero column lower (info nonzero, first col)', function t() {
	var IPIV;
	var info;
	var A;

	// First column entirely zero
	A = buildSym( 3, [
		[ 1, 1, 2, 0 ], [ 2, 1, 0.5, 0 ],
		[ 2, 2, 3, 0 ]
	]);
	IPIV = new Int32Array( 3 );
	info = zsytf2Rook( 'lower', 3, A, 1, 3, 0, IPIV, 1, 0 );
	assert.equal( info, 1, 'info=1 (first zero column, 1-based)' );
});

test( 'zsytf2Rook: complex_2x2_imag_dom_upper (imag-dominant divisor exercises cDiv else)', function t() {
	var IPIV;
	var info;
	var Av;
	var A;
	A = buildSym( 2, [
		[ 0, 0, 0.001, 0 ],
		[ 0, 1, 0.0, 5.0 ], [ 1, 1, 0.001, 0 ]
	]);
	IPIV = new Int32Array( 2 );
	info = zsytf2Rook( 'upper', 2, A, 1, 2, 0, IPIV, 1, 0 );
	assert.equal( info, 0, 'info' );
	assert.deepEqual( toArray( IPIV ), [ -1, -2 ], 'ipiv (2x2 pivot)' );
	Av = reinterpret( A, 0 );
	assertClose( Av[ 0 ], 0.001, 1e-12, 'A[0,0]' );
});

test( 'zsytf2Rook: complex_2x2_imag_dom_lower (imag-dominant divisor)', function t() {
	var IPIV;
	var info;
	var Av;
	var A;
	A = buildSym( 2, [
		[ 0, 0, 0.001, 0 ],
		[ 1, 0, 0.0, 5.0 ],
		[ 1, 1, 0.001, 0 ]
	]);
	IPIV = new Int32Array( 2 );
	info = zsytf2Rook( 'lower', 2, A, 1, 2, 0, IPIV, 1, 0 );
	assert.equal( info, 0, 'info' );
	assert.deepEqual( toArray( IPIV ), [ -1, -2 ], 'ipiv (2x2 pivot)' );
	Av = reinterpret( A, 0 );
	assertClose( Av[ 0 ], 0.001, 1e-12, 'A[0,0]' );
});

test( 'zsytf2Rook: complex_3x3_mix_upper (2x2 + 1x1 with imag-dominant divisor)', function t() {
	var IPIV;
	var info;
	var Av;
	var A;
	A = buildSym( 3, [
		[ 0, 0, 0.001, 0 ],
		[ 0, 1, 0, 3 ], [ 1, 1, 0.001, 0 ],
		[ 0, 2, 1, 0.1 ], [ 1, 2, 0.5, 2 ], [ 2, 2, 2, 0 ]
	]);
	IPIV = new Int32Array( 3 );
	info = zsytf2Rook( 'upper', 3, A, 1, 3, 0, IPIV, 1, 0 );
	assert.equal( info, 0, 'info' );
	assert.deepEqual( toArray( IPIV ), [ 0, 1, 2 ], 'ipiv' );
	Av = reinterpret( A, 0 );
	assertClose( Av[ 0 ], 0.984713543639653, 1e-12, 'A[0,0] re' );
	assertClose( Av[ 1 ], 1.0040583921320112, 1e-12, 'A[0,0] im' );
});

test( 'zsytf2Rook: complex_3x3_mix_lower (2x2 + 1x1 lower)', function t() {
	var IPIV;
	var info;
	var Av;
	var A;
	A = buildSym( 3, [
		[ 0, 0, 2, 0 ],
		[ 1, 0, 0.5, 2 ], [ 2, 0, 1, 0.1 ],
		[ 1, 1, 0.001, 0 ],
		[ 2, 1, 0, 3 ],
		[ 2, 2, 0.001, 0 ]
	]);
	IPIV = new Int32Array( 3 );
	info = zsytf2Rook( 'lower', 3, A, 1, 3, 0, IPIV, 1, 0 );
	assert.equal( info, 0, 'info' );
	assert.deepEqual( toArray( IPIV ), [ 0, 1, 2 ], 'ipiv' );
	Av = reinterpret( A, 0 );
	assertClose( Av[ ( ( 2 * 3 ) + 2 ) * 2 ], 0.984713543639653, 1e-12, 'A[2,2] re' );
	assertClose( Av[ ( ( 2 * 3 ) + 2 ) * 2 + 1 ], 1.0040583921320112, 1e-12, 'A[2,2] im' );
});

test( 'zsytf2Rook: pos_def_upper_3x3 (no pivots, all 1x1)', function t() {
	var IPIV;
	var info;
	var A;
	A = buildSym( 3, [
		[ 0, 0, 4, 0 ],
		[ 0, 1, 1, 0 ], [ 1, 1, 3, 0 ],
		[ 0, 2, 0.5, 0 ], [ 1, 2, 0.5, 0 ], [ 2, 2, 5, 0 ]
	]);
	IPIV = new Int32Array( 3 );
	info = zsytf2Rook( 'upper', 3, A, 1, 3, 0, IPIV, 1, 0 );
	assert.equal( info, 0, 'info' );
	assert.deepEqual( toArray( IPIV ), [ 0, 1, 2 ], 'ipiv (all 1x1)' );
});

test( 'zsytf2Rook: pos_def_lower_3x3 (no pivots, all 1x1)', function t() {
	var IPIV;
	var info;
	var A;
	A = buildSym( 3, [
		[ 0, 0, 4, 0 ], [ 1, 0, 1, 0 ], [ 2, 0, 0.5, 0 ],
		[ 1, 1, 3, 0 ], [ 2, 1, 0.5, 0 ],
		[ 2, 2, 5, 0 ]
	]);
	IPIV = new Int32Array( 3 );
	info = zsytf2Rook( 'lower', 3, A, 1, 3, 0, IPIV, 1, 0 );
	assert.equal( info, 0, 'info' );
	assert.deepEqual( toArray( IPIV ), [ 0, 1, 2 ], 'ipiv (all 1x1)' );
});

test( 'zsytf2Rook: stride/offset support (lower)', function t() {
	var IPIV;
	var info;
	var Av;
	var A;
	var i;

	// Place a 3x3 matrix at offset 2 inside a larger Complex128Array, with

	// IPIV at offset 1 with stride 2.
	A = new Complex128Array( 2 + ( 3 * 3 ) );
	Av = reinterpret( A, 0 );

	// Column 0
	Av[ ( 2 + 0 ) * 2 ] = 4.0;
	Av[ ( 2 + 1 ) * 2 ] = 1.0; Av[ ( 2 + 1 ) * 2 + 1 ] = -0.5;
	Av[ ( 2 + 2 ) * 2 ] = 0.5; Av[ ( 2 + 2 ) * 2 + 1 ] = 0.25;

	// Column 1
	Av[ ( 2 + 4 ) * 2 ] = 3.0;
	Av[ ( 2 + 5 ) * 2 ] = 0.5; Av[ ( 2 + 5 ) * 2 + 1 ] = -1;

	// Column 2
	Av[ ( 2 + 8 ) * 2 ] = 5.0;

	IPIV = new Int32Array( 1 + ( 3 * 2 ) );
	info = zsytf2Rook( 'lower', 3, A, 1, 3, 2, IPIV, 2, 1 );
	assert.equal( info, 0, 'info' );
	for ( i = 0; i < 3; i++ ) {
		assert.equal( IPIV[ 1 + ( i * 2 ) ] >= -3 && IPIV[ 1 + ( i * 2 ) ] < 3, true, 'ipiv[' + i + '] valid' );
	}
});

test( 'zsytf2Rook: invalid uplo throws TypeError', function t() {
	var A = new Complex128Array( 4 );
	var IPIV = new Int32Array( 2 );
	assert.throws( function f() {
		zsytf2Rook( 'invalid', 2, A, 1, 2, 0, IPIV, 1, 0 );
	}, TypeError );
});

test( 'zsytf2Rook: upper_chase2_5x5 (multi-iter rook chase, P!=K first swap)', function t() {
	var IPIV;
	var info;
	var Av;
	var A;
	A = buildSym( 5, [
		[ 0, 0, 0.001, 0 ],
		[ 0, 1, 5, 0 ], [ 1, 1, 0.001, 0 ],
		[ 0, 2, 3, 0 ], [ 1, 2, 2, 0 ], [ 2, 2, 0.001, 0 ],
		[ 0, 3, 1, 0 ], [ 1, 3, 4, 0 ], [ 2, 3, 1, 0 ], [ 3, 3, 0.001, 0 ],
		[ 0, 4, 2, 0 ], [ 1, 4, 1, 0 ], [ 2, 4, 3, 0 ], [ 3, 4, 2, 0 ], [ 4, 4, 0.001, 0 ]
	]);
	IPIV = new Int32Array( 5 );
	info = zsytf2Rook( 'upper', 5, A, 1, 5, 0, IPIV, 1, 0 );
	assert.equal( info, 0, 'info' );
	assert.deepEqual( toArray( IPIV ), [ -1, -2, 0, -3, -5 ], 'ipiv' );
	Av = reinterpret( A, 0 );
	assertClose( Av[ 0 ], -0.6375570626316482, 1e-12, 'A[0,0]' );
});

test( 'zsytf2Rook: lower_chase2_5x5 (multi-iter rook chase lower, P!=K)', function t() {
	var IPIV;
	var info;
	var Av;
	var A;
	A = buildSym( 5, [
		[ 0, 0, 0.001, 0 ], [ 1, 0, 5, 0 ], [ 2, 0, 3, 0 ], [ 3, 0, 1, 0 ], [ 4, 0, 2, 0 ],
		[ 1, 1, 0.001, 0 ], [ 2, 1, 2, 0 ], [ 3, 1, 4, 0 ], [ 4, 1, 1, 0 ],
		[ 2, 2, 0.001, 0 ], [ 3, 2, 1, 0 ], [ 4, 2, 3, 0 ],
		[ 3, 3, 0.001, 0 ], [ 4, 3, 2, 0 ],
		[ 4, 4, 0.001, 0 ]
	]);
	IPIV = new Int32Array( 5 );
	info = zsytf2Rook( 'lower', 5, A, 1, 5, 0, IPIV, 1, 0 );
	assert.equal( info, 0, 'info' );
	assert.deepEqual( toArray( IPIV ), [ -1, -2, 2, -4, -5 ], 'ipiv' );
});

test( 'zsytf2Rook: lower_off_diag_dom_5x5 (zero diagonal lower)', function t() {
	var IPIV;
	var info;
	var Av;
	var A;
	A = buildSym( 5, [
		[ 1, 0, 3, 0 ], [ 2, 0, 2, 0 ], [ 3, 0, 1, 0 ], [ 4, 0, 5, 0 ],
		[ 2, 1, 5, 0 ], [ 3, 1, 4, 0 ], [ 4, 1, 2, 0 ],
		[ 3, 2, 3, 0 ], [ 4, 2, 1, 0 ],
		[ 4, 3, 2, 0 ]
	]);
	IPIV = new Int32Array( 5 );
	info = zsytf2Rook( 'lower', 5, A, 1, 5, 0, IPIV, 1, 0 );
	assert.equal( info, 0, 'info' );
	assert.deepEqual( toArray( IPIV ), [ -1, -5, 4, 4, 4 ], 'ipiv' );
	Av = reinterpret( A, 0 );
	assertClose( Av[ ( ( 4 * 5 ) + 4 ) * 2 ], -5.217391304347824, 1e-11, 'A[4,4]' );
});

test( 'zsytf2Rook: upper_off_diag_dom_5x5 (zero diagonal upper)', function t() {
	var IPIV;
	var info;
	var Av;
	var A;
	A = buildSym( 5, [
		[ 0, 1, 3, 0 ],
		[ 0, 2, 2, 0 ], [ 1, 2, 5, 0 ],
		[ 0, 3, 1, 0 ], [ 1, 3, 4, 0 ], [ 2, 3, 3, 0 ],
		[ 0, 4, 5, 0 ], [ 1, 4, 2, 0 ], [ 2, 4, 1, 0 ], [ 3, 4, 2, 0 ]
	]);
	IPIV = new Int32Array( 5 );
	info = zsytf2Rook( 'upper', 5, A, 1, 5, 0, IPIV, 1, 0 );
	assert.equal( info, 0, 'info' );
	assert.deepEqual( toArray( IPIV ), [ 0, 1, 1, -1, -5 ], 'ipiv' );
	Av = reinterpret( A, 0 );
	assertClose( Av[ 0 ], -5.217391304347824, 1e-11, 'A[0,0]' );
});

test( 'zsytf2Rook: imag_dom_2x2_update_upper (2x2 update with imag-dominant divisor exercises cDiv else)', function t() {
	var IPIV;
	var info;
	var A;
	A = buildSym( 4, [
		[ 0, 0, 5, 0 ],
		[ 0, 1, 1, 0 ], [ 1, 1, 4, 0 ],
		[ 0, 2, 0.5, 0 ], [ 1, 2, 0.5, 0 ], [ 2, 2, 0.001, 0 ],
		[ 0, 3, 0.1, 0.1 ], [ 1, 3, 0.2, 0.1 ], [ 2, 3, 0.0, 5.0 ], [ 3, 3, 0.001, 0 ]
	]);
	IPIV = new Int32Array( 4 );
	info = zsytf2Rook( 'upper', 4, A, 1, 4, 0, IPIV, 1, 0 );
	assert.equal( info, 0, 'info' );
	assert.deepEqual( toArray( IPIV ), [ 0, 1, -3, -4 ], 'ipiv (2x2 pivot at k=3 with imag-dom d12)' );
});

test( 'zsytf2Rook: imag_dom_2x2_update_lower (2x2 update lower with imag-dom)', function t() {
	var IPIV;
	var info;
	var A;
	A = buildSym( 4, [
		[ 0, 0, 0.001, 0 ],
		[ 1, 0, 0, 5 ], [ 1, 1, 0.001, 0 ],
		[ 2, 0, 0.2, 0.1 ], [ 2, 1, 0.5, 0 ], [ 2, 2, 4, 0 ],
		[ 3, 0, 0.1, 0.1 ], [ 3, 1, 0.5, 0 ], [ 3, 2, 1, 0 ], [ 3, 3, 5, 0 ]
	]);
	IPIV = new Int32Array( 4 );
	info = zsytf2Rook( 'lower', 4, A, 1, 4, 0, IPIV, 1, 0 );
	assert.equal( info, 0, 'info' );
	assert.deepEqual( toArray( IPIV ), [ -1, -2, 2, 3 ], 'ipiv (2x2 pivot at k=0 with imag-dom d21)' );
});

test( 'zsytf2Rook: sfmin_upper_2x2 (1x1 SFMIN fallback upper)', function t() {
	// A(k,k) tiny but nonzero (< SFMIN), forces else branch in 1x1 update.
	var IPIV;
	var info;
	var Av;
	var A;
	A = buildSym( 2, [
		[ 0, 0, 1, 0 ],
		[ 0, 1, 1e-310, 0 ], [ 1, 1, 5e-310, 0 ]
	]);
	IPIV = new Int32Array( 2 );
	info = zsytf2Rook( 'upper', 2, A, 1, 2, 0, IPIV, 1, 0 );
	assert.equal( info, 0, 'info' );
	assert.deepEqual( toArray( IPIV ), [ 0, 1 ], 'ipiv' );
	Av = reinterpret( A, 0 );

	// After SFMIN branch: A(0,1) = A(0,1)/A(1,1) = 1e-310/5e-310 = 0.2
	assertClose( Av[ ( ( 1 * 2 ) + 0 ) * 2 ], 0.2, 1e-12, 'A[0,1] post SFMIN scale' );
});

test( 'zsytf2Rook: upper_first_swap_6x6 (P!=K rook chase forces first swap)', function t() {
	// Crafted to force chase iteration with p tracked != k at exit.
	// At k=5: imax->4, row 4 max at col 5 (=20), itemp scan col 4 finds A(2,4)=30 dominant.
	// p=5, then continue: p=4, imax=2. Next iter: imax=2 row scan finds jmax=4=p. Exit p===jmax.
	// kp=imax=2. p=4 != k=5 -> first swap fires.
	var IPIV;
	var info;
	var A;
	A = buildSym( 6, [
		[ 0, 0, 0.5, 0 ],
		[ 0, 1, 1, 0 ], [ 1, 1, 0.5, 0 ],
		[ 0, 2, 1, 0 ], [ 1, 2, 1, 0 ], [ 2, 2, 0.001, 0 ],
		[ 0, 3, 1, 0 ], [ 1, 3, 1, 0 ], [ 2, 3, 5, 0 ], [ 3, 3, 0.5, 0 ],
		[ 0, 4, 1, 0 ], [ 1, 4, 1, 0 ], [ 2, 4, 30, 0 ], [ 3, 4, 1, 0 ], [ 4, 4, 0.001, 0 ],
		[ 0, 5, 10, 0 ], [ 1, 5, 2, 0 ], [ 2, 5, 2, 0 ], [ 3, 5, 3, 0 ], [ 4, 5, 20, 0 ], [ 5, 5, 0.001, 0 ]
	]);
	IPIV = new Int32Array( 6 );
	info = zsytf2Rook( 'upper', 6, A, 1, 6, 0, IPIV, 1, 0 );
	assert.equal( info, 0, 'info' );
	assert.deepEqual( toArray( IPIV ), [ -1, -2, -3, -1, -3, -5 ], 'ipiv' );
});

test( 'zsytf2Rook: lower_first_swap_6x6 (P!=K rook chase forces first swap)', function t() {
	// Lower analog: at k=0, imax->2, row 2 max at col 0, itemp scan col 2 finds A(5,2)=30.
	// p=0 -> p=2, imax=5. Next iter: row 5 scan finds jmax=2=p. Exit p===jmax.
	// kp=imax=5. p=2 != k=0 -> first swap fires (lower path).
	var IPIV;
	var info;
	var A;
	A = buildSym( 6, [
		[ 0, 0, 0.001, 0 ],
		[ 1, 0, 10, 0 ], [ 2, 0, 20, 0 ], [ 3, 0, 2, 0 ], [ 4, 0, 2, 0 ], [ 5, 0, 3, 0 ],
		[ 1, 1, 0.5, 0 ], [ 2, 1, 5, 0 ], [ 3, 1, 1, 0 ], [ 4, 1, 1, 0 ], [ 5, 1, 1, 0 ],
		[ 2, 2, 0.001, 0 ], [ 3, 2, 1, 0 ], [ 4, 2, 1, 0 ], [ 5, 2, 30, 0 ],
		[ 3, 3, 0.5, 0 ], [ 4, 3, 5, 0 ], [ 5, 3, 1, 0 ],
		[ 4, 4, 0.5, 0 ], [ 5, 4, 1, 0 ],
		[ 5, 5, 0.5, 0 ]
	]);
	IPIV = new Int32Array( 6 );
	info = zsytf2Rook( 'lower', 6, A, 1, 6, 0, IPIV, 1, 0 );
	assert.equal( info, 0, 'info' );
	assert.deepEqual( toArray( IPIV ), [ -3, -6, -3, -6, -5, -6 ], 'ipiv' );
});

test( 'zsytf2Rook: sfmin_lower_2x2 (1x1 SFMIN fallback lower)', function t() {
	// A(0,0) tiny but nonzero (< SFMIN), forces else branch in lower 1x1 update.
	var IPIV;
	var info;
	var Av;
	var A;
	A = buildSym( 2, [
		[ 0, 0, 5e-310, 0 ],
		[ 1, 0, 1e-310, 0 ],
		[ 1, 1, 1, 0 ]
	]);
	IPIV = new Int32Array( 2 );
	info = zsytf2Rook( 'lower', 2, A, 1, 2, 0, IPIV, 1, 0 );
	assert.equal( info, 0, 'info' );
	assert.deepEqual( toArray( IPIV ), [ 0, 1 ], 'ipiv' );
	Av = reinterpret( A, 0 );
	assertClose( Av[ 2 ], 0.2, 1e-12, 'A[1,0] post SFMIN scale' );
});
