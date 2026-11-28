/* eslint-disable no-restricted-syntax */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import dgttrf from './../../dgttrf/lib/base.js';
import dgttrs from './../../dgttrs/lib/base.js';
import dgtrfs from './../lib/strided.js';

// FIXTURES //

import basic_notrans from './fixtures/basic_notrans.json' with { type: 'json' };
import basic_trans from './fixtures/basic_trans.json' with { type: 'json' };
import multi_rhs_notrans from './fixtures/multi_rhs_notrans.json' with { type: 'json' };
import n_one from './fixtures/n_one.json' with { type: 'json' };
import n_zero from './fixtures/n_zero.json' with { type: 'json' };
import pivot_5x5_notrans from './fixtures/pivot_5x5_notrans.json' with { type: 'json' };

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
* ToF64.
*
* @private
* @param {TypedArray} arr - input array
* @returns {*} result
*/
function toF64( arr ) {
	return new Float64Array( arr );
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

test( 'dgtrfs: basic_notrans', function t() {

	const tc = basic_notrans;
	const N = 4;
	const dl = toF64( [ 3.0, 1.0, 2.0 ] );
	const d = toF64( [ 2.0, 4.0, 5.0, 6.0 ] );
	const du = toF64( [ -1.0, -2.0, -3.0 ] );
	const dlf = toF64( [ 3.0, 1.0, 2.0 ] );
	const df = toF64( [ 2.0, 4.0, 5.0, 6.0 ] );
	const duf = toF64( [ -1.0, -2.0, -3.0 ] );
	const du2 = new Float64Array( 2 );
	const ipiv = new Int32Array( 4 );
	dgttrf( N, dlf, 1, 0, df, 1, 0, duf, 1, 0, du2, 1, 0, ipiv, 1, 0 );
	const b = new Float64Array( N );
	b[ 0 ] = 0.0;
	b[ 1 ] = 5.0;
	b[ 2 ] = 5.0;
	b[ 3 ] = 30.0;
	const x = new Float64Array( N );
	x[ 0 ] = b[ 0 ];
	x[ 1 ] = b[ 1 ];
	x[ 2 ] = b[ 2 ];
	x[ 3 ] = b[ 3 ];
	dgttrs( 'no-transpose', N, 1, dlf, 1, 0, df, 1, 0, duf, 1, 0, du2, 1, 0, ipiv, 1, 0, x, 1, N, 0 ); // eslint-disable-line max-len
	const ferr = new Float64Array( 1 );
	const berr = new Float64Array( 1 );
	const work = new Float64Array( 3 * N );
	const iwork = new Int32Array( N );
	const info = dgtrfs( 'no-transpose', N, 1, dl, 1, 0, d, 1, 0, du, 1, 0, dlf, 1, 0, df, 1, 0, duf, 1, 0, du2, 1, 0, ipiv, 1, 0, b, 1, N, 0, x, 1, N, 0, ferr, 1, 0, berr, 1, 0, work, 1, 0, iwork, 1, 0 );
	assert.equal( info, tc.info );
	assertArrayClose( toArray( x ), tc.x, 1e-14, 'x' );
});

test( 'dgtrfs: basic_trans', function t() {

	const tc = basic_trans;
	const N = 4;
	const dl = toF64( [ 3.0, 1.0, 2.0 ] );
	const d = toF64( [ 2.0, 4.0, 5.0, 6.0 ] );
	const du = toF64( [ -1.0, -2.0, -3.0 ] );
	const dlf = toF64( [ 3.0, 1.0, 2.0 ] );
	const df = toF64( [ 2.0, 4.0, 5.0, 6.0 ] );
	const duf = toF64( [ -1.0, -2.0, -3.0 ] );
	const du2 = new Float64Array( 2 );
	const ipiv = new Int32Array( 4 );
	dgttrf( N, dlf, 1, 0, df, 1, 0, duf, 1, 0, du2, 1, 0, ipiv, 1, 0 );
	const b = toF64( [ 8.0, 10.0, 19.0, 15.0 ] );
	const x = toF64( [ 8.0, 10.0, 19.0, 15.0 ] );
	dgttrs( 'transpose', N, 1, dlf, 1, 0, df, 1, 0, duf, 1, 0, du2, 1, 0, ipiv, 1, 0, x, 1, N, 0 ); // eslint-disable-line max-len
	const ferr = new Float64Array( 1 );
	const berr = new Float64Array( 1 );
	const work = new Float64Array( 3 * N );
	const iwork = new Int32Array( N );
	const info = dgtrfs( 'transpose', N, 1, dl, 1, 0, d, 1, 0, du, 1, 0, dlf, 1, 0, df, 1, 0, duf, 1, 0, du2, 1, 0, ipiv, 1, 0, b, 1, N, 0, x, 1, N, 0, ferr, 1, 0, berr, 1, 0, work, 1, 0, iwork, 1, 0 );
	assert.equal( info, tc.info );
	assertArrayClose( toArray( x ), tc.x, 1e-14, 'x' );
});

test( 'dgtrfs: multi_rhs_notrans', function t() {

	const tc = multi_rhs_notrans;
	const N = 4;
	const nrhs = 2;
	const dl = toF64( [ 3.0, 1.0, 2.0 ] );
	const d = toF64( [ 2.0, 4.0, 5.0, 6.0 ] );
	const du = toF64( [ -1.0, -2.0, -3.0 ] );
	const dlf = toF64( [ 3.0, 1.0, 2.0 ] );
	const df = toF64( [ 2.0, 4.0, 5.0, 6.0 ] );
	const duf = toF64( [ -1.0, -2.0, -3.0 ] );
	const du2 = new Float64Array( 2 );
	const ipiv = new Int32Array( 4 );
	dgttrf( N, dlf, 1, 0, df, 1, 0, duf, 1, 0, du2, 1, 0, ipiv, 1, 0 );
	const b = toF64( [ 0.0, 5.0, 5.0, 30.0, 4.0, 4.0, -4.0, 20.0 ] );
	const x = toF64( [ 0.0, 5.0, 5.0, 30.0, 4.0, 4.0, -4.0, 20.0 ] );
	dgttrs( 'no-transpose', N, nrhs, dlf, 1, 0, df, 1, 0, duf, 1, 0, du2, 1, 0, ipiv, 1, 0, x, 1, N, 0 ); // eslint-disable-line max-len
	const ferr = new Float64Array( 2 );
	const berr = new Float64Array( 2 );
	const work = new Float64Array( 3 * N );
	const iwork = new Int32Array( N );
	const info = dgtrfs( 'no-transpose', N, nrhs, dl, 1, 0, d, 1, 0, du, 1, 0, dlf, 1, 0, df, 1, 0, duf, 1, 0, du2, 1, 0, ipiv, 1, 0, b, 1, N, 0, x, 1, N, 0, ferr, 1, 0, berr, 1, 0, work, 1, 0, iwork, 1, 0 );
	assert.equal( info, tc.info );
	assertArrayClose( toArray( x.subarray( 0, 4 ) ), tc.x1, 1e-14, 'x1' );
	assertArrayClose( toArray( x.subarray( 4, 8 ) ), tc.x2, 1e-14, 'x2' );
});

test( 'dgtrfs: n_one', function t() {

	const tc = n_one;
	const dl = new Float64Array( 0 );
	const d = toF64( [ 5.0 ] );
	const du = new Float64Array( 0 );
	const dlf = new Float64Array( 0 );
	const df = toF64( [ 5.0 ] );
	const duf = new Float64Array( 0 );
	const du2 = new Float64Array( 0 );
	const ipiv = new Int32Array( [ 0 ] );
	const b = toF64( [ 10.0 ] );
	const x = toF64( [ 2.0 ] );
	const ferr = new Float64Array( 1 );
	const berr = new Float64Array( 1 );
	const work = new Float64Array( 3 );
	const iwork = new Int32Array( 1 );
	const info = dgtrfs( 'no-transpose', 1, 1, dl, 1, 0, d, 1, 0, du, 1, 0, dlf, 1, 0, df, 1, 0, duf, 1, 0, du2, 1, 0, ipiv, 1, 0, b, 1, 1, 0, x, 1, 1, 0, ferr, 1, 0, berr, 1, 0, work, 1, 0, iwork, 1, 0 );
	assert.equal( info, tc.info );
	assertArrayClose( toArray( x ), tc.x, 1e-14, 'x' );
});

test( 'dgtrfs: n_zero', function t() {

	const tc = n_zero;
	const ferr = new Float64Array( 1 );
	const berr = new Float64Array( 1 );
	const work = new Float64Array( 1 );
	const iwork = new Int32Array( 1 );
	const dl = new Float64Array( 0 );
	const d = new Float64Array( 0 );
	const du = new Float64Array( 0 );
	const dlf = new Float64Array( 0 );
	const df = new Float64Array( 0 );
	const duf = new Float64Array( 0 );
	const du2 = new Float64Array( 0 );
	const ipiv = new Int32Array( 0 );
	const b = new Float64Array( 0 );
	const x = new Float64Array( 0 );
	const info = dgtrfs( 'no-transpose', 0, 1, dl, 1, 0, d, 1, 0, du, 1, 0, dlf, 1, 0, df, 1, 0, duf, 1, 0, du2, 1, 0, ipiv, 1, 0, b, 1, 0, 0, x, 1, 0, 0, ferr, 1, 0, berr, 1, 0, work, 1, 0, iwork, 1, 0 );
	assert.equal( info, tc.info );
});

test( 'dgtrfs: pivot_5x5_notrans', function t() {

	const tc = pivot_5x5_notrans;
	const N = 5;
	const dl = toF64( [ 5.0, 7.0, 9.0, 2.0 ] );
	const d = toF64( [ 1.0, 3.0, 2.0, 1.0, 8.0 ] );
	const du = toF64( [ 2.0, 4.0, 6.0, 3.0 ] );
	const dlf = toF64( [ 5.0, 7.0, 9.0, 2.0 ] );
	const df = toF64( [ 1.0, 3.0, 2.0, 1.0, 8.0 ] );
	const duf = toF64( [ 2.0, 4.0, 6.0, 3.0 ] );
	const du2 = new Float64Array( 3 );
	const ipiv = new Int32Array( 5 );
	dgttrf( N, dlf, 1, 0, df, 1, 0, duf, 1, 0, du2, 1, 0, ipiv, 1, 0 );
	const b = toF64( [ 3.0, 12.0, 15.0, 13.0, 10.0 ] );
	const x = toF64( [ 3.0, 12.0, 15.0, 13.0, 10.0 ] );
	dgttrs( 'no-transpose', N, 1, dlf, 1, 0, df, 1, 0, duf, 1, 0, du2, 1, 0, ipiv, 1, 0, x, 1, N, 0 ); // eslint-disable-line max-len
	const ferr = new Float64Array( 1 );
	const berr = new Float64Array( 1 );
	const work = new Float64Array( 3 * N );
	const iwork = new Int32Array( N );
	const info = dgtrfs( 'no-transpose', N, 1, dl, 1, 0, d, 1, 0, du, 1, 0, dlf, 1, 0, df, 1, 0, duf, 1, 0, du2, 1, 0, ipiv, 1, 0, b, 1, N, 0, x, 1, N, 0, ferr, 1, 0, berr, 1, 0, work, 1, 0, iwork, 1, 0 );
	assert.equal( info, tc.info );
	assertArrayClose( toArray( x ), tc.x, 1e-14, 'x' );
});

test( 'dgtrfs: FERR is a positive, small bound for an exact solution', function t() {
	var iwork;
	var ferr;
	var berr;
	var work;
	var info;
	var ipiv;
	var dlf;
	var duf;
	var du2;
	var df;
	var dl;
	var du;
	var d;
	var b;
	var x;
	var N;

	// A = tridiag(1, 4, 1), exact solution x = [1, 2, 3, 4], b = A*x:
	N = 4;
	dl = toF64( [ 1.0, 1.0, 1.0 ] );
	d = toF64( [ 4.0, 4.0, 4.0, 4.0 ] );
	du = toF64( [ 1.0, 1.0, 1.0 ] );
	dlf = toF64( [ 1.0, 1.0, 1.0 ] );
	df = toF64( [ 4.0, 4.0, 4.0, 4.0 ] );
	duf = toF64( [ 1.0, 1.0, 1.0 ] );
	du2 = new Float64Array( 2 );
	ipiv = new Int32Array( N );
	dgttrf( N, dlf, 1, 0, df, 1, 0, duf, 1, 0, du2, 1, 0, ipiv, 1, 0 );
	b = toF64( [ 6.0, 12.0, 18.0, 19.0 ] );
	x = toF64( [ 1.0, 2.0, 3.0, 4.0 ] );
	ferr = new Float64Array( 1 );
	berr = new Float64Array( 1 );
	work = new Float64Array( 3 * N );
	iwork = new Int32Array( N );
	info = dgtrfs( 'no-transpose', N, 1, dl, 1, 0, d, 1, 0, du, 1, 0, dlf, 1, 0, df, 1, 0, duf, 1, 0, du2, 1, 0, ipiv, 1, 0, b, 1, N, 0, x, 1, N, 0, ferr, 1, 0, berr, 1, 0, work, 1, 0, iwork, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, 0 );
	assert.deepEqual( toArray( x ), [ 1.0, 2.0, 3.0, 4.0 ] );
	assert.equal( berr[ 0 ], 0.0 );

	// FERR is estimated from the rounding-error term nz*eps*(|A||x|+|b|) > 0:
	assert.ok( ferr[ 0 ] > 0.0, 'ferr should be positive, got ' + ferr[ 0 ] );
	assert.ok( ferr[ 0 ] < 1e-13, 'ferr should be small, got ' + ferr[ 0 ] );
});
