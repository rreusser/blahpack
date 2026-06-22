/* eslint-disable no-restricted-syntax, stdlib/first-unit-test, max-lines */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import zhpev from './../lib/ndarray.js';

// FIXTURES //

import jobz_v_uplo_u_4x4 from './fixtures/jobz_v_uplo_u_4x4.json' with { type: 'json' };
import jobz_v_uplo_l_4x4 from './fixtures/jobz_v_uplo_l_4x4.json' with { type: 'json' };
import jobz_n_uplo_u_4x4 from './fixtures/jobz_n_uplo_u_4x4.json' with { type: 'json' };
import jobz_n_uplo_l_4x4 from './fixtures/jobz_n_uplo_l_4x4.json' with { type: 'json' };
import jobz_v_uplo_l_3x3 from './fixtures/jobz_v_uplo_l_3x3.json' with { type: 'json' };
import jobz_v_uplo_u_3x3 from './fixtures/jobz_v_uplo_u_3x3.json' with { type: 'json' };
import n1_jobz_v from './fixtures/n1_jobz_v.json' with { type: 'json' };
import n1_jobz_n from './fixtures/n1_jobz_n.json' with { type: 'json' };
import jobz_n_uplo_l_3x3 from './fixtures/jobz_n_uplo_l_3x3.json' with { type: 'json' };
import diagonal_4x4 from './fixtures/diagonal_4x4.json' with { type: 'json' };

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
	assert.ok( relErr <= tol, msg + ': got ' + actual );
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
* Checks unitarity for a column-major N-by-N complex matrix.
*
* @private
* @param {Float64Array} Zv - interleaved re/im view of eigenvector matrix
* @param {NonNegativeInteger} N - matrix order
* @param {number} tol - tolerance
* @param {string} msg - assertion message
*/
function assertUnitary( Zv, N, tol, msg ) {
	var sumR;
	var sumI;
	var aiR;
	var aiI;
	var ajR;
	var ajI;
	var i;
	var j;
	var k;

	for ( i = 0; i < N; i++ ) {
		for ( j = 0; j < N; j++ ) {
			// Compute (Q^H * Q)(i,j) = sum_k conj(Z(k,i)) * Z(k,j)
			sumR = 0.0;
			sumI = 0.0;
			for ( k = 0; k < N; k++ ) {
				aiR = Zv[ 2 * ( k + (i * N) ) ];
				aiI = Zv[ ( 2 * ( k + (i * N) ) ) + 1 ];
				ajR = Zv[ 2 * ( k + (j * N) ) ];
				ajI = Zv[ ( 2 * ( k + (j * N) ) ) + 1 ];

				// conj(ai) * aj = (aiR - aiI*j)(ajR + ajI*j)
				sumR += ( aiR * ajR ) + ( aiI * ajI );
				sumI += ( aiR * ajI ) - ( aiI * ajR );
			}
			if ( i === j ) {
				assertClose( sumR, 1.0, tol, msg + ' re[' + i + ',' + j + ']' ); // eslint-disable-line max-len
				assert.ok( Math.abs( sumI ) < tol, msg + ' im[' + i + ',' + j + ']' ); // eslint-disable-line max-len
			} else {
				assert.ok( Math.abs( sumR ) < tol, msg + ' re[' + i + ',' + j + ']' ); // eslint-disable-line max-len
				assert.ok( Math.abs( sumI ) < tol, msg + ' im[' + i + ',' + j + ']' ); // eslint-disable-line max-len
			}
		}
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
	var out = [];
	var i;

	for ( i = 0; i < arr.length; i++ ) {
		out.push( arr[ i ] );
	}
	return out;
}

/**
* Returns the 4x4 Hermitian matrix in upper packed Complex128Array form.
*
* @private
* @returns {Complex128Array} packed upper matrix
*/
function packedUpper4x4( ) {
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
* Returns the 4x4 Hermitian matrix in lower packed Complex128Array form.
*
* @private
* @returns {Complex128Array} packed lower matrix
*/
function packedLower4x4( ) {
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
* Returns the 3x3 Hermitian matrix in lower packed Complex128Array form.
*
* @private
* @returns {Complex128Array} packed lower matrix
*/
function packedLower3x3( ) {
	return new Complex128Array([
		5,
		0,
		1,
		1,
		2,
		-1,
		4,
		0,
		1,
		0,
		6,
		0
	]);
}

/**
* Returns the 3x3 Hermitian matrix in upper packed Complex128Array form.
*
* @private
* @returns {Complex128Array} packed upper matrix
*/
function packedUpper3x3( ) {
	return new Complex128Array([
		5,
		0,
		1,
		-1,
		4,
		0,
		2,
		1,
		1,
		0,
		6,
		0
	]);
}

/**
* Returns a 4x4 diagonal Hermitian matrix in lower packed Complex128Array form.
*
* diag(3, 1, 4, 2)
*
* @private
* @returns {Complex128Array} packed lower matrix
*/
function diagonalLower4x4( ) {
	return new Complex128Array([
		3,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		1,
		0,
		0,
		0,
		0,
		0,
		4,
		0,
		0,
		0,
		2,
		0
	]);
}

// TESTS //

test( 'zhpev: JOBZ=V, UPLO=U, 4x4', function t() {
	var RWORK;
	var WORK;
	var info;
	var tc;
	var AP;
	var Zv;
	var W;
	var Z;

	tc = jobz_v_uplo_u_4x4;
	AP = packedUpper4x4();
	W = new Float64Array( 4 );
	Z = new Complex128Array( 16 );
	WORK = new Complex128Array( 20 );
	RWORK = new Float64Array( 20 );
	info = zhpev( 'compute-vectors', 'upper', 4, AP, 1, 0, W, 1, 0, Z, 1, 4, 0, WORK, 1, 0, RWORK, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, tc.info );
	assertArrayClose( toArray( W ), tc.w, 1e-13, 'eigenvalues' );
	Zv = reinterpret( Z, 0 );
	assertUnitary( Zv, 4, 1e-12, 'unitarity' );
});

test( 'zhpev: JOBZ=V, UPLO=L, 4x4', function t() {
	var RWORK;
	var WORK;
	var info;
	var tc;
	var AP;
	var Zv;
	var W;
	var Z;

	tc = jobz_v_uplo_l_4x4;
	AP = packedLower4x4();
	W = new Float64Array( 4 );
	Z = new Complex128Array( 16 );
	WORK = new Complex128Array( 20 );
	RWORK = new Float64Array( 20 );
	info = zhpev( 'compute-vectors', 'lower', 4, AP, 1, 0, W, 1, 0, Z, 1, 4, 0, WORK, 1, 0, RWORK, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, tc.info );
	assertArrayClose( toArray( W ), tc.w, 1e-13, 'eigenvalues' );
	Zv = reinterpret( Z, 0 );
	assertUnitary( Zv, 4, 1e-12, 'unitarity' );
});

test( 'zhpev: JOBZ=N, UPLO=U, 4x4', function t() {
	var RWORK;
	var WORK;
	var info;
	var tc;
	var AP;
	var W;
	var Z;

	tc = jobz_n_uplo_u_4x4;
	AP = packedUpper4x4();
	W = new Float64Array( 4 );
	Z = new Complex128Array( 1 );
	WORK = new Complex128Array( 20 );
	RWORK = new Float64Array( 20 );
	info = zhpev( 'no-vectors', 'upper', 4, AP, 1, 0, W, 1, 0, Z, 1, 1, 0, WORK, 1, 0, RWORK, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, tc.info );
	assertArrayClose( toArray( W ), tc.w, 1e-13, 'eigenvalues' );
});

test( 'zhpev: JOBZ=N, UPLO=L, 4x4', function t() {
	var RWORK;
	var WORK;
	var info;
	var tc;
	var AP;
	var W;
	var Z;

	tc = jobz_n_uplo_l_4x4;
	AP = packedLower4x4();
	W = new Float64Array( 4 );
	Z = new Complex128Array( 1 );
	WORK = new Complex128Array( 20 );
	RWORK = new Float64Array( 20 );
	info = zhpev( 'no-vectors', 'lower', 4, AP, 1, 0, W, 1, 0, Z, 1, 1, 0, WORK, 1, 0, RWORK, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, tc.info );
	assertArrayClose( toArray( W ), tc.w, 1e-13, 'eigenvalues' );
});

test( 'zhpev: JOBZ=V, UPLO=L, 3x3', function t() {
	var RWORK;
	var WORK;
	var info;
	var tc;
	var AP;
	var Zv;
	var W;
	var Z;

	tc = jobz_v_uplo_l_3x3;
	AP = packedLower3x3();
	W = new Float64Array( 3 );
	Z = new Complex128Array( 9 );
	WORK = new Complex128Array( 20 );
	RWORK = new Float64Array( 20 );
	info = zhpev( 'compute-vectors', 'lower', 3, AP, 1, 0, W, 1, 0, Z, 1, 3, 0, WORK, 1, 0, RWORK, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, tc.info );
	assertArrayClose( toArray( W ), tc.w, 1e-13, 'eigenvalues' );
	Zv = reinterpret( Z, 0 );
	assertUnitary( Zv, 3, 1e-12, 'unitarity' );
});

test( 'zhpev: JOBZ=V, UPLO=U, 3x3', function t() {
	var RWORK;
	var WORK;
	var info;
	var tc;
	var AP;
	var Zv;
	var W;
	var Z;

	tc = jobz_v_uplo_u_3x3;
	AP = packedUpper3x3();
	W = new Float64Array( 3 );
	Z = new Complex128Array( 9 );
	WORK = new Complex128Array( 20 );
	RWORK = new Float64Array( 20 );
	info = zhpev( 'compute-vectors', 'upper', 3, AP, 1, 0, W, 1, 0, Z, 1, 3, 0, WORK, 1, 0, RWORK, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, tc.info );
	assertArrayClose( toArray( W ), tc.w, 1e-13, 'eigenvalues' );
	Zv = reinterpret( Z, 0 );
	assertUnitary( Zv, 3, 1e-12, 'unitarity' );
});

test( 'zhpev: N=1, JOBZ=V', function t() {
	var RWORK;
	var WORK;
	var info;
	var tc;
	var AP;
	var Zv;
	var W;
	var Z;

	tc = n1_jobz_v;
	AP = new Complex128Array( [ 3.5, 0.0 ] );
	W = new Float64Array( 1 );
	Z = new Complex128Array( 1 );
	WORK = new Complex128Array( 4 );
	RWORK = new Float64Array( 4 );
	info = zhpev( 'compute-vectors', 'lower', 1, AP, 1, 0, W, 1, 0, Z, 1, 1, 0, WORK, 1, 0, RWORK, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, tc.info );
	assertClose( W[ 0 ], tc.w1, 1e-15, 'w[0]' );
	Zv = reinterpret( Z, 0 );
	assertClose( Zv[ 0 ], 1.0, 1e-15, 'Z(1,1) real' );
	assertClose( Zv[ 1 ], 0.0, 1e-15, 'Z(1,1) imag' );
});

test( 'zhpev: N=1, JOBZ=N', function t() {
	var RWORK;
	var WORK;
	var info;
	var tc;
	var AP;
	var W;
	var Z;

	tc = n1_jobz_n;
	AP = new Complex128Array( [ 7.25, 0.0 ] );
	W = new Float64Array( 1 );
	Z = new Complex128Array( 1 );
	WORK = new Complex128Array( 4 );
	RWORK = new Float64Array( 4 );
	info = zhpev( 'no-vectors', 'upper', 1, AP, 1, 0, W, 1, 0, Z, 1, 1, 0, WORK, 1, 0, RWORK, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, tc.info );
	assertClose( W[ 0 ], tc.w1, 1e-15, 'w[0]' );
});

test( 'zhpev: N=0', function t() {
	var RWORK;
	var WORK;
	var info;
	var AP;
	var W;
	var Z;

	AP = new Complex128Array( 1 );
	W = new Float64Array( 1 );
	Z = new Complex128Array( 1 );
	WORK = new Complex128Array( 4 );
	RWORK = new Float64Array( 4 );
	info = zhpev( 'compute-vectors', 'lower', 0, AP, 1, 0, W, 1, 0, Z, 1, 1, 0, WORK, 1, 0, RWORK, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, 0 );
});

test( 'zhpev: JOBZ=N, UPLO=L, 3x3', function t() {
	var RWORK;
	var WORK;
	var info;
	var tc;
	var AP;
	var W;
	var Z;

	tc = jobz_n_uplo_l_3x3;
	AP = packedLower3x3();
	W = new Float64Array( 3 );
	Z = new Complex128Array( 1 );
	WORK = new Complex128Array( 20 );
	RWORK = new Float64Array( 20 );
	info = zhpev( 'no-vectors', 'lower', 3, AP, 1, 0, W, 1, 0, Z, 1, 1, 0, WORK, 1, 0, RWORK, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, tc.info );
	assertArrayClose( toArray( W ), tc.w, 1e-13, 'eigenvalues' );
});

test( 'zhpev: diagonal 4x4, JOBZ=V, UPLO=L', function t() {
	var RWORK;
	var WORK;
	var info;
	var tc;
	var AP;
	var Zv;
	var W;
	var Z;

	tc = diagonal_4x4;
	AP = diagonalLower4x4();
	W = new Float64Array( 4 );
	Z = new Complex128Array( 16 );
	WORK = new Complex128Array( 20 );
	RWORK = new Float64Array( 20 );
	info = zhpev( 'compute-vectors', 'lower', 4, AP, 1, 0, W, 1, 0, Z, 1, 4, 0, WORK, 1, 0, RWORK, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, tc.info );
	assertArrayClose( toArray( W ), tc.w, 1e-13, 'eigenvalues' );
	Zv = reinterpret( Z, 0 );
	assertUnitary( Zv, 4, 1e-12, 'unitarity' );
});
