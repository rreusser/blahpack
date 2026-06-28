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

/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import { readFileSync } from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import assert from 'node:assert/strict';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import zgeqrt from './../lib/ndarray.js';


// FIXTURES //

var fixtureDir = path.join( import.meta.dirname, '..', '..', '..', '..', '..', 'test', 'fixtures' );
var fixtureRaw = readFileSync( path.join( fixtureDir, 'zgeqrt.jsonl' ), 'utf8' ); // eslint-disable-line node/no-sync
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
* Runs zgeqrt on the given input and verifies the output matches the fixture.
*
* @private
* @param {string} caseName - fixture case name
* @param {NonNegativeInteger} M - number of rows
* @param {NonNegativeInteger} N - number of columns
* @param {PositiveInteger} nb - block size
* @param {Array<Array<Array<number>>>} rows - input matrix as row-major literal of `[re, im]` pairs
* @param {number} tol - tolerance
*/
function runCase( caseName, M, N, nb, rows, tol ) {
	var WORK;
	var info;
	var Av;
	var Tv;
	var tc;
	var A;
	var K;
	var T;
	tc = findCase( caseName );
	K = ( M < N ) ? M : N;
	A = colmajor( rows, M, N );
	T = new Complex128Array( nb * K );
	WORK = new Complex128Array( nb * N );
	info = zgeqrt( M, N, nb, A, 1, M, 0, T, 1, nb, 0, WORK, 1, 0 );
	Av = reinterpret( A, 0 );
	Tv = reinterpret( T, 0 );
	assert.strictEqual( info, tc.INFO, caseName + ': INFO' );
	assertArrayClose( Av, tc.A, tol, caseName + ' A' );
	assertArrayClose( Tv, tc.T, tol, caseName + ' T' );
}


// TESTS //

test( 'main export is a function', function t() {
	assert.strictEqual( typeof zgeqrt, 'function', 'main export is a function' );
});

test( 'zgeqrt: m=4, n=3, nb=2 (blocked tall complex)', function t() {
	runCase( 'm4_n3_nb2', 4, 3, 2, [
		[ [ 2.0, 0.5 ], [ 1.0, -0.2 ], [ 3.0, 0.1 ] ],
		[ [ 1.0, -0.3 ], [ 4.0, 0.4 ], [ 2.0, -0.1 ] ],
		[ [ 3.0, 0.2 ], [ 2.0, 0.1 ], [ 5.0, 0.3 ] ],
		[ [ 1.0, -0.4 ], [ 3.0, -0.2 ], [ 1.0, 0.5 ] ]
	], 1e-12 );
});

test( 'zgeqrt: m=3, n=3, nb=3 (single block, square complex)', function t() {
	runCase( 'm3_n3_nb3', 3, 3, 3, [
		[ [ 4.0, 0.1 ], [ 1.0, -0.2 ], [ 2.0, 0.3 ] ],
		[ [ 1.0, 0.2 ], [ 5.0, -0.1 ], [ 3.0, 0.4 ] ],
		[ [ 2.0, -0.3 ], [ 3.0, 0.5 ], [ 6.0, 0.2 ] ]
	], 1e-12 );
});

test( 'zgeqrt: m=5, n=2, nb=1 (single-reflector blocks complex)', function t() {
	runCase( 'm5_n2_nb1', 5, 2, 1, [
		[ [ 1.0, 0.2 ], [ 2.0, -0.1 ] ],
		[ [ 3.0, -0.4 ], [ 4.0, 0.3 ] ],
		[ [ 5.0, 0.1 ], [ 6.0, -0.2 ] ],
		[ [ 2.0, 0.5 ], [ 1.0, -0.3 ] ],
		[ [ 4.0, -0.1 ], [ 3.0, 0.4 ] ]
	], 1e-12 );
});

test( 'zgeqrt: m=1, n=1, nb=1 (degenerate scalar complex)', function t() {
	runCase( 'm1_n1_nb1', 1, 1, 1, [
		[ [ 7.5, -1.5 ] ]
	], 1e-12 );
});

