/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import dsyevr from './../lib/ndarray.js';
import dscal from './../../../../blas/base/dscal/lib/base.js';
import { importWithDependencies } from './../../../../../test/harness/constants.js';

// FIXTURES //

import v_a_l from './fixtures/v_a_l.json' with { type: 'json' };
import v_a_u from './fixtures/v_a_u.json' with { type: 'json' };
import n_a_l from './fixtures/n_a_l.json' with { type: 'json' };
import v_v_l from './fixtures/v_v_l.json' with { type: 'json' };
import v_i_l from './fixtures/v_i_l.json' with { type: 'json' };
import n1 from './fixtures/n1.json' with { type: 'json' };
import n_v_u from './fixtures/n_v_u.json' with { type: 'json' };
import n_i_l from './fixtures/n_i_l.json' with { type: 'json' };

// FUNCTIONS //

/**
* Asserts that two numbers are approximately equal.
*
* @private
* @param {*} actual - actual value
* @param {*} expected - expected value
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
* @param {*} actual - actual value
* @param {*} expected - expected value
* @param {number} tol - tolerance
* @param {string} msg - assertion message
*/
function assertArrayClose( actual, expected, tol, msg ) {
	let i;
	assert.equal( actual.length, expected.length, msg + ': length mismatch (actual=' + actual.length + ', expected=' + expected.length + ')' ); // eslint-disable-line max-len
	for ( i = 0; i < expected.length; i++ ) {
		assertClose( actual[ i ], expected[ i ], tol, msg + '[' + i + ']' );
	}
}

/**
* 4x4 symmetric matrix (column-major flat):.
*   [10    1     0.5   0.25]
*   [1     8     0.5   0   ]
*   [0.5   0.5   12    1   ]
*   [0.25  0     1     6   ]
*
* Stored as lower triangle for 'lower', upper for 'upper'.
*/
function symMatrix4Lower() {
	// Full column-major, but only lower triangle matters for UPLO='L'
	return new Float64Array([
		10,
		1,
		0.5,
		0.25,
		1,
		8,
		0.5,
		0,
		0.5,
		0.5,
		12,
		1,
		0.25,
		0,
		1,
		6
	]);
}

/**
* SymMatrix4Upper.
*
* @private
* @returns {*} result
*/
function symMatrix4Upper() {
	// Full column-major, but only upper triangle matters for UPLO='U'
	return new Float64Array([
		10,
		1,
		0.5,
		0.25,
		1,
		8,
		0.5,
		0,
		0.5,
		0.5,
		12,
		1,
		0.25,
		0,
		1,
		6
	]);
}

/**
* Verify eigenvector property: A_v = lambda_v for each eigenpair.
* Aorig is N x N symmetric (Float64Array column-major), Z is N x M, w is eigenvalues.
*/
function verifyEigenpairs( Aorig, N, w, Z, M, tol, msg ) {
	let Avec, err, nrm, v, i, j, k;

	for ( k = 0; k < M; k++ ) {
		Avec = new Float64Array( N );
		v = new Float64Array( N );

		// Extract eigenvector k (column k of Z)
		for ( i = 0; i < N; i++ ) {
			v[ i ] = Z[ i + k * N ];
		}

		// Compute A*v
		for ( i = 0; i < N; i++ ) {
			Avec[ i ] = 0.0;
			for ( j = 0; j < N; j++ ) {
				Avec[ i ] += Aorig[ i + j * N ] * v[ j ];
			}
		}

		// Check ||A*v - lambda*v|| / (||v|| * |lambda|)
		err = 0.0;
		nrm = 0.0;
		for ( i = 0; i < N; i++ ) {
			err += ( Avec[ i ] - w[ k ] * v[ i ] ) * ( Avec[ i ] - w[ k ] * v[ i ] );
			nrm += v[ i ] * v[ i ];
		}
		err = Math.sqrt( err );
		nrm = Math.sqrt( nrm );
		assert.ok( err / ( nrm * Math.max( Math.abs( w[ k ] ), 1.0 ) ) < tol, msg + ': eigenpair ' + k + ' residual too large (' + err + ')' ); // eslint-disable-line max-len
	}
}

/**
* Converts a typed array to a plain array.
*
* @private
* @param {TypedArray} arr - input array
* @returns {Array} output array
*/
function toArray( arr ) {
	const out = [];
	let i;
	for ( i = 0; i < arr.length; i++ ) {
		out.push( arr[ i ] );
	}
	return out;
}

// TESTS //

