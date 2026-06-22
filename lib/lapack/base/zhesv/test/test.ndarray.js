// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import zhesv from './../lib/ndarray.js';

// FIXTURES //

import upper_4x4_1rhs from './fixtures/upper_4x4_1rhs.json' with { type: 'json' };
import lower_4x4_2rhs from './fixtures/lower_4x4_2rhs.json' with { type: 'json' };
import n1 from './fixtures/n1.json' with { type: 'json' };

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

test( 'zhesv: N=0 quick return', function t() {
	var WORK;
	var IPIV;
	var info;
	var A;
	var B;

	A = new Complex128Array( 0 );
	B = new Complex128Array( 0 );
	IPIV = new Int32Array( 0 );
	WORK = new Complex128Array( 0 );

	info = zhesv( 'upper', 0, 1, A, 1, 1, 0, IPIV, 1, 0, B, 1, 1, 0, WORK, 1, 0, 0 );
	assert.equal( info, 0 );
});

test( 'zhesv: upper_4x4_1rhs (fixture, lwork >= N uses zhetrs2)', function t() {
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

	// Upper Hermitian 4x4
	A = new Complex128Array([
		4, 0,    0, 0,    0, 0,    0, 0,
		1, 2,    5, 0,    0, 0,    0, 0,
		3, -1,   2, 1,    7, 0,    0, 0,
		0.5, 0.5, 1, -2,  3, 0,    6, 0
	]);
	IPIV = new Int32Array( n );

	B = new Complex128Array([ 1, 0,  2, 1,  -1, 3,  0.5, -0.5 ]);
	WORK = new Complex128Array( 256 );

	info = zhesv( 'upper', n, 1, A, 1, n, 0, IPIV, 1, 0, B, 1, n, 0, WORK, 1, 0, 256 );

	assert.equal( info, tc.info );
	Bv = reinterpret( B, 0 );
	assertArrayClose( Array.from( Bv ), tc.B, 1e-12, 'B' );
});

test( 'zhesv: lower_4x4_2rhs (fixture)', function t() {
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

	B = new Complex128Array([
		1, 0,  2, 1,  -1, 3,  0.5, -0.5,
		0, 1,  1, 0,  2, -1,  -1, 2
	]);
	WORK = new Complex128Array( 256 );

	info = zhesv( 'lower', n, nrhs, A, 1, n, 0, IPIV, 1, 0, B, 1, n, 0, WORK, 1, 0, 256 );

	assert.equal( info, tc.info );
	Bv = reinterpret( B, 0 );
	// Fixture B has LDB=NMAX=6, extract N entries per RHS column
	var expected = [];
	var j2;
	var i2;
	for ( j2 = 0; j2 < nrhs; j2++ ) {
		for ( i2 = 0; i2 < n * 2; i2++ ) {
			expected.push( tc.B[ j2 * 6 * 2 + i2 ] );
		}
	}
	assertArrayClose( Array.from( Bv ), expected, 1e-12, 'B' );
});

test( 'zhesv: n1 (fixture)', function t() {
	var WORK;
	var IPIV;
	var info;
	var tc;
	var Bv;
	var A;
	var B;

	tc = n1;

	A = new Complex128Array([ 3, 0 ]);
	IPIV = new Int32Array( 1 );

	B = new Complex128Array([ 6, 3 ]);
	WORK = new Complex128Array( 1 );

	info = zhesv( 'upper', 1, 1, A, 1, 1, 0, IPIV, 1, 0, B, 1, 1, 0, WORK, 1, 0, 1 );

	assert.equal( info, tc.info );
	Bv = reinterpret( B, 0 );
	assertArrayClose( Array.from( Bv ), tc.B, 1e-14, 'B' );
});

test( 'zhesv: upper with lwork < N (falls back to zhetrs)', function t() {
	// When lwork < N, zhesv should use zhetrs instead of zhetrs2
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
		1, 2,    5, 0,    0, 0,    0, 0,
		3, -1,   2, 1,    7, 0,    0, 0,
		0.5, 0.5, 1, -2,  3, 0,    6, 0
	]);
	IPIV = new Int32Array( n );

	B = new Complex128Array([ 1, 0,  2, 1,  -1, 3,  0.5, -0.5 ]);
	WORK = new Complex128Array( 1 );

	info = zhesv( 'upper', n, 1, A, 1, n, 0, IPIV, 1, 0, B, 1, n, 0, WORK, 1, 0, 1 );

	assert.equal( info, 0 );
	Bv = reinterpret( B, 0 );
	for ( i = 0; i < Bv.length; i++ ) {
		assert.ok( isFinite( Bv[ i ] ), 'B[' + i + '] should be finite' );
	}
});

