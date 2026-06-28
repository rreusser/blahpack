/**
* @license Apache-2.0
*
* Copyright (c) 2026 Ricky Reusser.
*
* Derived from the LAPACK 3.12.0 reference implementation (BSD-3-Clause).
*/

/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import path from 'node:path';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import zhetri2 from './../lib/ndarray.js';


// FIXTURES //

var fixtureDir = path.join( import.meta.dirname, '..', '..', '..', '..', '..', 'test', 'fixtures' ); // eslint-disable-line max-len
var rawLines = readFileSync( path.join( fixtureDir, 'zhetri2.jsonl' ), 'utf8' ).trim().split( '\n' ); // eslint-disable-line max-len
var FIXTURES = rawLines.map( function parse( line ) {
	return JSON.parse( line );
});

// The Fortran test uses NMAX=40 for the leading dimension and prints columns with stride 2*NMAX doubles.
var FIXTURE_LDA = 40;


// FUNCTIONS //

/**
* Finds a fixture by name.
*
* @private
* @param {string} name - test case name
* @throws {Error} fixture not found
* @returns {Object} fixture entry
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
* Converts a Fortran 1-based IPIV array into the JS convention used by `zhetrf`/`zhetri`/`zhetri2`: non-negative `0`-based indices for `1x1` blocks and bitwise-NOT-encoded indices for `2x2` blocks (which happens automatically since Fortran's negative encoding `-p` and JS's `~(p-1) = -p` agree).
*
* @private
* @param {Array<number>} ipivF - Fortran 1-based pivot array
* @returns {Int32Array} JS-convention pivot array
*/
function convertIpiv( ipivF ) {
	var out;
	var i;
	out = new Int32Array( ipivF.length );
	for ( i = 0; i < ipivF.length; i++ ) {
		if ( ipivF[ i ] > 0 ) {
			out[ i ] = ipivF[ i ] - 1;
		} else {
			out[ i ] = ipivF[ i ];
		}
	}
	return out;
}

/**
* Builds a Complex128Array from a flat real-interleaved Fortran column-major buffer (LDA=FIXTURE_LDA, complex elements).
*
* @private
* @param {Array<number>} aReals - real-interleaved buffer of length `2 * FIXTURE_LDA * N`
* @param {NonNegativeInteger} N - matrix order
* @returns {Complex128Array} complex matrix view
*/
function buildA( aReals, N ) {
	var arr;
	var buf;
	var i;
	arr = new Complex128Array( FIXTURE_LDA * N );
	buf = new Float64Array( arr.buffer, arr.byteOffset, arr.length * 2 );
	for ( i = 0; i < aReals.length; i++ ) {
		buf[ i ] = aReals[ i ];
	}
	return arr;
}

/**
* Returns a Float64Array view over a Complex128Array.
*
* @private
* @param {Complex128Array} cmplxArr - complex array
* @returns {Float64Array} interleaved view
*/
function viewBuf( cmplxArr ) {
	return new Float64Array( cmplxArr.buffer, cmplxArr.byteOffset, cmplxArr.length * 2 );
}

/**
* Asserts approximate scalar equality.
*
* @private
* @param {number} actual - actual value
* @param {number} expected - expected value
* @param {number} tol - tolerance
* @param {string} msg - assertion message
*/
function assertClose( actual, expected, tol, msg ) {
	var relErr = Math.abs( actual - expected ) / Math.max( Math.abs( expected ), 1.0 ); // eslint-disable-line max-len
	assert.ok( relErr <= tol, format( '%s: expected %s, got %s', msg, expected, actual ) ); // eslint-disable-line max-len
}

/**
* Asserts Hermitian-triangle equality between two flat Fortran column-major buffers (real-interleaved, complex elements with stride FIXTURE_LDA).
*
* @private
* @param {Float64Array} actual - computed buffer
* @param {Array<number>} expected - reference buffer
* @param {string} uplo - `'upper'` or `'lower'`
* @param {NonNegativeInteger} N - order
* @param {number} tol - tolerance
* @param {string} msg - assertion message
*/
function assertTriangleClose( actual, expected, uplo, N, tol, msg ) {
	var idx;
	var i;
	var j;
	if ( uplo === 'upper' ) {
		for ( j = 0; j < N; j++ ) {
			for ( i = 0; i <= j; i++ ) {
				idx = 2 * ( i + ( j * FIXTURE_LDA ) );
				assertClose( actual[ idx ], expected[ idx ], tol, format( '%s.re[%d,%d]', msg, i, j ) ); // eslint-disable-line max-len
				assertClose( actual[ idx + 1 ], expected[ idx + 1 ], tol, format( '%s.im[%d,%d]', msg, i, j ) ); // eslint-disable-line max-len
			}
		}
	} else {
		for ( j = 0; j < N; j++ ) {
			for ( i = j; i < N; i++ ) {
				idx = 2 * ( i + ( j * FIXTURE_LDA ) );
				assertClose( actual[ idx ], expected[ idx ], tol, format( '%s.re[%d,%d]', msg, i, j ) ); // eslint-disable-line max-len
				assertClose( actual[ idx + 1 ], expected[ idx + 1 ], tol, format( '%s.im[%d,%d]', msg, i, j ) ); // eslint-disable-line max-len
			}
		}
	}
}

