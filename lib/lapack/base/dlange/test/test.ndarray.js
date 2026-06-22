/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import { readFileSync } from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import dlange from './../lib/ndarray.js';


// FIXTURES //

var fixtureFile = path.join( import.meta.dirname, '..', '..', '..', '..', '..', 'test', 'fixtures', 'dlange.jsonl' );
var rawLines = readFileSync( fixtureFile, 'utf8' ).trim().split( '\n' );
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
	var relErr = Math.abs( actual - expected ) / Math.max( Math.abs( expected ), 1.0 );
	assert.ok( relErr <= tol, format( '%s: expected %s, got %s (rel err %s)', msg, expected, actual, relErr ) );
}

/**
* Returns a fixture record by name.
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
* Builds a column-major Float64Array from (row, col, val) triples (1-indexed).
*
* @private
* @param {NonNegativeInteger} lda - leading dimension
* @param {NonNegativeInteger} ncols - number of columns
* @param {Array} cells - flat list of (row, col, val) entries
* @returns {Float64Array} packed storage
*/
function buildA( lda, ncols, cells ) {
	var out = new Float64Array( lda * ncols );
	var i;
	for ( i = 0; i < cells.length; i += 3 ) {
		out[ ( cells[i] - 1 ) + ( ( cells[i+1] - 1 ) * lda ) ] = cells[i+2];
	}
	return out;
}


// FIXTURES (matrix data) //

var LDA = 4;

// 3x4 matrix (LDA=4)
var A_3X4 = buildA( LDA, 4, [
	1, 1, 1.0, 2, 1, -3.0, 3, 1, 2.0,
	1, 2, -4.0, 2, 2, 5.0, 3, 2, -1.0,
	1, 3, 7.0, 2, 3, -8.0, 3, 3, 9.0,
	1, 4, -2.0, 2, 4, 6.0, 3, 4, -3.0
]);

// 1x1 matrix
var A_1X1 = buildA( LDA, 1, [ 1, 1, -5.5 ] );

// 4x5 matrix (LDA=4)
var A_4X5 = buildA( LDA, 5, [
	1, 1, 2.0, 2, 1, -1.0, 3, 1, 0.0, 4, 1, 3.0,
	1, 2, 4.0, 2, 2, -6.0, 3, 2, 1.0, 4, 2, 0.5,
	1, 3, -7.0, 2, 3, 2.0, 3, 3, 8.0, 4, 3, -4.0,
	1, 4, 1.0, 2, 4, 0.0, 3, 4, -3.0, 4, 4, 5.0,
	1, 5, 0.0, 2, 5, 9.0, 3, 5, -2.0, 4, 5, 1.0
]);


// FUNCTIONS //

/**
* Runs a single norm-check fixture.
*
* @private
* @param {string} name - fixture name
* @param {string} norm - norm type
* @param {NonNegativeInteger} M - rows
* @param {NonNegativeInteger} N - cols
* @param {Float64Array} A - storage
*/
function runCase( name, norm, M, N, A ) {
	var WORK = new Float64Array( Math.max( M, 1 ) );
	var tc = findCase( name );
	var got = dlange( norm, M, N, A, 1, LDA, 0, WORK, 1, 0 );
	assertClose( got, tc.result, 1e-12, 'dlange: ' + name );
}


// TESTS //

test( 'dlange: dlange_max', function t() {
	runCase( 'dlange_max', 'max', 3, 4, A_3X4 );
});

test( 'dlange: dlange_one', function t() {
	runCase( 'dlange_one', 'one-norm', 3, 4, A_3X4 );
});

test( 'dlange: dlange_one_O', function t() {
	runCase( 'dlange_one_O', 'one-norm', 3, 4, A_3X4 );
});

test( 'dlange: dlange_inf', function t() {
	runCase( 'dlange_inf', 'inf-norm', 3, 4, A_3X4 );
});

test( 'dlange: dlange_frob', function t() {
	runCase( 'dlange_frob', 'frobenius', 3, 4, A_3X4 );
});

test( 'dlange: dlange_frob_E', function t() {
	runCase( 'dlange_frob_E', 'frobenius', 3, 4, A_3X4 );
});

test( 'dlange: dlange_m_zero', function t() {
	runCase( 'dlange_m_zero', 'max', 0, 4, A_3X4 );
});

test( 'dlange: dlange_n_zero', function t() {
	runCase( 'dlange_n_zero', 'one-norm', 3, 0, A_3X4 );
});

test( 'dlange: dlange_1x1_max', function t() {
	runCase( 'dlange_1x1_max', 'max', 1, 1, A_1X1 );
});

test( 'dlange: dlange_1x1_frob', function t() {
	runCase( 'dlange_1x1_frob', 'frobenius', 1, 1, A_1X1 );
});

test( 'dlange: dlange_1x1_one', function t() {
	runCase( 'dlange_1x1_one', 'one-norm', 1, 1, A_1X1 );
});

test( 'dlange: dlange_1x1_inf', function t() {
	runCase( 'dlange_1x1_inf', 'inf-norm', 1, 1, A_1X1 );
});

test( 'dlange: dlange_4x5_max', function t() {
	runCase( 'dlange_4x5_max', 'max', 4, 5, A_4X5 );
});

test( 'dlange: dlange_4x5_one', function t() {
	runCase( 'dlange_4x5_one', 'one-norm', 4, 5, A_4X5 );
});

test( 'dlange: dlange_4x5_inf', function t() {
	runCase( 'dlange_4x5_inf', 'inf-norm', 4, 5, A_4X5 );
});

test( 'dlange: dlange_4x5_frob', function t() {
	runCase( 'dlange_4x5_frob', 'frobenius', 4, 5, A_4X5 );
});

test( 'dlange: throws TypeError for invalid norm', function t() {
	var WORK = new Float64Array( 4 );
	assert.throws( function throws() {
		dlange( 'invalid', 3, 4, A_3X4, 1, LDA, 0, WORK, 1, 0 );
	}, TypeError );
});

test( 'dlange: throws RangeError for negative M', function t() {
	var WORK = new Float64Array( 4 );
	assert.throws( function throws() {
		dlange( 'max', -1, 4, A_3X4, 1, LDA, 0, WORK, 1, 0 );
	}, RangeError );
});

test( 'dlange: throws RangeError for negative N', function t() {
	var WORK = new Float64Array( 4 );
	assert.throws( function throws() {
		dlange( 'max', 3, -1, A_3X4, 1, LDA, 0, WORK, 1, 0 );
	}, RangeError );
});
