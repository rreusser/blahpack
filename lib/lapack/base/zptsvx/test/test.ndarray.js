/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import zpttrf from './../../zpttrf/lib/base.js';
import zptsvx from './../lib/ndarray.js';

// FIXTURES //

import fact_n_4x4 from './fixtures/fact_n_4x4.json' with { type: 'json' };
import fact_n_3x3 from './fixtures/fact_n_3x3.json' with { type: 'json' };
import fact_f_4x4 from './fixtures/fact_f_4x4.json' with { type: 'json' };
import n_zero from './fixtures/n_zero.json' with { type: 'json' };
import n_one from './fixtures/n_one.json' with { type: 'json' };
import not_posdef from './fixtures/not_posdef.json' with { type: 'json' };
import multi_rhs from './fixtures/multi_rhs.json' with { type: 'json' };
import n5_nrhs1 from './fixtures/n5_nrhs1.json' with { type: 'json' };
import n2_nrhs1 from './fixtures/n2_nrhs1.json' with { type: 'json' };

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

test( 'zptsvx: main export is a function', function t() {
	assert.strictEqual( typeof zptsvx, 'function' );
});

test( 'zptsvx: fact_n_4x4 - factor and solve N=4, NRHS=1', function t() {
	var rcond;
	var rwork;
	var ferr;
	var berr;
	var work;
	var info;
	var tc;
	var xv;
	var df;
	var ef;
	var d;
	var e;
	var b;
	var x;

	tc = fact_n_4x4;
	d = new Float64Array( [ 4.0, 5.0, 6.0, 7.0 ] );
	e = new Complex128Array( [ 1.0, 0.5, 0.5, -0.3, 0.2, 0.1 ] );
	df = new Float64Array( 4 );
	ef = new Complex128Array( 3 );
	b = new Complex128Array( [ 6.5, 4.0, 12.15, -4.55, 7.1, 3.25, -3.25, 7.0 ] );
	x = new Complex128Array( 4 );
	rcond = new Float64Array( 1 );
	ferr = new Float64Array( 1 );
	berr = new Float64Array( 1 );
	work = new Complex128Array( 4 );
	rwork = new Float64Array( 4 );
	info = zptsvx( 'not-factored', 4, 1, d, 1, 0, e, 1, 0, df, 1, 0, ef, 1, 0, b, 1, 4, 0, x, 1, 4, 0, rcond, ferr, 1, 0, berr, 1, 0, work, 1, 0, rwork, 1, 0 ); // eslint-disable-line max-len
	xv = toArray( reinterpret( x, 0 ) );
	assert.strictEqual( info, tc.info );
	assertArrayClose( xv, tc.x, 1e-14, 'x' );
	assertClose( rcond[ 0 ], tc.rcond, 1e-14, 'rcond' );
	assertArrayClose( toArray( ferr ), tc.ferr, 1e-10, 'ferr' );
	assertArrayClose( toArray( berr ), tc.berr, 1e-14, 'berr' );
	assertArrayClose( toArray( df ), tc.df, 1e-14, 'df' );
	assertArrayClose( toArray( reinterpret( ef, 0 ) ), tc.ef, 1e-14, 'ef' );
});

test( 'zptsvx: fact_n_3x3 - factor and solve N=3, NRHS=1', function t() {
	var rcond;
	var rwork;
	var ferr;
	var berr;
	var work;
	var info;
	var tc;
	var xv;
	var df;
	var ef;
	var d;
	var e;
	var b;
	var x;

	tc = fact_n_3x3;
	d = new Float64Array( [ 10.0, 10.0, 10.0 ] );
	e = new Complex128Array( [ 1.0, 1.0, 1.0, -1.0 ] );
	df = new Float64Array( 3 );
	ef = new Complex128Array( 2 );
	b = new Complex128Array( [ 12.0, 12.0, 24.0, -4.0, 32.0, -8.0 ] );
	x = new Complex128Array( 3 );
	rcond = new Float64Array( 1 );
	ferr = new Float64Array( 1 );
	berr = new Float64Array( 1 );
	work = new Complex128Array( 3 );
	rwork = new Float64Array( 3 );
	info = zptsvx( 'not-factored', 3, 1, d, 1, 0, e, 1, 0, df, 1, 0, ef, 1, 0, b, 1, 3, 0, x, 1, 3, 0, rcond, ferr, 1, 0, berr, 1, 0, work, 1, 0, rwork, 1, 0 ); // eslint-disable-line max-len
	xv = toArray( reinterpret( x, 0 ) );
	assert.strictEqual( info, tc.info );
	assertArrayClose( xv, tc.x, 1e-14, 'x' );
	assertClose( rcond[ 0 ], tc.rcond, 1e-14, 'rcond' );
	assertArrayClose( toArray( ferr ), tc.ferr, 1e-10, 'ferr' );
	assertArrayClose( toArray( berr ), tc.berr, 1e-10, 'berr' );
});

