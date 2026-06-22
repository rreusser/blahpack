

/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import ztgexc from './../lib/index.js';


// TESTS //

test( 'main export is a function', function t() {
	assert.strictEqual( typeof ztgexc, 'function', 'is a function' );
});

test( 'attached ndarray method is a function', function t() {
	assert.strictEqual( typeof ztgexc.ndarray, 'function', 'is a function' );
});

test( 'ndarray method performs a basic swap', function t() {
	var result;
	var A;
	var B;
	var Q;
	var Z;
	var Av;

	A = new Complex128Array( [ 1.0, 0.5, 0.0, 0.0, 0.3, 0.1, 2.0, -0.3 ] );
	B = new Complex128Array( [ 1.0, 0.0, 0.0, 0.0, 0.2, -0.1, 0.5, 0.2 ] );
	Q = new Complex128Array( [ 1.0, 0.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0 ] );
	Z = new Complex128Array( [ 1.0, 0.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0 ] );

	result = ztgexc.ndarray( true, true, 2, A, 1, 2, 0, B, 1, 2, 0, Q, 1, 2, 0, Z, 1, 2, 0, 0, 1 );

	assert.equal( result.info, 0, 'info is zero' );
	assert.equal( result.ilst, 0, 'ilst is updated' );

	// After swap, diagonal elements should be reordered:
	Av = reinterpret( A, 0 );
	assert.notEqual( Av[ 0 ], 1.0, 'A(0,0) changed' );
});
