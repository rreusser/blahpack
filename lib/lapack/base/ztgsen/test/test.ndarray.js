/**
* @license Apache-2.0
*
* Copyright (c) 2026 Ricky Reusser.
*
* Derived from the LAPACK 3.12.0 reference implementation (BSD-3-Clause).
*/

/* eslint-disable no-restricted-syntax, stdlib/first-unit-test, max-len, max-params, max-lines, max-statements, max-lines-per-function */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import Uint8Array from '@stdlib/array/uint8/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import ztgsen from './../lib/ndarray.js';


// FIXTURES //

var fixtureDir = path.join( import.meta.dirname, '..', '..', '..', '..', '..', 'test', 'fixtures' );
var lines = readFileSync( path.join( fixtureDir, 'ztgsen.jsonl' ), 'utf8' ).trim().split( '\n' ); // eslint-disable-line node/no-sync
var fixture = lines.map( function parse( line ) { return JSON.parse( line ); } );


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

function assertClose( actual, expected, tol, msg ) {
	var relErr = Math.abs( actual - expected ) / Math.max( Math.abs( expected ), 1.0 );
	assert.ok( relErr <= tol, msg + ': expected ' + expected + ', got ' + actual );
}

function assertArrayClose( actual, expected, tol, msg ) {
	var i;
	assert.equal( actual.length, expected.length, msg + ': length mismatch' );
	for ( i = 0; i < expected.length; i++ ) {
		assertClose( actual[ i ], expected[ i ], tol, msg + '[' + i + ']' );
	}
}

function makeAB4() {
	var A = new Complex128Array( 16 );
	var B = new Complex128Array( 16 );
	var Av = reinterpret( A, 0 );
	var Bv = reinterpret( B, 0 );
	var N = 4;

	Av[ 0 ] = 1.0; Av[ 1 ] = 0.5;
	Av[ 2 * N ] = 0.3; Av[ ( 2 * N ) + 1 ] = 0.1;
	Av[ 2 * ( N + 1 ) ] = 2.0; Av[ ( 2 * ( N + 1 ) ) + 1 ] = -0.3;
	Av[ 2 * ( 2 * N ) ] = 0.1; Av[ ( 2 * ( 2 * N ) ) + 1 ] = -0.1;
	Av[ 2 * ( ( 2 * N ) + 1 ) ] = 0.4; Av[ ( 2 * ( ( 2 * N ) + 1 ) ) + 1 ] = 0.3;
	Av[ 2 * ( ( 2 * N ) + 2 ) ] = 3.0; Av[ ( 2 * ( ( 2 * N ) + 2 ) ) + 1 ] = 1.0;
	Av[ 2 * ( 3 * N ) ] = 0.05; Av[ ( 2 * ( 3 * N ) ) + 1 ] = 0.02;
	Av[ 2 * ( ( 3 * N ) + 1 ) ] = 0.2; Av[ ( 2 * ( ( 3 * N ) + 1 ) ) + 1 ] = -0.1;
	Av[ 2 * ( ( 3 * N ) + 2 ) ] = 0.6; Av[ ( 2 * ( ( 3 * N ) + 2 ) ) + 1 ] = 0.1;
	Av[ 2 * ( ( 3 * N ) + 3 ) ] = 4.0; Av[ ( 2 * ( ( 3 * N ) + 3 ) ) + 1 ] = 0.8;

	Bv[ 0 ] = 1.0; Bv[ 1 ] = 0.2;
	Bv[ 2 * N ] = 0.1; Bv[ ( 2 * N ) + 1 ] = 0.1;
	Bv[ 2 * ( N + 1 ) ] = 2.0; Bv[ ( 2 * ( N + 1 ) ) + 1 ] = -0.1;
	Bv[ 2 * ( 2 * N ) ] = 0.05; Bv[ ( 2 * ( 2 * N ) ) + 1 ] = 0.0;
	Bv[ 2 * ( ( 2 * N ) + 1 ) ] = 0.15; Bv[ ( 2 * ( ( 2 * N ) + 1 ) ) + 1 ] = -0.05;
	Bv[ 2 * ( ( 2 * N ) + 2 ) ] = 1.5; Bv[ ( 2 * ( ( 2 * N ) + 2 ) ) + 1 ] = 0.3;
	Bv[ 2 * ( 3 * N ) ] = 0.02; Bv[ ( 2 * ( 3 * N ) ) + 1 ] = -0.01;
	Bv[ 2 * ( ( 3 * N ) + 1 ) ] = 0.08; Bv[ ( 2 * ( ( 3 * N ) + 1 ) ) + 1 ] = 0.03;
	Bv[ 2 * ( ( 3 * N ) + 2 ) ] = 0.12; Bv[ ( 2 * ( ( 3 * N ) + 2 ) ) + 1 ] = 0.04;
	Bv[ 2 * ( ( 3 * N ) + 3 ) ] = 3.0; Bv[ ( 2 * ( ( 3 * N ) + 3 ) ) + 1 ] = 0.0;

	return { 'A': A, 'B': B };
}

