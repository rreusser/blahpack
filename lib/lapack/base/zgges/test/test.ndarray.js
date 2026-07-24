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
import { readFileSync } from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Uint8Array from '@stdlib/array/uint8/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import zgges from './../lib/ndarray.js';


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

function runCase( tc, jobvsl, jobvsr ) {
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
	const res = zgges( jobvsl, jobvsr, 'not-sorted', nosel, N, A, 1, Math.max( 1, N ), 0, B, 1, Math.max( 1, N ), 0, ALPHA, 1, 0, BETA, 1, 0, VSL, 1, Math.max( 1, N ), 0, VSR, 1, Math.max( 1, N ), 0, WORK, 1, 0, RWORK, 1, 0, BWORK, 1, 0 );
	assert.equal( res.info, tc.info, 'info' );
	assert.equal( res.sdim, tc.sdim, 'sdim' );
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
	const A = new Complex128Array( 0 );
	const B = new Complex128Array( 0 );
	const ALPHA = new Complex128Array( 0 );
	const BETA = new Complex128Array( 0 );
	const VSL = new Complex128Array( 0 );
	const VSR = new Complex128Array( 0 );
	const res = zgges( 'no-vectors', 'no-vectors', 'not-sorted', nosel, 0, A, 1, 0, 0, B, 1, 0, 0, ALPHA, 1, 0, BETA, 1, 0, VSL, 1, 0, 0, VSR, 1, 0, 0, new Complex128Array( 1 ), 1, 0, new Float64Array( 1 ), 1, 0, new Uint8Array( 1 ), 1, 0 );
	assert.equal( res.info, 0, 'info' );
	assert.equal( res.sdim, 0, 'sdim' );
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
	const res = zgges( 'compute-vectors', 'compute-vectors', 'not-sorted', nosel, N, A, 1, N, 0, B, 1, N, 0, ALPHA, 1, 0, BETA, 1, 0, VSL, 1, N, 0, VSR, 1, N, 0, new Complex128Array( N + Math.max( 8 * N, 1 ) ), 1, 0, new Float64Array( ( 2 * N ) + Math.max( 8 * N, 1 ) ), 1, 0, new Uint8Array( Math.max( 1, N ) ), 1, 0 );
	assert.equal( res.info, 0, 'info' );
});

test( 'zgges: huge inputs trigger B-scaling (ilbscl)', function t() {
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
	const res = zgges( 'compute-vectors', 'compute-vectors', 'not-sorted', nosel, N, A, 1, N, 0, B, 1, N, 0, ALPHA, 1, 0, BETA, 1, 0, VSL, 1, N, 0, VSR, 1, N, 0, new Complex128Array( N + Math.max( 8 * N, 1 ) ), 1, 0, new Float64Array( ( 2 * N ) + Math.max( 8 * N, 1 ) ), 1, 0, new Uint8Array( Math.max( 1, N ) ), 1, 0 );
	assert.equal( res.info, 0, 'info' );
});

test( 'zgges: sort=sorted with selctg (positive real part)', function t() {
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
	const res = zgges( 'compute-vectors', 'compute-vectors', 'sorted', selPositiveReal, N, A, 1, N, 0, B, 1, N, 0, ALPHA, 1, 0, BETA, 1, 0, VSL, 1, N, 0, VSR, 1, N, 0, new Complex128Array( N + Math.max( 8 * N, 1 ) ), 1, 0, new Float64Array( ( 2 * N ) + Math.max( 8 * N, 1 ) ), 1, 0, new Uint8Array( Math.max( 1, N ) ), 1, 0 );
	assert.equal( res.info, 0, 'info' );

	// 2 eigenvalues with positive real part:
	assert.equal( res.sdim, 2, 'sdim' );
});

test( 'zgges: sort=sorted with selctg (none selected)', function t() {
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
	const res = zgges( 'compute-vectors', 'compute-vectors', 'sorted', nosel, N, A, 1, N, 0, B, 1, N, 0, ALPHA, 1, 0, BETA, 1, 0, VSL, 1, N, 0, VSR, 1, N, 0, new Complex128Array( N + Math.max( 8 * N, 1 ) ), 1, 0, new Float64Array( ( 2 * N ) + Math.max( 8 * N, 1 ) ), 1, 0, new Uint8Array( Math.max( 1, N ) ), 1, 0 );
	assert.equal( res.info, 0, 'info' );
	assert.equal( res.sdim, 0, 'sdim' );
});

test( 'zgges: jobvsl=V jobvsr=N (left-only) basic', function t() {
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
	const res = zgges( 'compute-vectors', 'no-vectors', 'not-sorted', nosel, N, A, 1, N, 0, B, 1, N, 0, ALPHA, 1, 0, BETA, 1, 0, VSL, 1, N, 0, VSR, 1, 1, 0, new Complex128Array( N + Math.max( 8 * N, 1 ) ), 1, 0, new Float64Array( ( 2 * N ) + Math.max( 8 * N, 1 ) ), 1, 0, new Uint8Array( Math.max( 1, N ) ), 1, 0 );
	assert.equal( res.info, 0, 'info' );
});

test( 'zgges: jobvsl=N jobvsr=V (right-only) basic', function t() {
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
	const res = zgges( 'no-vectors', 'compute-vectors', 'not-sorted', nosel, N, A, 1, N, 0, B, 1, N, 0, ALPHA, 1, 0, BETA, 1, 0, VSL, 1, 1, 0, VSR, 1, N, 0, new Complex128Array( N + Math.max( 8 * N, 1 ) ), 1, 0, new Float64Array( ( 2 * N ) + Math.max( 8 * N, 1 ) ), 1, 0, new Uint8Array( Math.max( 1, N ) ), 1, 0 );
	assert.equal( res.info, 0, 'info' );
});
