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

/* eslint-disable no-restricted-syntax, stdlib/first-unit-test, max-len, max-lines */

// MODULES //

import { readFileSync } from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import zunm22 from './../lib/ndarray.js';


// FIXTURES //

var fixtureDir = path.join( import.meta.dirname, '..', '..', '..', '..', '..', 'test', 'fixtures' );
var lines = readFileSync( path.join( fixtureDir, 'zunm22.jsonl' ), 'utf8' ).trim().split( '\n' ); // eslint-disable-line node/no-sync
var fixture = lines.map( parse );


// FUNCTIONS //

/**
* Parses a JSONL line.
*
* @private
* @param {string} line - line of JSON text
* @returns {Object} parsed object
*/
function parse( line ) {
	return JSON.parse( line );
}

/**
* Finds a named fixture case.
*
* @private
* @param {string} name - case name
* @returns {Object} fixture case
*/
function findCase( name ) {
	var i;
	for ( i = 0; i < fixture.length; i++ ) {
		if ( fixture[ i ].name === name ) {
			return fixture[ i ];
		}
	}
	return null;
}

/**
* Asserts that two floats are close.
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
* Asserts that two arrays are elementwise close.
*
* @private
* @param {Object} actual - actual array
* @param {Object} expected - expected array
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
* Builds the banded Q matrix used by the Fortran test (NQ=5, N1=3, N2=2).
*
* @private
* @returns {Complex128Array} Q packed column-major, LDQ=5
*/
function buildQ532() {
	var data = new Float64Array( 2 * 5 * 5 );

	// Column 1: (1,1)=0.5+0.1i, (2,1)=0.2-0.1i, (3,1)=-0.4+0.15i, (4,1)=0.6-0.3i, (5,1)=0
	data[ 0 ] = 0.5;
	data[ 1 ] = 0.1;
	data[ 2 ] = 0.2;
	data[ 3 ] = -0.1;
	data[ 4 ] = -0.4;
	data[ 5 ] = 0.15;
	data[ 6 ] = 0.6;
	data[ 7 ] = -0.3;

	// Column 2: (1,2)=-0.3+0.2i, (2,2)=0.8+0.05i, (3,2)=0.1-0.2i, (4,2)=-0.2+0.5i, (5,2)=1.3+0.1i
	data[ 10 ] = -0.3;
	data[ 11 ] = 0.2;
	data[ 12 ] = 0.8;
	data[ 13 ] = 0.05;
	data[ 14 ] = 0.1;
	data[ 15 ] = -0.2;
	data[ 16 ] = -0.2;
	data[ 17 ] = 0.5;
	data[ 18 ] = 1.3;
	data[ 19 ] = 0.1;

	// Column 3: (1,3)=1.1+0.3i, (2,3)=0.7-0.2i, (3,3)=-0.5+0.1i, (4,3)=0.3+0.2i, (5,3)=-0.7+0.3i
	data[ 20 ] = 1.1;
	data[ 21 ] = 0.3;
	data[ 22 ] = 0.7;
	data[ 23 ] = -0.2;
	data[ 24 ] = -0.5;
	data[ 25 ] = 0.1;
	data[ 26 ] = 0.3;
	data[ 27 ] = 0.2;
	data[ 28 ] = -0.7;
	data[ 29 ] = 0.3;

	// Column 4: (2,4)=0.9+0.4i, (3,4)=0.4+0i, (4,4)=-0.1-0.4i, (5,4)=0.4+0.2i
	data[ 32 ] = 0.9;
	data[ 33 ] = 0.4;
	data[ 34 ] = 0.4;
	data[ 36 ] = -0.1;
	data[ 37 ] = -0.4;
	data[ 38 ] = 0.4;
	data[ 39 ] = 0.2;

	// Column 5: (3,5)=1.2-0.1i, (4,5)=0.5+0.1i, (5,5)=0.2-0.3i
	data[ 44 ] = 1.2;
	data[ 45 ] = -0.1;
	data[ 46 ] = 0.5;
	data[ 47 ] = 0.1;
	data[ 48 ] = 0.2;
	data[ 49 ] = -0.3;
	return new Complex128Array( data.buffer );
}

/**
* Builds matrix C with affine complex pattern, column-major, LDC=M.
*
* @private
* @param {number} M - rows
* @param {number} N - cols
* @returns {Complex128Array} C packed column-major
*/
function buildCAffine( M, N ) {
	var data;
	var idx;
	var i;
	var j;
	data = new Float64Array( 2 * M * N );
	for ( j = 1; j <= N; j++ ) {
		for ( i = 1; i <= M; i++ ) {
			idx = 2 * ( ( (j-1) * M ) + (i-1) );
			data[ idx ] = ( ( i - 2 + j ) * 0.25 ) + 0.1;
			data[ idx + 1 ] = ( i + j ) * 0.1;
		}
	}
	return new Complex128Array( data.buffer );
}

