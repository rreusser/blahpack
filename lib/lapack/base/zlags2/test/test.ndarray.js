/* eslint-disable no-restricted-syntax, stdlib/first-unit-test, max-lines-per-function */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Complex128 from '@stdlib/complex/float64/ctor/lib/index.js';
import zlags2 from './../lib/ndarray.js';


// FIXTURES //

import upperBasic from './fixtures/upper_basic.json' with { type: 'json' };
import lowerBasic from './fixtures/lower_basic.json' with { type: 'json' };
import upperDiagonalB from './fixtures/upper_diagonal_b.json' with { type: 'json' };
import lowerDiagonalB from './fixtures/lower_diagonal_b.json' with { type: 'json' };
import upperImagOffdiag from './fixtures/upper_imag_offdiag.json' with { type: 'json' };
import lowerNegative from './fixtures/lower_negative.json' with { type: 'json' };
import upperIdentity from './fixtures/upper_identity.json' with { type: 'json' };
import lowerLarge from './fixtures/lower_large.json' with { type: 'json' };
import upperElseBranch from './fixtures/upper_else_branch.json' with { type: 'json' };
import lowerElseBranch from './fixtures/lower_else_branch.json' with { type: 'json' };
import upperZeroA from './fixtures/upper_zero_a.json' with { type: 'json' };
import lowerZeroA from './fixtures/lower_zero_a.json' with { type: 'json' };
import upperZeroB from './fixtures/upper_zero_b.json' with { type: 'json' };
import lowerZeroB from './fixtures/lower_zero_b.json' with { type: 'json' };
import upperElseVbDriven from './fixtures/upper_else_vb_driven.json' with { type: 'json' };
import lowerElseVbDriven from './fixtures/lower_else_vb_driven.json' with { type: 'json' };

var fixtures = {
	'upper_basic': upperBasic,
	'lower_basic': lowerBasic,
	'upper_diagonal_b': upperDiagonalB,
	'lower_diagonal_b': lowerDiagonalB,
	'upper_imag_offdiag': upperImagOffdiag,
	'lower_negative': lowerNegative,
	'upper_identity': upperIdentity,
	'lower_large': lowerLarge,
	'upper_else_branch': upperElseBranch,
	'lower_else_branch': lowerElseBranch,
	'upper_zero_a': upperZeroA,
	'lower_zero_a': lowerZeroA,
	'upper_zero_b': upperZeroB,
	'lower_zero_b': lowerZeroB,
	'upper_else_vb_driven': upperElseVbDriven,
	'lower_else_vb_driven': lowerElseVbDriven
};


// FUNCTIONS //

/**
* Asserts that two numbers are close within a relative tolerance.
*
* @private
* @param {number} actual - actual value
* @param {number} expected - expected value
* @param {number} tol - tolerance
* @param {string} msg - error message
*/
function assertClose( actual, expected, tol, msg ) {
	var relErr = Math.abs( actual - expected ) / Math.max( Math.abs( expected ), 1.0 ); // eslint-disable-line max-len
	assert.ok( relErr <= tol, msg + ': expected ' + expected + ', got ' + actual );
}

/**
* Runs a zlags2 test case against fixtures.
*
* @private
* @param {string} name - test case name
* @param {boolean} upper - upper flag
* @param {number} a1 - A(1,1) real
* @param {number} a2r - A2 real part
* @param {number} a2i - A2 imaginary part
* @param {number} a3 - A(2,2) real
* @param {number} b1 - B(1,1) real
* @param {number} b2r - B2 real part
* @param {number} b2i - B2 imaginary part
* @param {number} b3 - B(2,2) real
*/
function runCase( name, upper, a1, a2r, a2i, a3, b1, b2r, b2i, b3 ) { // eslint-disable-line max-params
	var out;
	var tc;

	tc = fixtures[ name ];
	out = zlags2( upper, a1, new Complex128( a2r, a2i ), a3, b1, new Complex128( b2r, b2i ), b3 ); // eslint-disable-line max-len
	assertClose( out.csu, tc.csu, 1e-14, name + ' csu' );
	assertClose( out.snuR, tc.snu[ 0 ], 1e-14, name + ' snuR' );
	assertClose( out.snuI, tc.snu[ 1 ], 1e-14, name + ' snuI' );
	assertClose( out.csv, tc.csv, 1e-14, name + ' csv' );
	assertClose( out.snvR, tc.snv[ 0 ], 1e-14, name + ' snvR' );
	assertClose( out.snvI, tc.snv[ 1 ], 1e-14, name + ' snvI' );
	assertClose( out.csq, tc.csq, 1e-14, name + ' csq' );
	assertClose( out.snqR, tc.snq[ 0 ], 1e-14, name + ' snqR' );
	assertClose( out.snqI, tc.snq[ 1 ], 1e-14, name + ' snqI' );
}

