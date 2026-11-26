/**
* @license Apache-2.0
*
* Copyright (c) 2026 Ricky Reusser.
*
* Derived from the LAPACK 3.12.0 reference implementation (BSD-3-Clause).
*/

/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import { readFileSync } from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import dlasyfRook from './../lib/ndarray.js';


// FIXTURES //

const fixtureDir = path.join( import.meta.dirname, '..', '..', '..', '..', '..', 'test', 'fixtures' );
const rawLines = readFileSync( path.join( fixtureDir, 'dlasyf_rook.jsonl' ), 'utf8' ).trim().split( '\n' ); // eslint-disable-line node/no-sync, max-len
const FIXTURES = rawLines.map( function parse( line ) {
	return JSON.parse( line );
});


// FUNCTIONS //

/**
* Asserts that two numbers are approximately equal.
*
* @private
* @param {number} actual - actual value
* @param {number} expected - expected value
* @param {number} tol - tolerance
* @param {string} msg - assertion message
*/
function assertClose( actual, expected, tol, msg ) {
	const relErr = Math.abs( actual - expected ) / Math.max( Math.abs( expected ), 1.0 ); // eslint-disable-line max-len
	assert.ok( relErr <= tol, format( '%s: expected %s, got %s', msg, expected, actual ) );
}

/**
* Asserts that two arrays are element-wise approximately equal.
*
* @private
* @param {ArrayLikeObject} actual - actual value
* @param {ArrayLikeObject} expected - expected value
* @param {number} tol - tolerance
* @param {string} msg - assertion message
*/
function assertArrayClose( actual, expected, tol, msg ) {
	let i;
	assert.equal( actual.length, expected.length, format( '%s: length mismatch', msg ) );
	for ( i = 0; i < expected.length; i++ ) {
		assertClose( actual[ i ], expected[ i ], tol, format( '%s[%d]', msg, i ) );
	}
}

