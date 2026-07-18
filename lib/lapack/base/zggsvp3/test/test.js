/* eslint-disable no-restricted-syntax, stdlib/first-unit-test, max-len, max-params, max-statements, max-lines */


// MODULES //

import { readFileSync } from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import assert from 'node:assert/strict';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js'; // eslint-disable-line max-len
import zggsvp3 from './../lib/base.js';


// VARIABLES //

const MAXN = 8;
const fixtureDir = path.join( import.meta.dirname, '..', '..', '..', '..', '..', 'test', 'fixtures' ); // eslint-disable-line max-len
const lines = readFileSync( path.join( fixtureDir, 'zggsvp3.jsonl' ), 'utf8' ).trim().split( '\n' ); // eslint-disable-line node/no-sync
const fixture = lines.map( parseLine );

const aBasic = [
	[ 0, 0, 1.0, 0.5 ],
	[ 1, 0, 2.0, 0.0 ],
	[ 2, 0, 3.0, 1.0 ],
	[ 3, 0, 4.0, -0.5 ],
	[ 0, 1, 5.0, 0.0 ],
	[ 1, 1, 6.0, 1.0 ],
	[ 2, 1, 7.0, 0.0 ],
	[ 3, 1, 8.0, 0.5 ],
	[ 0, 2, 9.0, 0.5 ],
	[ 1, 2, 10.0, 0.0 ],
	[ 2, 2, 11.0, -1.0 ],
	[ 3, 2, 12.0, 0.0 ]
];
const bBasic = [
	[ 0, 0, 10.0, 0.0 ],
	[ 1, 0, 1.0, 0.5 ],
	[ 2, 0, 1.0, -0.5 ],
	[ 0, 1, 1.0, -0.5 ],
	[ 1, 1, 10.0, 0.0 ],
	[ 2, 1, 1.0, 0.5 ],
	[ 0, 2, 1.0, 0.5 ],
	[ 1, 2, 1.0, -0.5 ],
	[ 2, 2, 10.0, 0.0 ]
];
const jobsAll = [ 'compute-U', 'compute-V', 'compute-Q' ];
const jobsNone = [ 'none', 'none', 'none' ];
const aRank = [
	[ 0, 0, 2.0, 0.0 ],
	[ 1, 0, 1.0, 0.5 ],
	[ 2, 0, 0.0, 0.0 ],
	[ 0, 1, 1.0, -0.5 ],
	[ 1, 1, 3.0, 0.0 ],
	[ 2, 1, 1.0, 0.5 ],
	[ 0, 2, 0.0, 0.0 ],
	[ 1, 2, 1.0, -0.5 ],
	[ 2, 2, 4.0, 0.0 ]
];
const bRank = [
	[ 0, 0, 5.0, 0.0 ],
	[ 1, 0, 1.0, 0.5 ],
	[ 2, 0, 0.0, 0.0 ],
	[ 0, 1, 1.0, -0.5 ],
	[ 1, 1, 5.0, 0.0 ],
	[ 2, 1, 0.0, 0.0 ],
	[ 0, 2, 1.0, 0.5 ],
	[ 1, 2, 1.0, -0.5 ],
	[ 2, 2, 0.0, 0.0 ]
];
const aDiag = [
	[ 0, 0, 10.0, 0.0 ],
	[ 1, 1, 5.0, 0.0 ],
	[ 2, 2, 1.0, 0.0 ]
];
const bDiag = [
	[ 0, 0, 8.0, 0.0 ],
	[ 1, 1, 4.0, 0.0 ],
	[ 2, 2, 2.0, 0.0 ]
];
const aWide = [
	[ 0, 0, 1.0, 0.5 ],
	[ 1, 0, 2.0, 0.0 ],
	[ 0, 1, 3.0, -0.5 ],
	[ 1, 1, 4.0, 1.0 ],
	[ 0, 2, 5.0, 0.0 ],
	[ 1, 2, 6.0, -0.5 ],
	[ 0, 3, 7.0, 0.5 ],
	[ 1, 3, 8.0, 0.0 ],
	[ 0, 4, 9.0, -0.5 ],
	[ 1, 4, 10.0, 0.5 ]
];
const bWide = [
	[ 0, 0, 10.0, 0.0 ],
	[ 1, 0, 1.0, 0.5 ],
	[ 0, 1, 1.0, -0.5 ],
	[ 1, 1, 10.0, 0.0 ],
	[ 0, 2, 2.0, 0.0 ],
	[ 1, 2, 2.0, 0.5 ],
	[ 0, 3, 3.0, -0.5 ],
	[ 1, 3, 3.0, 0.0 ],
	[ 0, 4, 1.0, 0.5 ],
	[ 1, 4, 1.0, -0.5 ]
];
const bMzero = [
	[ 0, 0, 5.0, 0.0 ],
	[ 1, 0, 1.0, 0.5 ],
	[ 0, 1, 1.0, -0.5 ],
	[ 1, 1, 5.0, 0.0 ]
];
const aTall = [
	[ 0, 0, 2.0, 0.0 ],
	[ 1, 0, 1.0, 0.5 ],
	[ 2, 0, 0.5, 0.0 ],
	[ 0, 1, 0.5, -0.5 ],
	[ 1, 1, 3.0, 0.0 ],
	[ 2, 1, 1.0, 0.5 ],
	[ 0, 2, 1.0, 0.0 ],
	[ 1, 2, 0.5, -0.5 ],
	[ 2, 2, 4.0, 0.0 ]
];
const bTall = [
	[ 0, 0, 10.0, 0.0 ],
	[ 1, 0, 1.0, 0.5 ],
	[ 2, 0, 1.0, -0.5 ],
	[ 3, 0, 1.0, 0.0 ],
	[ 4, 0, 1.0, 0.5 ],
	[ 0, 1, 1.0, -0.5 ],
	[ 1, 1, 10.0, 0.0 ],
	[ 2, 1, 1.0, 0.5 ],
	[ 3, 1, 1.0, -0.5 ],
	[ 4, 1, 1.0, 0.0 ],
	[ 0, 2, 1.0, 0.5 ],
	[ 1, 2, 1.0, -0.5 ],
	[ 2, 2, 10.0, 0.0 ],
	[ 3, 2, 1.0, 0.5 ],
	[ 4, 2, 1.0, -0.5 ]
];


