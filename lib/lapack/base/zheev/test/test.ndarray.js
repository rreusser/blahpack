/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import zheev from './../lib/ndarray.js';

// FIXTURES //

import zheev_4x4_v_l from './fixtures/zheev_4x4_v_l.json' with { type: 'json' };
import zheev_4x4_v_u from './fixtures/zheev_4x4_v_u.json' with { type: 'json' };
import zheev_4x4_n_l from './fixtures/zheev_4x4_n_l.json' with { type: 'json' };
import zheev_3x3_v_l from './fixtures/zheev_3x3_v_l.json' with { type: 'json' };
import zheev_3x3_v_u from './fixtures/zheev_3x3_v_u.json' with { type: 'json' };
import zheev_1x1_v from './fixtures/zheev_1x1_v.json' with { type: 'json' };
import zheev_2x2_diag from './fixtures/zheev_2x2_diag.json' with { type: 'json' };
import zheev_3x3_n_u from './fixtures/zheev_3x3_n_u.json' with { type: 'json' };

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
* Build a 4x4 Hermitian test matrix (lower triangle stored).
* A = [[2, _, _, *],
*      [1+i, 3, _, _],
*      [0.5-0.5i, 2i, 4, *],
*      [0, 1-i, 0.5+0.5i, 5]]
*/
function make4x4Lower() {
	// Column-major interleaved real/imag, 4x4
	return new Float64Array([
		// Col 0
		2.0,
		0.0,       // (0,0)
		1.0,
		1.0,       // (1,0)
		0.5,
		-0.5,      // (2,0)
		0.0,
		0.0,       // (3,0)

		// Col 1
		0.0,
		0.0,       // (0,1) not referenced
		3.0,
		0.0,       // (1,1)
		0.0,
		2.0,       // (2,1)
		1.0,
		-1.0,      // (3,1)

		// Col 2
		0.0,
		0.0,       // (0,2) not referenced
		0.0,
		0.0,       // (1,2) not referenced
		4.0,
		0.0,       // (2,2)
		0.5,
		0.5,       // (3,2)

		// Col 3
		0.0,
		0.0,       // (0,3) not referenced
		0.0,
		0.0,       // (1,3) not referenced
		0.0,
		0.0,       // (2,3) not referenced
		5.0,
		0.0        // (3,3)
	]);
}

/**
* Build the same 4x4 Hermitian matrix with upper triangle stored.
*/
function make4x4Upper( ) {
	return new Float64Array([
		// Col 0
		2.0,
		0.0,       // (0,0)
		0.0,
		0.0,       // (1,0) not referenced
		0.0,
		0.0,       // (2,0)
		0.0,
		0.0,       // (3,0)

		// Col 1
		1.0,
		-1.0,      // (0,1) conj of (1,0)
		3.0,
		0.0,       // (1,1)
		0.0,
		0.0,       // (2,1) not referenced
		0.0,
		0.0,       // (3,1)

		// Col 2
		0.5,
		0.5,       // (0,2) conj of (2,0)
		0.0,
		-2.0,      // (1,2) conj of (2,1)
		4.0,
		0.0,       // (2,2)
		0.0,
		0.0,       // (3,2)

		// Col 3
		0.0,
		0.0,       // (0,3)
		1.0,
		1.0,       // (1,3) conj of (3,1)
		0.5,
		-0.5,      // (2,3) conj of (3,2)
		5.0,
		0.0        // (3,3)
	]);
}

/**
* Build a 3x3 Hermitian matrix (lower triangle stored).
* A = [[4, _, _],
*      [1-2i, 5, *],
*      [i, 2, 6]]
*/
function make3x3Lower( ) {
	return new Float64Array([
		// Col 0
		4.0,
		0.0,       // (0,0)
		1.0,
		-2.0,      // (1,0)
		0.0,
		1.0,       // (2,0)

		// Col 1
		0.0,
		0.0,       // (0,1) not referenced
		5.0,
		0.0,       // (1,1)
		2.0,
		0.0,       // (2,1)

		// Col 2
		0.0,
		0.0,       // (0,2) not referenced
		0.0,
		0.0,       // (1,2) not referenced
		6.0,
		0.0        // (2,2)
	]);
}

