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
const inputs = {
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
	const relErr = Math.abs( actual - expected ) / Math.max( Math.abs( expected ), 1.0 ); // eslint-disable-line max-len
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
	const a = new Float64Array( 1 );
	const b = new Float64Array( 1 );
	const c = new Float64Array( 1 );
	const d = new Float64Array( 1 );
	const rt1r = new Float64Array( 1 );
	const rt1i = new Float64Array( 1 );
	const rt2r = new Float64Array( 1 );
	const rt2i = new Float64Array( 1 );
	const cs = new Float64Array( 1 );
	const sn = new Float64Array( 1 );

	const inp = inputs[ 'c_zero' ];
	const tc = c_zero;
	a[ 0 ] = inp[0];
	b[ 0 ] = inp[1];
	c[ 0 ] = inp[2];
	d[ 0 ] = inp[3];
	dlanv2( a, b, c, d, rt1r, rt1i, rt2r, rt2i, cs, sn );
	const result = {
		'a': a[ 0 ],
		'b': b[ 0 ],
		'c': c[ 0 ],
		'd': d[ 0 ],
		'rt1r': rt1r[ 0 ],
		'rt1i': rt1i[ 0 ],
		'rt2r': rt2r[ 0 ],
		'rt2i': rt2i[ 0 ],
		'cs': cs[ 0 ],
		'sn': sn[ 0 ]
	};
	checkResult( result, tc, 1e-14 );
});

test( 'dlanv2: b_zero (B=0, swap rows and columns)', function t() {
	const a = new Float64Array( 1 );
	const b = new Float64Array( 1 );
	const c = new Float64Array( 1 );
	const d = new Float64Array( 1 );
	const rt1r = new Float64Array( 1 );
	const rt1i = new Float64Array( 1 );
	const rt2r = new Float64Array( 1 );
	const rt2i = new Float64Array( 1 );
	const cs = new Float64Array( 1 );
	const sn = new Float64Array( 1 );

	const inp = inputs[ 'b_zero' ];
	const tc = b_zero;
	a[ 0 ] = inp[0];
	b[ 0 ] = inp[1];
	c[ 0 ] = inp[2];
	d[ 0 ] = inp[3];
	dlanv2( a, b, c, d, rt1r, rt1i, rt2r, rt2i, cs, sn );
	const result = {
		'a': a[ 0 ],
		'b': b[ 0 ],
		'c': c[ 0 ],
		'd': d[ 0 ],
		'rt1r': rt1r[ 0 ],
		'rt1i': rt1i[ 0 ],
		'rt2r': rt2r[ 0 ],
		'rt2i': rt2i[ 0 ],
		'cs': cs[ 0 ],
		'sn': sn[ 0 ]
	};
	checkResult( result, tc, 1e-14 );

	// Verify C is zeroed and rotation swaps:
	assert.strictEqual( result.c, 0.0 );
	assert.strictEqual( result.cs, 0.0 );
	assert.strictEqual( result.sn, 1.0 );
});

test( 'dlanv2: a_eq_d_diff_sign (A=D, sign(B)!=sign(C))', function t() {
	const a = new Float64Array( 1 );
	const b = new Float64Array( 1 );
	const c = new Float64Array( 1 );
	const d = new Float64Array( 1 );
	const rt1r = new Float64Array( 1 );
	const rt1i = new Float64Array( 1 );
	const rt2r = new Float64Array( 1 );
	const rt2i = new Float64Array( 1 );
	const cs = new Float64Array( 1 );
	const sn = new Float64Array( 1 );

	const inp = inputs[ 'a_eq_d_diff_sign' ];
	const tc = a_eq_d_diff_sign;
	a[ 0 ] = inp[0];
	b[ 0 ] = inp[1];
	c[ 0 ] = inp[2];
	d[ 0 ] = inp[3];
	dlanv2( a, b, c, d, rt1r, rt1i, rt2r, rt2i, cs, sn );
	const result = {
		'a': a[ 0 ],
		'b': b[ 0 ],
		'c': c[ 0 ],
		'd': d[ 0 ],
		'rt1r': rt1r[ 0 ],
		'rt1i': rt1i[ 0 ],
		'rt2r': rt2r[ 0 ],
		'rt2i': rt2i[ 0 ],
		'cs': cs[ 0 ],
		'sn': sn[ 0 ]
	};
	checkResult( result, tc, 1e-14 );
});

