/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import dsytrsRook from './../lib/ndarray.js';


// FIXTURES //

var fixtureDir = path.join( import.meta.dirname, '..', '..', '..', '..', '..', 'test', 'fixtures' ); // eslint-disable-line max-len
var lines = readFileSync( path.join( fixtureDir, 'dsytrs_rook.jsonl' ), 'utf8' ).trim().split( '\n' ); // eslint-disable-line node/no-sync, max-len
var fixture = lines.map( parse );


// FUNCTIONS //

/**
* Parses one JSONL line.
*
* @private
* @param {string} line - JSON line
* @returns {Object} parsed object
*/
function parse( line ) {
	return JSON.parse( line );
}

/**
* Locates a fixture case by name.
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
	assert.ok( relErr <= tol, msg + ': expected ' + expected + ', got ' + actual );
}

/**
* Asserts that two arrays are element-wise approximately equal.
*
* @private
* @param {Array} actual - actual values
* @param {Array} expected - expected values
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
* Converts a Fortran 1-based IPIV array to JS 0-based Int32Array. Positive values are decremented; negative (2x2 block) values are kept as-is (the encoding is identical: Fortran `-p` = JS `~(p-1)`).
*
* @private
* @param {Array} ipiv - Fortran IPIV
* @returns {Int32Array} JS IPIV
*/
function convertIpiv( ipiv ) {
	var out;
	var i;
	out = new Int32Array( ipiv.length );
	for ( i = 0; i < ipiv.length; i++ ) {
		if ( ipiv[ i ] > 0 ) {
			out[ i ] = ipiv[ i ] - 1;
		} else {
			out[ i ] = ipiv[ i ];
		}
	}
	return out;
}

/**
* Runs a solve test case and verifies the output matches the fixture.
*
* @private
* @param {string} uplo - matrix triangle
* @param {NonNegativeInteger} N - matrix order
* @param {NonNegativeInteger} nrhs - right-hand side count
* @param {Object} tc - fixture case
* @param {Array} bIn - input RHS values
* @param {number} tol - tolerance
*/
function runCase( uplo, N, nrhs, tc, bIn, tol ) {
	var info;
	var ipiv;
	var A;
	var b;
	ipiv = convertIpiv( tc.ipiv );
	A = new Float64Array( tc.A );
	b = new Float64Array( bIn );
	info = dsytrsRook( uplo, N, nrhs, A, 1, N, 0, ipiv, 1, 0, b, 1, N, 0 );
	assert.equal( info, tc.info, 'info' );
	assertArrayClose( b, tc.b, tol, 'b' );
}


// TESTS //

test( 'dsytrs_rook: 4x4_indef_lower_1rhs', function t() {
	var tc = findCase( '4x4_indef_lower_1rhs' );
	runCase( 'lower', 4, 1, tc, [ 6.0, 10.0, 12.0, 14.0 ], 1e-12 );
});

test( 'dsytrs_rook: 4x4_indef_upper_1rhs', function t() {
	var tc = findCase( '4x4_indef_upper_1rhs' );
	runCase( 'upper', 4, 1, tc, [ 6.0, 10.0, 12.0, 14.0 ], 1e-12 );
});

test( 'dsytrs_rook: 4x4_spd_lower_1rhs', function t() {
	var tc = findCase( '4x4_spd_lower_1rhs' );
	runCase( 'lower', 4, 1, tc, [ 7.0, 10.0, 12.0, 12.0 ], 1e-12 );
});

test( 'dsytrs_rook: 4x4_spd_upper_1rhs', function t() {
	var tc = findCase( '4x4_spd_upper_1rhs' );
	runCase( 'upper', 4, 1, tc, [ 7.0, 10.0, 12.0, 12.0 ], 1e-12 );
});

test( 'dsytrs_rook: 5x5_lower_2rhs', function t() {
	var tc = findCase( '5x5_lower_2rhs' );
	runCase( 'lower', 5, 2, tc, [ 14.0, 16.0, 7.0, 1.0, 17.0, 0.0, 3.0, 2.0, -2.0, 18.0 ], 1e-12 ); // eslint-disable-line max-len
});

test( 'dsytrs_rook: 5x5_upper_2rhs', function t() {
	var tc = findCase( '5x5_upper_2rhs' );
	runCase( 'upper', 5, 2, tc, [ 14.0, 16.0, 7.0, 1.0, 17.0, 0.0, 3.0, 2.0, -2.0, 18.0 ], 1e-12 ); // eslint-disable-line max-len
});

test( 'dsytrs_rook: n_zero', function t() {
	var ipiv;
	var info;
	var tc;
	var A;
	var b;
	tc = findCase( 'n_zero' );
	A = new Float64Array( 1 );
	b = new Float64Array( 1 );
	ipiv = new Int32Array( 1 );
	info = dsytrsRook( 'lower', 0, 1, A, 1, 1, 0, ipiv, 1, 0, b, 1, 1, 0 );
	assert.equal( info, tc.info, 'info' );
});

test( 'dsytrs_rook: nrhs_zero', function t() {
	var ipiv;
	var info;
	var tc;
	var A;
	var b;
	tc = findCase( 'nrhs_zero' );
	A = new Float64Array( 9 );
	b = new Float64Array( 3 );
	ipiv = new Int32Array( 3 );
	info = dsytrsRook( 'lower', 3, 0, A, 1, 3, 0, ipiv, 1, 0, b, 1, 3, 0 );
	assert.equal( info, tc.info, 'info' );
});

test( 'dsytrs_rook: n_one_lower', function t() {
	var tc = findCase( 'n_one_lower' );
	runCase( 'lower', 1, 1, tc, [ 8.0 ], 1e-12 );
});

test( 'dsytrs_rook: n_one_upper hand-computed', function t() {
	// 1x1 matrix [4], solve 4*x = 8, x = 2
	var ipiv;
	var info;
	var A;
	var b;
	A = new Float64Array( [ 4.0 ] );
	b = new Float64Array( [ 8.0 ] );
	ipiv = new Int32Array( [ 0 ] );
	info = dsytrsRook( 'upper', 1, 1, A, 1, 1, 0, ipiv, 1, 0, b, 1, 1, 0 );
	assert.equal( info, 0, 'info' );
	assertClose( b[ 0 ], 2.0, 1e-15, 'b[0]' );
});

test( 'dsytrs_rook: ndarray with non-zero offset', function t() {
	// Reuse 4x4_indef_lower fixture but pad arrays with offset
	var Apad;
	var bpad;
	var info;
	var ipiv;
	var raw;
	var tc;
	var i;
	tc = findCase( '4x4_indef_lower_1rhs' );
	ipiv = new Int32Array( 6 );
	Apad = new Float64Array( 20 );
	bpad = new Float64Array( 6 );
	raw = convertIpiv( tc.ipiv );
	for ( i = 0; i < 4; i++ ) {
		ipiv[ i + 2 ] = raw[ i ];
	}
	for ( i = 0; i < 16; i++ ) {
		Apad[ i + 4 ] = tc.A[ i ];
	}
	bpad[ 2 ] = 6.0;
	bpad[ 3 ] = 10.0;
	bpad[ 4 ] = 12.0;
	bpad[ 5 ] = 14.0;
	info = dsytrsRook( 'lower', 4, 1, Apad, 1, 4, 4, ipiv, 1, 2, bpad, 1, 4, 2 );
	assert.equal( info, tc.info, 'info' );
	assertArrayClose( [ bpad[ 2 ], bpad[ 3 ], bpad[ 4 ], bpad[ 5 ] ], tc.b, 1e-12, 'b' ); // eslint-disable-line max-len
});
