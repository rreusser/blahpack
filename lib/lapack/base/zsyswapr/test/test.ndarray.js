/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import { readFileSync } from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import assert from 'node:assert/strict';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import zsyswapr from './../lib/ndarray.js';


// FIXTURES //

var fixtureDir = path.join( import.meta.dirname, '..', '..', '..', '..', '..', 'test', 'fixtures' );
var raw = readFileSync( path.join( fixtureDir, 'zsyswapr.jsonl' ), 'utf8' ); // eslint-disable-line node/no-sync
var lines = raw.trim().split( '\n' );
var fixture = [];


// VARIABLES //

var N = 6;
var LDA = 6;
var k;
for ( k = 0; k < lines.length; k++ ) {
	fixture.push( JSON.parse( lines[ k ] ) );
}


// FUNCTIONS //

/**
* Finds a fixture case by name.
*
* @private
* @param {string} name - case name
* @returns {Object} fixture case
*/
function findCase( name ) {
	var i;
	for ( i = 0; i < fixture.length; i++ ) {
		if ( fixture[ i ].name === name ) {
			return fixture[ i ];
		}
	}
	return null;
}

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
* @param {*} actual - actual values
* @param {*} expected - expected values
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
* Builds the complex symmetric base matrix used by the Fortran fixture.
*
* @private
* @returns {Complex128Array} column-major complex symmetric matrix
*/
function buildMatrix() {
	var idx;
	var mn;
	var mx;
	var A;
	var v;
	var i;
	var j;
	A = new Complex128Array( LDA * N );
	v = reinterpret( A, 0 );
	for ( j = 1; j <= N; j++ ) {
		for ( i = 1; i <= N; i++ ) {
			idx = ( ( ( j - 1 ) * LDA ) + ( i - 1 ) ) * 2;
			mn = Math.min( i, j );
			mx = Math.max( i, j );
			v[ idx ] = ( 10 * mn ) + mx;
			v[ idx + 1 ] = mn - ( mx * 0.1 );
		}
	}
	return A;
}

/**
* Runs a single swap and asserts against the fixture. Indices are zero-based.
*
* @private
* @param {string} name - fixture case name
* @param {string} uplo - upper or lower
* @param {integer} i1 - first index
* @param {integer} i2 - second index
*/
function runCase( name, uplo, i1, i2 ) {
	var view;
	var tc;
	var A;
	tc = findCase( name );
	assert.ok( tc, 'fixture case exists: ' + name );
	A = buildMatrix();
	zsyswapr( uplo, N, A, 1, LDA, 0, i1, i2 );
	view = reinterpret( A, 0 );
	assertArrayClose( view, tc.a, 1e-14, name );
}


// TESTS //

test( 'zsyswapr: upper_non_adjacent', function t() {
	runCase( 'upper_non_adjacent', 'upper', 1, 4 );
});

test( 'zsyswapr: upper_adjacent', function t() {
	runCase( 'upper_adjacent', 'upper', 1, 2 );
});

test( 'zsyswapr: upper_noop', function t() {
	runCase( 'upper_noop', 'upper', 2, 2 );
});

test( 'zsyswapr: upper_i1_first', function t() {
	runCase( 'upper_i1_first', 'upper', 0, 3 );
});

test( 'zsyswapr: upper_i2_last', function t() {
	runCase( 'upper_i2_last', 'upper', 2, N - 1 );
});

test( 'zsyswapr: upper_both_bounds', function t() {
	runCase( 'upper_both_bounds', 'upper', 0, N - 1 );
});

test( 'zsyswapr: lower_non_adjacent', function t() {
	runCase( 'lower_non_adjacent', 'lower', 1, 4 );
});

test( 'zsyswapr: lower_adjacent', function t() {
	runCase( 'lower_adjacent', 'lower', 1, 2 );
});

test( 'zsyswapr: lower_noop', function t() {
	runCase( 'lower_noop', 'lower', 2, 2 );
});

test( 'zsyswapr: lower_i1_first', function t() {
	runCase( 'lower_i1_first', 'lower', 0, 3 );
});

test( 'zsyswapr: lower_i2_last', function t() {
	runCase( 'lower_i2_last', 'lower', 2, N - 1 );
});

test( 'zsyswapr: lower_both_bounds', function t() {
	runCase( 'lower_both_bounds', 'lower', 0, N - 1 );
});

test( 'zsyswapr: returns the input matrix', function t() {
	var out;
	var A;
	A = buildMatrix();
	out = zsyswapr( 'upper', N, A, 1, LDA, 0, 1, 4 );
	assert.equal( out, A );
});

test( 'zsyswapr: upper path does not touch strict lower triangle', function t() {
	var before;
	var view;
	var idx;
	var A;
	var i;
	var j;
	A = buildMatrix();
	before = reinterpret( A, 0 ).slice();
	zsyswapr( 'upper', N, A, 1, LDA, 0, 1, 4 );
	view = reinterpret( A, 0 );
	for ( j = 0; j < N; j++ ) {
		for ( i = j + 1; i < N; i++ ) {
			idx = ( ( j * LDA ) + i ) * 2;
			assert.equal( view[ idx ], before[ idx ], 'strict lower real A[' + i + ',' + j + '] untouched' ); // eslint-disable-line max-len
			assert.equal( view[ idx + 1 ], before[ idx + 1 ], 'strict lower imag A[' + i + ',' + j + '] untouched' ); // eslint-disable-line max-len
		}
	}
});

test( 'zsyswapr: lower path does not touch strict upper triangle', function t() {
	var before;
	var view;
	var idx;
	var A;
	var i;
	var j;
	A = buildMatrix();
	before = reinterpret( A, 0 ).slice();
	zsyswapr( 'lower', N, A, 1, LDA, 0, 1, 4 );
	view = reinterpret( A, 0 );
	for ( j = 0; j < N; j++ ) {
		for ( i = 0; i < j; i++ ) {
			idx = ( ( j * LDA ) + i ) * 2;
			assert.equal( view[ idx ], before[ idx ], 'strict upper real A[' + i + ',' + j + '] untouched' ); // eslint-disable-line max-len
			assert.equal( view[ idx + 1 ], before[ idx + 1 ], 'strict upper imag A[' + i + ',' + j + '] untouched' ); // eslint-disable-line max-len
		}
	}
});
