// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import zhetf2 from '../../zhetf2/lib/base.js';
import zhetrs2 from './../lib/ndarray.js';

// FIXTURES //

import upper_4x4_1rhs from './fixtures/upper_4x4_1rhs.json' with { type: 'json' };
import lower_4x4_2rhs from './fixtures/lower_4x4_2rhs.json' with { type: 'json' };

// FUNCTIONS //

function assertClose( actual, expected, tol, msg ) {
	var relErr = Math.abs( actual - expected ) / Math.max( Math.abs( expected ), 1.0 );
	assert.ok( relErr <= tol, msg + ': expected ' + expected + ', got ' + actual );
}

function assertArrayClose( actual, expected, tol, msg ) {
	var i;
	assert.equal( actual.length, expected.length, msg + ': length mismatch' );
	for ( i = 0; i < expected.length; i++ ) {
		assertClose( actual[ i ], expected[ i ], tol, msg + '[' + i + ']' );
	}
}

// TESTS //

test( 'zhetrs2: N=0 quick return', function t() {
	var WORK;
	var IPIV;
	var info;
	var A;
	var B;

	A = new Complex128Array( 0 );
	B = new Complex128Array( 0 );
	IPIV = new Int32Array( 0 );
	WORK = new Complex128Array( 0 );

	info = zhetrs2( 'upper', 0, 1, A, 1, 1, 0, IPIV, 1, 0, B, 1, 1, 0, WORK, 1, 0 );
	assert.equal( info, 0 );
});

test( 'zhetrs2: NRHS=0 quick return', function t() {
	var WORK;
	var IPIV;
	var info;
	var A;
	var B;

	A = new Complex128Array( 4 );
	B = new Complex128Array( 0 );
	IPIV = new Int32Array( 2 );
	WORK = new Complex128Array( 2 );

	info = zhetrs2( 'upper', 2, 0, A, 1, 2, 0, IPIV, 1, 0, B, 1, 0, 0, WORK, 1, 0 );
	assert.equal( info, 0 );
});

test( 'zhetrs2: upper_4x4_1rhs (fixture)', function t() {
	var WORK;
	var IPIV;
	var info;
	var tc;
	var Bv;
	var A;
	var B;
	var n;

	tc = upper_4x4_1rhs;
	n = 4;

	A = new Complex128Array([
		4, 0,    0, 0,    0, 0,    0, 0,
		1, 2,    5, 0,    0, 0,    0, 0,
		3, -1,   2, 1,    7, 0,    0, 0,
		0.5, 0.5, 1, -2,  3, 0,    6, 0
	]);
	IPIV = new Int32Array( n );

	info = zhetf2( 'upper', n, A, 1, n, 0, IPIV, 1, 0 );
	assert.equal( info, 0 );

	B = new Complex128Array([ 1, 0,  2, 1,  -1, 3,  0.5, -0.5 ]);
	WORK = new Complex128Array( n );

	info = zhetrs2( 'upper', n, 1, A, 1, n, 0, IPIV, 1, 0, B, 1, n, 0, WORK, 1, 0 );

	assert.equal( info, 0 );
	Bv = reinterpret( B, 0 );
	assertArrayClose( Array.from( Bv ), tc.B, 1e-12, 'B' );
});

test( 'zhetrs2: lower_4x4_2rhs (fixture)', function t() {
	var expected;
	var WORK;
	var IPIV;
	var info;
	var tc;
	var Bv;
	var A;
	var B;
	var n;
	var nrhs;

	tc = lower_4x4_2rhs;
	n = 4;
	nrhs = 2;

	A = new Complex128Array([
		4, 0,    1, -2,   3, 1,    0.5, -0.5,
		0, 0,    5, 0,    2, -1,   1, 2,
		0, 0,    0, 0,    7, 0,    3, 0,
		0, 0,    0, 0,    0, 0,    6, 0
	]);
	IPIV = new Int32Array( n );

	info = zhetf2( 'lower', n, A, 1, n, 0, IPIV, 1, 0 );
	assert.equal( info, 0 );

	B = new Complex128Array([
		1, 0,  2, 1,  -1, 3,  0.5, -0.5,
		0, 1,  1, 0,  2, -1,  -1, 2
	]);
	WORK = new Complex128Array( n );

	info = zhetrs2( 'lower', n, nrhs, A, 1, n, 0, IPIV, 1, 0, B, 1, n, 0, WORK, 1, 0 );

	assert.equal( info, 0 );
	Bv = reinterpret( B, 0 );

	expected = tc.B.slice( 0, 2 * n * nrhs );
	assertArrayClose( Array.from( Bv ), expected, 1e-12, 'B' );
});

