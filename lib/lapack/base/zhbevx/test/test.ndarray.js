/* eslint-disable no-restricted-syntax, stdlib/first-unit-test, no-mixed-operators, max-lines, max-params, node/no-sync */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import zhbevx from './../lib/ndarray.js';

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
	var relErr = Math.abs( actual - expected ) / Math.max( Math.abs( expected ), 1.0 ); // eslint-disable-line max-len
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
	var IWORK = new Int32Array( Math.max( (5 * N) + 10, 1 ) );
	var IFAIL = new Int32Array( Math.max( N, 1 ) );
	var RWORK = new Float64Array( Math.max( (7 * N) + 100, 1 ) );
	var LDAB = kd + 1;
	var info;
	var WORK = new Complex128Array( Math.max( N + 10, 1 ) );
	var out;
	var w = new Float64Array( Math.max( N, 1 ) );
	var Q = new Complex128Array( Math.max( N * N, 1 ) );
	var Z = new Complex128Array( Math.max( N * N, 1 ) );

	out = {
		'M': 0
	};
	info = zhbevx( jobz, range, uplo, N, kd, AB, 1, LDAB, 0, Q, 1, N, 0, vl, vu, il, iu, abstol, out, w, 1, 0, Z, 1, N, 0, WORK, 1, 0, RWORK, 1, 0, IWORK, 1, 0, IFAIL, 1, 0 ); // eslint-disable-line max-len
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
	var LDAB = kd + 1;
	var AvR = new Float64Array( N );
	var AvI = new Float64Array( N );
	var aR;
	var aI;
	var ii;
	var m2;
	var i;
	var j;

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
	var ABv = reinterpret( ABo, 0 );
	var err;
	var nrm;
	var res;
	var Zv = reinterpret( Z, 0 );
	var vR;
	var vI;
	var m2;
	var i;
	var k;

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
	var ABo;
	var AB;
	var tc;
	var r;

	ABo = bandUpper5();
	AB = new Complex128Array( reinterpret( ABo, 0 ).slice() );
	tc = v_a_u_kd2_n5;
	r = runZhbevx( 'compute-vectors', 'all', 'upper', 5, 2, AB, 0, 0, 0, 0, 0 );
	assert.equal( r.info, tc.info );
	assert.equal( r.M, tc.M );
	assertArrayClose( Array.prototype.slice.call( r.w, 0, r.M ), tc.w, 1e-13, 'w' ); // eslint-disable-line max-len
	verifyEigenpairs( 'upper', 5, 2, ABo, r.w, r.Z, r.M, 1e-12, 'eigenpairs' );
});

test( 'zhbevx: V, A, L, KD=2, N=5', function t() {
	var ABo;
	var AB;
	var tc;
	var r;

	ABo = bandLower5();
	AB = new Complex128Array( reinterpret( ABo, 0 ).slice() );
	tc = v_a_l_kd2_n5;
	r = runZhbevx( 'compute-vectors', 'all', 'lower', 5, 2, AB, 0, 0, 0, 0, 0 );
	assert.equal( r.info, tc.info );
	assert.equal( r.M, tc.M );
	assertArrayClose( Array.prototype.slice.call( r.w, 0, r.M ), tc.w, 1e-13, 'w' ); // eslint-disable-line max-len
	verifyEigenpairs( 'lower', 5, 2, ABo, r.w, r.Z, r.M, 1e-12, 'eigenpairs' );
});

test( 'zhbevx: N, A, U, KD=2, N=5 (eigenvalues only)', function t() {
	var tc;
	var AB;
	var r;

	tc = n_a_u_kd2_n5;
	AB = bandUpper5();
	r = runZhbevx( 'no-vectors', 'all', 'upper', 5, 2, AB, 0, 0, 0, 0, 0 );
	assert.equal( r.info, tc.info );
	assert.equal( r.M, tc.M );
	assertArrayClose( Array.prototype.slice.call( r.w, 0, r.M ), tc.w, 1e-13, 'w' ); // eslint-disable-line max-len
});

