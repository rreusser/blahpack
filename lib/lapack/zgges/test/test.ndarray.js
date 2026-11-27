/**
* @license Apache-2.0
*
* Copyright (c) 2026 Ricky Reusser.
*
* Derived from the LAPACK 3.12.0 reference implementation (BSD-3-Clause).
*/

/* eslint-disable no-restricted-syntax, max-len, max-params, max-lines, max-statements, max-lines-per-function */

// MODULES //

import test from 'node:test';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Uint8Array from '@stdlib/array/uint8/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import zgges from './../lib/ndarray.js';
import { importWithDependencies } from './../../../../../test/harness/constants.js';


// FIXTURES //

const fixtureDir = path.join( import.meta.dirname, '..', '..', '..', '..', '..', 'test', 'fixtures' );
const lines = readFileSync( path.join( fixtureDir, 'zgges.jsonl' ), 'utf8' ).trim().split( '\n' );
const fixture = lines.map( function parse( line ) { return JSON.parse( line ); } );


// FUNCTIONS //

function findCase( name ) {
	return fixture.find( function find( t ) { return t.name === name; } );
}

function assertClose( actual, expected, tol, msg ) {
	const relErr = Math.abs( actual - expected ) / Math.max( Math.abs( expected ), 1.0 );
	assert.ok( relErr <= tol, msg + ': expected ' + expected + ', got ' + actual );
}

function assertArrayClose( actual, expected, tol, msg ) {
	let i;
	assert.equal( actual.length, expected.length, msg + ': length mismatch' );
	for ( i = 0; i < expected.length; i++ ) {
		assertClose( actual[ i ], expected[ i ], tol, msg + '[' + i + ']' );
	}
}

function toArray( arr ) {
	const out = [];
	let i;
	for ( i = 0; i < arr.length; i++ ) {
		out.push( arr[ i ] );
	}
	return out;
}

function nosel() {
	return false;
}

function selPositiveReal( alphaRe, alphaIm, betaRe, betaIm ) { // eslint-disable-line no-unused-vars
	if ( betaRe === 0.0 && betaIm === 0.0 ) {
		return false;
	}
	return ( alphaRe / betaRe ) > 0.0;
}

/**
* Returns (once, then cached) a copy of base.js whose ztgsen always reports IERR = 1 (the reference "reordering failed" exit).
*
* @private
* @returns {Promise<Function>} base with a failing ztgsen
*/
function baseWithFailingZtgsen() {
	if ( !baseWithFailingZtgsen.promise ) {
		baseWithFailingZtgsen.promise = importWithDependencies( new URL( './../lib/base.js', import.meta.url ), {
			'../../ztgsen/lib/base.js': function failingZtgsen() {
				return 1;
			}
		}).then( function getDefault( m ) {
			return m.default;
		});
	}
	return baseWithFailingZtgsen.promise;
}

/**
* Returns 2*N*N deterministic pseudo-random values in [-0.5, 0.5) times `scale` (interleaved re/im, column-major).
*
* @private
* @param {integer} seed - seed
* @param {integer} N - order
* @param {number} scale - scale factor
* @returns {Array} values
*/
function randMat( seed, N, scale ) {
	const out = [];
	let x = seed;
	let i;
	for ( i = 0; i < 2 * N * N; i++ ) {
		x = ( ( x * 1103515245 ) + 12345 ) % 2147483648;
		out.push( ( ( x / 2147483648 ) - 0.5 ) * scale );
	}
	return out;
}

