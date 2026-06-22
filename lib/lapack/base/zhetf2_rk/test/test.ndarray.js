/* eslint-disable no-restricted-syntax, stdlib/first-unit-test, max-lines */

// MODULES //

import test from 'node:test';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import zhetf2rk from './../lib/ndarray.js';


// FIXTURES //

var fixtureDir = path.join( import.meta.dirname, '..', '..', '..', '..', '..', 'test', 'fixtures' );
var lines = readFileSync( path.join( fixtureDir, 'zhetf2_rk.jsonl' ), 'utf8' ).trim().split( '\n' ); // eslint-disable-line max-len
var FIXTURES = lines.map( function parse( line ) {
	return JSON.parse( line );
});


// FUNCTIONS //

/**
* Finds a test case by name.
*
* @private
* @param {string} name - test case name
* @returns {Object} fixture
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
* @param {string} msg - message
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
* @param {string} msg - message
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
* @param {TypedArray} arr - input array
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
* @param {Array} aInit - interleaved initial `A` (real/imag pairs)
*/
function runCase( caseName, uplo, N, aInit ) {
	var info;
	var ipiv;
	var tc;
	var A;
	var e;
	A = new Complex128Array( aInit );
	e = new Complex128Array( N );
	ipiv = new Int32Array( N );
	tc = findCase( caseName );
	info = zhetf2rk( uplo, N, A, 1, N, 0, e, 1, 0, ipiv, 1, 0 );
	assertArrayClose( toArray( reinterpret( A, 0 ) ), tc.a, 1e-12, caseName + ': a' ); // eslint-disable-line max-len
	assertArrayClose( toArray( reinterpret( e, 0 ) ), tc.e, 1e-12, caseName + ': e' ); // eslint-disable-line max-len
	assert.equal( info, tc.info, caseName + ': info' );
	assert.deepEqual( toArray( ipiv ), convertIPIV( tc.ipiv ), caseName + ': ipiv' );
}


// TESTS //

test( 'zhetf2_rk: upper_4x4 Hermitian', function t() {
	// Column-major interleaved (4x4 = 32 float64s = 16 complex elements).
	// Upper triangle stored: col j has rows 0..j.
	var a = [
		4,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		1,
		2,
		5,
		0,
		0,
		0,
		0,
		0,
		3,
		-1,
		2,
		1,
		7,
		0,
		0,
		0,
		0.5,
		0.5,
		1,
		-2,
		3,
		0,
		6,
		0
	];
	runCase( 'upper_4x4', 'upper', 4, a );
});

test( 'zhetf2_rk: lower_4x4 Hermitian', function t() {
	var a = [
		4,
		0,
		1,
		-2,
		3,
		1,
		0.5,
		-0.5,
		0,
		0,
		5,
		0,
		2,
		-1,
		1,
		2,
		0,
		0,
		0,
		0,
		7,
		0,
		3,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		6,
		0
	];
	runCase( 'lower_4x4', 'lower', 4, a );
});

test( 'zhetf2_rk: indef_upper_4x4 (2x2 pivots)', function t() {
	var a = [
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		1,
		1,
		0,
		0,
		0,
		0,
		0,
		0,
		2,
		-1,
		4,
		2,
		0,
		0,
		0,
		0,
		3,
		0.5,
		5,
		-1,
		6,
		1.5,
		0,
		0
	];
	runCase( 'indef_upper_4x4', 'upper', 4, a );
});

test( 'zhetf2_rk: indef_lower_4x4 (2x2 pivots)', function t() {
	var a = [
		0,
		0,
		1,
		-1,
		2,
		1,
		3,
		-0.5,
		0,
		0,
		0,
		0,
		4,
		-2,
		5,
		1,
		0,
		0,
		0,
		0,
		0,
		0,
		6,
		-1.5,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0
	];
	runCase( 'indef_lower_4x4', 'lower', 4, a );
});

test( 'zhetf2_rk: n1_lower', function t() {
	var a = [ 5, 0 ];
	runCase( 'n1_lower', 'lower', 1, a );
});

test( 'zhetf2_rk: n=0 quick return', function t() {
	var info;
	var ipiv;
	var A;
	var e;
	ipiv = new Int32Array( 0 );
	A = new Complex128Array( 0 );
	e = new Complex128Array( 0 );
	info = zhetf2rk( 'lower', 0, A, 1, 1, 0, e, 1, 0, ipiv, 1, 0 );
	assert.equal( info, 0, 'info' );
});

test( 'zhetf2_rk: singular_lower (info > 0)', function t() {
	var a = [
		1,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		2,
		0
	];
	runCase( 'singular_lower', 'lower', 3, a );
});

test( 'zhetf2_rk: singular_upper (info > 0)', function t() {
	var a = [
		1,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		2,
		0
	];
	runCase( 'singular_upper', 'upper', 3, a );
});

test( 'zhetf2_rk: indef_big_upper (tiny diagonal, large off-diagonal)', function t() {
	var a = [
		0.1,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		2,
		1,
		0.1,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		3,
		-1,
		4,
		1,
		0.1,
		0,
		0,
		0,
		0,
		0,
		5,
		2,
		6,
		-1,
		7,
		1.5,
		0.1,
		0,
		0,
		0,
		8,
		-0.5,
		9,
		0.5,
		10,
		-1.5,
		11,
		2,
		0.1,
		0
	];
	runCase( 'indef_big_upper', 'upper', 5, a );
});

test( 'zhetf2_rk: indef_big_lower (tiny diagonal, large off-diagonal)', function t() {
	var a = [
		0.1,
		0,
		2,
		-1,
		3,
		1,
		5,
		-2,
		8,
		0.5,
		0,
		0,
		0.1,
		0,
		4,
		-1,
		6,
		1,
		9,
		-0.5,
		0,
		0,
		0,
		0,
		0.1,
		0,
		7,
		-1.5,
		10,
		1.5,
		0,
		0,
		0,
		0,
		0,
		0,
		0.1,
		0,
		11,
		-2,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0.1,
		0
	];
	runCase( 'indef_big_lower', 'lower', 5, a );
});

test( 'zhetf2_rk: rook_upper_5x5 (rook cycle with p != k first swap)', function t() {
	var a = [
		0.03,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0.06,
		0.01,
		3,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0.05,
		-0.01,
		0.1,
		0.02,
		2,
		0,
		0,
		0,
		0,
		0,
		200,
		1,
		0.2,
		-0.1,
		0.4,
		0.2,
		0.02,
		0,
		0,
		0,
		100,
		-2,
		0.3,
		0.1,
		0.5,
		-0.2,
		100,
		1,
		0.01,
		0
	];
	runCase( 'rook_upper_5x5', 'upper', 5, a );
});

test( 'zhetf2_rk: rook_lower_5x5 (rook cycle with p != k first swap)', function t() {
	var a = [
		0.01,
		0,
		0.3,
		-0.1,
		0.5,
		0.2,
		100,
		-1,
		100,
		2,
		0,
		0,
		0.02,
		0,
		0.4,
		-0.2,
		0.2,
		0.1,
		200,
		-1,
		0,
		0,
		0,
		0,
		2,
		0,
		0.1,
		-0.02,
		0.05,
		0.01,
		0,
		0,
		0,
		0,
		0,
		0,
		3,
		0,
		0.06,
		-0.01,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0.03,
		0
	];
	runCase( 'rook_lower_5x5', 'lower', 5, a );
});
