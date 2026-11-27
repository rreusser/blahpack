/* eslint-disable no-restricted-syntax, no-mixed-operators, max-lines, max-params */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import zhbevx from './../lib/ndarray.js';
import zlasclReal from './../../zlascl/lib/base.js';
import zheev from './../../zheev/lib/ndarray.js';
import dlamch from './../../dlamch/lib/base.js';
import zsteinReal from './../../zstein/lib/base.js';
import { importWithDependencies } from './../../../../../test/harness/constants.js';

// FIXTURES //

import v_a_u_kd2_n5 from './fixtures/v_a_u_kd2_n5.json' with { type: 'json' };
import v_a_l_kd2_n5 from './fixtures/v_a_l_kd2_n5.json' with { type: 'json' };
import n_a_u_kd2_n5 from './fixtures/n_a_u_kd2_n5.json' with { type: 'json' };
import v_v_u_kd2_n5 from './fixtures/v_v_u_kd2_n5.json' with { type: 'json' };
import v_i_u_kd2_n5 from './fixtures/v_i_u_kd2_n5.json' with { type: 'json' };
import n_v_l_kd2_n5 from './fixtures/n_v_l_kd2_n5.json' with { type: 'json' };
import n_i_l_kd2_n5 from './fixtures/n_i_l_kd2_n5.json' with { type: 'json' };
import n1_v_a_l from './fixtures/n1_v_a_l.json' with { type: 'json' };
import n1_v_v_included from './fixtures/n1_v_v_included.json' with { type: 'json' };
import v_i_l_kd1_n4_fast from './fixtures/v_i_l_kd1_n4_fast.json' with { type: 'json' };
import v_i_u_kd2_n5_single from './fixtures/v_i_u_kd2_n5_single.json' with { type: 'json' };
import n1_v_i_u_kd2 from './fixtures/n1_v_i_u_kd2.json' with { type: 'json' };

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
	const relErr = Math.abs( actual - expected ) / Math.max( Math.abs( expected ), 1.0 ); // eslint-disable-line max-len
	assert.ok( relErr <= tol, msg + ': expected ' + expected + ', got ' + actual + ' (relErr=' + relErr + ')' ); // eslint-disable-line max-len
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
	assert.equal( actual.length, expected.length, msg + ': length mismatch' );
	for ( i = 0; i < expected.length; i++ ) {
		assertClose( actual[ i ], expected[ i ], tol, msg + '[' + i + ']' );
	}
}

/**
* Returns a 5x5 Hermitian band matrix (KD=2), upper band storage, as Complex128Array.
*
* Hermitian matrix:
*   4      (1+i)   (2-i)   0       0
*  (1-i)    5      (3+i)  (1-i)    0
*  (2+i)   (3-i)    6     (2+i)   (1-i)
*   0      (1+i)   (2-i)   7      (3+i)
*   0       0      (1+i)  (3-i)    8
*
* Upper band (LDAB=3): row0=2nd superdiag, row1=1st superdiag, row2=diagonal
*
* @private
* @returns {Complex128Array} band matrix
*/
function bandUpper5( ) {
	return new Complex128Array([
		0,
		0,
		0,
		0,
		4,
		0,
		0,
		0,
		1,
		1,
		5,
		0,
		2,
		-1,
		3,
		1,
		6,
		0,
		1,
		-1,
		2,
		1,
		7,
		0,
		1,
		-1,
		3,
		1,
		8,
		0
	]);
}

/**
* Returns the same 5x5 Hermitian band matrix in lower band storage.
*
* @private
* @returns {Complex128Array} band matrix
*/
function bandLower5( ) {
	return new Complex128Array([
		4,
		0,
		1,
		-1,
		2,
		1,
		5,
		0,
		3,
		-1,
		1,
		1,
		6,
		0,
		2,
		-1,
		1,
		1,
		7,
		0,
		3,
		-1,
		0,
		0,
		8,
		0,
		0,
		0,
		0,
		0
	]);
}

/**
* Returns a 4x4 Hermitian tridiagonal (KD=1), lower band storage.
*
* @private
* @returns {Complex128Array} band matrix
*/
function bandLower4Kd1( ) {
	return new Complex128Array([
		4,
		0,
		1,
		-1,
		5,
		0,
		2,
		1,
		6,
		0,
		3,
		-1,
		7,
		0,
		0,
		0
	]);
}

