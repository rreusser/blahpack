/* eslint-disable no-restricted-syntax, stdlib/first-unit-test, no-mixed-operators, node/no-sync, max-len */

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

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dggrqf from './../lib/ndarray.js';

// FIXTURES //

import basic_3x3 from './fixtures/basic_3x3.json' with { type: 'json' };
import m_lt_n from './fixtures/m_lt_n.json' with { type: 'json' };
import m_gt_n from './fixtures/m_gt_n.json' with { type: 'json' };
import m_zero from './fixtures/m_zero.json' with { type: 'json' };
import m_one from './fixtures/m_one.json' with { type: 'json' };
import p_gt_n from './fixtures/p_gt_n.json' with { type: 'json' };
import main from './../lib/index.js';

// FUNCTIONS //

/**
* Asserts that two numbers are approximately equal.
*
* @private
* @param {number} actual - actual value
* @param {number} expected - expected value
* @param {number} tol - tolerance
* @param {string} msg - assertion message
*/
function assertClose( actual, expected, tol, msg ) {
	var relErr = Math.abs( actual - expected ) / Math.max( Math.abs( expected ), 1.0 ); // eslint-disable-line max-len
	assert.ok( relErr <= tol, msg + ': expected ' + expected + ', got ' + actual );
}

/**
* Asserts that two arrays are element-wise approximately equal.
*
* @private
* @param {Array} actual - actual value
* @param {Array} expected - expected value
* @param {number} tol - tolerance
* @param {string} msg - assertion message
*/
function assertArrayClose( actual, expected, tol, msg ) {
	var i;
	assert.equal( actual.length, expected.length, msg + ': length mismatch' );
	for ( i = 0; i < expected.length; i++ ) {
		assertClose( actual[ i ], expected[ i ], tol, msg + '[' + i + ']' );
	}
}

/**
* Builds a column-major flat array for an M-by-N matrix from row-major input values.
*
* @private
* @param {number} M - rows
* @param {number} N - columns
* @param {Array} rowMajorValues - values in row-major order
* @returns {Array} column-major flat array
*/
function colMajor( M, N, rowMajorValues ) {
	var out = [];
	var i;
	var j;
	out.length = M * N;
	for ( j = 0; j < N; j++ ) {
		for ( i = 0; i < M; i++ ) {
			out[ (j * M) + i ] = rowMajorValues[ (i * N) + j ];
		}
	}
	return out;
}

/**
* Helper to call dggrqf.
*
* @private
* @param {number} M - number of rows of A
* @param {number} P - number of rows of B
* @param {number} N - number of columns
* @param {Array} aFlat - flat column-major A
* @param {Array} bFlat - flat column-major B
* @returns {Object} results
*/
function callDggrqf( M, P, N, aFlat, bFlat ) {
	var TAUA = new Float64Array( Math.min( M, N ) );
	var TAUB = new Float64Array( Math.min( P, N ) );
	var work = new Float64Array( Math.max( 1, M, P, N ) * 64 );
	var info;
	var A = new Float64Array( aFlat );
	var B = new Float64Array( bFlat );

	info = dggrqf( M, P, N, A, 1, M, 0, TAUA, 1, 0, B, 1, P, 0, TAUB, 1, 0, work, 1, 0 );
	return {
		'info': info,
		'A': Array.prototype.slice.call( A ),
		'TAUA': Array.prototype.slice.call( TAUA ),
		'B': Array.prototype.slice.call( B ),
		'TAUB': Array.prototype.slice.call( TAUB )
	};
}

// TESTS //

test( 'dggrqf: main export is a function', function t() {
	assert.strictEqual( typeof main, 'function' );
});

test( 'dggrqf: attached to the main export is an `ndarray` method', function t() { // eslint-disable-line max-len
	assert.strictEqual( typeof main.ndarray, 'function' );
});

test( 'dggrqf: basic_3x3', function t() {
	var res;
	var tc;
	var A;
	var B;

	tc = basic_3x3;
	A = colMajor( 3, 3, [ 2, 1, 3, 1, 4, 2, 3, 2, 5 ] );
	B = colMajor( 3, 3, [ 1, 2, 1, 3, 1, 2, 2, 3, 1 ] );
	res = callDggrqf( 3, 3, 3, A, B );
	assert.equal( res.info, tc.info, 'info' );
	assertArrayClose( res.A, tc.A, 1e-14, 'A' );
	assertArrayClose( res.TAUA, tc.TAUA, 1e-14, 'TAUA' );
	assertArrayClose( res.B, tc.B, 1e-14, 'B' );
	assertArrayClose( res.TAUB, tc.TAUB, 1e-14, 'TAUB' );
});

