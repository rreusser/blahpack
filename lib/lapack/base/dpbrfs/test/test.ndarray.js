/* eslint-disable no-restricted-syntax, stdlib/first-unit-test, max-lines */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import dpbtrf from './../../dpbtrf/lib/base.js';
import dpbtrs from './../../dpbtrs/lib/base.js';
import dpbrfs from './../lib/ndarray.js';
import dpbrfsMain from './../lib/index.js';

// FIXTURES //

import upper_kd1_3x3 from './fixtures/upper_kd1_3x3.json' with { type: 'json' };
import lower_kd1_3x3 from './fixtures/lower_kd1_3x3.json' with { type: 'json' };
import upper_kd2_3x3 from './fixtures/upper_kd2_3x3.json' with { type: 'json' };
import upper_kd1_nrhs2 from './fixtures/upper_kd1_nrhs2.json' with { type: 'json' };
import n_zero from './fixtures/n_zero.json' with { type: 'json' };
import n_one from './fixtures/n_one.json' with { type: 'json' };
import lower_kd2_3x3 from './fixtures/lower_kd2_3x3.json' with { type: 'json' };

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
* Creates column-major band storage from specification.
*
* @private
* @param {number} ldab - leading dimension (kd+1)
* @param {number} n - number of columns
* @param {Array} entries - flat array in column-major order
* @returns {Float64Array} band storage
*/
function bandMatrix( ldab, n, entries ) {
	var out = new Float64Array( ldab * n );
	var i;
	for ( i = 0; i < entries.length; i++ ) {
		out[ i ] = entries[ i ];
	}
	return out;
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

test( 'dpbrfs: main export is a function', function t() {
	assert.strictEqual( typeof dpbrfsMain, 'function' );
});

test( 'dpbrfs: attached to the main export is an `ndarray` method', function t() { // eslint-disable-line max-len
	assert.strictEqual( typeof dpbrfsMain.ndarray, 'function' );
});

test( 'dpbrfs: upper_kd1_3x3', function t() {
	var IWORK;
	var nrhs;
	var ldab;
	var info;
	var WORK;
	var FERR;
	var BERR;
	var afb;
	var tc;
	var kd;
	var ab;
	var N;
	var b;
	var x;

	tc = upper_kd1_3x3;
	N = 3;
	kd = 1;
	nrhs = 1;
	ldab = 2;
	ab = bandMatrix( ldab, N, [
		0.0,
		4.0,   // col 1
		1.0,
		5.0,   // col 2
		1.0,
		6.0    // col 3
	]);
	afb = new Float64Array( ab );
	info = dpbtrf( 'upper', N, kd, afb, 1, ldab, 0 );
	assert.equal( info, 0, 'dpbtrf should succeed' );
	b = new Float64Array( [ 1.0, 2.0, 3.0 ] );
	x = new Float64Array( b );
	info = dpbtrs( 'upper', N, kd, nrhs, afb, 1, ldab, 0, x, 1, N, 0 );
	assert.equal( info, 0, 'dpbtrs should succeed' );
	FERR = new Float64Array( nrhs );
	BERR = new Float64Array( nrhs );
	WORK = new Float64Array( 3 * N );
	IWORK = new Int32Array( N );
	info = dpbrfs( 'upper', N, kd, nrhs, ab, 1, ldab, 0, afb, 1, ldab, 0, b, 1, N, 0, x, 1, N, 0, FERR, 1, 0, BERR, 1, 0, WORK, 1, 0, IWORK, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, 0, 'info' );
	assertArrayClose( toArray( x ), tc.x, 1e-14, 'x' );
	assertArrayClose( toArray( FERR ), tc.ferr, 0.5, 'ferr' );
	assertArrayClose( toArray( BERR ), tc.berr, 0.5, 'berr' );
});

test( 'dpbrfs: lower_kd1_3x3', function t() {
	var IWORK;
	var nrhs;
	var ldab;
	var info;
	var WORK;
	var FERR;
	var BERR;
	var afb;
	var tc;
	var kd;
	var ab;
	var N;
	var b;
	var x;

	tc = lower_kd1_3x3;
	N = 3;
	kd = 1;
	nrhs = 1;
	ldab = 2;
	ab = bandMatrix( ldab, N, [
		4.0,
		1.0,   // col 1
		5.0,
		1.0,   // col 2
		6.0,
		0.0    // col 3
	]);
	afb = new Float64Array( ab );
	info = dpbtrf( 'lower', N, kd, afb, 1, ldab, 0 );
	assert.equal( info, 0, 'dpbtrf should succeed' );
	b = new Float64Array( [ 1.0, 2.0, 3.0 ] );
	x = new Float64Array( b );
	info = dpbtrs( 'lower', N, kd, nrhs, afb, 1, ldab, 0, x, 1, N, 0 );
	assert.equal( info, 0, 'dpbtrs should succeed' );
	FERR = new Float64Array( nrhs );
	BERR = new Float64Array( nrhs );
	WORK = new Float64Array( 3 * N );
	IWORK = new Int32Array( N );
	info = dpbrfs( 'lower', N, kd, nrhs, ab, 1, ldab, 0, afb, 1, ldab, 0, b, 1, N, 0, x, 1, N, 0, FERR, 1, 0, BERR, 1, 0, WORK, 1, 0, IWORK, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, 0, 'info' );
	assertArrayClose( toArray( x ), tc.x, 1e-14, 'x' );
	assertArrayClose( toArray( FERR ), tc.ferr, 0.5, 'ferr' );
	assertArrayClose( toArray( BERR ), tc.berr, 0.5, 'berr' );
});

test( 'dpbrfs: upper_kd2_3x3', function t() {
	var IWORK;
	var nrhs;
	var ldab;
	var info;
	var WORK;
	var FERR;
	var BERR;
	var afb;
	var tc;
	var kd;
	var ab;
	var N;
	var b;
	var x;

	tc = upper_kd2_3x3;
	N = 3;
	kd = 2;
	nrhs = 1;
	ldab = 3;
	ab = bandMatrix( ldab, N, [
		0.0,
		0.0,
		10.0,       // col 1: diag only
		0.0,
		2.0,
		10.0,       // col 2: super1, diag
		1.0,
		3.0,
		10.0        // col 3: super2, super1, diag
	]);
	afb = new Float64Array( ab );
	info = dpbtrf( 'upper', N, kd, afb, 1, ldab, 0 );
	assert.equal( info, 0, 'dpbtrf should succeed' );
	b = new Float64Array( [ 5.0, 7.0, 9.0 ] );
	x = new Float64Array( b );
	info = dpbtrs( 'upper', N, kd, nrhs, afb, 1, ldab, 0, x, 1, N, 0 );
	assert.equal( info, 0, 'dpbtrs should succeed' );
	FERR = new Float64Array( nrhs );
	BERR = new Float64Array( nrhs );
	WORK = new Float64Array( 3 * N );
	IWORK = new Int32Array( N );
	info = dpbrfs( 'upper', N, kd, nrhs, ab, 1, ldab, 0, afb, 1, ldab, 0, b, 1, N, 0, x, 1, N, 0, FERR, 1, 0, BERR, 1, 0, WORK, 1, 0, IWORK, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, 0, 'info' );
	assertArrayClose( toArray( x ), tc.x, 1e-14, 'x' );
	assertArrayClose( toArray( FERR ), tc.ferr, 0.5, 'ferr' );
	assertArrayClose( toArray( BERR ), tc.berr, 0.5, 'berr' );
});

test( 'dpbrfs: upper_kd1_nrhs2', function t() {
	var IWORK;
	var nrhs;
	var ldab;
	var info;
	var WORK;
	var FERR;
	var BERR;
	var xarr;
	var afb;
	var tc;
	var kd;
	var ab;
	var N;
	var b;
	var x;

	tc = upper_kd1_nrhs2;
	N = 3;
	kd = 1;
	nrhs = 2;
	ldab = 2;
	ab = bandMatrix( ldab, N, [
		0.0,
		4.0,
		1.0,
		5.0,
		1.0,
		6.0
	]);
	afb = new Float64Array( ab );
	info = dpbtrf( 'upper', N, kd, afb, 1, ldab, 0 );
	assert.equal( info, 0, 'dpbtrf should succeed' );
	b = new Float64Array( [ 1.0, 2.0, 3.0, 4.0, 5.0, 6.0 ] );
	x = new Float64Array( b );
	info = dpbtrs( 'upper', N, kd, nrhs, afb, 1, ldab, 0, x, 1, N, 0 );
	assert.equal( info, 0, 'dpbtrs should succeed' );
	FERR = new Float64Array( nrhs );
	BERR = new Float64Array( nrhs );
	WORK = new Float64Array( 3 * N );
	IWORK = new Int32Array( N );
	info = dpbrfs( 'upper', N, kd, nrhs, ab, 1, ldab, 0, afb, 1, ldab, 0, b, 1, N, 0, x, 1, N, 0, FERR, 1, 0, BERR, 1, 0, WORK, 1, 0, IWORK, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, 0, 'info' );
	xarr = toArray( x );
	assertArrayClose( xarr, tc.x, 1e-14, 'x' );
	assertArrayClose( toArray( FERR ), tc.ferr, 0.5, 'ferr' );
	assertArrayClose( toArray( BERR ), tc.berr, 0.5, 'berr' );
});

test( 'dpbrfs: n_zero', function t() {
	var IWORK;
	var FERR;
	var BERR;
	var WORK;
	var info;
	var afb;
	var tc;
	var ab;
	var b;
	var x;

	tc = n_zero;
	FERR = new Float64Array( [ -1.0 ] );
	BERR = new Float64Array( [ -1.0 ] );
	WORK = new Float64Array( 3 );
	IWORK = new Int32Array( 1 );
	ab = new Float64Array( 1 );
	afb = new Float64Array( 1 );
	b = new Float64Array( 1 );
	x = new Float64Array( 1 );
	info = dpbrfs( 'upper', 0, 0, 1, ab, 1, 1, 0, afb, 1, 1, 0, b, 1, 1, 0, x, 1, 1, 0, FERR, 1, 0, BERR, 1, 0, WORK, 1, 0, IWORK, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, 0, 'info' );
	assert.equal( FERR[ 0 ], tc.ferr[ 0 ], 'ferr' );
	assert.equal( BERR[ 0 ], tc.berr[ 0 ], 'berr' );
});

test( 'dpbrfs: n_one', function t() {
	var IWORK;
	var nrhs;
	var info;
	var WORK;
	var FERR;
	var BERR;
	var afb;
	var tc;
	var kd;
	var ab;
	var N;
	var b;
	var x;

	tc = n_one;
	N = 1;
	kd = 0;
	nrhs = 1;
	ab = new Float64Array( [ 4.0 ] );
	afb = new Float64Array( ab );
	info = dpbtrf( 'upper', N, kd, afb, 1, 1, 0 );
	assert.equal( info, 0, 'dpbtrf should succeed' );
	b = new Float64Array( [ 8.0 ] );
	x = new Float64Array( b );
	info = dpbtrs( 'upper', N, kd, nrhs, afb, 1, 1, 0, x, 1, N, 0 );
	assert.equal( info, 0, 'dpbtrs should succeed' );
	FERR = new Float64Array( nrhs );
	BERR = new Float64Array( nrhs );
	WORK = new Float64Array( 3 * N );
	IWORK = new Int32Array( N );
	info = dpbrfs( 'upper', N, kd, nrhs, ab, 1, 1, 0, afb, 1, 1, 0, b, 1, N, 0, x, 1, N, 0, FERR, 1, 0, BERR, 1, 0, WORK, 1, 0, IWORK, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, 0, 'info' );
	assertArrayClose( toArray( x ), tc.x, 1e-14, 'x' );
	assertArrayClose( toArray( FERR ), tc.ferr, 0.5, 'ferr' );
	assertArrayClose( toArray( BERR ), tc.berr, 0.5, 'berr' );
});

test( 'dpbrfs: lower_kd2_3x3', function t() {
	var IWORK;
	var nrhs;
	var ldab;
	var info;
	var WORK;
	var FERR;
	var BERR;
	var afb;
	var tc;
	var kd;
	var ab;
	var N;
	var b;
	var x;

	tc = lower_kd2_3x3;
	N = 3;
	kd = 2;
	nrhs = 1;
	ldab = 3;
	ab = bandMatrix( ldab, N, [
		10.0,
		2.0,
		1.0,   // col 1: diag, sub1, sub2
		10.0,
		3.0,
		0.0,   // col 2: diag, sub1
		10.0,
		0.0,
		0.0    // col 3: diag
	]);
	afb = new Float64Array( ab );
	info = dpbtrf( 'lower', N, kd, afb, 1, ldab, 0 );
	assert.equal( info, 0, 'dpbtrf should succeed' );
	b = new Float64Array( [ 5.0, 7.0, 9.0 ] );
	x = new Float64Array( b );
	info = dpbtrs( 'lower', N, kd, nrhs, afb, 1, ldab, 0, x, 1, N, 0 );
	assert.equal( info, 0, 'dpbtrs should succeed' );
	FERR = new Float64Array( nrhs );
	BERR = new Float64Array( nrhs );
	WORK = new Float64Array( 3 * N );
	IWORK = new Int32Array( N );
	info = dpbrfs( 'lower', N, kd, nrhs, ab, 1, ldab, 0, afb, 1, ldab, 0, b, 1, N, 0, x, 1, N, 0, FERR, 1, 0, BERR, 1, 0, WORK, 1, 0, IWORK, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, 0, 'info' );
	assertArrayClose( toArray( x ), tc.x, 1e-14, 'x' );
	assertArrayClose( toArray( FERR ), tc.ferr, 0.5, 'ferr' );
	assertArrayClose( toArray( BERR ), tc.berr, 0.5, 'berr' );
});

test( 'dpbrfs: ndarray uplo validation', function t() {
	assert.throws( function f() {
		dpbrfsMain.ndarray( 'invalid', 3, 1, 1, new Float64Array( 6 ), 1, 2, 0, new Float64Array( 6 ), 1, 2, 0, new Float64Array( 3 ), 1, 3, 0, new Float64Array( 3 ), 1, 3, 0, new Float64Array( 1 ), 1, 0, new Float64Array( 1 ), 1, 0, new Float64Array( 9 ), 1, 0, new Int32Array( 3 ), 1, 0 ); // eslint-disable-line max-len
	}, /invalid argument/i );
});
