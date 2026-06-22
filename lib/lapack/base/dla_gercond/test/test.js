
/* eslint-disable no-restricted-syntax, stdlib/first-unit-test, camelcase */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import dlaGercond from './../lib/index.js';


// TESTS //

test( 'main export is a function', function t() {
	assert.strictEqual( typeof dlaGercond, 'function', 'main export is a function' ); // eslint-disable-line max-len
});

test( 'main export has an ndarray method', function t() {
	assert.strictEqual( typeof dlaGercond.ndarray, 'function', 'has ndarray method' ); // eslint-disable-line max-len
});

test( 'ndarray returns 1.0 for N=0', function t() {
	var result;
	var IWORK;
	var IPIV;
	var WORK;
	var AF;
	var A;
	var c;

	A = new Float64Array( 0 );
	AF = new Float64Array( 0 );
	IPIV = new Int32Array( 0 );
	c = new Float64Array( 0 );
	WORK = new Float64Array( 0 );
	IWORK = new Int32Array( 0 );
	result = dlaGercond.ndarray( 'no-transpose', 0, A, 1, 1, 0, AF, 1, 1, 0, IPIV, 1, 0, 1, c, 1, 0, WORK, 1, 0, IWORK, 1, 0 ); // eslint-disable-line max-len
	assert.strictEqual( result, 1.0, 'returns 1.0 for N=0' );
});
