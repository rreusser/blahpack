/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import zgbtrf from '../../zgbtrf/lib/base.js';
import zgbtrs from './../lib/ndarray.js';

// FIXTURES //

import notrans_tridiag from './fixtures/notrans_tridiag.json' with { type: 'json' };
import trans_tridiag from './fixtures/trans_tridiag.json' with { type: 'json' };
import conjtrans_tridiag from './fixtures/conjtrans_tridiag.json' with { type: 'json' };
import nrhs_2 from './fixtures/nrhs_2.json' with { type: 'json' };
import n_zero from './fixtures/n_zero.json' with { type: 'json' };
import nrhs_zero from './fixtures/nrhs_zero.json' with { type: 'json' };
import pentadiag_5x5 from './fixtures/pentadiag_5x5.json' with { type: 'json' };
import kl0_upper from './fixtures/kl0_upper.json' with { type: 'json' };

// FUNCTIONS //

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
		assert.ok(Math.abs( actual[ i ] - expected[ i ] ) <= tol, msg + '[' + i + ']: expected ' + expected[ i ] + ', got ' + actual[ i ]);
	}
}

/**
* Converts a typed array to a plain array.
*
* @private
* @param {TypedArray} arr - input array
* @returns {Array} output array
*/
function toArray( arr ) {
	var out = [];
	var i;
	for ( i = 0; i < arr.length; i++ ) {
		out.push( arr[ i ] );
	}
	return out;
}

// TESTS //

test( 'zgbtrs: main export is a function', function t() {
	assert.strictEqual( typeof zgbtrs, 'function' );
});

test( 'zgbtrs: no-transpose, 4x4 tridiagonal (KL=1, KU=1)', function t() {
	var IPIV;
	var info;
	var ABv;
	var tc;
	var AB;
	var Bv;
	var B;

	tc = notrans_tridiag;
	AB = new Complex128Array( 4 * 4 );
	ABv = reinterpret( AB, 0 );
	IPIV = new Int32Array( 4 );
	B = new Complex128Array( 4 );
	Bv = reinterpret( B, 0 );
	ABv[ 4 ] = 4;
	ABv[ 5 ] = 1;
	ABv[ 6 ] = -1;
	ABv[ 7 ] = 0;
	ABv[ 10 ] = -1;
	ABv[ 11 ] = 0;
	ABv[ 12 ] = 4;
	ABv[ 13 ] = 1;
	ABv[ 14 ] = -1;
	ABv[ 15 ] = 0;
	ABv[ 18 ] = -1;
	ABv[ 19 ] = 0;
	ABv[ 20 ] = 4;
	ABv[ 21 ] = 1;
	ABv[ 22 ] = -1;
	ABv[ 23 ] = 0;
	ABv[ 26 ] = -1;
	ABv[ 27 ] = 0;
	ABv[ 28 ] = 4;
	ABv[ 29 ] = 1;
	info = zgbtrf( 4, 4, 1, 1, AB, 1, 4, 0, IPIV, 1, 0 );
	assert.strictEqual( info, 0 );
	Bv[ 0 ] = 1;
	Bv[ 1 ] = 0;
	Bv[ 2 ] = 2;
	Bv[ 3 ] = 0;
	Bv[ 4 ] = 3;
	Bv[ 5 ] = 0;
	Bv[ 6 ] = 4;
	Bv[ 7 ] = 0;
	info = zgbtrs( 'no-transpose', 4, 1, 1, 1, AB, 1, 4, 0, IPIV, 1, 0, B, 1, 1, 0 ); // eslint-disable-line max-len
	assert.strictEqual( info, tc.info );
	assertArrayClose( toArray( Bv ), tc.B, 1e-12, 'B' );
});

