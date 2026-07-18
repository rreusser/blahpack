/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dlascl from './../lib/ndarray.js';

// FIXTURES //

import general_basic from './fixtures/general_basic.json' with { type: 'json' };
import general_half from './fixtures/general_half.json' with { type: 'json' };
import m_zero from './fixtures/m_zero.json' with { type: 'json' };
import n_zero from './fixtures/n_zero.json' with { type: 'json' };
import lower_tri from './fixtures/lower_tri.json' with { type: 'json' };
import upper_tri from './fixtures/upper_tri.json' with { type: 'json' };
import hessenberg from './fixtures/hessenberg.json' with { type: 'json' };
import identity from './fixtures/identity.json' with { type: 'json' };
import large_ratio from './fixtures/large_ratio.json' with { type: 'json' };
import large_ratio_inv from './fixtures/large_ratio_inv.json' with { type: 'json' };
import lower_band from './fixtures/lower_band.json' with { type: 'json' };
import upper_band from './fixtures/upper_band.json' with { type: 'json' };
import full_band from './fixtures/full_band.json' with { type: 'json' };
import general_rect from './fixtures/general_rect.json' with { type: 'json' };
import lower_rect from './fixtures/lower_rect.json' with { type: 'json' };
import upper_rect from './fixtures/upper_rect.json' with { type: 'json' };

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
	const relErr = Math.abs( actual - expected ) / Math.max( Math.abs( expected ), 1.0 );
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
* Converts a typed array to a plain array.
*
* @private
* @param {TypedArray} arr - input array
* @returns {Array} output array
*/
function toArray( arr ) {
	const out = [];
	let i;
	for ( i = 0; i < arr.length; i++ ) {
		out.push( arr[ i ] );
	}
	return out;
}

// TESTS //

test( 'dlascl: general_basic - scale 3x2 general matrix by 2', function t() {

	const tc = general_basic;
	const A = new Float64Array( [ 1, 2, 3, 4, 5, 6 ] );
	const info = dlascl( 'general', 0, 0, 1.0, 2.0, 3, 2, A, 1, 3, 0 );
	assert.equal( info, tc.info );
	assertArrayClose( toArray( A ), tc.a, 1e-14, 'a' );
});

test( 'dlascl: general_half - scale by 0.5 (cfrom=2, cto=1)', function t() {

	const tc = general_half;
	const A = new Float64Array( [ 10, 20, 30, 40 ] );
	const info = dlascl( 'general', 0, 0, 2.0, 1.0, 2, 2, A, 1, 2, 0 );
	assert.equal( info, tc.info );
	assertArrayClose( toArray( A ), tc.a, 1e-14, 'a' );
});

test( 'dlascl: m_zero - M=0 quick return', function t() {

	const tc = m_zero;
	const A = new Float64Array( [ 99.0 ] );
	const info = dlascl( 'general', 0, 0, 1.0, 2.0, 0, 2, A, 1, 1, 0 );
	assert.equal( info, tc.info );
	assertArrayClose( toArray( A ), tc.a, 1e-14, 'a' );
});

test( 'dlascl: n_zero - N=0 quick return', function t() {

	const tc = n_zero;
	const A = new Float64Array( [ 99.0 ] );
	const info = dlascl( 'general', 0, 0, 1.0, 2.0, 2, 0, A, 1, 2, 0 );
	assert.equal( info, tc.info );
	assertArrayClose( toArray( A ), tc.a, 1e-14, 'a' );
});

test( 'dlascl: lower_tri - lower triangular 3x3', function t() {

	const tc = lower_tri;
	const A = new Float64Array( [ 1, 2, 3, 0, 4, 5, 0, 0, 6 ] );
	const info = dlascl( 'lower', 0, 0, 1.0, 3.0, 3, 3, A, 1, 3, 0 );
	assert.equal( info, tc.info );
	assertArrayClose( toArray( A ), tc.a, 1e-14, 'a' );
});

test( 'dlascl: upper_tri - upper triangular 3x3', function t() {

	const tc = upper_tri;
	const A = new Float64Array( [ 1, 0, 0, 2, 4, 0, 3, 5, 6 ] );
	const info = dlascl( 'upper', 0, 0, 1.0, 3.0, 3, 3, A, 1, 3, 0 );
	assert.equal( info, tc.info );
	assertArrayClose( toArray( A ), tc.a, 1e-14, 'a' );
});

