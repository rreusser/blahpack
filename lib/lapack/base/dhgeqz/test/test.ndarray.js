
/* eslint-disable max-len, function-call-argument-newline, function-paren-newline, array-element-newline, no-restricted-syntax, no-new-wrappers, no-unused-vars, stdlib/first-unit-test, max-statements-per-line, require-jsdoc, valid-jsdoc, stdlib/vars-order, vars-on-top, one-var-declaration-per-line, one-var */

// MODULES //

import { readFileSync } from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dhgeqz from './../lib/ndarray.js';


// FIXTURES //

var fixtureDir = path.join( import.meta.dirname, '..', '..', '..', '..', '..', 'test', 'fixtures' );
var lines = readFileSync( path.join( fixtureDir, 'dhgeqz.jsonl' ), 'utf8' ).trim().split( '\n' );
var fixture = lines.map( function parse( line ) { return JSON.parse( line ); } );


// FUNCTIONS //

function findCase( name ) {
	return fixture.find( function find( t ) { return t.name === name; } );
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

/**
* Flattens a column-major Fortran matrix (given as array of arrays or flat array) into a row-major Float64Array.
* Fortran outputs from fixtures are stored column-major.
*/
function colMajorToFloat64( mat, m, n ) {
	var out = new Float64Array( m * n );
	var i;
	var j;
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
	var out = [];
	var i;
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
	var ALPHAR = new Float64Array( 4 );
	var ALPHAI = new Float64Array( 4 );
	var BETA = new Float64Array( 4 );
	var WORK = new Float64Array( 40 );
	var Q = new Float64Array( 16 );
	var Z = new Float64Array( 16 );
	var tc = findCase( 'eigenvalues only 4x4' );
	var info;
	var N = 4;

	// Upper Hessenberg H (row-major)
	var H = new Float64Array([
		2.0, 3.0, 1.0, 0.5,
		1.5, 4.0, 2.0, 1.0,
		0.0, 1.0, 3.0, 1.5,
		0.0, 0.0, 0.8, 1.0
	]);

	// Upper triangular T (row-major)
	var T = new Float64Array([
		1.0, 0.5, 0.2, 0.1,
		0.0, 2.0, 0.3, 0.15,
		0.0, 0.0, 1.5, 0.4,
		0.0, 0.0, 0.0, 1.0
	]);

	info = dhgeqz( 'eigenvalues', 'none', 'none', N, 0, N - 1,
		H, N, 1, 0,
		T, N, 1, 0,
		ALPHAR, 1, 0,
		ALPHAI, 1, 0,
		BETA, 1, 0,
		Q, N, 1, 0,
		Z, N, 1, 0,
		WORK, 1, 0, N );

	assert.equal( info, 0, 'info should be 0' );
	assertArrayClose( extractArray( ALPHAR, N ), tc.ALPHAR, 1e-12, 'ALPHAR' );
	assertArrayClose( extractArray( ALPHAI, N ), tc.ALPHAI, 1e-12, 'ALPHAI' );
	assertArrayClose( extractArray( BETA, N ), tc.BETA, 1e-12, 'BETA' );
});

test( 'dhgeqz: schur form 4x4 init', function t() {
	var ALPHAR = new Float64Array( 4 );
	var ALPHAI = new Float64Array( 4 );
	var BETA = new Float64Array( 4 );
	var WORK = new Float64Array( 40 );
	var Q = new Float64Array( 16 );
	var Z = new Float64Array( 16 );
	var tc = findCase( 'schur form 4x4 init' );
	var info;
	var N = 4;

	var H = new Float64Array([
		2.0, 3.0, 1.0, 0.5,
		1.5, 4.0, 2.0, 1.0,
		0.0, 1.0, 3.0, 1.5,
		0.0, 0.0, 0.8, 1.0
	]);

	var T = new Float64Array([
		1.0, 0.5, 0.2, 0.1,
		0.0, 2.0, 0.3, 0.15,
		0.0, 0.0, 1.5, 0.4,
		0.0, 0.0, 0.0, 1.0
	]);

	info = dhgeqz( 'schur', 'initialize', 'initialize', N, 0, N - 1,
		H, N, 1, 0,
		T, N, 1, 0,
		ALPHAR, 1, 0,
		ALPHAI, 1, 0,
		BETA, 1, 0,
		Q, N, 1, 0,
		Z, N, 1, 0,
		WORK, 1, 0, N );

	assert.equal( info, 0, 'info should be 0' );
	assertArrayClose( extractArray( ALPHAR, N ), tc.ALPHAR, 1e-12, 'ALPHAR' );
	assertArrayClose( extractArray( ALPHAI, N ), tc.ALPHAI, 1e-12, 'ALPHAI' );
	assertArrayClose( extractArray( BETA, N ), tc.BETA, 1e-12, 'BETA' );

	// Check that H and T are in Schur form via fixture comparison
	var expectedH = colMajorToFloat64( tc.H, N, N );
	var expectedT = colMajorToFloat64( tc.TT, N, N );
	assertArrayClose( extractArray( H, N * N ), extractArray( expectedH, N * N ), 1e-12, 'H' );
	assertArrayClose( extractArray( T, N * N ), extractArray( expectedT, N * N ), 1e-12, 'T' );
});

test( 'dhgeqz: eigenvalues subrange 3x3', function t() {
	var ALPHAR = new Float64Array( 3 );
	var ALPHAI = new Float64Array( 3 );
	var BETA = new Float64Array( 3 );
	var WORK = new Float64Array( 30 );
	var Q = new Float64Array( 9 );
	var Z = new Float64Array( 9 );
	var tc = findCase( 'eigenvalues subrange 3x3' );
	var info;
	var N = 3;

	// Row-major
	var H = new Float64Array([
		5.0, 1.0, 0.5,
		0.0, 3.0, 2.0,
		0.0, 1.5, 1.0
	]);

	var T = new Float64Array([
		2.0, 0.3, 0.1,
		0.0, 1.0, 0.4,
		0.0, 0.0, 3.0
	]);

	// ILO=1 (0-based), IHI=2 (0-based) — active subrange is indices 1..2
	info = dhgeqz( 'eigenvalues', 'none', 'none', N, 1, 2,
		H, N, 1, 0,
		T, N, 1, 0,
		ALPHAR, 1, 0,
		ALPHAI, 1, 0,
		BETA, 1, 0,
		Q, N, 1, 0,
		Z, N, 1, 0,
		WORK, 1, 0, N );

	assert.equal( info, 0, 'info should be 0' );
	assertArrayClose( extractArray( ALPHAR, N ), tc.ALPHAR, 1e-12, 'ALPHAR' );
	assertArrayClose( extractArray( ALPHAI, N ), tc.ALPHAI, 1e-12, 'ALPHAI' );
	assertArrayClose( extractArray( BETA, N ), tc.BETA, 1e-12, 'BETA' );
});

