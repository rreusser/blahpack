
/* eslint-disable no-restricted-syntax, stdlib/first-unit-test, camelcase */


// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import dsyconvf_rook from './../lib/index.js';


// TESTS //

test( 'main export is a function', function t() {
	assert.strictEqual( typeof dsyconvf_rook, 'function', 'main export is a function' ); // eslint-disable-line max-len
});

test( 'main export has an ndarray method', function t() {
	assert.strictEqual( typeof dsyconvf_rook.ndarray, 'function', 'has ndarray method' ); // eslint-disable-line max-len
});

test( 'main export: N=0 quick return via column-major layout', function t() {
	var IPIV;
	var info;
	var A;
	var e;

	A = new Float64Array( 0 );
	e = new Float64Array( 0 );
	IPIV = new Int32Array( 0 );
	info = dsyconvf_rook( 'column-major', 'upper', 'convert', 0, A, 1, e, 1, IPIV, 1, 0 ); // eslint-disable-line max-len
	assert.strictEqual( info, 0, 'info is 0' );
});

test( 'main export: ndarray method N=0 quick return', function t() {
	var IPIV;
	var info;
	var A;
	var e;

	A = new Float64Array( 0 );
	e = new Float64Array( 0 );
	IPIV = new Int32Array( 0 );
	info = dsyconvf_rook.ndarray( 'upper', 'convert', 0, A, 1, 1, 0, e, 1, 0, IPIV, 1, 0 ); // eslint-disable-line max-len
	assert.strictEqual( info, 0, 'info is 0' );
});
