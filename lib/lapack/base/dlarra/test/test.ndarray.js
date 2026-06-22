/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import { readFileSync } from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import dlarra from './../lib/ndarray.js';


// FIXTURES //

var fixtureFile = path.join( import.meta.dirname, '..', '..', '..', '..', '..', 'test', 'fixtures', 'dlarra.jsonl' );
var rawLines = readFileSync( fixtureFile, 'utf8' ).trim().split( '\n' );
var FIXTURES = rawLines.map( function parse( line ) {
	return JSON.parse( line );
});


// FUNCTIONS //

/**
* Returns the fixture record by name.
*
* @private
* @param {string} name - case name
* @throws {Error} fixture not found
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
* Asserts that two numbers are close within a tolerance.
*
* @private
* @param {number} actual - actual value
* @param {number} expected - expected value
* @param {number} tol - tolerance
* @param {string} msg - assertion message
*/
function assertClose( actual, expected, tol, msg ) {
	var relErr = Math.abs( actual - expected ) / Math.max( Math.abs( expected ), 1.0 ); // eslint-disable-line max-len
	assert.ok( relErr <= tol, format( '%s: expected %s, got %s (rel err %s)', msg, expected, actual, relErr ) );
}

/**
* Checks that ISPLIT matches the expected split indices.
*
* @private
* @param {Int32Array} ISPLIT - actual split indices
* @param {Array} expected - expected split indices
* @param {NonNegativeInteger} n - number of splits to check
* @returns {boolean} true if all match
*/
function isplitMatches( ISPLIT, expected, n ) {
	var i;
	if ( ISPLIT.length < n ) {
		return false;
	}
	for ( i = 0; i < n; i++ ) {
		if ( ISPLIT[ i ] !== expected[ i ] ) {
			return false;
		}
	}
	return true;
}

/**
* Checks each element of e and e2 against expected values.
*
* @private
* @param {Float64Array} e - actual sub-diagonal
* @param {Float64Array} e2 - actual sub-diagonal squares
* @param {Array} expectedE - expected sub-diagonal values
* @param {Array} expectedE2 - expected sub-diagonal squares
* @param {NonNegativeInteger} n - number of entries to check
*/
function checkArrays( e, e2, expectedE, expectedE2, n ) {
	var i;
	for ( i = 0; i < n; i++ ) {
		assertClose( e[ i ], expectedE[ i ], 1e-12, 'e[' + i + ']' );
		assertClose( e2[ i ], expectedE2[ i ], 1e-12, 'e2[' + i + ']' );
	}
}


// TESTS //

test( 'main export is a function', function t() {
	assert.strictEqual( typeof dlarra, 'function', 'main export is a function' );
});

test( 'dlarra: throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		dlarra( -1, new Float64Array( 0 ), 1, 0, new Float64Array( 0 ), 1, 0, new Float64Array( 0 ), 1, 0, 1.0, 1.0, new Int32Array( 1 ), new Int32Array( 0 ), 1, 0 );
	}, RangeError );
});

test( 'dlarra: n_zero (quick return)', function t() {
	var nsplit;
	var ISPLIT;
	var info;
	var tc;
	tc = findCase( 'n_zero' );
	nsplit = new Int32Array( 1 );
	nsplit[ 0 ] = -1;
	ISPLIT = new Int32Array( 5 );
	info = dlarra( 0, new Float64Array( 0 ), 1, 0, new Float64Array( 0 ), 1, 0, new Float64Array( 0 ), 1, 0, 1.0, 1.0, nsplit, ISPLIT, 1, 0 );
	assert.strictEqual( info, tc.info );
	assert.strictEqual( nsplit[ 0 ], tc.nsplit );
});

test( 'dlarra: n_one', function t() {
	var nsplit;
	var ISPLIT;
	var info;
	var e2;
	var tc;
	var d;
	var e;
	tc = findCase( 'n_one' );
	d = new Float64Array( [ 5.0 ] );
	e = new Float64Array( [ 0.0 ] );
	e2 = new Float64Array( [ 0.0 ] );
	nsplit = new Int32Array( 1 );
	ISPLIT = new Int32Array( 5 );
	info = dlarra( 1, d, 1, 0, e, 1, 0, e2, 1, 0, 1.0, 5.0, nsplit, ISPLIT, 1, 0 );
	assert.strictEqual( info, tc.info );
	assert.strictEqual( nsplit[ 0 ], tc.nsplit );
	assert.ok( isplitMatches( ISPLIT, tc.isplit, tc.nsplit ), 'isplit matches' );
});