test( 'zgbtrs: transpose, 4x4 tridiagonal', function t() {
	var IPIV;
	var info;
	var ABv;
	var tc;
	var AB;
	var Bv;
	var B;

	tc = trans_tridiag;
	AB = new Complex128Array( 4 * 4 );
	ABv = reinterpret( AB, 0 );
	IPIV = new Int32Array( 4 );
	B = new Complex128Array( 4 );
	Bv = reinterpret( B, 0 );
	ABv[ 4 ] = 4;
	ABv[ 5 ] = 1;
	ABv[ 6 ] = -1;
	ABv[ 7 ] = 0;
	ABv[ 10 ] = -1;
	ABv[ 11 ] = 0;
	ABv[ 12 ] = 4;
	ABv[ 13 ] = 1;
	ABv[ 14 ] = -1;
	ABv[ 15 ] = 0;
	ABv[ 18 ] = -1;
	ABv[ 19 ] = 0;
	ABv[ 20 ] = 4;
	ABv[ 21 ] = 1;
	ABv[ 22 ] = -1;
	ABv[ 23 ] = 0;
	ABv[ 26 ] = -1;
	ABv[ 27 ] = 0;
	ABv[ 28 ] = 4;
	ABv[ 29 ] = 1;
	info = zgbtrf( 4, 4, 1, 1, AB, 1, 4, 0, IPIV, 1, 0 );
	assert.strictEqual( info, 0 );
	Bv[ 0 ] = 1;
	Bv[ 1 ] = 0;
	Bv[ 2 ] = 2;
	Bv[ 3 ] = 0;
	Bv[ 4 ] = 3;
	Bv[ 5 ] = 0;
	Bv[ 6 ] = 4;
	Bv[ 7 ] = 0;
	info = zgbtrs( 'transpose', 4, 1, 1, 1, AB, 1, 4, 0, IPIV, 1, 0, B, 1, 1, 0 );
	assert.strictEqual( info, tc.info );
	assertArrayClose( toArray( Bv ), tc.B, 1e-12, 'B' );
});

test( 'zgbtrs: conjugate-transpose, 4x4 tridiagonal', function t() {
	var IPIV;
	var info;
	var ABv;
	var tc;
	var AB;
	var Bv;
	var B;

	tc = conjtrans_tridiag;
	AB = new Complex128Array( 4 * 4 );
	ABv = reinterpret( AB, 0 );
	IPIV = new Int32Array( 4 );
	B = new Complex128Array( 4 );
	Bv = reinterpret( B, 0 );
	ABv[ 4 ] = 4;
	ABv[ 5 ] = 1;
	ABv[ 6 ] = -1;
	ABv[ 7 ] = 0;
	ABv[ 10 ] = -1;
	ABv[ 11 ] = 0;
	ABv[ 12 ] = 4;
	ABv[ 13 ] = 1;
	ABv[ 14 ] = -1;
	ABv[ 15 ] = 0;
	ABv[ 18 ] = -1;
	ABv[ 19 ] = 0;
	ABv[ 20 ] = 4;
	ABv[ 21 ] = 1;
	ABv[ 22 ] = -1;
	ABv[ 23 ] = 0;
	ABv[ 26 ] = -1;
	ABv[ 27 ] = 0;
	ABv[ 28 ] = 4;
	ABv[ 29 ] = 1;
	info = zgbtrf( 4, 4, 1, 1, AB, 1, 4, 0, IPIV, 1, 0 );
	assert.strictEqual( info, 0 );
	Bv[ 0 ] = 1;
	Bv[ 1 ] = 0;
	Bv[ 2 ] = 2;
	Bv[ 3 ] = 0;
	Bv[ 4 ] = 3;
	Bv[ 5 ] = 0;
	Bv[ 6 ] = 4;
	Bv[ 7 ] = 0;
	info = zgbtrs( 'conjugate-transpose', 4, 1, 1, 1, AB, 1, 4, 0, IPIV, 1, 0, B, 1, 1, 0 ); // eslint-disable-line max-len
	assert.strictEqual( info, tc.info );
	assertArrayClose( toArray( Bv ), tc.B, 1e-12, 'B' );
});

