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

/* eslint-disable no-restricted-syntax */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dormbr from './../lib/dormbr.js';
import strided from './../lib/strided.js';
import { computeOptimalWorkSize } from './../lib/base.js';


// TESTS //

test( 'dormbr is a function', function t() {
	assert.strictEqual( typeof dormbr, 'function', 'is a function' );
});

test( 'dormbr has expected arity', function t() {
	assert.strictEqual( dormbr.length, 14, 'has expected arity' );
});

test( 'dormbr throws TypeError for invalid order', function t() {
	assert.throws( function throws() {
		dormbr( 'invalid', 'apply-Q', 'left', 'no-transpose', 2, 2, 2, new Float64Array( 4 ), 2, new Float64Array( 2 ), 1, new Float64Array( 4 ), 2, new Float64Array( 2 ) );
	}, TypeError );
});

test( 'dormbr throws TypeError for invalid vect', function t() {
	assert.throws( function throws() {
		dormbr( 'row-major', 'invalid', 'left', 'no-transpose', 2, 2, 2, new Float64Array( 4 ), 2, new Float64Array( 2 ), 1, new Float64Array( 4 ), 2, new Float64Array( 2 ) );
	}, TypeError );
});

test( 'dormbr throws TypeError for invalid side', function t() {
	assert.throws( function throws() {
		dormbr( 'row-major', 'apply-Q', 'invalid', 'no-transpose', 2, 2, 2, new Float64Array( 4 ), 2, new Float64Array( 2 ), 1, new Float64Array( 4 ), 2, new Float64Array( 2 ) );
	}, TypeError );
});

test( 'dormbr throws TypeError for invalid trans', function t() {
	assert.throws( function throws() {
		dormbr( 'row-major', 'apply-Q', 'left', 'invalid', 2, 2, 2, new Float64Array( 4 ), 2, new Float64Array( 2 ), 1, new Float64Array( 4 ), 2, new Float64Array( 2 ) );
	}, TypeError );
});

test( 'dormbr throws RangeError for negative M', function t() {
	assert.throws( function throws() {
		dormbr( 'row-major', 'apply-Q', 'left', 'no-transpose', -1, 2, 2, new Float64Array( 4 ), 2, new Float64Array( 2 ), 1, new Float64Array( 4 ), 2, new Float64Array( 2 ) );
	}, RangeError );
});

test( 'dormbr throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		dormbr( 'row-major', 'apply-Q', 'left', 'no-transpose', 2, -1, 2, new Float64Array( 4 ), 2, new Float64Array( 2 ), 1, new Float64Array( 4 ), 2, new Float64Array( 2 ) );
	}, RangeError );
});

test( 'dormbr throws RangeError for negative K', function t() {
	assert.throws( function throws() {
		dormbr( 'row-major', 'apply-Q', 'left', 'no-transpose', 2, 2, -1, new Float64Array( 4 ), 2, new Float64Array( 2 ), 1, new Float64Array( 4 ), 2, new Float64Array( 2 ) );
	}, RangeError );
});

test( 'dormbr allocates enough workspace for side=right when WORK is null (ticket 0074)', function t() {
	var expected;
	var actual;
	var TAU;
	var A;
	var C;
	var i;

	// vect='apply-Q', side='right': NQ = N = 3, the workspace needs M = 5 elements (not N):
	A = new Float64Array( [ 1.0, 0.3, -0.2, 0.0, 1.0, 0.5, 0.0, 0.0, 1.0 ] );
	TAU = new Float64Array( [ 1.2, 0.7, 0.0 ] );
	C = new Float64Array( 15 );
	for ( i = 0; i < 15; i++ ) {
		C[ i ] = ( ( i * 7 ) % 11 ) - 5.0;
	}
	expected = new Float64Array( C );
	strided( 'apply-Q', 'right', 'no-transpose', 5, 3, 3, A, 1, 3, 0, TAU, 1, 0, expected, 1, 5, 0, new Float64Array( 2000 ), 1, 0 );
	actual = new Float64Array( C );
	dormbr( 'column-major', 'apply-Q', 'right', 'no-transpose', 5, 3, 3, A, 3, TAU, 1, actual, 5, null );
	for ( i = 0; i < 15; i++ ) {
		assert.ok( !Number.isNaN( expected[ i ] ), 'expected is finite' );
		assert.strictEqual( actual[ i ], expected[ i ], 'C[' + i + ']' );
	}
});

test( 'dormbr uses min(NQ,K) as the TAU length for a negative stride (ticket 0068)', function t() {
	var expected;
	var actual;
	var TAU;
	var A;
	var C;
	var i;

	// vect='apply-P', side='left', M=3, N=5, K=2: TAU has min(3,2) = 2 elements:
	A = new Float64Array( [ 1.0, 0.0, 0.4, 1.0, -0.6, 0.2 ] );
	TAU = new Float64Array( [ 0.9, 1.3 ] );
	C = new Float64Array( 15 );
	for ( i = 0; i < 15; i++ ) {
		C[ i ] = ( ( i * 5 ) % 13 ) - 6.0;
	}
	expected = new Float64Array( C );
	strided( 'apply-P', 'left', 'no-transpose', 3, 5, 2, A, 1, 2, 0, TAU, -1, 1, expected, 1, 3, 0, new Float64Array( 2000 ), 1, 0 );
	actual = new Float64Array( C );
	dormbr( 'column-major', 'apply-P', 'left', 'no-transpose', 3, 5, 2, A, 2, TAU, -1, actual, 3, null );
	for ( i = 0; i < 15; i++ ) {
		assert.ok( !Number.isNaN( expected[ i ] ), 'expected is finite' );
		assert.strictEqual( actual[ i ], expected[ i ], 'C[' + i + ']' );
	}
});

test( 'dormbr: computeOptimalWorkSize returns the reference LWKOPT (NB = ILAENV( 1, DORMQR/DORMLQ ) = 32)', function t() {
	assert.strictEqual( computeOptimalWorkSize( 'apply-Q', 'left', 'transpose', 5, 3 ), 96, 'apply-Q, left, transpose, 5, 3' );
	assert.strictEqual( computeOptimalWorkSize( 'apply-Q', 'right', 'no-transpose', 5, 3 ), 160, 'apply-Q, right, no-transpose, 5, 3' );
	assert.strictEqual( computeOptimalWorkSize( 'apply-P', 'left', 'no-transpose', 5, 3 ), 96, 'apply-P, left, no-transpose, 5, 3' );
	assert.strictEqual( computeOptimalWorkSize( 'apply-P', 'right', 'transpose', 5, 3 ), 160, 'apply-P, right, transpose, 5, 3' );
	assert.strictEqual( computeOptimalWorkSize( 'apply-Q', 'left', 'transpose', 0, 3 ), 96, 'apply-Q, left, transpose, 0, 3' );
});
