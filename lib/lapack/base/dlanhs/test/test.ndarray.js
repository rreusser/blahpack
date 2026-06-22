/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import { readFileSync } from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import dlanhs from './../lib/ndarray.js';


// FIXTURES //

var fixtureFile = path.join( import.meta.dirname, '..', '..', '..', '..', '..', 'test', 'fixtures', 'dlanhs.jsonl' );
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


// MATRIX DATA (mirrors test/fortran/test_dlanhs.f90) //

// 3x3 upper Hessenberg, LDA=3 (column-major).
//   Col1: 1, 4, 0
//   Col2: 2, 5, 7
//   Col3: 3, 6, 8
var A_3X3 = new Float64Array( [
	1.0, 4.0, 0.0,
	2.0, 5.0, 7.0,
	3.0, 6.0, 8.0
] );

// 1x1: -5.5
var A_1X1 = new Float64Array( [ -5.5 ] );

// 4x4 upper Hessenberg, LDA=4 (column-major):
//   Col1:  2, -1,  0,  0
//   Col2:  4, -6,  1,  0
//   Col3: -7,  2,  8, -4
//   Col4:  1,  0, -3,  5
var A_4X4 = new Float64Array( [
	2.0, -1.0, 0.0, 0.0,
	4.0, -6.0, 1.0, 0.0,
	-7.0, 2.0, 8.0, -4.0,
	1.0, 0.0, -3.0, 5.0
] );


// FUNCTIONS //

function runCase( name, norm, N, A, lda ) {
	var WORK = new Float64Array( Math.max( N, 1 ) );
	var tc = findCase( name );
	var got = dlanhs( norm, N, A, 1, lda, 0, WORK, 1, 0 );
	assertClose( got, tc.result, 1e-12, 'dlanhs: ' + name );
}


// TESTS //

test( 'dlanhs: max_norm', function t() {
	runCase( 'max_norm', 'max', 3, A_3X3, 3 );
});

test( 'dlanhs: one_norm', function t() {
	runCase( 'one_norm', 'one-norm', 3, A_3X3, 3 );
});

test( 'dlanhs: one_norm_O', function t() {
	runCase( 'one_norm_O', 'one-norm', 3, A_3X3, 3 );
});

test( 'dlanhs: inf_norm', function t() {
	runCase( 'inf_norm', 'inf-norm', 3, A_3X3, 3 );
});

test( 'dlanhs: frob_norm', function t() {
	runCase( 'frob_norm', 'frobenius', 3, A_3X3, 3 );
});

test( 'dlanhs: frob_norm_E', function t() {
	runCase( 'frob_norm_E', 'frobenius', 3, A_3X3, 3 );
});

test( 'dlanhs: n_zero', function t() {
	runCase( 'n_zero', 'max', 0, A_3X3, 3 );
});

test( 'dlanhs: one_by_one_max', function t() {
	runCase( 'one_by_one_max', 'max', 1, A_1X1, 1 );
});

test( 'dlanhs: one_by_one_one', function t() {
	runCase( 'one_by_one_one', 'one-norm', 1, A_1X1, 1 );
});

test( 'dlanhs: one_by_one_inf', function t() {
	runCase( 'one_by_one_inf', 'inf-norm', 1, A_1X1, 1 );
});

test( 'dlanhs: one_by_one_frob', function t() {
	runCase( 'one_by_one_frob', 'frobenius', 1, A_1X1, 1 );
});

test( 'dlanhs: big_max', function t() {
	runCase( 'big_max', 'max', 4, A_4X4, 4 );
});

test( 'dlanhs: big_one', function t() {
	runCase( 'big_one', 'one-norm', 4, A_4X4, 4 );
});

test( 'dlanhs: big_inf', function t() {
	runCase( 'big_inf', 'inf-norm', 4, A_4X4, 4 );
});

test( 'dlanhs: big_frob', function t() {
	runCase( 'big_frob', 'frobenius', 4, A_4X4, 4 );
});
