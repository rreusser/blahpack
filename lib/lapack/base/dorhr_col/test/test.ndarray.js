/* eslint-disable no-restricted-syntax, stdlib/first-unit-test, camelcase */

// MODULES //

import { readFileSync } from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dorhr_col from './../lib/ndarray.js';
import ndarrayFn from './../lib/ndarray.js';


// FIXTURES //

var fixtureDir = path.join( import.meta.dirname, '..', '..', '..', '..', '..', 'test', 'fixtures' );
var fixturePath = path.join( fixtureDir, 'dorhr_col.jsonl' );
var lines = readFileSync( fixturePath, 'utf8' ).trim().split( '\n' );
var fixture = lines.map( function parse( line ) {
	return JSON.parse( line );
});


// FUNCTIONS //

/**
* Finds a fixture case by name.
*
* @private
* @param {string} name - case name
* @returns {Object} fixture case
*/
function findCase( name ) {
	return fixture.find( function find( t ) {
		return t.name === name;
	});
}

/**
* Asserts that two arrays are element-wise approximately equal.
*
* @private
* @param {*} actual - actual values
* @param {*} expected - expected values
* @param {number} tol - tolerance
* @param {string} msg - message
*/
function assertArrayClose( actual, expected, tol, msg ) {
	var relErr;
	var i;
	assert.equal( actual.length, expected.length, msg + ': length mismatch' );
	for ( i = 0; i < expected.length; i++ ) {
		relErr = Math.abs( actual[ i ] - expected[ i ] ) / Math.max( Math.abs( expected[ i ] ), 1.0 ); // eslint-disable-line max-len
		assert.ok( relErr <= tol, msg + '[' + i + ']: expected ' + expected[ i ] + ', got ' + actual[ i ] ); // eslint-disable-line max-len
	}
}

/**
* Asserts that every entry of the diagonal sign vector `D` equals +/- 1.
*
* @private
* @param {Float64Array} D - diagonal sign vector
* @param {number} N - number of columns
*/
function assertSignVector( D, N ) {
	var i;
	for ( i = 0; i < N; i++ ) {
		assert.ok( Math.abs( Math.abs( D[ i ] ) - 1.0 ) < 1e-13, 'D[' + i + '] is +/-1' );
	}
}

/**
* Runs a fixture-driven test case.
*
* @private
* @param {string} name - fixture case name
* @param {number} M - rows
* @param {number} N - columns
* @param {number} nb - block size
*/
function runCase( name, M, N, nb ) {
	var info;
	var ldt;
	var tc;
	var a;
	var d;
	var t;
	tc = findCase( name );
	a = new Float64Array( tc.q_in );
	ldt = Math.min( nb, N );
	t = new Float64Array( ldt * N );
	d = new Float64Array( N );
	info = dorhr_col( M, N, nb, a, 1, Math.max( 1, M ), 0, t, 1, Math.max( 1, ldt ), 0, d, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, tc.info, 'info' );
	assertArrayClose( a, tc.a, 1e-12, 'a' );
	assertArrayClose( t, tc.t, 1e-12, 't' );
	assertArrayClose( d, tc.d, 1e-14, 'd' );
	assertSignVector( d, N );
}


// TESTS //

test( 'dorhr_col: base is a function', function t() {
	assert.strictEqual( typeof dorhr_col, 'function', 'is a function' );
});

test( 'dorhr_col: 5x3 with NB=2', function t() {
	runCase( '5x3_nb2', 5, 3, 2 );
});

test( 'dorhr_col: 6x4 with NB=2', function t() {
	runCase( '6x4_nb2', 6, 4, 2 );
});

test( 'dorhr_col: 4x4 with NB=4 (single panel)', function t() {
	runCase( '4x4_nb4', 4, 4, 4 );
});

test( 'dorhr_col: 8x5 with NB=3', function t() {
	runCase( '8x5_nb3', 8, 5, 3 );
});

test( 'dorhr_col: 1x1 degenerate', function t() {
	runCase( '1x1', 1, 1, 1 );
});

test( 'dorhr_col: 7x5 with NB=5 (NB >= N)', function t() {
	runCase( '7x5_nb5', 7, 5, 5 );
});

test( 'dorhr_col: M=0 N=0 quick return', function t() {
	var info;
	var a;
	var d;
	var t;
	a = new Float64Array( 1 );
	t = new Float64Array( 1 );
	d = new Float64Array( 1 );
	info = dorhr_col( 0, 0, 1, a, 1, 1, 0, t, 1, 1, 0, d, 1, 0 );
	assert.equal( info, 0, 'info' );
});

test( 'dorhr_col: N=0 quick return', function t() {
	var info;
	var a;
	var d;
	var t;
	a = new Float64Array( 4 );
	t = new Float64Array( 1 );
	d = new Float64Array( 1 );
	info = dorhr_col( 4, 0, 1, a, 1, 4, 0, t, 1, 1, 0, d, 1, 0 );
	assert.equal( info, 0, 'info' );
});

test( 'dorhr_col: ndarray wrapper validates M, N, nb', function t() {
	var a;
	var d;
	var t;
	a = new Float64Array( 4 );
	t = new Float64Array( 4 );
	d = new Float64Array( 4 );
	assert.throws( function fn1() {
		ndarrayFn( -1, 0, 1, a, 1, 1, 0, t, 1, 1, 0, d, 1, 0 );
	}, RangeError );
	assert.throws( function fn2() {
		ndarrayFn( 2, 3, 1, a, 1, 2, 0, t, 1, 1, 0, d, 1, 0 );
	}, RangeError );
	assert.throws( function fn3() {
		ndarrayFn( 2, 2, 0, a, 1, 2, 0, t, 1, 1, 0, d, 1, 0 );
	}, RangeError );
});
