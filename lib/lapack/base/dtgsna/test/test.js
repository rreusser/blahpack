/* eslint-disable no-restricted-syntax, stdlib/first-unit-test, no-mixed-operators, max-len, max-statements-per-line, node/no-sync */


// MODULES //

import test from 'node:test';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import Uint8Array from '@stdlib/array/uint8/lib/index.js';
import dtgsna from './../lib/base.js';


// FIXTURES //

const fixtureDir = path.join( import.meta.dirname, '..', '..', '..', '..', '..', 'test', 'fixtures' ); // eslint-disable-line max-len
const lines = readFileSync( path.join( fixtureDir, 'dtgsna.jsonl' ), 'utf8' ).trim().split( '\n' ); // eslint-disable-line node/no-sync
const fixture = lines.map( function parse( line ) {
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
		return fixture.find( function find( t ) {
		return t.name === name;
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
	const relErr = Math.abs( actual - expected ) / Math.max( Math.abs( expected ), 1.0 ); // eslint-disable-line max-len
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
	let i;
	for ( i = 0; i < expected.length; i++ ) {
		assertClose( actual[ i ], expected[ i ], tol, msg + '[' + i + ']' );
	}
}

// Build a column-major matrix from row-major nested arrays, with leading dim `ld` // eslint-disable-line max-len
/**
* ColMajor.
*
* @private
* @param {*} ld - ld
* @param {*} rows - rows
* @returns {*} result
*/
function colMajor( ld, rows ) {
	const arr = new Float64Array( ld * rows[ 0 ].length );
	let i, j;
	for ( i = 0; i < rows.length; i++ ) {
		for ( j = 0; j < rows[ 0 ].length; j++ ) {
			arr[ i + ( j * ld ) ] = rows[ i ][ j ];
		}
	}
	return arr;
}

/**
* Identity.
*
* @private
* @param {*} ld - ld
* @param {*} n - n
* @returns {*} result
*/
function identity( ld, n ) {
	const arr = new Float64Array( ld * n );
	let i;
	for ( i = 0; i < n; i++ ) {
		arr[ i + ( i * ld ) ] = 1.0;
	}
	return arr;
}


// TESTS //

test( 'dtgsna: n1_both_all', function t() {

	const tc = findCase( 'n1_both_all' );
	const N = 1;
	const ld = 6;
	const A = new Float64Array( ld * N );
	A[ 0 ] = 3.0;
	const B = new Float64Array( ld * N );
	B[ 0 ] = 2.0;
	const VL = identity( ld, N );
	const VR = identity( ld, N );
	const s = new Float64Array( 6 );
	const DIF = new Float64Array( 6 );
	const WORK = new Float64Array( 500 );
	const IWORK = new Int32Array( 500 );
	const SELECT = new Uint8Array( 6 );
	const M = new Int32Array( 1 );
	const info = dtgsna( 'both', 'all', SELECT, 1, 0, N, A, 1, ld, 0, B, 1, ld, 0, VL, 1, ld, 0, VR, 1, ld, 0, s, 1, 0, DIF, 1, 0, 6, M, WORK, 1, 0, IWORK, 1, 0 ); // eslint-disable-line max-len
	assert.strictEqual( info, tc.info, 'info' );
	assert.strictEqual( M[ 0 ], tc.M, 'M' );
	assertArrayClose( s, tc.S, 1e-13, 'S' );
	assertArrayClose( DIF, tc.DIF, 1e-13, 'DIF' );
});

/**
* Setup3x3.
*
* @private
* @returns {*} result
*/
function setup3x3() {
	const ld = 6;
	const N = 3;
	const A = new Float64Array( ld * N );
	const B = new Float64Array( ld * N );

	// Column-major: A[i + j*ld]
	A[ 0 + 0 * ld ] = 1.0; A[ 0 + 1 * ld ] = 0.5; A[ 0 + 2 * ld ] = 0.3;
	A[ 1 + 1 * ld ] = 2.0; A[ 1 + 2 * ld ] = 0.4;
	A[ 2 + 2 * ld ] = 3.0;
	B[ 0 + 0 * ld ] = 1.0; B[ 0 + 1 * ld ] = 0.2; B[ 0 + 2 * ld ] = 0.1;
	B[ 1 + 1 * ld ] = 1.5; B[ 1 + 2 * ld ] = 0.3;
	B[ 2 + 2 * ld ] = 2.0;
	return {
		'A': A,
		'B': B,
		'VL': identity( ld, N ),
		'VR': identity( ld, N ),
		'N': N,
		'ld': ld
	}; // eslint-disable-line max-len
}

test( 'dtgsna: n3_eig_all', function t() {

	const tc = findCase( 'n3_eig_all' );
	const ctx = setup3x3();
	const s = new Float64Array( 6 );
	const DIF = new Float64Array( 6 );
	const WORK = new Float64Array( 500 );
	const IWORK = new Int32Array( 500 );
	const SELECT = new Uint8Array( 6 );
	const M = new Int32Array( 1 );
	const info = dtgsna( 'eigenvalues', 'all', SELECT, 1, 0, ctx.N, ctx.A, 1, ctx.ld, 0, ctx.B, 1, ctx.ld, 0, ctx.VL, 1, ctx.ld, 0, ctx.VR, 1, ctx.ld, 0, s, 1, 0, DIF, 1, 0, 6, M, WORK, 1, 0, IWORK, 1, 0 ); // eslint-disable-line max-len
	assert.strictEqual( info, tc.info, 'info' );
	assert.strictEqual( M[ 0 ], tc.M, 'M' );
	assertArrayClose( s, tc.S, 1e-13, 'S' );
});

test( 'dtgsna: n3_vec_all', function t() {

	const tc = findCase( 'n3_vec_all' );
	const ctx = setup3x3();
	const s = new Float64Array( 6 );
	const DIF = new Float64Array( 6 );
	const WORK = new Float64Array( 500 );
	const IWORK = new Int32Array( 500 );
	const SELECT = new Uint8Array( 6 );
	const M = new Int32Array( 1 );
	const info = dtgsna( 'eigenvectors', 'all', SELECT, 1, 0, ctx.N, ctx.A, 1, ctx.ld, 0, ctx.B, 1, ctx.ld, 0, ctx.VL, 1, ctx.ld, 0, ctx.VR, 1, ctx.ld, 0, s, 1, 0, DIF, 1, 0, 6, M, WORK, 1, 0, IWORK, 1, 0 ); // eslint-disable-line max-len
	assert.strictEqual( info, tc.info, 'info' );
	assert.strictEqual( M[ 0 ], tc.M, 'M' );
	assertArrayClose( DIF, tc.DIF, 1e-13, 'DIF' );
});

test( 'dtgsna: n3_both_all', function t() {

	const tc = findCase( 'n3_both_all' );
	const ctx = setup3x3();
	const s = new Float64Array( 6 );
	const DIF = new Float64Array( 6 );
	const WORK = new Float64Array( 500 );
	const IWORK = new Int32Array( 500 );
	const SELECT = new Uint8Array( 6 );
	const M = new Int32Array( 1 );
	const info = dtgsna( 'both', 'all', SELECT, 1, 0, ctx.N, ctx.A, 1, ctx.ld, 0, ctx.B, 1, ctx.ld, 0, ctx.VL, 1, ctx.ld, 0, ctx.VR, 1, ctx.ld, 0, s, 1, 0, DIF, 1, 0, 6, M, WORK, 1, 0, IWORK, 1, 0 ); // eslint-disable-line max-len
	assert.strictEqual( info, tc.info, 'info' );
	assert.strictEqual( M[ 0 ], tc.M, 'M' );
	assertArrayClose( s, tc.S, 1e-13, 'S' );
	assertArrayClose( DIF, tc.DIF, 1e-13, 'DIF' );
});

test( 'dtgsna: n3_both_selected', function t() {

	const tc = findCase( 'n3_both_selected' );
	const ctx = setup3x3();
	const s = new Float64Array( 6 );
	const DIF = new Float64Array( 6 );
	const WORK = new Float64Array( 500 );
	const IWORK = new Int32Array( 500 );
	const SELECT = new Uint8Array( 6 );
	SELECT[ 0 ] = 1;
	SELECT[ 2 ] = 1;
	const M = new Int32Array( 1 );
	const info = dtgsna( 'both', 'selected', SELECT, 1, 0, ctx.N, ctx.A, 1, ctx.ld, 0, ctx.B, 1, ctx.ld, 0, ctx.VL, 1, ctx.ld, 0, ctx.VR, 1, ctx.ld, 0, s, 1, 0, DIF, 1, 0, 6, M, WORK, 1, 0, IWORK, 1, 0 ); // eslint-disable-line max-len
	assert.strictEqual( info, tc.info, 'info' );
	assert.strictEqual( M[ 0 ], tc.M, 'M' );
	assertArrayClose( s, tc.S, 1e-13, 'S' );
	assertArrayClose( DIF, tc.DIF, 1e-13, 'DIF' );
});

test( 'dtgsna: n0', function t() {

	const tc = findCase( 'n0' );
	const ld = 6;
	const A = new Float64Array( ld );
	const B = new Float64Array( ld );
	const VL = new Float64Array( ld );
	const VR = new Float64Array( ld );
	const s = new Float64Array( 6 );
	const DIF = new Float64Array( 6 );
	const WORK = new Float64Array( 500 );
	const IWORK = new Int32Array( 500 );
	const SELECT = new Uint8Array( 6 );
	const M = new Int32Array( 1 );
	M[ 0 ] = 99;
	const info = dtgsna( 'both', 'all', SELECT, 1, 0, 0, A, 1, ld, 0, B, 1, ld, 0, VL, 1, ld, 0, VR, 1, ld, 0, s, 1, 0, DIF, 1, 0, 6, M, WORK, 1, 0, IWORK, 1, 0 ); // eslint-disable-line max-len
	assert.strictEqual( info, tc.info, 'info' );
	assert.strictEqual( M[ 0 ], tc.M, 'M' );
});

test( 'dtgsna: n2_diag_both', function t() {

	const tc = findCase( 'n2_diag_both' );
	const ld = 6;
	const N = 2;
	const A = new Float64Array( ld * N );
	const B = new Float64Array( ld * N );
	A[ 0 + 0 * ld ] = 2.0;
	A[ 1 + 1 * ld ] = 5.0;
	B[ 0 + 0 * ld ] = 1.0;
	B[ 1 + 1 * ld ] = 2.0;
	const VL = identity( ld, N );
	const VR = identity( ld, N );
	const s = new Float64Array( 6 );
	const DIF = new Float64Array( 6 );
	const WORK = new Float64Array( 500 );
	const IWORK = new Int32Array( 500 );
	const SELECT = new Uint8Array( 6 );
	const M = new Int32Array( 1 );
	const info = dtgsna( 'both', 'all', SELECT, 1, 0, N, A, 1, ld, 0, B, 1, ld, 0, VL, 1, ld, 0, VR, 1, ld, 0, s, 1, 0, DIF, 1, 0, 6, M, WORK, 1, 0, IWORK, 1, 0 ); // eslint-disable-line max-len
	assert.strictEqual( info, tc.info, 'info' );
	assert.strictEqual( M[ 0 ], tc.M, 'M' );
	assertArrayClose( s, tc.S, 1e-13, 'S' );
	assertArrayClose( DIF, tc.DIF, 1e-13, 'DIF' );
});

// Suppress unused warning
void colMajor;
