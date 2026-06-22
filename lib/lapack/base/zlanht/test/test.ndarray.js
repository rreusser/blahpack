/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import { readFileSync } from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import zlanht from './../lib/ndarray.js';


// FIXTURES //

var fixtureFile = path.join( import.meta.dirname, '..', '..', '..', '..', '..', 'test', 'fixtures', 'zlanht.jsonl' );
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

/**
* Builds a Complex128Array from interleaved real/imag pairs.
*
* @private
* @param {Array<number>} flat - flat array of real/imag pairs
* @returns {Complex128Array} complex array
*/
function buildCArr( flat ) {
	var buf = new Float64Array( flat );
	return new Complex128Array( buf.buffer );
}


// MATRIX DATA (mirrors test/fortran/test_zlanht.f90) //

// d is REAL (Hermitian), e is COMPLEX
var D_N1 = new Float64Array( [ -3.0 ] );
var E_EMPTY = new Complex128Array( 0 );

// N=2: d = [3, -4], e = [(1+2i)]
var D_N2 = new Float64Array( [ 3.0, -4.0 ] );
var E_N2 = buildCArr( [ 1.0, 2.0 ] );

// N=5: d = [2, -4, 6, -1, 3], e = [(1+2i), (-2+3i), (3-1i), (5+4i)]
var D_N5 = new Float64Array( [ 2.0, -4.0, 6.0, -1.0, 3.0 ] );
var E_N5 = buildCArr( [ 1.0, 2.0, -2.0, 3.0, 3.0, -1.0, 5.0, 4.0 ] );

// N=4: d = [10, -20, 30, -40], e = [(5+6i), (7+8i), (9+10i)]
var D_N4 = new Float64Array( [ 10.0, -20.0, 30.0, -40.0 ] );
var E_N4 = buildCArr( [ 5.0, 6.0, 7.0, 8.0, 9.0, 10.0 ] );


// FUNCTIONS //

function runCase( name, norm, N, D, E ) {
	var tc = findCase( name );
	var got = zlanht( norm, N, D, 1, 0, E, 1, 0 );
	assertClose( got, tc.result, 1e-12, 'zlanht: ' + name );
}


// TESTS //

test( 'zlanht: n_zero', function t() {
	runCase( 'n_zero', 'max', 0, new Float64Array( 0 ), E_EMPTY );
});

test( 'zlanht: max_norm_n1', function t() {
	runCase( 'max_norm_n1', 'max', 1, D_N1, E_EMPTY );
});

test( 'zlanht: one_norm_n1', function t() {
	runCase( 'one_norm_n1', 'one-norm', 1, D_N1, E_EMPTY );
});

test( 'zlanht: inf_norm_n1', function t() {
	runCase( 'inf_norm_n1', 'inf-norm', 1, D_N1, E_EMPTY );
});

test( 'zlanht: frob_norm_n1', function t() {
	runCase( 'frob_norm_n1', 'frobenius', 1, D_N1, E_EMPTY );
});

test( 'zlanht: max_norm_n2', function t() {
	runCase( 'max_norm_n2', 'max', 2, D_N2, E_N2 );
});

test( 'zlanht: one_norm_n2', function t() {
	runCase( 'one_norm_n2', 'one-norm', 2, D_N2, E_N2 );
});

test( 'zlanht: inf_norm_n2', function t() {
	runCase( 'inf_norm_n2', 'inf-norm', 2, D_N2, E_N2 );
});

test( 'zlanht: frob_norm_n2', function t() {
	runCase( 'frob_norm_n2', 'frobenius', 2, D_N2, E_N2 );
});

test( 'zlanht: max_norm_5x5', function t() {
	runCase( 'max_norm_5x5', 'max', 5, D_N5, E_N5 );
});

test( 'zlanht: one_norm_O_5x5', function t() {
	runCase( 'one_norm_O_5x5', 'one-norm', 5, D_N5, E_N5 );
});

test( 'zlanht: one_norm_1_5x5', function t() {
	runCase( 'one_norm_1_5x5', 'one-norm', 5, D_N5, E_N5 );
});

test( 'zlanht: inf_norm_5x5', function t() {
	runCase( 'inf_norm_5x5', 'inf-norm', 5, D_N5, E_N5 );
});

test( 'zlanht: frob_norm_5x5', function t() {
	runCase( 'frob_norm_5x5', 'frobenius', 5, D_N5, E_N5 );
});

test( 'zlanht: frob_norm_E_5x5', function t() {
	runCase( 'frob_norm_E_5x5', 'frobenius', 5, D_N5, E_N5 );
});

test( 'zlanht: max_norm_4x4', function t() {
	runCase( 'max_norm_4x4', 'max', 4, D_N4, E_N4 );
});

test( 'zlanht: one_norm_4x4', function t() {
	runCase( 'one_norm_4x4', 'one-norm', 4, D_N4, E_N4 );
});

test( 'zlanht: inf_norm_4x4', function t() {
	runCase( 'inf_norm_4x4', 'inf-norm', 4, D_N4, E_N4 );
});

test( 'zlanht: frob_norm_4x4', function t() {
	runCase( 'frob_norm_4x4', 'frobenius', 4, D_N4, E_N4 );
});
