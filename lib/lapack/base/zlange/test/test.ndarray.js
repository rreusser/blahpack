/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import { readFileSync } from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import zlange from './../lib/ndarray.js';


// FIXTURES //

var fixtureFile = path.join( import.meta.dirname, '..', '..', '..', '..', '..', 'test', 'fixtures', 'zlange.jsonl' );
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
* Builds a complex column-major matrix from (row, col, re, im) tuples (1-indexed).
*
* @private
* @param {NonNegativeInteger} lda - leading dimension (in complex elements)
* @param {NonNegativeInteger} ncols - number of columns
* @param {Array} cells - flat list of (row, col, re, im) entries
* @returns {Complex128Array} packed storage
*/
function buildA( lda, ncols, cells ) {
	var buf = new Float64Array( 2 * lda * ncols );
	var i;
	var idx;
	for ( i = 0; i < cells.length; i += 4 ) {
		idx = ( ( cells[i] - 1 ) + ( ( cells[i+1] - 1 ) * lda ) ) * 2;
		buf[ idx ] = cells[i+2];
		buf[ idx + 1 ] = cells[i+3];
	}
	return new Complex128Array( buf.buffer );
}


// FIXTURES (matrix data) //

var LDA = 4;

// 2x2 complex matrix
var A_2X2 = buildA( LDA, 4, [
	1, 1, 1.0, 2.0, 2, 1, 3.0, 4.0,
	1, 2, 5.0, 6.0, 2, 2, 7.0, 8.0
]);

// 1x1 complex matrix
var A_1X1 = buildA( LDA, 1, [ 1, 1, 3.0, 4.0 ] );


// FUNCTIONS //

/**
* Runs a single norm-check fixture.
*
* @private
* @param {string} name - fixture name
* @param {string} norm - norm type
* @param {NonNegativeInteger} M - rows
* @param {NonNegativeInteger} N - cols
* @param {Complex128Array} A - storage
*/
function runCase( name, norm, M, N, A ) {
	var WORK = new Float64Array( Math.max( M, 1 ) );
	var tc = findCase( name );
	var got = zlange( norm, M, N, A, 1, LDA, 0, WORK, 1, 0 );
	assertClose( got, tc.result, 1e-12, 'zlange: ' + name );
}


// TESTS //

test( 'zlange: zlange_max', function t() {
	runCase( 'zlange_max', 'max', 2, 2, A_2X2 );
});

test( 'zlange: zlange_one', function t() {
	runCase( 'zlange_one', 'one-norm', 2, 2, A_2X2 );
});

test( 'zlange: zlange_inf', function t() {
	runCase( 'zlange_inf', 'inf-norm', 2, 2, A_2X2 );
});

test( 'zlange: zlange_frob', function t() {
	runCase( 'zlange_frob', 'frobenius', 2, 2, A_2X2 );
});

test( 'zlange: zlange_m_zero', function t() {
	runCase( 'zlange_m_zero', 'max', 0, 2, A_2X2 );
});

test( 'zlange: zlange_n_zero', function t() {
	runCase( 'zlange_n_zero', 'max', 2, 0, A_2X2 );
});

test( 'zlange: zlange_1x1', function t() {
	runCase( 'zlange_1x1', 'frobenius', 1, 1, A_1X1 );
});

test( 'zlange: 1x1 max norm', function t() {
	var WORK = new Float64Array( 1 );
	// |3+4i| = 5
	var got = zlange( 'max', 1, 1, A_1X1, 1, LDA, 0, WORK, 1, 0 );
	assertClose( got, 5.0, 1e-12, 'zlange: 1x1 max' );
});

test( 'zlange: 1x1 one-norm', function t() {
	var WORK = new Float64Array( 1 );
	var got = zlange( 'one-norm', 1, 1, A_1X1, 1, LDA, 0, WORK, 1, 0 );
	assertClose( got, 5.0, 1e-12, 'zlange: 1x1 one' );
});

test( 'zlange: 1x1 inf-norm', function t() {
	var WORK = new Float64Array( 1 );
	var got = zlange( 'inf-norm', 1, 1, A_1X1, 1, LDA, 0, WORK, 1, 0 );
	assertClose( got, 5.0, 1e-12, 'zlange: 1x1 inf' );
});

test( 'zlange: throws TypeError for invalid norm', function t() {
	var WORK = new Float64Array( 4 );
	assert.throws( function throws() {
		zlange( 'invalid', 2, 2, A_2X2, 1, LDA, 0, WORK, 1, 0 );
	}, TypeError );
});

test( 'zlange: throws RangeError for negative M', function t() {
	var WORK = new Float64Array( 4 );
	assert.throws( function throws() {
		zlange( 'max', -1, 2, A_2X2, 1, LDA, 0, WORK, 1, 0 );
	}, RangeError );
});

test( 'zlange: throws RangeError for negative N', function t() {
	var WORK = new Float64Array( 4 );
	assert.throws( function throws() {
		zlange( 'max', 2, -1, A_2X2, 1, LDA, 0, WORK, 1, 0 );
	}, RangeError );
});
