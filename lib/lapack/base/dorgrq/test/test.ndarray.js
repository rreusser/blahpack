/* eslint-disable no-restricted-syntax, stdlib/first-unit-test, max-lines */

// MODULES //

import { readFileSync } from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dgerq2 from '../../dgerq2/lib/base.js';
import dgerqf from '../../dgerqf/lib/base.js';
import dorgrq from './../lib/ndarray.js';


// FIXTURES //

const FIXTURE_DIR = path.join( import.meta.dirname, '..', '..', '..', '..', '..', 'test', 'fixtures' ); // eslint-disable-line max-len
const LINES = readFileSync( path.join( FIXTURE_DIR, 'dorgrq.jsonl' ), 'utf8' ).trim().split( '\n' ); // eslint-disable-line max-len, node/no-sync
const FIXTURE = LINES.map( function parse( line ) {
	return JSON.parse( line );
} );


// FUNCTIONS //

/**
* Looks up a fixture case by name.
*
* @private
* @param {string} name - case name
* @returns {Object} fixture case
*/
function findCase( name ) {
	return FIXTURE.find( function find( t ) {
		return t.name === name;
	} );
}

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
* Verifies Q * Q^T = I for an M-by-N orthogonal matrix Q (real, column-major).
*
* @private
* @param {Float64Array} A - the matrix Q in column-major order
* @param {integer} M - number of rows
* @param {integer} N - number of columns
* @param {integer} LDA - leading dimension of A
* @param {number} tol - tolerance for comparison
*/
function assertOrthogonal( A, M, N, LDA, tol ) {
	let sum, i, j, k;

	for ( i = 0; i < M; i++ ) {
		for ( j = 0; j < M; j++ ) {
			sum = 0.0;
			for ( k = 0; k < N; k++ ) {
				// `A` is column-major: `A(i,k) = A[k*LDA + i]`
				sum += A[ ( k * LDA ) + i ] * A[ ( k * LDA ) + j ];
			}
			if ( i === j ) {
				assertClose( sum, 1.0, tol, 'QQT[' + i + ',' + j + ']' );
			} else {
				assert.ok( Math.abs( sum ) < tol, 'QQT[' + i + ',' + j + '] should be ~0, got ' + sum ); // eslint-disable-line max-len
			}
		}
	}
}


// TESTS //

test( 'dorgrq: 3x4_k3 (M < N, full K=M from RQ)', function t() {

	const tc = findCase( '3x4_k3' );
	const M = 3;
	const N = 4;
	const K = 3;
	const A = new Float64Array([
		2.0,
		1.0,
		3.0,
		1.0,
		4.0,
		2.0,
		3.0,
		2.0,
		5.0,
		1.0,
		3.0,
		2.0
	]);
	const TAU = new Float64Array( K );
	const WORK = new Float64Array( M * 32 );
	dgerq2( M, N, A, 1, M, 0, TAU, 1, 0, WORK, 1, 0 );
	const info = dorgrq( M, N, K, A, 1, M, 0, TAU, 1, 0, WORK, 1, 0 );
	assert.equal( info, tc.info );
	assertArrayClose( A, tc.A, 1e-13, 'A' );
	assertOrthogonal( A, M, N, M, 1e-13 );
});

test( 'dorgrq: 3x3_k3 (square, full K=M from RQ)', function t() {

	const tc = findCase( '3x3_k3' );
	const M = 3;
	const N = 3;
	const K = 3;
	const A = new Float64Array([
		4.0,
		1.0,
		2.0,
		1.0,
		3.0,
		1.0,
		2.0,
		1.0,
		5.0
	]);
	const TAU = new Float64Array( K );
	const WORK = new Float64Array( M * 32 );
	dgerq2( M, N, A, 1, M, 0, TAU, 1, 0, WORK, 1, 0 );
	const info = dorgrq( M, N, K, A, 1, M, 0, TAU, 1, 0, WORK, 1, 0 );
	assert.equal( info, tc.info );
	assertArrayClose( A, tc.A, 1e-13, 'A' );
	assertOrthogonal( A, M, N, M, 1e-13 );
});

