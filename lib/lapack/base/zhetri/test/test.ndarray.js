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
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import zhetri from './../lib/ndarray.js';


// FIXTURES //

var fixtureDir = path.join( import.meta.dirname, '..', '..', '..', '..', '..', 'test', 'fixtures' );
var rawLines = readFileSync( path.join( fixtureDir, 'zhetri.jsonl' ), 'utf8' ).trim().split( '\n' ); // eslint-disable-line node/no-sync, max-len
var FIXTURES = rawLines.map( function parse( line ) {
	return JSON.parse( line );
});


// FUNCTIONS //

function assertClose( actual, expected, tol, msg ) {
	var relErr = Math.abs( actual - expected ) / Math.max( Math.abs( expected ), 1.0 );
	assert.ok( relErr <= tol, format( '%s: expected %s, got %s', msg, expected, actual ) );
}

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
* Converts a Fortran 1-based IPIV (with negative 2x2 encoding) to JS 0-based with bitwise-NOT.
*/
function convertIPIV( fipiv ) {
	var out = new Int32Array( fipiv.length );
	var i;
	for ( i = 0; i < fipiv.length; i++ ) {
		if ( fipiv[ i ] > 0 ) {
			out[ i ] = fipiv[ i ] - 1;
		} else if ( fipiv[ i ] < 0 ) {
			// Fortran -p encodes a 2x2 pivot; JS uses ~(p-1) which equals -p
			out[ i ] = fipiv[ i ];
		}
	}
	return out;
}

/**
* Compares a Complex128Array buffer to a flat real interleaved expected array allowing for LDA padding.
* The fixture stores entries column-major using LDA=NMAX=10 (so 2*NMAX=20 reals per column).
* For our test, we use LDA=N (tight), so we must extract entries from the fixture using the column-major
* convention with stride 2*NMAX between columns.
*/
function checkA( buf, expected, N, lda, ldaFixture, msg, tol ) {
	var col;
	var row;
	var idxA;
	var idxF;
	for ( col = 0; col < N; col++ ) {
		for ( row = 0; row < N; row++ ) {
			idxA = ( col * lda + row ) * 2;
			idxF = ( col * ldaFixture + row ) * 2;
			assertClose( buf[ idxA ], expected[ idxF ], tol, format( '%s.re[%d,%d]', msg, row, col ) );
			assertClose( buf[ idxA + 1 ], expected[ idxF + 1 ], tol, format( '%s.im[%d,%d]', msg, row, col ) );
		}
	}
}

/**
* Builds a Complex128Array with the matrix data from a fixture using LDA = N (tight column-major).
*/
function buildAFromFixture( N, fixtureA, ldaFixture ) {
	var arr = new Complex128Array( N * N );
	var buf = arr.buffer ? new Float64Array( arr.buffer ) : new Float64Array( N * N * 2 );
	var col;
	var row;
	var idxA;
	var idxF;
	for ( col = 0; col < N; col++ ) {
		for ( row = 0; row < N; row++ ) {
			idxA = ( col * N + row ) * 2;
			idxF = ( col * ldaFixture + row ) * 2;
			buf[ idxA ] = fixtureA[ idxF ];
			buf[ idxA + 1 ] = fixtureA[ idxF + 1 ];
		}
	}
	return arr;
}

/**
* Returns a Float64Array view over a Complex128Array.
*/
function viewBuf( cmplxArr ) {
	return new Float64Array( cmplxArr.buffer, cmplxArr.byteOffset, cmplxArr.length * 2 );
}

