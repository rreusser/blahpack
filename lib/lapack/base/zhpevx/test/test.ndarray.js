/* eslint-disable no-restricted-syntax */
/* eslint-disable max-lines */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import zhpevx from './../lib/ndarray.js';
import zdscalReal from './../../../../blas/base/zdscal/lib/base.js';
import zheev from './../../zheev/lib/ndarray.js';
import dlamch from './../../dlamch/lib/base.js';
import zsteinReal from './../../zstein/lib/base.js';
import { importWithDependencies } from './../../../../../test/harness/constants.js';

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

	const denom = Math.max( Math.abs( expected ), 1.0 );
	const relErr = Math.abs( actual - expected ) / denom;
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
	let i;

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
	const out = [];
	let i;

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
	let lhsR, lhsI, rhsR, rhsI, ar, ai, zr, zi, i, j, k;

	const av = reinterpret( Afull, 0 );
	const zv = reinterpret( Z, 0 );

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
	const m = new Int32Array( 1 );

	const WORK = new Complex128Array( Math.max( 16, (2 * N) + 10 ) );
	const RWORK = new Float64Array( Math.max( 64, ( 7 * N ) + 10 ) );
	const IWORK = new Int32Array( ( 5 * N ) + 10 );
	const IFAIL = new Int32Array( N + 1 );
	const w = new Float64Array( N );
	const Z = new Complex128Array( N * N );

	const info = zhpevx( jobz, range, uplo, N, AP, 1, 0, vl, vu, il, iu, abstol, m, w, 1, 0, Z, 1, N, 0, WORK, 1, 0, RWORK, 1, 0, IWORK, 1, 0, IFAIL, 1, 0 ); // eslint-disable-line max-len
	return {
		'info': info,
		'M': m[ 0 ],
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
	let k, i, j;

	const out = new Complex128Array( N * N );
	const apv = reinterpret( AP, 0 );
	const ov = reinterpret( out, 0 );
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
	let k, i, j;

	const out = new Complex128Array( N * N );
	const apv = reinterpret( AP, 0 );
	const ov = reinterpret( out, 0 );
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

	const tc = zhpevx_4x4_v_a_l;
	const AP = packedLower4();
	const Afull = unpackLowerHermitian( packedLower4(), 4 );
	const r = runZhpevx( 'compute-vectors', 'all', 'lower', 4, AP, 0, 0, 0, 0, 0 );
	assert.equal( r.info, tc.info );
	assert.equal( r.M, tc.M );
	assertArrayClose( toArray( r.w, 0, r.M ), tc.w, 1e-13, 'w' );
	verifyEigenpairs( Afull, r.Z, r.w, 4, r.M, 1e-12, 'eigenpairs' );
});

test( 'zhpevx: V, A, U, 4x4', function t() {

	const tc = zhpevx_4x4_v_a_u;
	const AP = packedUpper4();
	const Afull = unpackUpperHermitian( packedUpper4(), 4 );
	const r = runZhpevx( 'compute-vectors', 'all', 'upper', 4, AP, 0, 0, 0, 0, 0 );
	assert.equal( r.info, tc.info );
	assert.equal( r.M, tc.M );
	assertArrayClose( toArray( r.w, 0, r.M ), tc.w, 1e-13, 'w' );
	verifyEigenpairs( Afull, r.Z, r.w, 4, r.M, 1e-12, 'eigenpairs' );
});

test( 'zhpevx: N, A, L, 4x4', function t() {

	const tc = zhpevx_4x4_n_a_l;
	const AP = packedLower4();
	const r = runZhpevx( 'no-vectors', 'all', 'lower', 4, AP, 0, 0, 0, 0, 0 );
	assert.equal( r.info, tc.info );
	assert.equal( r.M, tc.M );
	assertArrayClose( toArray( r.w, 0, r.M ), tc.w, 1e-13, 'w' );
});

test( 'zhpevx: V, V, L, 4x4 (value range, none found)', function t() {

	const tc = zhpevx_4x4_v_v_l;
	const AP = packedLower4();
	const r = runZhpevx( 'compute-vectors', 'value', 'lower', 4, AP, 2.5, 5.5, 0, 0, 0 );
	assert.equal( r.info, tc.info );
	assert.equal( r.M, tc.M );
});