test( 'dorgrq: 2x5_k2 (rectangular, M < N)', function t() {

	const tc = findCase( '2x5_k2' );
	const M = 2;
	const N = 5;
	const K = 2;
	const A = new Float64Array([
		1.0,
		6.0,
		2.0,
		7.0,
		3.0,
		8.0,
		4.0,
		9.0,
		5.0,
		10.0
	]);
	const TAU = new Float64Array( K );
	const WORK = new Float64Array( M * 32 );
	dgerq2( M, N, A, 1, M, 0, TAU, 1, 0, WORK, 1, 0 );
	const info = dorgrq( M, N, K, A, 1, M, 0, TAU, 1, 0, WORK, 1, 0 );
	assert.equal( info, tc.info );
	assertArrayClose( A, tc.A, 1e-13, 'A' );
	assertOrthogonal( A, M, N, M, 1e-13 );
});

test( 'dorgrq: k0_identity (K=0 produces identity in last M rows)', function t() {

	const tc = findCase( 'k0_identity' );
	const M = 3;
	const N = 3;
	const K = 0;
	const A = new Float64Array([
		9.0,
		9.0,
		9.0,
		9.0,
		9.0,
		9.0,
		9.0,
		9.0,
		9.0
	]);
	const TAU = new Float64Array( 1 );
	const WORK = new Float64Array( M * 32 );
	const info = dorgrq( M, N, K, A, 1, M, 0, TAU, 1, 0, WORK, 1, 0 );
	assert.equal( info, tc.info );
	assertArrayClose( A, tc.A, 1e-14, 'A' );
});

test( 'dorgrq: m0_quick (M=0 quick return)', function t() {

	const tc = findCase( 'm0_quick' );
	const A = new Float64Array( 1 );
	const TAU = new Float64Array( 1 );
	const WORK = new Float64Array( 1 );
	const info = dorgrq( 0, 4, 0, A, 1, 1, 0, TAU, 1, 0, WORK, 1, 0 );
	assert.equal( info, tc.info );
});

test( 'dorgrq: 1x1_k1', function t() {

	const tc = findCase( '1x1_k1' );
	const M = 1;
	const N = 1;
	const K = 1;
	const A = new Float64Array([ 7.0 ]);
	const TAU = new Float64Array( 1 );
	const WORK = new Float64Array( M * 32 );
	dgerq2( M, N, A, 1, M, 0, TAU, 1, 0, WORK, 1, 0 );
	const info = dorgrq( M, N, K, A, 1, M, 0, TAU, 1, 0, WORK, 1, 0 );
	assert.equal( info, tc.info );
	assertArrayClose( A, tc.A, 1e-14, 'A' );
});

test( 'dorgrq: 3x4_k2 (K < M, matches Fortran reference)', function t() {

	// With K=2 < min(M,N)=3, calling DGERQF (which uses k=3) then DORGRQ (which uses k=2) is inconsistent — DGERQF stores reflector i in row i, while DORGRQ expects reflector i in row m-k+i = 1+i. The result is therefore NOT orthogonal in general, but our output should still match the Fortran reference exactly. // eslint-disable-line max-len
	const tc = findCase( '3x4_k2' );
	const M = 3;
	const N = 4;
	const K = 2;
	const A = new Float64Array([
		2.0,
		1.0,
		3.0,
		1.0,
		4.0,
		2.0,
		3.0,
		2.0,
		5.0,
		1.0,
		3.0,
		2.0
	]);
	const TAU = new Float64Array( M );
	const WORK = new Float64Array( M * 32 );
	dgerq2( M, N, A, 1, M, 0, TAU, 1, 0, WORK, 1, 0 );
	const info = dorgrq( M, N, K, A, 1, M, 0, TAU, 1, 0, WORK, 1, 0 );
	assert.equal( info, tc.info );
	assertArrayClose( A, tc.A, 1e-13, 'A' );
});

