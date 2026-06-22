/* eslint-disable no-restricted-syntax, stdlib/first-unit-test, max-lines */

// MODULES //

import test from 'node:test';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import dsytf2rk from './../lib/ndarray.js';


// FIXTURES //

var fixtureDir = path.join( import.meta.dirname, '..', '..', '..', '..', '..', 'test', 'fixtures' );
var lines = readFileSync( path.join( fixtureDir, 'dsytf2_rk.jsonl' ), 'utf8' ).trim().split( '\n' ); // eslint-disable-line node/no-sync, max-len
var FIXTURES = lines.map( function parse( line ) {
	return JSON.parse( line );
});


// FUNCTIONS //

/**
* Finds a test case by name.
*
* @private
* @param {string} name - test case name
* @returns {Object} fixture object
*/
function findCase( name ) {
	var i;
	for ( i = 0; i < FIXTURES.length; i++ ) {
		if ( FIXTURES[ i ].name === name ) {
			return FIXTURES[ i ];
		}
	}
	return null;
}

/**
* Asserts two scalars are approximately equal.
*
* @private
* @param {number} actual - actual value
* @param {number} expected - expected value
* @param {number} tol - tolerance
* @param {string} msg - assertion message
*/
function assertClose( actual, expected, tol, msg ) {
	var relErr = Math.abs( actual - expected ) / Math.max( Math.abs( expected ), 1.0 ); // eslint-disable-line max-len
	assert.ok( relErr <= tol, msg + ': expected ' + expected + ', got ' + actual );
}

/**
* Asserts two arrays are element-wise approximately equal.
*
* @private
* @param {ArrayLikeObject} actual - actual array
* @param {ArrayLikeObject} expected - expected array
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
* Converts Fortran 1-based IPIV to 0-based JS IPIV.
*
* @private
* @param {ArrayLikeObject} fipiv - Fortran IPIV array
* @returns {Array} 0-based JS IPIV array
*/
function convertIPIV( fipiv ) {
	var out = [];
	var i;
	for ( i = 0; i < fipiv.length; i++ ) {
		if ( fipiv[ i ] > 0 ) {
			out.push( fipiv[ i ] - 1 );
		} else {
			out.push( fipiv[ i ] );
		}
	}
	return out;
}

/**
* Converts a typed array to a plain array.
*
* @private
* @param {TypedArray} arr - input typed array
* @returns {Array} plain array
*/
function toArray( arr ) {
	var out = [];
	var i;
	for ( i = 0; i < arr.length; i++ ) {
		out.push( arr[ i ] );
	}
	return out;
}

/**
* Runs a single factorization test case.
*
* @private
* @param {string} caseName - fixture case name
* @param {string} uplo - `'upper'` or `'lower'`
* @param {NonNegativeInteger} N - matrix order
* @param {Array} aInit - initial `A` array as plain JS array
*/
function runCase( caseName, uplo, N, aInit ) {
	var info;
	var ipiv;
	var tc;
	var A;
	var e;
	ipiv = new Int32Array( N );
	e = new Float64Array( N );
	A = new Float64Array( aInit );
	tc = findCase( caseName );
	info = dsytf2rk( uplo, N, A, 1, N, 0, e, 1, 0, ipiv, 1, 0 );
	assertArrayClose( A, tc.a, 1e-13, caseName + ': a' );
	assertArrayClose( e, tc.e, 1e-13, caseName + ': e' );
	assert.equal( info, tc.info, caseName + ': info' );
	assert.deepEqual( toArray( ipiv ), convertIPIV( tc.ipiv ), caseName + ': ipiv' );
}


// TESTS //

test( 'dsytf2_rk: 4x4_lower (tridiagonal)', function t() {
	runCase( '4x4_lower', 'lower', 4, [ 2, -1, 0, 0, 0, 2, -1, 0, 0, 0, 2, -1, 0, 0, 0, 2 ] ); // eslint-disable-line max-len
});

test( 'dsytf2_rk: 4x4_upper (tridiagonal)', function t() {
	runCase( '4x4_upper', 'upper', 4, [ 2, 0, 0, 0, -1, 2, 0, 0, 0, -1, 2, 0, 0, 0, -1, 2 ] ); // eslint-disable-line max-len
});

test( 'dsytf2_rk: 4x4_indef_lower (forces 2x2 pivots)', function t() {
	runCase( '4x4_indef_lower', 'lower', 4, [ 0, 1, 2, 3, 0, 0, 4, 5, 0, 0, 0, 6, 0, 0, 0, 0 ] ); // eslint-disable-line max-len
});

test( 'dsytf2_rk: 4x4_indef_upper (forces 2x2 pivots)', function t() {
	runCase( '4x4_indef_upper', 'upper', 4, [ 0, 0, 0, 0, 1, 0, 0, 0, 2, 4, 0, 0, 3, 5, 6, 0 ] ); // eslint-disable-line max-len
});

test( 'dsytf2_rk: n=1 lower', function t() {
	runCase( 'n1_lower', 'lower', 1, [ 5 ] );
});

