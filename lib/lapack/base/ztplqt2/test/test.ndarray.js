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

/* eslint-disable no-restricted-syntax, stdlib/first-unit-test, max-len, node/no-sync, max-lines */

// MODULES //

import { readFileSync } from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import assert from 'node:assert/strict';
import format from '@stdlib/string/format/lib/index.js';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import ztplqt2 from './../lib/ndarray.js';


// FIXTURES //

var fixtureDir = path.join( import.meta.dirname, '..', '..', '..', '..', '..', 'test', 'fixtures' );
var lines = readFileSync( path.join( fixtureDir, 'ztplqt2.jsonl' ), 'utf8' ).trim().split( '\n' );
var fixture = lines.map( JSON.parse );


// FUNCTIONS //

/**
* Finds a fixture entry by name.
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
* @param {number} actual - actual
* @param {number} expected - expected
* @param {number} tol - relative tolerance
* @param {string} msg - message
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
* @param {string} msg - message
*/
function assertArrayClose( actual, expected, tol, msg ) {
	var i;
	assert.equal( actual.length, expected.length, msg + ': length mismatch' );
	for ( i = 0; i < expected.length; i++ ) {
		assertClose( actual[ i ], expected[ i ], tol, msg + '[' + i + ']' );
	}
}


// TESTS //

test( 'ndarray is a function', function t() {
	assert.strictEqual( typeof ztplqt2, 'function', 'is a function' );
});

test( 'ndarray: throws when M is negative', function t() {
	assert.throws( function bad() {
		ztplqt2( -1, 3, 0, new Complex128Array( 9 ), 1, 3, 0, new Complex128Array( 9 ), 1, 3, 0, new Complex128Array( 9 ), 1, 3, 0 );
	}, RangeError );
});

test( 'ndarray: throws when N is negative', function t() {
	assert.throws( function bad() {
		ztplqt2( 3, -1, 0, new Complex128Array( 9 ), 1, 3, 0, new Complex128Array( 9 ), 1, 3, 0, new Complex128Array( 9 ), 1, 3, 0 );
	}, RangeError );
});

test( 'ndarray: throws when l is out of range', function t() {
	assert.throws( function bad() {
		ztplqt2( 3, 3, 5, new Complex128Array( 9 ), 1, 3, 0, new Complex128Array( 9 ), 1, 3, 0, new Complex128Array( 9 ), 1, 3, 0 );
	}, RangeError );
});

test( 'ndarray: M=0 quick return', function t() {
	var info = ztplqt2( 0, 3, 0, new Complex128Array( 9 ), 1, 3, 0, new Complex128Array( 9 ), 1, 3, 0, new Complex128Array( 9 ), 1, 3, 0 );
	assert.strictEqual( info, 0 );
});

test( 'ndarray: N=0 quick return', function t() {
	var info = ztplqt2( 3, 0, 0, new Complex128Array( 9 ), 1, 3, 0, new Complex128Array( 9 ), 1, 3, 0, new Complex128Array( 9 ), 1, 3, 0 );
	assert.strictEqual( info, 0 );
});

test( 'ndarray: m3_n4_l0_real (real-valued complex) matches Fortran fixture', function t() {
	var info;
	var tc = findCase( 'm3_n4_l0_real' );
	var A;
	var B;
	var T;

	// 3x3 lower-triangular A in column-major, packed (LDA=3): each pair is (re, im)
	A = new Complex128Array([
		2.0,
		0.0,
		0.5,
		0.0,
		0.25,
		0.0,
		0.0,
		0.0,
		3.0,
		0.0,
		0.75,
		0.0,
		0.0,
		0.0,
		0.0,
		0.0,
		4.0,
		0.0
	]);

	// 3x4 B in column-major, packed
	B = new Complex128Array([
		1.0,
		0.0,
		0.3,
		0.0,
		0.7,
		0.0,
		0.5,
		0.0,
		1.1,
		0.0,
		0.4,
		0.0,
		0.25,
		0.0,
		0.6,
		0.0,
		1.2,
		0.0,
		0.125,
		0.0,
		0.2,
		0.0,
		0.9,
		0.0
	]);
	T = new Complex128Array( 9 );

	info = ztplqt2( 3, 4, 0, A, 1, 3, 0, B, 1, 3, 0, T, 1, 3, 0 );
	assert.strictEqual( info, 0 );
	assertArrayClose( reinterpret( A, 0 ), tc.A, 1e-10, 'A' );
	assertArrayClose( reinterpret( B, 0 ), tc.B, 1e-10, 'B' );
	assertArrayClose( reinterpret( T, 0 ), tc.T, 1e-10, 'T' );
});

