
/* eslint-disable max-len, function-call-argument-newline, function-paren-newline, array-element-newline, no-restricted-syntax, no-new-wrappers, no-unused-vars, stdlib/first-unit-test, max-statements-per-line, require-jsdoc, valid-jsdoc, stdlib/vars-order, vars-on-top, one-var-declaration-per-line, one-var */

// MODULES //

import { readFileSync } from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dhgeqz from './../lib/ndarray.js';


// FIXTURES //

const fixtureDir = path.join( import.meta.dirname, '..', '..', '..', '..', '..', 'test', 'fixtures' );
const lines = readFileSync( path.join( fixtureDir, 'dhgeqz.jsonl' ), 'utf8' ).trim().split( '\n' );
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

/**
* Flattens a column-major Fortran matrix (given as array of arrays or flat array) into a row-major Float64Array.
* Fortran outputs from fixtures are stored column-major.
*/
function colMajorToFloat64( mat, m, n ) {
	const out = new Float64Array( m * n );
	let i, j;
	for ( j = 0; j < n; j++ ) {
		for ( i = 0; i < m; i++ ) {
			out[ ( i * n ) + j ] = mat[ ( j * m ) + i ];
		}
	}
	return out;
}

/**
* Extracts a flat array (row-major) from a Float64Array matrix.
*/
function extractArray( arr, N ) {
	const out = [];
	let i;
	for ( i = 0; i < N; i++ ) {
		out.push( arr[ i ] );
	}
	return out;
}


// TESTS //

test( 'main export is a function', function t() {
	assert.strictEqual( typeof dhgeqz, 'function', 'main export is a function' );
});

test( 'dhgeqz: eigenvalues only 4x4', function t() {
	const ALPHAR = new Float64Array( 4 );
	const ALPHAI = new Float64Array( 4 );
	const BETA = new Float64Array( 4 );
	const WORK = new Float64Array( 40 );
	const Q = new Float64Array( 16 );
	const Z = new Float64Array( 16 );
	const tc = findCase( 'eigenvalues only 4x4' );
	const N = 4;

	// Upper Hessenberg H (row-major)
	const H = new Float64Array([
		2.0, 3.0, 1.0, 0.5,
		1.5, 4.0, 2.0, 1.0,
		0.0, 1.0, 3.0, 1.5,
		0.0, 0.0, 0.8, 1.0
	]);

	// Upper triangular T (row-major)
	const T = new Float64Array([
		1.0, 0.5, 0.2, 0.1,
		0.0, 2.0, 0.3, 0.15,
		0.0, 0.0, 1.5, 0.4,
		0.0, 0.0, 0.0, 1.0
	]);

	const info = dhgeqz( 'eigenvalues', 'none', 'none', N, 0, N - 1,
		H, N, 1, 0,
		T, N, 1, 0,
		ALPHAR, 1, 0,
		ALPHAI, 1, 0,
		BETA, 1, 0,
		Q, N, 1, 0,
		Z, N, 1, 0,
		WORK, 1, 0 );

	assert.equal( info, 0, 'info should be 0' );
	assertArrayClose( extractArray( ALPHAR, N ), tc.ALPHAR, 1e-12, 'ALPHAR' );
	assertArrayClose( extractArray( ALPHAI, N ), tc.ALPHAI, 1e-12, 'ALPHAI' );
	assertArrayClose( extractArray( BETA, N ), tc.BETA, 1e-12, 'BETA' );
});

test( 'dhgeqz: schur form 4x4 init', function t() {
	const ALPHAR = new Float64Array( 4 );
	const ALPHAI = new Float64Array( 4 );
	const BETA = new Float64Array( 4 );
	const WORK = new Float64Array( 40 );
	const Q = new Float64Array( 16 );
	const Z = new Float64Array( 16 );
	const tc = findCase( 'schur form 4x4 init' );
	const N = 4;

	const H = new Float64Array([
		2.0, 3.0, 1.0, 0.5,
		1.5, 4.0, 2.0, 1.0,
		0.0, 1.0, 3.0, 1.5,
		0.0, 0.0, 0.8, 1.0
	]);

	const T = new Float64Array([
		1.0, 0.5, 0.2, 0.1,
		0.0, 2.0, 0.3, 0.15,
		0.0, 0.0, 1.5, 0.4,
		0.0, 0.0, 0.0, 1.0
	]);

	const info = dhgeqz( 'schur', 'initialize', 'initialize', N, 0, N - 1,
		H, N, 1, 0,
		T, N, 1, 0,
		ALPHAR, 1, 0,
		ALPHAI, 1, 0,
		BETA, 1, 0,
		Q, N, 1, 0,
		Z, N, 1, 0,
		WORK, 1, 0 );

	assert.equal( info, 0, 'info should be 0' );
	assertArrayClose( extractArray( ALPHAR, N ), tc.ALPHAR, 1e-12, 'ALPHAR' );
	assertArrayClose( extractArray( ALPHAI, N ), tc.ALPHAI, 1e-12, 'ALPHAI' );
	assertArrayClose( extractArray( BETA, N ), tc.BETA, 1e-12, 'BETA' );

	// Check that H and T are in Schur form via fixture comparison
	const expectedH = colMajorToFloat64( tc.H, N, N );
	const expectedT = colMajorToFloat64( tc.TT, N, N );
	assertArrayClose( extractArray( H, N * N ), extractArray( expectedH, N * N ), 1e-12, 'H' );
	assertArrayClose( extractArray( T, N * N ), extractArray( expectedT, N * N ), 1e-12, 'T' );
});

test( 'dhgeqz: eigenvalues subrange 3x3', function t() {
	const ALPHAR = new Float64Array( 3 );
	const ALPHAI = new Float64Array( 3 );
	const BETA = new Float64Array( 3 );
	const WORK = new Float64Array( 30 );
	const Q = new Float64Array( 9 );
	const Z = new Float64Array( 9 );
	const tc = findCase( 'eigenvalues subrange 3x3' );
	const N = 3;

	// Row-major
	const H = new Float64Array([
		5.0, 1.0, 0.5,
		0.0, 3.0, 2.0,
		0.0, 1.5, 1.0
	]);

	const T = new Float64Array([
		2.0, 0.3, 0.1,
		0.0, 1.0, 0.4,
		0.0, 0.0, 3.0
	]);

	// ILO=1 (0-based), IHI=2 (0-based) — active subrange is indices 1..2
	const info = dhgeqz( 'eigenvalues', 'none', 'none', N, 1, 2,
		H, N, 1, 0,
		T, N, 1, 0,
		ALPHAR, 1, 0,
		ALPHAI, 1, 0,
		BETA, 1, 0,
		Q, N, 1, 0,
		Z, N, 1, 0,
		WORK, 1, 0 );

	assert.equal( info, 0, 'info should be 0' );
	assertArrayClose( extractArray( ALPHAR, N ), tc.ALPHAR, 1e-12, 'ALPHAR' );
	assertArrayClose( extractArray( ALPHAI, N ), tc.ALPHAI, 1e-12, 'ALPHAI' );
	assertArrayClose( extractArray( BETA, N ), tc.BETA, 1e-12, 'BETA' );
});

