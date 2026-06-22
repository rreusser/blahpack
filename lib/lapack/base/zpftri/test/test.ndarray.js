/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

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
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import zpftrf from '../../zpftrf/lib/base.js';
import zpftri from './../lib/ndarray.js';

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
import lower_5_normal from './fixtures/lower_5_normal.json' with { type: 'json' };
import upper_5_conjtrans from './fixtures/upper_5_conjtrans.json' with { type: 'json' };
import upper_5_normal from './fixtures/upper_5_normal.json' with { type: 'json' };
import lower_5_conjtrans from './fixtures/lower_5_conjtrans.json' with { type: 'json' };

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
* Creates a Complex128Array from test case input data.
*
* @private
* @param {*} tc - test case
* @returns {Complex128Array} input array
*/
function makeInput( tc ) {
	return new Complex128Array( tc.input );
}

/**
* Helper: runs zpftrf then zpftri on the fixture input.
*
* @private
* @param {string} transr - transpose operation
* @param {string} uplo - matrix triangle
* @param {NonNegativeInteger} N - matrix order
* @param {Complex128Array} A - input array
* @returns {integer} info from zpftri
*/
function factorAndInvert( transr, uplo, N, A ) {
	var info;

	info = zpftrf( transr, uplo, N, A, 1, 0 );
	assert.equal( info, 0, 'zpftrf should succeed' );
	return zpftri( transr, uplo, N, A, 1, 0 );
}

// TESTS //

test( 'zpftri: lower_odd_normal (N=3, TRANSR=no-transpose, UPLO=lower)', function t() { // eslint-disable-line max-len
	var info;
	var tc;
	var Av;
	var A;

	tc = lower_odd_normal;
	A = makeInput( tc );
	info = factorAndInvert( 'no-transpose', 'lower', 3, A );
	Av = reinterpret( A, 0 );
	assert.equal( info, tc.info );
	assertArrayClose( Av, tc.a, 1e-14, 'a' );
});

test( 'zpftri: upper_odd_normal (N=3, TRANSR=no-transpose, UPLO=upper)', function t() { // eslint-disable-line max-len
	var info;
	var tc;
	var Av;
	var A;

	tc = upper_odd_normal;
	A = makeInput( tc );
	info = factorAndInvert( 'no-transpose', 'upper', 3, A );
	Av = reinterpret( A, 0 );
	assert.equal( info, tc.info );
	assertArrayClose( Av, tc.a, 1e-14, 'a' );
});

test( 'zpftri: lower_odd_conjtrans (N=3, TRANSR=conjugate-transpose, UPLO=lower)', function t() { // eslint-disable-line max-len
	var info;
	var tc;
	var Av;
	var A;

	tc = lower_odd_conjtrans;
	A = makeInput( tc );
	info = factorAndInvert( 'conjugate-transpose', 'lower', 3, A );
	Av = reinterpret( A, 0 );
	assert.equal( info, tc.info );
	assertArrayClose( Av, tc.a, 1e-14, 'a' );
});

test( 'zpftri: upper_odd_conjtrans (N=3, TRANSR=conjugate-transpose, UPLO=upper)', function t() { // eslint-disable-line max-len
	var info;
	var tc;
	var Av;
	var A;

	tc = upper_odd_conjtrans;
	A = makeInput( tc );
	info = factorAndInvert( 'conjugate-transpose', 'upper', 3, A );
	Av = reinterpret( A, 0 );
	assert.equal( info, tc.info );
	assertArrayClose( Av, tc.a, 1e-14, 'a' );
});

test( 'zpftri: lower_even_normal (N=4, TRANSR=no-transpose, UPLO=lower)', function t() { // eslint-disable-line max-len
	var info;
	var tc;
	var Av;
	var A;

	tc = lower_even_normal;
	A = makeInput( tc );
	info = factorAndInvert( 'no-transpose', 'lower', 4, A );
	Av = reinterpret( A, 0 );
	assert.equal( info, tc.info );
	assertArrayClose( Av, tc.a, 1e-14, 'a' );
});

