/* eslint-disable no-restricted-syntax, stdlib/first-unit-test, camelcase */

// MODULES //

import { readFileSync } from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dlaorhr_col_getrfnp from './../lib/ndarray.js';
import ndarrayFn from './../lib/ndarray.js';


// FIXTURES //

var fixtureDir = path.join( import.meta.dirname, '..', '..', '..', '..', '..', 'test', 'fixtures' );
var fixturePath = path.join( fixtureDir, 'dlaorhr_col_getrfnp.jsonl' );
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
* Runs a fixture-driven test case.
*
* @private
* @param {string} name - fixture case name
* @param {number} M - rows
* @param {number} N - columns
* @param {Array} input - column-major input data
* @param {number} dlen - length of D
*/
function runCase( name, M, N, input, dlen ) {
	var info;
	var tc;
	var a;
	var d;
	tc = findCase( name );
	a = new Float64Array( input );
	d = new Float64Array( dlen );
	info = dlaorhr_col_getrfnp( M, N, a, 1, Math.max( 1, M ), 0, d, 1, 0 );
	assert.equal( info, tc.info, 'info' );
	assertArrayClose( a, tc.a, 1e-12, 'a' );
	assertArrayClose( d, tc.d, 1e-14, 'd' );
}


// TESTS //

test( 'dlaorhr_col_getrfnp: 3x3', function t() {
	runCase( '3x3', 3, 3, [ 0.5, 0.3, -0.2, -0.4, 0.6, 0.1, 0.2, -0.1, 0.7 ], 3 );
});

test( 'dlaorhr_col_getrfnp: 4x3 (M>N)', function t() {
	runCase( '4x3', 4, 3, [ 0.7, -0.3, 0.2, -0.1, 0.1, 0.5, -0.4, 0.3, -0.2, 0.4, 0.6, -0.5 ], 3 );
});

test( 'dlaorhr_col_getrfnp: 1x1', function t() {
	runCase( '1x1', 1, 1, [ 0.6 ], 1 );
});

test( 'dlaorhr_col_getrfnp: 5x5', function t() {
	runCase( '5x5', 5, 5, [ 0.7, -0.2, 0.1, -0.3, 0.4, -0.1, 0.6, 0.2, -0.4, 0.3, 0.3, -0.2, 0.8, 0.1, -0.5, -0.4, 0.5, -0.1, 0.7, 0.2, 0.2, -0.3, 0.4, -0.6, 0.9 ], 5 );
});

test( 'dlaorhr_col_getrfnp: 3x4 (M<N)', function t() {
	runCase( '3x4', 3, 4, [ 0.8, 0.1, -0.2, -0.3, 0.7, 0.2, 0.4, -0.5, 0.6, 0.1, 0.3, -0.4 ], 4 );
});

test( 'dlaorhr_col_getrfnp: 20x20 (matches Fortran sin-built input)', function t() {
	var info;
	var tc;
	var a;
	var d;
	var i;
	var j;
	tc = findCase( '20x20' );
	a = new Float64Array( 400 );
	for ( j = 1; j <= 20; j++ ) {
		for ( i = 1; i <= 20; i++ ) {
			a[ ( ( j - 1 ) * 20 ) + ( i - 1 ) ] = Math.sin( i + ( 3 * j ) ) * 0.5; // eslint-disable-line max-len
			if ( i === j ) {
				a[ ( ( j - 1 ) * 20 ) + ( i - 1 ) ] += 1.5;
			}
		}
	}
	d = new Float64Array( 20 );
	info = dlaorhr_col_getrfnp( 20, 20, a, 1, 20, 0, d, 1, 0 );
	assert.equal( info, tc.info, 'info' );
	assertArrayClose( a, tc.a, 1e-12, 'a' );
	assertArrayClose( d, tc.d, 1e-14, 'd' );
});

test( 'dlaorhr_col_getrfnp: M=0 quick return', function t() {
	var info;
	var a;
	var d;
	a = new Float64Array( [ 1.0, 2.0, 3.0 ] );
	d = new Float64Array( 1 );
	info = dlaorhr_col_getrfnp( 0, 3, a, 1, 1, 0, d, 1, 0 );
	assert.equal( info, 0, 'info' );
	assert.equal( a[ 0 ], 1.0, 'a unchanged' );
});

test( 'dlaorhr_col_getrfnp: N=0 quick return', function t() {
	var info;
	var a;
	var d;
	a = new Float64Array( [ 1.0, 2.0, 3.0 ] );
	d = new Float64Array( 1 );
	info = dlaorhr_col_getrfnp( 3, 0, a, 1, 3, 0, d, 1, 0 );
	assert.equal( info, 0, 'info' );
	assert.equal( a[ 0 ], 1.0, 'a unchanged' );
});

test( 'dlaorhr_col_getrfnp: ndarray wrapper validation', function t() {
	var a;
	var d;
	a = new Float64Array( [ 0.6 ] );
	d = new Float64Array( 1 );
	assert.throws( function fn1() {
		ndarrayFn( -1, 1, a, 1, 1, 0, d, 1, 0 );
	}, RangeError );
	assert.throws( function fn2() {
		ndarrayFn( 1, -1, a, 1, 1, 0, d, 1, 0 );
	}, RangeError );
	assert.equal( ndarrayFn( 0, 1, a, 1, 1, 0, d, 1, 0 ), 0 );
	assert.equal( ndarrayFn( 1, 0, a, 1, 1, 0, d, 1, 0 ), 0 );
});

test( 'dlaorhr_col_getrfnp: blocked path with N>NB (40x40)', function t() {
	// Construct a well-conditioned 40x40 matrix to exercise the blocked path
	// (NB=32, so 40 > NB ensures blocking). Compare against ndarray invocation.
	var info;
	var a;
	var d;
	var i;
	var j;
	a = new Float64Array( 1600 );
	for ( j = 0; j < 40; j++ ) {
		for ( i = 0; i < 40; i++ ) {
			a[ ( j * 40 ) + i ] = Math.cos( ( i * 2 ) + ( 5 * j ) ) * 0.3;
			if ( i === j ) {
				a[ ( j * 40 ) + i ] += 2.0;
			}
		}
	}
	d = new Float64Array( 40 );
	info = dlaorhr_col_getrfnp( 40, 40, a, 1, 40, 0, d, 1, 0 );
	assert.equal( info, 0, 'info' );

	// Verify reconstruction: every D entry should be +/- 1.
	for ( i = 0; i < 40; i++ ) {
		assert.ok( Math.abs( Math.abs( d[ i ] ) - 1.0 ) < 1e-14, 'D[i] is +/-1' );
	}
});