test( 'dhgeqz: schur subrange 3x3', function t() {
	var ALPHAR = new Float64Array( 3 );
	var ALPHAI = new Float64Array( 3 );
	var BETA = new Float64Array( 3 );
	var WORK = new Float64Array( 30 );
	var Q = new Float64Array( 9 );
	var Z = new Float64Array( 9 );
	var tc = findCase( 'schur subrange 3x3' );
	var info;
	var N = 3;

	var H = new Float64Array([
		5.0, 1.0, 0.5,
		0.0, 3.0, 2.0,
		0.0, 1.5, 1.0
	]);

	var T = new Float64Array([
		2.0, 0.3, 0.1,
		0.0, 1.0, 0.4,
		0.0, 0.0, 3.0
	]);

	info = dhgeqz( 'schur', 'initialize', 'initialize', N, 1, 2,
		H, N, 1, 0,
		T, N, 1, 0,
		ALPHAR, 1, 0,
		ALPHAI, 1, 0,
		BETA, 1, 0,
		Q, N, 1, 0,
		Z, N, 1, 0,
		WORK, 1, 0, N );

	assert.equal( info, 0, 'info should be 0' );
	assertArrayClose( extractArray( ALPHAR, N ), tc.ALPHAR, 1e-12, 'ALPHAR' );
	assertArrayClose( extractArray( ALPHAI, N ), tc.ALPHAI, 1e-12, 'ALPHAI' );
	assertArrayClose( extractArray( BETA, N ), tc.BETA, 1e-12, 'BETA' );

	var expectedH = colMajorToFloat64( tc.H, N, N );
	var expectedT = colMajorToFloat64( tc.TT, N, N );
	assertArrayClose( extractArray( H, N * N ), extractArray( expectedH, N * N ), 1e-12, 'H' );
	assertArrayClose( extractArray( T, N * N ), extractArray( expectedT, N * N ), 1e-12, 'T' );
});

test( 'dhgeqz: schur 5x5 complex eigs', function t() {
	var ALPHAR = new Float64Array( 5 );
	var ALPHAI = new Float64Array( 5 );
	var BETA = new Float64Array( 5 );
	var WORK = new Float64Array( 50 );
	var Q = new Float64Array( 25 );
	var Z = new Float64Array( 25 );
	var tc = findCase( 'schur 5x5 complex eigs' );
	var info;
	var N = 5;

	var H = new Float64Array([
		0.5, 1.0, 0.3, 0.1, 0.2,
		2.0, 0.5, 0.5, 0.2, 0.1,
		0.0, 3.0, 0.5, 0.4, 0.3,
		0.0, 0.0, 2.5, 0.5, 0.5,
		0.0, 0.0, 0.0, 2.0, 0.5
	]);

	var T = new Float64Array([
		1.0, 0.1, 0.05, 0.02, 0.01,
		0.0, 1.0, 0.1, 0.05, 0.02,
		0.0, 0.0, 1.0, 0.1, 0.05,
		0.0, 0.0, 0.0, 1.0, 0.1,
		0.0, 0.0, 0.0, 0.0, 1.0
	]);

	info = dhgeqz( 'schur', 'initialize', 'initialize', N, 0, N - 1,
		H, N, 1, 0,
		T, N, 1, 0,
		ALPHAR, 1, 0,
		ALPHAI, 1, 0,
		BETA, 1, 0,
		Q, N, 1, 0,
		Z, N, 1, 0,
		WORK, 1, 0, N );

	assert.equal( info, 0, 'info should be 0' );
	assertArrayClose( extractArray( ALPHAR, N ), tc.ALPHAR, 1e-12, 'ALPHAR' );
	assertArrayClose( extractArray( ALPHAI, N ), tc.ALPHAI, 1e-12, 'ALPHAI' );
	assertArrayClose( extractArray( BETA, N ), tc.BETA, 1e-12, 'BETA' );
});

test( 'dhgeqz: eigenvalues 2x2', function t() {
	var ALPHAR = new Float64Array( 2 );
	var ALPHAI = new Float64Array( 2 );
	var BETA = new Float64Array( 2 );
	var WORK = new Float64Array( 20 );
	var Q = new Float64Array( 4 );
	var Z = new Float64Array( 4 );
	var tc = findCase( 'eigenvalues 2x2' );
	var info;
	var N = 2;

	var H = new Float64Array([
		1.0, 2.0,
		3.0, 4.0
	]);

	var T = new Float64Array([
		1.0, 0.5,
		0.0, 2.0
	]);

	info = dhgeqz( 'eigenvalues', 'none', 'none', N, 0, N - 1,
		H, N, 1, 0,
		T, N, 1, 0,
		ALPHAR, 1, 0,
		ALPHAI, 1, 0,
		BETA, 1, 0,
		Q, N, 1, 0,
		Z, N, 1, 0,
		WORK, 1, 0, N );

	assert.equal( info, 0, 'info should be 0' );
	assertArrayClose( extractArray( ALPHAR, N ), tc.ALPHAR, 1e-12, 'ALPHAR' );
	assertArrayClose( extractArray( ALPHAI, N ), tc.ALPHAI, 1e-12, 'ALPHAI' );
	assertArrayClose( extractArray( BETA, N ), tc.BETA, 1e-12, 'BETA' );
});

test( 'dhgeqz: schur 4x4 update (V mode)', function t() {
	var ALPHAR = new Float64Array( 4 );
	var ALPHAI = new Float64Array( 4 );
	var BETA = new Float64Array( 4 );
	var WORK = new Float64Array( 40 );
	var tc = findCase( 'schur 4x4 update' );
	var info;
	var N = 4;
	var i;

	var H = new Float64Array([
		2.0, 3.0, 1.0, 0.5,
		1.5, 4.0, 2.0, 1.0,
		0.0, 1.0, 3.0, 1.5,
		0.0, 0.0, 0.8, 1.0
	]);

	var T = new Float64Array([
		1.0, 0.5, 0.2, 0.1,
		0.0, 2.0, 0.3, 0.15,
		0.0, 0.0, 1.5, 0.4,
		0.0, 0.0, 0.0, 1.0
	]);

	// Start Q and Z as identity
	var Q = new Float64Array( 16 );
	var Z = new Float64Array( 16 );
	for ( i = 0; i < N; i++ ) {
		Q[ ( i * N ) + i ] = 1.0;
		Z[ ( i * N ) + i ] = 1.0;
	}

	info = dhgeqz( 'schur', 'update', 'update', N, 0, N - 1,
		H, N, 1, 0,
		T, N, 1, 0,
		ALPHAR, 1, 0,
		ALPHAI, 1, 0,
		BETA, 1, 0,
		Q, N, 1, 0,
		Z, N, 1, 0,
		WORK, 1, 0, N );

	assert.equal( info, 0, 'info should be 0' );
	assertArrayClose( extractArray( ALPHAR, N ), tc.ALPHAR, 1e-12, 'ALPHAR' );
	assertArrayClose( extractArray( ALPHAI, N ), tc.ALPHAI, 1e-12, 'ALPHAI' );
	assertArrayClose( extractArray( BETA, N ), tc.BETA, 1e-12, 'BETA' );
});

