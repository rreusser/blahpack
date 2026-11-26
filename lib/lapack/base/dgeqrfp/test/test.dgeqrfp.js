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

/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dgeqrfp from './../lib/dgeqrfp.js';
import dgeqrfpNd from './../lib/ndarray.js';


// TESTS //

test( 'dgeqrfp is a function', function t() {
	assert.strictEqual( typeof dgeqrfp, 'function', 'is a function' );
});

test( 'dgeqrfp has expected arity', function t() {
	assert.strictEqual( dgeqrfp.length, 8, 'has expected arity' );
});

test( 'dgeqrfp throws TypeError for invalid order', function t() {
	assert.throws( function throws() {
		dgeqrfp( 'invalid', 2, 2, new Float64Array( 4 ), 2, new Float64Array( 2 ), 1, new Float64Array( 4 ) );
	}, TypeError );
});

test( 'dgeqrfp throws RangeError for negative M', function t() {
	assert.throws( function throws() {
		dgeqrfp( 'row-major', -1, 2, new Float64Array( 4 ), 2, new Float64Array( 2 ), 1, new Float64Array( 4 ) );
	}, RangeError );
});

test( 'dgeqrfp throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		dgeqrfp( 'row-major', 2, -1, new Float64Array( 4 ), 2, new Float64Array( 2 ), 1, new Float64Array( 4 ) );
	}, RangeError );
});

test( 'dgeqrfp throws RangeError for LDA too small (row-major)', function t() {
	assert.throws( function throws() {
		dgeqrfp( 'row-major', 2, 3, new Float64Array( 6 ), 2, new Float64Array( 2 ), 1, new Float64Array( 6 ) );
	}, RangeError );
});

test( 'dgeqrfp throws RangeError for LDA too small (column-major)', function t() {
	assert.throws( function throws() {
		dgeqrfp( 'column-major', 3, 2, new Float64Array( 6 ), 2, new Float64Array( 2 ), 1, new Float64Array( 6 ) );
	}, RangeError );
});

test( 'dgeqrfp column-major 3x3 computes QR with non-negative R diagonal', function t() {
	let i;
	const A = new Float64Array( [ 2, 1, 3, 1, 4, 2, 3, 2, 5 ] );
	const TAU = new Float64Array( 3 );
	const WORK = new Float64Array( 3 * 32 );
	const info = dgeqrfp( 'column-major', 3, 3, A, 3, TAU, 1, WORK );
	assert.strictEqual( info, 0 );
	for ( i = 0; i < 3; i++ ) {
		assert.ok( A[ i + ( i * 3 ) ] >= 0, 'R diagonal non-negative' );
	}
});

test( 'dgeqrfp row-major 3x3 runs without error', function t() {
	const A = new Float64Array( [ 2, 1, 3, 1, 4, 2, 3, 2, 5 ] );
	const TAU = new Float64Array( 3 );
	const WORK = new Float64Array( 3 * 32 );
	const info = dgeqrfp( 'row-major', 3, 3, A, 3, TAU, 1, WORK );
	assert.strictEqual( info, 0 );
});


test( 'dgeqrfp allocates the optimal WORK when WORK is null (70x70, blocked)', function t() {
	const A = new Float64Array( 70 * 70 );
	let i;
	for ( i = 0; i < 70 * 70; i++ ) {
		A[ i ] = Math.sin( ( 0.37 * i ) + 1.0 ) + ( ( i % 71 === 0 ) ? 4.0 : 0.0 );
	}
	const B = new Float64Array( A );
	const TAU = new Float64Array( 70 );
	const TAU2 = new Float64Array( 70 );
	const info = dgeqrfp( 'column-major', 70, 70, A, 70, TAU, 1, null );
	assert.strictEqual( info, 0 );
	dgeqrfpNd( 70, 70, B, 1, 70, 0, TAU2, 1, 0, new Float64Array( 70 * 32 ), 1, 0 );
	assert.deepStrictEqual( A, B );
	assert.deepStrictEqual( TAU, TAU2 );
});
