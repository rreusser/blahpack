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
import dgeqr2p from './../lib/index.js';


// TESTS //

test( 'main export is a function', function t() {
	assert.strictEqual( typeof dgeqr2p, 'function', 'main export is a function' );
});

test( 'main export has an ndarray method', function t() {
	assert.strictEqual( typeof dgeqr2p.ndarray, 'function', 'has ndarray method' );
});

test( 'main export throws on invalid order', function t() {
	assert.throws( function throws() {
		dgeqr2p( 'invalid', 2, 2, new Float64Array( 4 ), 2, new Float64Array( 2 ), 1, new Float64Array( 2 ), 1 ); // eslint-disable-line max-len
	}, TypeError );
});

test( 'main export produces non-negative R diagonal', function t() {
	var WORK;
	var info;
	var TAU;
	var A;

	A = new Float64Array( [ -1.0, 3.0, 5.0, 2.0, -4.0, 6.0 ] );
	TAU = new Float64Array( 2 );
	WORK = new Float64Array( 2 );
	info = dgeqr2p( 'column-major', 3, 2, A, 3, TAU, 1, WORK, 1 );
	assert.strictEqual( info, 0 );
	assert.ok( A[ 0 ] >= 0, 'R[0,0] non-negative' );
	assert.ok( A[ 4 ] >= 0, 'R[1,1] non-negative' );
});

test( 'ndarray method produces non-negative R diagonal', function t() {
	var WORK;
	var info;
	var TAU;
	var A;

	A = new Float64Array( [ -1.0, 3.0, 5.0, 2.0, -4.0, 6.0 ] );
	TAU = new Float64Array( 2 );
	WORK = new Float64Array( 2 );
	info = dgeqr2p.ndarray( 3, 2, A, 1, 3, 0, TAU, 1, 0, WORK, 1, 0 );
	assert.strictEqual( info, 0 );
	assert.ok( A[ 0 ] >= 0, 'R[0,0] non-negative' );
	assert.ok( A[ 4 ] >= 0, 'R[1,1] non-negative' );
});

test( 'ndarray method throws RangeError for negative M', function t() {
	assert.throws( function throws() {
		dgeqr2p.ndarray( -1, 2, new Float64Array( 4 ), 1, 2, 0, new Float64Array( 2 ), 1, 0, new Float64Array( 2 ), 1, 0 ); // eslint-disable-line max-len
	}, RangeError );
});

test( 'ndarray method throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		dgeqr2p.ndarray( 2, -1, new Float64Array( 4 ), 1, 2, 0, new Float64Array( 2 ), 1, 0, new Float64Array( 2 ), 1, 0 ); // eslint-disable-line max-len
	}, RangeError );
});

test( 'ndarray method handles M=0 quick return', function t() {
	var info = dgeqr2p.ndarray( 0, 2, new Float64Array( 4 ), 1, 1, 0, new Float64Array( 2 ), 1, 0, new Float64Array( 2 ), 1, 0 ); // eslint-disable-line max-len
	assert.strictEqual( info, 0 );
});
