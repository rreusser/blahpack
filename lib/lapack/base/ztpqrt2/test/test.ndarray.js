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

/* eslint-disable no-restricted-syntax, stdlib/first-unit-test, max-len, node/no-sync, max-lines, max-statements, max-lines-per-function */

// MODULES //

import { readFileSync } from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import assert from 'node:assert/strict';
import format from '@stdlib/string/format/lib/index.js';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import ztpqrt2 from './../lib/ndarray.js';


// FIXTURES //

var fixtureDir = path.join( import.meta.dirname, '..', '..', '..', '..', '..', 'test', 'fixtures' );
var lines = readFileSync( path.join( fixtureDir, 'ztpqrt2.jsonl' ), 'utf8' ).trim().split( '\n' );
var fixture = lines.map( JSON.parse );


// FUNCTIONS //

/**
* Returns a fixture entry for a case name.
*
* @private
* @param {string} name - case name
* @throws {Error} fixture not found
* @returns {Object} fixture entry
*/
function findCase( name ) {
	var i;
	for ( i = 0; i < fixture.length; i++ ) {
		if ( fixture[ i ].name === name ) {
			return fixture[ i ];
		}
	}
	throw new Error( format( 'fixture not found: %s', name ) );
}

/**
* Asserts approximate scalar equality.
*
* @private
* @param {number} actual - actual value
* @param {number} expected - expected value
* @param {number} tol - relative tolerance
* @param {string} msg - failure message prefix
*/
function assertClose( actual, expected, tol, msg ) {
	var relErr = Math.abs( actual - expected ) / Math.max( Math.abs( expected ), 1.0 );
	assert.ok( relErr <= tol, msg + ': expected ' + expected + ', got ' + actual );
}

/**
* Asserts element-wise approximate array equality.
*
* @private
* @param {*} actual - actual values
* @param {Array} expected - expected values
* @param {number} tol - relative tolerance
* @param {string} msg - failure message prefix
*/
function assertArrayClose( actual, expected, tol, msg ) {
	var i;
	assert.equal( actual.length, expected.length, msg + ': length mismatch' );
	for ( i = 0; i < expected.length; i++ ) {
		assertClose( actual[ i ], expected[ i ], tol, msg + '[' + i + ']' );
	}
}

/**
* Builds a Complex128Array from an interleaved real/imag pair list.
*
* @private
* @param {Array<number>} arr - interleaved real/imag pairs
* @returns {Complex128Array} packed array
*/
function packC( arr ) {
	var out;
	out = new Complex128Array( arr.length / 2 );
	reinterpret( out, 0 ).set( arr );
	return out;
}