/**
* Builds the 3x3 upper-triangular complex Q used in the n1=0 fixture case.
*
* @private
* @returns {Complex128Array} Q packed column-major, LDQ=3
*/
function buildQUpper3() {
	var data = new Float64Array( 2 * 3 * 3 );

	// Column 1: (1,1)=1.0+0.2i
	data[ 0 ] = 1.0;
	data[ 1 ] = 0.2;

	// Column 2: (1,2)=0.5-0.1i, (2,2)=0.8+0i
	data[ 6 ] = 0.5;
	data[ 7 ] = -0.1;
	data[ 8 ] = 0.8;

	// Column 3: (1,3)=-0.2+0.3i, (2,3)=0.3+0.2i, (3,3)=1.2-0.4i
	data[ 12 ] = -0.2;
	data[ 13 ] = 0.3;
	data[ 14 ] = 0.3;
	data[ 15 ] = 0.2;
	data[ 16 ] = 1.2;
	data[ 17 ] = -0.4;
	return new Complex128Array( data.buffer );
}

/**
* Builds the 3x3 lower-triangular complex Q used in the n2=0 fixture case.
*
* @private
* @returns {Complex128Array} Q packed column-major, LDQ=3
*/
function buildQLower3() {
	var data = new Float64Array( 2 * 3 * 3 );

	// Column 1: (1,1)=1.0+0.1i, (2,1)=0.4+0.2i, (3,1)=-0.3+0.25i
	data[ 0 ] = 1.0;
	data[ 1 ] = 0.1;
	data[ 2 ] = 0.4;
	data[ 3 ] = 0.2;
	data[ 4 ] = -0.3;
	data[ 5 ] = 0.25;

	// Column 2: (2,2)=0.9-0.1i, (3,2)=0.6+0.3i
	data[ 8 ] = 0.9;
	data[ 9 ] = -0.1;
	data[ 10 ] = 0.6;
	data[ 11 ] = 0.3;

	// Column 3: (3,3)=1.1-0.2i
	data[ 16 ] = 1.1;
	data[ 17 ] = -0.2;
	return new Complex128Array( data.buffer );
}


// TESTS //

test( 'zunm22: left, no-transpose', function t() {
	var WORK;
	var info;
	var n1;
	var n2;
	var tc;
	var M;
	var N;
	var Q;
	var C;
	tc = findCase( 'left_notrans' );
	M = 5;
	N = 4;
	n1 = 3;
	n2 = 2;
	Q = buildQ532();
	C = buildCAffine( M, N );
	WORK = new Complex128Array( Math.max( 1, M * N ) );
	info = zunm22( 'left', 'no-transpose', M, N, n1, n2, Q, 1, 5, 0, C, 1, M, 0, WORK, 1, 0, WORK.length );
	assert.equal( info, 0, 'info' );
	assertArrayClose( reinterpret( C, 0 ), tc.c, 1e-13, 'c' );
});

test( 'zunm22: left, conjugate-transpose', function t() {
	var WORK;
	var info;
	var n1;
	var n2;
	var tc;
	var M;
	var N;
	var Q;
	var C;
	tc = findCase( 'left_conjtrans' );
	M = 5;
	N = 4;
	n1 = 3;
	n2 = 2;
	Q = buildQ532();
	C = buildCAffine( M, N );
	WORK = new Complex128Array( Math.max( 1, M * N ) );
	info = zunm22( 'left', 'conjugate-transpose', M, N, n1, n2, Q, 1, 5, 0, C, 1, M, 0, WORK, 1, 0, WORK.length );
	assert.equal( info, 0, 'info' );
	assertArrayClose( reinterpret( C, 0 ), tc.c, 1e-13, 'c' );
});

test( 'zunm22: right, no-transpose', function t() {
	var WORK;
	var info;
	var n1;
	var n2;
	var tc;
	var M;
	var N;
	var Q;
	var C;
	tc = findCase( 'right_notrans' );
	M = 4;
	N = 5;
	n1 = 3;
	n2 = 2;
	Q = buildQ532();
	C = buildCAffine( M, N );
	WORK = new Complex128Array( Math.max( 1, M * N ) );
	info = zunm22( 'right', 'no-transpose', M, N, n1, n2, Q, 1, 5, 0, C, 1, M, 0, WORK, 1, 0, WORK.length );
	assert.equal( info, 0, 'info' );
	assertArrayClose( reinterpret( C, 0 ), tc.c, 1e-13, 'c' );
});

