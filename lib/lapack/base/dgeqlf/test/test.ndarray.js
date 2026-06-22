/* eslint-disable no-restricted-syntax, stdlib/first-unit-test, max-len */

// MODULES //

import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import base from './../lib/ndarray.js';
import ndarrayFn from './../lib/ndarray.js';


// FIXTURES //

var fixtureDir = path.join( import.meta.dirname, '..', '..', '..', '..', '..', 'test', 'fixtures' );
var lines = fs.readFileSync( path.join( fixtureDir, 'dgeqlf.jsonl' ), 'utf8' ).trim().split( '\n' ); // eslint-disable-line node/no-sync
var fixture = lines.map( parseLine );


// FUNCTIONS //

/**
* Parses a JSON line.
*
* @private
* @param {string} line - JSON line
* @returns {Object} parsed object
*/
function parseLine( line ) {
	return JSON.parse( line );
}

/**
* Finds a fixture case by name.
*
* @private
* @param {string} name - case name
* @returns {Object} fixture case
*/
function findCase( name ) {
	return fixture.find( matchName );

	/**
	* Name matcher.
	*
	* @private
	* @param {Object} t - test case
	* @returns {boolean} match
	*/
	function matchName( t ) {
		return t.name === name;
	}
}

/**
* Asserts that a scalar value is close to an expected value.
*
* @private
* @param {number} actual - actual value
* @param {number} expected - expected value
* @param {number} tol - relative tolerance
* @param {string} msg - message
*/
function assertClose( actual, expected, tol, msg ) {
	var relErr = Math.abs( actual - expected ) / Math.max( Math.abs( expected ), 1.0 );
	assert.ok( relErr <= tol, msg + ': expected ' + expected + ', got ' + actual );
}

/**
* Asserts that two arrays are element-wise close.
*
* @private
* @param {*} actual - actual array
* @param {*} expected - expected array
* @param {number} tol - relative tolerance
* @param {string} msg - message
*/
function assertArrayClose( actual, expected, tol, msg ) {
	var i;
	for ( i = 0; i < expected.length; i++ ) {
		assertClose( actual[ i ], expected[ i ], tol, msg + '[' + i + ']' );
	}
}


// TESTS //

test( 'base is a function', function t() {
	assert.strictEqual( typeof base, 'function', 'is a function' );
});

test( 'ndarray is a function', function t() {
	assert.strictEqual( typeof ndarrayFn, 'function', 'is a function' );
});

test( 'ndarray: 3x3 fixture via column-major layout (strideA1=1, strideA2=M)', function t() {
	var WORK;
	var info;
	var TAU;
	var src;
	var tc;
	var A;

	tc = findCase( '3x3' );
	src = [ 2, 1, 3, 1, 4, 2, 3, 2, 5 ];
	A = new Float64Array( src );
	TAU = new Float64Array( 3 );
	WORK = new Float64Array( 3 );
	info = ndarrayFn( 3, 3, A, 1, 3, 0, TAU, 1, 0, WORK, 1, 0, WORK.length );
	assert.equal( info, tc.INFO, 'info' );
	assertArrayClose( A, tc.A, 1e-13, 'A' );
	assertArrayClose( TAU, tc.TAU, 1e-13, 'TAU' );
});

test( 'ndarray: 3x3 fixture via row-major layout (strideA1=N, strideA2=1)', function t() {
	var cmSrc;
	var WORK;
	var info;
	var TAU;
	var tc;
	var M;
	var N;
	var A;
	var i;
	var j;

	tc = findCase( '3x3' );
	cmSrc = [ 2, 1, 3, 1, 4, 2, 3, 2, 5 ];
	M = 3;
	N = 3;
	A = new Float64Array( M * N );
	for ( j = 0; j < N; j++ ) {
		for ( i = 0; i < M; i++ ) {
			A[ ( i * N ) + j ] = cmSrc[ i + ( j * M ) ];
		}
	}
	TAU = new Float64Array( 3 );
	WORK = new Float64Array( 3 );
	info = ndarrayFn( M, N, A, N, 1, 0, TAU, 1, 0, WORK, 1, 0, WORK.length );
	assert.equal( info, tc.INFO, 'info' );
	for ( j = 0; j < N; j++ ) {
		for ( i = 0; i < M; i++ ) {
			assertClose( A[ ( i * N ) + j ], tc.A[ i + ( j * M ) ], 1e-13, 'A[' + i + ',' + j + ']' );
		}
	}
	assertArrayClose( TAU, tc.TAU, 1e-13, 'TAU' );
});

