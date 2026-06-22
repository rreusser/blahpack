/* eslint-disable no-restricted-syntax, stdlib/first-unit-test, max-lines */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import zpteqr from './../lib/ndarray.js';

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
* Verifies Z^H * Z = I (unitarity of eigenvectors) for complex Z.
*
* @private
* @param {Complex128Array} Z - eigenvector matrix (col-major, N x N)
* @param {integer} N - order
* @param {number} tol - tolerance
* @param {string} msg - message prefix
*/
function assertUnitary( Z, N, tol, msg ) {
	var valRe;
	var valIm;
	var Zv;
	var i;
	var j;
	var k;

	Zv = reinterpret( Z, 0 );
	for ( i = 0; i < N; i++ ) {
		for ( j = 0; j < N; j++ ) {
			// Compute (Z^H * Z)[i,j] = sum_k conj(Z[k,i]) * Z[k,j]
			valRe = 0.0;
			valIm = 0.0;
			for ( k = 0; k < N; k++ ) {
				// Z[k, i] at index (k + i*N), real part at 2*(k+i*N), imag at 2*(k+i*N)+1
				// conj(Z[k,i]) * Z[k,j]:
				// Re = re1*re2 + im1*im2 (conjugate flips sign of im1)
				// Im = re1*im2 - im1*re2
				valRe += ( Zv[ 2 * (k + (i * N)) ] * Zv[ 2 * (k + (j * N)) ] ) + ( Zv[ (2 * (k + (i * N))) + 1 ] * Zv[ (2 * (k + (j * N))) + 1 ] ); // eslint-disable-line max-len
				valIm += ( Zv[ 2 * (k + (i * N)) ] * Zv[ (2 * (k + (j * N))) + 1 ] ) - ( Zv[ (2 * (k + (i * N))) + 1 ] * Zv[ 2 * (k + (j * N)) ] ); // eslint-disable-line max-len
			}
			if ( i === j ) {
				assertClose( valRe, 1.0, tol, msg + ': Z^H*Z[' + i + ',' + j + '] real should be 1' ); // eslint-disable-line max-len
			} else {
				assert.ok( Math.abs( valRe ) <= tol, msg + ': Z^H*Z[' + i + ',' + j + '] real should be 0, got ' + valRe ); // eslint-disable-line max-len
			}
			assert.ok( Math.abs( valIm ) <= tol, msg + ': Z^H*Z[' + i + ',' + j + '] imag should be 0, got ' + valIm ); // eslint-disable-line max-len
		}
	}
}

