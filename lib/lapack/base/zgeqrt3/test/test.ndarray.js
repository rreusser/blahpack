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

/* eslint-disable max-len, no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import { readFileSync } from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import assert from 'node:assert/strict';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import zgeqrt3 from './../lib/ndarray.js';


// FIXTURES //

var fixtureDir = path.join( import.meta.dirname, '..', '..', '..', '..', '..', 'test', 'fixtures' );
var raw = readFileSync( path.join( fixtureDir, 'zgeqrt3.jsonl' ), 'utf8' ); // eslint-disable-line node/no-sync
var lines = raw.trim().split( '\n' );
var fixture = lines.map( parseLine );


// FUNCTIONS //

/**
* Parses a JSONL fixture line.
*
* @private
* @param {string} line - JSON line text
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
* Asserts that an actual array is element-wise close to an expected array.
*
* @private
* @param {(Float64Array|Array<number>)} actual - computed values
* @param {Array<number>} expected - reference values
* @param {number} tol - tolerance
* @param {string} msg - assertion message prefix
*/
function assertArrayClose( actual, expected, tol, msg ) {
	var relErr;
	var i;
	assert.strictEqual( actual.length, expected.length, msg + ': length mismatch' );
	for ( i = 0; i < expected.length; i++ ) {
		relErr = Math.abs( actual[ i ] - expected[ i ] ) / Math.max( Math.abs( expected[ i ] ), 1.0 ); // eslint-disable-line max-len
		assert.ok( relErr <= tol, msg + '[' + i + ']: expected ' + expected[ i ] + ', got ' + actual[ i ] ); // eslint-disable-line max-len
	}
}

/**
* Builds a column-major Complex128Array from a 2D row-major literal of `[re, im]` pairs.
*
* @private
* @param {Array<Array<Array<number>>>} rows - row-major matrix data; `rows[i][j]` is `[re, im]`
* @param {NonNegativeInteger} M - number of rows
* @param {NonNegativeInteger} N - number of columns
* @returns {Complex128Array} column-major flat storage
*/
function colmajor( rows, M, N ) {
	var view;
	var out;
	var i;
	var j;
	out = new Complex128Array( M * N );
	view = reinterpret( out, 0 );
	for ( j = 0; j < N; j++ ) {
		for ( i = 0; i < M; i++ ) {
			view[ ( ( ( j * M ) + i ) * 2 ) ] = rows[ i ][ j ][ 0 ];
			view[ ( ( ( j * M ) + i ) * 2 ) + 1 ] = rows[ i ][ j ][ 1 ];
		}
	}
	return out;
}

/**
* Runs zgeqrt3 on the given input and verifies the output matches the fixture.
*
* @private
* @param {string} caseName - fixture case name
* @param {NonNegativeInteger} M - number of rows
* @param {NonNegativeInteger} N - number of columns
* @param {Array<Array<Array<number>>>} rows - input matrix as row-major literal of `[re, im]` pairs
* @param {number} tol - tolerance
*/
function runCase( caseName, M, N, rows, tol ) {
	var info;
	var tc;
	var A;
	var T;
	tc = findCase( caseName );
	A = colmajor( rows, M, N );
	T = new Complex128Array( N * N );
	info = zgeqrt3( M, N, A, 1, M, 0, T, 1, N, 0 );
	assert.strictEqual( info, tc.INFO, caseName + ': INFO' );
	assertArrayClose( reinterpret( A, 0 ), tc.A, tol, caseName + ' A' );
	assertArrayClose( reinterpret( T, 0 ), tc.T, tol, caseName + ' T' );
}


// TESTS //

test( 'main export is a function', function t() {
	assert.strictEqual( typeof zgeqrt3, 'function', 'main export is a function' );
});

test( 'zgeqrt3: m=4, n=1 (base case, complex)', function t() {
	runCase( 'm4_n1', 4, 1, [
		[ [ 2.0, 0.3 ] ],
		[ [ 1.5, -0.4 ] ],
		[ [ 0.5, 0.2 ] ],
		[ [ -1.25, 0.6 ] ]
	], 1e-13 );
});

