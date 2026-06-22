/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import { readFileSync } from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import zlanhb from './../lib/ndarray.js';


// FIXTURES //

var fixtureFile = path.join( import.meta.dirname, '..', '..', '..', '..', '..', 'test', 'fixtures', 'zlanhb.jsonl' );
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
* Returns a fixture record by name.
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
* Builds a complex band-storage matrix from (row, col, re, im) tuples (1-indexed).
*
* @private
* @param {NonNegativeInteger} ldab - leading dimension (in complex elements)
* @param {NonNegativeInteger} ncols - number of columns
* @param {Array} cells - flat list of (row, col, re, im) entries
* @returns {Complex128Array} complex storage
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


// MATRIX DATA (mirrors test/fortran/test_zlanhb.f90) //

var LDAB = 4;

// Upper, K=2, N=5 (Hermitian; diagonal is real)
var AB_UPPER_K2 = buildAB( LDAB, 5, [
	3, 1, 1.0, 0.0,
	2, 2, -4.0, 2.0, 3, 2, 5.0, 0.0,
	1, 3, 7.0, -1.0, 2, 3, -8.0, 3.0, 3, 3, 9.0, 0.0,
	1, 4, 6.0, -2.0, 2, 4, -3.0, 1.0, 3, 4, 4.0, 0.0,
	1, 5, 2.0, 4.0, 2, 5, -1.0, 3.0, 3, 5, 3.0, 0.0
]);

// Lower, K=2, N=5
var AB_LOWER_K2 = buildAB( LDAB, 5, [
	1, 1, 2.0, 0.0, 2, 1, -3.0, 1.0, 3, 1, 1.0, -2.0,
	1, 2, 6.0, 0.0, 2, 2, -5.0, -3.0, 3, 2, 7.0, 1.0,
	1, 3, 8.0, 0.0, 2, 3, -2.0, -4.0, 3, 3, -4.0, -1.0,
	1, 4, 3.0, 0.0, 2, 4, 1.0, -2.0,
	1, 5, 5.0, 0.0
]);

// 1x1 K=0 (real diag = 5)
var AB_1X1 = buildAB( LDAB, 1, [ 1, 1, 5.0, 0.0 ] );

// K=0 diagonal-only, N=4
var AB_K0_DIAG = buildAB( LDAB, 4, [
	1, 1, 3.0, 0.0,
	1, 2, -7.0, 0.0,
	1, 3, 2.0, 0.0,
	1, 4, -4.0, 0.0
]);

// K=1, N=4 upper
var AB_UPPER_K1 = buildAB( LDAB, 4, [
	2, 1, 2.0, 0.0,
	1, 2, -3.0, 1.0, 2, 2, 4.0, 0.0,
	1, 3, 1.0, 2.0, 2, 3, -5.0, 0.0,
	1, 4, 6.0, -3.0, 2, 4, 7.0, 0.0
]);

// K=1, N=4 lower
var AB_LOWER_K1 = buildAB( LDAB, 4, [
	1, 1, 2.0, 0.0, 2, 1, -3.0, -1.0,
	1, 2, 4.0, 0.0, 2, 2, 1.0, -2.0,
	1, 3, -5.0, 0.0, 2, 3, 6.0, 3.0,
	1, 4, 7.0, 0.0
]);


// FUNCTIONS //

function runCase( name, norm, uplo, N, K, AB ) {
	var WORK = new Float64Array( Math.max( N, 1 ) );
	var tc = findCase( name );
	var got = zlanhb( norm, uplo, N, K, AB, 1, LDAB, 0, WORK, 1, 0 );
	assertClose( got, tc.result, 1e-12, 'zlanhb: ' + name );
}


// TESTS //

test( 'zlanhb: upper_max', function t() {
	runCase( 'upper_max', 'max', 'upper', 5, 2, AB_UPPER_K2 );
});

test( 'zlanhb: upper_one', function t() {
	runCase( 'upper_one', 'one-norm', 'upper', 5, 2, AB_UPPER_K2 );
});

test( 'zlanhb: upper_inf', function t() {
	runCase( 'upper_inf', 'inf-norm', 'upper', 5, 2, AB_UPPER_K2 );
});

test( 'zlanhb: upper_frob', function t() {
	runCase( 'upper_frob', 'frobenius', 'upper', 5, 2, AB_UPPER_K2 );
});

test( 'zlanhb: lower_max', function t() {
	runCase( 'lower_max', 'max', 'lower', 5, 2, AB_LOWER_K2 );
});

test( 'zlanhb: lower_one', function t() {
	runCase( 'lower_one', 'one-norm', 'lower', 5, 2, AB_LOWER_K2 );
});

