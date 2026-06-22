/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import zsytriRook from './../lib/index.js';


// TESTS //

test( 'main export is a function', function t() {
	assert.strictEqual( typeof zsytriRook, 'function', 'main export is a function' ); // eslint-disable-line max-len
});

test( 'main export has an ndarray method', function t() {
	assert.strictEqual( typeof zsytriRook.ndarray, 'function', 'has ndarray method' ); // eslint-disable-line max-len
});

test( 'main export inverts a 1x1 complex symmetric', function t() {
	var info;
	var view;
	var IPIV;
	var WORK;
	var A;

	A = new Complex128Array( [ 4.0, 1.0 ] );
	IPIV = new Int32Array( [ 0 ] );
	WORK = new Complex128Array( 1 );
	info = zsytriRook( 'column-major', 'upper', 1, A, 1, IPIV, 1, WORK );
	view = reinterpret( A, 0 );
	assert.equal( info, 0, 'info' );
	assert.ok( Math.abs( view[ 0 ] - ( 4.0 / 17.0 ) ) < 1e-15, 'real' );
	assert.ok( Math.abs( view[ 1 ] - ( -1.0 / 17.0 ) ) < 1e-15, 'imag' );
});

test( 'ndarray method inverts a 1x1 complex symmetric', function t() {
	var info;
	var view;
	var IPIV;
	var WORK;
	var A;

	A = new Complex128Array( [ 2.0, 0.0 ] );
	IPIV = new Int32Array( [ 0 ] );
	WORK = new Complex128Array( 1 );
	info = zsytriRook.ndarray( 'lower', 1, A, 1, 1, 0, IPIV, 1, 0, WORK, 1, 0 );
	view = reinterpret( A, 0 );
	assert.equal( info, 0, 'info' );
	assert.equal( view[ 0 ], 0.5, 'real' );
});

test( 'main export quick-returns for N=0', function t() {
	var info;
	info = zsytriRook( 'column-major', 'upper', 0, new Complex128Array( 0 ), 1, new Int32Array( 0 ), 1, new Complex128Array( 0 ) ); // eslint-disable-line max-len
	assert.equal( info, 0, 'info' );
});
