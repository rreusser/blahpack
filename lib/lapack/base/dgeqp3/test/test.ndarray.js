/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import dgeqp3 from './../lib/ndarray.js';

// FIXTURES //

import rect_4x3 from './fixtures/rect_4x3.json' with { type: 'json' };
import rect_3x4 from './fixtures/rect_3x4.json' with { type: 'json' };
import square_4x4 from './fixtures/square_4x4.json' with { type: 'json' };
import one_by_one from './fixtures/one_by_one.json' with { type: 'json' };
import fixed_col1 from './fixtures/fixed_col1.json' with { type: 'json' };
import fixed_col3_swap from './fixtures/fixed_col3_swap.json' with { type: 'json' };
import fixed_two_cols from './fixtures/fixed_two_cols.json' with { type: 'json' };
import wide_8x36 from './fixtures/wide_8x36.json' with { type: 'json' };
import large_140x130_blocked from './fixtures/large_140x130_blocked.json' with { type: 'json' };

// VARIABLES //

const LDA = 8; // Matches Fortran MAXMN
const NB = 32;

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
* Creates a WORK array of sufficient size for N columns.
*
* @private
* @param {NonNegativeInteger} N - number of columns
* @returns {Float64Array} work buffer
*/
function makeWork( N ) {
	const lwork = Math.max( 1, ( 2 * N ) + ( ( N + 1 ) * NB ) );
	return new Float64Array( lwork );
}

/**
* Creates a column-major matrix from values.
* vals is an array of column-major values for an M-by-N matrix, stored with leading dimension M.
* Returns a Float64Array of size LDA*N with values placed using leading dimension LDA.
*/
function makeMatrix( vals, M, N ) {
	const A = new Float64Array( LDA * N );
	let i, j;
	for ( j = 0; j < N; j++ ) {
		for ( i = 0; i < M; i++ ) {
			A[ j * LDA + i ] = vals[ j * M + i ];
		}
	}
	return A;
}

