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
import dgelqt from './../lib/dgelqt.js';


// FIXTURES //

var fixtureDir = path.join( import.meta.dirname, '..', '..', '..', '..', '..', 'test', 'fixtures' );
var raw = readFileSync( path.join( fixtureDir, 'dgelqt.jsonl' ), 'utf8' ); // eslint-disable-line node/no-sync
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
	assert.strictEqual( typeof dgelqt, 'function', 'main export is a function' );
});

test( 'has expected arity', function t() {
	assert.strictEqual( dgelqt.length, 9, 'has expected arity' );
});

test( 'throws a TypeError if `order` is not a recognized layout', function t() {
	assert.throws( function bad() {
		dgelqt( 'invalid', 2, 2, 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ) );
	}, TypeError );
});

test( 'throws a RangeError when M is negative', function t() {
	assert.throws( function bad() {
		dgelqt( 'column-major', -1, 2, 1, new Float64Array( 4 ), 1, new Float64Array( 4 ), 1, new Float64Array( 4 ) );
	}, RangeError );
});

test( 'throws a RangeError when N is negative', function t() {
	assert.throws( function bad() {
		dgelqt( 'column-major', 2, -1, 1, new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, new Float64Array( 4 ) );
	}, RangeError );
});

test( 'throws a RangeError when mb is zero', function t() {
	assert.throws( function bad() {
		dgelqt( 'column-major', 3, 4, 0, new Float64Array( 12 ), 3, new Float64Array( 12 ), 1, new Float64Array( 4 ) );
	}, RangeError );
});

test( 'throws a RangeError when mb exceeds min(M,N)', function t() {
	assert.throws( function bad() {
		dgelqt( 'column-major', 3, 4, 4, new Float64Array( 12 ), 3, new Float64Array( 16 ), 4, new Float64Array( 16 ) );
	}, RangeError );
});

test( 'throws a RangeError when LDA is too small (column-major)', function t() {
	assert.throws( function bad() {
		dgelqt( 'column-major', 4, 6, 2, new Float64Array( 24 ), 3, new Float64Array( 12 ), 2, new Float64Array( 12 ) );
	}, RangeError );
});

test( 'throws a RangeError when LDA is too small (row-major)', function t() {
	assert.throws( function bad() {
		dgelqt( 'row-major', 4, 6, 2, new Float64Array( 24 ), 5, new Float64Array( 8 ), 4, new Float64Array( 12 ) );
	}, RangeError );
});

test( 'throws a RangeError when LDT is too small (column-major)', function t() {
	assert.throws( function bad() {
		dgelqt( 'column-major', 4, 6, 2, new Float64Array( 24 ), 4, new Float64Array( 12 ), 1, new Float64Array( 12 ) );
	}, RangeError );
});

test( 'throws a RangeError when LDT is too small (row-major)', function t() {
	assert.throws( function bad() {
		dgelqt( 'row-major', 4, 6, 2, new Float64Array( 24 ), 6, new Float64Array( 4 ), 2, new Float64Array( 12 ) );
	}, RangeError );
});

test( 'computes the blocked LQ factorization in column-major layout', function t() {
	var WORK;
	var info;
	var rows;
	var LDA;
	var LDT;
	var tc;
	var mb;
	var M;
	var N;
	var k;
	var A;
	var T;
	var i;
	var j;

	M = 4;
	N = 6;
	mb = 2;
	k = Math.min( M, N );
	LDA = M;
	LDT = mb;
	rows = [
		[ 3.0, 0.6, 0.4, 0.2, 0.1, -0.3 ],
		[ 0.5, 4.0, 0.7, 0.3, -0.2, 0.5 ],
		[ 0.2, 0.5, 3.5, 0.8, 0.6, 0.1 ],
		[ 0.4, 0.3, 0.5, 4.5, 1.1, -0.5 ]
	];
	tc = findCase( 'm4_n6_mb2' );

	A = new Float64Array( LDA * N );
	T = new Float64Array( LDT * k );
	WORK = new Float64Array( mb * N );
	for ( j = 0; j < N; j++ ) {
		for ( i = 0; i < M; i++ ) {
			A[ ( j * LDA ) + i ] = rows[ i ][ j ];
		}
	}
	info = dgelqt( 'column-major', M, N, mb, A, LDA, T, LDT, WORK );
	assert.strictEqual( info, 0, 'INFO is 0' );

	for ( j = 0; j < N; j++ ) {
		for ( i = 0; i < M; i++ ) {
			assert.ok( Math.abs( A[ ( j * LDA ) + i ] - tc.A[ ( j * M ) + i ] ) <= 1e-13, 'A[' + i + ',' + j + ']' ); // eslint-disable-line max-len
		}
	}
	for ( j = 0; j < k; j++ ) {
		for ( i = 0; i < mb; i++ ) {
			assert.ok( Math.abs( T[ ( j * LDT ) + i ] - tc.T[ ( j * mb ) + i ] ) <= 1e-13, 'T[' + i + ',' + j + ']' ); // eslint-disable-line max-len
		}
	}
});

