

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import zsytrf from '../../zsytrf/lib/base.js';
import zsytrs2 from './../lib/ndarray.js';

// FIXTURES //

import _4x4_lower_1rhs from './fixtures/4x4_lower_1rhs.json' with { type: 'json' };
import _4x4_upper_1rhs from './fixtures/4x4_upper_1rhs.json' with { type: 'json' };
import _4x4_indef_lower_1rhs from './fixtures/4x4_indef_lower_1rhs.json' with { type: 'json' };
import _4x4_indef_upper_1rhs from './fixtures/4x4_indef_upper_1rhs.json' with { type: 'json' };
import _3x3_lower_2rhs from './fixtures/3x3_lower_2rhs.json' with { type: 'json' };
import _3x3_upper_2rhs from './fixtures/3x3_upper_2rhs.json' with { type: 'json' };
import n_one_lower from './fixtures/n_one_lower.json' with { type: 'json' };
import n_one_upper from './fixtures/n_one_upper.json' with { type: 'json' };
import _5x5_lower_solve from './fixtures/5x5_lower_solve.json' with { type: 'json' };
import _5x5_upper_solve from './fixtures/5x5_upper_solve.json' with { type: 'json' };

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

/**
* Creates a Complex128Array from interleaved re/im Float64 values.
*/
function c128( arr ) {
	return new Complex128Array( new Float64Array( arr ) );
}

// TESTS //

test( 'zsytrs2: 4x4_lower_1rhs', function t() {
	var WORK;
	var ipiv;
	var info;
	var tc;
	var Bv;
	var A;
	var B;

	tc = _4x4_lower_1rhs;

	// Lower triangular storage (column-major)
	A = c128([
		4, 1, 2, 1, 1, 0, 0, 0,
		0, 0, 5, 2, 2, 1, 1, 0,
		0, 0, 0, 0, 6, 1, 3, 1,
		0, 0, 0, 0, 0, 0, 8, 2
	]);
	B = c128([
		7, 2, 10, 4, 12, 3, 12, 3
	]);
	ipiv = new Int32Array( 4 );
	WORK = new Complex128Array( 4 );

	zsytrf( 'lower', 4, A, 1, 4, 0, ipiv, 1, 0 );
	info = zsytrs2( 'lower', 4, 1, A, 1, 4, 0, ipiv, 1, 0, B, 1, 4, 0, WORK, 1, 0 );

	Bv = reinterpret( B, 0 );
	assert.equal( info, tc.info, 'info' );
	assertArrayClose( Array.from( Bv ), tc.b, 1e-12, 'b' );
});

test( 'zsytrs2: 4x4_upper_1rhs', function t() {
	var WORK;
	var ipiv;
	var info;
	var tc;
	var Bv;
	var A;
	var B;

	tc = _4x4_upper_1rhs;

	// Upper triangular storage (column-major)
	A = c128([
		4, 1, 0, 0, 0, 0, 0, 0,
		2, 1, 5, 2, 0, 0, 0, 0,
		1, 0, 2, 1, 6, 1, 0, 0,
		0, 0, 1, 0, 3, 1, 8, 2
	]);
	B = c128([
		7, 2, 10, 4, 12, 3, 12, 3
	]);
	ipiv = new Int32Array( 4 );
	WORK = new Complex128Array( 4 );

	zsytrf( 'upper', 4, A, 1, 4, 0, ipiv, 1, 0 );
	info = zsytrs2( 'upper', 4, 1, A, 1, 4, 0, ipiv, 1, 0, B, 1, 4, 0, WORK, 1, 0 );

	Bv = reinterpret( B, 0 );
	assert.equal( info, tc.info, 'info' );
	assertArrayClose( Array.from( Bv ), tc.b, 1e-12, 'b' );
});

test( 'zsytrs2: 4x4_indef_lower_1rhs', function t() {
	var WORK;
	var ipiv;
	var info;
	var tc;
	var Bv;
	var A;
	var B;

	tc = _4x4_indef_lower_1rhs;

	// Lower triangular: A(i,j) for j<=i
	A = c128([
		0, 0, 1, 1, 2, 1, 3, 0,
		0, 0, 0, 0, 4, 2, 5, 1,
		0, 0, 0, 0, 0, 0, 6, 3,
		0, 0, 0, 0, 0, 0, 0, 0
	]);
	B = c128([
		6, 2, 10, 4, 12, 6, 14, 4
	]);
	ipiv = new Int32Array( 4 );
	WORK = new Complex128Array( 4 );

	zsytrf( 'lower', 4, A, 1, 4, 0, ipiv, 1, 0 );
	info = zsytrs2( 'lower', 4, 1, A, 1, 4, 0, ipiv, 1, 0, B, 1, 4, 0, WORK, 1, 0 );

	Bv = reinterpret( B, 0 );
	assert.equal( info, tc.info, 'info' );
	assertArrayClose( Array.from( Bv ), tc.b, 1e-12, 'b' );
});

