/* eslint-disable no-restricted-syntax, stdlib/first-unit-test, no-mixed-operators, max-lines, max-params, node/no-sync */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import dsbevx from './../lib/ndarray.js';

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
	var relErr = Math.abs( actual - expected ) / Math.max( Math.abs( expected ), 1.0 );
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
	var i;
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
	var LDAB = kd + 1;
	var A = new Float64Array( N * N );
	var i;
	var j;
	var k;

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
	var IWORK = new Int32Array( Math.max( (5 * N) + 10, 1 ) );
	var IFAIL = new Int32Array( Math.max( N, 1 ) );
	var WORK = new Float64Array( Math.max( (7 * N) + 100, 1 ) );
	var LDAB = kd + 1;
	var info;
	var out;
	var w = new Float64Array( Math.max( N, 1 ) );
	var Q = new Float64Array( Math.max( N * N, 1 ) );
	var Z = new Float64Array( Math.max( N * N, 1 ) );

	out = {
		'M': 0
	};
	info = dsbevx( jobz, range, uplo, N, kd, AB, 1, LDAB, 0, Q, 1, N, 0, vl, vu, il, iu, abstol, out, w, 1, 0, Z, 1, N, 0, WORK, 1, 0, IWORK, 1, 0, IFAIL, 1, 0 ); // eslint-disable-line max-len
	return {
		'info': info,
		'M': out.M,
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
	var err;
	var nrm;
	var Av;
	var v;
	var i;
	var j;
	var k;

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
	var Afull;
	var ABo = bandUpper5();
	var AB = new Float64Array( ABo );
	var tc = v_a_u_kd2_n5;
	var r;

	Afull = bandToFull( 'upper', 5, 2, ABo );
	r = runDsbevx( 'compute-vectors', 'all', 'upper', 5, 2, AB, 0, 0, 0, 0, 0 );
	assert.equal( r.info, tc.info );
	assert.equal( r.M, tc.M );
	assertArrayClose( Array.prototype.slice.call( r.w, 0, r.M ), tc.w, 1e-13, 'w' ); // eslint-disable-line max-len
	verifyEigenpairs( Afull, 5, r.w, r.Z, r.M, 1e-12, 'eigenpairs' );
});

test( 'dsbevx: V, A, L, KD=2, N=5', function t() {
	var Afull;
	var ABo = bandLower5();
	var AB = new Float64Array( ABo );
	var tc = v_a_l_kd2_n5;
	var r;

	Afull = bandToFull( 'lower', 5, 2, ABo );
	r = runDsbevx( 'compute-vectors', 'all', 'lower', 5, 2, AB, 0, 0, 0, 0, 0 );
	assert.equal( r.info, tc.info );
	assert.equal( r.M, tc.M );
	assertArrayClose( Array.prototype.slice.call( r.w, 0, r.M ), tc.w, 1e-13, 'w' ); // eslint-disable-line max-len
	verifyEigenpairs( Afull, 5, r.w, r.Z, r.M, 1e-12, 'eigenpairs' );
});

test( 'dsbevx: N, A, U, KD=2, N=5 (eigenvalues only)', function t() {
	var tc = n_a_u_kd2_n5;
	var AB = bandUpper5();
	var r = runDsbevx( 'no-vectors', 'all', 'upper', 5, 2, AB, 0, 0, 0, 0, 0 );

	assert.equal( r.info, tc.info );
	assert.equal( r.M, tc.M );
	assertArrayClose( Array.prototype.slice.call( r.w, 0, r.M ), tc.w, 1e-13, 'w' ); // eslint-disable-line max-len
});

test( 'dsbevx: V, V, U, KD=2, N=5 (value range [3, 8])', function t() {
	var Afull;
	var ABo = bandUpper5();
	var AB = new Float64Array( ABo );
	var tc = v_v_u_kd2_n5;
	var r;

	Afull = bandToFull( 'upper', 5, 2, ABo );
	r = runDsbevx( 'compute-vectors', 'value', 'upper', 5, 2, AB, 3.0, 8.0, 0, 0, 0 ); // eslint-disable-line max-len
	assert.equal( r.info, tc.info );
	assert.equal( r.M, tc.M );
	assertArrayClose( Array.prototype.slice.call( r.w, 0, r.M ), tc.w, 1e-13, 'w' ); // eslint-disable-line max-len
	verifyEigenpairs( Afull, 5, r.w, r.Z, r.M, 1e-12, 'eigenpairs' );
});