test( 'zgeqrt3: m=1, n=1 (degenerate base case)', function t() {
	runCase( 'm1_n1', 1, 1, [ [ [ 3.5, -1.2 ] ] ], 1e-13 );
});

test( 'zgeqrt3: m=4, n=2 (single recursive split)', function t() {
	runCase( 'm4_n2', 4, 2, [
		[ [ 2.0, 0.1 ], [ 1.5, -0.2 ] ],
		[ [ 0.7, -0.3 ], [ 3.0, 0.5 ] ],
		[ [ 0.5, 0.3 ], [ 1.1, -0.4 ] ],
		[ [ -1.0, 0.4 ], [ 0.4, 0.2 ] ]
	], 1e-13 );
});

test( 'zgeqrt3: m=5, n=3 (recursive N1=1, N2=2)', function t() {
	runCase( 'm5_n3', 5, 3, [
		[ [ 4.0, 0.2 ], [ 1.0, -0.3 ], [ 0.5, 0.4 ] ],
		[ [ 0.5, 0.4 ], [ 3.5, -0.2 ], [ 1.2, 0.6 ] ],
		[ [ 0.3, -0.5 ], [ 0.8, 0.1 ], [ 4.5, -0.3 ] ],
		[ [ -0.25, 0.1 ], [ 0.6, -0.3 ], [ 1.1, 0.5 ] ],
		[ [ 0.75, -0.5 ], [ -0.4, 0.2 ], [ 0.9, -0.2 ] ]
	], 1e-13 );
});

test( 'zgeqrt3: m=6, n=4 (deeper recursion, even split)', function t() {
	runCase( 'm6_n4', 6, 4, [
		[ [ 3.0, 0.1 ], [ 0.6, -0.2 ], [ 0.4, 0.3 ], [ 0.2, -0.1 ] ],
		[ [ 0.5, -0.3 ], [ 4.0, 0.4 ], [ 0.7, -0.2 ], [ 0.3, 0.5 ] ],
		[ [ 0.2, 0.5 ], [ 0.5, -0.3 ], [ 3.5, 0.2 ], [ 0.8, -0.4 ] ],
		[ [ 0.4, -0.1 ], [ 0.3, 0.4 ], [ 0.5, -0.5 ], [ 4.5, 0.3 ] ],
		[ [ 0.1, 0.4 ], [ -0.2, -0.4 ], [ 0.6, 0.1 ], [ 1.1, -0.2 ] ],
		[ [ -0.3, 0.2 ], [ 0.5, 0.1 ], [ 0.1, -0.5 ], [ -0.5, 0.4 ] ]
	], 1e-13 );
});

test( 'zgeqrt3: m=7, n=5 (uneven split)', function t() {
	runCase( 'm7_n5', 7, 5, [
		[ [ 5.0, 0.2 ], [ 0.7, -0.4 ], [ 0.3, 0.1 ], [ -0.1, 0.3 ], [ 0.4, -0.5 ] ],
		[ [ 0.6, -0.2 ], [ 4.5, 0.3 ], [ 0.8, -0.4 ], [ 0.5, 0.1 ], [ -0.3, 0.5 ] ],
		[ [ 0.3, 0.4 ], [ 0.4, -0.2 ], [ 5.5, 0.5 ], [ 0.9, -0.3 ], [ 0.7, 0.4 ] ],
		[ [ 0.2, -0.5 ], [ 0.5, 0.1 ], [ 0.6, -0.4 ], [ 4.8, 0.2 ], [ 1.0, -0.5 ] ],
		[ [ 0.1, 0.3 ], [ 0.3, -0.4 ], [ 0.5, 0.2 ], [ 0.7, -0.1 ], [ 5.2, 0.5 ] ],
		[ [ 0.2, 0.4 ], [ -0.4, 0.3 ], [ -0.2, -0.1 ], [ 0.3, 0.4 ], [ 0.9, -0.3 ] ],
		[ [ 0.5, -0.1 ], [ 0.1, 0.2 ], [ 0.4, 0.5 ], [ -0.4, 0.1 ], [ 0.6, 0.4 ] ]
	], 1e-13 );
});