/**
* Runs a zhetri test case using the factored matrix from the fixture.
*/
function runCase( factoredName, expectedName, uplo, N ) {
	var ldaFixture;
	var factored;
	var expected;
	var IPIV;
	var WORK;
	var info;
	var A;
	var buf;

	if ( N === 0 ) {
		A = new Complex128Array( 1 );
		IPIV = new Int32Array( 1 );
		WORK = new Complex128Array( 1 );
		info = zhetri( uplo, 0, A, 1, 1, 0, IPIV, 1, 0, WORK, 1, 0 );
		expected = findCase( expectedName );
		assert.equal( info, expected.info, expectedName + ':info' );
		return;
	}

	factored = findCase( factoredName );
	expected = findCase( expectedName );

	// Fixture LDA: 4 doubles per complex × NMAX=10 — wait, the fortran prints with stride 2*lda where
	// lda=NMAX=10. For n=1, the fixture only contains 2*n*n = 2 reals (special-cased single column print).
	// For n>=2, print_matrix uses 2*lda=20 reals stride.
	// print_matrix is called with m=2*n, so fixture stores tight column-major (no LDA padding)
	ldaFixture = N;

	A = buildAFromFixture( N, factored.a, ldaFixture );
	IPIV = convertIPIV( factored.ipiv );
	WORK = new Complex128Array( N );

	info = zhetri( uplo, N, A, 1, N, 0, IPIV, 1, 0, WORK, 1, 0 );

	assert.equal( info, expected.info, expectedName + ':info' );
	if ( expected.a ) {
		buf = viewBuf( A );
		checkA( buf, expected.a, N, N, ldaFixture, expectedName, 1e-9 );
	}
}


// TESTS //

test( 'zhetri: main export is a function', function t() {
	assert.strictEqual( typeof zhetri, 'function', 'is a function' );
});

test( 'zhetri: n0 (N=0 quick return)', function t() {
	runCase( 'n0', 'n0', 'upper', 0 );
});

test( 'zhetri: n1_upper (1x1 upper)', function t() {
	runCase( 'n1_upper_factored', 'n1_upper', 'upper', 1 );
});

test( 'zhetri: n1_lower (1x1 lower)', function t() {
	runCase( 'n1_lower_factored', 'n1_lower', 'lower', 1 );
});

test( 'zhetri: 3x3_upper (positive definite, 1x1 pivots)', function t() {
	runCase( '3x3_upper_factored', '3x3_upper', 'upper', 3 );
});

test( 'zhetri: 3x3_lower (positive definite, 1x1 pivots)', function t() {
	runCase( '3x3_lower_factored', '3x3_lower', 'lower', 3 );
});

test( 'zhetri: 4x4_upper_indef (zero diagonal, 2x2 pivots)', function t() {
	runCase( '4x4_upper_indef_factored', '4x4_upper_indef', 'upper', 4 );
});

test( 'zhetri: 4x4_lower_indef (zero diagonal, 2x2 pivots)', function t() {
	runCase( '4x4_lower_indef_factored', '4x4_lower_indef', 'lower', 4 );
});

test( 'zhetri: singular_lower (info > 0)', function t() {
	runCase( 'singular_lower_factored', 'singular_lower', 'lower', 2 );
});

test( 'zhetri: singular_upper (info > 0)', function t() {
	runCase( 'singular_upper_factored', 'singular_upper', 'upper', 2 );
});

test( 'zhetri: 4x4_upper_swap (with interchanges)', function t() {
	runCase( '4x4_upper_swap_factored', '4x4_upper_swap', 'upper', 4 );
});

test( 'zhetri: 4x4_lower_swap (with interchanges)', function t() {
	runCase( '4x4_lower_swap_factored', '4x4_lower_swap', 'lower', 4 );
});

test( 'zhetri: throws TypeError for invalid uplo', function t() {
	assert.throws( function throws() {
		zhetri( 'bogus', 1, new Complex128Array( 1 ), 1, 1, 0, new Int32Array( 1 ), 1, 0, new Complex128Array( 1 ), 1, 0 );
	}, TypeError );
});

test( 'zhetri: throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		zhetri( 'upper', -1, new Complex128Array( 1 ), 1, 1, 0, new Int32Array( 1 ), 1, 0, new Complex128Array( 1 ), 1, 0 );
	}, RangeError );
});
