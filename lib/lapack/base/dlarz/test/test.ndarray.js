/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import { readFileSync } from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dlarz from './../lib/ndarray.js';


// FIXTURES //

var fixtureDir = path.join( import.meta.dirname, '..', '..', '..', '..', '..', 'test', 'fixtures' );
var lines = readFileSync( path.join( fixtureDir, 'dlarz.jsonl' ), 'utf8' ).trim().split( '\n' ); // eslint-disable-line node/no-sync
var fixture = lines.map( parseLine );


// FUNCTIONS //

/**
* Parses a JSONL line.
*
* @private
* @param {string} line - line
* @returns {Object} parsed
*/
function parseLine( line ) {
	return JSON.parse( line );
}

/**
* Finds a fixture case by name.
*
* @private
* @param {string} name - case name
* @returns {Object} fixture case
*/
function findCase( name ) {
	var i;
	for ( i = 0; i < fixture.length; i++ ) {
		if ( fixture[ i ].name === name ) {
			return fixture[ i ];
		}
	}
	return null;
}

/**
* Asserts that two arrays are element-wise approximately equal.
*
* @private
* @param {*} actual - actual values
* @param {*} expected - expected values
* @param {number} tol - relative tolerance
* @param {string} msg - assertion message
*/
function assertArrayClose( actual, expected, tol, msg ) {
	var relErr;
	var i;
	assert.equal( actual.length, expected.length, msg + ': length mismatch' );
	for ( i = 0; i < expected.length; i++ ) {
		relErr = Math.abs( actual[ i ] - expected[ i ] ) / Math.max( Math.abs( expected[ i ] ), 1.0 ); // eslint-disable-line max-len
		assert.ok( relErr <= tol, msg + '[' + i + ']: expected ' + expected[ i ] + ', got ' + actual[ i ] );
	}
}

/**
* Builds a column-major M-by-N matrix from a row-wise value table.
*
* @private
* @param {NonNegativeInteger} M - rows
* @param {NonNegativeInteger} N - columns
* @param {Array} rows - row-wise values
* @returns {Float64Array} packed matrix
*/
function makeMatrix( M, N, rows ) {
	var C = new Float64Array( M * N );
	var i;
	var j;
	for ( j = 0; j < N; j++ ) {
		for ( i = 0; i < M; i++ ) {
			C[ i + ( j * M ) ] = rows[ i ][ j ];
		}
	}
	return C;
}


// TESTS //

test( 'dlarz: left_4x4_l2 (side=left, M=N=4, L=2)', function t() {
	var WORK;
	var tc;
	var C;
	var v;
	tc = findCase( 'left_4x4_l2' );
	C = makeMatrix( 4, 4, [
		[ 1, 2, 3, 4 ],
		[ 5, 6, 7, 8 ],
		[ 9, 10, 11, 12 ],
		[ 13, 14, 15, 16 ]
	]);
	v = new Float64Array( [ 0.5, 0.25 ] );
	WORK = new Float64Array( 4 );
	dlarz( 'left', 4, 4, 2, v, 1, 0, 1.5, C, 1, 4, 0, WORK, 1, 0 );
	assertArrayClose( C, tc.C, 1e-14, 'C' );
});

test( 'dlarz: right_4x4_l2 (side=right, M=N=4, L=2)', function t() {
	var WORK;
	var tc;
	var C;
	var v;
	tc = findCase( 'right_4x4_l2' );
	C = makeMatrix( 4, 4, [
		[ 1, 2, 3, 4 ],
		[ 5, 6, 7, 8 ],
		[ 9, 10, 11, 12 ],
		[ 13, 14, 15, 16 ]
	]);
	v = new Float64Array( [ 0.5, 0.25 ] );
	WORK = new Float64Array( 4 );
	dlarz( 'right', 4, 4, 2, v, 1, 0, 1.5, C, 1, 4, 0, WORK, 1, 0 );
	assertArrayClose( C, tc.C, 1e-14, 'C' );
});

test( 'dlarz: tau_zero (quick return, side=left)', function t() {
	var WORK;
	var tc;
	var C;
	var v;
	tc = findCase( 'tau_zero' );
	C = makeMatrix( 3, 3, [
		[ 1, 2, 3 ],
		[ 4, 5, 6 ],
		[ 7, 8, 9 ]
	]);
	v = new Float64Array( [ 1.0 ] );
	WORK = new Float64Array( 3 );
	dlarz( 'left', 3, 3, 1, v, 1, 0, 0.0, C, 1, 3, 0, WORK, 1, 0 );
	assertArrayClose( C, tc.C, 1e-14, 'C' );
});