/**
* Computes the product `z = a * b` where a and b are complex.
*
* @private
* @param {number} ar - real part of a
* @param {number} ai - imaginary part of a
* @param {number} br - real part of b
* @param {number} bi - imaginary part of b
* @returns {Array} [real, imag] of a*b
*/
function cmul( ar, ai, br, bi ) {
	return [
		(ar * br) - (ai * bi),
		(ar * bi) + (ai * br)
	];
}

/**
* Verify the mathematical property of zlags2: that the appropriate element of.
* `U**H * A * Q` and `V**H * B * Q` is zero (upper: (0,1); lower: (1,0)).
*
* @private
* @param {boolean} upper - upper flag
* @param {number} a1 - A(1,1) real
* @param {number} a2r - A2 real part
* @param {number} a2i - A2 imaginary part
* @param {number} a3 - A(2,2) real
* @param {number} b1 - B(1,1) real
* @param {number} b2r - B2 real part
* @param {number} b2i - B2 imaginary part
* @param {number} b3 - B(2,2) real
* @param {number} tol - tolerance
* @param {string} msg - message prefix
*/
function verifyZlags2( upper, a1, a2r, a2i, a3, b1, b2r, b2i, b3, tol, msg ) { // eslint-disable-line max-params, max-statements
	var checkA;
	var checkB;
	var maxA;
	var maxB;
	var out;
	var a00;
	var a01;
	var a10;
	var a11;
	var r00;
	var r01;
	var r10;
	var r11;
	var s00;
	var s01;
	var s10;
	var t1;
	var t2;

	out = zlags2( upper, a1, new Complex128( a2r, a2i ), a3, b1, new Complex128( b2r, b2i ), b3 ); // eslint-disable-line max-len

	// Build A matrix
	if ( upper ) {
		a00 = [ a1, 0.0 ];
		a01 = [ a2r, a2i ];
		a10 = [ 0.0, 0.0 ];
		a11 = [ a3, 0.0 ];
	} else {
		a00 = [ a1, 0.0 ];
		a01 = [ 0.0, 0.0 ];
		a10 = [ a2r, a2i ];
		a11 = [ a3, 0.0 ];
	}

	// U**H = ( csu        -snu      )
	//        ( conj(snu)   csu      )
	// R = U**H * A
	// r00 = csu*a00 + (-snu)*a10
	t1 = cmul( -out.snuR, -out.snuI, a10[0], a10[1] );
	r00 = [ (out.csu * a00[0]) + t1[0], (out.csu * a00[1]) + t1[1] ];

	// r01 = csu*a01 + (-snu)*a11
	t1 = cmul( -out.snuR, -out.snuI, a11[0], a11[1] );
	r01 = [ (out.csu * a01[0]) + t1[0], (out.csu * a01[1]) + t1[1] ];

	// r10 = conj(snu)*a00 + csu*a10
	t1 = cmul( out.snuR, -out.snuI, a00[0], a00[1] );
	r10 = [ t1[0] + (out.csu * a10[0]), t1[1] + (out.csu * a10[1]) ];

	// r11 = conj(snu)*a01 + csu*a11
	t1 = cmul( out.snuR, -out.snuI, a01[0], a01[1] );
	r11 = [ t1[0] + (out.csu * a11[0]), t1[1] + (out.csu * a11[1]) ];

	// S = R * Q

	// Q = ( csq       snq      )

	//     (-conj(snq) csq      )

	// s[i,0] = r[i,0]*csq + r[i,1]*(-conj(snq))

	// s[i,1] = r[i,0]*snq + r[i,1]*csq

	// s01 = r00*snq + r01*csq
	t1 = cmul( r00[0], r00[1], out.snqR, out.snqI );
	s01 = [ t1[0] + (r01[0] * out.csq), t1[1] + (r01[1] * out.csq) ];

	// s10 = r10*csq + r11*(-conj(snq))
	t2 = cmul( r11[0], r11[1], -out.snqR, out.snqI );
	s10 = [ (r10[0] * out.csq) + t2[0], (r10[1] * out.csq) + t2[1] ];

	// s00 = r00*csq + r01*(-conj(snq)) (for norm)
	t1 = cmul( r01[0], r01[1], -out.snqR, out.snqI );
	s00 = [ (r00[0] * out.csq) + t1[0], (r00[1] * out.csq) + t1[1] ];

	maxA = Math.max( Math.sqrt( (s00[0] * s00[0]) + (s00[1] * s00[1]) ), Math.sqrt( (s01[0] * s01[0]) + (s01[1] * s01[1]) ), Math.sqrt( (s10[0] * s10[0]) + (s10[1] * s10[1]) ), 1e-300 ); // eslint-disable-line max-len

	if ( upper ) {
		checkA = Math.sqrt( (s01[0] * s01[0]) + (s01[1] * s01[1]) ) / maxA;
		assert.ok( checkA < tol, msg + ': U**H*A*Q (0,1) rel=' + checkA );
	} else {
		checkA = Math.sqrt( (s10[0] * s10[0]) + (s10[1] * s10[1]) ) / maxA;
		assert.ok( checkA < tol, msg + ': U**H*A*Q (1,0) rel=' + checkA );
	}

	// Now do V**H * B * Q
	if ( upper ) {
		a00 = [ b1, 0.0 ];
		a01 = [ b2r, b2i ];
		a10 = [ 0.0, 0.0 ];
		a11 = [ b3, 0.0 ];
	} else {
		a00 = [ b1, 0.0 ];
		a01 = [ 0.0, 0.0 ];
		a10 = [ b2r, b2i ];
		a11 = [ b3, 0.0 ];
	}

	t1 = cmul( -out.snvR, -out.snvI, a10[0], a10[1] );
	r00 = [ (out.csv * a00[0]) + t1[0], (out.csv * a00[1]) + t1[1] ];

	t1 = cmul( -out.snvR, -out.snvI, a11[0], a11[1] );
	r01 = [ (out.csv * a01[0]) + t1[0], (out.csv * a01[1]) + t1[1] ];

	t1 = cmul( out.snvR, -out.snvI, a00[0], a00[1] );
	r10 = [ t1[0] + (out.csv * a10[0]), t1[1] + (out.csv * a10[1]) ];

	t1 = cmul( out.snvR, -out.snvI, a01[0], a01[1] );
	r11 = [ t1[0] + (out.csv * a11[0]), t1[1] + (out.csv * a11[1]) ];

	t1 = cmul( r00[0], r00[1], out.snqR, out.snqI );
	s01 = [ t1[0] + (r01[0] * out.csq), t1[1] + (r01[1] * out.csq) ];

	t2 = cmul( r11[0], r11[1], -out.snqR, out.snqI );
	s10 = [ (r10[0] * out.csq) + t2[0], (r10[1] * out.csq) + t2[1] ];

	t1 = cmul( r01[0], r01[1], -out.snqR, out.snqI );
	s00 = [ (r00[0] * out.csq) + t1[0], (r00[1] * out.csq) + t1[1] ];

	maxB = Math.max( Math.sqrt( (s00[0] * s00[0]) + (s00[1] * s00[1]) ), Math.sqrt( (s01[0] * s01[0]) + (s01[1] * s01[1]) ), Math.sqrt( (s10[0] * s10[0]) + (s10[1] * s10[1]) ), 1e-300 ); // eslint-disable-line max-len

	if ( upper ) {
		checkB = Math.sqrt( (s01[0] * s01[0]) + (s01[1] * s01[1]) ) / maxB;
		assert.ok( checkB < tol, msg + ': V**H*B*Q (0,1) rel=' + checkB );
	} else {
		checkB = Math.sqrt( (s10[0] * s10[0]) + (s10[1] * s10[1]) ) / maxB;
		assert.ok( checkB < tol, msg + ': V**H*B*Q (1,0) rel=' + checkB );
	}
}


