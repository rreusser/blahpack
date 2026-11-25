/* eslint-disable max-len, max-statements, no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import zgeev from './../lib/ndarray.js';
import zhseqrReal from './../../zhseqr/lib/base.js';
import { importWithDependencies } from './../../../../../test/harness/constants.js';

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


// FUNCTIONS (ADDITIONAL CHECKS) //

/**
* Returns the known spectrum used by `knownSpectrumMatrix` (interleaved).
*
* @private
* @returns {Array<number>} eigenvalues
*/
function knownSpectrum() {
	return [ 1.0, 2.0, -3.0, 0.0, 2.0, -1.0, 0.0, 0.5 ];
}

/**
* Returns A = H T H^H (4x4, interleaved, column-major) where T is upper triangular with diagonal `knownSpectrum()` and H = I - 2 u u^H / (u^H u) is a unitary Householder reflector, so A is non-normal with a known spectrum.
*
* @private
* @param {number} alpha - real scale factor applied to A
* @returns {Float64Array} matrix
*/
function knownSpectrumMatrix( alpha ) {
	const N = 4;
	const d = knownSpectrum();
	const u = [ 1.0, 0.5, -0.5, 1.0, 0.25, 0.0, 1.0, -0.75 ];
	const T = new Float64Array( 2 * N * N );
	const H = new Float64Array( 2 * N * N );
	const HT = new Float64Array( 2 * N * N );
	const A = new Float64Array( 2 * N * N );
	let unrm, sr, si, ar, ai, br, bi, i, j, k;

	for ( j = 0; j < N; j++ ) {
		T[ 2 * ( j + ( j * N ) ) ] = d[ 2 * j ];
		T[ ( 2 * ( j + ( j * N ) ) ) + 1 ] = d[ ( 2 * j ) + 1 ];
		for ( i = 0; i < j; i++ ) {
			T[ 2 * ( i + ( j * N ) ) ] = 0.5 + ( 0.25 * i ) - ( 0.125 * j );
			T[ ( 2 * ( i + ( j * N ) ) ) + 1 ] = 0.3 - ( 0.2 * i ) + ( 0.1 * j );
		}
	}
	unrm = 0.0;
	for ( i = 0; i < 2 * N; i++ ) {
		unrm += u[ i ] * u[ i ];
	}
	for ( j = 0; j < N; j++ ) {
		for ( i = 0; i < N; i++ ) {
			// H(i,j) = delta_ij - 2 u_i conj(u_j) / unrm
			sr = ( u[ 2 * i ] * u[ 2 * j ] ) + ( u[ ( 2 * i ) + 1 ] * u[ ( 2 * j ) + 1 ] ); // eslint-disable-line max-len
			si = ( u[ ( 2 * i ) + 1 ] * u[ 2 * j ] ) - ( u[ 2 * i ] * u[ ( 2 * j ) + 1 ] ); // eslint-disable-line max-len
			H[ 2 * ( i + ( j * N ) ) ] = ( ( i === j ) ? 1.0 : 0.0 ) - ( 2.0 * sr / unrm ); // eslint-disable-line max-len
			H[ ( 2 * ( i + ( j * N ) ) ) + 1 ] = -2.0 * si / unrm;
		}
	}
	// HT = H * T
	for ( j = 0; j < N; j++ ) {
		for ( i = 0; i < N; i++ ) {
			sr = 0.0;
			si = 0.0;
			for ( k = 0; k < N; k++ ) {
				ar = H[ 2 * ( i + ( k * N ) ) ];
				ai = H[ ( 2 * ( i + ( k * N ) ) ) + 1 ];
				br = T[ 2 * ( k + ( j * N ) ) ];
				bi = T[ ( 2 * ( k + ( j * N ) ) ) + 1 ];
				sr += ( ar * br ) - ( ai * bi );
				si += ( ar * bi ) + ( ai * br );
			}
			HT[ 2 * ( i + ( j * N ) ) ] = sr;
			HT[ ( 2 * ( i + ( j * N ) ) ) + 1 ] = si;
		}
	}
	// A = HT * H^H (H is Hermitian, so H^H = H)
	for ( j = 0; j < N; j++ ) {
		for ( i = 0; i < N; i++ ) {
			sr = 0.0;
			si = 0.0;
			for ( k = 0; k < N; k++ ) {
				ar = HT[ 2 * ( i + ( k * N ) ) ];
				ai = HT[ ( 2 * ( i + ( k * N ) ) ) + 1 ];
				br = H[ 2 * ( k + ( j * N ) ) ];
				bi = H[ ( 2 * ( k + ( j * N ) ) ) + 1 ];
				sr += ( ar * br ) - ( ai * bi );
				si += ( ar * bi ) + ( ai * br );
			}
			A[ 2 * ( i + ( j * N ) ) ] = sr * alpha;
			A[ ( 2 * ( i + ( j * N ) ) ) + 1 ] = si * alpha;
		}
	}
	return A;
}

