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

test( 'zggsvd3: subnormal A or B is rank zero against the UNFL-floored tolerance (ticket 0089)', function t() {
	// Reference: TOLA = MAX(M,N)*MAX(ANORM,UNFL)*ULP with UNFL = DLAMCH('S') = 2^-1022 and ULP = DLAMCH('P') = 2^-52, so for ANORM < UNFL the tolerance is MAX(M,N)*2^-1074 = 2*4.94e-324. ZGGSVP3 counts a diagonal entry toward the rank only if ABS(A(I,I)).GT.TOLA, so entries of modulus 2^-1074 (the smallest subnormal) give rank 0. With UNFL = 0 the tolerance underflows to 0 and the same entries count as rank 2.
	var RWORK;
	var ALPHA;
	var IWORK;
	var BETA;
	var WORK;
	var info;
	var A;
	var B;
	var K;
	var L;
	var U;
	var V;
	var Q;

	ALPHA = new Float64Array( 2 );
	BETA = new Float64Array( 2 );
	U = new Complex128Array( 4 );
	V = new Complex128Array( 4 );
	Q = new Complex128Array( 4 );
	WORK = new Complex128Array( 500 );
	RWORK = new Float64Array( 8 );
	IWORK = new Int32Array( 2 );
	K = new Int32Array( 1 );
	L = new Int32Array( 1 );

	// A = diag( 2^-1074, 2^-1074 ), B = 0 (TOLA case):
	A = new Complex128Array( [ 5e-324, 0.0, 0.0, 0.0, 0.0, 0.0, 5e-324, 0.0 ] );
	B = new Complex128Array( 4 );
	info = zggsvd3( 'compute-U', 'compute-V', 'compute-Q', 2, 2, 2, K, L, A, 1, 2, 0, B, 1, 2, 0, ALPHA, 1, 0, BETA, 1, 0, U, 1, 2, 0, V, 1, 2, 0, Q, 1, 2, 0, WORK, 1, 0, RWORK, 1, 0, IWORK, 1, 0 );
	assert.equal( info, 0, 'info (tola)' );
	assert.equal( K[ 0 ], 0, 'K (tola)' );
	assert.equal( L[ 0 ], 0, 'L (tola)' );

	// A = 0, B = diag( 2^-1074, 2^-1074 ) (TOLB case):
	A = new Complex128Array( 4 );
	B = new Complex128Array( [ 5e-324, 0.0, 0.0, 0.0, 0.0, 0.0, 5e-324, 0.0 ] );
	info = zggsvd3( 'compute-U', 'compute-V', 'compute-Q', 2, 2, 2, K, L, A, 1, 2, 0, B, 1, 2, 0, ALPHA, 1, 0, BETA, 1, 0, U, 1, 2, 0, V, 1, 2, 0, Q, 1, 2, 0, WORK, 1, 0, RWORK, 1, 0, IWORK, 1, 0 );
	assert.equal( info, 0, 'info (tolb)' );
	assert.equal( K[ 0 ], 0, 'K (tolb)' );
	assert.equal( L[ 0 ], 0, 'L (tolb)' );
});