test( 'zgeqrt: m=3, n=1, nb=1 (single column complex)', function t() {
	runCase( 'm3_n1_nb1', 3, 1, 1, [
		[ [ 1.0, 0.3 ] ],
		[ [ 2.0, -0.4 ] ],
		[ [ 2.0, 0.5 ] ]
	], 1e-12 );
});

test( 'zgeqrt: m=4, n=4, nb=2 (multiple equal blocks complex)', function t() {
	runCase( 'm4_n4_nb2', 4, 4, 2, [
		[ [ 2.0, 0.1 ], [ 0.5, -0.2 ], [ 1.0, 0.1 ], [ 0.3, -0.05 ] ],
		[ [ 1.0, -0.1 ], [ 3.0, 0.2 ], [ 0.7, -0.3 ], [ 0.4, 0.1 ] ],
		[ [ 0.5, 0.2 ], [ 0.8, 0.1 ], [ 4.0, -0.2 ], [ 0.6, 0.3 ] ],
		[ [ 0.2, -0.3 ], [ 0.9, 0.4 ], [ 1.2, 0.1 ], [ 5.0, -0.1 ] ]
	], 1e-12 );
});

test( 'zgeqrt: m=6, n=4, nb=3 (last block smaller than nb complex)', function t() {
	var rows;
	var i;
	var j;
	rows = [];
	for ( i = 0; i < 6; i++ ) {
		rows.push( [] );
		for ( j = 0; j < 4; j++ ) {
			if ( i === j ) {
				rows[ i ].push( [ 5.0 + ( j + 1 ), 0.1 * ( j + 1 ) ] );
			} else {
				rows[ i ].push( [ 1.0 / ( Math.abs( i - j ) + 1 ), 0.05 * ( i - j ) ] );
			}
		}
	}
	runCase( 'm6_n4_nb3', 6, 4, 3, rows, 1e-12 );
});

test( 'zgeqrt: m=3, n=5, nb=2 (wide matrix M < N complex)', function t() {
	runCase( 'm3_n5_nb2', 3, 5, 2, [
		[ [ 3.0, 0.1 ], [ 1.0, -0.2 ], [ 2.0, 0.3 ], [ 0.5, -0.05 ], [ 0.3, 0.15 ] ],
		[ [ 1.0, 0.2 ], [ 4.0, -0.1 ], [ 0.7, 0.4 ], [ 1.5, -0.3 ], [ 0.4, 0.25 ] ],
		[ [ 0.5, -0.3 ], [ 0.8, 0.5 ], [ 5.0, 0.2 ], [ 0.6, 0.1 ], [ 1.1, -0.2 ] ]
	], 1e-12 );
});

test( 'zgeqrt: m=2, n=2, nb=1 (purely real input — exercises alphi==0 path of zlarfg)', function t() {
	runCase( 'm2_n2_nb1_real', 2, 2, 1, [
		[ [ 3.0, 0.0 ], [ 1.0, 0.0 ] ],
		[ [ 4.0, 0.0 ], [ 2.0, 0.0 ] ]
	], 1e-12 );
});

test( 'zgeqrt: m=0 quick return', function t() {
	var info;
	var WORK;
	var A;
	var T;
	A = new Complex128Array( 0 );
	T = new Complex128Array( 0 );
	WORK = new Complex128Array( 0 );
	info = zgeqrt( 0, 3, 1, A, 1, 1, 0, T, 1, 1, 0, WORK, 1, 0 );
	assert.strictEqual( info, 0 );
});

test( 'zgeqrt: n=0 quick return', function t() {
	var info;
	var WORK;
	var A;
	var T;
	A = new Complex128Array( 0 );
	T = new Complex128Array( 0 );
	WORK = new Complex128Array( 0 );
	info = zgeqrt( 3, 0, 1, A, 1, 3, 0, T, 1, 1, 0, WORK, 1, 0 );
	assert.strictEqual( info, 0 );
});