test( 'zhetrs2: upper n=1', function t() {
	var WORK;
	var IPIV;
	var info;
	var Bv;
	var A;
	var B;

	A = new Complex128Array([ 5, 0 ]);
	IPIV = new Int32Array([ 0 ]);

	info = zhetf2( 'upper', 1, A, 1, 1, 0, IPIV, 1, 0 );
	assert.equal( info, 0 );

	B = new Complex128Array([ 10, 5 ]);
	WORK = new Complex128Array( 1 );

	info = zhetrs2( 'upper', 1, 1, A, 1, 1, 0, IPIV, 1, 0, B, 1, 1, 0, WORK, 1, 0 );
	assert.equal( info, 0 );

	Bv = reinterpret( B, 0 );
	assertClose( Bv[ 0 ], 2.0, 1e-14, 'B real' );
	assertClose( Bv[ 1 ], 1.0, 1e-14, 'B imag' );
});

test( 'zhetrs2: lower n=1', function t() {
	var WORK;
	var IPIV;
	var info;
	var Bv;
	var A;
	var B;

	A = new Complex128Array([ 4, 0 ]);
	IPIV = new Int32Array([ 0 ]);

	info = zhetf2( 'lower', 1, A, 1, 1, 0, IPIV, 1, 0 );
	assert.equal( info, 0 );

	B = new Complex128Array([ 8, 4 ]);
	WORK = new Complex128Array( 1 );

	info = zhetrs2( 'lower', 1, 1, A, 1, 1, 0, IPIV, 1, 0, B, 1, 1, 0, WORK, 1, 0 );
	assert.equal( info, 0 );

	Bv = reinterpret( B, 0 );
	assertClose( Bv[ 0 ], 2.0, 1e-14, 'B real' );
	assertClose( Bv[ 1 ], 1.0, 1e-14, 'B imag' );
});

test( 'zhetrs2: upper 4x4 with interchange (kp != k)', function t() {
	var WORK;
	var IPIV;
	var info;
	var Bv;
	var A;
	var B;
	var n;
	var i;

	n = 4;

	A = new Complex128Array([
		4, 0,    0, 0,    0, 0,    0, 0,
		0.5, 0.5, 5, 0,   0, 0,    0, 0,
		0.3, -0.3, 0.4, 0.4, 7, 0, 0, 0,
		3, 1,    0.5, -0.5, 1, 0,  6, 0
	]);
	IPIV = new Int32Array( n );

	info = zhetf2( 'upper', n, A, 1, n, 0, IPIV, 1, 0 );
	assert.equal( info, 0 );

	B = new Complex128Array([ 1, 0, 2, 1, -1, 3, 0.5, -0.5 ]);
	WORK = new Complex128Array( n );

	info = zhetrs2( 'upper', n, 1, A, 1, n, 0, IPIV, 1, 0, B, 1, n, 0, WORK, 1, 0 );
	assert.equal( info, 0 );

	Bv = reinterpret( B, 0 );
	for ( i = 0; i < Bv.length; i++ ) {
		assert.ok( isFinite( Bv[ i ] ), 'B[' + i + '] should be finite' );
	}
});

test( 'zhetrs2: lower 4x4 with interchange and 3 RHS', function t() {
	var WORK;
	var IPIV;
	var info;
	var Bv;
	var A;
	var B;
	var n;
	var nrhs;
	var i;

	n = 4;
	nrhs = 3;

	A = new Complex128Array([
		4, 0,    1, -2,   3, 1,    0.5, -0.5,
		0, 0,    5, 0,    2, -1,   1, 2,
		0, 0,    0, 0,    7, 0,    3, 0,
		0, 0,    0, 0,    0, 0,    6, 0
	]);
	IPIV = new Int32Array( n );

	info = zhetf2( 'lower', n, A, 1, n, 0, IPIV, 1, 0 );
	assert.equal( info, 0 );

	B = new Complex128Array([
		1, 0,  2, 1,  -1, 3,  0.5, -0.5,
		0, 1,  1, 0,  2, -1,  -1, 2,
		3, -1,  0, 0.5,  1, 1,  -2, 0
	]);
	WORK = new Complex128Array( n );

	info = zhetrs2( 'lower', n, nrhs, A, 1, n, 0, IPIV, 1, 0, B, 1, n, 0, WORK, 1, 0 );
	assert.equal( info, 0 );

	Bv = reinterpret( B, 0 );
	for ( i = 0; i < Bv.length; i++ ) {
		assert.ok( isFinite( Bv[ i ] ), 'B[' + i + '] should be finite' );
	}
});

