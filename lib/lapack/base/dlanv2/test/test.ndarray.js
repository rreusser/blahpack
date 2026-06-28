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
import dlanv2 from './../lib/ndarray.js';

// FIXTURES //

import c_zero from './fixtures/c_zero.json' with { type: 'json' };
import b_zero from './fixtures/b_zero.json' with { type: 'json' };
import a_eq_d_diff_sign from './fixtures/a_eq_d_diff_sign.json' with { type: 'json' };
import real_eigenvalues from './fixtures/real_eigenvalues.json' with { type: 'json' };
import complex_eigenvalues from './fixtures/complex_eigenvalues.json' with { type: 'json' };
import zero_matrix from './fixtures/zero_matrix.json' with { type: 'json' };
import identity from './fixtures/identity.json' with { type: 'json' };
import diagonal from './fixtures/diagonal.json' with { type: 'json' };
import real_negative from './fixtures/real_negative.json' with { type: 'json' };
import complex_equal_diag from './fixtures/complex_equal_diag.json' with { type: 'json' };
import near_equal from './fixtures/near_equal.json' with { type: 'json' };
import large_values from './fixtures/large_values.json' with { type: 'json' };
import same_sign_bc from './fixtures/same_sign_bc.json' with { type: 'json' };
import tiny_bc from './fixtures/tiny_bc.json' with { type: 'json' };

// VARIABLES //

// Map test name -> input (a, b, c, d):
var inputs = {
	'c_zero': [ 1.0, 2.0, 0.0, 3.0 ],
	'b_zero': [ 3.0, 0.0, 4.0, 1.0 ],
	'a_eq_d_diff_sign': [ 2.0, 3.0, -1.0, 2.0 ],
	'real_eigenvalues': [ 4.0, 1.0, 2.0, 3.0 ],
	'complex_eigenvalues': [ 1.0, -5.0, 1.0, 1.0 ],
	'zero_matrix': [ 0.0, 0.0, 0.0, 0.0 ],
	'identity': [ 1.0, 0.0, 0.0, 1.0 ],
	'diagonal': [ 5.0, 0.0, 0.0, 2.0 ],
	'real_negative': [ -1.0, 3.0, 2.0, 4.0 ],
	'complex_equal_diag': [ 3.0, -4.0, 2.0, 3.0 ],
	'near_equal': [ 1.0, 1.0e-15, 1.0e-15, 1.0 ],
	'large_values': [ 1.0e150, 2.0e150, 3.0e150, 4.0e150 ],
	'same_sign_bc': [ 2.0, 3.0, 3.0, 2.0 ],
	'tiny_bc': [ 2.0, 1.0e-16, 1.0e-16, 2.0 ]
};

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
	assert.ok( relErr <= tol, msg + ': expected ' + expected + ', got ' + actual + ' (relErr=' + relErr + ')' ); // eslint-disable-line max-len
}

/**
* Checks all output fields of a dlanv2 result against fixture data.
*
* @private
* @param {Object} result - dlanv2 result
* @param {Object} tc - test case fixture
* @param {number} tol - tolerance
*/
function checkResult( result, tc, tol ) {
	assertClose( result.a, tc.a, tol, 'a' );
	assertClose( result.b, tc.b, tol, 'b' );
	assertClose( result.c, tc.c, tol, 'c' );
	assertClose( result.d, tc.d, tol, 'd' );
	assertClose( result.rt1r, tc.rt1r, tol, 'rt1r' );
	assertClose( result.rt1i, tc.rt1i, tol, 'rt1i' );
	assertClose( result.rt2r, tc.rt2r, tol, 'rt2r' );
	assertClose( result.rt2i, tc.rt2i, tol, 'rt2i' );
	assertClose( result.cs, tc.cs, tol, 'cs' );
	assertClose( result.sn, tc.sn, tol, 'sn' );
}

// TESTS //

test( 'dlanv2 is a function', function t() {
	assert.strictEqual( typeof dlanv2, 'function' );
});