// TESTS //

test( 'zlags2 is a function', function t() {
	assert.equal( typeof zlags2, 'function' );
});

test( 'zlags2: upper_basic', function t() {
	runCase( 'upper_basic', true, 4.0, 2.0, 1.0, 3.0, 1.0, 0.5, 0.25, 2.0 );
});

test( 'zlags2: lower_basic', function t() {
	runCase( 'lower_basic', false, 4.0, 2.0, 1.0, 3.0, 1.0, 0.5, 0.25, 2.0 );
});

test( 'zlags2: upper_diagonal_b', function t() {
	runCase( 'upper_diagonal_b', true, 5.0, 3.0, 2.0, 2.0, 1.0, 0.0, 0.0, 1.0 );
});

test( 'zlags2: lower_diagonal_b', function t() {
	runCase( 'lower_diagonal_b', false, 5.0, 3.0, 2.0, 2.0, 1.0, 0.0, 0.0, 1.0 );
});

test( 'zlags2: upper_imag_offdiag', function t() {
	runCase( 'upper_imag_offdiag', true, 10.0, 0.0, 5.0, 5.0, 3.0, 0.0, 1.5, 2.0 );
});

test( 'zlags2: lower_negative', function t() {
	runCase( 'lower_negative', false, -3.0, 4.0, -1.0, -2.0, 1.0, -0.5, 0.3, 3.0 );
});