test( 'dorgrq: 35x40_k35_blocked fixture (K = 35 <= NX = 128: unblocked, as in the reference)', function t() {
	let i, j;

	const M = 35;
	const N = 40;
	const K = 35;
	const LDA = 35;
	const A = new Float64Array( LDA * N );
	const TAU = new Float64Array( K );
	const WORK = new Float64Array( M * 64 );
	for ( j = 0; j < N; j++ ) {
		for ( i = 0; i < M; i++ ) {
			A[ ( j * LDA ) + i ] = ( ( i + 1 + j + 1 ) / ( M + N ) ) + ( 0.1 * ( ( ( i + 1 ) * ( j + 1 ) ) % 7 ) ); // eslint-disable-line max-len
		}
	}
	dgerqf( M, N, A, 1, LDA, 0, TAU, 1, 0, WORK, 1, 0 );
	const info = dorgrq( M, N, K, A, 1, LDA, 0, TAU, 1, 0, WORK, 1, 0 );
	assert.equal( info, 0 );
	assertOrthogonal( A, M, N, LDA, 1e-10 );
});

test( 'dorgrq: 1x4_k1 (single row)', function t() {

	const tc = findCase( '1x4_k1' );
	const M = 1;
	const N = 4;
	const K = 1;
	const A = new Float64Array([ 1.0, 2.0, 3.0, 4.0 ]);
	const TAU = new Float64Array( 1 );
	const WORK = new Float64Array( M * 32 );
	dgerq2( M, N, A, 1, M, 0, TAU, 1, 0, WORK, 1, 0 );
	const info = dorgrq( M, N, K, A, 1, M, 0, TAU, 1, 0, WORK, 1, 0 );
	assert.equal( info, tc.info );
	assertArrayClose( A, tc.A, 1e-14, 'A' );
});

test( 'dorgrq: n0_quick (N=0 quick return)', function t() {

	const tc = findCase( 'n0_quick' );
	const A = new Float64Array( 1 );
	const TAU = new Float64Array( 1 );
	const WORK = new Float64Array( 1 );
	const info = dorgrq( 0, 0, 0, A, 1, 1, 0, TAU, 1, 0, WORK, 1, 0 );
	assert.equal( info, tc.info );
});

test( 'dorgrq: verifies Q*Q^T = I for 3x4_k3', function t() {

	const M = 3;
	const N = 4;
	const K = 3;
	const A = new Float64Array([
		2.0,
		1.0,
		3.0,
		1.0,
		4.0,
		2.0,
		3.0,
		2.0,
		5.0,
		1.0,
		3.0,
		2.0
	]);
	const TAU = new Float64Array( K );
	const WORK = new Float64Array( M * 32 );
	dgerq2( M, N, A, 1, M, 0, TAU, 1, 0, WORK, 1, 0 );
	dorgrq( M, N, K, A, 1, M, 0, TAU, 1, 0, WORK, 1, 0 );
	assertOrthogonal( A, M, N, M, 1e-14 );
});

test( 'dorgrq: K=2 < M=3, consistent reflectors → orthogonal Q', function t() {
	let i, j;

	// To get an orthogonal Q with K < M, generate K reflectors via DGERQF on a K x N matrix, then place them in the LAST K rows of an M x N A. // eslint-disable-line max-len
	const M = 3;
	const N = 4;
	const K = 2;
	const LDA = M;
	const Asrc = new Float64Array( K * N );
	const A = new Float64Array( LDA * N );
	const TAU = new Float64Array( K );
	const WORK = new Float64Array( M * 32 );
	for ( j = 0; j < N; j++ ) {
		for ( i = 0; i < K; i++ ) {
			Asrc[ ( j * K ) + i ] = ( ( i + 1 ) * 0.7 ) + ( ( j + 1 ) * 0.3 );
		}
	}
	dgerqf( K, N, Asrc, 1, K, 0, TAU, 1, 0, WORK, 1, 0 );

	// Copy reflector rows to the LAST K rows of A
	for ( j = 0; j < N; j++ ) {
		for ( i = 0; i < K; i++ ) {
			A[ ( j * LDA ) + ( M - K + i ) ] = Asrc[ ( j * K ) + i ];
		}
	}
	dorgrq( M, N, K, A, 1, LDA, 0, TAU, 1, 0, WORK, 1, 0 );
	assertOrthogonal( A, M, N, LDA, 1e-13 );
});