test( 'zhpevx: V, I, L, 4x4 (index range)', function t() {

	const tc = zhpevx_4x4_v_i_l;
	const AP = packedLower4();
	const Afull = unpackLowerHermitian( packedLower4(), 4 );
	const r = runZhpevx( 'compute-vectors', 'index', 'lower', 4, AP, 0, 0, 2, 3, 0 );
	assert.equal( r.info, tc.info );
	assert.equal( r.M, tc.M );
	assertArrayClose( toArray( r.w, 0, r.M ), tc.w, 1e-13, 'w' );
	verifyEigenpairs( Afull, r.Z, r.w, 4, r.M, 1e-12, 'eigenpairs' );
});

test( 'zhpevx: N, V, U, 4x4 (value range)', function t() {

	const tc = zhpevx_4x4_n_v_u;
	const AP = packedUpper4();
	const r = runZhpevx( 'no-vectors', 'value', 'upper', 4, AP, 0.0, 4.0, 0, 0, 0 );
	assert.equal( r.info, tc.info );
	assert.equal( r.M, tc.M );
	assertArrayClose( toArray( r.w, 0, r.M ), tc.w, 1e-13, 'w' );
});

test( 'zhpevx: 1x1, V, A', function t() {

	const tc = zhpevx_1x1_v_a;
	const AP = new Complex128Array( [ 7.5, 0 ] );
	const r = runZhpevx( 'compute-vectors', 'all', 'lower', 1, AP, 0, 0, 0, 0, 0 );
	assert.equal( r.info, tc.info );
	assert.equal( r.M, tc.M );
	assertArrayClose( toArray( r.w, 0, r.M ), tc.w, 1e-13, 'w' );
	const zv = reinterpret( r.Z, 0 );
	assertArrayClose( toArray( zv, 0, 2 ), tc.Z, 1e-13, 'Z' );
});

test( 'zhpevx: 0x0', function t() {

	const tc = zhpevx_0x0;
	const AP = new Complex128Array( 0 );
	const r = runZhpevx( 'compute-vectors', 'all', 'lower', 0, AP, 0, 0, 0, 0, 0 );
	assert.equal( r.info, tc.info );
	assert.equal( r.M, tc.M );
});

test( 'zhpevx: 1x1, V, V (excluded)', function t() {

	const tc = zhpevx_1x1_v_v_excluded;
	const AP = new Complex128Array( [ 7.5, 0 ] );
	const r = runZhpevx( 'compute-vectors', 'value', 'lower', 1, AP, 0.0, 5.0, 0, 0, 0 );
	assert.equal( r.info, tc.info );
	assert.equal( r.M, tc.M );
});

test( 'zhpevx: 1x1, V, V (included)', function t() {

	const tc = zhpevx_1x1_v_v_included;
	const AP = new Complex128Array( [ 7.5, 0 ] );
	const r = runZhpevx( 'compute-vectors', 'value', 'lower', 1, AP, 5.0, 10.0, 0, 0, 0 ); // eslint-disable-line max-len
	assert.equal( r.info, tc.info );
	assert.equal( r.M, tc.M );
	assertArrayClose( toArray( r.w, 0, r.M ), tc.w, 1e-13, 'w' );
	const zv = reinterpret( r.Z, 0 );
	assertArrayClose( toArray( zv, 0, 2 ), tc.Z, 1e-13, 'Z' );
});

test( 'zhpevx: 1x1, N, I', function t() {

	const tc = zhpevx_1x1_n_i;
	const AP = new Complex128Array( [ 3, 0 ] );
	const r = runZhpevx( 'no-vectors', 'index', 'upper', 1, AP, 0, 0, 1, 1, 0 );
	assert.equal( r.info, tc.info );
	assert.equal( r.M, tc.M );
	assertArrayClose( toArray( r.w, 0, r.M ), tc.w, 1e-13, 'w' );
});

test( 'zhpevx: N, I, U, 4x4, fast path', function t() {

	const tc = zhpevx_4x4_n_i_u_fast;
	const AP = packedUpper4();
	const r = runZhpevx( 'no-vectors', 'index', 'upper', 4, AP, 0, 0, 1, 4, 0 );
	assert.equal( r.info, tc.info );
	assert.equal( r.M, tc.M );
	assertArrayClose( toArray( r.w, 0, r.M ), tc.w, 1e-13, 'w' );
});

