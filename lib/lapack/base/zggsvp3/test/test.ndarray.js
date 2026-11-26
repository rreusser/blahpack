/**
* @license Apache-2.0
*
* Copyright (c) 2026 Ricky Reusser.
*
* Derived from the LAPACK 3.12.0 reference implementation (BSD-3-Clause).
*/

/* eslint-disable no-restricted-syntax, stdlib/first-unit-test, max-len, max-params, max-statements, max-lines, max-lines-per-function */

// MODULES //

import test from 'node:test';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import zggsvp3 from './../lib/ndarray.js';


// VARIABLES //

const MAXN = 8;
const fixtureDir = path.join( import.meta.dirname, '..', '..', '..', '..', '..', 'test', 'fixtures' );
const lines = readFileSync( path.join( fixtureDir, 'zggsvp3.jsonl' ), 'utf8' ).trim().split( '\n' );
const fixture = lines.map( function parseLine( line ) { return JSON.parse( line ); } );

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


// FUNCTIONS //

function findCase( name ) {
	let i;
	for ( i = 0; i < fixture.length; i++ ) {
		if ( fixture[ i ].name === name ) {
			return fixture[ i ];
		}
	}
	return null;
}

function buildMat( entries ) {
	const arr = new Complex128Array( MAXN * MAXN );
	const view = reinterpret( arr, 0 );
	let idx, e, k;
	for ( k = 0; k < entries.length; k++ ) {
		e = entries[ k ];
		idx = 2 * ( e[ 0 ] + ( e[ 1 ] * MAXN ) );
		view[ idx ] = e[ 2 ];
		view[ idx + 1 ] = e[ 3 ];
	}
	return arr;
}

function allocMat( want ) {
	if ( want ) {
		return new Complex128Array( MAXN * MAXN );
	}
	return new Complex128Array( 1 );
}

function runCase( name, M, P, N, aEntries, bEntries, jobs ) {

	const tc = findCase( name );
	const wantu = ( jobs[ 0 ] === 'compute-U' );
	const wantv = ( jobs[ 1 ] === 'compute-V' );
	const wantq = ( jobs[ 2 ] === 'compute-Q' );

	const A = buildMat( aEntries );
	const B = buildMat( bEntries );

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

	const info = zggsvp3( jobs[ 0 ], jobs[ 1 ], jobs[ 2 ], M, P, N, A, 1, MAXN, 0, B, 1, MAXN, 0, 1e-8, 1e-8, K, l, U, 1, ldU, 0, V, 1, ldV, 0, Q, 1, ldQ, 0, IWORK, 1, 0, RWORK, 1, 0, TAU, 1, 0, WORK, 1, 0 );

	assert.equal( info, tc.info, 'info' );
	assert.equal( K[ 0 ], tc.K, 'K' );
	assert.equal( l[ 0 ], tc.L, 'L' );
}


// TESTS //

test( 'zggsvp3: main export is a function', function t() {
	assert.strictEqual( typeof zggsvp3, 'function', 'is a function' );
});

test( 'zggsvp3: basic 4x3 (jobu=U,jobv=V,jobq=Q)', function t() {
	runCase( 'basic_4x3_3x3_UVQ', 4, 3, 3, aBasic, bBasic, [ 'compute-U', 'compute-V', 'compute-Q' ] );
});

test( 'zggsvp3: basic 4x3 (jobu=N,jobv=N,jobq=N)', function t() {
	runCase( 'basic_4x3_3x3_NNN', 4, 3, 3, aBasic, bBasic, [ 'none', 'none', 'none' ] );
});

test( 'zggsvp3: diagonal 3x3 all compute', function t() {
	runCase( 'diagonal_3x3', 3, 3, 3, aDiag, bDiag, [ 'compute-U', 'compute-V', 'compute-Q' ] );
});

test( 'zggsvp3: jobu=U only', function t() {
	const ldU = MAXN;
	const A = buildMat( aDiag );
	const B = buildMat( bDiag );
	const U = new Complex128Array( MAXN * MAXN );
	const V = new Complex128Array( 1 );
	const Q = new Complex128Array( 1 );
	const IWORK = new Int32Array( 8 );
	const RWORK = new Float64Array( 5 * 8 );
	const TAU = new Complex128Array( 8 );
	const WORK = new Complex128Array( 5000 );
	const K = [ 0 ];
	const l = [ 0 ];
	const info = zggsvp3( 'compute-U', 'none', 'none', 3, 3, 3, A, 1, MAXN, 0, B, 1, MAXN, 0, 1e-8, 1e-8, K, l, U, 1, ldU, 0, V, 1, 1, 0, Q, 1, 1, 0, IWORK, 1, 0, RWORK, 1, 0, TAU, 1, 0, WORK, 1, 0 );
	assert.equal( info, 0, 'info' );
});

