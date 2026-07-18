/**
* @license Apache-2.0
*
* Copyright (c) 2026 Ricky Reusser.
*
* Derived from the LAPACK 3.12.0 reference implementation (BSD-3-Clause).
*/

/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */


// MODULES //

import test from 'node:test';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dgsvj1 from './../lib/base.js';


// FIXTURES //

const fixtureDir = path.join( import.meta.dirname, '..', '..', '..', '..', '..', 'test', 'fixtures' ); // eslint-disable-line max-len
const lines = readFileSync( path.join( fixtureDir, 'dgsvj1.jsonl' ), 'utf8' ).trim().split( '\n' ); // eslint-disable-line node/no-sync
const fixture = lines.map( function parse( line ) {
		return JSON.parse( line );
	});


// VARIABLES //

const EPS = 2.220446049250313e-16;
const SFMIN = 2.2250738585072014e-308;
const TOL = 1.0e-10;


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
* Asserts relative closeness.
*
* @private
* @param {number} actual - actual value
* @param {number} expected - expected value
* @param {number} tol - tolerance
* @param {string} msg - message
*/
function assertClose( actual, expected, tol, msg ) {
	const denom = Math.max( Math.abs( expected ), 1.0 );
	const err = Math.abs( actual - expected ) / denom;
	assert.ok( err <= tol, msg + ': expected ' + expected + ', got ' + actual + ' (err=' + err + ')' ); // eslint-disable-line max-len
}

/**
* Asserts element-wise array closeness.
*
* @private
* @param {Float64Array} actual - actual values
* @param {Array} expected - expected values
* @param {number} tol - tolerance
* @param {string} msg - message
*/
function assertArrayClose( actual, expected, tol, msg ) {
	let i;
	assert.equal( actual.length, expected.length, msg + ': length mismatch' );
	for ( i = 0; i < expected.length; i++ ) {
		assertClose( actual[ i ], expected[ i ], tol, msg + '[' + i + ']' );
	}
}

/**
* Computes initial column norms of an M x N column-major matrix.
*
* @private
* @param {Float64Array} a - input matrix
* @param {integer} M - number of rows
* @param {integer} N - number of columns
* @returns {Float64Array} column norms
*/
function initialSva( a, M, N ) {
	let s, j, i;
	const out = new Float64Array( N );
	for ( j = 0; j < N; j++ ) {
		s = 0;
		for ( i = 0; i < M; i++ ) {
			s += a[ ( j * M ) + i ] * a[ ( j * M ) + i ];
		}
		out[ j ] = Math.sqrt( s );
	}
	return out;
}


// TESTS //

test( 'dgsvj1: novec_4x3_n1_1', function t() {

	const tc = findCase( 'novec_4x3_n1_1' );
	const M = 4;
	const N = 3;
	const a = new Float64Array( [ 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12 ] );
	const d = new Float64Array( [ 1, 1, 1 ] );
	const sva = initialSva( a, M, N );
	const V = new Float64Array( 1 );
	const work = new Float64Array( M );
	const info = dgsvj1( 'no-v', M, N, 1, a, 1, M, 0, d, 1, 0, sva, 1, 0, 0, V, 1, 1, 0, EPS, SFMIN, TOL, 5, work, 1, 0 ); // eslint-disable-line max-len
	assertArrayClose( a, tc.a, 1e-12, 'a' );
	assertArrayClose( d, tc.d, 1e-12, 'd' );
	assertArrayClose( sva, tc.sva, 1e-12, 'sva' );
	assert.equal( info, tc.info, 'info' );
});

test( 'dgsvj1: vec_5x4_n1_2', function t() {
	let i;

	const tc = findCase( 'vec_5x4_n1_2' );
	const M = 5;
	const N = 4;
	const a = new Float64Array( 20 );
	for ( i = 1; i <= 20; i++ ) {
		a[ i - 1 ] = ( ( i * 7 ) % 11 ) - 5.0;
	}
	const d = new Float64Array( [ 1, 1, 1, 1 ] );
	const sva = initialSva( a, M, N );
	const V = new Float64Array( 16 );
	V[ 0 ] = 1;
	V[ 5 ] = 1;
	V[ 10 ] = 1;
	V[ 15 ] = 1;
	const work = new Float64Array( M );
	const info = dgsvj1( 'compute-v', M, N, 2, a, 1, M, 0, d, 1, 0, sva, 1, 0, 0, V, 1, 4, 0, EPS, SFMIN, TOL, 5, work, 1, 0 ); // eslint-disable-line max-len
	assertArrayClose( a, tc.a, 1e-11, 'a' );
	assertArrayClose( V, tc.v, 1e-11, 'v' );
	assertArrayClose( d, tc.d, 1e-11, 'd' );
	assertArrayClose( sva, tc.sva, 1e-11, 'sva' );
	assert.equal( info, tc.info, 'info' );
});

