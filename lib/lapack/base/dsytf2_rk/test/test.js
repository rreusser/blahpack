/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */


// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import dsytf2rk from './../lib/index.js';


// TESTS //

test( 'main export is a function', function t() {
	assert.strictEqual( typeof dsytf2rk, 'function', 'main export is a function' ); // eslint-disable-line max-len
});

test( 'main export has an ndarray method', function t() {
	assert.strictEqual( typeof dsytf2rk.ndarray, 'function', 'has ndarray method' ); // eslint-disable-line max-len
});

test( 'main export factorizes a simple 4x4 matrix (column-major, lower)', function t() { // eslint-disable-line max-len
	var info;
	var ipiv;
	var A;
	var e;
	A = new Float64Array([
		4,
		1,
		-2,
		0.5,
		1,
		-3,
		1,
		2,
		-2,
		1,
		5,
		-1,
		0.5,
		2,
		-1,
		2
	]);
	e = new Float64Array( 4 );
	ipiv = new Int32Array( 4 );
	info = dsytf2rk( 'column-major', 'lower', 4, A, 4, e, 1, ipiv, 1, 0 );
	assert.equal( info, 0, 'info should be 0' );
	assert.equal( ipiv[ 0 ], 0, 'IPIV[0] should be 0 (1x1 pivot, no swap)' );
});

test( 'main export factorizes a simple 4x4 matrix (column-major, upper)', function t() { // eslint-disable-line max-len
	var info;
	var ipiv;
	var A;
	var e;
	A = new Float64Array([
		4,
		0,
		0,
		0,
		1,
		-3,
		0,
		0,
		-2,
		1,
		5,
		0,
		0.5,
		2,
		-1,
		2
	]);
	e = new Float64Array( 4 );
	ipiv = new Int32Array( 4 );
	info = dsytf2rk( 'column-major', 'upper', 4, A, 4, e, 1, ipiv, 1, 0 );
	assert.equal( info, 0, 'info should be 0' );
});
