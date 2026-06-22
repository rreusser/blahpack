/* eslint-disable no-restricted-syntax, stdlib/first-unit-test, camelcase, no-mixed-operators, max-len */

// MODULES //

import path from 'node:path';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import assert from 'node:assert/strict';
import format from '@stdlib/string/format/lib/index.js';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dlarfb_gett from './../lib/ndarray.js';


// FIXTURES //

var fixtureDir = path.join( import.meta.dirname, '..', '..', '..', '..', '..', 'test', 'fixtures' );
var lines = readFileSync( path.join( fixtureDir, 'dlarfb_gett.jsonl' ), 'utf8' ).trim().split( '\n' ); // eslint-disable-line node/no-sync
var fixture = lines.map( parseLine );


// FUNCTIONS //

/**
* Parses a JSON line from the fixture file.
*
* @private
* @param {string} line - JSON line
* @returns {Object} parsed object
*/
function parseLine( line ) {
	return JSON.parse( line );
}

/**
* Finds a fixture test case by name.
*
* @private
* @param {string} name - test case name
* @throws {Error} if the case is not found
* @returns {Object} fixture object
*/
function findCase( name ) {
	var i;
	for ( i = 0; i < fixture.length; i++ ) {
		if ( fixture[ i ].name === name ) {
			return fixture[ i ];
		}
	}
	throw new Error( format( 'case not found: %s', name ) );
}

/**
* Asserts that two arrays are approximately equal.
*
* @private
* @param {Float64Array} actual - actual values
* @param {Array} expected - expected values
* @param {number} tol - absolute tolerance
* @param {string} msg - message
*/
function assertArrayClose( actual, expected, tol, msg ) {
	var i;
	assert.equal( actual.length, expected.length, format( '%s: length mismatch', msg ) );
	for ( i = 0; i < expected.length; i++ ) {
		assert.ok(Math.abs( actual[ i ] - expected[ i ] ) <= tol, format( '%s[%d]: expected %f, got %f', msg, i, expected[ i ], actual[ i ] ));
	}
}

/**
* Packs a leading `rows`-by-`cols` column-major block from a padded matrix.
*
* @private
* @param {Float64Array} M - source matrix
* @param {number} rows - number of rows
* @param {number} cols - number of columns
* @param {number} ld - leading dimension
* @returns {Array} packed values in column-major order
*/
function pack( M, rows, cols, ld ) {
	var out;
	var i;
	var j;
	out = [];
	for ( j = 0; j < cols; j++ ) {
		for ( i = 0; i < rows; i++ ) {
			out.push( M[ ( j * ld ) + i ] );
		}
	}
	return out;
}

/**
* Builds the K=2 / N=4 inputs.
*
* @private
* @param {boolean} storeV1 - whether to place V1 content
* @returns {Object} inputs
*/
function buildCase1( storeV1 ) {
	var LDA = 8;
	var LDB = 8;
	var LDT = 6;
	var LDW = 6;
	var A = new Float64Array( LDA * 4 );
	var B = new Float64Array( LDB * 4 );
	var T = new Float64Array( LDT * 2 );
	var W = new Float64Array( LDW * 4 );

	A[ 0 ] = 1.5;
	A[ ( 1 * LDA ) + 0 ] = 2.0;
	A[ ( 2 * LDA ) + 0 ] = 3.0;
	A[ ( 3 * LDA ) + 0 ] = 4.0;
	A[ ( 1 * LDA ) + 1 ] = 2.5;
	A[ ( 2 * LDA ) + 1 ] = 3.5;
	A[ ( 3 * LDA ) + 1 ] = 4.5;
	if ( storeV1 ) {
		A[ 1 ] = 0.5;
	}

	B[ 0 ] = 0.1;
	B[ 1 ] = 0.3;
	B[ 2 ] = 0.5;
	B[ ( 1 * LDB ) + 0 ] = 0.2;
	B[ ( 1 * LDB ) + 1 ] = 0.4;
	B[ ( 1 * LDB ) + 2 ] = 0.6;
	B[ ( 2 * LDB ) + 0 ] = 1.1;
	B[ ( 2 * LDB ) + 1 ] = 2.1;
	B[ ( 2 * LDB ) + 2 ] = 3.1;
	B[ ( 3 * LDB ) + 0 ] = 1.2;
	B[ ( 3 * LDB ) + 1 ] = 2.2;
	B[ ( 3 * LDB ) + 2 ] = 3.2;

	T[ 0 ] = 1.2;
	T[ ( 1 * LDT ) + 0 ] = -0.3;
	T[ ( 1 * LDT ) + 1 ] = 0.9;

	return {
		'A': A,
		'B': B,
		'T': T,
		'W': W,
		'LDA': LDA,
		'LDB': LDB,
		'LDT': LDT,
		'LDW': LDW
	};
}

