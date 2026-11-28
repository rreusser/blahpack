/* eslint-disable no-restricted-syntax */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import dggsvd3 from './../lib/strided.js';

// FIXTURES //

import basic_3x3_2x3 from './fixtures/basic_3x3_2x3.json' with { type: 'json' };
import _2x3_3x3 from './fixtures/2x3_3x3.json' with { type: 'json' };
import no_uvq from './fixtures/no_uvq.json' with { type: 'json' };
import diag_4x4 from './fixtures/diag_4x4.json' with { type: 'json' };

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
* @param {*} offset - offset
* @param {*} stride - stride
* @param {*} expected - expected value
* @param {*} n - n
* @param {number} tol - tolerance
* @param {string} msg - assertion message
*/
function assertArrayClose( actual, offset, stride, expected, n, tol, msg ) {
	let i;
	for ( i = 0; i < n; i++ ) {
		assertClose( actual[ offset + ( i * stride ) ], expected[ i ], tol, msg + '[' + i + ']' ); // eslint-disable-line max-len
	}
}

// TESTS //

test( 'dggsvd3: basic 3x3 A, 2x3 B', function t() {

	const tc = basic_3x3_2x3;
	const M = 3;
	const N = 3;
	const P = 2;
	const A = new Float64Array( M * N );
	A[ 0 + 0*M ] = 1.0;
	A[ 0 + 1*M ] = 2.0;
	A[ 0 + 2*M ] = 3.0;
	A[ 1 + 0*M ] = 4.0;
	A[ 1 + 1*M ] = 5.0;
	A[ 1 + 2*M ] = 6.0;
	A[ 2 + 0*M ] = 7.0;
	A[ 2 + 1*M ] = 8.0;
	A[ 2 + 2*M ] = 10.0;
	const B = new Float64Array( P * N );
	B[ 0 + 0*P ] = 1.0;
	B[ 0 + 1*P ] = 0.0;
	B[ 0 + 2*P ] = 1.0;
	B[ 1 + 0*P ] = 0.0;
	B[ 1 + 1*P ] = 1.0;
	B[ 1 + 2*P ] = 1.0;
	const ALPHA = new Float64Array( N );
	const BETA = new Float64Array( N );
	const U = new Float64Array( M * M );
	const V = new Float64Array( P * P );
	const Q = new Float64Array( N * N );
	const WORK = new Float64Array( 200 );
	const IWORK = new Int32Array( N );
	const K = new Int32Array( 1 );
	const L = new Int32Array( 1 );
	const info = dggsvd3( 'compute-U', 'compute-V', 'compute-Q', M, N, P, K, L, A, 1, M, 0, B, 1, P, 0, ALPHA, 1, 0, BETA, 1, 0, U, 1, M, 0, V, 1, P, 0, Q, 1, N, 0, WORK, 1, 0, IWORK, 1, 0 );
	assert.equal( info, tc.info );
	assert.equal( K[ 0 ], tc.k );
	assert.equal( L[ 0 ], tc.l );
	assertArrayClose( ALPHA, 0, 1, tc.alpha, N, 1e-2, 'alpha' );
	assertArrayClose( BETA, 0, 1, tc.beta, N, 1e-2, 'beta' );
});

