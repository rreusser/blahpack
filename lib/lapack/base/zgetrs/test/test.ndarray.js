/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import zgetrf2 from './../../zgetrf2/lib/base.js';
import zgetrs from './../lib/ndarray.js';
const ndarrayFn = zgetrs;

// FIXTURES //

import solve_3x3 from './fixtures/solve_3x3.json' with { type: 'json' };
import solve_3x3_trans from './fixtures/solve_3x3_trans.json' with { type: 'json' };
import solve_3x3_conj from './fixtures/solve_3x3_conj.json' with { type: 'json' };
import multi_rhs from './fixtures/multi_rhs.json' with { type: 'json' };
import n_zero from './fixtures/n_zero.json' with { type: 'json' };
import nrhs_zero from './fixtures/nrhs_zero.json' with { type: 'json' };
import _1x1 from './fixtures/1x1.json' with { type: 'json' };
import identity from './fixtures/identity.json' with { type: 'json' };
import multi_rhs_conj from './fixtures/multi_rhs_conj.json' with { type: 'json' };

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
	assert.ok( relErr <= tol, msg + ': expected ' + expected + ', got ' + actual );
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
* Factorizes complex matrix A in place and returns info.
* Uses zgetrf2 (recursive LU factorization with partial pivoting).
*/
function factorize( N, A, IPIV ) {
	return zgetrf2( N, N, A, 1, N, 0, IPIV, 1, 0 );
}

/**
* Computes complex matrix-vector product y = A*x (col-major, N x N).
* A and x are Float64Array views of Complex128Arrays (interleaved re/im).
*/
function zmatvec( Av, xv, N ) {
	let yr, yi, ar, ai, xr, xi, i, j;
	const y = new Float64Array( 2 * N );
	for ( i = 0; i < N; i++ ) {
		yr = 0.0;
		yi = 0.0;
		for ( j = 0; j < N; j++ ) {
			// A(i,j) in col-major: index = i + j*N
			ar = Av[ 2 * ( i + j * N ) ];
			ai = Av[ 2 * ( i + j * N ) + 1 ];
			xr = xv[ 2 * j ];
			xi = xv[ 2 * j + 1 ];
			yr += ar * xr - ai * xi;
			yi += ar * xi + ai * xr;
		}
		y[ 2 * i ] = yr;
		y[ 2 * i + 1 ] = yi;
	}
	return y;
}

/**
* Computes complex matrix-vector product y = A^T * x (col-major, N x N).
* A^T means plain transpose, no conjugation.
*/
function zmatvecT( Av, xv, N ) {
	let yr, yi, ar, ai, xr, xi, i, j;
	const y = new Float64Array( 2 * N );
	for ( i = 0; i < N; i++ ) {
		yr = 0.0;
		yi = 0.0;
		for ( j = 0; j < N; j++ ) {
			// A^T(i,j) = A(j,i), col-major: A(j,i) at index j + i*N
			ar = Av[ 2 * ( j + i * N ) ];
			ai = Av[ 2 * ( j + i * N ) + 1 ];
			xr = xv[ 2 * j ];
			xi = xv[ 2 * j + 1 ];
			yr += ar * xr - ai * xi;
			yi += ar * xi + ai * xr;
		}
		y[ 2 * i ] = yr;
		y[ 2 * i + 1 ] = yi;
	}
	return y;
}

/**
* Computes complex matrix-vector product y = A^H * x (col-major, N x N).
* A^H means conjugate transpose: conj(A^T).
*/
function zmatvecH( Av, xv, N ) {
	let yr, yi, ar, ai, xr, xi, i, j;
	const y = new Float64Array( 2 * N );
	for ( i = 0; i < N; i++ ) {
		yr = 0.0;
		yi = 0.0;
		for ( j = 0; j < N; j++ ) {
			// A^H(i,j) = conj(A(j,i)), col-major: A(j,i) at index j + i*N
			ar = Av[ 2 * ( j + i * N ) ];
			ai = -Av[ 2 * ( j + i * N ) + 1 ]; // conjugate
			xr = xv[ 2 * j ];
			xi = xv[ 2 * j + 1 ];
			yr += ar * xr - ai * xi;
			yi += ar * xi + ai * xr;
		}
		y[ 2 * i ] = yr;
		y[ 2 * i + 1 ] = yi;
	}
	return y;
}

