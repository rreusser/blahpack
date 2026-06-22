/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dsteqr from './../lib/ndarray.js';

// FIXTURES //

import compz_i_4x4 from './fixtures/compz_i_4x4.json' with { type: 'json' };
import compz_v_4x4 from './fixtures/compz_v_4x4.json' with { type: 'json' };
import compz_n_4x4 from './fixtures/compz_n_4x4.json' with { type: 'json' };
import n1_compz_i from './fixtures/n1_compz_i.json' with { type: 'json' };
import n2_compz_i from './fixtures/n2_compz_i.json' with { type: 'json' };
import n0 from './fixtures/n0.json' with { type: 'json' };
import diagonal_compz_i from './fixtures/diagonal_compz_i.json' with { type: 'json' };
import n6_compz_i from './fixtures/n6_compz_i.json' with { type: 'json' };
import compz_v_permuted from './fixtures/compz_v_permuted.json' with { type: 'json' };
import n2_compz_n from './fixtures/n2_compz_n.json' with { type: 'json' };

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
	assert.equal( actual.length, expected.length, msg + ': length mismatch' );
	for ( i = 0; i < expected.length; i++ ) {
		assertClose( actual[ i ], expected[ i ], tol, msg + '[' + i + ']' );
	}
}

/**
* Verifies Z^T * Z = I (orthogonality of eigenvectors).
*/
function assertOrthogonal( Z, N, tol, msg ) {
	var val;
	var i;
	var j;
	var k;
	for ( i = 0; i < N; i++ ) {
		for ( j = 0; j < N; j++ ) {
			val = 0.0;
			for ( k = 0; k < N; k++ ) {
				// Col-major: Z[k, i] = Z[k + i*N]
				val += Z[ k + i * N ] * Z[ k + j * N ];
			}
			if ( i === j ) {
				assertClose( val, 1.0, tol, msg + ': Z^T*Z[' + i + ',' + j + '] should be 1' ); // eslint-disable-line max-len
			} else {
				assert.ok( Math.abs( val ) <= tol, msg + ': Z^T*Z[' + i + ',' + j + '] should be 0, got ' + val ); // eslint-disable-line max-len
			}
		}
	}
}

