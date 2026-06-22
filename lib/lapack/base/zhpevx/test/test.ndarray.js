/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */
/* eslint-disable max-lines */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import zhpevx from './../lib/ndarray.js';

// FIXTURES //

import zhpevx_4x4_v_a_l from './fixtures/zhpevx_4x4_v_a_l.json' with { type: 'json' };
import zhpevx_4x4_v_a_u from './fixtures/zhpevx_4x4_v_a_u.json' with { type: 'json' };
import zhpevx_4x4_n_a_l from './fixtures/zhpevx_4x4_n_a_l.json' with { type: 'json' };
import zhpevx_4x4_v_v_l from './fixtures/zhpevx_4x4_v_v_l.json' with { type: 'json' };
import zhpevx_4x4_v_i_l from './fixtures/zhpevx_4x4_v_i_l.json' with { type: 'json' };
import zhpevx_4x4_n_v_u from './fixtures/zhpevx_4x4_n_v_u.json' with { type: 'json' };
import zhpevx_1x1_v_a from './fixtures/zhpevx_1x1_v_a.json' with { type: 'json' };
import zhpevx_0x0 from './fixtures/zhpevx_0x0.json' with { type: 'json' };
import zhpevx_1x1_v_v_excluded from './fixtures/zhpevx_1x1_v_v_excluded.json' with { type: 'json' };
import zhpevx_1x1_v_v_included from './fixtures/zhpevx_1x1_v_v_included.json' with { type: 'json' };
import zhpevx_1x1_n_i from './fixtures/zhpevx_1x1_n_i.json' with { type: 'json' };
import zhpevx_4x4_n_i_u_fast from './fixtures/zhpevx_4x4_n_i_u_fast.json' with { type: 'json' };
import zhpevx_4x4_v_i_u_fast from './fixtures/zhpevx_4x4_v_i_u_fast.json' with { type: 'json' };

// FUNCTIONS //

/**
* Asserts that two numbers are approximately equal.
*
* @private
* @param {number} actual - actual value
* @param {number} expected - expected value
* @param {number} tol - tolerance
* @param {string} msg - assertion message
*/
function assertClose( actual, expected, tol, msg ) {
	var relErr;
	var denom;

	denom = Math.max( Math.abs( expected ), 1.0 );
	relErr = Math.abs( actual - expected ) / denom;
	assert.ok( relErr <= tol, msg + ': got ' + actual + ' expected ' + expected );
}

/**
* Asserts that two arrays are element-wise approximately equal.
*
* @private
* @param {Array} actual - actual value
* @param {Array} expected - expected value
* @param {number} tol - tolerance
* @param {string} msg - assertion message
*/
function assertArrayClose( actual, expected, tol, msg ) {
	var i;

	assert.equal( actual.length, expected.length, msg + ' length' );
	for ( i = 0; i < expected.length; i++ ) {
		assertClose( actual[ i ], expected[ i ], tol, msg + '[' + i + ']' );
	}
}

/**
* Converts a typed array slice to a plain array.
*
* @private
* @param {TypedArray} arr - input array
* @param {NonNegativeInteger} start - start index
* @param {NonNegativeInteger} end - end index
* @returns {Array} output array
*/
function toArray( arr, start, end ) {
	var out = [];
	var i;

	for ( i = start; i < end; i++ ) {
		out.push( arr[ i ] );
	}
	return out;
}

/**
* Validates the complex eigendecomposition: A_v = lambda_v for each eigenpair.
*
* @private
* @param {Complex128Array} Afull - full Hermitian matrix (column-major, complex elements)
* @param {Complex128Array} Z - eigenvector matrix (column-major, complex elements)
* @param {Float64Array} w - real eigenvalues
* @param {NonNegativeInteger} N - matrix order
* @param {NonNegativeInteger} M - number of eigenvalues
* @param {number} tol - tolerance
* @param {string} msg - assertion message
*/
function verifyEigenpairs( Afull, Z, w, N, M, tol, msg ) {
	var lhsR;
	var lhsI;
	var rhsR;
	var rhsI;
	var av;
	var zv;
	var ar;
	var ai;
	var zr;
	var zi;
	var i;
	var j;
	var k;

	av = reinterpret( Afull, 0 );
	zv = reinterpret( Z, 0 );

	for ( j = 0; j < M; j++ ) {
		for ( i = 0; i < N; i++ ) {
			// Lhs = sum_k A(i,k)*Z(k,j)
			lhsR = 0.0;
			lhsI = 0.0;
			for ( k = 0; k < N; k++ ) {
				ar = av[ 2 * ( i + ( k * N ) ) ];
				ai = av[ ( 2 * ( i + ( k * N ) ) ) + 1 ];
				zr = zv[ 2 * ( k + ( j * N ) ) ];
				zi = zv[ ( 2 * ( k + ( j * N ) ) ) + 1 ];

				// A(i,k) * Z(k,j)
				lhsR += ( ar * zr ) - ( ai * zi );
				lhsI += ( ar * zi ) + ( ai * zr );
			}
			// Rhs = w[j] * Z(i,j)
			zr = zv[ 2 * ( i + ( j * N ) ) ];
			zi = zv[ ( 2 * ( i + ( j * N ) ) ) + 1 ];
			rhsR = w[ j ] * zr;
			rhsI = w[ j ] * zi;
			assertClose( lhsR, rhsR, tol, msg + ' re(' + i + ',' + j + ')' ); // eslint-disable-line max-len
			assertClose( lhsI, rhsI, tol, msg + ' im(' + i + ',' + j + ')' ); // eslint-disable-line max-len
		}
	}
}