test( 'dlascl: hessenberg - upper Hessenberg 3x3', function t() {

	const tc = hessenberg;
	const A = new Float64Array( [ 1, 2, 0, 3, 4, 5, 6, 7, 8 ] );
	const info = dlascl( 'upper-hessenberg', 0, 0, 1.0, 2.0, 3, 3, A, 1, 3, 0 );
	assert.equal( info, tc.info );
	assertArrayClose( toArray( A ), tc.a, 1e-14, 'a' );
});

test( 'dlascl: identity - cfrom=cto, MUL=1 quick return', function t() {

	const tc = identity;
	const A = new Float64Array( [ 1, 2, 3, 4 ] );
	const info = dlascl( 'general', 0, 0, 5.0, 5.0, 2, 2, A, 1, 2, 0 );
	assert.equal( info, tc.info );
	assertArrayClose( toArray( A ), tc.a, 1e-14, 'a' );
});

test( 'dlascl: large_ratio - cfrom=1e300, cto=1e-300 (iterative scaling down)', function t() { // eslint-disable-line max-len

	const tc = large_ratio;
	const A = new Float64Array( [ 1.0, 2.0 ] );
	const info = dlascl( 'general', 0, 0, 1e300, 1e-300, 2, 1, A, 1, 2, 0 );
	assert.equal( info, tc.info );
	assertArrayClose( toArray( A ), tc.a, 1e-14, 'a' );
});

test( 'dlascl: large_ratio_inv - cfrom=1e-150, cto=1e150 (iterative scaling up)', function t() { // eslint-disable-line max-len

	const tc = large_ratio_inv;
	const A = new Float64Array( [ 1e-150, 2e-150 ] );
	const info = dlascl( 'general', 0, 0, 1e-150, 1e150, 2, 1, A, 1, 2, 0 );
	assert.equal( info, tc.info );
	assertArrayClose( toArray( A ), tc.a, 1e-14, 'a' );
});

test( 'dlascl: lower_band - type B, kl=ku=1, 4x4', function t() {

	const tc = lower_band;
	const A = new Float64Array([
		1,
		4,   // col 0: diag, sub
		2,
		5,   // col 1: diag, sub
		3,
		6,   // col 2: diag, sub
		7,
		0    // col 3: diag only (k4-j limits)
	]);
	const info = dlascl( 'lower-band', 1, 1, 1.0, 3.0, 4, 4, A, 1, 2, 0 );
	assert.equal( info, tc.info );
	assertArrayClose( toArray( A ), tc.a, 1e-14, 'a' );
});

test( 'dlascl: upper_band - type Q, kl=ku=1, 4x4', function t() {

	const tc = upper_band;
	const A = new Float64Array([
		0,
		4,   // col 0: unused super, diag
		1,
		5,   // col 1: super, diag
		2,
		6,   // col 2: super, diag
		3,
		7    // col 3: super, diag
	]);
	const info = dlascl( 'upper-band', 1, 1, 1.0, 3.0, 4, 4, A, 1, 2, 0 );
	assert.equal( info, tc.info );
	assertArrayClose( toArray( A ), tc.a, 1e-14, 'a' );
});

test( 'dlascl: full_band - type Z, kl=1, ku=1, 3x3', function t() {

	const tc = full_band;
	const A = new Float64Array([
		0,
		3,
		6,
		9,     // col 0
		1,
		4,
		7,
		10,    // col 1
		2,
		5,
		8,
		0      // col 2
	]);
	const info = dlascl( 'band', 1, 1, 1.0, 2.0, 3, 3, A, 1, 4, 0 );
	assert.equal( info, tc.info );
	assertArrayClose( toArray( A ), tc.a, 1e-14, 'a' );
});

