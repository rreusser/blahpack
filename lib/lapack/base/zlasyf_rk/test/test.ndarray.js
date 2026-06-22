/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import { readFileSync } from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import assert from 'node:assert/strict';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import zlasyfRk from './../lib/ndarray.js';


// FIXTURES //

var fixtureDir = path.join( import.meta.dirname, '..', '..', '..', '..', '..', 'test', 'fixtures' );
var rawLines = readFileSync( path.join( fixtureDir, 'zlasyf_rk.jsonl' ), 'utf8' ).trim().split( '\n' ); // eslint-disable-line node/no-sync, max-len
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
* Converts Fortran 1-based IPIV with negative 2x2 encoding to JS 0-based IPIV.
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

/**
* Builds a Complex128Array from an (i, j, re, im) entry list (column-major, leading dimension n).
*
* @private
* @param {integer} n - matrix order
* @param {Array} entries - list of [i, j, re, im] entries
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


// TESTS //

test( 'zlasyf_rk: lower_6x6_nb3', function t() {
	var result;
	var IPIV;
	var Av;
	var Ev;
	var tc;
	var A;
	var W;
	var e;

	tc = findCase( 'lower_6x6_nb3' );
	A = buildMatrix( 6, [
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
	IPIV = new Int32Array( 6 );
	W = new Complex128Array( 6 * 3 );
	e = new Complex128Array( 6 );
	result = zlasyfRk( 'lower', 6, 3, A, 1, 6, 0, e, 1, 0, IPIV, 1, 0, W, 1, 6, 0 );
	Av = reinterpret( A, 0 );
	Ev = reinterpret( e, 0 );
	assertArrayClose( Av, tc.A, 1e-12, 'A' );
	assertArrayClose( Ev, tc.e, 1e-12, 'e' );
	assert.equal( result.info, tc.info, 'info' );
	assert.equal( result.kb, tc.kb, 'kb' );
	assert.deepEqual( toArray( IPIV ), convertIPIV( tc.ipiv ), 'ipiv' );
});

test( 'zlasyf_rk: upper_6x6_nb3', function t() {
	var result;
	var IPIV;
	var Av;
	var Ev;
	var tc;
	var A;
	var W;
	var e;

	tc = findCase( 'upper_6x6_nb3' );
	A = buildMatrix( 6, [
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
	IPIV = new Int32Array( 6 );
	W = new Complex128Array( 6 * 3 );
	e = new Complex128Array( 6 );
	result = zlasyfRk( 'upper', 6, 3, A, 1, 6, 0, e, 1, 0, IPIV, 1, 0, W, 1, 6, 0 );
	Av = reinterpret( A, 0 );
	Ev = reinterpret( e, 0 );
	assertArrayClose( Av, tc.A, 1e-12, 'A' );
	assertArrayClose( Ev, tc.e, 1e-12, 'e' );
	assert.equal( result.info, tc.info, 'info' );
	assert.equal( result.kb, tc.kb, 'kb' );
	assert.deepEqual( toArray( IPIV ), convertIPIV( tc.ipiv ), 'ipiv' );
});

test( 'zlasyf_rk: lower_4x4_full_nb8', function t() {
	var result;
	var IPIV;
	var Av;
	var Ev;
	var tc;
	var A;
	var W;
	var e;

	tc = findCase( 'lower_4x4_full_nb8' );
	A = buildMatrix( 4, [
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
	IPIV = new Int32Array( 4 );
	W = new Complex128Array( 4 * 8 );
	e = new Complex128Array( 4 );
	result = zlasyfRk( 'lower', 4, 8, A, 1, 4, 0, e, 1, 0, IPIV, 1, 0, W, 1, 4, 0 );
	Av = reinterpret( A, 0 );
	Ev = reinterpret( e, 0 );
	assertArrayClose( Av, tc.A, 1e-12, 'A' );
	assertArrayClose( Ev, tc.e, 1e-12, 'e' );
	assert.equal( result.info, tc.info, 'info' );
	assert.equal( result.kb, tc.kb, 'kb' );
	assert.deepEqual( toArray( IPIV ), convertIPIV( tc.ipiv ), 'ipiv' );
});

test( 'zlasyf_rk: upper_4x4_full_nb8', function t() {
	var result;
	var IPIV;
	var Av;
	var Ev;
	var tc;
	var A;
	var W;
	var e;

	tc = findCase( 'upper_4x4_full_nb8' );
	A = buildMatrix( 4, [
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
	IPIV = new Int32Array( 4 );
	W = new Complex128Array( 4 * 8 );
	e = new Complex128Array( 4 );
	result = zlasyfRk( 'upper', 4, 8, A, 1, 4, 0, e, 1, 0, IPIV, 1, 0, W, 1, 4, 0 );
	Av = reinterpret( A, 0 );
	Ev = reinterpret( e, 0 );
	assertArrayClose( Av, tc.A, 1e-12, 'A' );
	assertArrayClose( Ev, tc.e, 1e-12, 'e' );
	assert.equal( result.info, tc.info, 'info' );
	assert.equal( result.kb, tc.kb, 'kb' );
	assert.deepEqual( toArray( IPIV ), convertIPIV( tc.ipiv ), 'ipiv' );
});