test( 'zggsvp3: jobv=V only', function t() {
	const ldV = MAXN;
	const A = buildMat( aDiag );
	const B = buildMat( bDiag );
	const U = new Complex128Array( 1 );
	const V = new Complex128Array( MAXN * MAXN );
	const Q = new Complex128Array( 1 );
	const IWORK = new Int32Array( 8 );
	const RWORK = new Float64Array( 5 * 8 );
	const TAU = new Complex128Array( 8 );
	const WORK = new Complex128Array( 5000 );
	const K = [ 0 ];
	const l = [ 0 ];
	const info = zggsvp3( 'none', 'compute-V', 'none', 3, 3, 3, A, 1, MAXN, 0, B, 1, MAXN, 0, 1e-8, 1e-8, K, l, U, 1, 1, 0, V, 1, ldV, 0, Q, 1, 1, 0, IWORK, 1, 0, RWORK, 1, 0, TAU, 1, 0, WORK, 1, 0 );
	assert.equal( info, 0, 'info' );
});

test( 'zggsvp3: jobq=Q only', function t() {
	const ldQ = MAXN;
	const A = buildMat( aDiag );
	const B = buildMat( bDiag );
	const U = new Complex128Array( 1 );
	const V = new Complex128Array( 1 );
	const Q = new Complex128Array( MAXN * MAXN );
	const IWORK = new Int32Array( 8 );
	const RWORK = new Float64Array( 5 * 8 );
	const TAU = new Complex128Array( 8 );
	const WORK = new Complex128Array( 5000 );
	const K = [ 0 ];
	const l = [ 0 ];
	const info = zggsvp3( 'none', 'none', 'compute-Q', 3, 3, 3, A, 1, MAXN, 0, B, 1, MAXN, 0, 1e-8, 1e-8, K, l, U, 1, 1, 0, V, 1, 1, 0, Q, 1, ldQ, 0, IWORK, 1, 0, RWORK, 1, 0, TAU, 1, 0, WORK, 1, 0 );
	assert.equal( info, 0, 'info' );
});

test( 'zggsvp3: rank deficient B', function t() {
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
	runCase( 'rank_deficient_B', 3, 3, 3, aRank, bRank, [ 'compute-U', 'compute-V', 'compute-Q' ] );
});

test( 'zggsvp3: wide matrix 2x5', function t() {
	const aWide = [
		[ 0, 0, 1.0, 0.5 ], [ 1, 0, 2.0, 0.0 ],
		[ 0, 1, 3.0, -0.5 ], [ 1, 1, 4.0, 1.0 ],
		[ 0, 2, 5.0, 0.0 ], [ 1, 2, 6.0, -0.5 ],
		[ 0, 3, 7.0, 0.5 ], [ 1, 3, 8.0, 0.0 ],
		[ 0, 4, 9.0, -0.5 ], [ 1, 4, 10.0, 0.5 ]
	];
	const bWide = [
		[ 0, 0, 10.0, 0.0 ], [ 1, 0, 1.0, 0.5 ],
		[ 0, 1, 1.0, -0.5 ], [ 1, 1, 10.0, 0.0 ],
		[ 0, 2, 2.0, 0.0 ], [ 1, 2, 2.0, 0.5 ],
		[ 0, 3, 3.0, -0.5 ], [ 1, 3, 3.0, 0.0 ],
		[ 0, 4, 1.0, 0.5 ], [ 1, 4, 1.0, -0.5 ]
	];
	runCase( 'wide_2x5_UVQ', 2, 2, 5, aWide, bWide, [ 'compute-U', 'compute-V', 'compute-Q' ] );
});

test( 'zggsvp3: N=0', function t() {
	runCase( 'n_zero', 3, 2, 0, [], [], [ 'compute-U', 'compute-V', 'compute-Q' ] );
});