/**
* Runs `zggsvd3` on deterministic M-by-N A and P-by-N B with a complex WORK of `lwork` elements and returns all outputs.
*
* @private
* @param {NonNegativeInteger} M - rows of A
* @param {NonNegativeInteger} N - columns
* @param {NonNegativeInteger} P - rows of B
* @param {NonNegativeInteger} lwork - WORK length (complex elements)
* @param {boolean} [full] - fill A and B from a quadratic phase (generically full rank) instead of a linear one (rank 2)
* @returns {Object} outputs
*/
function runWithWork( M, N, P, lwork, full ) {
	const A = new Complex128Array( Math.max( 1, M * N ) );
	const B = new Complex128Array( Math.max( 1, P * N ) );
	const U = new Complex128Array( Math.max( 1, M * M ) );
	const V = new Complex128Array( Math.max( 1, P * P ) );
	const Q = new Complex128Array( Math.max( 1, N * N ) );
	const ALPHA = new Float64Array( Math.max( 1, N ) );
	const BETA = new Float64Array( Math.max( 1, N ) );
	const IWORK = new Int32Array( Math.max( 1, N ) );
	const RWORK = new Float64Array( Math.max( 1, 2 * N ) );
	const WORK = new Complex128Array( lwork );
	const Av = new Float64Array( A.buffer );
	const Bv = new Float64Array( B.buffer );
	const K = new Int32Array( 1 );
	const L = new Int32Array( 1 );
	let i;
	for ( i = 0; i < 2 * M * N; i++ ) {
		Av[ i ] = ( full ) ? Math.sin( ( 0.37 * i * i ) + 1 ) : Math.sin( ( 3 * i ) + 1 );
	}
	for ( i = 0; i < 2 * P * N; i++ ) {
		Bv[ i ] = ( full ) ? Math.cos( ( 0.53 * i * i ) + 2 ) : Math.cos( ( 5 * i ) + 2 );
	}
	const info = zggsvd3( 'compute-U', 'compute-V', 'compute-Q', M, N, P, K, L, A, 1, Math.max( 1, M ), 0, B, 1, Math.max( 1, P ), 0, ALPHA, 1, 0, BETA, 1, 0, U, 1, Math.max( 1, M ), 0, V, 1, Math.max( 1, P ), 0, Q, 1, Math.max( 1, N ), 0, WORK, 1, 0, RWORK, 1, 0, IWORK, 1, 0 ); // eslint-disable-line max-len
	return {
		'info': info,
		'K': K[ 0 ],
		'L': L[ 0 ],
		'ALPHA': Array.from( ALPHA ),
		'BETA': Array.from( BETA ),
		'U': Array.from( new Float64Array( U.buffer ) ),
		'V': Array.from( new Float64Array( V.buffer ) ),
		'Q': Array.from( new Float64Array( Q.buffer ) ),
		'IWORK': Array.from( IWORK )
	};
}

test( 'zggsvd3: WORK of exactly the minimum (N + max(M,N,P)) matches a large WORK (ticket 0096)', function t() {
	// Old minimum was max(1,2N) = 6, but zggsvp3 gets WORK(N+1:) and needs max(M,N,P) = 5 there; the minimum is 8.
	const big = runWithWork( 5, 3, 2, 1000 );
	const out = runWithWork( 5, 3, 2, 8 );
	assert.deepStrictEqual( out, big );
	assert.throws( function bad() {
		runWithWork( 5, 3, 2, 7 );
	}, RangeError );
	assert.throws( function old() {
		runWithWork( 5, 3, 2, 6 );
	}, RangeError );
});

/**
* Returns a copy of `x` sorted in ascending order.
*
* @private
* @param {Array} x - values
* @returns {Array} sorted copy
*/
function sorted( x ) {
	return x.slice().sort( function cmp( a, b ) {
		return a - b;
	});
}

test( 'zggsvd3: WORK of exactly the minimum past zgeqp3\'s blocking threshold gives the generalized singular values of the optimal WORK (ticket 0100)', function t() {
	// min(P,N) = 130 > NX = 128 selects the blocked zgeqp3 in zggsvp3 at its optimum; with N + N+1 it falls back to the unblocked zlaqp2, as the reference's ZGEQP3 does. Pivoting may then differ in near ties, so compare the generalized singular value pairs:
	const N = 130;
	const lwork = N + N + 1;
	const big = runWithWork( 40, N, N, N + ( ( N + 1 ) * 32 ), true );
	const out = runWithWork( 40, N, N, lwork, true );
	let i;
	assert.strictEqual( out.info, 0, 'info' );
	assert.strictEqual( out.K, big.K, 'K' );
	assert.strictEqual( out.L, big.L, 'L' );
	assert.ok( out.L > 0, 'L > 0' );
	const a = sorted( out.ALPHA );
	const b = sorted( big.ALPHA );
	const c = sorted( out.BETA );
	const d = sorted( big.BETA );
	for ( i = 0; i < N; i++ ) {
		assert.ok( Math.abs( a[ i ] - b[ i ] ) <= 1e-10, 'ALPHA[' + i + ']' );
		assert.ok( Math.abs( c[ i ] - d[ i ] ) <= 1e-10, 'BETA[' + i + ']' );
	}
	assert.throws( function bad() {
		runWithWork( 40, N, N, lwork - 1, true );
	}, RangeError );
});
