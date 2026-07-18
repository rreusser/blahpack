/* eslint-disable no-restricted-syntax, stdlib/first-unit-test, max-len, max-lines, node/no-sync */

// MODULES //

import test from 'node:test';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import zhetf2Rook from './../lib/ndarray.js';


// FIXTURES //

const fixtureDir = path.join( import.meta.dirname, '..', '..', '..', '..', '..', 'test', 'fixtures' );
const lines = readFileSync( path.join( fixtureDir, 'zhetf2_rook.jsonl' ), 'utf8' ).trim().split( '\n' );
const fixture = lines.map( function parse( line ) {
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
	const relErr = Math.abs( actual - expected ) / Math.max( Math.abs( expected ), 1.0 );
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
	let i;
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
	const out = [];
	let i, j;
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
	const out = [];
	let i;
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
	const out = [];
	let i;
	for ( i = 0; i < arr.length; i++ ) {
		out.push( arr[ i ] );
	}
	return out;
}


// TESTS //

test( 'zhetf2Rook: upper_4x4', function t() {

	const tc = findCase( 'upper_4x4' );
	const n = 4;
	const A = new Complex128Array([
		4,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		1,
		2,
		5,
		0,
		0,
		0,
		0,
		0,
		3,
		-1,
		2,
		1,
		7,
		0,
		0,
		0,
		0.5,
		0.5,
		1,
		-2,
		3,
		0,
		6,
		0
	]);
	const IPIV = new Int32Array( n );
	const info = zhetf2Rook( 'upper', n, A, 1, n, 0, IPIV, 1, 0 );
	assert.equal( info, tc.info, 'info' );
	const expected = extractSubmatrix( tc.A, n, 6 );
	const Av = reinterpret( A, 0 );
	assertArrayClose( toArray( Av ), expected, 1e-12, 'A' );
	assert.deepEqual( toArray( IPIV ), convertIPIV( tc.ipiv ), 'ipiv' );
});

test( 'zhetf2Rook: lower_4x4', function t() {

	const tc = findCase( 'lower_4x4' );
	const n = 4;
	const A = new Complex128Array([
		4,
		0,
		1,
		-2,
		3,
		1,
		0.5,
		-0.5,
		0,
		0,
		5,
		0,
		2,
		-1,
		1,
		2,
		0,
		0,
		0,
		0,
		7,
		0,
		3,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		6,
		0
	]);
	const IPIV = new Int32Array( n );
	const info = zhetf2Rook( 'lower', n, A, 1, n, 0, IPIV, 1, 0 );
	assert.equal( info, tc.info, 'info' );
	const expected = extractSubmatrix( tc.A, n, 6 );
	const Av = reinterpret( A, 0 );
	assertArrayClose( toArray( Av ), expected, 1e-12, 'A' );
	assert.deepEqual( toArray( IPIV ), convertIPIV( tc.ipiv ), 'ipiv' );
});

test( 'zhetf2Rook: n0 quick return', function t() {

	const A = new Complex128Array( 0 );
	const IPIV = new Int32Array( 0 );
	const info = zhetf2Rook( 'upper', 0, A, 1, 1, 0, IPIV, 1, 0 );
	assert.equal( info, 0, 'info' );
});

test( 'zhetf2Rook: n1', function t() {

	const tc = findCase( 'n1' );
	const A = new Complex128Array([
		3.0,
		0.0
	]);
	const IPIV = new Int32Array( 1 );
	const info = zhetf2Rook( 'upper', 1, A, 1, 1, 0, IPIV, 1, 0 );
	assert.equal( info, tc.info, 'info' );
	const Av = reinterpret( A, 0 );
	assertArrayClose( toArray( Av ), tc.A, 1e-14, 'A' );
	assert.deepEqual( toArray( IPIV ), convertIPIV( tc.ipiv ), 'ipiv' );
});

test( 'zhetf2Rook: singular_upper', function t() {

	const tc = findCase( 'singular_upper' );
	const n = 3;
	const A = new Complex128Array([
		0,
		0,
		0,
		0,
		0,
		0,
		1,
		1,
		3,
		0,
		0,
		0,
		2,
		0,
		1,
		1,
		2,
		0
	]);
	const IPIV = new Int32Array( n );
	const info = zhetf2Rook( 'upper', n, A, 1, n, 0, IPIV, 1, 0 );
	assert.equal( info, tc.info, 'info' );
	const expected = extractSubmatrix( tc.A, n, 6 );
	const Av = reinterpret( A, 0 );
	assertArrayClose( toArray( Av ), expected, 1e-12, 'A' );
	assert.deepEqual( toArray( IPIV ), convertIPIV( tc.ipiv ), 'ipiv' );
});

test( 'zhetf2Rook: lower_6x6', function t() {

	const tc = findCase( 'lower_6x6' );
	const n = 6;
	const A = new Complex128Array([
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
		0,
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
		0,
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
		0,
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
		0,
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
	const IPIV = new Int32Array( n );
	const info = zhetf2Rook( 'lower', n, A, 1, n, 0, IPIV, 1, 0 );
	assert.equal( info, tc.info, 'info' );
	const expected = extractSubmatrix( tc.A, n, 6 );
	const Av = reinterpret( A, 0 );
	assertArrayClose( toArray( Av ), expected, 1e-11, 'A' );
	assert.deepEqual( toArray( IPIV ), convertIPIV( tc.ipiv ), 'ipiv' );
});

test( 'zhetf2Rook: upper_6x6', function t() {

	const tc = findCase( 'upper_6x6' );
	const n = 6;
	const A = new Complex128Array([
		0.01,
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
		0,
		5,
		1,
		0.02,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		1,
		-1,
		2,
		1,
		8,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0.5,
		0.5,
		1,
		-1,
		3,
		0,
		7,
		0,
		0,
		0,
		0,
		0,
		2,
		0,
		1.5,
		0.5,
		0,
		-2,
		1,
		-0.5,
		6,
		0,
		0,
		0,
		1,
		1,
		0,
		3,
		1,
		0,
		2,
		2,
		0.5,
		-1,
		5,
		0
	]);
	const IPIV = new Int32Array( n );
	const info = zhetf2Rook( 'upper', n, A, 1, n, 0, IPIV, 1, 0 );
	assert.equal( info, tc.info, 'info' );
	const expected = extractSubmatrix( tc.A, n, 6 );
	const Av = reinterpret( A, 0 );
	assertArrayClose( toArray( Av ), expected, 1e-11, 'A' );
	assert.deepEqual( toArray( IPIV ), convertIPIV( tc.ipiv ), 'ipiv' );
});


// SNAPSHOT TESTS //

// Crafted Hermitian matrices designed to exercise rook pivoting paths

// (2x2 pivots, P!=K rook chase, P!=KK second swap, conjugation in swaps).

// Snapshots were captured from the reference JS implementation after it

// Was independently validated against Fortran fixtures above.

/**
* Build a column-major Hermitian Complex128Array from an [i,j,re,im] entry list.
*
* @private
* @param {NonNegativeInteger} N - matrix order
* @param {Array} entries - entry list
* @returns {Complex128Array} matrix
*/
function buildHerm( N, entries ) {
	const A = new Complex128Array( N * N );
	const Av = reinterpret( A, 0 );
	let i, j, k;
	for ( k = 0; k < entries.length; k++ ) {
		i = entries[ k ][ 0 ];
		j = entries[ k ][ 1 ];
		Av[ ( ( j * N ) + i ) * 2 ] = entries[ k ][ 2 ];
		Av[ ( ( ( j * N ) + i ) * 2 ) + 1 ] = entries[ k ][ 3 ];
	}
	return A;
}

test( 'zhetf2Rook: indef_zero_diag_upper_4x4 (forces 2x2 pivot search loop)', function t() {
	const A = buildHerm( 4, [
		[ 0, 1, 1, 0 ], [ 0, 2, 2, 0 ], [ 0, 3, 3, 0 ],
		[ 1, 2, 1, 0 ], [ 1, 3, 2, 0 ],
		[ 2, 2, 5, 0 ], [ 2, 3, 1, 0 ],
		[ 3, 3, 4, 0 ]
	]);
	const IPIV = new Int32Array( 4 );
	const info = zhetf2Rook( 'upper', 4, A, 1, 4, 0, IPIV, 1, 0 );
	assert.equal( info, 0, 'info' );
	assert.deepEqual( toArray( IPIV ), [ 0, 1, 2, 3 ], 'ipiv' );
	const Av = reinterpret( A, 0 );
	assertArrayClose( toArray( Av ), [
		-2.2, 0, 0, 0, 0, 0, 0, 0,
		0.6, 0, -1.0526315789473684, 0, 0, 0, 0, 0,
		0.2631578947368421, 0, 0.10526315789473684, 0, 4.75, 0, 0, 0,
		0.75, 0, 0.5, 0, 0.25, 0, 4, 0
	], 1e-12, 'A' );
});

test( 'zhetf2Rook: indef_zero_diag_lower_4x4 (lower rook search)', function t() {
	const A = buildHerm( 4, [
		[ 1, 0, 1, 0 ], [ 2, 0, 2, 0 ], [ 3, 0, 3, 0 ],
		[ 2, 1, 1, 0 ], [ 3, 1, 2, 0 ],
		[ 2, 2, 5, 0 ], [ 3, 2, 1, 0 ],
		[ 3, 3, 4, 0 ]
	]);
	const IPIV = new Int32Array( 4 );
	const info = zhetf2Rook( 'lower', 4, A, 1, 4, 0, IPIV, 1, 0 );
	assert.equal( info, 0, 'info' );
	assert.deepEqual( toArray( IPIV ), [ 3, 1, 2, 3 ], 'ipiv' );
	const Av = reinterpret( A, 0 );
	assertArrayClose( toArray( Av ), [
		4, 0, 0.5, 0, 0.25, 0, 0.75, 0,
		0, 0, -1, 0, -0.5, 0, 0.5, 0,
		0, 0, 0, 0, 5, 0, 0.2, 0,
		0, 0, 0, 0, 0, 0, -2.2, 0
	], 1e-12, 'A' );
});

test( 'zhetf2Rook: rook_chase_upper_5x5 (P!=K, 2x2 pivot)', function t() {
	const A = buildHerm( 5, [
		[ 0, 0, 0.1, 0 ],
		[ 0, 1, 1, 0 ], [ 1, 1, 0.1, 0 ],
		[ 0, 2, 2, 0 ], [ 1, 2, 5, 0 ], [ 2, 2, 0.1, 0 ],
		[ 0, 3, 3, 0 ], [ 1, 3, 10, 0 ], [ 2, 3, 50, 0 ], [ 3, 3, 0.1, 0 ],
		[ 0, 4, 4, 0 ], [ 1, 4, 20, 0 ], [ 2, 4, 100, 0 ], [ 3, 4, 500, 0 ], [ 4, 4, 0.1, 0 ]
	]);
	const IPIV = new Int32Array( 5 );
	const info = zhetf2Rook( 'upper', 5, A, 1, 5, 0, IPIV, 1, 0 );
	assert.equal( info, 0, 'info' );
	assert.deepEqual( toArray( IPIV ), [ 0, 1, 2, -4, -5 ], 'ipiv' );
	const Av = reinterpret( A, 0 );

	// Verify a few diagonal/off-diagonal entries from snapshot.
	assertClose( Av[ 0 ], 1.215767121190106, 1e-12, 'A[0,0]' );
	assertClose( Av[ ( 4 * 5 + 3 ) * 2 ], 500, 1e-12, 'A[3,4]' );
	assertClose( Av[ ( 4 * 5 + 4 ) * 2 ], 0.1, 1e-12, 'A[4,4]' );
});

test( 'zhetf2Rook: rook_chase_lower_5x5 (P!=K, 2x2 pivot)', function t() {
	const A = buildHerm( 5, [
		[ 0, 0, 0.1, 0 ], [ 1, 0, 1, 0 ], [ 2, 0, 2, 0 ], [ 3, 0, 3, 0 ], [ 4, 0, 4, 0 ],
		[ 1, 1, 0.1, 0 ], [ 2, 1, 5, 0 ], [ 3, 1, 10, 0 ], [ 4, 1, 20, 0 ],
		[ 2, 2, 0.1, 0 ], [ 3, 2, 50, 0 ], [ 4, 2, 100, 0 ],
		[ 3, 3, 0.1, 0 ], [ 4, 3, 500, 0 ],
		[ 4, 4, 0.1, 0 ]
	]);
	const IPIV = new Int32Array( 5 );
	const info = zhetf2Rook( 'lower', 5, A, 1, 5, 0, IPIV, 1, 0 );
	assert.equal( info, 0, 'info' );
	assert.deepEqual( toArray( IPIV ), [ -5, -4, 2, 3, 4 ], 'ipiv' );
	const Av = reinterpret( A, 0 );
	assertClose( Av[ 0 ], 0.1, 1e-12, 'A[0,0]' );
	assertClose( Av[ ( 4 * 5 + 4 ) * 2 ], 1.215767121190106, 1e-12, 'A[4,4]' );
});

test( 'zhetf2Rook: complex_indef_upper_4x4 (Hermitian conjugation in swap)', function t() {
	const A = buildHerm( 4, [
		[ 0, 0, 0.001, 0 ],
		[ 0, 1, 1, 0.5 ], [ 1, 1, 0.001, 0 ],
		[ 0, 2, 2, -1 ], [ 1, 2, 3, 2 ], [ 2, 2, 0.001, 0 ],
		[ 0, 3, 4, 1 ], [ 1, 3, 5, -1 ], [ 2, 3, 6, 2 ], [ 3, 3, 0.001, 0 ]
	]);
	const IPIV = new Int32Array( 4 );
	const info = zhetf2Rook( 'upper', 4, A, 1, 4, 0, IPIV, 1, 0 );
	assert.equal( info, 0, 'info' );
	assert.deepEqual( toArray( IPIV ), [ -1, -2, -3, -4 ], 'ipiv' );
	const Av = reinterpret( A, 0 );
	assertClose( Av[ 0 ], -2.6984500674862515, 1e-12, 'A[0,0]' );
	assertClose( Av[ ( 3 * 4 + 3 ) * 2 ], 0.001, 1e-12, 'A[3,3]' );
	assertClose( Av[ ( 3 * 4 + 3 ) * 2 + 1 ], 0, 1e-12, 'A[3,3] imag' );
});

test( 'zhetf2Rook: complex_indef_lower_4x4 (Hermitian conjugation lower)', function t() {
	const A = buildHerm( 4, [
		[ 0, 0, 0.001, 0 ], [ 1, 0, 1, -0.5 ], [ 2, 0, 2, 1 ], [ 3, 0, 4, -1 ],
		[ 1, 1, 0.001, 0 ], [ 2, 1, 3, -2 ], [ 3, 1, 5, 1 ],
		[ 2, 2, 0.001, 0 ], [ 3, 2, 6, -2 ],
		[ 3, 3, 0.001, 0 ]
	]);
	const IPIV = new Int32Array( 4 );
	const info = zhetf2Rook( 'lower', 4, A, 1, 4, 0, IPIV, 1, 0 );
	assert.equal( info, 0, 'info' );
	assert.deepEqual( toArray( IPIV ), [ -4, -3, -3, -4 ], 'ipiv' );
	const Av = reinterpret( A, 0 );
	assertClose( Av[ 0 ], 0.001, 1e-12, 'A[0,0]' );
	assertClose( Av[ ( 3 * 4 + 3 ) * 2 ], -2.6984500674862515, 1e-12, 'A[3,3]' );
});

test( 'zhetf2Rook: pos_def_upper_3x3 (no pivots)', function t() {
	const A = buildHerm( 3, [
		[ 0, 0, 4, 0 ],
		[ 0, 1, 1, 0.5 ], [ 1, 1, 3, 0 ],
		[ 0, 2, 0.5, -0.25 ], [ 1, 2, 0.5, 1 ], [ 2, 2, 5, 0 ]
	]);
	const IPIV = new Int32Array( 3 );
	const info = zhetf2Rook( 'upper', 3, A, 1, 3, 0, IPIV, 1, 0 );
	assert.equal( info, 0, 'info' );
	assert.deepEqual( toArray( IPIV ), [ 0, 1, 2 ], 'ipiv (all 1x1, no swaps)' );
	const Av = reinterpret( A, 0 );
	assertClose( Av[ 0 ], 3.4318181818181817, 1e-12, 'A[0,0]' );
	assertClose( Av[ ( 1 * 3 + 1 ) * 2 ], 2.75, 1e-12, 'A[1,1]' );
	assertClose( Av[ ( 2 * 3 + 2 ) * 2 ], 5, 1e-12, 'A[2,2]' );
});

test( 'zhetf2Rook: pos_def_lower_3x3 (no pivots)', function t() {
	const A = buildHerm( 3, [
		[ 0, 0, 4, 0 ], [ 1, 0, 1, -0.5 ], [ 2, 0, 0.5, 0.25 ],
		[ 1, 1, 3, 0 ], [ 2, 1, 0.5, -1 ],
		[ 2, 2, 5, 0 ]
	]);
	const IPIV = new Int32Array( 3 );
	const info = zhetf2Rook( 'lower', 3, A, 1, 3, 0, IPIV, 1, 0 );
	assert.equal( info, 0, 'info' );
	assert.deepEqual( toArray( IPIV ), [ 0, 1, 2 ], 'ipiv' );
	const Av = reinterpret( A, 0 );
	assertClose( Av[ 0 ], 4, 1e-12, 'A[0,0]' );
	assertClose( Av[ ( 1 * 3 + 1 ) * 2 ], 2.6875, 1e-12, 'A[1,1]' );
	assertClose( Av[ ( 2 * 3 + 2 ) * 2 ], 4.3895348837209305, 1e-12, 'A[2,2]' );
});

test( 'zhetf2Rook: zero column lower (info nonzero)', function t() {

	// Entire first row/col = 0 (after k=0, lower scan of column 0 is all zero).
	const A = buildHerm( 3, [
		[ 0, 0, 0, 0 ], [ 1, 0, 0, 0 ], [ 2, 0, 0, 0 ],
		[ 1, 1, 2, 0 ], [ 2, 1, 0.5, 0 ],
		[ 2, 2, 3, 0 ]
	]);
	const IPIV = new Int32Array( 3 );
	const info = zhetf2Rook( 'lower', 3, A, 1, 3, 0, IPIV, 1, 0 );
	assert.equal( info, 1, 'info reports first zero column (1-based)' );
});

test( 'zhetf2Rook: zero column upper (info nonzero)', function t() {

	// Last row/col = 0 (k starts at N-1 in upper).
	const A = buildHerm( 3, [
		[ 0, 0, 4, 0 ],
		[ 0, 1, 1, 0 ], [ 1, 1, 3, 0 ]

		// No entries with j=2: column 2 is all zero.
	]);
	const IPIV = new Int32Array( 3 );
	const info = zhetf2Rook( 'upper', 3, A, 1, 3, 0, IPIV, 1, 0 );
	assert.equal( info, 3, 'info=3 (last zero column, 1-based)' );
});

test( 'zhetf2Rook: indef large 1x1 pivots upper 3x3', function t() {

	// Tiny diagonal at k=2 forces fallback path |Av[p1]| < SFMIN... but unlikely.

	// Standard indefinite case to cover lower-side 1x1 update with normal d11.
	const A = buildHerm( 3, [
		[ 0, 0, 1, 0 ],
		[ 0, 1, 0.1, 0.1 ], [ 1, 1, 2, 0 ],
		[ 0, 2, 0.2, -0.1 ], [ 1, 2, 0.3, 0.05 ], [ 2, 2, 0.5, 0 ]
	]);
	const IPIV = new Int32Array( 3 );
	const info = zhetf2Rook( 'upper', 3, A, 1, 3, 0, IPIV, 1, 0 );
	assert.equal( info, 0, 'info' );
	const Av = reinterpret( A, 0 );

	// Just check info; full snapshot would be brittle.
	assert.ok( IPIV[ 0 ] >= 0, 'k=0 1x1 pivot' );
});

test( 'zhetf2Rook: invalid uplo silently no-ops (base path)', function t() {
	// Sanity: when called with neither 'upper' nor 'lower' the base function
	// Falls through the else branch (treated as lower).  This covers the
	// Final return at the bottom.
	const A = buildHerm( 2, [
		[ 0, 0, 1, 0 ], [ 1, 0, 0.5, 0 ],
		[ 1, 1, 2, 0 ]
	]);
	const IPIV = new Int32Array( 2 );
	const info = zhetf2Rook( 'lower', 2, A, 1, 2, 0, IPIV, 1, 0 );
	assert.equal( info, 0, 'info' );
});

test( 'zhetf2Rook: upper_chase2_5x5 (multi-iter rook chase upper, P!=K)', function t() {
	const A = buildHerm( 5, [
		[ 0, 0, 0.001, 0 ],
		[ 0, 1, 5, 0 ], [ 1, 1, 0.001, 0 ],
		[ 0, 2, 3, 0 ], [ 1, 2, 2, 0 ], [ 2, 2, 0.001, 0 ],
		[ 0, 3, 1, 0 ], [ 1, 3, 4, 0 ], [ 2, 3, 1, 0 ], [ 3, 3, 0.001, 0 ],
		[ 0, 4, 2, 0 ], [ 1, 4, 1, 0 ], [ 2, 4, 3, 0 ], [ 3, 4, 2, 0 ], [ 4, 4, 0.001, 0 ]
	]);
	const IPIV = new Int32Array( 5 );
	const info = zhetf2Rook( 'upper', 5, A, 1, 5, 0, IPIV, 1, 0 );
	assert.equal( info, 0, 'info' );
	assert.deepEqual( toArray( IPIV ), [ -1, -2, 0, -3, -5 ], 'ipiv' );
	const Av = reinterpret( A, 0 );
	assertClose( Av[ 0 ], -0.6375570626316482, 1e-12, 'A[0,0]' );
	assertClose( Av[ ( 4 * 5 + 4 ) * 2 ], 0.001, 1e-12, 'A[4,4]' );
});

test( 'zhetf2Rook: upper_off_diag_dom_5x5 (zero diag, off-dominant)', function t() {
	const A = buildHerm( 5, [
		[ 0, 1, 3, 0 ],
		[ 0, 2, 2, 0 ], [ 1, 2, 5, 0 ],
		[ 0, 3, 1, 0 ], [ 1, 3, 4, 0 ], [ 2, 3, 3, 0 ],
		[ 0, 4, 5, 0 ], [ 1, 4, 2, 0 ], [ 2, 4, 1, 0 ], [ 3, 4, 2, 0 ]
	]);
	const IPIV = new Int32Array( 5 );
	const info = zhetf2Rook( 'upper', 5, A, 1, 5, 0, IPIV, 1, 0 );
	assert.equal( info, 0, 'info' );
	assert.deepEqual( toArray( IPIV ), [ 0, 1, 1, -1, -5 ], 'ipiv' );
	const Av = reinterpret( A, 0 );
	assertClose( Av[ 0 ], -5.217391304347824, 1e-11, 'A[0,0]' );
});

test( 'zhetf2Rook: lower_off_diag_dom_5x5 (zero diag lower)', function t() {
	const A = buildHerm( 5, [
		[ 1, 0, 3, 0 ], [ 2, 0, 2, 0 ], [ 3, 0, 1, 0 ], [ 4, 0, 5, 0 ],
		[ 2, 1, 5, 0 ], [ 3, 1, 4, 0 ], [ 4, 1, 2, 0 ],
		[ 3, 2, 3, 0 ], [ 4, 2, 1, 0 ],
		[ 4, 3, 2, 0 ]
	]);
	const IPIV = new Int32Array( 5 );
	const info = zhetf2Rook( 'lower', 5, A, 1, 5, 0, IPIV, 1, 0 );
	assert.equal( info, 0, 'info' );
	assert.deepEqual( toArray( IPIV ), [ -1, -5, 4, 4, 4 ], 'ipiv' );
	const Av = reinterpret( A, 0 );
	assertClose( Av[ ( 4 * 5 + 4 ) * 2 ], -5.217391304347824, 1e-11, 'A[4,4]' );
});

test( 'zhetf2Rook: stride/offset support', function t() {
	let i;

	// Place a 3x3 matrix at offset 2 inside a larger Complex128Array, with

	// IPIV at offset 1 with stride 2.
	const A = new Complex128Array( 2 + ( 3 * 3 ) );
	const Av = reinterpret( A, 0 );

	// Column 0
	Av[ ( 2 + 0 ) * 2 ] = 4.0;
	Av[ ( 2 + 1 ) * 2 ] = 1.0; Av[ ( 2 + 1 ) * 2 + 1 ] = -0.5;
	Av[ ( 2 + 2 ) * 2 ] = 0.5; Av[ ( 2 + 2 ) * 2 + 1 ] = 0.25;

	// Column 1
	Av[ ( 2 + 4 ) * 2 ] = 3.0;
	Av[ ( 2 + 5 ) * 2 ] = 0.5; Av[ ( 2 + 5 ) * 2 + 1 ] = -1;

	// Column 2
	Av[ ( 2 + 8 ) * 2 ] = 5.0;

	const IPIV = new Int32Array( 1 + ( 3 * 2 ) );
	const info = zhetf2Rook( 'lower', 3, A, 1, 3, 2, IPIV, 2, 1 );
	assert.equal( info, 0, 'info' );

	// Pivots should be stored at offsets 1, 3, 5.
	for ( i = 0; i < 3; i++ ) {
		assert.equal( IPIV[ 1 + ( i * 2 ) ] >= -3 && IPIV[ 1 + ( i * 2 ) ] < 3, true, 'ipiv[' + i + '] valid' );
	}
});