test( 'dsyevr: V_A_L - compute all eigenvectors, lower', function t() {
	const m = new Int32Array( 1 );

	const tc = v_a_l;
	const N = tc.N;
	const A = symMatrix4Lower();
	const w = new Float64Array( N );
	const Z = new Float64Array( N * N );
	const ISUPPZ = new Int32Array( 2 * N );
	const WORK = new Float64Array( 26 * N );
	const IWORK = new Int32Array( 10 * N );
	const info = dsyevr( 'compute-vectors', 'all', 'lower', N, A, 1, N, 0, 0.0, 0.0, 0, 0, 0.0, m, w, 1, 0, Z, 1, N, 0, ISUPPZ, 1, 0, WORK, 1, 0, IWORK, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, 0 );
	assert.equal( m[ 0 ], tc.M );
	assertArrayClose( toArray( w.subarray( 0, m[ 0 ] ) ), tc.w, 1e-12, 'eigenvalues' ); // eslint-disable-line max-len
	verifyEigenpairs( symMatrix4Lower(), N, w, Z, m[ 0 ], 1e-12, 'eigenpairs' );
});

test( 'dsyevr: V_A_U - compute all eigenvectors, upper', function t() {
	const m = new Int32Array( 1 );

	const tc = v_a_u;
	const N = tc.N;
	const A = symMatrix4Upper();
	const w = new Float64Array( N );
	const Z = new Float64Array( N * N );
	const ISUPPZ = new Int32Array( 2 * N );
	const WORK = new Float64Array( 26 * N );
	const IWORK = new Int32Array( 10 * N );
	const info = dsyevr( 'compute-vectors', 'all', 'upper', N, A, 1, N, 0, 0.0, 0.0, 0, 0, 0.0, m, w, 1, 0, Z, 1, N, 0, ISUPPZ, 1, 0, WORK, 1, 0, IWORK, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, 0 );
	assert.equal( m[ 0 ], tc.M );
	assertArrayClose( toArray( w.subarray( 0, m[ 0 ] ) ), tc.w, 1e-12, 'eigenvalues' ); // eslint-disable-line max-len
	verifyEigenpairs( symMatrix4Upper(), N, w, Z, m[ 0 ], 1e-12, 'eigenpairs' );
});

test( 'dsyevr: N_A_L - eigenvalues only, all, lower', function t() {
	const m = new Int32Array( 1 );

	const tc = n_a_l;
	const N = tc.N;
	const A = symMatrix4Lower();
	const w = new Float64Array( N );
	const Z = new Float64Array( 1 );
	const ISUPPZ = new Int32Array( 2 * N );
	const WORK = new Float64Array( 26 * N );
	const IWORK = new Int32Array( 10 * N );
	const info = dsyevr( 'no-vectors', 'all', 'lower', N, A, 1, N, 0, 0.0, 0.0, 0, 0, 0.0, m, w, 1, 0, Z, 1, 1, 0, ISUPPZ, 1, 0, WORK, 1, 0, IWORK, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, 0 );
	assert.equal( m[ 0 ], tc.M );
	assertArrayClose( toArray( w.subarray( 0, m[ 0 ] ) ), tc.w, 1e-12, 'eigenvalues' ); // eslint-disable-line max-len
});

test( 'dsyevr: V_V_L - value range, lower, compute vectors', function t() {
	const m = new Int32Array( 1 );

	const tc = v_v_l;
	const N = tc.N;
	const A = symMatrix4Lower();
	const w = new Float64Array( N );
	const Z = new Float64Array( N * N );
	const ISUPPZ = new Int32Array( 2 * N );
	const WORK = new Float64Array( 26 * N );
	const IWORK = new Int32Array( 10 * N );
	const info = dsyevr( 'compute-vectors', 'value', 'lower', N, A, 1, N, 0, 7.0, 11.0, 0, 0, 0.0, m, w, 1, 0, Z, 1, N, 0, ISUPPZ, 1, 0, WORK, 1, 0, IWORK, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, 0 );
	assert.equal( m[ 0 ], tc.M );
	assertArrayClose( toArray( w.subarray( 0, m[ 0 ] ) ), tc.w, 1e-12, 'eigenvalues' ); // eslint-disable-line max-len
	verifyEigenpairs( symMatrix4Lower(), N, w, Z, m[ 0 ], 1e-12, 'eigenpairs' );
});

