/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */


// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import dsytriRook from './../lib/index.js';


// TESTS //

test( 'main export is a function', function t() {
	assert.strictEqual( typeof dsytriRook, 'function', 'main export is a function' ); // eslint-disable-line max-len
});

test( 'main export has an ndarray method', function t() {
	assert.strictEqual( typeof dsytriRook.ndarray, 'function', 'has ndarray method' ); // eslint-disable-line max-len
});

test( 'main export inverts a 1x1 matrix', function t() {
	var info;
	var IPIV;
	var WORK;
	var A;

	A = new Float64Array( [ 4.0 ] );
	IPIV = new Int32Array( [ 0 ] );
	WORK = new Float64Array( 1 );
	info = dsytriRook( 'column-major', 'upper', 1, A, 1, IPIV, 1, WORK );
	assert.equal( info, 0, 'info' );
	assert.equal( A[ 0 ], 0.25, 'A[0]' );
});

test( 'ndarray method inverts a 1x1 matrix', function t() {
	var info;
	var IPIV;
	var WORK;
	var A;

	A = new Float64Array( [ 5.0 ] );
	IPIV = new Int32Array( [ 0 ] );
	WORK = new Float64Array( 1 );
	info = dsytriRook.ndarray( 'lower', 1, A, 1, 1, 0, IPIV, 1, 0, WORK, 1, 0 );
	assert.equal( info, 0, 'info' );
	assert.equal( A[ 0 ], 0.2, 'A[0]' );
});

test( 'main export quick-returns for N=0', function t() {
	var info;
	info = dsytriRook( 'column-major', 'upper', 0, new Float64Array( 0 ), 1, new Int32Array( 0 ), 1, new Float64Array( 0 ) ); // eslint-disable-line max-len
	assert.equal( info, 0, 'info' );
});
