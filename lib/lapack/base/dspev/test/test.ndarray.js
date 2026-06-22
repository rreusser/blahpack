/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */
/* eslint-disable max-lines */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dspev from './../lib/ndarray.js';

// FIXTURES //

import jobz_v_uplo_u_4x4 from './fixtures/jobz_v_uplo_u_4x4.json' with { type: 'json' };
import jobz_v_uplo_l_4x4 from './fixtures/jobz_v_uplo_l_4x4.json' with { type: 'json' };
import jobz_n_uplo_u_4x4 from './fixtures/jobz_n_uplo_u_4x4.json' with { type: 'json' };
import jobz_n_uplo_l_4x4 from './fixtures/jobz_n_uplo_l_4x4.json' with { type: 'json' };
import jobz_v_uplo_l_3x3 from './fixtures/jobz_v_uplo_l_3x3.json' with { type: 'json' };
import jobz_v_uplo_u_3x3 from './fixtures/jobz_v_uplo_u_3x3.json' with { type: 'json' };
import n1_jobz_v from './fixtures/n1_jobz_v.json' with { type: 'json' };
import n1_jobz_n from './fixtures/n1_jobz_n.json' with { type: 'json' };
import n0 from './fixtures/n0.json' with { type: 'json' };
import diagonal_4x4 from './fixtures/diagonal_4x4.json' with { type: 'json' };
import jobz_n_uplo_l_3x3 from './fixtures/jobz_n_uplo_l_3x3.json' with { type: 'json' };

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
* Checks orthogonality for a column-major N-by-N matrix.
*
* @private
* @param {Float64Array} Z - eigenvector matrix
* @param {NonNegativeInteger} N - matrix order
* @param {number} tol - tolerance
* @param {string} msg - assertion message
*/
function assertOrthogonal( Z, N, tol, msg ) {
	var sum;
	var i;
	var j;
	var k;

	for ( i = 0; i < N; i++ ) {
		for ( j = 0; j < N; j++ ) {
			sum = 0.0;
			for ( k = 0; k < N; k++ ) {
				sum += Z[ k + (i * N) ] * Z[ k + (j * N) ];
			}
			if ( i === j ) {
				assertClose( sum, 1.0, tol, msg + '[' + i + ',' + j + ']' ); // eslint-disable-line max-len
			} else {
				assert.ok( Math.abs( sum ) < tol, msg + '[' + i + ',' + j + ']' ); // eslint-disable-line max-len
			}
		}
	}
}

/**
* Validates the eigendecomposition for a column-major N-by-N matrix.
*
* @private
* @param {Float64Array} Afull - full symmetric matrix (column-major)
* @param {Float64Array} Z - eigenvector matrix
* @param {Float64Array} W - eigenvalues
* @param {NonNegativeInteger} N - matrix order
* @param {number} tol - tolerance
* @param {string} msg - assertion message
*/
function assertEigendecomp( Afull, Z, W, N, tol, msg ) {
	var lhs;
	var rhs;
	var i;
	var j;
	var k;

	for ( j = 0; j < N; j++ ) {
		for ( i = 0; i < N; i++ ) {
			lhs = 0.0;
			for ( k = 0; k < N; k++ ) {
				lhs += Afull[ i + (k * N) ] * Z[ k + (j * N) ];
			}
			rhs = Z[ i + (j * N) ] * W[ j ];
			assertClose( lhs, rhs, tol, msg + '(' + i + ',' + j + ')' );
		}
	}
}

/**
* Expands a packed upper-triangular matrix to full column-major form.
*
* @private
* @param {Float64Array} AP - packed upper matrix
* @param {NonNegativeInteger} N - matrix order
* @returns {Float64Array} full column-major matrix
*/
function unpackUpper( AP, N ) {
	var out = new Float64Array( N * N );
	var k = 0;
	var i;
	var j;

	for ( j = 0; j < N; j++ ) {
		for ( i = 0; i <= j; i++ ) {
			out[ i + (j * N) ] = AP[ k ];
			out[ j + (i * N) ] = AP[ k ];
			k += 1;
		}
	}
	return out;
}

