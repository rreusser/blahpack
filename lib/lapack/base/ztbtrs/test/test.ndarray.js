/* eslint-disable no-restricted-syntax, stdlib/first-unit-test, max-lines */

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

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import ztbtrs from './../lib/ndarray.js';

// FIXTURES //

import upper_no_trans from './fixtures/upper_no_trans.json' with { type: 'json' };
import lower_no_trans from './fixtures/lower_no_trans.json' with { type: 'json' };
import upper_conj_trans from './fixtures/upper_conj_trans.json' with { type: 'json' };
import lower_conj_trans from './fixtures/lower_conj_trans.json' with { type: 'json' };
import upper_unit_diag from './fixtures/upper_unit_diag.json' with { type: 'json' };
import lower_unit_diag from './fixtures/lower_unit_diag.json' with { type: 'json' };
import singular_upper from './fixtures/singular_upper.json' with { type: 'json' };
import singular_lower from './fixtures/singular_lower.json' with { type: 'json' };
import multi_rhs from './fixtures/multi_rhs.json' with { type: 'json' };
import n_one from './fixtures/n_one.json' with { type: 'json' };
import upper_kd2_no_trans from './fixtures/upper_kd2_no_trans.json' with { type: 'json' };

// FUNCTIONS //

/**
* Asserts that two numbers are approximately equal.
*
* @private
* @param {*} actual - actual value
* @param {*} expected - expected value
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
* @param {*} actual - actual value
* @param {*} expected - expected value
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
* Converts a typed array to a plain array.
*
* @private
* @param {TypedArray} arr - input array
* @returns {Array} output array
*/
function toArray( arr ) {
	var out = [];
	var i;
	for ( i = 0; i < arr.length; i++ ) {
		out.push( arr[ i ] );
	}
	return out;
}

// TESTS //

test( 'ztbtrs is a function', function t() {
	assert.equal( typeof ztbtrs, 'function' );
});

test( 'ztbtrs: upper_no_trans (upper, no-transpose, KD=1, N=3)', function t() {
	var info;
	var tc;
	var AB;
	var Bv;
	var B;

	tc = upper_no_trans;
	AB = new Complex128Array([
		0,
		0,
		3,
		0,      // col 1: *, 3+0i
		1,
		1,
		4,
		1,      // col 2: 1+i, 4+i
		2,
		-1,
		5,
		-1     // col 3: 2-i, 5-i
	]);
	B = new Complex128Array( [ 10, 2, 20, 5, 15, -3 ] );
	info = ztbtrs( 'upper', 'no-transpose', 'non-unit', 3, 1, 1, AB, 1, 2, 0, B, 1, 3, 0 ); // eslint-disable-line max-len
	assert.equal( info, tc.info );
	Bv = reinterpret( B, 0 );
	assertArrayClose( toArray( Bv ).slice( 0, 6 ), tc.x, 1e-13, 'x' );
});

test( 'ztbtrs: lower_no_trans (lower, no-transpose, KD=1, N=3)', function t() {
	var info;
	var tc;
	var AB;
	var Bv;
	var B;

	tc = lower_no_trans;
	AB = new Complex128Array([
		2,
		1,
		1,
		1,      // col 1: 2+i, 1+i
		3,
		0,
		2,
		-1,     // col 2: 3+0i, 2-i
		4,
		-1,
		0,
		0      // col 3: 4-i, *
	]);
	B = new Complex128Array( [ 5, 3, 10, 1, 8, -2 ] );
	info = ztbtrs( 'lower', 'no-transpose', 'non-unit', 3, 1, 1, AB, 1, 2, 0, B, 1, 3, 0 ); // eslint-disable-line max-len
	assert.equal( info, tc.info );
	Bv = reinterpret( B, 0 );
	assertArrayClose( toArray( Bv ).slice( 0, 6 ), tc.x, 1e-13, 'x' );
});