test( 'zptsvx: fact_f_4x4 - pre-factored, N=4, NRHS=1', function t() {
	var rcond;
	var rwork;
	var ferr;
	var berr;
	var work;
	var info;
	var tc;
	var xv;
	var df;
	var ef;
	var d;
	var e;
	var b;
	var x;

	tc = fact_f_4x4;
	d = new Float64Array( [ 4.0, 5.0, 6.0, 7.0 ] );
	e = new Complex128Array( [ 1.0, 0.5, 0.5, -0.3, 0.2, 0.1 ] );
	df = new Float64Array( [ 4.0, 5.0, 6.0, 7.0 ] );
	ef = new Complex128Array( [ 1.0, 0.5, 0.5, -0.3, 0.2, 0.1 ] );
	zpttrf( 4, df, 1, 0, ef, 1, 0 );
	b = new Complex128Array( [ 6.5, 4.0, 12.15, -4.55, 7.1, 3.25, -3.25, 7.0 ] );
	x = new Complex128Array( 4 );
	rcond = new Float64Array( 1 );
	ferr = new Float64Array( 1 );
	berr = new Float64Array( 1 );
	work = new Complex128Array( 4 );
	rwork = new Float64Array( 4 );
	info = zptsvx( 'factored', 4, 1, d, 1, 0, e, 1, 0, df, 1, 0, ef, 1, 0, b, 1, 4, 0, x, 1, 4, 0, rcond, ferr, 1, 0, berr, 1, 0, work, 1, 0, rwork, 1, 0 ); // eslint-disable-line max-len
	xv = toArray( reinterpret( x, 0 ) );
	assert.strictEqual( info, tc.info );
	assertArrayClose( xv, tc.x, 1e-14, 'x' );
	assertClose( rcond[ 0 ], tc.rcond, 1e-14, 'rcond' );
	assertArrayClose( toArray( ferr ), tc.ferr, 1e-10, 'ferr' );
	assertArrayClose( toArray( berr ), tc.berr, 1e-14, 'berr' );
});

test( 'zptsvx: n_zero - quick return for N=0', function t() {
	var rcond;
	var rwork;
	var ferr;
	var berr;
	var work;
	var info;
	var tc;
	var df;
	var ef;
	var d;
	var e;
	var b;
	var x;

	tc = n_zero;
	d = new Float64Array( 0 );
	e = new Complex128Array( 0 );
	df = new Float64Array( 0 );
	ef = new Complex128Array( 0 );
	b = new Complex128Array( 0 );
	x = new Complex128Array( 0 );
	rcond = new Float64Array( 1 );
	ferr = new Float64Array( 1 );
	berr = new Float64Array( 1 );
	work = new Complex128Array( 1 );
	rwork = new Float64Array( 1 );
	info = zptsvx( 'not-factored', 0, 1, d, 1, 0, e, 1, 0, df, 1, 0, ef, 1, 0, b, 1, 1, 0, x, 1, 1, 0, rcond, ferr, 1, 0, berr, 1, 0, work, 1, 0, rwork, 1, 0 ); // eslint-disable-line max-len
	assert.strictEqual( info, tc.info );
});

