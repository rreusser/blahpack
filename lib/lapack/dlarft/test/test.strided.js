/* eslint-disable no-restricted-syntax */

import test from 'node:test';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dlarft from './../lib/strided.js';

// FIXTURES //

import fwd_col_5x3 from './fixtures/fwd_col_5x3.json' with { type: 'json' };
import fwd_col_3x2 from './fixtures/fwd_col_3x2.json' with { type: 'json' };
import bwd_col_5x2 from './fixtures/bwd_col_5x2.json' with { type: 'json' };
import fwd_col_tau_zero from './fixtures/fwd_col_tau_zero.json' with { type: 'json' };
import fwd_row_5x3 from './fixtures/fwd_row_5x3.json' with { type: 'json' };
import fwd_row_3x2 from './fixtures/fwd_row_3x2.json' with { type: 'json' };
import bwd_row_5x2 from './fixtures/bwd_row_5x2.json' with { type: 'json' };
import bwd_col_tau_zero from './fixtures/bwd_col_tau_zero.json' with { type: 'json' };

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
	let relErr, i;
	for ( i = 0; i < expected.length; i++ ) {
		relErr = Math.abs( actual[ i ] - expected[ i ] ) / Math.max( Math.abs( expected[ i ] ), 1.0 ); // eslint-disable-line max-len
		if ( !( relErr <= tol ) ) {
			throw new Error( msg + '[' + i + ']: expected ' + expected[ i ] + ', got ' + actual[ i ] ); // eslint-disable-line max-len
		}
	}
}

// Fortran print_matrix extracts MxN submatrix from LDA-strided storage.
// In JS we use exact-size storage (LDT=K, strideT1=1, strideT2=K).

test( 'dlarft: fwd col 5x3', function t() {

	const tc = fwd_col_5x3;
	const V = new Float64Array( 6 * 3 );
	V[ 0 + 0 * 6 ] = 1;
	V[ 1 + 0 * 6 ] = 0.5;
	V[ 1 + 1 * 6 ] = 1;
	V[ 2 + 0 * 6 ] = 0.25;
	V[ 2 + 1 * 6 ] = 0.5;
	V[ 2 + 2 * 6 ] = 1;
	V[ 3 + 0 * 6 ] = 0.125;
	V[ 3 + 1 * 6 ] = 0.25;
	V[ 3 + 2 * 6 ] = 0.5;
	V[ 4 + 0 * 6 ] = 0.0625;
	V[ 4 + 1 * 6 ] = 0.125;
	V[ 4 + 2 * 6 ] = 0.25;
	const TAU = new Float64Array( [ 1.2, 1.5, 1.1 ] );
	const T = new Float64Array( 3 * 3 );
	dlarft( 'forward', 'columnwise', 5, 3, V, 1, 6, 0, TAU, 1, 0, T, 1, 3, 0 );
	assertArrayClose( T, tc.T, 1e-14, 'T' );
});

test( 'dlarft: fwd col 3x2', function t() {

	const tc = fwd_col_3x2;
	const V = new Float64Array( 6 * 2 );
	V[ 0 + 0 * 6 ] = 1;
	V[ 1 + 0 * 6 ] = 2;
	V[ 1 + 1 * 6 ] = 1;
	V[ 2 + 0 * 6 ] = 3;
	V[ 2 + 1 * 6 ] = 4;
	const TAU = new Float64Array( [ 0.8, 1.2 ] );
	const T = new Float64Array( 2 * 2 );
	dlarft( 'forward', 'columnwise', 3, 2, V, 1, 6, 0, TAU, 1, 0, T, 1, 2, 0 );
	assertArrayClose( T, tc.T, 1e-14, 'T' );
});