test( 'zggsvp3: M=0', function t() {
	const bMzero = [
		[ 0, 0, 5.0, 0.0 ], [ 1, 0, 1.0, 0.5 ],
		[ 0, 1, 1.0, -0.5 ], [ 1, 1, 5.0, 0.0 ]
	];
	runCase( 'm_zero', 0, 2, 2, [], bMzero, [ 'compute-U', 'compute-V', 'compute-Q' ] );
});

test( 'zggsvp3 throws TypeError for invalid jobu', function t() {
	assert.throws( function bad() {
		zggsvp3( 'bogus', 'compute-V', 'compute-Q', 2, 2, 2, new Complex128Array( 4 ), 1, 2, 0, new Complex128Array( 4 ), 1, 2, 0, 1e-8, 1e-8, [ 0 ], [ 0 ], new Complex128Array( 4 ), 1, 2, 0, new Complex128Array( 4 ), 1, 2, 0, new Complex128Array( 4 ), 1, 2, 0, new Int32Array( 2 ), 1, 0, new Float64Array( 4 ), 1, 0, new Complex128Array( 2 ), 1, 0, new Complex128Array( 100 ), 1, 0 );
	}, TypeError );
});

test( 'zggsvp3 throws TypeError for invalid jobv', function t() {
	assert.throws( function bad() {
		zggsvp3( 'compute-U', 'bogus', 'compute-Q', 2, 2, 2, new Complex128Array( 4 ), 1, 2, 0, new Complex128Array( 4 ), 1, 2, 0, 1e-8, 1e-8, [ 0 ], [ 0 ], new Complex128Array( 4 ), 1, 2, 0, new Complex128Array( 4 ), 1, 2, 0, new Complex128Array( 4 ), 1, 2, 0, new Int32Array( 2 ), 1, 0, new Float64Array( 4 ), 1, 0, new Complex128Array( 2 ), 1, 0, new Complex128Array( 100 ), 1, 0 );
	}, TypeError );
});

test( 'zggsvp3 throws TypeError for invalid jobq', function t() {
	assert.throws( function bad() {
		zggsvp3( 'compute-U', 'compute-V', 'bogus', 2, 2, 2, new Complex128Array( 4 ), 1, 2, 0, new Complex128Array( 4 ), 1, 2, 0, 1e-8, 1e-8, [ 0 ], [ 0 ], new Complex128Array( 4 ), 1, 2, 0, new Complex128Array( 4 ), 1, 2, 0, new Complex128Array( 4 ), 1, 2, 0, new Int32Array( 2 ), 1, 0, new Float64Array( 4 ), 1, 0, new Complex128Array( 2 ), 1, 0, new Complex128Array( 100 ), 1, 0 );
	}, TypeError );
});

test( 'zggsvp3 throws RangeError for negative M', function t() {
	assert.throws( function bad() {
		zggsvp3( 'compute-U', 'compute-V', 'compute-Q', -1, 2, 2, new Complex128Array( 4 ), 1, 2, 0, new Complex128Array( 4 ), 1, 2, 0, 1e-8, 1e-8, [ 0 ], [ 0 ], new Complex128Array( 4 ), 1, 2, 0, new Complex128Array( 4 ), 1, 2, 0, new Complex128Array( 4 ), 1, 2, 0, new Int32Array( 2 ), 1, 0, new Float64Array( 4 ), 1, 0, new Complex128Array( 2 ), 1, 0, new Complex128Array( 100 ), 1, 0 );
	}, RangeError );
});

test( 'zggsvp3 throws RangeError for negative p', function t() {
	assert.throws( function bad() {
		zggsvp3( 'compute-U', 'compute-V', 'compute-Q', 2, -1, 2, new Complex128Array( 4 ), 1, 2, 0, new Complex128Array( 4 ), 1, 2, 0, 1e-8, 1e-8, [ 0 ], [ 0 ], new Complex128Array( 4 ), 1, 2, 0, new Complex128Array( 4 ), 1, 2, 0, new Complex128Array( 4 ), 1, 2, 0, new Int32Array( 2 ), 1, 0, new Float64Array( 4 ), 1, 0, new Complex128Array( 2 ), 1, 0, new Complex128Array( 100 ), 1, 0 );
	}, RangeError );
});