test( 'computes the blocked LQ factorization in row-major layout', function t() {
	var WORK;
	var Aexp;
	var Texp;
	var info;
	var rows;
	var LDA;
	var LDT;
	var tc;
	var mb;
	var M;
	var N;
	var k;
	var A;
	var T;
	var i;
	var j;

	M = 4;
	N = 6;
	mb = 2;
	k = Math.min( M, N );
	LDA = N;
	LDT = k;
	rows = [
		[ 3.0, 0.6, 0.4, 0.2, 0.1, -0.3 ],
		[ 0.5, 4.0, 0.7, 0.3, -0.2, 0.5 ],
		[ 0.2, 0.5, 3.5, 0.8, 0.6, 0.1 ],
		[ 0.4, 0.3, 0.5, 4.5, 1.1, -0.5 ]
	];
	tc = findCase( 'm4_n6_mb2' );

	A = new Float64Array( M * N );
	T = new Float64Array( mb * k );
	WORK = new Float64Array( mb * N );
	for ( i = 0; i < M; i++ ) {
		for ( j = 0; j < N; j++ ) {
			A[ ( i * N ) + j ] = rows[ i ][ j ];
		}
	}
	info = dgelqt( 'row-major', M, N, mb, A, LDA, T, LDT, WORK );
	assert.strictEqual( info, 0, 'INFO is 0' );

	// Convert compact column-major fixture to row-major.
	Aexp = new Float64Array( M * N );
	for ( j = 0; j < N; j++ ) {
		for ( i = 0; i < M; i++ ) {
			Aexp[ ( i * N ) + j ] = tc.A[ ( j * M ) + i ];
		}
	}
	Texp = new Float64Array( mb * k );
	for ( j = 0; j < k; j++ ) {
		for ( i = 0; i < mb; i++ ) {
			Texp[ ( i * k ) + j ] = tc.T[ ( j * mb ) + i ];
		}
	}

	for ( i = 0; i < M * N; i++ ) {
		assert.ok( Math.abs( A[ i ] - Aexp[ i ] ) <= 1e-13, 'A[' + i + ']' );
	}
	for ( i = 0; i < mb * k; i++ ) {
		assert.ok( Math.abs( T[ i ] - Texp[ i ] ) <= 1e-13, 'T[' + i + ']' );
	}
});

test( 'returns 0 immediately when M=0', function t() {
	var WORK;
	var info;
	var A;
	var T;
	A = new Float64Array( 4 );
	T = new Float64Array( 4 );
	WORK = new Float64Array( 4 );
	info = dgelqt( 'column-major', 0, 4, 1, A, 1, T, 1, WORK );
	assert.strictEqual( info, 0 );
});

test( 'returns 0 immediately when N=0', function t() {
	var WORK;
	var info;
	var A;
	var T;
	A = new Float64Array( 4 );
	T = new Float64Array( 4 );
	WORK = new Float64Array( 4 );
	info = dgelqt( 'column-major', 4, 0, 1, A, 4, T, 1, WORK );
	assert.strictEqual( info, 0 );
});