test( 'dhgeqz: schur subrange 3x3', function t() {
	const ALPHAR = new Float64Array( 3 );
	const ALPHAI = new Float64Array( 3 );
	const BETA = new Float64Array( 3 );
	const WORK = new Float64Array( 30 );
	const Q = new Float64Array( 9 );
	const Z = new Float64Array( 9 );
	const tc = findCase( 'schur subrange 3x3' );
	const N = 3;

	const H = new Float64Array([
		5.0, 1.0, 0.5,
		0.0, 3.0, 2.0,
		0.0, 1.5, 1.0
	]);

	const T = new Float64Array([
		2.0, 0.3, 0.1,
		0.0, 1.0, 0.4,
		0.0, 0.0, 3.0
	]);

	const info = dhgeqz( 'schur', 'initialize', 'initialize', N, 1, 2,
		H, N, 1, 0,
		T, N, 1, 0,
		ALPHAR, 1, 0,
		ALPHAI, 1, 0,
		BETA, 1, 0,
		Q, N, 1, 0,
		Z, N, 1, 0,
		WORK, 1, 0 );

	assert.equal( info, 0, 'info should be 0' );
	assertArrayClose( extractArray( ALPHAR, N ), tc.ALPHAR, 1e-12, 'ALPHAR' );
	assertArrayClose( extractArray( ALPHAI, N ), tc.ALPHAI, 1e-12, 'ALPHAI' );
	assertArrayClose( extractArray( BETA, N ), tc.BETA, 1e-12, 'BETA' );

	const expectedH = colMajorToFloat64( tc.H, N, N );
	const expectedT = colMajorToFloat64( tc.TT, N, N );
	assertArrayClose( extractArray( H, N * N ), extractArray( expectedH, N * N ), 1e-12, 'H' );
	assertArrayClose( extractArray( T, N * N ), extractArray( expectedT, N * N ), 1e-12, 'T' );
});

test( 'dhgeqz: schur 5x5 complex eigs', function t() {
	const ALPHAR = new Float64Array( 5 );
	const ALPHAI = new Float64Array( 5 );
	const BETA = new Float64Array( 5 );
	const WORK = new Float64Array( 50 );
	const Q = new Float64Array( 25 );
	const Z = new Float64Array( 25 );
	const tc = findCase( 'schur 5x5 complex eigs' );
	const N = 5;

	const H = new Float64Array([
		0.5, 1.0, 0.3, 0.1, 0.2,
		2.0, 0.5, 0.5, 0.2, 0.1,
		0.0, 3.0, 0.5, 0.4, 0.3,
		0.0, 0.0, 2.5, 0.5, 0.5,
		0.0, 0.0, 0.0, 2.0, 0.5
	]);

	const T = new Float64Array([
		1.0, 0.1, 0.05, 0.02, 0.01,
		0.0, 1.0, 0.1, 0.05, 0.02,
		0.0, 0.0, 1.0, 0.1, 0.05,
		0.0, 0.0, 0.0, 1.0, 0.1,
		0.0, 0.0, 0.0, 0.0, 1.0
	]);

	const info = dhgeqz( 'schur', 'initialize', 'initialize', N, 0, N - 1,
		H, N, 1, 0,
		T, N, 1, 0,
		ALPHAR, 1, 0,
		ALPHAI, 1, 0,
		BETA, 1, 0,
		Q, N, 1, 0,
		Z, N, 1, 0,
		WORK, 1, 0 );

	assert.equal( info, 0, 'info should be 0' );
	assertArrayClose( extractArray( ALPHAR, N ), tc.ALPHAR, 1e-12, 'ALPHAR' );
	assertArrayClose( extractArray( ALPHAI, N ), tc.ALPHAI, 1e-12, 'ALPHAI' );
	assertArrayClose( extractArray( BETA, N ), tc.BETA, 1e-12, 'BETA' );
});

test( 'dhgeqz: eigenvalues 2x2', function t() {
	const ALPHAR = new Float64Array( 2 );
	const ALPHAI = new Float64Array( 2 );
	const BETA = new Float64Array( 2 );
	const WORK = new Float64Array( 20 );
	const Q = new Float64Array( 4 );
	const Z = new Float64Array( 4 );
	const tc = findCase( 'eigenvalues 2x2' );
	const N = 2;

	const H = new Float64Array([
		1.0, 2.0,
		3.0, 4.0
	]);

	const T = new Float64Array([
		1.0, 0.5,
		0.0, 2.0
	]);

	const info = dhgeqz( 'eigenvalues', 'none', 'none', N, 0, N - 1,
		H, N, 1, 0,
		T, N, 1, 0,
		ALPHAR, 1, 0,
		ALPHAI, 1, 0,
		BETA, 1, 0,
		Q, N, 1, 0,
		Z, N, 1, 0,
		WORK, 1, 0 );

	assert.equal( info, 0, 'info should be 0' );
	assertArrayClose( extractArray( ALPHAR, N ), tc.ALPHAR, 1e-12, 'ALPHAR' );
	assertArrayClose( extractArray( ALPHAI, N ), tc.ALPHAI, 1e-12, 'ALPHAI' );
	assertArrayClose( extractArray( BETA, N ), tc.BETA, 1e-12, 'BETA' );
});

test( 'dhgeqz: schur 4x4 update (V mode)', function t() {
	const ALPHAR = new Float64Array( 4 );
	const ALPHAI = new Float64Array( 4 );
	const BETA = new Float64Array( 4 );
	const WORK = new Float64Array( 40 );
	const tc = findCase( 'schur 4x4 update' );
	const N = 4;
	let i;

	const H = new Float64Array([
		2.0, 3.0, 1.0, 0.5,
		1.5, 4.0, 2.0, 1.0,
		0.0, 1.0, 3.0, 1.5,
		0.0, 0.0, 0.8, 1.0
	]);

	const T = new Float64Array([
		1.0, 0.5, 0.2, 0.1,
		0.0, 2.0, 0.3, 0.15,
		0.0, 0.0, 1.5, 0.4,
		0.0, 0.0, 0.0, 1.0
	]);

	// Start Q and Z as identity
	const Q = new Float64Array( 16 );
	const Z = new Float64Array( 16 );
	for ( i = 0; i < N; i++ ) {
		Q[ ( i * N ) + i ] = 1.0;
		Z[ ( i * N ) + i ] = 1.0;
	}

	const info = dhgeqz( 'schur', 'update', 'update', N, 0, N - 1,
		H, N, 1, 0,
		T, N, 1, 0,
		ALPHAR, 1, 0,
		ALPHAI, 1, 0,
		BETA, 1, 0,
		Q, N, 1, 0,
		Z, N, 1, 0,
		WORK, 1, 0 );

	assert.equal( info, 0, 'info should be 0' );
	assertArrayClose( extractArray( ALPHAR, N ), tc.ALPHAR, 1e-12, 'ALPHAR' );
	assertArrayClose( extractArray( ALPHAI, N ), tc.ALPHAI, 1e-12, 'ALPHAI' );
	assertArrayClose( extractArray( BETA, N ), tc.BETA, 1e-12, 'BETA' );
});

