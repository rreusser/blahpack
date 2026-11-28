/* eslint-disable no-restricted-syntax */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dsteqr from './../lib/strided.js';

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
	assert.equal( actual.length, expected.length, msg + ': length mismatch' );
	for ( i = 0; i < expected.length; i++ ) {
		assertClose( actual[ i ], expected[ i ], tol, msg + '[' + i + ']' );
	}
}

/**
* Verifies Z^T * Z = I (orthogonality of eigenvectors).
*/
function assertOrthogonal( Z, N, tol, msg ) {
	let val, i, j, k;
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
	let Tz_k, dz_k, err, i, j;
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
	const out = [];
	let i;
	for ( i = 0; i < arr.length; i++ ) {
		out.push( arr[ i ] );
	}
	return out;
}

// TESTS //

test( 'dsteqr: COMPZ=I, 4x4 tridiagonal matrix', function t() {

	const tc = compz_i_4x4;
	const origD = [ 2.0, 2.0, 2.0, 2.0 ];
	const origE = [ 1.0, 1.0, 1.0 ];
	const N = 4;
	const d = new Float64Array( origD );
	const e = new Float64Array( origE );
	const Z = new Float64Array( N * N );
	const WORK = new Float64Array( 2 * ( N - 1 ) );
	const info = dsteqr( 'initialize', N, d, 1, 0, e, 1, 0, Z, 1, N, 0, WORK, 1, 0 );
	assert.equal( info, tc.info );
	assertArrayClose( toArray( d ), tc.d, 1e-14, 'd' );
	assertOrthogonal( Z, N, 1e-14, 'orthogonality' );
	assertEigendecomp( Z, d, origD, origE, N, 1e-13, 'eigendecomp' );
});

test( 'dsteqr: COMPZ=V, 4x4 with identity Z', function t() {
	let i;

	const tc = compz_v_4x4;
	const origD = [ 2.0, 2.0, 2.0, 2.0 ];
	const origE = [ 1.0, 1.0, 1.0 ];
	const N = 4;
	const d = new Float64Array( origD );
	const e = new Float64Array( origE );
	const Z = new Float64Array( N * N );
	const WORK = new Float64Array( 2 * ( N - 1 ) );
	for ( i = 0; i < N; i++ ) {
		Z[ i + i * N ] = 1.0;
	}
	const info = dsteqr( 'update', N, d, 1, 0, e, 1, 0, Z, 1, N, 0, WORK, 1, 0 );
	assert.equal( info, tc.info );
	assertArrayClose( toArray( d ), tc.d, 1e-14, 'd' );
	assertOrthogonal( Z, N, 1e-14, 'orthogonality' );
	assertEigendecomp( Z, d, origD, origE, N, 1e-13, 'eigendecomp' );
});

test( 'dsteqr: COMPZ=N, eigenvalues only', function t() {

	const tc = compz_n_4x4;
	const N = 4;
	const d = new Float64Array( [ 2.0, 2.0, 2.0, 2.0 ] );
	const e = new Float64Array( [ 1.0, 1.0, 1.0 ] );
	const Z = new Float64Array( 1 );
	const WORK = new Float64Array( 1 );
	const info = dsteqr( 'none', N, d, 1, 0, e, 1, 0, Z, 1, N, 0, WORK, 1, 0 );
	assert.equal( info, tc.info );
	assertArrayClose( toArray( d ), tc.d, 1e-14, 'd' );
});

test( 'dsteqr: N=1, COMPZ=I', function t() {

	const tc = n1_compz_i;
	const N = 1;
	const d = new Float64Array( [ 5.0 ] );
	const e = new Float64Array( 0 );
	const Z = new Float64Array( 1 );
	const WORK = new Float64Array( 1 );
	const info = dsteqr( 'initialize', N, d, 1, 0, e, 1, 0, Z, 1, 1, 0, WORK, 1, 0 );
	assert.equal( info, tc.info );
	assertArrayClose( toArray( d ), tc.d, 1e-14, 'd' );
	assertArrayClose( toArray( Z ), tc.z, 1e-14, 'z' );
});

test( 'dsteqr: N=2, COMPZ=I', function t() {

	const tc = n2_compz_i;
	const origD = [ 3.0, 1.0 ];
	const origE = [ 2.0 ];
	const N = 2;
	const d = new Float64Array( origD );
	const e = new Float64Array( origE );
	const Z = new Float64Array( N * N );
	const WORK = new Float64Array( 2 );
	const info = dsteqr( 'initialize', N, d, 1, 0, e, 1, 0, Z, 1, N, 0, WORK, 1, 0 );
	assert.equal( info, tc.info );
	assertArrayClose( toArray( d ), tc.d, 1e-14, 'd' );
	assertOrthogonal( Z, N, 1e-14, 'orthogonality' );
	assertEigendecomp( Z, d, origD, origE, N, 1e-13, 'eigendecomp' );
});