test( 'dsyevr: V_I_L - index range, lower, compute vectors', function t() {
	const m = new Int32Array( 1 );

	const tc = v_i_l;
	const N = tc.N;
	const A = symMatrix4Lower();
	const w = new Float64Array( N );
	const Z = new Float64Array( N * N );
	const ISUPPZ = new Int32Array( 2 * N );
	const WORK = new Float64Array( 26 * N );
	const IWORK = new Int32Array( 10 * N );
	const info = dsyevr( 'compute-vectors', 'index', 'lower', N, A, 1, N, 0, 0.0, 0.0, 2, 3, 0.0, m, w, 1, 0, Z, 1, N, 0, ISUPPZ, 1, 0, WORK, 1, 0, IWORK, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, 0 );
	assert.equal( m[ 0 ], tc.M );
	assertArrayClose( toArray( w.subarray( 0, m[ 0 ] ) ), tc.w, 1e-12, 'eigenvalues' ); // eslint-disable-line max-len
	verifyEigenpairs( symMatrix4Lower(), N, w, Z, m[ 0 ], 1e-12, 'eigenpairs' );
});

test( 'dsyevr: N0 - N=0', function t() {
	const m = new Int32Array( 1 );

	const A = new Float64Array( 1 );
	const w = new Float64Array( 1 );
	const Z = new Float64Array( 1 );
	const ISUPPZ = new Int32Array( 1 );
	const WORK = new Float64Array( 1 );
	const IWORK = new Int32Array( 1 );
	const info = dsyevr( 'compute-vectors', 'all', 'lower', 0, A, 1, 1, 0, 0.0, 0.0, 0, 0, 0.0, m, w, 1, 0, Z, 1, 1, 0, ISUPPZ, 1, 0, WORK, 1, 0, IWORK, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, 0 );
	assert.equal( m[ 0 ], 0 );
});

test( 'dsyevr: N1 - N=1', function t() {
	const m = new Int32Array( 1 );

	const tc = n1;
	const A = new Float64Array( [ 5.0 ] );
	const w = new Float64Array( 1 );
	const Z = new Float64Array( 1 );
	const ISUPPZ = new Int32Array( 2 );
	const WORK = new Float64Array( 26 );
	const IWORK = new Int32Array( 10 );
	const info = dsyevr( 'compute-vectors', 'all', 'lower', 1, A, 1, 1, 0, 0.0, 0.0, 0, 0, 0.0, m, w, 1, 0, Z, 1, 1, 0, ISUPPZ, 1, 0, WORK, 1, 0, IWORK, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, 0 );
	assert.equal( m[ 0 ], 1 );
	assertClose( w[ 0 ], 5.0, 1e-14, 'eigenvalue' );
	assertClose( Z[ 0 ], 1.0, 1e-14, 'eigenvector' );
});

test( 'dsyevr: N_V_U - eigenvalues only, value range, upper', function t() {
	const m = new Int32Array( 1 );

	const tc = n_v_u;
	const N = tc.N;
	const A = symMatrix4Upper();
	const w = new Float64Array( N );
	const Z = new Float64Array( 1 );
	const ISUPPZ = new Int32Array( 2 * N );
	const WORK = new Float64Array( 26 * N );
	const IWORK = new Int32Array( 10 * N );
	const info = dsyevr( 'no-vectors', 'value', 'upper', N, A, 1, N, 0, 7.0, 11.0, 0, 0, 0.0, m, w, 1, 0, Z, 1, 1, 0, ISUPPZ, 1, 0, WORK, 1, 0, IWORK, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, 0 );
	assert.equal( m[ 0 ], tc.M );
	assertArrayClose( toArray( w.subarray( 0, m[ 0 ] ) ), tc.w, 1e-12, 'eigenvalues' ); // eslint-disable-line max-len
});

test( 'dsyevr: N1_V_in_range - N=1 value range eigenvalue in range', function t() { // eslint-disable-line max-len
	const m = new Int32Array( 1 );

	const A = new Float64Array( [ 5.0 ] );
	const w = new Float64Array( 1 );
	const Z = new Float64Array( 1 );
	const ISUPPZ = new Int32Array( 2 );
	const WORK = new Float64Array( 26 );
	const IWORK = new Int32Array( 10 );
	const info = dsyevr( 'compute-vectors', 'value', 'lower', 1, A, 1, 1, 0, 4.0, 6.0, 0, 0, 0.0, m, w, 1, 0, Z, 1, 1, 0, ISUPPZ, 1, 0, WORK, 1, 0, IWORK, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, 0 );
	assert.equal( m[ 0 ], 1 );
	assertClose( w[ 0 ], 5.0, 1e-14, 'eigenvalue' );
});

