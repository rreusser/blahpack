/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import dsyevr from './../lib/ndarray.js';

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
	var relErr = Math.abs( actual - expected ) / Math.max( Math.abs( expected ), 1.0 ); // eslint-disable-line max-len
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
	var i;
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
	var Avec;
	var err;
	var nrm;
	var v;
	var i;
	var j;
	var k;

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
	var out = [];
	var i;
	for ( i = 0; i < arr.length; i++ ) {
		out.push( arr[ i ] );
	}
	return out;
}

// TESTS //

test( 'dsyevr: V_A_L - compute all eigenvectors, lower', function t() {
	var ISUPPZ;
	var IWORK;
	var WORK;
	var info;
	var out;
	var tc;
	var A;
	var w;
	var Z;
	var N;

	tc = v_a_l;
	N = tc.N;
	A = symMatrix4Lower();
	w = new Float64Array( N );
	Z = new Float64Array( N * N );
	ISUPPZ = new Int32Array( 2 * N );
	WORK = new Float64Array( 26 * N );
	IWORK = new Int32Array( 10 * N );
	out = {};
	info = dsyevr( 'compute-vectors', 'all', 'lower', N, A, 1, N, 0, 0.0, 0.0, 0, 0, 0.0, out, w, 1, 0, Z, 1, N, 0, ISUPPZ, 1, 0, WORK, 1, 0, 26 * N, IWORK, 1, 0, 10 * N ); // eslint-disable-line max-len
	assert.equal( info, 0 );
	assert.equal( out.M, tc.M );
	assertArrayClose( toArray( w.subarray( 0, out.M ) ), tc.w, 1e-12, 'eigenvalues' ); // eslint-disable-line max-len
	verifyEigenpairs( symMatrix4Lower(), N, w, Z, out.M, 1e-12, 'eigenpairs' );
});

test( 'dsyevr: V_A_U - compute all eigenvectors, upper', function t() {
	var ISUPPZ;
	var IWORK;
	var WORK;
	var info;
	var out;
	var tc;
	var A;
	var w;
	var Z;
	var N;

	tc = v_a_u;
	N = tc.N;
	A = symMatrix4Upper();
	w = new Float64Array( N );
	Z = new Float64Array( N * N );
	ISUPPZ = new Int32Array( 2 * N );
	WORK = new Float64Array( 26 * N );
	IWORK = new Int32Array( 10 * N );
	out = {};
	info = dsyevr( 'compute-vectors', 'all', 'upper', N, A, 1, N, 0, 0.0, 0.0, 0, 0, 0.0, out, w, 1, 0, Z, 1, N, 0, ISUPPZ, 1, 0, WORK, 1, 0, 26 * N, IWORK, 1, 0, 10 * N ); // eslint-disable-line max-len
	assert.equal( info, 0 );
	assert.equal( out.M, tc.M );
	assertArrayClose( toArray( w.subarray( 0, out.M ) ), tc.w, 1e-12, 'eigenvalues' ); // eslint-disable-line max-len
	verifyEigenpairs( symMatrix4Upper(), N, w, Z, out.M, 1e-12, 'eigenpairs' );
});

test( 'dsyevr: N_A_L - eigenvalues only, all, lower', function t() {
	var ISUPPZ;
	var IWORK;
	var WORK;
	var info;
	var out;
	var tc;
	var A;
	var w;
	var Z;
	var N;

	tc = n_a_l;
	N = tc.N;
	A = symMatrix4Lower();
	w = new Float64Array( N );
	Z = new Float64Array( 1 );
	ISUPPZ = new Int32Array( 2 * N );
	WORK = new Float64Array( 26 * N );
	IWORK = new Int32Array( 10 * N );
	out = {};
	info = dsyevr( 'no-vectors', 'all', 'lower', N, A, 1, N, 0, 0.0, 0.0, 0, 0, 0.0, out, w, 1, 0, Z, 1, 1, 0, ISUPPZ, 1, 0, WORK, 1, 0, 26 * N, IWORK, 1, 0, 10 * N ); // eslint-disable-line max-len
	assert.equal( info, 0 );
	assert.equal( out.M, tc.M );
	assertArrayClose( toArray( w.subarray( 0, out.M ) ), tc.w, 1e-12, 'eigenvalues' ); // eslint-disable-line max-len
});

