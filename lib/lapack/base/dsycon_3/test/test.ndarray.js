/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import path from 'node:path';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import dsycon3 from './../lib/ndarray.js';


// FIXTURES //

var fixtureDir = path.join( import.meta.dirname, '..', '..', '..', '..', '..', 'test', 'fixtures' );
var rawLines = readFileSync( path.join( fixtureDir, 'dsycon_3.jsonl' ), 'utf8' ).trim().split( '\n' ); // eslint-disable-line node/no-sync, max-len
var fixtures = rawLines.map( parseLine );


// FUNCTIONS //

/**
* Parses a JSON line.
*
* @private
* @param {string} line - JSONL line
* @returns {Object} parsed object
*/
function parseLine( line ) {
	return JSON.parse( line );
}


// FUNCTIONS //

/**
* Locates a fixture case by name.
*
* @private
* @param {string} name - case name
* @returns {Object} fixture record
*/
function findCase( name ) {
	return fixtures.find( function find( t ) {
		return t.name === name;
	});
}

/**
* Asserts two scalars are close in relative error.
*
* @private
* @param {number} actual - actual value
* @param {number} expected - expected value
* @param {number} tol - tolerance
* @param {string} msg - assertion message
*/
function assertClose( actual, expected, tol, msg ) {
	var relErr = Math.abs( actual - expected ) / Math.max( Math.abs( expected ), 1.0 );
	assert.ok( relErr <= tol, msg + ': expected ' + expected + ', got ' + actual + ' (relErr=' + relErr + ')' ); // eslint-disable-line max-len
}

/**
* Translates a Fortran 1-based IPIV array (with negative encoding for 2x2 pivots) to JS 0-based form.
*
* @private
* @param {Array} ipivF - Fortran IPIV
* @returns {Int32Array} JS IPIV
*/
function ipivFromFortran( ipivF ) {
	var out;
	var v;
	var i;
	out = new Int32Array( ipivF.length );
	for ( i = 0; i < ipivF.length; i += 1 ) {
		v = ipivF[ i ];
		if ( v > 0 ) {
			out[ i ] = v - 1;
		} else {
			// Fortran `-p` (1-based) -> JS `~(p-1)` which is `-p` numerically.
			out[ i ] = v;
		}
	}
	return out;
}

/**
* Runs a fixture-driven test.
*
* @private
* @param {string} name - case name
* @param {string} uplo - `'upper'` or `'lower'`
* @param {NonNegativeInteger} N - matrix order
* @param {number} tol - tolerance
*/
function runCase( name, uplo, N, tol ) {
	var rcond;
	var iwork;
	var ipiv;
	var work;
	var info;
	var tc;
	var A;
	var e;

	tc = findCase( name );
	A = new Float64Array( tc.a );
	e = new Float64Array( tc.e );
	ipiv = ipivFromFortran( tc.ipiv );
	work = new Float64Array( 2 * N );
	iwork = new Int32Array( N );
	rcond = new Float64Array( 1 );
	info = dsycon3( uplo, N, A, 1, N, 0, e, 1, 0, ipiv, 1, 0, tc.anorm, rcond, work, 1, 0, iwork, 1, 0 ); // eslint-disable-line max-len
	assert.strictEqual( info, 0, name + ': info' );
	assertClose( rcond[ 0 ], tc.rcond, tol, name + ': rcond' );
}


// TESTS //

test( 'dsycon3: 4x4 well-conditioned (upper)', function t() {
	runCase( '4x4_upper_well', 'upper', 4, 1e-12 );
});

test( 'dsycon3: 4x4 well-conditioned (lower)', function t() {
	runCase( '4x4_lower_well', 'lower', 4, 1e-12 );
});

test( 'dsycon3: 3x3 identity (upper)', function t() {
	runCase( 'identity_upper', 'upper', 3, 1e-12 );
});

test( 'dsycon3: 3x3 identity (lower)', function t() {
	runCase( 'identity_lower', 'lower', 3, 1e-12 );
});

