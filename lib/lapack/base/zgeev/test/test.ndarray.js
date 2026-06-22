/* eslint-disable max-len, max-statements, no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import zgeev from './../lib/ndarray.js';

// FIXTURES //

import n1_eigvals_only from './fixtures/n1_eigvals_only.json' with { type: 'json' };
import n1_right from './fixtures/n1_right.json' with { type: 'json' };
import n2_diagonal_right from './fixtures/n2_diagonal_right.json' with { type: 'json' };
import n2_general_both from './fixtures/n2_general_both.json' with { type: 'json' };
import n3_right from './fixtures/n3_right.json' with { type: 'json' };
import n4_diagdom_both from './fixtures/n4_diagdom_both.json' with { type: 'json' };
import n2_left_only from './fixtures/n2_left_only.json' with { type: 'json' };

// FUNCTIONS //

/**
* Verify eigenvalues match fixture (order may differ, so sort both).
*/
function assertEigenvaluesClose( wv, expected, tol, msg ) {
	var actual = [];
	var expect = [];
	var N = expected.length / 2;
	var i;

	for ( i = 0; i < N; i++ ) {
		actual.push( [ wv[ 2 * i ], wv[ 2 * i + 1 ] ] );
		expect.push( [ expected[ 2 * i ], expected[ 2 * i + 1 ] ] );
	}

	// Sort by real part, then imaginary
	actual.sort( function cmp( a, b ) {
		return a[ 0 ] - b[ 0 ] || a[ 1 ] - b[ 1 ];
	} );
	expect.sort( function cmp( a, b ) {
		return a[ 0 ] - b[ 0 ] || a[ 1 ] - b[ 1 ];
	} );

	for ( i = 0; i < N; i++ ) {
		assert.ok(Math.abs( actual[ i ][ 0 ] - expect[ i ][ 0 ] ) < tol &&
			Math.abs( actual[ i ][ 1 ] - expect[ i ][ 1 ] ) < tol, msg + ': eigenvalue ' + i + ': expected (' + expect[ i ][ 0 ] + ',' + expect[ i ][ 1 ] + '), got (' + actual[ i ][ 0 ] + ',' + actual[ i ][ 1 ] + ')' // eslint-disable-line max-len
		);
	}
}

/**
* Verify A_v = lambda_v for right eigenvectors.
* A_orig is the original matrix (Float64Array interleaved, column-major).
*/
function assertRightEigenvectors( A_orig, N, wv, vrv, tol, msg ) {
	var av_re;
	var av_im;
	var vr_re;
	var vr_im;
	var err;
	var lr;
	var li;
	var sr;
	var si;
	var i;
	var j;
	var k;

	for ( j = 0; j < N; j++ ) {
		// Eigenvalue j
		lr = wv[ 2 * j ];
		li = wv[ 2 * j + 1 ];

		for ( i = 0; i < N; i++ ) {
			// Compute (A*v)_i = sum_k A(i,k)*v(k,j)
			av_re = 0.0;
			av_im = 0.0;
			for ( k = 0; k < N; k++ ) {
				// A(i,k) = A_orig[2*(i + k*N)], A_orig[2*(i + k*N)+1] (column-major)
				var are = A_orig[ 2 * ( i + k * N ) ];
				var aim = A_orig[ 2 * ( i + k * N ) + 1 ];
				var vre = vrv[ 2 * ( k + j * N ) ];
				var vim = vrv[ 2 * ( k + j * N ) + 1 ];
				av_re += are * vre - aim * vim;
				av_im += are * vim + aim * vre;
			}

			// Compute lambda*v(i,j)
			vr_re = vrv[ 2 * ( i + j * N ) ];
			vr_im = vrv[ 2 * ( i + j * N ) + 1 ];
			sr = lr * vr_re - li * vr_im;
			si = lr * vr_im + li * vr_re;

			err = Math.abs( av_re - sr ) + Math.abs( av_im - si );
			assert.ok( err < tol, msg + ': A*v != lambda*v at (' + i + ',' + j + '), err=' + err ); // eslint-disable-line max-len
		}
	}
}

/**
* Helper to create a Complex128Array from interleaved Float64 data.
*/
function makeComplex128Array( data ) {
	return new Complex128Array( new Float64Array( data ).buffer );
}

/**
* Helper to call zgeev with standard parameters.
*/
function callZgeev( jobvl, jobvr, N, A_data ) {
	var RWORK = new Float64Array( Math.max( 2 * N, 1 ) );
	var WORK = new Complex128Array( Math.max( 4 * N, 1 ) );
	var info;
	var VL = new Complex128Array( N * N );
	var VR = new Complex128Array( N * N );
	var w = new Complex128Array( N );
	var A = makeComplex128Array( A_data );

	info = zgeev( jobvl, jobvr, N, A, 1, N, 0, w, 1, 0, VL, 1, N, 0, VR, 1, N, 0, WORK, 1, 0, Math.max( 4 * N, 1 ), RWORK, 1, 0 ); // eslint-disable-line max-len

	return {
		'info': info,
		'w': reinterpret( w, 0 ),
		'VL': reinterpret( VL, 0 ),
		'VR': reinterpret( VR, 0 )
	};
}

