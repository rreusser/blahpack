/* eslint-disable no-restricted-syntax, stdlib/first-unit-test, max-lines */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dpteqr from './../lib/ndarray.js';

// FIXTURES //

import compz_n_4x4 from './fixtures/compz_n_4x4.json' with { type: 'json' };
import compz_i_4x4 from './fixtures/compz_i_4x4.json' with { type: 'json' };
import compz_v_4x4 from './fixtures/compz_v_4x4.json' with { type: 'json' };
import n0 from './fixtures/n0.json' with { type: 'json' };
import n1_compz_i from './fixtures/n1_compz_i.json' with { type: 'json' };
import n1_compz_n from './fixtures/n1_compz_n.json' with { type: 'json' };
import n2_compz_i from './fixtures/n2_compz_i.json' with { type: 'json' };
import n6_compz_i from './fixtures/n6_compz_i.json' with { type: 'json' };
import compz_v_permuted from './fixtures/compz_v_permuted.json' with { type: 'json' };
import diagonal_compz_i from './fixtures/diagonal_compz_i.json' with { type: 'json' };
import n2_compz_n from './fixtures/n2_compz_n.json' with { type: 'json' };
import n3_varying_compz_i from './fixtures/n3_varying_compz_i.json' with { type: 'json' };

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
*
* @private
* @param {Float64Array} Z - eigenvector matrix (col-major, N x N)
* @param {integer} N - order
* @param {number} tol - tolerance
* @param {string} msg - message prefix
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
				val += Z[ k + (i * N) ] * Z[ k + (j * N) ];
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
* Verifies the eigendecomposition T \* Z = Z \* diag(d).
*
* @private
* @param {Float64Array} Z - eigenvector matrix (col-major, N x N)
* @param {Float64Array} d - eigenvalues (length N)
* @param {Array} origD - original diagonal (length N)
* @param {Array} origE - original subdiagonal (length N-1)
* @param {integer} N - order
* @param {number} tol - tolerance
* @param {string} msg - message prefix
*/
function assertEigendecomp( Z, d, origD, origE, N, tol, msg ) {
	var tzk;
	var dzk;
	var err;
	var i;
	var j;
	for ( j = 0; j < N; j++ ) {
		for ( i = 0; i < N; i++ ) {
			// (T * z_j)[i] = origD[i]*Z[i,j] + origE[i]*Z[i+1,j] + origE[i-1]*Z[i-1,j]
			tzk = origD[ i ] * Z[ i + (j * N) ];
			if ( i < N - 1 ) {
				tzk += origE[ i ] * Z[ ( i + 1 ) + (j * N) ];
			}
			if ( i > 0 ) {
				tzk += origE[ i - 1 ] * Z[ ( i - 1 ) + (j * N) ];
			}
			dzk = d[ j ] * Z[ i + (j * N) ];
			err = Math.abs( tzk - dzk );
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

test( 'dpteqr: COMPZ=N, eigenvalues only, 4x4 SPD', function t() {
	var WORK;
	var info;
	var tc;
	var N;
	var d;
	var e;
	var Z;

	tc = compz_n_4x4;
	N = 4;
	d = new Float64Array( [ 4.0, 4.0, 4.0, 4.0 ] );
	e = new Float64Array( [ 1.0, 1.0, 1.0 ] );
	Z = new Float64Array( 1 );
	WORK = new Float64Array( 4 * N );
	info = dpteqr( 'none', N, d, 1, 0, e, 1, 0, Z, 1, N, 0, WORK, 1, 0 );
	assert.equal( info, tc.info );
	assertArrayClose( toArray( d ), tc.d, 1e-14, 'd' );
});

test( 'dpteqr: COMPZ=I, eigenvalues + eigenvectors, 4x4 SPD', function t() {
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
	origD = [ 4.0, 4.0, 4.0, 4.0 ];
	origE = [ 1.0, 1.0, 1.0 ];
	N = 4;
	d = new Float64Array( origD );
	e = new Float64Array( origE );
	Z = new Float64Array( N * N );
	WORK = new Float64Array( 4 * N );
	info = dpteqr( 'initialize', N, d, 1, 0, e, 1, 0, Z, 1, N, 0, WORK, 1, 0 );
	assert.equal( info, tc.info );
	assertArrayClose( toArray( d ), tc.d, 1e-14, 'd' );
	assertOrthogonal( Z, N, 1e-14, 'orthogonality' );
	assertEigendecomp( Z, d, origD, origE, N, 1e-13, 'eigendecomp' );
});

test( 'dpteqr: COMPZ=V, 4x4 SPD with identity Z', function t() {
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
	origD = [ 4.0, 4.0, 4.0, 4.0 ];
	origE = [ 1.0, 1.0, 1.0 ];
	N = 4;
	d = new Float64Array( origD );
	e = new Float64Array( origE );
	Z = new Float64Array( N * N );
	WORK = new Float64Array( 4 * N );
	for ( i = 0; i < N; i++ ) {
		Z[ i + (i * N) ] = 1.0;
	}
	info = dpteqr( 'update', N, d, 1, 0, e, 1, 0, Z, 1, N, 0, WORK, 1, 0 );
	assert.equal( info, tc.info );
	assertArrayClose( toArray( d ), tc.d, 1e-14, 'd' );
	assertOrthogonal( Z, N, 1e-14, 'orthogonality' );
	assertEigendecomp( Z, d, origD, origE, N, 1e-13, 'eigendecomp' );
});

test( 'dpteqr: N=0 edge case', function t() {
	var info;
	var tc = n0;

	info = dpteqr( 'none', 0, new Float64Array( 0 ), 1, 0, new Float64Array( 0 ), 1, 0, new Float64Array( 0 ), 1, 1, 0, new Float64Array( 0 ), 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, tc.info );
});

test( 'dpteqr: N=1, COMPZ=I', function t() {
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
	WORK = new Float64Array( 4 );
	info = dpteqr( 'initialize', N, d, 1, 0, e, 1, 0, Z, 1, 1, 0, WORK, 1, 0 );
	assert.equal( info, tc.info );
	assertArrayClose( toArray( d ), tc.d, 1e-14, 'd' );
	assertArrayClose( toArray( Z ), tc.z, 1e-14, 'z' );
});

test( 'dpteqr: N=1, COMPZ=N', function t() {
	var WORK;
	var info;
	var tc;
	var N;
	var d;
	var e;
	var Z;

	tc = n1_compz_n;
	N = 1;
	d = new Float64Array( [ 7.0 ] );
	e = new Float64Array( 0 );
	Z = new Float64Array( 1 );
	WORK = new Float64Array( 4 );
	info = dpteqr( 'none', N, d, 1, 0, e, 1, 0, Z, 1, 1, 0, WORK, 1, 0 );
	assert.equal( info, tc.info );
	assertArrayClose( toArray( d ), tc.d, 1e-14, 'd' );
});

test( 'dpteqr: N=2, COMPZ=I', function t() {
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
	origD = [ 3.0, 3.0 ];
	origE = [ 0.5 ];
	N = 2;
	d = new Float64Array( origD );
	e = new Float64Array( origE );
	Z = new Float64Array( N * N );
	WORK = new Float64Array( 4 * N );
	info = dpteqr( 'initialize', N, d, 1, 0, e, 1, 0, Z, 1, N, 0, WORK, 1, 0 );
	assert.equal( info, tc.info );
	assertArrayClose( toArray( d ), tc.d, 1e-14, 'd' );
	assertOrthogonal( Z, N, 1e-14, 'orthogonality' );
	assertEigendecomp( Z, d, origD, origE, N, 1e-13, 'eigendecomp' );
});

test( 'dpteqr: 6x6 SPD tridiagonal, COMPZ=I', function t() {
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
	origD = [ 5.0, 5.0, 5.0, 5.0, 5.0, 5.0 ];
	origE = [ 1.0, 0.5, 0.25, 0.125, 2.0 ];
	N = 6;
	d = new Float64Array( origD );
	e = new Float64Array( origE );
	Z = new Float64Array( N * N );
	WORK = new Float64Array( 4 * N );
	info = dpteqr( 'initialize', N, d, 1, 0, e, 1, 0, Z, 1, N, 0, WORK, 1, 0 );
	assert.equal( info, tc.info );
	assertArrayClose( toArray( d ), tc.d, 1e-13, 'd' );
	assertOrthogonal( Z, N, 1e-13, 'orthogonality' );
	assertEigendecomp( Z, d, origD, origE, N, 1e-12, 'eigendecomp' );
});

test( 'dpteqr: COMPZ=V, 4x4 SPD with permuted Z', function t() {
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
	origD = [ 4.0, 4.0, 4.0, 4.0 ];
	origE = [ 1.0, 1.0, 1.0 ];
	N = 4;
	d = new Float64Array( origD );
	e = new Float64Array( origE );
	Z = new Float64Array( N * N );
	WORK = new Float64Array( 4 * N );
	Z[ 0 + (1 * N) ] = 1.0;
	Z[ 1 + (0 * N) ] = 1.0;
	Z[ 2 + (2 * N) ] = 1.0;
	Z[ 3 + (3 * N) ] = 1.0;
	info = dpteqr( 'update', N, d, 1, 0, e, 1, 0, Z, 1, N, 0, WORK, 1, 0 );
	assert.equal( info, tc.info );
	assertArrayClose( toArray( d ), tc.d, 1e-14, 'd' );
	assertOrthogonal( Z, N, 1e-14, 'orthogonality' );
});

test( 'dpteqr: already-diagonal SPD matrix, COMPZ=I', function t() {
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
	WORK = new Float64Array( 4 * N );
	info = dpteqr( 'initialize', N, d, 1, 0, e, 1, 0, Z, 1, N, 0, WORK, 1, 0 );
	assert.equal( info, tc.info );
	assertArrayClose( toArray( d ), tc.d, 1e-14, 'd' );
	assertOrthogonal( Z, N, 1e-14, 'orthogonality' );
	assertEigendecomp( Z, d, origD, origE, N, 1e-13, 'eigendecomp' );
});

test( 'dpteqr: N=2, COMPZ=N', function t() {
	var WORK;
	var info;
	var tc;
	var N;
	var d;
	var e;
	var Z;

	tc = n2_compz_n;
	N = 2;
	d = new Float64Array( [ 3.0, 3.0 ] );
	e = new Float64Array( [ 0.5 ] );
	Z = new Float64Array( 1 );
	WORK = new Float64Array( 4 * N );
	info = dpteqr( 'none', N, d, 1, 0, e, 1, 0, Z, 1, N, 0, WORK, 1, 0 );
	assert.equal( info, tc.info );
	assertArrayClose( toArray( d ), tc.d, 1e-14, 'd' );
});

test( 'dpteqr: N=3, varying diagonal, COMPZ=I', function t() {
	var origD;
	var origE;
	var WORK;
	var info;
	var tc;
	var N;
	var d;
	var e;
	var Z;

	tc = n3_varying_compz_i;
	origD = [ 10.0, 8.0, 6.0 ];
	origE = [ 2.0, 1.0 ];
	N = 3;
	d = new Float64Array( origD );
	e = new Float64Array( origE );
	Z = new Float64Array( N * N );
	WORK = new Float64Array( 4 * N );
	info = dpteqr( 'initialize', N, d, 1, 0, e, 1, 0, Z, 1, N, 0, WORK, 1, 0 );
	assert.equal( info, tc.info );
	assertArrayClose( toArray( d ), tc.d, 1e-14, 'd' );
	assertOrthogonal( Z, N, 1e-14, 'orthogonality' );
	assertEigendecomp( Z, d, origD, origE, N, 1e-13, 'eigendecomp' );
});

test( 'dpteqr: throws TypeError for invalid compz', function t() {
	var WORK;
	var N;
	var d;
	var e;
	var Z;

	N = 2;
	d = new Float64Array( [ 3.0, 3.0 ] );
	e = new Float64Array( [ 0.5 ] );
	Z = new Float64Array( N * N );
	WORK = new Float64Array( 4 * N );
	assert.throws( function () {
		dpteqr( 'invalid', N, d, 1, 0, e, 1, 0, Z, 1, N, 0, WORK, 1, 0 );
	}, TypeError );
});
