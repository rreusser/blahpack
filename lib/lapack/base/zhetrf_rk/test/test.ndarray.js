/**
* @license Apache-2.0
*
* Copyright (c) 2025 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/

/* eslint-disable no-restricted-syntax, stdlib/first-unit-test, max-lines */

// MODULES //

import test from 'node:test';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import zhetrfrk from './../lib/ndarray.js';


// FIXTURES //

var fixtureDir = path.join( import.meta.dirname, '..', '..', '..', '..', '..', 'test', 'fixtures' );
var lines = readFileSync( path.join( fixtureDir, 'zhetrf_rk.jsonl' ), 'utf8' ).trim().split( '\n' ); // eslint-disable-line max-len
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
* Asserts two scalars are approximately equal (mixed relative/absolute).
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
* Converts Fortran 1-based IPIV to 0-based JS IPIV. Negative entries (2x2 pivots) keep their bitwise-NOT-encoded numeric value.
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
* Builds the 50x50 Hermitian fixture input (lower triangle).
*
* @private
* @returns {Complex128Array} input matrix (column-major, lower triangle)
*/
function build50Lower() {
	var idx;
	var A;
	var i;
	var j;
	A = new Float64Array( 50 * 50 * 2 );
	for ( j = 1; j <= 50; j++ ) {
		for ( i = j; i <= 50; i++ ) {
			idx = ( ( ( j - 1 ) * 50 ) + ( i - 1 ) ) * 2;
			A[ idx ] = ( Math.sin( i * 0.7 ) * Math.cos( j * 0.3 ) ) + ( 0.5 * Math.sin( ( i + j ) * 0.13 ) ); // eslint-disable-line max-len
			A[ idx + 1 ] = 0.3 * Math.sin( ( i - j ) * 0.21 );
		}
		idx = ( ( ( j - 1 ) * 50 ) + ( j - 1 ) ) * 2;
		A[ idx ] = 50.0 + ( j * 0.1 );
		A[ idx + 1 ] = 0.0;
	}
	return new Complex128Array( A.buffer );
}

/**
* Builds the 50x50 Hermitian fixture input (upper triangle).
*
* @private
* @returns {Complex128Array} input matrix (column-major, upper triangle)
*/
function build50Upper() {
	var idx;
	var A;
	var i;
	var j;
	A = new Float64Array( 50 * 50 * 2 );
	for ( j = 1; j <= 50; j++ ) {
		for ( i = 1; i <= j; i++ ) {
			idx = ( ( ( j - 1 ) * 50 ) + ( i - 1 ) ) * 2;
			A[ idx ] = ( Math.sin( i * 0.7 ) * Math.cos( j * 0.3 ) ) + ( 0.5 * Math.sin( ( i + j ) * 0.13 ) ); // eslint-disable-line max-len
			A[ idx + 1 ] = 0.3 * Math.sin( ( j - i ) * 0.21 );
		}
		idx = ( ( ( j - 1 ) * 50 ) + ( j - 1 ) ) * 2;
		A[ idx ] = 50.0 + ( j * 0.1 );
		A[ idx + 1 ] = 0.0;
	}
	return new Complex128Array( A.buffer );
}

/**
* Builds the 33x33 Hermitian fixture input (lower triangle).
*
* @private
* @returns {Complex128Array} input matrix (column-major, lower triangle)
*/
function build33Lower() {
	var idx;
	var A;
	var i;
	var j;
	A = new Float64Array( 33 * 33 * 2 );
	for ( j = 1; j <= 33; j++ ) {
		for ( i = j; i <= 33; i++ ) {
			idx = ( ( ( j - 1 ) * 33 ) + ( i - 1 ) ) * 2;
			A[ idx ] = ( Math.sin( i * 1.1 ) * Math.cos( j * 0.5 ) ) + ( 0.3 * Math.sin( i * j * 0.07 ) ); // eslint-disable-line max-len
			A[ idx + 1 ] = 0.2 * Math.cos( ( i - j ) * 0.17 );
		}
		idx = ( ( ( j - 1 ) * 33 ) + ( j - 1 ) ) * 2;
		A[ idx ] = 33.0 + ( j * 0.05 );
		A[ idx + 1 ] = 0.0;
	}
	return new Complex128Array( A.buffer );
}

/**
* Builds the 33x33 Hermitian fixture input (upper triangle).
*
* @private
* @returns {Complex128Array} input matrix (column-major, upper triangle)
*/
function build33Upper() {
	var idx;
	var A;
	var i;
	var j;
	A = new Float64Array( 33 * 33 * 2 );
	for ( j = 1; j <= 33; j++ ) {
		for ( i = 1; i <= j; i++ ) {
			idx = ( ( ( j - 1 ) * 33 ) + ( i - 1 ) ) * 2;
			A[ idx ] = ( Math.sin( i * 1.1 ) * Math.cos( j * 0.5 ) ) + ( 0.3 * Math.sin( i * j * 0.07 ) ); // eslint-disable-line max-len
			A[ idx + 1 ] = 0.2 * Math.cos( ( j - i ) * 0.17 );
		}
		idx = ( ( ( j - 1 ) * 33 ) + ( j - 1 ) ) * 2;
		A[ idx ] = 33.0 + ( j * 0.05 );
		A[ idx + 1 ] = 0.0;
	}
	return new Complex128Array( A.buffer );
}