/**
* Returns `M = X * Y * W^H` for N-by-N column-major interleaved complex arrays.
*
* @private
* @param {Array} X - left factor
* @param {Array} Y - middle factor
* @param {Array} W - right factor (conjugate-transposed)
* @param {integer} N - order
* @returns {Array} product
*/
function xywh( X, Y, W, N ) {
	const XY = new Array( 2 * N * N ).fill( 0.0 );
	const M = new Array( 2 * N * N ).fill( 0.0 );
	let i;
	let j;
	let k;
	let p;
	let q;
	for ( j = 0; j < N; j++ ) {
		for ( k = 0; k < N; k++ ) {
			for ( i = 0; i < N; i++ ) {
				p = 2 * ( i + ( k * N ) );
				q = 2 * ( k + ( j * N ) );
				XY[ 2 * ( i + ( j * N ) ) ] += ( X[ p ] * Y[ q ] ) - ( X[ p + 1 ] * Y[ q + 1 ] );
				XY[ ( 2 * ( i + ( j * N ) ) ) + 1 ] += ( X[ p ] * Y[ q + 1 ] ) + ( X[ p + 1 ] * Y[ q ] );
			}
		}
	}
	for ( j = 0; j < N; j++ ) {
		for ( k = 0; k < N; k++ ) {
			// conj( W( j, k ) )
			q = 2 * ( j + ( k * N ) );
			for ( i = 0; i < N; i++ ) {
				p = 2 * ( i + ( k * N ) );
				M[ 2 * ( i + ( j * N ) ) ] += ( XY[ p ] * W[ q ] ) + ( XY[ p + 1 ] * W[ q + 1 ] );
				M[ ( 2 * ( i + ( j * N ) ) ) + 1 ] += ( XY[ p + 1 ] * W[ q ] ) - ( XY[ p ] * W[ q + 1 ] );
			}
		}
	}
	return M;
}

/**
* Returns the max complex modulus of the elementwise difference `X - Y`.
*
* @private
* @param {Array} X - first array
* @param {Array} Y - second array
* @returns {number} max modulus
*/
function maxDiff( X, Y ) {
	let out = 0.0;
	let i;
	for ( i = 0; i < X.length; i += 2 ) {
		out = Math.max( out, Math.hypot( X[ i ] - Y[ i ], X[ i + 1 ] - Y[ i + 1 ] ) );
	}
	return out;
}

/**
* Returns the N-by-N identity (interleaved complex, column-major).
*
* @private
* @param {integer} N - order
* @returns {Array} identity
*/
function eye( N ) {
	const out = new Array( 2 * N * N ).fill( 0.0 );
	let i;
	for ( i = 0; i < N; i++ ) {
		out[ 2 * ( i + ( i * N ) ) ] = 1.0;
	}
	return out;
}

/**
* Asserts that (S, T, Q, Z, ALPHA, BETA) is a generalized Schur decomposition of (A0, B0): `A0 = Q*S*Z^H`, `B0 = Q*T*Z^H`, Q and Z unitary, S and T upper triangular, `ALPHA(i) = S(i,i)`, `BETA(i) = T(i,i)`.
*
* @private
* @param {Object} r - result arrays (S, T, Q, Z, ALPHA, BETA as plain arrays)
* @param {Array} A0 - original A
* @param {Array} B0 - original B
* @param {integer} N - order
* @param {string} msg - message prefix
* @param {boolean} [skipDiag] - when true, do not compare ALPHA/BETA with diag(S)/diag(T)
*/
function assertSchur( r, A0, B0, N, msg, skipDiag ) {
	const tol = 1e-13 * N;
	const anrm = maxDiff( A0, new Array( A0.length ).fill( 0.0 ) );
	const bnrm = maxDiff( B0, new Array( B0.length ).fill( 0.0 ) );
	const I = eye( N );
	let i;
	let j;
	assert.ok( maxDiff( xywh( r.Q, r.S, r.Z, N ), A0 ) <= tol * anrm, msg + ': A = Q*S*Z^H' );
	assert.ok( maxDiff( xywh( r.Q, r.T, r.Z, N ), B0 ) <= tol * bnrm, msg + ': B = Q*T*Z^H' );
	assert.ok( maxDiff( xywh( I, r.Q, r.Q, N ), I ) <= tol, msg + ': Q*Q^H = I' );
	assert.ok( maxDiff( xywh( I, r.Z, r.Z, N ), I ) <= tol, msg + ': Z*Z^H = I' );
	for ( j = 0; j < N; j++ ) {
		for ( i = j + 1; i < N; i++ ) {
			assert.ok( Math.hypot( r.S[ 2 * ( i + ( j * N ) ) ], r.S[ ( 2 * ( i + ( j * N ) ) ) + 1 ] ) <= tol * anrm, msg + ': S lower triangle zero' );
			assert.ok( Math.hypot( r.T[ 2 * ( i + ( j * N ) ) ], r.T[ ( 2 * ( i + ( j * N ) ) ) + 1 ] ) <= tol * bnrm, msg + ': T lower triangle zero' );
		}
		if ( !skipDiag ) {
			assert.equal( r.ALPHA[ 2 * j ], r.S[ 2 * ( j + ( j * N ) ) ], msg + ': ALPHA = diag(S)' );
			assert.equal( r.ALPHA[ ( 2 * j ) + 1 ], r.S[ ( 2 * ( j + ( j * N ) ) ) + 1 ], msg + ': ALPHA = diag(S)' );
			assert.equal( r.BETA[ 2 * j ], r.T[ 2 * ( j + ( j * N ) ) ], msg + ': BETA = diag(T)' );
			assert.equal( r.BETA[ ( 2 * j ) + 1 ], r.T[ ( 2 * ( j + ( j * N ) ) ) + 1 ], msg + ': BETA = diag(T)' );
		}
	}
}

