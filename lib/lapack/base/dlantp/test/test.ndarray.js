/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import { readFileSync } from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import dlantp from './../lib/ndarray.js';


// FIXTURES //

var fixtureDir = path.join( import.meta.dirname, '..', '..', '..', '..', '..', 'test', 'fixtures' );
var rawLines = readFileSync( path.join( fixtureDir, 'dlantp.jsonl' ), 'utf8' ).trim().split( '\n' ); // eslint-disable-line node/no-sync, max-len
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


// FIXTURES (matrix data) //

// 3x3 upper, packed: 2,3,5,-1,2,7
var AP_3X3_UPPER = new Float64Array([ 2.0, 3.0, 5.0, -1.0, 2.0, 7.0 ]);

// 3x3 lower, packed: 2,3,-1,5,2,7
var AP_3X3_LOWER = new Float64Array([ 2.0, 3.0, -1.0, 5.0, 2.0, 7.0 ]);

// 4x4 upper, packed: 2,3,5,-1,2,7,4,-6,1,8
var AP_4X4_UPPER = new Float64Array([ 2.0, 3.0, 5.0, -1.0, 2.0, 7.0, 4.0, -6.0, 1.0, 8.0 ]);

// 4x4 lower, packed: 2,3,-1,4,5,2,-6,7,1,8
var AP_4X4_LOWER = new Float64Array([ 2.0, 3.0, -1.0, 4.0, 5.0, 2.0, -6.0, 7.0, 1.0, 8.0 ]);

// 1x1, single = -5.5
var AP_1X1 = new Float64Array([ -5.5 ]);


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
* @param {Float64Array} AP - packed storage
*/
function runCase( name, norm, uplo, diag, N, AP ) {
	var WORK = new Float64Array( Math.max( N, 1 ) );
	var tc = findCase( name );
	var got = dlantp( norm, uplo, diag, N, AP, 1, 0, WORK, 1, 0 );
	assertClose( got, tc.result, 1e-12, 'dlantp: ' + name );
}


// TESTS //

test( 'dlantp: dlantp_3x3_max_U_N', function t() {
	runCase( 'dlantp_3x3_max_U_N', 'max', 'upper', 'non-unit', 3, AP_3X3_UPPER );
});

test( 'dlantp: dlantp_3x3_one_U_N', function t() {
	runCase( 'dlantp_3x3_one_U_N', 'one-norm', 'upper', 'non-unit', 3, AP_3X3_UPPER );
});

test( 'dlantp: dlantp_3x3_inf_U_N', function t() {
	runCase( 'dlantp_3x3_inf_U_N', 'inf-norm', 'upper', 'non-unit', 3, AP_3X3_UPPER );
});

test( 'dlantp: dlantp_3x3_frob_U_N', function t() {
	runCase( 'dlantp_3x3_frob_U_N', 'frobenius', 'upper', 'non-unit', 3, AP_3X3_UPPER );
});

test( 'dlantp: dlantp_3x3_max_U_U', function t() {
	runCase( 'dlantp_3x3_max_U_U', 'max', 'upper', 'unit', 3, AP_3X3_UPPER );
});

test( 'dlantp: dlantp_3x3_one_U_U', function t() {
	runCase( 'dlantp_3x3_one_U_U', 'one-norm', 'upper', 'unit', 3, AP_3X3_UPPER );
});

test( 'dlantp: dlantp_3x3_inf_U_U', function t() {
	runCase( 'dlantp_3x3_inf_U_U', 'inf-norm', 'upper', 'unit', 3, AP_3X3_UPPER );
});

test( 'dlantp: dlantp_3x3_frob_U_U', function t() {
	runCase( 'dlantp_3x3_frob_U_U', 'frobenius', 'upper', 'unit', 3, AP_3X3_UPPER );
});

test( 'dlantp: dlantp_3x3_max_L_N', function t() {
	runCase( 'dlantp_3x3_max_L_N', 'max', 'lower', 'non-unit', 3, AP_3X3_LOWER );
});

test( 'dlantp: dlantp_3x3_one_L_N', function t() {
	runCase( 'dlantp_3x3_one_L_N', 'one-norm', 'lower', 'non-unit', 3, AP_3X3_LOWER );
});

test( 'dlantp: dlantp_3x3_inf_L_N', function t() {
	runCase( 'dlantp_3x3_inf_L_N', 'inf-norm', 'lower', 'non-unit', 3, AP_3X3_LOWER );
});

test( 'dlantp: dlantp_3x3_frob_L_N', function t() {
	runCase( 'dlantp_3x3_frob_L_N', 'frobenius', 'lower', 'non-unit', 3, AP_3X3_LOWER );
});

test( 'dlantp: dlantp_3x3_max_L_U', function t() {
	runCase( 'dlantp_3x3_max_L_U', 'max', 'lower', 'unit', 3, AP_3X3_LOWER );
});

test( 'dlantp: dlantp_3x3_one_L_U', function t() {
	runCase( 'dlantp_3x3_one_L_U', 'one-norm', 'lower', 'unit', 3, AP_3X3_LOWER );
});

test( 'dlantp: dlantp_3x3_inf_L_U', function t() {
	runCase( 'dlantp_3x3_inf_L_U', 'inf-norm', 'lower', 'unit', 3, AP_3X3_LOWER );
});