test( 'dhgeqz: n=1 edge case', function t() {
	const ALPHAR = new Float64Array( 1 );
	const ALPHAI = new Float64Array( 1 );
	const BETA = new Float64Array( 1 );
	const WORK = new Float64Array( 10 );
	const Q = new Float64Array( 1 );
	const Z = new Float64Array( 1 );
	const tc = findCase( 'n=1 edge case' );
	const N = 1;

	const H = new Float64Array([ 7.0 ]);
	const T = new Float64Array([ 3.0 ]);

	const info = dhgeqz( 'schur', 'initialize', 'initialize', N, 0, 0,
		H, 1, 1, 0,
		T, 1, 1, 0,
		ALPHAR, 1, 0,
		ALPHAI, 1, 0,
		BETA, 1, 0,
		Q, 1, 1, 0,
		Z, 1, 1, 0,
		WORK, 1, 0 );

	assert.equal( info, 0, 'info should be 0' );
	assertArrayClose( extractArray( ALPHAR, N ), tc.ALPHAR, 1e-12, 'ALPHAR' );
	assertArrayClose( extractArray( ALPHAI, N ), tc.ALPHAI, 1e-12, 'ALPHAI' );
	assertArrayClose( extractArray( BETA, N ), tc.BETA, 1e-12, 'BETA' );
});

test( 'dhgeqz: complex 2x2 block 3x3', function t() {
	const ALPHAR = new Float64Array( 3 );
	const ALPHAI = new Float64Array( 3 );
	const BETA = new Float64Array( 3 );
	const WORK = new Float64Array( 30 );
	const Q = new Float64Array( 9 );
	const Z = new Float64Array( 9 );
	const tc = findCase( 'complex 2x2 block 3x3' );
	const N = 3;

	const H = new Float64Array([
		1.0, 0.5, 0.3,
		4.0, 1.0, 0.5,
		0.0, 3.0, 1.0
	]);

	const T = new Float64Array([
		1.0, 0.1, 0.05,
		0.0, 1.0, 0.1,
		0.0, 0.0, 1.0
	]);

	const info = dhgeqz( 'schur', 'initialize', 'initialize', N, 0, N - 1,
		H, N, 1, 0,
		T, N, 1, 0,
		ALPHAR, 1, 0,
		ALPHAI, 1, 0,
		BETA, 1, 0,
		Q, N, 1, 0,
		Z, N, 1, 0,
		WORK, 1, 0 );

	assert.equal( info, 0, 'info should be 0' );
	assertArrayClose( extractArray( ALPHAR, N ), tc.ALPHAR, 1e-12, 'ALPHAR' );
	assertArrayClose( extractArray( ALPHAI, N ), tc.ALPHAI, 1e-12, 'ALPHAI' );
	assertArrayClose( extractArray( BETA, N ), tc.BETA, 1e-12, 'BETA' );
});

test( 'dhgeqz: negative T diagonal 4x4', function t() {
	const ALPHAR = new Float64Array( 4 );
	const ALPHAI = new Float64Array( 4 );
	const BETA = new Float64Array( 4 );
	const WORK = new Float64Array( 40 );
	const Q = new Float64Array( 16 );
	const Z = new Float64Array( 16 );
	const tc = findCase( 'negative T diagonal 4x4' );
	const N = 4;

	const H = new Float64Array([
		2.0, 1.0, 0.5, 0.2,
		1.0, 3.0, 1.0, 0.3,
		0.0, 0.5, 1.0, 0.5,
		0.0, 0.0, 0.3, 4.0
	]);

	const T = new Float64Array([
		-1.0, 0.5, 0.2, 0.1,
		0.0, 2.0, 0.3, 0.15,
		0.0, 0.0, -1.5, 0.4,
		0.0, 0.0, 0.0, 1.0
	]);

	const info = dhgeqz( 'schur', 'initialize', 'initialize', N, 0, N - 1,
		H, N, 1, 0,
		T, N, 1, 0,
		ALPHAR, 1, 0,
		ALPHAI, 1, 0,
		BETA, 1, 0,
		Q, N, 1, 0,
		Z, N, 1, 0,
		WORK, 1, 0 );

	assert.equal( info, 0, 'info should be 0' );
	assertArrayClose( extractArray( ALPHAR, N ), tc.ALPHAR, 1e-12, 'ALPHAR' );
	assertArrayClose( extractArray( ALPHAI, N ), tc.ALPHAI, 1e-12, 'ALPHAI' );
	assertArrayClose( extractArray( BETA, N ), tc.BETA, 1e-12, 'BETA' );
});

test( 'dhgeqz: n=0 quick return', function t() {
	const ALPHAR = new Float64Array( 1 );
	const ALPHAI = new Float64Array( 1 );
	const BETA = new Float64Array( 1 );
	const WORK = new Float64Array( 10 );
	const Q = new Float64Array( 1 );
	const Z = new Float64Array( 1 );
	const H = new Float64Array( 1 );
	const T = new Float64Array( 1 );

	const info = dhgeqz( 'schur', 'initialize', 'initialize', 0, 0, -1,
		H, 1, 1, 0,
		T, 1, 1, 0,
		ALPHAR, 1, 0,
		ALPHAI, 1, 0,
		BETA, 1, 0,
		Q, 1, 1, 0,
		Z, 1, 1, 0,
		WORK, 1, 0 );

	assert.equal( info, 0, 'info should be 0' );
});

test( 'dhgeqz: ihi < ilo skip', function t() {
	const ALPHAR = new Float64Array( 3 );
	const ALPHAI = new Float64Array( 3 );
	const BETA = new Float64Array( 3 );
	const WORK = new Float64Array( 30 );
	const Q = new Float64Array( 9 );
	const Z = new Float64Array( 9 );
	const tc = findCase( 'ihi lt ilo skip' );
	const N = 3;

	const H = new Float64Array([
		5.0, 1.0, 0.5,
		0.0, 3.0, 2.0,
		0.0, 0.0, 1.0
	]);

	const T = new Float64Array([
		2.0, 0.3, 0.1,
		0.0, 1.0, 0.4,
		0.0, 0.0, 3.0
	]);

	// ILO=2 (0-based), IHI=1 (0-based) — IHI < ILO, skip main iteration
	const info = dhgeqz( 'schur', 'initialize', 'initialize', N, 2, 1,
		H, N, 1, 0,
		T, N, 1, 0,
		ALPHAR, 1, 0,
		ALPHAI, 1, 0,
		BETA, 1, 0,
		Q, N, 1, 0,
		Z, N, 1, 0,
		WORK, 1, 0 );

	assert.equal( info, 0, 'info should be 0' );
	assertArrayClose( extractArray( ALPHAR, N ), tc.ALPHAR, 1e-12, 'ALPHAR' );
	assertArrayClose( extractArray( ALPHAI, N ), tc.ALPHAI, 1e-12, 'ALPHAI' );
	assertArrayClose( extractArray( BETA, N ), tc.BETA, 1e-12, 'BETA' );
});

