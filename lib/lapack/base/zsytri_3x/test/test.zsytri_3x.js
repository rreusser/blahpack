/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import zsytri3x from './../lib/zsytri_3x.js';


// TESTS //

test( 'zsytri_3x is a function', function t() {
	assert.strictEqual( typeof zsytri3x, 'function', 'is a function' );
});

test( 'zsytri_3x has expected arity', function t() {
	assert.strictEqual( zsytri3x.length, 13, 'has expected arity' );
});

test( 'zsytri_3x: column-major layout quick return for N=0', function t() {
	var info;
	var ipiv = new Int32Array( 0 );
	var work = new Complex128Array( 1 );
	var A = new Complex128Array( 0 );
	var e = new Complex128Array( 0 );
	info = zsytri3x( 'column-major', 'lower', 0, A, 1, e, 1, ipiv, 1, 0, work, 1, 1 ); // eslint-disable-line max-len
	assert.equal( info, 0, 'info' );
});

test( 'zsytri_3x throws TypeError for invalid order', function t() {
	var ipiv = new Int32Array( 2 );
	var work = new Complex128Array( 10 );
	var A = new Complex128Array( 4 );
	var e = new Complex128Array( 2 );
	assert.throws( function fn() {
		zsytri3x( 'invalid', 'upper', 2, A, 2, e, 1, ipiv, 1, 0, work, 1, 1 );
	}, TypeError );
});

test( 'zsytri_3x throws TypeError for invalid uplo', function t() {
	var ipiv = new Int32Array( 2 );
	var work = new Complex128Array( 10 );
	var A = new Complex128Array( 4 );
	var e = new Complex128Array( 2 );
	assert.throws( function fn() {
		zsytri3x( 'column-major', 'invalid', 2, A, 2, e, 1, ipiv, 1, 0, work, 1, 1 ); // eslint-disable-line max-len
	}, TypeError );
});

test( 'zsytri_3x throws RangeError for negative N', function t() {
	var ipiv = new Int32Array( 2 );
	var work = new Complex128Array( 10 );
	var A = new Complex128Array( 4 );
	var e = new Complex128Array( 2 );
	assert.throws( function fn() {
		zsytri3x( 'column-major', 'upper', -1, A, 2, e, 1, ipiv, 1, 0, work, 1, 1 ); // eslint-disable-line max-len
	}, RangeError );
});

test( 'zsytri_3x throws RangeError for invalid LDA', function t() {
	var ipiv = new Int32Array( 2 );
	var work = new Complex128Array( 10 );
	var A = new Complex128Array( 4 );
	var e = new Complex128Array( 2 );
	assert.throws( function fn() {
		zsytri3x( 'row-major', 'upper', 4, A, 1, e, 1, ipiv, 1, 0, work, 1, 1 );
	}, RangeError );
});
