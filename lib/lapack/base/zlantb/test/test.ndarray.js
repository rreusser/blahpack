/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import { readFileSync } from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import zlantb from './../lib/ndarray.js';


// FIXTURES //

var fixtureDir = path.join( import.meta.dirname, '..', '..', '..', '..', '..', 'test', 'fixtures' );
var rawLines = readFileSync( path.join( fixtureDir, 'zlantb.jsonl' ), 'utf8' ).trim().split( '\n' ); // eslint-disable-line node/no-sync, max-len
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
* Builds a complex band storage Complex128Array from cell entries.
*
* @private
* @param {NonNegativeInteger} ldab - leading dimension (band rows)
* @param {NonNegativeInteger} ncols - columns
* @param {Array} cells - flat list of (row, col, re, im) quadruples (1-indexed)
* @returns {Complex128Array} packed storage
*/
function buildAB( ldab, ncols, cells ) {
	var raw = new Float64Array( 2 * ldab * ncols );
	var idx;
	var i;
	for ( i = 0; i < cells.length; i += 4 ) {
		idx = ( cells[i] - 1 ) + ( ( cells[i+1] - 1 ) * ldab );
		raw[ ( 2 * idx ) ] = cells[i+2];
		raw[ ( 2 * idx ) + 1 ] = cells[i+3];
	}
	return new Complex128Array( raw.buffer );
}


// FIXTURES (matrix data) //

// 4x4 upper, K=2, LDAB=3
var AB_UPPER_K2 = buildAB( 3, 4, [
	3, 1, 1, 2,
	2, 2, 3, 4,
	3, 2, 7, 8,
	1, 3, 5, 6,
	2, 3, 9, 1,
	3, 3, 4, 5,
	1, 4, 2, 3,
	2, 4, 6, 7,
	3, 4, 8, 9
]);
var LDAB_K2 = 3;

// 4x4 lower, K=2, LDAB=3
var AB_LOWER_K2 = buildAB( 3, 4, [
	1, 1, 1, 2,
	2, 1, 3, 4,
	3, 1, 5, 6,
	1, 2, 7, 8,
	2, 2, 9, 1,
	3, 2, 2, 3,
	1, 3, 4, 5,
	2, 3, 6, 7,
	1, 4, 8, 9
]);

// K=0, N=3, LDAB=1
var AB_K0_N3 = buildAB( 1, 3, [
	1, 1, 3, 4,
	1, 2, 1, 1,
	1, 3, 2, 2
]);
var LDAB_K0 = 1;

// 1x1 K=0
var AB_1X1 = buildAB( 1, 1, [ 1, 1, 3, 4 ] );

// K=1 upper, N=3, LDAB=2
var AB_UPPER_K1 = buildAB( 2, 3, [
	2, 1, 1, 1,
	1, 2, 2, 2,
	2, 2, 3, 3,
	1, 3, 4, 4,
	2, 3, 5, 5
]);
var LDAB_K1 = 2;

// K=1 lower, N=3, LDAB=2 (junk diagonal because diag=unit)
var AB_LOWER_K1 = buildAB( 2, 3, [
	1, 1, 99, 99,
	2, 1, 2, 2,
	1, 2, 99, 99,
	2, 2, 4, 4,
	1, 3, 99, 99
]);


// FUNCTIONS //

/**
* Runs a single norm-check fixture.
*
* @private
* @param {string} name - fixture name
* @param {string} norm - norm type
* @param {string} uplo - upper/lower
* @param {string} diag - unit/non-unit
* @param {NonNegativeInteger} N - order
* @param {NonNegativeInteger} K - bandwidth
* @param {Complex128Array} AB - band storage
* @param {NonNegativeInteger} ldab - leading dimension
*/
function runCase( name, norm, uplo, diag, N, K, AB, ldab ) {
	var WORK = new Float64Array( Math.max( N, 1 ) );
	var tc = findCase( name );
	var got = zlantb( norm, uplo, diag, N, K, AB, 1, ldab, 0, WORK, 1, 0 );
	assertClose( got, tc.result, 1e-12, 'zlantb: ' + name );
}


// TESTS //

test( 'zlantb: max_upper_nonunit', function t() {
	runCase( 'max_upper_nonunit', 'max', 'upper', 'non-unit', 4, 2, AB_UPPER_K2, LDAB_K2 );
});

test( 'zlantb: max_upper_unit', function t() {
	runCase( 'max_upper_unit', 'max', 'upper', 'unit', 4, 2, AB_UPPER_K2, LDAB_K2 );
});