test( 'dlarra: spltol_neg_no_split', function t() {
	var nsplit;
	var ISPLIT;
	var info;
	var e2;
	var tc;
	var d;
	var e;
	tc = findCase( 'spltol_neg_no_split' );
	d = new Float64Array( [ 4.0, 3.0, 2.0, 5.0 ] );
	e = new Float64Array( [ 1.0, 1.0, 1.0 ] );
	e2 = new Float64Array( [ 1.0, 1.0, 1.0 ] );
	nsplit = new Int32Array( 1 );
	ISPLIT = new Int32Array( 5 );
	info = dlarra( 4, d, 1, 0, e, 1, 0, e2, 1, 0, -0.1, 5.0, nsplit, ISPLIT, 1, 0 );
	assert.strictEqual( info, tc.info );
	assert.strictEqual( nsplit[ 0 ], tc.nsplit );
	assert.ok( isplitMatches( ISPLIT, tc.isplit, tc.nsplit ), 'isplit matches' );
	checkArrays( e, e2, tc.e, tc.e2, 3 );
});

test( 'dlarra: spltol_neg_with_splits', function t() {
	var nsplit;
	var ISPLIT;
	var info;
	var e2;
	var tc;
	var d;
	var e;
	tc = findCase( 'spltol_neg_with_splits' );
	d = new Float64Array( [ 4.0, 3.0, 2.0, 5.0 ] );
	e = new Float64Array( [ 0.01, 1.0, 0.02 ] );
	e2 = new Float64Array( [ 0.0001, 1.0, 0.0004 ] );
	nsplit = new Int32Array( 1 );
	ISPLIT = new Int32Array( 5 );
	info = dlarra( 4, d, 1, 0, e, 1, 0, e2, 1, 0, -0.1, 5.0, nsplit, ISPLIT, 1, 0 );
	assert.strictEqual( info, tc.info );
	assert.strictEqual( nsplit[ 0 ], tc.nsplit );
	assert.ok( isplitMatches( ISPLIT, tc.isplit, tc.nsplit ), 'isplit matches' );
	checkArrays( e, e2, tc.e, tc.e2, 3 );
});

test( 'dlarra: spltol_pos_no_split', function t() {
	var nsplit;
	var ISPLIT;
	var info;
	var e2;
	var tc;
	var d;
	var e;
	tc = findCase( 'spltol_pos_no_split' );
	d = new Float64Array( [ 4.0, 3.0, 2.0, 5.0 ] );
	e = new Float64Array( [ 2.0, 1.5, 2.5 ] );
	e2 = new Float64Array( [ 4.0, 2.25, 6.25 ] );
	nsplit = new Int32Array( 1 );
	ISPLIT = new Int32Array( 5 );
	info = dlarra( 4, d, 1, 0, e, 1, 0, e2, 1, 0, 0.01, 5.0, nsplit, ISPLIT, 1, 0 );
	assert.strictEqual( info, tc.info );
	assert.strictEqual( nsplit[ 0 ], tc.nsplit );
	assert.ok( isplitMatches( ISPLIT, tc.isplit, tc.nsplit ), 'isplit matches' );
	checkArrays( e, e2, tc.e, tc.e2, 3 );
});

test( 'dlarra: spltol_pos_with_splits', function t() {
	var nsplit;
	var ISPLIT;
	var info;
	var e2;
	var tc;
	var d;
	var e;
	tc = findCase( 'spltol_pos_with_splits' );
	d = new Float64Array( [ 4.0, 3.0, 2.0, 5.0 ] );
	e = new Float64Array( [ 0.001, 1.0, 0.001 ] );
	e2 = new Float64Array( [ 0.000001, 1.0, 0.000001 ] );
	nsplit = new Int32Array( 1 );
	ISPLIT = new Int32Array( 5 );
	info = dlarra( 4, d, 1, 0, e, 1, 0, e2, 1, 0, 0.01, 5.0, nsplit, ISPLIT, 1, 0 );
	assert.strictEqual( info, tc.info );
	assert.strictEqual( nsplit[ 0 ], tc.nsplit );
	assert.ok( isplitMatches( ISPLIT, tc.isplit, tc.nsplit ), 'isplit matches' );
	checkArrays( e, e2, tc.e, tc.e2, 3 );
});

