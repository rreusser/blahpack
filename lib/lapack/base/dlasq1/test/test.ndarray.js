/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dlasq1 from './../lib/ndarray.js';

// FIXTURES //

import n1 from './fixtures/n1.json' with { type: 'json' };
import n1_neg from './fixtures/n1_neg.json' with { type: 'json' };
import n2 from './fixtures/n2.json' with { type: 'json' };
import n2_neg from './fixtures/n2_neg.json' with { type: 'json' };
import n3_basic from './fixtures/n3_basic.json' with { type: 'json' };
import n4_basic from './fixtures/n4_basic.json' with { type: 'json' };
import n3_diag from './fixtures/n3_diag.json' with { type: 'json' };
import n5_basic from './fixtures/n5_basic.json' with { type: 'json' };
import n2_diag from './fixtures/n2_diag.json' with { type: 'json' };
import n3_neg_large_e from './fixtures/n3_neg_large_e.json' with { type: 'json' };
import n4_identity_like from './fixtures/n4_identity_like.json' with { type: 'json' };

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
	if ( expected === 0.0 ) {
		assert.ok( Math.abs( actual ) <= tol, msg + ': expected ' + expected + ', got ' + actual ); // eslint-disable-line max-len
		return;
	}
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
	for ( i = 0; i < expected.length; i++ ) {
		assertClose( actual[ i ], expected[ i ], tol, msg + '[' + i + ']' );
	}
}

// TESTS //

test( 'dlasq1: n0 - quick return', function t() {
	var work;
	var info;
	var d;
	var e;

	work = new Float64Array( 4 );
	d = new Float64Array( 1 );
	e = new Float64Array( 1 );
	info = dlasq1( 0, d, 1, 0, e, 1, 0, work, 1, 0 );
	assert.strictEqual( info, 0 );
});

test( 'dlasq1: n1 - single positive diagonal', function t() {
	var work;
	var info;
	var tc;
	var d;
	var e;

	tc = n1;
	work = new Float64Array( 4 );
	d = new Float64Array( [ 5.0 ] );
	e = new Float64Array( 1 );
	info = dlasq1( 1, d, 1, 0, e, 1, 0, work, 1, 0 );
	assert.strictEqual( info, tc.info );
	assertArrayClose( d, tc.d, 1e-14, 'd' );
});

test( 'dlasq1: n1_neg - single negative diagonal (abs)', function t() {
	var work;
	var info;
	var tc;
	var d;
	var e;

	tc = n1_neg;
	work = new Float64Array( 4 );
	d = new Float64Array( [ -3.0 ] );
	e = new Float64Array( 1 );
	info = dlasq1( 1, d, 1, 0, e, 1, 0, work, 1, 0 );
	assert.strictEqual( info, tc.info );
	assertArrayClose( d, tc.d, 1e-14, 'd' );
});

test( 'dlasq1: n2 - two elements', function t() {
	var work;
	var info;
	var tc;
	var d;
	var e;

	tc = n2;
	work = new Float64Array( 8 );
	d = new Float64Array( [ 4.0, 3.0 ] );
	e = new Float64Array( [ 1.0 ] );
	info = dlasq1( 2, d, 1, 0, e, 1, 0, work, 1, 0 );
	assert.strictEqual( info, tc.info );
	assertArrayClose( d, tc.d, 1e-14, 'd' );
});

test( 'dlasq1: n2_neg - two negative diagonals', function t() {
	var work;
	var info;
	var tc;
	var d;
	var e;

	tc = n2_neg;
	work = new Float64Array( 8 );
	d = new Float64Array( [ -4.0, -3.0 ] );
	e = new Float64Array( [ 2.0 ] );
	info = dlasq1( 2, d, 1, 0, e, 1, 0, work, 1, 0 );
	assert.strictEqual( info, tc.info );
	assertArrayClose( d, tc.d, 1e-14, 'd' );
});

