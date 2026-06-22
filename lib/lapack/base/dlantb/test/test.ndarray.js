/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import { readFileSync } from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import dlantb from './../lib/ndarray.js';


// FIXTURES //

var fixtureDir = path.join( import.meta.dirname, '..', '..', '..', '..', '..', 'test', 'fixtures' );
var rawLines = readFileSync( path.join( fixtureDir, 'dlantb.jsonl' ), 'utf8' ).trim().split( '\n' ); // eslint-disable-line node/no-sync, max-len
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
* Builds an upper-triangular band storage Float64Array from cell entries.
*
* The Fortran storage uses column-major with leading dimension `ldab`.
* `cells` contains [row1, col1, val1, row2, col2, val2, ...] (1-indexed).
*
* @private
* @param {NonNegativeInteger} ldab - leading dimension
* @param {NonNegativeInteger} ncols - number of columns
* @param {Array} cells - flat list of (row, col, val) triples
* @returns {Float64Array} packed storage
*/
function buildAB( ldab, ncols, cells ) {
	var out = new Float64Array( ldab * ncols );
	var i;
	for ( i = 0; i < cells.length; i += 3 ) {
		out[ ( cells[i] - 1 ) + ( ( cells[i+1] - 1 ) * ldab ) ] = cells[i+2];
	}
	return out;
}


// FIXTURES (matrix data) //

// 5x5 upper triangular, K=2, LDAB=4. ab(row,col) entries (1-indexed):
var AB_UPPER_K2 = buildAB( 4, 5, [
	3, 1, 1.0,
	2, 2, -4.0,
	3, 2, 5.0,
	1, 3, 7.0,
	2, 3, -8.0,
	3, 3, 9.0,
	1, 4, 6.0,
	2, 4, -3.0,
	3, 4, 4.0,
	1, 5, 2.0,
	2, 5, -1.0,
	3, 5, 3.0
]);

// 5x5 lower triangular, K=2, LDAB=4. ab(row,col):
var AB_LOWER_K2 = buildAB( 4, 5, [
	1, 1, 2.0,
	2, 1, -3.0,
	3, 1, 1.0,
	1, 2, 6.0,
	2, 2, -5.0,
	3, 2, 7.0,
	1, 3, 8.0,
	2, 3, -2.0,
	3, 3, -4.0,
	1, 4, 3.0,
	2, 4, 1.0,
	1, 5, 5.0
]);

// 1x1 K=0, LDAB=4
var AB_1X1 = buildAB( 4, 1, [ 1, 1, 5.0 ] );

// K=0 diagonal, N=4, LDAB=4
var AB_K0_DIAG = buildAB( 4, 4, [
	1, 1, 3.0,
	1, 2, -7.0,
	1, 3, 2.0,
	1, 4, -4.0
]);

// K=1, N=4, upper, LDAB=4
var AB_UPPER_K1 = buildAB( 4, 4, [
	2, 1, 2.0,
	1, 2, -3.0,
	2, 2, 4.0,
	1, 3, 1.0,
	2, 3, -5.0,
	1, 4, 6.0,
	2, 4, 7.0
]);

// K=1, N=4, lower, LDAB=4
var AB_LOWER_K1 = buildAB( 4, 4, [
	1, 1, 2.0,
	2, 1, -3.0,
	1, 2, 4.0,
	2, 2, 1.0,
	1, 3, -5.0,
	2, 3, 6.0,
	1, 4, 7.0
]);

// LDAB=4 means strideAB1=1, strideAB2=4
var LDAB = 4;


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
* @param {Float64Array} AB - band storage
*/
function runCase( name, norm, uplo, diag, N, K, AB ) {
	var WORK = new Float64Array( Math.max( N, 1 ) );
	var tc = findCase( name );
	var got = dlantb( norm, uplo, diag, N, K, AB, 1, LDAB, 0, WORK, 1, 0 );
	assertClose( got, tc.result, 1e-12, 'dlantb: ' + name );
}


// TESTS //

test( 'dlantb: upper_nonunit_max', function t() {
	runCase( 'upper_nonunit_max', 'max', 'upper', 'non-unit', 5, 2, AB_UPPER_K2 );
});

