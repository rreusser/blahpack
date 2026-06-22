/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import { readFileSync } from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import dlasyfRk from './../lib/ndarray.js';


// FIXTURES //

var fixtureDir = path.join( import.meta.dirname, '..', '..', '..', '..', '..', 'test', 'fixtures' );
var rawLines = readFileSync( path.join( fixtureDir, 'dlasyf_rk.jsonl' ), 'utf8' ).trim().split( '\n' ); // eslint-disable-line node/no-sync, max-len
var FIXTURES = rawLines.map( function parse( line ) {
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
	var relErr = Math.abs( actual - expected ) / Math.max( Math.abs( expected ), 1.0 ); // eslint-disable-line max-len
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
	var i;
	assert.equal( actual.length, expected.length, format( '%s: length mismatch', msg ) );
	for ( i = 0; i < expected.length; i++ ) {
		assertClose( actual[ i ], expected[ i ], tol, format( '%s[%d]', msg, i ) );
	}
}

/**
* Converts Fortran 1-based IPIV with negative 2x2 encoding to JS 0-based IPIV using bitwise NOT convention.
*
* @private
* @param {ArrayLikeObject} fipiv - Fortran IPIV values
* @returns {Array} JS IPIV values
*/
function convertIPIV( fipiv ) {
	var out = [];
	var i;
	for ( i = 0; i < fipiv.length; i++ ) {
		if ( fipiv[ i ] > 0 ) {
			out.push( fipiv[ i ] - 1 );
		} else if ( fipiv[ i ] < 0 ) {
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
	var out = [];
	var i;
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
	var i;
	for ( i = 0; i < FIXTURES.length; i++ ) {
		if ( FIXTURES[ i ].name === name ) {
			return FIXTURES[ i ];
		}
	}
	throw new Error( format( 'fixture not found: %s', name ) );
}


// TESTS //

test( 'dlasyf_rk: 6x6_lower_nb3', function t() {
	var result;
	var ipiv;
	var tc;
	var A;
	var W;
	var E;

	tc = findCase( '6x6_lower_nb3' );
	A = new Float64Array( 36 );
	A[ 0 ] = 2;
	A[ 1 ] = -1;
	A[ 3 ] = 1;
	A[ 7 ] = 3;
	A[ 8 ] = -1;
	A[ 10 ] = 1;
	A[ 14 ] = 2;
	A[ 15 ] = -1;
	A[ 17 ] = 1;
	A[ 21 ] = 4;
	A[ 22 ] = -1;
	A[ 28 ] = 3;
	A[ 29 ] = -1;
	A[ 35 ] = 2;
	ipiv = new Int32Array( 6 );
	W = new Float64Array( 18 );
	E = new Float64Array( 6 );
	result = dlasyfRk( 'lower', 6, 3, A, 1, 6, 0, E, 1, 0, ipiv, 1, 0, W, 1, 6, 0 );
	assertArrayClose( A, tc.a, 1e-13, 'a' );
	assertArrayClose( E, tc.e, 1e-13, 'e' );
	assert.equal( result.info, tc.info, 'info' );
	assert.equal( result.kb, tc.kb, 'kb' );
	assert.deepEqual( toArray( ipiv ), convertIPIV( tc.ipiv ), 'ipiv' );
});

test( 'dlasyf_rk: 6x6_upper_nb3', function t() {
	var result;
	var ipiv;
	var tc;
	var A;
	var W;
	var E;

	tc = findCase( '6x6_upper_nb3' );
	A = new Float64Array( 36 );
	A[ 0 ] = 2;
	A[ 6 ] = -1;
	A[ 7 ] = 3;
	A[ 13 ] = -1;
	A[ 14 ] = 2;
	A[ 18 ] = 1;
	A[ 21 ] = 4;
	A[ 25 ] = 1;
	A[ 27 ] = -1;
	A[ 28 ] = 3;
	A[ 32 ] = 1;
	A[ 34 ] = -1;
	A[ 35 ] = 2;
	ipiv = new Int32Array( 6 );
	W = new Float64Array( 18 );
	E = new Float64Array( 6 );
	result = dlasyfRk( 'upper', 6, 3, A, 1, 6, 0, E, 1, 0, ipiv, 1, 0, W, 1, 6, 0 );
	assertArrayClose( A, tc.a, 1e-13, 'a' );
	assertArrayClose( E, tc.e, 1e-13, 'e' );
	assert.equal( result.info, tc.info, 'info' );
	assert.equal( result.kb, tc.kb, 'kb' );
	assert.deepEqual( toArray( ipiv ), convertIPIV( tc.ipiv ), 'ipiv' );
});

test( 'dlasyf_rk: 6x6_indef_lower_nb3', function t() {
	var result;
	var ipiv;
	var tc;
	var A;
	var W;
	var E;

	tc = findCase( '6x6_indef_lower_nb3' );
	A = new Float64Array( 36 );
	A[ 0 ] = 0;
	A[ 1 ] = 3;
	A[ 2 ] = 1;
	A[ 3 ] = 2;
	A[ 5 ] = 1;
	A[ 7 ] = 0;
	A[ 8 ] = 2;
	A[ 9 ] = 1;
	A[ 10 ] = 3;
	A[ 14 ] = 0;
	A[ 15 ] = 1;
	A[ 16 ] = 2;
	A[ 17 ] = 3;
	A[ 21 ] = 5;
	A[ 22 ] = 1;
	A[ 23 ] = 2;
	A[ 28 ] = 0;
	A[ 29 ] = 1;
	A[ 35 ] = 0;
	ipiv = new Int32Array( 6 );
	W = new Float64Array( 18 );
	E = new Float64Array( 6 );
	result = dlasyfRk( 'lower', 6, 3, A, 1, 6, 0, E, 1, 0, ipiv, 1, 0, W, 1, 6, 0 );
	assertArrayClose( A, tc.a, 1e-13, 'a' );
	assertArrayClose( E, tc.e, 1e-13, 'e' );
	assert.equal( result.info, tc.info, 'info' );
	assert.equal( result.kb, tc.kb, 'kb' );
	assert.deepEqual( toArray( ipiv ), convertIPIV( tc.ipiv ), 'ipiv' );
});

test( 'dlasyf_rk: 6x6_indef_upper_nb3', function t() {
	var result;
	var ipiv;
	var tc;
	var A;
	var W;
	var E;

	tc = findCase( '6x6_indef_upper_nb3' );
	A = new Float64Array( 36 );
	A[ 0 ] = 0;
	A[ 6 ] = 3;
	A[ 7 ] = 0;
	A[ 12 ] = 1;
	A[ 13 ] = 2;
	A[ 14 ] = 0;
	A[ 18 ] = 2;
	A[ 19 ] = 1;
	A[ 20 ] = 1;
	A[ 21 ] = 5;
	A[ 24 ] = 0;
	A[ 25 ] = 3;
	A[ 26 ] = 2;
	A[ 27 ] = 1;
	A[ 28 ] = 0;
	A[ 30 ] = 1;
	A[ 31 ] = 0;
	A[ 32 ] = 3;
	A[ 33 ] = 2;
	A[ 34 ] = 1;
	A[ 35 ] = 0;
	ipiv = new Int32Array( 6 );
	W = new Float64Array( 18 );
	E = new Float64Array( 6 );
	result = dlasyfRk( 'upper', 6, 3, A, 1, 6, 0, E, 1, 0, ipiv, 1, 0, W, 1, 6, 0 );
	assertArrayClose( A, tc.a, 1e-13, 'a' );
	assertArrayClose( E, tc.e, 1e-13, 'e' );
	assert.equal( result.info, tc.info, 'info' );
	assert.equal( result.kb, tc.kb, 'kb' );
	assert.deepEqual( toArray( ipiv ), convertIPIV( tc.ipiv ), 'ipiv' );
});

test( 'dlasyf_rk: 4x4_lower_full_nb8', function t() {
	var result;
	var ipiv;
	var tc;
	var A;
	var W;
	var E;

	tc = findCase( '4x4_lower_full_nb8' );
	A = new Float64Array( 16 );
	A[ 0 ] = 4;
	A[ 1 ] = 1;
	A[ 2 ] = 2;
	A[ 3 ] = 0.5;
	A[ 5 ] = 3;
	A[ 6 ] = 0.5;
	A[ 7 ] = 1;
	A[ 10 ] = 5;
	A[ 11 ] = 0.2;
	A[ 15 ] = 6;
	ipiv = new Int32Array( 4 );
	W = new Float64Array( 32 );
	E = new Float64Array( 4 );
	result = dlasyfRk( 'lower', 4, 8, A, 1, 4, 0, E, 1, 0, ipiv, 1, 0, W, 1, 4, 0 );
	assertArrayClose( A, tc.a, 1e-13, 'a' );
	assertArrayClose( E, tc.e, 1e-13, 'e' );
	assert.equal( result.info, tc.info, 'info' );
	assert.equal( result.kb, tc.kb, 'kb' );
	assert.deepEqual( toArray( ipiv ), convertIPIV( tc.ipiv ), 'ipiv' );
});

test( 'dlasyf_rk: 4x4_upper_full_nb8', function t() {
	var result;
	var ipiv;
	var tc;
	var A;
	var W;
	var E;

	tc = findCase( '4x4_upper_full_nb8' );
	A = new Float64Array( 16 );
	A[ 0 ] = 4;
	A[ 4 ] = 1;
	A[ 5 ] = 3;
	A[ 8 ] = 2;
	A[ 9 ] = 0.5;
	A[ 10 ] = 5;
	A[ 12 ] = 0.5;
	A[ 13 ] = 1;
	A[ 14 ] = 0.2;
	A[ 15 ] = 6;
	ipiv = new Int32Array( 4 );
	W = new Float64Array( 32 );
	E = new Float64Array( 4 );
	result = dlasyfRk( 'upper', 4, 8, A, 1, 4, 0, E, 1, 0, ipiv, 1, 0, W, 1, 4, 0 );
	assertArrayClose( A, tc.a, 1e-13, 'a' );
	assertArrayClose( E, tc.e, 1e-13, 'e' );
	assert.equal( result.info, tc.info, 'info' );
	assert.equal( result.kb, tc.kb, 'kb' );
	assert.deepEqual( toArray( ipiv ), convertIPIV( tc.ipiv ), 'ipiv' );
});
