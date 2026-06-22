/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import zlasyfRk from './../lib/zlasyf_rk.js';


// TESTS //

test( 'main export is a function', function t() {
	assert.strictEqual( typeof zlasyfRk, 'function', 'is a function' );
});

test( 'has expected arity', function t() {
	assert.strictEqual( zlasyfRk.length, 10, 'has expected arity' );
});

test( 'throws TypeError for invalid order', function t() {
	assert.throws( function throws() {
		zlasyfRk( 'invalid', 'upper', 2, 2, new Complex128Array( 4 ), 2, new Complex128Array( 2 ), new Int32Array( 2 ), new Complex128Array( 4 ), 2 );
	}, TypeError );
});

test( 'throws TypeError for invalid uplo', function t() {
	assert.throws( function throws() {
		zlasyfRk( 'column-major', 'invalid', 2, 2, new Complex128Array( 4 ), 2, new Complex128Array( 2 ), new Int32Array( 2 ), new Complex128Array( 4 ), 2 );
	}, TypeError );
});

test( 'throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		zlasyfRk( 'column-major', 'upper', -1, 2, new Complex128Array( 4 ), 2, new Complex128Array( 2 ), new Int32Array( 2 ), new Complex128Array( 4 ), 2 );
	}, RangeError );
});

test( 'returns {info, kb} for a simple 2x2 symmetric lower case', function t() {
	var result;
	var IPIV;
	var A;
	var W;
	var e;
	A = new Complex128Array( [ 2.0, 0.1, 1.0, 0.5, 0.0, 0.0, 3.0, -0.2 ] );
	e = new Complex128Array( 2 );
	IPIV = new Int32Array( 2 );
	W = new Complex128Array( 4 );
	result = zlasyfRk( 'column-major', 'lower', 2, 2, A, 2, e, IPIV, W, 2 );
	assert.equal( result.info, 0, 'info' );
	assert.equal( result.kb, 2, 'kb' );
});
