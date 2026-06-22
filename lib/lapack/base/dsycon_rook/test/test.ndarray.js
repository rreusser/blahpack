/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import dsyconRook from './../lib/ndarray.js';


// FIXTURES //

var fixtureDir = path.join( import.meta.dirname, '..', '..', '..', '..', '..', 'test', 'fixtures' ); // eslint-disable-line max-len
var lines = readFileSync( path.join( fixtureDir, 'dsycon_rook.jsonl' ), 'utf8' ).trim().split( '\n' ); // eslint-disable-line node/no-sync, max-len
var fixture = lines.map( parse );


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
	var relErr = Math.abs( actual - expected ) / Math.max( Math.abs( expected ), 1.0 ); // eslint-disable-line max-len
	assert.ok( relErr <= tol, msg + ': expected ' + expected + ', got ' + actual + ' (relErr=' + relErr + ')' ); // eslint-disable-line max-len
}

/**
* Converts a Fortran 1-based IPIV array to JS 0-based Int32Array. Positive values are decremented; negative (2x2 block) values are kept as-is (the encoding is identical: Fortran `-p` = JS `~(p-1)`).
*
* @private
* @param {Array} ipiv - Fortran IPIV
* @returns {Int32Array} JS IPIV
*/
function convertIpiv( ipiv ) {
	var out;
	var i;
	out = new Int32Array( ipiv.length );
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
* Runs dsycon_rook against a fixture case and verifies anorm, rcond, info.
*
* @private
* @param {string} uplo - matrix triangle
* @param {NonNegativeInteger} N - matrix order
* @param {Object} tc - fixture case
* @param {number} tol - tolerance
*/
function runCase( uplo, N, tc, tol ) {
	var rcond;
	var iwork;
	var ipiv;
	var work;
	var info;
	var A;
	A = new Float64Array( tc.A );
	ipiv = convertIpiv( tc.ipiv );
	work = new Float64Array( 2 * N );
	iwork = new Int32Array( N );
	rcond = new Float64Array( 1 );
	info = dsyconRook( uplo, N, A, 1, N, 0, ipiv, 1, 0, tc.anorm, rcond, work, 1, 0, iwork, 1, 0 ); // eslint-disable-line max-len
	assert.strictEqual( info, tc.info, 'info' );
	assertClose( rcond[ 0 ], tc.rcond, tol, 'rcond' );
}


// TESTS //

test( 'dsycon_rook: main export is a function', function t() {
	assert.strictEqual( typeof dsyconRook, 'function' );
});

test( 'dsycon_rook: well-conditioned 3x3 (upper)', function t() {
	runCase( 'upper', 3, findCase( 'upper_well_cond' ), 1e-10 );
});

test( 'dsycon_rook: well-conditioned 3x3 (lower)', function t() {
	runCase( 'lower', 3, findCase( 'lower_well_cond' ), 1e-10 );
});

test( 'dsycon_rook: 4x4 indefinite (upper)', function t() {
	runCase( 'upper', 4, findCase( '4x4_indef_upper' ), 1e-10 );
});

test( 'dsycon_rook: 4x4 indefinite (lower)', function t() {
	runCase( 'lower', 4, findCase( '4x4_indef_lower' ), 1e-10 );
});

test( 'dsycon_rook: identity 3x3 (upper, rcond=1)', function t() {
	runCase( 'upper', 3, findCase( 'identity_upper' ), 1e-10 );
});

test( 'dsycon_rook: ill-conditioned 3x3 (upper)', function t() {
	runCase( 'upper', 3, findCase( 'ill_cond_upper' ), 1e-10 );
});

test( 'dsycon_rook: N=1 (upper)', function t() {
	runCase( 'upper', 1, findCase( 'n_one_upper' ), 1e-10 );
});

test( 'dsycon_rook: 4x4 SPD (lower)', function t() {
	runCase( 'lower', 4, findCase( '4x4_spd_lower' ), 1e-10 );
});

test( 'dsycon_rook: N=0 returns rcond=1', function t() {
	var rcond;
	var iwork;
	var ipiv;
	var work;
	var info;
	var A;
	A = new Float64Array( 1 );
	ipiv = new Int32Array( 1 );
	work = new Float64Array( 1 );
	iwork = new Int32Array( 1 );
	rcond = new Float64Array( 1 );
	info = dsyconRook( 'upper', 0, A, 1, 1, 0, ipiv, 1, 0, 0.0, rcond, work, 1, 0, iwork, 1, 0 );
	assert.strictEqual( info, 0 );
	assert.strictEqual( rcond[ 0 ], 1.0 );
});

test( 'dsycon_rook: anorm=0 returns rcond=0', function t() {
	var rcond;
	var iwork;
	var ipiv;
	var work;
	var info;
	var A;
	A = new Float64Array( [ 1.0, 0.0, 0.0, 1.0 ] );
	ipiv = new Int32Array( [ 0, 1 ] );
	work = new Float64Array( 4 );
	iwork = new Int32Array( 2 );
	rcond = new Float64Array( 1 );
	info = dsyconRook( 'upper', 2, A, 1, 2, 0, ipiv, 1, 0, 0.0, rcond, work, 1, 0, iwork, 1, 0 );
	assert.strictEqual( info, 0 );
	assert.strictEqual( rcond[ 0 ], 0.0 );
});

test( 'dsycon_rook: singular D returns rcond=0 (upper)', function t() {
	// D has a zero on diagonal at position 0 with 1x1 pivot — fake factored form
	var rcond;
	var iwork;
	var ipiv;
	var work;
	var info;
	var A;
	A = new Float64Array( [ 0.0, 0.0, 0.0, 1.0 ] );
	ipiv = new Int32Array( [ 0, 1 ] );
	work = new Float64Array( 4 );
	iwork = new Int32Array( 2 );
	rcond = new Float64Array( 1 );
	info = dsyconRook( 'upper', 2, A, 1, 2, 0, ipiv, 1, 0, 1.0, rcond, work, 1, 0, iwork, 1, 0 );
	assert.strictEqual( info, 0 );
	assert.strictEqual( rcond[ 0 ], 0.0 );
});

test( 'dsycon_rook: singular D returns rcond=0 (lower)', function t() {
	var rcond;
	var iwork;
	var ipiv;
	var work;
	var info;
	var A;
	A = new Float64Array( [ 1.0, 0.0, 0.0, 0.0 ] );
	ipiv = new Int32Array( [ 0, 1 ] );
	work = new Float64Array( 4 );
	iwork = new Int32Array( 2 );
	rcond = new Float64Array( 1 );
	info = dsyconRook( 'lower', 2, A, 1, 2, 0, ipiv, 1, 0, 1.0, rcond, work, 1, 0, iwork, 1, 0 );
	assert.strictEqual( info, 0 );
	assert.strictEqual( rcond[ 0 ], 0.0 );
});

test( 'dsycon_rook: invalid uplo throws', function t() {
	var rcond;
	var iwork;
	var ipiv;
	var work;
	var A;
	A = new Float64Array( 1 );
	ipiv = new Int32Array( 1 );
	work = new Float64Array( 2 );
	iwork = new Int32Array( 1 );
	rcond = new Float64Array( 1 );
	assert.throws( function bad() {
		dsyconRook( 'bogus', 1, A, 1, 1, 0, ipiv, 1, 0, 1.0, rcond, work, 1, 0, iwork, 1, 0 ); // eslint-disable-line max-len
	}, TypeError );
});

test( 'dsycon_rook: negative N throws', function t() {
	var rcond;
	var iwork;
	var ipiv;
	var work;
	var A;
	A = new Float64Array( 1 );
	ipiv = new Int32Array( 1 );
	work = new Float64Array( 2 );
	iwork = new Int32Array( 1 );
	rcond = new Float64Array( 1 );
	assert.throws( function bad() {
		dsyconRook( 'upper', -1, A, 1, 1, 0, ipiv, 1, 0, 1.0, rcond, work, 1, 0, iwork, 1, 0 ); // eslint-disable-line max-len
	}, RangeError );
});