test( 'dggsvd3: 2x3 A, 3x3 B', function t() {

	const tc = _2x3_3x3;
	const M = 2;
	const N = 3;
	const P = 3;
	const A = new Float64Array( M * N );
	A[ 0 + 0*M ] = 2.0;
	A[ 0 + 1*M ] = 1.0;
	A[ 0 + 2*M ] = 0.0;
	A[ 1 + 0*M ] = 0.0;
	A[ 1 + 1*M ] = 3.0;
	A[ 1 + 2*M ] = 1.0;
	const B = new Float64Array( P * N );
	B[ 0 + 0*P ] = 1.0;
	B[ 0 + 1*P ] = 2.0;
	B[ 0 + 2*P ] = 3.0;
	B[ 1 + 0*P ] = 4.0;
	B[ 1 + 1*P ] = 5.0;
	B[ 1 + 2*P ] = 6.0;
	B[ 2 + 0*P ] = 7.0;
	B[ 2 + 1*P ] = 8.0;
	B[ 2 + 2*P ] = 10.0;
	const ALPHA = new Float64Array( N );
	const BETA = new Float64Array( N );
	const U = new Float64Array( M * M );
	const V = new Float64Array( P * P );
	const Q = new Float64Array( N * N );
	const WORK = new Float64Array( 200 );
	const IWORK = new Int32Array( N );
	const K = new Int32Array( 1 );
	const L = new Int32Array( 1 );
	const info = dggsvd3( 'compute-U', 'compute-V', 'compute-Q', M, N, P, K, L, A, 1, M, 0, B, 1, P, 0, ALPHA, 1, 0, BETA, 1, 0, U, 1, M, 0, V, 1, P, 0, Q, 1, N, 0, WORK, 1, 0, IWORK, 1, 0 );
	assert.equal( info, tc.info );
	assert.equal( K[ 0 ], tc.k );
	assert.equal( L[ 0 ], tc.l );
	assertArrayClose( ALPHA, 0, 1, tc.alpha, N, 1e-2, 'alpha' );
	assertArrayClose( BETA, 0, 1, tc.beta, N, 1e-2, 'beta' );
});

test( 'dggsvd3: no U/V/Q', function t() {

	const tc = no_uvq;
	const M = 3;
	const N = 3;
	const P = 2;
	const A = new Float64Array( M * N );
	A[ 0 + 0*M ] = 1.0;
	A[ 0 + 1*M ] = 2.0;
	A[ 0 + 2*M ] = 3.0;
	A[ 1 + 0*M ] = 4.0;
	A[ 1 + 1*M ] = 5.0;
	A[ 1 + 2*M ] = 6.0;
	A[ 2 + 0*M ] = 7.0;
	A[ 2 + 1*M ] = 8.0;
	A[ 2 + 2*M ] = 10.0;
	const B = new Float64Array( P * N );
	B[ 0 + 0*P ] = 1.0;
	B[ 0 + 1*P ] = 0.0;
	B[ 0 + 2*P ] = 1.0;
	B[ 1 + 0*P ] = 0.0;
	B[ 1 + 1*P ] = 1.0;
	B[ 1 + 2*P ] = 1.0;
	const ALPHA = new Float64Array( N );
	const BETA = new Float64Array( N );
	const U = new Float64Array( 1 );
	const V = new Float64Array( 1 );
	const Q = new Float64Array( 1 );
	const WORK = new Float64Array( 200 );
	const IWORK = new Int32Array( N );
	const K = new Int32Array( 1 );
	const L = new Int32Array( 1 );
	const info = dggsvd3( 'none', 'none', 'none', M, N, P, K, L, A, 1, M, 0, B, 1, P, 0, ALPHA, 1, 0, BETA, 1, 0, U, 1, 1, 0, V, 1, 1, 0, Q, 1, 1, 0, WORK, 1, 0, IWORK, 1, 0 );
	assert.equal( info, tc.info );
	assert.equal( K[ 0 ], tc.k );
	assert.equal( L[ 0 ], tc.l );
	assertArrayClose( ALPHA, 0, 1, tc.alpha, N, 1e-2, 'alpha' );
	assertArrayClose( BETA, 0, 1, tc.beta, N, 1e-2, 'beta' );
});