test( 'zhpevx: V, I, U, 4x4, fast path with vectors', function t() {

	const tc = zhpevx_4x4_v_i_u_fast;
	const AP = packedUpper4();
	const Afull = unpackUpperHermitian( packedUpper4(), 4 );
	const r = runZhpevx( 'compute-vectors', 'index', 'upper', 4, AP, 0, 0, 1, 4, 0 );
	assert.equal( r.info, tc.info );
	assert.equal( r.M, tc.M );
	assertArrayClose( toArray( r.w, 0, r.M ), tc.w, 1e-13, 'w' );
	verifyEigenpairs( Afull, r.Z, r.w, 4, r.M, 1e-12, 'eigenpairs' );
});

// FUNCTIONS (ADDITIONAL CHECKS) //

/**
* Returns the eigenvalues (ascending) of a dense Hermitian matrix computed independently by zheev.
*
* @private
* @param {Float64Array} Ad - dense Hermitian matrix (interleaved, column-major, N-by-N)
* @param {NonNegativeInteger} N - order
* @returns {Float64Array} eigenvalues
*/
function denseEigenvalues( Ad, N ) {
	const A = new Complex128Array( Ad );
	const w = new Float64Array( N );
	const info = zheev( 'no-vectors', 'upper', N, A, 1, N, 0, w, 1, 0, new Complex128Array( 64 * N ), 1, 0, new Float64Array( 3 * N ), 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, 0, 'zheev info' );
	return w;
}

/**
* Returns the max-modulus entry of an interleaved complex array.
*
* @private
* @param {Float64Array} Av - interleaved array
* @returns {number} max modulus
*/
function maxAbs( Av ) {
	let mx = 0.0;
	let i;
	for ( i = 0; i < Av.length; i += 2 ) {
		mx = Math.max( mx, Math.sqrt( ( Av[ i ] * Av[ i ] ) + ( Av[ i + 1 ] * Av[ i + 1 ] ) ) ); // eslint-disable-line max-len
	}
	return mx;
}

/**
* Asserts ||A z_k - w_k z_k|| <= 1e-12 * N * ||A|| and Z^H Z = I for the first M columns.
*
* @private
* @param {Float64Array} Ad - dense Hermitian matrix (interleaved, column-major)
* @param {NonNegativeInteger} N - order
* @param {Float64Array} w - eigenvalues
* @param {Float64Array} Zv - eigenvectors (interleaved, column-major, LDZ = N)
* @param {NonNegativeInteger} M - number of eigenpairs
* @param {string} msg - message prefix
*/
function assertResidualOrtho( Ad, N, w, Zv, M, msg ) {
	const anrm = maxAbs( Ad ) * N;
	let sr, si, ar, ai, zr, zi, err, dr, di, i, j, k;
	for ( k = 0; k < M; k++ ) {
		err = 0.0;
		for ( i = 0; i < N; i++ ) {
			sr = 0.0;
			si = 0.0;
			for ( j = 0; j < N; j++ ) {
				ar = Ad[ 2 * ( i + ( j * N ) ) ];
				ai = Ad[ ( 2 * ( i + ( j * N ) ) ) + 1 ];
				zr = Zv[ 2 * ( j + ( k * N ) ) ];
				zi = Zv[ ( 2 * ( j + ( k * N ) ) ) + 1 ];
				sr += ( ar * zr ) - ( ai * zi );
				si += ( ar * zi ) + ( ai * zr );
			}
			sr -= w[ k ] * Zv[ 2 * ( i + ( k * N ) ) ];
			si -= w[ k ] * Zv[ ( 2 * ( i + ( k * N ) ) ) + 1 ];
			err += ( sr * sr ) + ( si * si );
		}
		assert.ok( Math.sqrt( err ) <= 1e-12 * N * anrm, msg + ': residual ' + k + ' = ' + Math.sqrt( err ) ); // eslint-disable-line max-len
		for ( j = 0; j <= k; j++ ) {
			dr = 0.0;
			di = 0.0;
			for ( i = 0; i < N; i++ ) {
				ar = Zv[ 2 * ( i + ( j * N ) ) ];
				ai = Zv[ ( 2 * ( i + ( j * N ) ) ) + 1 ];
				zr = Zv[ 2 * ( i + ( k * N ) ) ];
				zi = Zv[ ( 2 * ( i + ( k * N ) ) ) + 1 ];
				dr += ( ar * zr ) + ( ai * zi );
				di += ( ar * zi ) - ( ai * zr );
			}
			assert.ok( Math.abs( dr - ( ( j === k ) ? 1.0 : 0.0 ) ) <= 1e-12 * N && Math.abs( di ) <= 1e-12 * N, msg + ': orthonormality (' + j + ',' + k + ')' ); // eslint-disable-line max-len
		}
	}
}