test( 'ndarray: honors offsetA with sentinel padding', function t() {
	var SENTINEL;
	var offsetA;
	var WORK;
	var info;
	var TAU;
	var pad;
	var buf;
	var src;
	var tc;
	var k;

	tc = findCase( '3x3' );
	src = [ 2, 1, 3, 1, 4, 2, 3, 2, 5 ];
	SENTINEL = -9.99e99;
	offsetA = 4;
	pad = 3;
	buf = new Float64Array( offsetA + src.length + pad );
	for ( k = 0; k < buf.length; k++ ) {
		buf[ k ] = SENTINEL;
	}
	for ( k = 0; k < src.length; k++ ) {
		buf[ offsetA + k ] = src[ k ];
	}
	TAU = new Float64Array( 3 );
	WORK = new Float64Array( 3 );
	info = ndarrayFn( 3, 3, buf, 1, 3, offsetA, TAU, 1, 0, WORK, 1, 0, WORK.length );
	assert.equal( info, tc.INFO, 'info' );
	for ( k = 0; k < offsetA; k++ ) {
		assert.strictEqual( buf[ k ], SENTINEL, 'pre-sentinel[' + k + ']' );
	}
	for ( k = 0; k < pad; k++ ) {
		assert.strictEqual( buf[ offsetA + src.length + k ], SENTINEL, 'post-sentinel[' + k + ']' );
	}
	for ( k = 0; k < tc.A.length; k++ ) {
		assertClose( buf[ offsetA + k ], tc.A[ k ], 1e-13, 'A[' + k + ']' );
	}
	assertArrayClose( TAU, tc.TAU, 1e-13, 'TAU' );
});

test( 'ndarray: honors offsetTAU with sentinel padding', function t() {
	var offsetTAU;
	var SENTINEL;
	var tauPad;
	var WORK;
	var info;
	var TAU;
	var src;
	var tc;
	var A;
	var k;

	tc = findCase( '4x3' );
	src = [ 2, 1, 3, 1, 1, 4, 2, 3, 3, 2, 5, 1 ];
	A = new Float64Array( src );
	SENTINEL = 7.77e77;
	offsetTAU = 2;
	tauPad = 2;
	TAU = new Float64Array( offsetTAU + 3 + tauPad );
	for ( k = 0; k < TAU.length; k++ ) {
		TAU[ k ] = SENTINEL;
	}
	WORK = new Float64Array( 16 );
	info = ndarrayFn( 4, 3, A, 1, 4, 0, TAU, 1, offsetTAU, WORK, 1, 0, WORK.length );
	assert.equal( info, tc.INFO, 'info' );
	for ( k = 0; k < offsetTAU; k++ ) {
		assert.strictEqual( TAU[ k ], SENTINEL, 'pre-TAU-sentinel[' + k + ']' );
	}
	for ( k = 0; k < tauPad; k++ ) {
		assert.strictEqual( TAU[ offsetTAU + 3 + k ], SENTINEL, 'post-TAU-sentinel[' + k + ']' );
	}
	for ( k = 0; k < tc.TAU.length; k++ ) {
		assertClose( TAU[ offsetTAU + k ], tc.TAU[ k ], 1e-13, 'TAU[' + k + ']' );
	}
	assertArrayClose( A, tc.A, 1e-13, 'A' );
});

test( 'ndarray: 3x4 (wide) fixture', function t() {
	var WORK;
	var info;
	var TAU;
	var src;
	var tc;
	var A;

	tc = findCase( '3x4' );
	src = [ 2, 1, 3, 1, 4, 2, 3, 2, 5, 4, 1, 2 ];
	A = new Float64Array( src );
	TAU = new Float64Array( 3 );
	WORK = new Float64Array( 4 );
	info = ndarrayFn( 3, 4, A, 1, 3, 0, TAU, 1, 0, WORK, 1, 0, WORK.length );
	assert.equal( info, tc.INFO, 'info' );
	assertArrayClose( A, tc.A, 1e-13, 'A' );
	assertArrayClose( TAU, tc.TAU, 1e-13, 'TAU' );
});