test( 'ndarray: m3_n4_l3_complex matches Fortran fixture', function t() {
	var info;
	var tc = findCase( 'm3_n4_l3_complex' );
	var A;
	var B;
	var T;

	A = new Complex128Array([
		2.0,
		0.5,
		0.5,
		0.1,
		0.25,
		0.2,
		0.0,
		0.0,
		3.0,
		-0.3,
		0.75,
		-0.1,
		0.0,
		0.0,
		0.0,
		0.0,
		4.0,
		0.4
	]);
	B = new Complex128Array([
		1.0,
		0.3,
		0.3,
		-0.1,
		0.7,
		0.2,
		0.5,
		0.2,
		1.1,
		0.4,
		0.4,
		-0.2,
		0.0,
		0.0,
		0.6,
		0.1,
		1.2,
		0.3,
		0.0,
		0.0,
		0.0,
		0.0,
		0.9,
		-0.1
	]);
	T = new Complex128Array( 9 );

	info = ztplqt2( 3, 4, 3, A, 1, 3, 0, B, 1, 3, 0, T, 1, 3, 0 );
	assert.strictEqual( info, 0 );
	assertArrayClose( reinterpret( A, 0 ), tc.A, 1e-10, 'A' );
	assertArrayClose( reinterpret( B, 0 ), tc.B, 1e-10, 'B' );
	assertArrayClose( reinterpret( T, 0 ), tc.T, 1e-10, 'T' );
});

test( 'ndarray: m3_n3_l3_complex matches Fortran fixture (B fully lower triangular)', function t() {
	var info;
	var tc = findCase( 'm3_n3_l3_complex' );
	var A;
	var B;
	var T;

	A = new Complex128Array([
		2.0,
		0.1,
		0.3,
		-0.2,
		0.1,
		0.3,
		0.0,
		0.0,
		3.0,
		0.4,
		0.2,
		-0.1,
		0.0,
		0.0,
		0.0,
		0.0,
		4.0,
		0.2
	]);
	B = new Complex128Array([
		1.1,
		0.5,
		0.4,
		-0.3,
		0.6,
		0.1,
		0.0,
		0.0,
		1.5,
		0.2,
		0.3,
		-0.4,
		0.0,
		0.0,
		0.0,
		0.0,
		1.7,
		0.3
	]);
	T = new Complex128Array( 9 );

	info = ztplqt2( 3, 3, 3, A, 1, 3, 0, B, 1, 3, 0, T, 1, 3, 0 );
	assert.strictEqual( info, 0 );
	assertArrayClose( reinterpret( A, 0 ), tc.A, 1e-10, 'A' );
	assertArrayClose( reinterpret( B, 0 ), tc.B, 1e-10, 'B' );
	assertArrayClose( reinterpret( T, 0 ), tc.T, 1e-10, 'T' );
});

test( 'ndarray: m1_n3_l1_complex matches Fortran fixture (M=1 trivial)', function t() {
	var info;
	var tc = findCase( 'm1_n3_l1_complex' );
	var A;
	var B;
	var T;

	A = new Complex128Array( [ 5.0, 1.0 ] );
	B = new Complex128Array( [ 1.0, 0.5, 2.0, -0.3, 3.0, 0.4 ] );
	T = new Complex128Array( 1 );

	info = ztplqt2( 1, 3, 1, A, 1, 1, 0, B, 1, 1, 0, T, 1, 1, 0 );
	assert.strictEqual( info, 0 );
	assertArrayClose( reinterpret( A, 0 ), tc.A, 1e-10, 'A' );
	assertArrayClose( reinterpret( B, 0 ), tc.B, 1e-10, 'B' );
	assertArrayClose( reinterpret( T, 0 ), tc.T, 1e-10, 'T' );
});

