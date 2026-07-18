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
import ndarrayFn from './../lib/ndarray.js';


// FIXTURES //

const fixtureDir = path.join( import.meta.dirname, '..', '..', '..', '..', '..', 'test', 'fixtures' );
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
	assert.ok( err <= tol, msg + ': expected ' + expected + ', got ' + actual + ' (err=' + err + ')' );
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
* Computes initial column norms of an `M x N` column-major matrix.
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

test( 'ndarray is a function', function t() {
	assert.strictEqual( typeof ndarrayFn, 'function', 'is a function' );
});

test( 'ndarray: throws TypeError for invalid jobv', function t() {
	assert.throws( function throws() {
		ndarrayFn( 'invalid', 2, 2, 1, new Float64Array( 4 ), 1, 2, 0, new Float64Array( 2 ), 1, 0, new Float64Array( 2 ), 1, 0, 0, new Float64Array( 1 ), 1, 1, 0, EPS, SFMIN, TOL, 1, new Float64Array( 2 ), 1, 0 );
	}, TypeError );
});

test( 'ndarray: matches fixture novec_4x3_n1_1 on unit stride', function t() {
	const tc = findCase( 'novec_4x3_n1_1' );
	const M = 4;
	const N = 3;
	const a = new Float64Array( [ 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12 ] );
	const d = new Float64Array( [ 1, 1, 1 ] );
	const sva = initialSva( a, M, N );
	const V = new Float64Array( 1 );
	const work = new Float64Array( M );
	const info = ndarrayFn( 'no-v', M, N, 1, a, 1, M, 0, d, 1, 0, sva, 1, 0, 0, V, 1, 1, 0, EPS, SFMIN, TOL, 5, work, 1, 0 );
	assertArrayClose( a, tc.a, 1e-12, 'a' );
	assertArrayClose( d, tc.d, 1e-12, 'd' );
	assertArrayClose( sva, tc.sva, 1e-12, 'sva' );
	assert.equal( info, tc.info, 'info' );
});

test( 'ndarray: honors offsetA into a larger A buffer (apply_4x3_n1_1)', function t() {
	let i;
	const tc = findCase( 'apply_4x3_n1_1' );
	const M = 4;
	const N = 3;
	const padA = 7;
	const a = new Float64Array( padA + ( M * N ) );
	const src = [ 2, 1, 0, 0, 1, 2, 1, 0, 0, 1, 2, 1 ];
	for ( i = 0; i < src.length; i++ ) {
		a[ padA + i ] = src[ i ];
	}
	const d = new Float64Array( [ 1, 1, 1 ] );
	const sva = new Float64Array( [ Math.sqrt( 5 ), Math.sqrt( 6 ), Math.sqrt( 6 ) ] );
	const V = new Float64Array( 9 );
	V[ 0 ] = 1;
	V[ 4 ] = 1;
	V[ 8 ] = 1;
	const work = new Float64Array( M );
	const info = ndarrayFn( 'apply-v', M, N, 1, a, 1, M, padA, d, 1, 0, sva, 1, 0, 3, V, 1, 3, 0, EPS, SFMIN, TOL, 3, work, 1, 0 );
	const aView = new Float64Array( M * N );
	for ( i = 0; i < M * N; i++ ) {
		aView[ i ] = a[ padA + i ];
	}
	assertArrayClose( aView, tc.a, 1e-12, 'a' );
	assertArrayClose( V, tc.v, 1e-12, 'v' );
	assertArrayClose( d, tc.d, 1e-12, 'd' );
	assertArrayClose( sva, tc.sva, 1e-12, 'sva' );
	assert.equal( info, tc.info, 'info' );
	for ( i = 0; i < padA; i++ ) {
		assert.equal( a[ i ], 0, 'pad[' + i + '] untouched' );
	}
});

