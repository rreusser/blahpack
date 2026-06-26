/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import { readFileSync } from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import zlantp from './../lib/ndarray.js';


// FIXTURES //

var fixtureDir = path.join( import.meta.dirname, '..', '..', '..', '..', '..', 'test', 'fixtures' );
var rawLines = readFileSync( path.join( fixtureDir, 'zlantp.jsonl' ), 'utf8' ).trim().split( '\n' ); // eslint-disable-line node/no-sync, max-len
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
* Builds a Complex128Array from interleaved (re, im) pairs.
*
* @private
* @param {Array} pairs - flat list of (re, im) pairs
* @returns {Complex128Array} packed storage
*/
function buildAP( pairs ) {
	var raw = new Float64Array( pairs );
	return new Complex128Array( raw.buffer );
}


// FIXTURES (matrix data) //

// 3x3 upper, packed: (1,2),(3,4),(7,8),(5,6),(9,1),(2,3)
var AP_3X3_UPPER = buildAP([
	1, 2, 3, 4, 7, 8, 5, 6, 9, 1, 2, 3
]);

// 3x3 lower, packed: (1,2),(3,4),(5,6),(7,8),(9,1),(2,3)
var AP_3X3_LOWER = buildAP([
	1, 2, 3, 4, 5, 6, 7, 8, 9, 1, 2, 3
]);

// 4x4 upper:

// (1,1),(2,-1),(5,1),(3,2),(1,-2),(6,-1),(4,-3),(2,4),(3,1),(7,2)
var AP_4X4_UPPER = buildAP([
	1, 1,
	2, -1,
	5, 1,
	3, 2,
	1, -2,
	6, -1,
	4, -3,
	2, 4,
	3, 1,
	7, 2
]);

// 4x4 lower:

// (1,1),(2,-1),(3,2),(4,-3),(5,1),(1,-2),(2,4),(6,-1),(3,1),(7,2)
var AP_4X4_LOWER = buildAP([
	1, 1,
	2, -1,
	3, 2,
	4, -3,
	5, 1,
	1, -2,
	2, 4,
	6, -1,
	3, 1,
	7, 2
]);

// 1x1: (3,4)
var AP_1X1 = buildAP([ 3, 4 ]);


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
* @param {Complex128Array} AP - packed storage
*/
function runCase( name, norm, uplo, diag, N, AP ) {
	var WORK = new Float64Array( Math.max( N, 1 ) );
	var tc = findCase( name );
	var got = zlantp( norm, uplo, diag, N, AP, 1, 0, WORK, 1, 0 );
	assertClose( got, tc.result, 1e-12, 'zlantp: ' + name );
}


// TESTS //

test( 'zlantp: max_upper_nonunit', function t() {
	runCase( 'max_upper_nonunit', 'max', 'upper', 'non-unit', 3, AP_3X3_UPPER );
});

test( 'zlantp: one_upper_nonunit', function t() {
	runCase( 'one_upper_nonunit', 'one-norm', 'upper', 'non-unit', 3, AP_3X3_UPPER );
});

test( 'zlantp: inf_upper_nonunit', function t() {
	runCase( 'inf_upper_nonunit', 'inf-norm', 'upper', 'non-unit', 3, AP_3X3_UPPER );
});

test( 'zlantp: frob_upper_nonunit', function t() {
	runCase( 'frob_upper_nonunit', 'frobenius', 'upper', 'non-unit', 3, AP_3X3_UPPER );
});

test( 'zlantp: max_upper_unit', function t() {
	runCase( 'max_upper_unit', 'max', 'upper', 'unit', 3, AP_3X3_UPPER );
});

test( 'zlantp: one_upper_unit', function t() {
	runCase( 'one_upper_unit', 'one-norm', 'upper', 'unit', 3, AP_3X3_UPPER );
});

test( 'zlantp: inf_upper_unit', function t() {
	runCase( 'inf_upper_unit', 'inf-norm', 'upper', 'unit', 3, AP_3X3_UPPER );
});

test( 'zlantp: frob_upper_unit', function t() {
	runCase( 'frob_upper_unit', 'frobenius', 'upper', 'unit', 3, AP_3X3_UPPER );
});

test( 'zlantp: max_lower_nonunit', function t() {
	runCase( 'max_lower_nonunit', 'max', 'lower', 'non-unit', 3, AP_3X3_LOWER );
});

test( 'zlantp: one_lower_nonunit', function t() {
	runCase( 'one_lower_nonunit', 'one-norm', 'lower', 'non-unit', 3, AP_3X3_LOWER );
});

test( 'zlantp: inf_lower_nonunit', function t() {
	runCase( 'inf_lower_nonunit', 'inf-norm', 'lower', 'non-unit', 3, AP_3X3_LOWER );
});

test( 'zlantp: frob_lower_nonunit', function t() {
	runCase( 'frob_lower_nonunit', 'frobenius', 'lower', 'non-unit', 3, AP_3X3_LOWER );
});

test( 'zlantp: max_lower_unit', function t() {
	runCase( 'max_lower_unit', 'max', 'lower', 'unit', 3, AP_3X3_LOWER );
});

