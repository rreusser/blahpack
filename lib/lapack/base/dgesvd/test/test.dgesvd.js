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

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dgesvd from './../lib/dgesvd.js';


// FIXTURES //

// 3x3 row-major matrix used across tests.
var A_DATA = [ 1.0, 2.0, 3.0, 4.0, 5.0, 6.0, 7.0, 8.0, 10.0 ];

// Same data, transposed for column-major storage.
var A_DATA_COL = [ 1.0, 4.0, 7.0, 2.0, 5.0, 8.0, 3.0, 6.0, 10.0 ];

// Expected dominant singular value (matches Fortran reference).
var SIGMA1 = 17.4125;


// TESTS //

test( 'dgesvd is a function', function t() {
	assert.strictEqual( typeof dgesvd, 'function', 'is a function' );
});

test( 'dgesvd has expected arity', function t() {
	assert.strictEqual( dgesvd.length, 13, 'has expected arity' );
});

test( 'dgesvd throws TypeError for invalid order', function t() {
	var VT;
	var A;
	var s;
	var U;
	A = new Float64Array( A_DATA );
	s = new Float64Array( 3 );
	U = new Float64Array( 9 );
	VT = new Float64Array( 9 );
	assert.throws( function throws() {
		dgesvd( 'invalid', 'all-columns', 'all-rows', 3, 3, A, 3, s, 1, U, 3, VT, 3 );
	}, TypeError );
});

test( 'dgesvd throws TypeError for invalid jobu', function t() {
	var VT;
	var A;
	var s;
	var U;
	A = new Float64Array( A_DATA );
	s = new Float64Array( 3 );
	U = new Float64Array( 9 );
	VT = new Float64Array( 9 );
	assert.throws( function throws() {
		dgesvd( 'row-major', 'invalid', 'all-rows', 3, 3, A, 3, s, 1, U, 3, VT, 3 );
	}, TypeError );
});

test( 'dgesvd throws TypeError for invalid jobvt', function t() {
	var VT;
	var A;
	var s;
	var U;
	A = new Float64Array( A_DATA );
	s = new Float64Array( 3 );
	U = new Float64Array( 9 );
	VT = new Float64Array( 9 );
	assert.throws( function throws() {
		dgesvd( 'row-major', 'all-columns', 'invalid', 3, 3, A, 3, s, 1, U, 3, VT, 3 );
	}, TypeError );
});

test( 'dgesvd throws RangeError for negative M', function t() {
	var VT;
	var A;
	var s;
	var U;
	A = new Float64Array( A_DATA );
	s = new Float64Array( 3 );
	U = new Float64Array( 9 );
	VT = new Float64Array( 9 );
	assert.throws( function throws() {
		dgesvd( 'row-major', 'all-columns', 'all-rows', -1, 3, A, 3, s, 1, U, 3, VT, 3 );
	}, RangeError );
});

test( 'dgesvd throws RangeError for negative N', function t() {
	var VT;
	var A;
	var s;
	var U;
	A = new Float64Array( A_DATA );
	s = new Float64Array( 3 );
	U = new Float64Array( 9 );
	VT = new Float64Array( 9 );
	assert.throws( function throws() {
		dgesvd( 'row-major', 'all-columns', 'all-rows', 3, -1, A, 3, s, 1, U, 3, VT, 3 );
	}, RangeError );
});

test( 'dgesvd throws RangeError for LDA below max(1,N) (row-major)', function t() {
	var VT;
	var A;
	var s;
	var U;
	A = new Float64Array( A_DATA );
	s = new Float64Array( 3 );
	U = new Float64Array( 9 );
	VT = new Float64Array( 9 );
	assert.throws( function throws() {
		dgesvd( 'row-major', 'all-columns', 'all-rows', 3, 3, A, 1, s, 1, U, 3, VT, 3 );
	}, RangeError );
});

test( 'dgesvd computes singular values for a 3x3 matrix (row-major, all/all)', function t() {
	var info;
	var VT;
	var A;
	var s;
	var U;
	A = new Float64Array( A_DATA );
	s = new Float64Array( 3 );
	U = new Float64Array( 9 );
	VT = new Float64Array( 9 );
	info = dgesvd( 'row-major', 'all-columns', 'all-rows', 3, 3, A, 3, s, 1, U, 3, VT, 3 );
	assert.strictEqual( info, 0, 'info=0' );
	assert.ok( s[ 0 ] > s[ 1 ] && s[ 1 ] > s[ 2 ], 'singular values descending' );
	assert.ok( Math.abs( s[ 0 ] - SIGMA1 ) < 1e-3, 'first singular value matches expected' );
});

test( 'dgesvd computes singular values for a 3x3 matrix (column-major, all/all)', function t() {
	var info;
	var VT;
	var A;
	var s;
	var U;
	A = new Float64Array( A_DATA_COL );
	s = new Float64Array( 3 );
	U = new Float64Array( 9 );
	VT = new Float64Array( 9 );
	info = dgesvd( 'column-major', 'all-columns', 'all-rows', 3, 3, A, 3, s, 1, U, 3, VT, 3 );
	assert.strictEqual( info, 0, 'info=0' );
	assert.ok( s[ 0 ] > s[ 1 ] && s[ 1 ] > s[ 2 ], 'singular values descending' );
	assert.ok( Math.abs( s[ 0 ] - SIGMA1 ) < 1e-3, 'first singular value matches expected' );
});

test( 'dgesvd accepts jobu=none jobvt=none and skips U/VT', function t() {
	var info;
	var VT;
	var A;
	var s;
	var U;
	A = new Float64Array( A_DATA );
	s = new Float64Array( 3 );
	U = new Float64Array( 1 );
	VT = new Float64Array( 1 );
	info = dgesvd( 'row-major', 'none', 'none', 3, 3, A, 3, s, 1, U, 3, VT, 3 );
	assert.strictEqual( info, 0, 'info=0' );
	assert.ok( s[ 0 ] > 0, 'singular values computed' );
});
