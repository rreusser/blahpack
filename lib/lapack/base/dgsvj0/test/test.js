/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

/**
* @license Apache-2.0
*
* Copyright (c) 2026 Ricky Reusser.
*
* Derived from the LAPACK 3.12.0 reference implementation (BSD-3-Clause).
*/


// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import dgsvj0 from './../lib/base.js';


// FIXTURES //

var fixtureDir = path.join( import.meta.dirname, '..', '..', '..', '..', '..', 'test', 'fixtures' ); // eslint-disable-line max-len
var lines = readFileSync( path.join( fixtureDir, 'dgsvj0.jsonl' ), 'utf8' ).trim().split( '\n' ); // eslint-disable-line node/no-sync
var fixture = lines.map( function parse( line ) {
		return JSON.parse( line );
	} );


// FUNCTIONS //

var EPS = 2.220446049250313e-16;
var SFMIN = 2.2250738585072014e-308;
var TOL = 1.0e-10;

/**
* Returns a test case from the fixture data.
*
* @private
* @param {string} name - test case name
* @returns {*} result
*/
function findCase( name ) {
		return fixture.find( function find( t ) { return t.name === name;
	} );
}

/**
* Asserts that two numbers are approximately equal.
*
* @private
* @param {*} actual - actual value
* @param {*} expected - expected value
* @param {number} tol - tolerance
* @param {string} msg - assertion message
*/
function assertClose( actual, expected, tol, msg ) {
	var denom = Math.max( Math.abs( expected ), 1.0 );
	var err = Math.abs( actual - expected ) / denom;
	assert.ok( err <= tol, msg + ': expected ' + expected + ', got ' + actual + ' (err=' + err + ')' ); // eslint-disable-line max-len
}

/**
* Asserts that two arrays are element-wise approximately equal.
*
* @private
* @param {*} actual - actual value
* @param {*} expected - expected value
* @param {number} tol - tolerance
* @param {string} msg - assertion message
*/
function assertArrayClose( actual, expected, tol, msg ) {
	var i;
	assert.equal( actual.length, expected.length, msg + ': length mismatch' );
	for ( i = 0; i < expected.length; i++ ) {
		assertClose( actual[ i ], expected[ i ], tol, msg + '[' + i + ']' );
	}
}

/**
* initialSva.
*
* @private
* @param {*} a - a
* @param {*} M - M
* @param {*} N - N
* @returns {*} result
*/
function initialSva( a, M, N ) {
	var out = new Float64Array( N );
	var j;
	var i;
	var s;
	for ( j = 0; j < N; j++ ) {
		s = 0;
		for ( i = 0; i < M; i++ ) {
			s += a[ j * M + i ] * a[ j * M + i ];
		}
		out[ j ] = Math.sqrt( s );
	}
	return out;
}


// TESTS //

test( 'dgsvj0: novec_4x3', function t() {
	var tc = findCase( 'novec_4x3' );
	var M = 4;
	var N = 3;
	var a = new Float64Array( [ 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12 ] );
	var d = new Float64Array( [ 1, 1, 1 ] );
	var sva = initialSva( a, M, N );
	var V = new Float64Array( 1 );
	var work = new Float64Array( M );
	var info = dgsvj0( 'no-v', M, N, a, 1, M, 0, d, 1, 0, sva, 1, 0, 0, V, 1, 1, 0, EPS, SFMIN, TOL, 5, work, 1, 0, M ); // eslint-disable-line max-len
	assertArrayClose( a, tc.a, 1e-12, 'a' );
	assertArrayClose( d, tc.d, 1e-12, 'd' );
	assertArrayClose( sva, tc.sva, 1e-12, 'sva' );
	assert.equal( info, tc.info, 'info' );
});

test( 'dgsvj0: vec_5x4', function t() {
	var tc = findCase( 'vec_5x4' );
	var M = 5;
	var N = 4;
	var a = new Float64Array( 20 );
	var i;
	for ( i = 1; i <= 20; i++ ) {
		a[ i - 1 ] = ( ( i * 7 ) % 11 ) - 5.0;
	}
	var d = new Float64Array( [ 1, 1, 1, 1 ] );
	var sva = initialSva( a, M, N );
	var V = new Float64Array( 16 );
	V[ 0 ] = 1; V[ 5 ] = 1; V[ 10 ] = 1; V[ 15 ] = 1;
	var work = new Float64Array( M );
	var info = dgsvj0( 'compute-v', M, N, a, 1, M, 0, d, 1, 0, sva, 1, 0, 0, V, 1, 4, 0, EPS, SFMIN, TOL, 5, work, 1, 0, M ); // eslint-disable-line max-len
	assertArrayClose( a, tc.a, 1e-11, 'a' );
	assertArrayClose( V, tc.v, 1e-11, 'v' );
	assertArrayClose( d, tc.d, 1e-11, 'd' );
	assertArrayClose( sva, tc.sva, 1e-11, 'sva' );
	assert.equal( info, tc.info, 'info' );
});

