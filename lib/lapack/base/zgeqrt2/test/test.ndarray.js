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

/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import { readFileSync } from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import zgeqrt2 from './../lib/ndarray.js';


// FIXTURES //

var fixtureDir = path.join( import.meta.dirname, '..', '..', '..', '..', '..', 'test', 'fixtures' );
var fixtureRaw = readFileSync( path.join( fixtureDir, 'zgeqrt2.jsonl' ), 'utf8' ); // eslint-disable-line node/no-sync
var fixture = fixtureRaw.trim().split( '\n' ).map( function parse( line ) {
	return JSON.parse( line );
});


// FUNCTIONS //

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
* Asserts that an actual interleaved-complex array is element-wise close to an expected interleaved-complex array.
*
* @private
* @param {Float64Array} actual - computed values (interleaved re/im)
* @param {Array<number>} expected - reference values (interleaved re/im)
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
* @param {Array<Array<Array<number>>>} rows - row-major matrix data; each entry is `[re, im]`
* @param {NonNegativeInteger} M - number of rows
* @param {NonNegativeInteger} N - number of columns
* @returns {Complex128Array} column-major complex storage
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
* Runs zgeqrt2 on the given input and verifies the output matches the fixture.
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
	var Av;
	var Tv;
	var tc;
	var A;
	var T;
	tc = findCase( caseName );
	A = colmajor( rows, M, N );
	T = new Complex128Array( N * N );
	info = zgeqrt2( M, N, A, 1, M, 0, T, 1, N, 0 );
	Av = reinterpret( A, 0 );
	Tv = reinterpret( T, 0 );
	assert.strictEqual( info, tc.INFO, caseName + ': INFO' );
	assertArrayClose( Av, tc.A, tol, caseName + ' A' );
	assertArrayClose( Tv, tc.T, tol, caseName + ' T' );
}


// TESTS //

test( 'main export is a function', function t() {
	assert.strictEqual( typeof zgeqrt2, 'function', 'main export is a function' );
});

test( 'zgeqrt2: m=4, n=3 (tall complex)', function t() {
	runCase( 'm4_n3_complex', 4, 3, [
		[ [ 2.0, 0.5 ], [ 1.0, -0.2 ], [ 3.0, 0.1 ] ],
		[ [ 1.0, -0.3 ], [ 4.0, 0.4 ], [ 2.0, -0.1 ] ],
		[ [ 3.0, 0.2 ], [ 2.0, 0.1 ], [ 5.0, 0.3 ] ],
		[ [ 1.0, -0.4 ], [ 3.0, -0.2 ], [ 1.0, 0.5 ] ]
	], 1e-12 );
});

test( 'zgeqrt2: m=3, n=3 (square complex)', function t() {
	runCase( 'm3_n3_complex', 3, 3, [
		[ [ 4.0, 0.1 ], [ 1.0, -0.2 ], [ 2.0, 0.3 ] ],
		[ [ 1.0, 0.2 ], [ 5.0, -0.1 ], [ 3.0, 0.4 ] ],
		[ [ 2.0, -0.3 ], [ 3.0, 0.5 ], [ 6.0, 0.2 ] ]
	], 1e-12 );
});

test( 'zgeqrt2: m=5, n=2 (very tall complex)', function t() {
	runCase( 'm5_n2_complex', 5, 2, [
		[ [ 1.0, 0.2 ], [ 2.0, -0.1 ] ],
		[ [ 3.0, -0.4 ], [ 4.0, 0.3 ] ],
		[ [ 5.0, 0.1 ], [ 6.0, -0.2 ] ],
		[ [ 2.0, 0.5 ], [ 1.0, -0.3 ] ],
		[ [ 4.0, -0.1 ], [ 3.0, 0.4 ] ]
	], 1e-12 );
});

test( 'zgeqrt2: m=1, n=1 (degenerate scalar)', function t() {
	runCase( 'm1_n1_complex', 1, 1, [
		[ [ [ 7.5, -1.5 ] ] ][ 0 ]
	], 1e-12 );
});

test( 'zgeqrt2: m=3, n=1 (single column tall)', function t() {
	runCase( 'm3_n1_complex', 3, 1, [
		[ [ 1.0, 0.3 ] ],
		[ [ 2.0, -0.4 ] ],
		[ [ 2.0, 0.5 ] ]
	], 1e-12 );
});