/**
* Runs zhpevx with standard workspace allocation.
*
* @private
* @param {string} jobz - job type
* @param {string} range - range type
* @param {string} uplo - triangle type
* @param {NonNegativeInteger} N - matrix order
* @param {Complex128Array} AP - packed matrix
* @param {number} vl - lower value bound
* @param {number} vu - upper value bound
* @param {integer} il - lower index bound
* @param {integer} iu - upper index bound
* @param {number} abstol - convergence tolerance
* @returns {Object} result with info, M, w, Z, IFAIL
*/
function runZhpevx( jobz, range, uplo, N, AP, vl, vu, il, iu, abstol ) {
	var RWORK;
	var IWORK;
	var IFAIL;
	var WORK;
	var info;
	var out;
	var w;
	var Z;

	WORK = new Complex128Array( Math.max( 16, (2 * N) + 10 ) );
	RWORK = new Float64Array( Math.max( 64, ( 7 * N ) + 10 ) );
	IWORK = new Int32Array( ( 5 * N ) + 10 );
	IFAIL = new Int32Array( N + 1 );
	w = new Float64Array( N );
	Z = new Complex128Array( N * N );
	out = {
		'M': 0
	};

	info = zhpevx( jobz, range, uplo, N, AP, 1, 0, vl, vu, il, iu, abstol, out, w, 1, 0, Z, 1, N, 0, WORK, 1, 0, RWORK, 1, 0, IWORK, 1, 0, IFAIL, 1, 0 ); // eslint-disable-line max-len
	return {
		'info': info,
		'M': out.M,
		'w': w,
		'Z': Z,
		'IFAIL': IFAIL
	};
}

/**
* Returns lower-packed Hermitian 4x4 test matrix.
*
* A = [4     1-i   -2+i   2   ]
*     [1+i   2      0     1-i ]
*     [-2-i  0      3    -2+i ]
*     [2     1+i   -2-i  -1   ]
*
* @private
* @returns {Complex128Array} packed lower matrix
*/
function packedLower4( ) {
	return new Complex128Array([
		4,
		0,
		1,
		1,
		-2,
		-1,
		2,
		0,
		2,
		0,
		0,
		0,
		1,
		-1,
		3,
		0,
		-2,
		1,
		-1,
		0
	]);
}

/**
* Returns upper-packed Hermitian 4x4 test matrix.
*
* @private
* @returns {Complex128Array} packed upper matrix
*/
function packedUpper4( ) {
	return new Complex128Array([
		4,
		0,
		1,
		-1,
		2,
		0,
		-2,
		1,
		0,
		0,
		3,
		0,
		2,
		0,
		1,
		-1,
		-2,
		-1,
		-1,
		0
	]);
}

/**
* Expands a packed lower-triangular Hermitian matrix to full column-major form.
*
* @private
* @param {Complex128Array} AP - packed lower matrix
* @param {NonNegativeInteger} N - matrix order
* @returns {Complex128Array} full column-major matrix
*/
function unpackLowerHermitian( AP, N ) {
	var out;
	var apv;
	var ov;
	var k;
	var i;
	var j;

	out = new Complex128Array( N * N );
	apv = reinterpret( AP, 0 );
	ov = reinterpret( out, 0 );
	k = 0;
	for ( j = 0; j < N; j++ ) {
		for ( i = j; i < N; i++ ) {
			// A(i,j) = AP[k]
			ov[ 2 * ( i + ( j * N ) ) ] = apv[ 2 * k ];
			ov[ ( 2 * ( i + ( j * N ) ) ) + 1 ] = apv[ ( 2 * k ) + 1 ];

			// A(j,i) = conj(AP[k])
			ov[ 2 * ( j + ( i * N ) ) ] = apv[ 2 * k ];
			ov[ ( 2 * ( j + ( i * N ) ) ) + 1 ] = -apv[ ( 2 * k ) + 1 ];
			k += 1;
		}
	}
	return out;
}

