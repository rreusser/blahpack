/* eslint-disable no-restricted-syntax */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import dstevr from './../lib/ndarray.js';
import dscal from '../../../blas/dscal/lib/base.js';
import { importWithDependencies } from '../../../../test/harness/constants.js';

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
	let err, nrm, Tv, v, i, k;

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
	const out = [];
	let i;
	for ( i = 0; i < arr.length; i++ ) {
		out.push( arr[ i ] );
	}
	return out;
}

// TESTS //

test( 'dstevr: V_A - compute all eigenvectors', function t() {
	const m = new Int32Array( 1 );

	const tc = v_a;
	const N = tc.N;
	const d = tridiagD();
	const e = tridiagE();
	const w = new Float64Array( N );
	const Z = new Float64Array( N * N );
	const ISUPPZ = new Int32Array( 2 * N );
	const WORK = new Float64Array( 20 * N );
	const IWORK = new Int32Array( 10 * N );
	const info = dstevr( 'compute-vectors', 'all', N, d, 1, 0, e, 1, 0, 0.0, 0.0, 0, 0, 0.0, m, w, 1, 0, Z, 1, N, 0, ISUPPZ, 1, 0, WORK, 1, 0, IWORK, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, 0 );
	assert.equal( m[ 0 ], tc.M );
	assertArrayClose( toArray( w.subarray( 0, m[ 0 ] ) ), tc.w, 1e-12, 'eigenvalues' ); // eslint-disable-line max-len
	verifyEigenpairs( tridiagD(), tridiagE(), N, w, Z, m[ 0 ], 1e-12, 'eigenpairs' ); // eslint-disable-line max-len
});

test( 'dstevr: N_A - eigenvalues only, all', function t() {
	const m = new Int32Array( 1 );

	const tc = n_a;
	const N = tc.N;
	const d = tridiagD();
	const e = tridiagE();
	const w = new Float64Array( N );
	const Z = new Float64Array( 1 );
	const ISUPPZ = new Int32Array( 2 * N );
	const WORK = new Float64Array( 20 * N );
	const IWORK = new Int32Array( 10 * N );
	const info = dstevr( 'no-vectors', 'all', N, d, 1, 0, e, 1, 0, 0.0, 0.0, 0, 0, 0.0, m, w, 1, 0, Z, 1, 1, 0, ISUPPZ, 1, 0, WORK, 1, 0, IWORK, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, 0 );
	assert.equal( m[ 0 ], tc.M );
	assertArrayClose( toArray( w.subarray( 0, m[ 0 ] ) ), tc.w, 1e-12, 'eigenvalues' ); // eslint-disable-line max-len
});

test( 'dstevr: V_V - value range, compute vectors', function t() {
	const m = new Int32Array( 1 );

	const tc = v_v;
	const N = tc.N;
	const d = tridiagD();
	const e = tridiagE();
	const w = new Float64Array( N );
	const Z = new Float64Array( N * N );
	const ISUPPZ = new Int32Array( 2 * N );
	const WORK = new Float64Array( 20 * N );
	const IWORK = new Int32Array( 10 * N );
	const info = dstevr( 'compute-vectors', 'value', N, d, 1, 0, e, 1, 0, 5.0, 9.0, 0, 0, 0.0, m, w, 1, 0, Z, 1, N, 0, ISUPPZ, 1, 0, WORK, 1, 0, IWORK, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, 0 );
	assert.equal( m[ 0 ], tc.M );
	assertArrayClose( toArray( w.subarray( 0, m[ 0 ] ) ), tc.w, 1e-12, 'eigenvalues' ); // eslint-disable-line max-len
	verifyEigenpairs( tridiagD(), tridiagE(), N, w, Z, m[ 0 ], 1e-12, 'eigenpairs' ); // eslint-disable-line max-len
});