test( 'dhgeqz: n=1 edge case', function t() {
	var ALPHAR = new Float64Array( 1 );
	var ALPHAI = new Float64Array( 1 );
	var BETA = new Float64Array( 1 );
	var WORK = new Float64Array( 10 );
	var Q = new Float64Array( 1 );
	var Z = new Float64Array( 1 );
	var tc = findCase( 'n=1 edge case' );
	var info;
	var N = 1;

	var H = new Float64Array([ 7.0 ]);
	var T = new Float64Array([ 3.0 ]);

	info = dhgeqz( 'schur', 'initialize', 'initialize', N, 0, 0,
		H, 1, 1, 0,
		T, 1, 1, 0,
		ALPHAR, 1, 0,
		ALPHAI, 1, 0,
		BETA, 1, 0,
		Q, 1, 1, 0,
		Z, 1, 1, 0,
		WORK, 1, 0, N );

	assert.equal( info, 0, 'info should be 0' );
	assertArrayClose( extractArray( ALPHAR, N ), tc.ALPHAR, 1e-12, 'ALPHAR' );
	assertArrayClose( extractArray( ALPHAI, N ), tc.ALPHAI, 1e-12, 'ALPHAI' );
	assertArrayClose( extractArray( BETA, N ), tc.BETA, 1e-12, 'BETA' );
});

test( 'dhgeqz: complex 2x2 block 3x3', function t() {
	var ALPHAR = new Float64Array( 3 );
	var ALPHAI = new Float64Array( 3 );
	var BETA = new Float64Array( 3 );
	var WORK = new Float64Array( 30 );
	var Q = new Float64Array( 9 );
	var Z = new Float64Array( 9 );
	var tc = findCase( 'complex 2x2 block 3x3' );
	var info;
	var N = 3;

	var H = new Float64Array([
		1.0, 0.5, 0.3,
		4.0, 1.0, 0.5,
		0.0, 3.0, 1.0
	]);

	var T = new Float64Array([
		1.0, 0.1, 0.05,
		0.0, 1.0, 0.1,
		0.0, 0.0, 1.0
	]);

	info = dhgeqz( 'schur', 'initialize', 'initialize', N, 0, N - 1,
		H, N, 1, 0,
		T, N, 1, 0,
		ALPHAR, 1, 0,
		ALPHAI, 1, 0,
		BETA, 1, 0,
		Q, N, 1, 0,
		Z, N, 1, 0,
		WORK, 1, 0, N );

	assert.equal( info, 0, 'info should be 0' );
	assertArrayClose( extractArray( ALPHAR, N ), tc.ALPHAR, 1e-12, 'ALPHAR' );
	assertArrayClose( extractArray( ALPHAI, N ), tc.ALPHAI, 1e-12, 'ALPHAI' );
	assertArrayClose( extractArray( BETA, N ), tc.BETA, 1e-12, 'BETA' );
});

test( 'dhgeqz: negative T diagonal 4x4', function t() {
	var ALPHAR = new Float64Array( 4 );
	var ALPHAI = new Float64Array( 4 );
	var BETA = new Float64Array( 4 );
	var WORK = new Float64Array( 40 );
	var Q = new Float64Array( 16 );
	var Z = new Float64Array( 16 );
	var tc = findCase( 'negative T diagonal 4x4' );
	var info;
	var N = 4;

	var H = new Float64Array([
		2.0, 1.0, 0.5, 0.2,
		1.0, 3.0, 1.0, 0.3,
		0.0, 0.5, 1.0, 0.5,
		0.0, 0.0, 0.3, 4.0
	]);

	var T = new Float64Array([
		-1.0, 0.5, 0.2, 0.1,
		0.0, 2.0, 0.3, 0.15,
		0.0, 0.0, -1.5, 0.4,
		0.0, 0.0, 0.0, 1.0
	]);

	info = dhgeqz( 'schur', 'initialize', 'initialize', N, 0, N - 1,
		H, N, 1, 0,
		T, N, 1, 0,
		ALPHAR, 1, 0,
		ALPHAI, 1, 0,
		BETA, 1, 0,
		Q, N, 1, 0,
		Z, N, 1, 0,
		WORK, 1, 0, N );

	assert.equal( info, 0, 'info should be 0' );
	assertArrayClose( extractArray( ALPHAR, N ), tc.ALPHAR, 1e-12, 'ALPHAR' );
	assertArrayClose( extractArray( ALPHAI, N ), tc.ALPHAI, 1e-12, 'ALPHAI' );
	assertArrayClose( extractArray( BETA, N ), tc.BETA, 1e-12, 'BETA' );
});

test( 'dhgeqz: n=0 quick return', function t() {
	var ALPHAR = new Float64Array( 1 );
	var ALPHAI = new Float64Array( 1 );
	var BETA = new Float64Array( 1 );
	var WORK = new Float64Array( 10 );
	var Q = new Float64Array( 1 );
	var Z = new Float64Array( 1 );
	var H = new Float64Array( 1 );
	var T = new Float64Array( 1 );
	var info;

	info = dhgeqz( 'schur', 'initialize', 'initialize', 0, 0, -1,
		H, 1, 1, 0,
		T, 1, 1, 0,
		ALPHAR, 1, 0,
		ALPHAI, 1, 0,
		BETA, 1, 0,
		Q, 1, 1, 0,
		Z, 1, 1, 0,
		WORK, 1, 0, 0 );

	assert.equal( info, 0, 'info should be 0' );
});

test( 'dhgeqz: ihi < ilo skip', function t() {
	var ALPHAR = new Float64Array( 3 );
	var ALPHAI = new Float64Array( 3 );
	var BETA = new Float64Array( 3 );
	var WORK = new Float64Array( 30 );
	var Q = new Float64Array( 9 );
	var Z = new Float64Array( 9 );
	var tc = findCase( 'ihi lt ilo skip' );
	var info;
	var N = 3;

	var H = new Float64Array([
		5.0, 1.0, 0.5,
		0.0, 3.0, 2.0,
		0.0, 0.0, 1.0
	]);

	var T = new Float64Array([
		2.0, 0.3, 0.1,
		0.0, 1.0, 0.4,
		0.0, 0.0, 3.0
	]);

	// ILO=2 (0-based), IHI=1 (0-based) — IHI < ILO, skip main iteration
	info = dhgeqz( 'schur', 'initialize', 'initialize', N, 2, 1,
		H, N, 1, 0,
		T, N, 1, 0,
		ALPHAR, 1, 0,
		ALPHAI, 1, 0,
		BETA, 1, 0,
		Q, N, 1, 0,
		Z, N, 1, 0,
		WORK, 1, 0, N );

	assert.equal( info, 0, 'info should be 0' );
	assertArrayClose( extractArray( ALPHAR, N ), tc.ALPHAR, 1e-12, 'ALPHAR' );
	assertArrayClose( extractArray( ALPHAI, N ), tc.ALPHAI, 1e-12, 'ALPHAI' );
	assertArrayClose( extractArray( BETA, N ), tc.BETA, 1e-12, 'BETA' );
});

