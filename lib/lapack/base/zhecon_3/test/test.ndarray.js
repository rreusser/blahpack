/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import path from 'node:path';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import assert from 'node:assert/strict';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import zhecon3 from './../lib/ndarray.js';


// FIXTURES //

var fixtureDir = path.join( import.meta.dirname, '..', '..', '..', '..', '..', 'test', 'fixtures' );
var rawLines = readFileSync( path.join( fixtureDir, 'zhecon_3.jsonl' ), 'utf8' ).trim().split( '\n' ); // eslint-disable-line node/no-sync, max-len
var fixtures = rawLines.map( parseLine );


// FUNCTIONS //

/**
* Parses a JSONL line.
*
* @private
* @param {string} line - JSONL line
* @returns {Object} parsed object
*/
function parseLine( line ) {
	return JSON.parse( line );
}

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
* Translates a Fortran 1-based IPIV array to JS 0-based form.
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
* @param {number} tol - tolerance
*/
function runCase( name, uplo, tol ) {
	var rcond;
	var ipiv;
	var work;
	var info;
	var lda;
	var tc;
	var Af;
	var ef;
	var A;
	var e;
	var N;

	tc = findCase( name );
	N = tc.n;
	lda = tc.lda;
	Af = new Float64Array( tc.A_factored );
	ef = new Float64Array( tc.e );
	A = new Complex128Array( Af.buffer );
	e = new Complex128Array( ef.buffer );
	ipiv = ipivFromFortran( tc.ipiv );
	work = new Complex128Array( 2 * N );
	rcond = new Float64Array( 1 );

	// `A` is column-major with leading dimension `lda` (complex elements). `strideA1=1`, `strideA2=lda`.
	info = zhecon3( uplo, N, A, 1, lda, 0, e, 1, 0, ipiv, 1, 0, tc.anorm, rcond, work, 1, 0 );
	assert.strictEqual( info, 0, name + ': info' );
	assertClose( rcond[ 0 ], tc.rcond, tol, name + ': rcond' );
}


// TESTS //

test( 'zhecon3: 4x4 well-conditioned (upper)', function t() {
	runCase( 'upper_4x4', 'upper', 1e-12 );
});

test( 'zhecon3: 4x4 well-conditioned (lower)', function t() {
	runCase( 'lower_4x4', 'lower', 1e-12 );
});

test( 'zhecon3: 3x3 identity (upper)', function t() {
	runCase( 'identity_upper', 'upper', 1e-12 );
});

test( 'zhecon3: 3x3 identity (lower)', function t() {
	runCase( 'identity_lower', 'lower', 1e-12 );
});

test( 'zhecon3: indefinite (upper)', function t() {
	runCase( 'indef_upper', 'upper', 1e-12 );
});

test( 'zhecon3: N=0 quick return returns rcond=1', function t() {
	var rcond;
	var info;
	rcond = new Float64Array( 1 );
	info = zhecon3( 'upper', 0, new Complex128Array( 0 ), 1, 1, 0, new Complex128Array( 0 ), 1, 0, new Int32Array( 0 ), 1, 0, 0.0, rcond, new Complex128Array( 0 ), 1, 0 ); // eslint-disable-line max-len
	assert.strictEqual( info, 0, 'info' );
	assert.strictEqual( rcond[ 0 ], 1.0, 'rcond' );
});

test( 'zhecon3: N=1 (upper)', function t() {
	runCase( 'n_one_upper', 'upper', 1e-12 );
});

test( 'zhecon3: anorm=0 returns rcond=0', function t() {
	var rcond;
	var ipiv;
	var work;
	var info;
	var A;
	var e;
	A = new Complex128Array( [ 1.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0 ] );
	e = new Complex128Array( 3 );
	ipiv = new Int32Array( [ 0, 1, 2 ] );
	work = new Complex128Array( 6 );
	rcond = new Float64Array( [ 99.0 ] );
	info = zhecon3( 'upper', 3, A, 1, 3, 0, e, 1, 0, ipiv, 1, 0, 0.0, rcond, work, 1, 0 ); // eslint-disable-line max-len
	assert.strictEqual( info, 0, 'info' );
	assert.strictEqual( rcond[ 0 ], 0.0, 'rcond' );
});

test( 'zhecon3: singular D returns rcond=0 (upper)', function t() {
	var rcond;
	var ipiv;
	var work;
	var info;
	var A;
	var e;

	// `A[0,0] = 0` (real part), `IPIV[0] >= 0` triggers singular branch.
	A = new Complex128Array( 9 );
	e = new Complex128Array( 3 );
	ipiv = new Int32Array( [ 0, 1, 2 ] );
	work = new Complex128Array( 6 );
	rcond = new Float64Array( [ 99.0 ] );
	info = zhecon3( 'upper', 3, A, 1, 3, 0, e, 1, 0, ipiv, 1, 0, 1.0, rcond, work, 1, 0 ); // eslint-disable-line max-len
	assert.strictEqual( info, 0, 'info' );
	assert.strictEqual( rcond[ 0 ], 0.0, 'rcond' );
});

test( 'zhecon3: singular D returns rcond=0 (lower)', function t() {
	var rcond;
	var ipiv;
	var work;
	var info;
	var A;
	var e;
	A = new Complex128Array( 9 );
	e = new Complex128Array( 3 );
	ipiv = new Int32Array( [ 0, 1, 2 ] );
	work = new Complex128Array( 6 );
	rcond = new Float64Array( [ 99.0 ] );
	info = zhecon3( 'lower', 3, A, 1, 3, 0, e, 1, 0, ipiv, 1, 0, 1.0, rcond, work, 1, 0 ); // eslint-disable-line max-len
	assert.strictEqual( info, 0, 'info' );
	assert.strictEqual( rcond[ 0 ], 0.0, 'rcond' );
});
