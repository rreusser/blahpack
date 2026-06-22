/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import { readFileSync } from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import dlangt from './../lib/ndarray.js';


// FIXTURES //

var fixtureFile = path.join( import.meta.dirname, '..', '..', '..', '..', '..', 'test', 'fixtures', 'dlangt.jsonl' );
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


// MATRIX DATA (mirrors test/fortran/test_dlangt.f90) //

// 4x4 tridiagonal:
//   d  = [2, 4, 5, 6]
//   dl = [3, 1, 2]
//   du = [-1, -2, -3]
var DL_4 = new Float64Array( [ 3.0, 1.0, 2.0 ] );
var D_4 = new Float64Array( [ 2.0, 4.0, 5.0, 6.0 ] );
var DU_4 = new Float64Array( [ -1.0, -2.0, -3.0 ] );

// N=1: d(1) = -7
var D_N1 = new Float64Array( [ -7.0 ] );
var DL_EMPTY = new Float64Array( 0 );
var DU_EMPTY = new Float64Array( 0 );

// 5x5 larger:
//   dl = [1, 2, 3, 4]
//   d  = [10, 20, 30, 40, 50]
//   du = [5, 6, 7, 8]
var DL_5 = new Float64Array( [ 1.0, 2.0, 3.0, 4.0 ] );
var D_5 = new Float64Array( [ 10.0, 20.0, 30.0, 40.0, 50.0 ] );
var DU_5 = new Float64Array( [ 5.0, 6.0, 7.0, 8.0 ] );

// N=2:
//   dl = [0.5]
//   d  = [3, 4]
//   du = [1.5]
var DL_N2 = new Float64Array( [ 0.5 ] );
var D_N2 = new Float64Array( [ 3.0, 4.0 ] );
var DU_N2 = new Float64Array( [ 1.5 ] );


// FUNCTIONS //

function runCase( name, norm, N, DL, D, DU ) {
	var tc = findCase( name );
	var got = dlangt( norm, N, DL, 1, 0, D, 1, 0, DU, 1, 0 );
	assertClose( got, tc.result, 1e-12, 'dlangt: ' + name );
}


// TESTS //

test( 'dlangt: max_norm_4x4', function t() {
	runCase( 'max_norm_4x4', 'max', 4, DL_4, D_4, DU_4 );
});

test( 'dlangt: one_norm_4x4', function t() {
	runCase( 'one_norm_4x4', 'one-norm', 4, DL_4, D_4, DU_4 );
});

test( 'dlangt: one_norm_O_4x4', function t() {
	runCase( 'one_norm_O_4x4', 'one-norm', 4, DL_4, D_4, DU_4 );
});

test( 'dlangt: inf_norm_4x4', function t() {
	runCase( 'inf_norm_4x4', 'inf-norm', 4, DL_4, D_4, DU_4 );
});

test( 'dlangt: frob_norm_4x4', function t() {
	runCase( 'frob_norm_4x4', 'frobenius', 4, DL_4, D_4, DU_4 );
});

test( 'dlangt: frob_norm_E_4x4', function t() {
	runCase( 'frob_norm_E_4x4', 'frobenius', 4, DL_4, D_4, DU_4 );
});

test( 'dlangt: max_norm_n1', function t() {
	runCase( 'max_norm_n1', 'max', 1, DL_EMPTY, D_N1, DU_EMPTY );
});

test( 'dlangt: one_norm_n1', function t() {
	runCase( 'one_norm_n1', 'one-norm', 1, DL_EMPTY, D_N1, DU_EMPTY );
});

test( 'dlangt: inf_norm_n1', function t() {
	runCase( 'inf_norm_n1', 'inf-norm', 1, DL_EMPTY, D_N1, DU_EMPTY );
});

test( 'dlangt: frob_norm_n1', function t() {
	runCase( 'frob_norm_n1', 'frobenius', 1, DL_EMPTY, D_N1, DU_EMPTY );
});

test( 'dlangt: n_zero', function t() {
	runCase( 'n_zero', 'max', 0, DL_EMPTY, new Float64Array( 0 ), DU_EMPTY );
});

test( 'dlangt: max_norm_5x5', function t() {
	runCase( 'max_norm_5x5', 'max', 5, DL_5, D_5, DU_5 );
});

test( 'dlangt: one_norm_5x5', function t() {
	runCase( 'one_norm_5x5', 'one-norm', 5, DL_5, D_5, DU_5 );
});

test( 'dlangt: inf_norm_5x5', function t() {
	runCase( 'inf_norm_5x5', 'inf-norm', 5, DL_5, D_5, DU_5 );
});

test( 'dlangt: frob_norm_5x5', function t() {
	runCase( 'frob_norm_5x5', 'frobenius', 5, DL_5, D_5, DU_5 );
});

test( 'dlangt: max_norm_n2', function t() {
	runCase( 'max_norm_n2', 'max', 2, DL_N2, D_N2, DU_N2 );
});

test( 'dlangt: one_norm_n2', function t() {
	runCase( 'one_norm_n2', 'one-norm', 2, DL_N2, D_N2, DU_N2 );
});

test( 'dlangt: inf_norm_n2', function t() {
	runCase( 'inf_norm_n2', 'inf-norm', 2, DL_N2, D_N2, DU_N2 );
});

test( 'dlangt: frob_norm_n2', function t() {
	runCase( 'frob_norm_n2', 'frobenius', 2, DL_N2, D_N2, DU_N2 );
});