test( 'zlantp: one_lower_unit', function t() {
	runCase( 'one_lower_unit', 'one-norm', 'lower', 'unit', 3, AP_3X3_LOWER );
});

test( 'zlantp: inf_lower_unit', function t() {
	runCase( 'inf_lower_unit', 'inf-norm', 'lower', 'unit', 3, AP_3X3_LOWER );
});

test( 'zlantp: frob_lower_unit', function t() {
	runCase( 'frob_lower_unit', 'frobenius', 'lower', 'unit', 3, AP_3X3_LOWER );
});

test( 'zlantp: 4x4_max_upper_nonunit', function t() {
	runCase( '4x4_max_upper_nonunit', 'max', 'upper', 'non-unit', 4, AP_4X4_UPPER );
});

test( 'zlantp: 4x4_one_upper_nonunit', function t() {
	runCase( '4x4_one_upper_nonunit', 'one-norm', 'upper', 'non-unit', 4, AP_4X4_UPPER );
});

test( 'zlantp: 4x4_inf_upper_nonunit', function t() {
	runCase( '4x4_inf_upper_nonunit', 'inf-norm', 'upper', 'non-unit', 4, AP_4X4_UPPER );
});

test( 'zlantp: 4x4_frob_upper_nonunit', function t() {
	runCase( '4x4_frob_upper_nonunit', 'frobenius', 'upper', 'non-unit', 4, AP_4X4_UPPER );
});

test( 'zlantp: 4x4_max_upper_unit', function t() {
	runCase( '4x4_max_upper_unit', 'max', 'upper', 'unit', 4, AP_4X4_UPPER );
});

test( 'zlantp: 4x4_one_upper_unit', function t() {
	runCase( '4x4_one_upper_unit', 'one-norm', 'upper', 'unit', 4, AP_4X4_UPPER );
});

test( 'zlantp: 4x4_inf_upper_unit', function t() {
	runCase( '4x4_inf_upper_unit', 'inf-norm', 'upper', 'unit', 4, AP_4X4_UPPER );
});

test( 'zlantp: 4x4_frob_upper_unit', function t() {
	runCase( '4x4_frob_upper_unit', 'frobenius', 'upper', 'unit', 4, AP_4X4_UPPER );
});

test( 'zlantp: 4x4_max_lower_nonunit', function t() {
	runCase( '4x4_max_lower_nonunit', 'max', 'lower', 'non-unit', 4, AP_4X4_LOWER );
});

test( 'zlantp: 4x4_one_lower_nonunit', function t() {
	runCase( '4x4_one_lower_nonunit', 'one-norm', 'lower', 'non-unit', 4, AP_4X4_LOWER );
});

test( 'zlantp: 4x4_inf_lower_nonunit', function t() {
	runCase( '4x4_inf_lower_nonunit', 'inf-norm', 'lower', 'non-unit', 4, AP_4X4_LOWER );
});

test( 'zlantp: 4x4_frob_lower_nonunit', function t() {
	runCase( '4x4_frob_lower_nonunit', 'frobenius', 'lower', 'non-unit', 4, AP_4X4_LOWER );
});

test( 'zlantp: 4x4_max_lower_unit', function t() {
	runCase( '4x4_max_lower_unit', 'max', 'lower', 'unit', 4, AP_4X4_LOWER );
});

test( 'zlantp: 4x4_one_lower_unit', function t() {
	runCase( '4x4_one_lower_unit', 'one-norm', 'lower', 'unit', 4, AP_4X4_LOWER );
});

test( 'zlantp: 4x4_inf_lower_unit', function t() {
	runCase( '4x4_inf_lower_unit', 'inf-norm', 'lower', 'unit', 4, AP_4X4_LOWER );
});

test( 'zlantp: 4x4_frob_lower_unit', function t() {
	runCase( '4x4_frob_lower_unit', 'frobenius', 'lower', 'unit', 4, AP_4X4_LOWER );
});

test( 'zlantp: n_zero', function t() {
	runCase( 'n_zero', 'max', 'upper', 'non-unit', 0, AP_4X4_UPPER );
});

test( 'zlantp: 1x1_max_nonunit', function t() {
	runCase( '1x1_max_nonunit', 'max', 'upper', 'non-unit', 1, AP_1X1 );
});

test( 'zlantp: 1x1_one_nonunit', function t() {
	runCase( '1x1_one_nonunit', 'one-norm', 'upper', 'non-unit', 1, AP_1X1 );
});

test( 'zlantp: 1x1_inf_nonunit', function t() {
	runCase( '1x1_inf_nonunit', 'inf-norm', 'upper', 'non-unit', 1, AP_1X1 );
});

test( 'zlantp: 1x1_frob_nonunit', function t() {
	runCase( '1x1_frob_nonunit', 'frobenius', 'upper', 'non-unit', 1, AP_1X1 );
});

test( 'zlantp: 1x1_max_unit', function t() {
	runCase( '1x1_max_unit', 'max', 'upper', 'unit', 1, AP_1X1 );
});

test( 'zlantp: 1x1_frob_unit', function t() {
	runCase( '1x1_frob_unit', 'frobenius', 'upper', 'unit', 1, AP_1X1 );
});