/**
* Expands a packed lower-triangular matrix to full column-major form.
*
* @private
* @param {Float64Array} AP - packed lower matrix
* @param {NonNegativeInteger} N - matrix order
* @returns {Float64Array} full column-major matrix
*/
function unpackLower( AP, N ) {
	var out = new Float64Array( N * N );
	var k = 0;
	var i;
	var j;

	for ( j = 0; j < N; j++ ) {
		for ( i = j; i < N; i++ ) {
			out[ i + (j * N) ] = AP[ k ];
			out[ j + (i * N) ] = AP[ k ];
			k += 1;
		}
	}
	return out;
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

test( 'dspev: JOBZ=V, UPLO=U, 4x4', function t() {
	var Afull;
	var WORK;
	var info;
	var tc;
	var AP;
	var W;
	var Z;

	tc = jobz_v_uplo_u_4x4;
	Afull = unpackUpper( ( AP = packedUpper4x4(), AP ), 4 );
	W = new Float64Array( 4 );
	Z = new Float64Array( 16 );
	WORK = new Float64Array( 200 );

	info = dspev( 'compute-vectors', 'upper', 4, AP, 1, 0, W, 1, 0, Z, 1, 4, 0, WORK, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, tc.info );
	assertArrayClose( toArray( W ), tc.w, 1e-13, 'eigenvalues' );
	assertOrthogonal( Z, 4, 1e-13, 'orthogonality' );
	assertEigendecomp( Afull, Z, W, 4, 1e-12, 'eigendecomp' );
});

test( 'dspev: JOBZ=V, UPLO=L, 4x4', function t() {
	var Afull;
	var WORK;
	var info;
	var tc;
	var AP;
	var W;
	var Z;

	tc = jobz_v_uplo_l_4x4;
	AP = packedLower4x4();
	Afull = unpackLower( packedLower4x4(), 4 );
	W = new Float64Array( 4 );
	Z = new Float64Array( 16 );
	WORK = new Float64Array( 200 );

	info = dspev( 'compute-vectors', 'lower', 4, AP, 1, 0, W, 1, 0, Z, 1, 4, 0, WORK, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, tc.info );
	assertArrayClose( toArray( W ), tc.w, 1e-13, 'eigenvalues' );
	assertOrthogonal( Z, 4, 1e-13, 'orthogonality' );
	assertEigendecomp( Afull, Z, W, 4, 1e-12, 'eigendecomp' );
});

test( 'dspev: JOBZ=N, UPLO=U, 4x4', function t() {
	var WORK;
	var info;
	var tc;
	var AP;
	var W;
	var Z;

	tc = jobz_n_uplo_u_4x4;
	AP = packedUpper4x4();
	W = new Float64Array( 4 );
	Z = new Float64Array( 1 );
	WORK = new Float64Array( 200 );

	info = dspev( 'no-vectors', 'upper', 4, AP, 1, 0, W, 1, 0, Z, 1, 1, 0, WORK, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, tc.info );
	assertArrayClose( toArray( W ), tc.w, 1e-13, 'eigenvalues' );
});

test( 'dspev: JOBZ=N, UPLO=L, 4x4', function t() {
	var WORK;
	var info;
	var tc;
	var AP;
	var W;
	var Z;

	tc = jobz_n_uplo_l_4x4;
	AP = packedLower4x4();
	W = new Float64Array( 4 );
	Z = new Float64Array( 1 );
	WORK = new Float64Array( 200 );

	info = dspev( 'no-vectors', 'lower', 4, AP, 1, 0, W, 1, 0, Z, 1, 1, 0, WORK, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, tc.info );
	assertArrayClose( toArray( W ), tc.w, 1e-13, 'eigenvalues' );
});

test( 'dspev: JOBZ=V, UPLO=L, 3x3', function t() {
	var Afull;
	var WORK;
	var info;
	var tc;
	var AP;
	var W;
	var Z;

	tc = jobz_v_uplo_l_3x3;
	AP = packedLower3x3();
	Afull = unpackLower( packedLower3x3(), 3 );
	W = new Float64Array( 3 );
	Z = new Float64Array( 9 );
	WORK = new Float64Array( 200 );

	info = dspev( 'compute-vectors', 'lower', 3, AP, 1, 0, W, 1, 0, Z, 1, 3, 0, WORK, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, tc.info );
	assertArrayClose( toArray( W ), tc.w, 1e-13, 'eigenvalues' );
	assertOrthogonal( Z, 3, 1e-13, 'orthogonality' );
	assertEigendecomp( Afull, Z, W, 3, 1e-12, 'eigendecomp' );
});

test( 'dspev: JOBZ=V, UPLO=U, 3x3', function t() {
	var Afull;
	var WORK;
	var info;
	var tc;
	var AP;
	var W;
	var Z;

	tc = jobz_v_uplo_u_3x3;
	AP = packedUpper3x3();
	Afull = unpackUpper( packedUpper3x3(), 3 );
	W = new Float64Array( 3 );
	Z = new Float64Array( 9 );
	WORK = new Float64Array( 200 );

	info = dspev( 'compute-vectors', 'upper', 3, AP, 1, 0, W, 1, 0, Z, 1, 3, 0, WORK, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, tc.info );
	assertArrayClose( toArray( W ), tc.w, 1e-13, 'eigenvalues' );
	assertOrthogonal( Z, 3, 1e-13, 'orthogonality' );
	assertEigendecomp( Afull, Z, W, 3, 1e-12, 'eigendecomp' );
});

test( 'dspev: N=1, JOBZ=V', function t() {
	var WORK;
	var info;
	var tc;
	var AP;
	var W;
	var Z;

	tc = n1_jobz_v;
	AP = new Float64Array( [ 3.5 ] );
	W = new Float64Array( 1 );
	Z = new Float64Array( 1 );
	WORK = new Float64Array( 10 );

	info = dspev( 'compute-vectors', 'lower', 1, AP, 1, 0, W, 1, 0, Z, 1, 1, 0, WORK, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, tc.info );
	assertClose( W[ 0 ], tc.w1, 1e-15, 'w1' );
	assertClose( Z[ 0 ], tc.z11, 1e-15, 'z11' );
});

test( 'dspev: N=1, JOBZ=N', function t() {
	var WORK;
	var info;
	var tc;
	var AP;
	var W;
	var Z;

	tc = n1_jobz_n;
	AP = new Float64Array( [ 7.25 ] );
	W = new Float64Array( 1 );
	Z = new Float64Array( 1 );
	WORK = new Float64Array( 10 );

	info = dspev( 'no-vectors', 'upper', 1, AP, 1, 0, W, 1, 0, Z, 1, 1, 0, WORK, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, tc.info );
	assertClose( W[ 0 ], tc.w1, 1e-15, 'w1' );
});

test( 'dspev: N=0', function t() {
	var WORK;
	var info;
	var tc;
	var AP;
	var W;
	var Z;

	tc = n0;
	AP = new Float64Array( 1 );
	W = new Float64Array( 1 );
	Z = new Float64Array( 1 );
	WORK = new Float64Array( 1 );

	info = dspev( 'compute-vectors', 'lower', 0, AP, 1, 0, W, 1, 0, Z, 1, 1, 0, WORK, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, tc.info );
});

test( 'dspev: diagonal 4x4', function t() {
	var Afull;
	var WORK;
	var info;
	var tc;
	var AP;
	var W;
	var Z;

	tc = diagonal_4x4;
	AP = new Float64Array( [ 3, 0, 0, 0, 1, 0, 0, 4, 0, 2 ] );
	Afull = unpackLower( new Float64Array( AP ), 4 );
	W = new Float64Array( 4 );
	Z = new Float64Array( 16 );
	WORK = new Float64Array( 200 );

	info = dspev( 'compute-vectors', 'lower', 4, AP, 1, 0, W, 1, 0, Z, 1, 4, 0, WORK, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, tc.info );
	assertArrayClose( toArray( W ), tc.w, 1e-14, 'eigenvalues' );
	assertOrthogonal( Z, 4, 1e-13, 'orthogonality' );
	assertEigendecomp( Afull, Z, W, 4, 1e-13, 'eigendecomp' );
});

test( 'dspev: JOBZ=N, UPLO=L, 3x3', function t() {
	var WORK;
	var info;
	var tc;
	var AP;
	var W;
	var Z;

	tc = jobz_n_uplo_l_3x3;
	AP = packedLower3x3();
	W = new Float64Array( 3 );
	Z = new Float64Array( 1 );
	WORK = new Float64Array( 200 );

	info = dspev( 'no-vectors', 'lower', 3, AP, 1, 0, W, 1, 0, Z, 1, 1, 0, WORK, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, tc.info );
	assertArrayClose( toArray( W ), tc.w, 1e-13, 'eigenvalues' );
});

test( 'dspev: scaling path (tiny)', function t() {
	var scale = 1e-154;
	var Afull;
	var WORK;
	var info;
	var AP;
	var W;
	var Z;

	AP = new Float64Array( [ 5*scale, 1*scale, 2*scale, 4*scale, 1*scale, 6*scale ] ); // eslint-disable-line max-len
	Afull = unpackLower( new Float64Array( AP ), 3 );
	W = new Float64Array( 3 );
	Z = new Float64Array( 9 );
	WORK = new Float64Array( 200 );

	info = dspev( 'compute-vectors', 'lower', 3, AP, 1, 0, W, 1, 0, Z, 1, 3, 0, WORK, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, 0 );
	assert.ok( W[ 0 ] <= W[ 1 ], 'ascending' );
	assert.ok( W[ 1 ] <= W[ 2 ], 'ascending' );
	assertOrthogonal( Z, 3, 1e-10, 'orthogonality' );
	assertEigendecomp( Afull, Z, W, 3, 1e-8, 'eigendecomp' );
});

test( 'dspev: scaling path (large)', function t() {
	var scale = 1e154;
	var Afull;
	var WORK;
	var info;
	var AP;
	var W;
	var Z;

	AP = new Float64Array( [ 5*scale, 1*scale, 2*scale, 4*scale, 1*scale, 6*scale ] ); // eslint-disable-line max-len
	Afull = unpackLower( new Float64Array( AP ), 3 );
	W = new Float64Array( 3 );
	Z = new Float64Array( 9 );
	WORK = new Float64Array( 200 );

	info = dspev( 'compute-vectors', 'lower', 3, AP, 1, 0, W, 1, 0, Z, 1, 3, 0, WORK, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, 0 );
	assert.ok( W[ 0 ] <= W[ 1 ], 'ascending' );
	assert.ok( W[ 1 ] <= W[ 2 ], 'ascending' );
	assertOrthogonal( Z, 3, 1e-10, 'orthogonality' );
	assertEigendecomp( Afull, Z, W, 3, 1e-8, 'eigendecomp' );
});

test( 'dspev: scaling path (tiny, eigenvalues only)', function t() {
	var expected0;
	var expected1;
	var scale;
	var WORK;
	var info;
	var AP;
	var W;
	var Z;

	scale = 1e-154;
	AP = new Float64Array( [ 4*scale, 1*scale, 5*scale ] );
	W = new Float64Array( 2 );
	Z = new Float64Array( 1 );
	WORK = new Float64Array( 200 );

	info = dspev( 'no-vectors', 'lower', 2, AP, 1, 0, W, 1, 0, Z, 1, 1, 0, WORK, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, 0 );
	expected0 = ( 4.5 - Math.sqrt( 1.25 ) ) * scale;
	expected1 = ( 4.5 + Math.sqrt( 1.25 ) ) * scale;
	assertClose( W[ 0 ], expected0, 1e-10, 'w0' );
	assertClose( W[ 1 ], expected1, 1e-10, 'w1' );
});

// Private helpers for creating packed test matrices:

/**
* Returns 4x4 packed upper matrix.
*
* @private
* @returns {Float64Array} packed upper matrix
*/
function packedUpper4x4() {
	return new Float64Array( [ 4, 1, 5, 2, 1, 6, 1, 2, 1, 7 ] );
}

/**
* Returns 4x4 packed lower matrix.
*
* @private
* @returns {Float64Array} packed lower matrix
*/
function packedLower4x4() {
	return new Float64Array( [ 4, 1, 2, 1, 5, 1, 2, 6, 1, 7 ] );
}

/**
* Returns 3x3 packed lower matrix.
*
* @private
* @returns {Float64Array} packed lower matrix
*/
function packedLower3x3() {
	return new Float64Array( [ 5, 1, 2, 4, 1, 6 ] );
}

/**
* Returns 3x3 packed upper matrix.
*
* @private
* @returns {Float64Array} packed upper matrix
*/
function packedUpper3x3() {
	return new Float64Array( [ 5, 1, 4, 2, 1, 6 ] );
}