test( 'ztbtrs: upper_conj_trans (upper, conjugate-transpose, KD=1, N=3)', function t() { // eslint-disable-line max-len
	var info;
	var tc;
	var AB;
	var Bv;
	var B;

	tc = upper_conj_trans;
	AB = new Complex128Array([
		0,
		0,
		3,
		0,
		1,
		1,
		4,
		1,
		2,
		-1,
		5,
		-1
	]);
	B = new Complex128Array( [ 10, 2, 20, 5, 15, -3 ] );
	info = ztbtrs( 'upper', 'conjugate-transpose', 'non-unit', 3, 1, 1, AB, 1, 2, 0, B, 1, 3, 0 ); // eslint-disable-line max-len
	assert.equal( info, tc.info );
	Bv = reinterpret( B, 0 );
	assertArrayClose( toArray( Bv ).slice( 0, 6 ), tc.x, 1e-13, 'x' );
});

test( 'ztbtrs: lower_conj_trans (lower, conjugate-transpose, KD=1, N=3)', function t() { // eslint-disable-line max-len
	var info;
	var tc;
	var AB;
	var Bv;
	var B;

	tc = lower_conj_trans;
	AB = new Complex128Array([
		2,
		1,
		1,
		1,
		3,
		0,
		2,
		-1,
		4,
		-1,
		0,
		0
	]);
	B = new Complex128Array( [ 5, 3, 10, 1, 8, -2 ] );
	info = ztbtrs( 'lower', 'conjugate-transpose', 'non-unit', 3, 1, 1, AB, 1, 2, 0, B, 1, 3, 0 ); // eslint-disable-line max-len
	assert.equal( info, tc.info );
	Bv = reinterpret( B, 0 );
	assertArrayClose( toArray( Bv ).slice( 0, 6 ), tc.x, 1e-13, 'x' );
});

test( 'ztbtrs: upper_unit_diag (unit diagonal, upper, KD=1, N=3)', function t() { // eslint-disable-line max-len
	var info;
	var tc;
	var AB;
	var Bv;
	var B;

	tc = upper_unit_diag;
	AB = new Complex128Array([
		0,
		0,
		99,
		99,      // col 1: *, ignored_diag
		2,
		1,
		99,
		99,      // col 2: 2+i, ignored_diag
		3,
		-1,
		99,
		99      // col 3: 3-i, ignored_diag
	]);
	B = new Complex128Array( [ 7, 1, 5, 2, 1, 0 ] );
	info = ztbtrs( 'upper', 'no-transpose', 'unit', 3, 1, 1, AB, 1, 2, 0, B, 1, 3, 0 ); // eslint-disable-line max-len
	assert.equal( info, tc.info );
	Bv = reinterpret( B, 0 );
	assertArrayClose( toArray( Bv ).slice( 0, 6 ), tc.x, 1e-13, 'x' );
});

test( 'ztbtrs: lower_unit_diag (unit diagonal, lower, KD=1, N=3)', function t() { // eslint-disable-line max-len
	var info;
	var tc;
	var AB;
	var Bv;
	var B;

	tc = lower_unit_diag;
	AB = new Complex128Array([
		99,
		99,
		1,
		1,      // col 1: ignored_diag, 1+i
		99,
		99,
		2,
		-1,     // col 2: ignored_diag, 2-i
		99,
		99,
		0,
		0       // col 3: ignored_diag, *
	]);
	B = new Complex128Array( [ 3, 1, 5, 2, 4, 0 ] );
	info = ztbtrs( 'lower', 'no-transpose', 'unit', 3, 1, 1, AB, 1, 2, 0, B, 1, 3, 0 ); // eslint-disable-line max-len
	assert.equal( info, tc.info );
	Bv = reinterpret( B, 0 );
	assertArrayClose( toArray( Bv ).slice( 0, 6 ), tc.x, 1e-13, 'x' );
});

test( 'ztbtrs: n_zero (N=0 quick return)', function t() {
	var info;
	var AB;
	var B;

	AB = new Complex128Array( 1 );
	B = new Complex128Array( 1 );
	info = ztbtrs( 'upper', 'no-transpose', 'non-unit', 0, 0, 1, AB, 1, 1, 0, B, 1, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, 0 );
});

