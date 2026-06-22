/* eslint-disable no-restricted-syntax, stdlib/first-unit-test, max-len */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import zlaqz1 from './../lib/zlaqz1.js';


// TESTS //

test( 'zlaqz1 is a function', function t() {
	assert.strictEqual( typeof zlaqz1, 'function', 'is a function' );
});

test( 'zlaqz1 has expected arity', function t() {
	assert.strictEqual( zlaqz1.length, 19, 'has expected arity' );
});

test( 'zlaqz1 throws TypeError for invalid order', function t() {
	assert.throws( function throws() {
		zlaqz1( 'invalid', true, true, 1, 0, 4, 4, new Complex128Array( 25 ), 5, new Complex128Array( 25 ), 5, 5, 0, new Complex128Array( 25 ), 5, 5, 0, new Complex128Array( 25 ), 5 );
	}, TypeError );
});

test( 'zlaqz1 throws RangeError for negative k', function t() {
	assert.throws( function throws() {
		zlaqz1( 'column-major', true, true, -1, 0, 4, 4, new Complex128Array( 25 ), 5, new Complex128Array( 25 ), 5, 5, 0, new Complex128Array( 25 ), 5, 5, 0, new Complex128Array( 25 ), 5 );
	}, RangeError );
});

test( 'zlaqz1 does not throw on identity inputs', function t() {
	var A;
	var B;
	var Q;
	var Z;
	var i;
	A = new Complex128Array( 25 );
	B = new Complex128Array( 25 );
	Q = new Complex128Array( 25 );
	Z = new Complex128Array( 25 );
	for ( i = 0; i < 5; i++ ) {
		B.set( [ 1.0, 0.0 ], ( i * 5 ) + i );
		Q.set( [ 1.0, 0.0 ], ( i * 5 ) + i );
		Z.set( [ 1.0, 0.0 ], ( i * 5 ) + i );
	}
	zlaqz1( 'column-major', true, true, 4, 0, 4, 4, A, 5, B, 5, 5, 0, Q, 5, 5, 0, Z, 5 );
	assert.ok( true, 'no throw' );
});
