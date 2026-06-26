/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import { readFileSync } from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import dlantr from './../lib/ndarray.js';


// FIXTURES //

var fixtureDir = path.join( import.meta.dirname, '..', '..', '..', '..', '..', 'test', 'fixtures' );
var rawLines = readFileSync( path.join( fixtureDir, 'dlantr.jsonl' ), 'utf8' ).trim().split( '\n' ); // eslint-disable-line node/no-sync, max-len
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


// FIXTURES (matrix data, column-major) //

// 4x4 upper triangular, LDA=4:
//   [ 1  -4   7  -2 ]
//   [ 0   5  -8   6 ]
//   [ 0   0   9  -3 ]
//   [ 0   0   0   4 ]
var UPPER_4X4 = new Float64Array([
	1, 0, 0, 0,
	-4, 5, 0, 0,
	7, -8, 9, 0,
	-2, 6, -3, 4
]);

// 4x4 lower triangular, LDA=4:

//   [ 2   0   0   0 ]

//   [-3   6   0   0 ]

//   [ 1  -5   8   0 ]

//   [-4   7  -2   3 ]
var LOWER_4X4 = new Float64Array([
	2, -3, 1, -4,
	0, 6, -5, 7,
	0, 0, 8, -2,
	0, 0, 0, 3
]);

// Rectangular upper M>N: 3x2, LDA=3

//   [ 1  -4 ]

//   [ 0   5 ]

//   [ 0   0 ]
var RECT_UPPER_MN = new Float64Array([
	1, 0, 0,
	-4, 5, 0
]);

// Rectangular upper M<N: 2x4, LDA=2

//   [ 1  -4   7  -2 ]

//   [ 0   5  -8   6 ]
var RECT_UPPER_NM = new Float64Array([
	1, 0,
	-4, 5,
	7, -8,
	-2, 6
]);

// Rectangular lower M>N: 4x2, LDA=4

//   [ 2   0 ]

//   [-3   6 ]

//   [ 1  -5 ]

//   [-4   7 ]
var RECT_LOWER_MN = new Float64Array([
	2, -3, 1, -4,
	0, 6, -5, 7
]);

// 1x1
var ONE_BY_ONE = new Float64Array([ 5.0 ]);


// FUNCTIONS //

/**
* Runs a single norm-check fixture.
*
* @private
* @param {string} name - fixture name
* @param {string} norm - norm type
* @param {string} uplo - upper/lower
* @param {string} diag - unit/non-unit
* @param {NonNegativeInteger} M - rows
* @param {NonNegativeInteger} N - columns
* @param {Float64Array} A - column-major matrix
* @param {NonNegativeInteger} lda - leading dimension
*/
function runCase( name, norm, uplo, diag, M, N, A, lda ) {
	var WORK = new Float64Array( Math.max( M, 1 ) );
	var tc = findCase( name );
	var got = dlantr( norm, uplo, diag, M, N, A, 1, lda, 0, WORK, 1, 0 );
	assertClose( got, tc.result, 1e-12, 'dlantr: ' + name );
}


// TESTS //

test( 'dlantr: upper_nonunit_max', function t() {
	runCase( 'upper_nonunit_max', 'max', 'upper', 'non-unit', 4, 4, UPPER_4X4, 4 );
});

test( 'dlantr: upper_nonunit_one', function t() {
	runCase( 'upper_nonunit_one', 'one-norm', 'upper', 'non-unit', 4, 4, UPPER_4X4, 4 );
});

test( 'dlantr: upper_nonunit_inf', function t() {
	runCase( 'upper_nonunit_inf', 'inf-norm', 'upper', 'non-unit', 4, 4, UPPER_4X4, 4 );
});

test( 'dlantr: upper_nonunit_frob', function t() {
	runCase( 'upper_nonunit_frob', 'frobenius', 'upper', 'non-unit', 4, 4, UPPER_4X4, 4 );
});

test( 'dlantr: upper_unit_max', function t() {
	runCase( 'upper_unit_max', 'max', 'upper', 'unit', 4, 4, UPPER_4X4, 4 );
});

test( 'dlantr: upper_unit_one', function t() {
	runCase( 'upper_unit_one', 'one-norm', 'upper', 'unit', 4, 4, UPPER_4X4, 4 );
});

test( 'dlantr: upper_unit_inf', function t() {
	runCase( 'upper_unit_inf', 'inf-norm', 'upper', 'unit', 4, 4, UPPER_4X4, 4 );
});

test( 'dlantr: upper_unit_frob', function t() {
	runCase( 'upper_unit_frob', 'frobenius', 'upper', 'unit', 4, 4, UPPER_4X4, 4 );
});

test( 'dlantr: lower_nonunit_max', function t() {
	runCase( 'lower_nonunit_max', 'max', 'lower', 'non-unit', 4, 4, LOWER_4X4, 4 );
});

test( 'dlantr: lower_nonunit_one', function t() {
	runCase( 'lower_nonunit_one', 'one-norm', 'lower', 'non-unit', 4, 4, LOWER_4X4, 4 );
});