test( 'dhgeqz: eig only neg T above active block', function t() {
	var ALPHAR = new Float64Array( 4 );
	var ALPHAI = new Float64Array( 4 );
	var BETA = new Float64Array( 4 );
	var WORK = new Float64Array( 40 );
	var Q = new Float64Array( 16 );
	var Z = new Float64Array( 16 );
	var tc = findCase( 'eig only neg T above' );
	var info;
	var N = 4;

	var H = new Float64Array([
		2.0, 1.0, 0.0, 0.0,
		0.5, 3.0, 0.0, 0.0,
		0.0, 0.0, 7.0, 0.5,
		0.0, 0.0, 0.0, 5.0
	]);

	var T = new Float64Array([
		1.0, 0.2, 0.0, 0.0,
		0.0, 2.0, 0.0, 0.0,
		0.0, 0.0, -1.0, 0.1,
		0.0, 0.0, 0.0, -3.0
	]);

	// ILO=0, IHI=1 (0-based) — columns 2,3 are above the active block with negative T diagonal
	info = dhgeqz( 'eigenvalues', 'none', 'none', N, 0, 1,
		H, N, 1, 0,
		T, N, 1, 0,
		ALPHAR, 1, 0,
		ALPHAI, 1, 0,
		BETA, 1, 0,
		Q, N, 1, 0,
		Z, N, 1, 0,
		WORK, 1, 0, N );

	assert.equal( info, 0, 'info should be 0' );
	assertArrayClose( extractArray( ALPHAR, N ), tc.ALPHAR, 1e-12, 'ALPHAR' );
	assertArrayClose( extractArray( ALPHAI, N ), tc.ALPHAI, 1e-12, 'ALPHAI' );
	assertArrayClose( extractArray( BETA, N ), tc.BETA, 1e-12, 'BETA' );
});

test( 'dhgeqz: eig only neg T below active block', function t() {
	var ALPHAR = new Float64Array( 4 );
	var ALPHAI = new Float64Array( 4 );
	var BETA = new Float64Array( 4 );
	var WORK = new Float64Array( 40 );
	var Q = new Float64Array( 16 );
	var Z = new Float64Array( 16 );
	var tc = findCase( 'eig only neg T below' );
	var info;
	var N = 4;

	var H = new Float64Array([
		5.0, 1.0, 0.0, 0.0,
		0.0, 3.0, 0.0, 0.0,
		0.0, 0.0, 2.0, 1.0,
		0.0, 0.0, 0.5, 4.0
	]);

	var T = new Float64Array([
		-2.0, 0.3, 0.0, 0.0,
		0.0, -1.0, 0.0, 0.0,
		0.0, 0.0, 1.0, 0.2,
		0.0, 0.0, 0.0, 3.0
	]);

	// ILO=2, IHI=3 (0-based) — columns 0,1 are below the active block with negative T diagonal
	info = dhgeqz( 'eigenvalues', 'none', 'none', N, 2, 3,
		H, N, 1, 0,
		T, N, 1, 0,
		ALPHAR, 1, 0,
		ALPHAI, 1, 0,
		BETA, 1, 0,
		Q, N, 1, 0,
		Z, N, 1, 0,
		WORK, 1, 0, N );

	assert.equal( info, 0, 'info should be 0' );
	assertArrayClose( extractArray( ALPHAR, N ), tc.ALPHAR, 1e-12, 'ALPHAR' );
	assertArrayClose( extractArray( ALPHAI, N ), tc.ALPHAI, 1e-12, 'ALPHAI' );
	assertArrayClose( extractArray( BETA, N ), tc.BETA, 1e-12, 'BETA' );
});

test( 'dhgeqz: eig only 5x5 complex', function t() {
	var ALPHAR = new Float64Array( 5 );
	var ALPHAI = new Float64Array( 5 );
	var BETA = new Float64Array( 5 );
	var WORK = new Float64Array( 50 );
	var Q = new Float64Array( 25 );
	var Z = new Float64Array( 25 );
	var tc = findCase( 'eig only 5x5 complex' );
	var info;
	var N = 5;

	var H = new Float64Array([
		0.5, 1.0, 0.3, 0.1, 0.2,
		2.0, 0.5, 0.5, 0.2, 0.1,
		0.0, 3.0, 0.5, 0.4, 0.3,
		0.0, 0.0, 2.5, 0.5, 0.5,
		0.0, 0.0, 0.0, 2.0, 0.5
	]);

	var T = new Float64Array([
		1.0, 0.1, 0.05, 0.02, 0.01,
		0.0, 1.0, 0.1, 0.05, 0.02,
		0.0, 0.0, 1.0, 0.1, 0.05,
		0.0, 0.0, 0.0, 1.0, 0.1,
		0.0, 0.0, 0.0, 0.0, 1.0
	]);

	info = dhgeqz( 'eigenvalues', 'none', 'none', N, 0, N - 1,
		H, N, 1, 0,
		T, N, 1, 0,
		ALPHAR, 1, 0,
		ALPHAI, 1, 0,
		BETA, 1, 0,
		Q, N, 1, 0,
		Z, N, 1, 0,
		WORK, 1, 0, N );

	assert.equal( info, 0, 'info should be 0' );
	assertArrayClose( extractArray( ALPHAR, N ), tc.ALPHAR, 1e-12, 'ALPHAR' );
	assertArrayClose( extractArray( ALPHAI, N ), tc.ALPHAI, 1e-12, 'ALPHAI' );
	assertArrayClose( extractArray( BETA, N ), tc.BETA, 1e-12, 'BETA' );
});

test( 'dhgeqz: schur 6x6 double shift', function t() {
	var ALPHAR = new Float64Array( 6 );
	var ALPHAI = new Float64Array( 6 );
	var BETA = new Float64Array( 6 );
	var WORK = new Float64Array( 60 );
	var Q = new Float64Array( 36 );
	var Z = new Float64Array( 36 );
	var tc = findCase( 'schur 6x6 double shift' );
	var info;
	var N = 6;

	var H = new Float64Array([
		1.0, 2.0, 0.5, 0.1, 0.05, 0.02,
		3.0, 1.0, 1.0, 0.3, 0.1, 0.05,
		0.0, 4.0, 1.0, 0.8, 0.2, 0.1,
		0.0, 0.0, 3.0, 1.0, 1.0, 0.3,
		0.0, 0.0, 0.0, 2.5, 1.0, 0.5,
		0.0, 0.0, 0.0, 0.0, 2.0, 1.0
	]);

	var T = new Float64Array([
		1.0, 0.1, 0.05, 0.02, 0.01, 0.005,
		0.0, 1.0, 0.1, 0.05, 0.02, 0.01,
		0.0, 0.0, 1.0, 0.1, 0.05, 0.02,
		0.0, 0.0, 0.0, 1.0, 0.1, 0.05,
		0.0, 0.0, 0.0, 0.0, 1.0, 0.1,
		0.0, 0.0, 0.0, 0.0, 0.0, 1.0
	]);

	info = dhgeqz( 'schur', 'initialize', 'initialize', N, 0, N - 1,
		H, N, 1, 0,
		T, N, 1, 0,
		ALPHAR, 1, 0,
		ALPHAI, 1, 0,
		BETA, 1, 0,
		Q, N, 1, 0,
		Z, N, 1, 0,
		WORK, 1, 0, N );

	assert.equal( info, 0, 'info should be 0' );
	assertArrayClose( extractArray( ALPHAR, N ), tc.ALPHAR, 1e-12, 'ALPHAR' );
	assertArrayClose( extractArray( ALPHAI, N ), tc.ALPHAI, 1e-12, 'ALPHAI' );
	assertArrayClose( extractArray( BETA, N ), tc.BETA, 1e-12, 'BETA' );
});