function eye( N ) {
	var M = new Complex128Array( N * N );
	var Mv = reinterpret( M, 0 );
	var i;
	for ( i = 0; i < N; i++ ) {
		Mv[ 2 * ( ( i * N ) + i ) ] = 1.0;
	}
	return M;
}

function makeAB3() {
	var A = new Complex128Array( 9 );
	var B = new Complex128Array( 9 );
	var Av = reinterpret( A, 0 );
	var Bv = reinterpret( B, 0 );
	Av[ 0 ] = 2.0; Av[ 1 ] = 1.0;
	Av[ 6 ] = 0.5; Av[ 7 ] = -0.2;
	Av[ 8 ] = 4.0; Av[ 9 ] = 0.0;
	Av[ 12 ] = 0.3; Av[ 13 ] = 0.1;
	Av[ 14 ] = 0.7; Av[ 15 ] = -0.3;
	Av[ 16 ] = 6.0; Av[ 17 ] = -1.0;
	Bv[ 0 ] = 1.0; Bv[ 1 ] = 0.0;
	Bv[ 6 ] = 0.1; Bv[ 7 ] = 0.05;
	Bv[ 8 ] = 1.0; Bv[ 9 ] = 0.0;
	Bv[ 14 ] = 0.2; Bv[ 15 ] = -0.1;
	Bv[ 16 ] = 1.0; Bv[ 17 ] = 0.0;
	return { 'A': A, 'B': B };
}


// TESTS //

test( 'ztgsen: main export is a function', function t() {
	assert.strictEqual( typeof ztgsen, 'function', 'is a function' );
});

test( 'ztgsen: ijob=0 select=[T,F,T,F] N=4 (full reorder)', function t() {
	var tol = 1e-9;
	var tc = findCase( 'ijob=0 select=[T,F,T,F] wantq=T wantz=T N=4' );
	var ab = makeAB4();
	var Q = eye( 4 );
	var Z = eye( 4 );
	var ALPHA = new Complex128Array( 4 );
	var BETA = new Complex128Array( 4 );
	var DIF = new Float64Array( 2 );
	var SEL = new Uint8Array( [ 1, 0, 1, 0 ] );
	var WK = new Complex128Array( 64 );
	var IWK = new Int32Array( 64 );
	var r = ztgsen( 0, true, true, SEL, 1, 0, 4, ab.A, 1, 4, 0, ab.B, 1, 4, 0, ALPHA, 1, 0, BETA, 1, 0, Q, 1, 4, 0, Z, 1, 4, 0, 0, 1.0, 1.0, DIF, 1, 0, WK, 1, 0, -1, IWK, 1, 0, -1 );
	assert.equal( r.info, tc.info, 'info' );
	assert.equal( r.m, tc.M, 'M' );
	assertArrayClose( Array.from( reinterpret( ab.A, 0 ) ), tc.A, tol, 'A' );
	assertArrayClose( Array.from( reinterpret( ab.B, 0 ) ), tc.B, tol, 'B' );
	assertArrayClose( Array.from( reinterpret( Q, 0 ) ), tc.Q, tol, 'Q' );
	assertArrayClose( Array.from( reinterpret( Z, 0 ) ), tc.Z, tol, 'Z' );
	assertArrayClose( Array.from( reinterpret( ALPHA, 0 ) ), tc.ALPHA, tol, 'ALPHA' );
	assertArrayClose( Array.from( reinterpret( BETA, 0 ) ), tc.BETA, tol, 'BETA' );
});

