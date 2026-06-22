import __imp0 from './fixtures/n3_nrhs1_lower_normal.json' with { type: 'json' };
import __imp1 from './fixtures/n3_nrhs1_upper_normal.json' with { type: 'json' };
import __imp2 from './fixtures/n3_nrhs1_lower_conjtrans.json' with { type: 'json' };
import __imp3 from './fixtures/n3_nrhs1_upper_conjtrans.json' with { type: 'json' };
import __imp4 from './fixtures/n4_nrhs1_lower_normal.json' with { type: 'json' };
import __imp5 from './fixtures/n4_nrhs1_upper_normal.json' with { type: 'json' };
import __imp6 from './fixtures/n4_nrhs1_lower_conjtrans.json' with { type: 'json' };
import __imp7 from './fixtures/n4_nrhs1_upper_conjtrans.json' with { type: 'json' };
import __imp8 from './fixtures/n3_nrhs2_lower_normal.json' with { type: 'json' };
import __imp9 from './fixtures/n3_nrhs2_upper_conjtrans.json' with { type: 'json' };
import __imp10 from './fixtures/n4_nrhs2_lower_normal.json' with { type: 'json' };
import __imp11 from './fixtures/n4_nrhs2_upper_conjtrans.json' with { type: 'json' };
import __imp12 from './fixtures/n_one.json' with { type: 'json' };
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
import zpftrs from './../lib/ndarray.js';


// FIXTURES //

var fixtures = {
	'n3_nrhs1_lower_normal': __imp0,
	'n3_nrhs1_upper_normal': __imp1,
	'n3_nrhs1_lower_conjtrans': __imp2,
	'n3_nrhs1_upper_conjtrans': __imp3,
	'n4_nrhs1_lower_normal': __imp4,
	'n4_nrhs1_upper_normal': __imp5,
	'n4_nrhs1_lower_conjtrans': __imp6,
	'n4_nrhs1_upper_conjtrans': __imp7,
	'n3_nrhs2_lower_normal': __imp8,
	'n3_nrhs2_upper_conjtrans': __imp9,
	'n4_nrhs2_lower_normal': __imp10,
	'n4_nrhs2_upper_conjtrans': __imp11,
	'n_one': __imp12
};


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
* Runs a zpftrs fixture test.
*
* @private
* @param {string} name - fixture case name
* @param {string} transr - 'no-transpose' or 'conjugate-transpose'
* @param {string} uplo - 'upper' or 'lower'
* @param {NonNegativeInteger} N - order of matrix
* @param {NonNegativeInteger} nrhs - number of right-hand sides
*/
function runTest( name, transr, uplo, N, nrhs ) {
	var info;
	var tc;
	var Bv;
	var A;
	var B;

	tc = fixtures[ name ];
	A = new Complex128Array( tc.a );
	B = new Complex128Array( tc.b_in );
	info = zpftrs( transr, uplo, N, nrhs, A, 1, 0, B, 1, N, 0 );
	Bv = reinterpret( B, 0 );
	assert.equal( info, tc.info );
	assertArrayClose( Bv, tc.b_out, 1e-14, 'b_out' );
}


// TESTS //

test( 'zpftrs: n3_nrhs1_lower_normal (N=3, NRHS=1, TRANSR=no-transpose, UPLO=lower)', function t() { // eslint-disable-line max-len
	runTest( 'n3_nrhs1_lower_normal', 'no-transpose', 'lower', 3, 1 );
});

test( 'zpftrs: n3_nrhs1_upper_normal (N=3, NRHS=1, TRANSR=no-transpose, UPLO=upper)', function t() { // eslint-disable-line max-len
	runTest( 'n3_nrhs1_upper_normal', 'no-transpose', 'upper', 3, 1 );
});

test( 'zpftrs: n3_nrhs1_lower_conjtrans (N=3, NRHS=1, TRANSR=conjugate-transpose, UPLO=lower)', function t() { // eslint-disable-line max-len
	runTest( 'n3_nrhs1_lower_conjtrans', 'conjugate-transpose', 'lower', 3, 1 );
});