test( 'dhgeqz: eig only 6x6 double shift', function t() {
	var ALPHAR = new Float64Array( 6 );
	var ALPHAI = new Float64Array( 6 );
	var BETA = new Float64Array( 6 );
	var WORK = new Float64Array( 60 );
	var Q = new Float64Array( 36 );
	var Z = new Float64Array( 36 );
	var tc = findCase( 'eig only 6x6 double shift' );
	var info;
	var N = 6;

	var H = new Float64Array([
		1.0, 2.0, 0.5, 0.1, 0.05, 0.02,
		3.0, 1.0, 1.0, 0.3, 0.1, 0.05,
		0.0, 4.0, 1.0, 0.8, 0.2, 0.1,
		0.0, 0.0, 3.0, 1.0, 1.0, 0.3,
		0.0, 0.0, 0.0, 2.5, 1.0, 0.5,
		0.0, 0.0, 0.0, 0.0, 2.0, 1.0
	]);

	var T = new Float64Array([
		1.0, 0.1, 0.05, 0.02, 0.01, 0.005,
		0.0, 1.0, 0.1, 0.05, 0.02, 0.01,
		0.0, 0.0, 1.0, 0.1, 0.05, 0.02,
		0.0, 0.0, 0.0, 1.0, 0.1, 0.05,
		0.0, 0.0, 0.0, 0.0, 1.0, 0.1,
		0.0, 0.0, 0.0, 0.0, 0.0, 1.0
	]);

	info = dhgeqz( 'eigenvalues', 'none', 'none', N, 0, N - 1,
		H, N, 1, 0,
		T, N, 1, 0,
		ALPHAR, 1, 0,
		ALPHAI, 1, 0,
		BETA, 1, 0,
		Q, N, 1, 0,
		Z, N, 1, 0,
		WORK, 1, 0, N );

	assert.equal( info, 0, 'info should be 0' );
	assertArrayClose( extractArray( ALPHAR, N ), tc.ALPHAR, 1e-12, 'ALPHAR' );
	assertArrayClose( extractArray( ALPHAI, N ), tc.ALPHAI, 1e-12, 'ALPHAI' );
	assertArrayClose( extractArray( BETA, N ), tc.BETA, 1e-12, 'BETA' );
});

test( 'dhgeqz: eig only neg T diagonal 4x4', function t() {
	var ALPHAR = new Float64Array( 4 );
	var ALPHAI = new Float64Array( 4 );
	var BETA = new Float64Array( 4 );
	var WORK = new Float64Array( 40 );
	var Q = new Float64Array( 16 );
	var Z = new Float64Array( 16 );
	var tc = findCase( 'eig only neg T diagonal 4x4' );
	var info;
	var N = 4;

	var H = new Float64Array([
		2.0, 1.0, 0.5, 0.2,
		1.0, 3.0, 1.0, 0.3,
		0.0, 0.5, 1.0, 0.5,
		0.0, 0.0, 0.3, 4.0
	]);

	var T = new Float64Array([
		-1.0, 0.5, 0.2, 0.1,
		0.0, 2.0, 0.3, 0.15,
		0.0, 0.0, -1.5, 0.4,
		0.0, 0.0, 0.0, 1.0
	]);

	info = dhgeqz( 'eigenvalues', 'none', 'none', N, 0, N - 1,
		H, N, 1, 0,
		T, N, 1, 0,
		ALPHAR, 1, 0,
		ALPHAI, 1, 0,
		BETA, 1, 0,
		Q, N, 1, 0,
		Z, N, 1, 0,
		WORK, 1, 0, N );

	assert.equal( info, 0, 'info should be 0' );
	assertArrayClose( extractArray( ALPHAR, N ), tc.ALPHAR, 1e-12, 'ALPHAR' );
	assertArrayClose( extractArray( ALPHAI, N ), tc.ALPHAI, 1e-12, 'ALPHAI' );
	assertArrayClose( extractArray( BETA, N ), tc.BETA, 1e-12, 'BETA' );
});

test( 'dhgeqz: eig only complex 3x3', function t() {
	var ALPHAR = new Float64Array( 3 );
	var ALPHAI = new Float64Array( 3 );
	var BETA = new Float64Array( 3 );
	var WORK = new Float64Array( 30 );
	var Q = new Float64Array( 9 );
	var Z = new Float64Array( 9 );
	var tc = findCase( 'eig only complex 3x3' );
	var info;
	var N = 3;

	var H = new Float64Array([
		1.0, 0.5, 0.3,
		4.0, 1.0, 0.5,
		0.0, 3.0, 1.0
	]);

	var T = new Float64Array([
		1.0, 0.1, 0.05,
		0.0, 1.0, 0.1,
		0.0, 0.0, 1.0
	]);

	info = dhgeqz( 'eigenvalues', 'none', 'none', N, 0, N - 1,
		H, N, 1, 0,
		T, N, 1, 0,
		ALPHAR, 1, 0,
		ALPHAI, 1, 0,
		BETA, 1, 0,
		Q, N, 1, 0,
		Z, N, 1, 0,
		WORK, 1, 0, N );

	assert.equal( info, 0, 'info should be 0' );
	assertArrayClose( extractArray( ALPHAR, N ), tc.ALPHAR, 1e-12, 'ALPHAR' );
	assertArrayClose( extractArray( ALPHAI, N ), tc.ALPHAI, 1e-12, 'ALPHAI' );
	assertArrayClose( extractArray( BETA, N ), tc.BETA, 1e-12, 'BETA' );
});

test( 'dhgeqz: schur neg T below and above', function t() {
	var ALPHAR = new Float64Array( 4 );
	var ALPHAI = new Float64Array( 4 );
	var BETA = new Float64Array( 4 );
	var WORK = new Float64Array( 40 );
	var Q = new Float64Array( 16 );
	var Z = new Float64Array( 16 );
	var tc = findCase( 'schur neg T below and above' );
	var info;
	var N = 4;

	var H = new Float64Array([
		5.0, 1.0, 0.5, 0.2,
		0.0, 3.0, 2.0, 0.5,
		0.0, 1.5, 1.0, 0.3,
		0.0, 0.0, 0.0, 7.0
	]);

	var T = new Float64Array([
		-2.0, 0.3, 0.1, 0.05,
		0.0, 1.0, 0.4, 0.15,
		0.0, 0.0, 3.0, 0.2,
		0.0, 0.0, 0.0, -1.0
	]);

	// ILO=1, IHI=2 (0-based)
	info = dhgeqz( 'schur', 'initialize', 'initialize', N, 1, 2,
		H, N, 1, 0,
		T, N, 1, 0,
		ALPHAR, 1, 0,
		ALPHAI, 1, 0,
		BETA, 1, 0,
		Q, N, 1, 0,
		Z, N, 1, 0,
		WORK, 1, 0, N );

	assert.equal( info, 0, 'info should be 0' );
	assertArrayClose( extractArray( ALPHAR, N ), tc.ALPHAR, 1e-12, 'ALPHAR' );
	assertArrayClose( extractArray( ALPHAI, N ), tc.ALPHAI, 1e-12, 'ALPHAI' );
	assertArrayClose( extractArray( BETA, N ), tc.BETA, 1e-12, 'BETA' );
});