/**
* Returns a scaled copy of a complex array.
*
* @private
* @param {Complex128Array} x - array
* @param {number} alpha - real scalar
* @returns {Complex128Array} scaled copy
*/
function scaled( x, alpha ) {
	const xv = reinterpret( x, 0 );
	const out = new Float64Array( xv.length );
	let i;
	for ( i = 0; i < xv.length; i++ ) {
		out[ i ] = xv[ i ] * alpha;
	}
	return new Complex128Array( out.buffer );
}

/**
* Returns the scaling factor the expert drivers apply to a matrix with max-modulus entry `anrm`.
*
* @private
* @param {number} anrm - max-modulus entry
* @returns {number} sigma
*/
function scaleFactor( anrm ) {
	const safmin = dlamch( 'safe-minimum' );
	const smlnum = safmin / dlamch( 'precision' ); // SMLNUM = DLAMCH('S') / DLAMCH('P') in the reference
	const rmin = Math.sqrt( smlnum );
	const rmax = Math.min( Math.sqrt( 1.0 / smlnum ), 1.0 / Math.sqrt( Math.sqrt( safmin ) ) ); // eslint-disable-line max-len
	if ( anrm < rmin ) {
		return rmin / anrm;
	}
	if ( anrm > rmax ) {
		return rmax / anrm;
	}
	return 1.0;
}

/**
* Returns a lower-packed 4x4 Hermitian block-diagonal matrix [[5,-i],[i,5]] (eigenvalues 4, 6) and [[0,1],[1,0]] (eigenvalues -1, 1), whose tridiagonal form splits.
*
* @private
* @returns {Complex128Array} packed lower matrix
*/
function packedLowerSplit() {
	return new Complex128Array( [ 5, 0, 0, 1, 0, 0, 0, 0, 5, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0 ] ); // eslint-disable-line max-len
}

/**
* Calls an implementation (ndarray or base) with ample workspace.
*
* @private
* @param {Function} fn - implementation
* @param {string} jobz - job type
* @param {string} range - range type
* @param {string} uplo - triangle
* @param {NonNegativeInteger} N - order
* @param {Complex128Array} AP - packed matrix (overwritten)
* @param {number} vl - lower bound
* @param {number} vu - upper bound
* @param {integer} il - lower index
* @param {integer} iu - upper index
* @param {number} abstol - tolerance
* @returns {Object} results
*/
function runPacked( fn, jobz, range, uplo, N, AP, vl, vu, il, iu, abstol ) {
	const m = new Int32Array( 1 );
	const w = new Float64Array( N );
	const Z = new Complex128Array( N * N );
	const IFAIL = new Int32Array( N );
	const info = fn( jobz, range, uplo, N, AP, 1, 0, vl, vu, il, iu, abstol, m, w, 1, 0, Z, 1, N, 0, new Complex128Array( 2 * N ), 1, 0, new Float64Array( 7 * N ), 1, 0, new Int32Array( 5 * N ), 1, 0, IFAIL, 1, 0 ); // eslint-disable-line max-len
	return {
		'info': info,
		'M': m[ 0 ],
		'w': w,
		'Zv': reinterpret( Z, 0 ),
		'IFAIL': IFAIL
	};
}

