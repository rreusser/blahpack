/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

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
import zpftrf from './../lib/ndarray.js';

// FIXTURES //

import lower_odd_normal from './fixtures/lower_odd_normal.json' with { type: 'json' };
import upper_odd_normal from './fixtures/upper_odd_normal.json' with { type: 'json' };
import lower_odd_conjtrans from './fixtures/lower_odd_conjtrans.json' with { type: 'json' };
import upper_odd_conjtrans from './fixtures/upper_odd_conjtrans.json' with { type: 'json' };
import lower_even_normal from './fixtures/lower_even_normal.json' with { type: 'json' };
import upper_even_normal from './fixtures/upper_even_normal.json' with { type: 'json' };
import lower_even_conjtrans from './fixtures/lower_even_conjtrans.json' with { type: 'json' };
import upper_even_conjtrans from './fixtures/upper_even_conjtrans.json' with { type: 'json' };
import n_one from './fixtures/n_one.json' with { type: 'json' };
import not_posdef from './fixtures/not_posdef.json' with { type: 'json' };
import lower_5_normal from './fixtures/lower_5_normal.json' with { type: 'json' };
import upper_5_conjtrans from './fixtures/upper_5_conjtrans.json' with { type: 'json' };
import notpd_odd_normal_upper from './fixtures/notpd_odd_normal_upper.json' with { type: 'json' };
import notpd_odd_conjtrans_lower from './fixtures/notpd_odd_conjtrans_lower.json' with { type: 'json' };
import notpd_odd_conjtrans_upper from './fixtures/notpd_odd_conjtrans_upper.json' with { type: 'json' };
import notpd_even_normal_lower from './fixtures/notpd_even_normal_lower.json' with { type: 'json' };
import notpd_even_normal_upper from './fixtures/notpd_even_normal_upper.json' with { type: 'json' };
import notpd_even_conjtrans_lower from './fixtures/notpd_even_conjtrans_lower.json' with { type: 'json' };
import notpd_even_conjtrans_upper from './fixtures/notpd_even_conjtrans_upper.json' with { type: 'json' };

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
	const relErr = Math.abs( actual - expected ) / Math.max( Math.abs( expected ), 1.0 ); // eslint-disable-line max-len
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
	let i;
	assert.equal( actual.length, expected.length, msg + ': length mismatch' );
	for ( i = 0; i < expected.length; i++ ) {
		assertClose( actual[ i ], expected[ i ], tol, msg + '[' + i + ']' );
	}
}

/**
* MakeInput.
*
* @private
* @param {*} tc - tc
* @returns {*} result
*/
function makeInput( tc ) {
	return new Complex128Array( tc.input );
}

// TESTS //

test( 'zpftrf: lower_odd_normal (N=3, TRANSR=no-transpose, UPLO=lower)', function t() { // eslint-disable-line max-len

	const tc = lower_odd_normal;
	const A = makeInput( tc );
	const info = zpftrf( 'no-transpose', 'lower', 3, A, 1, 0 );
	const Av = reinterpret( A, 0 );
	assert.equal( info, tc.info );
	assertArrayClose( Av, tc.a, 1e-14, 'a' );
});

test( 'zpftrf: upper_odd_normal (N=3, TRANSR=no-transpose, UPLO=upper)', function t() { // eslint-disable-line max-len

	const tc = upper_odd_normal;
	const A = makeInput( tc );
	const info = zpftrf( 'no-transpose', 'upper', 3, A, 1, 0 );
	const Av = reinterpret( A, 0 );
	assert.equal( info, tc.info );
	assertArrayClose( Av, tc.a, 1e-14, 'a' );
});

test( 'zpftrf: lower_odd_conjtrans (N=3, TRANSR=conjugate-transpose, UPLO=lower)', function t() { // eslint-disable-line max-len

	const tc = lower_odd_conjtrans;
	const A = makeInput( tc );
	const info = zpftrf( 'conjugate-transpose', 'lower', 3, A, 1, 0 );
	const Av = reinterpret( A, 0 );
	assert.equal( info, tc.info );
	assertArrayClose( Av, tc.a, 1e-14, 'a' );
});

test( 'zpftrf: upper_odd_conjtrans (N=3, TRANSR=conjugate-transpose, UPLO=upper)', function t() { // eslint-disable-line max-len

	const tc = upper_odd_conjtrans;
	const A = makeInput( tc );
	const info = zpftrf( 'conjugate-transpose', 'upper', 3, A, 1, 0 );
	const Av = reinterpret( A, 0 );
	assert.equal( info, tc.info );
	assertArrayClose( Av, tc.a, 1e-14, 'a' );
});

test( 'zpftrf: lower_even_normal (N=4, TRANSR=no-transpose, UPLO=lower)', function t() { // eslint-disable-line max-len

	const tc = lower_even_normal;
	const A = makeInput( tc );
	const info = zpftrf( 'no-transpose', 'lower', 4, A, 1, 0 );
	const Av = reinterpret( A, 0 );
	assert.equal( info, tc.info );
	assertArrayClose( Av, tc.a, 1e-14, 'a' );
});