test( 'dhgeqz: eig only neg T above active block', function t() {
	const ALPHAR = new Float64Array( 4 );
	const ALPHAI = new Float64Array( 4 );
	const BETA = new Float64Array( 4 );
	const WORK = new Float64Array( 40 );
	const Q = new Float64Array( 16 );
	const Z = new Float64Array( 16 );
	const tc = findCase( 'eig only neg T above' );
	const N = 4;

	const H = new Float64Array([
		2.0, 1.0, 0.0, 0.0,
		0.5, 3.0, 0.0, 0.0,
		0.0, 0.0, 7.0, 0.5,
		0.0, 0.0, 0.0, 5.0
	]);

	const T = new Float64Array([
		1.0, 0.2, 0.0, 0.0,
		0.0, 2.0, 0.0, 0.0,
		0.0, 0.0, -1.0, 0.1,
		0.0, 0.0, 0.0, -3.0
	]);

	// ILO=0, IHI=1 (0-based) — columns 2,3 are above the active block with negative T diagonal
	const info = dhgeqz( 'eigenvalues', 'none', 'none', N, 0, 1,
		H, N, 1, 0,
		T, N, 1, 0,
		ALPHAR, 1, 0,
		ALPHAI, 1, 0,
		BETA, 1, 0,
		Q, N, 1, 0,
		Z, N, 1, 0,
		WORK, 1, 0 );

	assert.equal( info, 0, 'info should be 0' );
	assertArrayClose( extractArray( ALPHAR, N ), tc.ALPHAR, 1e-12, 'ALPHAR' );
	assertArrayClose( extractArray( ALPHAI, N ), tc.ALPHAI, 1e-12, 'ALPHAI' );
	assertArrayClose( extractArray( BETA, N ), tc.BETA, 1e-12, 'BETA' );
});

test( 'dhgeqz: eig only neg T below active block', function t() {
	const ALPHAR = new Float64Array( 4 );
	const ALPHAI = new Float64Array( 4 );
	const BETA = new Float64Array( 4 );
	const WORK = new Float64Array( 40 );
	const Q = new Float64Array( 16 );
	const Z = new Float64Array( 16 );
	const tc = findCase( 'eig only neg T below' );
	const N = 4;

	const H = new Float64Array([
		5.0, 1.0, 0.0, 0.0,
		0.0, 3.0, 0.0, 0.0,
		0.0, 0.0, 2.0, 1.0,
		0.0, 0.0, 0.5, 4.0
	]);

	const T = new Float64Array([
		-2.0, 0.3, 0.0, 0.0,
		0.0, -1.0, 0.0, 0.0,
		0.0, 0.0, 1.0, 0.2,
		0.0, 0.0, 0.0, 3.0
	]);

	// ILO=2, IHI=3 (0-based) — columns 0,1 are below the active block with negative T diagonal
	const info = dhgeqz( 'eigenvalues', 'none', 'none', N, 2, 3,
		H, N, 1, 0,
		T, N, 1, 0,
		ALPHAR, 1, 0,
		ALPHAI, 1, 0,
		BETA, 1, 0,
		Q, N, 1, 0,
		Z, N, 1, 0,
		WORK, 1, 0 );

	assert.equal( info, 0, 'info should be 0' );
	assertArrayClose( extractArray( ALPHAR, N ), tc.ALPHAR, 1e-12, 'ALPHAR' );
	assertArrayClose( extractArray( ALPHAI, N ), tc.ALPHAI, 1e-12, 'ALPHAI' );
	assertArrayClose( extractArray( BETA, N ), tc.BETA, 1e-12, 'BETA' );
});

test( 'dhgeqz: eig only 5x5 complex', function t() {
	const ALPHAR = new Float64Array( 5 );
	const ALPHAI = new Float64Array( 5 );
	const BETA = new Float64Array( 5 );
	const WORK = new Float64Array( 50 );
	const Q = new Float64Array( 25 );
	const Z = new Float64Array( 25 );
	const tc = findCase( 'eig only 5x5 complex' );
	const N = 5;

	const H = new Float64Array([
		0.5, 1.0, 0.3, 0.1, 0.2,
		2.0, 0.5, 0.5, 0.2, 0.1,
		0.0, 3.0, 0.5, 0.4, 0.3,
		0.0, 0.0, 2.5, 0.5, 0.5,
		0.0, 0.0, 0.0, 2.0, 0.5
	]);

	const T = new Float64Array([
		1.0, 0.1, 0.05, 0.02, 0.01,
		0.0, 1.0, 0.1, 0.05, 0.02,
		0.0, 0.0, 1.0, 0.1, 0.05,
		0.0, 0.0, 0.0, 1.0, 0.1,
		0.0, 0.0, 0.0, 0.0, 1.0
	]);

	const info = dhgeqz( 'eigenvalues', 'none', 'none', N, 0, N - 1,
		H, N, 1, 0,
		T, N, 1, 0,
		ALPHAR, 1, 0,
		ALPHAI, 1, 0,
		BETA, 1, 0,
		Q, N, 1, 0,
		Z, N, 1, 0,
		WORK, 1, 0 );

	assert.equal( info, 0, 'info should be 0' );
	assertArrayClose( extractArray( ALPHAR, N ), tc.ALPHAR, 1e-12, 'ALPHAR' );
	assertArrayClose( extractArray( ALPHAI, N ), tc.ALPHAI, 1e-12, 'ALPHAI' );
	assertArrayClose( extractArray( BETA, N ), tc.BETA, 1e-12, 'BETA' );
});

test( 'dhgeqz: schur 6x6 double shift', function t() {
	const ALPHAR = new Float64Array( 6 );
	const ALPHAI = new Float64Array( 6 );
	const BETA = new Float64Array( 6 );
	const WORK = new Float64Array( 60 );
	const Q = new Float64Array( 36 );
	const Z = new Float64Array( 36 );
	const tc = findCase( 'schur 6x6 double shift' );
	const N = 6;

	const H = new Float64Array([
		1.0, 2.0, 0.5, 0.1, 0.05, 0.02,
		3.0, 1.0, 1.0, 0.3, 0.1, 0.05,
		0.0, 4.0, 1.0, 0.8, 0.2, 0.1,
		0.0, 0.0, 3.0, 1.0, 1.0, 0.3,
		0.0, 0.0, 0.0, 2.5, 1.0, 0.5,
		0.0, 0.0, 0.0, 0.0, 2.0, 1.0
	]);

	const T = new Float64Array([
		1.0, 0.1, 0.05, 0.02, 0.01, 0.005,
		0.0, 1.0, 0.1, 0.05, 0.02, 0.01,
		0.0, 0.0, 1.0, 0.1, 0.05, 0.02,
		0.0, 0.0, 0.0, 1.0, 0.1, 0.05,
		0.0, 0.0, 0.0, 0.0, 1.0, 0.1,
		0.0, 0.0, 0.0, 0.0, 0.0, 1.0
	]);

	const info = dhgeqz( 'schur', 'initialize', 'initialize', N, 0, N - 1,
		H, N, 1, 0,
		T, N, 1, 0,
		ALPHAR, 1, 0,
		ALPHAI, 1, 0,
		BETA, 1, 0,
		Q, N, 1, 0,
		Z, N, 1, 0,
		WORK, 1, 0 );

	assert.equal( info, 0, 'info should be 0' );
	assertArrayClose( extractArray( ALPHAR, N ), tc.ALPHAR, 1e-12, 'ALPHAR' );
	assertArrayClose( extractArray( ALPHAI, N ), tc.ALPHAI, 1e-12, 'ALPHAI' );
	assertArrayClose( extractArray( BETA, N ), tc.BETA, 1e-12, 'BETA' );
});