test( 'dlantp: dlantp_3x3_frob_L_U', function t() {
	runCase( 'dlantp_3x3_frob_L_U', 'frobenius', 'lower', 'unit', 3, AP_3X3_LOWER );
});

test( 'dlantp: dlantp_4x4_max_U_N', function t() {
	runCase( 'dlantp_4x4_max_U_N', 'max', 'upper', 'non-unit', 4, AP_4X4_UPPER );
});

test( 'dlantp: dlantp_4x4_one_U_N', function t() {
	runCase( 'dlantp_4x4_one_U_N', 'one-norm', 'upper', 'non-unit', 4, AP_4X4_UPPER );
});

test( 'dlantp: dlantp_4x4_inf_U_N', function t() {
	runCase( 'dlantp_4x4_inf_U_N', 'inf-norm', 'upper', 'non-unit', 4, AP_4X4_UPPER );
});

test( 'dlantp: dlantp_4x4_frob_U_N', function t() {
	runCase( 'dlantp_4x4_frob_U_N', 'frobenius', 'upper', 'non-unit', 4, AP_4X4_UPPER );
});

test( 'dlantp: dlantp_4x4_max_U_U', function t() {
	runCase( 'dlantp_4x4_max_U_U', 'max', 'upper', 'unit', 4, AP_4X4_UPPER );
});

test( 'dlantp: dlantp_4x4_one_U_U', function t() {
	runCase( 'dlantp_4x4_one_U_U', 'one-norm', 'upper', 'unit', 4, AP_4X4_UPPER );
});

test( 'dlantp: dlantp_4x4_inf_U_U', function t() {
	runCase( 'dlantp_4x4_inf_U_U', 'inf-norm', 'upper', 'unit', 4, AP_4X4_UPPER );
});

test( 'dlantp: dlantp_4x4_frob_U_U', function t() {
	runCase( 'dlantp_4x4_frob_U_U', 'frobenius', 'upper', 'unit', 4, AP_4X4_UPPER );
});

test( 'dlantp: dlantp_4x4_max_L_N', function t() {
	runCase( 'dlantp_4x4_max_L_N', 'max', 'lower', 'non-unit', 4, AP_4X4_LOWER );
});

test( 'dlantp: dlantp_4x4_one_L_N', function t() {
	runCase( 'dlantp_4x4_one_L_N', 'one-norm', 'lower', 'non-unit', 4, AP_4X4_LOWER );
});

test( 'dlantp: dlantp_4x4_inf_L_N', function t() {
	runCase( 'dlantp_4x4_inf_L_N', 'inf-norm', 'lower', 'non-unit', 4, AP_4X4_LOWER );
});

test( 'dlantp: dlantp_4x4_frob_L_N', function t() {
	runCase( 'dlantp_4x4_frob_L_N', 'frobenius', 'lower', 'non-unit', 4, AP_4X4_LOWER );
});

test( 'dlantp: dlantp_4x4_max_L_U', function t() {
	runCase( 'dlantp_4x4_max_L_U', 'max', 'lower', 'unit', 4, AP_4X4_LOWER );
});

test( 'dlantp: dlantp_4x4_one_L_U', function t() {
	runCase( 'dlantp_4x4_one_L_U', 'one-norm', 'lower', 'unit', 4, AP_4X4_LOWER );
});

test( 'dlantp: dlantp_4x4_inf_L_U', function t() {
	runCase( 'dlantp_4x4_inf_L_U', 'inf-norm', 'lower', 'unit', 4, AP_4X4_LOWER );
});

test( 'dlantp: dlantp_4x4_frob_L_U', function t() {
	runCase( 'dlantp_4x4_frob_L_U', 'frobenius', 'lower', 'unit', 4, AP_4X4_LOWER );
});

test( 'dlantp: dlantp_n0', function t() {
	runCase( 'dlantp_n0', 'max', 'upper', 'non-unit', 0, AP_4X4_UPPER );
});

test( 'dlantp: dlantp_1x1_max_N', function t() {
	runCase( 'dlantp_1x1_max_N', 'max', 'upper', 'non-unit', 1, AP_1X1 );
});

test( 'dlantp: dlantp_1x1_one_N', function t() {
	runCase( 'dlantp_1x1_one_N', 'one-norm', 'upper', 'non-unit', 1, AP_1X1 );
});

test( 'dlantp: dlantp_1x1_inf_N', function t() {
	runCase( 'dlantp_1x1_inf_N', 'inf-norm', 'upper', 'non-unit', 1, AP_1X1 );
});

test( 'dlantp: dlantp_1x1_frob_N', function t() {
	runCase( 'dlantp_1x1_frob_N', 'frobenius', 'upper', 'non-unit', 1, AP_1X1 );
});

test( 'dlantp: dlantp_1x1_max_U', function t() {
	runCase( 'dlantp_1x1_max_U', 'max', 'upper', 'unit', 1, AP_1X1 );
});

test( 'dlantp: dlantp_1x1_one_U', function t() {
	runCase( 'dlantp_1x1_one_U', 'one-norm', 'upper', 'unit', 1, AP_1X1 );
});

test( 'dlantp: dlantp_1x1_inf_U', function t() {
	runCase( 'dlantp_1x1_inf_U', 'inf-norm', 'upper', 'unit', 1, AP_1X1 );
});

test( 'dlantp: dlantp_1x1_frob_U', function t() {
	runCase( 'dlantp_1x1_frob_U', 'frobenius', 'upper', 'unit', 1, AP_1X1 );
});