test( 'dlanv2: real_eigenvalues (Z >= MULTPL*EPS)', function t() {
	const a = new Float64Array( 1 );
	const b = new Float64Array( 1 );
	const c = new Float64Array( 1 );
	const d = new Float64Array( 1 );
	const rt1r = new Float64Array( 1 );
	const rt1i = new Float64Array( 1 );
	const rt2r = new Float64Array( 1 );
	const rt2i = new Float64Array( 1 );
	const cs = new Float64Array( 1 );
	const sn = new Float64Array( 1 );

	const inp = inputs[ 'real_eigenvalues' ];
	const tc = real_eigenvalues;
	a[ 0 ] = inp[0];
	b[ 0 ] = inp[1];
	c[ 0 ] = inp[2];
	d[ 0 ] = inp[3];
	dlanv2( a, b, c, d, rt1r, rt1i, rt2r, rt2i, cs, sn );
	const result = {
		'a': a[ 0 ],
		'b': b[ 0 ],
		'c': c[ 0 ],
		'd': d[ 0 ],
		'rt1r': rt1r[ 0 ],
		'rt1i': rt1i[ 0 ],
		'rt2r': rt2r[ 0 ],
		'rt2i': rt2i[ 0 ],
		'cs': cs[ 0 ],
		'sn': sn[ 0 ]
	};
	checkResult( result, tc, 1e-14 );

	// Real eigenvalues must have zero imaginary parts:
	assert.strictEqual( result.rt1i, 0.0 );
	assert.strictEqual( result.rt2i, 0.0 );
	assert.strictEqual( result.c, 0.0 );
});

test( 'dlanv2: complex_eigenvalues', function t() {
	const a = new Float64Array( 1 );
	const b = new Float64Array( 1 );
	const c = new Float64Array( 1 );
	const d = new Float64Array( 1 );
	const rt1r = new Float64Array( 1 );
	const rt1i = new Float64Array( 1 );
	const rt2r = new Float64Array( 1 );
	const rt2i = new Float64Array( 1 );
	const cs = new Float64Array( 1 );
	const sn = new Float64Array( 1 );

	const inp = inputs[ 'complex_eigenvalues' ];
	const tc = complex_eigenvalues;
	a[ 0 ] = inp[0];
	b[ 0 ] = inp[1];
	c[ 0 ] = inp[2];
	d[ 0 ] = inp[3];
	dlanv2( a, b, c, d, rt1r, rt1i, rt2r, rt2i, cs, sn );
	const result = {
		'a': a[ 0 ],
		'b': b[ 0 ],
		'c': c[ 0 ],
		'd': d[ 0 ],
		'rt1r': rt1r[ 0 ],
		'rt1i': rt1i[ 0 ],
		'rt2r': rt2r[ 0 ],
		'rt2i': rt2i[ 0 ],
		'cs': cs[ 0 ],
		'sn': sn[ 0 ]
	};
	checkResult( result, tc, 1e-14 );

	// Complex eigenvalues: rt1i > 0, rt2i < 0:
	assert.ok( result.rt1i > 0.0, 'rt1i should be positive for complex conjugate pair' ); // eslint-disable-line max-len
	assert.ok( result.rt2i < 0.0, 'rt2i should be negative for complex conjugate pair' ); // eslint-disable-line max-len
	assert.strictEqual( result.a, result.d );
});

test( 'dlanv2: zero_matrix', function t() {
	const a = new Float64Array( 1 );
	const b = new Float64Array( 1 );
	const c = new Float64Array( 1 );
	const d = new Float64Array( 1 );
	const rt1r = new Float64Array( 1 );
	const rt1i = new Float64Array( 1 );
	const rt2r = new Float64Array( 1 );
	const rt2i = new Float64Array( 1 );
	const cs = new Float64Array( 1 );
	const sn = new Float64Array( 1 );

	const inp = inputs[ 'zero_matrix' ];
	const tc = zero_matrix;
	a[ 0 ] = inp[0];
	b[ 0 ] = inp[1];
	c[ 0 ] = inp[2];
	d[ 0 ] = inp[3];
	dlanv2( a, b, c, d, rt1r, rt1i, rt2r, rt2i, cs, sn );
	const result = {
		'a': a[ 0 ],
		'b': b[ 0 ],
		'c': c[ 0 ],
		'd': d[ 0 ],
		'rt1r': rt1r[ 0 ],
		'rt1i': rt1i[ 0 ],
		'rt2r': rt2r[ 0 ],
		'rt2i': rt2i[ 0 ],
		'cs': cs[ 0 ],
		'sn': sn[ 0 ]
	};
	checkResult( result, tc, 1e-14 );

	// All outputs should be zero except cs=1:
	assert.strictEqual( result.a, 0.0 );
	assert.strictEqual( result.cs, 1.0 );
	assert.strictEqual( result.sn, 0.0 );
});