test( 'dlantb: upper_nonunit_one', function t() {
	runCase( 'upper_nonunit_one', 'one-norm', 'upper', 'non-unit', 5, 2, AB_UPPER_K2 );
});

test( 'dlantb: upper_nonunit_inf', function t() {
	runCase( 'upper_nonunit_inf', 'inf-norm', 'upper', 'non-unit', 5, 2, AB_UPPER_K2 );
});

test( 'dlantb: upper_nonunit_frob', function t() {
	runCase( 'upper_nonunit_frob', 'frobenius', 'upper', 'non-unit', 5, 2, AB_UPPER_K2 );
});

test( 'dlantb: upper_unit_max', function t() {
	runCase( 'upper_unit_max', 'max', 'upper', 'unit', 5, 2, AB_UPPER_K2 );
});

test( 'dlantb: upper_unit_one', function t() {
	runCase( 'upper_unit_one', 'one-norm', 'upper', 'unit', 5, 2, AB_UPPER_K2 );
});

test( 'dlantb: upper_unit_inf', function t() {
	runCase( 'upper_unit_inf', 'inf-norm', 'upper', 'unit', 5, 2, AB_UPPER_K2 );
});

test( 'dlantb: upper_unit_frob', function t() {
	runCase( 'upper_unit_frob', 'frobenius', 'upper', 'unit', 5, 2, AB_UPPER_K2 );
});

test( 'dlantb: lower_nonunit_max', function t() {
	runCase( 'lower_nonunit_max', 'max', 'lower', 'non-unit', 5, 2, AB_LOWER_K2 );
});

test( 'dlantb: lower_nonunit_one', function t() {
	runCase( 'lower_nonunit_one', 'one-norm', 'lower', 'non-unit', 5, 2, AB_LOWER_K2 );
});

test( 'dlantb: lower_nonunit_inf', function t() {
	runCase( 'lower_nonunit_inf', 'inf-norm', 'lower', 'non-unit', 5, 2, AB_LOWER_K2 );
});

test( 'dlantb: lower_nonunit_frob', function t() {
	runCase( 'lower_nonunit_frob', 'frobenius', 'lower', 'non-unit', 5, 2, AB_LOWER_K2 );
});

test( 'dlantb: lower_unit_max', function t() {
	runCase( 'lower_unit_max', 'max', 'lower', 'unit', 5, 2, AB_LOWER_K2 );
});

test( 'dlantb: lower_unit_one', function t() {
	runCase( 'lower_unit_one', 'one-norm', 'lower', 'unit', 5, 2, AB_LOWER_K2 );
});

test( 'dlantb: lower_unit_inf', function t() {
	runCase( 'lower_unit_inf', 'inf-norm', 'lower', 'unit', 5, 2, AB_LOWER_K2 );
});

test( 'dlantb: lower_unit_frob', function t() {
	runCase( 'lower_unit_frob', 'frobenius', 'lower', 'unit', 5, 2, AB_LOWER_K2 );
});

test( 'dlantb: edge_n0', function t() {
	runCase( 'edge_n0', 'max', 'upper', 'non-unit', 0, 2, AB_UPPER_K2 );
});

test( 'dlantb: edge_1x1_max', function t() {
	runCase( 'edge_1x1_max', 'max', 'upper', 'non-unit', 1, 0, AB_1X1 );
});

test( 'dlantb: edge_1x1_one', function t() {
	runCase( 'edge_1x1_one', 'one-norm', 'upper', 'non-unit', 1, 0, AB_1X1 );
});

test( 'dlantb: edge_1x1_inf', function t() {
	runCase( 'edge_1x1_inf', 'inf-norm', 'upper', 'non-unit', 1, 0, AB_1X1 );
});

test( 'dlantb: edge_1x1_frob', function t() {
	runCase( 'edge_1x1_frob', 'frobenius', 'upper', 'non-unit', 1, 0, AB_1X1 );
});

test( 'dlantb: edge_1x1_unit_max', function t() {
	runCase( 'edge_1x1_unit_max', 'max', 'upper', 'unit', 1, 0, AB_1X1 );
});

