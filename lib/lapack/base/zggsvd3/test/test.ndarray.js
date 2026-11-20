/* eslint-disable no-restricted-syntax, stdlib/first-unit-test, max-len */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import zggsvd3 from './../lib/ndarray.js';


// FIXTURES //

import fxBasic from './fixtures/basic_3x3_2x3.json' with { type: 'json' };
import fxMltP from './fixtures/m_lt_p.json' with { type: 'json' };
import fxNoUVQ from './fixtures/no_uvq.json' with { type: 'json' };
import fxDiag from './fixtures/diag_4x4.json' with { type: 'json' };


// FUNCTIONS //

/**
* Asserts two numbers are approximately equal.
*
* @private
* @param {number} actual - actual
* @param {number} expected - expected
* @param {number} tol - tolerance
* @param {string} msg - message
*/
function assertClose( actual, expected, tol, msg ) {
	const relErr = Math.abs( actual - expected ) / Math.max( Math.abs( expected ), 1.0 );
	assert.ok( relErr <= tol, msg + ': expected ' + expected + ', got ' + actual );
}

/**
* Asserts two arrays are element-wise close.
*
* @private
* @param {Float64Array} actual - actual
* @param {NonNegativeInteger} offset - offset
* @param {integer} stride - stride
* @param {Array<number>} expected - expected
* @param {NonNegativeInteger} n - length
* @param {number} tol - tolerance
* @param {string} msg - message
*/
function assertArrayClose( actual, offset, stride, expected, n, tol, msg ) {
	let i;
	for ( i = 0; i < n; i++ ) {
		assertClose( actual[ offset + ( i * stride ) ], expected[ i ], tol, msg + '[' + i + ']' );
	}
}


// TESTS //

test( 'zggsvd3: basic 3x3 A, 2x3 B (complex)', function t() {

	const tc = fxBasic;
	const M = 3;
	const N = 3;
	const P = 2;
	const A = new Complex128Array( M * N );
	A.set( [ 1.0, 0.5 ], 0 + ( 0 * M ) );
	A.set( [ 4.0, 0.0 ], 1 + ( 0 * M ) );
	A.set( [ 7.0, -0.5 ], 2 + ( 0 * M ) );
	A.set( [ 2.0, 0.0 ], 0 + ( 1 * M ) );
	A.set( [ 5.0, 1.0 ], 1 + ( 1 * M ) );
	A.set( [ 8.0, 0.0 ], 2 + ( 1 * M ) );
	A.set( [ 3.0, -0.5 ], 0 + ( 2 * M ) );
	A.set( [ 6.0, 0.0 ], 1 + ( 2 * M ) );
	A.set( [ 10.0, 0.5 ], 2 + ( 2 * M ) );
	const B = new Complex128Array( P * N );
	B.set( [ 1.0, 0.0 ], 0 + ( 0 * P ) );
	B.set( [ 0.0, 0.0 ], 1 + ( 0 * P ) );
	B.set( [ 0.0, 0.0 ], 0 + ( 1 * P ) );
	B.set( [ 1.0, 0.0 ], 1 + ( 1 * P ) );
	B.set( [ 1.0, 0.5 ], 0 + ( 2 * P ) );
	B.set( [ 1.0, -0.5 ], 1 + ( 2 * P ) );

	const ALPHA = new Float64Array( N );
	const BETA = new Float64Array( N );
	const U = new Complex128Array( M * M );
	const V = new Complex128Array( P * P );
	const Q = new Complex128Array( N * N );
	const WORK = new Complex128Array( 500 );
	const RWORK = new Float64Array( 4 * N );
	const IWORK = new Int32Array( N );
	const K = new Int32Array( 1 );
	const L = new Int32Array( 1 );
	const info = zggsvd3( 'compute-U', 'compute-V', 'compute-Q', M, N, P, K, L, A, 1, M, 0, B, 1, P, 0, ALPHA, 1, 0, BETA, 1, 0, U, 1, M, 0, V, 1, P, 0, Q, 1, N, 0, WORK, 1, 0, RWORK, 1, 0, IWORK, 1, 0 );
	assert.equal( info, tc.info );
	assert.equal( K[ 0 ], tc.k );
	assert.equal( L[ 0 ], tc.l );
	assertArrayClose( ALPHA, 0, 1, tc.alpha, N, 1e-10, 'alpha' );
	assertArrayClose( BETA, 0, 1, tc.beta, N, 1e-10, 'beta' );
});

