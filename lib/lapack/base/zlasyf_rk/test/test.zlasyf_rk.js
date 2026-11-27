/* eslint-disable no-restricted-syntax */

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
	assert.strictEqual( zlasyfRk.length, 13, 'has expected arity' );
});

test( 'throws TypeError for invalid order', function t() {
	assert.throws( function throws() {
		const kb = new Int32Array( 1 );
		zlasyfRk( 'invalid', 'upper', 2, 2, kb, new Complex128Array( 4 ), 2, new Complex128Array( 2 ), 1, new Int32Array( 2 ), 1, new Complex128Array( 4 ), 2 );
	}, TypeError );
});

test( 'throws TypeError for invalid uplo', function t() {
	assert.throws( function throws() {
		const kb = new Int32Array( 1 );
		zlasyfRk( 'column-major', 'invalid', 2, 2, kb, new Complex128Array( 4 ), 2, new Complex128Array( 2 ), 1, new Int32Array( 2 ), 1, new Complex128Array( 4 ), 2 );
	}, TypeError );
});

test( 'throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		const kb = new Int32Array( 1 );
		zlasyfRk( 'column-major', 'upper', -1, 2, kb, new Complex128Array( 4 ), 2, new Complex128Array( 2 ), 1, new Int32Array( 2 ), 1, new Complex128Array( 4 ), 2 );
	}, RangeError );
});

test( 'returns {info, kb} for a simple 2x2 symmetric lower case', function t() {
	const kb = new Int32Array( 1 );
	const A = new Complex128Array( [ 2.0, 0.1, 1.0, 0.5, 0.0, 0.0, 3.0, -0.2 ] );
	const e = new Complex128Array( 2 );
	const IPIV = new Int32Array( 2 );
	const W = new Complex128Array( 4 );
	const result = zlasyfRk( 'column-major', 'lower', 2, 2, kb, A, 2, e, 1, IPIV, 1, W, 2 );
	assert.equal( result, 0, 'info' );
	assert.equal( kb[ 0 ], 2, 'kb' );
});
