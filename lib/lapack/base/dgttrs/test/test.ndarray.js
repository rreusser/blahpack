/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import dgttrf from './../../dgttrf/lib/base.js';
import dgttrs from './../lib/ndarray.js';

// FIXTURES //

import notrans_single_rhs from './fixtures/notrans_single_rhs.json' with { type: 'json' };
import trans_single_rhs from './fixtures/trans_single_rhs.json' with { type: 'json' };
import notrans_multi_rhs from './fixtures/notrans_multi_rhs.json' with { type: 'json' };
import trans_multi_rhs from './fixtures/trans_multi_rhs.json' with { type: 'json' };
import n_one from './fixtures/n_one.json' with { type: 'json' };
import n_zero from './fixtures/n_zero.json' with { type: 'json' };
import pivot_notrans from './fixtures/pivot_notrans.json' with { type: 'json' };
import pivot_trans from './fixtures/pivot_trans.json' with { type: 'json' };
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
	const relErr = Math.abs( actual - expected ) / Math.max( Math.abs( expected ), 1.0 ); // eslint-disable-line max-len
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
	let i;
	assert.equal( actual.length, expected.length, msg + ': length mismatch' );
	for ( i = 0; i < expected.length; i++ ) {
		assertClose( actual[ i ], expected[ i ], tol, msg + '[' + i + ']' );
	}
}