test( 'zhbevx: V, V, U, KD=2, N=5 (value range [3, 8])', function t() {
	var ABo;
	var AB;
	var tc;
	var r;

	ABo = bandUpper5();
	AB = new Complex128Array( reinterpret( ABo, 0 ).slice() );
	tc = v_v_u_kd2_n5;
	r = runZhbevx( 'compute-vectors', 'value', 'upper', 5, 2, AB, 3.0, 8.0, 0, 0, 0 ); // eslint-disable-line max-len
	assert.equal( r.info, tc.info );
	assert.equal( r.M, tc.M );
	assertArrayClose( Array.prototype.slice.call( r.w, 0, r.M ), tc.w, 1e-13, 'w' ); // eslint-disable-line max-len
	verifyEigenpairs( 'upper', 5, 2, ABo, r.w, r.Z, r.M, 1e-12, 'eigenpairs' );
});

test( 'zhbevx: V, I, U, KD=2, N=5 (index range 2..4)', function t() {
	var ABo;
	var AB;
	var tc;
	var r;

	ABo = bandUpper5();
	AB = new Complex128Array( reinterpret( ABo, 0 ).slice() );
	tc = v_i_u_kd2_n5;
	r = runZhbevx( 'compute-vectors', 'index', 'upper', 5, 2, AB, 0, 0, 2, 4, 0 );
	assert.equal( r.info, tc.info );
	assert.equal( r.M, tc.M );
	assertArrayClose( Array.prototype.slice.call( r.w, 0, r.M ), tc.w, 1e-13, 'w' ); // eslint-disable-line max-len
	verifyEigenpairs( 'upper', 5, 2, ABo, r.w, r.Z, r.M, 1e-12, 'eigenpairs' );
});

test( 'zhbevx: N, V, L, KD=2, N=5 (value range [1, 5])', function t() {
	var tc;
	var AB;
	var r;

	tc = n_v_l_kd2_n5;
	AB = bandLower5();
	r = runZhbevx( 'no-vectors', 'value', 'lower', 5, 2, AB, 1.0, 5.0, 0, 0, 0 );
	assert.equal( r.info, tc.info );
	assert.equal( r.M, tc.M );
	assertArrayClose( Array.prototype.slice.call( r.w, 0, r.M ), tc.w, 1e-13, 'w' ); // eslint-disable-line max-len
});

test( 'zhbevx: N, I, L, KD=2, N=5 (index 3 only)', function t() {
	var tc;
	var AB;
	var r;

	tc = n_i_l_kd2_n5;
	AB = bandLower5();
	r = runZhbevx( 'no-vectors', 'index', 'lower', 5, 2, AB, 0, 0, 3, 3, 0 );
	assert.equal( r.info, tc.info );
	assert.equal( r.M, tc.M );
	assertArrayClose( Array.prototype.slice.call( r.w, 0, r.M ), tc.w, 1e-13, 'w' ); // eslint-disable-line max-len
});

test( 'zhbevx: N=1, V, A, L', function t() {
	var tc;
	var AB;
	var Zv;
	var r;

	tc = n1_v_a_l;
	AB = new Complex128Array( [ 3.5, 0 ] );
	r = runZhbevx( 'compute-vectors', 'all', 'lower', 1, 0, AB, 0, 0, 0, 0, 0 );
	assert.equal( r.info, tc.info );
	assert.equal( r.M, tc.M );
	assertClose( r.w[ 0 ], tc.w1, 1e-14, 'w1' );
	Zv = reinterpret( r.Z, 0 );
	assertClose( Zv[ 0 ], tc.z11[ 0 ], 1e-14, 'z11 real' );
	assertClose( Zv[ 1 ], tc.z11[ 1 ], 1e-14, 'z11 imag' );
});

test( 'zhbevx: N=1, V, V, excluded', function t() {
	var AB;
	var r;

	AB = new Complex128Array( [ 3.5, 0 ] );
	r = runZhbevx( 'compute-vectors', 'value', 'lower', 1, 0, AB, 0, 3.0, 0, 0, 0 ); // eslint-disable-line max-len
	assert.equal( r.info, 0 );
	assert.equal( r.M, 0 );
});