/**
* Build the same 3x3 Hermitian matrix (upper triangle stored).
*/
function make3x3Upper( ) {
	return new Float64Array([
		// Col 0
		4.0,
		0.0,       // (0,0)
		0.0,
		0.0,       // (1,0) not referenced
		0.0,
		0.0,       // (2,0)

		// Col 1
		1.0,
		2.0,       // (0,1) conj of (1,0)
		5.0,
		0.0,       // (1,1)
		0.0,
		0.0,       // (2,1)

		// Col 2
		0.0,
		-1.0,      // (0,2) conj of (2,0)
		2.0,
		0.0,       // (1,2) conj of (2,1)
		6.0,
		0.0        // (2,2)
	]);
}

/**
* Build the full 4x4 Hermitian matrix (all elements) for verification.
*/
function makeFull4x4( ) {
	return new Float64Array([
		// Col 0
		2.0,
		0.0,       // (0,0)
		1.0,
		1.0,       // (1,0)
		0.5,
		-0.5,      // (2,0)
		0.0,
		0.0,       // (3,0)

		// Col 1
		1.0,
		-1.0,      // (0,1)
		3.0,
		0.0,       // (1,1)
		0.0,
		2.0,       // (2,1)
		1.0,
		-1.0,      // (3,1)

		// Col 2
		0.5,
		0.5,       // (0,2)
		0.0,
		-2.0,      // (1,2)
		4.0,
		0.0,       // (2,2)
		0.5,
		0.5,       // (3,2)

		// Col 3
		0.0,
		0.0,       // (0,3)
		1.0,
		1.0,       // (1,3)
		0.5,
		-0.5,      // (2,3)
		5.0,
		0.0        // (3,3)
	]);
}

/**
* Build the full 3x3 Hermitian matrix for verification.
*/
function makeFull3x3( ) {
	return new Float64Array([
		// Col 0
		4.0,
		0.0,       // (0,0)
		1.0,
		-2.0,      // (1,0)
		0.0,
		1.0,       // (2,0)

		// Col 1
		1.0,
		2.0,       // (0,1)
		5.0,
		0.0,       // (1,1)
		2.0,
		0.0,       // (2,1)

		// Col 2
		0.0,
		-1.0,      // (0,2)
		2.0,
		0.0,       // (1,2)
		6.0,
		0.0        // (2,2)
	]);
}

/**
* Verify A _ Z = Z _ diag(W) for each eigenpair.
* A is the original matrix (full, column-major, interleaved).
* Z is the eigenvector matrix (column-major, interleaved).
* W is the eigenvalue array (real).
* N is the matrix order.
*/
function verifyEigenpairs( Afull, Z, W, N, tol, msg ) {
	var azRe;
	var azIm;
	var zwRe;
	var zwIm;
	var norm;
	var err;
	var i;
	var j;
	var k;

	for ( j = 0; j < N; j++ ) {
		norm = 0.0;
		err = 0.0;
		for ( i = 0; i < N; i++ ) {
			// Compute (A * Z[:,j])[i] = sum_k A[i,k] * Z[k,j]
			azRe = 0.0;
			azIm = 0.0;
			for ( k = 0; k < N; k++ ) {
				// A[i,k]: column-major, interleaved
				var aRe = Afull[ (k * N + i) * 2 ];
				var aIm = Afull[ (k * N + i) * 2 + 1 ];
				var zRe = Z[ (j * N + k) * 2 ];
				var zIm = Z[ (j * N + k) * 2 + 1 ];
				azRe += aRe * zRe - aIm * zIm;
				azIm += aRe * zIm + aIm * zRe;
			}
			// w[j] * Z[i,j]
			zwRe = W[j] * Z[ (j * N + i) * 2 ];
			zwIm = W[j] * Z[ (j * N + i) * 2 + 1 ];
			err += (azRe - zwRe) * (azRe - zwRe) + (azIm - zwIm) * (azIm - zwIm);
			norm += azRe * azRe + azIm * azIm;
		}
		err = Math.sqrt( err );
		norm = Math.sqrt( norm );
		assert.ok( err / Math.max(norm, 1.0) < tol, msg + ': eigenpair ' + j + ' residual ' + (err / Math.max(norm, 1.0)) ); // eslint-disable-line max-len
	}
}