test( 'dorgrq: K=35, M=40 (K <= NX = 128: unblocked, as in the reference)', function t() {
	let x, i, j;

	const M = 40;
	const N = 40;
	const K = 35;
	const LDA = M;
	const Asrc = new Float64Array( K * N );
	const A = new Float64Array( LDA * N );
	const TAU = new Float64Array( K );
	const WORK = new Float64Array( M * 64 );
	const seed = 88888;
	x = seed;
	for ( j = 0; j < N; j++ ) {
		for ( i = 0; i < K; i++ ) {
			x = ( ( x * 1103515245 ) + 12345 ) & 0x7fffffff;
			Asrc[ ( j * K ) + i ] = ( ( x % 2000 ) - 1000 ) / 500.0;
		}
	}

	// Compute RQ on the K x N source. The reflectors live in the LAST K rows of Asrc.
	// For dorgrq applied to MxN with this K, copy the K reflector rows into rows M-K..M-1 of A.
	dgerqf( K, N, Asrc, 1, K, 0, TAU, 1, 0, WORK, 1, 0 );
	for ( j = 0; j < N; j++ ) {
		for ( i = 0; i < K; i++ ) {
			A[ ( j * LDA ) + ( M - K + i ) ] = Asrc[ ( j * K ) + i ];
		}
	}
	const info = dorgrq( M, N, K, A, 1, LDA, 0, TAU, 1, 0, WORK, 1, 0 );
	assert.equal( info, 0, 'info' );
	assertOrthogonal( A, M, N, LDA, 1e-10 );
});


// TESTS: WORKSPACE-ADAPTIVE BLOCKING (ticket 0100) //

const WS_N = 170; // K = 170 > NX = 128 (the ILAENV(3) crossover) and NB = 32: past the blocking threshold, two blocks
const WS_LDWORK = WS_N; // reference LDWORK (M)
const WS_NB = 32;

/**
* Factors a deterministic WS_N-by-WS_N matrix with `dgerqf` (ample WORK), returning its reflectors and scalar factors.
*
* @private
* @returns {Object} factorization
*/
function wsFactor() {
	const A = new Float64Array( WS_N * WS_N );
	const Av = A;
	const TAU = new Float64Array( WS_N );
	let i;
	for ( i = 0; i < Av.length; i++ ) {
		Av[ i ] = Math.sin( ( ( i + 1 ) * 7 ) + ( Math.floor( i / 70 ) * 13 ) );
	}
	dgerqf( WS_N, WS_N, A, 1, WS_N, 0, TAU, 1, 0, new Float64Array( ( WS_N * 64 ) + 4096 ), 1, 0 );
	return {
		'A': A,
		'TAU': TAU
	};
}

/**
* Runs `dorgrq` on a copy of the factorization with a WORK of `lwork` elements, returning the interleaved Q.
*
* @private
* @param {Object} F - factorization
* @param {NonNegativeInteger} lwork - workspace length
* @returns {Float64Array} Q (column-major, real)
*/
function wsRun( F, lwork ) {
	const A = new Float64Array( F.A );
	const info = dorgrq( WS_N, WS_N, WS_N, A, 1, WS_N, 0, F.TAU, 1, 0, new Float64Array( lwork ), 1, 0 );
	assert.equal( info, 0, 'info' );
	return A;
}

/**
* Returns the largest elementwise difference between two arrays.
*
* @private
* @param {Float64Array} x - first array
* @param {Float64Array} y - second array
* @returns {number} max |x - y|
*/
function wsMaxDiff( x, y ) {
	let d = 0.0;
	let i;
	for ( i = 0; i < x.length; i++ ) {
		d = Math.max( d, Math.abs( x[ i ] - y[ i ] ) );
	}
	return d;
}

