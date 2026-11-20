/* eslint-disable no-restricted-syntax, stdlib/first-unit-test, max-len */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import zlahef from './../lib/zlahef.js';
import ndarray from './../lib/ndarray.js';


// FIXTURES //

// 2x2 real-diagonal Hermitian matrix diag(2,3) (column-major):
function diagA() {
	return new Complex128Array([ 2.0, 0.0, 0.0, 0.0, 0.0, 0.0, 3.0, 0.0 ]);
}


// TESTS //

test( 'zlahef is a function', function t() {
	assert.strictEqual( typeof zlahef, 'function', 'is a function' );
});

test( 'zlahef has expected arity', function t() {
	assert.strictEqual( zlahef.length, 11, 'has expected arity' );
});

test( 'zlahef throws a TypeError for an invalid order', function t() {
	assert.throws( function throws() {
		const kb = new Int32Array( 1 );
		zlahef( 'invalid', 'lower', 2, 2, kb, diagA(), 2, new Int32Array( 2 ), 1, new Complex128Array( 4 ), 2 );
	}, TypeError );
});

test( 'zlahef throws a TypeError for an invalid uplo', function t() {
	assert.throws( function throws() {
		const kb = new Int32Array( 1 );
		zlahef( 'column-major', 'bogus', 2, 2, kb, diagA(), 2, new Int32Array( 2 ), 1, new Complex128Array( 4 ), 2 );
	}, TypeError );
});

test( 'zlahef throws a RangeError for LDW < max(1,N)', function t() {
	assert.throws( function throws() {
		const kb = new Int32Array( 1 );
		zlahef( 'column-major', 'lower', 2, 2, kb, diagA(), 2, new Int32Array( 2 ), 1, new Complex128Array( 4 ), 1 );
	}, RangeError );
});

test( 'zlahef factors a diagonal Hermitian panel (info=0)', function t() {
	const kb = new Int32Array( 1 );
	const A = diagA();
	const out = zlahef( 'column-major', 'lower', 2, 2, kb, A, 2, new Int32Array( 2 ), 1, new Complex128Array( 4 ), 2 );
	assert.strictEqual( out, 0, 'info is 0' );
	assert.ok( kb[ 0 ] >= 1 && kb[ 0 ] <= 2, 'kb in range' );
});

test( 'zlahef (column-major) matches the ndarray form', function t() {
	const kb = new Int32Array( 1 );
	const kbOut = new Int32Array( 1 );
	const A1 = diagA();
	const ip1 = new Int32Array( 2 );
	const out1 = zlahef( 'column-major', 'lower', 2, 2, kb, A1, 2, ip1, 1, new Complex128Array( 4 ), 2 );

	const A2 = diagA();
	const ip2 = new Int32Array( 2 );
	const out2 = ndarray( 'lower', 2, 2, kbOut, A2, 1, 2, 0, ip2, 1, 0, new Complex128Array( 4 ), 1, 2, 0 );

	assert.strictEqual( out1, out2, 'info matches' );
	assert.strictEqual( kb[ 0 ], kbOut[ 0 ], 'kb matches' );
	const v1 = new Float64Array( A1.buffer );
	const v2 = new Float64Array( A2.buffer );
	for ( let i = 0; i < v1.length; i++ ) {
		assert.ok( Math.abs( v1[ i ] - v2[ i ] ) < 1e-14, 'A['+i+'] matches' );
	}
});
