/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dgeqr2 from '../../dgeqr2/lib/base.js';
import dorg2r from './../lib/ndarray.js';

// FIXTURES //

import _4x3_k3 from './fixtures/4x3_k3.json' with { type: 'json' };
import _3x3_k3 from './fixtures/3x3_k3.json' with { type: 'json' };
import _4x2_k1 from './fixtures/4x2_k1.json' with { type: 'json' };
import k_zero from './fixtures/k_zero.json' with { type: 'json' };
import n_zero from './fixtures/n_zero.json' with { type: 'json' };
import m_zero from './fixtures/m_zero.json' with { type: 'json' };
import _5x3_orthogonal from './fixtures/5x3_orthogonal.json' with { type: 'json' };
import _6x4_k4 from './fixtures/6x4_k4.json' with { type: 'json' };

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
* Helper: set up a column-major matrix from row-by-row values,.
* run dgeqr2, then run dorg2r, return the Q matrix as a flat column-major array.
*
* @param {number} M - rows
* @param {number} N - columns
* @param {number} K - number of reflectors to apply
* @param {Array} values - M*N values in row-major order
* @returns {Object} { Q: Float64Array (col-major flat), info: integer }
*/
function computeQ( M, N, K, values ) {
	let info, i, j;

	// Build column-major A from row-major input values
	const A = new Float64Array( M * N );
	for ( i = 0; i < M; i++ ) {
		for ( j = 0; j < N; j++ ) {
			A[ j * M + i ] = values[ i * N + j ];
		}
	}
	const TAU = new Float64Array( Math.min( M, N ) );
	const WORK = new Float64Array( N );

	// Compute QR factorization
	info = dgeqr2( M, N, A, 1, M, 0, TAU, 1, 0, WORK, 1, 0 );
	assert.equal( info, 0, 'dgeqr2 info' );

	// Generate Q from reflectors
	info = dorg2r( M, N, K, A, 1, M, 0, TAU, 1, 0, WORK, 1, 0 );

	// Extract column-major flat array for comparison
	const Q = new Float64Array( M * N );
	for ( j = 0; j < N; j++ ) {
		for ( i = 0; i < M; i++ ) {
			Q[ j * M + i ] = A[ j * M + i ];
		}
	}
	return {
		'Q': Q,
		'info': info
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
	const out = [];
	let i;
	for ( i = 0; i < arr.length; i++ ) {
		out.push( arr[ i ] );
	}
	return out;
}

// TESTS //

test( 'dorg2r: 4x3_k3', function t() {
	const result = computeQ( 4, 3, 3, [
		2,
		1,
		3,
		1,
		4,
		2,
		3,
		2,
		5,
		1,
		3,
		1
	]);
	const tc = _4x3_k3;
	assert.equal( result.info, tc.INFO, 'INFO' );
	assertArrayClose( toArray( result.Q ), tc.Q, 1e-14, 'Q' );
});

test( 'dorg2r: 3x3_k3', function t() {
	const result = computeQ( 3, 3, 3, [
		4,
		1,
		2,
		3,
		2,
		1,
		1,
		5,
		3
	]);
	const tc = _3x3_k3;
	assert.equal( result.info, tc.INFO, 'INFO' );
	assertArrayClose( toArray( result.Q ), tc.Q, 1e-14, 'Q' );
});

test( 'dorg2r: 4x2_k1 (K < N, partial reflectors)', function t() {
	let info, i, j;

	const tc = _4x2_k1;
	const A = new Float64Array( 4 * 2 );
	const vals = [
		1,
		2,
		3,
		4,
		5,
		6,
		7,
		8
	];
	for ( i = 0; i < 4; i++ ) {
		for ( j = 0; j < 2; j++ ) {
			A[ j * 4 + i ] = vals[ i * 2 + j ];
		}
	}
	const TAU = new Float64Array( 2 );
	const WORK = new Float64Array( 2 );
	info = dgeqr2( 4, 2, A, 1, 4, 0, TAU, 1, 0, WORK, 1, 0 );
	assert.equal( info, 0, 'dgeqr2 info' );
	info = dorg2r( 4, 2, 1, A, 1, 4, 0, TAU, 1, 0, WORK, 1, 0 );
	assert.equal( info, tc.INFO, 'INFO' );
	assertArrayClose( toArray( A ), tc.Q, 1e-14, 'Q' );
});

test( 'dorg2r: k_zero (identity)', function t() {

	const tc = k_zero;
	const A = new Float64Array( 3 * 2 );
	A[ 0 ] = 99;
	A[ 3 ] = 88;
	A[ 1 ] = 77;
	A[ 4 ] = 66;
	A[ 2 ] = 55;
	A[ 5 ] = 44;
	const TAU = new Float64Array( 2 );
	const WORK = new Float64Array( 2 );
	const info = dorg2r( 3, 2, 0, A, 1, 3, 0, TAU, 1, 0, WORK, 1, 0 );
	assert.equal( info, tc.INFO, 'INFO' );
	assertArrayClose( toArray( A ), tc.Q, 1e-14, 'Q' );
});

test( 'dorg2r: n_zero (quick return)', function t() {

	const tc = n_zero;
	const A = new Float64Array( 3 );
	const TAU = new Float64Array( 1 );
	const WORK = new Float64Array( 1 );
	const info = dorg2r( 3, 0, 0, A, 1, 3, 0, TAU, 1, 0, WORK, 1, 0 );
	assert.equal( info, tc.INFO, 'INFO' );
});

test( 'dorg2r: m_zero (quick return)', function t() {

	const tc = m_zero;
	const A = new Float64Array( 1 );
	const TAU = new Float64Array( 1 );
	const WORK = new Float64Array( 1 );
	const info = dorg2r( 0, 0, 0, A, 1, 1, 0, TAU, 1, 0, WORK, 1, 0 );
	assert.equal( info, tc.INFO, 'INFO' );
});

test( 'dorg2r: 5x3_orthogonal (verify Q^T Q = I)', function t() {
	let i, j, k;

	const tc = _5x3_orthogonal;
	const result = computeQ( 5, 3, 3, [
		1,
		2,
		1,
		4,
		1,
		3,
		2,
		3,
		2,
		1,
		1,
		4,
		3,
		2,
		1
	]);
	assert.equal( result.info, tc.INFO, 'INFO' );
	assertArrayClose( toArray( result.Q ), tc.Q, 1e-14, 'Q' );
	const Q = result.Q;
	const M = 5;
	const N = 3;
	const QtQ = new Float64Array( N * N );
	for ( i = 0; i < N; i++ ) {
		for ( j = 0; j < N; j++ ) {
			for ( k = 0; k < M; k++ ) {
				QtQ[ j * N + i ] += Q[ i * M + k ] * Q[ j * M + k ];
			}
		}
	}
	assertArrayClose( toArray( QtQ ), tc.QtQ, 1e-14, 'QtQ' );
	for ( i = 0; i < N; i++ ) {
		for ( j = 0; j < N; j++ ) {
			if ( i === j ) {
				assertClose( QtQ[ j * N + i ], 1.0, 1e-14, 'QtQ diagonal [' + i + '][' + j + ']' ); // eslint-disable-line max-len
			} else {
				assert.ok( Math.abs( QtQ[ j * N + i ] ) < 1e-14, 'QtQ off-diagonal [' + i + '][' + j + '] should be ~0, got ' + QtQ[ j * N + i ] ); // eslint-disable-line max-len
			}
		}
	}
});

test( 'dorg2r: 6x4_k4', function t() {
	const result = computeQ( 6, 4, 4, [
		2,
		1,
		3,
		1,
		1,
		4,
		2,
		3,
		3,
		2,
		5,
		2,
		1,
		3,
		1,
		4,
		2,
		1,
		4,
		1,
		1,
		2,
		1,
		3
	]);
	const tc = _6x4_k4;
	assert.equal( result.info, tc.INFO, 'INFO' );
	assertArrayClose( toArray( result.Q ), tc.Q, 1e-14, 'Q' );
});