test( 'dlanv2: identity', function t() {
	const a = new Float64Array( 1 );
	const b = new Float64Array( 1 );
	const c = new Float64Array( 1 );
	const d = new Float64Array( 1 );
	const rt1r = new Float64Array( 1 );
	const rt1i = new Float64Array( 1 );
	const rt2r = new Float64Array( 1 );
	const rt2i = new Float64Array( 1 );
	const cs = new Float64Array( 1 );
	const sn = new Float64Array( 1 );

	const inp = inputs[ 'identity' ];
	const tc = identity;
	a[ 0 ] = inp[0];
	b[ 0 ] = inp[1];
	c[ 0 ] = inp[2];
	d[ 0 ] = inp[3];
	dlanv2( a, b, c, d, rt1r, rt1i, rt2r, rt2i, cs, sn );
	const result = {
		'a': a[ 0 ],
		'b': b[ 0 ],
		'c': c[ 0 ],
		'd': d[ 0 ],
		'rt1r': rt1r[ 0 ],
		'rt1i': rt1i[ 0 ],
		'rt2r': rt2r[ 0 ],
		'rt2i': rt2i[ 0 ],
		'cs': cs[ 0 ],
		'sn': sn[ 0 ]
	};
	checkResult( result, tc, 1e-14 );
});

test( 'dlanv2: diagonal', function t() {
	const a = new Float64Array( 1 );
	const b = new Float64Array( 1 );
	const c = new Float64Array( 1 );
	const d = new Float64Array( 1 );
	const rt1r = new Float64Array( 1 );
	const rt1i = new Float64Array( 1 );
	const rt2r = new Float64Array( 1 );
	const rt2i = new Float64Array( 1 );
	const cs = new Float64Array( 1 );
	const sn = new Float64Array( 1 );

	const inp = inputs[ 'diagonal' ];
	const tc = diagonal;
	a[ 0 ] = inp[0];
	b[ 0 ] = inp[1];
	c[ 0 ] = inp[2];
	d[ 0 ] = inp[3];
	dlanv2( a, b, c, d, rt1r, rt1i, rt2r, rt2i, cs, sn );
	const result = {
		'a': a[ 0 ],
		'b': b[ 0 ],
		'c': c[ 0 ],
		'd': d[ 0 ],
		'rt1r': rt1r[ 0 ],
		'rt1i': rt1i[ 0 ],
		'rt2r': rt2r[ 0 ],
		'rt2i': rt2i[ 0 ],
		'cs': cs[ 0 ],
		'sn': sn[ 0 ]
	};
	checkResult( result, tc, 1e-14 );
});

test( 'dlanv2: real_negative', function t() {
	const a = new Float64Array( 1 );
	const b = new Float64Array( 1 );
	const c = new Float64Array( 1 );
	const d = new Float64Array( 1 );
	const rt1r = new Float64Array( 1 );
	const rt1i = new Float64Array( 1 );
	const rt2r = new Float64Array( 1 );
	const rt2i = new Float64Array( 1 );
	const cs = new Float64Array( 1 );
	const sn = new Float64Array( 1 );

	const inp = inputs[ 'real_negative' ];
	const tc = real_negative;
	a[ 0 ] = inp[0];
	b[ 0 ] = inp[1];
	c[ 0 ] = inp[2];
	d[ 0 ] = inp[3];
	dlanv2( a, b, c, d, rt1r, rt1i, rt2r, rt2i, cs, sn );
	const result = {
		'a': a[ 0 ],
		'b': b[ 0 ],
		'c': c[ 0 ],
		'd': d[ 0 ],
		'rt1r': rt1r[ 0 ],
		'rt1i': rt1i[ 0 ],
		'rt2r': rt2r[ 0 ],
		'rt2i': rt2i[ 0 ],
		'cs': cs[ 0 ],
		'sn': sn[ 0 ]
	};
	checkResult( result, tc, 1e-14 );
});

