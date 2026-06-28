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

var MAXN = 8;
var fixtureDir = path.join( import.meta.dirname, '..', '..', '..', '..', '..', 'test', 'fixtures' );
var lines = readFileSync( path.join( fixtureDir, 'zggsvp3.jsonl' ), 'utf8' ).trim().split( '\n' );
var fixture = lines.map( function parseLine( line ) { return JSON.parse( line ); } );

var aBasic = [
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
var bBasic = [
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
var aDiag = [
	[ 0, 0, 10.0, 0.0 ],
	[ 1, 1, 5.0, 0.0 ],
	[ 2, 2, 1.0, 0.0 ]
];
var bDiag = [
	[ 0, 0, 8.0, 0.0 ],
	[ 1, 1, 4.0, 0.0 ],
	[ 2, 2, 2.0, 0.0 ]
];


// FUNCTIONS //

function findCase( name ) {
	var i;
	for ( i = 0; i < fixture.length; i++ ) {
		if ( fixture[ i ].name === name ) {
			return fixture[ i ];
		}
	}
	return null;
}

function buildMat( entries ) {
	var arr = new Complex128Array( MAXN * MAXN );
	var view = reinterpret( arr, 0 );
	var idx;
	var e;
	var k;
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
	var wantu;
	var wantv;
	var wantq;
	var IWORK;
	var RWORK;
	var WORK;
	var info;
	var ldU;
	var ldV;
	var ldQ;
	var TAU;
	var tc;
	var A;
	var B;
	var U;
	var V;
	var Q;
	var K;
	var l;

	tc = findCase( name );
	wantu = ( jobs[ 0 ] === 'compute-U' );
	wantv = ( jobs[ 1 ] === 'compute-V' );
	wantq = ( jobs[ 2 ] === 'compute-Q' );

	A = buildMat( aEntries );
	B = buildMat( bEntries );

	U = allocMat( wantu );
	V = allocMat( wantv );
	Q = allocMat( wantq );

	IWORK = new Int32Array( 8 );
	RWORK = new Float64Array( 5 * 8 );
	TAU = new Complex128Array( 8 );
	WORK = new Complex128Array( 5000 );
	K = [ 0 ];
	l = [ 0 ];

	ldU = ( wantu ) ? MAXN : 1;
	ldV = ( wantv ) ? MAXN : 1;
	ldQ = ( wantq ) ? MAXN : 1;

	info = zggsvp3( jobs[ 0 ], jobs[ 1 ], jobs[ 2 ], M, P, N, A, 1, MAXN, 0, B, 1, MAXN, 0, 1e-8, 1e-8, K, l, U, 1, ldU, 0, V, 1, ldV, 0, Q, 1, ldQ, 0, IWORK, 1, 0, RWORK, 1, 0, TAU, 1, 0, WORK, 1, 0, 5000 );

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
	var info;
	var ldU = MAXN;
	var A = buildMat( aDiag );
	var B = buildMat( bDiag );
	var U = new Complex128Array( MAXN * MAXN );
	var V = new Complex128Array( 1 );
	var Q = new Complex128Array( 1 );
	var IWORK = new Int32Array( 8 );
	var RWORK = new Float64Array( 5 * 8 );
	var TAU = new Complex128Array( 8 );
	var WORK = new Complex128Array( 5000 );
	var K = [ 0 ];
	var l = [ 0 ];
	info = zggsvp3( 'compute-U', 'none', 'none', 3, 3, 3, A, 1, MAXN, 0, B, 1, MAXN, 0, 1e-8, 1e-8, K, l, U, 1, ldU, 0, V, 1, 1, 0, Q, 1, 1, 0, IWORK, 1, 0, RWORK, 1, 0, TAU, 1, 0, WORK, 1, 0, 5000 );
	assert.equal( info, 0, 'info' );
});

test( 'zggsvp3: jobv=V only', function t() {
	var info;
	var ldV = MAXN;
	var A = buildMat( aDiag );
	var B = buildMat( bDiag );
	var U = new Complex128Array( 1 );
	var V = new Complex128Array( MAXN * MAXN );
	var Q = new Complex128Array( 1 );
	var IWORK = new Int32Array( 8 );
	var RWORK = new Float64Array( 5 * 8 );
	var TAU = new Complex128Array( 8 );
	var WORK = new Complex128Array( 5000 );
	var K = [ 0 ];
	var l = [ 0 ];
	info = zggsvp3( 'none', 'compute-V', 'none', 3, 3, 3, A, 1, MAXN, 0, B, 1, MAXN, 0, 1e-8, 1e-8, K, l, U, 1, 1, 0, V, 1, ldV, 0, Q, 1, 1, 0, IWORK, 1, 0, RWORK, 1, 0, TAU, 1, 0, WORK, 1, 0, 5000 );
	assert.equal( info, 0, 'info' );
});

test( 'zggsvp3: jobq=Q only', function t() {
	var info;
	var ldQ = MAXN;
	var A = buildMat( aDiag );
	var B = buildMat( bDiag );
	var U = new Complex128Array( 1 );
	var V = new Complex128Array( 1 );
	var Q = new Complex128Array( MAXN * MAXN );
	var IWORK = new Int32Array( 8 );
	var RWORK = new Float64Array( 5 * 8 );
	var TAU = new Complex128Array( 8 );
	var WORK = new Complex128Array( 5000 );
	var K = [ 0 ];
	var l = [ 0 ];
	info = zggsvp3( 'none', 'none', 'compute-Q', 3, 3, 3, A, 1, MAXN, 0, B, 1, MAXN, 0, 1e-8, 1e-8, K, l, U, 1, 1, 0, V, 1, 1, 0, Q, 1, ldQ, 0, IWORK, 1, 0, RWORK, 1, 0, TAU, 1, 0, WORK, 1, 0, 5000 );
	assert.equal( info, 0, 'info' );
});

test( 'zggsvp3: rank deficient B', function t() {
	var aRank = [
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
	var bRank = [
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
	var aWide = [
		[ 0, 0, 1.0, 0.5 ], [ 1, 0, 2.0, 0.0 ],
		[ 0, 1, 3.0, -0.5 ], [ 1, 1, 4.0, 1.0 ],
		[ 0, 2, 5.0, 0.0 ], [ 1, 2, 6.0, -0.5 ],
		[ 0, 3, 7.0, 0.5 ], [ 1, 3, 8.0, 0.0 ],
		[ 0, 4, 9.0, -0.5 ], [ 1, 4, 10.0, 0.5 ]
	];
	var bWide = [
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
	var bMzero = [
		[ 0, 0, 5.0, 0.0 ], [ 1, 0, 1.0, 0.5 ],
		[ 0, 1, 1.0, -0.5 ], [ 1, 1, 5.0, 0.0 ]
	];
	runCase( 'm_zero', 0, 2, 2, [], bMzero, [ 'compute-U', 'compute-V', 'compute-Q' ] );
});

test( 'zggsvp3 throws TypeError for invalid jobu', function t() {
	assert.throws( function bad() {
		zggsvp3( 'bogus', 'compute-V', 'compute-Q', 2, 2, 2, new Complex128Array( 4 ), 1, 2, 0, new Complex128Array( 4 ), 1, 2, 0, 1e-8, 1e-8, [ 0 ], [ 0 ], new Complex128Array( 4 ), 1, 2, 0, new Complex128Array( 4 ), 1, 2, 0, new Complex128Array( 4 ), 1, 2, 0, new Int32Array( 2 ), 1, 0, new Float64Array( 4 ), 1, 0, new Complex128Array( 2 ), 1, 0, new Complex128Array( 100 ), 1, 0, 100 );
	}, TypeError );
});

test( 'zggsvp3 throws TypeError for invalid jobv', function t() {
	assert.throws( function bad() {
		zggsvp3( 'compute-U', 'bogus', 'compute-Q', 2, 2, 2, new Complex128Array( 4 ), 1, 2, 0, new Complex128Array( 4 ), 1, 2, 0, 1e-8, 1e-8, [ 0 ], [ 0 ], new Complex128Array( 4 ), 1, 2, 0, new Complex128Array( 4 ), 1, 2, 0, new Complex128Array( 4 ), 1, 2, 0, new Int32Array( 2 ), 1, 0, new Float64Array( 4 ), 1, 0, new Complex128Array( 2 ), 1, 0, new Complex128Array( 100 ), 1, 0, 100 );
	}, TypeError );
});

test( 'zggsvp3 throws TypeError for invalid jobq', function t() {
	assert.throws( function bad() {
		zggsvp3( 'compute-U', 'compute-V', 'bogus', 2, 2, 2, new Complex128Array( 4 ), 1, 2, 0, new Complex128Array( 4 ), 1, 2, 0, 1e-8, 1e-8, [ 0 ], [ 0 ], new Complex128Array( 4 ), 1, 2, 0, new Complex128Array( 4 ), 1, 2, 0, new Complex128Array( 4 ), 1, 2, 0, new Int32Array( 2 ), 1, 0, new Float64Array( 4 ), 1, 0, new Complex128Array( 2 ), 1, 0, new Complex128Array( 100 ), 1, 0, 100 );
	}, TypeError );
});

test( 'zggsvp3 throws RangeError for negative M', function t() {
	assert.throws( function bad() {
		zggsvp3( 'compute-U', 'compute-V', 'compute-Q', -1, 2, 2, new Complex128Array( 4 ), 1, 2, 0, new Complex128Array( 4 ), 1, 2, 0, 1e-8, 1e-8, [ 0 ], [ 0 ], new Complex128Array( 4 ), 1, 2, 0, new Complex128Array( 4 ), 1, 2, 0, new Complex128Array( 4 ), 1, 2, 0, new Int32Array( 2 ), 1, 0, new Float64Array( 4 ), 1, 0, new Complex128Array( 2 ), 1, 0, new Complex128Array( 100 ), 1, 0, 100 );
	}, RangeError );
});

test( 'zggsvp3 throws RangeError for negative p', function t() {
	assert.throws( function bad() {
		zggsvp3( 'compute-U', 'compute-V', 'compute-Q', 2, -1, 2, new Complex128Array( 4 ), 1, 2, 0, new Complex128Array( 4 ), 1, 2, 0, 1e-8, 1e-8, [ 0 ], [ 0 ], new Complex128Array( 4 ), 1, 2, 0, new Complex128Array( 4 ), 1, 2, 0, new Complex128Array( 4 ), 1, 2, 0, new Int32Array( 2 ), 1, 0, new Float64Array( 4 ), 1, 0, new Complex128Array( 2 ), 1, 0, new Complex128Array( 100 ), 1, 0, 100 );
	}, RangeError );
});

test( 'zggsvp3 throws RangeError for negative N', function t() {
	assert.throws( function bad() {
		zggsvp3( 'compute-U', 'compute-V', 'compute-Q', 2, 2, -1, new Complex128Array( 4 ), 1, 2, 0, new Complex128Array( 4 ), 1, 2, 0, 1e-8, 1e-8, [ 0 ], [ 0 ], new Complex128Array( 4 ), 1, 2, 0, new Complex128Array( 4 ), 1, 2, 0, new Complex128Array( 4 ), 1, 2, 0, new Int32Array( 2 ), 1, 0, new Float64Array( 4 ), 1, 0, new Complex128Array( 2 ), 1, 0, new Complex128Array( 100 ), 1, 0, 100 );
	}, RangeError );
});