test( 'zptsvx: n_one - N=1 scalar case', function t() {
	var rcond;
	var rwork;
	var ferr;
	var berr;
	var work;
	var info;
	var tc;
	var xv;
	var df;
	var ef;
	var d;
	var e;
	var b;
	var x;

	tc = n_one;
	d = new Float64Array( [ 4.0 ] );
	e = new Complex128Array( 0 );
	df = new Float64Array( 1 );
	ef = new Complex128Array( 0 );
	b = new Complex128Array( [ 8.0, 4.0 ] );
	x = new Complex128Array( 1 );
	rcond = new Float64Array( 1 );
	ferr = new Float64Array( 1 );
	berr = new Float64Array( 1 );
	work = new Complex128Array( 1 );
	rwork = new Float64Array( 1 );
	info = zptsvx( 'not-factored', 1, 1, d, 1, 0, e, 1, 0, df, 1, 0, ef, 1, 0, b, 1, 1, 0, x, 1, 1, 0, rcond, ferr, 1, 0, berr, 1, 0, work, 1, 0, rwork, 1, 0 ); // eslint-disable-line max-len
	xv = toArray( reinterpret( x, 0 ) );
	assert.strictEqual( info, tc.info );
	assertArrayClose( xv, tc.x, 1e-14, 'x' );
	assertClose( rcond[ 0 ], tc.rcond, 1e-14, 'rcond' );
	assertArrayClose( toArray( ferr ), tc.ferr, 1e-10, 'ferr' );
	assertArrayClose( toArray( berr ), tc.berr, 1e-14, 'berr' );
});

test( 'zptsvx: not_posdef - not positive definite returns info > 0', function t() { // eslint-disable-line max-len
	var rcond;
	var rwork;
	var ferr;
	var berr;
	var work;
	var info;
	var tc;
	var df;
	var ef;
	var d;
	var e;
	var b;
	var x;

	tc = not_posdef;
	d = new Float64Array( [ 4.0, -1.0, 6.0 ] );
	e = new Complex128Array( [ 1.0, 0.0, 2.0, 0.0 ] );
	df = new Float64Array( 3 );
	ef = new Complex128Array( 2 );
	b = new Complex128Array( [ 1.0, 0.0, 1.0, 0.0, 1.0, 0.0 ] );
	x = new Complex128Array( 3 );
	rcond = new Float64Array( 1 );
	ferr = new Float64Array( 1 );
	berr = new Float64Array( 1 );
	work = new Complex128Array( 3 );
	rwork = new Float64Array( 3 );
	info = zptsvx( 'not-factored', 3, 1, d, 1, 0, e, 1, 0, df, 1, 0, ef, 1, 0, b, 1, 3, 0, x, 1, 3, 0, rcond, ferr, 1, 0, berr, 1, 0, work, 1, 0, rwork, 1, 0 ); // eslint-disable-line max-len
	assert.strictEqual( info, tc.info );
	assert.strictEqual( rcond[ 0 ], tc.rcond );
});

test( 'zptsvx: multi_rhs - N=3, NRHS=2', function t() {
	var rcond;
	var rwork;
	var ferr;
	var berr;
	var work;
	var info;
	var tc;
	var xv;
	var df;
	var ef;
	var d;
	var e;
	var b;
	var x;

	tc = multi_rhs;
	d = new Float64Array( [ 10.0, 10.0, 10.0 ] );
	e = new Complex128Array( [ 1.0, 1.0, 1.0, -1.0 ] );
	df = new Float64Array( 3 );
	ef = new Complex128Array( 2 );
	b = new Complex128Array([
		11.0,
		11.0,
		12.0,
		-2.0,
		11.0,
		-9.0,
		22.0,
		4.0,
		34.0,
		2.0,
		42.0,
		-16.0
	]);
	x = new Complex128Array( 6 );
	rcond = new Float64Array( 1 );
	ferr = new Float64Array( 2 );
	berr = new Float64Array( 2 );
	work = new Complex128Array( 3 );
	rwork = new Float64Array( 3 );
	info = zptsvx( 'not-factored', 3, 2, d, 1, 0, e, 1, 0, df, 1, 0, ef, 1, 0, b, 1, 3, 0, x, 1, 3, 0, rcond, ferr, 1, 0, berr, 1, 0, work, 1, 0, rwork, 1, 0 ); // eslint-disable-line max-len
	xv = toArray( reinterpret( x, 0 ) );
	assert.strictEqual( info, tc.info );
	assertArrayClose( xv, tc.x, 1e-14, 'x' );
	assertClose( rcond[ 0 ], tc.rcond, 1e-14, 'rcond' );
	assertArrayClose( toArray( ferr ), tc.ferr, 1e-10, 'ferr' );
	assertArrayClose( toArray( berr ), tc.berr, 1e-10, 'berr' );
});