test( 'zgeqrt3: m=4, n=4 (square)', function t() {
	runCase( 'm4_n4', 4, 4, [
		[ [ 4.0, 0.1 ], [ 0.5, -0.2 ], [ 0.3, 0.4 ], [ 0.2, -0.3 ] ],
		[ [ 0.6, 0.5 ], [ 3.5, -0.4 ], [ 0.4, 0.2 ], [ 0.1, -0.1 ] ],
		[ [ 0.2, -0.4 ], [ 0.4, 0.3 ], [ 4.5, -0.5 ], [ 0.7, 0.2 ] ],
		[ [ 0.3, 0.4 ], [ 0.2, -0.3 ], [ 0.5, 0.1 ], [ 5.0, -0.2 ] ]
	], 1e-13 );
});

test( 'zgeqrt3: m=4, n=1 with real inputs (sanity check)', function t() {
	runCase( 'm4_n1_real', 4, 1, [
		[ [ 2.0, 0.0 ] ],
		[ [ 1.5, 0.0 ] ],
		[ [ 0.5, 0.0 ] ],
		[ [ -1.25, 0.0 ] ]
	], 1e-13 );
});

test( 'zgeqrt3: n=0 quick return', function t() {
	var info;
	var A;
	var T;
	A = new Complex128Array( 0 );
	T = new Complex128Array( 0 );
	info = zgeqrt3( 0, 0, A, 1, 1, 0, T, 1, 1, 0 );
	assert.strictEqual( info, 0 );
});

test( 'zgeqrt3: works with non-trivial offsets and strides', function t() {
	var offsetA;
	var offsetT;
	var view;
	var info;
	var rows;
	var Aout;
	var Tout;
	var LDA;
	var LDT;
	var tc;
	var A;
	var T;
	var i;
	var j;

	tc = findCase( 'm4_n2' );
	LDA = 7;
	LDT = 4;
	offsetA = 5;
	offsetT = 3;
	A = new Complex128Array( ( LDA * 2 ) + offsetA );
	T = new Complex128Array( ( LDT * 2 ) + offsetT );
	rows = [
		[ [ 2.0, 0.1 ], [ 1.5, -0.2 ] ],
		[ [ 0.7, -0.3 ], [ 3.0, 0.5 ] ],
		[ [ 0.5, 0.3 ], [ 1.1, -0.4 ] ],
		[ [ -1.0, 0.4 ], [ 0.4, 0.2 ] ]
	];
	view = reinterpret( A, 0 );
	for ( j = 0; j < 2; j++ ) {
		for ( i = 0; i < 4; i++ ) {
			view[ ( ( offsetA + ( j * LDA ) + i ) * 2 ) ] = rows[ i ][ j ][ 0 ];
			view[ ( ( offsetA + ( j * LDA ) + i ) * 2 ) + 1 ] = rows[ i ][ j ][ 1 ];
		}
	}
	info = zgeqrt3( 4, 2, A, 1, LDA, offsetA, T, 1, LDT, offsetT );
	assert.strictEqual( info, 0 );

	// Pull out the 4x2 result region (interleaved real/imag, 2*M*N = 16 doubles).
	Aout = [];
	for ( j = 0; j < 2; j++ ) {
		for ( i = 0; i < 4; i++ ) {
			Aout.push( view[ ( ( offsetA + ( j * LDA ) + i ) * 2 ) ] );
			Aout.push( view[ ( ( offsetA + ( j * LDA ) + i ) * 2 ) + 1 ] );
		}
	}
	Tout = [];
	view = reinterpret( T, 0 );
	for ( j = 0; j < 2; j++ ) {
		for ( i = 0; i < 2; i++ ) {
			Tout.push( view[ ( ( offsetT + ( j * LDT ) + i ) * 2 ) ] );
			Tout.push( view[ ( ( offsetT + ( j * LDT ) + i ) * 2 ) + 1 ] );
		}
	}
	assertArrayClose( Aout, tc.A, 1e-13, 'A (with offsets)' );
	assertArrayClose( Tout, tc.T, 1e-13, 'T (with offsets)' );
	assert.strictEqual( info, tc.INFO );
});

