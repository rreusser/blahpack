
// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import zhegvx from './../lib/ndarray.js';

// FIXTURES //

import itype1_v_all_upper from './fixtures/itype1_v_all_upper.json' with { type: 'json' };
import itype1_v_all_lower from './fixtures/itype1_v_all_lower.json' with { type: 'json' };
import itype1_n_all_upper from './fixtures/itype1_n_all_upper.json' with { type: 'json' };
import itype1_v_value_upper from './fixtures/itype1_v_value_upper.json' with { type: 'json' };
import itype1_v_index_upper from './fixtures/itype1_v_index_upper.json' with { type: 'json' };
import itype2_v_all_upper from './fixtures/itype2_v_all_upper.json' with { type: 'json' };
import itype3_v_all_lower from './fixtures/itype3_v_all_lower.json' with { type: 'json' };
import n_zero from './fixtures/n_zero.json' with { type: 'json' };
import n_one from './fixtures/n_one.json' with { type: 'json' };
import not_posdef from './fixtures/not_posdef.json' with { type: 'json' };
import itype2_v_index_lower from './fixtures/itype2_v_index_lower.json' with { type: 'json' };
import itype3_v_value_upper from './fixtures/itype3_v_value_upper.json' with { type: 'json' };
import itype1_n_value_lower from './fixtures/itype1_n_value_lower.json' with { type: 'json' };
import itype1_v_index_single from './fixtures/itype1_v_index_single.json' with { type: 'json' };

// FUNCTIONS //

function assertClose( actual, expected, tol, msg ) {
	const relErr = Math.abs( actual - expected ) / Math.max( Math.abs( expected ), 1.0 );
	assert.ok( relErr <= tol, msg + ': expected ' + expected + ', got ' + actual );
}

function assertArrayClose( actual, expected, tol, msg ) {
	let i;
	assert.equal( actual.length, expected.length, msg + ': length mismatch' );
	for ( i = 0; i < expected.length; i++ ) {
		assertClose( actual[ i ], expected[ i ], tol, msg + '[' + i + ']' );
	}
}

/**
* Creates the 3x3 Hermitian matrix A, stored in upper triangle, column-major:
*   A = [10  2+i  1-2i]
*       [2-i  8   3+i ]
*       [1+2i 3-i  7  ]
*
* @private
* @returns {Complex128Array} 3x3 matrix in column-major order
*/
function makeAUpper() {
	const A = new Complex128Array( 9 );
	const a = reinterpret( A, 0 );
	// Col 0: (10,0)
	a[ 0 ] = 10.0; a[ 1 ] = 0.0;
	// Col 1: (2,1) at (0,1), (8,0) at (1,1)
	a[ 6 ] = 2.0; a[ 7 ] = 1.0;
	a[ 8 ] = 8.0; a[ 9 ] = 0.0;
	// Col 2: (1,-2) at (0,2), (3,1) at (1,2), (7,0) at (2,2)
	a[ 12 ] = 1.0; a[ 13 ] = -2.0;
	a[ 14 ] = 3.0; a[ 15 ] = 1.0;
	a[ 16 ] = 7.0; a[ 17 ] = 0.0;
	return A;
}

/**
* Creates the 3x3 Hermitian matrix A, stored in lower triangle, column-major.
*
* @private
* @returns {Complex128Array} 3x3 matrix in column-major order
*/
function makeALower() {
	const A = new Complex128Array( 9 );
	const a = reinterpret( A, 0 );
	// Col 0: (10,0) at (0,0), (2,-1) at (1,0), (1,2) at (2,0)
	a[ 0 ] = 10.0; a[ 1 ] = 0.0;
	a[ 2 ] = 2.0; a[ 3 ] = -1.0;
	a[ 4 ] = 1.0; a[ 5 ] = 2.0;
	// Col 1: (8,0) at (1,1), (3,-1) at (2,1)
	a[ 8 ] = 8.0; a[ 9 ] = 0.0;
	a[ 10 ] = 3.0; a[ 11 ] = -1.0;
	// Col 2: (7,0) at (2,2)
	a[ 16 ] = 7.0; a[ 17 ] = 0.0;
	return A;
}

/**
* Creates the 3x3 Hermitian PD matrix B, stored in upper triangle, column-major:
*   B = [4   1+i  0  ]
*       [1-i  5   2-i]
*       [0   2+i  6  ]
*
* @private
* @returns {Complex128Array} 3x3 matrix in column-major order
*/
function makeBUpper() {
	const B = new Complex128Array( 9 );
	const b = reinterpret( B, 0 );
	// Col 0: (4,0) at (0,0)
	b[ 0 ] = 4.0; b[ 1 ] = 0.0;
	// Col 1: (1,1) at (0,1), (5,0) at (1,1)
	b[ 6 ] = 1.0; b[ 7 ] = 1.0;
	b[ 8 ] = 5.0; b[ 9 ] = 0.0;
	// Col 2: (2,-1) at (1,2), (6,0) at (2,2)
	b[ 14 ] = 2.0; b[ 15 ] = -1.0;
	b[ 16 ] = 6.0; b[ 17 ] = 0.0;
	return B;
}