test( 'zgeqrt: works with non-trivial offsets and strides', function t() {
	var offsetWork;
	var offsetA;
	var offsetT;
	var Aoutv;
	var Toutv;
	var info;
	var WORK;
	var rows;
	var Aout;
	var Tout;
	var LDA;
	var LDT;
	var nb;
	var tc;
	var Av;
	var Tv;
	var M;
	var N;
	var K;
	var A;
	var T;
	var i;
	var j;

	tc = findCase( 'm4_n3_nb2' );
	M = 4;
	N = 3;
	nb = 2;
	K = 3;
	LDA = 7;
	LDT = 4;
	offsetA = 5;
	offsetT = 3;
	offsetWork = 2;
	A = new Complex128Array( ( LDA * N ) + offsetA );
	T = new Complex128Array( ( LDT * K ) + offsetT );
	WORK = new Complex128Array( ( nb * N ) + offsetWork );
	Av = reinterpret( A, 0 );
	Tv = reinterpret( T, 0 );
	rows = [
		[ [ 2.0, 0.5 ], [ 1.0, -0.2 ], [ 3.0, 0.1 ] ],
		[ [ 1.0, -0.3 ], [ 4.0, 0.4 ], [ 2.0, -0.1 ] ],
		[ [ 3.0, 0.2 ], [ 2.0, 0.1 ], [ 5.0, 0.3 ] ],
		[ [ 1.0, -0.4 ], [ 3.0, -0.2 ], [ 1.0, 0.5 ] ]
	];
	for ( j = 0; j < N; j++ ) {
		for ( i = 0; i < M; i++ ) {
			Av[ ( ( offsetA + ( j * LDA ) + i ) * 2 ) ] = rows[ i ][ j ][ 0 ];
			Av[ ( ( offsetA + ( j * LDA ) + i ) * 2 ) + 1 ] = rows[ i ][ j ][ 1 ];
		}
	}
	info = zgeqrt( M, N, nb, A, 1, LDA, offsetA, T, 1, LDT, offsetT, WORK, 1, offsetWork ); // eslint-disable-line max-len
	assert.strictEqual( info, 0 );

	// Pull out the M-by-N region of A.
	Aout = new Complex128Array( M * N );
	Aoutv = reinterpret( Aout, 0 );
	for ( j = 0; j < N; j++ ) {
		for ( i = 0; i < M; i++ ) {
			Aoutv[ ( ( ( j * M ) + i ) * 2 ) ] = Av[ ( ( offsetA + ( j * LDA ) + i ) * 2 ) ];
			Aoutv[ ( ( ( j * M ) + i ) * 2 ) + 1 ] = Av[ ( ( offsetA + ( j * LDA ) + i ) * 2 ) + 1 ];
		}
	}
	// Pull out the nb-by-K region of T.
	Tout = new Complex128Array( nb * K );
	Toutv = reinterpret( Tout, 0 );
	for ( j = 0; j < K; j++ ) {
		for ( i = 0; i < nb; i++ ) {
			Toutv[ ( ( ( j * nb ) + i ) * 2 ) ] = Tv[ ( ( offsetT + ( j * LDT ) + i ) * 2 ) ];
			Toutv[ ( ( ( j * nb ) + i ) * 2 ) + 1 ] = Tv[ ( ( offsetT + ( j * LDT ) + i ) * 2 ) + 1 ];
		}
	}
	assertArrayClose( Aoutv, tc.A, 1e-12, 'A (with offsets)' );
	assertArrayClose( Toutv, tc.T, 1e-12, 'T (with offsets)' );
});

