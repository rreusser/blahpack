/**
* @license Apache-2.0
*
* Copyright (c) 2025 The Stdlib Authors.
*/

/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import { readFileSync } from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import dgelss from './../lib/ndarray.js';


// FIXTURES //

var fixtureDir = path.join( import.meta.dirname, '..', '..', '..', '..', '..', 'test', 'fixtures' );
var rawLines = readFileSync( path.join( fixtureDir, 'dgelss.jsonl' ), 'utf8' ).trim().split( '\n' ); // eslint-disable-line node/no-sync, max-len
var FIXTURES = rawLines.map( function parse( line ) {
	return JSON.parse( line );
});


// FUNCTIONS //

/**
* Asserts that two numbers are approximately equal.
*
* @private
* @param {number} actual - actual value
* @param {number} expected - expected value
* @param {number} tol - tolerance
* @param {string} msg - assertion message
*/
function assertClose( actual, expected, tol, msg ) {
	var relErr = Math.abs( actual - expected ) / Math.max( Math.abs( expected ), 1.0 ); // eslint-disable-line max-len
	assert.ok( relErr <= tol, format( '%s: expected %s, got %s', msg, expected, actual ) );
}

/**
* Asserts that two arrays are element-wise approximately equal.
*
* @private
* @param {ArrayLikeObject} actual - actual value
* @param {ArrayLikeObject} expected - expected value
* @param {number} tol - tolerance
* @param {string} msg - assertion message
*/
function assertArrayClose( actual, expected, tol, msg ) {
	var i;
	for ( i = 0; i < expected.length; i++ ) {
		assertClose( actual[ i ], expected[ i ], tol, format( '%s[%d]', msg, i ) );
	}
}

/**
* Returns a fixture by name.
*
* @private
* @param {string} name - case name
* @returns {Object} fixture record
*/
function findCase( name ) {
	var i;
	for ( i = 0; i < FIXTURES.length; i++ ) {
		if ( FIXTURES[ i ].name === name ) {
			return FIXTURES[ i ];
		}
	}
	throw new Error( format( 'fixture not found: %s', name ) );
}

/**
* Computes the minimum WORK size for dgelss (LAPACK MINWRK + NB headroom).
*
* @private
* @param {NonNegativeInteger} M - rows
* @param {NonNegativeInteger} N - cols
* @param {NonNegativeInteger} nrhs - number of right-hand sides
* @returns {NonNegativeInteger} required WORK length
*/
function workSize( M, N, nrhs ) {
	var minmn = Math.min( M, N );
	var maxmn = Math.max( M, N );
	if ( minmn === 0 ) {
		return 1;
	}
	// MINWRK = 3*minmn + max(2*minmn, maxmn, nrhs)
	// BDSPAC = 5*minmn
	// Add NB=32 headroom for path 2a (LQ + workspace copy):
	var nb = 32;
	var minwrk = ( 3 * minmn ) + Math.max( 2 * minmn, maxmn, nrhs );
	var bdspac = 5 * minmn;
	var pathA = ( M * M ) + ( 4 * M ) + ( M * nb ) + maxmn;
	return Math.max( minwrk, bdspac, pathA, maxmn * nrhs, 1 );
}

/**
* Runs a dgelss test case.
*
* @private
* @param {string} name - fixture name
* @param {NonNegativeInteger} M - rows
* @param {NonNegativeInteger} N - cols
* @param {NonNegativeInteger} nrhs - number of RHS
* @param {Array} aData - A column-major data
* @param {Array} bData - B data, length max(M,N)*nrhs
* @param {number} rcond - rcond value
* @param {number} xLen - length of solution vector to compare
*/
function runCase( name, M, N, nrhs, aData, bData, rcond, xLen ) {
	var ldb = Math.max( M, N, 1 );
	var minMN = Math.min( M, N );
	var A = new Float64Array( Math.max( M * N, 1 ) );
	var B = new Float64Array( Math.max( ldb * nrhs, 1 ) );
	var S = new Float64Array( Math.max( minMN, 1 ) );
	var lwork = workSize( M, N, nrhs );
	var WORK = new Float64Array( lwork );
	var rank = [ 0 ];
	var i;
	var info;
	var tc;

	for ( i = 0; i < aData.length; i++ ) {
		A[ i ] = aData[ i ];
	}
	for ( i = 0; i < bData.length; i++ ) {
		B[ i ] = bData[ i ];
	}

	// Signature: M, N, nrhs, A, sa1, sa2, oA, B, sb1, sb2, oB, S, sS, oS, rcond, rank, WORK, sWORK, oWORK, lwork
	info = dgelss( M, N, nrhs, A, 1, Math.max( M, 1 ), 0, B, 1, ldb, 0, S, 1, 0, rcond, rank, WORK, 1, 0, lwork );

	tc = findCase( name );
	assert.equal( info, tc.info, name + ':info' );
	assert.equal( rank[ 0 ], tc.rank, name + ':rank' );
	if ( tc.x ) {
		assertArrayClose( B.slice( 0, xLen ), tc.x, 1e-10, name + ':x' );
	}
	if ( tc.s ) {
		assertArrayClose( S.slice( 0, tc.s.length ), tc.s, 1e-10, name + ':s' );
	}
}