/**
* Creates the 3x3 Hermitian PD matrix B, stored in lower triangle, column-major.
*
* @private
* @returns {Complex128Array} 3x3 matrix in column-major order
*/
function makeBLower() {
	const B = new Complex128Array( 9 );
	const b = reinterpret( B, 0 );
	// Col 0: (4,0) at (0,0), (1,-1) at (1,0)
	b[ 0 ] = 4.0; b[ 1 ] = 0.0;
	b[ 2 ] = 1.0; b[ 3 ] = -1.0;
	// Col 1: (5,0) at (1,1), (2,1) at (2,1)
	b[ 8 ] = 5.0; b[ 9 ] = 0.0;
	b[ 10 ] = 2.0; b[ 11 ] = 1.0;
	// Col 2: (6,0) at (2,2)
	b[ 16 ] = 6.0; b[ 17 ] = 0.0;
	return B;
}

/**
* Allocates workspace arrays for N=3.
*
* @private
* @returns {Object} workspace object
*/
function makeWorkspace() {
	return {
		w: new Float64Array( 4 ),
		Z: new Complex128Array( 16 ),
		WORK: new Complex128Array( 200 ),
		RWORK: new Float64Array( 28 ),
		IWORK: new Int32Array( 20 ),
		IFAIL: new Int32Array( 4 )
	};
}

/**
* Calls zhegvx with standard strides and offsets for 3x3 problem.
*
* @private
* @param {integer} itype - problem type
* @param {string} jobz - 'compute-vectors' or 'no-vectors'
* @param {string} range - 'all', 'value', or 'index'
* @param {string} uplo - 'upper' or 'lower'
* @param {integer} N - matrix order
* @param {Complex128Array} A - input matrix
* @param {Complex128Array} B - input matrix
* @param {number} vl - lower bound
* @param {number} vu - upper bound
* @param {integer} il - lower index
* @param {integer} iu - upper index
* @param {number} abstol - tolerance
* @param {Object} ws - workspace from makeWorkspace
* @returns {Object} { info, out } where out has .M
*/
function callZhegvx( itype, jobz, range, uplo, N, A, B, vl, vu, il, iu, abstol, ws ) {
	const ldz = ( N < 1 ) ? 1 : N;
	const out = { M: 0 };
	const info = zhegvx(
		itype, jobz, range, uplo, N,
		A, 1, N, 0,
		B, 1, N, 0,
		vl, vu, il, iu, abstol,
		out,
		ws.w, 1, 0,
		ws.Z, 1, ldz, 0,
		ws.WORK, 1, 0,
		ws.RWORK, 1, 0,
		ws.IWORK, 1, 0,
		ws.IFAIL, 1, 0
	);
	return { info: info, out: out };
}

// TESTS //

test( 'zhegvx: itype1_v_all_upper (ITYPE=1, vectors, all eigenvalues, upper)', function t() {
	const tc = itype1_v_all_upper;
	const ws = makeWorkspace();
	const r = callZhegvx( 1, 'compute-vectors', 'all', 'upper', 3, makeAUpper(), makeBUpper(), 0.0, 0.0, 0, 0, 0.0, ws );

	assert.equal( r.info, tc.info, 'info' );
	assert.equal( r.out.M, tc.m, 'm' );
	assertArrayClose( Array.from( ws.w.subarray( 0, 3 ) ), tc.w, 1e-12, 'w' );
	assertArrayClose( Array.from( reinterpret( ws.Z, 0 ).subarray( 0, 18 ) ), tc.z, 1e-10, 'z' );
});

test( 'zhegvx: itype1_v_all_lower (ITYPE=1, vectors, all eigenvalues, lower)', function t() {
	const tc = itype1_v_all_lower;
	const ws = makeWorkspace();
	const r = callZhegvx( 1, 'compute-vectors', 'all', 'lower', 3, makeALower(), makeBLower(), 0.0, 0.0, 0, 0, 0.0, ws );

	assert.equal( r.info, tc.info, 'info' );
	assert.equal( r.out.M, tc.m, 'm' );
	assertArrayClose( Array.from( ws.w.subarray( 0, 3 ) ), tc.w, 1e-12, 'w' );
	assertArrayClose( Array.from( reinterpret( ws.Z, 0 ).subarray( 0, 18 ) ), tc.z, 1e-10, 'z' );
});