// TESTS //

test( 'zgeev: N=0 quick return', function t() {
	var result = callZgeev( 'no-vectors', 'no-vectors', 0, [] );
	assert.equal( result.info, 0 );
});

test( 'zgeev: N=1 eigenvalues only', function t() {
	var result = callZgeev( 'no-vectors', 'no-vectors', 1, [ 3.0, 2.0 ] );
	var tc = n1_eigvals_only;
	assert.equal( result.info, 0 );
	assertEigenvaluesClose( result.w, tc.w, 1e-14, 'eigenvalues' );
});

test( 'zgeev: N=1 with right eigenvector', function t() {
	var result = callZgeev( 'no-vectors', 'compute-vectors', 1, [ 5.0, -1.0 ] );
	var tc = n1_right;
	assert.equal( result.info, 0 );
	assertEigenvaluesClose( result.w, tc.w, 1e-14, 'eigenvalues' );

	// Eigenvector should be (1,0)
	assert.ok( Math.abs( result.VR[ 0 ] - 1.0 ) < 1e-14 );
	assert.ok( Math.abs( result.VR[ 1 ] ) < 1e-14 );
});

test( 'zgeev: N=2 diagonal, right eigenvectors', function t() {
	var A_data;
	var result;
	var tc;

	tc = n2_diagonal_right;
	A_data = [ 1.0, 0.0, 0.0, 0.0, 0.0, 0.0, 2.0, 0.0 ];
	result = callZgeev( 'no-vectors', 'compute-vectors', 2, A_data );
	assert.equal( result.info, 0 );
	assertEigenvaluesClose( result.w, tc.w, 1e-14, 'eigenvalues' );
	assertRightEigenvectors( A_data, 2, result.w, result.VR, 1e-12, 'eigenvec' );
});

test( 'zgeev: N=2 general, both eigenvectors', function t() {
	var A_data;
	var result;
	var tc;

	tc = n2_general_both;
	A_data = [ 1.0, 2.0, 0.0, 1.0, 3.0, 0.0, 4.0, -1.0 ];
	result = callZgeev( 'compute-vectors', 'compute-vectors', 2, A_data );
	assert.equal( result.info, 0 );
	assertEigenvaluesClose( result.w, tc.w, 1e-12, 'eigenvalues' );
	assertRightEigenvectors( A_data, 2, result.w, result.VR, 1e-10, 'right eigenvec' ); // eslint-disable-line max-len
});

test( 'zgeev: N=3 right eigenvectors', function t() {
	var A_data;
	var result;
	var tc;

	tc = n3_right;
	A_data = [
		1.0,
		0.0,
		0.0,
		-1.0,
		0.0,
		0.0,   // col 0: (1,0), (0,-1), (0,0)
		2.0,
		1.0,
		3.0,
		0.0,
		0.0,
		0.0,     // col 1: (2+i), (3,0), (0,0)
		0.0,
		0.0,
		1.0,
		0.5,
		5.0,
		-2.0      // col 2: (0,0), (1+0.5i), (5-2i)
	];
	result = callZgeev( 'no-vectors', 'compute-vectors', 3, A_data );
	assert.equal( result.info, 0 );
	assertEigenvaluesClose( result.w, tc.w, 1e-12, 'eigenvalues' );
	assertRightEigenvectors( A_data, 3, result.w, result.VR, 1e-10, 'right eigenvec' ); // eslint-disable-line max-len
});

test( 'zgeev: N=4 diagonally dominant, both eigenvectors', function t() {
	var A_data;
	var result;
	var tc;

	tc = n4_diagdom_both;
	A_data = [
		10.0,
		0.0,
		0.5,
		-0.5,
		0.0,
		0.0,
		0.0,
		0.0,   // col 0
		1.0,
		0.5,
		20.0,
		0.0,
		0.0,
		1.0,
		0.0,
		0.0,     // col 1
		0.0,
		0.0,
		1.0,
		0.0,
		30.0,
		0.0,
		0.5,
		-0.5,    // col 2
		0.0,
		0.0,
		0.0,
		0.0,
		0.5,
		0.5,
		40.0,
		0.0      // col 3
	];
	result = callZgeev( 'compute-vectors', 'compute-vectors', 4, A_data );
	assert.equal( result.info, 0 );
	assertEigenvaluesClose( result.w, tc.w, 1e-10, 'eigenvalues' );
	assertRightEigenvectors( A_data, 4, result.w, result.VR, 1e-8, 'right eigenvec' ); // eslint-disable-line max-len
});

test( 'zgeev: N=2 left eigenvectors only', function t() {
	var A_data;
	var result;
	var tc;

	tc = n2_left_only;
	A_data = [ 2.0, 0.0, 0.0, 0.0, 1.0, 1.0, 3.0, 0.0 ];
	result = callZgeev( 'compute-vectors', 'no-vectors', 2, A_data );
	assert.equal( result.info, 0 );
	assertEigenvaluesClose( result.w, tc.w, 1e-14, 'eigenvalues' );
});