test( 'zhetrs2: upper with 2x2 pivots', function t() {
	var WORK;
	var IPIV;
	var info;
	var Bv;
	var A;
	var B;
	var n;
	var i;

	n = 6;

	// Upper Hermitian with small diagonal to force 2x2 pivots
	A = new Complex128Array([
		10, 0,  0, 0,  0, 0,  0, 0,  0, 0,  0, 0,
		0.5, 0.5,  10, 0,  0, 0,  0, 0,  0, 0,  0, 0,
		0.3, -0.3,  0.4, 0.4,  10, 0,  0, 0,  0, 0,  0, 0,
		0.2, 0.1,  0.1, -0.2,  0.5, 0,  10, 0,  0, 0,  0, 0,
		1, 1,  2, -1,  3, 0.5,  1.5, -0.5,  0.01, 0,  0, 0,
		2, -1,  1, 1,  0.5, 0.5,  2, 0,  5, 1,  0.02, 0
	]);
	IPIV = new Int32Array( n );

	info = zhetf2( 'upper', n, A, 1, n, 0, IPIV, 1, 0 );
	assert.equal( info, 0 );

	B = new Complex128Array([ 1, 0,  2, -1,  0.5, 0.5,  -1, 3,  2, 0,  1, -1 ]);
	WORK = new Complex128Array( n );

	info = zhetrs2( 'upper', n, 1, A, 1, n, 0, IPIV, 1, 0, B, 1, n, 0, WORK, 1, 0 );
	assert.equal( info, 0 );

	Bv = reinterpret( B, 0 );
	for ( i = 0; i < Bv.length; i++ ) {
		assert.ok( isFinite( Bv[ i ] ), 'B[' + i + '] should be finite' );
	}
});

test( 'zhetrs2: lower with 2x2 pivots', function t() {
	var WORK;
	var IPIV;
	var info;
	var Bv;
	var A;
	var B;
	var n;
	var i;

	n = 6;

	A = new Complex128Array([
		0.01, 0,  5, -1,  1, 1,  0.5, -0.5,  2, 0,  1, -1,
		0, 0,  0.02, 0,  2, -1,  1, 1,  1.5, -0.5,  0, -3,
		0, 0,  0, 0,  8, 0,  3, 0,  0, 2,  1, 0,
		0, 0,  0, 0,  0, 0,  7, 0,  1, 0.5,  2, -2,
		0, 0,  0, 0,  0, 0,  0, 0,  6, 0,  0.5, 1,
		0, 0,  0, 0,  0, 0,  0, 0,  0, 0,  5, 0
	]);
	IPIV = new Int32Array( n );

	info = zhetf2( 'lower', n, A, 1, n, 0, IPIV, 1, 0 );
	assert.equal( info, 0 );

	B = new Complex128Array([ 1, 0,  2, -1,  0.5, 0.5,  -1, 3,  2, 0,  1, -1 ]);
	WORK = new Complex128Array( n );

	info = zhetrs2( 'lower', n, 1, A, 1, n, 0, IPIV, 1, 0, B, 1, n, 0, WORK, 1, 0 );
	assert.equal( info, 0 );

	Bv = reinterpret( B, 0 );
	for ( i = 0; i < Bv.length; i++ ) {
		assert.ok( isFinite( Bv[ i ] ), 'B[' + i + '] should be finite' );
	}
});

test( 'zhetrs2: lower with 2x2 pivots and multiple RHS', function t() {
	var WORK;
	var IPIV;
	var info;
	var Bv;
	var A;
	var B;
	var n;
	var nrhs;
	var i;

	n = 6;
	nrhs = 3;

	A = new Complex128Array([
		0.01, 0,  5, -1,  1, 1,  0.5, -0.5,  2, 0,  1, -1,
		0, 0,  0.02, 0,  2, -1,  1, 1,  1.5, -0.5,  0, -3,
		0, 0,  0, 0,  8, 0,  3, 0,  0, 2,  1, 0,
		0, 0,  0, 0,  0, 0,  7, 0,  1, 0.5,  2, -2,
		0, 0,  0, 0,  0, 0,  0, 0,  6, 0,  0.5, 1,
		0, 0,  0, 0,  0, 0,  0, 0,  0, 0,  5, 0
	]);
	IPIV = new Int32Array( n );

	info = zhetf2( 'lower', n, A, 1, n, 0, IPIV, 1, 0 );
	assert.equal( info, 0 );

	B = new Complex128Array([
		1, 0,  2, -1,  0.5, 0.5,  -1, 3,  2, 0,  1, -1,
		0, 1,  1, 0,  2, -1,  -1, 2,  0.5, 0.5,  3, 0,
		2, 1,  -1, 0.5,  0, 3,  1, -2,  -0.5, 1,  2, 2
	]);
	WORK = new Complex128Array( n );

	info = zhetrs2( 'lower', n, nrhs, A, 1, n, 0, IPIV, 1, 0, B, 1, n, 0, WORK, 1, 0 );
	assert.equal( info, 0 );

	Bv = reinterpret( B, 0 );
	for ( i = 0; i < Bv.length; i++ ) {
		assert.ok( isFinite( Bv[ i ] ), 'B[' + i + '] should be finite' );
	}
});

