/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import dgetrf from './../../dgetrf/lib/base.js';
import dgetrs from './../lib/ndarray.js';
const ndarrayFn = dgetrs;

// FIXTURES //

import solve_3x3 from './fixtures/solve_3x3.json' with { type: 'json' };
import solve_3x3_trans from './fixtures/solve_3x3_trans.json' with { type: 'json' };
import multi_rhs from './fixtures/multi_rhs.json' with { type: 'json' };
import n_zero from './fixtures/n_zero.json' with { type: 'json' };
import nrhs_zero from './fixtures/nrhs_zero.json' with { type: 'json' };
import _1x1 from './fixtures/1x1.json' with { type: 'json' };
import identity from './fixtures/identity.json' with { type: 'json' };

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
* Factorizes matrix A in place and returns info.
*/
function factorize( N, A, IPIV ) {
	return dgetrf( N, N, A, 1, N, 0, IPIV, 1, 0 );
}

/**
* Computes matrix-vector product y = A*x (col-major, N x N).
*/
function matvec( A, x, N ) {
	const y = new Float64Array( N );
	let i, j;
	for ( i = 0; i < N; i++ ) {
		for ( j = 0; j < N; j++ ) {
			y[ i ] += A[ i + j * N ] * x[ j ];
		}
	}
	return y;
}

/**
* Computes matrix-vector product y = A^T * x (col-major, N x N).
*/
function matvecT( A, x, N ) {
	const y = new Float64Array( N );
	let i, j;
	for ( i = 0; i < N; i++ ) {
		for ( j = 0; j < N; j++ ) {
			y[ i ] += A[ j + i * N ] * x[ j ];
		}
	}
	return y;
}