/**
* Runs zhbevx with standard workspace allocation.
*
* @private
* @param {string} jobz - job type
* @param {string} range - range type
* @param {string} uplo - triangle
* @param {NonNegativeInteger} N - order
* @param {NonNegativeInteger} kd - bandwidth
* @param {Complex128Array} AB - band matrix
* @param {number} vl - lower bound
* @param {number} vu - upper bound
* @param {integer} il - lower index
* @param {integer} iu - upper index
* @param {number} abstol - tolerance
* @returns {Object} results
*/
function runZhbevx( jobz, range, uplo, N, kd, AB, vl, vu, il, iu, abstol ) { // eslint-disable-line max-len
	const m = new Int32Array( 1 );
	const IWORK = new Int32Array( Math.max( (5 * N) + 10, 1 ) );
	const IFAIL = new Int32Array( Math.max( N, 1 ) );
	const RWORK = new Float64Array( Math.max( (7 * N) + 100, 1 ) );
	const LDAB = kd + 1;
	const WORK = new Complex128Array( Math.max( N + 10, 1 ) );
	const w = new Float64Array( Math.max( N, 1 ) );
	const Q = new Complex128Array( Math.max( N * N, 1 ) );
	const Z = new Complex128Array( Math.max( N * N, 1 ) );

	const info = zhbevx( jobz, range, uplo, N, kd, AB, 1, LDAB, 0, Q, 1, N, 0, vl, vu, il, iu, abstol, m, w, 1, 0, Z, 1, N, 0, WORK, 1, 0, RWORK, 1, 0, IWORK, 1, 0, IFAIL, 1, 0 ); // eslint-disable-line max-len
	return {
		'info': info,
		'M': m[ 0 ],
		'w': w,
		'Z': Z,
		'Q': Q,
		'IFAIL': IFAIL
	};
}

/**
* Computes A*v for a complex Hermitian band matrix in band storage.
*
* @private
* @param {string} uplo - triangle
* @param {NonNegativeInteger} N - order
* @param {NonNegativeInteger} kd - bandwidth
* @param {Float64Array} ABv - Float64 reinterpretation of band matrix
* @param {Float64Array} vR - real parts of eigenvector
* @param {Float64Array} vI - imaginary parts of eigenvector
* @returns {Object} result with AvR and AvI arrays
*/
function bandMatVec( uplo, N, kd, ABv, vR, vI ) {
	const LDAB = kd + 1;
	const AvR = new Float64Array( N );
	const AvI = new Float64Array( N );
	let aR, aI, ii, m2, i, j;

	for ( j = 0; j < N; j++ ) {
		for ( ii = 0; ii <= kd; ii++ ) {
			i = ( uplo === 'upper' ) ? j - ii : j + ii;
			if ( i < 0 || i >= N ) {
				continue;
			}
			m2 = ( uplo === 'upper' ) ? ( ( kd - ii ) + ( j * LDAB ) ) * 2 : ( ii + ( j * LDAB ) ) * 2; // eslint-disable-line max-len
			aR = ABv[ m2 ];
			aI = ABv[ m2 + 1 ];

			// A(i,j) * v(j)
			AvR[ i ] += aR * vR[ j ] - aI * vI[ j ];
			AvI[ i ] += aR * vI[ j ] + aI * vR[ j ];
			if ( i !== j ) {
				// A(j,i) = conj(A(i,j)) * v(i)
				AvR[ j ] += aR * vR[ i ] + aI * vI[ i ];
				AvI[ j ] += aR * vI[ i ] - aI * vR[ i ];
			}
		}
	}
	return {
		'AvR': AvR,
		'AvI': AvI
	};
}

