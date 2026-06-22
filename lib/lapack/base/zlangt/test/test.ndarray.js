/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import { readFileSync } from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import zlangt from './../lib/ndarray.js';


// FIXTURES //

var fixtureFile = path.join( import.meta.dirname, '..', '..', '..', '..', '..', 'test', 'fixtures', 'zlangt.jsonl' );
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
* Builds a Complex128Array from interleaved [re, im, re, im, ...].
*
* @private
* @param {Array<number>} flat - flat array of real/imag pairs
* @returns {Complex128Array} complex array
*/
function buildCArr( flat ) {
	var buf = new Float64Array( flat );
	return new Complex128Array( buf.buffer );
}


// MATRIX DATA (mirrors test/fortran/test_zlangt.f90) //

// 4x4: dl, d, du
var DL_4 = buildCArr( [ 3.0, 2.0, 1.0, 4.0, 2.0, 1.0 ] );
var D_4 = buildCArr( [ 2.0, 1.0, 4.0, 2.0, 5.0, 3.0, 6.0, 1.0 ] );
var DU_4 = buildCArr( [ -1.0, 3.0, -2.0, 1.0, -3.0, 2.0 ] );

// N=1: d(1) = -7+3i
var D_N1 = buildCArr( [ -7.0, 3.0 ] );
var DL_EMPTY = new Complex128Array( 0 );
var DU_EMPTY = new Complex128Array( 0 );

// 5x5
var DL_5 = buildCArr( [ 1.0, 2.0, 2.0, 3.0, 3.0, 1.0, 4.0, 5.0 ] );
var D_5 = buildCArr( [ 10.0, 1.0, 20.0, 2.0, 30.0, 3.0, 40.0, 4.0, 50.0, 5.0 ] );
var DU_5 = buildCArr( [ 5.0, 6.0, 6.0, 7.0, 7.0, 8.0, 8.0, 9.0 ] );

// N=2
var DL_N2 = buildCArr( [ 0.5, 1.0 ] );
var D_N2 = buildCArr( [ 3.0, 2.0, 4.0, 1.0 ] );
var DU_N2 = buildCArr( [ 1.5, 0.5 ] );


// FUNCTIONS //

function runCase( name, norm, N, DL, D, DU ) {
	var tc = findCase( name );
	var got = zlangt( norm, N, DL, 1, 0, D, 1, 0, DU, 1, 0 );
	assertClose( got, tc.result, 1e-12, 'zlangt: ' + name );
}


// TESTS //

test( 'zlangt: max_norm_4x4', function t() {
	runCase( 'max_norm_4x4', 'max', 4, DL_4, D_4, DU_4 );
});

test( 'zlangt: one_norm_4x4', function t() {
	runCase( 'one_norm_4x4', 'one-norm', 4, DL_4, D_4, DU_4 );
});

test( 'zlangt: one_norm_O_4x4', function t() {
	runCase( 'one_norm_O_4x4', 'one-norm', 4, DL_4, D_4, DU_4 );
});

test( 'zlangt: inf_norm_4x4', function t() {
	runCase( 'inf_norm_4x4', 'inf-norm', 4, DL_4, D_4, DU_4 );
});

test( 'zlangt: frob_norm_4x4', function t() {
	runCase( 'frob_norm_4x4', 'frobenius', 4, DL_4, D_4, DU_4 );
});

test( 'zlangt: frob_norm_E_4x4', function t() {
	runCase( 'frob_norm_E_4x4', 'frobenius', 4, DL_4, D_4, DU_4 );
});

test( 'zlangt: max_norm_n1', function t() {
	runCase( 'max_norm_n1', 'max', 1, DL_EMPTY, D_N1, DU_EMPTY );
});

test( 'zlangt: one_norm_n1', function t() {
	runCase( 'one_norm_n1', 'one-norm', 1, DL_EMPTY, D_N1, DU_EMPTY );
});

test( 'zlangt: inf_norm_n1', function t() {
	runCase( 'inf_norm_n1', 'inf-norm', 1, DL_EMPTY, D_N1, DU_EMPTY );
});

test( 'zlangt: frob_norm_n1', function t() {
	runCase( 'frob_norm_n1', 'frobenius', 1, DL_EMPTY, D_N1, DU_EMPTY );
});

test( 'zlangt: n_zero', function t() {
	runCase( 'n_zero', 'max', 0, DL_EMPTY, new Complex128Array( 0 ), DU_EMPTY );
});

test( 'zlangt: max_norm_5x5', function t() {
	runCase( 'max_norm_5x5', 'max', 5, DL_5, D_5, DU_5 );
});

test( 'zlangt: one_norm_5x5', function t() {
	runCase( 'one_norm_5x5', 'one-norm', 5, DL_5, D_5, DU_5 );
});

test( 'zlangt: inf_norm_5x5', function t() {
	runCase( 'inf_norm_5x5', 'inf-norm', 5, DL_5, D_5, DU_5 );
});

test( 'zlangt: frob_norm_5x5', function t() {
	runCase( 'frob_norm_5x5', 'frobenius', 5, DL_5, D_5, DU_5 );
});

test( 'zlangt: max_norm_n2', function t() {
	runCase( 'max_norm_n2', 'max', 2, DL_N2, D_N2, DU_N2 );
});

test( 'zlangt: one_norm_n2', function t() {
	runCase( 'one_norm_n2', 'one-norm', 2, DL_N2, D_N2, DU_N2 );
});

test( 'zlangt: inf_norm_n2', function t() {
	runCase( 'inf_norm_n2', 'inf-norm', 2, DL_N2, D_N2, DU_N2 );
});

test( 'zlangt: frob_norm_n2', function t() {
	runCase( 'frob_norm_n2', 'frobenius', 2, DL_N2, D_N2, DU_N2 );
});