test( 'dsteqr: N=0 edge case', function t() {
	const tc = n0;

	const info = dsteqr( 'initialize', 0, new Float64Array( 0 ), 1, 0, new Float64Array( 0 ), 1, 0, new Float64Array( 0 ), 1, 1, 0, new Float64Array( 0 ), 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, tc.info );
});

test( 'dsteqr: already-diagonal matrix, COMPZ=I', function t() {

	const tc = diagonal_compz_i;
	const origD = [ 4.0, 1.0, 3.0, 2.0 ];
	const origE = [ 0.0, 0.0, 0.0 ];
	const N = 4;
	const d = new Float64Array( origD );
	const e = new Float64Array( origE );
	const Z = new Float64Array( N * N );
	const WORK = new Float64Array( 2 * ( N - 1 ) );
	const info = dsteqr( 'initialize', N, d, 1, 0, e, 1, 0, Z, 1, N, 0, WORK, 1, 0 );
	assert.equal( info, tc.info );
	assertArrayClose( toArray( d ), tc.d, 1e-14, 'd' );
	assertOrthogonal( Z, N, 1e-14, 'orthogonality' );
	assertEigendecomp( Z, d, origD, origE, N, 1e-13, 'eigendecomp' );
});

test( 'dsteqr: 6x6 matrix, COMPZ=I', function t() {

	const tc = n6_compz_i;
	const origD = [ 4.0, 3.0, 2.0, 1.0, 5.0, 6.0 ];
	const origE = [ 1.0, 0.5, 0.25, 0.125, 2.0 ];
	const N = 6;
	const d = new Float64Array( origD );
	const e = new Float64Array( origE );
	const Z = new Float64Array( N * N );
	const WORK = new Float64Array( 2 * ( N - 1 ) );
	const info = dsteqr( 'initialize', N, d, 1, 0, e, 1, 0, Z, 1, N, 0, WORK, 1, 0 );
	assert.equal( info, tc.info );
	assertArrayClose( toArray( d ), tc.d, 1e-13, 'd' );
	assertOrthogonal( Z, N, 1e-13, 'orthogonality' );
	assertEigendecomp( Z, d, origD, origE, N, 1e-12, 'eigendecomp' );
});

test( 'dsteqr: COMPZ=V, 4x4 with permuted Z', function t() {

	const tc = compz_v_permuted;
	const origD = [ 2.0, 2.0, 2.0, 2.0 ];
	const origE = [ 1.0, 1.0, 1.0 ];
	const N = 4;
	const d = new Float64Array( origD );
	const e = new Float64Array( origE );
	const Z = new Float64Array( N * N );
	const WORK = new Float64Array( 2 * ( N - 1 ) );
	Z[ 0 + 1 * N ] = 1.0;
	Z[ 1 + 0 * N ] = 1.0;
	Z[ 2 + 2 * N ] = 1.0;
	Z[ 3 + 3 * N ] = 1.0;
	const info = dsteqr( 'update', N, d, 1, 0, e, 1, 0, Z, 1, N, 0, WORK, 1, 0 );
	assert.equal( info, tc.info );
	assertArrayClose( toArray( d ), tc.d, 1e-14, 'd' );
	assertOrthogonal( Z, N, 1e-14, 'orthogonality' );
});

test( 'dsteqr: N=2, COMPZ=N', function t() {

	const tc = n2_compz_n;
	const N = 2;
	const d = new Float64Array( [ 3.0, 1.0 ] );
	const e = new Float64Array( [ 2.0 ] );
	const Z = new Float64Array( 1 );
	const WORK = new Float64Array( 1 );
	const info = dsteqr( 'none', N, d, 1, 0, e, 1, 0, Z, 1, N, 0, WORK, 1, 0 );
	assert.equal( info, tc.info );
	assertArrayClose( toArray( d ), tc.d, 1e-14, 'd' );
});

test( 'dsteqr: throws TypeError for invalid COMPZ', function t() {
	assert.throws( function () {
		dsteqr( 'X', 2, new Float64Array( 2 ), 1, 0, new Float64Array( 1 ), 1, 0, new Float64Array( 4 ), 1, 2, 0, new Float64Array( 2 ), 1, 0 ); // eslint-disable-line max-len
	}, TypeError );
});