/**
* Runs `fcn` (ndarray signature) with jobvsl = jobvsr = 'compute-vectors' on copies of A0, B0 and returns the outputs as plain arrays.
*
* @private
* @param {Function} fcn - zgges (ndarray signature)
* @param {string} sort - sort option
* @param {Function} selctg - selection function
* @param {Array} A0 - A (interleaved complex, column-major)
* @param {Array} B0 - B (interleaved complex, column-major)
* @param {integer} N - order
* @returns {Object} results
*/
function runSchur( fcn, sort, selctg, A0, B0, N ) {
	const sdim = new Int32Array( 1 );
	const A = new Complex128Array( new Float64Array( A0 ) );
	const B = new Complex128Array( new Float64Array( B0 ) );
	const ALPHA = new Complex128Array( N );
	const BETA = new Complex128Array( N );
	const VSL = new Complex128Array( N * N );
	const VSR = new Complex128Array( N * N );
	const info = fcn( 'compute-vectors', 'compute-vectors', sort, selctg, N, A, 1, N, 0, B, 1, N, 0, sdim, ALPHA, 1, 0, BETA, 1, 0, VSL, 1, N, 0, VSR, 1, N, 0, new Complex128Array( N + Math.max( 8 * N, 1 ) ), 1, 0, new Float64Array( ( 2 * N ) + Math.max( 8 * N, 1 ) ), 1, 0, new Uint8Array( Math.max( 1, N ) ), 1, 0 );
	return {
		'info': info,
		'sdim': sdim[ 0 ],
		'S': toArray( reinterpret( A, 0 ) ),
		'T': toArray( reinterpret( B, 0 ) ),
		'Q': toArray( reinterpret( VSL, 0 ) ),
		'Z': toArray( reinterpret( VSR, 0 ) ),
		'ALPHA': toArray( reinterpret( ALPHA, 0 ) ),
		'BETA': toArray( reinterpret( BETA, 0 ) )
	};
}

/**
* Selects eigenvalues `alpha/beta` with positive real part.
*
* @private
* @param {number} ar - real part of alpha
* @param {number} ai - imaginary part of alpha
* @param {number} br - real part of beta
* @param {number} bi - imaginary part of beta
* @returns {boolean} whether selected
*/
function selRePositive( ar, ai, br, bi ) {
	// Re( alpha * conj( beta ) ) has the sign of Re( alpha / beta ):
	return ( ( ar * br ) + ( ai * bi ) ) > 0.0;
}

/**
* Asserts that exactly the leading `sdim` eigenvalues satisfy `selctg`.
*
* @private
* @param {Object} r - results
* @param {Function} selctg - selection function
* @param {integer} N - order
* @param {string} msg - message prefix
*/
function assertSorted( r, selctg, N, msg ) {
	let count = 0;
	let i;
	for ( i = 0; i < N; i++ ) {
		if ( selctg( r.ALPHA[ 2 * i ], r.ALPHA[ ( 2 * i ) + 1 ], r.BETA[ 2 * i ], r.BETA[ ( 2 * i ) + 1 ] ) ) {
			count += 1;
			assert.ok( i < r.sdim, msg + ': selected eigenvalue ' + i + ' is among the leading sdim' );
		}
	}
	assert.equal( r.sdim, count, msg + ': sdim counts the selected eigenvalues' );
}