test( 'dsyevr: V_V_L - value range, lower, compute vectors', function t() {
	var ISUPPZ;
	var IWORK;
	var WORK;
	var info;
	var out;
	var tc;
	var A;
	var w;
	var Z;
	var N;

	tc = v_v_l;
	N = tc.N;
	A = symMatrix4Lower();
	w = new Float64Array( N );
	Z = new Float64Array( N * N );
	ISUPPZ = new Int32Array( 2 * N );
	WORK = new Float64Array( 26 * N );
	IWORK = new Int32Array( 10 * N );
	out = {};
	info = dsyevr( 'compute-vectors', 'value', 'lower', N, A, 1, N, 0, 7.0, 11.0, 0, 0, 0.0, out, w, 1, 0, Z, 1, N, 0, ISUPPZ, 1, 0, WORK, 1, 0, 26 * N, IWORK, 1, 0, 10 * N ); // eslint-disable-line max-len
	assert.equal( info, 0 );
	assert.equal( out.M, tc.M );
	assertArrayClose( toArray( w.subarray( 0, out.M ) ), tc.w, 1e-12, 'eigenvalues' ); // eslint-disable-line max-len
	verifyEigenpairs( symMatrix4Lower(), N, w, Z, out.M, 1e-12, 'eigenpairs' );
});

test( 'dsyevr: V_I_L - index range, lower, compute vectors', function t() {
	var ISUPPZ;
	var IWORK;
	var WORK;
	var info;
	var out;
	var tc;
	var A;
	var w;
	var Z;
	var N;

	tc = v_i_l;
	N = tc.N;
	A = symMatrix4Lower();
	w = new Float64Array( N );
	Z = new Float64Array( N * N );
	ISUPPZ = new Int32Array( 2 * N );
	WORK = new Float64Array( 26 * N );
	IWORK = new Int32Array( 10 * N );
	out = {};
	info = dsyevr( 'compute-vectors', 'index', 'lower', N, A, 1, N, 0, 0.0, 0.0, 2, 3, 0.0, out, w, 1, 0, Z, 1, N, 0, ISUPPZ, 1, 0, WORK, 1, 0, 26 * N, IWORK, 1, 0, 10 * N ); // eslint-disable-line max-len
	assert.equal( info, 0 );
	assert.equal( out.M, tc.M );
	assertArrayClose( toArray( w.subarray( 0, out.M ) ), tc.w, 1e-12, 'eigenvalues' ); // eslint-disable-line max-len
	verifyEigenpairs( symMatrix4Lower(), N, w, Z, out.M, 1e-12, 'eigenpairs' );
});

test( 'dsyevr: N0 - N=0', function t() {
	var ISUPPZ;
	var IWORK;
	var WORK;
	var info;
	var out;
	var A;
	var w;
	var Z;

	A = new Float64Array( 1 );
	w = new Float64Array( 1 );
	Z = new Float64Array( 1 );
	ISUPPZ = new Int32Array( 1 );
	WORK = new Float64Array( 1 );
	IWORK = new Int32Array( 1 );
	out = {};
	info = dsyevr( 'compute-vectors', 'all', 'lower', 0, A, 1, 1, 0, 0.0, 0.0, 0, 0, 0.0, out, w, 1, 0, Z, 1, 1, 0, ISUPPZ, 1, 0, WORK, 1, 0, 1, IWORK, 1, 0, 1 ); // eslint-disable-line max-len
	assert.equal( info, 0 );
	assert.equal( out.M, 0 );
});

test( 'dsyevr: N1 - N=1', function t() {
	var ISUPPZ;
	var IWORK;
	var WORK;
	var info;
	var out;
	var tc;
	var A;
	var w;
	var Z;

	tc = n1;
	A = new Float64Array( [ 5.0 ] );
	w = new Float64Array( 1 );
	Z = new Float64Array( 1 );
	ISUPPZ = new Int32Array( 2 );
	WORK = new Float64Array( 26 );
	IWORK = new Int32Array( 10 );
	out = {};
	info = dsyevr( 'compute-vectors', 'all', 'lower', 1, A, 1, 1, 0, 0.0, 0.0, 0, 0, 0.0, out, w, 1, 0, Z, 1, 1, 0, ISUPPZ, 1, 0, WORK, 1, 0, 26, IWORK, 1, 0, 10 ); // eslint-disable-line max-len
	assert.equal( info, 0 );
	assert.equal( out.M, 1 );
	assertClose( w[ 0 ], 5.0, 1e-14, 'eigenvalue' );
	assertClose( Z[ 0 ], 1.0, 1e-14, 'eigenvector' );
});