test( 'dlarft: bwd col 5x2', function t() {

	const tc = bwd_col_5x2;
	const V = new Float64Array( 6 * 2 );
	V[ 0 + 0 * 6 ] = 0.5;
	V[ 0 + 1 * 6 ] = 0.25;
	V[ 1 + 0 * 6 ] = 0.25;
	V[ 1 + 1 * 6 ] = 0.125;
	V[ 2 + 0 * 6 ] = 0.125;
	V[ 2 + 1 * 6 ] = 0.0625;
	V[ 3 + 0 * 6 ] = 1.0;
	V[ 4 + 1 * 6 ] = 1.0;
	const TAU = new Float64Array( [ 1.5, 0.9 ] );
	const T = new Float64Array( 2 * 2 );
	dlarft( 'backward', 'columnwise', 5, 2, V, 1, 6, 0, TAU, 1, 0, T, 1, 2, 0 );
	assertArrayClose( T, tc.T, 1e-14, 'T' );
});

test( 'dlarft: fwd col tau zero', function t() {

	const tc = fwd_col_tau_zero;
	const V = new Float64Array( 6 * 2 );
	V[ 0 + 0 * 6 ] = 1;
	V[ 1 + 0 * 6 ] = 0.5;
	V[ 1 + 1 * 6 ] = 1;
	V[ 2 + 0 * 6 ] = 0.25;
	V[ 2 + 1 * 6 ] = 0.5;
	const TAU = new Float64Array( [ 1.2, 0.0 ] );
	const T = new Float64Array( 2 * 2 );
	dlarft( 'forward', 'columnwise', 3, 2, V, 1, 6, 0, TAU, 1, 0, T, 1, 2, 0 );
	assertArrayClose( T, tc.T, 1e-14, 'T' );
});

test( 'dlarft: fwd row 5x3', function t() {

	const tc = fwd_row_5x3;
	const V = new Float64Array( 6 * 6 );
	V[ 0 + 0 * 6 ] = 1;
	V[ 0 + 1 * 6 ] = 0.5;
	V[ 0 + 2 * 6 ] = 0.25;
	V[ 0 + 3 * 6 ] = 0.125;
	V[ 0 + 4 * 6 ] = 0.0625;
	V[ 1 + 1 * 6 ] = 1;
	V[ 1 + 2 * 6 ] = 0.5;
	V[ 1 + 3 * 6 ] = 0.25;
	V[ 1 + 4 * 6 ] = 0.125;
	V[ 2 + 2 * 6 ] = 1;
	V[ 2 + 3 * 6 ] = 0.5;
	V[ 2 + 4 * 6 ] = 0.25;
	const TAU = new Float64Array( [ 1.2, 1.5, 1.1 ] );
	const T = new Float64Array( 3 * 3 );
	dlarft( 'forward', 'rowwise', 5, 3, V, 1, 6, 0, TAU, 1, 0, T, 1, 3, 0 );
	assertArrayClose( T, tc.T, 1e-14, 'T' );
});

test( 'dlarft: fwd row 3x2', function t() {

	const tc = fwd_row_3x2;
	const V = new Float64Array( 6 * 6 );
	V[ 0 + 0 * 6 ] = 1;
	V[ 0 + 1 * 6 ] = 2;
	V[ 0 + 2 * 6 ] = 3;
	V[ 1 + 1 * 6 ] = 1;
	V[ 1 + 2 * 6 ] = 4;
	const TAU = new Float64Array( [ 0.8, 1.2 ] );
	const T = new Float64Array( 2 * 2 );
	dlarft( 'forward', 'rowwise', 3, 2, V, 1, 6, 0, TAU, 1, 0, T, 1, 2, 0 );
	assertArrayClose( T, tc.T, 1e-14, 'T' );
});