/**
* Verifies eigenvector property for complex Hermitian: A_v = lambda_v.
*
* @private
* @param {string} uplo - triangle
* @param {NonNegativeInteger} N - order
* @param {NonNegativeInteger} kd - bandwidth
* @param {Complex128Array} ABo - original band matrix (before zhbevx modifies it)
* @param {Float64Array} w - eigenvalues
* @param {Complex128Array} Z - eigenvectors
* @param {NonNegativeInteger} M - number of eigenpairs
* @param {number} tol - tolerance
* @param {string} msg - message prefix
*/
function verifyEigenpairs( uplo, N, kd, ABo, w, Z, M, tol, msg ) {
	const ABv = reinterpret( ABo, 0 );
	let err, nrm, res;
	const Zv = reinterpret( Z, 0 );
	let vR, vI, m2, i, k;

	for ( k = 0; k < M; k++ ) {
		// Extract eigenvector k (complex)
		vR = new Float64Array( N );
		vI = new Float64Array( N );
		for ( i = 0; i < N; i++ ) {
			m2 = ( i + ( k * N ) ) * 2;
			vR[ i ] = Zv[ m2 ];
			vI[ i ] = Zv[ m2 + 1 ];
		}

		// Compute A*v using band storage
		res = bandMatVec( uplo, N, kd, ABv, vR, vI );

		// Check ||A*v - lambda*v|| / (||v|| * |lambda|)
		err = 0.0;
		nrm = 0.0;
		for ( i = 0; i < N; i++ ) {
			err += ( res.AvR[ i ] - ( w[ k ] * vR[ i ] ) ) * ( res.AvR[ i ] - ( w[ k ] * vR[ i ] ) ); // eslint-disable-line max-len
			err += ( res.AvI[ i ] - ( w[ k ] * vI[ i ] ) ) * ( res.AvI[ i ] - ( w[ k ] * vI[ i ] ) ); // eslint-disable-line max-len
			nrm += vR[ i ] * vR[ i ] + vI[ i ] * vI[ i ];
		}
		err = Math.sqrt( err );
		nrm = Math.sqrt( nrm );
		assert.ok( err / ( nrm * Math.max( Math.abs( w[ k ] ), 1.0 ) ) < tol, msg + ': eigenpair ' + k + ' residual too large (' + err + ')' ); // eslint-disable-line max-len
	}
}

// TESTS //

test( 'zhbevx is a function', function t() {
	assert.equal( typeof zhbevx, 'function' );
});

test( 'zhbevx: V, A, U, KD=2, N=5', function t() {

	const ABo = bandUpper5();
	const AB = new Complex128Array( reinterpret( ABo, 0 ).slice() );
	const tc = v_a_u_kd2_n5;
	const r = runZhbevx( 'compute-vectors', 'all', 'upper', 5, 2, AB, 0, 0, 0, 0, 0 );
	assert.equal( r.info, tc.info );
	assert.equal( r.M, tc.M );
	assertArrayClose( Array.prototype.slice.call( r.w, 0, r.M ), tc.w, 1e-13, 'w' ); // eslint-disable-line max-len
	verifyEigenpairs( 'upper', 5, 2, ABo, r.w, r.Z, r.M, 1e-12, 'eigenpairs' );
});

test( 'zhbevx: V, A, L, KD=2, N=5', function t() {

	const ABo = bandLower5();
	const AB = new Complex128Array( reinterpret( ABo, 0 ).slice() );
	const tc = v_a_l_kd2_n5;
	const r = runZhbevx( 'compute-vectors', 'all', 'lower', 5, 2, AB, 0, 0, 0, 0, 0 );
	assert.equal( r.info, tc.info );
	assert.equal( r.M, tc.M );
	assertArrayClose( Array.prototype.slice.call( r.w, 0, r.M ), tc.w, 1e-13, 'w' ); // eslint-disable-line max-len
	verifyEigenpairs( 'lower', 5, 2, ABo, r.w, r.Z, r.M, 1e-12, 'eigenpairs' );
});

test( 'zhbevx: N, A, U, KD=2, N=5 (eigenvalues only)', function t() {

	const tc = n_a_u_kd2_n5;
	const AB = bandUpper5();
	const r = runZhbevx( 'no-vectors', 'all', 'upper', 5, 2, AB, 0, 0, 0, 0, 0 );
	assert.equal( r.info, tc.info );
	assert.equal( r.M, tc.M );
	assertArrayClose( Array.prototype.slice.call( r.w, 0, r.M ), tc.w, 1e-13, 'w' ); // eslint-disable-line max-len
});