test( 'zlags2: upper_identity', function t() {
	runCase( 'upper_identity', true, 1.0, 0.0, 0.0, 1.0, 1.0, 0.0, 0.0, 1.0 );
});

test( 'zlags2: lower_large', function t() {
	runCase( 'lower_large', false, 1e10, 5e9, 3e9, 2e10, 3e10, 1e10, 5e9, 4e10 );
});

test( 'zlags2: upper_else_branch', function t() {
	runCase( 'upper_else_branch', true, 73.99, 90.035, 45.0, 99.59, 1.0, 0.5, 0.25, 1.0 ); // eslint-disable-line max-len
});

test( 'zlags2: lower_else_branch', function t() {
	runCase( 'lower_else_branch', false, 73.99, 102.835, 51.0, 99.59, 1.0, 0.5, 0.25, 1.0 ); // eslint-disable-line max-len
});

test( 'zlags2: upper_zero_a', function t() {
	runCase( 'upper_zero_a', true, 0.0, 0.0, 0.0, 0.0, 1.0, 0.5, 0.3, 2.0 );
});

test( 'zlags2: lower_zero_a', function t() {
	runCase( 'lower_zero_a', false, 0.0, 0.0, 0.0, 0.0, 1.0, 0.5, 0.3, 2.0 );
});

test( 'zlags2: upper_zero_b', function t() {
	runCase( 'upper_zero_b', true, 4.0, 2.0, 1.0, 3.0, 0.0, 0.0, 0.0, 0.0 );
});

test( 'zlags2: lower_zero_b', function t() {
	runCase( 'lower_zero_b', false, 4.0, 2.0, 1.0, 3.0, 0.0, 0.0, 0.0, 0.0 );
});