// FUNCTIONS //

/**
* Parses a single JSONL line.
*
* @private
* @param {string} line - line contents
* @returns {Object} parsed object
*/
function parseLine( line ) {
		return JSON.parse( line );
	}


// FUNCTIONS //

/**
* Find a fixture case by name.
*
* @private
* @param {string} name - case name
* @returns {Object} fixture case
*/
function findCase( name ) {
	let i;
	for ( i = 0; i < fixture.length; i++ ) {
		if ( fixture[ i ].name === name ) {
			return fixture[ i ];
		}
	}
	return null;
}

/**
* Assert that two numbers are close within a relative tolerance.
*
* @private
* @param {number} actual - actual value
* @param {number} expected - expected value
* @param {number} tol - relative tolerance
* @param {string} msg - assertion message prefix
*/
function assertClose( actual, expected, tol, msg ) {
	const relErr = Math.abs( actual - expected ) / Math.max( Math.abs( expected ), 1.0 ); // eslint-disable-line max-len
	assert.ok( relErr <= tol, msg + ': expected ' + expected + ', got ' + actual );
}

/**
* Assert that two packed arrays are element-wise close.
*
* @private
* @param {Float64Array} actual - actual values (interleaved re/im)
* @param {Float64Array} expected - expected values
* @param {number} tol - tolerance
* @param {string} msg - assertion message prefix
*/
function assertPackedClose( actual, expected, tol, msg ) {
	let i;
	assert.equal( actual.length, expected.length, msg + ': length mismatch' );
	for ( i = 0; i < actual.length; i++ ) {
		assertClose( actual[ i ], expected[ i ], tol, msg + '[' + i + ']' );
	}
}

/**
* Build a Complex128Array storing a column-major matrix with stride2=MAXN.
*
* @private
* @param {Array} entries - entries as [row, col, re, im]
* @returns {Complex128Array} matrix
*/
function buildMat( entries ) {
	let idx, e, k;
	const arr = new Complex128Array( MAXN * MAXN );
	const view = reinterpret( arr, 0 );
	for ( k = 0; k < entries.length; k++ ) {
		e = entries[ k ];
		idx = 2 * ( e[ 0 ] + ( e[ 1 ] * MAXN ) );
		view[ idx ] = e[ 2 ];
		view[ idx + 1 ] = e[ 3 ];
	}
	return arr;
}

/**
* Snapshot an MxN sub-matrix (stride2=MAXN col-major) into a packed Float64Array.
*
* @private
* @param {Complex128Array} arr - input matrix
* @param {NonNegativeInteger} rows - number of rows
* @param {NonNegativeInteger} cols - number of columns
* @returns {Float64Array} packed snapshot
*/
function snapshot( arr, rows, cols ) {
	let i, j, s, d;
	const view = reinterpret( arr, 0 );
	const out = new Float64Array( 2 * rows * cols );
	for ( j = 0; j < cols; j++ ) {
		for ( i = 0; i < rows; i++ ) {
			s = 2 * ( i + ( j * MAXN ) );
			d = 2 * ( i + ( j * rows ) );
			out[ d ] = view[ s ];
			out[ d + 1 ] = view[ s + 1 ];
		}
	}
	return out;
}