test( 'dlantb: diag_k0_upper_max', function t() {
	runCase( 'diag_k0_upper_max', 'max', 'upper', 'non-unit', 4, 0, AB_K0_DIAG );
});

test( 'dlantb: diag_k0_upper_one', function t() {
	runCase( 'diag_k0_upper_one', 'one-norm', 'upper', 'non-unit', 4, 0, AB_K0_DIAG );
});

test( 'dlantb: diag_k0_upper_inf', function t() {
	runCase( 'diag_k0_upper_inf', 'inf-norm', 'upper', 'non-unit', 4, 0, AB_K0_DIAG );
});

test( 'dlantb: diag_k0_upper_frob', function t() {
	runCase( 'diag_k0_upper_frob', 'frobenius', 'upper', 'non-unit', 4, 0, AB_K0_DIAG );
});

test( 'dlantb: upper_k1_nonunit_max', function t() {
	runCase( 'upper_k1_nonunit_max', 'max', 'upper', 'non-unit', 4, 1, AB_UPPER_K1 );
});

test( 'dlantb: upper_k1_nonunit_one', function t() {
	runCase( 'upper_k1_nonunit_one', 'one-norm', 'upper', 'non-unit', 4, 1, AB_UPPER_K1 );
});

test( 'dlantb: upper_k1_nonunit_inf', function t() {
	runCase( 'upper_k1_nonunit_inf', 'inf-norm', 'upper', 'non-unit', 4, 1, AB_UPPER_K1 );
});

test( 'dlantb: upper_k1_nonunit_frob', function t() {
	runCase( 'upper_k1_nonunit_frob', 'frobenius', 'upper', 'non-unit', 4, 1, AB_UPPER_K1 );
});

test( 'dlantb: upper_k1_unit_max', function t() {
	runCase( 'upper_k1_unit_max', 'max', 'upper', 'unit', 4, 1, AB_UPPER_K1 );
});

test( 'dlantb: upper_k1_unit_one', function t() {
	runCase( 'upper_k1_unit_one', 'one-norm', 'upper', 'unit', 4, 1, AB_UPPER_K1 );
});

test( 'dlantb: upper_k1_unit_inf', function t() {
	runCase( 'upper_k1_unit_inf', 'inf-norm', 'upper', 'unit', 4, 1, AB_UPPER_K1 );
});

test( 'dlantb: upper_k1_unit_frob', function t() {
	runCase( 'upper_k1_unit_frob', 'frobenius', 'upper', 'unit', 4, 1, AB_UPPER_K1 );
});

test( 'dlantb: lower_k1_nonunit_max', function t() {
	runCase( 'lower_k1_nonunit_max', 'max', 'lower', 'non-unit', 4, 1, AB_LOWER_K1 );
});

test( 'dlantb: lower_k1_nonunit_one', function t() {
	runCase( 'lower_k1_nonunit_one', 'one-norm', 'lower', 'non-unit', 4, 1, AB_LOWER_K1 );
});

test( 'dlantb: lower_k1_nonunit_inf', function t() {
	runCase( 'lower_k1_nonunit_inf', 'inf-norm', 'lower', 'non-unit', 4, 1, AB_LOWER_K1 );
});

test( 'dlantb: lower_k1_nonunit_frob', function t() {
	runCase( 'lower_k1_nonunit_frob', 'frobenius', 'lower', 'non-unit', 4, 1, AB_LOWER_K1 );
});

test( 'dlantb: lower_k1_unit_max', function t() {
	runCase( 'lower_k1_unit_max', 'max', 'lower', 'unit', 4, 1, AB_LOWER_K1 );
});

test( 'dlantb: lower_k1_unit_one', function t() {
	runCase( 'lower_k1_unit_one', 'one-norm', 'lower', 'unit', 4, 1, AB_LOWER_K1 );
});

test( 'dlantb: lower_k1_unit_inf', function t() {
	runCase( 'lower_k1_unit_inf', 'inf-norm', 'lower', 'unit', 4, 1, AB_LOWER_K1 );
});

test( 'dlantb: lower_k1_unit_frob', function t() {
	runCase( 'lower_k1_unit_frob', 'frobenius', 'lower', 'unit', 4, 1, AB_LOWER_K1 );
});