test( 'dlarz: left_l0 (L=0 path: first row of C scaled)', function t() {
	var WORK;
	var tc;
	var C;
	var v;
	tc = findCase( 'left_l0' );
	C = makeMatrix( 3, 3, [
		[ 1, 2, 3 ],
		[ 4, 5, 6 ],
		[ 7, 8, 9 ]
	]);
	v = new Float64Array( [ 0.0 ] );
	WORK = new Float64Array( 3 );
	dlarz( 'left', 3, 3, 0, v, 1, 0, 0.5, C, 1, 3, 0, WORK, 1, 0 );
	assertArrayClose( C, tc.C, 1e-14, 'C' );
});

test( 'dlarz: left_5x3_l3 (side=left, M=5, N=3, L=3)', function t() {
	var WORK;
	var tc;
	var C;
	var v;
	tc = findCase( 'left_5x3_l3' );
	C = makeMatrix( 5, 3, [
		[ 1, 2, 3 ],
		[ 4, 5, 6 ],
		[ 7, 8, 9 ],
		[ 10, 11, 12 ],
		[ 13, 14, 15 ]
	]);
	v = new Float64Array( [ 0.1, 0.2, 0.3 ] );
	WORK = new Float64Array( 3 );
	dlarz( 'left', 5, 3, 3, v, 1, 0, 2.0, C, 1, 5, 0, WORK, 1, 0 );
	assertArrayClose( C, tc.C, 1e-14, 'C' );
});

test( 'dlarz: right_3x5_l3 (side=right, M=3, N=5, L=3)', function t() {
	var WORK;
	var tc;
	var C;
	var v;
	tc = findCase( 'right_3x5_l3' );
	C = makeMatrix( 3, 5, [
		[ 1, 2, 3, 4, 5 ],
		[ 6, 7, 8, 9, 10 ],
		[ 11, 12, 13, 14, 15 ]
	]);
	v = new Float64Array( [ 0.3, 0.2, 0.1 ] );
	WORK = new Float64Array( 3 );
	dlarz( 'right', 3, 5, 3, v, 1, 0, -0.5, C, 1, 3, 0, WORK, 1, 0 );
	assertArrayClose( C, tc.C, 1e-14, 'C' );
});

test( 'dlarz: right L=0 path scales first column', function t() {
	var expected;
	var WORK;
	var C;
	var v;
	C = makeMatrix( 3, 3, [
		[ 1, 2, 3 ],
		[ 4, 5, 6 ],
		[ 7, 8, 9 ]
	]);
	v = new Float64Array( [ 0.0 ] );
	WORK = new Float64Array( 3 );
	dlarz( 'right', 3, 3, 0, v, 1, 0, 0.5, C, 1, 3, 0, WORK, 1, 0 );

	// First column [1,4,7] is scaled by (1 - tau) = 0.5 → [0.5, 2, 3.5].
	expected = new Float64Array( [ 0.5, 2.0, 3.5, 2, 5, 8, 3, 6, 9 ] );
	assertArrayClose( C, expected, 1e-14, 'C' );
});

test( 'dlarz: right tau=0 quick return leaves C unchanged', function t() {
	var original;
	var WORK;
	var C;
	var v;
	C = makeMatrix( 2, 3, [
		[ 1, 2, 3 ],
		[ 4, 5, 6 ]
	]);
	original = new Float64Array( C );
	v = new Float64Array( [ 0.7, 0.8 ] );
	WORK = new Float64Array( 2 );
	dlarz( 'right', 2, 3, 2, v, 1, 0, 0.0, C, 1, 2, 0, WORK, 1, 0 );
	assertArrayClose( C, original, 1e-14, 'C' );
});

test( 'dlarz: ndarray throws TypeError for invalid side', function t() {
	assert.throws( function throws() {
		dlarz( 'invalid', 2, 2, 1, new Float64Array( 1 ), 1, 0, 1.0, new Float64Array( 4 ), 1, 2, 0, new Float64Array( 2 ), 1, 0 );
	}, TypeError );
});