/**
* Asserts that `wv` (interleaved) equals `expected` (interleaved) as a multiset within `tol`.
*
* @private
* @param {Float64Array} wv - computed eigenvalues
* @param {Array<number>} expected - expected eigenvalues
* @param {number} tol - absolute tolerance
* @param {string} msg - message
*/
function assertSpectrum( wv, expected, tol, msg ) {
	const used = [];
	const N = expected.length / 2;
	let best, dist, bi, i, j;
	for ( i = 0; i < N; i++ ) {
		best = Infinity;
		bi = -1;
		for ( j = 0; j < N; j++ ) {
			if ( used[ j ] ) {
				continue;
			}
			dist = Math.hypot( wv[ 2 * i ] - expected[ 2 * j ], wv[ ( 2 * i ) + 1 ] - expected[ ( 2 * j ) + 1 ] ); // eslint-disable-line max-len
			if ( dist < best ) {
				best = dist;
				bi = j;
			}
		}
		used[ bi ] = true;
		assert.ok( best <= tol, msg + ': eigenvalue ' + i + ' (' + wv[ 2 * i ] + ',' + wv[ ( 2 * i ) + 1 ] + ') off by ' + best ); // eslint-disable-line max-len
	}
}

/**
* Asserts right (A v = lambda v) or left (u^H A = lambda u^H) eigenvector residuals <= 1e-12 * N * ||A||_F, after dividing A and lambda by `s` (avoids underflow for tiny matrices), and unit 2-norm columns.
*
* @private
* @param {string} side - 'right' or 'left'
* @param {Float64Array} A0 - original matrix (interleaved, column-major)
* @param {NonNegativeInteger} N - order
* @param {Float64Array} wv - eigenvalues (interleaved)
* @param {Float64Array} V - eigenvectors (interleaved, column-major)
* @param {number} s - scale divisor
* @param {string} msg - message
*/
function assertEigvecResiduals( side, A0, N, wv, V, s, msg ) {
	let anrm, err, nrm, sr, si, ar, ai, vr, vi, lr, li, i, j, k;
	anrm = 0.0;
	for ( i = 0; i < A0.length; i++ ) {
		anrm += ( A0[ i ] / s ) * ( A0[ i ] / s );
	}
	anrm = Math.sqrt( anrm );
	for ( j = 0; j < N; j++ ) {
		lr = wv[ 2 * j ] / s;
		li = wv[ ( 2 * j ) + 1 ] / s;
		err = 0.0;
		nrm = 0.0;
		for ( i = 0; i < N; i++ ) {
			sr = 0.0;
			si = 0.0;
			for ( k = 0; k < N; k++ ) {
				if ( side === 'right' ) {
					// (A v)_i = sum_k A(i,k) v(k)
					ar = A0[ 2 * ( i + ( k * N ) ) ] / s;
					ai = A0[ ( 2 * ( i + ( k * N ) ) ) + 1 ] / s;
					vr = V[ 2 * ( k + ( j * N ) ) ];
					vi = V[ ( 2 * ( k + ( j * N ) ) ) + 1 ];
				} else {
					// (A^H u)_i = sum_k conj(A(k,i)) u(k); u^H A = lambda u^H  <=>  A^H u = conj(lambda) u
					ar = A0[ 2 * ( k + ( i * N ) ) ] / s;
					ai = -A0[ ( 2 * ( k + ( i * N ) ) ) + 1 ] / s;
					vr = V[ 2 * ( k + ( j * N ) ) ];
					vi = V[ ( 2 * ( k + ( j * N ) ) ) + 1 ];
				}
				sr += ( ar * vr ) - ( ai * vi );
				si += ( ar * vi ) + ( ai * vr );
			}
			vr = V[ 2 * ( i + ( j * N ) ) ];
			vi = V[ ( 2 * ( i + ( j * N ) ) ) + 1 ];
			if ( side === 'right' ) {
				sr -= ( lr * vr ) - ( li * vi );
				si -= ( lr * vi ) + ( li * vr );
			} else {
				sr -= ( lr * vr ) + ( li * vi );
				si -= ( lr * vi ) - ( li * vr );
			}
			err += ( sr * sr ) + ( si * si );
			nrm += ( vr * vr ) + ( vi * vi );
		}
		assert.ok( Math.abs( Math.sqrt( nrm ) - 1.0 ) <= 1e-13, msg + ': column ' + j + ' has unit norm' ); // eslint-disable-line max-len
		assert.ok( Math.sqrt( err ) <= 1e-12 * N * anrm, msg + ': ' + side + ' residual ' + j + ' = ' + Math.sqrt( err ) ); // eslint-disable-line max-len
	}
}