test( 'zpftri: upper_even_normal (N=4, TRANSR=no-transpose, UPLO=upper)', function t() { // eslint-disable-line max-len
	var info;
	var tc;
	var Av;
	var A;

	tc = upper_even_normal;
	A = makeInput( tc );
	info = factorAndInvert( 'no-transpose', 'upper', 4, A );
	Av = reinterpret( A, 0 );
	assert.equal( info, tc.info );
	assertArrayClose( Av, tc.a, 1e-14, 'a' );
});

test( 'zpftri: lower_even_conjtrans (N=4, TRANSR=conjugate-transpose, UPLO=lower)', function t() { // eslint-disable-line max-len
	var info;
	var tc;
	var Av;
	var A;

	tc = lower_even_conjtrans;
	A = makeInput( tc );
	info = factorAndInvert( 'conjugate-transpose', 'lower', 4, A );
	Av = reinterpret( A, 0 );
	assert.equal( info, tc.info );
	assertArrayClose( Av, tc.a, 1e-14, 'a' );
});

test( 'zpftri: upper_even_conjtrans (N=4, TRANSR=conjugate-transpose, UPLO=upper)', function t() { // eslint-disable-line max-len
	var info;
	var tc;
	var Av;
	var A;

	tc = upper_even_conjtrans;
	A = makeInput( tc );
	info = factorAndInvert( 'conjugate-transpose', 'upper', 4, A );
	Av = reinterpret( A, 0 );
	assert.equal( info, tc.info );
	assertArrayClose( Av, tc.a, 1e-14, 'a' );
});

test( 'zpftri: n_zero', function t() {
	var info;
	var A;

	A = new Complex128Array( 0 );
	info = zpftri( 'no-transpose', 'lower', 0, A, 1, 0 );
	assert.equal( info, 0 );
});

test( 'zpftri: n_one', function t() {
	var info;
	var tc;
	var Av;
	var A;

	tc = n_one;
	A = makeInput( tc );
	info = factorAndInvert( 'no-transpose', 'lower', 1, A );
	Av = reinterpret( A, 0 );
	assert.equal( info, tc.info );
	assertArrayClose( Av, tc.a, 1e-14, 'a' );
});

test( 'zpftri: lower_5_normal (N=5, TRANSR=no-transpose, UPLO=lower)', function t() { // eslint-disable-line max-len
	var info;
	var tc;
	var Av;
	var A;

	tc = lower_5_normal;
	A = makeInput( tc );
	info = factorAndInvert( 'no-transpose', 'lower', 5, A );
	Av = reinterpret( A, 0 );
	assert.equal( info, tc.info );
	assertArrayClose( Av, tc.a, 1e-13, 'a' );
});

test( 'zpftri: upper_5_conjtrans (N=5, TRANSR=conjugate-transpose, UPLO=upper)', function t() { // eslint-disable-line max-len
	var info;
	var tc;
	var Av;
	var A;

	tc = upper_5_conjtrans;
	A = makeInput( tc );
	info = factorAndInvert( 'conjugate-transpose', 'upper', 5, A );
	Av = reinterpret( A, 0 );
	assert.equal( info, tc.info );
	assertArrayClose( Av, tc.a, 1e-13, 'a' );
});

test( 'zpftri: upper_5_normal (N=5, TRANSR=no-transpose, UPLO=upper)', function t() { // eslint-disable-line max-len
	var info;
	var tc;
	var Av;
	var A;

	tc = upper_5_normal;
	A = makeInput( tc );
	info = factorAndInvert( 'no-transpose', 'upper', 5, A );
	Av = reinterpret( A, 0 );
	assert.equal( info, tc.info );
	assertArrayClose( Av, tc.a, 1e-13, 'a' );
});

test( 'zpftri: lower_5_conjtrans (N=5, TRANSR=conjugate-transpose, UPLO=lower)', function t() { // eslint-disable-line max-len
	var info;
	var tc;
	var Av;
	var A;

	tc = lower_5_conjtrans;
	A = makeInput( tc );
	info = factorAndInvert( 'conjugate-transpose', 'lower', 5, A );
	Av = reinterpret( A, 0 );
	assert.equal( info, tc.info );
	assertArrayClose( Av, tc.a, 1e-13, 'a' );
});