test( 'zhesv: lower with lwork < N (falls back to zhetrs)', function t() {
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
		4, 0,    1, -2,   3, 1,    0.5, -0.5,
		0, 0,    5, 0,    2, -1,   1, 2,
		0, 0,    0, 0,    7, 0,    3, 0,
		0, 0,    0, 0,    0, 0,    6, 0
	]);
	IPIV = new Int32Array( n );

	B = new Complex128Array([ 1, 0,  2, 1,  -1, 3,  0.5, -0.5 ]);
	WORK = new Complex128Array( 1 );

	info = zhesv( 'lower', n, 1, A, 1, n, 0, IPIV, 1, 0, B, 1, n, 0, WORK, 1, 0, 1 );

	assert.equal( info, 0 );
	Bv = reinterpret( B, 0 );
	for ( i = 0; i < Bv.length; i++ ) {
		assert.ok( isFinite( Bv[ i ] ), 'B[' + i + '] should be finite' );
	}
});

test( 'zhesv: singular matrix returns info > 0', function t() {
	var WORK;
	var IPIV;
	var info;
	var A;
	var B;
	var n;

	n = 3;

	A = new Complex128Array([
		0, 0,  0, 0,  0, 0,
		0, 0,  3, 0,  1, -1,
		0, 0,  0, 0,  2, 0
	]);
	B = new Complex128Array([ 1, 0,  2, 1,  3, -1 ]);
	IPIV = new Int32Array( n );
	WORK = new Complex128Array( n );

	info = zhesv( 'lower', n, 1, A, 1, n, 0, IPIV, 1, 0, B, 1, n, 0, WORK, 1, 0, n );

	assert.ok( info > 0, 'singular should return info > 0' );
});

test( 'zhesv: upper with 2x2 pivots', function t() {
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
		10, 0,  0, 0,  0, 0,  0, 0,  0, 0,  0, 0,
		0.5, 0.5,  10, 0,  0, 0,  0, 0,  0, 0,  0, 0,
		0.3, -0.3,  0.4, 0.4,  10, 0,  0, 0,  0, 0,  0, 0,
		0.2, 0.1,  0.1, -0.2,  0.5, 0,  10, 0,  0, 0,  0, 0,
		1, 1,  2, -1,  3, 0.5,  1.5, -0.5,  0.01, 0,  0, 0,
		2, -1,  1, 1,  0.5, 0.5,  2, 0,  5, 1,  0.02, 0
	]);
	IPIV = new Int32Array( n );

	B = new Complex128Array([ 1, 0,  2, -1,  0.5, 0.5,  -1, 3,  2, 0,  1, -1 ]);
	WORK = new Complex128Array( n );

	info = zhesv( 'upper', n, 1, A, 1, n, 0, IPIV, 1, 0, B, 1, n, 0, WORK, 1, 0, n );

	assert.equal( info, 0 );
	Bv = reinterpret( B, 0 );
	for ( i = 0; i < Bv.length; i++ ) {
		assert.ok( isFinite( Bv[ i ] ), 'B[' + i + '] should be finite' );
	}
});

test( 'zhesv: lower with 2x2 pivots', function t() {
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

	B = new Complex128Array([ 1, 0,  2, -1,  0.5, 0.5,  -1, 3,  2, 0,  1, -1 ]);
	WORK = new Complex128Array( n );

	info = zhesv( 'lower', n, 1, A, 1, n, 0, IPIV, 1, 0, B, 1, n, 0, WORK, 1, 0, n );

	assert.equal( info, 0 );
	Bv = reinterpret( B, 0 );
	for ( i = 0; i < Bv.length; i++ ) {
		assert.ok( isFinite( Bv[ i ] ), 'B[' + i + '] should be finite' );
	}
});

test( 'zhesv: lower 4x4 multiple RHS', function t() {
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

	B = new Complex128Array([
		1, 0,  2, 1,  -1, 3,  0.5, -0.5,
		0, 1,  1, 0,  2, -1,  -1, 2,
		3, -1,  0, 0.5,  1, 1,  -2, 0
	]);
	WORK = new Complex128Array( n );

	info = zhesv( 'lower', n, nrhs, A, 1, n, 0, IPIV, 1, 0, B, 1, n, 0, WORK, 1, 0, n );

	assert.equal( info, 0 );
	Bv = reinterpret( B, 0 );
	for ( i = 0; i < Bv.length; i++ ) {
		assert.ok( isFinite( Bv[ i ] ), 'B[' + i + '] should be finite' );
	}
});