function runCase( tc, jobvsl, jobvsr ) {
	const sdim = new Int32Array( 1 );
	const tol = 1e-9;
	const N = tc.n;
	const A = new Complex128Array( new Float64Array( tc.Ain ) );
	const B = new Complex128Array( new Float64Array( tc.Bin ) );
	const ALPHA = new Complex128Array( N );
	const BETA = new Complex128Array( N );
	const VSL = new Complex128Array( Math.max( 1, N * N ) );
	const VSR = new Complex128Array( Math.max( 1, N * N ) );
	const WORK = new Complex128Array( N + Math.max( 8 * N, 1 ) );
	const RWORK = new Float64Array( ( 2 * N ) + Math.max( 8 * N, 1 ) );
	const BWORK = new Uint8Array( Math.max( 1, N ) );
	const res = zgges( jobvsl, jobvsr, 'none', nosel, N, A, 1, Math.max( 1, N ), 0, B, 1, Math.max( 1, N ), 0, sdim, ALPHA, 1, 0, BETA, 1, 0, VSL, 1, Math.max( 1, N ), 0, VSR, 1, Math.max( 1, N ), 0, WORK, 1, 0, RWORK, 1, 0, BWORK, 1, 0 );
	assert.equal( res, tc.info, 'info' );
	assert.equal( sdim[ 0 ], tc.sdim, 'sdim' );
	assertArrayClose( toArray( reinterpret( A, 0 ) ), tc.S, tol, 'S' );
	assertArrayClose( toArray( reinterpret( B, 0 ) ), tc.T, tol, 'T' );
	assertArrayClose( toArray( reinterpret( ALPHA, 0 ) ), tc.alpha, tol, 'alpha' );
	assertArrayClose( toArray( reinterpret( BETA, 0 ) ), tc.beta, tol, 'beta' );
	if ( tc.VSL ) {
		assertArrayClose( toArray( reinterpret( VSL, 0 ) ), tc.VSL, tol, 'VSL' );
	}
	if ( tc.VSR ) {
		assertArrayClose( toArray( reinterpret( VSR, 0 ) ), tc.VSR, tol, 'VSR' );
	}
}


// TESTS //

test( 'zgges: main export is a function', function t() {
	assert.strictEqual( typeof zgges, 'function', 'is a function' );
});

test( 'zgges: N=0 (degenerate)', function t() {
	const sdim = new Int32Array( 1 );
	const A = new Complex128Array( 0 );
	const B = new Complex128Array( 0 );
	const ALPHA = new Complex128Array( 0 );
	const BETA = new Complex128Array( 0 );
	const VSL = new Complex128Array( 0 );
	const VSR = new Complex128Array( 0 );
	const res = zgges( 'no-vectors', 'no-vectors', 'none', nosel, 0, A, 1, 0, 0, B, 1, 0, 0, sdim, ALPHA, 1, 0, BETA, 1, 0, VSL, 1, 0, 0, VSR, 1, 0, 0, new Complex128Array( 1 ), 1, 0, new Float64Array( 1 ), 1, 0, new Uint8Array( 1 ), 1, 0 );
	assert.equal( res, 0, 'info' );
	assert.equal( sdim[ 0 ], 0, 'sdim' );
});

test( 'zgges: 2x2_diag jobvsl=N jobvsr=N', function t() {
	runCase( findCase( '2x2_diag_no_vectors' ), 'no-vectors', 'no-vectors' );
});

test( 'zgges: 2x2_both jobvsl=V jobvsr=V', function t() {
	runCase( findCase( '2x2_both_vectors' ), 'compute-vectors', 'compute-vectors' );
});

test( 'zgges: 3x3_right_only jobvsl=N jobvsr=V', function t() {
	runCase( findCase( '3x3_right_only' ), 'no-vectors', 'compute-vectors' );
});

test( 'zgges: 3x3_left_only jobvsl=V jobvsr=N', function t() {
	runCase( findCase( '3x3_left_only' ), 'compute-vectors', 'no-vectors' );
});

test( 'zgges: 4x4_complex jobvsl=V jobvsr=V', function t() {
	runCase( findCase( '4x4_complex_both' ), 'compute-vectors', 'compute-vectors' );
});

test( 'zgges: 1x1_trivial jobvsl=V jobvsr=V', function t() {
	runCase( findCase( '1x1_trivial' ), 'compute-vectors', 'compute-vectors' );
});

test( 'zgges: 4x4_general jobvsl=V jobvsr=V', function t() {
	runCase( findCase( '4x4_general' ), 'compute-vectors', 'compute-vectors' );
});