test( 'dlanv2: complex_equal_diag', function t() {
	const a = new Float64Array( 1 );
	const b = new Float64Array( 1 );
	const c = new Float64Array( 1 );
	const d = new Float64Array( 1 );
	const rt1r = new Float64Array( 1 );
	const rt1i = new Float64Array( 1 );
	const rt2r = new Float64Array( 1 );
	const rt2i = new Float64Array( 1 );
	const cs = new Float64Array( 1 );
	const sn = new Float64Array( 1 );

	const inp = inputs[ 'complex_equal_diag' ];
	const tc = complex_equal_diag;
	a[ 0 ] = inp[0];
	b[ 0 ] = inp[1];
	c[ 0 ] = inp[2];
	d[ 0 ] = inp[3];
	dlanv2( a, b, c, d, rt1r, rt1i, rt2r, rt2i, cs, sn );
	const result = {
		'a': a[ 0 ],
		'b': b[ 0 ],
		'c': c[ 0 ],
		'd': d[ 0 ],
		'rt1r': rt1r[ 0 ],
		'rt1i': rt1i[ 0 ],
		'rt2r': rt2r[ 0 ],
		'rt2i': rt2i[ 0 ],
		'cs': cs[ 0 ],
		'sn': sn[ 0 ]
	};
	checkResult( result, tc, 1e-14 );
});

test( 'dlanv2: near_equal (small Z, complex path)', function t() {
	const a = new Float64Array( 1 );
	const b = new Float64Array( 1 );
	const c = new Float64Array( 1 );
	const d = new Float64Array( 1 );
	const rt1r = new Float64Array( 1 );
	const rt1i = new Float64Array( 1 );
	const rt2r = new Float64Array( 1 );
	const rt2i = new Float64Array( 1 );
	const cs = new Float64Array( 1 );
	const sn = new Float64Array( 1 );

	const inp = inputs[ 'near_equal' ];
	const tc = near_equal;
	a[ 0 ] = inp[0];
	b[ 0 ] = inp[1];
	c[ 0 ] = inp[2];
	d[ 0 ] = inp[3];
	dlanv2( a, b, c, d, rt1r, rt1i, rt2r, rt2i, cs, sn );
	const result = {
		'a': a[ 0 ],
		'b': b[ 0 ],
		'c': c[ 0 ],
		'd': d[ 0 ],
		'rt1r': rt1r[ 0 ],
		'rt1i': rt1i[ 0 ],
		'rt2r': rt2r[ 0 ],
		'rt2i': rt2i[ 0 ],
		'cs': cs[ 0 ],
		'sn': sn[ 0 ]
	};
	checkResult( result, tc, 1e-14 );
});

test( 'dlanv2: large_values', function t() {
	const a = new Float64Array( 1 );
	const b = new Float64Array( 1 );
	const c = new Float64Array( 1 );
	const d = new Float64Array( 1 );
	const rt1r = new Float64Array( 1 );
	const rt1i = new Float64Array( 1 );
	const rt2r = new Float64Array( 1 );
	const rt2i = new Float64Array( 1 );
	const cs = new Float64Array( 1 );
	const sn = new Float64Array( 1 );

	const inp = inputs[ 'large_values' ];
	const tc = large_values;
	a[ 0 ] = inp[0];
	b[ 0 ] = inp[1];
	c[ 0 ] = inp[2];
	d[ 0 ] = inp[3];
	dlanv2( a, b, c, d, rt1r, rt1i, rt2r, rt2i, cs, sn );
	const result = {
		'a': a[ 0 ],
		'b': b[ 0 ],
		'c': c[ 0 ],
		'd': d[ 0 ],
		'rt1r': rt1r[ 0 ],
		'rt1i': rt1i[ 0 ],
		'rt2r': rt2r[ 0 ],
		'rt2i': rt2i[ 0 ],
		'cs': cs[ 0 ],
		'sn': sn[ 0 ]
	};
	checkResult( result, tc, 1e-14 );
});

