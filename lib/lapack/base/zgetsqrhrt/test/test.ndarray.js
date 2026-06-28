/**
* @license Apache-2.0
*
* Copyright (c) 2026 Ricky Reusser.
*
* Derived from the LAPACK 3.12.0 reference implementation (BSD-3-Clause).
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

/* eslint-disable no-restricted-syntax, stdlib/first-unit-test, max-len, max-statements, max-lines-per-function */

// MODULES //

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import test from 'node:test';
import assert from 'node:assert/strict';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import zgetsqrhrt from './../lib/ndarray.js';


// FIXTURES //

var fixtureDir = join( import.meta.dirname, '..', '..', '..', '..', '..', 'test', 'fixtures' );
var lines = readFileSync( join( fixtureDir, 'zgetsqrhrt.jsonl' ), 'utf8' ).trim().split( '\n' );
var fixture = lines.map( parseLine );


// FUNCTIONS //

/**
* Parses a single JSONL line into an object.
*
* @private
* @param {string} line - JSON-encoded fixture row
* @returns {Object} parsed fixture entry
*/
function parseLine( line ) {
	return JSON.parse( line );
}

/**
* Locates a fixture case by name.
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
* Asserts element-wise closeness of two interleaved-complex arrays.
*
* @private
* @param {Float64Array} actual - computed values
* @param {Array<number>} expected - reference values
* @param {number} tol - tolerance
* @param {string} msg - assertion message prefix
*/
function assertArrayClose( actual, expected, tol, msg ) {
	var relErr;
	var i;
	assert.equal( actual.length, expected.length, msg + ': length mismatch' );
	for ( i = 0; i < expected.length; i++ ) {
		relErr = Math.abs( actual[ i ] - expected[ i ] ) / Math.max( Math.abs( expected[ i ] ), 1.0 );
		assert.ok( relErr <= tol, msg + '[' + i + ']: expected ' + expected[ i ] + ', got ' + actual[ i ] );
	}
}

/**
* Builds the diagonally-dominant test matrix matching the Fortran `fill_diag_dom` helper.
*
* @private
* @param {NonNegativeInteger} M - rows
* @param {NonNegativeInteger} N - cols
* @param {number} scale - real-part diagonal offset
* @param {number} imScale - imag-part diagonal multiplier
* @returns {Complex128Array} column-major M-by-N matrix
*/
function diagDom( M, N, scale, imScale ) {
	var view;
	var out;
	var re;
	var im;
	var i;
	var j;
	out = new Complex128Array( M * N );
	view = reinterpret( out, 0 );
	for ( j = 0; j < N; j++ ) {
		for ( i = 0; i < M; i++ ) {
			if ( i === j ) {
				re = scale + ( j + 1 );
				im = imScale * ( j + 1 );
			} else {
				re = 1.0 / ( Math.abs( i - j ) + 1 );
				im = 0.05 * ( i - j );
			}
			view[ ( ( ( j * M ) + i ) * 2 ) ] = re;
			view[ ( ( ( j * M ) + i ) * 2 ) + 1 ] = im;
		}
	}
	return out;
}

/**
* Builds the M=12, N=3 mod-pattern test matrix matching the Fortran `run_12_3_5_3_3` helper.
*
* @private
* @returns {Complex128Array} column-major matrix
*/
function modPattern12x3() {
	var view;
	var out;
	var re;
	var im;
	var M;
	var N;
	var i;
	var j;
	M = 12;
	N = 3;
	out = new Complex128Array( M * N );
	view = reinterpret( out, 0 );
	for ( j = 0; j < N; j++ ) {
		for ( i = 0; i < M; i++ ) {
			if ( i === j ) {
				re = 5.0 + ( ( j + 1 ) * 0.5 );
				im = 0.1;
			} else {
				re = ( ( ( ( ( i + 1 ) * 7 ) + ( ( j + 1 ) * 3 ) ) % 11 ) / 5.0 ) + 0.1;
				im = ( ( ( ( ( i + 1 ) * 5 ) + ( ( j + 1 ) * 2 ) ) % 7 ) / 8.0 ) - 0.3;
			}
			view[ ( ( ( j * M ) + i ) * 2 ) ] = re;
			view[ ( ( ( j * M ) + i ) * 2 ) + 1 ] = im;
		}
	}
	return out;
}

/**
* Allocates a T output buffer of the right size for zgetsqrhrt.
*
* @private
* @param {NonNegativeInteger} N - columns
* @param {PositiveInteger} nb2 - output block size
* @returns {Object} object with `T` (Complex128Array) and `LDT` (integer)
*/
function allocateT( N, nb2 ) {
	var nb2local;
	var LDT;
	nb2local = ( nb2 < N ) ? nb2 : N;
	LDT = Math.max( 1, nb2local );
	return {
		'T': new Complex128Array( LDT * Math.max( 1, N ) ),
		'LDT': LDT
	};
}