/**
* Builds the input matrices A, B, T for a fixture case (column-major, packed Complex128Array).
*
* @private
* @param {string} name - case name
* @returns {Object} inputs `{ M, N, L, A, B, T, lda, ldb, ldt }`
*/
function buildInputs( name ) {
	var defs;
	var def;
	var out;
	defs = {};
	defs.m4_n3_l0_real = {
		'M': 4,
		'N': 3,
		'L': 0,
		'A': [
			2.0,
			0.0,
			0.0,
			0.0,
			0.0,
			0.0,
			0.5,
			0.0,
			3.0,
			0.0,
			0.0,
			0.0,
			0.25,
			0.0,
			0.75,
			0.0,
			4.0,
			0.0
		],
		'B': [
			1.0,
			0.0,
			0.3,
			0.0,
			0.7,
			0.0,
			0.2,
			0.0,
			0.5,
			0.0,
			1.1,
			0.0,
			0.4,
			0.0,
			0.9,
			0.0,
			0.25,
			0.0,
			0.6,
			0.0,
			1.2,
			0.0,
			0.8,
			0.0
		]
	};
	defs.m4_n3_l3_complex = {
		'M': 4,
		'N': 3,
		'L': 3,
		'A': [
			2.0,
			0.5,
			0.0,
			0.0,
			0.0,
			0.0,
			0.5,
			0.1,
			3.0,
			-0.3,
			0.0,
			0.0,
			0.25,
			0.2,
			0.75,
			-0.1,
			4.0,
			0.4
		],
		'B': [
			1.0,
			0.3,
			1.1,
			-0.1,
			0.0,
			0.0,
			0.0,
			0.0,
			0.5,
			0.2,
			0.6,
			0.4,
			1.2,
			0.3,
			0.0,
			0.0,
			0.25,
			0.1,
			0.2,
			-0.2,
			0.9,
			0.1,
			1.5,
			-0.2
		]
	};
	defs.m3_n3_l3_complex = {
		'M': 3,
		'N': 3,
		'L': 3,
		'A': [
			2.0,
			0.1,
			0.0,
			0.0,
			0.0,
			0.0,
			0.3,
			-0.2,
			3.0,
			0.4,
			0.0,
			0.0,
			0.1,
			0.3,
			0.2,
			-0.1,
			4.0,
			0.2
		],
		'B': [
			1.1,
			0.5,
			0.0,
			0.0,
			0.0,
			0.0,
			0.4,
			-0.3,
			1.5,
			0.2,
			0.0,
			0.0,
			0.6,
			0.1,
			0.3,
			-0.4,
			1.7,
			0.3
		]
	};
	defs.m3_n1_l1_complex = {
		'M': 3,
		'N': 1,
		'L': 1,
		'A': [ 5.0, 1.0 ],
		'B': [ 1.0, 0.5, 2.0, -0.3, 3.0, 0.4 ]
	};
	defs.m3_n2_l2_complex = {
		'M': 3,
		'N': 2,
		'L': 2,
		'A': [
			2.0,
			0.3,
			0.0,
			0.0,
			0.5,
			-0.2,
			3.0,
			0.4
		],
		'B': [
			1.0,
			0.2,
			1.1,
			-0.3,
			0.0,
			0.0,
			0.5,
			-0.1,
			0.6,
			0.5,
			0.4,
			0.3
		]
	};
	defs.m2_n4_l2_complex = {
		'M': 2,
		'N': 4,
		'L': 2,
		'A': [
			2.0,
			0.1,
			0.0,
			0.0,
			0.0,
			0.0,
			0.0,
			0.0,
			0.5,
			-0.2,
			3.0,
			0.3,
			0.0,
			0.0,
			0.0,
			0.0,
			0.2,
			0.1,
			0.4,
			-0.1,
			2.5,
			0.2,
			0.0,
			0.0,
			0.1,
			0.2,
			0.3,
			0.1,
			0.6,
			-0.3,
			3.5,
			0.4
		],
		'B': [
			1.0,
			0.4,
			0.0,
			0.0,
			0.5,
			-0.2,
			1.2,
			0.3,
			0.7,
			0.1,
			0.8,
			-0.4,
			0.3,
			0.2,
			0.6,
			0.1
		]
	};
	def = defs[ name ];
	out = {
		'M': def.M,
		'N': def.N,
		'L': def.L,
		'A': packC( def.A ),
		'B': packC( def.B ),
		'T': new Complex128Array( def.N * def.N ),
		'lda': def.N,
		'ldb': def.M,
		'ldt': def.N
	};
	return out;
}

/**
* Transposes a column-major complex matrix to a row-major Complex128Array.
*
* @private
* @param {Complex128Array} src - column-major source
* @param {NonNegativeInteger} m - number of rows
* @param {NonNegativeInteger} n - number of columns
* @returns {Complex128Array} row-major copy
*/
function colToRowC( src, m, n ) {
	var dst;
	var dv;
	var sv;
	var i;
	var j;
	dst = new Complex128Array( m * n );
	dv = reinterpret( dst, 0 );
	sv = reinterpret( src, 0 );
	for ( j = 0; j < n; j++ ) {
		for ( i = 0; i < m; i++ ) {
			dv[ ( ( ( i * n ) + j ) * 2 ) ] = sv[ ( ( i + ( j * m ) ) * 2 ) ];
			dv[ ( ( ( i * n ) + j ) * 2 ) + 1 ] = sv[ ( ( i + ( j * m ) ) * 2 ) + 1 ];
		}
	}
	return dst;
}

/**
* Transposes a row-major complex matrix to a column-major Float64Array (interleaved).
*
* @private
* @param {Complex128Array} src - row-major source
* @param {NonNegativeInteger} m - number of rows
* @param {NonNegativeInteger} n - number of columns
* @returns {Float64Array} interleaved column-major copy
*/
function rowToColF( src, m, n ) {
	var dst;
	var sv;
	var i;
	var j;
	dst = new Float64Array( 2 * m * n );
	sv = reinterpret( src, 0 );
	for ( j = 0; j < n; j++ ) {
		for ( i = 0; i < m; i++ ) {
			dst[ ( ( i + ( j * m ) ) * 2 ) ] = sv[ ( ( ( i * n ) + j ) * 2 ) ];
			dst[ ( ( i + ( j * m ) ) * 2 ) + 1 ] = sv[ ( ( ( i * n ) + j ) * 2 ) + 1 ];
		}
	}
	return dst;
}


// TESTS //

test( 'ndarray is a function', function t() {
	assert.strictEqual( typeof ztpqrt2, 'function', 'is a function' );
});