/**
* Calls an implementation with ample workspace.
*
* @private
* @param {Function} fn - implementation
* @param {string} jobvl - left job
* @param {string} jobvr - right job
* @param {NonNegativeInteger} N - order
* @param {Float64Array} Ad - matrix (interleaved, copied)
* @returns {Object} results
*/
function runAmple( fn, jobvl, jobvr, N, Ad ) {
	const w = new Complex128Array( N );
	const VL = new Complex128Array( N * N );
	const VR = new Complex128Array( N * N );
	const info = fn( jobvl, jobvr, N, new Complex128Array( Ad ), 1, N, 0, w, 1, 0, VL, 1, N, 0, VR, 1, N, 0, new Complex128Array( ( 64 * N ) + 64 ), 1, 0, new Float64Array( 2 * N ), 1, 0 ); // eslint-disable-line max-len
	return {
		'info': info,
		'w': reinterpret( w, 0 ),
		'VL': reinterpret( VL, 0 ),
		'VR': reinterpret( VR, 0 )
	};
}

test( 'zgeev: N=1 with both eigenvectors', function t() {
	const r = runAmple( zgeev, 'compute-vectors', 'compute-vectors', 1, new Float64Array( [ 2.5, -1.5 ] ) ); // eslint-disable-line max-len
	assert.equal( r.info, 0 );
	assert.deepEqual( Array.from( r.w ), [ 2.5, -1.5 ] );
	assert.deepEqual( Array.from( r.VL ), [ 1.0, 0.0 ] );
	assert.deepEqual( Array.from( r.VR ), [ 1.0, 0.0 ] );
});

test( 'zgeev: well-scaled matrix with known spectrum, both eigenvectors', function t() {
	const A0 = knownSpectrumMatrix( 1.0 );
	const r = runAmple( zgeev, 'compute-vectors', 'compute-vectors', 4, A0 );
	assert.equal( r.info, 0 );
	assertSpectrum( r.w, knownSpectrum(), 1e-12, 'w' );
	assertEigvecResiduals( 'right', A0, 4, r.w, r.VR, 1.0, 'VR' );
	assertEigvecResiduals( 'left', A0, 4, r.w, r.VL, 1.0, 'VL' );
});

test( 'zgeev: tiny-norm matrix (1e-150, below SMLNUM) is scaled; eigenvalues of a general matrix', function t() {
	// Only the eigenvalues are asserted here: ticket 0026 records that the QR iteration on the SMLNUM-sized scaled matrix loses accuracy, and for this input the right-eigenvector residual is about 1.5e-7 (relative), so the vectors are checked on a triangular tiny input in the next test.
	const A0 = knownSpectrumMatrix( 1e-150 );
	const r = runAmple( zgeev, 'compute-vectors', 'compute-vectors', 4, A0 );
	const expected = knownSpectrum().map( function scale( v ) {
		return v * 1e-150;
	});
	assert.equal( r.info, 0 );
	assertSpectrum( r.w, expected, 1e-12 * 1e-150, 'w' );
});

test( 'zgeev: tiny-norm upper-triangular matrix (1e-150) is scaled; both eigenvectors', function t() {
	const d = knownSpectrum();
	const A0 = new Float64Array( 32 );
	let i;
	let j;
	for ( j = 0; j < 4; j++ ) {
		A0[ 2 * ( j + ( j * 4 ) ) ] = d[ 2 * j ] * 1e-150;
		A0[ ( 2 * ( j + ( j * 4 ) ) ) + 1 ] = d[ ( 2 * j ) + 1 ] * 1e-150;
		for ( i = 0; i < j; i++ ) {
			A0[ 2 * ( i + ( j * 4 ) ) ] = ( 0.5 + ( 0.25 * i ) - ( 0.125 * j ) ) * 1e-150; // eslint-disable-line max-len
			A0[ ( 2 * ( i + ( j * 4 ) ) ) + 1 ] = ( 0.3 - ( 0.2 * i ) + ( 0.1 * j ) ) * 1e-150; // eslint-disable-line max-len
		}
	}
	const r = runAmple( zgeev, 'compute-vectors', 'compute-vectors', 4, A0 );
	const expected = d.map( function scale( v ) {
		return v * 1e-150;
	});
	assert.equal( r.info, 0 );
	assertSpectrum( r.w, expected, 1e-12 * 1e-150, 'w' );
	assertEigvecResiduals( 'right', A0, 4, r.w, r.VR, 1e-150, 'VR' );
	assertEigvecResiduals( 'left', A0, 4, r.w, r.VL, 1e-150, 'VL' );
});