test( 'dsteqr: QR iteration path - descending diagonal, COMPZ=I', function t() {
	let i;

	const origD = [ 10.0, 5.0, 1.0, 0.1 ];
	const origE = [ 1.0, 1.0, 1.0 ];
	const N = 4;
	const d = new Float64Array( origD );
	const e = new Float64Array( origE );
	const Z = new Float64Array( N * N );
	const WORK = new Float64Array( 2 * ( N - 1 ) );
	const info = dsteqr( 'initialize', N, d, 1, 0, e, 1, 0, Z, 1, N, 0, WORK, 1, 0 );
	assert.equal( info, 0 );
	assertOrthogonal( Z, N, 1e-13, 'orthogonality' );
	assertEigendecomp( Z, d, origD, origE, N, 1e-12, 'eigendecomp' );
	for ( i = 0; i < N - 1; i++ ) {
		assert.ok( d[ i ] <= d[ i + 1 ], 'eigenvalues ascending: d[' + i + ']=' + d[ i ] + ' <= d[' + ( i + 1 ) + ']=' + d[ i + 1 ] ); // eslint-disable-line max-len
	}
});

test( 'dsteqr: QR iteration path - descending diagonal, COMPZ=N', function t() {
	let i;

	const origD = [ 10.0, 5.0, 1.0, 0.1 ];
	const origE = [ 1.0, 1.0, 1.0 ];
	const N = 4;
	const d = new Float64Array( origD );
	const e = new Float64Array( origE );
	const Z = new Float64Array( 1 );
	const WORK = new Float64Array( 1 );
	const info = dsteqr( 'none', N, d, 1, 0, e, 1, 0, Z, 1, N, 0, WORK, 1, 0 );
	assert.equal( info, 0 );
	for ( i = 0; i < N - 1; i++ ) {
		assert.ok( d[ i ] <= d[ i + 1 ], 'eigenvalues ascending' );
	}
});

test( 'dsteqr: QR path with 2x2 subproblem, COMPZ=I', function t() {

	const origD = [ 100.0, 2.0, 0.01 ];
	const origE = [ 0.5, 0.5 ];
	const N = 3;
	const d = new Float64Array( origD );
	const e = new Float64Array( origE );
	const Z = new Float64Array( N * N );
	const WORK = new Float64Array( 2 * ( N - 1 ) );
	const info = dsteqr( 'initialize', N, d, 1, 0, e, 1, 0, Z, 1, N, 0, WORK, 1, 0 );
	assert.equal( info, 0 );
	assertOrthogonal( Z, N, 1e-13, 'orthogonality' );
	assertEigendecomp( Z, d, origD, origE, N, 1e-11, 'eigendecomp' );
});

test( 'dsteqr: QR path with 2x2 subproblem, COMPZ=N', function t() {
	let i;

	const origD = [ 100.0, 2.0, 0.01 ];
	const origE = [ 0.5, 0.5 ];
	const N = 3;
	const d = new Float64Array( origD );
	const e = new Float64Array( origE );
	const Z = new Float64Array( 1 );
	const WORK = new Float64Array( 1 );
	const info = dsteqr( 'none', N, d, 1, 0, e, 1, 0, Z, 1, N, 0, WORK, 1, 0 );
	assert.equal( info, 0 );
	for ( i = 0; i < N - 1; i++ ) {
		assert.ok( d[ i ] <= d[ i + 1 ], 'eigenvalues ascending' );
	}
});

test( 'dsteqr: matrix with very small off-diag elements triggers negligible E branch', function t() { // eslint-disable-line max-len
	let i;

	const N = 3;
	const origD = [ 1.0, 1.0, 1.0 ];
	const origE = [ 1e-17, 1e-17 ];
	const d = new Float64Array( origD );
	const e = new Float64Array( origE );
	const Z = new Float64Array( N * N );
	const WORK = new Float64Array( 2 * ( N - 1 ) );
	const info = dsteqr( 'initialize', N, d, 1, 0, e, 1, 0, Z, 1, N, 0, WORK, 1, 0 );
	assert.equal( info, 0 );
	for ( i = 0; i < N; i++ ) {
		assertClose( d[ i ], 1.0, 1e-14, 'd[' + i + ']' );
	}
});