/**
* Builds the K=3 / N=3 inputs.
*
* @private
* @param {boolean} storeV1 - whether to place V1 content
* @returns {Object} inputs
*/
function buildCase3( storeV1 ) {
	var LDA = 8;
	var LDB = 8;
	var LDT = 6;
	var LDW = 6;
	var A = new Float64Array( LDA * 3 );
	var B = new Float64Array( LDB * 3 );
	var T = new Float64Array( LDT * 3 );
	var W = new Float64Array( LDW * 3 );

	A[ 0 ] = 2.0;
	A[ ( 1 * LDA ) + 0 ] = 1.0;
	A[ ( 2 * LDA ) + 0 ] = 0.5;
	A[ ( 1 * LDA ) + 1 ] = 1.5;
	A[ ( 2 * LDA ) + 1 ] = 0.7;
	A[ ( 2 * LDA ) + 2 ] = 2.5;
	if ( storeV1 ) {
		A[ 1 ] = 0.3;
		A[ 2 ] = 0.2;
		A[ ( 1 * LDA ) + 2 ] = 0.1;
	}

	B[ 0 ] = 0.1;
	B[ 1 ] = 0.4;
	B[ 2 ] = 0.7;
	B[ 3 ] = 1.0;
	B[ ( 1 * LDB ) + 0 ] = 0.2;
	B[ ( 1 * LDB ) + 1 ] = 0.5;
	B[ ( 1 * LDB ) + 2 ] = 0.8;
	B[ ( 1 * LDB ) + 3 ] = 1.1;
	B[ ( 2 * LDB ) + 0 ] = 0.3;
	B[ ( 2 * LDB ) + 1 ] = 0.6;
	B[ ( 2 * LDB ) + 2 ] = 0.9;
	B[ ( 2 * LDB ) + 3 ] = 1.2;

	T[ 0 ] = 1.1;
	T[ ( 1 * LDT ) + 0 ] = -0.2;
	T[ ( 2 * LDT ) + 0 ] = 0.1;
	T[ ( 1 * LDT ) + 1 ] = 0.8;
	T[ ( 2 * LDT ) + 1 ] = -0.3;
	T[ ( 2 * LDT ) + 2 ] = 1.3;

	return {
		'A': A,
		'B': B,
		'T': T,
		'W': W,
		'LDA': LDA,
		'LDB': LDB,
		'LDT': LDT,
		'LDW': LDW
	};
}

/**
* Builds the K=1 / M=2 / N=3 inputs.
*
* @private
* @returns {Object} inputs
*/
function buildCaseK1() {
	var LDA = 8;
	var LDB = 8;
	var LDT = 6;
	var LDW = 6;
	var A = new Float64Array( LDA * 3 );
	var B = new Float64Array( LDB * 3 );
	var T = new Float64Array( LDT * 1 );
	var W = new Float64Array( LDW * 3 );

	A[ 0 ] = 2.0;
	A[ ( 1 * LDA ) + 0 ] = 1.0;
	A[ ( 2 * LDA ) + 0 ] = 0.5;

	B[ 0 ] = 0.25;
	B[ 1 ] = 0.5;
	B[ ( 1 * LDB ) + 0 ] = 1.0;
	B[ ( 1 * LDB ) + 1 ] = 3.0;
	B[ ( 2 * LDB ) + 0 ] = 2.0;
	B[ ( 2 * LDB ) + 1 ] = 4.0;

	T[ 0 ] = 1.4;

	return {
		'A': A,
		'B': B,
		'T': T,
		'W': W,
		'LDA': LDA,
		'LDB': LDB,
		'LDT': LDT,
		'LDW': LDW
	};
}


// TESTS //

test( 'dlarfb_gett: basic_notident_k2_m3_n4', function t() {
	var inp = buildCase1( true );
	var tc = findCase( 'basic_notident_k2_m3_n4' );
	dlarfb_gett( 'not-identity', 3, 4, 2, inp.T, 1, inp.LDT, 0, inp.A, 1, inp.LDA, 0, inp.B, 1, inp.LDB, 0, inp.W, 1, inp.LDW, 0 );
	assertArrayClose( pack( inp.A, 2, 4, inp.LDA ), tc.A, 1e-12, 'A' );
	assertArrayClose( pack( inp.B, 3, 4, inp.LDB ), tc.B, 1e-12, 'B' );
});

test( 'dlarfb_gett: basic_ident_k2_m3_n4', function t() {
	var inp = buildCase1( false );
	var tc = findCase( 'basic_ident_k2_m3_n4' );
	dlarfb_gett( 'identity', 3, 4, 2, inp.T, 1, inp.LDT, 0, inp.A, 1, inp.LDA, 0, inp.B, 1, inp.LDB, 0, inp.W, 1, inp.LDW, 0 );
	assertArrayClose( pack( inp.A, 2, 4, inp.LDA ), tc.A, 1e-12, 'A' );
	assertArrayClose( pack( inp.B, 3, 4, inp.LDB ), tc.B, 1e-12, 'B' );
});

