/**
* @license Apache-2.0
*
* Copyright (c) 2025 The Stdlib Authors.
*/

/* eslint-disable no-restricted-syntax, stdlib/first-unit-test, max-lines */

// MODULES //

import { readFileSync } from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import assert from 'node:assert/strict';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import zlasyfRook from './../lib/ndarray.js';


// FIXTURES //

var fixtureDir = path.join( import.meta.dirname, '..', '..', '..', '..', '..', 'test', 'fixtures' );
var rawLines = readFileSync( path.join( fixtureDir, 'zlasyf_rook.jsonl' ), 'utf8' ).trim().split( '\n' ); // eslint-disable-line node/no-sync, max-len
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
* Converts Fortran 1-based IPIV with negative 2x2 encoding to JS bitwise-NOT convention.
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

/**
* Builds a Complex128Array from an `(i, j, re, im)` entry list (column-major, leading dimension `n`).
*
* @private
* @param {integer} n - matrix order
* @param {Array} entries - list of `[i, j, re, im]` entries
* @returns {Complex128Array} matrix
*/
function buildMatrix( n, entries ) {
	var view;
	var arr;
	var idx;
	var im;
	var re;
	var i;
	var j;
	var t;
	arr = new Complex128Array( n * n );
	view = reinterpret( arr, 0 );
	for ( t = 0; t < entries.length; t++ ) {
		i = entries[ t ][ 0 ];
		j = entries[ t ][ 1 ];
		re = entries[ t ][ 2 ];
		im = entries[ t ][ 3 ];
		idx = 2 * ( i + ( j * n ) );
		view[ idx ] = re;
		view[ idx + 1 ] = im;
	}
	return arr;
}

/**
* Runs a single fixture-based test case.
*
* @private
* @param {string} name - fixture name
* @param {string} uplo - `'upper'` or `'lower'`
* @param {NonNegativeInteger} N - matrix order
* @param {NonNegativeInteger} nb - block size
* @param {Array} entries - list of `[i, j, re, im]` non-zero entries
*/
function runCase( name, uplo, N, nb, entries ) {
	var result;
	var IPIV;
	var Av;
	var tc;
	var A;
	var W;

	tc = findCase( name );
	A = buildMatrix( N, entries );
	IPIV = new Int32Array( N );
	W = new Complex128Array( N * Math.max( nb, 1 ) );
	result = zlasyfRook( uplo, N, nb, A, 1, N, 0, IPIV, 1, 0, W, 1, N, 0 );
	Av = reinterpret( A, 0 );
	assertArrayClose( Av, tc.A, 1e-12, name + ':A' );
	assert.equal( result.info, tc.info, name + ':info' );
	assert.equal( result.kb, tc.kb, name + ':kb' );
	assert.deepEqual( toArray( IPIV ), convertIPIV( tc.ipiv ), name + ':ipiv' );
}


// TESTS //

test( 'zlasyf_rook: lower 6x6 nb=3 partial panel', function t() {
	runCase( 'lower_6x6_nb3', 'lower', 6, 3, [
		[ 0, 0, 0.01, 0.01 ],
		[ 1, 0, 5.0, -1.0 ],
		[ 1, 1, 0.02, -0.02 ],
		[ 2, 0, 1.0, 1.0 ],
		[ 2, 1, 2.0, -1.0 ],
		[ 2, 2, 8.0, 0.5 ],
		[ 3, 0, 0.5, -0.5 ],
		[ 3, 1, 1.0, 1.0 ],
		[ 3, 2, 3.0, 0.3 ],
		[ 3, 3, 7.0, -0.2 ],
		[ 4, 0, 2.0, 0.2 ],
		[ 4, 1, 1.5, -0.5 ],
		[ 4, 2, 0.0, 2.0 ],
		[ 4, 3, 1.0, 0.5 ],
		[ 4, 4, 6.0, 0.1 ],
		[ 5, 0, 1.0, -1.0 ],
		[ 5, 1, 0.0, -3.0 ],
		[ 5, 2, 1.0, 0.4 ],
		[ 5, 3, 2.0, -2.0 ],
		[ 5, 4, 0.5, 1.0 ],
		[ 5, 5, 5.0, 0.3 ]
	]);
});