test( 'dsteqr: very large values trigger ssfmax scaling', function t() {

	const N = 3;
	const bigVal = 1e154;
	const origD = [ 2.0 * bigVal, 2.0 * bigVal, 2.0 * bigVal ];
	const origE = [ 1.0 * bigVal, 1.0 * bigVal ];
	const d = new Float64Array( origD );
	const e = new Float64Array( origE );
	const Z = new Float64Array( N * N );
	const WORK = new Float64Array( 2 * ( N - 1 ) );
	const info = dsteqr( 'initialize', N, d, 1, 0, e, 1, 0, Z, 1, N, 0, WORK, 1, 0 );
	assert.equal( info, 0 );
	assertOrthogonal( Z, N, 1e-12, 'orthogonality' );
	assertClose( d[ 0 ] / bigVal, 2.0 - Math.sqrt( 2.0 ), 1e-12, 'scaled d[0]' );
	assertClose( d[ 1 ] / bigVal, 2.0, 1e-12, 'scaled d[1]' );
	assertClose( d[ 2 ] / bigVal, 2.0 + Math.sqrt( 2.0 ), 1e-12, 'scaled d[2]' );
});

test( 'dsteqr: very small values trigger ssfmin scaling', function t() {

	const N = 3;
	const smallVal = 1e-200;
	const origD = [ 2.0 * smallVal, 2.0 * smallVal, 2.0 * smallVal ];
	const origE = [ 1.0 * smallVal, 1.0 * smallVal ];
	const d = new Float64Array( origD );
	const e = new Float64Array( origE );
	const Z = new Float64Array( N * N );
	const WORK = new Float64Array( 2 * ( N - 1 ) );
	const info = dsteqr( 'initialize', N, d, 1, 0, e, 1, 0, Z, 1, N, 0, WORK, 1, 0 );
	assert.equal( info, 0 );
	assertOrthogonal( Z, N, 1e-12, 'orthogonality' );
	assertClose( d[ 0 ] / smallVal, 2.0 - Math.sqrt( 2.0 ), 1e-10, 'scaled d[0]' );
	assertClose( d[ 1 ] / smallVal, 2.0, 1e-10, 'scaled d[1]' );
	assertClose( d[ 2 ] / smallVal, 2.0 + Math.sqrt( 2.0 ), 1e-10, 'scaled d[2]' );
});

test( 'dsteqr: very large values trigger ssfmax scaling in QR path', function t() { // eslint-disable-line max-len

	const N = 3;
	const bigVal = 1e154;
	const origD = [ 10.0 * bigVal, 2.0 * bigVal, 0.1 * bigVal ];
	const origE = [ 1.0 * bigVal, 1.0 * bigVal ];
	const d = new Float64Array( origD );
	const e = new Float64Array( origE );
	const Z = new Float64Array( N * N );
	const WORK = new Float64Array( 2 * ( N - 1 ) );
	const info = dsteqr( 'initialize', N, d, 1, 0, e, 1, 0, Z, 1, N, 0, WORK, 1, 0 );
	assert.equal( info, 0 );
	assertOrthogonal( Z, N, 1e-11, 'orthogonality' );
});

test( 'dsteqr: block splitting - matrix with zero off-diagonal element', function t() { // eslint-disable-line max-len
	let i;

	const N = 4;
	const origD = [ 3.0, 1.0, 5.0, 2.0 ];
	const origE = [ 0.5, 0.0, 0.5 ];
	const d = new Float64Array( origD );
	const e = new Float64Array( origE );
	const Z = new Float64Array( N * N );
	const WORK = new Float64Array( 2 * ( N - 1 ) );
	const info = dsteqr( 'initialize', N, d, 1, 0, e, 1, 0, Z, 1, N, 0, WORK, 1, 0 );
	assert.equal( info, 0 );
	for ( i = 0; i < N - 1; i++ ) {
		assert.ok( d[ i ] <= d[ i + 1 ], 'eigenvalues ascending' );
	}
	assertOrthogonal( Z, N, 1e-14, 'orthogonality' );
	assertEigendecomp( Z, d, origD, origE, N, 1e-13, 'eigendecomp' );
});

test( 'dsteqr: NaN input exhausts NMAXIT and reports every unconverged off-diagonal in info', function t() { // eslint-disable-line max-len
	// A NaN never satisfies the deflation test, so the unreduced 4x4 block
	// iterates until JTOT = NMAXIT; INFO is then the count of nonzero E
	// entries, i.e. all N-1 = 3 of them (NaN != 0).
	const N = 4;
	const d = new Float64Array( [ 1.0, 2.0, 3.0, 4.0 ] );
	const e = new Float64Array( [ 1.0, NaN, 1.0 ] );
	const Z = new Float64Array( N * N );
	const WORK = new Float64Array( 2 * ( N - 1 ) );
	const info = dsteqr( 'initialize', N, d, 1, 0, e, 1, 0, Z, 1, N, 0, WORK, 1, 0 );
	assert.equal( info, N - 1, 'info' );
});

