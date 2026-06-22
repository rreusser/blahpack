import __imp0 from './fixtures/left_modd_nln.json' with { type: 'json' };
import __imp1 from './fixtures/left_modd_nlc.json' with { type: 'json' };
import __imp2 from './fixtures/left_modd_nun.json' with { type: 'json' };
import __imp3 from './fixtures/left_modd_nuc.json' with { type: 'json' };
import __imp4 from './fixtures/left_modd_cln.json' with { type: 'json' };
import __imp5 from './fixtures/left_modd_clc.json' with { type: 'json' };
import __imp6 from './fixtures/left_modd_cun.json' with { type: 'json' };
import __imp7 from './fixtures/left_modd_cuc.json' with { type: 'json' };
import __imp8 from './fixtures/left_meven_nln.json' with { type: 'json' };
import __imp9 from './fixtures/left_meven_nlc.json' with { type: 'json' };
import __imp10 from './fixtures/left_meven_nun.json' with { type: 'json' };
import __imp11 from './fixtures/left_meven_nuc.json' with { type: 'json' };
import __imp12 from './fixtures/left_meven_cln.json' with { type: 'json' };
import __imp13 from './fixtures/left_meven_clc.json' with { type: 'json' };
import __imp14 from './fixtures/left_meven_cun.json' with { type: 'json' };
import __imp15 from './fixtures/left_meven_cuc.json' with { type: 'json' };
import __imp16 from './fixtures/right_nodd_nln.json' with { type: 'json' };
import __imp17 from './fixtures/right_nodd_nlc.json' with { type: 'json' };
import __imp18 from './fixtures/right_nodd_nun.json' with { type: 'json' };
import __imp19 from './fixtures/right_nodd_nuc.json' with { type: 'json' };
import __imp20 from './fixtures/right_nodd_cln.json' with { type: 'json' };
import __imp21 from './fixtures/right_nodd_clc.json' with { type: 'json' };
import __imp22 from './fixtures/right_nodd_cun.json' with { type: 'json' };
import __imp23 from './fixtures/right_nodd_cuc.json' with { type: 'json' };
import __imp24 from './fixtures/right_neven_nln.json' with { type: 'json' };
import __imp25 from './fixtures/right_neven_nlc.json' with { type: 'json' };
import __imp26 from './fixtures/right_neven_nun.json' with { type: 'json' };
import __imp27 from './fixtures/right_neven_nuc.json' with { type: 'json' };
import __imp28 from './fixtures/right_neven_cln.json' with { type: 'json' };
import __imp29 from './fixtures/right_neven_clc.json' with { type: 'json' };
import __imp30 from './fixtures/right_neven_cun.json' with { type: 'json' };
import __imp31 from './fixtures/right_neven_cuc.json' with { type: 'json' };
import __imp32 from './fixtures/left_modd_nln_unit.json' with { type: 'json' };
import __imp33 from './fixtures/left_meven_nln_unit.json' with { type: 'json' };
import __imp34 from './fixtures/right_nodd_nln_unit.json' with { type: 'json' };
import __imp35 from './fixtures/right_neven_nln_unit.json' with { type: 'json' };
import __imp36 from './fixtures/m1_nln.json' with { type: 'json' };
import __imp37 from './fixtures/m1_nlc.json' with { type: 'json' };
import __imp38 from './fixtures/m1_cln.json' with { type: 'json' };
import __imp39 from './fixtures/m1_clc.json' with { type: 'json' };
import __imp40 from './fixtures/alpha_zero.json' with { type: 'json' };
import __imp41 from './fixtures/left_alpha.json' with { type: 'json' };
import __imp42 from './fixtures/right_alpha.json' with { type: 'json' };
/* eslint-disable no-restricted-syntax, stdlib/first-unit-test, max-lines */

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
import Complex128 from '@stdlib/complex/float64/ctor/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import ztfsm from './../lib/ndarray.js';


// FIXTURES //