test( 'dsyevr: N1_V_out_range - N=1 value range eigenvalue out of range', function t() { // eslint-disable-line max-len
	const m = new Int32Array( 1 );

	const A = new Float64Array( [ 5.0 ] );
	const w = new Float64Array( 1 );
	const Z = new Float64Array( 1 );
	const ISUPPZ = new Int32Array( 2 );
	const WORK = new Float64Array( 26 );
	const IWORK = new Int32Array( 10 );
	const info = dsyevr( 'compute-vectors', 'value', 'lower', 1, A, 1, 1, 0, 6.0, 8.0, 0, 0, 0.0, m, w, 1, 0, Z, 1, 1, 0, ISUPPZ, 1, 0, WORK, 1, 0, IWORK, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, 0 );
	assert.equal( m[ 0 ], 0, 'no eigenvalues in range' );
});

test( 'dsyevr: tiny_matrix - scaling path for small norm', function t() {
	const m = new Int32Array( 1 );

	const tiny = 1e-170;
	const N = 4;
	const A = new Float64Array([
		10 * tiny,
		1 * tiny,
		0.5 * tiny,
		0.25 * tiny,
		1 * tiny,
		8 * tiny,
		0.5 * tiny,
		0,
		0.5 * tiny,
		0.5 * tiny,
		12 * tiny,
		1 * tiny,
		0.25 * tiny,
		0,
		1 * tiny,
		6 * tiny
	]);
	const w = new Float64Array( N );
	const Z = new Float64Array( N * N );
	const ISUPPZ = new Int32Array( 2 * N );
	const WORK = new Float64Array( 26 * N );
	const IWORK = new Int32Array( 10 * N );
	const info = dsyevr( 'compute-vectors', 'all', 'lower', N, A, 1, N, 0, 0.0, 0.0, 0, 0, 0.0, m, w, 1, 0, Z, 1, N, 0, ISUPPZ, 1, 0, WORK, 1, 0, IWORK, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, 0, 'info' );
	assert.equal( m[ 0 ], N, 'M' );
	assert.ok( w[ 0 ] > 0, 'smallest eigenvalue positive' );
});

test( 'dsyevr: tiny_matrix_upper - scaling path for small norm, upper', function t() { // eslint-disable-line max-len
	const m = new Int32Array( 1 );

	const tiny = 1e-170;
	const N = 4;
	const A = new Float64Array([
		10 * tiny,
		1 * tiny,
		0.5 * tiny,
		0.25 * tiny,
		1 * tiny,
		8 * tiny,
		0.5 * tiny,
		0,
		0.5 * tiny,
		0.5 * tiny,
		12 * tiny,
		1 * tiny,
		0.25 * tiny,
		0,
		1 * tiny,
		6 * tiny
	]);
	const w = new Float64Array( N );
	const Z = new Float64Array( N * N );
	const ISUPPZ = new Int32Array( 2 * N );
	const WORK = new Float64Array( 26 * N );
	const IWORK = new Int32Array( 10 * N );
	const info = dsyevr( 'compute-vectors', 'all', 'upper', N, A, 1, N, 0, 0.0, 0.0, 0, 0, 0.0, m, w, 1, 0, Z, 1, N, 0, ISUPPZ, 1, 0, WORK, 1, 0, IWORK, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, 0, 'info' );
	assert.equal( m[ 0 ], N, 'M' );
});

test( 'dsyevr: tiny_eigenvalues_only - scaling path with eigenvalues only, dsterf path', function t() { // eslint-disable-line max-len
	const m = new Int32Array( 1 );

	const tiny = 1e-170;
	const N = 4;
	const A = new Float64Array([
		10 * tiny,
		1 * tiny,
		0.5 * tiny,
		0.25 * tiny,
		1 * tiny,
		8 * tiny,
		0.5 * tiny,
		0,
		0.5 * tiny,
		0.5 * tiny,
		12 * tiny,
		1 * tiny,
		0.25 * tiny,
		0,
		1 * tiny,
		6 * tiny
	]);
	const w = new Float64Array( N );
	const Z = new Float64Array( 1 );
	const ISUPPZ = new Int32Array( 2 * N );
	const WORK = new Float64Array( 26 * N );
	const IWORK = new Int32Array( 10 * N );
	const info = dsyevr( 'no-vectors', 'all', 'lower', N, A, 1, N, 0, 0.0, 0.0, 0, 0, 0.0, m, w, 1, 0, Z, 1, 1, 0, ISUPPZ, 1, 0, WORK, 1, 0, IWORK, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, 0, 'info' );
	assert.equal( m[ 0 ], N, 'M' );
});

