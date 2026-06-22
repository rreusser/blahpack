/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import dlaev2 from './../lib/ndarray.js';


// FIXTURES //

import identity from './fixtures/identity.json' with { type: 'json' };
import diagonal from './fixtures/diagonal.json' with { type: 'json' };
import off_diagonal from './fixtures/off_diagonal.json' with { type: 'json' };
import general from './fixtures/general.json' with { type: 'json' };
import negative_diagonal from './fixtures/negative_diagonal.json' with { type: 'json' };
import sm_zero from './fixtures/sm_zero.json' with { type: 'json' };
import equal_diagonal from './fixtures/equal_diagonal.json' with { type: 'json' };
import negative_offdiag from './fixtures/negative_offdiag.json' with { type: 'json' };
import df_negative from './fixtures/df_negative.json' with { type: 'json' };
import b_zero_a_lt_c from './fixtures/b_zero_a_lt_c.json' with { type: 'json' };

var fixtures = {
	'identity': identity,
	'diagonal': diagonal,
	'off_diagonal': off_diagonal,
	'general': general,
	'negative_diagonal': negative_diagonal,
	'sm_zero': sm_zero,
	'equal_diagonal': equal_diagonal,
	'negative_offdiag': negative_offdiag,
	'df_negative': df_negative,
	'b_zero_a_lt_c': b_zero_a_lt_c
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
	assert.ok( relErr <= tol, msg + ': expected ' + expected + ', got ' + actual );
}

/**
* Checks all four outputs of dlaev2 against fixture values.
*
* @private
* @param {Object} out - result from dlaev2
* @param {Object} tc - test case from fixture
* @param {number} tol - tolerance
*/
function checkResult( out, tc, tol ) {
	assertClose( out.rt1, tc.rt1, tol, 'rt1' );
	assertClose( out.rt2, tc.rt2, tol, 'rt2' );
	assertClose( out.cs1, tc.cs1, tol, 'cs1' );
	assertClose( out.sn1, tc.sn1, tol, 'sn1' );
}


// TESTS //

test( 'dlaev2 is a function', function t() {
	assert.strictEqual( typeof dlaev2, 'function' );
} );

test( 'dlaev2: identity matrix', function t() {
	var out;
	var tc;

	tc = identity;
	out = dlaev2( tc.a, tc.b, tc.c );
	checkResult( out, tc, 1e-14 );
} );

test( 'dlaev2: diagonal matrix', function t() {
	var out;
	var tc;

	tc = diagonal;
	out = dlaev2( tc.a, tc.b, tc.c );
	checkResult( out, tc, 1e-14 );
} );

test( 'dlaev2: off-diagonal only', function t() {
	var out;
	var tc;

	tc = off_diagonal;
	out = dlaev2( tc.a, tc.b, tc.c );
	checkResult( out, tc, 1e-14 );
} );

test( 'dlaev2: general case', function t() {
	var out;
	var tc;

	tc = general;
	out = dlaev2( tc.a, tc.b, tc.c );
	checkResult( out, tc, 1e-14 );
} );

test( 'dlaev2: negative diagonal', function t() {
	var out;
	var tc;

	tc = negative_diagonal;
	out = dlaev2( tc.a, tc.b, tc.c );
	checkResult( out, tc, 1e-14 );
} );

test( 'dlaev2: sm = 0', function t() {
	var out;
	var tc;

	tc = sm_zero;
	out = dlaev2( tc.a, tc.b, tc.c );
	checkResult( out, tc, 1e-14 );
} );

test( 'dlaev2: equal diagonal', function t() {
	var out;
	var tc;

	tc = equal_diagonal;
	out = dlaev2( tc.a, tc.b, tc.c );
	checkResult( out, tc, 1e-14 );
} );

test( 'dlaev2: negative off-diagonal', function t() {
	var out;
	var tc;

	tc = negative_offdiag;
	out = dlaev2( tc.a, tc.b, tc.c );
	checkResult( out, tc, 1e-14 );
} );