test( 'zhbevx: N=1, V, V, included', function t() {
	var tc;
	var AB;
	var Zv;
	var r;

	tc = n1_v_v_included;
	AB = new Complex128Array( [ 3.5, 0 ] );
	r = runZhbevx( 'compute-vectors', 'value', 'lower', 1, 0, AB, 3.0, 4.0, 0, 0, 0 ); // eslint-disable-line max-len
	assert.equal( r.info, tc.info );
	assert.equal( r.M, tc.M );
	assertClose( r.w[ 0 ], tc.w1, 1e-14, 'w1' );
	Zv = reinterpret( r.Z, 0 );
	assertClose( Zv[ 0 ], tc.z11[ 0 ], 1e-14, 'z11 real' );
	assertClose( Zv[ 1 ], tc.z11[ 1 ], 1e-14, 'z11 imag' );
});

test( 'zhbevx: N=0 (quick return)', function t() {
	var AB;
	var r;

	AB = new Complex128Array( 1 );
	r = runZhbevx( 'compute-vectors', 'all', 'upper', 0, 0, AB, 0, 0, 0, 0, 0 );
	assert.equal( r.info, 0 );
	assert.equal( r.M, 0 );
});

test( 'zhbevx: V, I, L, KD=1, N=4, fast path (IL=1, IU=N)', function t() {
	var ABo;
	var AB;
	var tc;
	var r;

	ABo = bandLower4Kd1();
	AB = new Complex128Array( reinterpret( ABo, 0 ).slice() );
	tc = v_i_l_kd1_n4_fast;
	r = runZhbevx( 'compute-vectors', 'index', 'lower', 4, 1, AB, 0, 0, 1, 4, 0 );
	assert.equal( r.info, tc.info );
	assert.equal( r.M, tc.M );
	assertArrayClose( Array.prototype.slice.call( r.w, 0, r.M ), tc.w, 1e-13, 'w' ); // eslint-disable-line max-len
	verifyEigenpairs( 'lower', 4, 1, ABo, r.w, r.Z, r.M, 1e-12, 'eigenpairs' );
});

test( 'zhbevx: V, I, U, KD=2, N=5, single eigenvalue (IL=IU=1)', function t() {
	var ABo;
	var AB;
	var tc;
	var r;

	ABo = bandUpper5();
	AB = new Complex128Array( reinterpret( ABo, 0 ).slice() );
	tc = v_i_u_kd2_n5_single;
	r = runZhbevx( 'compute-vectors', 'index', 'upper', 5, 2, AB, 0, 0, 1, 1, 0 );
	assert.equal( r.info, tc.info );
	assert.equal( r.M, tc.M );
	assertArrayClose( Array.prototype.slice.call( r.w, 0, r.M ), tc.w, 1e-13, 'w' ); // eslint-disable-line max-len
	verifyEigenpairs( 'upper', 5, 2, ABo, r.w, r.Z, r.M, 1e-12, 'eigenpairs' );
});

test( 'zhbevx: N=1, V, I, U, KD=2 (IL=IU=1)', function t() {
	var tc;
	var AB;
	var Zv;
	var r;

	tc = n1_v_i_u_kd2;
	AB = new Complex128Array( [ 0, 0, 0, 0, 7.25, 0 ] );
	r = runZhbevx( 'compute-vectors', 'index', 'upper', 1, 2, AB, 0, 0, 1, 1, 0 );
	assert.equal( r.info, tc.info );
	assert.equal( r.M, tc.M );
	assertClose( r.w[ 0 ], tc.w1, 1e-14, 'w1' );
	Zv = reinterpret( r.Z, 0 );
	assertClose( Zv[ 0 ], tc.z11[ 0 ], 1e-14, 'z11 real' );
	assertClose( Zv[ 1 ], tc.z11[ 1 ], 1e-14, 'z11 imag' );
});