test( 'dsycon3: ill-conditioned (upper)', function t() {
	runCase( 'ill_cond_upper', 'upper', 3, 1e-10 );
});

test( 'dsycon3: indefinite forces 2x2 pivots (lower)', function t() {
	runCase( 'indef_lower', 'lower', 4, 1e-12 );
});

test( 'dsycon3: indefinite (upper)', function t() {
	runCase( 'indef_upper', 'upper', 4, 1e-12 );
});

test( 'dsycon3: N=0 quick return returns rcond=1', function t() {
	var rcond;
	var info;
	rcond = new Float64Array( 1 );
	info = dsycon3( 'upper', 0, new Float64Array( 0 ), 1, 1, 0, new Float64Array( 0 ), 1, 0, new Int32Array( 0 ), 1, 0, 0.0, rcond, new Float64Array( 0 ), 1, 0, new Int32Array( 0 ), 1, 0 ); // eslint-disable-line max-len
	assert.strictEqual( info, 0, 'info' );
	assert.strictEqual( rcond[ 0 ], 1.0, 'rcond' );
});

test( 'dsycon3: N=1 (upper)', function t() {
	runCase( 'n_one_upper', 'upper', 1, 1e-12 );
});

test( 'dsycon3: anorm=0 returns rcond=0', function t() {
	var rcond;
	var iwork;
	var info;
	var ipiv;
	var work;
	var tc;
	var A;
	var e;
	tc = findCase( 'anorm_zero' );
	A = new Float64Array( tc.a );
	e = new Float64Array( tc.e );
	ipiv = ipivFromFortran( tc.ipiv );
	work = new Float64Array( 6 );
	iwork = new Int32Array( 3 );
	rcond = new Float64Array( 1 );
	info = dsycon3( 'upper', 3, A, 1, 3, 0, e, 1, 0, ipiv, 1, 0, 0.0, rcond, work, 1, 0, iwork, 1, 0 ); // eslint-disable-line max-len
	assert.strictEqual( info, 0, 'info' );
	assert.strictEqual( rcond[ 0 ], 0.0, 'rcond' );
});

test( 'dsycon3: singular D returns rcond=0 (upper)', function t() {
	var rcond;
	var iwork;
	var info;
	var ipiv;
	var work;
	var A;
	var e;

	// Construct a "factorized" matrix where IPIV[i] >= 0 and A[i,i] = 0 to trigger the singular-D early return.
	A = new Float64Array( [ 1.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0 ] );
	e = new Float64Array( 3 );
	ipiv = new Int32Array( [ 0, 1, 2 ] );
	work = new Float64Array( 6 );
	iwork = new Int32Array( 3 );
	rcond = new Float64Array( [ 999.0 ] );
	info = dsycon3( 'upper', 3, A, 1, 3, 0, e, 1, 0, ipiv, 1, 0, 1.0, rcond, work, 1, 0, iwork, 1, 0 ); // eslint-disable-line max-len
	assert.strictEqual( info, 0, 'info' );
	assert.strictEqual( rcond[ 0 ], 0.0, 'rcond' );
});

test( 'dsycon3: singular D returns rcond=0 (lower)', function t() {
	var rcond;
	var iwork;
	var info;
	var ipiv;
	var work;
	var A;
	var e;
	A = new Float64Array( [ 1.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0 ] );
	e = new Float64Array( 3 );
	ipiv = new Int32Array( [ 0, 1, 2 ] );
	work = new Float64Array( 6 );
	iwork = new Int32Array( 3 );
	rcond = new Float64Array( [ 999.0 ] );

	// `A[1,1] = 0` (already), and `IPIV[1] >= 0` triggers the singular branch.
	info = dsycon3( 'lower', 3, A, 1, 3, 0, e, 1, 0, ipiv, 1, 0, 1.0, rcond, work, 1, 0, iwork, 1, 0 ); // eslint-disable-line max-len
	assert.strictEqual( info, 0, 'info' );
	assert.strictEqual( rcond[ 0 ], 0.0, 'rcond' );
});