test( 'ztgsen: ijob=0 select=[T,T,T] N=3 (M=N quick return)', function t() {
	var tol = 1e-9;
	var tc = findCase( 'ijob=0 select=[T,T,T] wantq=T wantz=T N=3' );
	var ab = makeAB3();
	var Q = eye( 3 );
	var Z = eye( 3 );
	var ALPHA = new Complex128Array( 3 );
	var BETA = new Complex128Array( 3 );
	var DIF = new Float64Array( 2 );
	var SEL = new Uint8Array( [ 1, 1, 1 ] );
	var WK = new Complex128Array( 64 );
	var IWK = new Int32Array( 64 );
	var r = ztgsen( 0, true, true, SEL, 1, 0, 3, ab.A, 1, 3, 0, ab.B, 1, 3, 0, ALPHA, 1, 0, BETA, 1, 0, Q, 1, 3, 0, Z, 1, 3, 0, 0, 1.0, 1.0, DIF, 1, 0, WK, 1, 0, -1, IWK, 1, 0, -1 );
	assert.equal( r.info, 0, 'info' );
	assert.equal( r.m, 3, 'M' );
	assertArrayClose( Array.from( reinterpret( ALPHA, 0 ) ), tc.ALPHA, tol, 'ALPHA' );
	assertArrayClose( Array.from( reinterpret( BETA, 0 ) ), tc.BETA, tol, 'BETA' );
});

test( 'ztgsen: ijob=0 select=[F,F,F] N=3 (M=0 quick return)', function t() {
	var tol = 1e-9;
	var tc = findCase( 'ijob=0 select=[F,F,F] wantq=T wantz=T N=3' );
	var ab = makeAB3();
	var Q = eye( 3 );
	var Z = eye( 3 );
	var ALPHA = new Complex128Array( 3 );
	var BETA = new Complex128Array( 3 );
	var DIF = new Float64Array( 2 );
	var SEL = new Uint8Array( [ 0, 0, 0 ] );
	var WK = new Complex128Array( 64 );
	var IWK = new Int32Array( 64 );
	var r = ztgsen( 0, true, true, SEL, 1, 0, 3, ab.A, 1, 3, 0, ab.B, 1, 3, 0, ALPHA, 1, 0, BETA, 1, 0, Q, 1, 3, 0, Z, 1, 3, 0, 0, 1.0, 1.0, DIF, 1, 0, WK, 1, 0, -1, IWK, 1, 0, -1 );
	assert.equal( r.info, 0, 'info' );
	assert.equal( r.m, 0, 'M' );
	assertArrayClose( Array.from( reinterpret( ALPHA, 0 ) ), tc.ALPHA, tol, 'ALPHA' );
	assertArrayClose( Array.from( reinterpret( BETA, 0 ) ), tc.BETA, tol, 'BETA' );
});

test( 'ztgsen: ijob=0 select=[F,T,F,T] wantq=F wantz=F N=4', function t() {
	var tol = 1e-9;
	var tc = findCase( 'ijob=0 select=[F,T,F,T] wantq=F wantz=F N=4' );
	var ab = makeAB4();
	var Q = new Complex128Array( 16 );
	var Z = new Complex128Array( 16 );
	var ALPHA = new Complex128Array( 4 );
	var BETA = new Complex128Array( 4 );
	var DIF = new Float64Array( 2 );
	var SEL = new Uint8Array( [ 0, 1, 0, 1 ] );
	var WK = new Complex128Array( 64 );
	var IWK = new Int32Array( 64 );
	var r = ztgsen( 0, false, false, SEL, 1, 0, 4, ab.A, 1, 4, 0, ab.B, 1, 4, 0, ALPHA, 1, 0, BETA, 1, 0, Q, 1, 4, 0, Z, 1, 4, 0, 0, 1.0, 1.0, DIF, 1, 0, WK, 1, 0, -1, IWK, 1, 0, -1 );
	assert.equal( r.info, tc.info, 'info' );
	assert.equal( r.m, tc.M, 'M' );
	assertArrayClose( Array.from( reinterpret( ab.A, 0 ) ), tc.A, tol, 'A' );
	assertArrayClose( Array.from( reinterpret( ab.B, 0 ) ), tc.B, tol, 'B' );
	assertArrayClose( Array.from( reinterpret( ALPHA, 0 ) ), tc.ALPHA, tol, 'ALPHA' );
	assertArrayClose( Array.from( reinterpret( BETA, 0 ) ), tc.BETA, tol, 'BETA' );
});