test( 'dgsvj1: apply_4x3_n1_1', function t() {

	const tc = findCase( 'apply_4x3_n1_1' );
	const M = 4;
	const N = 3;
	const a = new Float64Array( [ 2, 1, 0, 0, 1, 2, 1, 0, 0, 1, 2, 1 ] );
	const d = new Float64Array( [ 1, 1, 1 ] );
	const sva = new Float64Array( [ Math.sqrt( 5 ), Math.sqrt( 6 ), Math.sqrt( 6 ) ] );
	const V = new Float64Array( 9 );
	V[ 0 ] = 1;
	V[ 4 ] = 1;
	V[ 8 ] = 1;
	const work = new Float64Array( M );
	const info = dgsvj1( 'apply-v', M, N, 1, a, 1, M, 0, d, 1, 0, sva, 1, 0, 3, V, 1, 3, 0, EPS, SFMIN, TOL, 3, work, 1, 0 ); // eslint-disable-line max-len
	assertArrayClose( a, tc.a, 1e-12, 'a' );
	assertArrayClose( V, tc.v, 1e-12, 'v' );
	assertArrayClose( d, tc.d, 1e-12, 'd' );
	assertArrayClose( sva, tc.sva, 1e-12, 'sva' );
	assert.equal( info, tc.info, 'info' );
});

test( 'dgsvj1: vec_14x14_block', function t() {
	let i;

	const tc = findCase( 'vec_14x14_block' );
	const M = 14;
	const N = 14;
	const a = new Float64Array( M * N );
	for ( i = 1; i <= M * N; i++ ) {
		a[ i - 1 ] = ( ( ( i * 37 ) + 13 ) % 29 ) - 14.0 + Math.sin( i * 0.11 );
	}
	const d = new Float64Array( N );
	for ( i = 0; i < N; i++ ) {
		d[ i ] = 1;
	}
	const sva = initialSva( a, M, N );
	const V = new Float64Array( N * N );
	for ( i = 0; i < N; i++ ) {
		V[ ( i * N ) + i ] = 1;
	}
	const work = new Float64Array( M );
	const info = dgsvj1( 'compute-v', M, N, 5, a, 1, M, 0, d, 1, 0, sva, 1, 0, 0, V, 1, N, 0, EPS, SFMIN, TOL, 4, work, 1, 0 ); // eslint-disable-line max-len
	assertArrayClose( a, tc.a, 1e-10, 'a' );
	assertArrayClose( V, tc.v, 1e-10, 'v' );
	assertArrayClose( d, tc.d, 1e-10, 'd' );
	assertArrayClose( sva, tc.sva, 1e-10, 'sva' );
	assert.equal( info, tc.info, 'info' );
});

test( 'dgsvj1: novec_n1_eq_n', function t() {
	let i;

	const tc = findCase( 'novec_n1_eq_n' );
	const M = 6;
	const N = 4;
	const a = new Float64Array( M * N );
	for ( i = 1; i <= M * N; i++ ) {
		a[ i - 1 ] = Math.sin( i * 0.7 ) + 0.5;
	}
	const d = new Float64Array( [ 1, 1, 1, 1 ] );
	const sva = initialSva( a, M, N );
	const V = new Float64Array( 1 );
	const work = new Float64Array( M );
	const info = dgsvj1( 'no-v', M, N, N, a, 1, M, 0, d, 1, 0, sva, 1, 0, 0, V, 1, 1, 0, EPS, SFMIN, TOL, 3, work, 1, 0 ); // eslint-disable-line max-len
	assertArrayClose( a, tc.a, 1e-12, 'a' );
	assertArrayClose( d, tc.d, 1e-12, 'd' );
	assertArrayClose( sva, tc.sva, 1e-12, 'sva' );
	assert.equal( info, tc.info, 'info' );
});