test( 'zgeqrt2: m=4, n=4 (square, larger complex)', function t() {
	runCase( 'm4_n4_complex', 4, 4, [
		[ [ 2.0, 0.1 ], [ 0.5, -0.2 ], [ 1.0, 0.1 ], [ 0.3, -0.05 ] ],
		[ [ 1.0, -0.1 ], [ 3.0, 0.2 ], [ 0.7, -0.3 ], [ 0.4, 0.1 ] ],
		[ [ 0.5, 0.2 ], [ 0.8, 0.1 ], [ 4.0, -0.2 ], [ 0.6, 0.3 ] ],
		[ [ 0.2, -0.3 ], [ 0.9, 0.4 ], [ 1.2, 0.1 ], [ 5.0, -0.1 ] ]
	], 1e-12 );
});

test( 'zgeqrt2: m=2, n=2 (purely real input — exercises alphi==0 path of zlarfg)', function t() {
	runCase( 'm2_n2_real', 2, 2, [
		[ [ 3.0, 0.0 ], [ 1.0, 0.0 ] ],
		[ [ 4.0, 0.0 ], [ 2.0, 0.0 ] ]
	], 1e-12 );
});

test( 'zgeqrt2: n=0 quick return', function t() {
	var info;
	var A;
	var T;
	A = new Complex128Array( 0 );
	T = new Complex128Array( 0 );
	info = zgeqrt2( 4, 0, A, 1, 4, 0, T, 1, 1, 0 );
	assert.strictEqual( info, 0 );
});

test( 'zgeqrt2: m=0, n=0 quick return', function t() {
	var info;
	var A;
	var T;
	A = new Complex128Array( 0 );
	T = new Complex128Array( 0 );
	info = zgeqrt2( 0, 0, A, 1, 1, 0, T, 1, 1, 0 );
	assert.strictEqual( info, 0 );
});

test( 'zgeqrt2: works with non-trivial offsets and strides', function t() {
	var offsetA;
	var offsetT;
	var Aoutv;
	var Toutv;
	var offIa;
	var offIt;
	var info;
	var rows;
	var Aout;
	var Tout;
	var LDA;
	var LDT;
	var Av;
	var Tv;
	var tc;
	var A;
	var T;
	var i;
	var j;

	tc = findCase( 'm4_n3_complex' );
	LDA = 7;
	LDT = 5;
	offsetA = 4;
	offsetT = 2;
	A = new Complex128Array( ( LDA * 3 ) + offsetA );
	T = new Complex128Array( ( LDT * 3 ) + offsetT );
	Av = reinterpret( A, 0 );
	Tv = reinterpret( T, 0 );
	rows = [
		[ [ 2.0, 0.5 ], [ 1.0, -0.2 ], [ 3.0, 0.1 ] ],
		[ [ 1.0, -0.3 ], [ 4.0, 0.4 ], [ 2.0, -0.1 ] ],
		[ [ 3.0, 0.2 ], [ 2.0, 0.1 ], [ 5.0, 0.3 ] ],
		[ [ 1.0, -0.4 ], [ 3.0, -0.2 ], [ 1.0, 0.5 ] ]
	];
	for ( j = 0; j < 3; j++ ) {
		for ( i = 0; i < 4; i++ ) {
			offIa = ( offsetA + ( j * LDA ) + i ) * 2;
			Av[ offIa ] = rows[ i ][ j ][ 0 ];
			Av[ offIa + 1 ] = rows[ i ][ j ][ 1 ];
		}
	}
	info = zgeqrt2( 4, 3, A, 1, LDA, offsetA, T, 1, LDT, offsetT );
	assert.strictEqual( info, 0 );

	// Pull out the 4x3 result region:
	Aout = new Complex128Array( 12 );
	Aoutv = reinterpret( Aout, 0 );
	for ( j = 0; j < 3; j++ ) {
		for ( i = 0; i < 4; i++ ) {
			offIa = ( offsetA + ( j * LDA ) + i ) * 2;
			Aoutv[ ( ( ( j * 4 ) + i ) * 2 ) ] = Av[ offIa ];
			Aoutv[ ( ( ( j * 4 ) + i ) * 2 ) + 1 ] = Av[ offIa + 1 ];
		}
	}
	Tout = new Complex128Array( 9 );
	Toutv = reinterpret( Tout, 0 );
	for ( j = 0; j < 3; j++ ) {
		for ( i = 0; i < 3; i++ ) {
			offIt = ( offsetT + ( j * LDT ) + i ) * 2;
			Toutv[ ( ( ( j * 3 ) + i ) * 2 ) ] = Tv[ offIt ];
			Toutv[ ( ( ( j * 3 ) + i ) * 2 ) + 1 ] = Tv[ offIt + 1 ];
		}
	}
	assertArrayClose( Aoutv, tc.A, 1e-12, 'A (with offsets)' );
	assertArrayClose( Toutv, tc.T, 1e-12, 'T (with offsets)' );
	assert.strictEqual( info, tc.INFO );
});