test( 'dhgeqz: eig only 6x6 double shift', function t() {
	const ALPHAR = new Float64Array( 6 );
	const ALPHAI = new Float64Array( 6 );
	const BETA = new Float64Array( 6 );
	const WORK = new Float64Array( 60 );
	const Q = new Float64Array( 36 );
	const Z = new Float64Array( 36 );
	const tc = findCase( 'eig only 6x6 double shift' );
	const N = 6;

	const H = new Float64Array([
		1.0, 2.0, 0.5, 0.1, 0.05, 0.02,
		3.0, 1.0, 1.0, 0.3, 0.1, 0.05,
		0.0, 4.0, 1.0, 0.8, 0.2, 0.1,
		0.0, 0.0, 3.0, 1.0, 1.0, 0.3,
		0.0, 0.0, 0.0, 2.5, 1.0, 0.5,
		0.0, 0.0, 0.0, 0.0, 2.0, 1.0
	]);

	const T = new Float64Array([
		1.0, 0.1, 0.05, 0.02, 0.01, 0.005,
		0.0, 1.0, 0.1, 0.05, 0.02, 0.01,
		0.0, 0.0, 1.0, 0.1, 0.05, 0.02,
		0.0, 0.0, 0.0, 1.0, 0.1, 0.05,
		0.0, 0.0, 0.0, 0.0, 1.0, 0.1,
		0.0, 0.0, 0.0, 0.0, 0.0, 1.0
	]);

	const info = dhgeqz( 'eigenvalues', 'none', 'none', N, 0, N - 1,
		H, N, 1, 0,
		T, N, 1, 0,
		ALPHAR, 1, 0,
		ALPHAI, 1, 0,
		BETA, 1, 0,
		Q, N, 1, 0,
		Z, N, 1, 0,
		WORK, 1, 0 );

	assert.equal( info, 0, 'info should be 0' );
	assertArrayClose( extractArray( ALPHAR, N ), tc.ALPHAR, 1e-12, 'ALPHAR' );
	assertArrayClose( extractArray( ALPHAI, N ), tc.ALPHAI, 1e-12, 'ALPHAI' );
	assertArrayClose( extractArray( BETA, N ), tc.BETA, 1e-12, 'BETA' );
});

test( 'dhgeqz: eig only neg T diagonal 4x4', function t() {
	const ALPHAR = new Float64Array( 4 );
	const ALPHAI = new Float64Array( 4 );
	const BETA = new Float64Array( 4 );
	const WORK = new Float64Array( 40 );
	const Q = new Float64Array( 16 );
	const Z = new Float64Array( 16 );
	const tc = findCase( 'eig only neg T diagonal 4x4' );
	const N = 4;

	const H = new Float64Array([
		2.0, 1.0, 0.5, 0.2,
		1.0, 3.0, 1.0, 0.3,
		0.0, 0.5, 1.0, 0.5,
		0.0, 0.0, 0.3, 4.0
	]);

	const T = new Float64Array([
		-1.0, 0.5, 0.2, 0.1,
		0.0, 2.0, 0.3, 0.15,
		0.0, 0.0, -1.5, 0.4,
		0.0, 0.0, 0.0, 1.0
	]);

	const info = dhgeqz( 'eigenvalues', 'none', 'none', N, 0, N - 1,
		H, N, 1, 0,
		T, N, 1, 0,
		ALPHAR, 1, 0,
		ALPHAI, 1, 0,
		BETA, 1, 0,
		Q, N, 1, 0,
		Z, N, 1, 0,
		WORK, 1, 0 );

	assert.equal( info, 0, 'info should be 0' );
	assertArrayClose( extractArray( ALPHAR, N ), tc.ALPHAR, 1e-12, 'ALPHAR' );
	assertArrayClose( extractArray( ALPHAI, N ), tc.ALPHAI, 1e-12, 'ALPHAI' );
	assertArrayClose( extractArray( BETA, N ), tc.BETA, 1e-12, 'BETA' );
});

test( 'dhgeqz: eig only complex 3x3', function t() {
	const ALPHAR = new Float64Array( 3 );
	const ALPHAI = new Float64Array( 3 );
	const BETA = new Float64Array( 3 );
	const WORK = new Float64Array( 30 );
	const Q = new Float64Array( 9 );
	const Z = new Float64Array( 9 );
	const tc = findCase( 'eig only complex 3x3' );
	const N = 3;

	const H = new Float64Array([
		1.0, 0.5, 0.3,
		4.0, 1.0, 0.5,
		0.0, 3.0, 1.0
	]);

	const T = new Float64Array([
		1.0, 0.1, 0.05,
		0.0, 1.0, 0.1,
		0.0, 0.0, 1.0
	]);

	const info = dhgeqz( 'eigenvalues', 'none', 'none', N, 0, N - 1,
		H, N, 1, 0,
		T, N, 1, 0,
		ALPHAR, 1, 0,
		ALPHAI, 1, 0,
		BETA, 1, 0,
		Q, N, 1, 0,
		Z, N, 1, 0,
		WORK, 1, 0 );

	assert.equal( info, 0, 'info should be 0' );
	assertArrayClose( extractArray( ALPHAR, N ), tc.ALPHAR, 1e-12, 'ALPHAR' );
	assertArrayClose( extractArray( ALPHAI, N ), tc.ALPHAI, 1e-12, 'ALPHAI' );
	assertArrayClose( extractArray( BETA, N ), tc.BETA, 1e-12, 'BETA' );
});

test( 'dhgeqz: schur neg T below and above', function t() {
	const ALPHAR = new Float64Array( 4 );
	const ALPHAI = new Float64Array( 4 );
	const BETA = new Float64Array( 4 );
	const WORK = new Float64Array( 40 );
	const Q = new Float64Array( 16 );
	const Z = new Float64Array( 16 );
	const tc = findCase( 'schur neg T below and above' );
	const N = 4;

	const H = new Float64Array([
		5.0, 1.0, 0.5, 0.2,
		0.0, 3.0, 2.0, 0.5,
		0.0, 1.5, 1.0, 0.3,
		0.0, 0.0, 0.0, 7.0
	]);

	const T = new Float64Array([
		-2.0, 0.3, 0.1, 0.05,
		0.0, 1.0, 0.4, 0.15,
		0.0, 0.0, 3.0, 0.2,
		0.0, 0.0, 0.0, -1.0
	]);

	// ILO=1, IHI=2 (0-based)
	const info = dhgeqz( 'schur', 'initialize', 'initialize', N, 1, 2,
		H, N, 1, 0,
		T, N, 1, 0,
		ALPHAR, 1, 0,
		ALPHAI, 1, 0,
		BETA, 1, 0,
		Q, N, 1, 0,
		Z, N, 1, 0,
		WORK, 1, 0 );

	assert.equal( info, 0, 'info should be 0' );
	assertArrayClose( extractArray( ALPHAR, N ), tc.ALPHAR, 1e-12, 'ALPHAR' );
	assertArrayClose( extractArray( ALPHAI, N ), tc.ALPHAI, 1e-12, 'ALPHAI' );
	assertArrayClose( extractArray( BETA, N ), tc.BETA, 1e-12, 'BETA' );
});