test( 'dgsvj1: novec_n1_0', function t() {

	const tc = findCase( 'novec_n1_0' );
	const M = 4;
	const N = 3;
	const a = new Float64Array( [ 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12 ] );
	const d = new Float64Array( [ 1, 1, 1 ] );
	const sva = initialSva( a, M, N );
	const V = new Float64Array( 1 );
	const work = new Float64Array( M );
	const info = dgsvj1( 'no-v', M, N, 0, a, 1, M, 0, d, 1, 0, sva, 1, 0, 0, V, 1, 1, 0, EPS, SFMIN, TOL, 2, work, 1, 0 ); // eslint-disable-line max-len
	assertArrayClose( a, tc.a, 1e-12, 'a' );
	assertArrayClose( d, tc.d, 1e-12, 'd' );
	assertArrayClose( sva, tc.sva, 1e-12, 'sva' );
	assert.equal( info, tc.info, 'info' );
});

test( 'dgsvj1: invalid jobv returns -1', function t() {
	const info = dgsvj1( 'bogus', 1, 1, 0, new Float64Array( 1 ), 1, 1, 0, new Float64Array( 1 ), 1, 0, new Float64Array( 1 ), 1, 0, 0, new Float64Array( 1 ), 1, 1, 0, EPS, SFMIN, TOL, 1, new Float64Array( 1 ), 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, -1 );
});

test( 'dgsvj1: negative M returns -2', function t() {
	const info = dgsvj1( 'no-v', -1, 1, 0, new Float64Array( 1 ), 1, 1, 0, new Float64Array( 1 ), 1, 0, new Float64Array( 1 ), 1, 0, 0, new Float64Array( 1 ), 1, 1, 0, EPS, SFMIN, TOL, 1, new Float64Array( 1 ), 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, -2 );
});

test( 'dgsvj1: N > M returns -3', function t() {
	const info = dgsvj1( 'no-v', 2, 3, 0, new Float64Array( 6 ), 1, 2, 0, new Float64Array( 3 ), 1, 0, new Float64Array( 3 ), 1, 0, 0, new Float64Array( 1 ), 1, 1, 0, EPS, SFMIN, TOL, 1, new Float64Array( 2 ), 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, -3 );
});

test( 'dgsvj1: negative n1 returns -4', function t() {
	const info = dgsvj1( 'no-v', 2, 2, -1, new Float64Array( 4 ), 1, 2, 0, new Float64Array( 2 ), 1, 0, new Float64Array( 2 ), 1, 0, 0, new Float64Array( 1 ), 1, 1, 0, EPS, SFMIN, TOL, 1, new Float64Array( 2 ), 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, -4 );
});

test( 'dgsvj1: negative mv with rsvec returns -15', function t() {
	const info = dgsvj1( 'apply-v', 2, 2, 1, new Float64Array( 4 ), 1, 2, 0, new Float64Array( 2 ), 1, 0, new Float64Array( 2 ), 1, 0, -1, new Float64Array( 4 ), 1, 2, 0, EPS, SFMIN, TOL, 1, new Float64Array( 2 ), 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, -15 );
});

test( 'dgsvj1: tol <= eps returns -21', function t() {
	const info = dgsvj1( 'no-v', 2, 2, 1, new Float64Array( 4 ), 1, 2, 0, new Float64Array( 2 ), 1, 0, new Float64Array( 2 ), 1, 0, 0, new Float64Array( 1 ), 1, 1, 0, EPS, SFMIN, EPS, 1, new Float64Array( 2 ), 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, -21 );
});

test( 'dgsvj1: negative nsweep returns -24', function t() {
	const info = dgsvj1( 'no-v', 2, 2, 1, new Float64Array( 4 ), 1, 2, 0, new Float64Array( 2 ), 1, 0, new Float64Array( 2 ), 1, 0, 0, new Float64Array( 1 ), 1, 1, 0, EPS, SFMIN, TOL, -1, new Float64Array( 2 ), 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, -24 );
});

test( 'dgsvj1: undersized work returns -28', function t() {
	const info = dgsvj1( 'no-v', 2, 2, 1, new Float64Array( 4 ), 1, 2, 0, new Float64Array( 2 ), 1, 0, new Float64Array( 2 ), 1, 0, 0, new Float64Array( 1 ), 1, 1, 0, EPS, SFMIN, TOL, 1, new Float64Array( 1 ), 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, -28 );
});