// TESTS //

test( 'dgelss: main export is a function', function t() {
	assert.strictEqual( typeof dgelss, 'function', 'is a function' );
});

test( 'dgelss: overdetermined full rank 4x2 single RHS', function t() {
	runCase( 'overdetermined_full_rank', 4, 2, 1,
		[ 1, 3, 5, 7, 2, 4, 6, 8 ],
		[ 1, 2, 3, 4 ],
		-1.0, 2 );
});

test( 'dgelss: overdetermined rank-deficient 4x2', function t() {
	runCase( 'overdetermined_rank_deficient', 4, 2, 1,
		[ 1, 2, 3, 4, 2, 4, 6, 8 ],
		[ 1, 2, 3, 4 ],
		0.01, 2 );
});

test( 'dgelss: underdetermined 2x4 single RHS', function t() {
	runCase( 'underdetermined', 2, 4, 1,
		[ 1, 0, 0, 1, 0, 0, 0, 0 ],
		[ 1, 2, 0, 0 ],
		-1.0, 4 );
});

test( 'dgelss: square 3x3', function t() {
	runCase( 'square_3x3', 3, 3, 1,
		[ 2, 1, 0, 1, 3, 1, 0, 1, 2 ],
		[ 1, 2, 3 ],
		-1.0, 3 );
});

test( 'dgelss: multiple RHS 3x3 (NRHS=2)', function t() {
	runCase( 'multiple_rhs', 3, 3, 2,
		[ 4, 1, 0, 1, 3, 1, 0, 1, 4 ],
		[ 1, 2, 3, 4, 5, 6 ],
		-1.0, 6 );
});

test( 'dgelss: M=0 quick return', function t() {
	runCase( 'm_zero', 0, 3, 1, [], [], -1.0, 0 );
});

test( 'dgelss: N=0 quick return', function t() {
	runCase( 'n_zero', 3, 0, 1, [], [], -1.0, 0 );
});

test( 'dgelss: overdetermined_tall 6x2 (QR preconditioning path)', function t() {
	runCase( 'overdetermined_tall', 6, 2, 1,
		[ 1, 0, 1, 2, 1, 0, 0, 1, 1, 1, 2, 0 ],
		[ 1, 1, 2, 3, 3, 0 ],
		-1.0, 2 );
});

test( 'dgelss: underdetermined_wide 2x6 (LQ path)', function t() {
	// Per Fortran source: A(1)=A(3)=1, A(4)=A(6)=1 with LDA=2
	// Column-major: col0=[1,0], col1=[1,1], col2=[0,1], col3..5=[0,0]
	runCase( 'underdetermined_wide', 2, 6, 1,
		[ 1, 0, 1, 1, 0, 1, 0, 0, 0, 0, 0, 0 ],
		[ 2, 4, 0, 0, 0, 0 ],
		-1.0, 6 );
});