test( 'dhgeqz: schur 8x8 complex double shift', function t() {
	const ALPHAR = new Float64Array( 8 );
	const ALPHAI = new Float64Array( 8 );
	const BETA = new Float64Array( 8 );
	const WORK = new Float64Array( 80 );
	const Q = new Float64Array( 64 );
	const Z = new Float64Array( 64 );
	const tc = findCase( 'schur 8x8 complex double shift' );
	const N = 8;
	let i;

	const H = new Float64Array([
		1.0, 2.0, 0.3, 0.1, 0.05, 0.02, 0.01, 0.005,
		3.0, 1.0, 1.0, 0.2, 0.1, 0.05, 0.02, 0.01,
		0.0, 4.0, 1.0, 0.8, 0.2, 0.1, 0.05, 0.02,
		0.0, 0.0, 3.5, 1.0, 0.9, 0.3, 0.1, 0.05,
		0.0, 0.0, 0.0, 3.0, 1.0, 0.7, 0.2, 0.1,
		0.0, 0.0, 0.0, 0.0, 2.5, 1.0, 0.6, 0.2,
		0.0, 0.0, 0.0, 0.0, 0.0, 2.0, 1.0, 0.5,
		0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 1.5, 1.0
	]);

	const T = new Float64Array( N * N );
	for ( i = 0; i < N; i++ ) {
		T[ ( i * N ) + i ] = 1.0;
	}
	T[ ( 0 * N ) + 1 ] = 0.1; T[ ( 0 * N ) + 2 ] = 0.05;
	T[ ( 1 * N ) + 2 ] = 0.1; T[ ( 1 * N ) + 3 ] = 0.05;
	T[ ( 2 * N ) + 3 ] = 0.1; T[ ( 2 * N ) + 4 ] = 0.05;
	T[ ( 3 * N ) + 4 ] = 0.1; T[ ( 3 * N ) + 5 ] = 0.05;
	T[ ( 4 * N ) + 5 ] = 0.1; T[ ( 4 * N ) + 6 ] = 0.05;
	T[ ( 5 * N ) + 6 ] = 0.1; T[ ( 5 * N ) + 7 ] = 0.05;
	T[ ( 6 * N ) + 7 ] = 0.1;

	const info = dhgeqz( 'schur', 'initialize', 'initialize', N, 0, N - 1,
		H, N, 1, 0,
		T, N, 1, 0,
		ALPHAR, 1, 0,
		ALPHAI, 1, 0,
		BETA, 1, 0,
		Q, N, 1, 0,
		Z, N, 1, 0,
		WORK, 1, 0 );

	assert.equal( info, 0, 'info should be 0' );
	assertArrayClose( extractArray( ALPHAR, N ), tc.ALPHAR, 1e-12, 'ALPHAR' );
	assertArrayClose( extractArray( ALPHAI, N ), tc.ALPHAI, 1e-12, 'ALPHAI' );
	assertArrayClose( extractArray( BETA, N ), tc.BETA, 1e-12, 'BETA' );
});

test( 'dhgeqz: near zero T diag 3x3', function t() {
	const ALPHAR = new Float64Array( 3 );
	const ALPHAI = new Float64Array( 3 );
	const BETA = new Float64Array( 3 );
	const WORK = new Float64Array( 30 );
	const Q = new Float64Array( 9 );
	const Z = new Float64Array( 9 );
	const tc = findCase( 'near zero T diag 3x3' );
	const N = 3;

	const H = new Float64Array([
		2.0, 1.0, 0.5,
		1.0, 3.0, 0.8,
		0.0, 0.5, 1.5
	]);

	const T = new Float64Array([
		1.0, 0.2, 0.1,
		0.0, 1.0, 0.3,
		0.0, 0.0, 1.0e-20
	]);

	const info = dhgeqz( 'schur', 'initialize', 'initialize', N, 0, N - 1,
		H, N, 1, 0,
		T, N, 1, 0,
		ALPHAR, 1, 0,
		ALPHAI, 1, 0,
		BETA, 1, 0,
		Q, N, 1, 0,
		Z, N, 1, 0,
		WORK, 1, 0 );

	assert.equal( info, 0, 'info should be 0' );
	assertArrayClose( extractArray( ALPHAR, N ), tc.ALPHAR, 1e-12, 'ALPHAR' );
	assertArrayClose( extractArray( ALPHAI, N ), tc.ALPHAI, 1e-12, 'ALPHAI' );
	assertArrayClose( extractArray( BETA, N ), tc.BETA, 1e-12, 'BETA' );
});

test( 'dhgeqz: eig only near zero T diag 3x3', function t() {
	const ALPHAR = new Float64Array( 3 );
	const ALPHAI = new Float64Array( 3 );
	const BETA = new Float64Array( 3 );
	const WORK = new Float64Array( 30 );
	const Q = new Float64Array( 9 );
	const Z = new Float64Array( 9 );
	const tc = findCase( 'eig only near zero T diag 3x3' );
	const N = 3;

	const H = new Float64Array([
		2.0, 1.0, 0.5,
		1.0, 3.0, 0.8,
		0.0, 0.5, 1.5
	]);

	const T = new Float64Array([
		1.0, 0.2, 0.1,
		0.0, 1.0, 0.3,
		0.0, 0.0, 1.0e-20
	]);

	const info = dhgeqz( 'eigenvalues', 'none', 'none', N, 0, N - 1,
		H, N, 1, 0,
		T, N, 1, 0,
		ALPHAR, 1, 0,
		ALPHAI, 1, 0,
		BETA, 1, 0,
		Q, N, 1, 0,
		Z, N, 1, 0,
		WORK, 1, 0 );

	assert.equal( info, 0, 'info should be 0' );
	assertArrayClose( extractArray( ALPHAR, N ), tc.ALPHAR, 1e-12, 'ALPHAR' );
	assertArrayClose( extractArray( ALPHAI, N ), tc.ALPHAI, 1e-12, 'ALPHAI' );
	assertArrayClose( extractArray( BETA, N ), tc.BETA, 1e-12, 'BETA' );
});

test( 'dhgeqz: zero T diag middle 4x4', function t() {
	const ALPHAR = new Float64Array( 4 );
	const ALPHAI = new Float64Array( 4 );
	const BETA = new Float64Array( 4 );
	const WORK = new Float64Array( 40 );
	const Q = new Float64Array( 16 );
	const Z = new Float64Array( 16 );
	const tc = findCase( 'zero T diag middle 4x4' );
	const N = 4;

	const H = new Float64Array([
		2.0, 1.0, 0.5, 0.2,
		1.5, 3.0, 1.0, 0.3,
		0.0, 0.5, 4.0, 0.5,
		0.0, 0.0, 0.3, 1.0
	]);

	const T = new Float64Array([
		1.0, 0.2, 0.1, 0.05,
		0.0, 1.0e-20, 0.3, 0.1,
		0.0, 0.0, 2.0, 0.2,
		0.0, 0.0, 0.0, 1.5
	]);

	const info = dhgeqz( 'schur', 'initialize', 'initialize', N, 0, N - 1,
		H, N, 1, 0,
		T, N, 1, 0,
		ALPHAR, 1, 0,
		ALPHAI, 1, 0,
		BETA, 1, 0,
		Q, N, 1, 0,
		Z, N, 1, 0,
		WORK, 1, 0 );

	assert.equal( info, 0, 'info should be 0' );
	assertArrayClose( extractArray( ALPHAR, N ), tc.ALPHAR, 1e-12, 'ALPHAR' );
	assertArrayClose( extractArray( ALPHAI, N ), tc.ALPHAI, 1e-12, 'ALPHAI' );
	assertArrayClose( extractArray( BETA, N ), tc.BETA, 1e-12, 'BETA' );
});