test( 'zlanhb: lower_inf', function t() {
	runCase( 'lower_inf', 'inf-norm', 'lower', 5, 2, AB_LOWER_K2 );
});

test( 'zlanhb: lower_frob', function t() {
	runCase( 'lower_frob', 'frobenius', 'lower', 5, 2, AB_LOWER_K2 );
});

test( 'zlanhb: edge_n0', function t() {
	runCase( 'edge_n0', 'max', 'upper', 0, 2, AB_UPPER_K2 );
});

test( 'zlanhb: edge_1x1_max', function t() {
	runCase( 'edge_1x1_max', 'max', 'upper', 1, 0, AB_1X1 );
});

test( 'zlanhb: edge_1x1_one', function t() {
	runCase( 'edge_1x1_one', 'one-norm', 'upper', 1, 0, AB_1X1 );
});

test( 'zlanhb: edge_1x1_inf', function t() {
	runCase( 'edge_1x1_inf', 'inf-norm', 'upper', 1, 0, AB_1X1 );
});

test( 'zlanhb: edge_1x1_frob', function t() {
	runCase( 'edge_1x1_frob', 'frobenius', 'upper', 1, 0, AB_1X1 );
});

test( 'zlanhb: diag_k0_upper_max', function t() {
	runCase( 'diag_k0_upper_max', 'max', 'upper', 4, 0, AB_K0_DIAG );
});

test( 'zlanhb: diag_k0_upper_one', function t() {
	runCase( 'diag_k0_upper_one', 'one-norm', 'upper', 4, 0, AB_K0_DIAG );
});

test( 'zlanhb: diag_k0_upper_inf', function t() {
	runCase( 'diag_k0_upper_inf', 'inf-norm', 'upper', 4, 0, AB_K0_DIAG );
});

test( 'zlanhb: diag_k0_upper_frob', function t() {
	runCase( 'diag_k0_upper_frob', 'frobenius', 'upper', 4, 0, AB_K0_DIAG );
});

test( 'zlanhb: upper_k1_max', function t() {
	runCase( 'upper_k1_max', 'max', 'upper', 4, 1, AB_UPPER_K1 );
});

test( 'zlanhb: upper_k1_one', function t() {
	runCase( 'upper_k1_one', 'one-norm', 'upper', 4, 1, AB_UPPER_K1 );
});

test( 'zlanhb: upper_k1_inf', function t() {
	runCase( 'upper_k1_inf', 'inf-norm', 'upper', 4, 1, AB_UPPER_K1 );
});

test( 'zlanhb: upper_k1_frob', function t() {
	runCase( 'upper_k1_frob', 'frobenius', 'upper', 4, 1, AB_UPPER_K1 );
});

test( 'zlanhb: lower_k1_max', function t() {
	runCase( 'lower_k1_max', 'max', 'lower', 4, 1, AB_LOWER_K1 );
});

test( 'zlanhb: lower_k1_one', function t() {
	runCase( 'lower_k1_one', 'one-norm', 'lower', 4, 1, AB_LOWER_K1 );
});

test( 'zlanhb: lower_k1_inf', function t() {
	runCase( 'lower_k1_inf', 'inf-norm', 'lower', 4, 1, AB_LOWER_K1 );
});

test( 'zlanhb: lower_k1_frob', function t() {
	runCase( 'lower_k1_frob', 'frobenius', 'lower', 4, 1, AB_LOWER_K1 );
});

test( 'zlanhb: invalid norm returns 0 from base', function t() {
	var WORK = new Float64Array( 4 );
	// ndarray.js does not validate norm; falls through to return 0
	var got = zlanhb( 'invalid', 'upper', 4, 1, AB_UPPER_K1, 1, LDAB, 0, WORK, 1, 0 );
	assert.strictEqual( got, 0.0, 'invalid norm returns 0 from base' );
});

test( 'zlanhb: throws TypeError for invalid uplo', function t() {
	var WORK = new Float64Array( 4 );
	assert.throws( function throws() {
		zlanhb( 'max', 'invalid', 4, 1, AB_UPPER_K1, 1, LDAB, 0, WORK, 1, 0 );
	}, TypeError );
});

test( 'zlanhb: throws RangeError for negative N', function t() {
	var WORK = new Float64Array( 4 );
	assert.throws( function throws() {
		zlanhb( 'max', 'upper', -1, 1, AB_UPPER_K1, 1, LDAB, 0, WORK, 1, 0 );
	}, RangeError );
});

test( 'zlanhb: throws RangeError for negative K', function t() {
	var WORK = new Float64Array( 4 );
	assert.throws( function throws() {
		zlanhb( 'max', 'upper', 4, -1, AB_UPPER_K1, 1, LDAB, 0, WORK, 1, 0 );
	}, RangeError );
});