test( 'zhpevx: tiny-norm matrix (1e-160) is scaled; V, V, L with abstol > 0', function t() {
	const AP = scaled( packedLower4(), 1e-160 );
	const Ad = reinterpret( unpackLowerHermitian( AP, 4 ), 0 );
	const ref = denseEigenvalues( reinterpret( unpackLowerHermitian( packedLower4(), 4 ), 0 ), 4 ); // eslint-disable-line max-len
	const expected = [];
	let i;
	for ( i = 0; i < 4; i++ ) {
		if ( ref[ i ] > 0.0 && ref[ i ] <= 10.0 ) {
			expected.push( ref[ i ] * 1e-160 );
		}
	}
	const r = runPacked( zhpevx, 'compute-vectors', 'value', 'lower', 4, AP, 0.0, 1e-159, 0, 0, 1e-175 ); // eslint-disable-line max-len
	assert.equal( r.info, 0 );
	assert.ok( expected.length > 0 && expected.length < 4, 'range is selective' );
	assert.equal( r.M, expected.length );
	for ( i = 0; i < r.M; i++ ) {
		assert.ok( Math.abs( r.w[ i ] - expected[ i ] ) <= 1e-12 * 1e-159, 'w[' + i + ']' ); // eslint-disable-line max-len
		assert.equal( r.IFAIL[ i ], 0 );
	}
	assertResidualOrtho( Ad, 4, r.w, r.Zv, r.M, 'tiny' );
});

test( 'zhpevx: huge-norm matrix (1e100) is scaled; V, I, U (2..3)', function t() {
	const AP = scaled( packedUpper4(), 1e100 );
	const Ad = reinterpret( unpackUpperHermitian( AP, 4 ), 0 );
	const ref = denseEigenvalues( Ad, 4 );
	const r = runPacked( zhpevx, 'compute-vectors', 'index', 'upper', 4, AP, 0.0, 0.0, 2, 3, 0.0 ); // eslint-disable-line max-len
	let i;
	assert.equal( r.info, 0 );
	assert.equal( r.M, 2 );
	for ( i = 0; i < 2; i++ ) {
		assert.ok( Math.abs( r.w[ i ] - ref[ i + 1 ] ) <= 1e-12 * 1e101, 'w[' + i + ']' ); // eslint-disable-line max-len
	}
	assertResidualOrtho( Ad, 4, r.w, r.Zv, r.M, 'huge' );
});

test( 'zhpevx: huge-norm matrix (1e100), N, A, L fast path rescales all eigenvalues', function t() {
	const AP = scaled( packedLower4(), 1e100 );
	const ref = denseEigenvalues( reinterpret( unpackLowerHermitian( AP, 4 ), 0 ), 4 ); // eslint-disable-line max-len
	const r = runPacked( zhpevx, 'no-vectors', 'all', 'lower', 4, AP, 0.0, 0.0, 0, 0, 0.0 ); // eslint-disable-line max-len
	let i;
	assert.equal( r.info, 0 );
	assert.equal( r.M, 4 );
	for ( i = 0; i < 4; i++ ) {
		assert.ok( Math.abs( r.w[ i ] - ref[ i ] ) <= 1e-12 * 1e101, 'w[' + i + ']' ); // eslint-disable-line max-len
	}
});

test( 'zhpevx: split matrix with abstol > 0 (bisection, block order) sorts eigenpairs ascending', function t() {
	const Ad = reinterpret( unpackLowerHermitian( packedLowerSplit(), 4 ), 0 );
	const r = runPacked( zhpevx, 'compute-vectors', 'all', 'lower', 4, packedLowerSplit(), 0.0, 0.0, 0, 0, 1e-14 ); // eslint-disable-line max-len
	const expected = [ -1.0, 1.0, 4.0, 6.0 ];
	let i;
	assert.equal( r.info, 0 );
	assert.equal( r.M, 4 );
	for ( i = 0; i < 4; i++ ) {
		assertClose( r.w[ i ], expected[ i ], 1e-13, 'w[' + i + ']' );
		assert.equal( r.IFAIL[ i ], 0 );
	}
	assertResidualOrtho( Ad, 4, r.w, r.Zv, r.M, 'split' );
});