test( 'zgeqrt2: works on a row-major matrix layout', function t() {
	var Aexp;
	var Texp;
	var rows;
	var info;
	var offI;
	var tc;
	var Av;
	var Tv;
	var M;
	var N;
	var A;
	var T;
	var i;
	var j;

	tc = findCase( 'm4_n3_complex' );
	rows = [
		[ [ 2.0, 0.5 ], [ 1.0, -0.2 ], [ 3.0, 0.1 ] ],
		[ [ 1.0, -0.3 ], [ 4.0, 0.4 ], [ 2.0, -0.1 ] ],
		[ [ 3.0, 0.2 ], [ 2.0, 0.1 ], [ 5.0, 0.3 ] ],
		[ [ 1.0, -0.4 ], [ 3.0, -0.2 ], [ 1.0, 0.5 ] ]
	];
	M = 4;
	N = 3;
	A = new Complex128Array( M * N );
	T = new Complex128Array( N * N );
	Av = reinterpret( A, 0 );
	Tv = reinterpret( T, 0 );
	for ( i = 0; i < M; i++ ) {
		for ( j = 0; j < N; j++ ) {
			offI = ( ( i * N ) + j ) * 2;
			Av[ offI ] = rows[ i ][ j ][ 0 ];
			Av[ offI + 1 ] = rows[ i ][ j ][ 1 ];
		}
	}
	info = zgeqrt2( M, N, A, N, 1, 0, T, N, 1, 0 );
	assert.strictEqual( info, 0 );

	// Convert column-major fixture A/T to row-major for comparison.
	Aexp = new Float64Array( 2 * M * N );
	for ( j = 0; j < N; j++ ) {
		for ( i = 0; i < M; i++ ) {
			Aexp[ ( ( ( i * N ) + j ) * 2 ) ] = tc.A[ ( ( ( j * M ) + i ) * 2 ) ]; // eslint-disable-line max-len
			Aexp[ ( ( ( i * N ) + j ) * 2 ) + 1 ] = tc.A[ ( ( ( j * M ) + i ) * 2 ) + 1 ]; // eslint-disable-line max-len
		}
	}
	Texp = new Float64Array( 2 * N * N );
	for ( j = 0; j < N; j++ ) {
		for ( i = 0; i < N; i++ ) {
			Texp[ ( ( ( i * N ) + j ) * 2 ) ] = tc.T[ ( ( ( j * N ) + i ) * 2 ) ]; // eslint-disable-line max-len
			Texp[ ( ( ( i * N ) + j ) * 2 ) + 1 ] = tc.T[ ( ( ( j * N ) + i ) * 2 ) + 1 ]; // eslint-disable-line max-len
		}
	}
	assertArrayClose( Av, Aexp, 1e-12, 'A (row-major)' );
	assertArrayClose( Tv, Texp, 1e-12, 'T (row-major)' );
});

test( 'ndarray: throws when M is negative', function t() {
	assert.throws( function bad() {
		zgeqrt2( -1, 3, new Complex128Array( 9 ), 1, 3, 0, new Complex128Array( 9 ), 1, 3, 0 ); // eslint-disable-line max-len
	}, RangeError );
});

test( 'ndarray: throws when N is negative', function t() {
	assert.throws( function bad() {
		zgeqrt2( 3, -1, new Complex128Array( 9 ), 1, 3, 0, new Complex128Array( 9 ), 1, 3, 0 ); // eslint-disable-line max-len
	}, RangeError );
});

test( 'ndarray: throws when M < N', function t() {
	assert.throws( function bad() {
		zgeqrt2( 2, 4, new Complex128Array( 8 ), 1, 2, 0, new Complex128Array( 16 ), 1, 4, 0 ); // eslint-disable-line max-len
	}, RangeError );
});