test( 'ztgsen: ijob=1 (PL/PR direct)', function t() {
	var tol = 1e-9;
	var tc = findCase( 'ijob=1 select=[T,F,T,F] wantq=T wantz=T N=4' );
	var ab = makeAB4();
	var Q = eye( 4 );
	var Z = eye( 4 );
	var ALPHA = new Complex128Array( 4 );
	var BETA = new Complex128Array( 4 );
	var DIF = new Float64Array( 2 );
	var SEL = new Uint8Array( [ 1, 0, 1, 0 ] );
	var WK = new Complex128Array( 256 );
	var IWK = new Int32Array( 256 );
	var r = ztgsen( 1, true, true, SEL, 1, 0, 4, ab.A, 1, 4, 0, ab.B, 1, 4, 0, ALPHA, 1, 0, BETA, 1, 0, Q, 1, 4, 0, Z, 1, 4, 0, 0, 1.0, 1.0, DIF, 1, 0, WK, 1, 0, 256, IWK, 1, 0, 256 );
	assert.equal( r.info, 0, 'info' );
	assert.equal( r.m, 2, 'M' );
	assertClose( r.pl, tc.PL, tol, 'PL' );
	assertClose( r.pr, tc.PR, tol, 'PR' );
});

test( 'ztgsen: ijob=2 (DIF direct, partial select)', function t() {
	var tol = 1e-9;
	var tc = findCase( 'ijob=2 select=[T,F,T,F] wantq=T wantz=T N=4' );
	var ab = makeAB4();
	var Q = eye( 4 );
	var Z = eye( 4 );
	var ALPHA = new Complex128Array( 4 );
	var BETA = new Complex128Array( 4 );
	var DIF = new Float64Array( 2 );
	var SEL = new Uint8Array( [ 1, 0, 1, 0 ] );
	var WK = new Complex128Array( 256 );
	var IWK = new Int32Array( 256 );
	var r = ztgsen( 2, true, true, SEL, 1, 0, 4, ab.A, 1, 4, 0, ab.B, 1, 4, 0, ALPHA, 1, 0, BETA, 1, 0, Q, 1, 4, 0, Z, 1, 4, 0, 0, 1.0, 1.0, DIF, 1, 0, WK, 1, 0, 256, IWK, 1, 0, 256 );
	assert.equal( r.info, 0, 'info' );
	assert.equal( r.m, 2, 'M' );
	assertClose( DIF[ 0 ], tc.DIF[ 0 ], tol, 'DIF[0]' );
	assertClose( DIF[ 1 ], tc.DIF[ 1 ], tol, 'DIF[1]' );
});

test( 'ztgsen: ijob=3 (DIF estimated)', function t() {
	var tol = 1e-9;
	var tc = findCase( 'ijob=3 select=[T,F,T,F] wantq=T wantz=T N=4' );
	var ab = makeAB4();
	var Q = eye( 4 );
	var Z = eye( 4 );
	var ALPHA = new Complex128Array( 4 );
	var BETA = new Complex128Array( 4 );
	var DIF = new Float64Array( 2 );
	var SEL = new Uint8Array( [ 1, 0, 1, 0 ] );
	var WK = new Complex128Array( 256 );
	var IWK = new Int32Array( 256 );
	var r = ztgsen( 3, true, true, SEL, 1, 0, 4, ab.A, 1, 4, 0, ab.B, 1, 4, 0, ALPHA, 1, 0, BETA, 1, 0, Q, 1, 4, 0, Z, 1, 4, 0, 0, 1.0, 1.0, DIF, 1, 0, WK, 1, 0, 256, IWK, 1, 0, 256 );
	assert.equal( r.info, 0, 'info' );
	assert.equal( r.m, 2, 'M' );
	assertClose( DIF[ 0 ], tc.DIF[ 0 ], tol, 'DIF[0]' );
	assertClose( DIF[ 1 ], tc.DIF[ 1 ], tol, 'DIF[1]' );
});