test( 'zggsvd3: M < P case (2x3 A, 3x3 B)', function t() {

	const tc = fxMltP;
	const M = 2;
	const N = 3;
	const P = 3;
	const A = new Complex128Array( M * N );
	A.set( [ 2.0, 0.5 ], 0 + ( 0 * M ) );
	A.set( [ 0.0, 0.0 ], 1 + ( 0 * M ) );
	A.set( [ 1.0, 0.0 ], 0 + ( 1 * M ) );
	A.set( [ 3.0, -0.5 ], 1 + ( 1 * M ) );
	A.set( [ 0.0, 0.0 ], 0 + ( 2 * M ) );
	A.set( [ 1.0, 0.0 ], 1 + ( 2 * M ) );
	const B = new Complex128Array( P * N );
	B.set( [ 1.0, 0.0 ], 0 + ( 0 * P ) );
	B.set( [ 4.0, -0.5 ], 1 + ( 0 * P ) );
	B.set( [ 7.0, 0.0 ], 2 + ( 0 * P ) );
	B.set( [ 2.0, 0.5 ], 0 + ( 1 * P ) );
	B.set( [ 5.0, 0.0 ], 1 + ( 1 * P ) );
	B.set( [ 8.0, -0.5 ], 2 + ( 1 * P ) );
	B.set( [ 3.0, 0.0 ], 0 + ( 2 * P ) );
	B.set( [ 6.0, 0.5 ], 1 + ( 2 * P ) );
	B.set( [ 10.0, 0.0 ], 2 + ( 2 * P ) );

	const ALPHA = new Float64Array( N );
	const BETA = new Float64Array( N );
	const U = new Complex128Array( M * M );
	const V = new Complex128Array( P * P );
	const Q = new Complex128Array( N * N );
	const WORK = new Complex128Array( 500 );
	const RWORK = new Float64Array( 4 * N );
	const IWORK = new Int32Array( N );
	const K = new Int32Array( 1 );
	const L = new Int32Array( 1 );
	const info = zggsvd3( 'compute-U', 'compute-V', 'compute-Q', M, N, P, K, L, A, 1, M, 0, B, 1, P, 0, ALPHA, 1, 0, BETA, 1, 0, U, 1, M, 0, V, 1, P, 0, Q, 1, N, 0, WORK, 1, 0, RWORK, 1, 0, IWORK, 1, 0 );
	assert.equal( info, tc.info );
	assert.equal( K[ 0 ], tc.k );
	assert.equal( L[ 0 ], tc.l );
	assertArrayClose( ALPHA, 0, 1, tc.alpha, N, 1e-10, 'alpha' );
	assertArrayClose( BETA, 0, 1, tc.beta, N, 1e-10, 'beta' );
});

