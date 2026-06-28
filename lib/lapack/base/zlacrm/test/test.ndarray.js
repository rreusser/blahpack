/**
* @license Apache-2.0
*
* Copyright (c) 2026 Ricky Reusser.
*
* Derived from the LAPACK 3.12.0 reference implementation (BSD-3-Clause).
*/

/* eslint-disable no-restricted-syntax, stdlib/first-unit-test, max-len */

// MODULES //

import { resolve } from 'node:path';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import base from './../lib/ndarray.js';
var ndarray = base;
import zlacrm from './../lib/zlacrm.js';


// VARIABLES //

var FIXTURE_PATH = resolve( import.meta.dirname, '..', '..', '..', '..', '..', 'test', 'fixtures', 'zlacrm.jsonl' );
var FIXTURES = loadFixtures();


// FUNCTIONS //

/**
* Loads the JSONL fixture file and returns an object keyed by case name.
*
* @private
* @returns {Object} fixture cases
*/
function loadFixtures() {
	var lines;
	var cases;
	var rec;
	var i;
	lines = readFileSync( FIXTURE_PATH, 'utf8' ).split( '\n' ); // eslint-disable-line node/no-sync
	cases = {};
	for ( i = 0; i < lines.length; i++ ) {
		if ( lines[ i ].length === 0 ) {
			continue;
		}
		rec = JSON.parse( lines[ i ] );
		cases[ rec.name ] = rec;
	}
	return cases;
}

/**
* Asserts that two real-valued arrays are close in absolute terms.
*
* @private
* @param {(Float64Array|Array)} actual - actual values
* @param {(Float64Array|Array)} expected - expected values
* @param {number} tol - absolute tolerance
* @param {string} msg - assertion message prefix
*/
function assertArrayClose( actual, expected, tol, msg ) {
	var i;
	assert.equal( actual.length, expected.length, msg + ': length mismatch' );
	for ( i = 0; i < expected.length; i++ ) {
		assert.ok( Math.abs( actual[ i ] - expected[ i ] ) <= tol, msg + '[' + i + ']: expected ' + expected[ i ] + ', got ' + actual[ i ] );
	}
}

/**
* Copies a typed array into a plain Array (replacement for `Array.from`).
*
* @private
* @param {Float64Array} arr - source array
* @returns {Array} plain Array copy
*/
function toArray( arr ) {
	var out;
	var i;
	out = [];
	for ( i = 0; i < arr.length; i++ ) {
		out.push( arr[ i ] );
	}
	return out;
}


// TESTS //

test( 'base is a function', function t() {
	assert.strictEqual( typeof base, 'function', 'is a function' );
});

test( 'ndarray is a function', function t() {
	assert.strictEqual( typeof ndarray, 'function', 'is a function' );
});

test( 'zlacrm.base: basic 3x3 matches Fortran fixture', function t() {
	var RWORK;
	var tc;
	var M;
	var N;
	var A;
	var B;
	var C;
	tc = FIXTURES.basic_3x3;
	M = tc.M;
	N = tc.N;
	A = new Complex128Array( new Float64Array( tc.A ) );
	B = new Float64Array( tc.B );
	C = new Complex128Array( M * N );
	RWORK = new Float64Array( 2 * M * N );
	base( M, N, A, 1, M, 0, B, 1, N, 0, C, 1, M, 0, RWORK, 1, 0 );
	assertArrayClose( reinterpret( C, 0 ), tc.C, 1e-12, 'C' );
});

test( 'zlacrm.base: rectangular 4x2 matches Fortran fixture', function t() {
	var RWORK;
	var tc;
	var M;
	var N;
	var A;
	var B;
	var C;
	tc = FIXTURES.rect_4x2;
	M = tc.M;
	N = tc.N;
	A = new Complex128Array( new Float64Array( tc.A ) );
	B = new Float64Array( tc.B );
	C = new Complex128Array( M * N );
	RWORK = new Float64Array( 2 * M * N );
	base( M, N, A, 1, M, 0, B, 1, N, 0, C, 1, M, 0, RWORK, 1, 0 );
	assertArrayClose( reinterpret( C, 0 ), tc.C, 1e-12, 'C' );
});