test( 'dsteqr: QR path undoes ssfmax/ssfmin scaling (homogeneity: eig(c*T) = c*eig(T))', function t() { // eslint-disable-line max-len
	// T = [3 1 0; 1 2 1; 0 1 1] has eigenvalues 2-sqrt(3), 2, 2+sqrt(3).
	// Since |d[N-1]| < |d[0]|, the QR branch is taken; for c = 1e300 the block
	// is scaled down (anorm > ssfmax) and for c = 1e-300 it is scaled up
	// (anorm < ssfmin). Every exit of the QR loop reaches label 140, which
	// must undo the scaling so the eigenvalues come back as c*eig(T).
	const lams = [ 2.0 - Math.sqrt( 3.0 ), 2.0, 2.0 + Math.sqrt( 3.0 ) ];
	const scales = [ 1.0e300, 1.0e-300 ];
	const N = 3;
	let origD, origE, WORK, info, c, d, e, Z, i, k;
	for ( k = 0; k < scales.length; k++ ) {
		c = scales[ k ];
		origD = [ 3.0 * c, 2.0 * c, 1.0 * c ];
		origE = [ 1.0 * c, 1.0 * c ];
		d = new Float64Array( origD );
		e = new Float64Array( origE );
		Z = new Float64Array( N * N );
		WORK = new Float64Array( 2 * ( N - 1 ) );
		info = dsteqr( 'initialize', N, d, 1, 0, e, 1, 0, Z, 1, N, 0, WORK, 1, 0 );
		assert.equal( info, 0, 'info' );
		for ( i = 0; i < N; i++ ) {
			assertClose( d[ i ] / c, lams[ i ], 1e-14, 'c=' + c + ': d[' + i + ']/c' );
		}
		assertOrthogonal( Z, N, 1e-14, 'c=' + c + ': orthogonality' );
		assertEigendecomp( Z, d, origD, origE, N, 1e-14 * c, 'c=' + c + ': residual' );
	}
});

test( 'dsteqr: a nonzero E below the split threshold starts the next block at the split (label 30: L = L1)', function t() { // eslint-disable-line max-len
	// |e[1]| = 1e-20 <= sqrt(|d[1]|)*sqrt(|d[2]|)*eps, so the split scan
	// zeroes it and leaves the loop at M = 2 (GO TO 30); the block [0..1] must
	// then start at L = L1 = 0 and be diagonalized: eig([1 1; 1 2]) and 3.
	const N = 3;
	const d = new Float64Array( [ 1.0, 2.0, 3.0 ] );
	const e = new Float64Array( [ 1.0, 1.0e-20 ] );
	const Z = new Float64Array( N * N );
	const WORK = new Float64Array( 2 * ( N - 1 ) );
	const info = dsteqr( 'initialize', N, d, 1, 0, e, 1, 0, Z, 1, N, 0, WORK, 1, 0 );
	assert.equal( info, 0, 'info' );
	assertArrayClose( Array.from( d ), [ ( 3.0 - Math.sqrt( 5.0 ) ) / 2.0, ( 3.0 + Math.sqrt( 5.0 ) ) / 2.0, 3.0 ], 1e-14, 'd' ); // eslint-disable-line max-len
	assertOrthogonal( Z, N, 1e-14, 'orthogonality' );
	assertEigendecomp( Z, d, [ 1.0, 2.0, 3.0 ], [ 1.0, 0.0 ], N, 1e-14, 'eigendecomp' ); // eslint-disable-line max-len
});