test( 'zlasyf_rook: upper 6x6 nb=3 partial panel', function t() {
	runCase( 'upper_6x6_nb3', 'upper', 6, 3, [
		[ 0, 0, 0.01, 0.01 ],
		[ 0, 1, 5.0, -1.0 ],
		[ 1, 1, 0.02, -0.02 ],
		[ 0, 2, 1.0, 1.0 ],
		[ 1, 2, 2.0, -1.0 ],
		[ 2, 2, 8.0, 0.5 ],
		[ 0, 3, 0.5, -0.5 ],
		[ 1, 3, 1.0, 1.0 ],
		[ 2, 3, 3.0, 0.3 ],
		[ 3, 3, 7.0, -0.2 ],
		[ 0, 4, 2.0, 0.2 ],
		[ 1, 4, 1.5, -0.5 ],
		[ 2, 4, 0.0, 2.0 ],
		[ 3, 4, 1.0, 0.5 ],
		[ 4, 4, 6.0, 0.1 ],
		[ 0, 5, 1.0, -1.0 ],
		[ 1, 5, 0.0, -3.0 ],
		[ 2, 5, 1.0, 0.4 ],
		[ 3, 5, 2.0, -2.0 ],
		[ 4, 5, 0.5, 1.0 ],
		[ 5, 5, 5.0, 0.3 ]
	]);
});

test( 'zlasyf_rook: lower 4x4 full factorization (nb >= N)', function t() {
	runCase( 'lower_4x4_full_nb8', 'lower', 4, 8, [
		[ 0, 0, 4.0, 0.2 ],
		[ 1, 0, 1.0, 0.5 ],
		[ 1, 1, 3.0, -0.1 ],
		[ 2, 0, 2.0, -1.0 ],
		[ 2, 1, 0.5, -0.2 ],
		[ 2, 2, 5.0, 0.3 ],
		[ 3, 0, 0.5, 0.1 ],
		[ 3, 1, 1.0, 0.3 ],
		[ 3, 2, 0.2, -0.4 ],
		[ 3, 3, 6.0, -0.25 ]
	]);
});

test( 'zlasyf_rook: upper 4x4 full factorization (nb >= N)', function t() {
	runCase( 'upper_4x4_full_nb8', 'upper', 4, 8, [
		[ 0, 0, 4.0, 0.2 ],
		[ 0, 1, 1.0, 0.5 ],
		[ 1, 1, 3.0, -0.1 ],
		[ 0, 2, 2.0, -1.0 ],
		[ 1, 2, 0.5, -0.2 ],
		[ 2, 2, 5.0, 0.3 ],
		[ 0, 3, 0.5, 0.1 ],
		[ 1, 3, 1.0, 0.3 ],
		[ 2, 3, 0.2, -0.4 ],
		[ 3, 3, 6.0, -0.25 ]
	]);
});

test( 'zlasyf_rook: lower 5x5 rook chase full (P != K at 2x2 step)', function t() {
	runCase( 'lower_5x5_chase_full', 'lower', 5, 8, [
		[ 0, 0, 0.1, 0.05 ],
		[ 1, 0, 1.0, -0.2 ],
		[ 2, 0, 2.0, 0.3 ],
		[ 3, 0, 3.0, -0.4 ],
		[ 4, 0, 4.0, 0.5 ],
		[ 1, 1, 0.1, -0.05 ],
		[ 2, 1, 5.0, 0.6 ],
		[ 3, 1, 10.0, -0.7 ],
		[ 4, 1, 20.0, 0.8 ],
		[ 2, 2, 0.1, 0.03 ],
		[ 3, 2, 50.0, -0.9 ],
		[ 4, 2, 100.0, 1.0 ],
		[ 3, 3, 0.1, -0.03 ],
		[ 4, 3, 500.0, 1.1 ],
		[ 4, 4, 0.1, 0.07 ]
	]);
});

test( 'zlasyf_rook: upper 5x5 rook chase full (P != K at 2x2 step)', function t() {
	runCase( 'upper_5x5_chase_full', 'upper', 5, 8, [
		[ 0, 0, 0.1, 0.05 ],
		[ 0, 1, 1.0, -0.2 ],
		[ 1, 1, 0.1, -0.05 ],
		[ 0, 2, 2.0, 0.3 ],
		[ 1, 2, 5.0, 0.6 ],
		[ 2, 2, 0.1, 0.03 ],
		[ 0, 3, 3.0, -0.4 ],
		[ 1, 3, 10.0, -0.7 ],
		[ 2, 3, 50.0, -0.9 ],
		[ 3, 3, 0.1, -0.03 ],
		[ 0, 4, 4.0, 0.5 ],
		[ 1, 4, 20.0, 0.8 ],
		[ 2, 4, 100.0, 1.0 ],
		[ 3, 4, 500.0, 1.1 ],
		[ 4, 4, 0.1, 0.07 ]
	]);
});