test( 'zgges: tiny inputs trigger A-scaling (ilascl)', function t() {
	const sdim = new Int32Array( 1 );
	const N = 2;
	const A = new Complex128Array( N * N );
	const B = new Complex128Array( N * N );
	const av = reinterpret( A, 0 );
	const bv = reinterpret( B, 0 );
	av[ 0 ] = 1e-160; av[ 2 * ( 1 + N ) ] = 2e-160;
	bv[ 0 ] = 1.0; bv[ 2 * ( 1 + N ) ] = 1.0;
	const ALPHA = new Complex128Array( N );
	const BETA = new Complex128Array( N );
	const VSL = new Complex128Array( N * N );
	const VSR = new Complex128Array( N * N );
	const res = zgges( 'compute-vectors', 'compute-vectors', 'none', nosel, N, A, 1, N, 0, B, 1, N, 0, sdim, ALPHA, 1, 0, BETA, 1, 0, VSL, 1, N, 0, VSR, 1, N, 0, new Complex128Array( N + Math.max( 8 * N, 1 ) ), 1, 0, new Float64Array( ( 2 * N ) + Math.max( 8 * N, 1 ) ), 1, 0, new Uint8Array( Math.max( 1, N ) ), 1, 0 );
	assert.equal( res, 0, 'info' );
});

test( 'zgges: huge inputs trigger B-scaling (ilbscl)', function t() {
	const sdim = new Int32Array( 1 );
	const N = 2;
	const A = new Complex128Array( N * N );
	const B = new Complex128Array( N * N );
	const av = reinterpret( A, 0 );
	const bv = reinterpret( B, 0 );
	av[ 0 ] = 1.0; av[ 2 * ( 1 + N ) ] = 2.0;
	bv[ 0 ] = 1e160; bv[ 2 * ( 1 + N ) ] = 1e160;
	const ALPHA = new Complex128Array( N );
	const BETA = new Complex128Array( N );
	const VSL = new Complex128Array( N * N );
	const VSR = new Complex128Array( N * N );
	const res = zgges( 'compute-vectors', 'compute-vectors', 'none', nosel, N, A, 1, N, 0, B, 1, N, 0, sdim, ALPHA, 1, 0, BETA, 1, 0, VSL, 1, N, 0, VSR, 1, N, 0, new Complex128Array( N + Math.max( 8 * N, 1 ) ), 1, 0, new Float64Array( ( 2 * N ) + Math.max( 8 * N, 1 ) ), 1, 0, new Uint8Array( Math.max( 1, N ) ), 1, 0 );
	assert.equal( res, 0, 'info' );
});

test( 'zgges: sort=sort with selctg (positive real part)', function t() {
	const sdim = new Int32Array( 1 );
	const N = 3;
	const A = new Complex128Array( N * N );
	const B = new Complex128Array( N * N );
	const av = reinterpret( A, 0 );
	const bv = reinterpret( B, 0 );
	av[ 0 ] = 1.0; av[ 1 ] = 0.5;
	av[ 2 * ( 1 + N ) ] = -2.0; av[ 2 * ( 1 + N ) + 1 ] = 0.0;
	av[ 2 * ( 2 + ( 2 * N ) ) ] = 3.0; av[ 2 * ( 2 + ( 2 * N ) ) + 1 ] = -0.5;
	bv[ 0 ] = 1.0;
	bv[ 2 * ( 1 + N ) ] = 1.0;
	bv[ 2 * ( 2 + ( 2 * N ) ) ] = 1.0;
	const ALPHA = new Complex128Array( N );
	const BETA = new Complex128Array( N );
	const VSL = new Complex128Array( N * N );
	const VSR = new Complex128Array( N * N );
	const res = zgges( 'compute-vectors', 'compute-vectors', 'sort', selPositiveReal, N, A, 1, N, 0, B, 1, N, 0, sdim, ALPHA, 1, 0, BETA, 1, 0, VSL, 1, N, 0, VSR, 1, N, 0, new Complex128Array( N + Math.max( 8 * N, 1 ) ), 1, 0, new Float64Array( ( 2 * N ) + Math.max( 8 * N, 1 ) ), 1, 0, new Uint8Array( Math.max( 1, N ) ), 1, 0 );
	assert.equal( res, 0, 'info' );

	// 2 eigenvalues with positive real part:
	assert.equal( sdim[ 0 ], 2, 'sdim' );
});