/**
* Runs zgetsqrhrt against a fixture case.
*
* @private
* @param {string} caseName - fixture case name
* @param {NonNegativeInteger} M - rows
* @param {NonNegativeInteger} N - cols
* @param {PositiveInteger} mb1 - row block size for TSQR
* @param {PositiveInteger} nb1 - column block size for TSQR
* @param {PositiveInteger} nb2 - output block size
* @param {Complex128Array} A - input matrix (column-major)
* @param {number} tol - tolerance
*/
function runCase( caseName, M, N, mb1, nb1, nb2, A, tol ) {
	var Tinfo;
	var info;
	var view;
	var Tv;
	var tc;
	tc = findCase( caseName );
	Tinfo = allocateT( N, nb2 );
	info = zgetsqrhrt( M, N, mb1, nb1, nb2, A, 1, M, 0, Tinfo.T, 1, Tinfo.LDT, 0 );
	view = reinterpret( A, 0 );
	Tv = reinterpret( Tinfo.T, 0 );
	assert.equal( info, tc.INFO, caseName + ': INFO' );
	assertArrayClose( view, tc.A, tol, caseName + ' A' );
	assertArrayClose( Tv, tc.T, tol, caseName + ' T' );
}


// TESTS //

test( 'main export is a function', function t() {
	assert.equal( typeof zgetsqrhrt, 'function', 'main export is a function' );
});

test( 'zgetsqrhrt: m8_n3_mb14_nb12_nb22 (blocked tall, mb1>>n)', function t() {
	runCase( 'm8_n3_mb14_nb12_nb22', 8, 3, 4, 2, 2, diagDom( 8, 3, 4.0, 0.1 ), 1e-12 );
});

test( 'zgetsqrhrt: m10_n4_mb15_nb13_nb22 (mb1=5, nb1=3, nb2=2)', function t() {
	runCase( 'm10_n4_mb15_nb13_nb22', 10, 4, 5, 3, 2, diagDom( 10, 4, 5.0, -0.1 ), 1e-12 );
});

test( 'zgetsqrhrt: m5_n3_mb18_nb12_nb23 (mb1>m, single TSQR row block)', function t() {
	runCase( 'm5_n3_mb18_nb12_nb23', 5, 3, 8, 2, 3, diagDom( 5, 3, 4.5, 0.2 ), 1e-12 );
});

test( 'zgetsqrhrt: m6_n3_mb14_nb12_nb28_clamp (nb2 > N clamped to N)', function t() {
	runCase( 'm6_n3_mb14_nb12_nb28_clamp', 6, 3, 4, 2, 8, diagDom( 6, 3, 5.5, 0.05 ), 1e-12 );
});

test( 'zgetsqrhrt: m9_n3_mb15_nb13_nb22 (nb1==N, single column block)', function t() {
	runCase( 'm9_n3_mb15_nb13_nb22', 9, 3, 5, 3, 2, diagDom( 9, 3, 6.0, 0.07 ), 1e-12 );
});

test( 'zgetsqrhrt: m8_n2_mb14_nb11_nb22 (nb1==1, one Householder per TSQR step)', function t() {
	runCase( 'm8_n2_mb14_nb11_nb22', 8, 2, 4, 1, 2, diagDom( 8, 2, 4.0, -0.05 ), 1e-12 );
});

test( 'zgetsqrhrt: m4_n4_mb18_nb12_nb22_square (M==N degenerate)', function t() {
	runCase( 'm4_n4_mb18_nb12_nb22_square', 4, 4, 8, 2, 2, diagDom( 4, 4, 6.0, 0.1 ), 1e-12 );
});

test( 'zgetsqrhrt: m12_n3_mb15_nb13_nb23 (larger blocked, mod-pattern fill)', function t() {
	runCase( 'm12_n3_mb15_nb13_nb23', 12, 3, 5, 3, 3, modPattern12x3(), 1e-12 );
});

test( 'zgetsqrhrt: m=0, n=0 quick return', function t() {
	var info;
	var A;
	var T;
	A = new Complex128Array( 1 );
	T = new Complex128Array( 1 );
	info = zgetsqrhrt( 0, 0, 1, 1, 1, A, 1, 1, 0, T, 1, 1, 0 );
	assert.equal( info, 0, 'INFO' );
});

test( 'zgetsqrhrt: m=3, n=0 quick return', function t() {
	var info;
	var A;
	var T;
	A = new Complex128Array( 3 );
	T = new Complex128Array( 1 );
	info = zgetsqrhrt( 3, 0, 1, 1, 1, A, 1, 3, 0, T, 1, 1, 0 );
	assert.equal( info, 0, 'INFO' );
});

test( 'zgetsqrhrt: R diagonal is real-positive after factorization', function t() {
	var diag;
	var info;
	var view;
	var A;
	var T;
	var i;
	A = diagDom( 8, 3, 4.0, 0.1 );
	T = new Complex128Array( 2 * 3 );
	info = zgetsqrhrt( 8, 3, 4, 2, 2, A, 1, 8, 0, T, 1, 2, 0 );
	assert.equal( info, 0, 'INFO' );
	view = reinterpret( A, 0 );
	for ( i = 0; i < 3; i++ ) {
		diag = view[ ( ( ( i * 8 ) + i ) * 2 ) ];
		assert.ok( Math.abs( diag ) > 1e-8, 'R diagonal[' + i + '] non-trivial' );
	}
});
