/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import { readFileSync } from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import zlantr from './../lib/ndarray.js';


// FIXTURES //

var fixtureDir = path.join( import.meta.dirname, '..', '..', '..', '..', '..', 'test', 'fixtures' );
var rawLines = readFileSync( path.join( fixtureDir, 'zlantr.jsonl' ), 'utf8' ).trim().split( '\n' ); // eslint-disable-line node/no-sync, max-len
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

/**
* Builds a column-major complex matrix of size lda x ncols from cell entries.
*
* @private
* @param {NonNegativeInteger} lda - leading dimension (rows)
* @param {NonNegativeInteger} ncols - columns
* @param {Array} cells - flat list of (row, col, re, im) quadruples (1-indexed)
* @returns {Complex128Array} column-major matrix
*/
function buildA( lda, ncols, cells ) {
	var raw = new Float64Array( 2 * lda * ncols );
	var idx;
	var i;
	for ( i = 0; i < cells.length; i += 4 ) {
		idx = ( cells[i] - 1 ) + ( ( cells[i+1] - 1 ) * lda );
		raw[ ( 2 * idx ) ] = cells[i+2];
		raw[ ( 2 * idx ) + 1 ] = cells[i+3];
	}
	return new Complex128Array( raw.buffer );
}


// FIXTURES (matrix data) //

// 3x3 upper triangular, LDA=5
var UPPER_3X3 = buildA( 5, 3, [
	1, 1, 1, 2,
	1, 2, 3, 4,
	2, 2, 7, 8,
	1, 3, 5, 6,
	2, 3, 9, 1,
	3, 3, 2, 3
]);

// 3x3 lower triangular, LDA=5
var LOWER_3X3 = buildA( 5, 3, [
	1, 1, 1, 2,
	2, 1, 3, 4,
	3, 1, 5, 6,
	2, 2, 7, 8,
	3, 2, 9, 1,
	3, 3, 2, 3
]);

// 1x1, LDA=5
var ONE_BY_ONE = buildA( 5, 1, [ 1, 1, 3, 4 ] );

// 4x2 lower trapezoidal, LDA=5
var LOWER_TRAP_4X2 = buildA( 5, 2, [
	1, 1, 1, 1,
	2, 1, 2, 2,
	3, 1, 3, 3,
	4, 1, 4, 4,
	2, 2, 5, 5,
	3, 2, 6, 6,
	4, 2, 7, 7
]);

// 2x4 upper trapezoidal, LDA=5
var UPPER_TRAP_2X4 = buildA( 5, 4, [
	1, 1, 1, 1,
	1, 2, 2, 2,
	2, 2, 3, 3,
	1, 3, 4, 4,
	2, 3, 5, 5,
	1, 4, 6, 6,
	2, 4, 7, 7
]);

var LDA = 5;


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
* @param {Complex128Array} A - column-major matrix
*/
function runCase( name, norm, uplo, diag, M, N, A ) {
	var WORK = new Float64Array( Math.max( M, 1 ) );
	var tc = findCase( name );
	var got = zlantr( norm, uplo, diag, M, N, A, 1, LDA, 0, WORK, 1, 0 );
	assertClose( got, tc.result, 1e-12, 'zlantr: ' + name );
}


// TESTS //

test( 'zlantr: max_upper_nonunit', function t() {
	runCase( 'max_upper_nonunit', 'max', 'upper', 'non-unit', 3, 3, UPPER_3X3 );
});

test( 'zlantr: max_upper_unit', function t() {
	runCase( 'max_upper_unit', 'max', 'upper', 'unit', 3, 3, UPPER_3X3 );
});

test( 'zlantr: one_upper_nonunit', function t() {
	runCase( 'one_upper_nonunit', 'one-norm', 'upper', 'non-unit', 3, 3, UPPER_3X3 );
});

test( 'zlantr: one_upper_unit', function t() {
	runCase( 'one_upper_unit', 'one-norm', 'upper', 'unit', 3, 3, UPPER_3X3 );
});

test( 'zlantr: inf_upper_nonunit', function t() {
	runCase( 'inf_upper_nonunit', 'inf-norm', 'upper', 'non-unit', 3, 3, UPPER_3X3 );
});

test( 'zlantr: inf_upper_unit', function t() {
	runCase( 'inf_upper_unit', 'inf-norm', 'upper', 'unit', 3, 3, UPPER_3X3 );
});

test( 'zlantr: frob_upper_nonunit', function t() {
	runCase( 'frob_upper_nonunit', 'frobenius', 'upper', 'non-unit', 3, 3, UPPER_3X3 );
});

test( 'zlantr: frob_upper_unit', function t() {
	runCase( 'frob_upper_unit', 'frobenius', 'upper', 'unit', 3, 3, UPPER_3X3 );
});

test( 'zlantr: max_lower_nonunit', function t() {
	runCase( 'max_lower_nonunit', 'max', 'lower', 'non-unit', 3, 3, LOWER_3X3 );
});

test( 'zlantr: max_lower_unit', function t() {
	runCase( 'max_lower_unit', 'max', 'lower', 'unit', 3, 3, LOWER_3X3 );
});

test( 'zlantr: one_lower_nonunit', function t() {
	runCase( 'one_lower_nonunit', 'one-norm', 'lower', 'non-unit', 3, 3, LOWER_3X3 );
});

test( 'zlantr: one_lower_unit', function t() {
	runCase( 'one_lower_unit', 'one-norm', 'lower', 'unit', 3, 3, LOWER_3X3 );
});

test( 'zlantr: inf_lower_nonunit', function t() {
	runCase( 'inf_lower_nonunit', 'inf-norm', 'lower', 'non-unit', 3, 3, LOWER_3X3 );
});

test( 'zlantr: inf_lower_unit', function t() {
	runCase( 'inf_lower_unit', 'inf-norm', 'lower', 'unit', 3, 3, LOWER_3X3 );
});

test( 'zlantr: frob_lower_nonunit', function t() {
	runCase( 'frob_lower_nonunit', 'frobenius', 'lower', 'non-unit', 3, 3, LOWER_3X3 );
});

test( 'zlantr: frob_lower_unit', function t() {
	runCase( 'frob_lower_unit', 'frobenius', 'lower', 'unit', 3, 3, LOWER_3X3 );
});

test( 'zlantr: m_zero', function t() {
	runCase( 'm_zero', 'max', 'upper', 'non-unit', 0, 3, UPPER_3X3 );
});

test( 'zlantr: n_zero', function t() {
	runCase( 'n_zero', 'max', 'upper', 'non-unit', 3, 0, UPPER_3X3 );
});

test( 'zlantr: frob_1x1', function t() {
	runCase( 'frob_1x1', 'frobenius', 'upper', 'non-unit', 1, 1, ONE_BY_ONE );
});

test( 'zlantr: max_1x1_unit', function t() {
	runCase( 'max_1x1_unit', 'max', 'upper', 'unit', 1, 1, ONE_BY_ONE );
});

test( 'zlantr: one_O_upper_nonunit', function t() {
	runCase( 'one_O_upper_nonunit', 'one-norm', 'upper', 'non-unit', 3, 3, UPPER_3X3 );
});

test( 'zlantr: one_lower_trap', function t() {
	runCase( 'one_lower_trap', 'one-norm', 'lower', 'non-unit', 4, 2, LOWER_TRAP_4X2 );
});

test( 'zlantr: inf_upper_trap', function t() {
	runCase( 'inf_upper_trap', 'inf-norm', 'upper', 'non-unit', 2, 4, UPPER_TRAP_2X4 );
});