test( 'zggsvp3 throws RangeError for negative N', function t() {
	assert.throws( function bad() {
		zggsvp3( 'compute-U', 'compute-V', 'compute-Q', 2, 2, -1, new Complex128Array( 4 ), 1, 2, 0, new Complex128Array( 4 ), 1, 2, 0, 1e-8, 1e-8, [ 0 ], [ 0 ], new Complex128Array( 4 ), 1, 2, 0, new Complex128Array( 4 ), 1, 2, 0, new Complex128Array( 4 ), 1, 2, 0, new Int32Array( 2 ), 1, 0, new Float64Array( 4 ), 1, 0, new Complex128Array( 2 ), 1, 0, new Complex128Array( 100 ), 1, 0 );
	}, RangeError );
});

/**
* Runs `zggsvp3` on deterministic M-by-N A and P-by-N B with a complex WORK of `lwork` elements and returns all outputs.
*
* @private
* @param {NonNegativeInteger} M - rows of A
* @param {NonNegativeInteger} p - rows of B
* @param {NonNegativeInteger} N - columns
* @param {integer} lwork - WORK length (complex elements); negative returns the unmodified inputs
* @returns {Object} outputs
*/
function runWithWork( M, p, N, lwork ) {
	const A = new Complex128Array( Math.max( 1, M * N ) );
	const B = new Complex128Array( Math.max( 1, p * N ) );
	const U = new Complex128Array( Math.max( 1, M * M ) );
	const V = new Complex128Array( Math.max( 1, p * p ) );
	const Q = new Complex128Array( Math.max( 1, N * N ) );
	const IWORK = new Int32Array( Math.max( 1, N ) );
	const RWORK = new Float64Array( Math.max( 1, 2 * N ) );
	const TAU = new Complex128Array( Math.max( 1, N ) );
	const WORK = new Complex128Array( Math.max( 0, lwork ) );
	const Av = reinterpret( A, 0 );
	const Bv = reinterpret( B, 0 );
	const K = [ 0 ];
	const l = [ 0 ];
	let i;
	for ( i = 0; i < 2 * M * N; i++ ) {
		Av[ i ] = Math.sin( ( 3 * i ) + 1 );
	}
	for ( i = 0; i < 2 * p * N; i++ ) {
		Bv[ i ] = Math.cos( ( 5 * i ) + 2 );
	}
	if ( lwork >= 0 ) {
		zggsvp3( 'compute-U', 'compute-V', 'compute-Q', M, p, N, A, 1, Math.max( 1, M ), 0, B, 1, Math.max( 1, p ), 0, 1e-12, 1e-12, K, l, U, 1, Math.max( 1, M ), 0, V, 1, Math.max( 1, p ), 0, Q, 1, Math.max( 1, N ), 0, IWORK, 1, 0, RWORK, 1, 0, TAU, 1, 0, WORK, 1, 0 );
	}
	return {
		'K': K[ 0 ],
		'l': l[ 0 ],
		'A': Array.from( Av ),
		'B': Array.from( Bv ),
		'U': Array.from( reinterpret( U, 0 ) ),
		'V': Array.from( reinterpret( V, 0 ) ),
		'Q': Array.from( reinterpret( Q, 0 ) )
	};
}