test( 'zgeqrt3: works on a row-major matrix layout', function t() {
	var Aexp;
	var Texp;
	var view;
	var rows;
	var info;
	var tc;
	var M;
	var N;
	var A;
	var T;
	var i;
	var j;

	tc = findCase( 'm5_n3' );
	rows = [
		[ [ 4.0, 0.2 ], [ 1.0, -0.3 ], [ 0.5, 0.4 ] ],
		[ [ 0.5, 0.4 ], [ 3.5, -0.2 ], [ 1.2, 0.6 ] ],
		[ [ 0.3, -0.5 ], [ 0.8, 0.1 ], [ 4.5, -0.3 ] ],
		[ [ -0.25, 0.1 ], [ 0.6, -0.3 ], [ 1.1, 0.5 ] ],
		[ [ 0.75, -0.5 ], [ -0.4, 0.2 ], [ 0.9, -0.2 ] ]
	];
	M = 5;
	N = 3;
	A = new Complex128Array( M * N );
	T = new Complex128Array( N * N );
	view = reinterpret( A, 0 );
	for ( i = 0; i < M; i++ ) {
		for ( j = 0; j < N; j++ ) {
			view[ ( ( ( i * N ) + j ) * 2 ) ] = rows[ i ][ j ][ 0 ];
			view[ ( ( ( i * N ) + j ) * 2 ) + 1 ] = rows[ i ][ j ][ 1 ];
		}
	}
	info = zgeqrt3( M, N, A, N, 1, 0, T, N, 1, 0 );
	assert.strictEqual( info, 0 );

	// Convert column-major fixture A/T to row-major for comparison; the fixture stores interleaved [re, im] pairs.
	Aexp = [];
	for ( i = 0; i < M; i++ ) {
		for ( j = 0; j < N; j++ ) {
			Aexp.push( tc.A[ ( ( ( j * M ) + i ) * 2 ) ] );
			Aexp.push( tc.A[ ( ( ( j * M ) + i ) * 2 ) + 1 ] );
		}
	}
	Texp = [];
	for ( i = 0; i < N; i++ ) {
		for ( j = 0; j < N; j++ ) {
			Texp.push( tc.T[ ( ( ( j * N ) + i ) * 2 ) ] );
			Texp.push( tc.T[ ( ( ( j * N ) + i ) * 2 ) + 1 ] );
		}
	}
	assertArrayClose( reinterpret( A, 0 ), Aexp, 1e-13, 'A (row-major)' );
	assertArrayClose( reinterpret( T, 0 ), Texp, 1e-13, 'T (row-major)' );
});

test( 'ndarray: throws when M is negative', function t() {
	assert.throws( function bad() {
		zgeqrt3( -1, 3, new Complex128Array( 9 ), 1, 3, 0, new Complex128Array( 9 ), 1, 3, 0 );
	}, RangeError );
});

test( 'ndarray: throws when N is negative', function t() {
	assert.throws( function bad() {
		zgeqrt3( 3, -1, new Complex128Array( 9 ), 1, 3, 0, new Complex128Array( 9 ), 1, 3, 0 );
	}, RangeError );
});

test( 'ndarray: throws when M < N', function t() {
	assert.throws( function bad() {
		zgeqrt3( 2, 4, new Complex128Array( 9 ), 1, 4, 0, new Complex128Array( 16 ), 1, 4, 0 );
	}, RangeError );
});
