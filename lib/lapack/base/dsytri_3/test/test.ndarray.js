/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import path from 'node:path';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import dsytri3 from './../lib/ndarray.js';


// FIXTURES //

const fixtureDir = path.join( import.meta.dirname, '..', '..', '..', '..', '..', 'test', 'fixtures' ); // eslint-disable-line max-len
const lines = readFileSync( path.join( fixtureDir, 'dsytri_3.jsonl' ), 'utf8' ).trim().split( '\n' ); // eslint-disable-line node/no-sync, max-len
const fixture = lines.map( function parse( line ) {
	return JSON.parse( line );
});


// VARIABLES //

// Must match the hardcoded block size in base.js.
const NB = 1;


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
	let i;
	const out = new Int32Array( ipivF.length );
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
	const relErr = Math.abs( actual - expected ) / Math.max( Math.abs( expected ), 1.0 ); // eslint-disable-line max-len
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
	let idx, i, j;
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
* @param {Object} tc - fixture entry
*/
function runFixture( uplo, N, tc ) {

	const A = new Float64Array( tc.a_factored );
	const e = new Float64Array( tc.e );
	const ipiv = convertIpiv( tc.ipiv );
	const lwork = ( N + NB + 1 ) * ( NB + 3 );
	const work = new Float64Array( lwork );
	const info = dsytri3( uplo, N, A, 1, N, 0, e, 1, 0, ipiv, 1, 0, work, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, tc.info, 'info' );
	assertTriangleClose( A, tc.a_inv, uplo, N, 1e-11, 'a_inv' );
	assert.equal( work[ 0 ], lwork, 'work[0] returns LWKOPT' );
}


// TESTS //

test( 'dsytri_3: 4x4 lower definite', function t() {
	runFixture( 'lower', 4, findCase( '4x4_lower_def' ) );
});

test( 'dsytri_3: 4x4 upper definite', function t() {
	runFixture( 'upper', 4, findCase( '4x4_upper_def' ) );
});

test( 'dsytri_3: 5x5 lower indefinite', function t() {
	runFixture( 'lower', 5, findCase( '5x5_lower_indef' ) );
});

test( 'dsytri_3: 5x5 upper indefinite', function t() {
	runFixture( 'upper', 5, findCase( '5x5_upper_indef' ) );
});

test( 'dsytri_3: N=1 lower trivial inverse', function t() {
	const tc = findCase( 'n_one_lower' );
	const A = new Float64Array( [ 5.0 ] );
	const e = new Float64Array( [ 0.0 ] );
	const ipiv = new Int32Array( [ 0 ] );
	const lwork = ( 1 + NB + 1 ) * ( NB + 3 );
	const work = new Float64Array( lwork );
	const info = dsytri3( 'lower', 1, A, 1, 1, 0, e, 1, 0, ipiv, 1, 0, work, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, tc.info, 'info' );
	assertClose( A[ 0 ], tc.a_inv[ 0 ], 1e-14, 'A[0,0]' );
});

test( 'dsytri_3: N=0 quick return', function t() {
	const A = new Float64Array( 0 );
	const e = new Float64Array( 0 );
	const ipiv = new Int32Array( 0 );
	const work = new Float64Array( 10 );
	const info = dsytri3( 'lower', 0, A, 1, 1, 0, e, 1, 0, ipiv, 1, 0, work, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, 0, 'info' );
});

test( 'dsytri_3: validation throws on invalid uplo', function t() {
	let ipiv, work, A, e;
	A = new Float64Array( 4 );
	e = new Float64Array( 2 );
	ipiv = new Int32Array( 2 );
	work = new Float64Array( 40 );
	assert.throws( function fn() {
		dsytri3( 'invalid', 2, A, 1, 2, 0, e, 1, 0, ipiv, 1, 0, work, 1, 0 );
	}, TypeError );
});