/**
* Runs a fixture-driven test case.
*
* @private
* @param {string} uplo - `'upper'` or `'lower'`
* @param {NonNegativeInteger} N - order
* @param {NonNegativeInteger} lwork - work buffer length in complex elements
* @param {string} caseName - fixture name
*/
function runFixture( uplo, N, lwork, caseName ) {
	var ipiv;
	var work;
	var info;
	var buf;
	var tc;
	var A;

	tc = findCase( caseName );

	A = buildA( tc.a_factored, N );
	ipiv = convertIpiv( tc.ipiv );
	work = new Complex128Array( lwork );

	info = zhetri2( uplo, N, A, 1, FIXTURE_LDA, 0, ipiv, 1, 0, work, 1, 0 );

	assert.equal( info, tc.info, caseName + ':info' );
	buf = viewBuf( A );
	assertTriangleClose( buf, tc.a_inv, uplo, N, 1e-10, caseName );
}


// TESTS //

test( 'zhetri2: 4x4 upper definite (1x1 pivots, dispatches to zhetri)', function t() {
	runFixture( 'upper', 4, 4, '4x4_upper_def' );
});

test( 'zhetri2: 4x4 lower definite (1x1 pivots, dispatches to zhetri)', function t() {
	runFixture( 'lower', 4, 4, '4x4_lower_def' );
});

test( 'zhetri2: 4x4 upper indefinite (2x2 pivots, dispatches to zhetri)', function t() {
	runFixture( 'upper', 4, 4, '4x4_upper_indef' );
});

test( 'zhetri2: 4x4 lower indefinite (2x2 pivots, dispatches to zhetri)', function t() {
	runFixture( 'lower', 4, 4, '4x4_lower_indef' );
});

test( 'zhetri2: 5x5 lower mixed pivots (dispatches to zhetri)', function t() {
	runFixture( 'lower', 5, 5, '5x5_lower_mixed' );
});

test( 'zhetri2: 40x40 upper definite, blocked path (dispatches to zhetri2x)', function t() {
	// N=40 exceeds the hardcoded NBMAX=32, so this exercises the blocked path.
	var lwork = ( 40 + 32 + 1 ) * ( 32 + 3 );
	runFixture( 'upper', 40, lwork, '40x40_upper_blocked' );
});

test( 'zhetri2: N=1 lower (trivial)', function t() {
	var ipiv;
	var work;
	var info;
	var arr;
	var buf;
	var tc;
	tc = findCase( 'n_one_lower' );
	arr = new Complex128Array( FIXTURE_LDA * 1 );
	buf = new Float64Array( arr.buffer, arr.byteOffset, arr.length * 2 );
	buf[ 0 ] = 5.0;
	buf[ 1 ] = 0.0;
	ipiv = new Int32Array( [ 0 ] );
	work = new Complex128Array( 1 );
	info = zhetri2( 'lower', 1, arr, 1, FIXTURE_LDA, 0, ipiv, 1, 0, work, 1, 0 );
	assert.equal( info, tc.info, 'info' );
	assertClose( buf[ 0 ], tc.a_inv[ 0 ], 1e-14, 'a_inv.re[0,0]' );
	assertClose( buf[ 1 ], tc.a_inv[ 1 ], 1e-14, 'a_inv.im[0,0]' );
});

test( 'zhetri2: N=0 quick return', function t() {
	var ipiv;
	var work;
	var info;
	var tc;
	var A;
	tc = findCase( 'n_zero' );
	A = new Complex128Array( 1 );
	ipiv = new Int32Array( 1 );
	work = new Complex128Array( 1 );
	info = zhetri2( 'lower', 0, A, 1, 1, 0, ipiv, 1, 0, work, 1, 0 );
	assert.equal( info, tc.info, 'info zero on N=0' );
});

test( 'zhetri2: throws TypeError for invalid uplo', function t() {
	assert.throws( function throws() {
		zhetri2( 'bogus', 1, new Complex128Array( 1 ), 1, 1, 0, new Int32Array( 1 ), 1, 0, new Complex128Array( 1 ), 1, 0 );
	}, TypeError );
});

test( 'zhetri2: throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		zhetri2( 'upper', -1, new Complex128Array( 1 ), 1, 1, 0, new Int32Array( 1 ), 1, 0, new Complex128Array( 1 ), 1, 0 );
	}, RangeError );
});

test( 'zhetri2: singular D returns positive info', function t() {
	// Construct a 2x2 case where D(1,1) = 0 with a 1x1 pivot encoded; dispatches to zhetri.
	var ipiv;
	var work;
	var info;
	var arr;
	var buf;

	arr = new Complex128Array( 2 * 2 );
	buf = new Float64Array( arr.buffer, arr.byteOffset, arr.length * 2 );

	// A is 2x2 lower with A(0,0) = 0 and a 1x1 pivot.
	buf[ 0 ] = 0.0; // A(0,0).re
	buf[ 1 ] = 0.0; // A(0,0).im
	buf[ 2 ] = 1.0; // A(1,0).re
	buf[ 3 ] = 0.0; // A(1,0).im
	buf[ 4 ] = 0.0; // A(0,1).re
	buf[ 5 ] = 0.0; // A(0,1).im
	buf[ 6 ] = 2.0; // A(1,1).re
	buf[ 7 ] = 0.0; // A(1,1).im
	ipiv = new Int32Array( [ 0, 1 ] );
	work = new Complex128Array( 2 );
	info = zhetri2( 'lower', 2, arr, 1, 2, 0, ipiv, 1, 0, work, 1, 0 );
	assert.equal( info, 1, 'info > 0 when D(1,1)=0' );
});
