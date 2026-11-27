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

/* eslint-disable no-restricted-syntax, max-len */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dlamswlq from './../lib/dlamswlq.js';


// TESTS //

test( 'dlamswlq is a function', function t() {
	assert.strictEqual( typeof dlamswlq, 'function', 'is a function' );
});

test( 'dlamswlq has expected arity', function t() {
	assert.strictEqual( dlamswlq.length, 15, 'has expected arity' );
});

test( 'dlamswlq throws TypeError for invalid order', function t() {
	assert.throws( function throws() {
		dlamswlq( 'invalid', 'left', 'no-transpose', 2, 2, 2, 2, 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ) );
	}, TypeError );
});

test( 'dlamswlq throws TypeError for invalid side', function t() {
	assert.throws( function throws() {
		dlamswlq( 'row-major', 'invalid', 'no-transpose', 2, 2, 2, 2, 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ) );
	}, TypeError );
});

test( 'dlamswlq throws TypeError for invalid trans', function t() {
	assert.throws( function throws() {
		dlamswlq( 'row-major', 'left', 'invalid', 2, 2, 2, 2, 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ) );
	}, TypeError );
});

test( 'dlamswlq throws RangeError for negative M', function t() {
	assert.throws( function throws() {
		dlamswlq( 'row-major', 'left', 'no-transpose', -1, 2, 2, 2, 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ) );
	}, RangeError );
});

test( 'dlamswlq throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		dlamswlq( 'row-major', 'left', 'no-transpose', 2, -1, 2, 2, 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ) );
	}, RangeError );
});

test( 'dlamswlq throws RangeError for negative K', function t() {
	assert.throws( function throws() {
		dlamswlq( 'row-major', 'left', 'no-transpose', 2, 2, -1, 2, 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ) );
	}, RangeError );
});

/**
* Returns a Float64Array of `n` deterministic pseudo-random values in (-1, 1).
*
* @private
* @param {NonNegativeInteger} n - length
* @param {integer} seed - seed
* @returns {Float64Array} values
*/
function values( n, seed ) {
	const out = new Float64Array( n );
	let s = seed;
	let i;
	for ( i = 0; i < n; i++ ) {
		s = ( ( s * 1103515245 ) + 12345 ) % 2147483648;
		out[ i ] = ( 2.0 * ( s / 2147483648 ) ) - 1.0;
	}
	return out;
}

/**
* Applies Q (blocked SWLQ path, K = 3 < nb = 5 < M = 12) to a 12-by-N C with the given WORK and returns C.
*
* @private
* @param {string} side - operation side
* @param {string} trans - transpose option
* @param {NonNegativeInteger} M - rows of C
* @param {NonNegativeInteger} N - columns of C
* @param {(Float64Array|null)} WORK - workspace
* @returns {Float64Array} C
*/
function apply( side, trans, M, N, WORK ) {
	const Q = ( side === 'left' ) ? M : N;
	const A = values( 3 * Q, 7 );
	const T = values( 3 * 3 * Q, 11 );
	const C = values( M * N, 13 );
	const info = dlamswlq( 'column-major', side, trans, M, N, 3, 3, 5, A, 3, T, 3, C, M, WORK );
	assert.strictEqual( info, 0, 'info' );
	return C;
}

test( 'dlamswlq: WORK = null allocates the reference workspace N*mb for side = left (N*mb > nb*mb)', function t() {
	// The reference's LW for SIDE = 'L' is N*MB, the WORK dgemlqt/dtpmlqt address; the old allocation was nb*mb = 15 < 20*3.
	const expected = apply( 'left', 'transpose', 12, 20, new Float64Array( 20 * 3 ) );
	const actual = apply( 'left', 'transpose', 12, 20, null );
	assert.deepStrictEqual( actual, expected, 'matches an explicit WORK of N*mb' );
	const expected2 = apply( 'left', 'no-transpose', 12, 20, new Float64Array( 20 * 3 ) );
	const actual2 = apply( 'left', 'no-transpose', 12, 20, null );
	assert.deepStrictEqual( actual2, expected2, 'matches an explicit WORK of N*mb' );
});

test( 'dlamswlq: side = right with K > N throws RangeError (the reference\'s DGEMLQT rejects it)', function t() {
	const C = values( 12, 3 );
	assert.throws( function throws() {
		dlamswlq( 'column-major', 'right', 'no-transpose', 6, 2, 3, 1, 1, values( 3 * 2, 5 ), 3, values( 3, 9 ), 1, C, 6, null );
	}, RangeError );
});

test( 'dlamswlq: nb is not checked (the reference has no NB check; nb <= K defers to dgemlqt)', function t() {
	const C = new Float64Array( 4 );
	const info = dlamswlq( 'column-major', 'left', 'no-transpose', 2, 2, 1, 1, 0, new Float64Array( 4 ), 1, new Float64Array( 4 ), 1, C, 2, null );
	assert.strictEqual( info, 0, 'info' );
});
