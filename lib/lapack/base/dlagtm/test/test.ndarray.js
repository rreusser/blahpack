/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dlagtm from './../lib/ndarray.js';

// FIXTURES //

import notrans_alpha1_beta0 from './fixtures/notrans_alpha1_beta0.json' with { type: 'json' };
import trans_alpha1_beta0 from './fixtures/trans_alpha1_beta0.json' with { type: 'json' };
import notrans_alpham1_beta0 from './fixtures/notrans_alpham1_beta0.json' with { type: 'json' };
import trans_alpham1_beta0 from './fixtures/trans_alpham1_beta0.json' with { type: 'json' };
import notrans_alpha1_beta1 from './fixtures/notrans_alpha1_beta1.json' with { type: 'json' };
import notrans_alpha1_betam1 from './fixtures/notrans_alpha1_betam1.json' with { type: 'json' };
import notrans_multi_rhs from './fixtures/notrans_multi_rhs.json' with { type: 'json' };
import n_one from './fixtures/n_one.json' with { type: 'json' };
import n_one_trans from './fixtures/n_one_trans.json' with { type: 'json' };
import trans_multi_rhs from './fixtures/trans_multi_rhs.json' with { type: 'json' };
import trans_alpham1_betam1_multi_rhs from './fixtures/trans_alpham1_betam1_multi_rhs.json' with { type: 'json' };

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
* GetBCol.
*
* @private
* @param {*} B - B
* @param {*} N - N
* @param {*} j - j
* @returns {*} result
*/
function getBCol( B, N, j ) {
	var out = [];
	var i;
	for ( i = 0; i < N; i++ ) {
		out.push( B[ i + ( j * N ) ] );
	}
	return out;
}

// TESTS //

test( 'dlagtm: notrans_alpha1_beta0', function t() {
	var tc = notrans_alpha1_beta0;
	var dl = new Float64Array( [ 3.0, 1.0, 2.0 ] );
	var du = new Float64Array( [ -1.0, -2.0, -3.0 ] );
	var d = new Float64Array( [ 2.0, 4.0, 5.0, 6.0 ] );
	var x = new Float64Array( [ 1.0, 2.0, 3.0, 4.0 ] );
	var b = new Float64Array( 4 );
	dlagtm( 'no-transpose', 4, 1, 1.0, dl, 1, 0, d, 1, 0, du, 1, 0, x, 1, 4, 0, 0.0, b, 1, 4, 0 ); // eslint-disable-line max-len
	assertArrayClose( getBCol( b, 4, 0 ), tc.b, 1e-14, 'b' );
});

test( 'dlagtm: trans_alpha1_beta0', function t() {
	var tc = trans_alpha1_beta0;
	var dl = new Float64Array( [ 3.0, 1.0, 2.0 ] );
	var du = new Float64Array( [ -1.0, -2.0, -3.0 ] );
	var d = new Float64Array( [ 2.0, 4.0, 5.0, 6.0 ] );
	var x = new Float64Array( [ 1.0, 2.0, 3.0, 4.0 ] );
	var b = new Float64Array( 4 );
	dlagtm( 'transpose', 4, 1, 1.0, dl, 1, 0, d, 1, 0, du, 1, 0, x, 1, 4, 0, 0.0, b, 1, 4, 0 ); // eslint-disable-line max-len
	assertArrayClose( getBCol( b, 4, 0 ), tc.b, 1e-14, 'b' );
});

test( 'dlagtm: notrans_alpham1_beta0', function t() {
	var tc = notrans_alpham1_beta0;
	var dl = new Float64Array( [ 3.0, 1.0, 2.0 ] );
	var du = new Float64Array( [ -1.0, -2.0, -3.0 ] );
	var d = new Float64Array( [ 2.0, 4.0, 5.0, 6.0 ] );
	var x = new Float64Array( [ 1.0, 2.0, 3.0, 4.0 ] );
	var b = new Float64Array( 4 );
	dlagtm( 'no-transpose', 4, 1, -1.0, dl, 1, 0, d, 1, 0, du, 1, 0, x, 1, 4, 0, 0.0, b, 1, 4, 0 ); // eslint-disable-line max-len
	assertArrayClose( getBCol( b, 4, 0 ), tc.b, 1e-14, 'b' );
});