test( 'zpftrs: n3_nrhs1_upper_conjtrans (N=3, NRHS=1, TRANSR=conjugate-transpose, UPLO=upper)', function t() { // eslint-disable-line max-len
	runTest( 'n3_nrhs1_upper_conjtrans', 'conjugate-transpose', 'upper', 3, 1 );
});

test( 'zpftrs: n4_nrhs1_lower_normal (N=4, NRHS=1, TRANSR=no-transpose, UPLO=lower)', function t() { // eslint-disable-line max-len
	runTest( 'n4_nrhs1_lower_normal', 'no-transpose', 'lower', 4, 1 );
});

test( 'zpftrs: n4_nrhs1_upper_normal (N=4, NRHS=1, TRANSR=no-transpose, UPLO=upper)', function t() { // eslint-disable-line max-len
	runTest( 'n4_nrhs1_upper_normal', 'no-transpose', 'upper', 4, 1 );
});

test( 'zpftrs: n4_nrhs1_lower_conjtrans (N=4, NRHS=1, TRANSR=conjugate-transpose, UPLO=lower)', function t() { // eslint-disable-line max-len
	runTest( 'n4_nrhs1_lower_conjtrans', 'conjugate-transpose', 'lower', 4, 1 );
});

test( 'zpftrs: n4_nrhs1_upper_conjtrans (N=4, NRHS=1, TRANSR=conjugate-transpose, UPLO=upper)', function t() { // eslint-disable-line max-len
	runTest( 'n4_nrhs1_upper_conjtrans', 'conjugate-transpose', 'upper', 4, 1 );
});

test( 'zpftrs: n3_nrhs2_lower_normal (N=3, NRHS=2, TRANSR=no-transpose, UPLO=lower)', function t() { // eslint-disable-line max-len
	runTest( 'n3_nrhs2_lower_normal', 'no-transpose', 'lower', 3, 2 );
});

test( 'zpftrs: n3_nrhs2_upper_conjtrans (N=3, NRHS=2, TRANSR=conjugate-transpose, UPLO=upper)', function t() { // eslint-disable-line max-len
	runTest( 'n3_nrhs2_upper_conjtrans', 'conjugate-transpose', 'upper', 3, 2 );
});

test( 'zpftrs: n4_nrhs2_lower_normal (N=4, NRHS=2, TRANSR=no-transpose, UPLO=lower)', function t() { // eslint-disable-line max-len
	runTest( 'n4_nrhs2_lower_normal', 'no-transpose', 'lower', 4, 2 );
});

test( 'zpftrs: n4_nrhs2_upper_conjtrans (N=4, NRHS=2, TRANSR=conjugate-transpose, UPLO=upper)', function t() { // eslint-disable-line max-len
	runTest( 'n4_nrhs2_upper_conjtrans', 'conjugate-transpose', 'upper', 4, 2 );
});

test( 'zpftrs: n_zero (N=0 returns immediately)', function t() {
	var info;
	var B;

	B = new Complex128Array( 0 );
	info = zpftrs( 'no-transpose', 'lower', 0, 1, new Complex128Array( 0 ), 1, 0, B, 1, 0, 0 ); // eslint-disable-line max-len
	assert.equal( info, 0 );
});

test( 'zpftrs: n_one (N=1, NRHS=1)', function t() {
	var info;
	var tc;
	var Bv;
	var A;
	var B;

	tc = fixtures[ 'n_one' ];
	A = new Complex128Array( tc.a );
	B = new Complex128Array( tc.b_in );
	info = zpftrs( 'no-transpose', 'lower', 1, 1, A, 1, 0, B, 1, 1, 0 );
	Bv = reinterpret( B, 0 );
	assert.equal( info, tc.info );
	assertArrayClose( Bv, tc.b_out, 1e-14, 'b_out' );
});
