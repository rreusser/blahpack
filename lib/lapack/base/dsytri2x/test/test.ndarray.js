/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import path from 'node:path';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import dsytri2x from './../lib/ndarray.js';


// FIXTURES //

var fixtureDir = path.join( import.meta.dirname, '..', '..', '..', '..', '..', 'test', 'fixtures' ); // eslint-disable-line max-len
var lines = readFileSync( path.join( fixtureDir, 'dsytri2x.jsonl' ), 'utf8' ).trim().split( '\n' ); // eslint-disable-line max-len
var fixture = lines.map( function parse( line ) {
	return JSON.parse( line );
});


// FUNCTIONS //

/**
* Finds a fixture by name.
*
* @private
* @param {string} name - test case name
* @returns {Object} fixture entry
*/
function findCase( name ) {
	return fixture.find( function find( t ) {
		return t.name === name;
	});
}

/**
* Converts a Fortran 1-based IPIV array into the JS convention used by `dsyconv`/`dsytri2x`: non-negative `0`-based indices for `1x1` blocks and bitwise-NOT-encoded indices for `2x2` blocks.
*
* @private
* @param {Array<number>} ipivF - Fortran 1-based pivot array
* @returns {Int32Array} JS-convention pivot array
*/
function convertIpiv( ipivF ) {
	var out;
	var i;
	out = new Int32Array( ipivF.length );
	for ( i = 0; i < ipivF.length; i++ ) {
		out[ i ] = ( ipivF[ i ] > 0 ) ? ( ipivF[ i ] - 1 ) : ipivF[ i ];
	}
	return out;
}

/**
* Asserts approximate scalar equality.
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
* Asserts symmetric-triangle equality between two column-major N-by-N matrices.
*
* @private
* @param {Float64Array} actual - computed matrix
* @param {Array<number>} expected - reference matrix
* @param {string} uplo - `'upper'` or `'lower'`
* @param {NonNegativeInteger} N - order
* @param {number} tol - tolerance
* @param {string} msg - assertion message
*/
function assertTriangleClose( actual, expected, uplo, N, tol, msg ) {
	var idx;
	var i;
	var j;
	if ( uplo === 'upper' ) {
		for ( j = 0; j < N; j++ ) {
			for ( i = 0; i <= j; i++ ) {
				idx = i + ( j * N );
				assertClose( actual[ idx ], expected[ idx ], tol, msg + '[' + i + ',' + j + ']' ); // eslint-disable-line max-len
			}
		}
	} else {
		for ( j = 0; j < N; j++ ) {
			for ( i = j; i < N; i++ ) {
				idx = i + ( j * N );
				assertClose( actual[ idx ], expected[ idx ], tol, msg + '[' + i + ',' + j + ']' ); // eslint-disable-line max-len
			}
		}
	}
}

/**
* Runs a fixture-driven test.
*
* @private
* @param {string} uplo - `'upper'` or `'lower'`
* @param {NonNegativeInteger} N - order
* @param {PositiveInteger} nb - block size
* @param {Object} tc - fixture entry
*/
function runFixture( uplo, N, nb, tc ) {
	var ldwork;
	var ipiv;
	var work;
	var info;
	var A;

	A = new Float64Array( tc.a_factored );
	ipiv = convertIpiv( tc.ipiv );
	ldwork = N + nb + 1;
	work = new Float64Array( ldwork * ( nb + 3 ) );
	info = dsytri2x( uplo, N, A, 1, N, 0, ipiv, 1, 0, work, 1, 0, nb );
	assert.equal( info, tc.info, 'info' );
	assertTriangleClose( A, tc.a_inv, uplo, N, 1e-11, 'a_inv' );
}


// TESTS //

test( 'dsytri2x: 4x4 lower definite, nb=2', function t() {
	runFixture( 'lower', 4, 2, findCase( '4x4_lower_def_nb2' ) );
});

test( 'dsytri2x: 4x4 upper definite, nb=2', function t() {
	runFixture( 'upper', 4, 2, findCase( '4x4_upper_def_nb2' ) );
});

test( 'dsytri2x: 4x4 lower indefinite (2x2 pivots), nb=2', function t() {
	runFixture( 'lower', 4, 2, findCase( '4x4_lower_indef_nb2' ) );
});

test( 'dsytri2x: 4x4 upper indefinite (2x2 pivots), nb=2', function t() {
	runFixture( 'upper', 4, 2, findCase( '4x4_upper_indef_nb2' ) );
});

test( 'dsytri2x: 5x5 lower mixed pivots, nb=2', function t() {
	runFixture( 'lower', 5, 2, findCase( '5x5_lower_mixed_nb2' ) );
});

test( 'dsytri2x: 5x5 upper mixed pivots, nb=2', function t() {
	runFixture( 'upper', 5, 2, findCase( '5x5_upper_mixed_nb2' ) );
});

test( 'dsytri2x: 5x5 lower mixed pivots, nb=3', function t() {
	runFixture( 'lower', 5, 3, findCase( '5x5_lower_mixed_nb3' ) );
});

test( 'dsytri2x: N=1 lower', function t() {
	var tc = findCase( 'n_one_lower' );
	var A = new Float64Array( [ 5.0 ] );
	var ipiv = new Int32Array( [ 0 ] );
	var nb = 2;
	var ldwork = 1 + nb + 1;
	var work = new Float64Array( ldwork * ( nb + 3 ) );
	var info = dsytri2x( 'lower', 1, A, 1, 1, 0, ipiv, 1, 0, work, 1, 0, nb );
	assert.equal( info, tc.info, 'info' );
	assertClose( A[ 0 ], tc.a_inv[ 0 ], 1e-14, 'a_inv[0]' );
});

test( 'dsytri2x: N=0 quick return', function t() {
	var A = new Float64Array( 1 );
	var ipiv = new Int32Array( 1 );
	var nb = 2;
	var work = new Float64Array( 10 );
	var info = dsytri2x( 'lower', 0, A, 1, 1, 0, ipiv, 1, 0, work, 1, 0, nb );
	assert.equal( info, 0, 'info zero on N=0' );
});

test( 'dsytri2x: 6x6 lower definite, nb=4', function t() {
	runFixture( 'lower', 6, 4, findCase( '6x6_lower_def_nb4' ) );
});

test( 'dsytri2x: ndarray validates uplo', function t() {
	assert.throws( function onCall() {
		var A = new Float64Array( 1 );
		var ipiv = new Int32Array( 1 );
		var work = new Float64Array( 10 );
		dsytri2x( 'bogus', 0, A, 1, 1, 0, ipiv, 1, 0, work, 1, 0, 2 );
	}, TypeError );
});