/**
* Verify Z^H * Z = I (orthonormality) for complex matrix Z.
* Z is column-major, interleaved, N x N.
*/
function verifyOrthonormality( Z, N, tol, msg ) {
	var dotRe;
	var dotIm;
	var expRe;
	var i;
	var j;
	var k;

	for ( i = 0; i < N; i++ ) {
		for ( j = 0; j < N; j++ ) {
			dotRe = 0.0;
			dotIm = 0.0;
			for ( k = 0; k < N; k++ ) {
				// Z^H[i,k] * Z[k,j] = conj(Z[k,i]) * Z[k,j]
				var ziRe = Z[ (i * N + k) * 2 ];
				var ziIm = Z[ (i * N + k) * 2 + 1 ];
				var zjRe = Z[ (j * N + k) * 2 ];
				var zjIm = Z[ (j * N + k) * 2 + 1 ];

				// conj(zi) * zj = (ziRe - ziIm*i)(zjRe + zjIm*i)
				dotRe += ziRe * zjRe + ziIm * zjIm;
				dotIm += ziRe * zjIm - ziIm * zjRe;
			}
			expRe = ( i === j ) ? 1.0 : 0.0;
			assert.ok( Math.abs(dotRe - expRe) < tol && Math.abs(dotIm) < tol, msg + ': Z^H*Z[' + i + ',' + j + '] = (' + dotRe + ',' + dotIm + '), expected (' + expRe + ',0)' ); // eslint-disable-line max-len
		}
	}
}

