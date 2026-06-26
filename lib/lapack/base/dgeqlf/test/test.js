/* eslint-disable no-restricted-syntax, stdlib/first-unit-test, max-len */


// MODULES //

import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dgeqlf from './../lib/index.js';
import base from './../lib/base.js';


// FIXTURES //

var fixtureDir = path.join( import.meta.dirname, '..', '..', '..', '..', '..', 'test', 'fixtures' ); // eslint-disable-line max-len
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
	var relErr = Math.abs( actual - expected ) / Math.max( Math.abs( expected ), 1.0 ); // eslint-disable-line max-len
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

test( 'main export is a function', function t() {
	assert.strictEqual( typeof dgeqlf, 'function', 'main export is a function' );
});

test( 'main export has an ndarray method', function t() {
	assert.strictEqual( typeof dgeqlf.ndarray, 'function', 'has ndarray method' );
});

test( 'base: 3x3 (square) fixture', function t() {
	var WORK;
	var info;
	var TAU;
	var tc;
	var A;

	tc = findCase( '3x3' );
	A = new Float64Array( [ 2, 1, 3, 1, 4, 2, 3, 2, 5 ] );
	TAU = new Float64Array( 3 );
	WORK = new Float64Array( 3 );
	info = base( 3, 3, A, 1, 3, 0, TAU, 1, 0, WORK, 1, 0, 3 );
	assert.equal( info, tc.INFO, 'info' );
	assertArrayClose( A, tc.A, 1e-13, 'A' );
	assertArrayClose( TAU, tc.TAU, 1e-13, 'TAU' );
});

test( 'base: 4x3 (tall) fixture', function t() {
	var WORK;
	var info;
	var TAU;
	var tc;
	var A;

	tc = findCase( '4x3' );
	A = new Float64Array( [ 2, 1, 3, 1, 1, 4, 2, 3, 3, 2, 5, 1 ] );
	TAU = new Float64Array( 3 );
	WORK = new Float64Array( 3 );
	info = base( 4, 3, A, 1, 4, 0, TAU, 1, 0, WORK, 1, 0, 3 );
	assert.equal( info, tc.INFO, 'info' );
	assertArrayClose( A, tc.A, 1e-13, 'A' );
	assertArrayClose( TAU, tc.TAU, 1e-13, 'TAU' );
});

test( 'base: 3x4 (wide) fixture', function t() {
	var WORK;
	var info;
	var TAU;
	var tc;
	var A;

	tc = findCase( '3x4' );
	A = new Float64Array( [ 2, 1, 3, 1, 4, 2, 3, 2, 5, 4, 1, 2 ] );
	TAU = new Float64Array( 3 );
	WORK = new Float64Array( 4 );
	info = base( 3, 4, A, 1, 3, 0, TAU, 1, 0, WORK, 1, 0, 4 );
	assert.equal( info, tc.INFO, 'info' );
	assertArrayClose( A, tc.A, 1e-13, 'A' );
	assertArrayClose( TAU, tc.TAU, 1e-13, 'TAU' );
});

test( 'base: N=0 quick return', function t() {
	var WORK;
	var info;
	var TAU;
	var A;

	A = new Float64Array( 0 );
	TAU = new Float64Array( 0 );
	WORK = new Float64Array( 0 );
	info = base( 3, 0, A, 1, 3, 0, TAU, 1, 0, WORK, 1, 0, 0 );
	assert.equal( info, 0, 'info' );
});