test( 'ndarray: non-unit strideD and strideSVA with offsets', function t() {
	let i;
	const tc = findCase( 'novec_4x3_n1_1' );
	const M = 4;
	const N = 3;
	const a = new Float64Array( [ 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12 ] );
	const d = new Float64Array( 1 + ( N * 2 ) );
	for ( i = 0; i < N; i++ ) {
		d[ 1 + ( i * 2 ) ] = 1;
	}
	const sva = new Float64Array( 2 + ( N * 3 ) );
	const sv0 = initialSva( a, M, N );
	for ( i = 0; i < N; i++ ) {
		sva[ 2 + ( i * 3 ) ] = sv0[ i ];
	}
	const V = new Float64Array( 1 );
	const work = new Float64Array( M );
	const info = ndarrayFn( 'no-v', M, N, 1, a, 1, M, 0, d, 2, 1, sva, 3, 2, 0, V, 1, 1, 0, EPS, SFMIN, TOL, 5, work, 1, 0 );
	assertArrayClose( a, tc.a, 1e-12, 'a' );
	for ( i = 0; i < N; i++ ) {
		assertClose( d[ 1 + ( i * 2 ) ], tc.d[ i ], 1e-12, 'd[' + i + ']' );
		assertClose( sva[ 2 + ( i * 3 ) ], tc.sva[ i ], 1e-12, 'sva[' + i + ']' );
	}
	assert.equal( d[ 0 ], 0, 'd[0] untouched' );
	assert.equal( sva[ 0 ], 0, 'sva[0] untouched' );
	assert.equal( sva[ 1 ], 0, 'sva[1] untouched' );
	assert.equal( info, tc.info, 'info' );
});

test( 'ndarray: non-unit work stride with offset (novec_4x3_n1_1)', function t() {
	let i;
	const tc = findCase( 'novec_4x3_n1_1' );
	const M = 4;
	const N = 3;
	const a = new Float64Array( [ 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12 ] );
	const d = new Float64Array( [ 1, 1, 1 ] );
	const sva = initialSva( a, M, N );
	const V = new Float64Array( 1 );
	const work = new Float64Array( 3 + ( M * 2 ) );
	for ( i = 0; i < work.length; i++ ) {
		work[ i ] = -7;
	}
	const info = ndarrayFn( 'no-v', M, N, 1, a, 1, M, 0, d, 1, 0, sva, 1, 0, 0, V, 1, 1, 0, EPS, SFMIN, TOL, 5, work, 2, 3 );
	assertArrayClose( a, tc.a, 1e-12, 'a' );
	assertArrayClose( d, tc.d, 1e-12, 'd' );
	assertArrayClose( sva, tc.sva, 1e-12, 'sva' );
	assert.equal( info, tc.info, 'info' );
	assert.equal( work[ 0 ], -7, 'work[0] untouched' );
	assert.equal( work[ 1 ], -7, 'work[1] untouched' );
	assert.equal( work[ 2 ], -7, 'work[2] untouched' );
});

test( 'ndarray: offsetV into a larger V buffer (vec_5x4_n1_2)', function t() {
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
	const padV = 5;
	const V = new Float64Array( padV + ( N * N ) );
	V[ padV + 0 ] = 1;
	V[ padV + 5 ] = 1;
	V[ padV + 10 ] = 1;
	V[ padV + 15 ] = 1;
	const work = new Float64Array( M );
	const info = ndarrayFn( 'compute-v', M, N, 2, a, 1, M, 0, d, 1, 0, sva, 1, 0, 0, V, 1, N, padV, EPS, SFMIN, TOL, 5, work, 1, 0 );
	assertArrayClose( a, tc.a, 1e-11, 'a' );
	assertArrayClose( d, tc.d, 1e-11, 'd' );
	assertArrayClose( sva, tc.sva, 1e-11, 'sva' );
	assert.equal( info, tc.info, 'info' );
	const vView = new Float64Array( N * N );
	for ( i = 0; i < N * N; i++ ) {
		vView[ i ] = V[ padV + i ];
	}
	assertArrayClose( vView, tc.v, 1e-11, 'v' );
	for ( i = 0; i < padV; i++ ) {
		assert.equal( V[ i ], 0, 'V pad[' + i + '] untouched' );
	}
});