test( 'zhpevx: when zsteqr fails, falls back to bisection + inverse iteration', async function t() {
	const mod = await importWithDependencies( new URL( './../lib/base.js', import.meta.url ), {
		'../../zsteqr/lib/base.js': function failingZsteqr() {
			return 1;
		}
	});
	const Ad = reinterpret( unpackUpperHermitian( packedUpper4(), 4 ), 0 );
	const ref = denseEigenvalues( Ad, 4 );
	const r = runPacked( mod.default, 'compute-vectors', 'all', 'upper', 4, packedUpper4(), 0.0, 0.0, 0, 0, 0.0 ); // eslint-disable-line max-len
	let i;
	assert.equal( r.info, 0 );
	assert.equal( r.M, 4 );
	for ( i = 0; i < 4; i++ ) {
		assertClose( r.w[ i ], ref[ i ], 1e-13, 'w[' + i + ']' );
		assert.equal( r.IFAIL[ i ], 0 );
	}
	assertResidualOrtho( Ad, 4, r.w, r.Zv, 4, 'zsteqr fallback' );
});

test( 'zhpevx: when dsterf fails, falls back to bisection (no vectors)', async function t() {
	const mod = await importWithDependencies( new URL( './../lib/base.js', import.meta.url ), {
		'../../dsterf/lib/base.js': function failingDsterf() {
			return 2;
		}
	});
	const ref = denseEigenvalues( reinterpret( unpackLowerHermitian( packedLower4(), 4 ), 0 ), 4 ); // eslint-disable-line max-len
	const r = runPacked( mod.default, 'no-vectors', 'index', 'lower', 4, packedLower4(), 0.0, 0.0, 1, 4, 0.0 ); // eslint-disable-line max-len
	let i;
	assert.equal( r.info, 0 );
	assert.equal( r.M, 4 );
	for ( i = 0; i < 4; i++ ) {
		assertClose( r.w[ i ], ref[ i ], 1e-13, 'w[' + i + ']' );
	}
});

test( 'zhpevx: zstein failure on a scaled matrix returns its info and rescales only w[0..info-2]', async function t() {
	const mod = await importWithDependencies( new URL( './../lib/base.js', import.meta.url ), {
		'../../zstein/lib/base.js': function failingZstein() {
			const args = Array.prototype.slice.call( arguments );
			zsteinReal.apply( null, args );
			args[ 27 ][ args[ 29 ] + ( 2 * args[ 28 ] ) ] = 3;
			return 3;
		}
	});
	const ref = denseEigenvalues( reinterpret( unpackLowerHermitian( packedLower4(), 4 ), 0 ), 4 ); // eslint-disable-line max-len
	const sigma = scaleFactor( maxAbs( reinterpret( packedLower4(), 0 ) ) * 1e-160 ); // eslint-disable-line max-len
	const r = runPacked( mod.default, 'compute-vectors', 'all', 'lower', 4, scaled( packedLower4(), 1e-160 ), 0.0, 0.0, 0, 0, 1e-175 ); // eslint-disable-line max-len
	let i;
	assert.equal( r.info, 3 );
	assert.equal( r.M, 4 );
	assert.ok( sigma > 1.0, 'matrix is scaled' );

	// imax = info - 1 = 2: only w[0], w[1] are rescaled.
	for ( i = 0; i < 2; i++ ) {
		assertClose( r.w[ i ] / 1e-160, ref[ i ], 1e-12, 'w[' + i + '] rescaled' );
	}
	for ( i = 2; i < 4; i++ ) {
		assertClose( r.w[ i ] / ( sigma * 1e-160 ), ref[ i ], 1e-12, 'w[' + i + '] not rescaled' ); // eslint-disable-line max-len
	}
	assert.equal( r.IFAIL[ 2 ], 3 );
});

