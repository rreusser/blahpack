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
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import zsytrfrk from './../lib/ndarray.js';


// FIXTURES //

var fixtureDir = path.join( import.meta.dirname, '..', '..', '..', '..', '..', 'test', 'fixtures' );
var lines = readFileSync( path.join( fixtureDir, 'zsytrf_rk.jsonl' ), 'utf8' ).trim().split( '\n' ); // eslint-disable-line node/no-sync, max-len
var FIXTURES = lines.map( function parse( line ) {
	return JSON.parse( line );
});


// FUNCTIONS //

/**
* Finds a test case fixture by name.
*
* @private
* @param {string} name - test case name
* @returns {Object} fixture object
*/
function findCase( name ) {
	var i;
	for ( i = 0; i < FIXTURES.length; i += 1 ) {
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
	for ( i = 0; i < expected.length; i += 1 ) {
		assertClose( actual[ i ], expected[ i ], tol, msg + '[' + i + ']' );
	}
}

/**
* Converts Fortran 1-based IPIV to 0-based JS IPIV. Negative entries (2x2 pivots) keep their bitwise-NOT-encoded numeric value (Fortran `-p` and JS `~(p-1)` are the same integer).
*
* @private
* @param {ArrayLikeObject} fipiv - Fortran IPIV array
* @returns {Array} 0-based JS IPIV array
*/
function convertIPIV( fipiv ) {
	var out = [];
	var i;
	for ( i = 0; i < fipiv.length; i += 1 ) {
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
	for ( i = 0; i < arr.length; i += 1 ) {
		out.push( arr[ i ] );
	}
	return out;
}

/**
* Builds the 50x50 Fortran fixture input: lower triangle filled with sin/cos, diagonal boosted (complex).
*
* @private
* @returns {Complex128Array} input matrix (column-major, lower triangle)
*/
function build50Lower() {
	var idx;
	var A;
	var v;
	var i;
	var j;
	A = new Complex128Array( 50 * 50 );
	v = reinterpret( A, 0 );
	for ( j = 1; j <= 50; j += 1 ) {
		for ( i = j; i <= 50; i += 1 ) {
			idx = ( ( ( j - 1 ) * 50 ) + ( i - 1 ) ) * 2;
			v[ idx ] = ( Math.sin( i * 0.7 ) * Math.cos( j * 0.3 ) ) + ( 0.5 * Math.sin( ( i + j ) * 0.13 ) ); // eslint-disable-line max-len
			v[ idx + 1 ] = ( 0.2 * Math.cos( i * 0.4 ) ) - ( 0.1 * Math.sin( j * 0.5 ) ); // eslint-disable-line max-len
		}
		idx = ( ( ( j - 1 ) * 50 ) + ( j - 1 ) ) * 2;
		v[ idx ] = 50.0 + ( j * 0.1 );
		v[ idx + 1 ] = 0.05 * j;
	}
	return A;
}

/**
* Builds the 50x50 Fortran fixture input: upper triangle filled with sin/cos, diagonal boosted (complex).
*
* @private
* @returns {Complex128Array} input matrix (column-major, upper triangle)
*/
function build50Upper() {
	var idx;
	var A;
	var v;
	var i;
	var j;
	A = new Complex128Array( 50 * 50 );
	v = reinterpret( A, 0 );
	for ( j = 1; j <= 50; j += 1 ) {
		for ( i = 1; i <= j; i += 1 ) {
			idx = ( ( ( j - 1 ) * 50 ) + ( i - 1 ) ) * 2;
			v[ idx ] = ( Math.sin( i * 0.7 ) * Math.cos( j * 0.3 ) ) + ( 0.5 * Math.sin( ( i + j ) * 0.13 ) ); // eslint-disable-line max-len
			v[ idx + 1 ] = ( 0.2 * Math.cos( i * 0.4 ) ) - ( 0.1 * Math.sin( j * 0.5 ) ); // eslint-disable-line max-len
		}
		idx = ( ( ( j - 1 ) * 50 ) + ( j - 1 ) ) * 2;
		v[ idx ] = 50.0 + ( j * 0.1 );
		v[ idx + 1 ] = 0.05 * j;
	}
	return A;
}

/**
* Builds the 33x33 Fortran fixture input: lower triangle filled with sin/cos, diagonal boosted (complex).
*
* @private
* @returns {Complex128Array} input matrix (column-major, lower triangle)
*/
function build33Lower() {
	var idx;
	var A;
	var v;
	var i;
	var j;
	A = new Complex128Array( 33 * 33 );
	v = reinterpret( A, 0 );
	for ( j = 1; j <= 33; j += 1 ) {
		for ( i = j; i <= 33; i += 1 ) {
			idx = ( ( ( j - 1 ) * 33 ) + ( i - 1 ) ) * 2;
			v[ idx ] = ( Math.sin( i * 1.1 ) * Math.cos( j * 0.5 ) ) + ( 0.3 * Math.sin( i * j * 0.07 ) ); // eslint-disable-line max-len
			v[ idx + 1 ] = ( 0.15 * Math.cos( ( i + j ) * 0.2 ) ) - ( 0.07 * Math.sin( i * 0.6 ) ); // eslint-disable-line max-len
		}
		idx = ( ( ( j - 1 ) * 33 ) + ( j - 1 ) ) * 2;
		v[ idx ] = 33.0 + ( j * 0.05 );
		v[ idx + 1 ] = 0.04 * j;
	}
	return A;
}

/**
* Builds the 33x33 Fortran fixture input: upper triangle filled with sin/cos, diagonal boosted (complex).
*
* @private
* @returns {Complex128Array} input matrix (column-major, upper triangle)
*/
function build33Upper() {
	var idx;
	var A;
	var v;
	var i;
	var j;
	A = new Complex128Array( 33 * 33 );
	v = reinterpret( A, 0 );
	for ( j = 1; j <= 33; j += 1 ) {
		for ( i = 1; i <= j; i += 1 ) {
			idx = ( ( ( j - 1 ) * 33 ) + ( i - 1 ) ) * 2;
			v[ idx ] = ( Math.sin( i * 1.1 ) * Math.cos( j * 0.5 ) ) + ( 0.3 * Math.sin( i * j * 0.07 ) ); // eslint-disable-line max-len
			v[ idx + 1 ] = ( 0.15 * Math.cos( ( i + j ) * 0.2 ) ) - ( 0.07 * Math.sin( i * 0.6 ) ); // eslint-disable-line max-len
		}
		idx = ( ( ( j - 1 ) * 33 ) + ( j - 1 ) ) * 2;
		v[ idx ] = 33.0 + ( j * 0.05 );
		v[ idx + 1 ] = 0.04 * j;
	}
	return A;
}

/**
* Runs a single factorization test case against its fixture.
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
	var av;
	var ev;
	var tc;
	var e;
	ipiv = new Int32Array( N );
	e = new Complex128Array( N );
	tc = findCase( caseName );
	info = zsytrfrk( uplo, N, A, 1, N, 0, e, 1, 0, ipiv, 1, 0 );
	av = reinterpret( A, 0 );
	ev = reinterpret( e, 0 );
	assertArrayClose( av, tc.a, tol, caseName + ': a' );
	assertArrayClose( ev, tc.e, tol, caseName + ': e' );
	assert.equal( info, tc.info, caseName + ': info' );
	assert.deepEqual( toArray( ipiv ), convertIPIV( tc.ipiv ), caseName + ': ipiv' );
}


// TESTS //

test( 'zsytrf_rk: 4x4_lower', function t() {
	var A = new Complex128Array([
		4,
		0.5,
		1,
		2,
		3,
		-1,
		0.5,
		0.5,
		0,
		0,
		5,
		-0.5,
		2,
		1,
		1,
		-2,
		0,
		0,
		0,
		0,
		7,
		1,
		3,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		6,
		-1
	]);
	runCase( '4x4_lower', 'lower', 4, A, 1e-13 );
});

test( 'zsytrf_rk: 4x4_upper', function t() {
	var A = new Complex128Array([
		4,
		0.5,
		0,
		0,
		0,
		0,
		0,
		0,
		1,
		2,
		5,
		-0.5,
		0,
		0,
		0,
		0,
		3,
		-1,
		2,
		1,
		7,
		1,
		0,
		0,
		0.5,
		0.5,
		1,
		-2,
		3,
		0,
		6,
		-1
	]);
	runCase( '4x4_upper', 'upper', 4, A, 1e-13 );
});

test( 'zsytrf_rk: 4x4_indef_lower (forces 2x2 pivots)', function t() {
	var A = new Complex128Array([
		0,
		0,
		1,
		1,
		2,
		-1,
		3,
		0.5,
		0,
		0,
		0,
		0,
		4,
		2,
		5,
		-1,
		0,
		0,
		0,
		0,
		0,
		0,
		6,
		1.5,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0
	]);
	runCase( '4x4_indef_lower', 'lower', 4, A, 1e-13 );
});

test( 'zsytrf_rk: 4x4_indef_upper (forces 2x2 pivots)', function t() {
	var A = new Complex128Array([
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
	]);
	runCase( '4x4_indef_upper', 'upper', 4, A, 1e-13 );
});

test( 'zsytrf_rk: n=0 quick return', function t() {
	var info;
	var ipiv;
	var A;
	var e;
	ipiv = new Int32Array( 0 );
	e = new Complex128Array( 0 );
	A = new Complex128Array( 0 );
	info = zsytrfrk( 'lower', 0, A, 1, 1, 0, e, 1, 0, ipiv, 1, 0 );
	assert.equal( info, 0, 'info' );
});

test( 'zsytrf_rk: n=1', function t() {
	var A = new Complex128Array( [ 7, 2 ] );
	runCase( 'n_one', 'lower', 1, A, 1e-13 );
});

test( 'zsytrf_rk: singular_lower (info > 0)', function t() {
	var A = new Complex128Array( [ 0, 0, 0, 0, 0, 0, 0, 0 ] );
	runCase( 'singular_lower', 'lower', 2, A, 1e-13 );
});

test( 'zsytrf_rk: 5x5_lower (1x1 + 2x2 pivots)', function t() {
	var A = new Complex128Array([
		4,
		0.2,
		1,
		-0.3,
		-2,
		0.1,
		0.5,
		0,
		1.5,
		0.2,
		0,
		0,
		-3,
		0.5,
		1,
		0.4,
		2,
		-0.1,
		0,
		0.3,
		0,
		0,
		0,
		0,
		5,
		-0.2,
		-1,
		0.3,
		0.5,
		0.1,
		0,
		0,
		0,
		0,
		0,
		0,
		2,
		0.5,
		1,
		-0.1,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		-4,
		0
	]);
	runCase( '5x5_lower', 'lower', 5, A, 1e-13 );
});

test( 'zsytrf_rk: 5x5_upper (1x1 + 2x2 pivots)', function t() {
	var A = new Complex128Array([
		4,
		0.2,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		1,
		-0.3,
		-3,
		0.5,
		0,
		0,
		0,
		0,
		0,
		0,
		-2,
		0.1,
		1,
		0.4,
		5,
		-0.2,
		0,
		0,
		0,
		0,
		0.5,
		0,
		2,
		-0.1,
		-1,
		0.3,
		2,
		0.5,
		0,
		0,
		1.5,
		0.2,
		0,
		0.3,
		0.5,
		0.1,
		1,
		-0.1,
		-4,
		0
	]);
	runCase( '5x5_upper', 'upper', 5, A, 1e-13 );
});

test( 'zsytrf_rk: 50x50_lower_blocked (exercises blocked zlasyf_rk path)', function t() {
	runCase( '50x50_lower_blocked', 'lower', 50, build50Lower(), 1e-11 );
});

test( 'zsytrf_rk: 50x50_upper_blocked (exercises blocked zlasyf_rk path)', function t() {
	runCase( '50x50_upper_blocked', 'upper', 50, build50Upper(), 1e-11 );
});

test( 'zsytrf_rk: 33x33_lower_blocked (NB=32 + 1-row unblocked tail)', function t() {
	runCase( '33x33_lower_blocked', 'lower', 33, build33Lower(), 1e-11 );
});

test( 'zsytrf_rk: 33x33_upper_blocked (NB=32 + 1-row unblocked tail)', function t() {
	runCase( '33x33_upper_blocked', 'upper', 33, build33Upper(), 1e-11 );
});
