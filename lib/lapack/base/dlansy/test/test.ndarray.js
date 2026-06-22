/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import { readFileSync } from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import dlansy from './../lib/ndarray.js';


// FIXTURES //

var fixtureFile = path.join( import.meta.dirname, '..', '..', '..', '..', '..', 'test', 'fixtures', 'dlansy.jsonl' );
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
* Builds a 5x5 column-major Float64Array from (row, col, val) triples.
*
* @private
* @param {NonNegativeInteger} lda - leading dimension
* @param {NonNegativeInteger} ncols - number of columns
* @param {Array} cells - flat list of (row, col, val) triples (1-indexed)
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

// 4x4 symmetric, upper-stored, LDA=5
var A4_UPPER = buildA( 5, 5, [
	1, 1, 2.0,
	1, 2, 3.0, 2, 2, 5.0,
	1, 3, -1.0, 2, 3, 2.0, 3, 3, 7.0,
	1, 4, 4.0, 2, 4, -6.0, 3, 4, 1.0, 4, 4, 8.0
]);

// 4x4 symmetric, lower-stored, LDA=5
var A4_LOWER = buildA( 5, 5, [
	1, 1, 2.0,
	2, 1, 3.0, 2, 2, 5.0,
	3, 1, -1.0, 3, 2, 2.0, 3, 3, 7.0,
	4, 1, 4.0, 4, 2, -6.0, 4, 3, 1.0, 4, 4, 8.0
]);

// 1x1 with -5.5
var A_1X1 = buildA( 5, 5, [ 1, 1, -5.5 ] );

// 5x5 upper
var A5_UPPER = buildA( 5, 5, [
	1, 1, 1.0,
	1, 2, 2.0, 2, 2, 3.0,
	1, 3, 4.0, 2, 3, 5.0, 3, 3, 6.0,
	1, 4, 7.0, 2, 4, 8.0, 3, 4, 9.0, 4, 4, 10.0,
	1, 5, 11.0, 2, 5, 12.0, 3, 5, 13.0, 4, 5, 14.0, 5, 5, 15.0
]);