var fixtures = {
	'left_modd_NLN': __imp0,
	'left_modd_NLC': __imp1,
	'left_modd_NUN': __imp2,
	'left_modd_NUC': __imp3,
	'left_modd_CLN': __imp4,
	'left_modd_CLC': __imp5,
	'left_modd_CUN': __imp6,
	'left_modd_CUC': __imp7,
	'left_meven_NLN': __imp8,
	'left_meven_NLC': __imp9,
	'left_meven_NUN': __imp10,
	'left_meven_NUC': __imp11,
	'left_meven_CLN': __imp12,
	'left_meven_CLC': __imp13,
	'left_meven_CUN': __imp14,
	'left_meven_CUC': __imp15,
	'right_nodd_NLN': __imp16,
	'right_nodd_NLC': __imp17,
	'right_nodd_NUN': __imp18,
	'right_nodd_NUC': __imp19,
	'right_nodd_CLN': __imp20,
	'right_nodd_CLC': __imp21,
	'right_nodd_CUN': __imp22,
	'right_nodd_CUC': __imp23,
	'right_neven_NLN': __imp24,
	'right_neven_NLC': __imp25,
	'right_neven_NUN': __imp26,
	'right_neven_NUC': __imp27,
	'right_neven_CLN': __imp28,
	'right_neven_CLC': __imp29,
	'right_neven_CUN': __imp30,
	'right_neven_CUC': __imp31,
	'left_modd_NLN_unit': __imp32,
	'left_meven_NLN_unit': __imp33,
	'right_nodd_NLN_unit': __imp34,
	'right_neven_NLN_unit': __imp35,
	'm1_NLN': __imp36,
	'm1_NLC': __imp37,
	'm1_CLN': __imp38,
	'm1_CLC': __imp39,
	'alpha_zero': __imp40,
	'left_alpha': __imp41,
	'right_alpha': __imp42
};


// VARIABLES //

var CONE = new Complex128( 1.0, 0.0 );
var TOL = 1e-13;


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
* Runs a generic ztfsm fixture test case.
*
* @private
* @param {string} name - fixture name
* @param {string} transr - TRANSR parameter
* @param {string} side - SIDE parameter
* @param {string} uplo - UPLO parameter
* @param {string} trans - TRANS parameter
* @param {string} diag - DIAG parameter
* @param {NonNegativeInteger} M - rows of B
* @param {NonNegativeInteger} N - cols of B
* @param {Complex128} alpha - scalar
*/
function runCase( name, transr, side, uplo, trans, diag, M, N, alpha ) {
	var tc;
	var Bv;
	var A;
	var B;

	tc = fixtures[ name ];
	A = new Complex128Array( tc.a );
	B = new Complex128Array( tc.b_in );

	ztfsm( transr, side, uplo, trans, diag, M, N, alpha, A, 1, 0, B, 1, M, 0 );
	Bv = reinterpret( B, 0 );
	assertArrayClose( Bv, tc.b_out, TOL, name );
}


// TESTS //

// --- SIDE = Left, M odd (3), all TRANSR/UPLO/TRANS combos ---

test( 'ztfsm: left, M odd, TRANSR=N, UPLO=L, TRANS=N', function t() {
	runCase( 'left_modd_NLN', 'no-transpose', 'left', 'lower', 'no-transpose', 'non-unit', 3, 2, CONE ); // eslint-disable-line max-len
});

test( 'ztfsm: left, M odd, TRANSR=N, UPLO=L, TRANS=C', function t() {
	runCase( 'left_modd_NLC', 'no-transpose', 'left', 'lower', 'conjugate-transpose', 'non-unit', 3, 2, CONE ); // eslint-disable-line max-len
});

test( 'ztfsm: left, M odd, TRANSR=N, UPLO=U, TRANS=N', function t() {
	runCase( 'left_modd_NUN', 'no-transpose', 'left', 'upper', 'no-transpose', 'non-unit', 3, 2, CONE ); // eslint-disable-line max-len
});

test( 'ztfsm: left, M odd, TRANSR=N, UPLO=U, TRANS=C', function t() {
	runCase( 'left_modd_NUC', 'no-transpose', 'left', 'upper', 'conjugate-transpose', 'non-unit', 3, 2, CONE ); // eslint-disable-line max-len
});

test( 'ztfsm: left, M odd, TRANSR=C, UPLO=L, TRANS=N', function t() {
	runCase( 'left_modd_CLN', 'conjugate-transpose', 'left', 'lower', 'no-transpose', 'non-unit', 3, 2, CONE ); // eslint-disable-line max-len
});

test( 'ztfsm: left, M odd, TRANSR=C, UPLO=L, TRANS=C', function t() {
	runCase( 'left_modd_CLC', 'conjugate-transpose', 'left', 'lower', 'conjugate-transpose', 'non-unit', 3, 2, CONE ); // eslint-disable-line max-len
});

test( 'ztfsm: left, M odd, TRANSR=C, UPLO=U, TRANS=N', function t() {
	runCase( 'left_modd_CUN', 'conjugate-transpose', 'left', 'upper', 'no-transpose', 'non-unit', 3, 2, CONE ); // eslint-disable-line max-len
});

