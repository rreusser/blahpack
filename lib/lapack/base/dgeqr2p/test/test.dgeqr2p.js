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

/* eslint-disable no-restricted-syntax, stdlib/first-unit-test, max-len */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dgeqr2p from './../lib/dgeqr2p.js';


// TESTS //

test( 'dgeqr2p is a function', function t() {
	assert.strictEqual( typeof dgeqr2p, 'function', 'is a function' );
});

test( 'dgeqr2p has expected arity', function t() {
	assert.strictEqual( dgeqr2p.length, 9, 'has expected arity' );
});

test( 'dgeqr2p throws TypeError for invalid order', function t() {
	assert.throws( function throws() {
		dgeqr2p( 'invalid', 2, 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2 );
	}, TypeError );
});

test( 'dgeqr2p throws RangeError for negative M', function t() {
	assert.throws( function throws() {
		dgeqr2p( 'row-major', -1, 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2 );
	}, RangeError );
});

test( 'dgeqr2p throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		dgeqr2p( 'row-major', 2, -1, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2 );
	}, RangeError );
});

test( 'dgeqr2p throws RangeError when LDA is too small (row-major)', function t() {
	assert.throws( function throws() {
		dgeqr2p( 'row-major', 2, 3, new Float64Array( 6 ), 1, new Float64Array( 3 ), 1, new Float64Array( 3 ), 1 );
	}, RangeError );
});

test( 'dgeqr2p throws RangeError when LDA is too small (column-major)', function t() {
	assert.throws( function throws() {
		dgeqr2p( 'column-major', 3, 2, new Float64Array( 6 ), 1, new Float64Array( 2 ), 1, new Float64Array( 2 ), 1 );
	}, RangeError );
});

test( 'dgeqr2p computes with row-major layout', function t() {
	var WORK;
	var info;
	var TAU;
	var A;

	// 3x2 row-major:
	A = new Float64Array( [ 1.0, 2.0, 3.0, 4.0, 5.0, 6.0 ] );
	TAU = new Float64Array( 2 );
	WORK = new Float64Array( 2 );
	info = dgeqr2p( 'row-major', 3, 2, A, 2, TAU, 1, WORK, 1 );
	assert.strictEqual( info, 0 );
	assert.ok( A[ 0 ] >= 0, 'R[0,0] non-negative' );
});