test( 'zhegvx: itype1_n_all_upper (ITYPE=1, no vectors, all eigenvalues, upper)', function t() {
	const tc = itype1_n_all_upper;
	const ws = makeWorkspace();
	const r = callZhegvx( 1, 'no-vectors', 'all', 'upper', 3, makeAUpper(), makeBUpper(), 0.0, 0.0, 0, 0, 0.0, ws );

	assert.equal( r.info, tc.info, 'info' );
	assert.equal( r.out.M, tc.m, 'm' );
	assertArrayClose( Array.from( ws.w.subarray( 0, 3 ) ), tc.w, 1e-12, 'w' );
});

test( 'zhegvx: itype1_v_value_upper (ITYPE=1, vectors, value range, upper)', function t() {
	const tc = itype1_v_value_upper;
	const ws = makeWorkspace();
	const r = callZhegvx( 1, 'compute-vectors', 'value', 'upper', 3, makeAUpper(), makeBUpper(), 0.5, 2.0, 0, 0, 0.0, ws );

	assert.equal( r.info, tc.info, 'info' );
	assert.equal( r.out.M, tc.m, 'm' );
	assertArrayClose( Array.from( ws.w.subarray( 0, tc.m ) ), tc.w, 1e-12, 'w' );
	assertArrayClose( Array.from( reinterpret( ws.Z, 0 ).subarray( 0, 6 * tc.m ) ), tc.z, 1e-10, 'z' );
});

test( 'zhegvx: itype1_v_index_upper (ITYPE=1, vectors, index range 2-3, upper)', function t() {
	const tc = itype1_v_index_upper;
	const ws = makeWorkspace();
	const r = callZhegvx( 1, 'compute-vectors', 'index', 'upper', 3, makeAUpper(), makeBUpper(), 0.0, 0.0, 2, 3, 0.0, ws );

	assert.equal( r.info, tc.info, 'info' );
	assert.equal( r.out.M, tc.m, 'm' );
	assertArrayClose( Array.from( ws.w.subarray( 0, tc.m ) ), tc.w, 1e-12, 'w' );
	assertArrayClose( Array.from( reinterpret( ws.Z, 0 ).subarray( 0, 6 * tc.m ) ), tc.z, 1e-10, 'z' );
});

test( 'zhegvx: itype2_v_all_upper (ITYPE=2, vectors, all eigenvalues, upper)', function t() {
	const tc = itype2_v_all_upper;
	const ws = makeWorkspace();
	const r = callZhegvx( 2, 'compute-vectors', 'all', 'upper', 3, makeAUpper(), makeBUpper(), 0.0, 0.0, 0, 0, 0.0, ws );

	assert.equal( r.info, tc.info, 'info' );
	assert.equal( r.out.M, tc.m, 'm' );
	assertArrayClose( Array.from( ws.w.subarray( 0, 3 ) ), tc.w, 1e-12, 'w' );
	assertArrayClose( Array.from( reinterpret( ws.Z, 0 ).subarray( 0, 18 ) ), tc.z, 1e-10, 'z' );
});

test( 'zhegvx: itype3_v_all_lower (ITYPE=3, vectors, all eigenvalues, lower)', function t() {
	const tc = itype3_v_all_lower;
	const ws = makeWorkspace();
	const r = callZhegvx( 3, 'compute-vectors', 'all', 'lower', 3, makeALower(), makeBLower(), 0.0, 0.0, 0, 0, 0.0, ws );

	assert.equal( r.info, tc.info, 'info' );
	assert.equal( r.out.M, tc.m, 'm' );
	assertArrayClose( Array.from( ws.w.subarray( 0, 3 ) ), tc.w, 1e-12, 'w' );
	assertArrayClose( Array.from( reinterpret( ws.Z, 0 ).subarray( 0, 18 ) ), tc.z, 1e-10, 'z' );
});

test( 'zhegvx: n_zero (N=0 quick return)', function t() {
	const tc = n_zero;
	const ws = makeWorkspace();
	const A = new Complex128Array( 1 );
	const B = new Complex128Array( 1 );
	const r = callZhegvx( 1, 'compute-vectors', 'all', 'upper', 0, A, B, 0.0, 0.0, 0, 0, 0.0, ws );

	assert.equal( r.info, tc.info, 'info' );
	assert.equal( r.out.M, tc.m, 'm' );
});