test( 'dsyevr: value_range_with_scaling - scaling + value range', function t() {
	const m = new Int32Array( 1 );

	const tiny = 1e-170;
	const N = 4;
	const A = new Float64Array([
		10 * tiny,
		1 * tiny,
		0.5 * tiny,
		0.25 * tiny,
		1 * tiny,
		8 * tiny,
		0.5 * tiny,
		0,
		0.5 * tiny,
		0.5 * tiny,
		12 * tiny,
		1 * tiny,
		0.25 * tiny,
		0,
		1 * tiny,
		6 * tiny
	]);
	const w = new Float64Array( N );
	const Z = new Float64Array( N * N );
	const ISUPPZ = new Int32Array( 2 * N );
	const WORK = new Float64Array( 26 * N );
	const IWORK = new Int32Array( 10 * N );
	const info = dsyevr( 'compute-vectors', 'value', 'lower', N, A, 1, N, 0, 7e-170, 11e-170, 0, 0, 0.0, m, w, 1, 0, Z, 1, N, 0, ISUPPZ, 1, 0, WORK, 1, 0, IWORK, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, 0, 'info' );
	assert.ok( m[ 0 ] >= 0, 'M should be non-negative' );
});

test( 'dsyevr: N_I_L - eigenvalues only, index range, lower', function t() {
	const m = new Int32Array( 1 );

	const tc = n_i_l;
	const N = tc.N;
	const A = symMatrix4Lower();
	const w = new Float64Array( N );
	const Z = new Float64Array( 1 );
	const ISUPPZ = new Int32Array( 2 * N );
	const WORK = new Float64Array( 26 * N );
	const IWORK = new Int32Array( 10 * N );
	const info = dsyevr( 'no-vectors', 'index', 'lower', N, A, 1, N, 0, 0.0, 0.0, 1, 2, 0.0, m, w, 1, 0, Z, 1, 1, 0, ISUPPZ, 1, 0, WORK, 1, 0, IWORK, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, 0 );
	assert.equal( m[ 0 ], tc.M );
	assertArrayClose( toArray( w.subarray( 0, m[ 0 ] ) ), tc.w, 1e-12, 'eigenvalues' ); // eslint-disable-line max-len
});

// Ticket 0089 //

// Reference thresholds (data/lapack-3.12.0/SRC/dsyevr.f): SAFMIN = DLAMCH( 'S' ) = 2^-1022 and EPS = DLAMCH( 'P' ) = 2^-52 give SMLNUM = 2^-970 and RMIN = SQRT( SMLNUM ) = 2^-485. With DLAMCH( 'E' ) = 2^-53 RMIN would be 2^-484.5. ( RMAX = MIN( SQRT( BIGNUM ), 1/SQRT( SQRT( SAFMIN ) ) ) = 2^255.5 does not depend on EPS. )
const RMIN_P = Math.pow( 2.0, -485 );

/**
* Runs dsyevr on T = s * tridiag( 1, 2, 1 ) stored as a full 3x3 matrix (lower), through a module whose scaling dependencies are spied on.
*
* @private
* @param {Function} mod - dsyevr base implementation
* @param {number} s - scale of the matrix ( max|T| = 2s )
* @returns {Object} info and eigenvalues
*/
function run( mod, s ) {
	const A = new Float64Array( [ 2.0 * s, s, 0.0, s, 2.0 * s, s, 0.0, s, 2.0 * s ] );
	const m = new Int32Array( 1 );
	const w = new Float64Array( 3 );
	const info = mod( 'compute-vectors', 'all', 'lower', 3, A, 1, 3, 0, 0.0, 0.0, 0, 0, 0.0, m, w, 1, 0, new Float64Array( 9 ), 1, 3, 0, new Int32Array( 6 ), 1, 0, new Float64Array( 100 ), 1, 0, new Int32Array( 50 ), 1, 0 ); // eslint-disable-line max-len
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

test( 'dsyevr: matrix norm between the DLAMCH(P) and DLAMCH(E) RMIN thresholds is not rescaled (ticket 0089)', async function t() {
	const calls = [];
	const mod = ( await importWithDependencies( new URL( './../lib/base.js', import.meta.url ), {
		'../../../../blas/base/dscal/lib/base.js': function spyDscal() {
			calls.push( 'dscal' );
			return dscal.apply( null, arguments );
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