test( 'dggsvd3: diagonal 4x4 A, 3x4 B', function t() {
	let i;

	const tc = diag_4x4;
	const M = 4;
	const N = 4;
	const P = 3;
	const A = new Float64Array( M * N );
	A[ 0 + 0*M ] = 1.0;
	A[ 1 + 1*M ] = 2.0;
	A[ 2 + 2*M ] = 3.0;
	A[ 3 + 3*M ] = 4.0;
	const B = new Float64Array( P * N );
	B[ 0 + 0*P ] = 1.0;
	B[ 0 + 1*P ] = 1.0;
	B[ 1 + 1*P ] = 1.0;
	B[ 1 + 2*P ] = 1.0;
	B[ 2 + 2*P ] = 1.0;
	B[ 2 + 3*P ] = 1.0;
	const ALPHA = new Float64Array( N );
	const BETA = new Float64Array( N );
	const U = new Float64Array( M * M );
	const V = new Float64Array( P * P );
	const Q = new Float64Array( N * N );
	const WORK = new Float64Array( 200 );
	const IWORK = new Int32Array( N );
	const K = new Int32Array( 1 );
	const L = new Int32Array( 1 );
	const info = dggsvd3( 'compute-U', 'compute-V', 'compute-Q', M, N, P, K, L, A, 1, M, 0, B, 1, P, 0, ALPHA, 1, 0, BETA, 1, 0, U, 1, M, 0, V, 1, P, 0, Q, 1, N, 0, WORK, 1, 0, IWORK, 1, 0 );
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
		const sumsq = ( ALPHA[ i ] * ALPHA[ i ] ) + ( BETA[ i ] * BETA[ i ] );
		assertClose( sumsq, 1.0, 1e-10, 'alpha^2+beta^2=1 at ' + i );
	}
});

test( 'dggsvd3: subnormal A or B is rank zero against the UNFL-floored tolerance (ticket 0089)', function t() {
	// Reference: TOLA = MAX(M,N)*MAX(ANORM,UNFL)*ULP with UNFL = DLAMCH('S') = 2^-1022 and ULP = DLAMCH('P') = 2^-52, so for ANORM < UNFL the tolerance is MAX(M,N)*2^-1074 = 2*4.94e-324. DGGSVP3 counts a diagonal entry toward the rank only if ABS(A(I,I)).GT.TOLA, so entries equal to 2^-1074 (the smallest subnormal) give rank 0. With UNFL = 0 the tolerance underflows to 0 and the same entries count as rank 2.
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
	U = new Float64Array( 4 );
	V = new Float64Array( 4 );
	Q = new Float64Array( 4 );
	WORK = new Float64Array( 200 );
	IWORK = new Int32Array( 2 );
	K = new Int32Array( 1 );
	L = new Int32Array( 1 );

	// A = diag( 2^-1074, 2^-1074 ), B = 0 (TOLA case):
	A = new Float64Array( [ 5e-324, 0.0, 0.0, 5e-324 ] );
	B = new Float64Array( 4 );
	info = dggsvd3( 'compute-U', 'compute-V', 'compute-Q', 2, 2, 2, K, L, A, 1, 2, 0, B, 1, 2, 0, ALPHA, 1, 0, BETA, 1, 0, U, 1, 2, 0, V, 1, 2, 0, Q, 1, 2, 0, WORK, 1, 0, IWORK, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, 0, 'info (tola)' );
	assert.equal( K[ 0 ], 0, 'K (tola)' );
	assert.equal( L[ 0 ], 0, 'L (tola)' );

	// A = 0, B = diag( 2^-1074, 2^-1074 ) (TOLB case):
	A = new Float64Array( 4 );
	B = new Float64Array( [ 5e-324, 0.0, 0.0, 5e-324 ] );
	info = dggsvd3( 'compute-U', 'compute-V', 'compute-Q', 2, 2, 2, K, L, A, 1, 2, 0, B, 1, 2, 0, ALPHA, 1, 0, BETA, 1, 0, U, 1, 2, 0, V, 1, 2, 0, Q, 1, 2, 0, WORK, 1, 0, IWORK, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, 0, 'info (tolb)' );
	assert.equal( K[ 0 ], 0, 'K (tolb)' );
	assert.equal( L[ 0 ], 0, 'L (tolb)' );
});