test( 'dlagtm: trans_alpham1_beta0', function t() {
	var tc = trans_alpham1_beta0;
	var dl = new Float64Array( [ 3.0, 1.0, 2.0 ] );
	var du = new Float64Array( [ -1.0, -2.0, -3.0 ] );
	var d = new Float64Array( [ 2.0, 4.0, 5.0, 6.0 ] );
	var x = new Float64Array( [ 1.0, 2.0, 3.0, 4.0 ] );
	var b = new Float64Array( 4 );
	dlagtm( 'transpose', 4, 1, -1.0, dl, 1, 0, d, 1, 0, du, 1, 0, x, 1, 4, 0, 0.0, b, 1, 4, 0 ); // eslint-disable-line max-len
	assertArrayClose( getBCol( b, 4, 0 ), tc.b, 1e-14, 'b' );
});

test( 'dlagtm: notrans_alpha1_beta1', function t() {
	var tc = notrans_alpha1_beta1;
	var dl = new Float64Array( [ 3.0, 1.0, 2.0 ] );
	var du = new Float64Array( [ -1.0, -2.0, -3.0 ] );
	var d = new Float64Array( [ 2.0, 4.0, 5.0, 6.0 ] );
	var x = new Float64Array( [ 1.0, 2.0, 3.0, 4.0 ] );
	var b = new Float64Array( [ 10.0, 20.0, 30.0, 40.0 ] );
	dlagtm( 'no-transpose', 4, 1, 1.0, dl, 1, 0, d, 1, 0, du, 1, 0, x, 1, 4, 0, 1.0, b, 1, 4, 0 ); // eslint-disable-line max-len
	assertArrayClose( getBCol( b, 4, 0 ), tc.b, 1e-14, 'b' );
});

test( 'dlagtm: notrans_alpha1_betam1', function t() {
	var tc = notrans_alpha1_betam1;
	var dl = new Float64Array( [ 3.0, 1.0, 2.0 ] );
	var du = new Float64Array( [ -1.0, -2.0, -3.0 ] );
	var d = new Float64Array( [ 2.0, 4.0, 5.0, 6.0 ] );
	var x = new Float64Array( [ 1.0, 2.0, 3.0, 4.0 ] );
	var b = new Float64Array( [ 10.0, 20.0, 30.0, 40.0 ] );
	dlagtm( 'no-transpose', 4, 1, 1.0, dl, 1, 0, d, 1, 0, du, 1, 0, x, 1, 4, 0, -1.0, b, 1, 4, 0 ); // eslint-disable-line max-len
	assertArrayClose( getBCol( b, 4, 0 ), tc.b, 1e-14, 'b' );
});

test( 'dlagtm: notrans_multi_rhs', function t() {
	var tc = notrans_multi_rhs;
	var dl = new Float64Array( [ 3.0, 1.0, 2.0 ] );
	var du = new Float64Array( [ -1.0, -2.0, -3.0 ] );
	var d = new Float64Array( [ 2.0, 4.0, 5.0, 6.0 ] );
	var x = new Float64Array( [ 1.0, 0.0, 0.0, 1.0, 2.0, 3.0, 4.0, 5.0 ] );
	var b = new Float64Array( 8 );
	dlagtm( 'no-transpose', 4, 2, 1.0, dl, 1, 0, d, 1, 0, du, 1, 0, x, 1, 4, 0, 0.0, b, 1, 4, 0 ); // eslint-disable-line max-len
	assertArrayClose( getBCol( b, 4, 0 ), tc.b1, 1e-14, 'b1' );
	assertArrayClose( getBCol( b, 4, 1 ), tc.b2, 1e-14, 'b2' );
});