test( 'dsyevr: N_V_U - eigenvalues only, value range, upper', function t() {
	var ISUPPZ;
	var IWORK;
	var WORK;
	var info;
	var out;
	var tc;
	var A;
	var w;
	var Z;
	var N;

	tc = n_v_u;
	N = tc.N;
	A = symMatrix4Upper();
	w = new Float64Array( N );
	Z = new Float64Array( 1 );
	ISUPPZ = new Int32Array( 2 * N );
	WORK = new Float64Array( 26 * N );
	IWORK = new Int32Array( 10 * N );
	out = {};
	info = dsyevr( 'no-vectors', 'value', 'upper', N, A, 1, N, 0, 7.0, 11.0, 0, 0, 0.0, out, w, 1, 0, Z, 1, 1, 0, ISUPPZ, 1, 0, WORK, 1, 0, 26 * N, IWORK, 1, 0, 10 * N ); // eslint-disable-line max-len
	assert.equal( info, 0 );
	assert.equal( out.M, tc.M );
	assertArrayClose( toArray( w.subarray( 0, out.M ) ), tc.w, 1e-12, 'eigenvalues' ); // eslint-disable-line max-len
});

test( 'dsyevr: N1_V_in_range - N=1 value range eigenvalue in range', function t() { // eslint-disable-line max-len
	var ISUPPZ;
	var IWORK;
	var WORK;
	var info;
	var out;
	var A;
	var w;
	var Z;

	A = new Float64Array( [ 5.0 ] );
	w = new Float64Array( 1 );
	Z = new Float64Array( 1 );
	ISUPPZ = new Int32Array( 2 );
	WORK = new Float64Array( 26 );
	IWORK = new Int32Array( 10 );
	out = {};
	info = dsyevr( 'compute-vectors', 'value', 'lower', 1, A, 1, 1, 0, 4.0, 6.0, 0, 0, 0.0, out, w, 1, 0, Z, 1, 1, 0, ISUPPZ, 1, 0, WORK, 1, 0, 26, IWORK, 1, 0, 10 ); // eslint-disable-line max-len
	assert.equal( info, 0 );
	assert.equal( out.M, 1 );
	assertClose( w[ 0 ], 5.0, 1e-14, 'eigenvalue' );
});

test( 'dsyevr: N1_V_out_range - N=1 value range eigenvalue out of range', function t() { // eslint-disable-line max-len
	var ISUPPZ;
	var IWORK;
	var WORK;
	var info;
	var out;
	var A;
	var w;
	var Z;

	A = new Float64Array( [ 5.0 ] );
	w = new Float64Array( 1 );
	Z = new Float64Array( 1 );
	ISUPPZ = new Int32Array( 2 );
	WORK = new Float64Array( 26 );
	IWORK = new Int32Array( 10 );
	out = {};
	info = dsyevr( 'compute-vectors', 'value', 'lower', 1, A, 1, 1, 0, 6.0, 8.0, 0, 0, 0.0, out, w, 1, 0, Z, 1, 1, 0, ISUPPZ, 1, 0, WORK, 1, 0, 26, IWORK, 1, 0, 10 ); // eslint-disable-line max-len
	assert.equal( info, 0 );
	assert.equal( out.M, 0, 'no eigenvalues in range' );
});