test( 'dggsvd3: unsorted generalized singular values produce a sorting permutation in IWORK (reconstruction + sort oracle)', function t() {
	// A = diag( 1, 2, 3 ), B = I: the generalized singular values are the ratios 1, 2, 3, which come out of DTGSJA in unsorted order. Oracle: A = U*D1*[0 R]*Q^T, B = V*D2*[0 R]*Q^T (DGGSVD3 doc), ALPHA^2+BETA^2 = 1, {ALPHA/BETA} = {1,2,3}, and applying the IWORK interchanges to ALPHA (as DGGSVD3 documents: swap ALPHA(I) and ALPHA(IWORK(I)) for I = K+1..K+L) sorts it in decreasing order.
	var Aorig;
	var Borig;
	var ALPHA;
	var IWORK;
	var ratios;
	var BETA;
	var WORK;
	var sorted;
	var info;
	var kval;
	var lval;
	var swp;
	var D1;
	var D2;
	var RR;
	var N;
	var A;
	var B;
	var K;
	var L;
	var U;
	var V;
	var Q;
	var i;
	var j;

	N = 3;
	Aorig = [ 1.0, 0.0, 0.0, 0.0, 2.0, 0.0, 0.0, 0.0, 3.0 ];
	Borig = [ 1.0, 0.0, 0.0, 0.0, 1.0, 0.0, 0.0, 0.0, 1.0 ];
	A = new Float64Array( Aorig );
	B = new Float64Array( Borig );
	ALPHA = new Float64Array( N );
	BETA = new Float64Array( N );
	U = new Float64Array( N * N );
	V = new Float64Array( N * N );
	Q = new Float64Array( N * N );
	WORK = new Float64Array( 200 );
	IWORK = new Int32Array( N );
	K = new Int32Array( 1 );
	L = new Int32Array( 1 );
	info = dggsvd3( 'compute-U', 'compute-V', 'compute-Q', N, N, N, K, L, A, 1, N, 0, B, 1, N, 0, ALPHA, 1, 0, BETA, 1, 0, U, 1, N, 0, V, 1, N, 0, Q, 1, N, 0, WORK, 1, 0, IWORK, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, 0, 'info' );
	kval = K[ 0 ];
	lval = L[ 0 ];
	assert.equal( kval, 0, 'K' );
	assert.equal( lval, 3, 'L' );

	// The values must arrive unsorted, otherwise this test does not exercise the interchanges:
	assert.ok( ALPHA[ 0 ] < ALPHA[ 1 ] || ALPHA[ 1 ] < ALPHA[ 2 ], 'ALPHA unsorted on exit' );

	ratios = [];
	for ( i = 0; i < N; i++ ) {
		assertClose( ( ALPHA[ i ] * ALPHA[ i ] ) + ( BETA[ i ] * BETA[ i ] ), 1.0, 1e-14, 'alpha^2+beta^2' );
		ratios.push( ALPHA[ i ] / BETA[ i ] );
	}
	ratios.sort( function cmp( x, y ) {
		return x - y;
	});
	for ( i = 0; i < N; i++ ) {
		assertClose( ratios[ i ], i + 1, 1e-13, 'ratio ' + i );
	}

	// Apply the IWORK interchanges (0-based) to a copy of ALPHA:
	sorted = Array.from( ALPHA );
	for ( i = kval; i < kval + lval; i++ ) {
		assert.ok( IWORK[ i ] >= i && IWORK[ i ] < kval + lval, 'IWORK[' + i + '] in range' );
		swp = sorted[ i ];
		sorted[ i ] = sorted[ IWORK[ i ] ];
		sorted[ IWORK[ i ] ] = swp;
	}
	for ( i = kval; i < kval + lval - 1; i++ ) {
		assert.ok( sorted[ i ] >= sorted[ i + 1 ], 'sorted decreasing at ' + i );
	}

	// Reconstruction (M = P = N = K+L = 3, so [0 R] = R = upper triangle of A on exit, D1 = diag(ALPHA), D2 = diag(BETA)):
	RR = new Float64Array( N * N );
	for ( j = 0; j < N; j++ ) {
		for ( i = 0; i <= j; i++ ) {
			RR[ i + ( j * N ) ] = A[ i + ( j * N ) ];
		}
	}
	D1 = mul( diagMat( ALPHA, N ), RR, N );
	D2 = mul( diagMat( BETA, N ), RR, N );
	assertMatClose( mul( mul( U, D1, N ), transpose( Q, N ), N ), Aorig, N, 1e-13, 'A = U*D1*R*Q^T' );
	assertMatClose( mul( mul( V, D2, N ), transpose( Q, N ), N ), Borig, N, 1e-13, 'B = V*D2*R*Q^T' );

	/**
	* Returns a diagonal column-major N-by-N matrix.
	*
	* @private
	* @param {Float64Array} x - diagonal
	* @param {integer} n - order
	* @returns {Float64Array} matrix
	*/
	function diagMat( x, n ) {
		var out = new Float64Array( n * n );
		var k;
		for ( k = 0; k < n; k++ ) {
			out[ k + ( k * n ) ] = x[ k ];
		}
		return out;
	}

	/**
	* Multiplies two column-major N-by-N matrices.
	*
	* @private
	* @param {Float64Array} X - left matrix
	* @param {Float64Array} Y - right matrix
	* @param {integer} n - order
	* @returns {Float64Array} product
	*/
	function mul( X, Y, n ) {
		var out = new Float64Array( n * n );
		var r;
		var c;
		var k;
		for ( c = 0; c < n; c++ ) {
			for ( r = 0; r < n; r++ ) {
				for ( k = 0; k < n; k++ ) {
					out[ r + ( c * n ) ] += X[ r + ( k * n ) ] * Y[ k + ( c * n ) ];
				}
			}
		}
		return out;
	}

	/**
	* Transposes a column-major N-by-N matrix.
	*
	* @private
	* @param {Float64Array} X - matrix
	* @param {integer} n - order
	* @returns {Float64Array} transpose
	*/
	function transpose( X, n ) {
		var out = new Float64Array( n * n );
		var r;
		var c;
		for ( c = 0; c < n; c++ ) {
			for ( r = 0; r < n; r++ ) {
				out[ c + ( r * n ) ] = X[ r + ( c * n ) ];
			}
		}
		return out;
	}

	/**
	* Asserts two column-major N-by-N matrices are elementwise close.
	*
	* @private
	* @param {Float64Array} X - actual
	* @param {Array} Y - expected
	* @param {integer} n - order
	* @param {number} tol - absolute tolerance
	* @param {string} msg - message
	*/
	function assertMatClose( X, Y, n, tol, msg ) {
		var k;
		for ( k = 0; k < n * n; k++ ) {
			assert.ok( Math.abs( X[ k ] - Y[ k ] ) <= tol, msg + ' [' + k + ']: ' + X[ k ] + ' vs ' + Y[ k ] );
		}
	}
});