test( 'ndarray: throws when M is negative', function t() {
	assert.throws( function bad() {
		ztpqrt2( -1, 3, 0, new Complex128Array( 9 ), 1, 3, 0, new Complex128Array( 12 ), 1, 3, 0, new Complex128Array( 9 ), 1, 3, 0 );
	}, RangeError );
});

test( 'ndarray: throws when N is negative', function t() {
	assert.throws( function bad() {
		ztpqrt2( 3, -1, 0, new Complex128Array( 9 ), 1, 3, 0, new Complex128Array( 9 ), 1, 3, 0, new Complex128Array( 9 ), 1, 3, 0 );
	}, RangeError );
});

test( 'ndarray: throws when l is out of range', function t() {
	assert.throws( function bad() {
		ztpqrt2( 3, 3, 5, new Complex128Array( 9 ), 1, 3, 0, new Complex128Array( 9 ), 1, 3, 0, new Complex128Array( 9 ), 1, 3, 0 );
	}, RangeError );
});

test( 'ndarray: M=0 quick return', function t() {
	var info = ztpqrt2( 0, 3, 0, new Complex128Array( 9 ), 1, 3, 0, new Complex128Array( 0 ), 1, 0, 0, new Complex128Array( 9 ), 1, 3, 0 );
	assert.strictEqual( info, 0 );
});

test( 'ndarray: N=0 quick return', function t() {
	var info = ztpqrt2( 3, 0, 0, new Complex128Array( 0 ), 1, 0, 0, new Complex128Array( 0 ), 1, 0, 0, new Complex128Array( 0 ), 1, 0, 0 );
	assert.strictEqual( info, 0 );
});

[ 'm4_n3_l0_real', 'm4_n3_l3_complex', 'm3_n3_l3_complex', 'm3_n1_l1_complex', 'm3_n2_l2_complex', 'm2_n4_l2_complex' ].forEach( function each( name ) {
	test( 'ndarray column-major: ' + name + ' matches Fortran fixture', function t() {
		var info;
		var inp;
		var tc;
		inp = buildInputs( name );
		tc = findCase( name );
		info = ztpqrt2( inp.M, inp.N, inp.L, inp.A, 1, inp.lda, 0, inp.B, 1, inp.ldb, 0, inp.T, 1, inp.ldt, 0 );
		assert.strictEqual( info, 0 );
		assertArrayClose( reinterpret( inp.A, 0 ), tc.A, 1e-10, name + ':A' );
		assertArrayClose( reinterpret( inp.B, 0 ), tc.B, 1e-10, name + ':B' );
		assertArrayClose( reinterpret( inp.T, 0 ), tc.T, 1e-10, name + ':T' );
	});
});

test( 'ndarray row-major: m4_n3_l3_complex matches Fortran fixture', function t() {
	var info;
	var ARow;
	var BRow;
	var inp;
	var tc;
	var T;
	inp = buildInputs( 'm4_n3_l3_complex' );
	tc = findCase( 'm4_n3_l3_complex' );
	ARow = colToRowC( inp.A, inp.N, inp.N );
	BRow = colToRowC( inp.B, inp.M, inp.N );
	T = new Complex128Array( inp.N * inp.N );
	info = ztpqrt2( inp.M, inp.N, inp.L, ARow, inp.N, 1, 0, BRow, inp.N, 1, 0, T, inp.N, 1, 0 );
	assert.strictEqual( info, 0 );
	assertArrayClose( rowToColF( ARow, inp.N, inp.N ), tc.A, 1e-10, 'A (row-major)' );
	assertArrayClose( rowToColF( BRow, inp.M, inp.N ), tc.B, 1e-10, 'B (row-major)' );
	assertArrayClose( rowToColF( T, inp.N, inp.N ), tc.T, 1e-10, 'T (row-major)' );
});

test( 'ndarray: m3_n1_l0_complex L=0 single column rectangular B', function t() {
	// Custom case: M=3, N=1, L=0 (entire B is rectangular).
	var info;
	var inp;
	var Tv;
	inp = {};
	inp.A = packC( [ 4.0, 0.5 ] );
	inp.B = packC( [ 1.0, 0.2, 0.5, -0.1, 0.3, 0.4 ] );
	inp.T = new Complex128Array( 1 );
	info = ztpqrt2( 3, 1, 0, inp.A, 1, 1, 0, inp.B, 1, 3, 0, inp.T, 1, 1, 0 );
	Tv = reinterpret( inp.T, 0 );
	assert.strictEqual( info, 0 );
	assert.ok( ( Math.abs( Tv[ 0 ] ) + Math.abs( Tv[ 1 ] ) ) > 0, 'tau is non-zero' );
});
