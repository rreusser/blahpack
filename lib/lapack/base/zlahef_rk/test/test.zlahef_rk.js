/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import zlahefRk from './../lib/zlahef_rk.js';


// TESTS //

test( 'main export is a function', function t() {
	assert.strictEqual( typeof zlahefRk, 'function', 'is a function' );
});

test( 'has expected arity', function t() {
	assert.strictEqual( zlahefRk.length, 10, 'has expected arity' );
});

test( 'throws TypeError for invalid order', function t() {
	assert.throws( function throws() {
		zlahefRk( 'invalid', 'upper', 2, 2, new Complex128Array( 4 ), 2, new Complex128Array( 2 ), new Int32Array( 2 ), new Complex128Array( 4 ), 2 );
	}, TypeError );
});

test( 'throws TypeError for invalid uplo', function t() {
	assert.throws( function throws() {
		zlahefRk( 'column-major', 'invalid', 2, 2, new Complex128Array( 4 ), 2, new Complex128Array( 2 ), new Int32Array( 2 ), new Complex128Array( 4 ), 2 );
	}, TypeError );
});

test( 'throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		zlahefRk( 'column-major', 'upper', -1, 2, new Complex128Array( 4 ), 2, new Complex128Array( 2 ), new Int32Array( 2 ), new Complex128Array( 4 ), 2 );
	}, RangeError );
});

test( 'returns {info, kb} for a simple 2x2 Hermitian lower case', function t() {
	var result;
	var IPIV;
	var A;
	var W;
	var e;
	A = new Complex128Array( [ 2.0, 0.0, 1.0, 0.5, 0.0, 0.0, 3.0, 0.0 ] );
	e = new Complex128Array( 2 );
	IPIV = new Int32Array( 2 );
	W = new Complex128Array( 4 );
	result = zlahefRk( 'column-major', 'lower', 2, 2, A, 2, e, IPIV, W, 2 );
	assert.equal( result.info, 0, 'info' );
	assert.equal( result.kb, 2, 'kb' );
});
