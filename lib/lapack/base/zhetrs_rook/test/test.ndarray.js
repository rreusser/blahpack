/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import zhetrsRook from './../lib/ndarray.js';


// FIXTURES //

const fixtureDir = path.join( import.meta.dirname, '..', '..', '..', '..', '..', 'test', 'fixtures' ); // eslint-disable-line max-len
const lines = readFileSync( path.join( fixtureDir, 'zhetrs_rook.jsonl' ), 'utf8' ).trim().split( '\n' ); // eslint-disable-line node/no-sync, max-len
const fixture = lines.map( parse );


// FUNCTIONS //

/**
* Parses one JSONL line.
*
* @private
* @param {string} line - JSON line
* @returns {Object} parsed object
*/
function parse( line ) {
	return JSON.parse( line );
}

/**
* Locates a fixture case by name.
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
* Asserts that two numbers are approximately equal.
*
* @private
* @param {number} actual - actual value
* @param {number} expected - expected value
* @param {number} tol - tolerance
* @param {string} msg - assertion message
*/
function assertClose( actual, expected, tol, msg ) {
	const relErr = Math.abs( actual - expected ) / Math.max( Math.abs( expected ), 1.0 ); // eslint-disable-line max-len
	assert.ok( relErr <= tol, msg + ': expected ' + expected + ', got ' + actual );
}

/**
* Asserts two arrays are element-wise approximately equal.
*
* @private
* @param {Array} actual - actual values
* @param {Array} expected - expected values
* @param {number} tol - tolerance
* @param {string} msg - assertion message
*/
function assertArrayClose( actual, expected, tol, msg ) {
	let i;
	assert.equal( actual.length, expected.length, msg + ': length mismatch' );
	for ( i = 0; i < expected.length; i++ ) {
		assertClose( actual[ i ], expected[ i ], tol, msg + '[' + i + ']' );
	}
}

/**
* Converts a Fortran 1-based IPIV array to JS 0-based Int32Array. Positive values are decremented; negative entries (encoding 2x2 pivot blocks) are kept as-is (Fortran `-p` is numerically identical to JS `~(p-1)`).
*
* @private
* @param {Array} ipiv - Fortran IPIV values
* @returns {Int32Array} JS IPIV
*/
function convertIpiv( ipiv ) {
	let i;
	const out = new Int32Array( ipiv.length );
	for ( i = 0; i < ipiv.length; i++ ) {
		if ( ipiv[ i ] > 0 ) {
			out[ i ] = ipiv[ i ] - 1;
		} else {
			out[ i ] = ipiv[ i ];
		}
	}
	return out;
}

/**
* Runs a fixture case end-to-end and verifies the solved B matches the expected x.
*
* @private
* @param {string} uplo - matrix triangle
* @param {Object} tc - fixture case
*/
function runCase( uplo, tc ) {
	const N = tc.n;
	const nrhs = tc.nrhs;
	const lda = tc.lda;
	const A = new Complex128Array( tc.A_factored.length / 2 );
	reinterpret( A, 0 ).set( tc.A_factored );
	const B = new Complex128Array( tc.b.length / 2 );
	reinterpret( B, 0 ).set( tc.b );
	const IPIV = convertIpiv( tc.ipiv );
	const info = zhetrsRook( uplo, N, nrhs, A, 1, lda, 0, IPIV, 1, 0, B, 1, lda, 0 );
	assert.equal( info, tc.info, 'info' );
	const view = reinterpret( B, 0 );
	assertArrayClose( Array.prototype.slice.call( view ), tc.x, 1e-11, 'x' );
}


// TESTS //

test( 'zhetrs_rook: upper_4x4_1rhs', function t() {
	runCase( 'upper', findCase( 'upper_4x4_1rhs' ) );
});

test( 'zhetrs_rook: lower_4x4_2rhs', function t() {
	runCase( 'lower', findCase( 'lower_4x4_2rhs' ) );
});

test( 'zhetrs_rook: n0', function t() {
	const A = new Complex128Array( 1 );
	const b = new Complex128Array( 1 );
	const ipiv = new Int32Array( 1 );
	const info = zhetrsRook( 'upper', 0, 1, A, 1, 1, 0, ipiv, 1, 0, b, 1, 1, 0 );
	assert.equal( info, 0, 'info' );
});

test( 'zhetrs_rook: n1', function t() {
	runCase( 'upper', findCase( 'n1' ) );
});

test( 'zhetrs_rook: lower_6x6', function t() {
	runCase( 'lower', findCase( 'lower_6x6' ) );
});

test( 'zhetrs_rook: upper_6x6', function t() {
	runCase( 'upper', findCase( 'upper_6x6' ) );
});

test( 'zhetrs_rook: nrhs=0 quick return', function t() {
	const A = new Complex128Array( 9 );
	const b = new Complex128Array( 3 );
	const ipiv = new Int32Array( 3 );
	const info = zhetrsRook( 'lower', 3, 0, A, 1, 3, 0, ipiv, 1, 0, b, 1, 3, 0 );
	assert.equal( info, 0, 'info' );
});

test( 'zhetrs_rook: ndarray non-zero offset (upper_4x4)', function t() {
	let i;
	const tc = findCase( 'upper_4x4_1rhs' );
	const lda = tc.lda;
	const Ac = new Complex128Array( ( lda * 4 ) + 2 );
	const Bc = new Complex128Array( ( lda * 1 ) + 2 );
	const Av = reinterpret( Ac, 0 );
	const Bv = reinterpret( Bc, 0 );
	for ( i = 0; i < tc.A_factored.length; i++ ) {
		Av[ i + 4 ] = tc.A_factored[ i ];
	}
	for ( i = 0; i < tc.b.length; i++ ) {
		Bv[ i + 4 ] = tc.b[ i ];
	}
	const rawIpiv = convertIpiv( tc.ipiv );
	const IPIV = new Int32Array( tc.n + 2 );
	for ( i = 0; i < tc.n; i++ ) {
		IPIV[ i + 2 ] = rawIpiv[ i ];
	}
	const info = zhetrsRook( 'upper', tc.n, tc.nrhs, Ac, 1, lda, 2, IPIV, 1, 2, Bc, 1, lda, 2 );
	assert.equal( info, tc.info, 'info' );
	const view = reinterpret( Bc, 0 );
	assertArrayClose( Array.prototype.slice.call( view, 4 ), tc.x, 1e-11, 'x' );
});