test( 'zgges: info = N+3 when ztgsen cannot reorder (reference IERR.EQ.1)', async function t() {
	// No well-conditioned input makes ztgsen fail, so the failing callee is
	// substituted (test/harness/constants.js importWithDependencies).
	const base = await baseWithFailingZtgsen();
	const sdim = new Int32Array( 1 );
	const N = 3;
	const A = new Complex128Array( N * N );
	const B = new Complex128Array( N * N );
	const av = reinterpret( A, 0 );
	const bv = reinterpret( B, 0 );
	av[ 0 ] = 1.0;
	av[ 2 * ( 1 + N ) ] = -2.0;
	av[ 2 * ( 2 + ( 2 * N ) ) ] = 3.0;
	bv[ 0 ] = 1.0;
	bv[ 2 * ( 1 + N ) ] = 1.0;
	bv[ 2 * ( 2 + ( 2 * N ) ) ] = 1.0;
	// Select only the leading eigenvalue (1): the order is already right, so
	// the post-reorder check does not override INFO with N+2.
	const res = base( 'compute-vectors', 'compute-vectors', 'sort', function selectFirst( ar, ai, br ) {
		return ar / br < 2.0 && ar / br > 0.0;
	}, N, A, 1, N, 0, B, 1, N, 0, sdim, new Complex128Array( N ), 1, 0, new Complex128Array( N ), 1, 0, new Complex128Array( N * N ), 1, N, 0, new Complex128Array( N * N ), 1, N, 0, new Complex128Array( N + Math.max( 8 * N, 1 ) ), 1, 0, new Float64Array( ( 2 * N ) + Math.max( 8 * N, 1 ) ), 1, 0, new Uint8Array( Math.max( 1, N ) ), 1, 0 );
	assert.equal( res, N + 3, 'info' );
});

test( 'zgges: sort=sort with selctg (none selected)', function t() {
	const sdim = new Int32Array( 1 );
	const N = 2;
	const A = new Complex128Array( N * N );
	const B = new Complex128Array( N * N );
	const av = reinterpret( A, 0 );
	const bv = reinterpret( B, 0 );
	av[ 0 ] = 2.0; av[ 2 * ( 1 + N ) ] = 3.0;
	bv[ 0 ] = 1.0; bv[ 2 * ( 1 + N ) ] = 1.0;
	const ALPHA = new Complex128Array( N );
	const BETA = new Complex128Array( N );
	const VSL = new Complex128Array( N * N );
	const VSR = new Complex128Array( N * N );
	const res = zgges( 'compute-vectors', 'compute-vectors', 'sort', nosel, N, A, 1, N, 0, B, 1, N, 0, sdim, ALPHA, 1, 0, BETA, 1, 0, VSL, 1, N, 0, VSR, 1, N, 0, new Complex128Array( N + Math.max( 8 * N, 1 ) ), 1, 0, new Float64Array( ( 2 * N ) + Math.max( 8 * N, 1 ) ), 1, 0, new Uint8Array( Math.max( 1, N ) ), 1, 0 );
	assert.equal( res, 0, 'info' );
	assert.equal( sdim[ 0 ], 0, 'sdim' );
});

test( 'zgges: jobvsl=V jobvsr=N (left-only) basic', function t() {
	const sdim = new Int32Array( 1 );
	const N = 2;
	const A = new Complex128Array( N * N );
	const B = new Complex128Array( N * N );
	const av = reinterpret( A, 0 );
	const bv = reinterpret( B, 0 );
	av[ 0 ] = 2.0; av[ 2 * ( 1 + N ) ] = 3.0;
	bv[ 0 ] = 1.0; bv[ 2 * ( 1 + N ) ] = 1.0;
	const ALPHA = new Complex128Array( N );
	const BETA = new Complex128Array( N );
	const VSL = new Complex128Array( N * N );
	const VSR = new Complex128Array( 1 );
	const res = zgges( 'compute-vectors', 'no-vectors', 'none', nosel, N, A, 1, N, 0, B, 1, N, 0, sdim, ALPHA, 1, 0, BETA, 1, 0, VSL, 1, N, 0, VSR, 1, 1, 0, new Complex128Array( N + Math.max( 8 * N, 1 ) ), 1, 0, new Float64Array( ( 2 * N ) + Math.max( 8 * N, 1 ) ), 1, 0, new Uint8Array( Math.max( 1, N ) ), 1, 0 );
	assert.equal( res, 0, 'info' );
});