test( 'zlacrm.base: rectangular 2x4 matches Fortran fixture', function t() {
	var RWORK;
	var tc;
	var M;
	var N;
	var A;
	var B;
	var C;
	tc = FIXTURES.rect_2x4;
	M = tc.M;
	N = tc.N;
	A = new Complex128Array( new Float64Array( tc.A ) );
	B = new Float64Array( tc.B );
	C = new Complex128Array( M * N );
	RWORK = new Float64Array( 2 * M * N );
	base( M, N, A, 1, M, 0, B, 1, N, 0, C, 1, M, 0, RWORK, 1, 0 );
	assertArrayClose( reinterpret( C, 0 ), tc.C, 1e-12, 'C' );
});

test( 'zlacrm.base: 1x1 case matches Fortran fixture', function t() {
	var RWORK;
	var tc;
	var M;
	var N;
	var A;
	var B;
	var C;
	tc = FIXTURES.one_by_one;
	M = tc.M;
	N = tc.N;
	A = new Complex128Array( new Float64Array( tc.A ) );
	B = new Float64Array( tc.B );
	C = new Complex128Array( M * N );
	RWORK = new Float64Array( 2 * M * N );
	base( M, N, A, 1, M, 0, B, 1, N, 0, C, 1, M, 0, RWORK, 1, 0 );
	assertArrayClose( reinterpret( C, 0 ), tc.C, 1e-12, 'C' );
});

test( 'zlacrm.base: M=0 quick return leaves C unchanged', function t() {
	var RWORK;
	var saved;
	var M;
	var N;
	var A;
	var B;
	var C;
	M = 0;
	N = 3;
	A = new Complex128Array( 1 );
	B = new Float64Array( N * N );
	C = new Complex128Array( [ 1.0, 2.0, 3.0, 4.0, 5.0, 6.0 ] );
	RWORK = new Float64Array( 1 );
	saved = toArray( reinterpret( C, 0 ) );
	base( M, N, A, 1, M, 0, B, 1, N, 0, C, 1, M, 0, RWORK, 1, 0 );
	assertArrayClose( reinterpret( C, 0 ), saved, 0.0, 'C unchanged' );
});

test( 'zlacrm.base: N=0 quick return leaves C unchanged', function t() {
	var RWORK;
	var saved;
	var M;
	var N;
	var A;
	var B;
	var C;
	M = 3;
	N = 0;
	A = new Complex128Array( M );
	B = new Float64Array( 1 );
	C = new Complex128Array( [ 1.0, 2.0, 3.0, 4.0, 5.0, 6.0 ] );
	RWORK = new Float64Array( 1 );
	saved = toArray( reinterpret( C, 0 ) );
	base( M, N, A, 1, M, 0, B, 1, N, 0, C, 1, M, 0, RWORK, 1, 0 );
	assertArrayClose( reinterpret( C, 0 ), saved, 0.0, 'C unchanged' );
});

