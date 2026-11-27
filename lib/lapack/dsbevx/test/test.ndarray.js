/* eslint-disable no-restricted-syntax, no-mixed-operators, max-lines, max-params */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import dsbevx from './../lib/ndarray.js';
import dsyev from './../../dsyev/lib/ndarray.js';
import dlamch from './../../dlamch/lib/base.js';
import dsteinReal from './../../dstein/lib/base.js';
import { importWithDependencies } from './../../../../../test/harness/constants.js';
import dlascl from './../../dlascl/lib/base.js';

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
import v_v_l_kd1_n4 from './fixtures/v_v_l_kd1_n4.json' with { type: 'json' };
import n_i_u_kd1_n4_fast from './fixtures/n_i_u_kd1_n4_fast.json' with { type: 'json' };
import diagonal_v_a from './fixtures/diagonal_v_a.json' with { type: 'json' };
import n1_v_i from './fixtures/n1_v_i.json' with { type: 'json' };
import v_i_u_kd2_n5_single from './fixtures/v_i_u_kd2_n5_single.json' with { type: 'json' };

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
	const relErr = Math.abs( actual - expected ) / Math.max( Math.abs( expected ), 1.0 );
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
* Returns a 5x5 symmetric band matrix (KD=2), upper band storage.
*
* @private
* @returns {Float64Array} band matrix
*/
function bandUpper5() {
	return new Float64Array([
		0, 0, 4, 0, 1, 5, 2, 3, 6, 1, 2, 7, 1, 3, 8
	]);
}

/**
* Returns the same matrix in lower band storage.
*
* @private
* @returns {Float64Array} band matrix
*/
function bandLower5() {
	return new Float64Array([
		4, 1, 2, 5, 3, 1, 6, 2, 1, 7, 3, 0, 8, 0, 0
	]);
}

/**
* Returns a 4x4 tridiagonal (KD=1), lower band storage.
*
* @private
* @returns {Float64Array} band matrix
*/
function bandLower4Kd1() {
	return new Float64Array([
		4, 1, 5, 2, 6, 3, 7, 0
	]);
}

/**
* Returns a 4x4 tridiagonal (KD=1), upper band storage.
*
* @private
* @returns {Float64Array} band matrix
*/
function bandUpper4Kd1() {
	return new Float64Array([
		0, 4, 1, 5, 2, 6, 3, 7
	]);
}

/**
* Expands a band matrix to full symmetric matrix.
*
* @private
* @param {string} uplo - triangle
* @param {NonNegativeInteger} N - order
* @param {NonNegativeInteger} kd - bandwidth
* @param {Float64Array} AB - band matrix
* @returns {Float64Array} full symmetric matrix
*/
function bandToFull( uplo, N, kd, AB ) {
	const LDAB = kd + 1;
	const A = new Float64Array( N * N );
	let i, j, k;

	for ( j = 0; j < N; j++ ) {
		if ( uplo === 'upper' ) {
			for ( k = 0; k <= kd; k++ ) {
				i = j - k;
				if ( i >= 0 ) {
					A[ i + ( j * N ) ] = AB[ ( kd - k ) + ( j * LDAB ) ];
					A[ j + ( i * N ) ] = AB[ ( kd - k ) + ( j * LDAB ) ];
				}
			}
		} else {
			for ( k = 0; k <= kd; k++ ) {
				i = j + k;
				if ( i < N ) {
					A[ i + ( j * N ) ] = AB[ k + ( j * LDAB ) ];
					A[ j + ( i * N ) ] = AB[ k + ( j * LDAB ) ];
				}
			}
		}
	}
	return A;
}