test( 'zgbtrs: multiple RHS (NRHS=2)', function t() {
	var IPIV;
	var info;
	var ABv;
	var tc;
	var AB;
	var Bv;
	var B;

	tc = nrhs_2;
	AB = new Complex128Array( 4 * 4 );
	ABv = reinterpret( AB, 0 );
	IPIV = new Int32Array( 4 );
	B = new Complex128Array( 4 * 2 );
	Bv = reinterpret( B, 0 );
	ABv[ 4 ] = 4;
	ABv[ 5 ] = 1;
	ABv[ 6 ] = -1;
	ABv[ 7 ] = 0;
	ABv[ 10 ] = -1;
	ABv[ 11 ] = 0;
	ABv[ 12 ] = 4;
	ABv[ 13 ] = 1;
	ABv[ 14 ] = -1;
	ABv[ 15 ] = 0;
	ABv[ 18 ] = -1;
	ABv[ 19 ] = 0;
	ABv[ 20 ] = 4;
	ABv[ 21 ] = 1;
	ABv[ 22 ] = -1;
	ABv[ 23 ] = 0;
	ABv[ 26 ] = -1;
	ABv[ 27 ] = 0;
	ABv[ 28 ] = 4;
	ABv[ 29 ] = 1;
	info = zgbtrf( 4, 4, 1, 1, AB, 1, 4, 0, IPIV, 1, 0 );
	assert.strictEqual( info, 0 );
	Bv[ 0 ] = 1;
	Bv[ 1 ] = 0;
	Bv[ 2 ] = 2;
	Bv[ 3 ] = 0;
	Bv[ 4 ] = 3;
	Bv[ 5 ] = 0;
	Bv[ 6 ] = 4;
	Bv[ 7 ] = 0;
	Bv[ 8 ] = 5;
	Bv[ 9 ] = 1;
	Bv[ 10 ] = 6;
	Bv[ 11 ] = 2;
	Bv[ 12 ] = 7;
	Bv[ 13 ] = 3;
	Bv[ 14 ] = 8;
	Bv[ 15 ] = 4;
	info = zgbtrs( 'no-transpose', 4, 1, 1, 2, AB, 1, 4, 0, IPIV, 1, 0, B, 1, 4, 0 ); // eslint-disable-line max-len
	assert.strictEqual( info, tc.info );
	assertArrayClose( toArray( Bv ), tc.B, 1e-12, 'B' );
});

test( 'zgbtrs: N=0 quick return', function t() {
	var IPIV;
	var info;
	var tc;
	var AB;
	var B;

	tc = n_zero;
	AB = new Complex128Array( 4 );
	IPIV = new Int32Array( 4 );
	B = new Complex128Array( 4 );
	info = zgbtrs( 'no-transpose', 0, 1, 1, 1, AB, 1, 4, 0, IPIV, 1, 0, B, 1, 1, 0 ); // eslint-disable-line max-len
	assert.strictEqual( info, tc.info );
});

test( 'zgbtrs: NRHS=0 quick return', function t() {
	var IPIV;
	var info;
	var tc;
	var AB;
	var B;

	tc = nrhs_zero;
	AB = new Complex128Array( 4 );
	IPIV = new Int32Array( 4 );
	B = new Complex128Array( 4 );
	info = zgbtrs( 'no-transpose', 4, 1, 1, 0, AB, 1, 4, 0, IPIV, 1, 0, B, 1, 1, 0 ); // eslint-disable-line max-len
	assert.strictEqual( info, tc.info );
});