/**
* Expands a packed upper-triangular Hermitian matrix to full column-major form.
*
* @private
* @param {Complex128Array} AP - packed upper matrix
* @param {NonNegativeInteger} N - matrix order
* @returns {Complex128Array} full column-major matrix
*/
function unpackUpperHermitian( AP, N ) {
	var out;
	var apv;
	var ov;
	var k;
	var i;
	var j;

	out = new Complex128Array( N * N );
	apv = reinterpret( AP, 0 );
	ov = reinterpret( out, 0 );
	k = 0;
	for ( j = 0; j < N; j++ ) {
		for ( i = 0; i <= j; i++ ) {
			// A(i,j) = AP[k]
			ov[ 2 * ( i + ( j * N ) ) ] = apv[ 2 * k ];
			ov[ ( 2 * ( i + ( j * N ) ) ) + 1 ] = apv[ ( 2 * k ) + 1 ];

			// A(j,i) = conj(AP[k])
			ov[ 2 * ( j + ( i * N ) ) ] = apv[ 2 * k ];
			ov[ ( 2 * ( j + ( i * N ) ) ) + 1 ] = -apv[ ( 2 * k ) + 1 ];
			k += 1;
		}
	}
	return out;
}

// TESTS //

test( 'zhpevx: V, A, L, 4x4', function t() {
	var Afull;
	var tc;
	var AP;
	var r;

	tc = zhpevx_4x4_v_a_l;
	AP = packedLower4();
	Afull = unpackLowerHermitian( packedLower4(), 4 );
	r = runZhpevx( 'compute-vectors', 'all', 'lower', 4, AP, 0, 0, 0, 0, 0 );
	assert.equal( r.info, tc.info );
	assert.equal( r.M, tc.M );
	assertArrayClose( toArray( r.w, 0, r.M ), tc.w, 1e-13, 'w' );
	verifyEigenpairs( Afull, r.Z, r.w, 4, r.M, 1e-12, 'eigenpairs' );
});

test( 'zhpevx: V, A, U, 4x4', function t() {
	var Afull;
	var tc;
	var AP;
	var r;

	tc = zhpevx_4x4_v_a_u;
	AP = packedUpper4();
	Afull = unpackUpperHermitian( packedUpper4(), 4 );
	r = runZhpevx( 'compute-vectors', 'all', 'upper', 4, AP, 0, 0, 0, 0, 0 );
	assert.equal( r.info, tc.info );
	assert.equal( r.M, tc.M );
	assertArrayClose( toArray( r.w, 0, r.M ), tc.w, 1e-13, 'w' );
	verifyEigenpairs( Afull, r.Z, r.w, 4, r.M, 1e-12, 'eigenpairs' );
});

test( 'zhpevx: N, A, L, 4x4', function t() {
	var tc;
	var AP;
	var r;

	tc = zhpevx_4x4_n_a_l;
	AP = packedLower4();
	r = runZhpevx( 'no-vectors', 'all', 'lower', 4, AP, 0, 0, 0, 0, 0 );
	assert.equal( r.info, tc.info );
	assert.equal( r.M, tc.M );
	assertArrayClose( toArray( r.w, 0, r.M ), tc.w, 1e-13, 'w' );
});

test( 'zhpevx: V, V, L, 4x4 (value range, none found)', function t() {
	var tc;
	var AP;
	var r;

	tc = zhpevx_4x4_v_v_l;
	AP = packedLower4();
	r = runZhpevx( 'compute-vectors', 'value', 'lower', 4, AP, 2.5, 5.5, 0, 0, 0 );
	assert.equal( r.info, tc.info );
	assert.equal( r.M, tc.M );
});

test( 'zhpevx: V, I, L, 4x4 (index range)', function t() {
	var Afull;
	var tc;
	var AP;
	var r;

	tc = zhpevx_4x4_v_i_l;
	AP = packedLower4();
	Afull = unpackLowerHermitian( packedLower4(), 4 );
	r = runZhpevx( 'compute-vectors', 'index', 'lower', 4, AP, 0, 0, 2, 3, 0 );
	assert.equal( r.info, tc.info );
	assert.equal( r.M, tc.M );
	assertArrayClose( toArray( r.w, 0, r.M ), tc.w, 1e-13, 'w' );
	verifyEigenpairs( Afull, r.Z, r.w, 4, r.M, 1e-12, 'eigenpairs' );
});