test( 'dlarra: all_zero_offdiag', function t() {
	var nsplit;
	var ISPLIT;
	var info;
	var e2;
	var tc;
	var d;
	var e;
	tc = findCase( 'all_zero_offdiag' );
	d = new Float64Array( [ 1.0, 2.0, 3.0, 4.0, 5.0 ] );
	e = new Float64Array( [ 0.0, 0.0, 0.0, 0.0 ] );
	e2 = new Float64Array( [ 0.0, 0.0, 0.0, 0.0 ] );
	nsplit = new Int32Array( 1 );
	ISPLIT = new Int32Array( 5 );
	info = dlarra( 5, d, 1, 0, e, 1, 0, e2, 1, 0, -0.1, 5.0, nsplit, ISPLIT, 1, 0 );
	assert.strictEqual( info, tc.info );
	assert.strictEqual( nsplit[ 0 ], tc.nsplit );
	assert.ok( isplitMatches( ISPLIT, tc.isplit, tc.nsplit ), 'isplit matches' );
});

test( 'dlarra: larger_6x6_neg_spltol', function t() {
	var nsplit;
	var ISPLIT;
	var info;
	var e2;
	var tc;
	var d;
	var e;
	tc = findCase( 'larger_6x6_neg_spltol' );
	d = new Float64Array( [ 10.0, 8.0, 6.0, 4.0, 2.0, 1.0 ] );
	e = new Float64Array( [ 0.001, 5.0, 0.002, 3.0, 0.003 ] );
	e2 = new Float64Array( [ 0.000001, 25.0, 0.000004, 9.0, 0.000009 ] );
	nsplit = new Int32Array( 1 );
	ISPLIT = new Int32Array( 6 );
	info = dlarra( 6, d, 1, 0, e, 1, 0, e2, 1, 0, -0.01, 10.0, nsplit, ISPLIT, 1, 0 );
	assert.strictEqual( info, tc.info );
	assert.strictEqual( nsplit[ 0 ], tc.nsplit );
	assert.ok( isplitMatches( ISPLIT, tc.isplit, tc.nsplit ), 'isplit matches' );
	checkArrays( e, e2, tc.e, tc.e2, 5 );
});

test( 'dlarra: neg_diag_pos_spltol', function t() {
	var nsplit;
	var ISPLIT;
	var info;
	var e2;
	var tc;
	var d;
	var e;
	tc = findCase( 'neg_diag_pos_spltol' );
	d = new Float64Array( [ -4.0, -9.0, -1.0 ] );
	e = new Float64Array( [ 0.01, 0.01 ] );
	e2 = new Float64Array( [ 0.0001, 0.0001 ] );
	nsplit = new Int32Array( 1 );
	ISPLIT = new Int32Array( 5 );
	info = dlarra( 3, d, 1, 0, e, 1, 0, e2, 1, 0, 0.01, 9.0, nsplit, ISPLIT, 1, 0 );
	assert.strictEqual( info, tc.info );
	assert.strictEqual( nsplit[ 0 ], tc.nsplit );
	assert.ok( isplitMatches( ISPLIT, tc.isplit, tc.nsplit ), 'isplit matches' );
	checkArrays( e, e2, tc.e, tc.e2, 2 );
});

test( 'dlarra: strided arrays exercise non-unit strides', function t() {
	var nsplit;
	var ISPLIT;
	var info;
	var e2;
	var d;
	var e;
	d = new Float64Array( [ 4.0, 0.0, 3.0, 0.0, 2.0, 0.0, 5.0, 0.0 ] );
	e = new Float64Array( [ 0.001, 0.0, 1.0, 0.0, 0.001, 0.0 ] );
	e2 = new Float64Array( [ 0.000001, 0.0, 1.0, 0.0, 0.000001, 0.0 ] );
	nsplit = new Int32Array( 1 );
	ISPLIT = new Int32Array( 10 );
	info = dlarra( 4, d, 2, 0, e, 2, 0, e2, 2, 0, 0.01, 5.0, nsplit, ISPLIT, 2, 0 );
	assert.strictEqual( info, 0 );
	assert.strictEqual( nsplit[ 0 ], 3 );
	assert.strictEqual( ISPLIT[ 0 ], 1 );
	assert.strictEqual( ISPLIT[ 2 ], 3 );
	assert.strictEqual( ISPLIT[ 4 ], 4 );
});