test( 'dggrqf: m_lt_n', function t() {
	var res;
	var tc;
	var A;
	var B;

	tc = m_lt_n;
	A = colMajor( 2, 4, [ 2, 1, 3, 1, 1, 4, 2, 3 ] );
	B = colMajor( 3, 4, [ 1, 2, 1, 3, 3, 1, 2, 1, 2, 3, 1, 2 ] );
	res = callDggrqf( 2, 3, 4, A, B );
	assert.equal( res.info, tc.info, 'info' );
	assertArrayClose( res.A, tc.A, 1e-14, 'A' );
	assertArrayClose( res.TAUA, tc.TAUA, 1e-14, 'TAUA' );
	assertArrayClose( res.B, tc.B, 1e-14, 'B' );
	assertArrayClose( res.TAUB, tc.TAUB, 1e-14, 'TAUB' );
});

test( 'dggrqf: m_gt_n', function t() {
	var res;
	var tc;
	var A;
	var B;

	tc = m_gt_n;
	A = colMajor( 4, 3, [ 2, 1, 3, 1, 4, 2, 3, 2, 5, 1, 3, 1 ] );
	B = colMajor( 3, 3, [ 1, 2, 1, 3, 1, 2, 2, 3, 1 ] );
	res = callDggrqf( 4, 3, 3, A, B );
	assert.equal( res.info, tc.info, 'info' );
	assertArrayClose( res.A, tc.A, 1e-14, 'A' );
	assertArrayClose( res.TAUA, tc.TAUA, 1e-14, 'TAUA' );
	assertArrayClose( res.B, tc.B, 1e-14, 'B' );
	assertArrayClose( res.TAUB, tc.TAUB, 1e-14, 'TAUB' );
});

test( 'dggrqf: m_zero', function t() {
	var TAUA;
	var TAUB;
	var info;
	var tc;
	var B;
	var work;

	tc = m_zero;
	TAUA = new Float64Array( 0 );
	TAUB = new Float64Array( 0 );
	B = new Float64Array( colMajor( 3, 3, [ 1, 2, 1, 3, 1, 2, 2, 3, 1 ] ) );
	work = new Float64Array( Math.max( 1, 0, 3, 3 ) * 64 );
	info = dggrqf( 0, 3, 3, new Float64Array( 0 ), 1, 0, 0, TAUA, 1, 0, B, 1, 3, 0, TAUB, 1, 0, work, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, tc.info, 'info' );
});

test( 'dggrqf: m_one', function t() {
	var res;
	var tc;
	var A;
	var B;

	tc = m_one;
	A = [ 5.0 ];
	B = [ 3.0 ];
	res = callDggrqf( 1, 1, 1, A, B );
	assert.equal( res.info, tc.info, 'info' );
	assertArrayClose( res.A, tc.A, 1e-14, 'A' );
	assertArrayClose( res.TAUA, tc.TAUA, 1e-14, 'TAUA' );
	assertArrayClose( res.B, tc.B, 1e-14, 'B' );
	assertArrayClose( res.TAUB, tc.TAUB, 1e-14, 'TAUB' );
});

test( 'dggrqf: p_gt_n', function t() {
	var res;
	var tc;
	var A;
	var B;

	tc = p_gt_n;
	A = colMajor( 3, 3, [ 1, 2, 3, 4, 5, 6, 7, 8, 9 ] );
	B = colMajor( 5, 3, [ 1, 0.5, 2, 0.5, 3, 1, 2, 1, 1, 1, 2, 0.5, 3, 1, 2 ] );
	res = callDggrqf( 3, 5, 3, A, B );
	assert.equal( res.info, tc.info, 'info' );
	assertArrayClose( res.A, tc.A, 1e-14, 'A' );
	assertArrayClose( res.TAUA, tc.TAUA, 1e-14, 'TAUA' );
	assertArrayClose( res.B, tc.B, 1e-14, 'B' );
	assertArrayClose( res.TAUB, tc.TAUB, 1e-14, 'TAUB' );
});