test( 'ztfsm: left, M odd, TRANSR=C, UPLO=U, TRANS=C', function t() {
	runCase( 'left_modd_CUC', 'conjugate-transpose', 'left', 'upper', 'conjugate-transpose', 'non-unit', 3, 2, CONE ); // eslint-disable-line max-len
});

// --- SIDE = Left, M even (4), all TRANSR/UPLO/TRANS combos ---

test( 'ztfsm: left, M even, TRANSR=N, UPLO=L, TRANS=N', function t() {
	runCase( 'left_meven_NLN', 'no-transpose', 'left', 'lower', 'no-transpose', 'non-unit', 4, 2, CONE ); // eslint-disable-line max-len
});

test( 'ztfsm: left, M even, TRANSR=N, UPLO=L, TRANS=C', function t() {
	runCase( 'left_meven_NLC', 'no-transpose', 'left', 'lower', 'conjugate-transpose', 'non-unit', 4, 2, CONE ); // eslint-disable-line max-len
});

test( 'ztfsm: left, M even, TRANSR=N, UPLO=U, TRANS=N', function t() {
	runCase( 'left_meven_NUN', 'no-transpose', 'left', 'upper', 'no-transpose', 'non-unit', 4, 2, CONE ); // eslint-disable-line max-len
});

test( 'ztfsm: left, M even, TRANSR=N, UPLO=U, TRANS=C', function t() {
	runCase( 'left_meven_NUC', 'no-transpose', 'left', 'upper', 'conjugate-transpose', 'non-unit', 4, 2, CONE ); // eslint-disable-line max-len
});

test( 'ztfsm: left, M even, TRANSR=C, UPLO=L, TRANS=N', function t() {
	runCase( 'left_meven_CLN', 'conjugate-transpose', 'left', 'lower', 'no-transpose', 'non-unit', 4, 2, CONE ); // eslint-disable-line max-len
});

test( 'ztfsm: left, M even, TRANSR=C, UPLO=L, TRANS=C', function t() {
	runCase( 'left_meven_CLC', 'conjugate-transpose', 'left', 'lower', 'conjugate-transpose', 'non-unit', 4, 2, CONE ); // eslint-disable-line max-len
});

test( 'ztfsm: left, M even, TRANSR=C, UPLO=U, TRANS=N', function t() {
	runCase( 'left_meven_CUN', 'conjugate-transpose', 'left', 'upper', 'no-transpose', 'non-unit', 4, 2, CONE ); // eslint-disable-line max-len
});

test( 'ztfsm: left, M even, TRANSR=C, UPLO=U, TRANS=C', function t() {
	runCase( 'left_meven_CUC', 'conjugate-transpose', 'left', 'upper', 'conjugate-transpose', 'non-unit', 4, 2, CONE ); // eslint-disable-line max-len
});

// --- SIDE = Right, N odd (3), all TRANSR/UPLO/TRANS combos ---

test( 'ztfsm: right, N odd, TRANSR=N, UPLO=L, TRANS=N', function t() {
	runCase( 'right_nodd_NLN', 'no-transpose', 'right', 'lower', 'no-transpose', 'non-unit', 2, 3, CONE ); // eslint-disable-line max-len
});

test( 'ztfsm: right, N odd, TRANSR=N, UPLO=L, TRANS=C', function t() {
	runCase( 'right_nodd_NLC', 'no-transpose', 'right', 'lower', 'conjugate-transpose', 'non-unit', 2, 3, CONE ); // eslint-disable-line max-len
});

test( 'ztfsm: right, N odd, TRANSR=N, UPLO=U, TRANS=N', function t() {
	runCase( 'right_nodd_NUN', 'no-transpose', 'right', 'upper', 'no-transpose', 'non-unit', 2, 3, CONE ); // eslint-disable-line max-len
});

test( 'ztfsm: right, N odd, TRANSR=N, UPLO=U, TRANS=C', function t() {
	runCase( 'right_nodd_NUC', 'no-transpose', 'right', 'upper', 'conjugate-transpose', 'non-unit', 2, 3, CONE ); // eslint-disable-line max-len
});

test( 'ztfsm: right, N odd, TRANSR=C, UPLO=L, TRANS=N', function t() {
	runCase( 'right_nodd_CLN', 'conjugate-transpose', 'right', 'lower', 'no-transpose', 'non-unit', 2, 3, CONE ); // eslint-disable-line max-len
});