test( 'ztgsen: ijob=4 (PL/PR + DIF direct)', function t() {
	var tol = 1e-9;
	var tc = findCase( 'ijob=4 select=[T,F,T,F] wantq=T wantz=T N=4' );
	var ab = makeAB4();
	var Q = eye( 4 );
	var Z = eye( 4 );
	var ALPHA = new Complex128Array( 4 );
	var BETA = new Complex128Array( 4 );
	var DIF = new Float64Array( 2 );
	var SEL = new Uint8Array( [ 1, 0, 1, 0 ] );
	var WK = new Complex128Array( 256 );
	var IWK = new Int32Array( 256 );
	var r = ztgsen( 4, true, true, SEL, 1, 0, 4, ab.A, 1, 4, 0, ab.B, 1, 4, 0, ALPHA, 1, 0, BETA, 1, 0, Q, 1, 4, 0, Z, 1, 4, 0, 0, 1.0, 1.0, DIF, 1, 0, WK, 1, 0, 256, IWK, 1, 0, 256 );
	assert.equal( r.info, 0, 'info' );
	assert.equal( r.m, 2, 'M' );
	assertClose( r.pl, tc.PL, tol, 'PL' );
	assertClose( r.pr, tc.PR, tol, 'PR' );
	assertClose( DIF[ 0 ], tc.DIF[ 0 ], tol, 'DIF[0]' );
	assertClose( DIF[ 1 ], tc.DIF[ 1 ], tol, 'DIF[1]' );
});

test( 'ztgsen: ijob=5 (PL/PR + DIF estimated)', function t() {
	var tol = 1e-9;
	var tc = findCase( 'ijob=5 select=[T,F,T,F] wantq=T wantz=T N=4' );
	var ab = makeAB4();
	var Q = eye( 4 );
	var Z = eye( 4 );
	var ALPHA = new Complex128Array( 4 );
	var BETA = new Complex128Array( 4 );
	var DIF = new Float64Array( 2 );
	var SEL = new Uint8Array( [ 1, 0, 1, 0 ] );
	var WK = new Complex128Array( 256 );
	var IWK = new Int32Array( 256 );
	var r = ztgsen( 5, true, true, SEL, 1, 0, 4, ab.A, 1, 4, 0, ab.B, 1, 4, 0, ALPHA, 1, 0, BETA, 1, 0, Q, 1, 4, 0, Z, 1, 4, 0, 0, 1.0, 1.0, DIF, 1, 0, WK, 1, 0, 256, IWK, 1, 0, 256 );
	assert.equal( r.info, 0, 'info' );
	assert.equal( r.m, 2, 'M' );
	assertClose( r.pl, tc.PL, tol, 'PL' );
	assertClose( r.pr, tc.PR, tol, 'PR' );
	assertClose( DIF[ 0 ], tc.DIF[ 0 ], tol, 'DIF[0]' );
	assertClose( DIF[ 1 ], tc.DIF[ 1 ], tol, 'DIF[1]' );
});

test( 'ztgsen: ijob=2 all-selected (M=N path with DIF)', function t() {
	var tol = 1e-9;
	var tc = findCase( 'ijob=2 select=[T,T,T] wantq=T wantz=T N=3 allsel' );
	var ab = makeAB3();
	var Q = eye( 3 );
	var Z = eye( 3 );
	var ALPHA = new Complex128Array( 3 );
	var BETA = new Complex128Array( 3 );
	var DIF = new Float64Array( 2 );
	var SEL = new Uint8Array( [ 1, 1, 1 ] );
	var WK = new Complex128Array( 64 );
	var IWK = new Int32Array( 64 );
	var r = ztgsen( 2, true, true, SEL, 1, 0, 3, ab.A, 1, 3, 0, ab.B, 1, 3, 0, ALPHA, 1, 0, BETA, 1, 0, Q, 1, 3, 0, Z, 1, 3, 0, 0, 1.0, 1.0, DIF, 1, 0, WK, 1, 0, 64, IWK, 1, 0, 64 );
	assert.equal( r.info, 0, 'info' );
	assert.equal( r.m, 3, 'M' );
	assertClose( DIF[ 0 ], tc.DIF[ 0 ], tol, 'DIF[0]' );
	assertClose( DIF[ 1 ], tc.DIF[ 1 ], tol, 'DIF[1]' );
});