test( 'zggsvd3: no U/V/Q', function t() {

	const tc = fxNoUVQ;
	const M = 3;
	const N = 3;
	const P = 2;
	const A = new Complex128Array( M * N );
	A.set( [ 1.0, 0.5 ], 0 + ( 0 * M ) );
	A.set( [ 4.0, 0.0 ], 1 + ( 0 * M ) );
	A.set( [ 7.0, -0.5 ], 2 + ( 0 * M ) );
	A.set( [ 2.0, 0.0 ], 0 + ( 1 * M ) );
	A.set( [ 5.0, 1.0 ], 1 + ( 1 * M ) );
	A.set( [ 8.0, 0.0 ], 2 + ( 1 * M ) );
	A.set( [ 3.0, -0.5 ], 0 + ( 2 * M ) );
	A.set( [ 6.0, 0.0 ], 1 + ( 2 * M ) );
	A.set( [ 10.0, 0.5 ], 2 + ( 2 * M ) );
	const B = new Complex128Array( P * N );
	B.set( [ 1.0, 0.0 ], 0 + ( 0 * P ) );
	B.set( [ 0.0, 0.0 ], 1 + ( 0 * P ) );
	B.set( [ 0.0, 0.0 ], 0 + ( 1 * P ) );
	B.set( [ 1.0, 0.0 ], 1 + ( 1 * P ) );
	B.set( [ 1.0, 0.5 ], 0 + ( 2 * P ) );
	B.set( [ 1.0, -0.5 ], 1 + ( 2 * P ) );

	const ALPHA = new Float64Array( N );
	const BETA = new Float64Array( N );
	const U = new Complex128Array( 1 );
	const V = new Complex128Array( 1 );
	const Q = new Complex128Array( 1 );
	const WORK = new Complex128Array( 500 );
	const RWORK = new Float64Array( 4 * N );
	const IWORK = new Int32Array( N );
	const K = new Int32Array( 1 );
	const L = new Int32Array( 1 );
	const info = zggsvd3( 'none', 'none', 'none', M, N, P, K, L, A, 1, M, 0, B, 1, P, 0, ALPHA, 1, 0, BETA, 1, 0, U, 1, 1, 0, V, 1, 1, 0, Q, 1, 1, 0, WORK, 1, 0, RWORK, 1, 0, IWORK, 1, 0 );
	assert.equal( info, tc.info );
	assert.equal( K[ 0 ], tc.k );
	assert.equal( L[ 0 ], tc.l );
	assertArrayClose( ALPHA, 0, 1, tc.alpha, N, 1e-10, 'alpha' );
	assertArrayClose( BETA, 0, 1, tc.beta, N, 1e-10, 'beta' );
});

test( 'zggsvd3: 4x4 diagonal A, 3x4 bidiagonal B', function t() {
	let sumsq, i;

	const tc = fxDiag;
	const M = 4;
	const N = 4;
	const P = 3;
	const A = new Complex128Array( M * N );
	A.set( [ 1.0, 0.0 ], 0 + ( 0 * M ) );
	A.set( [ 2.0, 0.0 ], 1 + ( 1 * M ) );
	A.set( [ 3.0, 0.0 ], 2 + ( 2 * M ) );
	A.set( [ 4.0, 0.0 ], 3 + ( 3 * M ) );
	const B = new Complex128Array( P * N );
	B.set( [ 1.0, 0.0 ], 0 + ( 0 * P ) );
	B.set( [ 1.0, 0.0 ], 0 + ( 1 * P ) );
	B.set( [ 1.0, 0.0 ], 1 + ( 1 * P ) );
	B.set( [ 1.0, 0.0 ], 1 + ( 2 * P ) );
	B.set( [ 1.0, 0.0 ], 2 + ( 2 * P ) );
	B.set( [ 1.0, 0.0 ], 2 + ( 3 * P ) );

	const ALPHA = new Float64Array( N );
	const BETA = new Float64Array( N );
	const U = new Complex128Array( M * M );
	const V = new Complex128Array( P * P );
	const Q = new Complex128Array( N * N );
	const WORK = new Complex128Array( 500 );
	const RWORK = new Float64Array( 4 * N );
	const IWORK = new Int32Array( N );
	const K = new Int32Array( 1 );
	const L = new Int32Array( 1 );
	const info = zggsvd3( 'compute-U', 'compute-V', 'compute-Q', M, N, P, K, L, A, 1, M, 0, B, 1, P, 0, ALPHA, 1, 0, BETA, 1, 0, U, 1, M, 0, V, 1, P, 0, Q, 1, N, 0, WORK, 1, 0, RWORK, 1, 0, IWORK, 1, 0 );
	assert.equal( info, tc.info );
	assert.equal( K[ 0 ], tc.k );
	assert.equal( L[ 0 ], tc.l );
	const kval = K[ 0 ];
	const lval = L[ 0 ];
	for ( i = 0; i < kval; i++ ) {
		assertClose( ALPHA[ i ], 1.0, 1e-12, 'alpha[' + i + '] = 1' );
		assertClose( BETA[ i ], 0.0, 1e-12, 'beta[' + i + '] = 0' );
	}
	for ( i = kval; i < kval + lval; i++ ) {
		sumsq = ( ALPHA[ i ] * ALPHA[ i ] ) + ( BETA[ i ] * BETA[ i ] );
		assertClose( sumsq, 1.0, 1e-10, 'alpha^2+beta^2=1 at ' + i );
	}
});