test( 'zunm22: right, conjugate-transpose', function t() {
	var WORK;
	var info;
	var n1;
	var n2;
	var tc;
	var M;
	var N;
	var Q;
	var C;
	tc = findCase( 'right_conjtrans' );
	M = 4;
	N = 5;
	n1 = 3;
	n2 = 2;
	Q = buildQ532();
	C = buildCAffine( M, N );
	WORK = new Complex128Array( Math.max( 1, M * N ) );
	info = zunm22( 'right', 'conjugate-transpose', M, N, n1, n2, Q, 1, 5, 0, C, 1, M, 0, WORK, 1, 0, WORK.length );
	assert.equal( info, 0, 'info' );
	assertArrayClose( reinterpret( C, 0 ), tc.c, 1e-13, 'c' );
});

test( 'zunm22: n1=0 (pure upper-triangular) left no-transpose', function t() {
	var Cdata;
	var WORK;
	var info;
	var idx;
	var n1;
	var n2;
	var tc;
	var M;
	var N;
	var Q;
	var C;
	var i;
	var j;
	tc = findCase( 'n1_zero_left_notrans' );
	M = 3;
	N = 4;
	n1 = 0;
	n2 = 3;
	Q = buildQUpper3();
	Cdata = new Float64Array( 2 * M * N );
	for ( j = 1; j <= N; j++ ) {
		for ( i = 1; i <= M; i++ ) {
			idx = 2 * ( ( (j-1) * M ) + (i-1) );
			Cdata[ idx ] = ( i + j ) * 0.3;
			Cdata[ idx + 1 ] = ( i - j ) * 0.15;
		}
	}
	C = new Complex128Array( Cdata.buffer );
	WORK = new Complex128Array( Math.max( 1, M * N ) );
	info = zunm22( 'left', 'no-transpose', M, N, n1, n2, Q, 1, 3, 0, C, 1, M, 0, WORK, 1, 0, WORK.length );
	assert.equal( info, 0, 'info' );
	assertArrayClose( reinterpret( C, 0 ), tc.c, 1e-13, 'c' );
});

test( 'zunm22: n2=0 (pure lower-triangular) right conjugate-transpose', function t() {
	var Cdata;
	var WORK;
	var info;
	var idx;
	var n1;
	var n2;
	var tc;
	var M;
	var N;
	var Q;
	var C;
	var i;
	var j;
	tc = findCase( 'n2_zero_right_conjtrans' );
	M = 4;
	N = 3;
	n1 = 3;
	n2 = 0;
	Q = buildQLower3();
	Cdata = new Float64Array( 2 * M * N );
	for ( j = 1; j <= N; j++ ) {
		for ( i = 1; i <= M; i++ ) {
			idx = 2 * ( ( (j-1) * M ) + (i-1) );
			Cdata[ idx ] = ( ( i - j ) * 0.2 ) + 0.5;
			Cdata[ idx + 1 ] = ( i + j ) * 0.1;
		}
	}
	C = new Complex128Array( Cdata.buffer );
	WORK = new Complex128Array( Math.max( 1, M * N ) );
	info = zunm22( 'right', 'conjugate-transpose', M, N, n1, n2, Q, 1, 3, 0, C, 1, M, 0, WORK, 1, 0, WORK.length );
	assert.equal( info, 0, 'info' );
	assertArrayClose( reinterpret( C, 0 ), tc.c, 1e-13, 'c' );
});

test( 'zunm22: M=0 quick return', function t() {
	var WORK;
	var info;
	var Q;
	var C;
	Q = new Complex128Array( 1 );
	C = new Complex128Array( 1 );
	WORK = new Complex128Array( 1 );
	info = zunm22( 'left', 'no-transpose', 0, 4, 0, 0, Q, 1, 1, 0, C, 1, 1, 0, WORK, 1, 0, 1 );
	assert.equal( info, 0, 'info' );
});

test( 'zunm22: N=0 quick return', function t() {
	var WORK;
	var info;
	var Q;
	var C;
	Q = new Complex128Array( 25 );
	C = new Complex128Array( 5 );
	WORK = new Complex128Array( 5 );
	info = zunm22( 'left', 'no-transpose', 5, 0, 3, 2, Q, 1, 5, 0, C, 1, 5, 0, WORK, 1, 0, 5 );
	assert.equal( info, 0, 'info' );
});

test( 'zunm22: insufficient lwork returns -12', function t() {
	var WORK;
	var info;
	var Q;
	var C;
	Q = buildQ532();
	C = buildCAffine( 5, 4 );
	WORK = new Complex128Array( 2 );

	// NQ = M = 5, NW = 5, LWORK = 2 < 5 means info = -12.
	info = zunm22( 'left', 'no-transpose', 5, 4, 3, 2, Q, 1, 5, 0, C, 1, 5, 0, WORK, 1, 0, 2 );
	assert.equal( info, -12, 'info' );
});