test( 'dgelss: zero matrix returns rank=0 (anrm===0 path)', function t() {
	var M = 4;
	var N = 2;
	var ldb = Math.max( M, N );
	var A = new Float64Array( M * N ); // all zeros
	var B = new Float64Array( ldb * 1 );
	var S = new Float64Array( Math.min( M, N ) );
	var lwork = workSize( M, N, 1 );
	var WORK = new Float64Array( lwork );
	var rank = [ 0 ];
	B[ 0 ] = 1; B[ 1 ] = 2; B[ 2 ] = 3; B[ 3 ] = 4;
	var info = dgelss( M, N, 1, A, 1, M, 0, B, 1, ldb, 0, S, 1, 0, -1.0, rank, WORK, 1, 0, lwork );
	assert.equal( info, 0, 'info' );
	assert.equal( rank[ 0 ], 0, 'rank' );

	// Solution and singular values should be zero
	assert.equal( S[ 0 ], 0, 'S[0]' );
	assert.equal( S[ 1 ], 0, 'S[1]' );
});

test( 'dgelss: small-norm matrix (anrm < smlnum, scale-up path)', function t() {
	// Matrix with all entries around 1e-300 -> anrm < smlnum -> iascl=1
	var M = 4;
	var N = 2;
	var ldb = Math.max( M, N );
	var A = new Float64Array( [ 1e-300, 3e-300, 5e-300, 7e-300, 2e-300, 4e-300, 6e-300, 8e-300 ] );
	var B = new Float64Array( ldb * 1 );
	var S = new Float64Array( Math.min( M, N ) );
	var lwork = workSize( M, N, 1 );
	var WORK = new Float64Array( lwork );
	var rank = [ 0 ];
	B[ 0 ] = 1e-300; B[ 1 ] = 2e-300; B[ 2 ] = 3e-300; B[ 3 ] = 4e-300;
	var info = dgelss( M, N, 1, A, 1, M, 0, B, 1, ldb, 0, S, 1, 0, -1.0, rank, WORK, 1, 0, lwork );
	assert.equal( info, 0, 'info' );
	assert.ok( rank[ 0 ] > 0, 'rank > 0' );
});

test( 'dgelss: huge-norm matrix (anrm > bignum, scale-down path)', function t() {
	// Entries close to overflow: ~1e300 -> anrm > bignum (~1e292) -> iascl=2
	var M = 4;
	var N = 2;
	var ldb = Math.max( M, N );
	var A = new Float64Array( [ 1e300, 3e300, 5e300, 7e300, 2e300, 4e300, 6e300, 8e300 ] );
	var B = new Float64Array( ldb * 1 );
	var S = new Float64Array( Math.min( M, N ) );
	var lwork = workSize( M, N, 1 );
	var WORK = new Float64Array( lwork );
	var rank = [ 0 ];
	B[ 0 ] = 1; B[ 1 ] = 2; B[ 2 ] = 3; B[ 3 ] = 4;
	var info = dgelss( M, N, 1, A, 1, M, 0, B, 1, ldb, 0, S, 1, 0, -1.0, rank, WORK, 1, 0, lwork );
	assert.equal( info, 0, 'info' );
	assert.ok( rank[ 0 ] > 0, 'rank > 0' );
});

test( 'dgelss: huge-norm B (bnrm > bignum, scale-down path)', function t() {
	// Normal A, huge B -> ibscl=2
	var M = 4;
	var N = 2;
	var ldb = Math.max( M, N );
	var A = new Float64Array( [ 1, 3, 5, 7, 2, 4, 6, 8 ] );
	var B = new Float64Array( ldb * 1 );
	var S = new Float64Array( Math.min( M, N ) );
	var lwork = workSize( M, N, 1 );
	var WORK = new Float64Array( lwork );
	var rank = [ 0 ];
	B[ 0 ] = 1e300; B[ 1 ] = 2e300; B[ 2 ] = 3e300; B[ 3 ] = 4e300;
	var info = dgelss( M, N, 1, A, 1, M, 0, B, 1, ldb, 0, S, 1, 0, -1.0, rank, WORK, 1, 0, lwork );
	assert.equal( info, 0, 'info' );
});

test( 'dgelss: tiny-norm B (bnrm < smlnum, scale-up path)', function t() {
	var M = 4;
	var N = 2;
	var ldb = Math.max( M, N );
	var A = new Float64Array( [ 1, 3, 5, 7, 2, 4, 6, 8 ] );
	var B = new Float64Array( ldb * 1 );
	var S = new Float64Array( Math.min( M, N ) );
	var lwork = workSize( M, N, 1 );
	var WORK = new Float64Array( lwork );
	var rank = [ 0 ];
	B[ 0 ] = 1e-300; B[ 1 ] = 2e-300; B[ 2 ] = 3e-300; B[ 3 ] = 4e-300;
	var info = dgelss( M, N, 1, A, 1, M, 0, B, 1, ldb, 0, S, 1, 0, -1.0, rank, WORK, 1, 0, lwork );
	assert.equal( info, 0, 'info' );
});