/**
* Factorize a tridiagonal matrix using dgttrf and convert IPIV to 0-based.
* Returns { dl, d, du, du2, ipiv, info }.
*/
function factorize( dlArr, dArr, duArr, n ) {
	const ipiv = new Int32Array( n );
	const du2 = new Float64Array( Math.max( n - 2, 0 ) );
	const dl = new Float64Array( dlArr );
	const du = new Float64Array( duArr );
	const d = new Float64Array( dArr );

	const info = dgttrf( n, dl, 1, 0, d, 1, 0, du, 1, 0, du2, 1, 0, ipiv, 1, 0 );
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

test( 'dgttrs: no-transpose, single RHS, 5x5 symmetric tridiagonal', function t() { // eslint-disable-line max-len

	const tc = notrans_single_rhs;
	const n = 5;
	const nrhs = 1;
	const f = factorize( [ -1, -1, -1, -1 ], [ 2, 2, 2, 2, 2 ], [ -1, -1, -1, -1 ], n );
	const B = new Float64Array( [ 1, 0, 0, 0, 1 ] );
	assert.equal( f.info, 0 );
	const info = dgttrs( 'no-transpose', n, nrhs, f.dl, 1, 0, f.d, 1, 0, f.du, 1, 0, f.du2, 1, 0, f.ipiv, 1, 0, B, 1, n, 0 ); // eslint-disable-line max-len
	assert.equal( info, tc.info, 'info' );
	assertArrayClose( B, new Float64Array( tc.B ), 1e-14, 'B' );
});

test( 'dgttrs: transpose, single RHS, 5x5 symmetric tridiagonal', function t() {

	const tc = trans_single_rhs;
	const n = 5;
	const nrhs = 1;
	const f = factorize( [ -1, -1, -1, -1 ], [ 2, 2, 2, 2, 2 ], [ -1, -1, -1, -1 ], n );
	const B = new Float64Array( [ 1, 0, 0, 0, 1 ] );
	assert.equal( f.info, 0 );
	const info = dgttrs( 'transpose', n, nrhs, f.dl, 1, 0, f.d, 1, 0, f.du, 1, 0, f.du2, 1, 0, f.ipiv, 1, 0, B, 1, n, 0 ); // eslint-disable-line max-len
	assert.equal( info, tc.info, 'info' );
	assertArrayClose( B, new Float64Array( tc.B ), 1e-14, 'B' );
});

test( 'dgttrs: no-transpose, multiple RHS (3 columns)', function t() {

	const tc = notrans_multi_rhs;
	const n = 5;
	const nrhs = 3;
	const f = factorize( [ -1, -1, -1, -1 ], [ 2, 2, 2, 2, 2 ], [ -1, -1, -1, -1 ], n );
	const B = new Float64Array([
		1,
		0,
		0,
		0,
		1,  // column 1
		1,
		1,
		1,
		1,
		1,  // column 2
		0,
		0,
		1,
		0,
		0   // column 3
	]);
	assert.equal( f.info, 0 );
	const info = dgttrs( 'no-transpose', n, nrhs, f.dl, 1, 0, f.d, 1, 0, f.du, 1, 0, f.du2, 1, 0, f.ipiv, 1, 0, B, 1, n, 0 ); // eslint-disable-line max-len
	assert.equal( info, tc.info, 'info' );
	assertArrayClose( B, new Float64Array( tc.B ), 1e-14, 'B' );
});

test( 'dgttrs: transpose, multiple RHS (3 columns)', function t() {

	const tc = trans_multi_rhs;
	const n = 5;
	const nrhs = 3;
	const f = factorize( [ -1, -1, -1, -1 ], [ 2, 2, 2, 2, 2 ], [ -1, -1, -1, -1 ], n );
	const B = new Float64Array([
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
	assert.equal( f.info, 0 );
	const info = dgttrs( 'transpose', n, nrhs, f.dl, 1, 0, f.d, 1, 0, f.du, 1, 0, f.du2, 1, 0, f.ipiv, 1, 0, B, 1, n, 0 ); // eslint-disable-line max-len
	assert.equal( info, tc.info, 'info' );
	assertArrayClose( B, new Float64Array( tc.B ), 1e-14, 'B' );
});

test( 'dgttrs: N=1', function t() {

	const tc = n_one;
	const n = 1;
	const nrhs = 1;
	const f = factorize( [], [ 5 ], [], n );
	const B = new Float64Array( [ 10 ] );
	assert.equal( f.info, 0 );
	const info = dgttrs( 'no-transpose', n, nrhs, f.dl, 1, 0, f.d, 1, 0, f.du, 1, 0, f.du2, 1, 0, f.ipiv, 1, 0, B, 1, n, 0 ); // eslint-disable-line max-len
	assert.equal( info, tc.info, 'info' );
	assertArrayClose( B, new Float64Array( tc.B ), 1e-14, 'B' );
});

test( 'dgttrs: N=0 quick return', function t() {
	const tc = n_zero;

	const info = dgttrs( 'no-transpose', 0, 1, new Float64Array( 0 ), 1, 0, new Float64Array( 0 ), 1, 0, new Float64Array( 0 ), 1, 0, new Float64Array( 0 ), 1, 0, new Int32Array( 0 ), 1, 0, new Float64Array( 0 ), 1, 1, 0 ); // eslint-disable-line max-len

	assert.equal( info, tc.info, 'info' );
});

test( 'dgttrs: pivoting, no-transpose', function t() {

	const tc = pivot_notrans;
	const n = 5;
	const nrhs = 1;
	const f = factorize( [ 10, 10, 10, 10 ], [ 1, 1, 1, 1, 1 ], [ 2, 2, 2, 2 ], n );
	const B = new Float64Array( [ 3, 13, 13, 13, 11 ] );
	assert.equal( f.info, 0 );
	const info = dgttrs( 'no-transpose', n, nrhs, f.dl, 1, 0, f.d, 1, 0, f.du, 1, 0, f.du2, 1, 0, f.ipiv, 1, 0, B, 1, n, 0 ); // eslint-disable-line max-len
	assert.equal( info, tc.info, 'info' );
	assertArrayClose( B, new Float64Array( tc.B ), 1e-13, 'B' );
});

test( 'dgttrs: pivoting, transpose', function t() {

	const tc = pivot_trans;
	const n = 5;
	const nrhs = 1;
	const f = factorize( [ 10, 10, 10, 10 ], [ 1, 1, 1, 1, 1 ], [ 2, 2, 2, 2 ], n );
	const B = new Float64Array( [ 3, 13, 13, 13, 11 ] );
	assert.equal( f.info, 0 );
	const info = dgttrs( 'transpose', n, nrhs, f.dl, 1, 0, f.d, 1, 0, f.du, 1, 0, f.du2, 1, 0, f.ipiv, 1, 0, B, 1, n, 0 ); // eslint-disable-line max-len
	assert.equal( info, tc.info, 'info' );
	assertArrayClose( B, new Float64Array( tc.B ), 1e-13, 'B' );
});

test( 'dgttrs: N=2, no-transpose', function t() {

	const tc = n_two_notrans;
	const n = 2;
	const nrhs = 1;
	const f = factorize( [ 3 ], [ 4, 7 ], [ 1 ], n );
	const B = new Float64Array( [ 5, 10 ] );
	assert.equal( f.info, 0 );
	const info = dgttrs( 'no-transpose', n, nrhs, f.dl, 1, 0, f.d, 1, 0, f.du, 1, 0, f.du2, 1, 0, f.ipiv, 1, 0, B, 1, n, 0 ); // eslint-disable-line max-len
	assert.equal( info, tc.info, 'info' );
	assertArrayClose( B, new Float64Array( tc.B ), 1e-14, 'B' );
});

test( 'dgttrs: N=2, transpose', function t() {

	const tc = n_two_trans;
	const n = 2;
	const nrhs = 1;
	const f = factorize( [ 3 ], [ 4, 7 ], [ 1 ], n );
	const B = new Float64Array( [ 5, 10 ] );
	assert.equal( f.info, 0 );
	const info = dgttrs( 'transpose', n, nrhs, f.dl, 1, 0, f.d, 1, 0, f.du, 1, 0, f.du2, 1, 0, f.ipiv, 1, 0, B, 1, n, 0 ); // eslint-disable-line max-len
	assert.equal( info, tc.info, 'info' );
	assertArrayClose( B, new Float64Array( tc.B ), 1e-14, 'B' );
});

test( 'dgttrs: supports conjugate transpose (C) same as transpose', function t() { // eslint-disable-line max-len

	const tc = trans_single_rhs;
	const n = 5;
	const nrhs = 1;
	const f = factorize( [ -1, -1, -1, -1 ], [ 2, 2, 2, 2, 2 ], [ -1, -1, -1, -1 ], n );
	const B = new Float64Array( [ 1, 0, 0, 0, 1 ] );
	const info = dgttrs( 'transpose', n, nrhs, f.dl, 1, 0, f.d, 1, 0, f.du, 1, 0, f.du2, 1, 0, f.ipiv, 1, 0, B, 1, n, 0 ); // eslint-disable-line max-len
	assert.equal( info, tc.info, 'info' );
	assertArrayClose( B, new Float64Array( tc.B ), 1e-14, 'B' );
});

test( 'dgttrs: NRHS=0 quick return', function t() {

	const info = dgttrs( 'no-transpose', 5, 0, new Float64Array( 4 ), 1, 0, new Float64Array( 5 ), 1, 0, new Float64Array( 4 ), 1, 0, new Float64Array( 3 ), 1, 0, new Int32Array( 5 ), 1, 0, new Float64Array( 0 ), 1, 5, 0 ); // eslint-disable-line max-len

	assert.equal( info, 0, 'info' );
});