test( 'ztbtrs: singular_upper (zero diagonal, upper, info=2)', function t() {
	var info;
	var tc;
	var AB;
	var B;

	tc = singular_upper;
	AB = new Complex128Array([
		0,
		0,
		2,
		0,      // col 1: *, 2+0i
		1,
		0,
		0,
		0,      // col 2: 1+0i, 0+0i <- singular
		1,
		0,
		3,
		0       // col 3: 1+0i, 3+0i
	]);
	B = new Complex128Array( [ 1, 0, 2, 0, 3, 0 ] );
	info = ztbtrs( 'upper', 'no-transpose', 'non-unit', 3, 1, 1, AB, 1, 2, 0, B, 1, 3, 0 ); // eslint-disable-line max-len
	assert.equal( info, tc.info );
});

test( 'ztbtrs: singular_lower (zero diagonal, lower, info=1)', function t() {
	var info;
	var tc;
	var AB;
	var B;

	tc = singular_lower;
	AB = new Complex128Array([
		0,
		0,
		1,
		0,      // col 1: 0+0i (singular), 1+0i
		3,
		0,
		2,
		0,      // col 2: 3+0i, 2+0i
		4,
		0,
		0,
		0       // col 3: 4+0i, *
	]);
	B = new Complex128Array( [ 1, 0, 2, 0, 3, 0 ] );
	info = ztbtrs( 'lower', 'no-transpose', 'non-unit', 3, 1, 1, AB, 1, 2, 0, B, 1, 3, 0 ); // eslint-disable-line max-len
	assert.equal( info, tc.info );
});

test( 'ztbtrs: multi_rhs (NRHS=2, upper, KD=1, N=3)', function t() {
	var info;
	var tc;
	var AB;
	var Bv;
	var B;

	tc = multi_rhs;
	AB = new Complex128Array([
		0,
		0,
		3,
		0,      // col 1: *, 3+0i
		1,
		1,
		4,
		0,      // col 2: 1+i, 4+0i
		2,
		0,
		5,
		0       // col 3: 2+0i, 5+0i
	]);
	B = new Complex128Array([
		6,
		1,
		12,
		3,
		10,
		0,    // col 1
		3,
		0,
		8,
		2,
		5,
		-1      // col 2
	]);
	info = ztbtrs( 'upper', 'no-transpose', 'non-unit', 3, 1, 2, AB, 1, 2, 0, B, 1, 3, 0 ); // eslint-disable-line max-len
	assert.equal( info, tc.info );
	Bv = reinterpret( B, 0 );
	assertArrayClose( toArray( Bv ).slice( 0, 6 ), tc.x1, 1e-13, 'x1' );
	assertArrayClose( toArray( Bv ).slice( 6, 12 ), tc.x2, 1e-13, 'x2' );
});

test( 'ztbtrs: n_one (N=1 edge case)', function t() {
	var info;
	var tc;
	var AB;
	var Bv;
	var B;

	tc = n_one;
	AB = new Complex128Array( [ 5, 2 ] );
	B = new Complex128Array( [ 15, 6 ] );
	info = ztbtrs( 'upper', 'no-transpose', 'non-unit', 1, 0, 1, AB, 1, 1, 0, B, 1, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, tc.info );
	Bv = reinterpret( B, 0 );
	assertArrayClose( toArray( Bv ).slice( 0, 2 ), tc.x, 1e-13, 'x' );
});

test( 'ztbtrs: upper_kd2_no_trans (upper, KD=2, N=4)', function t() {
	var info;
	var tc;
	var AB;
	var Bv;
	var B;

	tc = upper_kd2_no_trans;
	AB = new Complex128Array([
		0,
		0,
		0,
		0,
		3,
		0,         // col 1: *, *, 3+0i
		0,
		0,
		1,
		0,
		4,
		1,         // col 2: *, 1+0i, 4+i
		1,
		1,
		2,
		1,
		5,
		-1,        // col 3: 1+i, 2+i, 5-i
		2,
		0,
		3,
		-1,
		6,
		0         // col 4: 2+0i, 3-i, 6+0i
	]);
	B = new Complex128Array( [ 10, 3, 20, 5, 15, -2, 12, 1 ] );
	info = ztbtrs( 'upper', 'no-transpose', 'non-unit', 4, 2, 1, AB, 1, 3, 0, B, 1, 4, 0 ); // eslint-disable-line max-len
	assert.equal( info, tc.info );
	Bv = reinterpret( B, 0 );
	assertArrayClose( toArray( Bv ).slice( 0, 8 ), tc.x, 1e-13, 'x' );
});