test( 'dhgeqz: eig only zero T diag middle 4x4', function t() {
	const ALPHAR = new Float64Array( 4 );
	const ALPHAI = new Float64Array( 4 );
	const BETA = new Float64Array( 4 );
	const WORK = new Float64Array( 40 );
	const Q = new Float64Array( 16 );
	const Z = new Float64Array( 16 );
	const tc = findCase( 'eig only zero T diag middle 4x4' );
	const N = 4;

	const H = new Float64Array([
		2.0, 1.0, 0.5, 0.2,
		1.5, 3.0, 1.0, 0.3,
		0.0, 0.5, 4.0, 0.5,
		0.0, 0.0, 0.3, 1.0
	]);

	const T = new Float64Array([
		1.0, 0.2, 0.1, 0.05,
		0.0, 1.0e-20, 0.3, 0.1,
		0.0, 0.0, 2.0, 0.2,
		0.0, 0.0, 0.0, 1.5
	]);

	const info = dhgeqz( 'eigenvalues', 'none', 'none', N, 0, N - 1,
		H, N, 1, 0,
		T, N, 1, 0,
		ALPHAR, 1, 0,
		ALPHAI, 1, 0,
		BETA, 1, 0,
		Q, N, 1, 0,
		Z, N, 1, 0,
		WORK, 1, 0 );

	assert.equal( info, 0, 'info should be 0' );
	assertArrayClose( extractArray( ALPHAR, N ), tc.ALPHAR, 1e-12, 'ALPHAR' );
	assertArrayClose( extractArray( ALPHAI, N ), tc.ALPHAI, 1e-12, 'ALPHAI' );
	assertArrayClose( extractArray( BETA, N ), tc.BETA, 1e-12, 'BETA' );
});

test( 'dhgeqz: two zero T diag 4x4', function t() {
	const ALPHAR = new Float64Array( 4 );
	const ALPHAI = new Float64Array( 4 );
	const BETA = new Float64Array( 4 );
	const WORK = new Float64Array( 40 );
	const Q = new Float64Array( 16 );
	const Z = new Float64Array( 16 );
	const tc = findCase( 'two zero T diag 4x4' );
	const N = 4;

	const H = new Float64Array([
		2.0, 1.0, 0.5, 0.2,
		1.5, 3.0, 1.0, 0.3,
		0.0, 0.5, 4.0, 0.8,
		0.0, 0.0, 0.3, 1.0
	]);

	const T = new Float64Array([
		1.0, 0.2, 0.1, 0.05,
		0.0, 1.0e-20, 0.0, 0.0,
		0.0, 0.0, 1.0e-20, 0.0,
		0.0, 0.0, 0.0, 1.5
	]);

	const info = dhgeqz( 'schur', 'initialize', 'initialize', N, 0, N - 1,
		H, N, 1, 0,
		T, N, 1, 0,
		ALPHAR, 1, 0,
		ALPHAI, 1, 0,
		BETA, 1, 0,
		Q, N, 1, 0,
		Z, N, 1, 0,
		WORK, 1, 0 );

	assert.equal( info, 0, 'info should be 0' );
	assertArrayClose( extractArray( ALPHAR, N ), tc.ALPHAR, 1e-12, 'ALPHAR' );
	assertArrayClose( extractArray( ALPHAI, N ), tc.ALPHAI, 1e-12, 'ALPHAI' );
	assertArrayClose( extractArray( BETA, N ), tc.BETA, 1e-12, 'BETA' );
});

test( 'dhgeqz: eig only 4x4 complex pairs', function t() {
	const ALPHAR = new Float64Array( 4 );
	const ALPHAI = new Float64Array( 4 );
	const BETA = new Float64Array( 4 );
	const WORK = new Float64Array( 40 );
	const Q = new Float64Array( 16 );
	const Z = new Float64Array( 16 );
	const tc = findCase( 'eig only 4x4 complex pairs' );
	const N = 4;

	const H = new Float64Array([
		1.0, 0.5, 0.3, 0.1,
		4.0, 1.0, 0.5, 0.2,
		0.0, 3.0, 1.0, 0.4,
		0.0, 0.0, 2.5, 1.0
	]);

	const T = new Float64Array([
		1.0, 0.1, 0.05, 0.02,
		0.0, 1.0, 0.1, 0.05,
		0.0, 0.0, 1.0, 0.1,
		0.0, 0.0, 0.0, 1.0
	]);

	const info = dhgeqz( 'eigenvalues', 'none', 'none', N, 0, N - 1,
		H, N, 1, 0,
		T, N, 1, 0,
		ALPHAR, 1, 0,
		ALPHAI, 1, 0,
		BETA, 1, 0,
		Q, N, 1, 0,
		Z, N, 1, 0,
		WORK, 1, 0 );

	assert.equal( info, 0, 'info should be 0' );
	assertArrayClose( extractArray( ALPHAR, N ), tc.ALPHAR, 1e-12, 'ALPHAR' );
	assertArrayClose( extractArray( ALPHAI, N ), tc.ALPHAI, 1e-12, 'ALPHAI' );
	assertArrayClose( extractArray( BETA, N ), tc.BETA, 1e-12, 'BETA' );
});

test( 'dhgeqz: schur 4x4 complex pairs', function t() {
	const ALPHAR = new Float64Array( 4 );
	const ALPHAI = new Float64Array( 4 );
	const BETA = new Float64Array( 4 );
	const WORK = new Float64Array( 40 );
	const Q = new Float64Array( 16 );
	const Z = new Float64Array( 16 );
	const tc = findCase( 'schur 4x4 complex pairs' );
	const N = 4;

	const H = new Float64Array([
		1.0, 0.5, 0.3, 0.1,
		4.0, 1.0, 0.5, 0.2,
		0.0, 3.0, 1.0, 0.4,
		0.0, 0.0, 2.5, 1.0
	]);

	const T = new Float64Array([
		1.0, 0.1, 0.05, 0.02,
		0.0, 1.0, 0.1, 0.05,
		0.0, 0.0, 1.0, 0.1,
		0.0, 0.0, 0.0, 1.0
	]);

	const info = dhgeqz( 'schur', 'initialize', 'initialize', N, 0, N - 1,
		H, N, 1, 0,
		T, N, 1, 0,
		ALPHAR, 1, 0,
		ALPHAI, 1, 0,
		BETA, 1, 0,
		Q, N, 1, 0,
		Z, N, 1, 0,
		WORK, 1, 0 );

	assert.equal( info, 0, 'info should be 0' );
	assertArrayClose( extractArray( ALPHAR, N ), tc.ALPHAR, 1e-12, 'ALPHAR' );
	assertArrayClose( extractArray( ALPHAI, N ), tc.ALPHAI, 1e-12, 'ALPHAI' );
	assertArrayClose( extractArray( BETA, N ), tc.BETA, 1e-12, 'BETA' );
});