test( 'dlantr: lower_nonunit_inf', function t() {
	runCase( 'lower_nonunit_inf', 'inf-norm', 'lower', 'non-unit', 4, 4, LOWER_4X4, 4 );
});

test( 'dlantr: lower_nonunit_frob', function t() {
	runCase( 'lower_nonunit_frob', 'frobenius', 'lower', 'non-unit', 4, 4, LOWER_4X4, 4 );
});

test( 'dlantr: lower_unit_max', function t() {
	runCase( 'lower_unit_max', 'max', 'lower', 'unit', 4, 4, LOWER_4X4, 4 );
});

test( 'dlantr: lower_unit_one', function t() {
	runCase( 'lower_unit_one', 'one-norm', 'lower', 'unit', 4, 4, LOWER_4X4, 4 );
});

test( 'dlantr: lower_unit_inf', function t() {
	runCase( 'lower_unit_inf', 'inf-norm', 'lower', 'unit', 4, 4, LOWER_4X4, 4 );
});

test( 'dlantr: lower_unit_frob', function t() {
	runCase( 'lower_unit_frob', 'frobenius', 'lower', 'unit', 4, 4, LOWER_4X4, 4 );
});

test( 'dlantr: edge_m0', function t() {
	runCase( 'edge_m0', 'max', 'upper', 'non-unit', 0, 4, UPPER_4X4, 4 );
});

test( 'dlantr: edge_n0', function t() {
	runCase( 'edge_n0', 'max', 'upper', 'non-unit', 4, 0, UPPER_4X4, 4 );
});

test( 'dlantr: rect_upper_mn_max', function t() {
	runCase( 'rect_upper_mn_max', 'max', 'upper', 'non-unit', 3, 2, RECT_UPPER_MN, 3 );
});

test( 'dlantr: rect_upper_mn_one', function t() {
	runCase( 'rect_upper_mn_one', 'one-norm', 'upper', 'non-unit', 3, 2, RECT_UPPER_MN, 3 );
});

test( 'dlantr: rect_upper_mn_inf', function t() {
	runCase( 'rect_upper_mn_inf', 'inf-norm', 'upper', 'non-unit', 3, 2, RECT_UPPER_MN, 3 );
});

test( 'dlantr: rect_upper_mn_frob', function t() {
	runCase( 'rect_upper_mn_frob', 'frobenius', 'upper', 'non-unit', 3, 2, RECT_UPPER_MN, 3 );
});

test( 'dlantr: rect_upper_nm_max', function t() {
	runCase( 'rect_upper_nm_max', 'max', 'upper', 'non-unit', 2, 4, RECT_UPPER_NM, 2 );
});

test( 'dlantr: rect_upper_nm_one', function t() {
	runCase( 'rect_upper_nm_one', 'one-norm', 'upper', 'non-unit', 2, 4, RECT_UPPER_NM, 2 );
});

test( 'dlantr: rect_upper_nm_inf', function t() {
	runCase( 'rect_upper_nm_inf', 'inf-norm', 'upper', 'non-unit', 2, 4, RECT_UPPER_NM, 2 );
});

test( 'dlantr: rect_upper_nm_frob', function t() {
	runCase( 'rect_upper_nm_frob', 'frobenius', 'upper', 'non-unit', 2, 4, RECT_UPPER_NM, 2 );
});

test( 'dlantr: rect_lower_mn_max', function t() {
	runCase( 'rect_lower_mn_max', 'max', 'lower', 'non-unit', 4, 2, RECT_LOWER_MN, 4 );
});

test( 'dlantr: rect_lower_mn_one', function t() {
	runCase( 'rect_lower_mn_one', 'one-norm', 'lower', 'non-unit', 4, 2, RECT_LOWER_MN, 4 );
});

test( 'dlantr: rect_lower_mn_inf', function t() {
	runCase( 'rect_lower_mn_inf', 'inf-norm', 'lower', 'non-unit', 4, 2, RECT_LOWER_MN, 4 );
});

test( 'dlantr: rect_lower_mn_frob', function t() {
	runCase( 'rect_lower_mn_frob', 'frobenius', 'lower', 'non-unit', 4, 2, RECT_LOWER_MN, 4 );
});

test( 'dlantr: edge_1x1_max', function t() {
	runCase( 'edge_1x1_max', 'max', 'upper', 'non-unit', 1, 1, ONE_BY_ONE, 1 );
});

test( 'dlantr: edge_1x1_one', function t() {
	runCase( 'edge_1x1_one', 'one-norm', 'upper', 'non-unit', 1, 1, ONE_BY_ONE, 1 );
});

test( 'dlantr: edge_1x1_inf', function t() {
	runCase( 'edge_1x1_inf', 'inf-norm', 'upper', 'non-unit', 1, 1, ONE_BY_ONE, 1 );
});

test( 'dlantr: edge_1x1_frob', function t() {
	runCase( 'edge_1x1_frob', 'frobenius', 'upper', 'non-unit', 1, 1, ONE_BY_ONE, 1 );
});

test( 'dlantr: edge_1x1_unit_max', function t() {
	runCase( 'edge_1x1_unit_max', 'max', 'upper', 'unit', 1, 1, ONE_BY_ONE, 1 );
});