/**
* Verifies the eigendecomposition `T*Z = Z*diag(d)` for complex Z.
*
* @private
* @param {Complex128Array} Z - eigenvector matrix (col-major, N x N)
* @param {Float64Array} d - eigenvalues (length N)
* @param {Array} origD - original diagonal (length N)
* @param {Array} origE - original subdiagonal (length N-1)
* @param {integer} N - order
* @param {number} tol - tolerance
* @param {string} msg - message prefix
*/
function assertEigendecomp( Z, d, origD, origE, N, tol, msg ) {
	var tzkRe;
	var tzkIm;
	var dzkRe;
	var dzkIm;
	var errRe;
	var errIm;
	var Zv;
	var i;
	var j;

	Zv = reinterpret( Z, 0 );
	for ( j = 0; j < N; j++ ) {
		for ( i = 0; i < N; i++ ) {
			// (T * z_j)[i] = origD[i]*Z[i,j] + origE[i]*Z[i+1,j] + origE[i-1]*Z[i-1,j]
			tzkRe = origD[ i ] * Zv[ 2 * ( i + (j * N) ) ];
			tzkIm = origD[ i ] * Zv[ ( 2 * ( i + (j * N) ) ) + 1 ];
			if ( i < N - 1 ) {
				tzkRe += origE[ i ] * Zv[ 2 * ( (i + 1) + (j * N) ) ];
				tzkIm += origE[ i ] * Zv[ ( 2 * ( (i + 1) + (j * N) ) ) + 1 ];
			}
			if ( i > 0 ) {
				tzkRe += origE[ i - 1 ] * Zv[ 2 * ( (i - 1) + (j * N) ) ];
				tzkIm += origE[ i - 1 ] * Zv[ (2 * ((i - 1) + (j * N))) + 1 ];
			}
			dzkRe = d[ j ] * Zv[ 2 * ( i + (j * N) ) ];
			dzkIm = d[ j ] * Zv[ ( 2 * ( i + (j * N) ) ) + 1 ];
			errRe = Math.abs( tzkRe - dzkRe );
			errIm = Math.abs( tzkIm - dzkIm );
			assert.ok( errRe <= tol, msg + ': T*z[' + i + ',' + j + '] re - d[' + j + ']*z[' + i + ',' + j + '] re = ' + errRe ); // eslint-disable-line max-len
			assert.ok( errIm <= tol, msg + ': T*z[' + i + ',' + j + '] im - d[' + j + ']*z[' + i + ',' + j + '] im = ' + errIm ); // eslint-disable-line max-len
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

test( 'zpteqr: COMPZ=N, eigenvalues only, 4x4 SPD', function t() {
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
	Z = new Complex128Array( 1 );
	WORK = new Float64Array( 4 * N );
	info = zpteqr( 'none', N, d, 1, 0, e, 1, 0, Z, 1, N, 0, WORK, 1, 0 );
	assert.equal( info, tc.info );
	assertArrayClose( toArray( d ), tc.d, 1e-14, 'd' );
});

test( 'zpteqr: COMPZ=I, eigenvalues + eigenvectors, 4x4 SPD', function t() {
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
	Z = new Complex128Array( N * N );
	WORK = new Float64Array( 4 * N );
	info = zpteqr( 'initialize', N, d, 1, 0, e, 1, 0, Z, 1, N, 0, WORK, 1, 0 );
	assert.equal( info, tc.info );
	assertArrayClose( toArray( d ), tc.d, 1e-14, 'd' );
	assertUnitary( Z, N, 1e-14, 'unitarity' );
	assertEigendecomp( Z, d, origD, origE, N, 1e-13, 'eigendecomp' );
});

test( 'zpteqr: COMPZ=V, 4x4 SPD with identity Z', function t() {
	var origD;
	var origE;
	var WORK;
	var info;
	var tc;
	var Zv;
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
	Z = new Complex128Array( N * N );
	WORK = new Float64Array( 4 * N );
	Zv = reinterpret( Z, 0 );
	for ( i = 0; i < N; i++ ) {
		// Set Z[i,i] = (1,0) in col-major: index i + i*N, real part at 2*(i+i*N)
		Zv[ 2 * (i + (i * N)) ] = 1.0;
	}
	info = zpteqr( 'update', N, d, 1, 0, e, 1, 0, Z, 1, N, 0, WORK, 1, 0 );
	assert.equal( info, tc.info );
	assertArrayClose( toArray( d ), tc.d, 1e-14, 'd' );
	assertUnitary( Z, N, 1e-14, 'unitarity' );
	assertEigendecomp( Z, d, origD, origE, N, 1e-13, 'eigendecomp' );
});

test( 'zpteqr: N=0 edge case', function t() {
	var info;
	var tc = n0;

	info = zpteqr( 'none', 0, new Float64Array( 0 ), 1, 0, new Float64Array( 0 ), 1, 0, new Complex128Array( 0 ), 1, 1, 0, new Float64Array( 0 ), 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, tc.info );
});

test( 'zpteqr: N=1, COMPZ=I', function t() {
	var WORK;
	var info;
	var tc;
	var Zv;
	var N;
	var d;
	var e;
	var Z;

	tc = n1_compz_i;
	N = 1;
	d = new Float64Array( [ 5.0 ] );
	e = new Float64Array( 0 );
	Z = new Complex128Array( 1 );
	WORK = new Float64Array( 4 );
	info = zpteqr( 'initialize', N, d, 1, 0, e, 1, 0, Z, 1, 1, 0, WORK, 1, 0 );
	assert.equal( info, tc.info );
	assertArrayClose( toArray( d ), tc.d, 1e-14, 'd' );
	Zv = reinterpret( Z, 0 );
	assertArrayClose( toArray( Zv ), tc.z, 1e-14, 'z' );
});

test( 'zpteqr: N=1, COMPZ=N', function t() {
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
	Z = new Complex128Array( 1 );
	WORK = new Float64Array( 4 );
	info = zpteqr( 'none', N, d, 1, 0, e, 1, 0, Z, 1, 1, 0, WORK, 1, 0 );
	assert.equal( info, tc.info );
	assertArrayClose( toArray( d ), tc.d, 1e-14, 'd' );
});

test( 'zpteqr: N=2, COMPZ=I', function t() {
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
	Z = new Complex128Array( N * N );
	WORK = new Float64Array( 4 * N );
	info = zpteqr( 'initialize', N, d, 1, 0, e, 1, 0, Z, 1, N, 0, WORK, 1, 0 );
	assert.equal( info, tc.info );
	assertArrayClose( toArray( d ), tc.d, 1e-14, 'd' );
	assertUnitary( Z, N, 1e-14, 'unitarity' );
	assertEigendecomp( Z, d, origD, origE, N, 1e-13, 'eigendecomp' );
});

test( 'zpteqr: 6x6 SPD tridiagonal, COMPZ=I', function t() {
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
	Z = new Complex128Array( N * N );
	WORK = new Float64Array( 4 * N );
	info = zpteqr( 'initialize', N, d, 1, 0, e, 1, 0, Z, 1, N, 0, WORK, 1, 0 );
	assert.equal( info, tc.info );
	assertArrayClose( toArray( d ), tc.d, 1e-13, 'd' );
	assertUnitary( Z, N, 1e-13, 'unitarity' );
	assertEigendecomp( Z, d, origD, origE, N, 1e-12, 'eigendecomp' );
});

test( 'zpteqr: COMPZ=V, 4x4 SPD with permuted Z', function t() {
	var origD;
	var origE;
	var WORK;
	var info;
	var tc;
	var Zv;
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
	Z = new Complex128Array( N * N );
	WORK = new Float64Array( 4 * N );
	Zv = reinterpret( Z, 0 );
	Zv[ 2 * (0 + (1 * N)) ] = 1.0;
	Zv[ 2 * (1 + (0 * N)) ] = 1.0;
	Zv[ 2 * (2 + (2 * N)) ] = 1.0;
	Zv[ 2 * (3 + (3 * N)) ] = 1.0;
	info = zpteqr( 'update', N, d, 1, 0, e, 1, 0, Z, 1, N, 0, WORK, 1, 0 );
	assert.equal( info, tc.info );
	assertArrayClose( toArray( d ), tc.d, 1e-14, 'd' );
	assertUnitary( Z, N, 1e-14, 'unitarity' );
});

test( 'zpteqr: already-diagonal SPD matrix, COMPZ=I', function t() {
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
	Z = new Complex128Array( N * N );
	WORK = new Float64Array( 4 * N );
	info = zpteqr( 'initialize', N, d, 1, 0, e, 1, 0, Z, 1, N, 0, WORK, 1, 0 );
	assert.equal( info, tc.info );
	assertArrayClose( toArray( d ), tc.d, 1e-14, 'd' );
	assertUnitary( Z, N, 1e-14, 'unitarity' );
	assertEigendecomp( Z, d, origD, origE, N, 1e-13, 'eigendecomp' );
});

test( 'zpteqr: N=2, COMPZ=N', function t() {
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
	Z = new Complex128Array( 1 );
	WORK = new Float64Array( 4 * N );
	info = zpteqr( 'none', N, d, 1, 0, e, 1, 0, Z, 1, N, 0, WORK, 1, 0 );
	assert.equal( info, tc.info );
	assertArrayClose( toArray( d ), tc.d, 1e-14, 'd' );
});

test( 'zpteqr: N=3, varying diagonal, COMPZ=I', function t() {
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
	Z = new Complex128Array( N * N );
	WORK = new Float64Array( 4 * N );
	info = zpteqr( 'initialize', N, d, 1, 0, e, 1, 0, Z, 1, N, 0, WORK, 1, 0 );
	assert.equal( info, tc.info );
	assertArrayClose( toArray( d ), tc.d, 1e-14, 'd' );
	assertUnitary( Z, N, 1e-14, 'unitarity' );
	assertEigendecomp( Z, d, origD, origE, N, 1e-13, 'eigendecomp' );
});

test( 'zpteqr: throws TypeError for invalid compz', function t() {
	var WORK;
	var N;
	var d;
	var e;
	var Z;

	N = 2;
	d = new Float64Array( [ 3.0, 3.0 ] );
	e = new Float64Array( [ 0.5 ] );
	Z = new Complex128Array( N * N );
	WORK = new Float64Array( 4 * N );
	assert.throws( function () {
		zpteqr( 'invalid', N, d, 1, 0, e, 1, 0, Z, 1, N, 0, WORK, 1, 0 );
	}, TypeError );
});