/**
* Verify T _ Z = Z _ diag(d): for each eigenvector column j,.
* check that T _ z_j = d_j _ z_j, where T is the original tridiagonal matrix.
*
* @param {Float64Array} Z - eigenvector matrix (col-major, N x N)
* @param {Float64Array} d - eigenvalues (length N)
* @param {Float64Array} origD - original diagonal (length N)
* @param {Float64Array} origE - original subdiagonal (length N-1)
* @param {integer} N - order
* @param {number} tol - tolerance
* @param {string} msg - message prefix
*/
function assertEigendecomp( Z, d, origD, origE, N, tol, msg ) {
	var Tz_k;
	var dz_k;
	var err;
	var i;
	var j;
	for ( j = 0; j < N; j++ ) {
		for ( i = 0; i < N; i++ ) {
			// (T * z_j)[i] = origD[i]*Z[i,j] + origE[i]*Z[i+1,j] + origE[i-1]*Z[i-1,j]
			Tz_k = origD[ i ] * Z[ i + j * N ];
			if ( i < N - 1 ) {
				Tz_k += origE[ i ] * Z[ ( i + 1 ) + j * N ];
			}
			if ( i > 0 ) {
				Tz_k += origE[ i - 1 ] * Z[ ( i - 1 ) + j * N ];
			}
			dz_k = d[ j ] * Z[ i + j * N ];
			err = Math.abs( Tz_k - dz_k );
			assert.ok( err <= tol, msg + ': T*z[' + i + ',' + j + '] - d[' + j + ']*z[' + i + ',' + j + '] = ' + err ); // eslint-disable-line max-len
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

// TESTS //

test( 'dsteqr: COMPZ=I, 4x4 tridiagonal matrix', function t() {
	var origD;
	var origE;
	var WORK;
	var info;
	var tc;
	var N;
	var d;
	var e;
	var Z;

	tc = compz_i_4x4;
	origD = [ 2.0, 2.0, 2.0, 2.0 ];
	origE = [ 1.0, 1.0, 1.0 ];
	N = 4;
	d = new Float64Array( origD );
	e = new Float64Array( origE );
	Z = new Float64Array( N * N );
	WORK = new Float64Array( 2 * ( N - 1 ) );
	info = dsteqr( 'initialize', N, d, 1, 0, e, 1, 0, Z, 1, N, 0, WORK, 1, 0 );
	assert.equal( info, tc.info );
	assertArrayClose( toArray( d ), tc.d, 1e-14, 'd' );
	assertOrthogonal( Z, N, 1e-14, 'orthogonality' );
	assertEigendecomp( Z, d, origD, origE, N, 1e-13, 'eigendecomp' );
});

test( 'dsteqr: COMPZ=V, 4x4 with identity Z', function t() {
	var origD;
	var origE;
	var WORK;
	var info;
	var tc;
	var N;
	var d;
	var e;
	var Z;
	var i;

	tc = compz_v_4x4;
	origD = [ 2.0, 2.0, 2.0, 2.0 ];
	origE = [ 1.0, 1.0, 1.0 ];
	N = 4;
	d = new Float64Array( origD );
	e = new Float64Array( origE );
	Z = new Float64Array( N * N );
	WORK = new Float64Array( 2 * ( N - 1 ) );
	for ( i = 0; i < N; i++ ) {
		Z[ i + i * N ] = 1.0;
	}
	info = dsteqr( 'update', N, d, 1, 0, e, 1, 0, Z, 1, N, 0, WORK, 1, 0 );
	assert.equal( info, tc.info );
	assertArrayClose( toArray( d ), tc.d, 1e-14, 'd' );
	assertOrthogonal( Z, N, 1e-14, 'orthogonality' );
	assertEigendecomp( Z, d, origD, origE, N, 1e-13, 'eigendecomp' );
});

test( 'dsteqr: COMPZ=N, eigenvalues only', function t() {
	var WORK;
	var info;
	var tc;
	var N;
	var d;
	var e;
	var Z;

	tc = compz_n_4x4;
	N = 4;
	d = new Float64Array( [ 2.0, 2.0, 2.0, 2.0 ] );
	e = new Float64Array( [ 1.0, 1.0, 1.0 ] );
	Z = new Float64Array( 1 );
	WORK = new Float64Array( 1 );
	info = dsteqr( 'none', N, d, 1, 0, e, 1, 0, Z, 1, N, 0, WORK, 1, 0 );
	assert.equal( info, tc.info );
	assertArrayClose( toArray( d ), tc.d, 1e-14, 'd' );
});

test( 'dsteqr: N=1, COMPZ=I', function t() {
	var WORK;
	var info;
	var tc;
	var N;
	var d;
	var e;
	var Z;

	tc = n1_compz_i;
	N = 1;
	d = new Float64Array( [ 5.0 ] );
	e = new Float64Array( 0 );
	Z = new Float64Array( 1 );
	WORK = new Float64Array( 1 );
	info = dsteqr( 'initialize', N, d, 1, 0, e, 1, 0, Z, 1, 1, 0, WORK, 1, 0 );
	assert.equal( info, tc.info );
	assertArrayClose( toArray( d ), tc.d, 1e-14, 'd' );
	assertArrayClose( toArray( Z ), tc.z, 1e-14, 'z' );
});

test( 'dsteqr: N=2, COMPZ=I', function t() {
	var origD;
	var origE;
	var WORK;
	var info;
	var tc;
	var N;
	var d;
	var e;
	var Z;

	tc = n2_compz_i;
	origD = [ 3.0, 1.0 ];
	origE = [ 2.0 ];
	N = 2;
	d = new Float64Array( origD );
	e = new Float64Array( origE );
	Z = new Float64Array( N * N );
	WORK = new Float64Array( 2 );
	info = dsteqr( 'initialize', N, d, 1, 0, e, 1, 0, Z, 1, N, 0, WORK, 1, 0 );
	assert.equal( info, tc.info );
	assertArrayClose( toArray( d ), tc.d, 1e-14, 'd' );
	assertOrthogonal( Z, N, 1e-14, 'orthogonality' );
	assertEigendecomp( Z, d, origD, origE, N, 1e-13, 'eigendecomp' );
});

test( 'dsteqr: N=0 edge case', function t() {
	var info;
	var tc = n0;

	info = dsteqr( 'initialize', 0, new Float64Array( 0 ), 1, 0, new Float64Array( 0 ), 1, 0, new Float64Array( 0 ), 1, 1, 0, new Float64Array( 0 ), 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, tc.info );
});

test( 'dsteqr: already-diagonal matrix, COMPZ=I', function t() {
	var origD;
	var origE;
	var WORK;
	var info;
	var tc;
	var N;
	var d;
	var e;
	var Z;

	tc = diagonal_compz_i;
	origD = [ 4.0, 1.0, 3.0, 2.0 ];
	origE = [ 0.0, 0.0, 0.0 ];
	N = 4;
	d = new Float64Array( origD );
	e = new Float64Array( origE );
	Z = new Float64Array( N * N );
	WORK = new Float64Array( 2 * ( N - 1 ) );
	info = dsteqr( 'initialize', N, d, 1, 0, e, 1, 0, Z, 1, N, 0, WORK, 1, 0 );
	assert.equal( info, tc.info );
	assertArrayClose( toArray( d ), tc.d, 1e-14, 'd' );
	assertOrthogonal( Z, N, 1e-14, 'orthogonality' );
	assertEigendecomp( Z, d, origD, origE, N, 1e-13, 'eigendecomp' );
});

test( 'dsteqr: 6x6 matrix, COMPZ=I', function t() {
	var origD;
	var origE;
	var WORK;
	var info;
	var tc;
	var N;
	var d;
	var e;
	var Z;

	tc = n6_compz_i;
	origD = [ 4.0, 3.0, 2.0, 1.0, 5.0, 6.0 ];
	origE = [ 1.0, 0.5, 0.25, 0.125, 2.0 ];
	N = 6;
	d = new Float64Array( origD );
	e = new Float64Array( origE );
	Z = new Float64Array( N * N );
	WORK = new Float64Array( 2 * ( N - 1 ) );
	info = dsteqr( 'initialize', N, d, 1, 0, e, 1, 0, Z, 1, N, 0, WORK, 1, 0 );
	assert.equal( info, tc.info );
	assertArrayClose( toArray( d ), tc.d, 1e-13, 'd' );
	assertOrthogonal( Z, N, 1e-13, 'orthogonality' );
	assertEigendecomp( Z, d, origD, origE, N, 1e-12, 'eigendecomp' );
});

test( 'dsteqr: COMPZ=V, 4x4 with permuted Z', function t() {
	var origD;
	var origE;
	var WORK;
	var info;
	var tc;
	var N;
	var d;
	var e;
	var Z;

	tc = compz_v_permuted;
	origD = [ 2.0, 2.0, 2.0, 2.0 ];
	origE = [ 1.0, 1.0, 1.0 ];
	N = 4;
	d = new Float64Array( origD );
	e = new Float64Array( origE );
	Z = new Float64Array( N * N );
	WORK = new Float64Array( 2 * ( N - 1 ) );
	Z[ 0 + 1 * N ] = 1.0;
	Z[ 1 + 0 * N ] = 1.0;
	Z[ 2 + 2 * N ] = 1.0;
	Z[ 3 + 3 * N ] = 1.0;
	info = dsteqr( 'update', N, d, 1, 0, e, 1, 0, Z, 1, N, 0, WORK, 1, 0 );
	assert.equal( info, tc.info );
	assertArrayClose( toArray( d ), tc.d, 1e-14, 'd' );
	assertOrthogonal( Z, N, 1e-14, 'orthogonality' );
});

test( 'dsteqr: N=2, COMPZ=N', function t() {
	var WORK;
	var info;
	var tc;
	var N;
	var d;
	var e;
	var Z;

	tc = n2_compz_n;
	N = 2;
	d = new Float64Array( [ 3.0, 1.0 ] );
	e = new Float64Array( [ 2.0 ] );
	Z = new Float64Array( 1 );
	WORK = new Float64Array( 1 );
	info = dsteqr( 'none', N, d, 1, 0, e, 1, 0, Z, 1, N, 0, WORK, 1, 0 );
	assert.equal( info, tc.info );
	assertArrayClose( toArray( d ), tc.d, 1e-14, 'd' );
});

test( 'dsteqr: throws TypeError for invalid COMPZ', function t() {
	assert.throws( function () {
		dsteqr( 'X', 2, new Float64Array( 2 ), 1, 0, new Float64Array( 1 ), 1, 0, new Float64Array( 4 ), 1, 2, 0, new Float64Array( 2 ), 1, 0 ); // eslint-disable-line max-len
	}, TypeError );
});

test( 'dsteqr: QR iteration path - descending diagonal, COMPZ=I', function t() {
	var origD;
	var origE;
	var WORK;
	var info;
	var N;
	var d;
	var e;
	var Z;
	var i;

	origD = [ 10.0, 5.0, 1.0, 0.1 ];
	origE = [ 1.0, 1.0, 1.0 ];
	N = 4;
	d = new Float64Array( origD );
	e = new Float64Array( origE );
	Z = new Float64Array( N * N );
	WORK = new Float64Array( 2 * ( N - 1 ) );
	info = dsteqr( 'initialize', N, d, 1, 0, e, 1, 0, Z, 1, N, 0, WORK, 1, 0 );
	assert.equal( info, 0 );
	assertOrthogonal( Z, N, 1e-13, 'orthogonality' );
	assertEigendecomp( Z, d, origD, origE, N, 1e-12, 'eigendecomp' );
	for ( i = 0; i < N - 1; i++ ) {
		assert.ok( d[ i ] <= d[ i + 1 ], 'eigenvalues ascending: d[' + i + ']=' + d[ i ] + ' <= d[' + ( i + 1 ) + ']=' + d[ i + 1 ] ); // eslint-disable-line max-len
	}
});

test( 'dsteqr: QR iteration path - descending diagonal, COMPZ=N', function t() {
	var origD;
	var origE;
	var WORK;
	var info;
	var N;
	var d;
	var e;
	var Z;
	var i;

	origD = [ 10.0, 5.0, 1.0, 0.1 ];
	origE = [ 1.0, 1.0, 1.0 ];
	N = 4;
	d = new Float64Array( origD );
	e = new Float64Array( origE );
	Z = new Float64Array( 1 );
	WORK = new Float64Array( 1 );
	info = dsteqr( 'none', N, d, 1, 0, e, 1, 0, Z, 1, N, 0, WORK, 1, 0 );
	assert.equal( info, 0 );
	for ( i = 0; i < N - 1; i++ ) {
		assert.ok( d[ i ] <= d[ i + 1 ], 'eigenvalues ascending' );
	}
});

test( 'dsteqr: QR path with 2x2 subproblem, COMPZ=I', function t() {
	var origD;
	var origE;
	var WORK;
	var info;
	var N;
	var d;
	var e;
	var Z;

	origD = [ 100.0, 2.0, 0.01 ];
	origE = [ 0.5, 0.5 ];
	N = 3;
	d = new Float64Array( origD );
	e = new Float64Array( origE );
	Z = new Float64Array( N * N );
	WORK = new Float64Array( 2 * ( N - 1 ) );
	info = dsteqr( 'initialize', N, d, 1, 0, e, 1, 0, Z, 1, N, 0, WORK, 1, 0 );
	assert.equal( info, 0 );
	assertOrthogonal( Z, N, 1e-13, 'orthogonality' );
	assertEigendecomp( Z, d, origD, origE, N, 1e-11, 'eigendecomp' );
});

test( 'dsteqr: QR path with 2x2 subproblem, COMPZ=N', function t() {
	var origD;
	var origE;
	var WORK;
	var info;
	var N;
	var d;
	var e;
	var Z;
	var i;

	origD = [ 100.0, 2.0, 0.01 ];
	origE = [ 0.5, 0.5 ];
	N = 3;
	d = new Float64Array( origD );
	e = new Float64Array( origE );
	Z = new Float64Array( 1 );
	WORK = new Float64Array( 1 );
	info = dsteqr( 'none', N, d, 1, 0, e, 1, 0, Z, 1, N, 0, WORK, 1, 0 );
	assert.equal( info, 0 );
	for ( i = 0; i < N - 1; i++ ) {
		assert.ok( d[ i ] <= d[ i + 1 ], 'eigenvalues ascending' );
	}
});

test( 'dsteqr: matrix with very small off-diag elements triggers negligible E branch', function t() { // eslint-disable-line max-len
	var origD;
	var origE;
	var WORK;
	var info;
	var N;
	var d;
	var e;
	var Z;
	var i;

	N = 3;
	origD = [ 1.0, 1.0, 1.0 ];
	origE = [ 1e-17, 1e-17 ];
	d = new Float64Array( origD );
	e = new Float64Array( origE );
	Z = new Float64Array( N * N );
	WORK = new Float64Array( 2 * ( N - 1 ) );
	info = dsteqr( 'initialize', N, d, 1, 0, e, 1, 0, Z, 1, N, 0, WORK, 1, 0 );
	assert.equal( info, 0 );
	for ( i = 0; i < N; i++ ) {
		assertClose( d[ i ], 1.0, 1e-14, 'd[' + i + ']' );
	}
});

test( 'dsteqr: very large values trigger ssfmax scaling', function t() {
	var bigVal;
	var origD;
	var origE;
	var WORK;
	var info;
	var N;
	var d;
	var e;
	var Z;

	N = 3;
	bigVal = 1e154;
	origD = [ 2.0 * bigVal, 2.0 * bigVal, 2.0 * bigVal ];
	origE = [ 1.0 * bigVal, 1.0 * bigVal ];
	d = new Float64Array( origD );
	e = new Float64Array( origE );
	Z = new Float64Array( N * N );
	WORK = new Float64Array( 2 * ( N - 1 ) );
	info = dsteqr( 'initialize', N, d, 1, 0, e, 1, 0, Z, 1, N, 0, WORK, 1, 0 );
	assert.equal( info, 0 );
	assertOrthogonal( Z, N, 1e-12, 'orthogonality' );
	assertClose( d[ 0 ] / bigVal, 2.0 - Math.sqrt( 2.0 ), 1e-12, 'scaled d[0]' );
	assertClose( d[ 1 ] / bigVal, 2.0, 1e-12, 'scaled d[1]' );
	assertClose( d[ 2 ] / bigVal, 2.0 + Math.sqrt( 2.0 ), 1e-12, 'scaled d[2]' );
});

test( 'dsteqr: very small values trigger ssfmin scaling', function t() {
	var smallVal;
	var origD;
	var origE;
	var WORK;
	var info;
	var N;
	var d;
	var e;
	var Z;

	N = 3;
	smallVal = 1e-200;
	origD = [ 2.0 * smallVal, 2.0 * smallVal, 2.0 * smallVal ];
	origE = [ 1.0 * smallVal, 1.0 * smallVal ];
	d = new Float64Array( origD );
	e = new Float64Array( origE );
	Z = new Float64Array( N * N );
	WORK = new Float64Array( 2 * ( N - 1 ) );
	info = dsteqr( 'initialize', N, d, 1, 0, e, 1, 0, Z, 1, N, 0, WORK, 1, 0 );
	assert.equal( info, 0 );
	assertOrthogonal( Z, N, 1e-12, 'orthogonality' );
	assertClose( d[ 0 ] / smallVal, 2.0 - Math.sqrt( 2.0 ), 1e-10, 'scaled d[0]' );
	assertClose( d[ 1 ] / smallVal, 2.0, 1e-10, 'scaled d[1]' );
	assertClose( d[ 2 ] / smallVal, 2.0 + Math.sqrt( 2.0 ), 1e-10, 'scaled d[2]' );
});

test( 'dsteqr: very large values trigger ssfmax scaling in QR path', function t() { // eslint-disable-line max-len
	var bigVal;
	var origD;
	var origE;
	var WORK;
	var info;
	var N;
	var d;
	var e;
	var Z;

	N = 3;
	bigVal = 1e154;
	origD = [ 10.0 * bigVal, 2.0 * bigVal, 0.1 * bigVal ];
	origE = [ 1.0 * bigVal, 1.0 * bigVal ];
	d = new Float64Array( origD );
	e = new Float64Array( origE );
	Z = new Float64Array( N * N );
	WORK = new Float64Array( 2 * ( N - 1 ) );
	info = dsteqr( 'initialize', N, d, 1, 0, e, 1, 0, Z, 1, N, 0, WORK, 1, 0 );
	assert.equal( info, 0 );
	assertOrthogonal( Z, N, 1e-11, 'orthogonality' );
});

test( 'dsteqr: block splitting - matrix with zero off-diagonal element', function t() { // eslint-disable-line max-len
	var origD;
	var origE;
	var WORK;
	var info;
	var N;
	var d;
	var e;
	var Z;
	var i;

	N = 4;
	origD = [ 3.0, 1.0, 5.0, 2.0 ];
	origE = [ 0.5, 0.0, 0.5 ];
	d = new Float64Array( origD );
	e = new Float64Array( origE );
	Z = new Float64Array( N * N );
	WORK = new Float64Array( 2 * ( N - 1 ) );
	info = dsteqr( 'initialize', N, d, 1, 0, e, 1, 0, Z, 1, N, 0, WORK, 1, 0 );
	assert.equal( info, 0 );
	for ( i = 0; i < N - 1; i++ ) {
		assert.ok( d[ i ] <= d[ i + 1 ], 'eigenvalues ascending' );
	}
	assertOrthogonal( Z, N, 1e-14, 'orthogonality' );
	assertEigendecomp( Z, d, origD, origE, N, 1e-13, 'eigendecomp' );
});