test( 'dstevr: V_I - index range, compute vectors', function t() {
	const m = new Int32Array( 1 );

	const tc = v_i;
	const N = tc.N;
	const d = tridiagD();
	const e = tridiagE();
	const w = new Float64Array( N );
	const Z = new Float64Array( N * N );
	const ISUPPZ = new Int32Array( 2 * N );
	const WORK = new Float64Array( 20 * N );
	const IWORK = new Int32Array( 10 * N );
	const info = dstevr( 'compute-vectors', 'index', N, d, 1, 0, e, 1, 0, 0.0, 0.0, 2, 4, 0.0, m, w, 1, 0, Z, 1, N, 0, ISUPPZ, 1, 0, WORK, 1, 0, IWORK, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, 0 );
	assert.equal( m[ 0 ], tc.M );
	assertArrayClose( toArray( w.subarray( 0, m[ 0 ] ) ), tc.w, 1e-12, 'eigenvalues' ); // eslint-disable-line max-len
	verifyEigenpairs( tridiagD(), tridiagE(), N, w, Z, m[ 0 ], 1e-12, 'eigenpairs' ); // eslint-disable-line max-len
});

test( 'dstevr: N0 - N=0', function t() {
	const m = new Int32Array( 1 );

	const d = new Float64Array( 1 );
	const e = new Float64Array( 1 );
	const w = new Float64Array( 1 );
	const Z = new Float64Array( 1 );
	const ISUPPZ = new Int32Array( 1 );
	const WORK = new Float64Array( 1 );
	const IWORK = new Int32Array( 1 );
	const info = dstevr( 'compute-vectors', 'all', 0, d, 1, 0, e, 1, 0, 0.0, 0.0, 0, 0, 0.0, m, w, 1, 0, Z, 1, 1, 0, ISUPPZ, 1, 0, WORK, 1, 0, IWORK, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, 0 );
	assert.equal( m[ 0 ], 0 );
});

test( 'dstevr: N1 - N=1', function t() {
	const m = new Int32Array( 1 );

	const d = new Float64Array( [ 7.0 ] );
	const e = new Float64Array( 1 );
	const w = new Float64Array( 1 );
	const Z = new Float64Array( 1 );
	const ISUPPZ = new Int32Array( 2 );
	const WORK = new Float64Array( 20 );
	const IWORK = new Int32Array( 10 );
	const info = dstevr( 'compute-vectors', 'all', 1, d, 1, 0, e, 1, 0, 0.0, 0.0, 0, 0, 0.0, m, w, 1, 0, Z, 1, 1, 0, ISUPPZ, 1, 0, WORK, 1, 0, IWORK, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, 0 );
	assert.equal( m[ 0 ], 1 );
	assertClose( w[ 0 ], 7.0, 1e-14, 'eigenvalue' );
	assertClose( Z[ 0 ], 1.0, 1e-14, 'eigenvector' );
});

test( 'dstevr: N_V - eigenvalues only, value range', function t() {
	const m = new Int32Array( 1 );

	const tc = n_v;
	const N = tc.N;
	const d = tridiagD();
	const e = tridiagE();
	const w = new Float64Array( N );
	const Z = new Float64Array( 1 );
	const ISUPPZ = new Int32Array( 2 * N );
	const WORK = new Float64Array( 20 * N );
	const IWORK = new Int32Array( 10 * N );
	const info = dstevr( 'no-vectors', 'value', N, d, 1, 0, e, 1, 0, 5.0, 9.0, 0, 0, 0.0, m, w, 1, 0, Z, 1, 1, 0, ISUPPZ, 1, 0, WORK, 1, 0, IWORK, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, 0 );
	assert.equal( m[ 0 ], tc.M );
	assertArrayClose( toArray( w.subarray( 0, m[ 0 ] ) ), tc.w, 1e-12, 'eigenvalues' ); // eslint-disable-line max-len
});

test( 'dstevr: N1_V_in_range - N=1 value range, eigenvalue in range', function t() { // eslint-disable-line max-len
	const m = new Int32Array( 1 );

	const d = new Float64Array( [ 7.0 ] );
	const e = new Float64Array( 1 );
	const w = new Float64Array( 1 );
	const Z = new Float64Array( 1 );
	const ISUPPZ = new Int32Array( 2 );
	const WORK = new Float64Array( 20 );
	const IWORK = new Int32Array( 10 );
	const info = dstevr( 'compute-vectors', 'value', 1, d, 1, 0, e, 1, 0, 6.0, 8.0, 0, 0, 0.0, m, w, 1, 0, Z, 1, 1, 0, ISUPPZ, 1, 0, WORK, 1, 0, IWORK, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, 0 );
	assert.equal( m[ 0 ], 1 );
	assertClose( w[ 0 ], 7.0, 1e-14, 'eigenvalue' );
});

