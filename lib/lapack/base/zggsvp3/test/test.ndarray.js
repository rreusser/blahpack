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
