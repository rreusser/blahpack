/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import dlasyfRk from './../lib/dlasyf_rk.js';


// TESTS //

test( 'main export is a function', function t() {
	assert.strictEqual( typeof dlasyfRk, 'function', 'is a function' );
});

test( 'has expected arity', function t() {
	assert.strictEqual( dlasyfRk.length, 10, 'has expected arity' );
});

test( 'throws TypeError for invalid order', function t() {
	assert.throws( function throws() {
		dlasyfRk( 'invalid', 'upper', 2, 2, new Float64Array( 4 ), 2, new Float64Array( 2 ), new Int32Array( 2 ), new Float64Array( 4 ), 2 );
	}, TypeError );
});

test( 'throws TypeError for invalid uplo', function t() {
	assert.throws( function throws() {
		dlasyfRk( 'column-major', 'invalid', 2, 2, new Float64Array( 4 ), 2, new Float64Array( 2 ), new Int32Array( 2 ), new Float64Array( 4 ), 2 );
	}, TypeError );
});

test( 'throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		dlasyfRk( 'column-major', 'upper', -1, 2, new Float64Array( 4 ), 2, new Float64Array( 2 ), new Int32Array( 2 ), new Float64Array( 4 ), 2 );
	}, RangeError );
});

test( 'returns {info, kb} for a simple 2x2 lower case', function t() {
	var result;
	var IPIV;
	var A;
	var W;
	var e;
	A = new Float64Array( [ 2.0, 1.0, 0.0, 3.0 ] );
	e = new Float64Array( 2 );
	IPIV = new Int32Array( 2 );
	W = new Float64Array( 4 );
	result = dlasyfRk( 'column-major', 'lower', 2, 2, A, 2, e, IPIV, W, 2 );
	assert.equal( result.info, 0, 'info' );
	assert.equal( result.kb, 2, 'kb' );
});