test( 'dgelss: underdetermined N>M minimum workspace (path 2b direct bidiag)', function t() {
	// N > M — use minimum LAPACK workspace: 3*min(M,N) + max(2*min(M,N), max(M,N), nrhs)
	var M = 4;
	var N = 20;
	var nrhs = 1;
	var ldb = Math.max( M, N );
	var minMN = Math.min( M, N );
	var A = new Float64Array( M * N );
	var B = new Float64Array( ldb * nrhs );
	var S = new Float64Array( minMN );
	var rank = [ 0 ];
	var i;

	// Random full-rank A (rank 4)
	for ( i = 0; i < M * N; i++ ) {
		A[ i ] = ( i % 7 ) - 3;
	}
	A[ 0 ] += 10; A[ 1 + N ] += 10; A[ 2 + 2 * N ] += 10; A[ 3 + 3 * N ] += 10;
	B[ 0 ] = 1; B[ 1 ] = 2; B[ 2 ] = 3; B[ 3 ] = 4;

	// lwork = LAPACK minimum; less than path 2a threshold, so path 2b is taken
	var lwork = Math.max( 1, 3 * minMN + Math.max( 2 * minMN, Math.max( M, N ), nrhs ) );
	var WORK = new Float64Array( lwork );
	var info = dgelss( M, N, nrhs, A, 1, M, 0, B, 1, ldb, 0, S, 1, 0, -1.0, rank, WORK, 1, 0, lwork );
	assert.equal( info, 0, 'info' );
	assert.ok( rank[ 0 ] > 0, 'rank > 0' );
});

test( 'dgelss: M>=N with multiple RHS and limited workspace (chunked GEMM path)', function t() {
	// Provide WORK with lwork < strideB2*nrhs to trigger the chunked GEMM
	// Branch (lines 250-255).
	var M = 6;
	var N = 3;
	var nrhs = 4;
	var ldb = Math.max( M, N );
	var A = new Float64Array( M * N );
	var B = new Float64Array( ldb * nrhs );
	var S = new Float64Array( Math.min( M, N ) );
	var rank = [ 0 ];
	var i;
	for ( i = 0; i < M * N; i++ ) {
		A[ i ] = ( ( i * 7 ) % 11 ) - 5;
	}
	for ( i = 0; i < ldb * nrhs; i++ ) {
		B[ i ] = ( i % 5 ) + 1;
	}
	// lwork just enough but less than ldb*nrhs to force chunking
	var lwork = 3 * N + 8 * Math.max( M, N ); // generous for bidiag, but small for full GEMM
	if ( lwork >= ldb * nrhs ) {
		lwork = Math.max( N, ldb * nrhs - 1 );
	}
	var WORK = new Float64Array( lwork );
	var info = dgelss( M, N, nrhs, A, 1, M, 0, B, 1, ldb, 0, S, 1, 0, -1.0, rank, WORK, 1, 0, lwork );
	assert.equal( info, 0, 'info' );
});

test( 'dgelss: path 2a (LQ) with multiple RHS and chunked GEMM', function t() {
	// N >> M, multiple RHS, lwork small enough that lwork < iwork+M*nrhs
	// Triggers chunked GEMM branch in LQ path (lines 331-336).
	var M = 2;
	var N = 8;
	var nrhs = 4;
	var ldb = Math.max( M, N );
	var A = new Float64Array( M * N );
	var B = new Float64Array( ldb * nrhs );
	var S = new Float64Array( Math.min( M, N ) );
	var rank = [ 0 ];
	var i;
	A[ 0 ] = 1; A[ 1 ] = 0; A[ 2 ] = 1; A[ 3 ] = 1; A[ 4 ] = 0; A[ 5 ] = 1;
	for ( i = 6; i < M * N; i++ ) {
		A[ i ] = 0.1 * ( i % 3 );
	}
	for ( i = 0; i < ldb * nrhs; i++ ) {
		B[ i ] = ( i % 3 ) + 1;
	}
	// Provide moderate workspace that satisfies path 2a entry but not full GEMM
	// Path 2a entry: lwork >= 4*M + M*M + max(M, 2*M-4, nrhs, N-3*M) = 8+4+max(2,0,4,2)=16
	// We want lwork minimal-ish to push chunked path
	var lwork = 4 * M + ( M * M ) + Math.max( M, 2 * M - 4, nrhs, N - 3 * M ) + ( M * M ) + M; // a bit above min
	var WORK = new Float64Array( lwork );
	var info = dgelss( M, N, nrhs, A, 1, M, 0, B, 1, ldb, 0, S, 1, 0, -1.0, rank, WORK, 1, 0, lwork );
	assert.equal( info, 0, 'info' );
});

