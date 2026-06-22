/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */


// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import dgttrf from './../../dgttrf/lib/base.js';
import dgtts2 from './../lib/ndarray.js';


// FIXTURES //

import notrans_single_rhs from './fixtures/notrans_single_rhs.json' with { type: 'json' };
import trans_single_rhs from './fixtures/trans_single_rhs.json' with { type: 'json' };
import notrans_multi_rhs from './fixtures/notrans_multi_rhs.json' with { type: 'json' };
import pivot_notrans from './fixtures/pivot_notrans.json' with { type: 'json' };
import pivot_trans from './fixtures/pivot_trans.json' with { type: 'json' };
import n_one from './fixtures/n_one.json' with { type: 'json' };
import n_two_notrans from './fixtures/n_two_notrans.json' with { type: 'json' };
import n_two_trans from './fixtures/n_two_trans.json' with { type: 'json' };


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
* Factorize.
*
* @private
* @param {*} dlArr - dlArr
* @param {*} dArr - dArr
* @param {*} duArr - duArr
* @param {*} n - n
* @returns {*} result
*/
function factorize( dlArr, dArr, duArr, n ) {
	var ipiv = new Int32Array( n );
	var info;
	var du2 = new Float64Array( Math.max( n - 2, 0 ) );
	var dl = new Float64Array( dlArr );
	var du = new Float64Array( duArr );
	var d = new Float64Array( dArr );

	info = dgttrf( n, dl, 1, 0, d, 1, 0, du, 1, 0, du2, 1, 0, ipiv, 1, 0 );
	return {
		'dl': dl,
		'd': d,
		'du': du,
		'du2': du2,
		'ipiv': ipiv,
		'info': info
	};
}


// TESTS //

test( 'dgtts2: itrans=0 (no transpose), single RHS', function t() {
	var tc;
	var n;
	var f;
	var B;

	tc = notrans_single_rhs;
	n = 5;
	f = factorize( [ -1, -1, -1, -1 ], [ 2, 2, 2, 2, 2 ], [ -1, -1, -1, -1 ], n );
	B = new Float64Array( [ 1, 0, 0, 0, 1 ] );
	dgtts2( 0, n, 1, f.dl, 1, 0, f.d, 1, 0, f.du, 1, 0, f.du2, 1, 0, f.ipiv, 1, 0, B, 1, n, 0 ); // eslint-disable-line max-len
	assertArrayClose( B, new Float64Array( tc.B ), 1e-14, 'B' );
});

test( 'dgtts2: itrans=1 (transpose), single RHS', function t() {
	var tc;
	var n;
	var f;
	var B;

	tc = trans_single_rhs;
	n = 5;
	f = factorize( [ -1, -1, -1, -1 ], [ 2, 2, 2, 2, 2 ], [ -1, -1, -1, -1 ], n );
	B = new Float64Array( [ 1, 0, 0, 0, 1 ] );
	dgtts2( 1, n, 1, f.dl, 1, 0, f.d, 1, 0, f.du, 1, 0, f.du2, 1, 0, f.ipiv, 1, 0, B, 1, n, 0 ); // eslint-disable-line max-len
	assertArrayClose( B, new Float64Array( tc.B ), 1e-14, 'B' );
});

test( 'dgtts2: itrans=2 (conjugate transpose = transpose for real)', function t() { // eslint-disable-line max-len
	var tc;
	var n;
	var f;
	var B;

	tc = trans_single_rhs;
	n = 5;
	f = factorize( [ -1, -1, -1, -1 ], [ 2, 2, 2, 2, 2 ], [ -1, -1, -1, -1 ], n );
	B = new Float64Array( [ 1, 0, 0, 0, 1 ] );
	dgtts2( 2, n, 1, f.dl, 1, 0, f.d, 1, 0, f.du, 1, 0, f.du2, 1, 0, f.ipiv, 1, 0, B, 1, n, 0 ); // eslint-disable-line max-len
	assertArrayClose( B, new Float64Array( tc.B ), 1e-14, 'B' );
});

test( 'dgtts2: multiple RHS, no transpose', function t() {
	var tc;
	var n;
	var f;
	var B;

	tc = notrans_multi_rhs;
	n = 5;
	f = factorize( [ -1, -1, -1, -1 ], [ 2, 2, 2, 2, 2 ], [ -1, -1, -1, -1 ], n );
	B = new Float64Array([
		1,
		0,
		0,
		0,
		1,
		1,
		1,
		1,
		1,
		1,
		0,
		0,
		1,
		0,
		0
	]);
	dgtts2( 0, n, 3, f.dl, 1, 0, f.d, 1, 0, f.du, 1, 0, f.du2, 1, 0, f.ipiv, 1, 0, B, 1, n, 0 ); // eslint-disable-line max-len
	assertArrayClose( B, new Float64Array( tc.B ), 1e-14, 'B' );
});

