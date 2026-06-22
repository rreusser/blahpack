/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import zgtsvx from './../lib/ndarray.js';

// FIXTURES //

import fact_n_trans_n from './fixtures/fact_n_trans_n.json' with { type: 'json' };
import fact_f_trans_n from './fixtures/fact_f_trans_n.json' with { type: 'json' };
import fact_n_trans_t from './fixtures/fact_n_trans_t.json' with { type: 'json' };
import fact_n_trans_c from './fixtures/fact_n_trans_c.json' with { type: 'json' };
import multi_rhs from './fixtures/multi_rhs.json' with { type: 'json' };
import n_one from './fixtures/n_one.json' with { type: 'json' };
import singular from './fixtures/singular.json' with { type: 'json' };
import pivot_5x5 from './fixtures/pivot_5x5.json' with { type: 'json' };

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
* Creates a Complex128Array from an interleaved Float64 array.
*
* @private
* @param {Array} arr - interleaved real/imag values
* @returns {Complex128Array} complex array
*/
function c128( arr ) {
	return new Complex128Array( new Float64Array( arr ) );
}

/**
* Returns Float64 view of a Complex128Array.
*
* @private
* @param {Complex128Array} z - complex array
* @returns {Float64Array} interleaved Float64 view
*/
function f64view( z ) {
	return reinterpret( z, 0 );
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

test( 'zgtsvx: fact_n_trans_n', function t() {
	var rcond;
	var rwork;
	var work;
	var ipiv;
	var ferr;
	var berr;
	var info;
	var dlf;
	var duf;
	var du2;
	var tc;
	var dl;
	var du;
	var df;
	var xv;
	var b;
	var d;
	var x;

	tc = fact_n_trans_n;
	dl = c128( [ 3, 1, 1, 2, 2, -1 ] );
	d = c128( [ 2, 0.5, 4, 1, 5, -0.5, 6, 2 ] );
	du = c128( [ -1, 1, -2, 0.5, -3, -1 ] );
	dlf = new Complex128Array( 3 );
	df = new Complex128Array( 4 );
	duf = new Complex128Array( 3 );
	du2 = new Complex128Array( 2 );
	ipiv = new Int32Array( 4 );
	b = c128( [ 1, 1.5, 5, 2.5, 3, 0.5, 8, 1 ] );
	x = new Complex128Array( 4 );
	rcond = new Float64Array( 1 );
	ferr = new Float64Array( 1 );
	berr = new Float64Array( 1 );
	work = new Complex128Array( 8 );
	rwork = new Float64Array( 4 );
	info = zgtsvx( 'not-factored', 'no-transpose', 4, 1, dl, 1, 0, d, 1, 0, du, 1, 0, dlf, 1, 0, df, 1, 0, duf, 1, 0, du2, 1, 0, ipiv, 1, 0, b, 1, 4, 0, x, 1, 4, 0, rcond, ferr, 1, 0, berr, 1, 0, work, 1, 0, rwork, 1, 0);
	assert.equal( info, tc.info );
	assertClose( rcond[ 0 ], tc.rcond, 1e-10, 'rcond' );
	xv = toArray( f64view( x ) );
	assertArrayClose( xv, tc.x, 1e-10, 'x' );
	assertArrayClose( toArray( ferr ), tc.ferr, 1e-6, 'ferr' );
	assertArrayClose( toArray( berr ), tc.berr, 1e-6, 'berr' );
	assertArrayClose( toArray( f64view( dlf ) ), tc.dlf, 1e-10, 'dlf' );
	assertArrayClose( toArray( f64view( df ) ), tc.df, 1e-10, 'df' );
	assertArrayClose( toArray( f64view( duf ) ), tc.duf, 1e-10, 'duf' );
	assertArrayClose( toArray( f64view( du2 ) ), tc.du2, 1e-10, 'du2' );
	assertArrayClose( toArray( ipiv ), tc.ipiv.map( function sub( v ) {
		return v - 1;
	} ), 0, 'ipiv' );
});

test( 'zgtsvx: fact_f_trans_n', function t() {
	var rcond;
	var rwork;
	var work;
	var ipiv;
	var ferr;
	var berr;
	var info;
	var dlf;
	var duf;
	var du2;
	var tc1;
	var tc;
	var dl;
	var du;
	var df;
	var xv;
	var b;
	var d;
	var x;

	tc1 = fact_n_trans_n;
	tc = fact_f_trans_n;
	dl = c128( [ 3, 1, 1, 2, 2, -1 ] );
	d = c128( [ 2, 0.5, 4, 1, 5, -0.5, 6, 2 ] );
	du = c128( [ -1, 1, -2, 0.5, -3, -1 ] );
	dlf = c128( tc1.dlf );
	df = c128( tc1.df );
	duf = c128( tc1.duf );
	du2 = c128( tc1.du2 );
	ipiv = new Int32Array( tc1.ipiv.map( function sub( v ) {
		return v - 1;
	} ) );
	b = c128( [ 1, 1.5, 5, 2.5, 3, 0.5, 8, 1 ] );
	x = new Complex128Array( 4 );
	rcond = new Float64Array( 1 );
	ferr = new Float64Array( 1 );
	berr = new Float64Array( 1 );
	work = new Complex128Array( 8 );
	rwork = new Float64Array( 4 );
	info = zgtsvx( 'factored', 'no-transpose', 4, 1, dl, 1, 0, d, 1, 0, du, 1, 0, dlf, 1, 0, df, 1, 0, duf, 1, 0, du2, 1, 0, ipiv, 1, 0, b, 1, 4, 0, x, 1, 4, 0, rcond, ferr, 1, 0, berr, 1, 0, work, 1, 0, rwork, 1, 0);
	assert.equal( info, tc.info );
	assertClose( rcond[ 0 ], tc.rcond, 1e-10, 'rcond' );
	xv = toArray( f64view( x ) );
	assertArrayClose( xv, tc.x, 1e-10, 'x' );
	assertArrayClose( toArray( ferr ), tc.ferr, 1e-6, 'ferr' );
	assertArrayClose( toArray( berr ), tc.berr, 1e-6, 'berr' );
});

test( 'zgtsvx: fact_n_trans_t', function t() {
	var rcond;
	var rwork;
	var work;
	var ipiv;
	var ferr;
	var berr;
	var info;
	var dlf;
	var duf;
	var du2;
	var tc;
	var dl;
	var du;
	var df;
	var xv;
	var b;
	var d;
	var x;

	tc = fact_n_trans_t;
	dl = c128( [ 3, 1, 1, 2, 2, -1 ] );
	d = c128( [ 2, 0.5, 4, 1, 5, -0.5, 6, 2 ] );
	du = c128( [ -1, 1, -2, 0.5, -3, -1 ] );
	dlf = new Complex128Array( 3 );
	df = new Complex128Array( 4 );
	duf = new Complex128Array( 3 );
	du2 = new Complex128Array( 2 );
	ipiv = new Int32Array( 4 );
	b = c128( [ 5, 1.5, 4, 4, 5, -1, 3, 1 ] );
	x = new Complex128Array( 4 );
	rcond = new Float64Array( 1 );
	ferr = new Float64Array( 1 );
	berr = new Float64Array( 1 );
	work = new Complex128Array( 8 );
	rwork = new Float64Array( 4 );
	info = zgtsvx( 'not-factored', 'transpose', 4, 1, dl, 1, 0, d, 1, 0, du, 1, 0, dlf, 1, 0, df, 1, 0, duf, 1, 0, du2, 1, 0, ipiv, 1, 0, b, 1, 4, 0, x, 1, 4, 0, rcond, ferr, 1, 0, berr, 1, 0, work, 1, 0, rwork, 1, 0);
	assert.equal( info, tc.info );
	assertClose( rcond[ 0 ], tc.rcond, 1e-10, 'rcond' );
	xv = toArray( f64view( x ) );
	assertArrayClose( xv, tc.x, 1e-10, 'x' );
	assertArrayClose( toArray( ferr ), tc.ferr, 1e-6, 'ferr' );
	assertArrayClose( toArray( berr ), tc.berr, 1e-6, 'berr' );
});

test( 'zgtsvx: fact_n_trans_c', function t() {
	var rcond;
	var rwork;
	var work;
	var ipiv;
	var ferr;
	var berr;
	var info;
	var dlf;
	var duf;
	var du2;
	var tc;
	var dl;
	var du;
	var df;
	var xv;
	var b;
	var d;
	var x;

	tc = fact_n_trans_c;
	dl = c128( [ 3, 1, 1, 2, 2, -1 ] );
	d = c128( [ 2, 0.5, 4, 1, 5, -0.5, 6, 2 ] );
	du = c128( [ -1, 1, -2, 0.5, -3, -1 ] );
	dlf = new Complex128Array( 3 );
	df = new Complex128Array( 4 );
	duf = new Complex128Array( 3 );
	du2 = new Complex128Array( 2 );
	ipiv = new Int32Array( 4 );
	b = c128( [ 5, -1.5, 4, -4, 5, 1, 3, -1 ] );
	x = new Complex128Array( 4 );
	rcond = new Float64Array( 1 );
	ferr = new Float64Array( 1 );
	berr = new Float64Array( 1 );
	work = new Complex128Array( 8 );
	rwork = new Float64Array( 4 );
	info = zgtsvx( 'not-factored', 'conjugate-transpose', 4, 1, dl, 1, 0, d, 1, 0, du, 1, 0, dlf, 1, 0, df, 1, 0, duf, 1, 0, du2, 1, 0, ipiv, 1, 0, b, 1, 4, 0, x, 1, 4, 0, rcond, ferr, 1, 0, berr, 1, 0, work, 1, 0, rwork, 1, 0);
	assert.equal( info, tc.info );
	assertClose( rcond[ 0 ], tc.rcond, 1e-10, 'rcond' );
	xv = toArray( f64view( x ) );
	assertArrayClose( xv, tc.x, 1e-10, 'x' );
	assertArrayClose( toArray( ferr ), tc.ferr, 1e-6, 'ferr' );
	assertArrayClose( toArray( berr ), tc.berr, 1e-6, 'berr' );
});

test( 'zgtsvx: multi_rhs', function t() {
	var rcond;
	var rwork;
	var work;
	var ipiv;
	var ferr;
	var berr;
	var info;
	var dlf;
	var duf;
	var du2;
	var tc;
	var dl;
	var du;
	var df;
	var xv;
	var bv;
	var b;
	var d;
	var x;

	tc = multi_rhs;
	dl = c128( [ 3, 1, 1, 2, 2, -1 ] );
	d = c128( [ 2, 0.5, 4, 1, 5, -0.5, 6, 2 ] );
	du = c128( [ -1, 1, -2, 0.5, -3, -1 ] );
	dlf = new Complex128Array( 3 );
	df = new Complex128Array( 4 );
	duf = new Complex128Array( 3 );
	du2 = new Complex128Array( 2 );
	ipiv = new Int32Array( 4 );
	b = new Complex128Array( 8 );
	bv = f64view( b );
	bv[ 0 ] = 1;
	bv[ 1 ] = 1.5;
	bv[ 2 ] = 5;
	bv[ 3 ] = 2.5;
	bv[ 4 ] = 3;
	bv[ 5 ] = 0.5;
	bv[ 6 ] = 8;
	bv[ 7 ] = 1;
	bv[ 8 ] = 1.5;
	bv[ 9 ] = 7;
	bv[ 10 ] = 15.75;
	bv[ 11 ] = 3.5;
	bv[ 12 ] = -3.75;
	bv[ 13 ] = 9;
	bv[ 14 ] = 30.5;
	bv[ 15 ] = -4;
	x = new Complex128Array( 8 );
	rcond = new Float64Array( 1 );
	ferr = new Float64Array( 2 );
	berr = new Float64Array( 2 );
	work = new Complex128Array( 8 );
	rwork = new Float64Array( 4 );
	info = zgtsvx( 'not-factored', 'no-transpose', 4, 2, dl, 1, 0, d, 1, 0, du, 1, 0, dlf, 1, 0, df, 1, 0, duf, 1, 0, du2, 1, 0, ipiv, 1, 0, b, 1, 4, 0, x, 1, 4, 0, rcond, ferr, 1, 0, berr, 1, 0, work, 1, 0, rwork, 1, 0);
	assert.equal( info, tc.info );
	assertClose( rcond[ 0 ], tc.rcond, 1e-10, 'rcond' );
	xv = toArray( f64view( x ) );
	assertArrayClose( xv.slice( 0, 8 ), tc.x1, 1e-10, 'x1' );
	assertArrayClose( xv.slice( 8, 16 ), tc.x2, 1e-10, 'x2' );
	assertArrayClose( toArray( ferr ), tc.ferr, 1e-6, 'ferr' );
	assertArrayClose( toArray( berr ), tc.berr, 1e-6, 'berr' );
});

test( 'zgtsvx: n_one', function t() {
	var rcond;
	var rwork;
	var work;
	var ipiv;
	var ferr;
	var berr;
	var info;
	var dlf;
	var duf;
	var du2;
	var tc;
	var dl;
	var du;
	var df;
	var xv;
	var b;
	var d;
	var x;

	tc = n_one;
	dl = new Complex128Array( 1 );
	d = c128( [ 5, 1 ] );
	du = new Complex128Array( 1 );
	dlf = new Complex128Array( 1 );
	df = new Complex128Array( 1 );
	duf = new Complex128Array( 1 );
	du2 = new Complex128Array( 1 );
	ipiv = new Int32Array( 1 );
	b = c128( [ 10, 2 ] );
	x = new Complex128Array( 1 );
	rcond = new Float64Array( 1 );
	ferr = new Float64Array( 1 );
	berr = new Float64Array( 1 );
	work = new Complex128Array( 4 );
	rwork = new Float64Array( 2 );
	info = zgtsvx( 'not-factored', 'no-transpose', 1, 1, dl, 1, 0, d, 1, 0, du, 1, 0, dlf, 1, 0, df, 1, 0, duf, 1, 0, du2, 1, 0, ipiv, 1, 0, b, 1, 1, 0, x, 1, 1, 0, rcond, ferr, 1, 0, berr, 1, 0, work, 1, 0, rwork, 1, 0);
	assert.equal( info, tc.info );
	assertClose( rcond[ 0 ], tc.rcond, 1e-10, 'rcond' );
	xv = toArray( f64view( x ) );
	assertArrayClose( xv, tc.x, 1e-10, 'x' );
	assertArrayClose( toArray( ferr ), tc.ferr, 1e-6, 'ferr' );
	assertArrayClose( toArray( berr ), tc.berr, 1e-6, 'berr' );
});

test( 'zgtsvx: n_zero', function t() {
	var rcond;
	var rwork;
	var work;
	var ipiv;
	var ferr;
	var berr;
	var info;
	var dlf;
	var duf;
	var du2;
	var dl;
	var du;
	var df;
	var b;
	var d;
	var x;

	dl = new Complex128Array( 1 );
	d = new Complex128Array( 1 );
	du = new Complex128Array( 1 );
	dlf = new Complex128Array( 1 );
	df = new Complex128Array( 1 );
	duf = new Complex128Array( 1 );
	du2 = new Complex128Array( 1 );
	ipiv = new Int32Array( 1 );
	b = new Complex128Array( 1 );
	x = new Complex128Array( 1 );
	rcond = new Float64Array( 1 );
	ferr = new Float64Array( 1 );
	berr = new Float64Array( 1 );
	work = new Complex128Array( 2 );
	rwork = new Float64Array( 1 );
	info = zgtsvx( 'not-factored', 'no-transpose', 0, 1, dl, 1, 0, d, 1, 0, du, 1, 0, dlf, 1, 0, df, 1, 0, duf, 1, 0, du2, 1, 0, ipiv, 1, 0, b, 1, 1, 0, x, 1, 1, 0, rcond, ferr, 1, 0, berr, 1, 0, work, 1, 0, rwork, 1, 0);
	assert.equal( info, 0 );
});

test( 'zgtsvx: singular', function t() {
	var rcond;
	var rwork;
	var work;
	var ipiv;
	var ferr;
	var berr;
	var info;
	var dlf;
	var duf;
	var du2;
	var tc;
	var dl;
	var du;
	var df;
	var b;
	var d;
	var x;

	tc = singular;
	dl = c128( [ 0, 0, 0, 0 ] );
	d = c128( [ 0, 0, 2, 1, 3, 0 ] );
	du = c128( [ 1, 0, 1, 0.5 ] );
	dlf = new Complex128Array( 2 );
	df = new Complex128Array( 3 );
	duf = new Complex128Array( 2 );
	du2 = new Complex128Array( 1 );
	ipiv = new Int32Array( 3 );
	b = c128( [ 1, 0, 2, 1, 3, 0 ] );
	x = new Complex128Array( 3 );
	rcond = new Float64Array( 1 );
	ferr = new Float64Array( 1 );
	berr = new Float64Array( 1 );
	work = new Complex128Array( 6 );
	rwork = new Float64Array( 3 );
	info = zgtsvx( 'not-factored', 'no-transpose', 3, 1, dl, 1, 0, d, 1, 0, du, 1, 0, dlf, 1, 0, df, 1, 0, duf, 1, 0, du2, 1, 0, ipiv, 1, 0, b, 1, 3, 0, x, 1, 3, 0, rcond, ferr, 1, 0, berr, 1, 0, work, 1, 0, rwork, 1, 0);
	assert.equal( info, tc.info );
	assert.equal( rcond[ 0 ], tc.rcond );
});

test( 'zgtsvx: pivot_5x5', function t() {
	var rcond;
	var rwork;
	var work;
	var ipiv;
	var ferr;
	var berr;
	var info;
	var dlf;
	var duf;
	var du2;
	var tc;
	var dl;
	var du;
	var df;
	var xv;
	var bv;
	var b;
	var d;
	var x;

	tc = pivot_5x5;
	dl = c128( [ 5, 1, 7, -1, 9, 2, 2, 0.5 ] );
	d = c128( [ 1, 0, 3, 1, 2, -1, 1, 0.5, 8, 0 ] );
	du = c128( [ 2, -0.5, 4, 1, 6, 0, 3, -1 ] );
	dlf = new Complex128Array( 4 );
	df = new Complex128Array( 5 );
	duf = new Complex128Array( 4 );
	du2 = new Complex128Array( 3 );
	ipiv = new Int32Array( 5 );
	b = new Complex128Array( 5 );
	bv = f64view( b );
	bv[ 0 ] = 3;
	bv[ 1 ] = -0.5;
	bv[ 2 ] = 12;
	bv[ 3 ] = 3;
	bv[ 4 ] = 15;
	bv[ 5 ] = -2;
	bv[ 6 ] = 13;
	bv[ 7 ] = 1.5;
	bv[ 8 ] = 10;
	bv[ 9 ] = 0.5;
	x = new Complex128Array( 5 );
	rcond = new Float64Array( 1 );
	ferr = new Float64Array( 1 );
	berr = new Float64Array( 1 );
	work = new Complex128Array( 10 );
	rwork = new Float64Array( 5 );
	info = zgtsvx( 'not-factored', 'no-transpose', 5, 1, dl, 1, 0, d, 1, 0, du, 1, 0, dlf, 1, 0, df, 1, 0, duf, 1, 0, du2, 1, 0, ipiv, 1, 0, b, 1, 5, 0, x, 1, 5, 0, rcond, ferr, 1, 0, berr, 1, 0, work, 1, 0, rwork, 1, 0);
	assert.equal( info, tc.info );
	assertClose( rcond[ 0 ], tc.rcond, 1e-10, 'rcond' );
	xv = toArray( f64view( x ) );
	assertArrayClose( xv, tc.x, 1e-10, 'x' );
	assertArrayClose( toArray( ferr ), tc.ferr, 1e-6, 'ferr' );
	assertArrayClose( toArray( berr ), tc.berr, 1e-6, 'berr' );
});
