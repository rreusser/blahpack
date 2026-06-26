/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import { readFileSync } from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import zlansy from './../lib/ndarray.js';


// FIXTURES //

var fixtureFile = path.join( import.meta.dirname, '..', '..', '..', '..', '..', 'test', 'fixtures', 'zlansy.jsonl' );
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
* Builds a complex matrix in column-major storage from (row, col, re, im) tuples (1-indexed).
*
* @private
* @param {NonNegativeInteger} lda - leading dimension (in complex elements)
* @param {NonNegativeInteger} ncols - number of columns
* @param {Array} cells - flat list of (row, col, re, im) entries
* @returns {Complex128Array} complex storage
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

var NMAX = 4;

// 4x4 complex symmetric, upper-stored
var A_UPPER = buildA( NMAX, NMAX, [
	1, 1, 2.0, 1.0,
	1, 2, 1.0, 2.0, 2, 2, 5.0, -1.0,
	1, 3, 3.0, -1.0, 2, 3, 2.0, 1.0, 3, 3, 4.0, 2.0,
	1, 4, 0.5, 0.5, 2, 4, 1.0, -2.0, 3, 4, 3.0, 0.0, 4, 4, 6.0, -3.0
]);

// 4x4 complex symmetric, lower-stored
var A_LOWER = buildA( NMAX, NMAX, [
	1, 1, 2.0, 1.0,
	2, 1, 1.0, 2.0, 2, 2, 5.0, -1.0,
	3, 1, 3.0, -1.0, 3, 2, 2.0, 1.0, 3, 3, 4.0, 2.0,
	4, 1, 0.5, 0.5, 4, 2, 1.0, -2.0, 4, 3, 3.0, 0.0, 4, 4, 6.0, -3.0
]);


// TESTS //

test( 'zlansy: max_upper', function t() {
	var WORK = new Float64Array( 4 );
	var tc = findCase( 'max_upper' );
	var got = zlansy( 'max', 'upper', 4, A_UPPER, 1, NMAX, 0, WORK, 1, 0 );
	assertClose( got, tc.val, 1e-12, 'zlansy: max_upper' );
});

test( 'zlansy: one_upper', function t() {
	var WORK = new Float64Array( 4 );
	var tc = findCase( 'one_upper' );
	var got = zlansy( 'one-norm', 'upper', 4, A_UPPER, 1, NMAX, 0, WORK, 1, 0 );
	assertClose( got, tc.val, 1e-12, 'zlansy: one_upper' );
});

test( 'zlansy: inf_upper', function t() {
	var WORK = new Float64Array( 4 );
	var tc = findCase( 'inf_upper' );
	var got = zlansy( 'inf-norm', 'upper', 4, A_UPPER, 1, NMAX, 0, WORK, 1, 0 );
	assertClose( got, tc.val, 1e-12, 'zlansy: inf_upper' );
});

test( 'zlansy: fro_upper', function t() {
	var WORK = new Float64Array( 4 );
	var tc = findCase( 'fro_upper' );
	var got = zlansy( 'frobenius', 'upper', 4, A_UPPER, 1, NMAX, 0, WORK, 1, 0 );
	assertClose( got, tc.val, 1e-12, 'zlansy: fro_upper' );
});

test( 'zlansy: one_lower', function t() {
	var WORK = new Float64Array( 4 );
	var tc = findCase( 'one_lower' );
	var got = zlansy( 'one-norm', 'lower', 4, A_LOWER, 1, NMAX, 0, WORK, 1, 0 );
	assertClose( got, tc.val, 1e-12, 'zlansy: one_lower' );
});

test( 'zlansy: fro_lower', function t() {
	var WORK = new Float64Array( 4 );
	var tc = findCase( 'fro_lower' );
	var got = zlansy( 'frobenius', 'lower', 4, A_LOWER, 1, NMAX, 0, WORK, 1, 0 );
	assertClose( got, tc.val, 1e-12, 'zlansy: fro_lower' );
});

test( 'zlansy: n0', function t() {
	var WORK = new Float64Array( 4 );
	var tc = findCase( 'n0' );
	var got = zlansy( 'max', 'upper', 0, A_UPPER, 1, NMAX, 0, WORK, 1, 0 );
	assertClose( got, tc.val, 1e-12, 'zlansy: n0' );
});

test( 'zlansy: max_lower (computed)', function t() {
	var WORK = new Float64Array( 4 );

	// Same matrix data as upper - should yield same max value
	var got = zlansy( 'max', 'lower', 4, A_LOWER, 1, NMAX, 0, WORK, 1, 0 );
	var tc = findCase( 'max_upper' );
	assertClose( got, tc.val, 1e-12, 'zlansy: max_lower' );
});

test( 'zlansy: inf_lower (computed)', function t() {
	var WORK = new Float64Array( 4 );
	var got = zlansy( 'inf-norm', 'lower', 4, A_LOWER, 1, NMAX, 0, WORK, 1, 0 );
	var tc = findCase( 'inf_upper' );
	assertClose( got, tc.val, 1e-12, 'zlansy: inf_lower' );
});

test( 'zlansy: invalid norm returns 0 from base', function t() {
	var WORK = new Float64Array( 4 );

	// ndarray.js does not validate norm; base.js falls through to return 0
	var got = zlansy( 'invalid', 'upper', 4, A_UPPER, 1, NMAX, 0, WORK, 1, 0 );
	assert.strictEqual( got, 0.0, 'invalid norm returns 0 from base' );
});

test( 'zlansy: throws TypeError for invalid uplo', function t() {
	var WORK = new Float64Array( 4 );
	assert.throws( function throws() {
		zlansy( 'max', 'invalid', 4, A_UPPER, 1, NMAX, 0, WORK, 1, 0 );
	}, TypeError );
});

test( 'zlansy: throws RangeError for negative N', function t() {
	var WORK = new Float64Array( 4 );
	assert.throws( function throws() {
		zlansy( 'max', 'upper', -1, A_UPPER, 1, NMAX, 0, WORK, 1, 0 );
	}, RangeError );
});