test( 'dstevr: N1_V_out_range - N=1 value range, eigenvalue out of range', function t() { // eslint-disable-line max-len
	const m = new Int32Array( 1 );

	const d = new Float64Array( [ 7.0 ] );
	const e = new Float64Array( 1 );
	const w = new Float64Array( 1 );
	const Z = new Float64Array( 1 );
	const ISUPPZ = new Int32Array( 2 );
	const WORK = new Float64Array( 20 );
	const IWORK = new Int32Array( 10 );
	const info = dstevr( 'no-vectors', 'value', 1, d, 1, 0, e, 1, 0, 10.0, 20.0, 0, 0, 0.0, m, w, 1, 0, Z, 1, 1, 0, ISUPPZ, 1, 0, WORK, 1, 0, IWORK, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, 0 );
	assert.equal( m[ 0 ], 0, 'no eigenvalues in range' );
});

test( 'dstevr: tiny_matrix - scaling path for small norm', function t() {
	const m = new Int32Array( 1 );

	const tiny = 1e-170;
	const N = 5;
	const d = new Float64Array( [ 4 * tiny, 6 * tiny, 8 * tiny, 10 * tiny, 12 * tiny ] );
	const e = new Float64Array( [ 1 * tiny, 0.5 * tiny, 1 * tiny, 0.5 * tiny ] );
	const w = new Float64Array( N );
	const Z = new Float64Array( N * N );
	const ISUPPZ = new Int32Array( 2 * N );
	const WORK = new Float64Array( 20 * N );
	const IWORK = new Int32Array( 10 * N );
	const info = dstevr( 'compute-vectors', 'all', N, d, 1, 0, e, 1, 0, 0.0, 0.0, 0, 0, 0.0, m, w, 1, 0, Z, 1, N, 0, ISUPPZ, 1, 0, WORK, 1, 0, IWORK, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, 0, 'info' );
	assert.equal( m[ 0 ], N, 'M' );
});

test( 'dstevr: tiny_eigenvalues_only - scaling with dsterf path', function t() {
	const m = new Int32Array( 1 );

	const tiny = 1e-170;
	const N = 5;
	const d = new Float64Array( [ 4 * tiny, 6 * tiny, 8 * tiny, 10 * tiny, 12 * tiny ] );
	const e = new Float64Array( [ 1 * tiny, 0.5 * tiny, 1 * tiny, 0.5 * tiny ] );
	const w = new Float64Array( N );
	const Z = new Float64Array( 1 );
	const ISUPPZ = new Int32Array( 2 * N );
	const WORK = new Float64Array( 20 * N );
	const IWORK = new Int32Array( 10 * N );
	const info = dstevr( 'no-vectors', 'all', N, d, 1, 0, e, 1, 0, 0.0, 0.0, 0, 0, 0.0, m, w, 1, 0, Z, 1, 1, 0, ISUPPZ, 1, 0, WORK, 1, 0, IWORK, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, 0, 'info' );
	assert.equal( m[ 0 ], N, 'M' );
});

test( 'dstevr: value_range_with_scaling - scaling + value range', function t() {
	const m = new Int32Array( 1 );

	const tiny = 1e-170;
	const N = 5;
	const d = new Float64Array( [ 4 * tiny, 6 * tiny, 8 * tiny, 10 * tiny, 12 * tiny ] );
	const e = new Float64Array( [ 1 * tiny, 0.5 * tiny, 1 * tiny, 0.5 * tiny ] );
	const w = new Float64Array( N );
	const Z = new Float64Array( N * N );
	const ISUPPZ = new Int32Array( 2 * N );
	const WORK = new Float64Array( 20 * N );
	const IWORK = new Int32Array( 10 * N );
	const info = dstevr( 'compute-vectors', 'value', N, d, 1, 0, e, 1, 0, 5e-170, 9e-170, 0, 0, 0.0, m, w, 1, 0, Z, 1, N, 0, ISUPPZ, 1, 0, WORK, 1, 0, IWORK, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, 0, 'info' );
	assert.ok( m[ 0 ] >= 0, 'M should be non-negative' );
});