test( 'dlascl: general_rect - non-square 2x4 general matrix', function t() {

	const tc = general_rect;
	const A = new Float64Array( [ 1, 2, 3, 4, 5, 6, 7, 8 ] );
	const info = dlascl( 'general', 0, 0, 1.0, 10.0, 2, 4, A, 1, 2, 0 );
	assert.equal( info, tc.info );
	assertArrayClose( toArray( A ), tc.a, 1e-14, 'a' );
});

test( 'dlascl: lower_rect - lower triangular 4x3', function t() {

	const tc = lower_rect;
	const A = new Float64Array([
		1,
		2,
		3,
		4,   // col 0
		0,
		5,
		6,
		7,   // col 1
		0,
		0,
		8,
		9    // col 2
	]);
	const info = dlascl( 'lower', 0, 0, 1.0, 2.0, 4, 3, A, 1, 4, 0 );
	assert.equal( info, tc.info );
	assertArrayClose( toArray( A ), tc.a, 1e-14, 'a' );
});

test( 'dlascl: upper_rect - upper triangular 3x4', function t() {

	const tc = upper_rect;
	const A = new Float64Array([
		1,
		0,
		0,   // col 0
		2,
		3,
		0,   // col 1
		4,
		5,
		6,   // col 2
		7,
		8,
		9    // col 3
	]);
	const info = dlascl( 'upper', 0, 0, 1.0, 2.0, 3, 4, A, 1, 3, 0 );
	assert.equal( info, tc.info );
	assertArrayClose( toArray( A ), tc.a, 1e-14, 'a' );
});

test( 'dlascl: invalid type throws TypeError', function t() {
	const A = new Float64Array( [ 1, 2, 3, 4 ] );
	assert.throws( function badCall() {
		dlascl( 'X', 0, 0, 1.0, 2.0, 2, 2, A, 1, 2, 0 );
	}, TypeError );
});

test( 'dlascl: offset support - general matrix with offset', function t() {

	const A = new Float64Array( [ 0, 0, 0, 1, 2, 3, 4 ] );
	const info = dlascl( 'general', 0, 0, 1.0, 5.0, 2, 2, A, 1, 2, 3 );
	assert.equal( info, 0 );
	assert.equal( A[ 0 ], 0 );
	assert.equal( A[ 1 ], 0 );
	assert.equal( A[ 2 ], 0 );
	assert.equal( A[ 3 ], 5 );
	assert.equal( A[ 4 ], 10 );
	assert.equal( A[ 5 ], 15 );
	assert.equal( A[ 6 ], 20 );
});

test( 'dlascl: case-insensitive type', function t() {

	const A = new Float64Array( [ 1, 2, 3, 4 ] );
	const info = dlascl( 'general', 0, 0, 1.0, 2.0, 2, 2, A, 1, 2, 0 );
	assert.equal( info, 0 );
	assert.equal( A[ 0 ], 2 );
	assert.equal( A[ 1 ], 4 );
	assert.equal( A[ 2 ], 6 );
	assert.equal( A[ 3 ], 8 );
});

test( 'dlascl: cfrom=Infinity triggers single-pass scaling', function t() {

	const A = new Float64Array( [ 5, 10 ] );
	const info = dlascl( 'general', 0, 0, Infinity, 1.0, 2, 1, A, 1, 2, 0 );
	assert.equal( info, 0 );
	assert.equal( A[ 0 ], 0 );
	assert.equal( A[ 1 ], 0 );
});

test( 'dlascl: very large upward ratio triggers mul=bignum branch', function t() { // eslint-disable-line max-len

	const A = new Float64Array( [ 1e-300 ] );
	const info = dlascl( 'general', 0, 0, 1e-300, 1e300, 1, 1, A, 1, 1, 0 );
	assert.equal( info, 0 );
	assertClose( A[ 0 ], 1e300, 1e-14, 'scaled value' );
});

test( 'dlascl: cto=0 zeroes the matrix', function t() {

	const A = new Float64Array( [ 5, 10, 15, 20 ] );
	const info = dlascl( 'general', 0, 0, 1.0, 0.0, 2, 2, A, 1, 2, 0 );
	assert.equal( info, 0 );
	assert.equal( A[ 0 ], 0 );
	assert.equal( A[ 1 ], 0 );
	assert.equal( A[ 2 ], 0 );
	assert.equal( A[ 3 ], 0 );
});