test( 'zsytrs2: 4x4_indef_upper_1rhs', function t() {
	var WORK;
	var ipiv;
	var info;
	var tc;
	var Bv;
	var A;
	var B;

	tc = _4x4_indef_upper_1rhs;

	// Upper triangular storage
	A = c128([
		0, 0, 0, 0, 0, 0, 0, 0,
		1, 1, 0, 0, 0, 0, 0, 0,
		2, 1, 4, 2, 0, 0, 0, 0,
		3, 0, 5, 1, 6, 3, 0, 0
	]);
	B = c128([
		6, 2, 10, 4, 12, 6, 14, 4
	]);
	ipiv = new Int32Array( 4 );
	WORK = new Complex128Array( 4 );

	zsytrf( 'upper', 4, A, 1, 4, 0, ipiv, 1, 0 );
	info = zsytrs2( 'upper', 4, 1, A, 1, 4, 0, ipiv, 1, 0, B, 1, 4, 0, WORK, 1, 0 );

	Bv = reinterpret( B, 0 );
	assert.equal( info, tc.info, 'info' );
	assertArrayClose( Array.from( Bv ), tc.b, 1e-12, 'b' );
});

test( 'zsytrs2: 3x3_lower_2rhs', function t() {
	var WORK;
	var ipiv;
	var info;
	var tc;
	var Bv;
	var A;
	var B;

	tc = _3x3_lower_2rhs;

	A = c128([
		4, 1, 2, 1, 1, 0,
		0, 0, 5, 2, 2, 1,
		0, 0, 0, 0, 6, 1
	]);
	B = c128([
		7, 2, 9, 4, 9, 2,
		14, 4, 18, 8, 18, 4
	]);
	ipiv = new Int32Array( 3 );
	WORK = new Complex128Array( 3 );

	zsytrf( 'lower', 3, A, 1, 3, 0, ipiv, 1, 0 );
	info = zsytrs2( 'lower', 3, 2, A, 1, 3, 0, ipiv, 1, 0, B, 1, 3, 0, WORK, 1, 0 );

	Bv = reinterpret( B, 0 );
	assert.equal( info, tc.info, 'info' );
	assertArrayClose( Array.from( Bv ), tc.b, 1e-12, 'b' );
});

test( 'zsytrs2: 3x3_upper_2rhs', function t() {
	var WORK;
	var ipiv;
	var info;
	var tc;
	var Bv;
	var A;
	var B;

	tc = _3x3_upper_2rhs;

	A = c128([
		4, 1, 0, 0, 0, 0,
		2, 1, 5, 2, 0, 0,
		1, 0, 2, 1, 6, 1
	]);
	B = c128([
		7, 2, 9, 4, 9, 2,
		14, 4, 18, 8, 18, 4
	]);
	ipiv = new Int32Array( 3 );
	WORK = new Complex128Array( 3 );

	zsytrf( 'upper', 3, A, 1, 3, 0, ipiv, 1, 0 );
	info = zsytrs2( 'upper', 3, 2, A, 1, 3, 0, ipiv, 1, 0, B, 1, 3, 0, WORK, 1, 0 );

	Bv = reinterpret( B, 0 );
	assert.equal( info, tc.info, 'info' );
	assertArrayClose( Array.from( Bv ), tc.b, 1e-12, 'b' );
});

test( 'zsytrs2: n_zero', function t() {
	var WORK;
	var ipiv;
	var info;
	var A;
	var B;

	A = new Complex128Array( 1 );
	B = new Complex128Array( 1 );
	ipiv = new Int32Array( 1 );
	WORK = new Complex128Array( 1 );

	info = zsytrs2( 'lower', 0, 1, A, 1, 1, 0, ipiv, 1, 0, B, 1, 1, 0, WORK, 1, 0 );
	assert.equal( info, 0, 'info' );
});

test( 'zsytrs2: nrhs_zero', function t() {
	var WORK;
	var ipiv;
	var info;
	var A;
	var B;

	A = new Complex128Array( 9 );
	B = new Complex128Array( 3 );
	ipiv = new Int32Array( 3 );
	WORK = new Complex128Array( 3 );

	info = zsytrs2( 'lower', 3, 0, A, 1, 3, 0, ipiv, 1, 0, B, 1, 3, 0, WORK, 1, 0 );
	assert.equal( info, 0, 'info' );
});