test( 'dlanv2: same_sign_bc (sign(B)==sign(C), real reduction)', function t() {
	const a = new Float64Array( 1 );
	const b = new Float64Array( 1 );
	const c = new Float64Array( 1 );
	const d = new Float64Array( 1 );
	const rt1r = new Float64Array( 1 );
	const rt1i = new Float64Array( 1 );
	const rt2r = new Float64Array( 1 );
	const rt2i = new Float64Array( 1 );
	const cs = new Float64Array( 1 );
	const sn = new Float64Array( 1 );

	const inp = inputs[ 'same_sign_bc' ];
	const tc = same_sign_bc;
	a[ 0 ] = inp[0];
	b[ 0 ] = inp[1];
	c[ 0 ] = inp[2];
	d[ 0 ] = inp[3];
	dlanv2( a, b, c, d, rt1r, rt1i, rt2r, rt2i, cs, sn );
	const result = {
		'a': a[ 0 ],
		'b': b[ 0 ],
		'c': c[ 0 ],
		'd': d[ 0 ],
		'rt1r': rt1r[ 0 ],
		'rt1i': rt1i[ 0 ],
		'rt2r': rt2r[ 0 ],
		'rt2i': rt2i[ 0 ],
		'cs': cs[ 0 ],
		'sn': sn[ 0 ]
	};
	checkResult( result, tc, 1e-14 );
});

test( 'dlanv2: tiny_bc (near-zero B,C)', function t() {
	const a = new Float64Array( 1 );
	const b = new Float64Array( 1 );
	const c = new Float64Array( 1 );
	const d = new Float64Array( 1 );
	const rt1r = new Float64Array( 1 );
	const rt1i = new Float64Array( 1 );
	const rt2r = new Float64Array( 1 );
	const rt2i = new Float64Array( 1 );
	const cs = new Float64Array( 1 );
	const sn = new Float64Array( 1 );

	const inp = inputs[ 'tiny_bc' ];
	const tc = tiny_bc;
	a[ 0 ] = inp[0];
	b[ 0 ] = inp[1];
	c[ 0 ] = inp[2];
	d[ 0 ] = inp[3];
	dlanv2( a, b, c, d, rt1r, rt1i, rt2r, rt2i, cs, sn );
	const result = {
		'a': a[ 0 ],
		'b': b[ 0 ],
		'c': c[ 0 ],
		'd': d[ 0 ],
		'rt1r': rt1r[ 0 ],
		'rt1i': rt1i[ 0 ],
		'rt2r': rt2r[ 0 ],
		'rt2i': rt2i[ 0 ],
		'cs': cs[ 0 ],
		'sn': sn[ 0 ]
	};
	checkResult( result, tc, 1e-14 );
});

test( 'dlanv2: verify Schur factorization property', function t() {
	const a = new Float64Array( 1 );
	const b = new Float64Array( 1 );
	const c = new Float64Array( 1 );
	const d = new Float64Array( 1 );
	const rt1r = new Float64Array( 1 );
	const rt1i = new Float64Array( 1 );
	const rt2r = new Float64Array( 1 );
	const rt2i = new Float64Array( 1 );
	const cs = new Float64Array( 1 );
	const sn = new Float64Array( 1 );
	let inp, a11, a12, a21, a22, t11, t12, t21, t22, i;

	const names = Object.keys( inputs );
	for ( i = 0; i < names.length; i += 1 ) {
		inp = inputs[ names[i] ];
		a[ 0 ] = inp[0];
		b[ 0 ] = inp[1];
		c[ 0 ] = inp[2];
		d[ 0 ] = inp[3];
		dlanv2( a, b, c, d, rt1r, rt1i, rt2r, rt2i, cs, sn );

		// Original = Q * Schur * Q^T where Q = [CS -SN; SN CS]

		// First compute T = Schur * Q^T:
		t11 = ( a[ 0 ] * cs[ 0 ] ) - ( b[ 0 ] * sn[ 0 ] );
		t12 = ( a[ 0 ] * sn[ 0 ] ) + ( b[ 0 ] * cs[ 0 ] );
		t21 = ( c[ 0 ] * cs[ 0 ] ) - ( d[ 0 ] * sn[ 0 ] );
		t22 = ( c[ 0 ] * sn[ 0 ] ) + ( d[ 0 ] * cs[ 0 ] );

		// Then original = Q * T:
		a11 = ( cs[ 0 ] * t11 ) - ( sn[ 0 ] * t21 );
		a12 = ( cs[ 0 ] * t12 ) - ( sn[ 0 ] * t22 );
		a21 = ( sn[ 0 ] * t11 ) + ( cs[ 0 ] * t21 );
		a22 = ( sn[ 0 ] * t12 ) + ( cs[ 0 ] * t22 );

		assertClose( a11, inp[0], 1e-12, names[i] + ' reconstruct a' );
		assertClose( a12, inp[1], 1e-12, names[i] + ' reconstruct b' );
		assertClose( a21, inp[2], 1e-12, names[i] + ' reconstruct c' );
		assertClose( a22, inp[3], 1e-12, names[i] + ' reconstruct d' );
	}
});