test( 'dgelss: path 2b (no LQ) with multiple RHS chunked GEMM', function t() {
	// Force path 2b via tight lwork that fails path 2a's gating, with nrhs > 1
	var M = 2;
	var N = 6;
	var nrhs = 3;
	var ldb = Math.max( M, N );
	var A = new Float64Array( M * N );
	var B = new Float64Array( ldb * nrhs );
	var S = new Float64Array( Math.min( M, N ) );
	var rank = [ 0 ];
	var i;
	A[ 0 ] = 1; A[ 1 ] = 0; A[ 2 ] = 1; A[ 3 ] = 1; A[ 4 ] = 0; A[ 5 ] = 1;
	for ( i = 0; i < ldb * nrhs; i++ ) {
		B[ i ] = ( i % 3 ) + 1;
	}
	// Path 2a entry requires lwork >= 4*M + M*M + max(M, 2*M-4, nrhs, N-3*M)
	// = 8 + 4 + max(2, 0, 3, 0) = 15. We pick 14.
	var lwork = 14;
	var WORK = new Float64Array( lwork );
	var info = dgelss( M, N, nrhs, A, 1, M, 0, B, 1, ldb, 0, S, 1, 0, -1.0, rank, WORK, 1, 0, lwork );
	assert.equal( info, 0, 'info' );
});

test( 'dgelss: path 2b nrhs=1 (single RHS gemv branch)', function t() {
	// Path 2b with nrhs=1 -> dgemv branch (lines 401-402)
	var M = 2;
	var N = 5;
	var nrhs = 1;
	var ldb = Math.max( M, N );
	var A = new Float64Array( M * N );
	var B = new Float64Array( ldb * nrhs );
	var S = new Float64Array( Math.min( M, N ) );
	var rank = [ 0 ];
	A[ 0 ] = 1; A[ 1 ] = 0; A[ 2 ] = 1; A[ 3 ] = 1; A[ 4 ] = 0; A[ 5 ] = 1;
	B[ 0 ] = 2; B[ 1 ] = 3;

	// Path 2a requires lwork >= 4*M+M*M+max(M, 2*M-4, nrhs, N-3*M) = 8+4+max(2,0,1,0)=14
	var lwork = 13;
	var WORK = new Float64Array( lwork );
	var info = dgelss( M, N, nrhs, A, 1, M, 0, B, 1, ldb, 0, S, 1, 0, -1.0, rank, WORK, 1, 0, lwork );
	assert.equal( info, 0, 'info' );
});

test( 'dgelss: throws RangeError for negative M', function t() {
	assert.throws( function throws() {
		dgelss( -1, 1, 1, new Float64Array( 1 ), 1, 1, 0, new Float64Array( 1 ), 1, 1, 0, new Float64Array( 1 ), 1, 0, -1, [ 0 ], null, 1, 0, 0 );
	}, RangeError );
});

test( 'dgelss: throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		dgelss( 1, -1, 1, new Float64Array( 1 ), 1, 1, 0, new Float64Array( 1 ), 1, 1, 0, new Float64Array( 1 ), 1, 0, -1, [ 0 ], null, 1, 0, 0 );
	}, RangeError );
});

test( 'dgelss: throws RangeError for negative nrhs', function t() {
	assert.throws( function throws() {
		dgelss( 1, 1, -1, new Float64Array( 1 ), 1, 1, 0, new Float64Array( 1 ), 1, 1, 0, new Float64Array( 1 ), 1, 0, -1, [ 0 ], null, 1, 0, 0 );
	}, RangeError );
});