test( 'dsbevx: V, I, U, KD=2, N=5 (index range 2..4)', function t() {
	var Afull;
	var ABo = bandUpper5();
	var AB = new Float64Array( ABo );
	var tc = v_i_u_kd2_n5;
	var r;

	Afull = bandToFull( 'upper', 5, 2, ABo );
	r = runDsbevx( 'compute-vectors', 'index', 'upper', 5, 2, AB, 0, 0, 2, 4, 0 ); // eslint-disable-line max-len
	assert.equal( r.info, tc.info );
	assert.equal( r.M, tc.M );
	assertArrayClose( Array.prototype.slice.call( r.w, 0, r.M ), tc.w, 1e-13, 'w' ); // eslint-disable-line max-len
	verifyEigenpairs( Afull, 5, r.w, r.Z, r.M, 1e-12, 'eigenpairs' );
});

test( 'dsbevx: N, V, L, KD=2, N=5 (value range [1, 5])', function t() {
	var tc = n_v_l_kd2_n5;
	var AB = bandLower5();
	var r = runDsbevx( 'no-vectors', 'value', 'lower', 5, 2, AB, 1.0, 5.0, 0, 0, 0 ); // eslint-disable-line max-len

	assert.equal( r.info, tc.info );
	assert.equal( r.M, tc.M );
	assertArrayClose( Array.prototype.slice.call( r.w, 0, r.M ), tc.w, 1e-13, 'w' ); // eslint-disable-line max-len
});

test( 'dsbevx: N, I, L, KD=2, N=5 (index 3 only)', function t() {
	var tc = n_i_l_kd2_n5;
	var AB = bandLower5();
	var r = runDsbevx( 'no-vectors', 'index', 'lower', 5, 2, AB, 0, 0, 3, 3, 0 );

	assert.equal( r.info, tc.info );
	assert.equal( r.M, tc.M );
	assertArrayClose( Array.prototype.slice.call( r.w, 0, r.M ), tc.w, 1e-13, 'w' ); // eslint-disable-line max-len
});

test( 'dsbevx: N=1, V, A, L', function t() {
	var tc = n1_v_a_l;
	var AB = new Float64Array( [ 3.5 ] );
	var r = runDsbevx( 'compute-vectors', 'all', 'lower', 1, 0, AB, 0, 0, 0, 0, 0 ); // eslint-disable-line max-len

	assert.equal( r.info, tc.info );
	assert.equal( r.M, tc.M );
	assertClose( r.w[ 0 ], tc.w1, 1e-14, 'w1' );
	assertClose( r.Z[ 0 ], tc.z11, 1e-14, 'z11' );
});

test( 'dsbevx: N=1, V, V, excluded', function t() {
	var AB = new Float64Array( [ 3.5 ] );
	var r = runDsbevx( 'compute-vectors', 'value', 'lower', 1, 0, AB, 0, 3.0, 0, 0, 0 ); // eslint-disable-line max-len

	assert.equal( r.info, 0 );
	assert.equal( r.M, 0 );
});

test( 'dsbevx: N=1, V, V, included', function t() {
	var tc = n1_v_v_included;
	var AB = new Float64Array( [ 3.5 ] );
	var r = runDsbevx( 'compute-vectors', 'value', 'lower', 1, 0, AB, 3.0, 4.0, 0, 0, 0 ); // eslint-disable-line max-len

	assert.equal( r.info, tc.info );
	assert.equal( r.M, tc.M );
	assertClose( r.w[ 0 ], tc.w1, 1e-14, 'w1' );
	assertClose( r.Z[ 0 ], tc.z11, 1e-14, 'z11' );
});

test( 'dsbevx: N=0 (quick return)', function t() {
	var AB = new Float64Array( 1 );
	var r = runDsbevx( 'compute-vectors', 'all', 'upper', 0, 0, AB, 0, 0, 0, 0, 0 ); // eslint-disable-line max-len

	assert.equal( r.info, 0 );
	assert.equal( r.M, 0 );
});