test( 'dhgeqz: schur 2x2 complex eigs', function t() {
	const ALPHAR = new Float64Array( 2 );
	const ALPHAI = new Float64Array( 2 );
	const BETA = new Float64Array( 2 );
	const WORK = new Float64Array( 20 );
	const Q = new Float64Array( 4 );
	const Z = new Float64Array( 4 );
	const tc = findCase( 'schur 2x2 complex eigs' );
	const N = 2;

	const H = new Float64Array([
		0.0, -1.0,
		1.0, 0.0
	]);

	const T = new Float64Array([
		1.0, 0.0,
		0.0, 1.0
	]);

	const info = dhgeqz( 'schur', 'initialize', 'initialize', N, 0, N - 1,
		H, N, 1, 0,
		T, N, 1, 0,
		ALPHAR, 1, 0,
		ALPHAI, 1, 0,
		BETA, 1, 0,
		Q, N, 1, 0,
		Z, N, 1, 0,
		WORK, 1, 0 );

	assert.equal( info, 0, 'info should be 0' );
	assertArrayClose( extractArray( ALPHAR, N ), tc.ALPHAR, 1e-12, 'ALPHAR' );
	assertArrayClose( extractArray( ALPHAI, N ), tc.ALPHAI, 1e-12, 'ALPHAI' );
	assertArrayClose( extractArray( BETA, N ), tc.BETA, 1e-12, 'BETA' );
});

test( 'dhgeqz: eig only 2x2 complex eigs', function t() {
	const ALPHAR = new Float64Array( 2 );
	const ALPHAI = new Float64Array( 2 );
	const BETA = new Float64Array( 2 );
	const WORK = new Float64Array( 20 );
	const Q = new Float64Array( 4 );
	const Z = new Float64Array( 4 );
	const tc = findCase( 'eig only 2x2 complex eigs' );
	const N = 2;

	const H = new Float64Array([
		0.0, -1.0,
		1.0, 0.0
	]);

	const T = new Float64Array([
		1.0, 0.0,
		0.0, 1.0
	]);

	const info = dhgeqz( 'eigenvalues', 'none', 'none', N, 0, N - 1,
		H, N, 1, 0,
		T, N, 1, 0,
		ALPHAR, 1, 0,
		ALPHAI, 1, 0,
		BETA, 1, 0,
		Q, N, 1, 0,
		Z, N, 1, 0,
		WORK, 1, 0 );

	assert.equal( info, 0, 'info should be 0' );
	assertArrayClose( extractArray( ALPHAR, N ), tc.ALPHAR, 1e-12, 'ALPHAR' );
	assertArrayClose( extractArray( ALPHAI, N ), tc.ALPHAI, 1e-12, 'ALPHAI' );
	assertArrayClose( extractArray( BETA, N ), tc.BETA, 1e-12, 'BETA' );
});

test( 'dhgeqz: eig only 3x3 double shift', function t() {
	const ALPHAR = new Float64Array( 3 );
	const ALPHAI = new Float64Array( 3 );
	const BETA = new Float64Array( 3 );
	const WORK = new Float64Array( 30 );
	const Q = new Float64Array( 9 );
	const Z = new Float64Array( 9 );
	const tc = findCase( 'eig only 3x3 double shift' );
	const N = 3;

	const H = new Float64Array([
		0.0, -1.0, 0.5,
		1.0, 0.0, 0.3,
		0.0, 1.0, 2.0
	]);

	const T = new Float64Array([
		1.0, 0.0, 0.0,
		0.0, 1.0, 0.0,
		0.0, 0.0, 1.0
	]);

	const info = dhgeqz( 'eigenvalues', 'none', 'none', N, 0, N - 1,
		H, N, 1, 0,
		T, N, 1, 0,
		ALPHAR, 1, 0,
		ALPHAI, 1, 0,
		BETA, 1, 0,
		Q, N, 1, 0,
		Z, N, 1, 0,
		WORK, 1, 0 );

	assert.equal( info, 0, 'info should be 0' );
	assertArrayClose( extractArray( ALPHAR, N ), tc.ALPHAR, 1e-12, 'ALPHAR' );
	assertArrayClose( extractArray( ALPHAI, N ), tc.ALPHAI, 1e-12, 'ALPHAI' );
	assertArrayClose( extractArray( BETA, N ), tc.BETA, 1e-12, 'BETA' );
});

test( 'dhgeqz: schur 3x3 double shift', function t() {
	const ALPHAR = new Float64Array( 3 );
	const ALPHAI = new Float64Array( 3 );
	const BETA = new Float64Array( 3 );
	const WORK = new Float64Array( 30 );
	const Q = new Float64Array( 9 );
	const Z = new Float64Array( 9 );
	const tc = findCase( 'schur 3x3 double shift' );
	const N = 3;

	const H = new Float64Array([
		0.0, -1.0, 0.5,
		1.0, 0.0, 0.3,
		0.0, 1.0, 2.0
	]);

	const T = new Float64Array([
		1.0, 0.0, 0.0,
		0.0, 1.0, 0.0,
		0.0, 0.0, 1.0
	]);

	const info = dhgeqz( 'schur', 'initialize', 'initialize', N, 0, N - 1,
		H, N, 1, 0,
		T, N, 1, 0,
		ALPHAR, 1, 0,
		ALPHAI, 1, 0,
		BETA, 1, 0,
		Q, N, 1, 0,
		Z, N, 1, 0,
		WORK, 1, 0 );

	assert.equal( info, 0, 'info should be 0' );
	assertArrayClose( extractArray( ALPHAR, N ), tc.ALPHAR, 1e-12, 'ALPHAR' );
	assertArrayClose( extractArray( ALPHAI, N ), tc.ALPHAI, 1e-12, 'ALPHAI' );
	assertArrayClose( extractArray( BETA, N ), tc.BETA, 1e-12, 'BETA' );
});

test( 'dhgeqz: subrange with below and above 4x4', function t() {
	const ALPHAR = new Float64Array( 4 );
	const ALPHAI = new Float64Array( 4 );
	const BETA = new Float64Array( 4 );
	const WORK = new Float64Array( 40 );
	const Q = new Float64Array( 16 );
	const Z = new Float64Array( 16 );
	const tc = findCase( 'subrange with below and above 4x4' );
	const N = 4;

	const H = new Float64Array([
		5.0, 1.0, 0.5, 0.2,
		0.0, 3.0, 2.0, 0.5,
		0.0, 1.5, 1.0, 0.3,
		0.0, 0.0, 0.0, 7.0
	]);

	const T = new Float64Array([
		2.0, 0.3, 0.1, 0.05,
		0.0, 1.0, 0.4, 0.15,
		0.0, 0.0, 3.0, 0.2,
		0.0, 0.0, 0.0, -1.0
	]);

	const info = dhgeqz( 'schur', 'initialize', 'initialize', N, 1, 2,
		H, N, 1, 0,
		T, N, 1, 0,
		ALPHAR, 1, 0,
		ALPHAI, 1, 0,
		BETA, 1, 0,
		Q, N, 1, 0,
		Z, N, 1, 0,
		WORK, 1, 0 );

	assert.equal( info, 0, 'info should be 0' );
	assertArrayClose( extractArray( ALPHAR, N ), tc.ALPHAR, 1e-12, 'ALPHAR' );
	assertArrayClose( extractArray( ALPHAI, N ), tc.ALPHAI, 1e-12, 'ALPHAI' );
	assertArrayClose( extractArray( BETA, N ), tc.BETA, 1e-12, 'BETA' );
});