test( 'dlarft: bwd row 5x2', function t() {

	const tc = bwd_row_5x2;
	const V = new Float64Array( 6 * 6 );
	V[ 0 + 0 * 6 ] = 0.5;
	V[ 0 + 1 * 6 ] = 0.25;
	V[ 0 + 2 * 6 ] = 0.125;
	V[ 0 + 3 * 6 ] = 1.0;
	V[ 0 + 4 * 6 ] = 0.0;
	V[ 1 + 0 * 6 ] = 0.25;
	V[ 1 + 1 * 6 ] = 0.125;
	V[ 1 + 2 * 6 ] = 0.0625;
	V[ 1 + 3 * 6 ] = 0.0;
	V[ 1 + 4 * 6 ] = 1.0;
	const TAU = new Float64Array( [ 1.5, 0.9 ] );
	const T = new Float64Array( 2 * 2 );
	dlarft( 'backward', 'rowwise', 5, 2, V, 1, 6, 0, TAU, 1, 0, T, 1, 2, 0 );
	assertArrayClose( T, tc.T, 1e-14, 'T' );
});

test( 'dlarft: bwd col tau zero', function t() {

	const tc = bwd_col_tau_zero;
	const V = new Float64Array( 6 * 2 );
	V[ 0 + 0 * 6 ] = 0.5;
	V[ 0 + 1 * 6 ] = 0.25;
	V[ 1 + 0 * 6 ] = 0.25;
	V[ 1 + 1 * 6 ] = 0.125;
	V[ 2 + 0 * 6 ] = 0.125;
	V[ 2 + 1 * 6 ] = 0.0625;
	V[ 3 + 0 * 6 ] = 1.0;
	V[ 4 + 1 * 6 ] = 1.0;
	const TAU = new Float64Array( [ 0.0, 0.9 ] );
	const T = new Float64Array( 2 * 2 );
	dlarft( 'backward', 'columnwise', 5, 2, V, 1, 6, 0, TAU, 1, 0, T, 1, 2, 0 );
	assertArrayClose( T, tc.T, 1e-14, 'T' );
});

test( 'dlarft: N=0 quick return', function t() {
	const TAU = new Float64Array( [ 1.0 ] );
	const T = new Float64Array( [ 99 ] );
	const V = new Float64Array( 1 );
	dlarft( 'forward', 'columnwise', 0, 1, V, 1, 1, 0, TAU, 1, 0, T, 1, 1, 0 );
	if ( T[ 0 ] !== 99 ) {
		throw new Error( 'T changed on N=0' );
	}
});

test( 'dlarft: fwd col with trailing zeros in V (exercises lastv assignment, lines 62-63)', function t() { // eslint-disable-line max-len

	const V = new Float64Array( 8 * 2 );
	V[ 0 + 0 * 8 ] = 1;
	V[ 1 + 0 * 8 ] = 0.5;
	V[ 2 + 0 * 8 ] = 0.25;
	V[ 3 + 0 * 8 ] = 0.125;
	V[ 4 + 0 * 8 ] = 0.0;
	V[ 5 + 0 * 8 ] = 0.0;
	V[ 1 + 1 * 8 ] = 1;
	V[ 2 + 1 * 8 ] = 0.5;
	V[ 3 + 1 * 8 ] = 0.25;
	V[ 4 + 1 * 8 ] = 0.125;
	V[ 5 + 1 * 8 ] = 0.0625;
	const TAU = new Float64Array( [ 1.2, 1.5 ] );
	const T = new Float64Array( 2 * 2 );
	dlarft( 'forward', 'columnwise', 6, 2, V, 1, 8, 0, TAU, 1, 0, T, 1, 2, 0 );
	if ( T[ 0 ] !== 1.2 ) {
		throw new Error( 'T[0,0] should be TAU[0]=1.2, got ' + T[ 0 ] );
	}
	if ( T[ 1 + 1 * 2 ] !== 1.5 ) {
		throw new Error( 'T[1,1] should be TAU[1]=1.5, got ' + T[ 1 + 1 * 2 ] );
	}
});