test( 'ndarray: m2_n3_l2_complex matches Fortran fixture', function t() {
	var info;
	var tc = findCase( 'm2_n3_l2_complex' );
	var A;
	var B;
	var T;

	// 2x2 column-major: col0=[A(0,0), A(1,0)], col1=[A(0,1)=0, A(1,1)]
	A = new Complex128Array([
		2.0,
		0.3,
		0.5,
		-0.2,
		0.0,
		0.0,
		3.0,
		0.4
	]);

	// 2x3 column-major
	B = new Complex128Array([
		1.0,
		0.2,
		0.3,
		0.4,
		0.5,
		-0.1,
		1.1,
		-0.3,
		0.0,
		0.0,
		0.6,
		0.5
	]);
	T = new Complex128Array( 4 );

	info = ztplqt2( 2, 3, 2, A, 1, 2, 0, B, 1, 2, 0, T, 1, 2, 0 );
	assert.strictEqual( info, 0 );
	assertArrayClose( reinterpret( A, 0 ), tc.A, 1e-10, 'A' );
	assertArrayClose( reinterpret( B, 0 ), tc.B, 1e-10, 'B' );
	assertArrayClose( reinterpret( T, 0 ), tc.T, 1e-10, 'T' );
});

test( 'ndarray: m4_n2_l2_complex matches Fortran fixture (tall)', function t() {
	var info;
	var tc = findCase( 'm4_n2_l2_complex' );
	var A;
	var B;
	var T;

	// 4x4 column-major lower triangular A
	A = new Complex128Array([
		2.0,
		0.1,
		0.5,
		-0.2,
		0.2,
		0.1,
		0.1,
		0.2,
		0.0,
		0.0,
		3.0,
		0.3,
		0.4,
		-0.1,
		0.3,
		0.1,
		0.0,
		0.0,
		0.0,
		0.0,
		2.5,
		0.2,
		0.6,
		-0.3,
		0.0,
		0.0,
		0.0,
		0.0,
		0.0,
		0.0,
		3.5,
		0.4
	]);

	// 4x2 column-major B
	B = new Complex128Array([
		1.0,
		0.4,
		0.5,
		-0.2,
		0.7,
		0.1,
		0.3,
		0.2,
		0.0,
		0.0,
		1.2,
		0.3,
		0.8,
		-0.4,
		0.6,
		0.1
	]);
	T = new Complex128Array( 16 );

	info = ztplqt2( 4, 2, 2, A, 1, 4, 0, B, 1, 4, 0, T, 1, 4, 0 );
	assert.strictEqual( info, 0 );
	assertArrayClose( reinterpret( A, 0 ), tc.A, 1e-10, 'A' );
	assertArrayClose( reinterpret( B, 0 ), tc.B, 1e-10, 'B' );
	assertArrayClose( reinterpret( T, 0 ), tc.T, 1e-10, 'T' );
});

test( 'ndarray: real-valued complex inputs return info=0 (smoke)', function t() {
	var info;
	var A;
	var B;
	var T;

	A = new Complex128Array([
		2.0,
		0.0,
		0.5,
		0.0,
		0.25,
		0.0,
		0.0,
		0.0,
		3.0,
		0.0,
		0.75,
		0.0,
		0.0,
		0.0,
		0.0,
		0.0,
		4.0,
		0.0
	]);
	B = new Complex128Array([
		0.9,
		0.0,
		0.2,
		0.0,
		0.6,
		0.0,
		0.0,
		0.0,
		1.3,
		0.0,
		0.4,
		0.0,
		0.0,
		0.0,
		0.0,
		0.0,
		1.1,
		0.0
	]);
	T = new Complex128Array( 9 );
	info = ztplqt2( 3, 3, 2, A, 1, 3, 0, B, 1, 3, 0, T, 1, 3, 0 );
	assert.strictEqual( info, 0 );
});