test( 'dgtts2: pivoting, no-transpose', function t() {
	var tc;
	var n;
	var f;
	var B;

	tc = pivot_notrans;
	n = 5;
	f = factorize( [ 10, 10, 10, 10 ], [ 1, 1, 1, 1, 1 ], [ 2, 2, 2, 2 ], n );
	B = new Float64Array( [ 3, 13, 13, 13, 11 ] );
	dgtts2( 0, n, 1, f.dl, 1, 0, f.d, 1, 0, f.du, 1, 0, f.du2, 1, 0, f.ipiv, 1, 0, B, 1, n, 0 ); // eslint-disable-line max-len
	assertArrayClose( B, new Float64Array( tc.B ), 1e-13, 'B' );
});

test( 'dgtts2: pivoting, transpose', function t() {
	var tc;
	var n;
	var f;
	var B;

	tc = pivot_trans;
	n = 5;
	f = factorize( [ 10, 10, 10, 10 ], [ 1, 1, 1, 1, 1 ], [ 2, 2, 2, 2 ], n );
	B = new Float64Array( [ 3, 13, 13, 13, 11 ] );
	dgtts2( 1, n, 1, f.dl, 1, 0, f.d, 1, 0, f.du, 1, 0, f.du2, 1, 0, f.ipiv, 1, 0, B, 1, n, 0 ); // eslint-disable-line max-len
	assertArrayClose( B, new Float64Array( tc.B ), 1e-13, 'B' );
});

test( 'dgtts2: N=0 quick return', function t() {
	dgtts2( 0, 0, 1, new Float64Array( 0 ), 1, 0, new Float64Array( 0 ), 1, 0, new Float64Array( 0 ), 1, 0, new Float64Array( 0 ), 1, 0, new Int32Array( 0 ), 1, 0, new Float64Array( 0 ), 1, 1, 0 ); // eslint-disable-line max-len

	// No crash = pass
	assert.ok( true );
});

test( 'dgtts2: NRHS=0 quick return', function t() {
	dgtts2( 0, 5, 0, new Float64Array( 4 ), 1, 0, new Float64Array( 5 ), 1, 0, new Float64Array( 4 ), 1, 0, new Float64Array( 3 ), 1, 0, new Int32Array( 5 ), 1, 0, new Float64Array( 0 ), 1, 5, 0 ); // eslint-disable-line max-len
	assert.ok( true );
});

test( 'dgtts2: N=1', function t() {
	var tc;
	var n;
	var f;
	var B;

	tc = n_one;
	n = 1;
	f = factorize( [], [ 5 ], [], n );
	B = new Float64Array( [ 10 ] );
	dgtts2( 0, n, 1, f.dl, 1, 0, f.d, 1, 0, f.du, 1, 0, f.du2, 1, 0, f.ipiv, 1, 0, B, 1, n, 0 ); // eslint-disable-line max-len
	assertArrayClose( B, new Float64Array( tc.B ), 1e-14, 'B' );
});

test( 'dgtts2: N=2, no-transpose', function t() {
	var tc;
	var n;
	var f;
	var B;

	tc = n_two_notrans;
	n = 2;
	f = factorize( [ 3 ], [ 4, 7 ], [ 1 ], n );
	B = new Float64Array( [ 5, 10 ] );
	dgtts2( 0, n, 1, f.dl, 1, 0, f.d, 1, 0, f.du, 1, 0, f.du2, 1, 0, f.ipiv, 1, 0, B, 1, n, 0 ); // eslint-disable-line max-len
	assertArrayClose( B, new Float64Array( tc.B ), 1e-14, 'B' );
});

test( 'dgtts2: N=2, transpose', function t() {
	var tc;
	var n;
	var f;
	var B;

	tc = n_two_trans;
	n = 2;
	f = factorize( [ 3 ], [ 4, 7 ], [ 1 ], n );
	B = new Float64Array( [ 5, 10 ] );
	dgtts2( 1, n, 1, f.dl, 1, 0, f.d, 1, 0, f.du, 1, 0, f.du2, 1, 0, f.ipiv, 1, 0, B, 1, n, 0 ); // eslint-disable-line max-len
	assertArrayClose( B, new Float64Array( tc.B ), 1e-14, 'B' );
});