// 5x5 lower
var A5_LOWER = buildA( 5, 5, [
	1, 1, 1.0,
	2, 1, 2.0, 2, 2, 3.0,
	3, 1, 4.0, 3, 2, 5.0, 3, 3, 6.0,
	4, 1, 7.0, 4, 2, 8.0, 4, 3, 9.0, 4, 4, 10.0,
	5, 1, 11.0, 5, 2, 12.0, 5, 3, 13.0, 5, 4, 14.0, 5, 5, 15.0
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
* @param {NonNegativeInteger} N - order
* @param {Float64Array} A - storage
*/
function runCase( name, norm, uplo, N, A ) {
	var WORK = new Float64Array( Math.max( N, 1 ) );
	var tc = findCase( name );
	var got = dlansy( norm, uplo, N, A, 1, LDA, 0, WORK, 1, 0 );
	assertClose( got, tc.result, 1e-12, 'dlansy: ' + name );
}


// TESTS //

test( 'dlansy: dlansy_max_U', function t() {
	runCase( 'dlansy_max_U', 'max', 'upper', 4, A4_UPPER );
});

test( 'dlansy: dlansy_one_U', function t() {
	runCase( 'dlansy_one_U', 'one-norm', 'upper', 4, A4_UPPER );
});

test( 'dlansy: dlansy_one_O_U', function t() {
	runCase( 'dlansy_one_O_U', 'one-norm', 'upper', 4, A4_UPPER );
});

test( 'dlansy: dlansy_inf_U', function t() {
	runCase( 'dlansy_inf_U', 'inf-norm', 'upper', 4, A4_UPPER );
});

test( 'dlansy: dlansy_frob_U', function t() {
	runCase( 'dlansy_frob_U', 'frobenius', 'upper', 4, A4_UPPER );
});

test( 'dlansy: dlansy_frob_E_U', function t() {
	runCase( 'dlansy_frob_E_U', 'frobenius', 'upper', 4, A4_UPPER );
});

test( 'dlansy: dlansy_max_L', function t() {
	runCase( 'dlansy_max_L', 'max', 'lower', 4, A4_LOWER );
});

test( 'dlansy: dlansy_one_L', function t() {
	runCase( 'dlansy_one_L', 'one-norm', 'lower', 4, A4_LOWER );
});

test( 'dlansy: dlansy_inf_L', function t() {
	runCase( 'dlansy_inf_L', 'inf-norm', 'lower', 4, A4_LOWER );
});

test( 'dlansy: dlansy_frob_L', function t() {
	runCase( 'dlansy_frob_L', 'frobenius', 'lower', 4, A4_LOWER );
});

test( 'dlansy: dlansy_n_zero', function t() {
	runCase( 'dlansy_n_zero', 'max', 'upper', 0, A4_UPPER );
});

test( 'dlansy: dlansy_1x1_max', function t() {
	runCase( 'dlansy_1x1_max', 'max', 'upper', 1, A_1X1 );
});

test( 'dlansy: dlansy_1x1_one', function t() {
	runCase( 'dlansy_1x1_one', 'one-norm', 'upper', 1, A_1X1 );
});

test( 'dlansy: dlansy_1x1_inf', function t() {
	runCase( 'dlansy_1x1_inf', 'inf-norm', 'upper', 1, A_1X1 );
});

test( 'dlansy: dlansy_1x1_frob', function t() {
	runCase( 'dlansy_1x1_frob', 'frobenius', 'upper', 1, A_1X1 );
});

test( 'dlansy: dlansy_5x5_max_U', function t() {
	runCase( 'dlansy_5x5_max_U', 'max', 'upper', 5, A5_UPPER );
});

test( 'dlansy: dlansy_5x5_one_U', function t() {
	runCase( 'dlansy_5x5_one_U', 'one-norm', 'upper', 5, A5_UPPER );
});

test( 'dlansy: dlansy_5x5_inf_U', function t() {
	runCase( 'dlansy_5x5_inf_U', 'inf-norm', 'upper', 5, A5_UPPER );
});

test( 'dlansy: dlansy_5x5_frob_U', function t() {
	runCase( 'dlansy_5x5_frob_U', 'frobenius', 'upper', 5, A5_UPPER );
});

test( 'dlansy: dlansy_5x5_max_L', function t() {
	runCase( 'dlansy_5x5_max_L', 'max', 'lower', 5, A5_LOWER );
});

test( 'dlansy: dlansy_5x5_one_L', function t() {
	runCase( 'dlansy_5x5_one_L', 'one-norm', 'lower', 5, A5_LOWER );
});

test( 'dlansy: dlansy_5x5_inf_L', function t() {
	runCase( 'dlansy_5x5_inf_L', 'inf-norm', 'lower', 5, A5_LOWER );
});

test( 'dlansy: dlansy_5x5_frob_L', function t() {
	runCase( 'dlansy_5x5_frob_L', 'frobenius', 'lower', 5, A5_LOWER );
});

test( 'dlansy: N=0 quick return via wrapper', function t() {
	var WORK = new Float64Array( 4 );
	var got = dlansy( 'max', 'upper', 0, A4_UPPER, 1, LDA, 0, WORK, 1, 0 );
	assert.strictEqual( got, 0.0, 'N=0 returns 0' );
});

test( 'dlansy: throws TypeError for invalid norm', function t() {
	var WORK = new Float64Array( 4 );
	assert.throws( function throws() {
		dlansy( 'invalid', 'upper', 4, A4_UPPER, 1, LDA, 0, WORK, 1, 0 );
	}, TypeError );
});

test( 'dlansy: throws TypeError for invalid uplo', function t() {
	var WORK = new Float64Array( 4 );
	assert.throws( function throws() {
		dlansy( 'max', 'invalid', 4, A4_UPPER, 1, LDA, 0, WORK, 1, 0 );
	}, TypeError );
});

test( 'dlansy: throws RangeError for negative N', function t() {
	var WORK = new Float64Array( 4 );
	assert.throws( function throws() {
		dlansy( 'max', 'upper', -1, A4_UPPER, 1, LDA, 0, WORK, 1, 0 );
	}, RangeError );
});