/**
* Returns the largest modulus of `U^H * X0 * Q - X` for column-major interleaved complex `X0`, `X` (r-by-c, leading dimension `max(1,r)`), `U` (r-by-r) and `Q` (c-by-c).
*
* @private
* @param {NonNegativeInteger} r - rows
* @param {NonNegativeInteger} c - columns
* @param {Array} X0 - original matrix
* @param {Array} U - left unitary matrix
* @param {Array} Q - right unitary matrix
* @param {Array} X - reduced matrix
* @returns {number} largest residual modulus
*/
function reductionResidual( r, c, X0, U, Q, X ) {
	const T = new Float64Array( 2 * r * c );
	let res = 0.0;
	let re;
	let im;
	let i;
	let j;
	let k;
	// T = X0 * Q:
	for ( j = 0; j < c; j++ ) {
		for ( i = 0; i < r; i++ ) {
			re = 0.0;
			im = 0.0;
			for ( k = 0; k < c; k++ ) {
				re += ( X0[ 2 * ( i + ( k * r ) ) ] * Q[ 2 * ( k + ( j * c ) ) ] ) - ( X0[ ( 2 * ( i + ( k * r ) ) ) + 1 ] * Q[ ( 2 * ( k + ( j * c ) ) ) + 1 ] );
				im += ( X0[ 2 * ( i + ( k * r ) ) ] * Q[ ( 2 * ( k + ( j * c ) ) ) + 1 ] ) + ( X0[ ( 2 * ( i + ( k * r ) ) ) + 1 ] * Q[ 2 * ( k + ( j * c ) ) ] );
			}
			T[ 2 * ( i + ( j * r ) ) ] = re;
			T[ ( 2 * ( i + ( j * r ) ) ) + 1 ] = im;
		}
	}
	// U^H * T - X:
	for ( j = 0; j < c; j++ ) {
		for ( i = 0; i < r; i++ ) {
			re = -X[ 2 * ( i + ( j * r ) ) ];
			im = -X[ ( 2 * ( i + ( j * r ) ) ) + 1 ];
			for ( k = 0; k < r; k++ ) {
				re += ( U[ 2 * ( k + ( i * r ) ) ] * T[ 2 * ( k + ( j * r ) ) ] ) + ( U[ ( 2 * ( k + ( i * r ) ) ) + 1 ] * T[ ( 2 * ( k + ( j * r ) ) ) + 1 ] );
				im += ( U[ 2 * ( k + ( i * r ) ) ] * T[ ( 2 * ( k + ( j * r ) ) ) + 1 ] ) - ( U[ ( 2 * ( k + ( i * r ) ) ) + 1 ] * T[ 2 * ( k + ( j * r ) ) ] );
			}
			res = Math.max( res, Math.sqrt( ( re * re ) + ( im * im ) ) );
		}
	}
	return res;
}

test( 'zggsvp3: WORK of exactly the minimum N+1 past zgeqp3\'s blocking threshold reduces A and B as the optimal WORK does (ticket 0100)', function t() {
	// min(p,N) = 130 > NX = 128 selects the blocked zgeqp3 for B at its optimum (N+1)*32; with N+1 it falls back to the unblocked zlaqp2, as the reference's ZGEQP3 does. Pivoting may then differ in near ties, so check the reduction U^H*A*Q, V^H*B*Q by residual:
	const N = 130;
	const M = 2;
	const lwork = N + 1;
	const big = runWithWork( M, N, N, ( N + 1 ) * 32 );
	const out = runWithWork( M, N, N, lwork );
	const A0 = runWithWork( M, N, N, -1 );
	assert.strictEqual( out.K, big.K, 'K' );
	assert.strictEqual( out.l, big.l, 'l' );
	assert.ok( reductionResidual( M, N, A0.A, out.U, out.Q, out.A ) < 1e-10, 'U^H*A*Q' );
	assert.ok( reductionResidual( N, N, A0.B, out.V, out.Q, out.B ) < 1e-10, 'V^H*B*Q' );
	assert.throws( function bad() {
		runWithWork( M, N, N, lwork - 1 );
	}, RangeError );
});

test( 'zggsvp3: WORK of exactly the minimum N+1 (ZGEQP3\'s) matches a large WORK', function t() {
	const big = runWithWork( 3, 3, 3, 1000 );
	const out = runWithWork( 3, 3, 3, 4 );
	assert.deepStrictEqual( out, big );
	assert.throws( function bad() {
		runWithWork( 3, 3, 3, 3 );
	}, RangeError );
});