test( 'zlantb: one_upper_nonunit', function t() {
	runCase( 'one_upper_nonunit', 'one-norm', 'upper', 'non-unit', 4, 2, AB_UPPER_K2, LDAB_K2 );
});

test( 'zlantb: one_upper_unit', function t() {
	runCase( 'one_upper_unit', 'one-norm', 'upper', 'unit', 4, 2, AB_UPPER_K2, LDAB_K2 );
});

test( 'zlantb: inf_upper_nonunit', function t() {
	runCase( 'inf_upper_nonunit', 'inf-norm', 'upper', 'non-unit', 4, 2, AB_UPPER_K2, LDAB_K2 );
});

test( 'zlantb: inf_upper_unit', function t() {
	runCase( 'inf_upper_unit', 'inf-norm', 'upper', 'unit', 4, 2, AB_UPPER_K2, LDAB_K2 );
});

test( 'zlantb: frob_upper_nonunit', function t() {
	runCase( 'frob_upper_nonunit', 'frobenius', 'upper', 'non-unit', 4, 2, AB_UPPER_K2, LDAB_K2 );
});

test( 'zlantb: frob_upper_unit', function t() {
	runCase( 'frob_upper_unit', 'frobenius', 'upper', 'unit', 4, 2, AB_UPPER_K2, LDAB_K2 );
});

test( 'zlantb: max_lower_nonunit', function t() {
	runCase( 'max_lower_nonunit', 'max', 'lower', 'non-unit', 4, 2, AB_LOWER_K2, LDAB_K2 );
});

test( 'zlantb: max_lower_unit', function t() {
	runCase( 'max_lower_unit', 'max', 'lower', 'unit', 4, 2, AB_LOWER_K2, LDAB_K2 );
});

test( 'zlantb: one_lower_nonunit', function t() {
	runCase( 'one_lower_nonunit', 'one-norm', 'lower', 'non-unit', 4, 2, AB_LOWER_K2, LDAB_K2 );
});

test( 'zlantb: one_lower_unit', function t() {
	runCase( 'one_lower_unit', 'one-norm', 'lower', 'unit', 4, 2, AB_LOWER_K2, LDAB_K2 );
});

test( 'zlantb: inf_lower_nonunit', function t() {
	runCase( 'inf_lower_nonunit', 'inf-norm', 'lower', 'non-unit', 4, 2, AB_LOWER_K2, LDAB_K2 );
});

test( 'zlantb: inf_lower_unit', function t() {
	runCase( 'inf_lower_unit', 'inf-norm', 'lower', 'unit', 4, 2, AB_LOWER_K2, LDAB_K2 );
});

test( 'zlantb: frob_lower_nonunit', function t() {
	runCase( 'frob_lower_nonunit', 'frobenius', 'lower', 'non-unit', 4, 2, AB_LOWER_K2, LDAB_K2 );
});

test( 'zlantb: frob_lower_unit', function t() {
	runCase( 'frob_lower_unit', 'frobenius', 'lower', 'unit', 4, 2, AB_LOWER_K2, LDAB_K2 );
});

test( 'zlantb: n_zero', function t() {
	runCase( 'n_zero', 'max', 'upper', 'non-unit', 0, 2, AB_UPPER_K2, LDAB_K2 );
});

test( 'zlantb: max_k0_nonunit', function t() {
	runCase( 'max_k0_nonunit', 'max', 'upper', 'non-unit', 3, 0, AB_K0_N3, LDAB_K0 );
});

test( 'zlantb: frob_k0_unit', function t() {
	runCase( 'frob_k0_unit', 'frobenius', 'upper', 'unit', 3, 0, AB_K0_N3, LDAB_K0 );
});

test( 'zlantb: frob_1x1', function t() {
	runCase( 'frob_1x1', 'frobenius', 'upper', 'non-unit', 1, 0, AB_1X1, LDAB_K0 );
});

test( 'zlantb: one_k1_upper_nonunit', function t() {
	runCase( 'one_k1_upper_nonunit', 'one-norm', 'upper', 'non-unit', 3, 1, AB_UPPER_K1, LDAB_K1 );
});

test( 'zlantb: inf_k1_lower_unit', function t() {
	runCase( 'inf_k1_lower_unit', 'inf-norm', 'lower', 'unit', 3, 1, AB_LOWER_K1, LDAB_K1 );
});