/**
* Runs `dggsvd3` on deterministic M-by-N A and P-by-N B with a WORK of `lwork` elements and returns all outputs.
*
* @private
* @param {NonNegativeInteger} M - rows of A
* @param {NonNegativeInteger} N - columns
* @param {NonNegativeInteger} P - rows of B
* @param {NonNegativeInteger} lwork - WORK length
* @param {boolean} [full] - fill A and B from a quadratic phase (generically full rank) instead of a linear one (rank 2)
* @returns {Object} outputs
*/
function runWithWork( M, N, P, lwork, full ) {
	const A = new Float64Array( Math.max( 1, M * N ) );
	const B = new Float64Array( Math.max( 1, P * N ) );
	const U = new Float64Array( Math.max( 1, M * M ) );
	const V = new Float64Array( Math.max( 1, P * P ) );
	const Q = new Float64Array( Math.max( 1, N * N ) );
	const ALPHA = new Float64Array( Math.max( 1, N ) );
	const BETA = new Float64Array( Math.max( 1, N ) );
	const IWORK = new Int32Array( Math.max( 1, N ) );
	const WORK = new Float64Array( lwork );
	const K = new Int32Array( 1 );
	const L = new Int32Array( 1 );
	let i;
	for ( i = 0; i < M * N; i++ ) {
		A[ i ] = ( full ) ? Math.sin( ( 0.37 * i * i ) + 1 ) : Math.sin( ( 3 * i ) + 1 );
	}
	for ( i = 0; i < P * N; i++ ) {
		B[ i ] = ( full ) ? Math.cos( ( 0.53 * i * i ) + 2 ) : Math.cos( ( 5 * i ) + 2 );
	}
	const info = dggsvd3( 'compute-U', 'compute-V', 'compute-Q', M, N, P, K, L, A, 1, Math.max( 1, M ), 0, B, 1, Math.max( 1, P ), 0, ALPHA, 1, 0, BETA, 1, 0, U, 1, Math.max( 1, M ), 0, V, 1, Math.max( 1, P ), 0, Q, 1, Math.max( 1, N ), 0, WORK, 1, 0, IWORK, 1, 0 ); // eslint-disable-line max-len
	return {
		'info': info,
		'K': K[ 0 ],
		'L': L[ 0 ],
		'ALPHA': Array.from( ALPHA ),
		'BETA': Array.from( BETA ),
		'U': Array.from( U ),
		'V': Array.from( V ),
		'Q': Array.from( Q ),
		'IWORK': Array.from( IWORK )
	};
}