test( 'ndarray: N=0 quick return', function t() {
	var WORK;
	var info;
	var TAU;
	var A;

	A = new Float64Array( 0 );
	TAU = new Float64Array( 0 );
	WORK = new Float64Array( 0 );
	info = ndarrayFn( 3, 0, A, 1, 3, 0, TAU, 1, 0, WORK, 1, 0, 0 );
	assert.equal( info, 0, 'info' );
});

test( 'ndarray: M=0 quick return', function t() {
	var WORK;
	var info;
	var TAU;
	var A;

	A = new Float64Array( 0 );
	TAU = new Float64Array( 0 );
	WORK = new Float64Array( 0 );
	info = ndarrayFn( 0, 3, A, 1, 0, 0, TAU, 1, 0, WORK, 1, 0, 0 );
	assert.equal( info, 0, 'info' );
});

test( 'ndarray: allocates internal workspace when none provided', function t() {
	var info;
	var TAU;
	var src;
	var tc;
	var A;

	tc = findCase( '3x3' );
	src = [ 2, 1, 3, 1, 4, 2, 3, 2, 5 ];
	A = new Float64Array( src );
	TAU = new Float64Array( 3 );
	info = ndarrayFn( 3, 3, A, 1, 3, 0, TAU, 1, 0, null, 1, 0, 3 );
	assert.equal( info, tc.INFO, 'info' );
	assertArrayClose( A, tc.A, 1e-13, 'A' );
	assertArrayClose( TAU, tc.TAU, 1e-13, 'TAU' );
});

test( 'ndarray: large 150x150 exercises blocked path', function t() {
	var WORK;
	var info;
	var TAU;
	var tc;
	var N;
	var A;
	var i;
	var j;

	tc = findCase( 'large_150x150' );
	N = 150;
	A = new Float64Array( N * N );

	// Diagonal-dominant well-conditioned matrix (matches Fortran test).
	for ( j = 0; j < N; j++ ) {
		for ( i = 0; i < N; i++ ) {
			if ( i === j ) {
				A[ i + ( j * N ) ] = 10.0;
			} else {
				A[ i + ( j * N ) ] = 1.0 / ( Math.abs( i - j ) + 1 );
			}
		}
	}
	TAU = new Float64Array( N );
	WORK = new Float64Array( N * 64 );
	info = ndarrayFn( N, N, A, 1, N, 0, TAU, 1, 0, WORK, 1, 0, WORK.length );
	assert.equal( info, tc.INFO, 'info' );
	assertArrayClose( A, tc.A, 1e-10, 'A' );
	assertArrayClose( TAU, tc.TAU, 1e-10, 'TAU' );
});

test( 'ndarray: LDA > M (column-major with extra padding rows)', function t() {
	var SENTINEL;
	var WORK;
	var info;
	var TAU;
	var lda;
	var buf;
	var src;
	var tc;
	var M;
	var N;
	var i;
	var j;

	tc = findCase( '3x3' );
	src = [ 2, 1, 3, 1, 4, 2, 3, 2, 5 ];
	M = 3;
	N = 3;
	lda = 5;
	SENTINEL = 1.23e45;
	buf = new Float64Array( lda * N );
	for ( i = 0; i < buf.length; i++ ) {
		buf[ i ] = SENTINEL;
	}
	for ( j = 0; j < N; j++ ) {
		for ( i = 0; i < M; i++ ) {
			buf[ i + ( j * lda ) ] = src[ i + ( j * M ) ];
		}
	}
	TAU = new Float64Array( 3 );
	WORK = new Float64Array( 3 );
	info = ndarrayFn( M, N, buf, 1, lda, 0, TAU, 1, 0, WORK, 1, 0, WORK.length );
	assert.equal( info, tc.INFO, 'info' );
	for ( j = 0; j < N; j++ ) {
		for ( i = M; i < lda; i++ ) {
			assert.strictEqual( buf[ i + ( j * lda ) ], SENTINEL, 'padding[' + i + ',' + j + ']' );
		}
	}
	for ( j = 0; j < N; j++ ) {
		for ( i = 0; i < M; i++ ) {
			assertClose( buf[ i + ( j * lda ) ], tc.A[ i + ( j * M ) ], 1e-13, 'A[' + i + ',' + j + ']' );
		}
	}
	assertArrayClose( TAU, tc.TAU, 1e-13, 'TAU' );
});