test( 'zhetrs2: upper 3x3 diag dominant', function t() {
	var WORK;
	var IPIV;
	var info;
	var Bv;
	var A;
	var B;
	var n;
	var i;

	n = 3;

	A = new Complex128Array([
		10, 0,   0, 0,    0, 0,
		1, 1,    10, 0,   0, 0,
		0.5, -0.5, 1, 0,  10, 0
	]);
	IPIV = new Int32Array( n );

	info = zhetf2( 'upper', n, A, 1, n, 0, IPIV, 1, 0 );
	assert.equal( info, 0 );

	B = new Complex128Array([ 5, 0, 3, 1, 2, -1 ]);
	WORK = new Complex128Array( n );

	info = zhetrs2( 'upper', n, 1, A, 1, n, 0, IPIV, 1, 0, B, 1, n, 0, WORK, 1, 0 );
	assert.equal( info, 0 );

	Bv = reinterpret( B, 0 );
	for ( i = 0; i < Bv.length; i++ ) {
		assert.ok( isFinite( Bv[ i ] ), 'B[' + i + '] should be finite' );
	}
});

test( 'zhetrs2: lower 3x3 diag dominant', function t() {
	var WORK;
	var IPIV;
	var info;
	var Bv;
	var A;
	var B;
	var n;
	var i;

	n = 3;

	A = new Complex128Array([
		10, 0,   1, -1,   0.5, 0.5,
		0, 0,    10, 0,   1, 0,
		0, 0,    0, 0,    10, 0
	]);
	IPIV = new Int32Array( n );

	info = zhetf2( 'lower', n, A, 1, n, 0, IPIV, 1, 0 );
	assert.equal( info, 0 );

	B = new Complex128Array([ 5, 0, 3, 1, 2, -1 ]);
	WORK = new Complex128Array( n );

	info = zhetrs2( 'lower', n, 1, A, 1, n, 0, IPIV, 1, 0, B, 1, n, 0, WORK, 1, 0 );
	assert.equal( info, 0 );

	Bv = reinterpret( B, 0 );
	for ( i = 0; i < Bv.length; i++ ) {
		assert.ok( isFinite( Bv[ i ] ), 'B[' + i + '] should be finite' );
	}
});

test( 'zhetrs2: upper 4x4 with 2 RHS', function t() {
	var WORK;
	var IPIV;
	var info;
	var Bv;
	var A;
	var B;
	var n;
	var nrhs;
	var i;

	n = 4;
	nrhs = 2;

	A = new Complex128Array([
		4, 0,    0, 0,    0, 0,    0, 0,
		1, 2,    5, 0,    0, 0,    0, 0,
		3, -1,   2, 1,    7, 0,    0, 0,
		0.5, 0.5, 1, -2,  3, 0,    6, 0
	]);
	IPIV = new Int32Array( n );

	info = zhetf2( 'upper', n, A, 1, n, 0, IPIV, 1, 0 );
	assert.equal( info, 0 );

	B = new Complex128Array([
		1, 0,  2, 1,  -1, 3,  0.5, -0.5,
		0, 1,  1, 0,  2, -1,  -1, 2
	]);
	WORK = new Complex128Array( n );

	info = zhetrs2( 'upper', n, nrhs, A, 1, n, 0, IPIV, 1, 0, B, 1, n, 0, WORK, 1, 0 );
	assert.equal( info, 0 );

	Bv = reinterpret( B, 0 );
	for ( i = 0; i < Bv.length; i++ ) {
		assert.ok( isFinite( Bv[ i ] ), 'B[' + i + '] should be finite' );
	}
});