test( 'zlags2: upper_else_vb_driven', function t() {
	runCase( 'upper_else_vb_driven', true, -54.5637, -12.628, 8.0, 111.0266, 90.743, 83.6416, 40.0, 48.053 ); // eslint-disable-line max-len
});

test( 'zlags2: lower_else_vb_driven', function t() {
	runCase( 'lower_else_vb_driven', false, -19.992, -17.6713, 9.0, -59.3108, 96.5235, -54.6987, 30.0, 74.2924 ); // eslint-disable-line max-len
});

test( 'zlags2: mathematical property - upper basic', function t() {
	verifyZlags2( true, 4.0, 2.0, 1.0, 3.0, 1.0, 0.5, 0.25, 2.0, 1e-12, 'upper_basic' ); // eslint-disable-line max-len
});

test( 'zlags2: mathematical property - lower basic', function t() {
	verifyZlags2( false, 4.0, 2.0, 1.0, 3.0, 1.0, 0.5, 0.25, 2.0, 1e-12, 'lower_basic' ); // eslint-disable-line max-len
});

test( 'zlags2: mathematical property - upper else branch', function t() {
	verifyZlags2( true, 73.99, 90.035, 45.0, 99.59, 1.0, 0.5, 0.25, 1.0, 1e-12, 'upper_else' ); // eslint-disable-line max-len
});

test( 'zlags2: mathematical property - lower else branch', function t() {
	verifyZlags2( false, 73.99, 102.835, 51.0, 99.59, 1.0, 0.5, 0.25, 1.0, 1e-12, 'lower_else' ); // eslint-disable-line max-len
});

test( 'zlags2: mathematical property - upper large', function t() {
	verifyZlags2( true, 1e10, 5e9, 3e9, 2e10, 3e10, 1e10, 5e9, 4e10, 1e-12, 'upper_large' ); // eslint-disable-line max-len
});

test( 'zlags2: mathematical property - lower negative', function t() {
	verifyZlags2( false, -3.0, 4.0, -1.0, -2.0, 1.0, -0.5, 0.3, 3.0, 1e-12, 'lower_neg' ); // eslint-disable-line max-len
});

test( 'zlags2: unitary rotation norms - upper', function t() {
	var out = zlags2( true, 4.0, new Complex128( 2.0, 1.0 ), 3.0, 1.0, new Complex128( 0.5, 0.25 ), 2.0 ); // eslint-disable-line max-len

	// |U|^2 = csu^2 + |snu|^2 = 1
	assertClose( (out.csu * out.csu) + (out.snuR * out.snuR) + (out.snuI * out.snuI), 1.0, 1e-14, 'U norm' ); // eslint-disable-line max-len

	// |V|^2 = csv^2 + |snv|^2 = 1
	assertClose( (out.csv * out.csv) + (out.snvR * out.snvR) + (out.snvI * out.snvI), 1.0, 1e-14, 'V norm' ); // eslint-disable-line max-len

	// |Q|^2 = csq^2 + |snq|^2 = 1
	assertClose( (out.csq * out.csq) + (out.snqR * out.snqR) + (out.snqI * out.snqI), 1.0, 1e-14, 'Q norm' ); // eslint-disable-line max-len
});

test( 'zlags2: unitary rotation norms - lower', function t() {
	var out = zlags2( false, -3.0, new Complex128( 4.0, -1.0 ), -2.0, 1.0, new Complex128( -0.5, 0.3 ), 3.0 ); // eslint-disable-line max-len

	assertClose( (out.csu * out.csu) + (out.snuR * out.snuR) + (out.snuI * out.snuI), 1.0, 1e-14, 'U norm' ); // eslint-disable-line max-len
	assertClose( (out.csv * out.csv) + (out.snvR * out.snvR) + (out.snvI * out.snvI), 1.0, 1e-14, 'V norm' ); // eslint-disable-line max-len
	assertClose( (out.csq * out.csq) + (out.snqR * out.snqR) + (out.snqI * out.snqI), 1.0, 1e-14, 'Q norm' ); // eslint-disable-line max-len
});