test( 'dlarft: fwd row with trailing zeros in V (exercises lastv assignment, lines 86-87)', function t() { // eslint-disable-line max-len

	const V = new Float64Array( 8 * 8 );
	V[ 0 + 0 * 8 ] = 1;
	V[ 0 + 1 * 8 ] = 0.5;
	V[ 0 + 2 * 8 ] = 0.25;
	V[ 0 + 3 * 8 ] = 0.125;
	V[ 0 + 4 * 8 ] = 0.0;
	V[ 0 + 5 * 8 ] = 0.0;
	V[ 1 + 1 * 8 ] = 1;
	V[ 1 + 2 * 8 ] = 0.5;
	V[ 1 + 3 * 8 ] = 0.25;
	V[ 1 + 4 * 8 ] = 0.125;
	V[ 1 + 5 * 8 ] = 0.0625;
	const TAU = new Float64Array( [ 1.2, 1.5 ] );
	const T = new Float64Array( 2 * 2 );
	dlarft( 'forward', 'rowwise', 6, 2, V, 1, 8, 0, TAU, 1, 0, T, 1, 2, 0 );
	if ( T[ 0 ] !== 1.2 ) {
		throw new Error( 'T[0,0] should be TAU[0]=1.2, got ' + T[ 0 ] );
	}
});

test( 'dlarft: bwd col with leading zeros in V (exercises lastv assignment, lines 133-137)', function t() { // eslint-disable-line max-len

	const V = new Float64Array( 8 * 3 );
	V[ 0 + 0 * 8 ] = 0.5;
	V[ 1 + 0 * 8 ] = 0.25;
	V[ 2 + 0 * 8 ] = 0.125;
	V[ 3 + 0 * 8 ] = 1.0;
	V[ 0 + 1 * 8 ] = 0.0;
	V[ 1 + 1 * 8 ] = 0.3;
	V[ 2 + 1 * 8 ] = 0.15;
	V[ 4 + 1 * 8 ] = 1.0;
	V[ 0 + 2 * 8 ] = 0.0;
	V[ 1 + 2 * 8 ] = 0.0;
	V[ 2 + 2 * 8 ] = 0.1;
	V[ 5 + 2 * 8 ] = 1.0;
	const TAU = new Float64Array( [ 1.5, 0.8, 1.1 ] );
	const T = new Float64Array( 3 * 3 );
	dlarft( 'backward', 'columnwise', 6, 3, V, 1, 8, 0, TAU, 1, 0, T, 1, 3, 0 );
	if ( T[ 0 ] !== 1.5 ) {
		throw new Error( 'T[0,0] should be 1.5, got ' + T[ 0 ] );
	}
	if ( T[ 1 + 1 * 3 ] !== 0.8 ) {
		throw new Error( 'T[1,1] should be 0.8, got ' + T[ 1 + 1 * 3 ] );
	}
	if ( T[ 2 + 2 * 3 ] !== 1.1 ) {
		throw new Error( 'T[2,2] should be 1.1, got ' + T[ 2 + 2 * 3 ] );
	}
});

test( 'dlarft: bwd row with leading zeros in V (exercises lastv=jj+1, lines 155-159)', function t() { // eslint-disable-line max-len

	const V = new Float64Array( 8 * 8 );
	V[ 0 + 0 * 8 ] = 0.5;
	V[ 0 + 1 * 8 ] = 0.25;
	V[ 0 + 2 * 8 ] = 0.125;
	V[ 0 + 3 * 8 ] = 0.1;
	V[ 0 + 4 * 8 ] = 1.0;
	V[ 1 + 0 * 8 ] = 0.0;
	V[ 1 + 1 * 8 ] = 0.3;
	V[ 1 + 2 * 8 ] = 0.15;
	V[ 1 + 3 * 8 ] = 0.1;
	V[ 1 + 5 * 8 ] = 1.0;
	V[ 2 + 0 * 8 ] = 0.0;
	V[ 2 + 1 * 8 ] = 0.0;
	V[ 2 + 2 * 8 ] = 0.1;
	V[ 2 + 3 * 8 ] = 0.05;
	V[ 2 + 6 * 8 ] = 1.0;
	const TAU = new Float64Array( [ 1.5, 0.8, 1.1 ] );
	const T = new Float64Array( 3 * 3 );
	dlarft( 'backward', 'rowwise', 7, 3, V, 1, 8, 0, TAU, 1, 0, T, 1, 3, 0 );
	if ( T[ 0 ] !== 1.5 ) {
		throw new Error( 'T[0,0] should be 1.5, got ' + T[ 0 ] );
	}
});