test( 'dstevr: N_I - eigenvalues only, index range', function t() {
	const m = new Int32Array( 1 );

	const tc = n_i;
	const N = tc.N;
	const d = tridiagD();
	const e = tridiagE();
	const w = new Float64Array( N );
	const Z = new Float64Array( 1 );
	const ISUPPZ = new Int32Array( 2 * N );
	const WORK = new Float64Array( 20 * N );
	const IWORK = new Int32Array( 10 * N );
	const info = dstevr( 'no-vectors', 'index', N, d, 1, 0, e, 1, 0, 0.0, 0.0, 1, 3, 0.0, m, w, 1, 0, Z, 1, 1, 0, ISUPPZ, 1, 0, WORK, 1, 0, IWORK, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, 0 );
	assert.equal( m[ 0 ], tc.M );
	assertArrayClose( toArray( w.subarray( 0, m[ 0 ] ) ), tc.w, 1e-12, 'eigenvalues' ); // eslint-disable-line max-len
});

// Ticket 0089 //

// Reference thresholds (data/lapack-3.12.0/SRC/dstevr.f): SAFMIN = DLAMCH( 'S' ) = 2^-1022 and EPS = DLAMCH( 'P' ) = 2^-52 give SMLNUM = 2^-970 and RMIN = SQRT( SMLNUM ) = 2^-485. With DLAMCH( 'E' ) = 2^-53 RMIN would be 2^-484.5. ( RMAX = MIN( SQRT( BIGNUM ), 1/SQRT( SQRT( SAFMIN ) ) ) = 2^255.5 does not depend on EPS. )
const RMIN_P = Math.pow( 2.0, -485 );