test( 'zggsvp3: M = 0 still needs the zgeqp3 workspace for B (ticket 0096)', function t() {
	// Old minimum was 0 whenever M = 0, but B (P-by-N) is still factored.
	const big = runWithWork( 0, 3, 4, 1000 );
	const out = runWithWork( 0, 3, 4, 5 );
	assert.deepStrictEqual( out, big );
	assert.throws( function bad() {
		runWithWork( 0, 3, 4, 4 );
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
	return new Complex128Array( wsRand( 2 * n, seed ) );
}

function wsWork( n ) {
	const w = new Complex128Array( n );
	reinterpret( w, 0 ).fill( NaN );
	return w;
}

function wsFlat( x ) {
	return ( x instanceof Complex128Array ) ? Array.from( reinterpret( x, 0 ) ) : Array.from( x );
}

function wsRun( c, lw, liwork, lrwork ) {
	const lda = Math.max( 1, c.M );
	const ldb = Math.max( 1, c.P );
	const liw = ( liwork === void 0 ) ? c.N : liwork;
	const lrw = ( lrwork === void 0 ) ? 2 * c.N : lrwork;
	const A = wsMat( lda * c.N, 7 + c.M );
	const B = wsMat( ldb * c.N, 11 + c.P );
	const K = new Int32Array( 1 );
	const L = new Int32Array( 1 );
	const U = new Complex128Array( lda * lda );
	const V = new Complex128Array( ldb * ldb );
	const Q = new Complex128Array( c.N * c.N );
	const al = new Float64Array( c.N );
	const be = new Float64Array( c.N );
	const info = zggsvp3( c.ju, c.jv, c.jq, c.M, c.P, c.N, A, 1, lda, 0, B, 1, ldb, 0, 1e-12, 1e-12, K, L, U, 1, lda, 0, V, 1, ldb, 0, Q, 1, c.N, 0, ( liw < 0 ) ? null : new Int32Array( liw ), 1, 0, ( lrw < 0 ) ? null : new Float64Array( lrw ), 1, 0, new Complex128Array( c.N ), 1, 0, wsWork( lw ), 1, 0 );
	return [ info, K[ 0 ], L[ 0 ] ].concat( wsFlat( A ), wsFlat( B ), wsFlat( U ), wsFlat( V ), wsFlat( Q ), wsFlat( al ), wsFlat( be ) );
}

const WS_CASES = [
		{ 'ju': 'none', 'jv': 'none', 'jq': 'none', 'M': 3, 'P': 9, 'N': 2, 'lwork': 3 }, // old minimum: 9,
		{ 'ju': 'compute-U', 'jv': 'none', 'jq': 'compute-Q', 'M': 10, 'P': 110, 'N': 34, 'lwork': 35 }, // old minimum: 110,
		{ 'ju': 'none', 'jv': 'compute-V', 'jq': 'none', 'M': 9, 'P': 1, 'N': 2, 'lwork': 9 }, // old minimum: 9,
		{ 'ju': 'compute-U', 'jv': 'compute-V', 'jq': 'compute-Q', 'M': 9, 'P': 3, 'N': 4, 'lwork': 9 }, // old minimum: 9,
		{ 'ju': 'none', 'jv': 'none', 'jq': 'compute-Q', 'M': 40, 'P': 0, 'N': 3, 'lwork': 4 }, // old minimum: 40,
		{ 'ju': 'compute-U', 'jv': 'compute-V', 'jq': 'compute-Q', 'M': 5, 'P': 4, 'N': 40, 'lwork': 41 }, // old minimum: 41
		{ 'ju': 'none', 'jv': 'compute-V', 'jq': 'none', 'M': 1, 'P': 9, 'N': 1, 'lwork': 8 }, // V's reflectors touch at most P-1 columns; old minimum: 9 (ticket 0016)
		{ 'ju': 'compute-U', 'jv': 'none', 'jq': 'none', 'M': 33, 'P': 0, 'N': 5, 'lwork': 32 } // P = 0: only U's generation, M-1; old minimum: 33 (ticket 0016)
];

test( 'zggsvp3: WORK of exactly the minimum (NaN-filled) gives the results of an ample WORK, also where the old minimum max(M, N, P, ...) rejected it and past the blocking threshold', function t() {
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

test( 'zggsvp3: one less than the minimum WORK, IWORK (N) or RWORK (2*N) throws a RangeError', function t() {
	let c, k;
	for ( k = 0; k < WS_CASES.length; k++ ) {
		c = WS_CASES[ k ];
		assert.throws( wsCall( c, c.lwork - 1 ), RangeError, JSON.stringify( c ) + ': WORK' );
		assert.throws( wsCall( c, c.lwork, c.N - 1 ), RangeError, JSON.stringify( c ) + ': IWORK' );
		assert.throws( wsCall( c, c.lwork, c.N, ( 2 * c.N ) - 1 ), RangeError, JSON.stringify( c ) + ': RWORK' );
	}
});

function wsCall( c, lw, liwork, lrwork ) {
	return function call() {
		wsRun( c, lw, liwork, lrwork );
	};
}

test( 'zggsvp3: a missing (null) IWORK or RWORK throws a RangeError', function t() {
	const c = WS_CASES[ 0 ];
	assert.throws( wsCall( c, c.lwork, -1 ), RangeError, 'IWORK' );
	assert.throws( wsCall( c, c.lwork, c.N, -1 ), RangeError, 'RWORK' );
});