/**
* Runs a single factorization test case.
*
* @private
* @param {string} caseName - fixture case name
* @param {string} uplo - `'upper'` or `'lower'`
* @param {NonNegativeInteger} N - matrix order
* @param {Complex128Array} A - input matrix (column-major)
* @param {number} tol - element tolerance
*/
function runCase( caseName, uplo, N, A, tol ) {
	var info;
	var ipiv;
	var tc;
	var e;
	ipiv = new Int32Array( N );
	e = new Complex128Array( N );
	tc = findCase( caseName );
	info = zhetrfrk( uplo, N, A, 1, N, 0, e, 1, 0, ipiv, 1, 0 );
	assertArrayClose( toArray( reinterpret( A, 0 ) ), tc.a, tol, caseName + ': a' ); // eslint-disable-line max-len
	assertArrayClose( toArray( reinterpret( e, 0 ) ), tc.e, tol, caseName + ': e' ); // eslint-disable-line max-len
	assert.equal( info, tc.info, caseName + ': info' );
	assert.deepEqual( toArray( ipiv ), convertIPIV( tc.ipiv ), caseName + ': ipiv' );
}


// TESTS //

test( 'zhetrf_rk: lower_4x4 Hermitian', function t() {
	// Column-major interleaved (4x4 = 32 float64s = 16 complex elements). Lower triangle stored.
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
	runCase( 'lower_4x4', 'lower', 4, new Complex128Array( a ), 1e-12 );
});

test( 'zhetrf_rk: upper_4x4 Hermitian', function t() {
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
	runCase( 'upper_4x4', 'upper', 4, new Complex128Array( a ), 1e-12 );
});

test( 'zhetrf_rk: indef_lower_4x4 (forces 2x2 pivots)', function t() {
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
	runCase( 'indef_lower_4x4', 'lower', 4, new Complex128Array( a ), 1e-12 );
});

test( 'zhetrf_rk: indef_upper_4x4 (forces 2x2 pivots)', function t() {
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
	runCase( 'indef_upper_4x4', 'upper', 4, new Complex128Array( a ), 1e-12 );
});

test( 'zhetrf_rk: n=0 quick return', function t() {
	var info;
	var ipiv;
	var A;
	var e;
	ipiv = new Int32Array( 0 );
	A = new Complex128Array( 0 );
	e = new Complex128Array( 0 );
	info = zhetrfrk( 'lower', 0, A, 1, 1, 0, e, 1, 0, ipiv, 1, 0 );
	assert.equal( info, 0, 'info' );
});

test( 'zhetrf_rk: n=1 lower', function t() {
	var a = [ 5, 0 ];
	runCase( 'n_one_lower', 'lower', 1, new Complex128Array( a ), 1e-12 );
});

test( 'zhetrf_rk: indef_upper_5x5', function t() {
	// Upper-triangle column-major: col j has rows 0..j; lower part zero.
	var a = [
		// Col 0
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

		// Col 1
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

		// Col 2
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

		// Col 3
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

		// Col 4
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
	runCase( 'indef_upper_5x5', 'upper', 5, new Complex128Array( a ), 1e-12 );
});

test( 'zhetrf_rk: indef_lower_5x5', function t() {
	// Lower-triangle column-major: col j has rows j..N-1; upper part zero.
	var a = [
		// Col 0
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

		// Col 1
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

		// Col 2
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

		// Col 3
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

		// Col 4
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
	runCase( 'indef_lower_5x5', 'lower', 5, new Complex128Array( a ), 1e-12 );
});

test( 'zhetrf_rk: lower_50x50_blocked (exercises blocked zlahef_rk path)', function t() {
	runCase( 'lower_50x50_blocked', 'lower', 50, build50Lower(), 1e-10 );
});

test( 'zhetrf_rk: upper_50x50_blocked (exercises blocked zlahef_rk path)', function t() {
	runCase( 'upper_50x50_blocked', 'upper', 50, build50Upper(), 1e-10 );
});

test( 'zhetrf_rk: lower_33x33_blocked (NB=32 + 1-row unblocked tail)', function t() {
	runCase( 'lower_33x33_blocked', 'lower', 33, build33Lower(), 1e-10 );
});

test( 'zhetrf_rk: upper_33x33_blocked (NB=32 + 1-row unblocked tail)', function t() {
	runCase( 'upper_33x33_blocked', 'upper', 33, build33Upper(), 1e-10 );
});