test( 'dhgeqz: schur 8x8 complex double shift', function t() {
	var ALPHAR = new Float64Array( 8 );
	var ALPHAI = new Float64Array( 8 );
	var BETA = new Float64Array( 8 );
	var WORK = new Float64Array( 80 );
	var Q = new Float64Array( 64 );
	var Z = new Float64Array( 64 );
	var tc = findCase( 'schur 8x8 complex double shift' );
	var info;
	var N = 8;
	var i;

	var H = new Float64Array([
		1.0, 2.0, 0.3, 0.1, 0.05, 0.02, 0.01, 0.005,
		3.0, 1.0, 1.0, 0.2, 0.1, 0.05, 0.02, 0.01,
		0.0, 4.0, 1.0, 0.8, 0.2, 0.1, 0.05, 0.02,
		0.0, 0.0, 3.5, 1.0, 0.9, 0.3, 0.1, 0.05,
		0.0, 0.0, 0.0, 3.0, 1.0, 0.7, 0.2, 0.1,
		0.0, 0.0, 0.0, 0.0, 2.5, 1.0, 0.6, 0.2,
		0.0, 0.0, 0.0, 0.0, 0.0, 2.0, 1.0, 0.5,
		0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 1.5, 1.0
	]);

	var T = new Float64Array( N * N );
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

	info = dhgeqz( 'schur', 'initialize', 'initialize', N, 0, N - 1,
		H, N, 1, 0,
		T, N, 1, 0,
		ALPHAR, 1, 0,
		ALPHAI, 1, 0,
		BETA, 1, 0,
		Q, N, 1, 0,
		Z, N, 1, 0,
		WORK, 1, 0, N );

	assert.equal( info, 0, 'info should be 0' );
	assertArrayClose( extractArray( ALPHAR, N ), tc.ALPHAR, 1e-12, 'ALPHAR' );
	assertArrayClose( extractArray( ALPHAI, N ), tc.ALPHAI, 1e-12, 'ALPHAI' );
	assertArrayClose( extractArray( BETA, N ), tc.BETA, 1e-12, 'BETA' );
});

test( 'dhgeqz: near zero T diag 3x3', function t() {
	var ALPHAR = new Float64Array( 3 );
	var ALPHAI = new Float64Array( 3 );
	var BETA = new Float64Array( 3 );
	var WORK = new Float64Array( 30 );
	var Q = new Float64Array( 9 );
	var Z = new Float64Array( 9 );
	var tc = findCase( 'near zero T diag 3x3' );
	var info;
	var N = 3;

	var H = new Float64Array([
		2.0, 1.0, 0.5,
		1.0, 3.0, 0.8,
		0.0, 0.5, 1.5
	]);

	var T = new Float64Array([
		1.0, 0.2, 0.1,
		0.0, 1.0, 0.3,
		0.0, 0.0, 1.0e-20
	]);

	info = dhgeqz( 'schur', 'initialize', 'initialize', N, 0, N - 1,
		H, N, 1, 0,
		T, N, 1, 0,
		ALPHAR, 1, 0,
		ALPHAI, 1, 0,
		BETA, 1, 0,
		Q, N, 1, 0,
		Z, N, 1, 0,
		WORK, 1, 0, N );

	assert.equal( info, 0, 'info should be 0' );
	assertArrayClose( extractArray( ALPHAR, N ), tc.ALPHAR, 1e-12, 'ALPHAR' );
	assertArrayClose( extractArray( ALPHAI, N ), tc.ALPHAI, 1e-12, 'ALPHAI' );
	assertArrayClose( extractArray( BETA, N ), tc.BETA, 1e-12, 'BETA' );
});

test( 'dhgeqz: eig only near zero T diag 3x3', function t() {
	var ALPHAR = new Float64Array( 3 );
	var ALPHAI = new Float64Array( 3 );
	var BETA = new Float64Array( 3 );
	var WORK = new Float64Array( 30 );
	var Q = new Float64Array( 9 );
	var Z = new Float64Array( 9 );
	var tc = findCase( 'eig only near zero T diag 3x3' );
	var info;
	var N = 3;

	var H = new Float64Array([
		2.0, 1.0, 0.5,
		1.0, 3.0, 0.8,
		0.0, 0.5, 1.5
	]);

	var T = new Float64Array([
		1.0, 0.2, 0.1,
		0.0, 1.0, 0.3,
		0.0, 0.0, 1.0e-20
	]);

	info = dhgeqz( 'eigenvalues', 'none', 'none', N, 0, N - 1,
		H, N, 1, 0,
		T, N, 1, 0,
		ALPHAR, 1, 0,
		ALPHAI, 1, 0,
		BETA, 1, 0,
		Q, N, 1, 0,
		Z, N, 1, 0,
		WORK, 1, 0, N );

	assert.equal( info, 0, 'info should be 0' );
	assertArrayClose( extractArray( ALPHAR, N ), tc.ALPHAR, 1e-12, 'ALPHAR' );
	assertArrayClose( extractArray( ALPHAI, N ), tc.ALPHAI, 1e-12, 'ALPHAI' );
	assertArrayClose( extractArray( BETA, N ), tc.BETA, 1e-12, 'BETA' );
});

test( 'dhgeqz: zero T diag middle 4x4', function t() {
	var ALPHAR = new Float64Array( 4 );
	var ALPHAI = new Float64Array( 4 );
	var BETA = new Float64Array( 4 );
	var WORK = new Float64Array( 40 );
	var Q = new Float64Array( 16 );
	var Z = new Float64Array( 16 );
	var tc = findCase( 'zero T diag middle 4x4' );
	var info;
	var N = 4;

	var H = new Float64Array([
		2.0, 1.0, 0.5, 0.2,
		1.5, 3.0, 1.0, 0.3,
		0.0, 0.5, 4.0, 0.5,
		0.0, 0.0, 0.3, 1.0
	]);

	var T = new Float64Array([
		1.0, 0.2, 0.1, 0.05,
		0.0, 1.0e-20, 0.3, 0.1,
		0.0, 0.0, 2.0, 0.2,
		0.0, 0.0, 0.0, 1.5
	]);

	info = dhgeqz( 'schur', 'initialize', 'initialize', N, 0, N - 1,
		H, N, 1, 0,
		T, N, 1, 0,
		ALPHAR, 1, 0,
		ALPHAI, 1, 0,
		BETA, 1, 0,
		Q, N, 1, 0,
		Z, N, 1, 0,
		WORK, 1, 0, N );

	assert.equal( info, 0, 'info should be 0' );
	assertArrayClose( extractArray( ALPHAR, N ), tc.ALPHAR, 1e-12, 'ALPHAR' );
	assertArrayClose( extractArray( ALPHAI, N ), tc.ALPHAI, 1e-12, 'ALPHAI' );
	assertArrayClose( extractArray( BETA, N ), tc.BETA, 1e-12, 'BETA' );
});