test( 'dlanv2: rotation matrix is orthogonal', function t() {
	const a = new Float64Array( 1 );
	const b = new Float64Array( 1 );
	const c = new Float64Array( 1 );
	const d = new Float64Array( 1 );
	const rt1r = new Float64Array( 1 );
	const rt1i = new Float64Array( 1 );
	const rt2r = new Float64Array( 1 );
	const rt2i = new Float64Array( 1 );
	const cs = new Float64Array( 1 );
	const sn = new Float64Array( 1 );
	let det, inp, i;

	const names = Object.keys( inputs );
	for ( i = 0; i < names.length; i += 1 ) {
		inp = inputs[ names[i] ];
		a[ 0 ] = inp[0];
		b[ 0 ] = inp[1];
		c[ 0 ] = inp[2];
		d[ 0 ] = inp[3];
		dlanv2( a, b, c, d, rt1r, rt1i, rt2r, rt2i, cs, sn );

		// cs^2 + sn^2 should equal 1:
		assertClose( ( cs[ 0 ] * cs[ 0 ] ) + ( sn[ 0 ] * sn[ 0 ] ), 1.0, 1e-14, names[i] + ' unit norm' ); // eslint-disable-line max-len

		// det(Q) = cs^2 + sn^2 = 1:
		det = ( cs[ 0 ] * cs[ 0 ] ) + ( sn[ 0 ] * sn[ 0 ] );
		assertClose( det, 1.0, 1e-14, names[i] + ' det=1' );
	}
});

test( 'dlanv2: complex path with huge B+C (sigma/temp rescaled by SAFMN2) still gives an orthogonal Schur factorization', function t() {
	const a = new Float64Array( [ 1.0 ] );
	const b = new Float64Array( [ 2.0e300 ] );
	const c = new Float64Array( [ -1.0e300 ] );
	const d = new Float64Array( [ 0.0 ] );
	const rt1r = new Float64Array( 1 );
	const rt1i = new Float64Array( 1 );
	const rt2r = new Float64Array( 1 );
	const rt2i = new Float64Array( 1 );
	const cs = new Float64Array( 1 );
	const sn = new Float64Array( 1 );
	let t11;
	let t12;
	let t21;
	let t22;

	// SIGMA = B + C = 1e300 >= SAFMX2, so the scaling loop rescales SIGMA and TEMP before P = TEMP/2 is formed.
	dlanv2( a, b, c, d, rt1r, rt1i, rt2r, rt2i, cs, sn );
	assertClose( ( cs[ 0 ] * cs[ 0 ] ) + ( sn[ 0 ] * sn[ 0 ] ), 1.0, 1e-14, 'unit norm' );
	assert.equal( a[ 0 ], d[ 0 ], 'equal diagonal' );
	assert.ok( b[ 0 ] * c[ 0 ] < 0.0, 'complex pair' );

	// The rotation angle is (A-D) / (2*(B+C)) = 5e-301 to first order; an unscaled P would give 5e-9.
	assert.ok( Math.abs( ( sn[ 0 ] / -5.0e-301 ) - 1.0 ) < 1e-12, 'sn: got ' + sn[ 0 ] );

	// Reconstruct the original matrix: Q * Schur * Q^T.
	t11 = ( a[ 0 ] * cs[ 0 ] ) - ( b[ 0 ] * sn[ 0 ] );
	t12 = ( a[ 0 ] * sn[ 0 ] ) + ( b[ 0 ] * cs[ 0 ] );
	t21 = ( c[ 0 ] * cs[ 0 ] ) - ( d[ 0 ] * sn[ 0 ] );
	t22 = ( c[ 0 ] * sn[ 0 ] ) + ( d[ 0 ] * cs[ 0 ] );
	assertClose( ( cs[ 0 ] * t12 ) - ( sn[ 0 ] * t22 ), 2.0e300, 1e-12, 'reconstruct b' );
	assertClose( ( sn[ 0 ] * t11 ) + ( cs[ 0 ] * t21 ), -1.0e300, 1e-12, 'reconstruct c' );
});
