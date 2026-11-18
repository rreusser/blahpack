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
	const actual = [];
	const expect = [];
	const N = expected.length / 2;
	let i;

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
	let av_re, av_im, vr_re, vr_im, err, lr, li, sr, si, i, j, k;

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
				const are = A_orig[ 2 * ( i + k * N ) ];
				const aim = A_orig[ 2 * ( i + k * N ) + 1 ];
				const vre = vrv[ 2 * ( k + j * N ) ];
				const vim = vrv[ 2 * ( k + j * N ) + 1 ];
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
	const RWORK = new Float64Array( Math.max( 2 * N, 1 ) );
	const WORK = new Complex128Array( Math.max( 4 * N, 1 ) );
	const VL = new Complex128Array( N * N );
	const VR = new Complex128Array( N * N );
	const w = new Complex128Array( N );
	const A = makeComplex128Array( A_data );

	const info = zgeev( jobvl, jobvr, N, A, 1, N, 0, w, 1, 0, VL, 1, N, 0, VR, 1, N, 0, WORK, 1, 0, RWORK, 1, 0 ); // eslint-disable-line max-len

	return {
		'info': info,
		'w': reinterpret( w, 0 ),
		'VL': reinterpret( VL, 0 ),
		'VR': reinterpret( VR, 0 )
	};
}

// TESTS //

test( 'zgeev: N=0 quick return', function t() {
	const result = callZgeev( 'no-vectors', 'no-vectors', 0, [] );
	assert.equal( result.info, 0 );
});

test( 'zgeev: N=1 eigenvalues only', function t() {
	const result = callZgeev( 'no-vectors', 'no-vectors', 1, [ 3.0, 2.0 ] );
	const tc = n1_eigvals_only;
	assert.equal( result.info, 0 );
	assertEigenvaluesClose( result.w, tc.w, 1e-14, 'eigenvalues' );
});

test( 'zgeev: N=1 with right eigenvector', function t() {
	const result = callZgeev( 'no-vectors', 'compute-vectors', 1, [ 5.0, -1.0 ] );
	const tc = n1_right;
	assert.equal( result.info, 0 );
	assertEigenvaluesClose( result.w, tc.w, 1e-14, 'eigenvalues' );

	// Eigenvector should be (1,0)
	assert.ok( Math.abs( result.VR[ 0 ] - 1.0 ) < 1e-14 );
	assert.ok( Math.abs( result.VR[ 1 ] ) < 1e-14 );
});

test( 'zgeev: N=2 diagonal, right eigenvectors', function t() {

	const tc = n2_diagonal_right;
	const A_data = [ 1.0, 0.0, 0.0, 0.0, 0.0, 0.0, 2.0, 0.0 ];
	const result = callZgeev( 'no-vectors', 'compute-vectors', 2, A_data );
	assert.equal( result.info, 0 );
	assertEigenvaluesClose( result.w, tc.w, 1e-14, 'eigenvalues' );
	assertRightEigenvectors( A_data, 2, result.w, result.VR, 1e-12, 'eigenvec' );
});

test( 'zgeev: N=2 general, both eigenvectors', function t() {

	const tc = n2_general_both;
	const A_data = [ 1.0, 2.0, 0.0, 1.0, 3.0, 0.0, 4.0, -1.0 ];
	const result = callZgeev( 'compute-vectors', 'compute-vectors', 2, A_data );
	assert.equal( result.info, 0 );
	assertEigenvaluesClose( result.w, tc.w, 1e-12, 'eigenvalues' );
	assertRightEigenvectors( A_data, 2, result.w, result.VR, 1e-10, 'right eigenvec' ); // eslint-disable-line max-len
});

