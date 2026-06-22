
/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */


// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import ztgex2 from './../lib/index.js';


// TESTS //

test( 'main export is a function', function t() {
	assert.strictEqual( typeof ztgex2, 'function', 'main export is a function' );
});

test( 'main export has an ndarray method', function t() {
	assert.strictEqual( typeof ztgex2.ndarray, 'function', 'has ndarray method' );
});

test( 'ndarray: basic 2x2 swap returns info=0', function t() {
	var info;
	var Av;
	var Bv;
	var N;
	var A;
	var B;
	var Q;
	var Z;

	N = 2;
	A = new Complex128Array( [ 1.0, 0.5, 0.0, 0.0, 0.3, 0.1, 2.0, -0.3 ] );
	B = new Complex128Array( [ 1.0, 0.0, 0.0, 0.0, 0.2, -0.1, 0.5, 0.2 ] );
	Q = new Complex128Array( [ 1.0, 0.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0 ] );
	Z = new Complex128Array( [ 1.0, 0.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0 ] );
	info = ztgex2.ndarray( true, true, N, A, 1, N, 0, B, 1, N, 0, Q, 1, N, 0, Z, 1, N, 0, 0 ); // eslint-disable-line max-len
	assert.strictEqual( info, 0, 'returns info=0' );
	Av = reinterpret( A, 0 );
	assert.strictEqual( Av[ 2 ], 0.0, 'A(2,1) real part is zero' );
	assert.strictEqual( Av[ 3 ], 0.0, 'A(2,1) imag part is zero' );
	Bv = reinterpret( B, 0 );
	assert.strictEqual( Bv[ 2 ], 0.0, 'B(2,1) real part is zero' );
	assert.strictEqual( Bv[ 3 ], 0.0, 'B(2,1) imag part is zero' );
});

test( 'ndarray: N=1 quick return', function t() {
	var info;
	var A;
	var B;
	var Q;
	var Z;

	A = new Complex128Array( [ 5.0, 1.0 ] );
	B = new Complex128Array( [ 1.0, 0.0 ] );
	Q = new Complex128Array( 1 );
	Z = new Complex128Array( 1 );
	info = ztgex2.ndarray( true, true, 1, A, 1, 1, 0, B, 1, 1, 0, Q, 1, 1, 0, Z, 1, 1, 0, 0 ); // eslint-disable-line max-len
	assert.strictEqual( info, 0, 'returns info=0 for N=1' );
});