/**
* Runs dstevr on the tridiagonal T = s * tridiag( 1, 2, 1 ) given as ( D, E ), through a module whose scaling dependencies are spied on.
*
* @private
* @param {Function} mod - dstevr base implementation
* @param {number} s - scale of the matrix ( max|T| = 2s )
* @returns {Object} info and eigenvalues
*/
function run( mod, s ) {
	const d = new Float64Array( [ 2.0 * s, 2.0 * s, 2.0 * s ] );
	const e = new Float64Array( [ s, s ] );
	const m = new Int32Array( 1 );
	const w = new Float64Array( 3 );
	const info = mod( 'compute-vectors', 'all', 3, d, 1, 0, e, 1, 0, 0.0, 0.0, 0, 0, 0.0, m, w, 1, 0, new Float64Array( 9 ), 1, 3, 0, new Int32Array( 6 ), 1, 0, new Float64Array( 100 ), 1, 0, new Int32Array( 50 ), 1, 0 ); // eslint-disable-line max-len
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

test( 'dstevr: matrix norm between the DLAMCH(P) and DLAMCH(E) RMIN thresholds is not rescaled (ticket 0089)', async function t() {
	const calls = [];
	const mod = ( await importWithDependencies( new URL( './../lib/base.js', import.meta.url ), {
		'../../../blas/dscal/lib/base.js': function spyDscal() {
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

/**
* Runs `dstevr` (eigenvalues only) on a 12-by-12 tridiagonal matrix, with `IWORK` filled with a sentinel.
*
* @private
* @param {Function} fcn - dstevr ndarray implementation
* @param {string} range - eigenvalue range
* @param {integer} il - lower index
* @param {integer} iu - upper index
* @returns {Object} info, eigenvalues and integer workspace
*/
function runAllEigenvalues( fcn, range, il, iu ) {
	const N = 12;
	const d = new Float64Array( N );
	const e = new Float64Array( N - 1 );
	const m = new Int32Array( 1 );
	const w = new Float64Array( N );
	const Z = new Float64Array( 1 );
	const ISUPPZ = new Int32Array( 2 * N );
	const WORK = new Float64Array( 20 * N );
	const IWORK = new Int32Array( 10 * N ).fill( -7 );
	let info;
	let i;
	for ( i = 0; i < N; i++ ) {
		d[ i ] = Math.sin( i + 1.0 ) + ( 0.3 * i );
	}
	for ( i = 0; i < N - 1; i++ ) {
		e[ i ] = Math.cos( ( 2.0 * i ) + 1.0 );
	}
	info = fcn( 'no-vectors', range, N, d, 1, 0, e, 1, 0, 0.0, 0.0, il, iu, 0.0, m, w, 1, 0, Z, 1, 1, 0, ISUPPZ, 1, 0, WORK, 1, 0, IWORK, 1, 0 ); // eslint-disable-line max-len
	return {
		'info': info,
		'M': m[ 0 ],
		'w': w,
		'IWORK': IWORK
	};
}

test( 'dstevr: eigenvalues only by index 1..N take the reference\'s dsterf path, as for range all (IWORK untouched)', function t() {
	const all = runAllEigenvalues( dstevr, 'all', 0, 0 );
	const ind = runAllEigenvalues( dstevr, 'index', 1, 12 );
	assert.equal( ind.info, 0, 'info' );
	assert.equal( ind.M, 12, 'M' );
	assert.deepEqual( Array.from( ind.w ), Array.from( all.w ), 'bit-identical to range all' );
	assert.ok( ind.IWORK.every( ( v ) => v === -7 ), 'IWORK untouched (dstebz not called)' );
});

test( 'dstevr: when ILAENV reports NaN arithmetic unsafe (IEEEOK = 0), all eigenvalues are found by dstebz', async function t() {
	const queries = [];
	const mod = ( await importWithDependencies( new URL( './../lib/base.js', import.meta.url ), {
		'../../ilaenv/lib/base.js': function spyIlaenv( ispec, name, opts, n1, n2, n3, n4 ) {
			queries.push( [ ispec, name, opts, n1, n2, n3, n4 ] );
			return 0;
		}
	}) ).default;
	const ref = runAllEigenvalues( dstevr, 'all', 0, 0 );
	const out = runAllEigenvalues( mod, 'all', 0, 0 );
	let i;
	assert.deepEqual( queries, [ [ 10, 'DSTEVR', 'N', 1, 2, 3, 4 ] ], 'the reference\'s query' );
	assert.equal( out.info, 0, 'info' );
	assert.equal( out.M, 12, 'M' );
	assert.ok( out.IWORK.some( ( v ) => v !== -7 ), 'IWORK used (dstebz called)' );
	for ( i = 0; i < 12; i++ ) {
		assertClose( out.w[ i ], ref.w[ i ], 1e-13, 'w[' + i + ']' );
	}
});

test( 'dstevr: IWORK shorter than the reference minimum max( 1, 10*N ) throws; at the minimum (poisoned, offset) the result is correct', function t() {
	const tc = v_v;
	const N = tc.N;
	const off = 2;
	const m = new Int32Array( 1 );
	const w = new Float64Array( N );
	const Z = new Float64Array( N * N );
	const ISUPPZ = new Int32Array( 2 * N );
	let IWORK = new Int32Array( off + ( 10 * N ) - 1 );
	assert.throws( function bad() {
		dstevr( 'compute-vectors', 'value', N, tridiagD(), 1, 0, tridiagE(), 1, 0, 5.0, 9.0, 0, 0, 0.0, m, w, 1, 0, Z, 1, N, 0, ISUPPZ, 1, 0, new Float64Array( 20 * N ), 1, 0, IWORK, 1, off ); // eslint-disable-line max-len
	}, RangeError );
	IWORK = new Int32Array( off + ( 10 * N ) ).fill( -999999 );
	const WORK = new Float64Array( 20 * N ).fill( NaN );
	const info = dstevr( 'compute-vectors', 'value', N, tridiagD(), 1, 0, tridiagE(), 1, 0, 5.0, 9.0, 0, 0, 0.0, m, w, 1, 0, Z, 1, N, 0, ISUPPZ, 1, 0, WORK, 1, 0, IWORK, 1, off ); // eslint-disable-line max-len
	assert.equal( info, 0 );
	assert.equal( m[ 0 ], tc.M );
	assertArrayClose( toArray( w.subarray( 0, m[ 0 ] ) ), tc.w, 1e-12, 'eigenvalues' ); // eslint-disable-line max-len
	verifyEigenpairs( tridiagD(), tridiagE(), N, w, Z, m[ 0 ], 1e-12, 'eigenpairs' ); // eslint-disable-line max-len
	assert.equal( IWORK[ 0 ], -999999, 'nothing written before the offset' );
});
