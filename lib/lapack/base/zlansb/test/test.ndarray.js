/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import { readFileSync } from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import zlansb from './../lib/ndarray.js';


// FIXTURES //

var fixtureFile = path.join( import.meta.dirname, '..', '..', '..', '..', '..', 'test', 'fixtures', 'zlansb.jsonl' );
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
* Builds a complex band-storage Complex128Array from cell entries.
*
* @private
* @param {NonNegativeInteger} ldab - leading dimension
* @param {NonNegativeInteger} ncols - number of columns
* @param {Array} cells - flat list of (row, col, re, im) quadruples (1-indexed)
* @returns {Complex128Array} packed storage
*/
function buildAB( ldab, ncols, cells ) {
	var buf = new Float64Array( 2 * ldab * ncols );
	var i;
	var idx;
	for ( i = 0; i < cells.length; i += 4 ) {
		idx = ( ( cells[i] - 1 ) + ( ( cells[i+1] - 1 ) * ldab ) ) * 2;
		buf[ idx ] = cells[i+2];
		buf[ idx + 1 ] = cells[i+3];
	}
	return new Complex128Array( buf.buffer );
}


// MATRIX DATA (mirrors test/fortran/test_zlansb.f90) //

var LDAB = 4;

// Upper, K=2, N=5
var AB_UPPER_K2 = buildAB( LDAB, 5, [
	3, 1, 1.0, 2.0,
	2, 2, -4.0, 2.0, 3, 2, 5.0, -3.0,
	1, 3, 7.0, -1.0, 2, 3, -8.0, 3.0, 3, 3, 9.0, 1.0,
	1, 4, 6.0, -2.0, 2, 4, -3.0, 1.0, 3, 4, 4.0, -2.0,
	1, 5, 2.0, 4.0, 2, 5, -1.0, 3.0, 3, 5, 3.0, 1.0
] );

// Lower, K=2, N=5
var AB_LOWER_K2 = buildAB( LDAB, 5, [
	1, 1, 2.0, 1.0, 2, 1, -3.0, 1.0, 3, 1, 1.0, -2.0,
	1, 2, 6.0, -1.0, 2, 2, -5.0, 3.0, 3, 2, 7.0, -1.0,
	1, 3, 8.0, 2.0, 2, 3, -2.0, 4.0, 3, 3, -4.0, 1.0,
	1, 4, 3.0, -1.0, 2, 4, 1.0, 2.0,
	1, 5, 5.0, 3.0
] );

// 1x1 K=0: (5, -3)
var AB_1X1 = buildAB( LDAB, 1, [ 1, 1, 5.0, -3.0 ] );

// K=0 diagonal, N=4
var AB_K0_DIAG = buildAB( LDAB, 4, [
	1, 1, 3.0, 4.0,
	1, 2, -7.0, 1.0,
	1, 3, 2.0, -3.0,
	1, 4, -4.0, 2.0
] );

// K=1, N=4 upper
var AB_UPPER_K1 = buildAB( LDAB, 4, [
	2, 1, 2.0, 1.0,
	1, 2, -3.0, 1.0, 2, 2, 4.0, -2.0,
	1, 3, 1.0, 2.0, 2, 3, -5.0, 1.0,
	1, 4, 6.0, -3.0, 2, 4, 7.0, 2.0
] );

// K=1, N=4 lower
var AB_LOWER_K1 = buildAB( LDAB, 4, [
	1, 1, 2.0, 1.0, 2, 1, -3.0, 1.0,
	1, 2, 4.0, -2.0, 2, 2, 1.0, 2.0,
	1, 3, -5.0, 1.0, 2, 3, 6.0, -3.0,
	1, 4, 7.0, 2.0
] );


// FUNCTIONS //

function runCase( name, norm, uplo, N, K, AB ) {
	var WORK = new Float64Array( Math.max( N, 1 ) );
	var tc = findCase( name );
	var got = zlansb( norm, uplo, N, K, AB, 1, LDAB, 0, WORK, 1, 0 );
	assertClose( got, tc.result, 1e-12, 'zlansb: ' + name );
}


// TESTS //

test( 'zlansb: upper_max', function t() {
	runCase( 'upper_max', 'max', 'upper', 5, 2, AB_UPPER_K2 );
});