test( 'dlarft: bwd row, non-zero V triggers break (lines 156-157)', function t() { // eslint-disable-line max-len

	const V = new Float64Array( 8 * 8 );
	V[ 0 + 0 * 8 ] = 0.5;
	V[ 0 + 1 * 8 ] = 0.25;
	V[ 0 + 2 * 8 ] = 0.125;
	V[ 0 + 3 * 8 ] = 0.1;
	V[ 0 + 4 * 8 ] = 1.0;
	V[ 1 + 0 * 8 ] = 0.3;
	V[ 1 + 1 * 8 ] = 0.3;
	V[ 1 + 2 * 8 ] = 0.15;
	V[ 1 + 3 * 8 ] = 0.1;
	V[ 1 + 5 * 8 ] = 1.0;
	V[ 2 + 0 * 8 ] = 0.0;
	V[ 2 + 1 * 8 ] = 0.0;
	V[ 2 + 2 * 8 ] = 0.1;
	V[ 2 + 3 * 8 ] = 0.05;
	V[ 2 + 6 * 8 ] = 1.0;
	const TAU = new Float64Array( [ 1.5, 0.8, 1.1 ] );
	const T = new Float64Array( 3 * 3 );
	dlarft( 'backward', 'rowwise', 7, 3, V, 1, 8, 0, TAU, 1, 0, T, 1, 3, 0 );
	if ( T[ 0 ] !== 1.5 ) {
		throw new Error( 'T[0,0] should be 1.5, got ' + T[ 0 ] );
	}
});

test( 'dlarft: bwd col K=1 (exercises line 179: prevlastv set, i=0 else branch)', function t() { // eslint-disable-line max-len

	const V = new Float64Array( 8 * 3 );
	V[ 0 + 0 * 8 ] = 0.5;
	V[ 1 + 0 * 8 ] = 0.25;
	V[ 2 + 0 * 8 ] = 0.125;
	V[ 3 + 0 * 8 ] = 1.0;
	V[ 0 + 1 * 8 ] = 0.3;
	V[ 1 + 1 * 8 ] = 0.15;
	V[ 2 + 1 * 8 ] = 0.075;
	V[ 4 + 1 * 8 ] = 1.0;
	V[ 0 + 2 * 8 ] = 0.2;
	V[ 1 + 2 * 8 ] = 0.1;
	V[ 2 + 2 * 8 ] = 0.05;
	V[ 5 + 2 * 8 ] = 1.0;
	const TAU = new Float64Array( [ 1.2, 0.8, 1.1 ] );
	const T = new Float64Array( 3 * 3 );
	dlarft( 'backward', 'columnwise', 6, 3, V, 1, 8, 0, TAU, 1, 0, T, 1, 3, 0 );
	if ( T[ 0 ] !== 1.2 ) {
		throw new Error( 'T[0,0] should be 1.2, got ' + T[ 0 ] );
	}
	if ( T[ 1 + 1 * 3 ] !== 0.8 ) {
		throw new Error( 'T[1,1] should be 0.8, got ' + T[ 1 + 1 * 3 ] );
	}
	if ( T[ 2 + 2 * 3 ] !== 1.1 ) {
		throw new Error( 'T[2,2] should be 1.1, got ' + T[ 2 + 2 * 3 ] );
	}
});