test( 'zhbevx: V, V, U, KD=2, N=5 (value range [3, 8])', function t() {

	const ABo = bandUpper5();
	const AB = new Complex128Array( reinterpret( ABo, 0 ).slice() );
	const tc = v_v_u_kd2_n5;
	const r = runZhbevx( 'compute-vectors', 'value', 'upper', 5, 2, AB, 3.0, 8.0, 0, 0, 0 ); // eslint-disable-line max-len
	assert.equal( r.info, tc.info );
	assert.equal( r.M, tc.M );
	assertArrayClose( Array.prototype.slice.call( r.w, 0, r.M ), tc.w, 1e-13, 'w' ); // eslint-disable-line max-len
	verifyEigenpairs( 'upper', 5, 2, ABo, r.w, r.Z, r.M, 1e-12, 'eigenpairs' );
});

test( 'zhbevx: V, I, U, KD=2, N=5 (index range 2..4)', function t() {

	const ABo = bandUpper5();
	const AB = new Complex128Array( reinterpret( ABo, 0 ).slice() );
	const tc = v_i_u_kd2_n5;
	const r = runZhbevx( 'compute-vectors', 'index', 'upper', 5, 2, AB, 0, 0, 2, 4, 0 );
	assert.equal( r.info, tc.info );
	assert.equal( r.M, tc.M );
	assertArrayClose( Array.prototype.slice.call( r.w, 0, r.M ), tc.w, 1e-13, 'w' ); // eslint-disable-line max-len
	verifyEigenpairs( 'upper', 5, 2, ABo, r.w, r.Z, r.M, 1e-12, 'eigenpairs' );
});

test( 'zhbevx: N, V, L, KD=2, N=5 (value range [1, 5])', function t() {

	const tc = n_v_l_kd2_n5;
	const AB = bandLower5();
	const r = runZhbevx( 'no-vectors', 'value', 'lower', 5, 2, AB, 1.0, 5.0, 0, 0, 0 );
	assert.equal( r.info, tc.info );
	assert.equal( r.M, tc.M );
	assertArrayClose( Array.prototype.slice.call( r.w, 0, r.M ), tc.w, 1e-13, 'w' ); // eslint-disable-line max-len
});

test( 'zhbevx: N, I, L, KD=2, N=5 (index 3 only)', function t() {

	const tc = n_i_l_kd2_n5;
	const AB = bandLower5();
	const r = runZhbevx( 'no-vectors', 'index', 'lower', 5, 2, AB, 0, 0, 3, 3, 0 );
	assert.equal( r.info, tc.info );
	assert.equal( r.M, tc.M );
	assertArrayClose( Array.prototype.slice.call( r.w, 0, r.M ), tc.w, 1e-13, 'w' ); // eslint-disable-line max-len
});

test( 'zhbevx: N=1, V, A, L', function t() {

	const tc = n1_v_a_l;
	const AB = new Complex128Array( [ 3.5, 0 ] );
	const r = runZhbevx( 'compute-vectors', 'all', 'lower', 1, 0, AB, 0, 0, 0, 0, 0 );
	assert.equal( r.info, tc.info );
	assert.equal( r.M, tc.M );
	assertClose( r.w[ 0 ], tc.w1, 1e-14, 'w1' );
	const Zv = reinterpret( r.Z, 0 );
	assertClose( Zv[ 0 ], tc.z11[ 0 ], 1e-14, 'z11 real' );
	assertClose( Zv[ 1 ], tc.z11[ 1 ], 1e-14, 'z11 imag' );
});

test( 'zhbevx: N=1, V, V, excluded', function t() {

	const AB = new Complex128Array( [ 3.5, 0 ] );
	const r = runZhbevx( 'compute-vectors', 'value', 'lower', 1, 0, AB, 0, 3.0, 0, 0, 0 ); // eslint-disable-line max-len
	assert.equal( r.info, 0 );
	assert.equal( r.M, 0 );
});

test( 'zhbevx: N=1, V, V, included', function t() {

	const tc = n1_v_v_included;
	const AB = new Complex128Array( [ 3.5, 0 ] );
	const r = runZhbevx( 'compute-vectors', 'value', 'lower', 1, 0, AB, 3.0, 4.0, 0, 0, 0 ); // eslint-disable-line max-len
	assert.equal( r.info, tc.info );
	assert.equal( r.M, tc.M );
	assertClose( r.w[ 0 ], tc.w1, 1e-14, 'w1' );
	const Zv = reinterpret( r.Z, 0 );
	assertClose( Zv[ 0 ], tc.z11[ 0 ], 1e-14, 'z11 real' );
	assertClose( Zv[ 1 ], tc.z11[ 1 ], 1e-14, 'z11 imag' );
});