test( 'zlansb: upper_one', function t() {
	runCase( 'upper_one', 'one-norm', 'upper', 5, 2, AB_UPPER_K2 );
});

test( 'zlansb: upper_inf', function t() {
	runCase( 'upper_inf', 'inf-norm', 'upper', 5, 2, AB_UPPER_K2 );
});

test( 'zlansb: upper_frob', function t() {
	runCase( 'upper_frob', 'frobenius', 'upper', 5, 2, AB_UPPER_K2 );
});

test( 'zlansb: lower_max', function t() {
	runCase( 'lower_max', 'max', 'lower', 5, 2, AB_LOWER_K2 );
});

test( 'zlansb: lower_one', function t() {
	runCase( 'lower_one', 'one-norm', 'lower', 5, 2, AB_LOWER_K2 );
});

test( 'zlansb: lower_inf', function t() {
	runCase( 'lower_inf', 'inf-norm', 'lower', 5, 2, AB_LOWER_K2 );
});

test( 'zlansb: lower_frob', function t() {
	runCase( 'lower_frob', 'frobenius', 'lower', 5, 2, AB_LOWER_K2 );
});

test( 'zlansb: edge_n0', function t() {
	runCase( 'edge_n0', 'max', 'upper', 0, 2, AB_UPPER_K2 );
});

test( 'zlansb: edge_1x1_max', function t() {
	runCase( 'edge_1x1_max', 'max', 'upper', 1, 0, AB_1X1 );
});

test( 'zlansb: edge_1x1_one', function t() {
	runCase( 'edge_1x1_one', 'one-norm', 'upper', 1, 0, AB_1X1 );
});

test( 'zlansb: edge_1x1_inf', function t() {
	runCase( 'edge_1x1_inf', 'inf-norm', 'upper', 1, 0, AB_1X1 );
});

test( 'zlansb: edge_1x1_frob', function t() {
	runCase( 'edge_1x1_frob', 'frobenius', 'upper', 1, 0, AB_1X1 );
});

test( 'zlansb: diag_k0_upper_max', function t() {
	runCase( 'diag_k0_upper_max', 'max', 'upper', 4, 0, AB_K0_DIAG );
});

test( 'zlansb: diag_k0_upper_one', function t() {
	runCase( 'diag_k0_upper_one', 'one-norm', 'upper', 4, 0, AB_K0_DIAG );
});

test( 'zlansb: diag_k0_upper_inf', function t() {
	runCase( 'diag_k0_upper_inf', 'inf-norm', 'upper', 4, 0, AB_K0_DIAG );
});

test( 'zlansb: diag_k0_upper_frob', function t() {
	runCase( 'diag_k0_upper_frob', 'frobenius', 'upper', 4, 0, AB_K0_DIAG );
});

test( 'zlansb: upper_k1_max', function t() {
	runCase( 'upper_k1_max', 'max', 'upper', 4, 1, AB_UPPER_K1 );
});

test( 'zlansb: upper_k1_one', function t() {
	runCase( 'upper_k1_one', 'one-norm', 'upper', 4, 1, AB_UPPER_K1 );
});

test( 'zlansb: upper_k1_inf', function t() {
	runCase( 'upper_k1_inf', 'inf-norm', 'upper', 4, 1, AB_UPPER_K1 );
});

test( 'zlansb: upper_k1_frob', function t() {
	runCase( 'upper_k1_frob', 'frobenius', 'upper', 4, 1, AB_UPPER_K1 );
});

test( 'zlansb: lower_k1_max', function t() {
	runCase( 'lower_k1_max', 'max', 'lower', 4, 1, AB_LOWER_K1 );
});

test( 'zlansb: lower_k1_one', function t() {
	runCase( 'lower_k1_one', 'one-norm', 'lower', 4, 1, AB_LOWER_K1 );
});

test( 'zlansb: lower_k1_inf', function t() {
	runCase( 'lower_k1_inf', 'inf-norm', 'lower', 4, 1, AB_LOWER_K1 );
});

test( 'zlansb: lower_k1_frob', function t() {
	runCase( 'lower_k1_frob', 'frobenius', 'lower', 4, 1, AB_LOWER_K1 );
});