test( 'dlanv2: c_zero (C=0, already Schur form)', function t() {
	var result;
	var inp;
	var tc;

	inp = inputs[ 'c_zero' ];
	tc = c_zero;
	result = dlanv2( inp[0], inp[1], inp[2], inp[3] );
	checkResult( result, tc, 1e-14 );
});

test( 'dlanv2: b_zero (B=0, swap rows and columns)', function t() {
	var result;
	var inp;
	var tc;

	inp = inputs[ 'b_zero' ];
	tc = b_zero;
	result = dlanv2( inp[0], inp[1], inp[2], inp[3] );
	checkResult( result, tc, 1e-14 );

	// Verify C is zeroed and rotation swaps:
	assert.strictEqual( result.c, 0.0 );
	assert.strictEqual( result.cs, 0.0 );
	assert.strictEqual( result.sn, 1.0 );
});

test( 'dlanv2: a_eq_d_diff_sign (A=D, sign(B)!=sign(C))', function t() {
	var result;
	var inp;
	var tc;

	inp = inputs[ 'a_eq_d_diff_sign' ];
	tc = a_eq_d_diff_sign;
	result = dlanv2( inp[0], inp[1], inp[2], inp[3] );
	checkResult( result, tc, 1e-14 );
});

test( 'dlanv2: real_eigenvalues (Z >= MULTPL*EPS)', function t() {
	var result;
	var inp;
	var tc;

	inp = inputs[ 'real_eigenvalues' ];
	tc = real_eigenvalues;
	result = dlanv2( inp[0], inp[1], inp[2], inp[3] );
	checkResult( result, tc, 1e-14 );

	// Real eigenvalues must have zero imaginary parts:
	assert.strictEqual( result.rt1i, 0.0 );
	assert.strictEqual( result.rt2i, 0.0 );
	assert.strictEqual( result.c, 0.0 );
});

test( 'dlanv2: complex_eigenvalues', function t() {
	var result;
	var inp;
	var tc;

	inp = inputs[ 'complex_eigenvalues' ];
	tc = complex_eigenvalues;
	result = dlanv2( inp[0], inp[1], inp[2], inp[3] );
	checkResult( result, tc, 1e-14 );

	// Complex eigenvalues: rt1i > 0, rt2i < 0:
	assert.ok( result.rt1i > 0.0, 'rt1i should be positive for complex conjugate pair' ); // eslint-disable-line max-len
	assert.ok( result.rt2i < 0.0, 'rt2i should be negative for complex conjugate pair' ); // eslint-disable-line max-len
	assert.strictEqual( result.a, result.d );
});

test( 'dlanv2: zero_matrix', function t() {
	var result;
	var inp;
	var tc;

	inp = inputs[ 'zero_matrix' ];
	tc = zero_matrix;
	result = dlanv2( inp[0], inp[1], inp[2], inp[3] );
	checkResult( result, tc, 1e-14 );

	// All outputs should be zero except cs=1:
	assert.strictEqual( result.a, 0.0 );
	assert.strictEqual( result.cs, 1.0 );
	assert.strictEqual( result.sn, 0.0 );
});

test( 'dlanv2: identity', function t() {
	var result;
	var inp;
	var tc;

	inp = inputs[ 'identity' ];
	tc = identity;
	result = dlanv2( inp[0], inp[1], inp[2], inp[3] );
	checkResult( result, tc, 1e-14 );
});

test( 'dlanv2: diagonal', function t() {
	var result;
	var inp;
	var tc;

	inp = inputs[ 'diagonal' ];
	tc = diagonal;
	result = dlanv2( inp[0], inp[1], inp[2], inp[3] );
	checkResult( result, tc, 1e-14 );
});

test( 'dlanv2: real_negative', function t() {
	var result;
	var inp;
	var tc;

	inp = inputs[ 'real_negative' ];
	tc = real_negative;
	result = dlanv2( inp[0], inp[1], inp[2], inp[3] );
	checkResult( result, tc, 1e-14 );
});