test( 'dsteqr: the QL and QR 1x1-deflation exits undo the block scaling (label 80/130 -> 140)', function t() { // eslint-disable-line max-len
	// c = 1e300 > ssfmax, so the block is scaled by ~4.5e-147. d = 0 next to
	// the tiny off-diagonal makes the split threshold 0, but the scaled
	// 1e-20 has E^2 <= SAFMIN, so the iteration deflates the 2x2 block first
	// (M = L+1) and then finishes with a converged 1x1 at L = LEND, whose
	// exit must still reach label 140 and undo the scaling.
	const c = 1.0e300;
	const r5 = Math.sqrt( 5.0 );
	const cases = [
		// QL (|d[2]| >= |d[0]|): rows 0-1 = c*[1 1; 1 0], row 2 = c
		[ [ c, 0.0, c ], [ c, 1.0e-20 ], [ ( 1.0 - r5 ) / 2.0, 1.0, ( 1.0 + r5 ) / 2.0 ] ], // eslint-disable-line max-len
		// QR (|d[2]| < |d[0]|): row 0 = 2c, rows 1-2 = c*[0 1; 1 1]
		[ [ 2.0 * c, 0.0, c ], [ 1.0e-20, c ], [ ( 1.0 - r5 ) / 2.0, ( 1.0 + r5 ) / 2.0, 2.0 ] ] // eslint-disable-line max-len
	];
	const N = 3;
	let WORK, info, d, e, Z, i, k;
	for ( k = 0; k < cases.length; k++ ) {
		d = new Float64Array( cases[ k ][ 0 ] );
		e = new Float64Array( cases[ k ][ 1 ] );
		Z = new Float64Array( N * N );
		WORK = new Float64Array( 2 * ( N - 1 ) );
		info = dsteqr( 'initialize', N, d, 1, 0, e, 1, 0, Z, 1, N, 0, WORK, 1, 0 );
		assert.equal( info, 0, 'info' );
		for ( i = 0; i < N; i++ ) {
			assertClose( d[ i ] / c, cases[ k ][ 2 ][ i ], 1e-14, 'case ' + k + ': d[' + i + ']/c' ); // eslint-disable-line max-len
		}
		assertOrthogonal( Z, N, 1e-14, 'case ' + k + ': orthogonality' );
	}
});

test( 'dsteqr: the iteration-limit exit (JTOT = NMAXIT) undoes the block scaling', function t() { // eslint-disable-line max-len
	// anorm = Inf > ssfmax, so DLASCL scales the block by ssfmax/Inf = 0:
	// d = 0, e = [0, NaN, NaN]. Row 0 deflates (e[0] = 0); rows 1-3 never
	// converge and exhaust NMAXIT. Label 140 then rescales by Inf/ssfmax
	// (multiplier Inf), which turns the converged zeros d[0] and e[0] into
	// NaN, so every E entry is nonzero: INFO = 3. Skipping it leaves INFO = 2.
	const N = 4;
	const d = new Float64Array( [ 1.0, 1.0, 1.0, 1.0 ] );
	const e = new Float64Array( [ 1.0, Infinity, Infinity ] );
	const Z = new Float64Array( N * N );
	const WORK = new Float64Array( 2 * ( N - 1 ) );
	const info = dsteqr( 'initialize', N, d, 1, 0, e, 1, 0, Z, 1, N, 0, WORK, 1, 0 );
	assert.equal( info, 3, 'info' );
	assert.ok( Number.isNaN( d[ 0 ] ), 'd[0] rescaled by Inf' );
	assert.ok( Number.isNaN( e[ 0 ] ), 'e[0] rescaled by Inf' );
});

test( 'dsteqr: the QR iteration-limit exit (JTOT = NMAXIT) undoes the block scaling', function t() { // eslint-disable-line max-len
	// anorm = 1e160 > ssfmax, so the block is scaled by ~2.2e-7, and
	// |d[3]| < |d[0]| selects QR. d[1] = 0 makes the deflation threshold for
	// e[1] SAFMIN (scaled |e[1]| ~ 2.2e-147 is above it), while the first
	// rotation has s ~ e[0]/g ~ 1e-250, so s*e[1] underflows and every QR
	// sweep is the identity: the block stalls until JTOT = NMAXIT and INFO = 3.
	// Label 140 must still undo the scaling, returning T at its own scale.
	const origD = [ 1.0e110, 0.0, -1.0e70, 1.0e-120 ];
	const origE = [ 1.0e-90, -1.0e-140, -1.0e160 ];
	const N = 4;
	const d = new Float64Array( origD );
	const e = new Float64Array( origE );
	const Z = new Float64Array( N * N );
	const WORK = new Float64Array( 2 * ( N - 1 ) );
	const info = dsteqr( 'initialize', N, d, 1, 0, e, 1, 0, Z, 1, N, 0, WORK, 1, 0 );
	assert.equal( info, 3, 'info' );
	assertArrayClose( Array.from( d ), origD, 1e-14, 'd' );
	assertArrayClose( Array.from( e ), origE, 1e-14, 'e' );
});