test( 'ztgsen: ijob=1 none-selected (M=0 path with PL/PR)', function t() {
	var tol = 1e-9;
	var tc = findCase( 'ijob=1 select=[F,F,F] wantq=T wantz=T N=3 nonesel' );
	var ab = makeAB3();
	var Q = eye( 3 );
	var Z = eye( 3 );
	var ALPHA = new Complex128Array( 3 );
	var BETA = new Complex128Array( 3 );
	var DIF = new Float64Array( 2 );
	var SEL = new Uint8Array( [ 0, 0, 0 ] );
	var WK = new Complex128Array( 64 );
	var IWK = new Int32Array( 64 );
	var r = ztgsen( 1, true, true, SEL, 1, 0, 3, ab.A, 1, 3, 0, ab.B, 1, 3, 0, ALPHA, 1, 0, BETA, 1, 0, Q, 1, 3, 0, Z, 1, 3, 0, 0, 1.0, 1.0, DIF, 1, 0, WK, 1, 0, 64, IWK, 1, 0, 64 );
	assert.equal( r.info, 0, 'info' );
	assert.equal( r.m, 0, 'M' );
	assertClose( r.pl, tc.PL, tol, 'PL' );
	assertClose( r.pr, tc.PR, tol, 'PR' );
});

test( 'ztgsen: N=1 trivial', function t() {
	var tol = 1e-9;
	var tc = findCase( 'ijob=0 N=1 select=[T]' );
	var A = new Complex128Array( 1 );
	var B = new Complex128Array( 1 );
	var Av = reinterpret( A, 0 );
	var Bv = reinterpret( B, 0 );
	Av[ 0 ] = 5.0; Av[ 1 ] = 3.0;
	Bv[ 0 ] = 2.0; Bv[ 1 ] = 1.0;
	var Q = eye( 1 );
	var Z = eye( 1 );
	var ALPHA = new Complex128Array( 1 );
	var BETA = new Complex128Array( 1 );
	var DIF = new Float64Array( 2 );
	var SEL = new Uint8Array( [ 1 ] );
	var WK = new Complex128Array( 4 );
	var IWK = new Int32Array( 4 );
	var r = ztgsen( 0, true, true, SEL, 1, 0, 1, A, 1, 1, 0, B, 1, 1, 0, ALPHA, 1, 0, BETA, 1, 0, Q, 1, 1, 0, Z, 1, 1, 0, 0, 1.0, 1.0, DIF, 1, 0, WK, 1, 0, -1, IWK, 1, 0, -1 );
	assert.equal( r.info, 0, 'info' );
	assert.equal( r.m, 1, 'M' );
	assertArrayClose( Array.from( reinterpret( ALPHA, 0 ) ), tc.ALPHA, tol, 'ALPHA' );
	assertArrayClose( Array.from( reinterpret( BETA, 0 ) ), tc.BETA, tol, 'BETA' );
});

test( 'ztgsen: N=0 (degenerate)', function t() {
	var Q = new Complex128Array( 1 );
	var Z = new Complex128Array( 1 );
	var ALPHA = new Complex128Array( 1 );
	var BETA = new Complex128Array( 1 );
	var DIF = new Float64Array( 2 );
	var SEL = new Uint8Array( 0 );
	var WK = new Complex128Array( 1 );
	var IWK = new Int32Array( 1 );
	var A = new Complex128Array( 0 );
	var B = new Complex128Array( 0 );
	var r = ztgsen( 0, true, true, SEL, 1, 0, 0, A, 1, 1, 0, B, 1, 1, 0, ALPHA, 1, 0, BETA, 1, 0, Q, 1, 1, 0, Z, 1, 1, 0, 0, 1.0, 1.0, DIF, 1, 0, WK, 1, 0, -1, IWK, 1, 0, -1 );
	assert.equal( r.info, 0, 'info' );
	assert.equal( r.m, 0, 'M' );
});