test( 'zgbtrs: 5x5 pentadiagonal (KL=2, KU=2)', function t() {
	var IPIV;
	var info;
	var ABv;
	var tc;
	var AB;
	var Bv;
	var B;

	tc = pentadiag_5x5;
	AB = new Complex128Array( 7 * 5 );
	ABv = reinterpret( AB, 0 );
	IPIV = new Int32Array( 5 );
	B = new Complex128Array( 5 );
	Bv = reinterpret( B, 0 );
	ABv[ 8 ] = 6;
	ABv[ 9 ] = 1;
	ABv[ 10 ] = -2;
	ABv[ 11 ] = 0;
	ABv[ 12 ] = 1;
	ABv[ 13 ] = 0;
	ABv[ 20 ] = -2;
	ABv[ 21 ] = 0;
	ABv[ 22 ] = 6;
	ABv[ 23 ] = 1;
	ABv[ 24 ] = -2;
	ABv[ 25 ] = 0;
	ABv[ 26 ] = 1;
	ABv[ 27 ] = 0;
	ABv[ 32 ] = 1;
	ABv[ 33 ] = 0;
	ABv[ 34 ] = -2;
	ABv[ 35 ] = 0;
	ABv[ 36 ] = 6;
	ABv[ 37 ] = 1;
	ABv[ 38 ] = -2;
	ABv[ 39 ] = 0;
	ABv[ 40 ] = 1;
	ABv[ 41 ] = 0;
	ABv[ 46 ] = 1;
	ABv[ 47 ] = 0;
	ABv[ 48 ] = -2;
	ABv[ 49 ] = 0;
	ABv[ 50 ] = 6;
	ABv[ 51 ] = 1;
	ABv[ 52 ] = -2;
	ABv[ 53 ] = 0;
	ABv[ 60 ] = 1;
	ABv[ 61 ] = 0;
	ABv[ 62 ] = -2;
	ABv[ 63 ] = 0;
	ABv[ 64 ] = 6;
	ABv[ 65 ] = 1;
	info = zgbtrf( 5, 5, 2, 2, AB, 1, 7, 0, IPIV, 1, 0 );
	assert.strictEqual( info, 0 );
	Bv[ 0 ] = 1;
	Bv[ 1 ] = 1;
	Bv[ 2 ] = 2;
	Bv[ 3 ] = 2;
	Bv[ 4 ] = 3;
	Bv[ 5 ] = 3;
	Bv[ 6 ] = 4;
	Bv[ 7 ] = 4;
	Bv[ 8 ] = 5;
	Bv[ 9 ] = 5;
	info = zgbtrs( 'no-transpose', 5, 2, 2, 1, AB, 1, 7, 0, IPIV, 1, 0, B, 1, 1, 0 ); // eslint-disable-line max-len
	assert.strictEqual( info, tc.info );
	assertArrayClose( toArray( Bv ), tc.B, 1e-12, 'B' );
});

test( 'zgbtrs: KL=0 upper triangular', function t() {
	var IPIV;
	var info;
	var ABv;
	var tc;
	var AB;
	var Bv;
	var B;

	tc = kl0_upper;
	AB = new Complex128Array( 2 * 2 );
	ABv = reinterpret( AB, 0 );
	IPIV = new Int32Array( 2 );
	B = new Complex128Array( 2 );
	Bv = reinterpret( B, 0 );
	ABv[ 2 ] = 2;
	ABv[ 3 ] = 1;
	ABv[ 4 ] = 1;
	ABv[ 5 ] = 0;
	ABv[ 6 ] = 3;
	ABv[ 7 ] = 1;
	info = zgbtrf( 2, 2, 0, 1, AB, 1, 2, 0, IPIV, 1, 0 );
	assert.strictEqual( info, 0 );
	Bv[ 0 ] = 5;
	Bv[ 1 ] = 3;
	Bv[ 2 ] = 6;
	Bv[ 3 ] = 4;
	info = zgbtrs( 'no-transpose', 2, 0, 1, 1, AB, 1, 2, 0, IPIV, 1, 0, B, 1, 1, 0 ); // eslint-disable-line max-len
	assert.strictEqual( info, tc.info );
	assertArrayClose( toArray( Bv ), tc.B, 1e-12, 'B' );
});
