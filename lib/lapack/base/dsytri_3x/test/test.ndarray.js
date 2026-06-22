/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import path from 'node:path';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import dsytri3x from './../lib/ndarray.js';


// FIXTURES //

var fixtureDir = path.join( import.meta.dirname, '..', '..', '..', '..', '..', 'test', 'fixtures' ); // eslint-disable-line max-len
var lines = readFileSync( path.join( fixtureDir, 'dsytri_3x.jsonl' ), 'utf8' ).trim().split( '\n' ); // eslint-disable-line node/no-sync, max-len
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
* Converts a Fortran 1-based IPIV array into the JS convention used by `dsytrf_rk`: positive 0-based indices for 1x1 blocks and bitwise-NOT-encoded indices for 2x2 blocks.
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
* Asserts symmetric-triangle equality: compares only the triangle indicated by uplo between actual and expected N-by-N column-major matrices.
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
	var e;

	A = new Float64Array( tc.a_factored );
	e = new Float64Array( tc.e );
	ipiv = convertIpiv( tc.ipiv );
	ldwork = N + nb + 1;
	work = new Float64Array( ldwork * ( nb + 3 ) );
	info = dsytri3x( uplo, N, A, 1, N, 0, e, 1, 0, ipiv, 1, 0, work, 1, 0, nb );
	assert.equal( info, tc.info, 'info' );
	assertTriangleClose( A, tc.a_inv, uplo, N, 1e-11, 'a_inv' );
}


// TESTS //

test( 'dsytri_3x: 4x4 lower definite, nb=2', function t() {
	runFixture( 'lower', 4, 2, findCase( '4x4_lower_def_nb2' ) );
});

test( 'dsytri_3x: 4x4 upper definite, nb=2', function t() {
	runFixture( 'upper', 4, 2, findCase( '4x4_upper_def_nb2' ) );
});

test( 'dsytri_3x: 4x4 lower indefinite (2x2 pivots), nb=2', function t() {
	runFixture( 'lower', 4, 2, findCase( '4x4_lower_indef_nb2' ) );
});

test( 'dsytri_3x: 4x4 upper indefinite (2x2 pivots), nb=2', function t() {
	runFixture( 'upper', 4, 2, findCase( '4x4_upper_indef_nb2' ) );
});

test( 'dsytri_3x: 5x5 lower mixed pivots, nb=2', function t() {
	runFixture( 'lower', 5, 2, findCase( '5x5_lower_mixed_nb2' ) );
});

test( 'dsytri_3x: 5x5 upper mixed pivots, nb=2', function t() {
	runFixture( 'upper', 5, 2, findCase( '5x5_upper_mixed_nb2' ) );
});

test( 'dsytri_3x: 5x5 lower mixed pivots, nb=3', function t() {
	runFixture( 'lower', 5, 3, findCase( '5x5_lower_mixed_nb3' ) );
});

test( 'dsytri_3x: 6x6 lower definite, nb=4', function t() {
	runFixture( 'lower', 6, 4, findCase( '6x6_lower_def_nb4' ) );
});

test( 'dsytri_3x: N=1 lower trivial inverse', function t() {
	var ldwork;
	var ipiv;
	var work;
	var info;
	var tc;
	var A;
	var e;
	tc = findCase( 'n_one_lower' );
	A = new Float64Array( [ 5.0 ] );
	e = new Float64Array( [ 0.0 ] );
	ipiv = new Int32Array( [ 0 ] );
	ldwork = 1 + 1 + 1;
	work = new Float64Array( ldwork * 4 );
	info = dsytri3x( 'lower', 1, A, 1, 1, 0, e, 1, 0, ipiv, 1, 0, work, 1, 0, 1 );
	assert.equal( info, tc.info, 'info' );
	assertClose( A[ 0 ], tc.a_inv[ 0 ], 1e-14, 'A[0,0]' );
});

test( 'dsytri_3x: N=0 quick return', function t() {
	var ipiv;
	var work;
	var info;
	var A;
	var e;
	A = new Float64Array( 0 );
	e = new Float64Array( 0 );
	ipiv = new Int32Array( 0 );
	work = new Float64Array( 1 );
	info = dsytri3x( 'lower', 0, A, 1, 1, 0, e, 1, 0, ipiv, 1, 0, work, 1, 0, 1 );
	assert.equal( info, 0, 'info' );
});

test( 'dsytri_3x: upper triangular factor input works with strideA2=N (column-major)', function t() { // eslint-disable-line max-len
	runFixture( 'lower', 4, 2, findCase( '4x4_lower_def_nb2' ) );
});

test( 'dsytri_3x: validation throws on invalid uplo', function t() {
	var ipiv;
	var work;
	var A;
	var e;
	A = new Float64Array( 4 );
	e = new Float64Array( 2 );
	ipiv = new Int32Array( 2 );
	work = new Float64Array( 10 );
	assert.throws( function fn() {
		dsytri3x( 'invalid', 2, A, 1, 2, 0, e, 1, 0, ipiv, 1, 0, work, 1, 0, 1 );
	}, TypeError );
});
