/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dgerq2 from '../../dgerq2/lib/base.js';
import dorgr2 from './../lib/ndarray.js';

// FIXTURES //

import _3x5_k3 from './fixtures/3x5_k3.json' with { type: 'json' };
import _3x3_k3 from './fixtures/3x3_k3.json' with { type: 'json' };
import _2x5_k1 from './fixtures/2x5_k1.json' with { type: 'json' };
import k_zero from './fixtures/k_zero.json' with { type: 'json' };
import m_zero from './fixtures/m_zero.json' with { type: 'json' };
import _3x6_orthogonal from './fixtures/3x6_orthogonal.json' with { type: 'json' };
import _4x6_k4 from './fixtures/4x6_k4.json' with { type: 'json' };

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
* Helper: set up a column-major matrix from row-by-row values,
* run dgerq2, then run dorgr2, return the Q matrix as a flat column-major array.
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
	const WORK = new Float64Array( M );

	// Compute RQ factorization
	info = dgerq2( M, N, A, 1, M, 0, TAU, 1, 0, WORK, 1, 0 );
	assert.equal( info, 0, 'dgerq2 info' );

	// Generate Q from reflectors
	info = dorgr2( M, N, K, A, 1, M, 0, TAU, 1, 0, WORK, 1, 0 );

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

test( 'dorgr2: 3x5_k3', function t() {
	const result = computeQ( 3, 5, 3, [
		2, 1, 3, 1, 4,
		1, 4, 2, 3, 2,
		3, 2, 5, 2, 1
	]);
	const tc = _3x5_k3;
	assert.equal( result.info, tc.INFO, 'INFO' );
	assertArrayClose( toArray( result.Q ), tc.Q, 1e-14, 'Q' );
});

test( 'dorgr2: 3x3_k3 (square)', function t() {
	const result = computeQ( 3, 3, 3, [
		4, 1, 2,
		3, 2, 1,
		1, 5, 3
	]);
	const tc = _3x3_k3;
	assert.equal( result.info, tc.INFO, 'INFO' );
	assertArrayClose( toArray( result.Q ), tc.Q, 1e-14, 'Q' );
});

test( 'dorgr2: 2x5_k1 (K < M, partial reflectors)', function t() {
	let info, i, j;

	const tc = _2x5_k1;
	const A = new Float64Array( 2 * 5 );
	const vals = [
		1, 2, 3, 4, 5,
		6, 7, 8, 9, 10
	];
	for ( i = 0; i < 2; i++ ) {
		for ( j = 0; j < 5; j++ ) {
			A[ j * 2 + i ] = vals[ i * 5 + j ];
		}
	}
	const TAU = new Float64Array( 2 );
	const WORK = new Float64Array( 2 );
	info = dgerq2( 2, 5, A, 1, 2, 0, TAU, 1, 0, WORK, 1, 0 );
	assert.equal( info, 0, 'dgerq2 info' );
	info = dorgr2( 2, 5, 1, A, 1, 2, 0, TAU, 1, 0, WORK, 1, 0 );
	assert.equal( info, tc.INFO, 'INFO' );
	assertArrayClose( toArray( A ), tc.Q, 1e-14, 'Q' );
});

test( 'dorgr2: k_zero (identity-like rows)', function t() {

	const tc = k_zero;
	const A = new Float64Array( 2 * 3 );
	A[ 0 ] = 99;
	A[ 2 ] = 88;
	A[ 4 ] = 77;
	A[ 1 ] = 66;
	A[ 3 ] = 55;
	A[ 5 ] = 44;
	const TAU = new Float64Array( 2 );
	const WORK = new Float64Array( 2 );
	const info = dorgr2( 2, 3, 0, A, 1, 2, 0, TAU, 1, 0, WORK, 1, 0 );
	assert.equal( info, tc.INFO, 'INFO' );
	assertArrayClose( toArray( A ), tc.Q, 1e-14, 'Q' );
});

test( 'dorgr2: m_zero (quick return)', function t() {

	const tc = m_zero;
	const A = new Float64Array( 1 );
	const TAU = new Float64Array( 1 );
	const WORK = new Float64Array( 1 );
	const info = dorgr2( 0, 0, 0, A, 1, 1, 0, TAU, 1, 0, WORK, 1, 0 );
	assert.equal( info, tc.INFO, 'INFO' );
});

test( 'dorgr2: 3x6_orthogonal (verify Q * Q^T = I)', function t() {
	let i, j, k;

	const tc = _3x6_orthogonal;
	const result = computeQ( 3, 6, 3, [
		1, 2, 1, 3, 2, 1,
		4, 1, 3, 2, 1, 4,
		2, 3, 2, 1, 4, 2
	]);
	assert.equal( result.info, tc.INFO, 'INFO' );
	assertArrayClose( toArray( result.Q ), tc.Q, 1e-14, 'Q' );
	const Q = result.Q;
	const M = 3;
	const N = 6;
	// Q*Q^T should be I_M (rows are orthonormal)
	const QQt = new Float64Array( M * M );
	for ( i = 0; i < M; i++ ) {
		for ( j = 0; j < M; j++ ) {
			for ( k = 0; k < N; k++ ) {
				QQt[ j * M + i ] += Q[ k * M + i ] * Q[ k * M + j ];
			}
		}
	}
	assertArrayClose( toArray( QQt ), tc.QQt, 1e-14, 'QQt' );
	for ( i = 0; i < M; i++ ) {
		for ( j = 0; j < M; j++ ) {
			if ( i === j ) {
				assertClose( QQt[ j * M + i ], 1.0, 1e-14, 'QQt diagonal [' + i + '][' + j + ']' ); // eslint-disable-line max-len
			} else {
				assert.ok( Math.abs( QQt[ j * M + i ] ) < 1e-14, 'QQt off-diagonal [' + i + '][' + j + '] should be ~0, got ' + QQt[ j * M + i ] ); // eslint-disable-line max-len
			}
		}
	}
});

test( 'dorgr2: 4x6_k4', function t() {
	const result = computeQ( 4, 6, 4, [
		2, 1, 3, 1, 2, 1,
		1, 4, 2, 3, 1, 2,
		3, 2, 5, 2, 4, 1,
		1, 3, 1, 4, 2, 3
	]);
	const tc = _4x6_k4;
	assert.equal( result.info, tc.INFO, 'INFO' );
	assertArrayClose( toArray( result.Q ), tc.Q, 1e-14, 'Q' );
});