/**
* Converts Fortran 1-based IPIV with negative 2x2 encoding to JS bitwise-NOT convention.
*
* @private
* @param {ArrayLikeObject} fipiv - Fortran IPIV values
* @returns {Array} JS IPIV values
*/
function convertIPIV( fipiv ) {
	const out = [];
	let i;
	for ( i = 0; i < fipiv.length; i++ ) {
		if ( fipiv[ i ] > 0 ) {
			out.push( fipiv[ i ] - 1 );
		} else if ( fipiv[ i ] < 0 ) {
			// Fortran -p → JS ~(p-1) which equals -p numerically
			out.push( fipiv[ i ] );
		} else {
			out.push( 0 );
		}
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
	const out = [];
	let i;
	for ( i = 0; i < arr.length; i++ ) {
		out.push( arr[ i ] );
	}
	return out;
}

/**
* Returns a fixture by name.
*
* @private
* @param {string} name - case name
* @throws {Error} must be a known fixture
* @returns {Object} fixture record
*/
function findCase( name ) {
	let i;
	for ( i = 0; i < FIXTURES.length; i++ ) {
		if ( FIXTURES[ i ].name === name ) {
			return FIXTURES[ i ];
		}
	}
	throw new Error( format( 'fixture not found: %s', name ) );
}

/**
* Runs a fixture-based test case.
*
* @private
* @param {string} name - fixture name
* @param {string} uplo - upper or lower
* @param {NonNegativeInteger} N - matrix order
* @param {NonNegativeInteger} nb - block size
* @param {Array} aInit - initial column-major A entries
*/
function runCase( name, uplo, N, nb, aInit ) {
	const kb = new Int32Array( 1 );
	let i;

	const tc = findCase( name );
	const A = new Float64Array( N * N );
	for ( i = 0; i < aInit.length; i++ ) {
		A[ i ] = aInit[ i ];
	}
	const ipiv = new Int32Array( N );
	const W = new Float64Array( N * Math.max( nb, 1 ) );

	const result = dlasyfRook( uplo, N, nb, kb, A, 1, N, 0, ipiv, 1, 0, W, 1, N, 0 );
	assertArrayClose( A, tc.a, 1e-12, name + ':a' );
	assert.equal( result, tc.info, name + ':info' );
	assert.equal( kb[ 0 ], tc.kb, name + ':kb' );
	assert.deepEqual( toArray( ipiv ), convertIPIV( tc.ipiv ), name + ':ipiv' );
}


// TESTS //

test( 'dlasyf_rook: 6x6 lower nb=3 partial panel', function t() {
	runCase( '6x6_lower_nb3', 'lower', 6, 3, [
		2, -1, 0, 1, 0, 0,
		0, 3, -1, 0, 1, 0,
		0, 0, 2, -1, 0, 1,
		0, 0, 0, 4, -1, 0,
		0, 0, 0, 0, 3, -1,
		0, 0, 0, 0, 0, 2
	]);
});

test( 'dlasyf_rook: 6x6 upper nb=3 partial panel', function t() {
	runCase( '6x6_upper_nb3', 'upper', 6, 3, [
		2, 0, 0, 0, 0, 0,
		-1, 3, 0, 0, 0, 0,
		0, -1, 2, 0, 0, 0,
		1, 0, 0, 4, 0, 0,
		0, 1, 0, -1, 3, 0,
		0, 0, 1, 0, -1, 2
	]);
});

test( 'dlasyf_rook: 6x6 indef lower nb=3 (zero diag, forces 2x2 pivots)', function t() {
	runCase( '6x6_indef_lower_nb3', 'lower', 6, 3, [
		0, 3, 1, 2, 0, 1,
		0, 0, 2, 1, 3, 0,
		0, 0, 0, 1, 2, 3,
		0, 0, 0, 5, 1, 2,
		0, 0, 0, 0, 0, 1,
		0, 0, 0, 0, 0, 0
	]);
});

test( 'dlasyf_rook: 6x6 indef upper nb=3', function t() {
	runCase( '6x6_indef_upper_nb3', 'upper', 6, 3, [
		0, 0, 0, 0, 0, 0,
		3, 0, 0, 0, 0, 0,
		1, 2, 0, 0, 0, 0,
		2, 1, 1, 5, 0, 0,
		0, 3, 2, 1, 0, 0,
		1, 0, 3, 2, 1, 0
	]);
});

test( 'dlasyf_rook: 4x4 lower full factorization (nb >= N)', function t() {
	runCase( '4x4_lower_full_nb8', 'lower', 4, 8, [
		4, 1, 2, 0.5,
		0, 3, 0.5, 1,
		0, 0, 5, 0.2,
		0, 0, 0, 6
	]);
});

test( 'dlasyf_rook: 4x4 upper full factorization (nb >= N)', function t() {
	runCase( '4x4_upper_full_nb8', 'upper', 4, 8, [
		4, 0, 0, 0,
		1, 3, 0, 0,
		2, 0.5, 5, 0,
		0.5, 1, 0.2, 6
	]);
});

test( 'dlasyf_rook: 5x5 rook chase lower full (P != K at 2x2 step)', function t() {
	runCase( '5x5_chase_lower_full', 'lower', 5, 8, [
		0.1, 1, 2, 3, 4,
		0, 0.1, 5, 10, 20,
		0, 0, 0.1, 50, 100,
		0, 0, 0, 0.1, 500,
		0, 0, 0, 0, 0.1
	]);
});

test( 'dlasyf_rook: 5x5 rook chase upper full (P != K at 2x2 step)', function t() {
	runCase( '5x5_chase_upper_full', 'upper', 5, 8, [
		0.1, 0, 0, 0, 0,
		1, 0.1, 0, 0, 0,
		2, 5, 0.1, 0, 0,
		3, 10, 50, 0.1, 0,
		4, 20, 100, 500, 0.1
	]);
});

test( 'dlasyf_rook: 5x5 rook chase lower nb=3 partial', function t() {
	runCase( '5x5_chase_lower_nb3', 'lower', 5, 3, [
		0.1, 1, 2, 3, 4,
		0, 0.1, 5, 10, 20,
		0, 0, 0.1, 50, 100,
		0, 0, 0, 0.1, 500,
		0, 0, 0, 0, 0.1
	]);
});

test( 'dlasyf_rook: 5x5 rook chase upper nb=3 partial', function t() {
	runCase( '5x5_chase_upper_nb3', 'upper', 5, 3, [
		0.1, 0, 0, 0, 0,
		1, 0.1, 0, 0, 0,
		2, 5, 0.1, 0, 0,
		3, 10, 50, 0.1, 0,
		4, 20, 100, 500, 0.1
	]);
});


// HEAVY ROOK PIVOTING (ticket 0102) //

/**
* Returns an N-by-N symmetric matrix, `a_ij = sin((i+1)(j+1)+i+j)` (0-based `i`, `j`), whose rook-pivot searches take many 2x2 pivots with `p != k`.
*
* @private
* @param {NonNegativeInteger} N - order
* @returns {Float64Array} column-major matrix
*/
function pivotMatrix( N ) {
	const A = new Float64Array( N * N );
	let i;
	let j;
	for ( j = 0; j < N; j++ ) {
		for ( i = 0; i < N; i++ ) {
			A[ i + ( j * N ) ] = Math.sin( ( ( i + 1 ) * ( j + 1 ) ) + i + j );
		}
	}
	return A;
}

/**
* Runs one 40x40, NB = 32 panel on the heavy-pivoting matrix and compares it with the reference fixture.
*
* @private
* @param {string} uplo - `'upper'` or `'lower'`
*/
function checkPivot40( uplo ) {
	const tc = findCase( uplo + '_40x40_pivot40_nb32' );
	const kb = new Int32Array( 1 );
	const N = 40;
	const A = pivotMatrix( N );
	const IPIV = new Int32Array( N );
	const W = new Float64Array( N * 32 );
	const info = dlasyfRook( uplo, N, 32, kb, A, 1, N, 0, IPIV, 1, 0, W, 1, N, 0 );
	assertArrayClose( A, tc.a, 1e-12, 'a' );
	assert.equal( info, tc.info, 'info' );
	assert.equal( kb[ 0 ], tc.kb, 'kb' );
	assert.deepEqual( toArray( IPIV ), convertIPIV( tc.ipiv ), 'ipiv' );
}

test( 'dlasyf_rook: upper 40x40 nb=32 with heavy rook pivoting (2x2 pivots with p != k) matches the reference', function t() {
	checkPivot40( 'upper' );
});

test( 'dlasyf_rook: lower 40x40 nb=32 with heavy rook pivoting (2x2 pivots with p != k) matches the reference', function t() {
	checkPivot40( 'lower' );
});