test( 'zhbevx: N=0 (quick return)', function t() {

	const AB = new Complex128Array( 1 );
	const r = runZhbevx( 'compute-vectors', 'all', 'upper', 0, 0, AB, 0, 0, 0, 0, 0 );
	assert.equal( r.info, 0 );
	assert.equal( r.M, 0 );
});

test( 'zhbevx: V, I, L, KD=1, N=4, fast path (IL=1, IU=N)', function t() {

	const ABo = bandLower4Kd1();
	const AB = new Complex128Array( reinterpret( ABo, 0 ).slice() );
	const tc = v_i_l_kd1_n4_fast;
	const r = runZhbevx( 'compute-vectors', 'index', 'lower', 4, 1, AB, 0, 0, 1, 4, 0 );
	assert.equal( r.info, tc.info );
	assert.equal( r.M, tc.M );
	assertArrayClose( Array.prototype.slice.call( r.w, 0, r.M ), tc.w, 1e-13, 'w' ); // eslint-disable-line max-len
	verifyEigenpairs( 'lower', 4, 1, ABo, r.w, r.Z, r.M, 1e-12, 'eigenpairs' );
});

test( 'zhbevx: V, I, U, KD=2, N=5, single eigenvalue (IL=IU=1)', function t() {

	const ABo = bandUpper5();
	const AB = new Complex128Array( reinterpret( ABo, 0 ).slice() );
	const tc = v_i_u_kd2_n5_single;
	const r = runZhbevx( 'compute-vectors', 'index', 'upper', 5, 2, AB, 0, 0, 1, 1, 0 );
	assert.equal( r.info, tc.info );
	assert.equal( r.M, tc.M );
	assertArrayClose( Array.prototype.slice.call( r.w, 0, r.M ), tc.w, 1e-13, 'w' ); // eslint-disable-line max-len
	verifyEigenpairs( 'upper', 5, 2, ABo, r.w, r.Z, r.M, 1e-12, 'eigenpairs' );
});