test( 'dsbevx: V, I, L, KD=1, N=4, fast path (IL=1, IU=N)', function t() {
	var Afull;
	var ABo = bandLower4Kd1();
	var AB = new Float64Array( ABo );
	var tc = v_i_l_kd1_n4_fast;
	var r;

	Afull = bandToFull( 'lower', 4, 1, ABo );
	r = runDsbevx( 'compute-vectors', 'index', 'lower', 4, 1, AB, 0, 0, 1, 4, 0 ); // eslint-disable-line max-len
	assert.equal( r.info, tc.info );
	assert.equal( r.M, tc.M );
	assertArrayClose( Array.prototype.slice.call( r.w, 0, r.M ), tc.w, 1e-13, 'w' ); // eslint-disable-line max-len
	verifyEigenpairs( Afull, 4, r.w, r.Z, r.M, 1e-12, 'eigenpairs' );
});

test( 'dsbevx: V, V, L, KD=1, N=4 (value range [4.5, 7.5])', function t() {
	var Afull;
	var ABo = bandLower4Kd1();
	var AB = new Float64Array( ABo );
	var tc = v_v_l_kd1_n4;
	var r;

	Afull = bandToFull( 'lower', 4, 1, ABo );
	r = runDsbevx( 'compute-vectors', 'value', 'lower', 4, 1, AB, 4.5, 7.5, 0, 0, 0 ); // eslint-disable-line max-len
	assert.equal( r.info, tc.info );
	assert.equal( r.M, tc.M );
	assertArrayClose( Array.prototype.slice.call( r.w, 0, r.M ), tc.w, 1e-13, 'w' ); // eslint-disable-line max-len
	verifyEigenpairs( Afull, 4, r.w, r.Z, r.M, 1e-12, 'eigenpairs' );
});

test( 'dsbevx: N, I, U, KD=1, N=4, fast path (IL=1, IU=N)', function t() {
	var tc = n_i_u_kd1_n4_fast;
	var AB = bandUpper4Kd1();
	var r = runDsbevx( 'no-vectors', 'index', 'upper', 4, 1, AB, 0, 0, 1, 4, 0 );

	assert.equal( r.info, tc.info );
	assert.equal( r.M, tc.M );
	assertArrayClose( Array.prototype.slice.call( r.w, 0, r.M ), tc.w, 1e-13, 'w' ); // eslint-disable-line max-len
});

test( 'dsbevx: diagonal (KD=0), V, A', function t() {
	var Afull;
	var ABo = new Float64Array( [ 3, 1, 4, 2 ] );
	var AB = new Float64Array( ABo );
	var tc = diagonal_v_a;
	var r;

	Afull = bandToFull( 'upper', 4, 0, ABo );
	r = runDsbevx( 'compute-vectors', 'all', 'upper', 4, 0, AB, 0, 0, 0, 0, 0 );
	assert.equal( r.info, tc.info );
	assert.equal( r.M, tc.M );
	assertArrayClose( Array.prototype.slice.call( r.w, 0, r.M ), tc.w, 1e-14, 'w' ); // eslint-disable-line max-len
	verifyEigenpairs( Afull, 4, r.w, r.Z, r.M, 1e-12, 'eigenpairs' );
});

test( 'dsbevx: N=1, V, I (IL=IU=1)', function t() {
	var tc = n1_v_i;
	var AB = new Float64Array( [ 5 ] );
	var r = runDsbevx( 'compute-vectors', 'index', 'upper', 1, 0, AB, 0, 0, 1, 1, 0 ); // eslint-disable-line max-len

	assert.equal( r.info, tc.info );
	assert.equal( r.M, tc.M );
	assertClose( r.w[ 0 ], tc.w1, 1e-14, 'w1' );
	assertClose( r.Z[ 0 ], tc.z11, 1e-14, 'z11' );
});

test( 'dsbevx: V, I, U, KD=2, N=5, single eigenvalue (IL=IU=1)', function t() {
	var Afull;
	var ABo = bandUpper5();
	var AB = new Float64Array( ABo );
	var tc = v_i_u_kd2_n5_single;
	var r;

	Afull = bandToFull( 'upper', 5, 2, ABo );
	r = runDsbevx( 'compute-vectors', 'index', 'upper', 5, 2, AB, 0, 0, 1, 1, 0 ); // eslint-disable-line max-len
	assert.equal( r.info, tc.info );
	assert.equal( r.M, tc.M );
	assertArrayClose( Array.prototype.slice.call( r.w, 0, r.M ), tc.w, 1e-13, 'w' ); // eslint-disable-line max-len
	verifyEigenpairs( Afull, 5, r.w, r.Z, r.M, 1e-12, 'eigenpairs' );
});