/**
* Helper: call zheev with standard parameters.
*/
function callZheev( jobz, uplo, N, Adata, W ) {
	var rworkLen = Math.max( 1, 3 * N - 2 );
	var lwork = Math.max( 1, ( 32 + 1 ) * N );
	var RWORK = new Float64Array( rworkLen );
	var WORK = new Complex128Array( lwork );
	var info;
	var A = new Complex128Array( Adata.buffer.slice(0) );

	info = zheev( jobz, uplo, N, A, 1, N, 0, W, 1, 0, WORK, 1, 0, lwork, RWORK, 1, 0 ); // eslint-disable-line max-len
	return {
		'info': info,
		'A': new Float64Array( A.buffer ),
		'W': W
	};
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

test( 'zheev: 4x4 JOBZ=V UPLO=L', function t() {
	var result;
	var Afull;
	var tc;
	var W;

	tc = zheev_4x4_v_l;
	Afull = makeFull4x4();
	W = new Float64Array( 4 );
	result = callZheev( 'compute-vectors', 'lower', 4, make4x4Lower(), W );
	assert.equal( result.info, 0, 'info=0' );
	assertArrayClose( toArray( result.W), tc.w, 1e-13, 'eigenvalues' );
	verifyEigenpairs( Afull, result.A, result.W, 4, 1e-12, 'AZ=ZW' );
	verifyOrthonormality( result.A, 4, 1e-12, 'Z^H*Z=I' );
});

test( 'zheev: 4x4 JOBZ=V UPLO=U', function t() {
	var result;
	var Afull;
	var tc;
	var W;

	tc = zheev_4x4_v_u;
	Afull = makeFull4x4();
	W = new Float64Array( 4 );
	result = callZheev( 'compute-vectors', 'upper', 4, make4x4Upper(), W );
	assert.equal( result.info, 0, 'info=0' );
	assertArrayClose( toArray( result.W), tc.w, 1e-13, 'eigenvalues' );
	verifyEigenpairs( Afull, result.A, result.W, 4, 1e-12, 'AZ=ZW' );
	verifyOrthonormality( result.A, 4, 1e-12, 'Z^H*Z=I' );
});

test( 'zheev: 4x4 JOBZ=N UPLO=L (eigenvalues only)', function t() {
	var result;
	var tc;
	var W;

	tc = zheev_4x4_n_l;
	W = new Float64Array( 4 );
	result = callZheev( 'no-vectors', 'lower', 4, make4x4Lower(), W );
	assert.equal( result.info, 0, 'info=0' );
	assertArrayClose( toArray( result.W), tc.w, 1e-13, 'eigenvalues' );
});

test( 'zheev: 3x3 JOBZ=V UPLO=L', function t() {
	var result;
	var Afull;
	var tc;
	var W;

	tc = zheev_3x3_v_l;
	Afull = makeFull3x3();
	W = new Float64Array( 3 );
	result = callZheev( 'compute-vectors', 'lower', 3, make3x3Lower(), W );
	assert.equal( result.info, 0, 'info=0' );
	assertArrayClose( toArray( result.W), tc.w, 1e-13, 'eigenvalues' );
	verifyEigenpairs( Afull, result.A, result.W, 3, 1e-12, 'AZ=ZW' );
	verifyOrthonormality( result.A, 3, 1e-12, 'Z^H*Z=I' );
});

test( 'zheev: 3x3 JOBZ=V UPLO=U', function t() {
	var result;
	var Afull;
	var tc;
	var W;

	tc = zheev_3x3_v_u;
	Afull = makeFull3x3();
	W = new Float64Array( 3 );
	result = callZheev( 'compute-vectors', 'upper', 3, make3x3Upper(), W );
	assert.equal( result.info, 0, 'info=0' );
	assertArrayClose( toArray( result.W), tc.w, 1e-13, 'eigenvalues' );
	verifyEigenpairs( Afull, result.A, result.W, 3, 1e-12, 'AZ=ZW' );
	verifyOrthonormality( result.A, 3, 1e-12, 'Z^H*Z=I' );
});

test( 'zheev: N=1 JOBZ=V', function t() {
	var result;
	var Adata;
	var tc;
	var W;

	tc = zheev_1x1_v;
	W = new Float64Array( 1 );
	Adata = new Float64Array([ 7.5, 0.0 ]);
	result = callZheev( 'compute-vectors', 'lower', 1, Adata, W );
	assert.equal( result.info, 0, 'info=0' );
	assertClose( result.W[0], 7.5, 1e-15, 'eigenvalue' );
	assertClose( result.A[0], 1.0, 1e-15, 'Z(0,0) real' );
	assertClose( result.A[1], 0.0, 1e-15, 'Z(0,0) imag' );
});

test( 'zheev: N=0', function t() {
	var RWORK;
	var WORK;
	var info;
	var W;
	var A;

	W = new Float64Array( 0 );
	A = new Complex128Array( 0 );
	WORK = new Complex128Array( 1 );
	RWORK = new Float64Array( 1 );
	info = zheev( 'compute-vectors', 'lower', 0, A, 1, 1, 0, W, 1, 0, WORK, 1, 0, 1, RWORK, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, 0, 'info=0' );
});

test( 'zheev: 2x2 diagonal JOBZ=V', function t() {
	var result;
	var Adata;
	var Afull;
	var tc;
	var W;

	tc = zheev_2x2_diag;
	W = new Float64Array( 2 );
	Adata = new Float64Array([
		3.0,
		0.0,  // (0,0)
		0.0,
		0.0,  // (1,0)
		0.0,
		0.0,  // (0,1)
		1.0,
		0.0   // (1,1)
	]);
	Afull = new Float64Array([
		3.0,
		0.0,  // (0,0)
		0.0,
		0.0,  // (1,0)
		0.0,
		0.0,  // (0,1)
		1.0,
		0.0   // (1,1)
	]);
	result = callZheev( 'compute-vectors', 'lower', 2, Adata, W );
	assert.equal( result.info, 0, 'info=0' );
	assertArrayClose( toArray( result.W), tc.w, 1e-14, 'eigenvalues' );
	verifyEigenpairs( Afull, result.A, result.W, 2, 1e-12, 'AZ=ZW' );
	verifyOrthonormality( result.A, 2, 1e-12, 'Z^H*Z=I' );
});

test( 'zheev: 3x3 JOBZ=N UPLO=U (eigenvalues only)', function t() {
	var result;
	var tc;
	var W;

	tc = zheev_3x3_n_u;
	W = new Float64Array( 3 );
	result = callZheev( 'no-vectors', 'upper', 3, make3x3Upper(), W );
	assert.equal( result.info, 0, 'info=0' );
	assertArrayClose( toArray( result.W), tc.w, 1e-13, 'eigenvalues' );
});
