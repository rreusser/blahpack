/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import { readFileSync } from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import dlanst from './../lib/ndarray.js';


// FIXTURES //

var fixtureFile = path.join( import.meta.dirname, '..', '..', '..', '..', '..', 'test', 'fixtures', 'dlanst.jsonl' );
var rawLines = readFileSync( fixtureFile, 'utf8' ).trim().split( '\n' );
var FIXTURES = rawLines.map( function parse( line ) {
	return JSON.parse( line );
});


// FUNCTIONS //

function assertClose( actual, expected, tol, msg ) {
	var relErr = Math.abs( actual - expected ) / Math.max( Math.abs( expected ), 1.0 );
	assert.ok( relErr <= tol, format( '%s: expected %s, got %s (rel err %s)', msg, expected, actual, relErr ) );
}

function findCase( name ) {
	var i;
	for ( i = 0; i < FIXTURES.length; i++ ) {
		if ( FIXTURES[ i ].name === name ) {
			return FIXTURES[ i ];
		}
	}
	throw new Error( format( 'fixture not found: %s', name ) );
}


// MATRIX DATA (mirrors test/fortran/test_dlanst.f90) //

// N=1: d(1) = -3
var D_N1 = new Float64Array( [ -3.0 ] );
var E_EMPTY = new Float64Array( 0 );

// N=5: d = [2, -4, 6, -1, 3], e = [1, -2, 3, 5]
var D_N5 = new Float64Array( [ 2.0, -4.0, 6.0, -1.0, 3.0 ] );
var E_N5 = new Float64Array( [ 1.0, -2.0, 3.0, 5.0 ] );

// N=2: d = [1, 2], e = [3]
var D_N2 = new Float64Array( [ 1.0, 2.0 ] );
var E_N2 = new Float64Array( [ 3.0 ] );

// N=5 positive: d = [1,2,3,4,5], e = [0.5, 1.5, 2.5, 3.5]
var D_N5P = new Float64Array( [ 1.0, 2.0, 3.0, 4.0, 5.0 ] );
var E_N5P = new Float64Array( [ 0.5, 1.5, 2.5, 3.5 ] );


// FUNCTIONS //

function runCase( name, norm, N, D, E ) {
	var tc = findCase( name );
	var got = dlanst( norm, N, D, 1, 0, E, 1, 0 );
	assertClose( got, tc.anorm, 1e-12, 'dlanst: ' + name );
}


// TESTS //

test( 'dlanst: n_zero', function t() {
	runCase( 'n_zero', 'max', 0, new Float64Array( 0 ), E_EMPTY );
});

test( 'dlanst: n1_max', function t() {
	runCase( 'n1_max', 'max', 1, D_N1, E_EMPTY );
});

test( 'dlanst: n1_one', function t() {
	runCase( 'n1_one', 'one-norm', 1, D_N1, E_EMPTY );
});

test( 'dlanst: n1_inf', function t() {
	runCase( 'n1_inf', 'inf-norm', 1, D_N1, E_EMPTY );
});

test( 'dlanst: n1_frob', function t() {
	runCase( 'n1_frob', 'frobenius', 1, D_N1, E_EMPTY );
});

test( 'dlanst: n5_max', function t() {
	runCase( 'n5_max', 'max', 5, D_N5, E_N5 );
});

test( 'dlanst: n5_one', function t() {
	runCase( 'n5_one', 'one-norm', 5, D_N5, E_N5 );
});

test( 'dlanst: n5_inf', function t() {
	runCase( 'n5_inf', 'inf-norm', 5, D_N5, E_N5 );
});

test( 'dlanst: n5_frob', function t() {
	runCase( 'n5_frob', 'frobenius', 5, D_N5, E_N5 );
});

test( 'dlanst: n2_one', function t() {
	runCase( 'n2_one', 'one-norm', 2, D_N2, E_N2 );
});

test( 'dlanst: n2_frob', function t() {
	runCase( 'n2_frob', 'frobenius', 2, D_N2, E_N2 );
});

test( 'dlanst: n2_e_norm', function t() {
	runCase( 'n2_e_norm', 'frobenius', 2, D_N2, E_N2 );
});

test( 'dlanst: n5_max_positive', function t() {
	runCase( 'n5_max_positive', 'max', 5, D_N5P, E_N5P );
});