test( 'zggsvd3: U, V, Q satisfy the GSVD identity (shared R) for random rectangular A, B', function t() {
	// Regression: zggsvd3 forwarded jobu='compute-U' to ztgsja, which only recognized 'compute-vectors', so the Jacobi rotations were never applied to U/V/Q (residual ~1). Rows K..K+L-1 of (U^H A Q) scaled by BETA must equal rows 0..L-1 of (V^H B Q) scaled by ALPHA.
	const shapes = [ [ 5, 4, 4 ], [ 6, 5, 3 ], [ 4, 6, 5 ] ];
	let seed = 7;
	let res;
	let s;

	function rnd() {
		seed = ( seed * 16807 ) % 2147483647;
		return ( seed / 2147483647 ) - 0.5;
	}
	function randc( n ) {
		const a = new Complex128Array( n );
		const v = new Float64Array( a.buffer );
		let i;
		for ( i = 0; i < v.length; i++ ) {
			v[ i ] = rnd();
		}
		return a;
	}
	// Entry (i,j) of X^H * Y * Q where X is m-by-m, Y is m-by-N, Q is N-by-N (column-major interleaved views):
	function xhyq( X, Y, Q, m, N, i, j ) {
		let sr = 0.0;
		let si = 0.0;
		let a;
		let b;
		for ( a = 0; a < m; a++ ) {
			const xr = X[ 2 * ( a + ( i * m ) ) ];
			const xi = -X[ ( 2 * ( a + ( i * m ) ) ) + 1 ];
			for ( b = 0; b < N; b++ ) {
				const yr = Y[ 2 * ( a + ( b * m ) ) ];
				const yi = Y[ ( 2 * ( a + ( b * m ) ) ) + 1 ];
				const qr = Q[ 2 * ( b + ( j * N ) ) ];
				const qi = Q[ ( 2 * ( b + ( j * N ) ) ) + 1 ];
				const tr = ( yr * qr ) - ( yi * qi );
				const ti = ( yr * qi ) + ( yi * qr );
				sr += ( xr * tr ) - ( xi * ti );
				si += ( xr * ti ) + ( xi * tr );
			}
		}
		return [ sr, si ];
	}
	for ( s = 0; s < shapes.length; s++ ) {
		const M = shapes[ s ][ 0 ];
		const N = shapes[ s ][ 1 ];
		const P = shapes[ s ][ 2 ];
		const A = randc( M * N );
		const B = randc( P * N );
		const A0 = new Float64Array( A.buffer ).slice();
		const B0 = new Float64Array( B.buffer ).slice();
		const U = new Complex128Array( M * M );
		const V = new Complex128Array( P * P );
		const Q = new Complex128Array( N * N );
		const K = new Int32Array( 1 );
		const L = new Int32Array( 1 );
		const ALPHA = new Float64Array( N );
		const BETA = new Float64Array( N );
		const info = zggsvd3( 'compute-U', 'compute-V', 'compute-Q', M, N, P, K, L, A, 1, M, 0, B, 1, P, 0, ALPHA, 1, 0, BETA, 1, 0, U, 1, M, 0, V, 1, P, 0, Q, 1, N, 0, new Complex128Array( 1000 ), 1, 0, new Float64Array( 2 * N ), 1, 0, new Int32Array( N ), 1, 0 );
		assert.equal( info, 0, 'info' );
		const Uv = new Float64Array( U.buffer );
		const Vv = new Float64Array( V.buffer );
		const Qv = new Float64Array( Q.buffer );
		res = 0.0;
		for ( let i = K[ 0 ]; i < Math.min( K[ 0 ] + L[ 0 ], M ); i++ ) {
			for ( let j = 0; j < N; j++ ) {
				const ca = xhyq( Uv, A0, Qv, M, N, i, j );
				const cb = xhyq( Vv, B0, Qv, P, N, i - K[ 0 ], j );
				res = Math.max( res, Math.hypot( ( ca[ 0 ] * BETA[ i ] ) - ( cb[ 0 ] * ALPHA[ i ] ), ( ca[ 1 ] * BETA[ i ] ) - ( cb[ 1 ] * ALPHA[ i ] ) ) );
			}
		}
		assert.ok( res < 1e-12, 'M=' + M + ' N=' + N + ' P=' + P + ' residual ' + res );
	}
});