/**
* Runs dsbevx with standard workspace allocation.
*
* @private
* @param {string} jobz - job type
* @param {string} range - range type
* @param {string} uplo - triangle
* @param {NonNegativeInteger} N - order
* @param {NonNegativeInteger} kd - bandwidth
* @param {Float64Array} AB - band matrix
* @param {number} vl - lower bound
* @param {number} vu - upper bound
* @param {integer} il - lower index
* @param {integer} iu - upper index
* @param {number} abstol - tolerance
* @returns {Object} results
*/
function runDsbevx( jobz, range, uplo, N, kd, AB, vl, vu, il, iu, abstol ) { // eslint-disable-line max-len
	const m = new Int32Array( 1 );
	const IWORK = new Int32Array( Math.max( (5 * N) + 10, 1 ) );
	const IFAIL = new Int32Array( Math.max( N, 1 ) );
	const WORK = new Float64Array( Math.max( (7 * N) + 100, 1 ) );
	const LDAB = kd + 1;
	const w = new Float64Array( Math.max( N, 1 ) );
	const Q = new Float64Array( Math.max( N * N, 1 ) );
	const Z = new Float64Array( Math.max( N * N, 1 ) );

	const info = dsbevx( jobz, range, uplo, N, kd, AB, 1, LDAB, 0, Q, 1, N, 0, vl, vu, il, iu, abstol, m, w, 1, 0, Z, 1, N, 0, WORK, 1, 0, IWORK, 1, 0, IFAIL, 1, 0 ); // eslint-disable-line max-len
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
* Verifies eigenvector property: A\_v = lambda\_v.
*
* @private
* @param {Float64Array} Afull - full symmetric matrix
* @param {NonNegativeInteger} N - order
* @param {Float64Array} w - eigenvalues
* @param {Float64Array} Z - eigenvectors
* @param {NonNegativeInteger} M - number of eigenpairs
* @param {number} tol - tolerance
* @param {string} msg - message prefix
*/
function verifyEigenpairs( Afull, N, w, Z, M, tol, msg ) { // eslint-disable-line max-params
	let err, nrm, Av, v, i, j, k;

	for ( k = 0; k < M; k++ ) {
		Av = new Float64Array( N );
		v = new Float64Array( N );

		for ( i = 0; i < N; i++ ) {
			v[ i ] = Z[ i + ( k * N ) ];
		}

		for ( i = 0; i < N; i++ ) {
			Av[ i ] = 0.0;
			for ( j = 0; j < N; j++ ) {
				Av[ i ] += Afull[ i + ( j * N ) ] * v[ j ];
			}
		}

		err = 0.0;
		nrm = 0.0;
		for ( i = 0; i < N; i++ ) {
			err += ( Av[ i ] - ( w[ k ] * v[ i ] ) ) * ( Av[ i ] - ( w[ k ] * v[ i ] ) ); // eslint-disable-line max-len
			nrm += v[ i ] * v[ i ];
		}
		err = Math.sqrt( err );
		nrm = Math.sqrt( nrm );
		assert.ok( err / ( nrm * Math.max( Math.abs( w[ k ] ), 1.0 ) ) < tol, msg + ': eigenpair ' + k + ' residual too large (' + err + ')' ); // eslint-disable-line max-len
	}
}

// TESTS //

test( 'dsbevx is a function', function t() {
	assert.equal( typeof dsbevx, 'function' );
});

test( 'dsbevx: V, A, U, KD=2, N=5', function t() {
	const ABo = bandUpper5();
	const AB = new Float64Array( ABo );
	const tc = v_a_u_kd2_n5;

	const Afull = bandToFull( 'upper', 5, 2, ABo );
	const r = runDsbevx( 'compute-vectors', 'all', 'upper', 5, 2, AB, 0, 0, 0, 0, 0 );
	assert.equal( r.info, tc.info );
	assert.equal( r.M, tc.M );
	assertArrayClose( Array.prototype.slice.call( r.w, 0, r.M ), tc.w, 1e-13, 'w' ); // eslint-disable-line max-len
	verifyEigenpairs( Afull, 5, r.w, r.Z, r.M, 1e-12, 'eigenpairs' );
});

test( 'dsbevx: V, A, L, KD=2, N=5', function t() {
	const ABo = bandLower5();
	const AB = new Float64Array( ABo );
	const tc = v_a_l_kd2_n5;

	const Afull = bandToFull( 'lower', 5, 2, ABo );
	const r = runDsbevx( 'compute-vectors', 'all', 'lower', 5, 2, AB, 0, 0, 0, 0, 0 );
	assert.equal( r.info, tc.info );
	assert.equal( r.M, tc.M );
	assertArrayClose( Array.prototype.slice.call( r.w, 0, r.M ), tc.w, 1e-13, 'w' ); // eslint-disable-line max-len
	verifyEigenpairs( Afull, 5, r.w, r.Z, r.M, 1e-12, 'eigenpairs' );
});

test( 'dsbevx: N, A, U, KD=2, N=5 (eigenvalues only)', function t() {
	const tc = n_a_u_kd2_n5;
	const AB = bandUpper5();
	const r = runDsbevx( 'no-vectors', 'all', 'upper', 5, 2, AB, 0, 0, 0, 0, 0 );

	assert.equal( r.info, tc.info );
	assert.equal( r.M, tc.M );
	assertArrayClose( Array.prototype.slice.call( r.w, 0, r.M ), tc.w, 1e-13, 'w' ); // eslint-disable-line max-len
});

test( 'dsbevx: V, V, U, KD=2, N=5 (value range [3, 8])', function t() {
	const ABo = bandUpper5();
	const AB = new Float64Array( ABo );
	const tc = v_v_u_kd2_n5;

	const Afull = bandToFull( 'upper', 5, 2, ABo );
	const r = runDsbevx( 'compute-vectors', 'value', 'upper', 5, 2, AB, 3.0, 8.0, 0, 0, 0 ); // eslint-disable-line max-len
	assert.equal( r.info, tc.info );
	assert.equal( r.M, tc.M );
	assertArrayClose( Array.prototype.slice.call( r.w, 0, r.M ), tc.w, 1e-13, 'w' ); // eslint-disable-line max-len
	verifyEigenpairs( Afull, 5, r.w, r.Z, r.M, 1e-12, 'eigenpairs' );
});

test( 'dsbevx: V, I, U, KD=2, N=5 (index range 2..4)', function t() {
	const ABo = bandUpper5();
	const AB = new Float64Array( ABo );
	const tc = v_i_u_kd2_n5;

	const Afull = bandToFull( 'upper', 5, 2, ABo );
	const r = runDsbevx( 'compute-vectors', 'index', 'upper', 5, 2, AB, 0, 0, 2, 4, 0 ); // eslint-disable-line max-len
	assert.equal( r.info, tc.info );
	assert.equal( r.M, tc.M );
	assertArrayClose( Array.prototype.slice.call( r.w, 0, r.M ), tc.w, 1e-13, 'w' ); // eslint-disable-line max-len
	verifyEigenpairs( Afull, 5, r.w, r.Z, r.M, 1e-12, 'eigenpairs' );
});

test( 'dsbevx: N, V, L, KD=2, N=5 (value range [1, 5])', function t() {
	const tc = n_v_l_kd2_n5;
	const AB = bandLower5();
	const r = runDsbevx( 'no-vectors', 'value', 'lower', 5, 2, AB, 1.0, 5.0, 0, 0, 0 ); // eslint-disable-line max-len

	assert.equal( r.info, tc.info );
	assert.equal( r.M, tc.M );
	assertArrayClose( Array.prototype.slice.call( r.w, 0, r.M ), tc.w, 1e-13, 'w' ); // eslint-disable-line max-len
});

test( 'dsbevx: N, I, L, KD=2, N=5 (index 3 only)', function t() {
	const tc = n_i_l_kd2_n5;
	const AB = bandLower5();
	const r = runDsbevx( 'no-vectors', 'index', 'lower', 5, 2, AB, 0, 0, 3, 3, 0 );

	assert.equal( r.info, tc.info );
	assert.equal( r.M, tc.M );
	assertArrayClose( Array.prototype.slice.call( r.w, 0, r.M ), tc.w, 1e-13, 'w' ); // eslint-disable-line max-len
});

test( 'dsbevx: N=1, V, A, L', function t() {
	const tc = n1_v_a_l;
	const AB = new Float64Array( [ 3.5 ] );
	const r = runDsbevx( 'compute-vectors', 'all', 'lower', 1, 0, AB, 0, 0, 0, 0, 0 ); // eslint-disable-line max-len

	assert.equal( r.info, tc.info );
	assert.equal( r.M, tc.M );
	assertClose( r.w[ 0 ], tc.w1, 1e-14, 'w1' );
	assertClose( r.Z[ 0 ], tc.z11, 1e-14, 'z11' );
});

test( 'dsbevx: N=1, V, V, excluded', function t() {
	const AB = new Float64Array( [ 3.5 ] );
	const r = runDsbevx( 'compute-vectors', 'value', 'lower', 1, 0, AB, 0, 3.0, 0, 0, 0 ); // eslint-disable-line max-len

	assert.equal( r.info, 0 );
	assert.equal( r.M, 0 );
});

test( 'dsbevx: N=1, V, V, included', function t() {
	const tc = n1_v_v_included;
	const AB = new Float64Array( [ 3.5 ] );
	const r = runDsbevx( 'compute-vectors', 'value', 'lower', 1, 0, AB, 3.0, 4.0, 0, 0, 0 ); // eslint-disable-line max-len

	assert.equal( r.info, tc.info );
	assert.equal( r.M, tc.M );
	assertClose( r.w[ 0 ], tc.w1, 1e-14, 'w1' );
	assertClose( r.Z[ 0 ], tc.z11, 1e-14, 'z11' );
});

test( 'dsbevx: N=0 (quick return)', function t() {
	const AB = new Float64Array( 1 );
	const r = runDsbevx( 'compute-vectors', 'all', 'upper', 0, 0, AB, 0, 0, 0, 0, 0 ); // eslint-disable-line max-len

	assert.equal( r.info, 0 );
	assert.equal( r.M, 0 );
});

test( 'dsbevx: V, I, L, KD=1, N=4, fast path (IL=1, IU=N)', function t() {
	const ABo = bandLower4Kd1();
	const AB = new Float64Array( ABo );
	const tc = v_i_l_kd1_n4_fast;

	const Afull = bandToFull( 'lower', 4, 1, ABo );
	const r = runDsbevx( 'compute-vectors', 'index', 'lower', 4, 1, AB, 0, 0, 1, 4, 0 ); // eslint-disable-line max-len
	assert.equal( r.info, tc.info );
	assert.equal( r.M, tc.M );
	assertArrayClose( Array.prototype.slice.call( r.w, 0, r.M ), tc.w, 1e-13, 'w' ); // eslint-disable-line max-len
	verifyEigenpairs( Afull, 4, r.w, r.Z, r.M, 1e-12, 'eigenpairs' );
});

test( 'dsbevx: V, V, L, KD=1, N=4 (value range [4.5, 7.5])', function t() {
	const ABo = bandLower4Kd1();
	const AB = new Float64Array( ABo );
	const tc = v_v_l_kd1_n4;

	const Afull = bandToFull( 'lower', 4, 1, ABo );
	const r = runDsbevx( 'compute-vectors', 'value', 'lower', 4, 1, AB, 4.5, 7.5, 0, 0, 0 ); // eslint-disable-line max-len
	assert.equal( r.info, tc.info );
	assert.equal( r.M, tc.M );
	assertArrayClose( Array.prototype.slice.call( r.w, 0, r.M ), tc.w, 1e-13, 'w' ); // eslint-disable-line max-len
	verifyEigenpairs( Afull, 4, r.w, r.Z, r.M, 1e-12, 'eigenpairs' );
});

test( 'dsbevx: N, I, U, KD=1, N=4, fast path (IL=1, IU=N)', function t() {
	const tc = n_i_u_kd1_n4_fast;
	const AB = bandUpper4Kd1();
	const r = runDsbevx( 'no-vectors', 'index', 'upper', 4, 1, AB, 0, 0, 1, 4, 0 );

	assert.equal( r.info, tc.info );
	assert.equal( r.M, tc.M );
	assertArrayClose( Array.prototype.slice.call( r.w, 0, r.M ), tc.w, 1e-13, 'w' ); // eslint-disable-line max-len
});

test( 'dsbevx: diagonal (KD=0), V, A', function t() {
	const ABo = new Float64Array( [ 3, 1, 4, 2 ] );
	const AB = new Float64Array( ABo );
	const tc = diagonal_v_a;

	const Afull = bandToFull( 'upper', 4, 0, ABo );
	const r = runDsbevx( 'compute-vectors', 'all', 'upper', 4, 0, AB, 0, 0, 0, 0, 0 );
	assert.equal( r.info, tc.info );
	assert.equal( r.M, tc.M );
	assertArrayClose( Array.prototype.slice.call( r.w, 0, r.M ), tc.w, 1e-14, 'w' ); // eslint-disable-line max-len
	verifyEigenpairs( Afull, 4, r.w, r.Z, r.M, 1e-12, 'eigenpairs' );
});

test( 'dsbevx: N=1, V, I (IL=IU=1)', function t() {
	const tc = n1_v_i;
	const AB = new Float64Array( [ 5 ] );
	const r = runDsbevx( 'compute-vectors', 'index', 'upper', 1, 0, AB, 0, 0, 1, 1, 0 ); // eslint-disable-line max-len

	assert.equal( r.info, tc.info );
	assert.equal( r.M, tc.M );
	assertClose( r.w[ 0 ], tc.w1, 1e-14, 'w1' );
	assertClose( r.Z[ 0 ], tc.z11, 1e-14, 'z11' );
});

test( 'dsbevx: V, I, U, KD=2, N=5, single eigenvalue (IL=IU=1)', function t() {
	const ABo = bandUpper5();
	const AB = new Float64Array( ABo );
	const tc = v_i_u_kd2_n5_single;

	const Afull = bandToFull( 'upper', 5, 2, ABo );
	const r = runDsbevx( 'compute-vectors', 'index', 'upper', 5, 2, AB, 0, 0, 1, 1, 0 ); // eslint-disable-line max-len
	assert.equal( r.info, tc.info );
	assert.equal( r.M, tc.M );
	assertArrayClose( Array.prototype.slice.call( r.w, 0, r.M ), tc.w, 1e-13, 'w' ); // eslint-disable-line max-len
	verifyEigenpairs( Afull, 5, r.w, r.Z, r.M, 1e-12, 'eigenpairs' );
});

// FUNCTIONS (ADDITIONAL CHECKS) //

/**
* Returns the eigenvalues (ascending) of a dense symmetric matrix computed independently by dsyev.
*
* @private
* @param {Float64Array} Afull - full symmetric matrix (column-major, N-by-N)
* @param {NonNegativeInteger} N - order
* @returns {Float64Array} eigenvalues
*/
function denseEigenvalues( Afull, N ) {
	const A = new Float64Array( Afull );
	const w = new Float64Array( N );
	const WORK = new Float64Array( 64 * N );
	const info = dsyev( 'no-vectors', 'upper', N, A, 1, N, 0, w, 1, 0, WORK, 1, 0 );
	assert.equal( info, 0, 'dsyev info' );
	return w;
}

/**
* Returns the max-abs entry of a dense matrix.
*
* @private
* @param {Float64Array} A - matrix
* @returns {number} max-abs entry
*/
function maxAbs( A ) {
	let mx = 0.0;
	let i;
	for ( i = 0; i < A.length; i++ ) {
		mx = Math.max( mx, Math.abs( A[ i ] ) );
	}
	return mx;
}

/**
* Asserts ||A z_k - w_k z_k|| <= 1e-12 * N * ||A|| and Z^T Z = I for the first M columns.
*
* @private
* @param {Float64Array} Afull - full symmetric matrix (column-major)
* @param {NonNegativeInteger} N - order
* @param {Float64Array} w - eigenvalues
* @param {Float64Array} Z - eigenvectors (column-major, LDZ = N)
* @param {NonNegativeInteger} M - number of eigenpairs
* @param {string} msg - message prefix
*/
function assertResidualOrtho( Afull, N, w, Z, M, msg ) {
	const anrm = maxAbs( Afull ) * N;
	let err, dot, s, i, j, k;
	for ( k = 0; k < M; k++ ) {
		err = 0.0;
		for ( i = 0; i < N; i++ ) {
			s = 0.0;
			for ( j = 0; j < N; j++ ) {
				s += Afull[ i + ( j * N ) ] * Z[ j + ( k * N ) ];
			}
			s -= w[ k ] * Z[ i + ( k * N ) ];
			err += s * s;
		}
		assert.ok( Math.sqrt( err ) <= 1e-12 * N * anrm, msg + ': residual ' + k + ' = ' + Math.sqrt( err ) ); // eslint-disable-line max-len
		for ( j = 0; j <= k; j++ ) {
			dot = 0.0;
			for ( i = 0; i < N; i++ ) {
				dot += Z[ i + ( j * N ) ] * Z[ i + ( k * N ) ];
			}
			assert.ok( Math.abs( dot - ( ( j === k ) ? 1.0 : 0.0 ) ) <= 1e-12 * N, msg + ': orthonormality (' + j + ',' + k + ')' ); // eslint-disable-line max-len
		}
	}
}

/**
* Scales every entry of an array.
*
* @private
* @param {Float64Array} x - array
* @param {number} alpha - scalar
* @returns {Float64Array} scaled copy
*/
function scaled( x, alpha ) {
	const out = new Float64Array( x.length );
	let i;
	for ( i = 0; i < x.length; i++ ) {
		out[ i ] = x[ i ] * alpha;
	}
	return out;
}

/**
* Returns a 4x4 tridiagonal (KD=1) in lower band storage that splits into two 2x2 blocks: [[5,1],[1,5]] (eigenvalues 4, 6) and [[0,1],[1,0]] (eigenvalues -1, 1).
*
* @private
* @returns {Float64Array} band matrix
*/
function bandLowerSplit() {
	return new Float64Array([
		5, 1, 5, 0, 0, 1, 0, 0
	]);
}

/**
* Returns the scaling factor dsbevx applies to a matrix with max-abs entry `anrm`.
*
* @private
* @param {number} anrm - max-abs entry
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

test( 'dsbevx: tiny-norm matrix (1e-160) is scaled; V, V, U with abstol > 0', function t() {
	const ABo = scaled( bandUpper5(), 1e-160 );
	const Afull = bandToFull( 'upper', 5, 2, ABo );
	const ref = denseEigenvalues( bandToFull( 'upper', 5, 2, bandUpper5() ), 5 );
	const expected = [];
	let i;
	for ( i = 0; i < 5; i++ ) {
		if ( ref[ i ] > 3.0 && ref[ i ] <= 8.0 ) {
			expected.push( ref[ i ] * 1e-160 );
		}
	}
	const r = runDsbevx( 'compute-vectors', 'value', 'upper', 5, 2, new Float64Array( ABo ), 3e-160, 8e-160, 0, 0, 1e-175 ); // eslint-disable-line max-len
	assert.equal( r.info, 0 );
	assert.ok( expected.length > 0 && expected.length < 5, 'range is selective' );
	assert.equal( r.M, expected.length );
	for ( i = 0; i < r.M; i++ ) {
		assert.ok( Math.abs( r.w[ i ] - expected[ i ] ) <= 1e-12 * 8e-160, 'w[' + i + ']' ); // eslint-disable-line max-len
		assert.equal( r.IFAIL[ i ], 0 );
	}
	assertResidualOrtho( Afull, 5, r.w, r.Z, r.M, 'tiny' );
});

test( 'dsbevx: huge-norm matrix (1e100) is scaled; V, I, L (2..4)', function t() {
	const ABo = scaled( bandLower5(), 1e100 );
	const Afull = bandToFull( 'lower', 5, 2, ABo );
	const ref = denseEigenvalues( Afull, 5 );
	const r = runDsbevx( 'compute-vectors', 'index', 'lower', 5, 2, new Float64Array( ABo ), 0, 0, 2, 4, 0 ); // eslint-disable-line max-len
	let i;
	assert.equal( r.info, 0 );
	assert.equal( r.M, 3 );
	for ( i = 0; i < 3; i++ ) {
		assert.ok( Math.abs( r.w[ i ] - ref[ i + 1 ] ) <= 1e-12 * 8e100, 'w[' + i + ']' ); // eslint-disable-line max-len
	}
	assertResidualOrtho( Afull, 5, r.w, r.Z, r.M, 'huge' );
});

test( 'dsbevx: huge-norm matrix (1e100), N, A, U fast path rescales all eigenvalues', function t() {
	const ABo = scaled( bandUpper5(), 1e100 );
	const ref = denseEigenvalues( bandToFull( 'upper', 5, 2, ABo ), 5 );
	const r = runDsbevx( 'no-vectors', 'all', 'upper', 5, 2, new Float64Array( ABo ), 0, 0, 0, 0, 0 ); // eslint-disable-line max-len
	let i;
	assert.equal( r.info, 0 );
	assert.equal( r.M, 5 );
	for ( i = 0; i < 5; i++ ) {
		assert.ok( Math.abs( r.w[ i ] - ref[ i ] ) <= 1e-12 * 8e100, 'w[' + i + ']' ); // eslint-disable-line max-len
	}
});

test( 'dsbevx: split matrix with abstol > 0 (bisection, block order) sorts eigenpairs ascending', function t() {
	const ABo = bandLowerSplit();
	const Afull = bandToFull( 'lower', 4, 1, ABo );
	const r = runDsbevx( 'compute-vectors', 'all', 'lower', 4, 1, new Float64Array( ABo ), 0, 0, 0, 0, 1e-14 ); // eslint-disable-line max-len
	const expected = [ -1.0, 1.0, 4.0, 6.0 ];
	let i;
	assert.equal( r.info, 0 );
	assert.equal( r.M, 4 );
	for ( i = 0; i < 4; i++ ) {
		assertClose( r.w[ i ], expected[ i ], 1e-13, 'w[' + i + ']' );
		assert.equal( r.IFAIL[ i ], 0 );
	}
	assertResidualOrtho( Afull, 4, r.w, r.Z, r.M, 'split' );
});

test( 'dsbevx: when dsteqr fails, falls back to bisection + inverse iteration', async function t() {
	const mod = await importWithDependencies( new URL( './../lib/base.js', import.meta.url ), {
		'../../dsteqr/lib/base.js': function failingDsteqr() {
			return 1;
		}
	});
	const ABo = bandUpper5();
	const Afull = bandToFull( 'upper', 5, 2, ABo );
	const ref = denseEigenvalues( Afull, 5 );
	const m = new Int32Array( 1 );
	const w = new Float64Array( 5 );
	const Z = new Float64Array( 25 );
	const IFAIL = new Int32Array( 5 );
	const info = mod.default( 'compute-vectors', 'all', 'upper', 5, 2, new Float64Array( ABo ), 1, 3, 0, new Float64Array( 25 ), 1, 5, 0, 0, 0, 0, 0, 0, m, w, 1, 0, Z, 1, 5, 0, new Float64Array( 35 ), 1, 0, new Int32Array( 25 ), 1, 0, IFAIL, 1, 0 ); // eslint-disable-line max-len
	let i;
	assert.equal( info, 0 );
	assert.equal( m[ 0 ], 5 );
	for ( i = 0; i < 5; i++ ) {
		assertClose( w[ i ], ref[ i ], 1e-13, 'w[' + i + ']' );
		assert.equal( IFAIL[ i ], 0 );
	}
	assertResidualOrtho( Afull, 5, w, Z, 5, 'dsteqr fallback' );
});

test( 'dsbevx: when dsterf fails, falls back to bisection (no vectors)', async function t() {
	const mod = await importWithDependencies( new URL( './../lib/base.js', import.meta.url ), {
		'../../dsterf/lib/base.js': function failingDsterf() {
			return 2;
		}
	});
	const ABo = bandLower5();
	const ref = denseEigenvalues( bandToFull( 'lower', 5, 2, ABo ), 5 );
	const m = new Int32Array( 1 );
	const w = new Float64Array( 5 );
	const info = mod.default( 'no-vectors', 'index', 'lower', 5, 2, new Float64Array( ABo ), 1, 3, 0, new Float64Array( 25 ), 1, 5, 0, 0, 0, 1, 5, 0, m, w, 1, 0, new Float64Array( 25 ), 1, 5, 0, new Float64Array( 35 ), 1, 0, new Int32Array( 25 ), 1, 0, new Int32Array( 5 ), 1, 0 ); // eslint-disable-line max-len
	let i;
	assert.equal( info, 0 );
	assert.equal( m[ 0 ], 5 );
	for ( i = 0; i < 5; i++ ) {
		assertClose( w[ i ], ref[ i ], 1e-13, 'w[' + i + ']' );
	}
});

test( 'dsbevx: dstein failure on a scaled matrix returns its info and rescales only w[0..info-2]', async function t() {
	const mod = await importWithDependencies( new URL( './../lib/base.js', import.meta.url ), {
		'../../dstein/lib/base.js': function failingDstein() {
			const args = Array.prototype.slice.call( arguments );
			dsteinReal.apply( null, args );
			args[ 27 ][ args[ 29 ] + ( 2 * args[ 28 ] ) ] = 3;
			return 2;
		}
	});
	const ABo = scaled( bandUpper5(), 1e-160 );
	const ref = denseEigenvalues( bandToFull( 'upper', 5, 2, bandUpper5() ), 5 );
	const sigma = scaleFactor( 8e-160 );
	const m = new Int32Array( 1 );
	const w = new Float64Array( 5 );
	const IFAIL = new Int32Array( 5 );
	const info = mod.default( 'compute-vectors', 'all', 'upper', 5, 2, new Float64Array( ABo ), 1, 3, 0, new Float64Array( 25 ), 1, 5, 0, 0, 0, 0, 0, 1e-175, m, w, 1, 0, new Float64Array( 25 ), 1, 5, 0, new Float64Array( 35 ), 1, 0, new Int32Array( 25 ), 1, 0, IFAIL, 1, 0 ); // eslint-disable-line max-len
	let i;
	assert.equal( info, 2 );
	assert.equal( m[ 0 ], 5 );
	assert.ok( sigma > 1.0, 'matrix is scaled' );

	// imax = info - 1 = 1: only w[0] is rescaled; the rest stay in the scaled problem's units.
	assertClose( w[ 0 ] / 1e-160, ref[ 0 ], 1e-12, 'w[0] rescaled' );
	for ( i = 1; i < 5; i++ ) {
		assertClose( w[ i ] / ( sigma * 1e-160 ), ref[ i ], 1e-12, 'w[' + i + '] not rescaled' ); // eslint-disable-line max-len
	}
	assert.equal( IFAIL[ 2 ], 3 );
});

test( 'dsbevx: dstein failure on a split matrix permutes IFAIL along with the eigenvalues', async function t() {
	const pre = [];
	const mod = await importWithDependencies( new URL( './../lib/base.js', import.meta.url ), {
		'../../dstein/lib/base.js': function failingDstein() {
			const args = Array.prototype.slice.call( arguments );
			let k;
			dsteinReal.apply( null, args );
			for ( k = 0; k < args[ 7 ]; k++ ) {
				pre.push( args[ 8 ][ args[ 10 ] + ( k * args[ 9 ] ) ] );
				args[ 27 ][ args[ 29 ] + ( k * args[ 28 ] ) ] = 10 + k;
			}
			return 4;
		}
	});
	const ABo = bandLowerSplit();
	const Afull = bandToFull( 'lower', 4, 1, ABo );
	const m = new Int32Array( 1 );
	const w = new Float64Array( 4 );
	const Z = new Float64Array( 16 );
	const IFAIL = new Int32Array( 4 );
	const info = mod.default( 'compute-vectors', 'all', 'lower', 4, 1, new Float64Array( ABo ), 1, 2, 0, new Float64Array( 16 ), 1, 4, 0, 0, 0, 0, 0, 1e-14, m, w, 1, 0, Z, 1, 4, 0, new Float64Array( 28 ), 1, 0, new Int32Array( 20 ), 1, 0, IFAIL, 1, 0 ); // eslint-disable-line max-len
	const expected = [ -1.0, 1.0, 4.0, 6.0 ];
	let i;
	assert.equal( info, 4 );
	assert.equal( m[ 0 ], 4 );
	assert.notDeepEqual( pre, expected, 'block order differs from ascending order' );
	for ( i = 0; i < 4; i++ ) {
		assertClose( w[ i ], expected[ i ], 1e-13, 'w[' + i + ']' );
		assert.equal( pre[ IFAIL[ i ] - 10 ], w[ i ], 'IFAIL[' + i + '] follows its eigenvalue' ); // eslint-disable-line max-len
	}
	assertResidualOrtho( Afull, 4, w, Z, 4, 'split dstein failure' );
});

// Ticket 0089 //

// Reference thresholds (data/lapack-3.12.0/SRC/dsbevx.f): SAFMIN = DLAMCH( 'S' ) = 2^-1022 and EPS = DLAMCH( 'P' ) = 2^-52 give SMLNUM = 2^-970 and RMIN = SQRT( SMLNUM ) = 2^-485. With DLAMCH( 'E' ) = 2^-53 RMIN would be 2^-484.5. ( RMAX = MIN( SQRT( BIGNUM ), 1/SQRT( SQRT( SAFMIN ) ) ) = 2^255.5 does not depend on EPS. )
const RMIN_P = Math.pow( 2.0, -485 );

/**
* Runs dsbevx on T = s * tridiag( 1, 2, 1 ) in upper band storage (KD = 1, LDAB = 2), through a module whose scaling dependencies are spied on.
*
* @private
* @param {Function} mod - dsbevx base implementation
* @param {number} s - scale of the matrix ( max|T| = 2s )
* @returns {Object} info and eigenvalues
*/
function run( mod, s ) {
	const AB = new Float64Array( [ 0.0, 2.0 * s, s, 2.0 * s, s, 2.0 * s ] );
	const m = new Int32Array( 1 );
	const w = new Float64Array( 3 );
	const info = mod( 'compute-vectors', 'all', 'upper', 3, 1, AB, 1, 2, 0, new Float64Array( 9 ), 1, 3, 0, 0.0, 0.0, 0, 0, 0.0, m, w, 1, 0, new Float64Array( 9 ), 1, 3, 0, new Float64Array( 100 ), 1, 0, new Int32Array( 50 ), 1, 0, new Int32Array( 3 ), 1, 0 ); // eslint-disable-line max-len
	assert.equal( m[ 0 ], 3, 'm' );
	return { 'info': info, 'w': w };
}

/**
* Asserts that `w` holds the eigenvalues of s * tridiag( 1, 2, 1 ), i.e. s * ( 2 - sqrt(2) ), 2s, s * ( 2 + sqrt(2) ).
*
* @private
* @param {Float64Array} w - computed eigenvalues
* @param {number} s - scale
* @param {string} msg - message
*/
function assertSpectrum( w, s, msg ) {
	const ref = [ s * ( 2.0 - Math.SQRT2 ), 2.0 * s, s * ( 2.0 + Math.SQRT2 ) ];
	let i;
	for ( i = 0; i < 3; i++ ) {
		assert.ok( Math.abs( w[ i ] - ref[ i ] ) <= 1e-13 * ref[ i ], msg + ': w[' + i + '] expected ' + ref[ i ] + ', got ' + w[ i ] ); // eslint-disable-line max-len
	}
}

test( 'dsbevx: matrix norm between the DLAMCH(P) and DLAMCH(E) RMIN thresholds is not rescaled (ticket 0089)', async function t() {
	const calls = [];
	const mod = ( await importWithDependencies( new URL( './../lib/base.js', import.meta.url ), {
		'../../dlascl/lib/base.js': function spyDlascl() {
			calls.push( 'dlascl' );
			return dlascl.apply( null, arguments );
		}
	}) ).default;
	let out;
	let s;

	// Control: max|T| = 0.5 * RMIN_P is below both thresholds, so the matrix is rescaled.
	s = 0.25 * RMIN_P;
	out = run( mod, s );
	assert.equal( out.info, 0, 'info (control)' );
	assert.ok( calls.length > 0, 'rescaled (control)' );
	assertSpectrum( out.w, s, 'control' );

	// max|T| = 1.2 * RMIN_P lies in ( RMIN_P, RMIN_E ) = ( 1, 1.414 ) * RMIN_P: no rescaling.
	s = 0.6 * RMIN_P;
	calls.length = 0;
	out = run( mod, s );
	assert.equal( out.info, 0, 'info (below RMIN_E)' );
	assert.deepEqual( calls, [], 'not rescaled (below RMIN_E)' );
	assertSpectrum( out.w, s, 'below RMIN_E' );
});
