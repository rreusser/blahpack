/* eslint-disable no-restricted-syntax, stdlib/first-unit-test, max-len */

// MODULES //

import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dgeqlf from './../lib/dgeqlf.js';


// FIXTURES //

var fixtureDir = path.join( import.meta.dirname, '..', '..', '..', '..', '..', 'test', 'fixtures' );
var lines = fs.readFileSync( path.join( fixtureDir, 'dgeqlf.jsonl' ), 'utf8' ).trim().split( '\n' ); // eslint-disable-line node/no-sync
var fixture = lines.map( parseLine );


// FUNCTIONS //

/**
* Parses a JSON line.
*
* @private
* @param {string} line - JSON line
* @returns {Object} parsed object
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
	return fixture.find( matchName );

	/**
	* Name matcher.
	*
	* @private
	* @param {Object} t - test case
	* @returns {boolean} match
	*/
	function matchName( t ) {
		return t.name === name;
	}
}

/**
* Asserts that a scalar value is close to an expected value.
*
* @private
* @param {number} actual - actual value
* @param {number} expected - expected value
* @param {number} tol - relative tolerance
* @param {string} msg - message
*/
function assertClose( actual, expected, tol, msg ) {
	var relErr = Math.abs( actual - expected ) / Math.max( Math.abs( expected ), 1.0 );
	assert.ok( relErr <= tol, msg + ': expected ' + expected + ', got ' + actual );
}

/**
* Asserts that two arrays are element-wise close.
*
* @private
* @param {*} actual - actual array
* @param {*} expected - expected array
* @param {number} tol - relative tolerance
* @param {string} msg - message
*/
function assertArrayClose( actual, expected, tol, msg ) {
	var i;
	for ( i = 0; i < expected.length; i++ ) {
		assertClose( actual[ i ], expected[ i ], tol, msg + '[' + i + ']' );
	}
}


// TESTS //

test( 'dgeqlf is a function', function t() {
	assert.strictEqual( typeof dgeqlf, 'function', 'is a function' );
});

test( 'dgeqlf has expected arity', function t() {
	assert.strictEqual( dgeqlf.length, 10, 'has expected arity' );
});

test( 'dgeqlf throws TypeError for invalid order', function t() {
	assert.throws( function throws() {
		dgeqlf( 'invalid', 2, 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, 2 );
	}, TypeError );
});

test( 'dgeqlf throws RangeError for negative M', function t() {
	assert.throws( function throws() {
		dgeqlf( 'row-major', -1, 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, 2 );
	}, RangeError );
});

test( 'dgeqlf throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		dgeqlf( 'row-major', 2, -1, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, 2 );
	}, RangeError );
});

test( 'dgeqlf throws RangeError for row-major LDA < N', function t() {
	assert.throws( function throws() {
		dgeqlf( 'row-major', 3, 5, new Float64Array( 25 ), 3, new Float64Array( 3 ), 1, new Float64Array( 5 ), 1, 5 );
	}, RangeError );
});

test( 'dgeqlf throws RangeError for column-major LDA < M', function t() {
	assert.throws( function throws() {
		dgeqlf( 'column-major', 5, 3, new Float64Array( 25 ), 3, new Float64Array( 3 ), 1, new Float64Array( 5 ), 1, 5 );
	}, RangeError );
});

test( 'dgeqlf column-major 3x3 matches fixture', function t() {
	var WORK;
	var info;
	var TAU;
	var tc;
	var A;

	tc = findCase( '3x3' );
	A = new Float64Array( [ 2, 1, 3, 1, 4, 2, 3, 2, 5 ] );
	TAU = new Float64Array( 3 );
	WORK = new Float64Array( 3 );
	info = dgeqlf( 'column-major', 3, 3, A, 3, TAU, 1, WORK, 1, 3 );
	assert.equal( info, tc.INFO );
	assertArrayClose( A, tc.A, 1e-13, 'A' );
	assertArrayClose( TAU, tc.TAU, 1e-13, 'TAU' );
});

test( 'dgeqlf column-major 4x3 matches fixture', function t() {
	var WORK;
	var info;
	var TAU;
	var tc;
	var A;

	tc = findCase( '4x3' );
	A = new Float64Array( [ 2, 1, 3, 1, 1, 4, 2, 3, 3, 2, 5, 1 ] );
	TAU = new Float64Array( 3 );
	WORK = new Float64Array( 3 );
	info = dgeqlf( 'column-major', 4, 3, A, 4, TAU, 1, WORK, 1, 3 );
	assert.equal( info, tc.INFO );
	assertArrayClose( A, tc.A, 1e-13, 'A' );
	assertArrayClose( TAU, tc.TAU, 1e-13, 'TAU' );
});

test( 'dgeqlf row-major 3x3 matches transposed fixture', function t() {
	var cmSrc;
	var WORK;
	var info;
	var TAU;
	var tc;
	var M;
	var N;
	var A;
	var i;
	var j;

	tc = findCase( '3x3' );
	M = 3;
	N = 3;
	cmSrc = [ 2, 1, 3, 1, 4, 2, 3, 2, 5 ];
	A = new Float64Array( M * N );
	for ( j = 0; j < N; j++ ) {
		for ( i = 0; i < M; i++ ) {
			A[ ( i * N ) + j ] = cmSrc[ i + ( j * M ) ];
		}
	}
	TAU = new Float64Array( 3 );
	WORK = new Float64Array( 3 );
	info = dgeqlf( 'row-major', M, N, A, N, TAU, 1, WORK, 1, 3 );
	assert.equal( info, tc.INFO );
	for ( j = 0; j < N; j++ ) {
		for ( i = 0; i < M; i++ ) {
			assertClose( A[ ( i * N ) + j ], tc.A[ i + ( j * M ) ], 1e-13, 'A[' + i + ',' + j + ']' );
		}
	}
	assertArrayClose( TAU, tc.TAU, 1e-13, 'TAU' );
});