test( 'zlacrm.base: row-major (transposed) strides give same result as column-major', function t() {
	var actualCol;
	var RWORK;
	var Arow;
	var Brow;
	var Crow;
	var Arv;
	var Cv;
	var tc;
	var M;
	var N;
	var i;
	var j;
	tc = FIXTURES.basic_3x3;
	M = tc.M;
	N = tc.N;

	// Convert column-major fixture to row-major Complex128Array for A:
	Arow = new Complex128Array( M * N );
	Arv = reinterpret( Arow, 0 );
	for ( j = 0; j < N; j++ ) {
		for ( i = 0; i < M; i++ ) {
			Arv[ ( ( i * N ) + j ) * 2 ] = tc.A[ ( ( j * M ) + i ) * 2 ];
			Arv[ ( ( ( i * N ) + j ) * 2 ) + 1 ] = tc.A[ ( ( ( j * M ) + i ) * 2 ) + 1 ];
		}
	}

	// Convert column-major B to row-major Float64Array:
	Brow = new Float64Array( N * N );
	for ( j = 0; j < N; j++ ) {
		for ( i = 0; i < N; i++ ) {
			Brow[ ( i * N ) + j ] = tc.B[ ( j * N ) + i ];
		}
	}
	Crow = new Complex128Array( M * N );
	RWORK = new Float64Array( 2 * M * N );
	base( M, N, Arow, N, 1, 0, Brow, N, 1, 0, Crow, N, 1, 0, RWORK, 1, 0 );

	// Transpose result back to column-major for comparison against fixture:
	actualCol = new Float64Array( 2 * M * N );
	Cv = reinterpret( Crow, 0 );
	for ( j = 0; j < N; j++ ) {
		for ( i = 0; i < M; i++ ) {
			actualCol[ ( ( j * M ) + i ) * 2 ] = Cv[ ( ( i * N ) + j ) * 2 ];
			actualCol[ ( ( ( j * M ) + i ) * 2 ) + 1 ] = Cv[ ( ( ( i * N ) + j ) * 2 ) + 1 ];
		}
	}
	assertArrayClose( actualCol, tc.C, 1e-12, 'C row-major' );
});

test( 'zlacrm.ndarray throws RangeError for negative M', function t() {
	assert.throws( function throws() {
		ndarray( -1, 2, new Complex128Array( 4 ), 1, 1, 0, new Float64Array( 4 ), 1, 2, 0, new Complex128Array( 4 ), 1, 1, 0, new Float64Array( 8 ), 1, 0 );
	}, RangeError );
});

test( 'zlacrm.ndarray throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		ndarray( 2, -1, new Complex128Array( 4 ), 1, 1, 0, new Float64Array( 4 ), 1, 2, 0, new Complex128Array( 4 ), 1, 1, 0, new Float64Array( 8 ), 1, 0 );
	}, RangeError );
});

test( 'zlacrm.ndarray returns C unchanged for M=0 quick return', function t() {
	var ret;
	var C;
	C = new Complex128Array( [ 1.0, 2.0 ] );
	ret = ndarray( 0, 1, new Complex128Array( 1 ), 1, 1, 0, new Float64Array( 1 ), 1, 1, 0, C, 1, 1, 0, new Float64Array( 1 ), 1, 0 );
	assert.strictEqual( ret, C );
});

test( 'zlacrm.ndarray delegates to base for normal case', function t() {
	var RWORK;
	var tc;
	var M;
	var N;
	var A;
	var B;
	var C;
	tc = FIXTURES.rect_2x4;
	M = tc.M;
	N = tc.N;
	A = new Complex128Array( new Float64Array( tc.A ) );
	B = new Float64Array( tc.B );
	C = new Complex128Array( M * N );
	RWORK = new Float64Array( 2 * M * N );
	ndarray( M, N, A, 1, M, 0, B, 1, N, 0, C, 1, M, 0, RWORK, 1, 0 );
	assertArrayClose( reinterpret( C, 0 ), tc.C, 1e-12, 'C' );
});

test( 'zlacrm (column-major layout) matches Fortran fixture', function t() {
	var RWORK;
	var tc;
	var M;
	var N;
	var A;
	var B;
	var C;
	tc = FIXTURES.rect_4x2;
	M = tc.M;
	N = tc.N;
	A = new Complex128Array( new Float64Array( tc.A ) );
	B = new Float64Array( tc.B );
	C = new Complex128Array( M * N );
	RWORK = new Float64Array( 2 * M * N );
	zlacrm( 'column-major', M, N, A, M, B, N, C, M, RWORK );
	assertArrayClose( reinterpret( C, 0 ), tc.C, 1e-12, 'C' );
});