test( 'zhegvx: n_one (N=1)', function t() {
	const tc = n_one;
	const ws = makeWorkspace();
	const A = new Complex128Array( 1 );
	const B = new Complex128Array( 1 );
	const a = reinterpret( A, 0 );
	const b = reinterpret( B, 0 );
	a[ 0 ] = 6.0; a[ 1 ] = 0.0;
	b[ 0 ] = 2.0; b[ 1 ] = 0.0;
	const r = callZhegvx( 1, 'compute-vectors', 'all', 'upper', 1, A, B, 0.0, 0.0, 0, 0, 0.0, ws );

	assert.equal( r.info, tc.info, 'info' );
	assert.equal( r.out.M, tc.m, 'm' );
	assertArrayClose( Array.from( ws.w.subarray( 0, 1 ) ), tc.w, 1e-12, 'w' );
	assertArrayClose( Array.from( reinterpret( ws.Z, 0 ).subarray( 0, 2 ) ), tc.z, 1e-10, 'z' );
});

test( 'zhegvx: not_posdef (non-positive definite B)', function t() {
	const tc = not_posdef;
	const ws = makeWorkspace();
	const A = new Complex128Array( 4 );
	const B = new Complex128Array( 4 );
	const a = reinterpret( A, 0 );
	const b = reinterpret( B, 0 );
	a[ 0 ] = 1.0; a[ 1 ] = 0.0;
	a[ 6 ] = 1.0; a[ 7 ] = 0.0;
	b[ 0 ] = -1.0; b[ 1 ] = 0.0;
	b[ 6 ] = 1.0; b[ 7 ] = 0.0;
	const r = callZhegvx( 1, 'compute-vectors', 'all', 'lower', 2, A, B, 0.0, 0.0, 0, 0, 0.0, ws );

	assert.equal( r.info, tc.info, 'info' );
});

test( 'zhegvx: itype2_v_index_lower (ITYPE=2, vectors, index range, lower)', function t() {
	const tc = itype2_v_index_lower;
	const ws = makeWorkspace();
	const r = callZhegvx( 2, 'compute-vectors', 'index', 'lower', 3, makeALower(), makeBLower(), 0.0, 0.0, 1, 1, 0.0, ws );

	assert.equal( r.info, tc.info, 'info' );
	assert.equal( r.out.M, tc.m, 'm' );
	assertArrayClose( Array.from( ws.w.subarray( 0, tc.m ) ), tc.w, 1e-12, 'w' );
	assertArrayClose( Array.from( reinterpret( ws.Z, 0 ).subarray( 0, 6 * tc.m ) ), tc.z, 1e-10, 'z' );
});

test( 'zhegvx: itype3_v_value_upper (ITYPE=3, vectors, value range, upper)', function t() {
	const tc = itype3_v_value_upper;
	const ws = makeWorkspace();
	const r = callZhegvx( 3, 'compute-vectors', 'value', 'upper', 3, makeAUpper(), makeBUpper(), 1.0, 100.0, 0, 0, 0.0, ws );

	assert.equal( r.info, tc.info, 'info' );
	assert.equal( r.out.M, tc.m, 'm' );
	assertArrayClose( Array.from( ws.w.subarray( 0, tc.m ) ), tc.w, 1e-12, 'w' );
	assertArrayClose( Array.from( reinterpret( ws.Z, 0 ).subarray( 0, 6 * tc.m ) ), tc.z, 1e-10, 'z' );
});

test( 'zhegvx: itype1_n_value_lower (ITYPE=1, no vectors, value range, lower)', function t() {
	const tc = itype1_n_value_lower;
	const ws = makeWorkspace();
	const r = callZhegvx( 1, 'no-vectors', 'value', 'lower', 3, makeALower(), makeBLower(), 0.5, 2.0, 0, 0, 0.0, ws );

	assert.equal( r.info, tc.info, 'info' );
	assert.equal( r.out.M, tc.m, 'm' );
	assertArrayClose( Array.from( ws.w.subarray( 0, tc.m ) ), tc.w, 1e-12, 'w' );
});

test( 'zhegvx: itype1_v_index_single (ITYPE=1, vectors, single index IL=IU=2)', function t() {
	const tc = itype1_v_index_single;
	const ws = makeWorkspace();
	const r = callZhegvx( 1, 'compute-vectors', 'index', 'upper', 3, makeAUpper(), makeBUpper(), 0.0, 0.0, 2, 2, 0.0, ws );

	assert.equal( r.info, tc.info, 'info' );
	assert.equal( r.out.M, tc.m, 'm' );
	assertArrayClose( Array.from( ws.w.subarray( 0, tc.m ) ), tc.w, 1e-12, 'w' );
	assertArrayClose( Array.from( reinterpret( ws.Z, 0 ).subarray( 0, 6 * tc.m ) ), tc.z, 1e-10, 'z' );
});