test( 'ztfsm: right, N odd, TRANSR=C, UPLO=L, TRANS=C', function t() {
	runCase( 'right_nodd_CLC', 'conjugate-transpose', 'right', 'lower', 'conjugate-transpose', 'non-unit', 2, 3, CONE ); // eslint-disable-line max-len
});

test( 'ztfsm: right, N odd, TRANSR=C, UPLO=U, TRANS=N', function t() {
	runCase( 'right_nodd_CUN', 'conjugate-transpose', 'right', 'upper', 'no-transpose', 'non-unit', 2, 3, CONE ); // eslint-disable-line max-len
});

test( 'ztfsm: right, N odd, TRANSR=C, UPLO=U, TRANS=C', function t() {
	runCase( 'right_nodd_CUC', 'conjugate-transpose', 'right', 'upper', 'conjugate-transpose', 'non-unit', 2, 3, CONE ); // eslint-disable-line max-len
});

// --- SIDE = Right, N even (4), all TRANSR/UPLO/TRANS combos ---

test( 'ztfsm: right, N even, TRANSR=N, UPLO=L, TRANS=N', function t() {
	runCase( 'right_neven_NLN', 'no-transpose', 'right', 'lower', 'no-transpose', 'non-unit', 2, 4, CONE ); // eslint-disable-line max-len
});

test( 'ztfsm: right, N even, TRANSR=N, UPLO=L, TRANS=C', function t() {
	runCase( 'right_neven_NLC', 'no-transpose', 'right', 'lower', 'conjugate-transpose', 'non-unit', 2, 4, CONE ); // eslint-disable-line max-len
});

test( 'ztfsm: right, N even, TRANSR=N, UPLO=U, TRANS=N', function t() {
	runCase( 'right_neven_NUN', 'no-transpose', 'right', 'upper', 'no-transpose', 'non-unit', 2, 4, CONE ); // eslint-disable-line max-len
});

test( 'ztfsm: right, N even, TRANSR=N, UPLO=U, TRANS=C', function t() {
	runCase( 'right_neven_NUC', 'no-transpose', 'right', 'upper', 'conjugate-transpose', 'non-unit', 2, 4, CONE ); // eslint-disable-line max-len
});

test( 'ztfsm: right, N even, TRANSR=C, UPLO=L, TRANS=N', function t() {
	runCase( 'right_neven_CLN', 'conjugate-transpose', 'right', 'lower', 'no-transpose', 'non-unit', 2, 4, CONE ); // eslint-disable-line max-len
});

test( 'ztfsm: right, N even, TRANSR=C, UPLO=L, TRANS=C', function t() {
	runCase( 'right_neven_CLC', 'conjugate-transpose', 'right', 'lower', 'conjugate-transpose', 'non-unit', 2, 4, CONE ); // eslint-disable-line max-len
});

test( 'ztfsm: right, N even, TRANSR=C, UPLO=U, TRANS=N', function t() {
	runCase( 'right_neven_CUN', 'conjugate-transpose', 'right', 'upper', 'no-transpose', 'non-unit', 2, 4, CONE ); // eslint-disable-line max-len
});

test( 'ztfsm: right, N even, TRANSR=C, UPLO=U, TRANS=C', function t() {
	runCase( 'right_neven_CUC', 'conjugate-transpose', 'right', 'upper', 'conjugate-transpose', 'non-unit', 2, 4, CONE ); // eslint-disable-line max-len
});

// --- Unit diagonal cases ---

test( 'ztfsm: left, M odd, unit diagonal', function t() {
	runCase( 'left_modd_NLN_unit', 'no-transpose', 'left', 'lower', 'no-transpose', 'unit', 3, 2, CONE ); // eslint-disable-line max-len
});

test( 'ztfsm: left, M even, unit diagonal', function t() {
	runCase( 'left_meven_NLN_unit', 'no-transpose', 'left', 'lower', 'no-transpose', 'unit', 4, 2, CONE ); // eslint-disable-line max-len
});

test( 'ztfsm: right, N odd, unit diagonal', function t() {
	runCase( 'right_nodd_NLN_unit', 'no-transpose', 'right', 'lower', 'no-transpose', 'unit', 2, 3, CONE ); // eslint-disable-line max-len
});

test( 'ztfsm: right, N even, unit diagonal', function t() {
	runCase( 'right_neven_NLN_unit', 'no-transpose', 'right', 'lower', 'no-transpose', 'unit', 2, 4, CONE ); // eslint-disable-line max-len
});

