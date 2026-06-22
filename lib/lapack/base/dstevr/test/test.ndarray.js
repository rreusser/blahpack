/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import dstevr from './../lib/ndarray.js';

// FIXTURES //

import v_a from './fixtures/v_a.json' with { type: 'json' };
import n_a from './fixtures/n_a.json' with { type: 'json' };
import v_v from './fixtures/v_v.json' with { type: 'json' };
import v_i from './fixtures/v_i.json' with { type: 'json' };
import n_v from './fixtures/n_v.json' with { type: 'json' };
import n_i from './fixtures/n_i.json' with { type: 'json' };

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
* Build the tridiagonal test matrix: D = [4, 6, 8, 10, 12], E = [1, 0.5, 1, 0.5].
*/
function tridiagD( ) {
	return new Float64Array( [ 4.0, 6.0, 8.0, 10.0, 12.0 ] );
}

/**
* TridiagE.
*
* @private
* @returns {*} result
*/
function tridiagE( ) {
	return new Float64Array( [ 1.0, 0.5, 1.0, 0.5 ] );
}

/**
* Verify eigenvector property: T_v = lambda_v for tridiagonal matrix.
* d is diagonal, e is off-diagonal.
*/
function verifyEigenpairs( d, e, N, w, Z, M, tol, msg ) {
	var err;
	var nrm;
	var Tv;
	var v;
	var i;
	var k;

	for ( k = 0; k < M; k++ ) {
		Tv = new Float64Array( N );
		v = new Float64Array( N );

		// Extract eigenvector k (column k of Z)
		for ( i = 0; i < N; i++ ) {
			v[ i ] = Z[ i + k * N ];
		}

		// Compute T*v for tridiagonal matrix
		for ( i = 0; i < N; i++ ) {
			Tv[ i ] = d[ i ] * v[ i ];
			if ( i > 0 ) {
				Tv[ i ] += e[ i - 1 ] * v[ i - 1 ];
			}
			if ( i < N - 1 ) {
				Tv[ i ] += e[ i ] * v[ i + 1 ];
			}
		}

		// Check ||T*v - lambda*v|| / (||v|| * |lambda|)
		err = 0.0;
		nrm = 0.0;
		for ( i = 0; i < N; i++ ) {
			err += ( Tv[ i ] - w[ k ] * v[ i ] ) * ( Tv[ i ] - w[ k ] * v[ i ] );
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

test( 'dstevr: V_A - compute all eigenvectors', function t() {
	var ISUPPZ;
	var IWORK;
	var WORK;
	var info;
	var out;
	var tc;
	var d;
	var e;
	var w;
	var Z;
	var N;

	tc = v_a;
	N = tc.N;
	d = tridiagD();
	e = tridiagE();
	w = new Float64Array( N );
	Z = new Float64Array( N * N );
	ISUPPZ = new Int32Array( 2 * N );
	WORK = new Float64Array( 20 * N );
	IWORK = new Int32Array( 10 * N );
	out = {};
	info = dstevr( 'compute-vectors', 'all', N, d, 1, 0, e, 1, 0, 0.0, 0.0, 0, 0, 0.0, out, w, 1, 0, Z, 1, N, 0, ISUPPZ, 1, 0, WORK, 1, 0, 20 * N, IWORK, 1, 0, 10 * N ); // eslint-disable-line max-len
	assert.equal( info, 0 );
	assert.equal( out.M, tc.M );
	assertArrayClose( toArray( w.subarray( 0, out.M ) ), tc.w, 1e-12, 'eigenvalues' ); // eslint-disable-line max-len
	verifyEigenpairs( tridiagD(), tridiagE(), N, w, Z, out.M, 1e-12, 'eigenpairs' ); // eslint-disable-line max-len
});

test( 'dstevr: N_A - eigenvalues only, all', function t() {
	var ISUPPZ;
	var IWORK;
	var WORK;
	var info;
	var out;
	var tc;
	var d;
	var e;
	var w;
	var Z;
	var N;

	tc = n_a;
	N = tc.N;
	d = tridiagD();
	e = tridiagE();
	w = new Float64Array( N );
	Z = new Float64Array( 1 );
	ISUPPZ = new Int32Array( 2 * N );
	WORK = new Float64Array( 20 * N );
	IWORK = new Int32Array( 10 * N );
	out = {};
	info = dstevr( 'no-vectors', 'all', N, d, 1, 0, e, 1, 0, 0.0, 0.0, 0, 0, 0.0, out, w, 1, 0, Z, 1, 1, 0, ISUPPZ, 1, 0, WORK, 1, 0, 20 * N, IWORK, 1, 0, 10 * N ); // eslint-disable-line max-len
	assert.equal( info, 0 );
	assert.equal( out.M, tc.M );
	assertArrayClose( toArray( w.subarray( 0, out.M ) ), tc.w, 1e-12, 'eigenvalues' ); // eslint-disable-line max-len
});

test( 'dstevr: V_V - value range, compute vectors', function t() {
	var ISUPPZ;
	var IWORK;
	var WORK;
	var info;
	var out;
	var tc;
	var d;
	var e;
	var w;
	var Z;
	var N;

	tc = v_v;
	N = tc.N;
	d = tridiagD();
	e = tridiagE();
	w = new Float64Array( N );
	Z = new Float64Array( N * N );
	ISUPPZ = new Int32Array( 2 * N );
	WORK = new Float64Array( 20 * N );
	IWORK = new Int32Array( 10 * N );
	out = {};
	info = dstevr( 'compute-vectors', 'value', N, d, 1, 0, e, 1, 0, 5.0, 9.0, 0, 0, 0.0, out, w, 1, 0, Z, 1, N, 0, ISUPPZ, 1, 0, WORK, 1, 0, 20 * N, IWORK, 1, 0, 10 * N ); // eslint-disable-line max-len
	assert.equal( info, 0 );
	assert.equal( out.M, tc.M );
	assertArrayClose( toArray( w.subarray( 0, out.M ) ), tc.w, 1e-12, 'eigenvalues' ); // eslint-disable-line max-len
	verifyEigenpairs( tridiagD(), tridiagE(), N, w, Z, out.M, 1e-12, 'eigenpairs' ); // eslint-disable-line max-len
});

test( 'dstevr: V_I - index range, compute vectors', function t() {
	var ISUPPZ;
	var IWORK;
	var WORK;
	var info;
	var out;
	var tc;
	var d;
	var e;
	var w;
	var Z;
	var N;

	tc = v_i;
	N = tc.N;
	d = tridiagD();
	e = tridiagE();
	w = new Float64Array( N );
	Z = new Float64Array( N * N );
	ISUPPZ = new Int32Array( 2 * N );
	WORK = new Float64Array( 20 * N );
	IWORK = new Int32Array( 10 * N );
	out = {};
	info = dstevr( 'compute-vectors', 'index', N, d, 1, 0, e, 1, 0, 0.0, 0.0, 2, 4, 0.0, out, w, 1, 0, Z, 1, N, 0, ISUPPZ, 1, 0, WORK, 1, 0, 20 * N, IWORK, 1, 0, 10 * N ); // eslint-disable-line max-len
	assert.equal( info, 0 );
	assert.equal( out.M, tc.M );
	assertArrayClose( toArray( w.subarray( 0, out.M ) ), tc.w, 1e-12, 'eigenvalues' ); // eslint-disable-line max-len
	verifyEigenpairs( tridiagD(), tridiagE(), N, w, Z, out.M, 1e-12, 'eigenpairs' ); // eslint-disable-line max-len
});

test( 'dstevr: N0 - N=0', function t() {
	var ISUPPZ;
	var IWORK;
	var WORK;
	var info;
	var out;
	var d;
	var e;
	var w;
	var Z;

	d = new Float64Array( 1 );
	e = new Float64Array( 1 );
	w = new Float64Array( 1 );
	Z = new Float64Array( 1 );
	ISUPPZ = new Int32Array( 1 );
	WORK = new Float64Array( 1 );
	IWORK = new Int32Array( 1 );
	out = {};
	info = dstevr( 'compute-vectors', 'all', 0, d, 1, 0, e, 1, 0, 0.0, 0.0, 0, 0, 0.0, out, w, 1, 0, Z, 1, 1, 0, ISUPPZ, 1, 0, WORK, 1, 0, 1, IWORK, 1, 0, 1 ); // eslint-disable-line max-len
	assert.equal( info, 0 );
	assert.equal( out.M, 0 );
});

test( 'dstevr: N1 - N=1', function t() {
	var ISUPPZ;
	var IWORK;
	var WORK;
	var info;
	var out;
	var d;
	var e;
	var w;
	var Z;

	d = new Float64Array( [ 7.0 ] );
	e = new Float64Array( 1 );
	w = new Float64Array( 1 );
	Z = new Float64Array( 1 );
	ISUPPZ = new Int32Array( 2 );
	WORK = new Float64Array( 20 );
	IWORK = new Int32Array( 10 );
	out = {};
	info = dstevr( 'compute-vectors', 'all', 1, d, 1, 0, e, 1, 0, 0.0, 0.0, 0, 0, 0.0, out, w, 1, 0, Z, 1, 1, 0, ISUPPZ, 1, 0, WORK, 1, 0, 20, IWORK, 1, 0, 10 ); // eslint-disable-line max-len
	assert.equal( info, 0 );
	assert.equal( out.M, 1 );
	assertClose( w[ 0 ], 7.0, 1e-14, 'eigenvalue' );
	assertClose( Z[ 0 ], 1.0, 1e-14, 'eigenvector' );
});

test( 'dstevr: N_V - eigenvalues only, value range', function t() {
	var ISUPPZ;
	var IWORK;
	var WORK;
	var info;
	var out;
	var tc;
	var d;
	var e;
	var w;
	var Z;
	var N;

	tc = n_v;
	N = tc.N;
	d = tridiagD();
	e = tridiagE();
	w = new Float64Array( N );
	Z = new Float64Array( 1 );
	ISUPPZ = new Int32Array( 2 * N );
	WORK = new Float64Array( 20 * N );
	IWORK = new Int32Array( 10 * N );
	out = {};
	info = dstevr( 'no-vectors', 'value', N, d, 1, 0, e, 1, 0, 5.0, 9.0, 0, 0, 0.0, out, w, 1, 0, Z, 1, 1, 0, ISUPPZ, 1, 0, WORK, 1, 0, 20 * N, IWORK, 1, 0, 10 * N ); // eslint-disable-line max-len
	assert.equal( info, 0 );
	assert.equal( out.M, tc.M );
	assertArrayClose( toArray( w.subarray( 0, out.M ) ), tc.w, 1e-12, 'eigenvalues' ); // eslint-disable-line max-len
});

test( 'dstevr: N1_V_in_range - N=1 value range, eigenvalue in range', function t() { // eslint-disable-line max-len
	var ISUPPZ;
	var IWORK;
	var WORK;
	var info;
	var out;
	var d;
	var e;
	var w;
	var Z;

	d = new Float64Array( [ 7.0 ] );
	e = new Float64Array( 1 );
	w = new Float64Array( 1 );
	Z = new Float64Array( 1 );
	ISUPPZ = new Int32Array( 2 );
	WORK = new Float64Array( 20 );
	IWORK = new Int32Array( 10 );
	out = {};
	info = dstevr( 'compute-vectors', 'value', 1, d, 1, 0, e, 1, 0, 6.0, 8.0, 0, 0, 0.0, out, w, 1, 0, Z, 1, 1, 0, ISUPPZ, 1, 0, WORK, 1, 0, 20, IWORK, 1, 0, 10 ); // eslint-disable-line max-len
	assert.equal( info, 0 );
	assert.equal( out.M, 1 );
	assertClose( w[ 0 ], 7.0, 1e-14, 'eigenvalue' );
});

test( 'dstevr: N1_V_out_range - N=1 value range, eigenvalue out of range', function t() { // eslint-disable-line max-len
	var ISUPPZ;
	var IWORK;
	var WORK;
	var info;
	var out;
	var d;
	var e;
	var w;
	var Z;

	d = new Float64Array( [ 7.0 ] );
	e = new Float64Array( 1 );
	w = new Float64Array( 1 );
	Z = new Float64Array( 1 );
	ISUPPZ = new Int32Array( 2 );
	WORK = new Float64Array( 20 );
	IWORK = new Int32Array( 10 );
	out = {};
	info = dstevr( 'no-vectors', 'value', 1, d, 1, 0, e, 1, 0, 10.0, 20.0, 0, 0, 0.0, out, w, 1, 0, Z, 1, 1, 0, ISUPPZ, 1, 0, WORK, 1, 0, 20, IWORK, 1, 0, 10 ); // eslint-disable-line max-len
	assert.equal( info, 0 );
	assert.equal( out.M, 0, 'no eigenvalues in range' );
});

test( 'dstevr: tiny_matrix - scaling path for small norm', function t() {
	var ISUPPZ;
	var IWORK;
	var tiny;
	var WORK;
	var info;
	var out;
	var N;
	var d;
	var e;
	var w;
	var Z;

	tiny = 1e-170;
	N = 5;
	d = new Float64Array( [ 4 * tiny, 6 * tiny, 8 * tiny, 10 * tiny, 12 * tiny ] );
	e = new Float64Array( [ 1 * tiny, 0.5 * tiny, 1 * tiny, 0.5 * tiny ] );
	w = new Float64Array( N );
	Z = new Float64Array( N * N );
	ISUPPZ = new Int32Array( 2 * N );
	WORK = new Float64Array( 20 * N );
	IWORK = new Int32Array( 10 * N );
	out = {};
	info = dstevr( 'compute-vectors', 'all', N, d, 1, 0, e, 1, 0, 0.0, 0.0, 0, 0, 0.0, out, w, 1, 0, Z, 1, N, 0, ISUPPZ, 1, 0, WORK, 1, 0, 20 * N, IWORK, 1, 0, 10 * N ); // eslint-disable-line max-len
	assert.equal( info, 0, 'info' );
	assert.equal( out.M, N, 'M' );
});

test( 'dstevr: tiny_eigenvalues_only - scaling with dsterf path', function t() {
	var ISUPPZ;
	var IWORK;
	var tiny;
	var WORK;
	var info;
	var out;
	var N;
	var d;
	var e;
	var w;
	var Z;

	tiny = 1e-170;
	N = 5;
	d = new Float64Array( [ 4 * tiny, 6 * tiny, 8 * tiny, 10 * tiny, 12 * tiny ] );
	e = new Float64Array( [ 1 * tiny, 0.5 * tiny, 1 * tiny, 0.5 * tiny ] );
	w = new Float64Array( N );
	Z = new Float64Array( 1 );
	ISUPPZ = new Int32Array( 2 * N );
	WORK = new Float64Array( 20 * N );
	IWORK = new Int32Array( 10 * N );
	out = {};
	info = dstevr( 'no-vectors', 'all', N, d, 1, 0, e, 1, 0, 0.0, 0.0, 0, 0, 0.0, out, w, 1, 0, Z, 1, 1, 0, ISUPPZ, 1, 0, WORK, 1, 0, 20 * N, IWORK, 1, 0, 10 * N ); // eslint-disable-line max-len
	assert.equal( info, 0, 'info' );
	assert.equal( out.M, N, 'M' );
});

test( 'dstevr: value_range_with_scaling - scaling + value range', function t() {
	var ISUPPZ;
	var IWORK;
	var tiny;
	var WORK;
	var info;
	var out;
	var N;
	var d;
	var e;
	var w;
	var Z;

	tiny = 1e-170;
	N = 5;
	d = new Float64Array( [ 4 * tiny, 6 * tiny, 8 * tiny, 10 * tiny, 12 * tiny ] );
	e = new Float64Array( [ 1 * tiny, 0.5 * tiny, 1 * tiny, 0.5 * tiny ] );
	w = new Float64Array( N );
	Z = new Float64Array( N * N );
	ISUPPZ = new Int32Array( 2 * N );
	WORK = new Float64Array( 20 * N );
	IWORK = new Int32Array( 10 * N );
	out = {};
	info = dstevr( 'compute-vectors', 'value', N, d, 1, 0, e, 1, 0, 5e-170, 9e-170, 0, 0, 0.0, out, w, 1, 0, Z, 1, N, 0, ISUPPZ, 1, 0, WORK, 1, 0, 20 * N, IWORK, 1, 0, 10 * N ); // eslint-disable-line max-len
	assert.equal( info, 0, 'info' );
	assert.ok( out.M >= 0, 'M should be non-negative' );
});

test( 'dstevr: N_I - eigenvalues only, index range', function t() {
	var ISUPPZ;
	var IWORK;
	var WORK;
	var info;
	var out;
	var tc;
	var d;
	var e;
	var w;
	var Z;
	var N;

	tc = n_i;
	N = tc.N;
	d = tridiagD();
	e = tridiagE();
	w = new Float64Array( N );
	Z = new Float64Array( 1 );
	ISUPPZ = new Int32Array( 2 * N );
	WORK = new Float64Array( 20 * N );
	IWORK = new Int32Array( 10 * N );
	out = {};
	info = dstevr( 'no-vectors', 'index', N, d, 1, 0, e, 1, 0, 0.0, 0.0, 1, 3, 0.0, out, w, 1, 0, Z, 1, 1, 0, ISUPPZ, 1, 0, WORK, 1, 0, 20 * N, IWORK, 1, 0, 10 * N ); // eslint-disable-line max-len
	assert.equal( info, 0 );
	assert.equal( out.M, tc.M );
	assertArrayClose( toArray( w.subarray( 0, out.M ) ), tc.w, 1e-12, 'eigenvalues' ); // eslint-disable-line max-len
});