test( 'dhgeqz: eig only zero T diag middle 4x4', function t() {
	var ALPHAR = new Float64Array( 4 );
	var ALPHAI = new Float64Array( 4 );
	var BETA = new Float64Array( 4 );
	var WORK = new Float64Array( 40 );
	var Q = new Float64Array( 16 );
	var Z = new Float64Array( 16 );
	var tc = findCase( 'eig only zero T diag middle 4x4' );
	var info;
	var N = 4;

	var H = new Float64Array([
		2.0, 1.0, 0.5, 0.2,
		1.5, 3.0, 1.0, 0.3,
		0.0, 0.5, 4.0, 0.5,
		0.0, 0.0, 0.3, 1.0
	]);

	var T = new Float64Array([
		1.0, 0.2, 0.1, 0.05,
		0.0, 1.0e-20, 0.3, 0.1,
		0.0, 0.0, 2.0, 0.2,
		0.0, 0.0, 0.0, 1.5
	]);

	info = dhgeqz( 'eigenvalues', 'none', 'none', N, 0, N - 1,
		H, N, 1, 0,
		T, N, 1, 0,
		ALPHAR, 1, 0,
		ALPHAI, 1, 0,
		BETA, 1, 0,
		Q, N, 1, 0,
		Z, N, 1, 0,
		WORK, 1, 0, N );

	assert.equal( info, 0, 'info should be 0' );
	assertArrayClose( extractArray( ALPHAR, N ), tc.ALPHAR, 1e-12, 'ALPHAR' );
	assertArrayClose( extractArray( ALPHAI, N ), tc.ALPHAI, 1e-12, 'ALPHAI' );
	assertArrayClose( extractArray( BETA, N ), tc.BETA, 1e-12, 'BETA' );
});

test( 'dhgeqz: two zero T diag 4x4', function t() {
	var ALPHAR = new Float64Array( 4 );
	var ALPHAI = new Float64Array( 4 );
	var BETA = new Float64Array( 4 );
	var WORK = new Float64Array( 40 );
	var Q = new Float64Array( 16 );
	var Z = new Float64Array( 16 );
	var tc = findCase( 'two zero T diag 4x4' );
	var info;
	var N = 4;

	var H = new Float64Array([
		2.0, 1.0, 0.5, 0.2,
		1.5, 3.0, 1.0, 0.3,
		0.0, 0.5, 4.0, 0.8,
		0.0, 0.0, 0.3, 1.0
	]);

	var T = new Float64Array([
		1.0, 0.2, 0.1, 0.05,
		0.0, 1.0e-20, 0.0, 0.0,
		0.0, 0.0, 1.0e-20, 0.0,
		0.0, 0.0, 0.0, 1.5
	]);

	info = dhgeqz( 'schur', 'initialize', 'initialize', N, 0, N - 1,
		H, N, 1, 0,
		T, N, 1, 0,
		ALPHAR, 1, 0,
		ALPHAI, 1, 0,
		BETA, 1, 0,
		Q, N, 1, 0,
		Z, N, 1, 0,
		WORK, 1, 0, N );

	assert.equal( info, 0, 'info should be 0' );
	assertArrayClose( extractArray( ALPHAR, N ), tc.ALPHAR, 1e-12, 'ALPHAR' );
	assertArrayClose( extractArray( ALPHAI, N ), tc.ALPHAI, 1e-12, 'ALPHAI' );
	assertArrayClose( extractArray( BETA, N ), tc.BETA, 1e-12, 'BETA' );
});

test( 'dhgeqz: eig only 4x4 complex pairs', function t() {
	var ALPHAR = new Float64Array( 4 );
	var ALPHAI = new Float64Array( 4 );
	var BETA = new Float64Array( 4 );
	var WORK = new Float64Array( 40 );
	var Q = new Float64Array( 16 );
	var Z = new Float64Array( 16 );
	var tc = findCase( 'eig only 4x4 complex pairs' );
	var info;
	var N = 4;

	var H = new Float64Array([
		1.0, 0.5, 0.3, 0.1,
		4.0, 1.0, 0.5, 0.2,
		0.0, 3.0, 1.0, 0.4,
		0.0, 0.0, 2.5, 1.0
	]);

	var T = new Float64Array([
		1.0, 0.1, 0.05, 0.02,
		0.0, 1.0, 0.1, 0.05,
		0.0, 0.0, 1.0, 0.1,
		0.0, 0.0, 0.0, 1.0
	]);

	info = dhgeqz( 'eigenvalues', 'none', 'none', N, 0, N - 1,
		H, N, 1, 0,
		T, N, 1, 0,
		ALPHAR, 1, 0,
		ALPHAI, 1, 0,
		BETA, 1, 0,
		Q, N, 1, 0,
		Z, N, 1, 0,
		WORK, 1, 0, N );

	assert.equal( info, 0, 'info should be 0' );
	assertArrayClose( extractArray( ALPHAR, N ), tc.ALPHAR, 1e-12, 'ALPHAR' );
	assertArrayClose( extractArray( ALPHAI, N ), tc.ALPHAI, 1e-12, 'ALPHAI' );
	assertArrayClose( extractArray( BETA, N ), tc.BETA, 1e-12, 'BETA' );
});

test( 'dhgeqz: schur 4x4 complex pairs', function t() {
	var ALPHAR = new Float64Array( 4 );
	var ALPHAI = new Float64Array( 4 );
	var BETA = new Float64Array( 4 );
	var WORK = new Float64Array( 40 );
	var Q = new Float64Array( 16 );
	var Z = new Float64Array( 16 );
	var tc = findCase( 'schur 4x4 complex pairs' );
	var info;
	var N = 4;

	var H = new Float64Array([
		1.0, 0.5, 0.3, 0.1,
		4.0, 1.0, 0.5, 0.2,
		0.0, 3.0, 1.0, 0.4,
		0.0, 0.0, 2.5, 1.0
	]);

	var T = new Float64Array([
		1.0, 0.1, 0.05, 0.02,
		0.0, 1.0, 0.1, 0.05,
		0.0, 0.0, 1.0, 0.1,
		0.0, 0.0, 0.0, 1.0
	]);

	info = dhgeqz( 'schur', 'initialize', 'initialize', N, 0, N - 1,
		H, N, 1, 0,
		T, N, 1, 0,
		ALPHAR, 1, 0,
		ALPHAI, 1, 0,
		BETA, 1, 0,
		Q, N, 1, 0,
		Z, N, 1, 0,
		WORK, 1, 0, N );

	assert.equal( info, 0, 'info should be 0' );
	assertArrayClose( extractArray( ALPHAR, N ), tc.ALPHAR, 1e-12, 'ALPHAR' );
	assertArrayClose( extractArray( ALPHAI, N ), tc.ALPHAI, 1e-12, 'ALPHAI' );
	assertArrayClose( extractArray( BETA, N ), tc.BETA, 1e-12, 'BETA' );
});