test( 'dgsvj0: apply_4x3', function t() {
	var tc = findCase( 'apply_4x3' );
	var M = 4;
	var N = 3;
	var a = new Float64Array( [ 2, 1, 0, 0, 1, 2, 1, 0, 0, 1, 2, 1 ] );
	var d = new Float64Array( [ 1, 1, 1 ] );
	var sva = new Float64Array( [ Math.sqrt( 5 ), Math.sqrt( 6 ), Math.sqrt( 6 ) ] ); // eslint-disable-line max-len
	var V = new Float64Array( 9 );
	V[ 0 ] = 1; V[ 4 ] = 1; V[ 8 ] = 1;
	var work = new Float64Array( M );
	var info = dgsvj0( 'apply-v', M, N, a, 1, M, 0, d, 1, 0, sva, 1, 0, 3, V, 1, 3, 0, EPS, SFMIN, TOL, 3, work, 1, 0, M ); // eslint-disable-line max-len
	assertArrayClose( a, tc.a, 1e-12, 'a' );
	assertArrayClose( V, tc.v, 1e-12, 'v' );
	assertArrayClose( d, tc.d, 1e-12, 'd' );
	assertArrayClose( sva, tc.sva, 1e-12, 'sva' );
	assert.equal( info, tc.info, 'info' );
});

test( 'dgsvj0: novec_n1', function t() {
	var tc = findCase( 'novec_n1' );
	var M = 3;
	var N = 1;
	var a = new Float64Array( [ 3, 4, 0 ] );
	var d = new Float64Array( [ 1 ] );
	var sva = new Float64Array( [ 5 ] );
	var V = new Float64Array( 1 );
	var work = new Float64Array( M );
	var info = dgsvj0( 'no-v', M, N, a, 1, M, 0, d, 1, 0, sva, 1, 0, 0, V, 1, 1, 0, EPS, SFMIN, TOL, 2, work, 1, 0, M ); // eslint-disable-line max-len
	assertArrayClose( a, tc.a, 1e-13, 'a' );
	assertArrayClose( d, tc.d, 1e-13, 'd' );
	assertArrayClose( sva, tc.sva, 1e-13, 'sva' );
	assert.equal( info, tc.info, 'info' );
});

test( 'dgsvj0: vec_10x9_block', function t() {
	var tc = findCase( 'vec_10x9_block' );
	var M = 10;
	var N = 9;
	var a = new Float64Array( M * N );
	var i;
	for ( i = 1; i <= M * N; i++ ) {
		a[ i - 1 ] = ( ( i * 37 + 13 ) % 29 ) - 14.0 + Math.sin( i * 0.11 );
	}
	var d = new Float64Array( N );
	for ( i = 0; i < N; i++ ) {
		d[ i ] = 1;
	}
	var sva = initialSva( a, M, N );
	var V = new Float64Array( N * N );
	for ( i = 0; i < N; i++ ) {
		V[ i * N + i ] = 1;
	}
	var work = new Float64Array( M );
	var info = dgsvj0( 'compute-v', M, N, a, 1, M, 0, d, 1, 0, sva, 1, 0, 0, V, 1, N, 0, EPS, SFMIN, TOL, 4, work, 1, 0, M ); // eslint-disable-line max-len
	assertArrayClose( a, tc.a, 1e-10, 'a' );
	assertArrayClose( V, tc.v, 1e-10, 'v' );
	assertArrayClose( d, tc.d, 1e-10, 'd' );
	assertArrayClose( sva, tc.sva, 1e-10, 'sva' );
	assert.equal( info, tc.info, 'info' );
});

test( 'dgsvj0: invalid jobv returns -1', function t() {
	var info = dgsvj0( 'bogus', 1, 1, new Float64Array( 1 ), 1, 1, 0, new Float64Array( 1 ), 1, 0, new Float64Array( 1 ), 1, 0, 0, new Float64Array( 1 ), 1, 1, 0, EPS, SFMIN, TOL, 1, new Float64Array( 1 ), 1, 0, 1 ); // eslint-disable-line max-len
	assert.equal( info, -1 );
});

test( 'dgsvj0: negative M returns -2', function t() {
	var info = dgsvj0( 'no-v', -1, 1, new Float64Array( 1 ), 1, 1, 0, new Float64Array( 1 ), 1, 0, new Float64Array( 1 ), 1, 0, 0, new Float64Array( 1 ), 1, 1, 0, EPS, SFMIN, TOL, 1, new Float64Array( 1 ), 1, 0, 1 ); // eslint-disable-line max-len
	assert.equal( info, -2 );
});

test( 'dgsvj0: tol <= eps returns -19', function t() {
	var info = dgsvj0( 'no-v', 2, 2, new Float64Array( 4 ), 1, 2, 0, new Float64Array( 2 ), 1, 0, new Float64Array( 2 ), 1, 0, 0, new Float64Array( 1 ), 1, 1, 0, EPS, SFMIN, EPS, 1, new Float64Array( 2 ), 1, 0, 2 ); // eslint-disable-line max-len
	assert.equal( info, -19 );
});
