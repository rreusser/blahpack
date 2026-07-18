/* eslint-disable no-restricted-syntax, stdlib/first-unit-test, max-len */

// MODULES //

import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import base from './../lib/ndarray.js';
const ndarrayFn = base;


// FIXTURES //

const fixtureDir = path.join( import.meta.dirname, '..', '..', '..', '..', '..', 'test', 'fixtures' );
const lines = fs.readFileSync( path.join( fixtureDir, 'dgeqlf.jsonl' ), 'utf8' ).trim().split( '\n' ); // eslint-disable-line node/no-sync
const fixture = lines.map( parseLine );


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
	const relErr = Math.abs( actual - expected ) / Math.max( Math.abs( expected ), 1.0 );
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
	let i;
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

	const tc = findCase( '3x3' );
	const src = [ 2, 1, 3, 1, 4, 2, 3, 2, 5 ];
	const A = new Float64Array( src );
	const TAU = new Float64Array( 3 );
	const WORK = new Float64Array( 3 );
	const info = ndarrayFn( 3, 3, A, 1, 3, 0, TAU, 1, 0, WORK, 1, 0 );
	assert.equal( info, tc.INFO, 'info' );
	assertArrayClose( A, tc.A, 1e-13, 'A' );
	assertArrayClose( TAU, tc.TAU, 1e-13, 'TAU' );
});

test( 'ndarray: 3x3 fixture via row-major layout (strideA1=N, strideA2=1)', function t() {
	let i, j;

	const tc = findCase( '3x3' );
	const cmSrc = [ 2, 1, 3, 1, 4, 2, 3, 2, 5 ];
	const M = 3;
	const N = 3;
	const A = new Float64Array( M * N );
	for ( j = 0; j < N; j++ ) {
		for ( i = 0; i < M; i++ ) {
			A[ ( i * N ) + j ] = cmSrc[ i + ( j * M ) ];
		}
	}
	const TAU = new Float64Array( 3 );
	const WORK = new Float64Array( 3 );
	const info = ndarrayFn( M, N, A, N, 1, 0, TAU, 1, 0, WORK, 1, 0 );
	assert.equal( info, tc.INFO, 'info' );
	for ( j = 0; j < N; j++ ) {
		for ( i = 0; i < M; i++ ) {
			assertClose( A[ ( i * N ) + j ], tc.A[ i + ( j * M ) ], 1e-13, 'A[' + i + ',' + j + ']' );
		}
	}
	assertArrayClose( TAU, tc.TAU, 1e-13, 'TAU' );
});

test( 'ndarray: honors offsetA with sentinel padding', function t() {
	let k;

	const tc = findCase( '3x3' );
	const src = [ 2, 1, 3, 1, 4, 2, 3, 2, 5 ];
	const SENTINEL = -9.99e99;
	const offsetA = 4;
	const pad = 3;
	const buf = new Float64Array( offsetA + src.length + pad );
	for ( k = 0; k < buf.length; k++ ) {
		buf[ k ] = SENTINEL;
	}
	for ( k = 0; k < src.length; k++ ) {
		buf[ offsetA + k ] = src[ k ];
	}
	const TAU = new Float64Array( 3 );
	const WORK = new Float64Array( 3 );
	const info = ndarrayFn( 3, 3, buf, 1, 3, offsetA, TAU, 1, 0, WORK, 1, 0 );
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
	let k;

	const tc = findCase( '4x3' );
	const src = [ 2, 1, 3, 1, 1, 4, 2, 3, 3, 2, 5, 1 ];
	const A = new Float64Array( src );
	const SENTINEL = 7.77e77;
	const offsetTAU = 2;
	const tauPad = 2;
	const TAU = new Float64Array( offsetTAU + 3 + tauPad );
	for ( k = 0; k < TAU.length; k++ ) {
		TAU[ k ] = SENTINEL;
	}
	const WORK = new Float64Array( 16 );
	const info = ndarrayFn( 4, 3, A, 1, 4, 0, TAU, 1, offsetTAU, WORK, 1, 0 );
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

	const tc = findCase( '3x4' );
	const src = [ 2, 1, 3, 1, 4, 2, 3, 2, 5, 4, 1, 2 ];
	const A = new Float64Array( src );
	const TAU = new Float64Array( 3 );
	const WORK = new Float64Array( 4 );
	const info = ndarrayFn( 3, 4, A, 1, 3, 0, TAU, 1, 0, WORK, 1, 0 );
	assert.equal( info, tc.INFO, 'info' );
	assertArrayClose( A, tc.A, 1e-13, 'A' );
	assertArrayClose( TAU, tc.TAU, 1e-13, 'TAU' );
});

test( 'ndarray: N=0 quick return', function t() {

	const A = new Float64Array( 0 );
	const TAU = new Float64Array( 0 );
	const WORK = new Float64Array( 0 );
	const info = ndarrayFn( 3, 0, A, 1, 3, 0, TAU, 1, 0, WORK, 1, 0 );
	assert.equal( info, 0, 'info' );
});

test( 'ndarray: M=0 quick return', function t() {

	const A = new Float64Array( 0 );
	const TAU = new Float64Array( 0 );
	const WORK = new Float64Array( 0 );
	const info = ndarrayFn( 0, 3, A, 1, 0, 0, TAU, 1, 0, WORK, 1, 0 );
	assert.equal( info, 0, 'info' );
});

test( 'ndarray: throws RangeError when WORK is null', function t() {
	assert.throws( function () {
		ndarrayFn( 3, 3, new Float64Array( 9 ), 1, 3, 0, new Float64Array( 3 ), 1, 0, null, 1, 0 );
	}, RangeError );
});

test( 'ndarray: large 150x150 exercises blocked path', function t() {
	let i, j;

	const tc = findCase( 'large_150x150' );
	const N = 150;
	const A = new Float64Array( N * N );

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
	const TAU = new Float64Array( N );
	const WORK = new Float64Array( N * 64 );
	const info = ndarrayFn( N, N, A, 1, N, 0, TAU, 1, 0, WORK, 1, 0 );
	assert.equal( info, tc.INFO, 'info' );
	assertArrayClose( A, tc.A, 1e-10, 'A' );
	assertArrayClose( TAU, tc.TAU, 1e-10, 'TAU' );
});

test( 'ndarray: LDA > M (column-major with extra padding rows)', function t() {
	let i, j;

	const tc = findCase( '3x3' );
	const src = [ 2, 1, 3, 1, 4, 2, 3, 2, 5 ];
	const M = 3;
	const N = 3;
	const lda = 5;
	const SENTINEL = 1.23e45;
	const buf = new Float64Array( lda * N );
	for ( i = 0; i < buf.length; i++ ) {
		buf[ i ] = SENTINEL;
	}
	for ( j = 0; j < N; j++ ) {
		for ( i = 0; i < M; i++ ) {
			buf[ i + ( j * lda ) ] = src[ i + ( j * M ) ];
		}
	}
	const TAU = new Float64Array( 3 );
	const WORK = new Float64Array( 3 );
	const info = ndarrayFn( M, N, buf, 1, lda, 0, TAU, 1, 0, WORK, 1, 0 );
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