/**
* Assert that Q is unitary (Q^H * Q = I). Q is n x n, col-major, stride2=MAXN.
*
* @private
* @param {Complex128Array} Q - matrix
* @param {NonNegativeInteger} n - dimension
* @param {number} tol - tolerance
* @param {string} msg - assertion message prefix
*/
function assertUnitary( Q, n, tol, msg ) {
	let iqa, iqb, tr, ti, i, j, k;
	const Qv = reinterpret( Q, 0 );
	for ( i = 0; i < n; i++ ) {
		for ( j = 0; j < n; j++ ) {
			tr = 0.0;
			ti = 0.0;
			for ( k = 0; k < n; k++ ) {
				iqa = 2 * ( k + ( i * MAXN ) );
				iqb = 2 * ( k + ( j * MAXN ) );
				tr += ( Qv[ iqa ] * Qv[ iqb ] ) + ( Qv[ iqa + 1 ] * Qv[ iqb + 1 ] );
				ti += ( Qv[ iqa ] * Qv[ iqb + 1 ] ) - ( Qv[ iqa + 1 ] * Qv[ iqb ] );
			}
			if ( i === j ) {
				assertClose( tr, 1.0, tol, msg + '[' + i + ',' + j + '].re' );
				assertClose( ti, 0.0, tol, msg + '[' + i + ',' + j + '].im' );
			} else {
				assert.ok( Math.abs( tr ) < tol, msg + '[' + i + ',' + j + '].re (offdiag)' ); // eslint-disable-line max-len
				assert.ok( Math.abs( ti ) < tol, msg + '[' + i + ',' + j + '].im (offdiag)' ); // eslint-disable-line max-len
			}
		}
	}
}

/**
* Verify that `U` times `R` times `Q^H` equals the original packed matrix.
*
* U is Mrows x Ku, R is Ku x Kq (both stride2=MAXN col-major), Q is Kq x Kq unitary.
*
* @private
* @param {Complex128Array} U - left unitary factor
* @param {Complex128Array} R - triangular factor (result)
* @param {Complex128Array} Q - right unitary factor
* @param {NonNegativeInteger} Mrows - rows of U
* @param {NonNegativeInteger} Ku - inner dimension (cols of U, rows of R)
* @param {NonNegativeInteger} Kq - cols of R / dim of Q
* @param {Float64Array} orig - packed original
* @param {number} tol - tolerance
* @param {string} msg - assertion message prefix
*/
function verifyReconstruction( U, R, Q, Mrows, Ku, Kq, orig, tol, msg ) {
	let iu, ir, it, iq, tr, ti, ar, ai, br, bi, i, j, k;
	const Uv = reinterpret( U, 0 );
	const Rv = reinterpret( R, 0 );
	const Qv = reinterpret( Q, 0 );

	// temp = U * R  (Mrows x Kq), packed with stride2=Mrows
	const temp = new Float64Array( 2 * Mrows * Kq );
	for ( i = 0; i < Mrows; i++ ) {
		for ( j = 0; j < Kq; j++ ) {
			tr = 0.0;
			ti = 0.0;
			for ( k = 0; k < Ku; k++ ) {
				iu = 2 * ( i + ( k * MAXN ) );
				ir = 2 * ( k + ( j * MAXN ) );
				ar = Uv[ iu ];
				ai = Uv[ iu + 1 ];
				br = Rv[ ir ];
				bi = Rv[ ir + 1 ];
				tr += ( ar * br ) - ( ai * bi );
				ti += ( ar * bi ) + ( ai * br );
			}
			it = 2 * ( i + ( j * Mrows ) );
			temp[ it ] = tr;
			temp[ it + 1 ] = ti;
		}
	}

	// out = temp * Q^H  (Mrows x Kq). Q^H[k,j] = conj(Q[j,k]).
	const out = new Float64Array( 2 * Mrows * Kq );
	for ( i = 0; i < Mrows; i++ ) {
		for ( j = 0; j < Kq; j++ ) {
			tr = 0.0;
			ti = 0.0;
			for ( k = 0; k < Kq; k++ ) {
				it = 2 * ( i + ( k * Mrows ) );
				iq = 2 * ( j + ( k * MAXN ) );
				ar = temp[ it ];
				ai = temp[ it + 1 ];
				br = Qv[ iq ];
				bi = -Qv[ iq + 1 ];
				tr += ( ar * br ) - ( ai * bi );
				ti += ( ar * bi ) + ( ai * br );
			}
			it = 2 * ( i + ( j * Mrows ) );
			out[ it ] = tr;
			out[ it + 1 ] = ti;
		}
	}
	assertPackedClose( out, orig, tol, msg );
}