test( 'zpftrf: upper_even_normal (N=4, TRANSR=no-transpose, UPLO=upper)', function t() { // eslint-disable-line max-len

	const tc = upper_even_normal;
	const A = makeInput( tc );
	const info = zpftrf( 'no-transpose', 'upper', 4, A, 1, 0 );
	const Av = reinterpret( A, 0 );
	assert.equal( info, tc.info );
	assertArrayClose( Av, tc.a, 1e-14, 'a' );
});

test( 'zpftrf: lower_even_conjtrans (N=4, TRANSR=conjugate-transpose, UPLO=lower)', function t() { // eslint-disable-line max-len

	const tc = lower_even_conjtrans;
	const A = makeInput( tc );
	const info = zpftrf( 'conjugate-transpose', 'lower', 4, A, 1, 0 );
	const Av = reinterpret( A, 0 );
	assert.equal( info, tc.info );
	assertArrayClose( Av, tc.a, 1e-14, 'a' );
});

test( 'zpftrf: upper_even_conjtrans (N=4, TRANSR=conjugate-transpose, UPLO=upper)', function t() { // eslint-disable-line max-len

	const tc = upper_even_conjtrans;
	const A = makeInput( tc );
	const info = zpftrf( 'conjugate-transpose', 'upper', 4, A, 1, 0 );
	const Av = reinterpret( A, 0 );
	assert.equal( info, tc.info );
	assertArrayClose( Av, tc.a, 1e-14, 'a' );
});

test( 'zpftrf: n_zero', function t() {

	const A = new Complex128Array( 0 );
	const info = zpftrf( 'no-transpose', 'lower', 0, A, 1, 0 );
	assert.equal( info, 0 );
});

test( 'zpftrf: n_one', function t() {

	const tc = n_one;
	const A = makeInput( tc );
	const info = zpftrf( 'no-transpose', 'lower', 1, A, 1, 0 );
	const Av = reinterpret( A, 0 );
	assert.equal( info, tc.info );
	assertArrayClose( Av, tc.a, 1e-14, 'a' );
});

test( 'zpftrf: not_posdef (INFO > 0)', function t() {

	const tc = not_posdef;
	const A = makeInput( tc );
	const info = zpftrf( 'no-transpose', 'lower', 3, A, 1, 0 );
	assert.equal( info, tc.info );
});

test( 'zpftrf: lower_5_normal (N=5, TRANSR=no-transpose, UPLO=lower)', function t() { // eslint-disable-line max-len

	const tc = lower_5_normal;
	const A = makeInput( tc );
	const info = zpftrf( 'no-transpose', 'lower', 5, A, 1, 0 );
	const Av = reinterpret( A, 0 );
	assert.equal( info, tc.info );
	assertArrayClose( Av, tc.a, 1e-14, 'a' );
});

test( 'zpftrf: upper_5_conjtrans (N=5, TRANSR=conjugate-transpose, UPLO=upper)', function t() { // eslint-disable-line max-len

	const tc = upper_5_conjtrans;
	const A = makeInput( tc );
	const info = zpftrf( 'conjugate-transpose', 'upper', 5, A, 1, 0 );
	const Av = reinterpret( A, 0 );
	assert.equal( info, tc.info );
	assertArrayClose( Av, tc.a, 1e-14, 'a' );
});

test( 'zpftrf: notpd_odd_normal_upper', function t() {

	const tc = notpd_odd_normal_upper;
	const A = makeInput( tc );
	const info = zpftrf( 'no-transpose', 'upper', 3, A, 1, 0 );
	assert.equal( info, tc.info );
});

test( 'zpftrf: notpd_odd_conjtrans_lower', function t() {

	const tc = notpd_odd_conjtrans_lower;
	const A = makeInput( tc );
	const info = zpftrf( 'conjugate-transpose', 'lower', 3, A, 1, 0 );
	assert.equal( info, tc.info );
});

test( 'zpftrf: notpd_odd_conjtrans_upper', function t() {

	const tc = notpd_odd_conjtrans_upper;
	const A = makeInput( tc );
	const info = zpftrf( 'conjugate-transpose', 'upper', 3, A, 1, 0 );
	assert.equal( info, tc.info );
});

test( 'zpftrf: notpd_even_normal_lower', function t() {

	const tc = notpd_even_normal_lower;
	const A = makeInput( tc );
	const info = zpftrf( 'no-transpose', 'lower', 4, A, 1, 0 );
	assert.equal( info, tc.info );
});

test( 'zpftrf: notpd_even_normal_upper', function t() {

	const tc = notpd_even_normal_upper;
	const A = makeInput( tc );
	const info = zpftrf( 'no-transpose', 'upper', 4, A, 1, 0 );
	assert.equal( info, tc.info );
});

test( 'zpftrf: notpd_even_conjtrans_lower', function t() {

	const tc = notpd_even_conjtrans_lower;
	const A = makeInput( tc );
	const info = zpftrf( 'conjugate-transpose', 'lower', 4, A, 1, 0 );
	assert.equal( info, tc.info );
});

test( 'zpftrf: notpd_even_conjtrans_upper', function t() {

	const tc = notpd_even_conjtrans_upper;
	const A = makeInput( tc );
	const info = zpftrf( 'conjugate-transpose', 'upper', 4, A, 1, 0 );
	assert.equal( info, tc.info );
});