test( 'dlarfb_gett: n_eq_k_notident_k3_m4', function t() {
	var inp = buildCase3( true );
	var tc = findCase( 'n_eq_k_notident_k3_m4' );
	dlarfb_gett( 'not-identity', 4, 3, 3, inp.T, 1, inp.LDT, 0, inp.A, 1, inp.LDA, 0, inp.B, 1, inp.LDB, 0, inp.W, 1, inp.LDW, 0 );
	assertArrayClose( pack( inp.A, 3, 3, inp.LDA ), tc.A, 1e-12, 'A' );
	assertArrayClose( pack( inp.B, 4, 3, inp.LDB ), tc.B, 1e-12, 'B' );
});

test( 'dlarfb_gett: n_eq_k_ident_k3_m4', function t() {
	var inp = buildCase3( false );
	var tc = findCase( 'n_eq_k_ident_k3_m4' );
	dlarfb_gett( 'identity', 4, 3, 3, inp.T, 1, inp.LDT, 0, inp.A, 1, inp.LDA, 0, inp.B, 1, inp.LDB, 0, inp.W, 1, inp.LDW, 0 );
	assertArrayClose( pack( inp.A, 3, 3, inp.LDA ), tc.A, 1e-12, 'A' );
	assertArrayClose( pack( inp.B, 4, 3, inp.LDB ), tc.B, 1e-12, 'B' );
});

test( 'dlarfb_gett: m_zero_notident', function t() {
	var inp = buildCase1( true );
	var tc = findCase( 'm_zero_notident' );
	var B = new Float64Array( inp.LDB * 4 );
	dlarfb_gett( 'not-identity', 0, 4, 2, inp.T, 1, inp.LDT, 0, inp.A, 1, inp.LDA, 0, B, 1, inp.LDB, 0, inp.W, 1, inp.LDW, 0 );
	assertArrayClose( pack( inp.A, 2, 4, inp.LDA ), tc.A, 1e-12, 'A' );
});

test( 'dlarfb_gett: k1_notident_m2_n3', function t() {
	var inp = buildCaseK1();
	var tc = findCase( 'k1_notident_m2_n3' );
	dlarfb_gett( 'not-identity', 2, 3, 1, inp.T, 1, inp.LDT, 0, inp.A, 1, inp.LDA, 0, inp.B, 1, inp.LDB, 0, inp.W, 1, inp.LDW, 0 );
	assertArrayClose( pack( inp.A, 1, 3, inp.LDA ), tc.A, 1e-12, 'A' );
	assertArrayClose( pack( inp.B, 2, 3, inp.LDB ), tc.B, 1e-12, 'B' );
});

test( 'dlarfb_gett: k1_ident_m2_n3', function t() {
	var inp = buildCaseK1();
	var tc = findCase( 'k1_ident_m2_n3' );
	dlarfb_gett( 'identity', 2, 3, 1, inp.T, 1, inp.LDT, 0, inp.A, 1, inp.LDA, 0, inp.B, 1, inp.LDB, 0, inp.W, 1, inp.LDW, 0 );
	assertArrayClose( pack( inp.A, 1, 3, inp.LDA ), tc.A, 1e-12, 'A' );
	assertArrayClose( pack( inp.B, 2, 3, inp.LDB ), tc.B, 1e-12, 'B' );
});

test( 'dlarfb_gett: quick return M=0/N=0/K=0/K>N', function t() {
	var snap;
	var inp;

	inp = buildCase1( true );
	snap = new Float64Array( inp.A );
	dlarfb_gett( 'not-identity', 3, 4, 0, inp.T, 1, inp.LDT, 0, inp.A, 1, inp.LDA, 0, inp.B, 1, inp.LDB, 0, inp.W, 1, inp.LDW, 0 );
	assertArrayClose( inp.A, snap, 0.0, 'A (K=0 quick return)' );
	dlarfb_gett( 'not-identity', 3, 0, 2, inp.T, 1, inp.LDT, 0, inp.A, 1, inp.LDA, 0, inp.B, 1, inp.LDB, 0, inp.W, 1, inp.LDW, 0 );
	assertArrayClose( inp.A, snap, 0.0, 'A (N=0 quick return)' );
	dlarfb_gett( 'not-identity', 3, 2, 5, inp.T, 1, inp.LDT, 0, inp.A, 1, inp.LDA, 0, inp.B, 1, inp.LDB, 0, inp.W, 1, inp.LDW, 0 );
	assertArrayClose( inp.A, snap, 0.0, 'A (K>N quick return)' );
});