/**
* Computes matrix-matrix product C = A*B (col-major, N x N times N x NRHS).
*/
function matmat( A, B, N, nrhs ) {
	const C = new Float64Array( N * nrhs );
	let i, j, k;
	for ( j = 0; j < nrhs; j++ ) {
		for ( i = 0; i < N; i++ ) {
			for ( k = 0; k < N; k++ ) {
				C[ i + j * N ] += A[ i + k * N ] * B[ k + j * N ];
			}
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

test( 'dgetrs: solve_3x3', function t() {

	const tc = solve_3x3;
	const Aorig = new Float64Array( [ 2.0, 4.0, 8.0, 1.0, 3.0, 7.0, 1.0, 3.0, 9.0 ] );
	const A = new Float64Array( Aorig );
	const IPIV = new Int32Array( 3 );
	const B = new Float64Array( [ 1.0, 1.0, 1.0 ] );
	factorize( 3, A, IPIV );
	const info = dgetrs( 'no-transpose', 3, 1, A, 1, 3, 0, IPIV, 1, 0, B, 1, 3, 0 );
	assert.equal( info, tc.info, 'info' );
	const Ax = matvec( Aorig, B, 3 );
	assertArrayClose( toArray( Ax ), [ 1.0, 1.0, 1.0 ], 1e-14, 'A*x=b' );
});

test( 'dgetrs: solve_3x3_trans', function t() {

	const tc = solve_3x3_trans;
	const Aorig = new Float64Array( [ 2.0, 4.0, 8.0, 1.0, 3.0, 7.0, 1.0, 3.0, 9.0 ] );
	const A = new Float64Array( Aorig );
	const IPIV = new Int32Array( 3 );
	const B = new Float64Array( [ 1.0, 1.0, 1.0 ] );
	factorize( 3, A, IPIV );
	const info = dgetrs( 'transpose', 3, 1, A, 1, 3, 0, IPIV, 1, 0, B, 1, 3, 0 );
	assert.equal( info, tc.info, 'info' );
	const ATx = matvecT( Aorig, B, 3 );
	assertArrayClose( toArray( ATx ), [ 1.0, 1.0, 1.0 ], 1e-14, 'A^T*x=b' );
});

test( 'dgetrs: multi_rhs', function t() {

	const tc = multi_rhs;
	const Aorig = new Float64Array( [ 2.0, 4.0, 8.0, 1.0, 3.0, 7.0, 1.0, 3.0, 9.0 ] );
	const A = new Float64Array( Aorig );
	const IPIV = new Int32Array( 3 );
	const Borig = new Float64Array( [ 1.0, 0.0, 0.0, 0.0, 1.0, 0.0 ] );
	const B = new Float64Array( Borig );
	factorize( 3, A, IPIV );
	const info = dgetrs( 'no-transpose', 3, 2, A, 1, 3, 0, IPIV, 1, 0, B, 1, 3, 0 );
	assert.equal( info, tc.info, 'info' );
	const AB = matmat( Aorig, B, 3, 2 );
	assertArrayClose( toArray( AB ), toArray( Borig ), 1e-14, 'A*X=B' );
});

test( 'dgetrs: n_zero', function t() {

	const tc = n_zero;
	const A = new Float64Array( 1 );
	const IPIV = new Int32Array( 1 );
	const B = new Float64Array( 1 );
	const info = dgetrs( 'no-transpose', 0, 1, A, 1, 1, 0, IPIV, 1, 0, B, 1, 1, 0 );
	assert.equal( info, tc.info, 'info' );
});

test( 'dgetrs: nrhs_zero', function t() {

	const tc = nrhs_zero;
	const A = new Float64Array( 9 );
	const IPIV = new Int32Array( 3 );
	const B = new Float64Array( 3 );
	const info = dgetrs( 'no-transpose', 3, 0, A, 1, 3, 0, IPIV, 1, 0, B, 1, 3, 0 );
	assert.equal( info, tc.info, 'info' );
});

test( 'dgetrs: 1x1', function t() {

	const tc = _1x1;
	const A = new Float64Array( [ 5.0 ] );
	const IPIV = new Int32Array( 1 );
	const B = new Float64Array( [ 10.0 ] );
	factorize( 1, A, IPIV );
	const info = dgetrs( 'no-transpose', 1, 1, A, 1, 1, 0, IPIV, 1, 0, B, 1, 1, 0 );
	assert.equal( info, tc.info, 'info' );
	assertArrayClose( toArray( B ), tc.x, 1e-14, 'x' );
});

test( 'dgetrs: identity', function t() {

	const tc = identity;
	const A = new Float64Array( [ 1.0, 0.0, 0.0, 0.0, 1.0, 0.0, 0.0, 0.0, 1.0 ] );
	const IPIV = new Int32Array( 3 );
	const B = new Float64Array( [ 3.0, 5.0, 7.0 ] );
	factorize( 3, A, IPIV );
	const info = dgetrs( 'no-transpose', 3, 1, A, 1, 3, 0, IPIV, 1, 0, B, 1, 3, 0 );
	assert.equal( info, tc.info, 'info' );
	assertArrayClose( toArray( B ), tc.x, 1e-14, 'x' );
});

// ndarray validation tests

test( 'dgetrs: ndarray throws TypeError for invalid trans', function t() {
	const IPIV = new Int32Array( 3 );
	const A = new Float64Array( [ 2.0, 4.0, 8.0, 1.0, 3.0, 7.0, 1.0, 3.0, 9.0 ] );
	const B = new Float64Array( [ 1.0, 1.0, 1.0 ] );
	assert.throws( function throws() {
		ndarrayFn( 'invalid', 3, 1, A, 1, 3, 0, IPIV, 1, 0, B, 1, 3, 0 );
	}, TypeError );
});

test( 'dgetrs: ndarray throws RangeError for negative N', function t() {
	const IPIV = new Int32Array( 3 );
	const A = new Float64Array( [ 2.0, 4.0, 8.0, 1.0, 3.0, 7.0, 1.0, 3.0, 9.0 ] );
	const B = new Float64Array( [ 1.0, 1.0, 1.0 ] );
	assert.throws( function throws() {
		ndarrayFn( 'no-transpose', -1, 1, A, 1, 3, 0, IPIV, 1, 0, B, 1, 3, 0 );
	}, RangeError );
});

test( 'dgetrs: lowercase trans argument', function t() {

	const Aorig = new Float64Array( [ 2.0, 4.0, 8.0, 1.0, 3.0, 7.0, 1.0, 3.0, 9.0 ] );
	const A = new Float64Array( Aorig );
	const IPIV = new Int32Array( 3 );
	const B = new Float64Array( [ 1.0, 1.0, 1.0 ] );
	factorize( 3, A, IPIV );
	const info = dgetrs( 'no-transpose', 3, 1, A, 1, 3, 0, IPIV, 1, 0, B, 1, 3, 0 );
	assert.equal( info, 0, 'info' );
	const Ax = matvec( Aorig, B, 3 );
	assertArrayClose( toArray( Ax ), [ 1.0, 1.0, 1.0 ], 1e-14, 'A*x=b' );
});