test( 'zhbevx: N=1, V, I, U, KD=2 (IL=IU=1)', function t() {

	const tc = n1_v_i_u_kd2;
	const AB = new Complex128Array( [ 0, 0, 0, 0, 7.25, 0 ] );
	const r = runZhbevx( 'compute-vectors', 'index', 'upper', 1, 2, AB, 0, 0, 1, 1, 0 );
	assert.equal( r.info, tc.info );
	assert.equal( r.M, tc.M );
	assertClose( r.w[ 0 ], tc.w1, 1e-14, 'w1' );
	const Zv = reinterpret( r.Z, 0 );
	assertClose( Zv[ 0 ], tc.z11[ 0 ], 1e-14, 'z11 real' );
	assertClose( Zv[ 1 ], tc.z11[ 1 ], 1e-14, 'z11 imag' );
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
* Expands a Hermitian band matrix (band storage, LDAB = kd+1) to a dense interleaved column-major matrix.
*
* @private
* @param {string} uplo - triangle
* @param {NonNegativeInteger} N - order
* @param {NonNegativeInteger} kd - bandwidth
* @param {Complex128Array} AB - band matrix
* @returns {Float64Array} dense matrix
*/
function bandToDense( uplo, N, kd, AB ) {
	const ABv = reinterpret( AB, 0 );
	const A = new Float64Array( 2 * N * N );
	let re, im, p, i, j, k;
	for ( j = 0; j < N; j++ ) {
		for ( k = 0; k <= kd; k++ ) {
			i = ( uplo === 'upper' ) ? j - k : j + k;
			if ( i < 0 || i >= N ) {
				continue;
			}
			p = ( uplo === 'upper' ) ? 2 * ( ( kd - k ) + ( j * ( kd + 1 ) ) ) : 2 * ( k + ( j * ( kd + 1 ) ) ); // eslint-disable-line max-len
			re = ABv[ p ];
			im = ( i === j ) ? 0.0 : ABv[ p + 1 ];
			A[ 2 * ( i + ( j * N ) ) ] = re;
			A[ ( 2 * ( i + ( j * N ) ) ) + 1 ] = im;
			A[ 2 * ( j + ( i * N ) ) ] = re;
			A[ ( 2 * ( j + ( i * N ) ) ) + 1 ] = -im;
		}
	}
	return A;
}

/**
* Returns a 4x4 Hermitian tridiagonal (KD=1) in lower band storage splitting into [[5,-i],[i,5]] (eigenvalues 4, 6) and [[0,1],[1,0]] (eigenvalues -1, 1).
*
* @private
* @returns {Complex128Array} band matrix
*/
function bandLowerSplit() {
	return new Complex128Array( [ 5, 0, 0, 1, 5, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0 ] ); // eslint-disable-line max-len
}

/**
* Calls the base implementation with ample workspace.
*
* @private
* @param {Function} fn - base implementation
* @param {string} jobz - job type
* @param {string} range - range type
* @param {string} uplo - triangle
* @param {NonNegativeInteger} N - order
* @param {NonNegativeInteger} kd - bandwidth
* @param {Complex128Array} AB - band matrix (overwritten)
* @param {number} abstol - tolerance
* @param {integer} il - lower index
* @param {integer} iu - upper index
* @returns {Object} results
*/
function runBase( fn, jobz, range, uplo, N, kd, AB, abstol, il, iu ) {
	const m = new Int32Array( 1 );
	const w = new Float64Array( N );
	const Z = new Complex128Array( N * N );
	const IFAIL = new Int32Array( N );
	const info = fn( jobz, range, uplo, N, kd, AB, 1, kd + 1, 0, new Complex128Array( N * N ), 1, N, 0, 0, 0, il, iu, abstol, m, w, 1, 0, Z, 1, N, 0, new Complex128Array( N ), 1, 0, new Float64Array( 7 * N ), 1, 0, new Int32Array( 5 * N ), 1, 0, IFAIL, 1, 0 ); // eslint-disable-line max-len
	return {
		'info': info,
		'M': m[ 0 ],
		'w': w,
		'Zv': reinterpret( Z, 0 ),
		'IFAIL': IFAIL
	};
}

test( 'zhbevx: tiny-norm matrix (1e-160) is scaled; V, V, U with abstol > 0', function t() {
	const ABo = scaled( bandUpper5(), 1e-160 );
	const Ad = bandToDense( 'upper', 5, 2, ABo );
	const ref = denseEigenvalues( bandToDense( 'upper', 5, 2, bandUpper5() ), 5 ); // eslint-disable-line max-len
	const expected = [];
	let i;
	for ( i = 0; i < 5; i++ ) {
		if ( ref[ i ] > 3.0 && ref[ i ] <= 8.0 ) {
			expected.push( ref[ i ] * 1e-160 );
		}
	}
	const r = runZhbevx( 'compute-vectors', 'value', 'upper', 5, 2, new Complex128Array( reinterpret( ABo, 0 ) ), 3e-160, 8e-160, 0, 0, 1e-175 ); // eslint-disable-line max-len
	assert.equal( r.info, 0 );
	assert.ok( expected.length > 0 && expected.length < 5, 'range is selective' );
	assert.equal( r.M, expected.length );
	for ( i = 0; i < r.M; i++ ) {
		assert.ok( Math.abs( r.w[ i ] - expected[ i ] ) <= 1e-12 * 9e-160, 'w[' + i + ']' ); // eslint-disable-line max-len
		assert.equal( r.IFAIL[ i ], 0 );
	}
	assertResidualOrtho( Ad, 5, r.w, reinterpret( r.Z, 0 ), r.M, 'tiny' );
});

test( 'zhbevx: huge-norm matrix (1e100) is scaled; V, I, L (2..4)', function t() {
	const ABo = scaled( bandLower5(), 1e100 );
	const Ad = bandToDense( 'lower', 5, 2, ABo );
	const ref = denseEigenvalues( Ad, 5 );
	const r = runZhbevx( 'compute-vectors', 'index', 'lower', 5, 2, new Complex128Array( reinterpret( ABo, 0 ) ), 0, 0, 2, 4, 0 ); // eslint-disable-line max-len
	let i;
	assert.equal( r.info, 0 );
	assert.equal( r.M, 3 );
	for ( i = 0; i < 3; i++ ) {
		assert.ok( Math.abs( r.w[ i ] - ref[ i + 1 ] ) <= 1e-12 * 9e100, 'w[' + i + ']' ); // eslint-disable-line max-len
	}
	assertResidualOrtho( Ad, 5, r.w, reinterpret( r.Z, 0 ), r.M, 'huge' );
});

test( 'zhbevx: huge-norm matrix (1e100), N, A, U fast path rescales all eigenvalues', function t() {
	const ABo = scaled( bandUpper5(), 1e100 );
	const ref = denseEigenvalues( bandToDense( 'upper', 5, 2, ABo ), 5 );
	const r = runZhbevx( 'no-vectors', 'all', 'upper', 5, 2, new Complex128Array( reinterpret( ABo, 0 ) ), 0, 0, 0, 0, 0 ); // eslint-disable-line max-len
	let i;
	assert.equal( r.info, 0 );
	assert.equal( r.M, 5 );
	for ( i = 0; i < 5; i++ ) {
		assert.ok( Math.abs( r.w[ i ] - ref[ i ] ) <= 1e-12 * 9e100, 'w[' + i + ']' ); // eslint-disable-line max-len
	}
});

test( 'zhbevx: split matrix with abstol > 0 (bisection, block order) sorts eigenpairs ascending', function t() {
	const ABo = bandLowerSplit();
	const Ad = bandToDense( 'lower', 4, 1, ABo );
	const r = runZhbevx( 'compute-vectors', 'all', 'lower', 4, 1, bandLowerSplit(), 0, 0, 0, 0, 1e-14 ); // eslint-disable-line max-len
	const expected = [ -1.0, 1.0, 4.0, 6.0 ];
	let i;
	assert.equal( r.info, 0 );
	assert.equal( r.M, 4 );
	for ( i = 0; i < 4; i++ ) {
		assertClose( r.w[ i ], expected[ i ], 1e-13, 'w[' + i + ']' );
		assert.equal( r.IFAIL[ i ], 0 );
	}
	assertResidualOrtho( Ad, 4, r.w, reinterpret( r.Z, 0 ), r.M, 'split' );
});

test( 'zhbevx: when zsteqr fails, falls back to bisection + inverse iteration', async function t() {
	const mod = await importWithDependencies( new URL( './../lib/base.js', import.meta.url ), {
		'../../zsteqr/lib/base.js': function failingZsteqr() {
			return 1;
		}
	});
	const Ad = bandToDense( 'upper', 5, 2, bandUpper5() );
	const ref = denseEigenvalues( Ad, 5 );
	const r = runBase( mod.default, 'compute-vectors', 'all', 'upper', 5, 2, bandUpper5(), 0, 0, 0 ); // eslint-disable-line max-len
	let i;
	assert.equal( r.info, 0 );
	assert.equal( r.M, 5 );
	for ( i = 0; i < 5; i++ ) {
		assertClose( r.w[ i ], ref[ i ], 1e-13, 'w[' + i + ']' );
		assert.equal( r.IFAIL[ i ], 0 );
	}
	assertResidualOrtho( Ad, 5, r.w, r.Zv, 5, 'zsteqr fallback' );
});

test( 'zhbevx: when dsterf fails, falls back to bisection (no vectors)', async function t() {
	const mod = await importWithDependencies( new URL( './../lib/base.js', import.meta.url ), {
		'../../dsterf/lib/base.js': function failingDsterf() {
			return 2;
		}
	});
	const ref = denseEigenvalues( bandToDense( 'lower', 5, 2, bandLower5() ), 5 ); // eslint-disable-line max-len
	const r = runBase( mod.default, 'no-vectors', 'index', 'lower', 5, 2, bandLower5(), 0, 1, 5 ); // eslint-disable-line max-len
	let i;
	assert.equal( r.info, 0 );
	assert.equal( r.M, 5 );
	for ( i = 0; i < 5; i++ ) {
		assertClose( r.w[ i ], ref[ i ], 1e-13, 'w[' + i + ']' );
	}
});

test( 'zhbevx: zstein failure on a scaled matrix returns its info and rescales only w[0..info-2]', async function t() {
	const mod = await importWithDependencies( new URL( './../lib/base.js', import.meta.url ), {
		'../../zstein/lib/base.js': function failingZstein() {
			const args = Array.prototype.slice.call( arguments );
			zsteinReal.apply( null, args );
			args[ 27 ][ args[ 29 ] + ( 2 * args[ 28 ] ) ] = 3;
			return 2;
		}
	});
	const ref = denseEigenvalues( bandToDense( 'upper', 5, 2, bandUpper5() ), 5 ); // eslint-disable-line max-len
	const sigma = scaleFactor( 8e-160 );
	const r = runBase( mod.default, 'compute-vectors', 'all', 'upper', 5, 2, scaled( bandUpper5(), 1e-160 ), 1e-175, 0, 0 ); // eslint-disable-line max-len
	let i;
	assert.equal( r.info, 2 );
	assert.equal( r.M, 5 );
	assert.ok( sigma > 1.0, 'matrix is scaled' );

	// imax = info - 1 = 1: only w[0] is rescaled.
	assertClose( r.w[ 0 ] / 1e-160, ref[ 0 ], 1e-12, 'w[0] rescaled' );
	for ( i = 1; i < 5; i++ ) {
		assertClose( r.w[ i ] / ( sigma * 1e-160 ), ref[ i ], 1e-12, 'w[' + i + '] not rescaled' ); // eslint-disable-line max-len
	}
	assert.equal( r.IFAIL[ 2 ], 3 );
});

test( 'zhbevx: zstein failure on a split matrix permutes IFAIL along with the eigenvalues', async function t() {
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
	const Ad = bandToDense( 'lower', 4, 1, bandLowerSplit() );
	const r = runBase( mod.default, 'compute-vectors', 'all', 'lower', 4, 1, bandLowerSplit(), 1e-14, 0, 0 ); // eslint-disable-line max-len
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

// Reference thresholds (zhbevx.f): EPS = DLAMCH('Precision') = 2^-52, SAFMIN = DLAMCH('Safe minimum') = 2^-1022, SMLNUM = SAFMIN/EPS = 2^-970, RMIN = sqrt(SMLNUM) = 2^-485. With DLAMCH('Epsilon') = 2^-53 it would be RMIN = 2^-484.5. (RMAX = min(sqrt(1/SMLNUM), 1/sqrt(sqrt(SAFMIN))) = 2^255.5 with either constant, so only RMIN distinguishes them.)
const RMIN_P = Math.pow( 2.0, -485 );
const RMIN_E = Math.pow( 2.0, -484.5 );

test( 'zhbevx: rescales only when the max-norm is below RMIN built from DLAMCH(\'Precision\') (ticket 0089)', async function t() {
	const calls = [];
	const mod = await importWithDependencies( new URL( './../lib/base.js', import.meta.url ), {
		'../../zlascl/lib/base.js': function recordingZlascl() {
			calls.push( arguments );
			return zlasclReal.apply( null, arguments );
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
		// A = s * [[2, i, 0], [-i, 2, 0], [0, 0, 5]] (lower band storage, kd = 1, LDAB = 2) has max-norm 5s and eigenvalues s, 3s, 5s.
		s = cases[ k ][ 0 ] / 5.0;
		A = new Complex128Array( 6 );
		Av = new Float64Array( A.buffer );
		Av[ 0 ] = 2.0 * s;
		Av[ 3 ] = -s;
		Av[ 4 ] = 2.0 * s;
		Av[ 8 ] = 5.0 * s;
		w = new Float64Array( 3 );
		calls.length = 0;
		info = mod.default( 'compute-vectors', 'all', 'lower', 3, 1, A, 1, 2, 0, new Complex128Array( 9 ), 1, 3, 0, 0.0, 0.0, 0, 0, 0.0, m, w, 1, 0, new Complex128Array( 9 ), 1, 3, 0, new Complex128Array( 3 ), 1, 0, new Float64Array( 21 ), 1, 0, new Int32Array( 15 ), 1, 0, new Int32Array( 3 ), 1, 0 ); // eslint-disable-line max-len
		assert.equal( info, 0, 'info' );
		assert.equal( m[ 0 ], 3, 'M' );
		assert.equal( calls.length > 0, cases[ k ][ 1 ], 'rescaled, anrm=' + cases[ k ][ 0 ] ); // eslint-disable-line max-len
		for ( i = 0; i < 3; i++ ) {
			assert.ok( Math.abs( ( w[ i ] / s ) - ( ( 2 * i ) + 1 ) ) <= 1e-13, 'w[' + i + '] = ' + ( w[ i ] / s ) + 's, anrm=' + cases[ k ][ 0 ] ); // eslint-disable-line max-len
		}
	}
});
