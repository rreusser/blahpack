/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Complex128 from '@stdlib/complex/float64/ctor/lib/index.js';
import zlaev2 from './../lib/ndarray.js';


// FIXTURES //

import realDiagonal from './fixtures/real_diagonal.json' with { type: 'json' };
import realOffdiag from './fixtures/real_offdiag.json' with { type: 'json' };
import imagB from './fixtures/imag_b.json' with { type: 'json' };
import complexB from './fixtures/complex_b.json' with { type: 'json' };
import identity from './fixtures/identity.json' with { type: 'json' };
import negativeDiag from './fixtures/negative_diag.json' with { type: 'json' };
import smZero from './fixtures/sm_zero.json' with { type: 'json' };
import equalDiag from './fixtures/equal_diag.json' with { type: 'json' };
import largeValues from './fixtures/large_values.json' with { type: 'json' };
import dfNegative from './fixtures/df_negative.json' with { type: 'json' };

var fixtures = {
	'real_diagonal': realDiagonal,
	'real_offdiag': realOffdiag,
	'imag_b': imagB,
	'complex_b': complexB,
	'identity': identity,
	'negative_diag': negativeDiag,
	'sm_zero': smZero,
	'equal_diag': equalDiag,
	'large_values': largeValues,
	'df_negative': dfNegative
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
* Checks all five outputs of zlaev2 against fixture values.
*
* @private
* @param {Object} out - result from zlaev2
* @param {Object} tc - test case from fixture
* @param {number} tol - tolerance
*/
function checkResult( out, tc, tol ) {
	assertClose( out.rt1, tc.rt1, tol, 'rt1' );
	assertClose( out.rt2, tc.rt2, tol, 'rt2' );
	assertClose( out.cs1, tc.cs1, tol, 'cs1' );
	assertClose( out.sn1r, tc.sn1r, tol, 'sn1r' );
	assertClose( out.sn1i, tc.sn1i, tol, 'sn1i' );
}


// TESTS //

test( 'zlaev2 is a function', function t() {
	assert.strictEqual( typeof zlaev2, 'function' );
} );

test( 'zlaev2: real diagonal (b=0, a > c)', function t() {
	var out;
	var tc;

	tc = realDiagonal;
	out = zlaev2( new Complex128( tc.ar, tc.ai ), new Complex128( tc.br, tc.bi ), new Complex128( tc.cr, tc.ci ) ); // eslint-disable-line max-len
	checkResult( out, tc, 1e-14 );
} );

test( 'zlaev2: real off-diagonal (b is real)', function t() {
	var out;
	var tc;

	tc = realOffdiag;
	out = zlaev2( new Complex128( tc.ar, tc.ai ), new Complex128( tc.br, tc.bi ), new Complex128( tc.cr, tc.ci ) ); // eslint-disable-line max-len
	checkResult( out, tc, 1e-14 );
} );

test( 'zlaev2: pure imaginary b', function t() {
	var out;
	var tc;

	tc = imagB;
	out = zlaev2( new Complex128( tc.ar, tc.ai ), new Complex128( tc.br, tc.bi ), new Complex128( tc.cr, tc.ci ) ); // eslint-disable-line max-len
	checkResult( out, tc, 1e-14 );
} );

test( 'zlaev2: complex b (general case)', function t() {
	var out;
	var tc;

	tc = complexB;
	out = zlaev2( new Complex128( tc.ar, tc.ai ), new Complex128( tc.br, tc.bi ), new Complex128( tc.cr, tc.ci ) ); // eslint-disable-line max-len
	checkResult( out, tc, 1e-14 );
} );

test( 'zlaev2: identity matrix (a=c=1, b=0)', function t() {
	var out;
	var tc;

	tc = identity;
	out = zlaev2( new Complex128( tc.ar, tc.ai ), new Complex128( tc.br, tc.bi ), new Complex128( tc.cr, tc.ci ) ); // eslint-disable-line max-len
	checkResult( out, tc, 1e-14 );
} );

test( 'zlaev2: negative diagonal with complex b', function t() {
	var out;
	var tc;

	tc = negativeDiag;
	out = zlaev2( new Complex128( tc.ar, tc.ai ), new Complex128( tc.br, tc.bi ), new Complex128( tc.cr, tc.ci ) ); // eslint-disable-line max-len
	checkResult( out, tc, 1e-14 );
} );

test( 'zlaev2: sm = 0 path (a = -c)', function t() {
	var out;
	var tc;

	tc = smZero;
	out = zlaev2( new Complex128( tc.ar, tc.ai ), new Complex128( tc.br, tc.bi ), new Complex128( tc.cr, tc.ci ) ); // eslint-disable-line max-len
	checkResult( out, tc, 1e-14 );
} );

test( 'zlaev2: equal diagonal with complex b', function t() {
	var out;
	var tc;

	tc = equalDiag;
	out = zlaev2( new Complex128( tc.ar, tc.ai ), new Complex128( tc.br, tc.bi ), new Complex128( tc.cr, tc.ci ) ); // eslint-disable-line max-len
	checkResult( out, tc, 1e-14 );
} );

test( 'zlaev2: large values', function t() {
	var out;
	var tc;

	tc = largeValues;
	out = zlaev2( new Complex128( tc.ar, tc.ai ), new Complex128( tc.br, tc.bi ), new Complex128( tc.cr, tc.ci ) ); // eslint-disable-line max-len
	checkResult( out, tc, 1e-14 );
} );

test( 'zlaev2: df < 0 path (a < c)', function t() {
	var out;
	var tc;

	tc = dfNegative;
	out = zlaev2( new Complex128( tc.ar, tc.ai ), new Complex128( tc.br, tc.bi ), new Complex128( tc.cr, tc.ci ) ); // eslint-disable-line max-len
	checkResult( out, tc, 1e-14 );
} );

test( 'zlaev2: rt1 has larger absolute value than rt2', function t() {
	var names;
	var out;
	var tc;
	var i;

	names = [ 'real_diagonal', 'real_offdiag', 'imag_b', 'complex_b', 'identity', 'negative_diag', 'sm_zero', 'equal_diag', 'large_values', 'df_negative' ]; // eslint-disable-line max-len
	for ( i = 0; i < names.length; i += 1 ) {
		tc = fixtures[ names[ i ] ];
		out = zlaev2( new Complex128( tc.ar, tc.ai ), new Complex128( tc.br, tc.bi ), new Complex128( tc.cr, tc.ci ) ); // eslint-disable-line max-len
		assert.ok( Math.abs( out.rt1 ) >= Math.abs( out.rt2 ), names[ i ] + ': |rt1| >= |rt2|' ); // eslint-disable-line max-len
	}
} );

test( 'zlaev2: eigenvector is unit length (cs1^2 + |sn1|^2 = 1)', function t() {
	var names;
	var norm;
	var out;
	var tc;
	var i;

	names = [ 'real_diagonal', 'real_offdiag', 'imag_b', 'complex_b', 'identity', 'negative_diag', 'sm_zero', 'equal_diag', 'large_values', 'df_negative' ]; // eslint-disable-line max-len
	for ( i = 0; i < names.length; i += 1 ) {
		tc = fixtures[ names[ i ] ];
		out = zlaev2( new Complex128( tc.ar, tc.ai ), new Complex128( tc.br, tc.bi ), new Complex128( tc.cr, tc.ci ) ); // eslint-disable-line max-len
		norm = Math.sqrt( ( out.cs1 * out.cs1 ) + ( out.sn1r * out.sn1r ) + ( out.sn1i * out.sn1i ) ); // eslint-disable-line max-len
		assertClose( norm, 1.0, 1e-14, names[ i ] + ': eigenvector should be unit length' ); // eslint-disable-line max-len
	}
} );

test( 'zlaev2: verifies Hermitian diagonalization property', function t() {
	var names;
	var t11r;
	var t11i;
	var t12r;
	var t12i;
	var t21r;
	var t21i;
	var t22r;
	var t22i;
	var d11r;
	var d12r;
	var d21r;
	var d22r;
	var csnr;
	var csni;
	var out;
	var tc;
	var i;

	names = [ 'real_diagonal', 'real_offdiag', 'imag_b', 'complex_b', 'identity', 'negative_diag', 'sm_zero', 'equal_diag', 'large_values', 'df_negative' ]; // eslint-disable-line max-len
	for ( i = 0; i < names.length; i += 1 ) {
		tc = fixtures[ names[ i ] ];
		out = zlaev2( new Complex128( tc.ar, tc.ai ), new Complex128( tc.br, tc.bi ), new Complex128( tc.cr, tc.ci ) ); // eslint-disable-line max-len

		// Q^H * H * Q = D where Q = [cs1, -conj(sn1); sn1, cs1]

		// H = [[a, b], [conj(b), c]], a and c real

		// conj(sn1) = (sn1r, -sn1i)
		csnr = out.sn1r;
		csni = -out.sn1i;

		// T = H * Q: column 1 = H * [cs1; sn1], column 2 = H * [-conj(sn1); cs1]

		// t11 = a*cs1 + b*sn1
		t11r = ( tc.ar * out.cs1 ) + ( tc.br * out.sn1r ) - ( tc.bi * out.sn1i ); // eslint-disable-line max-len
		t11i = ( tc.br * out.sn1i ) + ( tc.bi * out.sn1r );

		// t21 = conj(b)*cs1 + c*sn1
		t21r = ( tc.br * out.cs1 ) + ( tc.cr * out.sn1r );
		t21i = ( -tc.bi * out.cs1 ) + ( tc.cr * out.sn1i );

		// t12 = a*(-conj(sn1)) + b*cs1
		t12r = ( -tc.ar * csnr ) + ( tc.br * out.cs1 );
		t12i = ( -tc.ar * csni ) + ( tc.bi * out.cs1 );

		// t22 = conj(b)*(-conj(sn1)) + c*cs1
		t22r = ( -tc.br * csnr ) - ( tc.bi * csni ) + ( tc.cr * out.cs1 ); // eslint-disable-line max-len
		t22i = ( -tc.br * csni ) + ( tc.bi * csnr );

		// D = Q^H * T: Q^H = [cs1, conj(sn1); -sn1, cs1]

		// d11 = cs1*t11 + conj(sn1)*t21
		d11r = ( out.cs1 * t11r ) + ( csnr * t21r ) - ( csni * t21i );

		// d22 = -sn1*t12 + cs1*t22
		d22r = ( -out.sn1r * t12r ) + ( out.sn1i * t12i ) + ( out.cs1 * t22r ); // eslint-disable-line max-len

		// d12 = cs1*t12 + conj(sn1)*t22
		d12r = ( out.cs1 * t12r ) + ( csnr * t22r ) - ( csni * t22i );

		// d21 = -sn1*t11 + cs1*t21
		d21r = ( -out.sn1r * t11r ) + ( out.sn1i * t11i ) + ( out.cs1 * t21r ); // eslint-disable-line max-len

		assertClose( d11r, out.rt1, 1e-10, names[ i ] + ': diag(1,1)=rt1' );
		assertClose( d22r, out.rt2, 1e-10, names[ i ] + ': diag(2,2)=rt2' );
		assertClose( d12r, 0.0, 1e-6, names[ i ] + ': off(1,2)=0' );
		assertClose( d21r, 0.0, 1e-6, names[ i ] + ': off(2,1)=0' );
	}
} );