test( 'dlagtm: n_one', function t() {
	var tc = n_one;
	var dl = new Float64Array( 0 );
	var du = new Float64Array( 0 );
	var d = new Float64Array( [ 5.0 ] );
	var x = new Float64Array( [ 3.0 ] );
	var b = new Float64Array( 1 );
	dlagtm( 'no-transpose', 1, 1, 1.0, dl, 1, 0, d, 1, 0, du, 1, 0, x, 1, 1, 0, 0.0, b, 1, 1, 0 ); // eslint-disable-line max-len
	assertArrayClose( getBCol( b, 1, 0 ), tc.b, 1e-14, 'b' );
});

test( 'dlagtm: n_one_trans', function t() {
	var tc = n_one_trans;
	var dl = new Float64Array( 0 );
	var du = new Float64Array( 0 );
	var d = new Float64Array( [ 5.0 ] );
	var x = new Float64Array( [ 3.0 ] );
	var b = new Float64Array( 1 );
	dlagtm( 'transpose', 1, 1, 1.0, dl, 1, 0, d, 1, 0, du, 1, 0, x, 1, 1, 0, 0.0, b, 1, 1, 0 ); // eslint-disable-line max-len
	assertArrayClose( getBCol( b, 1, 0 ), tc.b, 1e-14, 'b' );
});

test( 'dlagtm: n_zero (quick return)', function t() {
	var dl = new Float64Array( 0 );
	var du = new Float64Array( 0 );
	var b = new Float64Array( [ 99.0, 99.0, 99.0, 99.0 ] );
	var d = new Float64Array( 0 );
	var x = new Float64Array( 0 );
	dlagtm( 'no-transpose', 0, 1, 1.0, dl, 1, 0, d, 1, 0, du, 1, 0, x, 1, 0, 0, 0.0, b, 1, 4, 0 ); // eslint-disable-line max-len
	assert.equal( b[ 0 ], 99.0 );
	assert.equal( b[ 1 ], 99.0 );
});

test( 'dlagtm: trans_multi_rhs', function t() {
	var tc = trans_multi_rhs;
	var dl = new Float64Array( [ 3.0, 1.0, 2.0 ] );
	var du = new Float64Array( [ -1.0, -2.0, -3.0 ] );
	var d = new Float64Array( [ 2.0, 4.0, 5.0, 6.0 ] );
	var x = new Float64Array( [ 1.0, 2.0, 3.0, 4.0, 5.0, 6.0, 7.0, 8.0 ] );
	var b = new Float64Array( 8 );
	dlagtm( 'transpose', 4, 2, 1.0, dl, 1, 0, d, 1, 0, du, 1, 0, x, 1, 4, 0, 0.0, b, 1, 4, 0 ); // eslint-disable-line max-len
	assertArrayClose( getBCol( b, 4, 0 ), tc.b1, 1e-14, 'b1' );
	assertArrayClose( getBCol( b, 4, 1 ), tc.b2, 1e-14, 'b2' );
});

test( 'dlagtm: trans_alpham1_betam1_multi_rhs', function t() {
	var tc = trans_alpham1_betam1_multi_rhs;
	var dl = new Float64Array( [ 3.0, 1.0, 2.0 ] );
	var du = new Float64Array( [ -1.0, -2.0, -3.0 ] );
	var d = new Float64Array( [ 2.0, 4.0, 5.0, 6.0 ] );
	var x = new Float64Array( [ 1.0, 2.0, 3.0, 4.0, 5.0, 6.0, 7.0, 8.0 ] );
	var b = new Float64Array( [ 1.0, 1.0, 1.0, 1.0, 2.0, 2.0, 2.0, 2.0 ] );
	dlagtm( 'transpose', 4, 2, -1.0, dl, 1, 0, d, 1, 0, du, 1, 0, x, 1, 4, 0, -1.0, b, 1, 4, 0 ); // eslint-disable-line max-len
	assertArrayClose( getBCol( b, 4, 0 ), tc.b1, 1e-14, 'b1' );
	assertArrayClose( getBCol( b, 4, 1 ), tc.b2, 1e-14, 'b2' );
});