test( 'zhpevx: N, V, U, 4x4 (value range)', function t() {
	var tc;
	var AP;
	var r;

	tc = zhpevx_4x4_n_v_u;
	AP = packedUpper4();
	r = runZhpevx( 'no-vectors', 'value', 'upper', 4, AP, 0.0, 4.0, 0, 0, 0 );
	assert.equal( r.info, tc.info );
	assert.equal( r.M, tc.M );
	assertArrayClose( toArray( r.w, 0, r.M ), tc.w, 1e-13, 'w' );
});

test( 'zhpevx: 1x1, V, A', function t() {
	var tc;
	var AP;
	var zv;
	var r;

	tc = zhpevx_1x1_v_a;
	AP = new Complex128Array( [ 7.5, 0 ] );
	r = runZhpevx( 'compute-vectors', 'all', 'lower', 1, AP, 0, 0, 0, 0, 0 );
	assert.equal( r.info, tc.info );
	assert.equal( r.M, tc.M );
	assertArrayClose( toArray( r.w, 0, r.M ), tc.w, 1e-13, 'w' );
	zv = reinterpret( r.Z, 0 );
	assertArrayClose( toArray( zv, 0, 2 ), tc.Z, 1e-13, 'Z' );
});

test( 'zhpevx: 0x0', function t() {
	var tc;
	var AP;
	var r;

	tc = zhpevx_0x0;
	AP = new Complex128Array( 0 );
	r = runZhpevx( 'compute-vectors', 'all', 'lower', 0, AP, 0, 0, 0, 0, 0 );
	assert.equal( r.info, tc.info );
	assert.equal( r.M, tc.M );
});

test( 'zhpevx: 1x1, V, V (excluded)', function t() {
	var tc;
	var AP;
	var r;

	tc = zhpevx_1x1_v_v_excluded;
	AP = new Complex128Array( [ 7.5, 0 ] );
	r = runZhpevx( 'compute-vectors', 'value', 'lower', 1, AP, 0.0, 5.0, 0, 0, 0 );
	assert.equal( r.info, tc.info );
	assert.equal( r.M, tc.M );
});

test( 'zhpevx: 1x1, V, V (included)', function t() {
	var tc;
	var AP;
	var zv;
	var r;

	tc = zhpevx_1x1_v_v_included;
	AP = new Complex128Array( [ 7.5, 0 ] );
	r = runZhpevx( 'compute-vectors', 'value', 'lower', 1, AP, 5.0, 10.0, 0, 0, 0 ); // eslint-disable-line max-len
	assert.equal( r.info, tc.info );
	assert.equal( r.M, tc.M );
	assertArrayClose( toArray( r.w, 0, r.M ), tc.w, 1e-13, 'w' );
	zv = reinterpret( r.Z, 0 );
	assertArrayClose( toArray( zv, 0, 2 ), tc.Z, 1e-13, 'Z' );
});

test( 'zhpevx: 1x1, N, I', function t() {
	var tc;
	var AP;
	var r;

	tc = zhpevx_1x1_n_i;
	AP = new Complex128Array( [ 3, 0 ] );
	r = runZhpevx( 'no-vectors', 'index', 'upper', 1, AP, 0, 0, 1, 1, 0 );
	assert.equal( r.info, tc.info );
	assert.equal( r.M, tc.M );
	assertArrayClose( toArray( r.w, 0, r.M ), tc.w, 1e-13, 'w' );
});

test( 'zhpevx: N, I, U, 4x4, fast path', function t() {
	var tc;
	var AP;
	var r;

	tc = zhpevx_4x4_n_i_u_fast;
	AP = packedUpper4();
	r = runZhpevx( 'no-vectors', 'index', 'upper', 4, AP, 0, 0, 1, 4, 0 );
	assert.equal( r.info, tc.info );
	assert.equal( r.M, tc.M );
	assertArrayClose( toArray( r.w, 0, r.M ), tc.w, 1e-13, 'w' );
});

test( 'zhpevx: V, I, U, 4x4, fast path with vectors', function t() {
	var Afull;
	var tc;
	var AP;
	var r;

	tc = zhpevx_4x4_v_i_u_fast;
	AP = packedUpper4();
	Afull = unpackUpperHermitian( packedUpper4(), 4 );
	r = runZhpevx( 'compute-vectors', 'index', 'upper', 4, AP, 0, 0, 1, 4, 0 );
	assert.equal( r.info, tc.info );
	assert.equal( r.M, tc.M );
	assertArrayClose( toArray( r.w, 0, r.M ), tc.w, 1e-13, 'w' );
	verifyEigenpairs( Afull, r.Z, r.w, 4, r.M, 1e-12, 'eigenpairs' );
});