test( 'zhpevx: zstein failure on a split matrix permutes IFAIL along with the eigenvalues', async function t() {
	const pre = [];
	const mod = await importWithDependencies( new URL( './../lib/base.js', import.meta.url ), {
		'../../zstein/lib/base.js': function failingZstein() {
			const args = Array.prototype.slice.call( arguments );
			let k;
			zsteinReal.apply( null, args );
			for ( k = 0; k < args[ 7 ]; k++ ) {
				pre.push( args[ 8 ][ args[ 10 ] + ( k * args[ 9 ] ) ] );
				args[ 27 ][ args[ 29 ] + ( k * args[ 28 ] ) ] = 10 + k;
			}
			return 4;
		}
	});
	const Ad = reinterpret( unpackLowerHermitian( packedLowerSplit(), 4 ), 0 );
	const r = runPacked( mod.default, 'compute-vectors', 'all', 'lower', 4, packedLowerSplit(), 0.0, 0.0, 0, 0, 1e-14 ); // eslint-disable-line max-len
	const expected = [ -1.0, 1.0, 4.0, 6.0 ];
	let i;
	assert.equal( r.info, 4 );
	assert.equal( r.M, 4 );
	assert.notDeepEqual( pre, expected, 'block order differs from ascending order' );
	for ( i = 0; i < 4; i++ ) {
		assertClose( r.w[ i ], expected[ i ], 1e-13, 'w[' + i + ']' );
		assert.equal( pre[ r.IFAIL[ i ] - 10 ], r.w[ i ], 'IFAIL[' + i + '] follows its eigenvalue' ); // eslint-disable-line max-len
	}
	assertResidualOrtho( Ad, 4, r.w, r.Zv, 4, 'split zstein failure' );
});

// Reference thresholds (zhpevx.f): EPS = DLAMCH('Precision') = 2^-52, SAFMIN = DLAMCH('Safe minimum') = 2^-1022, SMLNUM = SAFMIN/EPS = 2^-970, RMIN = sqrt(SMLNUM) = 2^-485. With DLAMCH('Epsilon') = 2^-53 it would be RMIN = 2^-484.5. (RMAX = min(sqrt(1/SMLNUM), 1/sqrt(sqrt(SAFMIN))) = 2^255.5 with either constant, so only RMIN distinguishes them.)
const RMIN_P = Math.pow( 2.0, -485 );
const RMIN_E = Math.pow( 2.0, -484.5 );

test( 'zhpevx: rescales only when the max-norm is below RMIN built from DLAMCH(\'Precision\') (ticket 0089)', async function t() {
	const calls = [];
	const mod = await importWithDependencies( new URL( './../lib/base.js', import.meta.url ), {
		'../../../../blas/base/zdscal/lib/base.js': function recordingZdscal() {
			calls.push( arguments );
			return zdscalReal.apply( null, arguments );
		}
	});
	const m = new Int32Array( 1 );

	// [ max-norm, reference rescales? ]: between RMIN_P and RMIN_E the reference does not rescale; below RMIN_P it does.
	const cases = [
		[ 1.2 * RMIN_P, false ],
		[ 0.5 * RMIN_P, true ]
	];
	let info;
	let Av;
	let A;
	let w;
	let s;
	let k;
	let i;
	assert.ok( cases[ 0 ][ 0 ] < RMIN_E, 'boundary input' );
	for ( k = 0; k < cases.length; k++ ) {
		// A = s * [[2, i, 0], [-i, 2, 0], [0, 0, 5]] (packed lower triangle) has max-norm 5s and eigenvalues s, 3s, 5s.
		s = cases[ k ][ 0 ] / 5.0;
		A = new Complex128Array( 6 );
		Av = new Float64Array( A.buffer );
		Av[ 0 ] = 2.0 * s;
		Av[ 3 ] = -s;
		Av[ 6 ] = 2.0 * s;
		Av[ 10 ] = 5.0 * s;
		w = new Float64Array( 3 );
		calls.length = 0;
		info = mod.default( 'compute-vectors', 'all', 'lower', 3, A, 1, 0, 0.0, 0.0, 0, 0, 0.0, m, w, 1, 0, new Complex128Array( 9 ), 1, 3, 0, new Complex128Array( 6 ), 1, 0, new Float64Array( 21 ), 1, 0, new Int32Array( 15 ), 1, 0, new Int32Array( 3 ), 1, 0 ); // eslint-disable-line max-len
		assert.equal( info, 0, 'info' );
		assert.equal( m[ 0 ], 3, 'M' );
		assert.equal( calls.length > 0, cases[ k ][ 1 ], 'rescaled, anrm=' + cases[ k ][ 0 ] ); // eslint-disable-line max-len
		for ( i = 0; i < 3; i++ ) {
			assert.ok( Math.abs( ( w[ i ] / s ) - ( ( 2 * i ) + 1 ) ) <= 1e-13, 'w[' + i + '] = ' + ( w[ i ] / s ) + 's, anrm=' + cases[ k ][ 0 ] ); // eslint-disable-line max-len
		}
	}
});