/**
* Allocate a Complex128Array of the requested size (full or stub).
*
* @private
* @param {boolean} want - whether to allocate full
* @returns {Complex128Array} array
*/
function allocMat( want ) {
	if ( want ) {
		return new Complex128Array( MAXN * MAXN );
	}
	return new Complex128Array( 1 );
}

/**
* Run one fixture-backed test end to end.
*
* @private
* @param {string} name - fixture case name
* @param {NonNegativeInteger} M - rows of A
* @param {NonNegativeInteger} P - rows of B
* @param {NonNegativeInteger} N - columns of A and B
* @param {Array} aEntries - A entries [row, col, re, im]
* @param {Array} bEntries - B entries
* @param {Array<string>} jobs - [jobu, jobv, jobq]
*/
function runCase( name, M, P, N, aEntries, bEntries, jobs ) {

	const tc = findCase( name );
	const wantu = ( jobs[ 0 ] === 'compute-U' );
	const wantv = ( jobs[ 1 ] === 'compute-V' );
	const wantq = ( jobs[ 2 ] === 'compute-Q' );

	const A = buildMat( aEntries );
	const B = buildMat( bEntries );
	const aOrig = snapshot( A, M || 1, N || 1 );
	const bOrig = snapshot( B, P || 1, N || 1 );

	const U = allocMat( wantu );
	const V = allocMat( wantv );
	const Q = allocMat( wantq );

	const IWORK = new Int32Array( 8 );
	const RWORK = new Float64Array( 5 * 8 );
	const TAU = new Complex128Array( 8 );
	const WORK = new Complex128Array( 5000 );
	const K = [ 0 ];
	const l = [ 0 ];

	const ldU = ( wantu ) ? MAXN : 1;
	const ldV = ( wantv ) ? MAXN : 1;
	const ldQ = ( wantq ) ? MAXN : 1;

	const info = zggsvp3( jobs[ 0 ], jobs[ 1 ], jobs[ 2 ], M, P, N, A, 1, MAXN, 0, B, 1, MAXN, 0, 1e-8, 1e-8, K, l, U, 1, ldU, 0, V, 1, ldV, 0, Q, 1, ldQ, 0, IWORK, 1, 0, RWORK, 1, 0, TAU, 1, 0, WORK, 1, 0 ); // eslint-disable-line max-len

	assert.equal( info, tc.info, 'info' );
	assert.equal( K[ 0 ], tc.K, 'K' );
	assert.equal( l[ 0 ], tc.L, 'L' );

	if ( N === 0 || M === 0 || P === 0 ) {
		return;
	}

	if ( wantu ) {
		assertUnitary( U, M, 1e-10, 'U unitary' );
	}
	if ( wantv ) {
		assertUnitary( V, P, 1e-10, 'V unitary' );
	}
	if ( wantq ) {
		assertUnitary( Q, N, 1e-10, 'Q unitary' );
	}

	// Verify mathematical invariants U*A_result*Q^H == A_orig and V*B_result*Q^H == B_orig. // eslint-disable-line max-len
	if ( wantu && wantq ) {
		verifyReconstruction( U, A, Q, M, M, N, aOrig, 1e-9, 'U*A*Q^H vs A_orig' );
	}
	if ( wantv && wantq ) {
		verifyReconstruction( V, B, Q, P, P, N, bOrig, 1e-9, 'V*B*Q^H vs B_orig' );
	}
}


// TESTS //

test( 'zggsvp3: basic_4x3_3x3_UVQ', function t() {
	runCase( 'basic_4x3_3x3_UVQ', 4, 3, 3, aBasic, bBasic, jobsAll );
});

test( 'zggsvp3: basic_4x3_3x3_NNN', function t() {
	runCase( 'basic_4x3_3x3_NNN', 4, 3, 3, aBasic, bBasic, jobsNone );
});

test( 'zggsvp3: rank_deficient_B', function t() {
	runCase( 'rank_deficient_B', 3, 3, 3, aRank, bRank, jobsAll );
});

test( 'zggsvp3: diagonal_3x3', function t() {
	runCase( 'diagonal_3x3', 3, 3, 3, aDiag, bDiag, jobsAll );
});

test( 'zggsvp3: wide_2x5_UVQ', function t() {
	runCase( 'wide_2x5_UVQ', 2, 2, 5, aWide, bWide, jobsAll );
});

test( 'zggsvp3: n_zero', function t() {
	runCase( 'n_zero', 3, 2, 0, [], [], jobsAll );
});

test( 'zggsvp3: m_zero', function t() {
	runCase( 'm_zero', 0, 2, 2, [], bMzero, jobsAll );
});

test( 'zggsvp3: tall_B_3x5x3', function t() {
	runCase( 'tall_B_3x5x3', 3, 5, 3, aTall, bTall, jobsAll );
});
