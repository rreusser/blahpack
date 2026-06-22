/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import dsytriRook from './../lib/ndarray.js';


// FIXTURES //

import fix3x3Upper from './fixtures/3x3_upper.json' with { type: 'json' };
import fix3x3Lower from './fixtures/3x3_lower.json' with { type: 'json' };
import fix4x4Upper from './fixtures/4x4_upper.json' with { type: 'json' };
import fix4x4Lower from './fixtures/4x4_lower.json' with { type: 'json' };
import fixNOne from './fixtures/n_one.json' with { type: 'json' };
import fix4x4Indef2Upper from './fixtures/4x4_indef_2x2_upper.json' with { type: 'json' };
import fix4x4Indef2Lower from './fixtures/4x4_indef_2x2_lower.json' with { type: 'json' };
import fix3x3IndefUpper from './fixtures/3x3_indef_upper.json' with { type: 'json' };
import fix3x3IndefLower from './fixtures/3x3_indef_lower.json' with { type: 'json' };


// FUNCTIONS //

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
	var relErr = Math.abs( actual - expected ) / Math.max( Math.abs( expected ), 1.0 ); // eslint-disable-line max-len
	assert.ok( relErr <= tol, msg + ': expected ' + expected + ', got ' + actual );
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
	var i;
	assert.equal( actual.length, expected.length, msg + ': length mismatch' );
	for ( i = 0; i < expected.length; i++ ) {
		assertClose( actual[ i ], expected[ i ], tol, msg + '[' + i + ']' );
	}
}

/**
* Converts Fortran 1-based IPIV to JS 0-based IPIV.
*
* @private
* @param {Array} ipiv - Fortran 1-based pivot indices
* @returns {Int32Array} 0-based pivot indices
*/
function convertIPIV( ipiv ) {
	var out;
	var i;
	out = new Int32Array( ipiv.length );
	for ( i = 0; i < ipiv.length; i++ ) {
		if ( ipiv[ i ] >= 0 ) {
			out[ i ] = ipiv[ i ] - 1;
		} else {
			out[ i ] = ~( ( -ipiv[ i ] ) - 1 );
		}
	}
	return out;
}

/**
* Creates an NxN Float64Array from column-major flat fixture data.
*
* @private
* @param {Array} arr - flat array from fixture
* @param {NonNegativeInteger} N - matrix order
* @returns {Float64Array} matrix data
*/
function matFromFixture( arr, N ) {
	return new Float64Array( arr.slice( 0, N * N ) );
}

/**
* Returns a flat copy of a matrix.
*
* @private
* @param {Float64Array} A - matrix data
* @param {NonNegativeInteger} N - matrix order
* @returns {Float64Array} flat array copy
*/
function matToFlat( A, N ) {
	var out;
	var i;
	out = new Float64Array( N * N );
	for ( i = 0; i < N * N; i++ ) {
		out[ i ] = A[ i ];
	}
	return out;
}

/**
* Runs a fixture-based test.
*
* @private
* @param {string} uplo - `'upper'` or `'lower'`
* @param {NonNegativeInteger} N - matrix order
* @param {Object} tc - test case fixture
*/
function runFixture( uplo, N, tc ) {
	var expected;
	var ipiv;
	var work;
	var info;
	var A;

	A = matFromFixture( tc.a_fact, N );
	ipiv = convertIPIV( tc.ipiv.slice( 0, N ) );
	expected = matFromFixture( tc.a, N );
	work = new Float64Array( N );
	info = dsytriRook( uplo, N, A, 1, N, 0, ipiv, 1, 0, work, 1, 0 );
	assert.equal( info, tc.info, 'info' );
	assertArrayClose( matToFlat( A, N ), expected, 1e-12, 'a' );
}


// TESTS //

test( 'dsytri_rook: 3x3_upper', function t() {
	runFixture( 'upper', 3, fix3x3Upper );
});

test( 'dsytri_rook: 3x3_lower', function t() {
	runFixture( 'lower', 3, fix3x3Lower );
});

test( 'dsytri_rook: 4x4_upper', function t() {
	runFixture( 'upper', 4, fix4x4Upper );
});

test( 'dsytri_rook: 4x4_lower', function t() {
	runFixture( 'lower', 4, fix4x4Lower );
});

test( 'dsytri_rook: n_zero', function t() {
	var work;
	var ipiv;
	var info;
	var A;

	A = new Float64Array( 1 );
	ipiv = new Int32Array( 1 );
	work = new Float64Array( 1 );
	info = dsytriRook( 'upper', 0, A, 1, 1, 0, ipiv, 1, 0, work, 1, 0 );
	assert.equal( info, 0, 'info' );
});

test( 'dsytri_rook: n_one', function t() {
	runFixture( 'upper', 1, fixNOne );
});

test( 'dsytri_rook: 4x4_indef_2x2_upper', function t() {
	runFixture( 'upper', 4, fix4x4Indef2Upper );
});

test( 'dsytri_rook: 4x4_indef_2x2_lower', function t() {
	runFixture( 'lower', 4, fix4x4Indef2Lower );
});

test( 'dsytri_rook: 3x3_indef_upper', function t() {
	runFixture( 'upper', 3, fix3x3IndefUpper );
});

test( 'dsytri_rook: 3x3_indef_lower', function t() {
	runFixture( 'lower', 3, fix3x3IndefLower );
});

test( 'dsytri_rook: singular matrix returns positive info', function t() {
	var ipiv;
	var work;
	var info;
	var A;

	// 2x2 with singular 1x1 diagonal element at position 2
	A = new Float64Array( [ 1.0, 0.0, 0.0, 0.0 ] );
	ipiv = new Int32Array( [ 0, 1 ] );
	work = new Float64Array( 2 );
	info = dsytriRook( 'upper', 2, A, 1, 2, 0, ipiv, 1, 0, work, 1, 0 );
	assert.equal( info, 2, 'info should be 2 (D(2,2) is zero)' );
});

test( 'dsytri_rook: singular lower returns positive info', function t() {
	var ipiv;
	var work;
	var info;
	var A;

	A = new Float64Array( [ 0.0, 0.0, 0.0, 1.0 ] );
	ipiv = new Int32Array( [ 0, 1 ] );
	work = new Float64Array( 2 );
	info = dsytriRook( 'lower', 2, A, 1, 2, 0, ipiv, 1, 0, work, 1, 0 );
	assert.equal( info, 1, 'info should be 1' );
});