test( 'zgges: jobvsl=N jobvsr=V (right-only) basic', function t() {
	const sdim = new Int32Array( 1 );
	const N = 2;
	const A = new Complex128Array( N * N );
	const B = new Complex128Array( N * N );
	const av = reinterpret( A, 0 );
	const bv = reinterpret( B, 0 );
	av[ 0 ] = 2.0; av[ 2 * ( 1 + N ) ] = 3.0;
	bv[ 0 ] = 1.0; bv[ 2 * ( 1 + N ) ] = 1.0;
	const ALPHA = new Complex128Array( N );
	const BETA = new Complex128Array( N );
	const VSL = new Complex128Array( 1 );
	const VSR = new Complex128Array( N * N );
	const res = zgges( 'no-vectors', 'compute-vectors', 'none', nosel, N, A, 1, N, 0, B, 1, N, 0, sdim, ALPHA, 1, 0, BETA, 1, 0, VSL, 1, 1, 0, VSR, 1, N, 0, new Complex128Array( N + Math.max( 8 * N, 1 ) ), 1, 0, new Float64Array( ( 2 * N ) + Math.max( 8 * N, 1 ) ), 1, 0, new Uint8Array( Math.max( 1, N ) ), 1, 0 );
	assert.equal( res, 0, 'info' );
});

test( 'zgges: huge A (max|a| > BIGNUM, ilascl) is unscaled: sorted generalized Schur form reconstructs the pencil', function t() {
	const N = 4;
	const A0 = randMat( 3, N, 1e160 );
	const B0 = randMat( 5, N, 1.0 );
	const r = runSchur( zgges, 'sort', selRePositive, A0, B0, N );
	assert.equal( r.info, 0, 'info' );
	assert.ok( r.sdim > 0 && r.sdim < N, 'sdim is a proper subset (' + r.sdim + ')' );
	assertSchur( r, A0, B0, N, 'huge A' );
	assertSorted( r, selRePositive, N, 'huge A' );
	assert.ok( Math.hypot( r.ALPHA[ 0 ], r.ALPHA[ 1 ] ) > 1e150, 'ALPHA is at the original (unscaled) magnitude' );
});

test( 'zgges: tiny B (max|b| < SMLNUM, ilbscl) is unscaled: sorted generalized Schur form reconstructs the pencil', function t() {
	const N = 4;
	const A0 = randMat( 7, N, 1.0 );
	const B0 = randMat( 11, N, 1e-160 );
	const r = runSchur( zgges, 'sort', selRePositive, A0, B0, N );
	assert.equal( r.info, 0, 'info' );
	assert.ok( r.sdim > 0 && r.sdim < N, 'sdim is a proper subset (' + r.sdim + ')' );
	assertSchur( r, A0, B0, N, 'tiny B' );
	assertSorted( r, selRePositive, N, 'tiny B' );
	assert.ok( Math.hypot( r.BETA[ 0 ], r.BETA[ 1 ] ) < 1e-150, 'BETA is at the original (unscaled) magnitude' );
});

test( 'zgges: huge A and tiny B, no sorting: generalized Schur form reconstructs the pencil', function t() {
	const N = 4;
	const A0 = randMat( 13, N, 1e160 );
	const B0 = randMat( 17, N, 1e-160 );
	const r = runSchur( zgges, 'none', nosel, A0, B0, N );
	assert.equal( r.info, 0, 'info' );
	assert.equal( r.sdim, 0, 'sdim' );
	assertSchur( r, A0, B0, N, 'huge A, tiny B' );
});

