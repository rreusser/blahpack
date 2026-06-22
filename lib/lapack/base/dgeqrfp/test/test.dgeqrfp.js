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
import dgeqrfp from './../lib/dgeqrfp.js';


// TESTS //

test( 'dgeqrfp is a function', function t() {
	assert.strictEqual( typeof dgeqrfp, 'function', 'is a function' );
});

test( 'dgeqrfp has expected arity', function t() {
	assert.strictEqual( dgeqrfp.length, 9, 'has expected arity' );
});

test( 'dgeqrfp throws TypeError for invalid order', function t() {
	assert.throws( function throws() {
		dgeqrfp( 'invalid', 2, 2, new Float64Array( 4 ), 2, new Float64Array( 2 ), 1, new Float64Array( 4 ), 1 );
	}, TypeError );
});

test( 'dgeqrfp throws RangeError for negative M', function t() {
	assert.throws( function throws() {
		dgeqrfp( 'row-major', -1, 2, new Float64Array( 4 ), 2, new Float64Array( 2 ), 1, new Float64Array( 4 ), 1 );
	}, RangeError );
});

test( 'dgeqrfp throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		dgeqrfp( 'row-major', 2, -1, new Float64Array( 4 ), 2, new Float64Array( 2 ), 1, new Float64Array( 4 ), 1 );
	}, RangeError );
});

test( 'dgeqrfp throws RangeError for LDA too small (row-major)', function t() {
	assert.throws( function throws() {
		dgeqrfp( 'row-major', 2, 3, new Float64Array( 6 ), 2, new Float64Array( 2 ), 1, new Float64Array( 6 ), 1 );
	}, RangeError );
});

test( 'dgeqrfp throws RangeError for LDA too small (column-major)', function t() {
	assert.throws( function throws() {
		dgeqrfp( 'column-major', 3, 2, new Float64Array( 6 ), 2, new Float64Array( 2 ), 1, new Float64Array( 6 ), 1 );
	}, RangeError );
});

test( 'dgeqrfp column-major 3x3 computes QR with non-negative R diagonal', function t() {
	var WORK;
	var info;
	var TAU;
	var A;
	var i;
	A = new Float64Array( [ 2, 1, 3, 1, 4, 2, 3, 2, 5 ] );
	TAU = new Float64Array( 3 );
	WORK = new Float64Array( 3 * 32 );
	info = dgeqrfp( 'column-major', 3, 3, A, 3, TAU, 1, WORK, 1 );
	assert.strictEqual( info, 0 );
	for ( i = 0; i < 3; i++ ) {
		assert.ok( A[ i + ( i * 3 ) ] >= 0, 'R diagonal non-negative' );
	}
});

test( 'dgeqrfp row-major 3x3 runs without error', function t() {
	var WORK;
	var info;
	var TAU;
	var A;
	A = new Float64Array( [ 2, 1, 3, 1, 4, 2, 3, 2, 5 ] );
	TAU = new Float64Array( 3 );
	WORK = new Float64Array( 3 * 32 );
	info = dgeqrfp( 'row-major', 3, 3, A, 3, TAU, 1, WORK, 1 );
	assert.strictEqual( info, 0 );
});