/**
* Returns max |Q^H Q - I| for a square column-major Q.
*
* @private
* @param {Float64Array} Q - Q
* @returns {number} orthogonality error
*/
function wsOrthErr( Q ) {
	let err = 0.0;
	let re, a, b, i, j, k;
	for ( i = 0; i < WS_N; i++ ) {
		for ( j = 0; j < WS_N; j++ ) {
			re = ( i === j ) ? -1.0 : 0.0;
			for ( k = 0; k < WS_N; k++ ) {
				a = ( i * WS_N ) + k;
				b = ( j * WS_N ) + k;
				re += Q[ a ] * Q[ b ];
			}
			err = Math.max( err, Math.abs( re ) );
		}
	}
	return err;
}

test( 'dorgrq: WORK of the reference minimum max(1,M) past the blocking threshold (unblocked fallback) matches the optimum', function t() {
	const F = wsFactor();
	const opt = wsRun( F, WS_LDWORK * WS_NB );
	const got = wsRun( F, WS_LDWORK );
	assert.ok( wsMaxDiff( got, opt ) <= 1e-12, 'Q matches the optimum-WORK Q: ' + wsMaxDiff( got, opt ) );
	assert.ok( wsOrthErr( got ) <= 1e-12, 'Q^H Q = I: ' + wsOrthErr( got ) );
});

test( 'dorgrq: WORK of LDWORK*8 (shrunk block size NB = 8) past the blocking threshold matches the optimum', function t() {
	const F = wsFactor();
	const opt = wsRun( F, WS_LDWORK * WS_NB );
	const got = wsRun( F, ( WS_LDWORK * 8 ) + 3 );
	assert.ok( wsMaxDiff( got, opt ) <= 1e-12, 'Q matches the optimum-WORK Q: ' + wsMaxDiff( got, opt ) );
	assert.ok( wsOrthErr( got ) <= 1e-12, 'Q^H Q = I: ' + wsOrthErr( got ) );
});

test( 'dorgrq: WORK one element below the reference minimum max(1,M) throws', function t() {
	const F = wsFactor();
	assert.throws( function throws() {
		wsRun( F, WS_LDWORK - 1 );
	}, RangeError );
});


// TESTS: CROSSOVER FROM ILAENV (ticket 0049) //

test( 'dorgrq: between NB = 32 and the ILAENV(3) crossover NX = 128 (K = 64), the optimal WORK takes the unblocked path as the reference does', function t() {
	const n = 64;
	const A = new Float64Array( n * n );
	const TAU = new Float64Array( n );
	const Av = A;
	let bad, i;
	for ( i = 0; i < Av.length; i++ ) {
		Av[ i ] = Math.sin( ( ( i + 1 ) * 7 ) + ( Math.floor( i / ( n ) ) * 13 ) );
	}
	dgerqf( n, n, A, 1, n, 0, TAU, 1, 0, new Float64Array( ( n * 64 ) + 4096 ), 1, 0 );
	const Aopt = new Float64Array( A );
	const Amin = new Float64Array( A );

	// Optimal WORK (N*NB), NaN-poisoned past the unblocked minimum max(1,N):
	const W = new Float64Array( n * 32 );
	const Wv = W;
	for ( i = n; i < Wv.length; i++ ) {
		Wv[ i ] = NaN;
	}
	assert.equal( dorgrq( n, n, n, Aopt, 1, n, 0, TAU, 1, 0, W, 1, 0 ), 0, 'info' );
	assert.equal( dorgrq( n, n, n, Amin, 1, n, 0, TAU, 1, 0, new Float64Array( n ), 1, 0 ), 0, 'info' );

	// The blocked path would write its T factor past WORK[N-1]; the unblocked path leaves it untouched:
	bad = 0;
	for ( i = n; i < Wv.length; i++ ) {
		if ( Wv[ i ] === Wv[ i ] ) {
			bad += 1;
		}
	}
	assert.equal( bad, 0, 'WORK past the unblocked minimum is untouched' );

	// And Q is bit-identical to the unblocked result:
	const ov = Aopt;
	const mv = Amin;
	bad = 0;
	for ( i = 0; i < ov.length; i++ ) {
		if ( ov[ i ] !== mv[ i ] ) {
			bad += 1;
		}
	}
	assert.equal( bad, 0, 'Q matches the unblocked Q bit for bit' );
});
