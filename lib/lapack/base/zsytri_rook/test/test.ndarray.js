/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import zsytriRook from './../lib/ndarray.js';


// FIXTURES //

import fix3x3UpperF from './fixtures/3x3_upper_factored.json' with { type: 'json' };
import fix3x3UpperI from './fixtures/3x3_upper.json' with { type: 'json' };
import fix3x3LowerF from './fixtures/3x3_lower_factored.json' with { type: 'json' };
import fix3x3LowerI from './fixtures/3x3_lower.json' with { type: 'json' };
import fix4x4UpperIndefF from './fixtures/4x4_upper_indef_factored.json' with { type: 'json' };
import fix4x4UpperIndefI from './fixtures/4x4_upper_indef.json' with { type: 'json' };
import fix4x4LowerIndefF from './fixtures/4x4_lower_indef_factored.json' with { type: 'json' };
import fix4x4LowerIndefI from './fixtures/4x4_lower_indef.json' with { type: 'json' };
import fix4x4UpperSwapF from './fixtures/4x4_upper_swap_factored.json' with { type: 'json' };
import fix4x4UpperSwapI from './fixtures/4x4_upper_swap.json' with { type: 'json' };
import fix4x4LowerSwapF from './fixtures/4x4_lower_swap_factored.json' with { type: 'json' };
import fix4x4LowerSwapI from './fixtures/4x4_lower_swap.json' with { type: 'json' };
import fixN1UpperF from './fixtures/n1_upper_factored.json' with { type: 'json' };
import fixN1UpperI from './fixtures/n1_upper.json' with { type: 'json' };
import fixN1LowerF from './fixtures/n1_lower_factored.json' with { type: 'json' };
import fixN1LowerI from './fixtures/n1_lower.json' with { type: 'json' };


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
	var relErr = Math.abs( actual - expected ) / Math.max( Math.abs( expected ), 1.0 );
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
* Converts Fortran 1-based IPIV to JS 0-based IPIV (with bitwise NOT for negatives).
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
* Builds a Complex128Array from flat interleaved real/imag fixture data.
*
* @private
* @param {Array} arr - flat array (length `2*N*N`)
* @param {NonNegativeInteger} N - matrix order
* @returns {Complex128Array} complex matrix
*/
function complexMatFromFixture( arr, N ) {
	var view;
	var out;
	var i;
	out = new Complex128Array( N * N );
	view = reinterpret( out, 0 );
	for ( i = 0; i < 2 * N * N; i++ ) {
		view[ i ] = arr[ i ];
	}
	return out;
}

/**
* Slices and copies the first `2*N*N` entries of a fixture array.
*
* @private
* @param {Array} arr - source array
* @param {NonNegativeInteger} N - matrix order
* @returns {Array} sliced expected values
*/
function expectedFromFixture( arr, N ) {
	return arr.slice( 0, 2 * N * N );
}

/**
* Runs a fixture-based test.
*
* @private
* @param {string} uplo - `'upper'` or `'lower'`
* @param {NonNegativeInteger} N - matrix order
* @param {Object} fact - factored fixture (input)
* @param {Object} inv - inverse fixture (expected)
*/
function runFixture( uplo, N, fact, inv ) {
	var expected;
	var ipiv;
	var work;
	var info;
	var view;
	var A;

	A = complexMatFromFixture( fact.a, N );
	ipiv = convertIPIV( fact.ipiv.slice( 0, N ) );
	expected = expectedFromFixture( inv.a, N );
	work = new Complex128Array( N );
	info = zsytriRook( uplo, N, A, 1, N, 0, ipiv, 1, 0, work, 1, 0 );
	assert.equal( info, inv.info, 'info' );
	view = reinterpret( A, 0 );
	assertArrayClose( Array.prototype.slice.call( view ), expected, 1e-12, 'A' );
}


// TESTS //

test( 'zsytri_rook: n1_upper', function t() {
	runFixture( 'upper', 1, fixN1UpperF, fixN1UpperI );
});

test( 'zsytri_rook: n1_lower', function t() {
	runFixture( 'lower', 1, fixN1LowerF, fixN1LowerI );
});

test( 'zsytri_rook: 3x3_upper', function t() {
	runFixture( 'upper', 3, fix3x3UpperF, fix3x3UpperI );
});

test( 'zsytri_rook: 3x3_lower', function t() {
	runFixture( 'lower', 3, fix3x3LowerF, fix3x3LowerI );
});

test( 'zsytri_rook: 4x4_upper_indef', function t() {
	runFixture( 'upper', 4, fix4x4UpperIndefF, fix4x4UpperIndefI );
});

test( 'zsytri_rook: 4x4_lower_indef', function t() {
	runFixture( 'lower', 4, fix4x4LowerIndefF, fix4x4LowerIndefI );
});

test( 'zsytri_rook: 4x4_upper_swap', function t() {
	runFixture( 'upper', 4, fix4x4UpperSwapF, fix4x4UpperSwapI );
});

test( 'zsytri_rook: 4x4_lower_swap', function t() {
	runFixture( 'lower', 4, fix4x4LowerSwapF, fix4x4LowerSwapI );
});

test( 'zsytri_rook: n_zero', function t() {
	var work;
	var ipiv;
	var info;
	var A;

	A = new Complex128Array( 1 );
	ipiv = new Int32Array( 1 );
	work = new Complex128Array( 1 );
	info = zsytriRook( 'upper', 0, A, 1, 1, 0, ipiv, 1, 0, work, 1, 0 );
	assert.equal( info, 0, 'info' );
});

test( 'zsytri_rook: singular upper returns positive info', function t() {
	var ipiv;
	var work;
	var info;
	var A;

	A = new Complex128Array( [ 1.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0 ] );
	ipiv = new Int32Array( [ 0, 1 ] );
	work = new Complex128Array( 2 );
	info = zsytriRook( 'upper', 2, A, 1, 2, 0, ipiv, 1, 0, work, 1, 0 );
	assert.equal( info, 2, 'info should be 2' );
});

test( 'zsytri_rook: singular lower returns positive info', function t() {
	var ipiv;
	var work;
	var info;
	var A;

	A = new Complex128Array( [ 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0 ] );
	ipiv = new Int32Array( [ 0, 1 ] );
	work = new Complex128Array( 2 );
	info = zsytriRook( 'lower', 2, A, 1, 2, 0, ipiv, 1, 0, work, 1, 0 );
	assert.equal( info, 1, 'info should be 1' );
});