test( 'zgeqrt: works on a row-major matrix layout', function t() {
	var Aexpv;
	var Texpv;
	var WORK;
	var Aexp;
	var Texp;
	var rows;
	var info;
	var nb;
	var tc;
	var Av;
	var Tv;
	var M;
	var N;
	var K;
	var A;
	var T;
	var i;
	var j;

	tc = findCase( 'm4_n3_nb2' );
	rows = [
		[ [ 2.0, 0.5 ], [ 1.0, -0.2 ], [ 3.0, 0.1 ] ],
		[ [ 1.0, -0.3 ], [ 4.0, 0.4 ], [ 2.0, -0.1 ] ],
		[ [ 3.0, 0.2 ], [ 2.0, 0.1 ], [ 5.0, 0.3 ] ],
		[ [ 1.0, -0.4 ], [ 3.0, -0.2 ], [ 1.0, 0.5 ] ]
	];
	M = 4;
	N = 3;
	nb = 2;
	K = 3;
	A = new Complex128Array( M * N );
	T = new Complex128Array( nb * K );
	WORK = new Complex128Array( nb * N );
	Av = reinterpret( A, 0 );
	Tv = reinterpret( T, 0 );
	for ( i = 0; i < M; i++ ) {
		for ( j = 0; j < N; j++ ) {
			Av[ ( ( ( i * N ) + j ) * 2 ) ] = rows[ i ][ j ][ 0 ];
			Av[ ( ( ( i * N ) + j ) * 2 ) + 1 ] = rows[ i ][ j ][ 1 ];
		}
	}
	// Row-major: strideA1=N, strideA2=1; T row-major: strideT1=K, strideT2=1.
	info = zgeqrt( M, N, nb, A, N, 1, 0, T, K, 1, 0, WORK, 1, 0 );
	assert.strictEqual( info, 0 );

	// Convert column-major fixture A/T to row-major for comparison.
	Aexp = new Complex128Array( M * N );
	Aexpv = reinterpret( Aexp, 0 );
	for ( j = 0; j < N; j++ ) {
		for ( i = 0; i < M; i++ ) {
			Aexpv[ ( ( ( i * N ) + j ) * 2 ) ] = tc.A[ ( ( ( j * M ) + i ) * 2 ) ];
			Aexpv[ ( ( ( i * N ) + j ) * 2 ) + 1 ] = tc.A[ ( ( ( j * M ) + i ) * 2 ) + 1 ];
		}
	}
	Texp = new Complex128Array( nb * K );
	Texpv = reinterpret( Texp, 0 );
	for ( j = 0; j < K; j++ ) {
		for ( i = 0; i < nb; i++ ) {
			Texpv[ ( ( ( i * K ) + j ) * 2 ) ] = tc.T[ ( ( ( j * nb ) + i ) * 2 ) ];
			Texpv[ ( ( ( i * K ) + j ) * 2 ) + 1 ] = tc.T[ ( ( ( j * nb ) + i ) * 2 ) + 1 ];
		}
	}
	assertArrayClose( Av, Aexpv, 1e-12, 'A (row-major)' );
	assertArrayClose( Tv, Texpv, 1e-12, 'T (row-major)' );
});

test( 'ndarray: throws when M is negative', function t() {
	assert.throws( function bad() {
		zgeqrt( -1, 3, 1, new Complex128Array( 9 ), 1, 3, 0, new Complex128Array( 3 ), 1, 1, 0, new Complex128Array( 3 ), 1, 0 ); // eslint-disable-line max-len
	}, RangeError );
});

test( 'ndarray: throws when N is negative', function t() {
	assert.throws( function bad() {
		zgeqrt( 3, -1, 1, new Complex128Array( 9 ), 1, 3, 0, new Complex128Array( 3 ), 1, 1, 0, new Complex128Array( 3 ), 1, 0 ); // eslint-disable-line max-len
	}, RangeError );
});

test( 'ndarray: throws when nb < 1', function t() {
	assert.throws( function bad() {
		zgeqrt( 3, 3, 0, new Complex128Array( 9 ), 1, 3, 0, new Complex128Array( 9 ), 1, 3, 0, new Complex128Array( 9 ), 1, 0 ); // eslint-disable-line max-len
	}, RangeError );
});

test( 'ndarray: throws when nb > min(M,N)', function t() {
	assert.throws( function bad() {
		zgeqrt( 3, 3, 4, new Complex128Array( 9 ), 1, 3, 0, new Complex128Array( 12 ), 1, 4, 0, new Complex128Array( 12 ), 1, 0 ); // eslint-disable-line max-len
	}, RangeError );
});

test( 'ndarray: nb=min(M,N) accepted at boundary', function t() {
	var info;
	var WORK;
	var A;
	var T;
	A = new Complex128Array( 12 );
	T = new Complex128Array( 9 );
	WORK = new Complex128Array( 9 );
	info = zgeqrt( 4, 3, 3, A, 1, 4, 0, T, 1, 3, 0, WORK, 1, 0 );
	assert.strictEqual( info, 0 );
});