test( 'dlasq1: n3_basic', function t() {
	var work;
	var info;
	var tc;
	var d;
	var e;

	tc = n3_basic;
	work = new Float64Array( 100 );
	d = new Float64Array( [ 4.0, 3.0, 2.0 ] );
	e = new Float64Array( [ 1.0, 0.5 ] );
	info = dlasq1( 3, d, 1, 0, e, 1, 0, work, 1, 0 );
	assert.strictEqual( info, tc.info );
	assertArrayClose( d, tc.d, 1e-14, 'd' );
});

test( 'dlasq1: n4_basic', function t() {
	var work;
	var info;
	var tc;
	var d;
	var e;

	tc = n4_basic;
	work = new Float64Array( 100 );
	d = new Float64Array( [ 5.0, 4.0, 3.0, 2.0 ] );
	e = new Float64Array( [ 1.0, 0.5, 0.3 ] );
	info = dlasq1( 4, d, 1, 0, e, 1, 0, work, 1, 0 );
	assert.strictEqual( info, tc.info );
	assertArrayClose( d, tc.d, 1e-14, 'd' );
});

test( 'dlasq1: n3_diag - diagonal matrix (all e=0)', function t() {
	var work;
	var info;
	var tc;
	var d;
	var e;

	tc = n3_diag;
	work = new Float64Array( 100 );
	d = new Float64Array( [ 1.0, 5.0, 3.0 ] );
	e = new Float64Array( [ 0.0, 0.0 ] );
	info = dlasq1( 3, d, 1, 0, e, 1, 0, work, 1, 0 );
	assert.strictEqual( info, tc.info );
	assertArrayClose( d, tc.d, 1e-14, 'd' );
});

test( 'dlasq1: n5_basic', function t() {
	var work;
	var info;
	var tc;
	var d;
	var e;

	tc = n5_basic;
	work = new Float64Array( 100 );
	d = new Float64Array( [ 6.0, 5.0, 4.0, 3.0, 2.0 ] );
	e = new Float64Array( [ 1.0, 0.8, 0.5, 0.3 ] );
	info = dlasq1( 5, d, 1, 0, e, 1, 0, work, 1, 0 );
	assert.strictEqual( info, tc.info );
	assertArrayClose( d, tc.d, 1e-14, 'd' );
});

test( 'dlasq1: n2_diag - diagonal N=2 (e=0)', function t() {
	var work;
	var info;
	var tc;
	var d;
	var e;

	tc = n2_diag;
	work = new Float64Array( 100 );
	d = new Float64Array( [ 3.0, 7.0 ] );
	e = new Float64Array( [ 0.0 ] );
	info = dlasq1( 2, d, 1, 0, e, 1, 0, work, 1, 0 );
	assert.strictEqual( info, tc.info );
	assertArrayClose( d, tc.d, 1e-14, 'd' );
});

test( 'dlasq1: n3_neg_large_e', function t() {
	var work;
	var info;
	var tc;
	var d;
	var e;

	tc = n3_neg_large_e;
	work = new Float64Array( 100 );
	d = new Float64Array( [ -3.0, -5.0, -2.0 ] );
	e = new Float64Array( [ 4.0, 3.0 ] );
	info = dlasq1( 3, d, 1, 0, e, 1, 0, work, 1, 0 );
	assert.strictEqual( info, tc.info );
	assertArrayClose( d, tc.d, 1e-14, 'd' );
});

test( 'dlasq1: n4_identity_like', function t() {
	var work;
	var info;
	var tc;
	var d;
	var e;

	tc = n4_identity_like;
	work = new Float64Array( 100 );
	d = new Float64Array( [ 1.0, 1.0, 1.0, 1.0 ] );
	e = new Float64Array( [ 0.01, 0.01, 0.01 ] );
	info = dlasq1( 4, d, 1, 0, e, 1, 0, work, 1, 0 );
	assert.strictEqual( info, tc.info );
	assertArrayClose( d, tc.d, 1e-14, 'd' );
});

// Error case: negative N
test( 'dlasq1: throws RangeError for N<0', function t() {
	var work = new Float64Array( 4 );
	var d = new Float64Array( 1 );
	var e = new Float64Array( 1 );
	assert.throws( function() {
		dlasq1( -1, d, 1, 0, e, 1, 0, work, 1, 0 );
	}, RangeError );
});