test( 'dsytf2_rk: n=0 quick return', function t() {
	var info;
	var ipiv;
	var A;
	var e;
	ipiv = new Int32Array( 0 );
	e = new Float64Array( 0 );
	A = new Float64Array( 0 );
	info = dsytf2rk( 'lower', 0, A, 1, 1, 0, e, 1, 0, ipiv, 1, 0 );
	assert.equal( info, 0, 'info' );
});

test( 'dsytf2_rk: 5x5_lower (well-conditioned)', function t() {
	runCase( '5x5_lower', 'lower', 5, [ 4, 1, -2, 0.5, 1.5, 0, -3, 1, 2, 0, 0, 0, 5, -1, 0.5, 0, 0, 0, 2, 1, 0, 0, 0, 0, -4 ] ); // eslint-disable-line max-len
});

test( 'dsytf2_rk: 5x5_upper (well-conditioned)', function t() {
	runCase( '5x5_upper', 'upper', 5, [ 4, 0, 0, 0, 0, 1, -3, 0, 0, 0, -2, 1, 5, 0, 0, 0.5, 2, -1, 2, 0, 1.5, 0, 0.5, 1, -4 ] ); // eslint-disable-line max-len
});

test( 'dsytf2_rk: 5x5_pivots_lower (small diagonal forces rook pivots)', function t() {
	runCase( '5x5_pivots_lower', 'lower', 5, [ 0.1, 10, 2, 3, 1, 0, 0.2, 1, -2, 4, 0, 0, 0.3, 5, -1, 0, 0, 0, 0.4, 6, 0, 0, 0, 0, 0.5 ] ); // eslint-disable-line max-len
});

test( 'dsytf2_rk: 5x5_pivots_upper (small diagonal forces rook pivots)', function t() {
	runCase( '5x5_pivots_upper', 'upper', 5, [ 0.1, 0, 0, 0, 0, 10, 0.2, 0, 0, 0, 2, 1, 0.3, 0, 0, 3, -2, 5, 0.4, 0, 1, 4, -1, 6, 0.5 ] ); // eslint-disable-line max-len
});

test( 'dsytf2_rk: 5x5_swap1x1_upper (1x1 pivot with row/col interchange)', function t() {
	runCase( '5x5_swap1x1_upper', 'upper', 5, [ 9, 0, 0, 0, 0, 0.5, 8, 0, 0, 0, 0.1, 0.2, 7, 0, 0, 0.3, 0.4, 0.6, 6, 0, 10, 0.7, 0.8, 0.9, 0.01 ] ); // eslint-disable-line max-len
});

test( 'dsytf2_rk: 5x5_swap1x1_lower (1x1 pivot with row/col interchange)', function t() {
	runCase( '5x5_swap1x1_lower', 'lower', 5, [ 0.01, 0.7, 0.8, 0.9, 10, 0, 6, 0.6, 0.4, 0.3, 0, 0, 7, 0.2, 0.1, 0, 0, 0, 8, 0.5, 0, 0, 0, 0, 9 ] ); // eslint-disable-line max-len
});

test( 'dsytf2_rk: 5x5_rook_upper (rook search with p != k)', function t() {
	runCase( '5x5_rook_upper', 'upper', 5, [ 3, 0, 0, 0, 0, 0.1, 2.5, 0, 0, 0, 0.2, 0.3, 2, 0, 0, 20, 0.4, 0.5, 0.02, 0, 0.6, 0.7, 30, 25, 0.01 ] ); // eslint-disable-line max-len
});

test( 'dsytf2_rk: 5x5_rook_lower (rook search with p != k)', function t() {
	runCase( '5x5_rook_lower', 'lower', 5, [ 0.01, 25, 30, 0.7, 0.6, 0, 0.02, 0.5, 0.4, 20, 0, 0, 2, 0.3, 0.2, 0, 0, 0, 2.5, 0.1, 0, 0, 0, 0, 3 ] ); // eslint-disable-line max-len
});

test( 'dsytf2_rk: 5x5_rook_cycle_lower (rook cycles, p != k first swap)', function t() {
	runCase( '5x5_rook_cycle_lower', 'lower', 5, [ 0.01, 100, 0.5, 0.3, 100, 0, 0.02, 0.4, 0.2, 200, 0, 0, 2, 0.1, 0.05, 0, 0, 0, 3, 0.06, 0, 0, 0, 0, 0.03 ] ); // eslint-disable-line max-len
});

test( 'dsytf2_rk: 5x5_rook_cycle_upper (rook cycles, p != k first swap)', function t() {
	runCase( '5x5_rook_cycle_upper', 'upper', 5, [ 0.03, 0, 0, 0, 0, 0.06, 3, 0, 0, 0, 0.05, 0.1, 2, 0, 0, 200, 0.2, 0.4, 0.02, 0, 100, 0.3, 0.5, 100, 0.01 ] ); // eslint-disable-line max-len
});

test( 'dsytf2_rk: 3x3_singular_lower (info > 0)', function t() {
	runCase( '3x3_singular_lower', 'lower', 3, [ 1, 0, 0, 0, 0, 0, 0, 0, 2 ] );
});

test( 'dsytf2_rk: 3x3_singular_upper (info > 0)', function t() {
	runCase( '3x3_singular_upper', 'upper', 3, [ 1, 0, 0, 0, 0, 0, 0, 0, 2 ] );
});
