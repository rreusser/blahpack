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
import zgelqt from './../lib/zgelqt.js';


// FIXTURES //

var fixtureDir = path.join( import.meta.dirname, '..', '..', '..', '..', '..', 'test', 'fixtures' );
var raw = readFileSync( path.join( fixtureDir, 'zgelqt.jsonl' ), 'utf8' ); // eslint-disable-line node/no-sync
var lines = raw.trim().split( '\n' );
var fixture = lines.map( parseLine );


// FUNCTIONS //

/**
* Parses a JSONL fixture line.
*
* @private
* @param {string} line - JSON line
* @returns {Object} parsed entry
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


// TESTS //

test( 'main export is a function', function t() {
	assert.strictEqual( typeof zgelqt, 'function', 'main export is a function' );
});

test( 'has expected arity', function t() {
	assert.strictEqual( zgelqt.length, 9, 'has expected arity' );
});

test( 'throws a TypeError if `order` is not a recognized layout', function t() {
	assert.throws( function bad() {
		zgelqt( 'invalid', 2, 2, 2, new Complex128Array( 4 ), 2, new Complex128Array( 4 ), 2, new Complex128Array( 4 ) );
	}, TypeError );
});

test( 'throws a RangeError when M is negative', function t() {
	assert.throws( function bad() {
		zgelqt( 'column-major', -1, 2, 1, new Complex128Array( 4 ), 1, new Complex128Array( 4 ), 1, new Complex128Array( 4 ) );
	}, RangeError );
});

test( 'throws a RangeError when N is negative', function t() {
	assert.throws( function bad() {
		zgelqt( 'column-major', 2, -1, 1, new Complex128Array( 4 ), 2, new Complex128Array( 4 ), 1, new Complex128Array( 4 ) );
	}, RangeError );
});

test( 'throws a RangeError when mb is zero', function t() {
	assert.throws( function bad() {
		zgelqt( 'column-major', 3, 4, 0, new Complex128Array( 12 ), 3, new Complex128Array( 12 ), 1, new Complex128Array( 4 ) );
	}, RangeError );
});

test( 'throws a RangeError when mb exceeds min(M,N)', function t() {
	assert.throws( function bad() {
		zgelqt( 'column-major', 3, 4, 4, new Complex128Array( 12 ), 3, new Complex128Array( 16 ), 4, new Complex128Array( 16 ) );
	}, RangeError );
});

test( 'throws a RangeError when LDA is too small (column-major)', function t() {
	assert.throws( function bad() {
		zgelqt( 'column-major', 4, 6, 2, new Complex128Array( 24 ), 3, new Complex128Array( 12 ), 2, new Complex128Array( 12 ) );
	}, RangeError );
});

test( 'throws a RangeError when LDA is too small (row-major)', function t() {
	assert.throws( function bad() {
		zgelqt( 'row-major', 4, 6, 2, new Complex128Array( 24 ), 5, new Complex128Array( 8 ), 4, new Complex128Array( 12 ) );
	}, RangeError );
});

test( 'throws a RangeError when LDT is too small (column-major)', function t() {
	assert.throws( function bad() {
		zgelqt( 'column-major', 4, 6, 2, new Complex128Array( 24 ), 4, new Complex128Array( 12 ), 1, new Complex128Array( 12 ) );
	}, RangeError );
});

test( 'throws a RangeError when LDT is too small (row-major)', function t() {
	assert.throws( function bad() {
		zgelqt( 'row-major', 4, 6, 2, new Complex128Array( 24 ), 6, new Complex128Array( 4 ), 2, new Complex128Array( 12 ) );
	}, RangeError );
});

test( 'computes the blocked LQ factorization in column-major layout', function t() {
	var Aview;
	var Tview;
	var WORK;
	var info;
	var rows;
	var LDA;
	var LDT;
	var mb;
	var tc;
	var A;
	var i;
	var j;
	var k;
	var M;
	var N;
	var T;

	M = 4;
	N = 6;
	mb = 2;
	k = Math.min( M, N );
	LDA = M;
	LDT = mb;
	rows = [
		[ [ 3.0, 0.1 ], [ 0.6, -0.2 ], [ 0.4, 0.3 ], [ 0.2, -0.1 ], [ 0.1, 0.4 ], [ -0.3, 0.2 ] ],
		[ [ 0.5, -0.3 ], [ 4.0, 0.4 ], [ 0.7, -0.2 ], [ 0.3, 0.5 ], [ -0.2, -0.4 ], [ 0.5, 0.1 ] ],
		[ [ 0.2, 0.5 ], [ 0.5, -0.3 ], [ 3.5, 0.2 ], [ 0.8, -0.4 ], [ 0.6, 0.1 ], [ 0.1, -0.5 ] ],
		[ [ 0.4, -0.1 ], [ 0.3, 0.4 ], [ 0.5, -0.5 ], [ 4.5, 0.3 ], [ 1.1, -0.2 ], [ -0.5, 0.4 ] ]
	];
	tc = findCase( 'm4_n6_mb2' );

	A = new Complex128Array( LDA * N );
	T = new Complex128Array( LDT * k );
	WORK = new Complex128Array( mb * N );
	Aview = reinterpret( A, 0 );
	for ( j = 0; j < N; j++ ) {
		for ( i = 0; i < M; i++ ) {
			Aview[ 2 * ( ( j * LDA ) + i ) ] = rows[ i ][ j ][ 0 ];
			Aview[ ( 2 * ( ( j * LDA ) + i ) ) + 1 ] = rows[ i ][ j ][ 1 ];
		}
	}
	info = zgelqt( 'column-major', M, N, mb, A, LDA, T, LDT, WORK );
	assert.strictEqual( info, 0, 'INFO is 0' );

	Aview = reinterpret( A, 0 );
	Tview = reinterpret( T, 0 );
	for ( i = 0; i < 2 * M * N; i++ ) {
		assert.ok( Math.abs( Aview[ i ] - tc.A[ i ] ) <= 1e-13, 'A[' + i + ']' );
	}
	for ( i = 0; i < 2 * mb * k; i++ ) {
		assert.ok( Math.abs( Tview[ i ] - tc.T[ i ] ) <= 1e-13, 'T[' + i + ']' );
	}
});

test( 'computes the blocked LQ factorization in row-major layout', function t() {
	var Aview;
	var Tview;
	var WORK;
	var Aexp;
	var Texp;
	var info;
	var rows;
	var LDA;
	var LDT;
	var mb;
	var tc;
	var A;
	var i;
	var j;
	var k;
	var M;
	var N;
	var T;

	M = 4;
	N = 6;
	mb = 2;
	k = Math.min( M, N );
	LDA = N;
	LDT = k;
	rows = [
		[ [ 3.0, 0.1 ], [ 0.6, -0.2 ], [ 0.4, 0.3 ], [ 0.2, -0.1 ], [ 0.1, 0.4 ], [ -0.3, 0.2 ] ],
		[ [ 0.5, -0.3 ], [ 4.0, 0.4 ], [ 0.7, -0.2 ], [ 0.3, 0.5 ], [ -0.2, -0.4 ], [ 0.5, 0.1 ] ],
		[ [ 0.2, 0.5 ], [ 0.5, -0.3 ], [ 3.5, 0.2 ], [ 0.8, -0.4 ], [ 0.6, 0.1 ], [ 0.1, -0.5 ] ],
		[ [ 0.4, -0.1 ], [ 0.3, 0.4 ], [ 0.5, -0.5 ], [ 4.5, 0.3 ], [ 1.1, -0.2 ], [ -0.5, 0.4 ] ]
	];
	tc = findCase( 'm4_n6_mb2' );

	A = new Complex128Array( M * N );
	T = new Complex128Array( mb * k );
	WORK = new Complex128Array( mb * N );
	Aview = reinterpret( A, 0 );
	for ( i = 0; i < M; i++ ) {
		for ( j = 0; j < N; j++ ) {
			Aview[ 2 * ( ( i * N ) + j ) ] = rows[ i ][ j ][ 0 ];
			Aview[ ( 2 * ( ( i * N ) + j ) ) + 1 ] = rows[ i ][ j ][ 1 ];
		}
	}
	info = zgelqt( 'row-major', M, N, mb, A, LDA, T, LDT, WORK );
	assert.strictEqual( info, 0, 'INFO is 0' );

	// Convert compact column-major fixture (M-by-N for A; mb-by-K for T) to row-major.
	Aview = reinterpret( A, 0 );
	Tview = reinterpret( T, 0 );
	Aexp = new Float64Array( 2 * M * N );
	for ( j = 0; j < N; j++ ) {
		for ( i = 0; i < M; i++ ) {
			Aexp[ 2 * ( ( i * N ) + j ) ] = tc.A[ 2 * ( ( j * M ) + i ) ];
			Aexp[ ( 2 * ( ( i * N ) + j ) ) + 1 ] = tc.A[ ( 2 * ( ( j * M ) + i ) ) + 1 ];
		}
	}
	Texp = new Float64Array( 2 * mb * k );
	for ( j = 0; j < k; j++ ) {
		for ( i = 0; i < mb; i++ ) {
			Texp[ 2 * ( ( i * k ) + j ) ] = tc.T[ 2 * ( ( j * mb ) + i ) ];
			Texp[ ( 2 * ( ( i * k ) + j ) ) + 1 ] = tc.T[ ( 2 * ( ( j * mb ) + i ) ) + 1 ];
		}
	}

	for ( i = 0; i < 2 * M * N; i++ ) {
		assert.ok( Math.abs( Aview[ i ] - Aexp[ i ] ) <= 1e-13, 'A[' + i + ']' );
	}
	for ( i = 0; i < 2 * mb * k; i++ ) {
		assert.ok( Math.abs( Tview[ i ] - Texp[ i ] ) <= 1e-13, 'T[' + i + ']' );
	}
});

test( 'returns 0 immediately when M=0', function t() {
	var WORK;
	var info;
	var A;
	var T;
	A = new Complex128Array( 4 );
	T = new Complex128Array( 4 );
	WORK = new Complex128Array( 4 );
	info = zgelqt( 'column-major', 0, 4, 1, A, 1, T, 1, WORK );
	assert.strictEqual( info, 0 );
});

test( 'returns 0 immediately when N=0', function t() {
	var WORK;
	var info;
	var A;
	var T;
	A = new Complex128Array( 4 );
	T = new Complex128Array( 4 );
	WORK = new Complex128Array( 4 );
	info = zgelqt( 'column-major', 4, 0, 1, A, 4, T, 1, WORK );
	assert.strictEqual( info, 0 );
});