/**
* Checks the backward block-reflector identity `H(k)...H(2)H(1) = I - Y*T*Y^T`, where column `i` of `Y` is the vector of the `i`-th reflector.
*
* @private
* @param {Function} vec - returns element `r` of reflector `i`
* @param {NonNegativeInteger} N - order of the reflectors
* @param {NonNegativeInteger} K - number of reflectors
* @param {Float64Array} TAU - scalar factors
* @param {Float64Array} T - lower triangular factor (column-major, LDT=K)
* @param {string} msg - assertion message
*/
function assertBackwardBlockReflector( vec, N, K, TAU, T, msg ) {
	const H = new Float64Array( N * N );
	const W = new Float64Array( N );
	let expected;
	let actual;
	let i;
	let r;
	let c;
	let s;
	let p;
	let q;
	for ( r = 0; r < N; r++ ) {
		H[ r + ( r * N ) ] = 1.0;
	}
	// H := H(i) * H for i = 0..K-1, giving H(K-1)...H(0):
	for ( i = 0; i < K; i++ ) {
		for ( c = 0; c < N; c++ ) {
			s = 0.0;
			for ( r = 0; r < N; r++ ) {
				s += vec( r, i ) * H[ r + ( c * N ) ];
			}
			W[ c ] = s;
		}
		for ( c = 0; c < N; c++ ) {
			for ( r = 0; r < N; r++ ) {
				H[ r + ( c * N ) ] -= TAU[ i ] * vec( r, i ) * W[ c ];
			}
		}
	}
	for ( r = 0; r < N; r++ ) {
		for ( c = 0; c < N; c++ ) {
			s = 0.0;
			for ( p = 0; p < K; p++ ) {
				for ( q = 0; q <= p; q++ ) {
					s += vec( r, p ) * T[ p + ( q * K ) ] * vec( c, q );
				}
			}
			expected = ( ( r === c ) ? 1.0 : 0.0 ) - s;
			actual = H[ r + ( c * N ) ];
			if ( !( Math.abs( actual - expected ) <= 1e-13 ) ) {
				throw new Error( msg + ' (' + r + ',' + c + '): expected ' + expected + ', got ' + actual );
			}
		}
	}
}

test( 'dlarft: bwd col with dense V (leading-zero scan exits on its first element) satisfies H = I - V*T*V^T', function t() {
	const N = 6;
	const K = 3;
	const V = new Float64Array( [
		0.3, -0.2, 0.5, 1.0, 0.0, 0.0,
		0.4, 0.1, -0.6, 0.7, 1.0, 0.0,
		-0.5, 0.2, 0.3, 0.1, -0.4, 1.0
	] );
	const TAU = new Float64Array( [ 1.2, 0.8, 1.1 ] );
	const T = new Float64Array( K * K );
	dlarft( 'backward', 'columnwise', N, K, V, 1, N, 0, TAU, 1, 0, T, 1, K, 0 );
	assertBackwardBlockReflector( function vec( r, i ) {
		return V[ r + ( i * N ) ];
	}, N, K, TAU, T, 'bwd col' );
});

test( 'dlarft: bwd row with dense V (leading-zero scan exits on its first element) satisfies H = I - V^T*T*V', function t() {
	const N = 6;
	const K = 3;
	const VC = [
		0.3, -0.2, 0.5, 1.0, 0.0, 0.0,
		0.4, 0.1, -0.6, 0.7, 1.0, 0.0,
		-0.5, 0.2, 0.3, 0.1, -0.4, 1.0
	];
	const V = new Float64Array( K * N );
	const TAU = new Float64Array( [ 1.2, 0.8, 1.1 ] );
	const T = new Float64Array( K * K );
	let i;
	let r;

	// Row-wise storage: reflector i is row i of V (K-by-N, column-major, LDV=K).
	for ( i = 0; i < K; i++ ) {
		for ( r = 0; r < N; r++ ) {
			V[ i + ( r * K ) ] = VC[ r + ( i * N ) ];
		}
	}
	dlarft( 'backward', 'rowwise', N, K, V, 1, K, 0, TAU, 1, 0, T, 1, K, 0 );
	assertBackwardBlockReflector( function vec( r, j ) {
		return V[ j + ( r * K ) ];
	}, N, K, TAU, T, 'bwd row' );
});