test( 'dlanv2: complex_equal_diag', function t() {
	var result;
	var inp;
	var tc;

	inp = inputs[ 'complex_equal_diag' ];
	tc = complex_equal_diag;
	result = dlanv2( inp[0], inp[1], inp[2], inp[3] );
	checkResult( result, tc, 1e-14 );
});

test( 'dlanv2: near_equal (small Z, complex path)', function t() {
	var result;
	var inp;
	var tc;

	inp = inputs[ 'near_equal' ];
	tc = near_equal;
	result = dlanv2( inp[0], inp[1], inp[2], inp[3] );
	checkResult( result, tc, 1e-14 );
});

test( 'dlanv2: large_values', function t() {
	var result;
	var inp;
	var tc;

	inp = inputs[ 'large_values' ];
	tc = large_values;
	result = dlanv2( inp[0], inp[1], inp[2], inp[3] );
	checkResult( result, tc, 1e-14 );
});

test( 'dlanv2: same_sign_bc (sign(B)==sign(C), real reduction)', function t() {
	var result;
	var inp;
	var tc;

	inp = inputs[ 'same_sign_bc' ];
	tc = same_sign_bc;
	result = dlanv2( inp[0], inp[1], inp[2], inp[3] );
	checkResult( result, tc, 1e-14 );
});

test( 'dlanv2: tiny_bc (near-zero B,C)', function t() {
	var result;
	var inp;
	var tc;

	inp = inputs[ 'tiny_bc' ];
	tc = tiny_bc;
	result = dlanv2( inp[0], inp[1], inp[2], inp[3] );
	checkResult( result, tc, 1e-14 );
});

test( 'dlanv2: verify Schur factorization property', function t() {
	var names;
	var inp;
	var a11;
	var a12;
	var a21;
	var a22;
	var t11;
	var t12;
	var t21;
	var t22;
	var i;
	var r;

	names = Object.keys( inputs );
	for ( i = 0; i < names.length; i += 1 ) {
		inp = inputs[ names[i] ];
		r = dlanv2( inp[0], inp[1], inp[2], inp[3] );

		// Original = Q * Schur * Q^T where Q = [CS -SN; SN CS]

		// First compute T = Schur * Q^T:
		t11 = ( r.a * r.cs ) - ( r.b * r.sn );
		t12 = ( r.a * r.sn ) + ( r.b * r.cs );
		t21 = ( r.c * r.cs ) - ( r.d * r.sn );
		t22 = ( r.c * r.sn ) + ( r.d * r.cs );

		// Then original = Q * T:
		a11 = ( r.cs * t11 ) - ( r.sn * t21 );
		a12 = ( r.cs * t12 ) - ( r.sn * t22 );
		a21 = ( r.sn * t11 ) + ( r.cs * t21 );
		a22 = ( r.sn * t12 ) + ( r.cs * t22 );

		assertClose( a11, inp[0], 1e-12, names[i] + ' reconstruct a' );
		assertClose( a12, inp[1], 1e-12, names[i] + ' reconstruct b' );
		assertClose( a21, inp[2], 1e-12, names[i] + ' reconstruct c' );
		assertClose( a22, inp[3], 1e-12, names[i] + ' reconstruct d' );
	}
});

test( 'dlanv2: rotation matrix is orthogonal', function t() {
	var names;
	var det;
	var inp;
	var i;
	var r;

	names = Object.keys( inputs );
	for ( i = 0; i < names.length; i += 1 ) {
		inp = inputs[ names[i] ];
		r = dlanv2( inp[0], inp[1], inp[2], inp[3] );

		// cs^2 + sn^2 should equal 1:
		assertClose( ( r.cs * r.cs ) + ( r.sn * r.sn ), 1.0, 1e-14, names[i] + ' unit norm' ); // eslint-disable-line max-len

		// det(Q) = cs^2 + sn^2 = 1:
		det = ( r.cs * r.cs ) + ( r.sn * r.sn );
		assertClose( det, 1.0, 1e-14, names[i] + ' det=1' );
	}
});
