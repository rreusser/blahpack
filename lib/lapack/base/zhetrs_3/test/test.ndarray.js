/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import path from 'node:path';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import zhetrs3 from './../lib/ndarray.js';


// FIXTURES //

const fixtureDir = path.join( import.meta.dirname, '..', '..', '..', '..', '..', 'test', 'fixtures' ); // eslint-disable-line max-len
const lines = readFileSync( path.join( fixtureDir, 'zhetrs_3.jsonl' ), 'utf8' ).trim().split( '\n' ); // eslint-disable-line node/no-sync, max-len
const fixture = lines.map( function parse( line ) {
	return JSON.parse( line );
});

const NMAX = 6;


// FUNCTIONS //

/**
* Find a fixture by name.
*
* @private
* @param {string} name - test case name
* @returns {Object} fixture entry
*/
function findCase( name ) {
	return fixture.find( function find( t ) {
		return t.name === name;
	});
}

/**
* Converts a Fortran 1-based IPIV array into the JS bitwise-NOT convention.
*
* @private
* @param {Array<number>} ipivF - Fortran 1-based pivot array
* @returns {Int32Array} JS-convention pivot array
*/
function convertIpiv( ipivF ) {
	let i;
	const out = new Int32Array( ipivF.length );
	for ( i = 0; i < ipivF.length; i++ ) {
		out[ i ] = ( ipivF[ i ] > 0 ) ? ( ipivF[ i ] - 1 ) : ipivF[ i ];
	}
	return out;
}

/**
* Build a Complex128Array from an interleaved Float64 array.
*
* @private
* @param {Array<number>} re - interleaved real/imaginary doubles
* @returns {Complex128Array} complex array
*/
function toComplex( re ) {
	return new Complex128Array( re );
}

/**
* Asserts approximate scalar equality with relative tolerance.
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
* Asserts approximate element-wise equality between two interleaved complex arrays.
*
* @private
* @param {*} actual - actual interleaved Float64 view
* @param {Array<number>} expected - expected interleaved doubles
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
* Run a single fixture-driven test.
*
* @private
* @param {string} uplo - matrix triangle
* @param {Object} tc - fixture entry
*/
function runFixture( uplo, tc ) {

	const n = tc.n;
	const nrhs = tc.nrhs;
	const A = toComplex( tc.A_factored );
	const e = toComplex( tc.e );
	const ipiv = convertIpiv( tc.ipiv );
	const B = toComplex( tc.b );

	// Fortran printed `2*NMAX*n` doubles, i.e. the matrix is stored with leading dimension NMAX, not n. Use strideA2 = NMAX (in complex elements) accordingly.
	const info = zhetrs3( uplo, n, nrhs, A, 1, NMAX, 0, e, 1, 0, ipiv, 1, 0, B, 1, NMAX, 0 );
	assert.equal( info, tc.info, 'info' );

	// Compare the interleaved Float64 view against the fixture x.
	const Bv = new Float64Array( B.buffer, B.byteOffset, 2 * NMAX * nrhs );
	assertArrayClose( Bv, tc.x, 1e-12, 'x' );
}


// TESTS //

test( 'zhetrs3: upper 4x4 1 rhs', function t() {
	runFixture( 'upper', findCase( 'upper_4x4_1rhs' ) );
});

test( 'zhetrs3: lower 4x4 2 rhs', function t() {
	runFixture( 'lower', findCase( 'lower_4x4_2rhs' ) );
});

test( 'zhetrs3: N=0 quick return', function t() {
	const ipiv = new Int32Array( 1 );
	const A = new Complex128Array( 1 );
	const B = new Complex128Array( 1 );
	const e = new Complex128Array( 1 );
	const info = zhetrs3( 'upper', 0, 1, A, 1, 1, 0, e, 1, 0, ipiv, 1, 0, B, 1, 1, 0 );
	assert.equal( info, 0, 'info' );
});

test( 'zhetrs3: NRHS=0 quick return', function t() {
	const ipiv = new Int32Array( 3 );
	const A = new Complex128Array( 9 );
	const B = new Complex128Array( 3 );
	const e = new Complex128Array( 3 );
	const info = zhetrs3( 'upper', 3, 0, A, 1, 3, 0, e, 1, 0, ipiv, 1, 0, B, 1, 3, 0 );
	assert.equal( info, 0, 'info' );
});

test( 'zhetrs3: N=1 upper', function t() {
	runFixture( 'upper', findCase( 'n1' ) );
});

test( 'zhetrs3: lower 6x6 mixed pivots', function t() {
	runFixture( 'lower', findCase( 'lower_6x6' ) );
});

test( 'zhetrs3: upper 6x6 mixed pivots', function t() {
	runFixture( 'upper', findCase( 'upper_6x6' ) );
});

test( 'zhetrs3: throws TypeError on invalid uplo', function t() {
	let ipiv, A, B, e;
	ipiv = new Int32Array( 1 );
	A = new Complex128Array( 1 );
	B = new Complex128Array( 1 );
	e = new Complex128Array( 1 );
	assert.throws( function fn() {
		zhetrs3( 'invalid', 1, 1, A, 1, 1, 0, e, 1, 0, ipiv, 1, 0, B, 1, 1, 0 );
	}, TypeError );
});

test( 'zhetrs3: throws RangeError on negative N', function t() {
	let ipiv, A, B, e;
	ipiv = new Int32Array( 1 );
	A = new Complex128Array( 1 );
	B = new Complex128Array( 1 );
	e = new Complex128Array( 1 );
	assert.throws( function fn() {
		zhetrs3( 'upper', -1, 1, A, 1, 1, 0, e, 1, 0, ipiv, 1, 0, B, 1, 1, 0 );
	}, RangeError );
});

test( 'zhetrs3: throws RangeError on negative nrhs', function t() {
	let ipiv, A, B, e;
	ipiv = new Int32Array( 1 );
	A = new Complex128Array( 1 );
	B = new Complex128Array( 1 );
	e = new Complex128Array( 1 );
	assert.throws( function fn() {
		zhetrs3( 'upper', 1, -1, A, 1, 1, 0, e, 1, 0, ipiv, 1, 0, B, 1, 1, 0 );
	}, RangeError );
});