test( 'zgges: info = N+3 (ztgsen failed) still undoes the A/B scaling of the Schur form and recounts sdim (zgges.f: back-permutation, undo scaling and SDIM loop follow the ZTGSEN call)', async function t() {
	const base = await baseWithFailingZtgsen();
	const CASES = [
		[ 1e-160, 1e160 ],
		[ 1e160, 1e-160 ],
		[ 1.0, 1.0 ]
	];
	const N = 4;
	let r;
	let i;
	for ( i = 0; i < CASES.length; i++ ) {
		const A0 = randMat( 19 + i, N, CASES[ i ][ 0 ] );
		const B0 = randMat( 23 + i, N, CASES[ i ][ 1 ] );

		// The substituted ztgsen leaves the QZ output untouched, so it is still a valid (unsorted) Schur form:
		r = runSchur( base, 'sort', function all() {
			return true;
		}, A0, B0, N );
		assert.equal( r.info, N + 3, 'info (case ' + i + ')' );
		assert.equal( r.sdim, N, 'sdim (case ' + i + ')' );
		// When A or B was scaled, ALPHA/BETA went through the pre-selection rescale that a successful ztgsen would overwrite with diag(S)/diag(T); only the unscaled case is compared with the diagonals here.
		assertSchur( r, A0, B0, N, 'case ' + i, CASES[ i ][ 0 ] !== 1.0 );
	}
});

test( 'zgges: accepts the reference\'s minimum workspaces, WORK of max(1,2*N) and RWORK of 8*N, and rejects one element less', function t() {
	const N = 40;
	const A0 = new Float64Array( 2 * N * N );
	const B0 = new Float64Array( 2 * N * N );
	const out = [];
	let k;
	let r;
	let i;
	let j;
	for ( j = 0; j < N; j++ ) {
		for ( i = 0; i < N; i++ ) {
			k = 2 * ( i + ( j * N ) );
			A0[ k ] = Math.sin( ( ( i + 1 ) * ( j + 2 ) ) + 0.5 );
			A0[ k + 1 ] = Math.cos( ( i + 2 ) * ( j + 1 ) );
			B0[ k ] = ( ( i === j ) ? 4.0 : 0.0 ) + Math.cos( ( i + 3 ) * ( j + 1 ) );
			B0[ k + 1 ] = Math.sin( ( i + 1 ) + ( 2 * j ) );
		}
	}
	function call( lwork, lrwork ) {
		const A = new Complex128Array( A0 );
		const B = new Complex128Array( B0 );
		const ALPHA = new Complex128Array( N );
		const BETA = new Complex128Array( N );
		const VSL = new Complex128Array( N * N );
		const VSR = new Complex128Array( N * N );
		const info = zgges( 'compute-vectors', 'compute-vectors', 'none', nosel, N, A, 1, N, 0, B, 1, N, 0, new Int32Array( 1 ), ALPHA, 1, 0, BETA, 1, 0, VSL, 1, N, 0, VSR, 1, N, 0, new Complex128Array( lwork ), 1, 0, new Float64Array( lrwork ), 1, 0, new Uint8Array( N ), 1, 0 );
		return {
			'info': info,
			'alpha': reinterpret( ALPHA, 0 ),
			'beta': reinterpret( BETA, 0 )
		};
	}
	for ( r = 0; r < 2; r++ ) {
		out.push( ( r === 0 ) ? call( 2 * N, 8 * N ) : call( N + ( 32 * N ) + 4160, 8 * N ) );
		assert.equal( out[ r ].info, 0, 'info' );
	}
	for ( i = 0; i < N; i++ ) {
		// Eigenvalues alpha/beta agree with the optimal-workspace run:
		const b0 = out[ 0 ].beta[ 2 * i ];
		const b1 = out[ 1 ].beta[ 2 * i ];
		assert.ok( Math.abs( ( out[ 0 ].alpha[ 2 * i ] / b0 ) - ( out[ 1 ].alpha[ 2 * i ] / b1 ) ) <= 1e-10 * ( 1.0 + Math.abs( out[ 1 ].alpha[ 2 * i ] / b1 ) ), 'Re eigenvalue ' + i );
		assert.ok( Math.abs( ( out[ 0 ].alpha[ ( 2 * i ) + 1 ] / b0 ) - ( out[ 1 ].alpha[ ( 2 * i ) + 1 ] / b1 ) ) <= 1e-10 * ( 1.0 + Math.abs( out[ 1 ].alpha[ ( 2 * i ) + 1 ] / b1 ) ), 'Im eigenvalue ' + i );
	}
	assert.throws( function throws() {
		call( ( 2 * N ) - 1, 8 * N );
	}, RangeError );
	assert.throws( function throws() {
		call( 2 * N, ( 8 * N ) - 1 );
	}, RangeError );
});