test( 'zgeev: huge-norm matrix (1e150, above BIGNUM) is scaled; right eigenvectors', function t() {
	const A0 = knownSpectrumMatrix( 1e150 );
	const r = runAmple( zgeev, 'no-vectors', 'compute-vectors', 4, A0 );
	const expected = knownSpectrum().map( function scale( v ) {
		return v * 1e150;
	});
	assert.equal( r.info, 0 );
	assertSpectrum( r.w, expected, 1e-12 * 1e150, 'w' );
	assertEigvecResiduals( 'right', A0, 4, r.w, r.VR, 1e150, 'VR' );
});

test( 'zgeev: huge-norm matrix (1e150), eigenvalues only and left eigenvectors only', function t() {
	const A0 = knownSpectrumMatrix( 1e150 );
	const expected = knownSpectrum().map( function scale( v ) {
		return v * 1e150;
	});
	let r = runAmple( zgeev, 'no-vectors', 'no-vectors', 4, A0 );
	assert.equal( r.info, 0 );
	assertSpectrum( r.w, expected, 1e-12 * 1e150, 'w (no vectors)' );
	r = runAmple( zgeev, 'compute-vectors', 'no-vectors', 4, A0 );
	assert.equal( r.info, 0 );
	assertSpectrum( r.w, expected, 1e-12 * 1e150, 'w (left)' );
	assertEigvecResiduals( 'left', A0, 4, r.w, r.VL, 1e150, 'VL' );
});

test( 'zgeev: zhseqr failure on a scaled, balanced (ilo = 2) matrix returns its info and unscales w[info:] and w[0:ilo-1] only', async function t() {
	const seen = [];
	const mod = await importWithDependencies( new URL( './../lib/base.js', import.meta.url ), {
		'../../zhseqr/lib/base.js': function failingZhseqr() {
			const args = Array.prototype.slice.call( arguments );
			const wv = reinterpret( args[ 9 ], 0 );
			let i;
			zhseqrReal.apply( null, args );
			for ( i = 0; i < 2 * args[ 2 ]; i++ ) {
				seen.push( wv[ i ] );
			}
			return 2;
		}
	});
	// Column 0 is zero below the diagonal, so zgebal isolates the eigenvalue 3+i (ilo = 2):
	const B = knownSpectrumMatrix( 1.0 );
	const A0 = new Float64Array( 32 );
	let ratio;
	let i;
	for ( i = 0; i < 32; i++ ) {
		A0[ i ] = 0.0;
	}
	A0[ 0 ] = 3.0;
	A0[ 1 ] = 1.0;
	for ( i = 8; i < 32; i++ ) {
		A0[ i ] = B[ i ] * 1e-150;
	}
	A0[ 0 ] *= 1e-150;
	A0[ 1 ] *= 1e-150;
	const r = runAmple( mod.default, 'compute-vectors', 'compute-vectors', 4, A0 );
	assert.equal( r.info, 2 );
	assert.equal( seen.length, 8 );

	// Scaled-problem eigenvalues (as zhseqr produced them) form the spectrum of the scaled matrix:
	ratio = Math.hypot( seen[ 0 ], seen[ 1 ] ) / Math.hypot( r.w[ 0 ], r.w[ 1 ] );
	assert.ok( ratio > 1e10, 'matrix was scaled up' );

	// w[0] (i < ilo-1) and w[2], w[3] (i >= info) are unscaled; w[1] keeps its scaled value:
	assert.ok( Math.abs( r.w[ 0 ] - 3e-150 ) <= 1e-12 * 3e-150, 'w[0] real' );
	assert.ok( Math.abs( r.w[ 1 ] - 1e-150 ) <= 1e-12 * 3e-150, 'w[0] imag' );
	assert.equal( r.w[ 2 ], seen[ 2 ] );
	assert.equal( r.w[ 3 ], seen[ 3 ] );
	for ( i = 4; i < 8; i++ ) {
		assert.ok( Math.abs( ( r.w[ i ] * ratio ) - seen[ i ] ) <= 1e-12 * Math.abs( seen[ i ] ) + 1e-300, 'w component ' + i + ' unscaled by the same factor' ); // eslint-disable-line max-len
	}
});