test( 'dggsvd3: WORK of exactly the minimum (N + dggsvp3 workspace) matches a large WORK (ticket 0096)', function t() {
	// dggsvp3 gets WORK(N+1:) and its dgeqp3 needs 3N+1 there; the minimum is N + 3N+1 = 13.
	const big = runWithWork( 3, 3, 3, 200 );
	const out = runWithWork( 3, 3, 3, 13 );
	assert.deepStrictEqual( out, big );
	assert.equal( big.K + big.L, 3 );
	assert.throws( function bad() {
		runWithWork( 3, 3, 3, 12 );
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

test( 'dggsvd3: WORK of exactly the minimum past dgeqp3\'s blocking threshold gives the generalized singular values of the optimal WORK (ticket 0100)', function t() {
	// min(P,N) = 130 > NX = 128 selects the blocked dgeqp3 in dggsvp3 at its optimum; with N + 3N+1 it falls back to the unblocked dlaqp2, as the reference's DGEQP3 does. Pivoting may then differ in near ties, so compare the generalized singular value pairs:
	const N = 130;
	const lwork = N + ( 3 * N ) + 1;
	const big = runWithWork( 40, N, N, N + ( 2 * N ) + ( ( N + 1 ) * 32 ), true );
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


// WORKSPACE MINIMUM (ticket 0016) //

function wsRand( n, seed ) {
	const out = new Float64Array( n );
	let s = seed;
	let i;
	for ( i = 0; i < n; i++ ) {
		s = ( s * 16807 ) % 2147483647;
		out[ i ] = ( s / 2147483647 ) - 0.5;
	}
	return out;
}

function wsMat( n, seed ) {
	return wsRand( n, seed );
}

function wsWork( n ) {
	return new Float64Array( n ).fill( NaN );
}

function wsFlat( x ) {
	return Array.from( x );
}

function wsRun( c, lw, liwork ) {
	const lda = Math.max( 1, c.M );
	const ldb = Math.max( 1, c.P );
	const liw = ( liwork === void 0 ) ? c.N : liwork;
	const A = wsMat( lda * c.N, 7 + c.M );
	const B = wsMat( ldb * c.N, 11 + c.P );
	const K = new Int32Array( 1 );
	const L = new Int32Array( 1 );
	const U = new Float64Array( lda * lda );
	const V = new Float64Array( ldb * ldb );
	const Q = new Float64Array( c.N * c.N );
	const al = new Float64Array( c.N );
	const be = new Float64Array( c.N );
	const info = dggsvd3( c.ju, c.jv, c.jq, c.M, c.N, c.P, K, L, A, 1, lda, 0, B, 1, ldb, 0, al, 1, 0, be, 1, 0, U, 1, lda, 0, V, 1, ldb, 0, Q, 1, c.N, 0, wsWork( lw ), 1, 0, ( liw < 0 ) ? null : new Int32Array( liw ), 1, 0 );
	return [ info, K[ 0 ], L[ 0 ] ].concat( wsFlat( A ), wsFlat( B ), wsFlat( U ), wsFlat( V ), wsFlat( Q ), wsFlat( al ), wsFlat( be ) );
}

const WS_CASES = [
		{ 'ju': 'none', 'jv': 'none', 'jq': 'none', 'M': 3, 'P': 9, 'N': 2, 'lwork': 9 }, // old minimum: 11,
		{ 'ju': 'compute-U', 'jv': 'none', 'jq': 'compute-Q', 'M': 10, 'P': 110, 'N': 34, 'lwork': 137 }, // old minimum: 144,
		{ 'ju': 'none', 'jv': 'compute-V', 'jq': 'none', 'M': 9, 'P': 1, 'N': 2, 'lwork': 11 }, // old minimum: 11,
		{ 'ju': 'compute-U', 'jv': 'compute-V', 'jq': 'compute-Q', 'M': 9, 'P': 3, 'N': 4, 'lwork': 17 }, // old minimum: 17,
		{ 'ju': 'none', 'jv': 'none', 'jq': 'compute-Q', 'M': 40, 'P': 0, 'N': 3, 'lwork': 13 }, // old minimum: 43,
		{ 'ju': 'compute-U', 'jv': 'compute-V', 'jq': 'compute-Q', 'M': 5, 'P': 4, 'N': 40, 'lwork': 161 }, // old minimum: 161
		{ 'ju': 'none', 'jv': 'compute-V', 'jq': 'none', 'M': 1, 'P': 9, 'N': 1, 'lwork': 9 }, // V's reflectors touch at most P-1 columns; old minimum: 10 (ticket 0016)
		{ 'ju': 'compute-U', 'jv': 'none', 'jq': 'none', 'M': 33, 'P': 0, 'N': 5, 'lwork': 37 } // P = 0: only U's generation, M-1; old minimum: 38 (ticket 0016)
];

test( 'dggsvd3: WORK of exactly the minimum (NaN-filled) gives the results of an ample WORK, also where the old minimum max(M, N, P, ...) rejected it and past the blocking threshold', function t() {
	let got, ref, c, k, i;
	for ( k = 0; k < WS_CASES.length; k++ ) {
		c = WS_CASES[ k ];
		ref = wsRun( c, c.lwork + 4096 );
		got = wsRun( c, c.lwork );
		assert.equal( got.length, ref.length, 'length' );
		for ( i = 0; i < ref.length; i++ ) {
			assert.ok( Math.abs( got[ i ] - ref[ i ] ) <= 1e-10 * Math.max( 1.0, Math.abs( ref[ i ] ) ), JSON.stringify( c ) + ': element ' + i + ': ' + got[ i ] + ' vs ' + ref[ i ] );
		}
	}
});

test( 'dggsvd3: one less than the minimum WORK or IWORK (N) throws a RangeError', function t() {
	let c, k;
	for ( k = 0; k < WS_CASES.length; k++ ) {
		c = WS_CASES[ k ];
		assert.throws( wsCall( c, c.lwork - 1 ), RangeError, JSON.stringify( c ) + ': WORK' );
		assert.throws( wsCall( c, c.lwork, c.N - 1 ), RangeError, JSON.stringify( c ) + ': IWORK' );
	}
});

function wsCall( c, lw, liwork ) {
	return function call() {
		wsRun( c, lw, liwork );
	};
}

test( 'dggsvd3: a missing (null) IWORK throws a RangeError', function t() {
	const c = WS_CASES[ 0 ];
	assert.throws( wsCall( c, c.lwork, -1 ), RangeError, 'IWORK' );
});