test( 'zlasyf_rook: lower 5x5 rook chase nb=3 partial', function t() {
	runCase( 'lower_5x5_chase_nb3', 'lower', 5, 3, [
		[ 0, 0, 0.1, 0.05 ],
		[ 1, 0, 1.0, -0.2 ],
		[ 2, 0, 2.0, 0.3 ],
		[ 3, 0, 3.0, -0.4 ],
		[ 4, 0, 4.0, 0.5 ],
		[ 1, 1, 0.1, -0.05 ],
		[ 2, 1, 5.0, 0.6 ],
		[ 3, 1, 10.0, -0.7 ],
		[ 4, 1, 20.0, 0.8 ],
		[ 2, 2, 0.1, 0.03 ],
		[ 3, 2, 50.0, -0.9 ],
		[ 4, 2, 100.0, 1.0 ],
		[ 3, 3, 0.1, -0.03 ],
		[ 4, 3, 500.0, 1.1 ],
		[ 4, 4, 0.1, 0.07 ]
	]);
});

test( 'zlasyf_rook: upper 5x5 rook chase nb=3 partial', function t() {
	runCase( 'upper_5x5_chase_nb3', 'upper', 5, 3, [
		[ 0, 0, 0.1, 0.05 ],
		[ 0, 1, 1.0, -0.2 ],
		[ 1, 1, 0.1, -0.05 ],
		[ 0, 2, 2.0, 0.3 ],
		[ 1, 2, 5.0, 0.6 ],
		[ 2, 2, 0.1, 0.03 ],
		[ 0, 3, 3.0, -0.4 ],
		[ 1, 3, 10.0, -0.7 ],
		[ 2, 3, 50.0, -0.9 ],
		[ 3, 3, 0.1, -0.03 ],
		[ 0, 4, 4.0, 0.5 ],
		[ 1, 4, 20.0, 0.8 ],
		[ 2, 4, 100.0, 1.0 ],
		[ 3, 4, 500.0, 1.1 ],
		[ 4, 4, 0.1, 0.07 ]
	]);
});

test( 'zlasyf_rook: lower 4x4 singular (info > 0)', function t() {
	runCase( 'lower_4x4_singular_full', 'lower', 4, 8, [
		[ 0, 0, 4.0, 0.2 ],
		[ 1, 0, 1.0, 0.5 ],
		[ 1, 1, 3.0, -0.1 ],
		[ 3, 0, 0.5, 0.1 ],
		[ 3, 1, 1.0, 0.3 ],
		[ 3, 3, 6.0, -0.25 ]
	]);
});

test( 'zlasyf_rook: upper 4x4 singular (info > 0)', function t() {
	runCase( 'upper_4x4_singular_full', 'upper', 4, 8, [
		[ 0, 0, 4.0, 0.2 ],
		[ 0, 1, 1.0, 0.5 ],
		[ 1, 1, 3.0, -0.1 ],
		[ 0, 3, 0.5, 0.1 ],
		[ 1, 3, 1.0, 0.3 ],
		[ 3, 3, 6.0, -0.25 ]
	]);
});

test( 'zlasyf_rook: N=0 quick return', function t() {
	var result;
	var IPIV;
	var A;
	var W;

	IPIV = new Int32Array( 1 );
	A = new Complex128Array( 1 );
	W = new Complex128Array( 1 );
	result = zlasyfRook( 'upper', 0, 1, A, 1, 1, 0, IPIV, 1, 0, W, 1, 1, 0 );
	assert.equal( result.info, 0, 'info' );
	assert.equal( result.kb, 0, 'kb' );

	result = zlasyfRook( 'lower', 0, 1, A, 1, 1, 0, IPIV, 1, 0, W, 1, 1, 0 );
	assert.equal( result.info, 0, 'info' );
	assert.equal( result.kb, 0, 'kb' );
});

test( 'zlasyf_rook: N=1 trivial single column', function t() {
	var result;
	var IPIV;
	var Av;
	var A;
	var W;

	IPIV = new Int32Array( 1 );
	A = new Complex128Array( 1 );
	Av = reinterpret( A, 0 );
	W = new Complex128Array( 1 );

	Av[ 0 ] = 2.0;
	Av[ 1 ] = 0.5;
	result = zlasyfRook( 'upper', 1, 1, A, 1, 1, 0, IPIV, 1, 0, W, 1, 1, 0 );
	assert.equal( result.info, 0, 'info' );
	assert.equal( result.kb, 1, 'kb' );
	assert.equal( IPIV[ 0 ], 0, 'ipiv[0]' );
	assertClose( Av[ 0 ], 2.0, 1e-14, 'A[0,0].re' );
	assertClose( Av[ 1 ], 0.5, 1e-14, 'A[0,0].im' );

	Av[ 0 ] = 2.0;
	Av[ 1 ] = 0.5;
	IPIV[ 0 ] = 0;
	result = zlasyfRook( 'lower', 1, 1, A, 1, 1, 0, IPIV, 1, 0, W, 1, 1, 0 );
	assert.equal( result.info, 0, 'info' );
	assert.equal( result.kb, 1, 'kb' );
});