// --- M=1 special cases ---

test( 'ztfsm: M=1, TRANSR=N, UPLO=L, TRANS=N', function t() {
	runCase( 'm1_NLN', 'no-transpose', 'left', 'lower', 'no-transpose', 'non-unit', 1, 2, CONE ); // eslint-disable-line max-len
});

test( 'ztfsm: M=1, TRANSR=N, UPLO=L, TRANS=C', function t() {
	runCase( 'm1_NLC', 'no-transpose', 'left', 'lower', 'conjugate-transpose', 'non-unit', 1, 2, CONE ); // eslint-disable-line max-len
});

test( 'ztfsm: M=1, TRANSR=C, UPLO=L, TRANS=N', function t() {
	runCase( 'm1_CLN', 'conjugate-transpose', 'left', 'lower', 'no-transpose', 'non-unit', 1, 2, CONE ); // eslint-disable-line max-len
});

test( 'ztfsm: M=1, TRANSR=C, UPLO=L, TRANS=C', function t() {
	runCase( 'm1_CLC', 'conjugate-transpose', 'left', 'lower', 'conjugate-transpose', 'non-unit', 1, 2, CONE ); // eslint-disable-line max-len
});

// --- Alpha = 0 case ---

test( 'ztfsm: alpha = 0 sets B to zero', function t() {
	var alpha;
	var tc;
	var Bv;
	var B;

	alpha = new Complex128( 0.0, 0.0 );
	tc = fixtures.alpha_zero;
	B = new Complex128Array( tc.b_in );
	ztfsm( 'no-transpose', 'left', 'lower', 'no-transpose', 'non-unit', 3, 2, alpha, new Complex128Array( 6 ), 1, 0, B, 1, 3, 0 ); // eslint-disable-line max-len
	Bv = reinterpret( B, 0 );
	assertArrayClose( Bv, tc.b_out, TOL, 'alpha_zero' );
});

// --- Empty cases: M=0 or N=0 ---

test( 'ztfsm: M=0 returns immediately', function t() {
	var Bv;
	var B;

	B = new Complex128Array( [ 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99 ] ); // eslint-disable-line max-len
	ztfsm( 'no-transpose', 'left', 'lower', 'no-transpose', 'non-unit', 0, 2, CONE, new Complex128Array( 1 ), 1, 0, B, 1, 3, 0 ); // eslint-disable-line max-len
	Bv = reinterpret( B, 0 );
	assert.equal( Bv[ 0 ], 99 );
	assert.equal( Bv[ 1 ], 99 );
});

test( 'ztfsm: N=0 returns immediately', function t() {
	var Bv;
	var B;

	B = new Complex128Array( [ 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99 ] ); // eslint-disable-line max-len
	ztfsm( 'no-transpose', 'left', 'lower', 'no-transpose', 'non-unit', 3, 0, CONE, new Complex128Array( 1 ), 1, 0, B, 1, 3, 0 ); // eslint-disable-line max-len
	Bv = reinterpret( B, 0 );
	assert.equal( Bv[ 0 ], 99 );
	assert.equal( Bv[ 1 ], 99 );
});

// --- Non-trivial alpha ---

test( 'ztfsm: left, non-trivial alpha', function t() {
	var alpha;
	var tc;
	var Bv;
	var A;
	var B;

	alpha = new Complex128( 2.0, -1.0 );
	tc = fixtures.left_alpha;
	A = new Complex128Array( tc.a );
	B = new Complex128Array( tc.b_in );
	ztfsm( 'no-transpose', 'left', 'lower', 'no-transpose', 'non-unit', 3, 2, alpha, A, 1, 0, B, 1, 3, 0 ); // eslint-disable-line max-len
	Bv = reinterpret( B, 0 );
	assertArrayClose( Bv, tc.b_out, TOL, 'left_alpha' );
});

test( 'ztfsm: right, non-trivial alpha', function t() {
	var alpha;
	var tc;
	var Bv;
	var A;
	var B;

	alpha = new Complex128( 0.5, 1.0 );
	tc = fixtures.right_alpha;
	A = new Complex128Array( tc.a );
	B = new Complex128Array( tc.b_in );
	ztfsm( 'no-transpose', 'right', 'lower', 'no-transpose', 'non-unit', 2, 3, alpha, A, 1, 0, B, 1, 2, 0 ); // eslint-disable-line max-len
	Bv = reinterpret( B, 0 );
	assertArrayClose( Bv, tc.b_out, TOL, 'right_alpha' );
});