test( 'dlaev2: df < 0 (a < c)', function t() {
	var out;
	var tc;

	tc = df_negative;
	out = dlaev2( tc.a, tc.b, tc.c );
	checkResult( out, tc, 1e-14 );
} );

test( 'dlaev2: b=0, a < c', function t() {
	var out;
	var tc;

	tc = b_zero_a_lt_c;
	out = dlaev2( tc.a, tc.b, tc.c );
	checkResult( out, tc, 1e-14 );
} );

test( 'dlaev2: verifies diagonalization property', function t() {
	var names;
	var out;
	var a11;
	var a12;
	var a21;
	var a22;
	var t11;
	var t12;
	var t21;
	var t22;
	var tc;
	var i;

	names = [ 'identity', 'diagonal', 'off_diagonal', 'general', 'negative_diagonal', 'sm_zero', 'equal_diagonal', 'negative_offdiag', 'df_negative', 'b_zero_a_lt_c' ]; // eslint-disable-line max-len
	for ( i = 0; i < names.length; i += 1 ) {
		tc = fixtures[ names[ i ] ];
		out = dlaev2( tc.a, tc.b, tc.c );

		// Compute Q^T * A * Q where Q = [cs1 -sn1; sn1 cs1]:
		t11 = (tc.a * out.cs1) + (tc.b * out.sn1);
		t12 = (-tc.a * out.sn1) + (tc.b * out.cs1);
		t21 = (tc.b * out.cs1) + (tc.c * out.sn1);
		t22 = (-tc.b * out.sn1) + (tc.c * out.cs1);
		a11 = (out.cs1 * t11) + (out.sn1 * t21);
		a12 = (out.cs1 * t12) + (out.sn1 * t22);
		a21 = (-out.sn1 * t11) + (out.cs1 * t21);
		a22 = (-out.sn1 * t12) + (out.cs1 * t22);

		assertClose( a11, out.rt1, 1e-12, names[ i ] + ': diag(1,1)=rt1' );
		assertClose( a22, out.rt2, 1e-12, names[ i ] + ': diag(2,2)=rt2' );
		assertClose( a12, 0.0, 1e-12, names[ i ] + ': off(1,2)=0' );
		assertClose( a21, 0.0, 1e-12, names[ i ] + ': off(2,1)=0' );
	}
} );

test( 'dlaev2: rt1 has larger absolute value than rt2', function t() {
	var names;
	var out;
	var tc;
	var i;

	names = [ 'identity', 'diagonal', 'off_diagonal', 'general', 'negative_diagonal', 'sm_zero', 'equal_diagonal', 'negative_offdiag', 'df_negative', 'b_zero_a_lt_c' ]; // eslint-disable-line max-len
	for ( i = 0; i < names.length; i += 1 ) {
		tc = fixtures[ names[ i ] ];
		out = dlaev2( tc.a, tc.b, tc.c );
		assert.ok( Math.abs( out.rt1 ) >= Math.abs( out.rt2 ), names[ i ] + ': |rt1| >= |rt2|' ); // eslint-disable-line max-len
	}
} );

test( 'dlaev2: eigenvector is unit length', function t() {
	var names;
	var norm;
	var out;
	var tc;
	var i;

	names = [ 'identity', 'diagonal', 'off_diagonal', 'general', 'negative_diagonal', 'sm_zero', 'equal_diagonal', 'negative_offdiag', 'df_negative', 'b_zero_a_lt_c' ]; // eslint-disable-line max-len
	for ( i = 0; i < names.length; i += 1 ) {
		tc = fixtures[ names[ i ] ];
		out = dlaev2( tc.a, tc.b, tc.c );
		norm = Math.sqrt( ( out.cs1 * out.cs1 ) + ( out.sn1 * out.sn1 ) );
		assertClose( norm, 1.0, 1e-14, names[ i ] + ': eigenvector should be unit length' ); // eslint-disable-line max-len
	}
} );