test( 'zptsvx: n5_nrhs1 - larger system N=5, NRHS=1', function t() {
	var rcond;
	var rwork;
	var ferr;
	var berr;
	var work;
	var info;
	var tc;
	var xv;
	var df;
	var ef;
	var d;
	var e;
	var b;
	var x;

	tc = n5_nrhs1;
	d = new Float64Array( [ 10.0, 20.0, 30.0, 20.0, 10.0 ] );
	e = new Complex128Array( [ 1.0, 0.5, 2.0, -1.0, 1.5, 0.5, 0.5, -0.5 ] );
	df = new Float64Array( 5 );
	ef = new Complex128Array( 4 );
	b = new Complex128Array( [ 10.5, 1.5, 25.0, 17.5, 63.0, 2.0, 23.5, -21.5, 11.0, 0.0 ] ); // eslint-disable-line max-len
	x = new Complex128Array( 5 );
	rcond = new Float64Array( 1 );
	ferr = new Float64Array( 1 );
	berr = new Float64Array( 1 );
	work = new Complex128Array( 5 );
	rwork = new Float64Array( 5 );
	info = zptsvx( 'not-factored', 5, 1, d, 1, 0, e, 1, 0, df, 1, 0, ef, 1, 0, b, 1, 5, 0, x, 1, 5, 0, rcond, ferr, 1, 0, berr, 1, 0, work, 1, 0, rwork, 1, 0 ); // eslint-disable-line max-len
	xv = toArray( reinterpret( x, 0 ) );
	assert.strictEqual( info, tc.info );
	assertArrayClose( xv, tc.x, 1e-14, 'x' );
	assertClose( rcond[ 0 ], tc.rcond, 1e-14, 'rcond' );
	assertArrayClose( toArray( ferr ), tc.ferr, 1e-10, 'ferr' );
	assertArrayClose( toArray( berr ), tc.berr, 1e-10, 'berr' );
});

test( 'zptsvx: n2_nrhs1 - N=2 system', function t() {
	var rcond;
	var rwork;
	var ferr;
	var berr;
	var work;
	var info;
	var tc;
	var xv;
	var df;
	var ef;
	var d;
	var e;
	var b;
	var x;

	tc = n2_nrhs1;
	d = new Float64Array( [ 4.0, 5.0 ] );
	e = new Complex128Array( [ 1.0, 1.0 ] );
	df = new Float64Array( 2 );
	ef = new Complex128Array( 1 );
	b = new Complex128Array( [ 7.0, 5.0, 12.0, -5.0 ] );
	x = new Complex128Array( 2 );
	rcond = new Float64Array( 1 );
	ferr = new Float64Array( 1 );
	berr = new Float64Array( 1 );
	work = new Complex128Array( 2 );
	rwork = new Float64Array( 2 );
	info = zptsvx( 'not-factored', 2, 1, d, 1, 0, e, 1, 0, df, 1, 0, ef, 1, 0, b, 1, 2, 0, x, 1, 2, 0, rcond, ferr, 1, 0, berr, 1, 0, work, 1, 0, rwork, 1, 0 ); // eslint-disable-line max-len
	xv = toArray( reinterpret( x, 0 ) );
	assert.strictEqual( info, tc.info );
	assertArrayClose( xv, tc.x, 1e-14, 'x' );
	assertClose( rcond[ 0 ], tc.rcond, 1e-14, 'rcond' );
	assertArrayClose( toArray( ferr ), tc.ferr, 1e-10, 'ferr' );
	assertArrayClose( toArray( berr ), tc.berr, 1e-14, 'berr' );
});