/**
* Extracts column-major values from matrix A (LDA-by-N) as M-by-N.
*/
function extractMatrix( A, M, N ) {
	const out = [];
	let i, j;
	for ( j = 0; j < N; j++ ) {
		for ( i = 0; i < M; i++ ) {
			out.push( A[ j * LDA + i ] );
		}
	}
	return out;
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

test( 'dgeqp3: 4x3 matrix (tall)', function t() {

	const tc = rect_4x3;
	const A = makeMatrix( [1, 2, 0, 1, 0, 1, 3, 2, 3, 0, 1, 2], 4, 3 );
	const JPVT = new Int32Array( 3 );
	const TAU = new Float64Array( 3 );
	const WORK = makeWork( 3 );
	const info = dgeqp3( 4, 3, A, 1, LDA, 0, JPVT, 1, 0, TAU, 1, 0, WORK, 1, 0 );
	assert.equal( info, tc.info, 'info' );
	assertArrayClose( extractMatrix( A, 4, 3 ), tc.a, 1e-10, 'a' );
	assertArrayClose( toArray( TAU ), tc.tau, 1e-10, 'tau' );
	assert.deepStrictEqual( toArray( JPVT ), tc.jpvt, 'jpvt' );
});

test( 'dgeqp3: 3x4 matrix (wide)', function t() {

	const tc = rect_3x4;
	const A = makeMatrix( [1, 0, 2, 3, 1, 0, 0, 2, 1, 1, 0, 3], 3, 4 );
	const JPVT = new Int32Array( 4 );
	const TAU = new Float64Array( 3 );
	const WORK = makeWork( 4 );
	const info = dgeqp3( 3, 4, A, 1, LDA, 0, JPVT, 1, 0, TAU, 1, 0, WORK, 1, 0 );
	assert.equal( info, tc.info, 'info' );
	assertArrayClose( extractMatrix( A, 3, 4 ), tc.a, 1e-10, 'a' );
	assertArrayClose( toArray( TAU ), tc.tau, 1e-10, 'tau' );
	assert.deepStrictEqual( toArray( JPVT ), tc.jpvt, 'jpvt' );
});

test( 'dgeqp3: square 4x4', function t() {

	const tc = square_4x4;
	const A = makeMatrix( [2, 1, 0, 1, 0, 3, 1, 2, 1, 0, 4, 1, 3, 2, 1, 5], 4, 4 );
	const JPVT = new Int32Array( 4 );
	const TAU = new Float64Array( 4 );
	const WORK = makeWork( 4 );
	const info = dgeqp3( 4, 4, A, 1, LDA, 0, JPVT, 1, 0, TAU, 1, 0, WORK, 1, 0 );
	assert.equal( info, tc.info, 'info' );
	assertArrayClose( extractMatrix( A, 4, 4 ), tc.a, 1e-10, 'a' );
	assertArrayClose( toArray( TAU ), tc.tau, 1e-10, 'tau' );
	assert.deepStrictEqual( toArray( JPVT ), tc.jpvt, 'jpvt' );
});

test( 'dgeqp3: N=0 (quick return)', function t() {

	const A = new Float64Array( 1 );
	const JPVT = new Int32Array( 1 );
	const TAU = new Float64Array( 1 );
	const WORK = makeWork( 0 );
	const info = dgeqp3( 3, 0, A, 1, LDA, 0, JPVT, 1, 0, TAU, 1, 0, WORK, 1, 0 );
	assert.equal( info, 0, 'info' );
});

test( 'dgeqp3: M=0 (quick return)', function t() {

	const A = new Float64Array( 1 );
	const JPVT = new Int32Array( 3 );
	const TAU = new Float64Array( 1 );
	const WORK = makeWork( 3 );
	const info = dgeqp3( 0, 3, A, 1, 1, 0, JPVT, 1, 0, TAU, 1, 0, WORK, 1, 0 );
	assert.equal( info, 0, 'info' );
});

test( 'dgeqp3: 1x1 matrix', function t() {

	const tc = one_by_one;
	const A = new Float64Array( LDA );
	A[ 0 ] = 5.0;
	const JPVT = new Int32Array( 1 );
	const TAU = new Float64Array( 1 );
	const WORK = makeWork( 1 );
	const info = dgeqp3( 1, 1, A, 1, LDA, 0, JPVT, 1, 0, TAU, 1, 0, WORK, 1, 0 );
	assert.equal( info, tc.info, 'info' );
	assertArrayClose( extractMatrix( A, 1, 1 ), tc.a, 1e-10, 'a' );
	assertArrayClose( toArray( TAU ), tc.tau, 1e-10, 'tau' );
	assert.deepStrictEqual( toArray( JPVT ), tc.jpvt, 'jpvt' );
});

test( 'dgeqp3: fixed column 1', function t() {

	const tc = fixed_col1;
	const A = makeMatrix( [1, 0, 0, 0, 3, 4, 0, 1, 2], 3, 3 );
	const JPVT = new Int32Array( [1, 0, 0] );
	const TAU = new Float64Array( 3 );
	const WORK = makeWork( 3 );
	const info = dgeqp3( 3, 3, A, 1, LDA, 0, JPVT, 1, 0, TAU, 1, 0, WORK, 1, 0 );
	assert.equal( info, tc.info, 'info' );
	assertArrayClose( extractMatrix( A, 3, 3 ), tc.a, 1e-10, 'a' );
	assertArrayClose( toArray( TAU ), tc.tau, 1e-10, 'tau' );
	assert.deepStrictEqual( toArray( JPVT ), tc.jpvt, 'jpvt' );
});

test( 'dgeqp3: fixed column 3 (swap to front)', function t() {

	const tc = fixed_col3_swap;
	const A = makeMatrix( [1, 2, 0, 1, 3, 0, 2, 1, 0, 1, 3, 2], 4, 3 );
	const JPVT = new Int32Array( [0, 0, 1] );
	const TAU = new Float64Array( 3 );
	const WORK = makeWork( 3 );
	const info = dgeqp3( 4, 3, A, 1, LDA, 0, JPVT, 1, 0, TAU, 1, 0, WORK, 1, 0 );
	assert.equal( info, tc.info, 'info' );
	assertArrayClose( extractMatrix( A, 4, 3 ), tc.a, 1e-10, 'a' );
	assertArrayClose( toArray( TAU ), tc.tau, 1e-10, 'tau' );
	assert.deepStrictEqual( toArray( JPVT ), tc.jpvt, 'jpvt' );
});

test( 'dgeqp3: fix columns 1 and 3', function t() {

	const tc = fixed_two_cols;
	const A = makeMatrix( [1, 2, 0, 1, 3, 0, 2, 1, 0, 1, 3, 2], 4, 3 );
	const JPVT = new Int32Array( [1, 0, 1] );
	const TAU = new Float64Array( 3 );
	const WORK = makeWork( 3 );
	const info = dgeqp3( 4, 3, A, 1, LDA, 0, JPVT, 1, 0, TAU, 1, 0, WORK, 1, 0 );
	assert.equal( info, tc.info, 'info' );
	assertArrayClose( extractMatrix( A, 4, 3 ), tc.a, 1e-10, 'a' );
	assertArrayClose( toArray( TAU ), tc.tau, 1e-10, 'tau' );
	assert.deepStrictEqual( toArray( JPVT ), tc.jpvt, 'jpvt' );
});

test( 'dgeqp3: wide 8x36 (unblocked, sminmn < NB)', function t() {
	let i, j;

	const tc = wide_8x36;
	const BIGMN = 40;
	const M = 8;
	const N = 36;
	const A = new Float64Array( BIGMN * N );
	for ( j = 0; j < N; j++ ) {
		for ( i = 0; i < M; i++ ) {
			A[ j * BIGMN + i ] = ((i + 1) * (j + 1) + 3 * (i + 1) + 7) % 11 - 5.0;
		}
	}
	const JPVT = new Int32Array( N );
	const TAU = new Float64Array( M );
	const WORK = makeWork( N );
	const info = dgeqp3( M, N, A, 1, BIGMN, 0, JPVT, 1, 0, TAU, 1, 0, WORK, 1, 0 );
	assert.equal( info, tc.info, 'info' );
	const aOut = [];
	for ( j = 0; j < N; j++ ) {
		for ( i = 0; i < M; i++ ) {
			aOut.push( A[ j * BIGMN + i ] );
		}
	}
	assertArrayClose( aOut, tc.a, 1e-10, 'a' );
	assertArrayClose( toArray( TAU ), tc.tau, 1e-10, 'tau' );
	assert.deepStrictEqual( toArray( JPVT ), tc.jpvt, 'jpvt' );
});

test( 'dgeqp3: large 140x130 (triggers blocked dlaqps path)', function t() {
	let i, j;

	const tc = large_140x130_blocked;
	const BIGMN = 140;
	const M = 140;
	const N = 130;
	const A = new Float64Array( BIGMN * N );
	for ( j = 0; j < N; j++ ) {
		for ( i = 0; i < M; i++ ) {
			A[ j * BIGMN + i ] = Math.sin( (i + 1) * 0.7 + (j + 1) * 1.3 ) + Math.cos( (i + 1) * (j + 1) * 0.3 ); // eslint-disable-line max-len
		}
	}
	const JPVT = new Int32Array( N );
	const TAU = new Float64Array( N );
	const WORK = makeWork( N );
	const info = dgeqp3( M, N, A, 1, BIGMN, 0, JPVT, 1, 0, TAU, 1, 0, WORK, 1, 0 );
	assert.equal( info, tc.info, 'info' );
	const aOut = [];
	for ( j = 0; j < N; j++ ) {
		for ( i = 0; i < M; i++ ) {
			aOut.push( A[ j * BIGMN + i ] );
		}
	}
	assertArrayClose( aOut, tc.a, 1e-10, 'a' );
	assertArrayClose( toArray( TAU ), tc.tau, 1e-10, 'tau' );
	assert.deepStrictEqual( toArray( JPVT ), tc.jpvt, 'jpvt' );
});

/**
* Fills an M-by-N column-major matrix with deterministic pseudo-random values.
*
* @private
* @param {NonNegativeInteger} M - rows
* @param {NonNegativeInteger} N - columns
* @returns {Float64Array} matrix
*/
function randomMatrix( M, N ) {
	const A = new Float64Array( M * N );
	let seed = 7;
	let i;
	for ( i = 0; i < M * N; i++ ) {
		seed = ( seed * 16807 ) % 2147483647;
		A[ i ] = ( seed / 2147483647 ) - 0.5;
	}
	return A;
}

/**
* Returns `max |A0*P - Q*R| / max |A0|` for a factorization computed by dgeqp3 (column-major, leading dimension M).
*
* @private
* @param {Float64Array} A0 - original matrix
* @param {Float64Array} A - factored matrix
* @param {Int32Array} JPVT - pivots (1-based)
* @param {Float64Array} TAU - reflector scalars
* @param {NonNegativeInteger} M - rows
* @param {NonNegativeInteger} N - columns
* @returns {number} relative residual
*/
function residual( A0, A, JPVT, TAU, M, N ) {
	const K = Math.min( M, N );
	const QR = new Float64Array( M * N );
	let anrm = 0.0;
	let err = 0.0;
	let i, j, t, w;
	for ( j = 0; j < N; j++ ) {
		for ( i = 0; i <= Math.min( j, M - 1 ); i++ ) {
			QR[ ( j * M ) + i ] = A[ ( j * M ) + i ];
		}
	}
	for ( t = K - 1; t >= 0; t-- ) {
		for ( j = 0; j < N; j++ ) {
			w = QR[ ( j * M ) + t ];
			for ( i = t + 1; i < M; i++ ) {
				w += A[ ( t * M ) + i ] * QR[ ( j * M ) + i ];
			}
			w *= TAU[ t ];
			QR[ ( j * M ) + t ] -= w;
			for ( i = t + 1; i < M; i++ ) {
				QR[ ( j * M ) + i ] -= A[ ( t * M ) + i ] * w;
			}
		}
	}
	for ( j = 0; j < N; j++ ) {
		for ( i = 0; i < M; i++ ) {
			anrm = Math.max( anrm, Math.abs( A0[ i + ( M * ( JPVT[ j ] - 1 ) ) ] ) );
			err = Math.max( err, Math.abs( A0[ i + ( M * ( JPVT[ j ] - 1 ) ) ] - QR[ ( j * M ) + i ] ) ); // eslint-disable-line max-len
		}
	}
	return ( err === err ) ? err / anrm : Infinity;
}

/**
* Factors a deterministic 200x200 matrix with a workspace of the given length and returns the relative residual (the blocked part, `min(M,N) - NFXD - NX` with NX = 128, is wide enough for several blocks).
*
* @private
* @param {NonNegativeInteger} lwork - workspace length
* @param {NonNegativeInteger} nfixed - number of leading columns to fix
* @returns {Object} residual and TAU
*/
function run200( lwork, nfixed ) {
	const M = 200;
	const N = 200;
	const A0 = randomMatrix( M, N );
	const A = new Float64Array( A0 );
	const JPVT = new Int32Array( N );
	const TAU = new Float64Array( N );
	let i;
	for ( i = 0; i < nfixed; i++ ) {
		JPVT[ i ] = 1;
	}
	const info = dgeqp3( M, N, A, 1, M, 0, JPVT, 1, 0, TAU, 1, 0, new Float64Array( lwork ), 1, 0 );
	assert.equal( info, 0, 'info' );
	return {
		'res': residual( A0, A, JPVT, TAU, M, N ),
		'TAU': TAU
	};
}

test( 'dgeqp3: 200x200 with WORK of the reference minimum 3*N+1 (unblocked fallback) gives A*P = Q*R', function t() {
	const N = 200;
	const opt = run200( ( 2 * N ) + ( ( N + 1 ) * NB ), 0 );
	const lo = run200( ( 3 * N ) + 1, 0 );
	assert.ok( opt.res < 1e-13, 'optimum residual ' + opt.res );
	assert.ok( lo.res < 1e-13, 'minimum residual ' + lo.res );
});

test( 'dgeqp3: 200x200 with WORK for a shrunk block size NB=8 gives A*P = Q*R', function t() {
	const N = 200;
	const mid = run200( ( 2 * N ) + ( ( N + 1 ) * 8 ), 0 );
	assert.ok( mid.res < 1e-13, 'residual ' + mid.res );
});

test( 'dgeqp3: 200x200 with 10 fixed columns stays inside a WORK of 2*SN + (SN+1)*NB', function t() {
	// The reference sizes its blocked path as 2*SN + (SN+1)*NB, but VN1/VN2 occupy WORK(1:2*N): with fixed columns, a workspace of exactly that size would be overrun by 2*NFXD elements.
	const sn = 190;
	const res = run200( ( 2 * sn ) + ( ( sn + 1 ) * NB ), 10 );
	assert.ok( res.res < 1e-13, 'residual ' + res.res );
});

test( 'dgeqp3: throws when WORK is one element below the minimum 3*N+1', function t() {
	const N = 150;
	assert.throws( function throws() {
		dgeqp3( N, N, new Float64Array( N * N ), 1, N, 0, new Int32Array( N ), 1, 0, new Float64Array( N ), 1, 0, new Float64Array( 3 * N ), 1, 0 );
	}, RangeError );
	assert.doesNotThrow( function noThrow() {
		dgeqp3( N, N, new Float64Array( N * N ), 1, N, 0, new Int32Array( N ), 1, 0, new Float64Array( N ), 1, 0, new Float64Array( ( 3 * N ) + 1 ), 1, 0 );
	} );
});

test( 'dgeqp3: throws for a null WORK or a non-unit WORK stride', function t() {
	const N = 4;
	assert.throws( function throws() {
		dgeqp3( N, N, new Float64Array( N * N ), 1, N, 0, new Int32Array( N ), 1, 0, new Float64Array( N ), 1, 0, null, 1, 0 );
	}, RangeError );
	assert.throws( function throws() {
		dgeqp3( N, N, new Float64Array( N * N ), 1, N, 0, new Int32Array( N ), 1, 0, new Float64Array( N ), 1, 0, new Float64Array( 100 ), 2, 0 );
	}, RangeError );
});