test( 'zsytrs2: n_one_lower', function t() {
	var WORK;
	var ipiv;
	var info;
	var tc;
	var Bv;
	var A;
	var B;

	tc = n_one_lower;

	A = c128([ 4, 1 ]);
	B = c128([ 8, 2 ]);
	ipiv = new Int32Array( 1 );
	WORK = new Complex128Array( 1 );

	zsytrf( 'lower', 1, A, 1, 1, 0, ipiv, 1, 0 );
	info = zsytrs2( 'lower', 1, 1, A, 1, 1, 0, ipiv, 1, 0, B, 1, 1, 0, WORK, 1, 0 );

	Bv = reinterpret( B, 0 );
	assert.equal( info, tc.info, 'info' );
	assertArrayClose( Array.from( Bv ), tc.b, 1e-12, 'b' );
});

test( 'zsytrs2: n_one_upper', function t() {
	var WORK;
	var ipiv;
	var info;
	var tc;
	var Bv;
	var A;
	var B;

	tc = n_one_upper;

	A = c128([ 4, 1 ]);
	B = c128([ 8, 2 ]);
	ipiv = new Int32Array( 1 );
	WORK = new Complex128Array( 1 );

	zsytrf( 'upper', 1, A, 1, 1, 0, ipiv, 1, 0 );
	info = zsytrs2( 'upper', 1, 1, A, 1, 1, 0, ipiv, 1, 0, B, 1, 1, 0, WORK, 1, 0 );

	Bv = reinterpret( B, 0 );
	assert.equal( info, tc.info, 'info' );
	assertArrayClose( Array.from( Bv ), tc.b, 1e-12, 'b' );
});

test( 'zsytrs2: 5x5_lower_solve', function t() {
	var WORK;
	var ipiv;
	var info;
	var tc;
	var Bv;
	var A;
	var B;

	tc = _5x5_lower_solve;

	// 5x5 lower triangular storage (column-major)
	A = c128([
		1, 1, -2, 1, 0, 0, 3, 1, 1, 0,
		0, 0, 0, 0, 4, 2, -1, 1, 2, 0,
		0, 0, 0, 0, -3, 1, 2, 0, 0, 0,
		0, 0, 0, 0, 0, 0, 1, 1, -2, 1,
		0, 0, 0, 0, 0, 0, 0, 0, 4, 2
	]);
	B = c128([
		14, 7, 16, 11, 7, 7, 1, 12, 17, 14
	]);
	ipiv = new Int32Array( 5 );
	WORK = new Complex128Array( 5 );

	zsytrf( 'lower', 5, A, 1, 5, 0, ipiv, 1, 0 );
	info = zsytrs2( 'lower', 5, 1, A, 1, 5, 0, ipiv, 1, 0, B, 1, 5, 0, WORK, 1, 0 );

	Bv = reinterpret( B, 0 );
	assert.equal( info, tc.info, 'info' );
	assertArrayClose( Array.from( Bv ), tc.b, 1e-12, 'b' );
});

test( 'zsytrs2: 5x5_upper_solve', function t() {
	var WORK;
	var ipiv;
	var info;
	var tc;
	var Bv;
	var A;
	var B;

	tc = _5x5_upper_solve;

	// 5x5 upper triangular storage (column-major)
	A = c128([
		1, 1, 0, 0, 0, 0, 0, 0, 0, 0,
		-2, 1, 0, 0, 0, 0, 0, 0, 0, 0,
		0, 0, 4, 2, -3, 1, 0, 0, 0, 0,
		3, 1, -1, 1, 2, 0, 1, 1, 0, 0,
		1, 0, 2, 0, 0, 0, -2, 1, 4, 2
	]);
	B = c128([
		14, 7, 16, 11, 7, 7, 1, 12, 17, 14
	]);
	ipiv = new Int32Array( 5 );
	WORK = new Complex128Array( 5 );

	zsytrf( 'upper', 5, A, 1, 5, 0, ipiv, 1, 0 );
	info = zsytrs2( 'upper', 5, 1, A, 1, 5, 0, ipiv, 1, 0, B, 1, 5, 0, WORK, 1, 0 );

	Bv = reinterpret( B, 0 );
	assert.equal( info, tc.info, 'info' );
	assertArrayClose( Array.from( Bv ), tc.b, 1e-12, 'b' );
});