test( 'dhgeqz: schur 2x2 complex eigs', function t() {
	var ALPHAR = new Float64Array( 2 );
	var ALPHAI = new Float64Array( 2 );
	var BETA = new Float64Array( 2 );
	var WORK = new Float64Array( 20 );
	var Q = new Float64Array( 4 );
	var Z = new Float64Array( 4 );
	var tc = findCase( 'schur 2x2 complex eigs' );
	var info;
	var N = 2;

	var H = new Float64Array([
		0.0, -1.0,
		1.0, 0.0
	]);

	var T = new Float64Array([
		1.0, 0.0,
		0.0, 1.0
	]);

	info = dhgeqz( 'schur', 'initialize', 'initialize', N, 0, N - 1,
		H, N, 1, 0,
		T, N, 1, 0,
		ALPHAR, 1, 0,
		ALPHAI, 1, 0,
		BETA, 1, 0,
		Q, N, 1, 0,
		Z, N, 1, 0,
		WORK, 1, 0, N );

	assert.equal( info, 0, 'info should be 0' );
	assertArrayClose( extractArray( ALPHAR, N ), tc.ALPHAR, 1e-12, 'ALPHAR' );
	assertArrayClose( extractArray( ALPHAI, N ), tc.ALPHAI, 1e-12, 'ALPHAI' );
	assertArrayClose( extractArray( BETA, N ), tc.BETA, 1e-12, 'BETA' );
});

test( 'dhgeqz: eig only 2x2 complex eigs', function t() {
	var ALPHAR = new Float64Array( 2 );
	var ALPHAI = new Float64Array( 2 );
	var BETA = new Float64Array( 2 );
	var WORK = new Float64Array( 20 );
	var Q = new Float64Array( 4 );
	var Z = new Float64Array( 4 );
	var tc = findCase( 'eig only 2x2 complex eigs' );
	var info;
	var N = 2;

	var H = new Float64Array([
		0.0, -1.0,
		1.0, 0.0
	]);

	var T = new Float64Array([
		1.0, 0.0,
		0.0, 1.0
	]);

	info = dhgeqz( 'eigenvalues', 'none', 'none', N, 0, N - 1,
		H, N, 1, 0,
		T, N, 1, 0,
		ALPHAR, 1, 0,
		ALPHAI, 1, 0,
		BETA, 1, 0,
		Q, N, 1, 0,
		Z, N, 1, 0,
		WORK, 1, 0, N );

	assert.equal( info, 0, 'info should be 0' );
	assertArrayClose( extractArray( ALPHAR, N ), tc.ALPHAR, 1e-12, 'ALPHAR' );
	assertArrayClose( extractArray( ALPHAI, N ), tc.ALPHAI, 1e-12, 'ALPHAI' );
	assertArrayClose( extractArray( BETA, N ), tc.BETA, 1e-12, 'BETA' );
});

test( 'dhgeqz: eig only 3x3 double shift', function t() {
	var ALPHAR = new Float64Array( 3 );
	var ALPHAI = new Float64Array( 3 );
	var BETA = new Float64Array( 3 );
	var WORK = new Float64Array( 30 );
	var Q = new Float64Array( 9 );
	var Z = new Float64Array( 9 );
	var tc = findCase( 'eig only 3x3 double shift' );
	var info;
	var N = 3;

	var H = new Float64Array([
		0.0, -1.0, 0.5,
		1.0, 0.0, 0.3,
		0.0, 1.0, 2.0
	]);

	var T = new Float64Array([
		1.0, 0.0, 0.0,
		0.0, 1.0, 0.0,
		0.0, 0.0, 1.0
	]);

	info = dhgeqz( 'eigenvalues', 'none', 'none', N, 0, N - 1,
		H, N, 1, 0,
		T, N, 1, 0,
		ALPHAR, 1, 0,
		ALPHAI, 1, 0,
		BETA, 1, 0,
		Q, N, 1, 0,
		Z, N, 1, 0,
		WORK, 1, 0, N );

	assert.equal( info, 0, 'info should be 0' );
	assertArrayClose( extractArray( ALPHAR, N ), tc.ALPHAR, 1e-12, 'ALPHAR' );
	assertArrayClose( extractArray( ALPHAI, N ), tc.ALPHAI, 1e-12, 'ALPHAI' );
	assertArrayClose( extractArray( BETA, N ), tc.BETA, 1e-12, 'BETA' );
});

test( 'dhgeqz: schur 3x3 double shift', function t() {
	var ALPHAR = new Float64Array( 3 );
	var ALPHAI = new Float64Array( 3 );
	var BETA = new Float64Array( 3 );
	var WORK = new Float64Array( 30 );
	var Q = new Float64Array( 9 );
	var Z = new Float64Array( 9 );
	var tc = findCase( 'schur 3x3 double shift' );
	var info;
	var N = 3;

	var H = new Float64Array([
		0.0, -1.0, 0.5,
		1.0, 0.0, 0.3,
		0.0, 1.0, 2.0
	]);

	var T = new Float64Array([
		1.0, 0.0, 0.0,
		0.0, 1.0, 0.0,
		0.0, 0.0, 1.0
	]);

	info = dhgeqz( 'schur', 'initialize', 'initialize', N, 0, N - 1,
		H, N, 1, 0,
		T, N, 1, 0,
		ALPHAR, 1, 0,
		ALPHAI, 1, 0,
		BETA, 1, 0,
		Q, N, 1, 0,
		Z, N, 1, 0,
		WORK, 1, 0, N );

	assert.equal( info, 0, 'info should be 0' );
	assertArrayClose( extractArray( ALPHAR, N ), tc.ALPHAR, 1e-12, 'ALPHAR' );
	assertArrayClose( extractArray( ALPHAI, N ), tc.ALPHAI, 1e-12, 'ALPHAI' );
	assertArrayClose( extractArray( BETA, N ), tc.BETA, 1e-12, 'BETA' );
});

test( 'dhgeqz: subrange with below and above 4x4', function t() {
	var ALPHAR = new Float64Array( 4 );
	var ALPHAI = new Float64Array( 4 );
	var BETA = new Float64Array( 4 );
	var WORK = new Float64Array( 40 );
	var Q = new Float64Array( 16 );
	var Z = new Float64Array( 16 );
	var tc = findCase( 'subrange with below and above 4x4' );
	var info;
	var N = 4;

	var H = new Float64Array([
		5.0, 1.0, 0.5, 0.2,
		0.0, 3.0, 2.0, 0.5,
		0.0, 1.5, 1.0, 0.3,
		0.0, 0.0, 0.0, 7.0
	]);

	var T = new Float64Array([
		2.0, 0.3, 0.1, 0.05,
		0.0, 1.0, 0.4, 0.15,
		0.0, 0.0, 3.0, 0.2,
		0.0, 0.0, 0.0, -1.0
	]);

	info = dhgeqz( 'schur', 'initialize', 'initialize', N, 1, 2,
		H, N, 1, 0,
		T, N, 1, 0,
		ALPHAR, 1, 0,
		ALPHAI, 1, 0,
		BETA, 1, 0,
		Q, N, 1, 0,
		Z, N, 1, 0,
		WORK, 1, 0, N );

	assert.equal( info, 0, 'info should be 0' );
	assertArrayClose( extractArray( ALPHAR, N ), tc.ALPHAR, 1e-12, 'ALPHAR' );
	assertArrayClose( extractArray( ALPHAI, N ), tc.ALPHAI, 1e-12, 'ALPHAI' );
	assertArrayClose( extractArray( BETA, N ), tc.BETA, 1e-12, 'BETA' );
});