test( 'dsyevr: tiny_matrix - scaling path for small norm', function t() {
	var ISUPPZ;
	var IWORK;
	var tiny;
	var WORK;
	var info;
	var out;
	var N;
	var A;
	var w;
	var Z;

	tiny = 1e-170;
	N = 4;
	A = new Float64Array([
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
	w = new Float64Array( N );
	Z = new Float64Array( N * N );
	ISUPPZ = new Int32Array( 2 * N );
	WORK = new Float64Array( 26 * N );
	IWORK = new Int32Array( 10 * N );
	out = {};
	info = dsyevr( 'compute-vectors', 'all', 'lower', N, A, 1, N, 0, 0.0, 0.0, 0, 0, 0.0, out, w, 1, 0, Z, 1, N, 0, ISUPPZ, 1, 0, WORK, 1, 0, 26 * N, IWORK, 1, 0, 10 * N ); // eslint-disable-line max-len
	assert.equal( info, 0, 'info' );
	assert.equal( out.M, N, 'M' );
	assert.ok( w[ 0 ] > 0, 'smallest eigenvalue positive' );
});

test( 'dsyevr: tiny_matrix_upper - scaling path for small norm, upper', function t() { // eslint-disable-line max-len
	var ISUPPZ;
	var IWORK;
	var tiny;
	var WORK;
	var info;
	var out;
	var N;
	var A;
	var w;
	var Z;

	tiny = 1e-170;
	N = 4;
	A = new Float64Array([
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
	w = new Float64Array( N );
	Z = new Float64Array( N * N );
	ISUPPZ = new Int32Array( 2 * N );
	WORK = new Float64Array( 26 * N );
	IWORK = new Int32Array( 10 * N );
	out = {};
	info = dsyevr( 'compute-vectors', 'all', 'upper', N, A, 1, N, 0, 0.0, 0.0, 0, 0, 0.0, out, w, 1, 0, Z, 1, N, 0, ISUPPZ, 1, 0, WORK, 1, 0, 26 * N, IWORK, 1, 0, 10 * N ); // eslint-disable-line max-len
	assert.equal( info, 0, 'info' );
	assert.equal( out.M, N, 'M' );
});

test( 'dsyevr: tiny_eigenvalues_only - scaling path with eigenvalues only, dsterf path', function t() { // eslint-disable-line max-len
	var ISUPPZ;
	var IWORK;
	var tiny;
	var WORK;
	var info;
	var out;
	var N;
	var A;
	var w;
	var Z;

	tiny = 1e-170;
	N = 4;
	A = new Float64Array([
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
	w = new Float64Array( N );
	Z = new Float64Array( 1 );
	ISUPPZ = new Int32Array( 2 * N );
	WORK = new Float64Array( 26 * N );
	IWORK = new Int32Array( 10 * N );
	out = {};
	info = dsyevr( 'no-vectors', 'all', 'lower', N, A, 1, N, 0, 0.0, 0.0, 0, 0, 0.0, out, w, 1, 0, Z, 1, 1, 0, ISUPPZ, 1, 0, WORK, 1, 0, 26 * N, IWORK, 1, 0, 10 * N ); // eslint-disable-line max-len
	assert.equal( info, 0, 'info' );
	assert.equal( out.M, N, 'M' );
});

test( 'dsyevr: value_range_with_scaling - scaling + value range', function t() {
	var ISUPPZ;
	var IWORK;
	var tiny;
	var WORK;
	var info;
	var out;
	var N;
	var A;
	var w;
	var Z;

	tiny = 1e-170;
	N = 4;
	A = new Float64Array([
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
	w = new Float64Array( N );
	Z = new Float64Array( N * N );
	ISUPPZ = new Int32Array( 2 * N );
	WORK = new Float64Array( 26 * N );
	IWORK = new Int32Array( 10 * N );
	out = {};
	info = dsyevr( 'compute-vectors', 'value', 'lower', N, A, 1, N, 0, 7e-170, 11e-170, 0, 0, 0.0, out, w, 1, 0, Z, 1, N, 0, ISUPPZ, 1, 0, WORK, 1, 0, 26 * N, IWORK, 1, 0, 10 * N ); // eslint-disable-line max-len
	assert.equal( info, 0, 'info' );
	assert.ok( out.M >= 0, 'M should be non-negative' );
});

test( 'dsyevr: N_I_L - eigenvalues only, index range, lower', function t() {
	var ISUPPZ;
	var IWORK;
	var WORK;
	var info;
	var out;
	var tc;
	var A;
	var w;
	var Z;
	var N;

	tc = n_i_l;
	N = tc.N;
	A = symMatrix4Lower();
	w = new Float64Array( N );
	Z = new Float64Array( 1 );
	ISUPPZ = new Int32Array( 2 * N );
	WORK = new Float64Array( 26 * N );
	IWORK = new Int32Array( 10 * N );
	out = {};
	info = dsyevr( 'no-vectors', 'index', 'lower', N, A, 1, N, 0, 0.0, 0.0, 1, 2, 0.0, out, w, 1, 0, Z, 1, 1, 0, ISUPPZ, 1, 0, WORK, 1, 0, 26 * N, IWORK, 1, 0, 10 * N ); // eslint-disable-line max-len
	assert.equal( info, 0 );
	assert.equal( out.M, tc.M );
	assertArrayClose( toArray( w.subarray( 0, out.M ) ), tc.w, 1e-12, 'eigenvalues' ); // eslint-disable-line max-len
});