/**
* Computes complex matrix-matrix product C = A*B (col-major, N x N times N x NRHS).
*/
function zmatmat( Av, Bv, N, nrhs ) {
	let cr, ci, ar, ai, br, bi, i, j, k;
	const C = new Float64Array( 2 * N * nrhs );
	for ( j = 0; j < nrhs; j++ ) {
		for ( i = 0; i < N; i++ ) {
			cr = 0.0;
			ci = 0.0;
			for ( k = 0; k < N; k++ ) {
				ar = Av[ 2 * ( i + k * N ) ];
				ai = Av[ 2 * ( i + k * N ) + 1 ];
				br = Bv[ 2 * ( k + j * N ) ];
				bi = Bv[ 2 * ( k + j * N ) + 1 ];
				cr += ar * br - ai * bi;
				ci += ar * bi + ai * br;
			}
			C[ 2 * ( i + j * N ) ] = cr;
			C[ 2 * ( i + j * N ) + 1 ] = ci;
		}
	}
	return C;
}

/**
* Computes complex matrix-matrix product C = A^H * B.
*/
function zmatmatH( Av, Bv, N, nrhs ) {
	let cr, ci, ar, ai, br, bi, i, j, k;
	const C = new Float64Array( 2 * N * nrhs );
	for ( j = 0; j < nrhs; j++ ) {
		for ( i = 0; i < N; i++ ) {
			cr = 0.0;
			ci = 0.0;
			for ( k = 0; k < N; k++ ) {
				// A^H(i,k) = conj(A(k,i))
				ar = Av[ 2 * ( k + i * N ) ];
				ai = -Av[ 2 * ( k + i * N ) + 1 ]; // conjugate
				br = Bv[ 2 * ( k + j * N ) ];
				bi = Bv[ 2 * ( k + j * N ) + 1 ];
				cr += ar * br - ai * bi;
				ci += ar * bi + ai * br;
			}
			C[ 2 * ( i + j * N ) ] = cr;
			C[ 2 * ( i + j * N ) + 1 ] = ci;
		}
	}
	return C;
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

test( 'zgetrs: solve_3x3 (no-transpose)', function t() {

	const tc = solve_3x3;
	const Aorig = new Complex128Array([
		2,
		1,
		4,
		2,
		8,
		3,
		1,
		0.5,
		3,
		1,
		7,
		2,
		1,
		0.1,
		3,
		0.5,
		9,
		1
	]);
	const A = new Complex128Array( toArray( reinterpret( Aorig, 0 ) ) );
	const IPIV = new Int32Array( 3 );
	const B = new Complex128Array( [ 1, 0.5, 2, 1, 3, 0 ] );
	factorize( 3, A, IPIV );
	const info = zgetrs( 'no-transpose', 3, 1, A, 1, 3, 0, IPIV, 1, 0, B, 1, 3, 0 );
	assert.equal( info, tc.info, 'info' );
	assertArrayClose( toArray( reinterpret( B, 0 ) ), tc.x, 1e-12, 'x' );
	const Ax = zmatvec( reinterpret( Aorig, 0 ), reinterpret( B, 0 ), 3 );
	assertArrayClose( toArray( Ax ), [ 1, 0.5, 2, 1, 3, 0 ], 1e-12, 'A*x=b' );
});

test( 'zgetrs: solve_3x3_trans (transpose)', function t() {

	const tc = solve_3x3_trans;
	const Aorig = new Complex128Array([
		2,
		1,
		4,
		2,
		8,
		3,
		1,
		0.5,
		3,
		1,
		7,
		2,
		1,
		0.1,
		3,
		0.5,
		9,
		1
	]);
	const A = new Complex128Array( toArray( reinterpret( Aorig, 0 ) ) );
	const IPIV = new Int32Array( 3 );
	const B = new Complex128Array( [ 1, 0.5, 2, 1, 3, 0 ] );
	factorize( 3, A, IPIV );
	const info = zgetrs( 'transpose', 3, 1, A, 1, 3, 0, IPIV, 1, 0, B, 1, 3, 0 );
	assert.equal( info, tc.info, 'info' );
	assertArrayClose( toArray( reinterpret( B, 0 ) ), tc.x, 1e-12, 'x' );
	const ATx = zmatvecT( reinterpret( Aorig, 0 ), reinterpret( B, 0 ), 3 );
	assertArrayClose( toArray( ATx ), [ 1, 0.5, 2, 1, 3, 0 ], 1e-12, 'A^T*x=b' );
});

test( 'zgetrs: solve_3x3_conj (conjugate transpose)', function t() {

	const tc = solve_3x3_conj;
	const Aorig = new Complex128Array([
		2,
		1,
		4,
		2,
		8,
		3,
		1,
		0.5,
		3,
		1,
		7,
		2,
		1,
		0.1,
		3,
		0.5,
		9,
		1
	]);
	const A = new Complex128Array( toArray( reinterpret( Aorig, 0 ) ) );
	const IPIV = new Int32Array( 3 );
	const B = new Complex128Array( [ 1, 0.5, 2, 1, 3, 0 ] );
	factorize( 3, A, IPIV );
	const info = zgetrs( 'conjugate-transpose', 3, 1, A, 1, 3, 0, IPIV, 1, 0, B, 1, 3, 0 ); // eslint-disable-line max-len
	assert.equal( info, tc.info, 'info' );
	assertArrayClose( toArray( reinterpret( B, 0 ) ), tc.x, 1e-12, 'x' );
	const AHx = zmatvecH( reinterpret( Aorig, 0 ), reinterpret( B, 0 ), 3 );
	assertArrayClose( toArray( AHx ), [ 1, 0.5, 2, 1, 3, 0 ], 1e-12, 'A^H*x=b' );
});

test( 'zgetrs: multi_rhs (NRHS=2, no-transpose)', function t() {

	const tc = multi_rhs;
	const Aorig = new Complex128Array([
		2,
		1,
		4,
		2,
		8,
		3,
		1,
		0.5,
		3,
		1,
		7,
		2,
		1,
		0.1,
		3,
		0.5,
		9,
		1
	]);
	const A = new Complex128Array( toArray( reinterpret( Aorig, 0 ) ) );
	const IPIV = new Int32Array( 3 );
	const Borig = new Complex128Array( [ 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0 ] );
	const B = new Complex128Array( toArray( reinterpret( Borig, 0 ) ) );
	factorize( 3, A, IPIV );
	const info = zgetrs( 'no-transpose', 3, 2, A, 1, 3, 0, IPIV, 1, 0, B, 1, 3, 0 );
	assert.equal( info, tc.info, 'info' );
	assertArrayClose( toArray( reinterpret( B, 0 ) ), tc.x, 1e-12, 'x' );
	const AB = zmatmat( reinterpret( Aorig, 0 ), reinterpret( B, 0 ), 3, 2 );
	assertArrayClose( toArray( AB ), toArray( reinterpret( Borig, 0 ) ), 1e-12, 'A*X=B' ); // eslint-disable-line max-len
});

test( 'zgetrs: n_zero (quick return)', function t() {

	const tc = n_zero;
	const A = new Complex128Array( 1 );
	const IPIV = new Int32Array( 1 );
	const B = new Complex128Array( 1 );
	const info = zgetrs( 'no-transpose', 0, 1, A, 1, 1, 0, IPIV, 1, 0, B, 1, 1, 0 );
	assert.equal( info, tc.info, 'info' );
});

test( 'zgetrs: nrhs_zero (quick return)', function t() {

	const tc = nrhs_zero;
	const A = new Complex128Array( 9 );
	const IPIV = new Int32Array( 3 );
	const B = new Complex128Array( 3 );
	const info = zgetrs( 'no-transpose', 3, 0, A, 1, 3, 0, IPIV, 1, 0, B, 1, 3, 0 );
	assert.equal( info, tc.info, 'info' );
});

test( 'zgetrs: 1x1', function t() {

	const tc = _1x1;
	const A = new Complex128Array( [ 5, 3 ] );
	const IPIV = new Int32Array( 1 );
	const B = new Complex128Array( [ 10, 6 ] );
	factorize( 1, A, IPIV );
	const info = zgetrs( 'no-transpose', 1, 1, A, 1, 1, 0, IPIV, 1, 0, B, 1, 1, 0 );
	assert.equal( info, tc.info, 'info' );
	assertArrayClose( toArray( reinterpret( B, 0 ) ), tc.x, 1e-14, 'x' );
});

test( 'zgetrs: identity', function t() {

	const tc = identity;
	const A = new Complex128Array( [ 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0 ] ); // eslint-disable-line max-len
	const IPIV = new Int32Array( 3 );
	const B = new Complex128Array( [ 3, 1, 5, 2, 7, 3 ] );
	factorize( 3, A, IPIV );
	const info = zgetrs( 'no-transpose', 3, 1, A, 1, 3, 0, IPIV, 1, 0, B, 1, 3, 0 );
	assert.equal( info, tc.info, 'info' );
	assertArrayClose( toArray( reinterpret( B, 0 ) ), tc.x, 1e-14, 'x' );
});

test( 'zgetrs: multi_rhs_conj (NRHS=2, conjugate transpose)', function t() {

	const tc = multi_rhs_conj;
	const Aorig = new Complex128Array([
		2,
		1,
		4,
		2,
		8,
		3,
		1,
		0.5,
		3,
		1,
		7,
		2,
		1,
		0.1,
		3,
		0.5,
		9,
		1
	]);
	const A = new Complex128Array( toArray( reinterpret( Aorig, 0 ) ) );
	const IPIV = new Int32Array( 3 );
	const Borig = new Complex128Array( [ 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0 ] );
	const B = new Complex128Array( toArray( reinterpret( Borig, 0 ) ) );
	factorize( 3, A, IPIV );
	const info = zgetrs( 'conjugate-transpose', 3, 2, A, 1, 3, 0, IPIV, 1, 0, B, 1, 3, 0 ); // eslint-disable-line max-len
	assert.equal( info, tc.info, 'info' );
	assertArrayClose( toArray( reinterpret( B, 0 ) ), tc.x, 1e-12, 'x' );
	const AHB = zmatmatH( reinterpret( Aorig, 0 ), reinterpret( B, 0 ), 3, 2 );
	assertArrayClose( toArray( AHB ), toArray( reinterpret( Borig, 0 ) ), 1e-12, 'A^H*X=B' ); // eslint-disable-line max-len
});

// ndarray validation tests

test( 'zgetrs: ndarray throws TypeError for invalid trans', function t() {
	const IPIV = new Int32Array( 3 );
	const A = new Complex128Array( 9 );
	const B = new Complex128Array( 3 );
	assert.throws( function throws() {
		ndarrayFn( 'invalid', 3, 1, A, 1, 3, 0, IPIV, 1, 0, B, 1, 3, 0 );
	}, TypeError );
});

test( 'zgetrs: ndarray throws RangeError for negative N', function t() {
	const IPIV = new Int32Array( 3 );
	const A = new Complex128Array( 9 );
	const B = new Complex128Array( 3 );
	assert.throws( function throws() {
		ndarrayFn( 'no-transpose', -1, 1, A, 1, 3, 0, IPIV, 1, 0, B, 1, 3, 0 );
	}, RangeError );
});

test( 'zgetrs: lowercase trans argument', function t() {

	const Aorig = new Complex128Array([
		2,
		1,
		4,
		2,
		8,
		3,
		1,
		0.5,
		3,
		1,
		7,
		2,
		1,
		0.1,
		3,
		0.5,
		9,
		1
	]);
	const A = new Complex128Array( toArray( reinterpret( Aorig, 0 ) ) );
	const IPIV = new Int32Array( 3 );
	const B = new Complex128Array( [ 1, 0.5, 2, 1, 3, 0 ] );
	factorize( 3, A, IPIV );
	const info = zgetrs( 'no-transpose', 3, 1, A, 1, 3, 0, IPIV, 1, 0, B, 1, 3, 0 );
	assert.equal( info, 0, 'info' );
	const Ax = zmatvec( reinterpret( Aorig, 0 ), reinterpret( B, 0 ), 3 );
	assertArrayClose( toArray( Ax ), [ 1, 0.5, 2, 1, 3, 0 ], 1e-12, 'A*x=b' );
});