test( 'zgeev: N=3 right eigenvectors', function t() {

	const tc = n3_right;
	const A_data = [
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
	const result = callZgeev( 'no-vectors', 'compute-vectors', 3, A_data );
	assert.equal( result.info, 0 );
	assertEigenvaluesClose( result.w, tc.w, 1e-12, 'eigenvalues' );
	assertRightEigenvectors( A_data, 3, result.w, result.VR, 1e-10, 'right eigenvec' ); // eslint-disable-line max-len
});

test( 'zgeev: N=4 diagonally dominant, both eigenvectors', function t() {

	const tc = n4_diagdom_both;
	const A_data = [
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
	const result = callZgeev( 'compute-vectors', 'compute-vectors', 4, A_data );
	assert.equal( result.info, 0 );
	assertEigenvaluesClose( result.w, tc.w, 1e-10, 'eigenvalues' );
	assertRightEigenvectors( A_data, 4, result.w, result.VR, 1e-8, 'right eigenvec' ); // eslint-disable-line max-len
});

test( 'zgeev: N=2 left eigenvectors only', function t() {

	const tc = n2_left_only;
	const A_data = [ 2.0, 0.0, 0.0, 0.0, 1.0, 1.0, 3.0, 0.0 ];
	const result = callZgeev( 'compute-vectors', 'no-vectors', 2, A_data );
	assert.equal( result.info, 0 );
	assertEigenvaluesClose( result.w, tc.w, 1e-14, 'eigenvalues' );
});

test( 'zgeev: N > 75 (aggressive early deflation path) gives A*v = w*v to machine precision', function t() {
	// Regression: the zlaqr0 -> zlaqr3/zlaqr2 path is only taken for N > 75, which no fixture reaches. zlaqr2/zlaqr3 copied the first COLUMN of V instead of its first ROW (strideV1 vs strideV2) and called zlarf with a stale signature (Complex128 scalar, no offsetTau), giving info=0 with residuals ~1e-1.
	const sizes = [ 80, 120 ];
	let seed;
	let res;
	let sr;
	let si;
	let ar;
	let ai;
	let vr;
	let vi;
	let N;
	let i;
	let j;
	let k;
	let s;

	seed = 1;
	function rnd() {
		seed = ( seed * 16807 ) % 2147483647;
		return ( seed / 2147483647 ) - 0.5;
	}
	for ( s = 0; s < sizes.length; s++ ) {
		N = sizes[ s ];
		const A = new Complex128Array( N * N );
		const Av = reinterpret( A, 0 );
		for ( i = 0; i < Av.length; i++ ) {
			Av[ i ] = rnd();
		}
		const A0 = Av.slice();
		const w = new Complex128Array( N );
		const VR = new Complex128Array( N * N );
		const VL = new Complex128Array( 1 );
		const WORK = new Complex128Array( ( 64 * N ) + 1000 );
		const RWORK = new Float64Array( 2 * N );
		const info = zgeev( 'no-vectors', 'compute-vectors', N, A, 1, N, 0, w, 1, 0, VL, 1, 1, 0, VR, 1, N, 0, WORK, 1, 0, RWORK, 1, 0 );
		assert.equal( info, 0, 'info' );
		const V = reinterpret( VR, 0 );
		const W = reinterpret( w, 0 );
		res = 0.0;
		for ( j = 0; j < N; j++ ) {
			for ( i = 0; i < N; i++ ) {
				sr = 0.0;
				si = 0.0;
				for ( k = 0; k < N; k++ ) {
					ar = A0[ 2 * ( i + ( k * N ) ) ];
					ai = A0[ ( 2 * ( i + ( k * N ) ) ) + 1 ];
					vr = V[ 2 * ( k + ( j * N ) ) ];
					vi = V[ ( 2 * ( k + ( j * N ) ) ) + 1 ];
					sr += ( ar * vr ) - ( ai * vi );
					si += ( ar * vi ) + ( ai * vr );
				}
				vr = V[ 2 * ( i + ( j * N ) ) ];
				vi = V[ ( 2 * ( i + ( j * N ) ) ) + 1 ];
				sr -= ( W[ 2 * j ] * vr ) - ( W[ ( 2 * j ) + 1 ] * vi );
				si -= ( W[ 2 * j ] * vi ) + ( W[ ( 2 * j ) + 1 ] * vr );
				res = Math.max( res, Math.hypot( sr, si ) );
			}
		}
		assert.ok( res < 1e-12, 'N=' + N + ' residual ' + res );
	}
});
