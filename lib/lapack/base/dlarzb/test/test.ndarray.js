/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import format from '@stdlib/string/format/lib/index.js';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dlarzb from './../lib/ndarray.js';
import assert from 'node:assert/strict';


// VARIABLES //

const fixtureDir = path.join( import.meta.dirname, '..', '..', '..', '..', '..', 'test', 'fixtures' );
const fixtureData = readFileSync( path.join( fixtureDir, 'dlarzb.jsonl' ), 'utf8' ).trim().split( '\n' ); // eslint-disable-line node/no-sync, max-len
const fixture = fixtureData.map( function parse( line ) {
	return JSON.parse( line );
});

const LDV = 6;
const LDT = 6;
const LDC = 8;
const LDW = 8;


// FUNCTIONS //

/**
* Finds a test case by name.
*
* @private
* @param {string} name - test case name
* @returns {Object} test case
*/
function findCase( name ) {
	return fixture.find( function find( t ) {
		return t.name === name;
	});
}

/**
* Asserts that two arrays are element-wise approximately equal.
*
* @private
* @param {Array} actual - actual values
* @param {Array} expected - expected values
* @param {number} tol - tolerance
* @param {string} msg - assertion message
* @throws {Error} arrays must be element-wise close
*/
function assertArrayClose( actual, expected, tol, msg ) {
	let relErr, i;
	if ( actual.length !== expected.length ) {
		throw new Error( format( '%s: length mismatch: %d vs %d', msg, actual.length, expected.length ) ); // eslint-disable-line max-len
	}
	for ( i = 0; i < expected.length; i++ ) {
		relErr = Math.abs( actual[ i ] - expected[ i ] ) / Math.max( Math.abs( expected[ i ] ), 1.0 ); // eslint-disable-line max-len
		if ( relErr > tol ) {
			throw new Error( format( '%s[%d]: expected %f, got %f', msg, i, expected[ i ], actual[ i ] ) ); // eslint-disable-line max-len
		}
	}
}

/**
* Builds a K-by-L V matrix (column-major, leading dim LDV) from a row-major list of values.
*
* @private
* @param {integer} K - rows
* @param {integer} L - columns
* @param {Array<number>} rows - K*L values listed row-by-row
* @returns {Float64Array} V buffer of size K*LDV
*/
function buildV( K, L, rows ) {
	let i, j;
	const V = new Float64Array( LDV * LDV );
	for ( i = 0; i < K; i++ ) {
		for ( j = 0; j < L; j++ ) {
			V[ i + ( j * LDV ) ] = rows[ ( i * L ) + j ];
		}
	}
	return V;
}

/**
* Builds a K-by-K lower triangular T (column-major, leading dim LDT).
*
* @private
* @param {integer} K - order
* @param {Array<number>} rows - K*K row-major values (upper part ignored)
* @returns {Float64Array} T buffer
*/
function buildT( K, rows ) {
	let i, j;
	const T = new Float64Array( LDT * LDT );
	for ( i = 0; i < K; i++ ) {
		for ( j = 0; j <= i; j++ ) {
			T[ i + ( j * LDT ) ] = rows[ ( i * K ) + j ];
		}
	}
	return T;
}

/**
* Builds an M-by-N C matrix from a function of (i, j), column-major with leading dim LDC.
*
* @private
* @param {integer} M - rows
* @param {integer} N - columns
* @param {Function} fn - fn(i, j) returning the value at 1-based position (i, j)
* @returns {Float64Array} C buffer
*/
function buildC( M, N, fn ) {
	let i, j;
	const C = new Float64Array( LDC * LDC );
	for ( j = 1; j <= N; j++ ) {
		for ( i = 1; i <= M; i++ ) {
			C[ ( i - 1 ) + ( ( j - 1 ) * LDC ) ] = fn( i, j );
		}
	}
	return C;
}

/**
* Extracts the M-by-N submatrix from a column-major buffer into a packed column-major array.
*
* @private
* @param {Float64Array} C - source buffer
* @param {integer} M - rows
* @param {integer} N - columns
* @param {integer} ld - leading dimension
* @returns {Array} packed M*N array
*/
function extractC( C, M, N, ld ) {
	let i, j;
	const out = [];
	for ( j = 0; j < N; j++ ) {
		for ( i = 0; i < M; i++ ) {
			out.push( C[ i + ( j * ld ) ] );
		}
	}
	return out;
}


// TESTS //

test( 'dlarzb: SIDE=left TRANS=no-transpose, M=5 N=4 K=2 L=3', function t() {

	const tc = findCase( 'left_notrans_m5_n4_k2_l3' );
	const M = 5;
	const N = 4;
	const K = 2;
	const L = 3;

	const V = buildV( K, L, [ 0.2, -0.1, 0.3, 0.4, 0.5, -0.2 ] );
	const T = buildT( K, [ 0.7, 0.0, 0.3, 0.5 ] );
	const C = buildC( M, N, function fn( i, j ) {
		return i + ( 0.1 * j );
	});
	const WORK = new Float64Array( LDW * LDW );

	dlarzb( 'left', 'no-transpose', 'backward', 'rowwise', M, N, K, L, V, 1, LDV, 0, T, 1, LDT, 0, C, 1, LDC, 0, WORK, 1, LDW, 0 );
	assertArrayClose( extractC( C, M, N, LDC ), tc.C, 1e-12, 'C' );
});

test( 'dlarzb: SIDE=left TRANS=transpose, M=5 N=4 K=2 L=3', function t() {

	const tc = findCase( 'left_trans_m5_n4_k2_l3' );
	const M = 5;
	const N = 4;
	const K = 2;
	const L = 3;

	const V = buildV( K, L, [ 0.2, -0.1, 0.3, 0.4, 0.5, -0.2 ] );
	const T = buildT( K, [ 0.7, 0.0, 0.3, 0.5 ] );
	const C = buildC( M, N, function fn( i, j ) {
		return i + ( 0.1 * j );
	});
	const WORK = new Float64Array( LDW * LDW );

	dlarzb( 'left', 'transpose', 'backward', 'rowwise', M, N, K, L, V, 1, LDV, 0, T, 1, LDT, 0, C, 1, LDC, 0, WORK, 1, LDW, 0 );
	assertArrayClose( extractC( C, M, N, LDC ), tc.C, 1e-12, 'C' );
});

test( 'dlarzb: SIDE=right TRANS=no-transpose, M=4 N=5 K=2 L=3', function t() {

	const tc = findCase( 'right_notrans_m4_n5_k2_l3' );
	const M = 4;
	const N = 5;
	const K = 2;
	const L = 3;

	const V = buildV( K, L, [ 0.2, -0.1, 0.3, 0.4, 0.5, -0.2 ] );
	const T = buildT( K, [ 0.7, 0.0, 0.3, 0.5 ] );
	const C = buildC( M, N, function fn( i, j ) {
		return i + ( 0.1 * j );
	});
	const WORK = new Float64Array( LDW * LDW );

	dlarzb( 'right', 'no-transpose', 'backward', 'rowwise', M, N, K, L, V, 1, LDV, 0, T, 1, LDT, 0, C, 1, LDC, 0, WORK, 1, LDW, 0 );
	assertArrayClose( extractC( C, M, N, LDC ), tc.C, 1e-12, 'C' );
});

test( 'dlarzb: SIDE=right TRANS=transpose, M=4 N=5 K=2 L=3', function t() {

	const tc = findCase( 'right_trans_m4_n5_k2_l3' );
	const M = 4;
	const N = 5;
	const K = 2;
	const L = 3;

	const V = buildV( K, L, [ 0.2, -0.1, 0.3, 0.4, 0.5, -0.2 ] );
	const T = buildT( K, [ 0.7, 0.0, 0.3, 0.5 ] );
	const C = buildC( M, N, function fn( i, j ) {
		return i + ( 0.1 * j );
	});
	const WORK = new Float64Array( LDW * LDW );

	dlarzb( 'right', 'transpose', 'backward', 'rowwise', M, N, K, L, V, 1, LDV, 0, T, 1, LDT, 0, C, 1, LDC, 0, WORK, 1, LDW, 0 );
	assertArrayClose( extractC( C, M, N, LDC ), tc.C, 1e-12, 'C' );
});

test( 'dlarzb: L=0 degenerate case', function t() {

	const tc = findCase( 'left_notrans_l0' );
	const M = 4;
	const N = 3;
	const K = 2;
	const L = 0;

	const V = new Float64Array( LDV * LDV );
	const T = buildT( K, [ 0.6, 0.0, 0.2, 0.4 ] );
	const C = buildC( M, N, function fn( i, j ) {
		return ( 2 * i ) - j;
	});
	const WORK = new Float64Array( LDW * LDW );

	dlarzb( 'left', 'no-transpose', 'backward', 'rowwise', M, N, K, L, V, 1, LDV, 0, T, 1, LDT, 0, C, 1, LDC, 0, WORK, 1, LDW, 0 );
	assertArrayClose( extractC( C, M, N, LDC ), tc.C, 1e-12, 'C' );
});

test( 'dlarzb: K=1 single reflector, SIDE=left', function t() {

	const tc = findCase( 'left_notrans_k1' );
	const M = 4;
	const N = 3;
	const K = 1;
	const L = 2;

	const V = buildV( K, L, [ 0.3, -0.4 ] );
	const T = buildT( K, [ 0.8 ] );
	const C = buildC( M, N, function fn( i, j ) {
		return ( 0.5 * i ) + ( 0.2 * j );
	});
	const WORK = new Float64Array( LDW * LDW );

	dlarzb( 'left', 'no-transpose', 'backward', 'rowwise', M, N, K, L, V, 1, LDV, 0, T, 1, LDT, 0, C, 1, LDC, 0, WORK, 1, LDW, 0 );
	assertArrayClose( extractC( C, M, N, LDC ), tc.C, 1e-12, 'C' );
});

test( 'dlarzb: K=1 single reflector, SIDE=right TRANS=transpose', function t() {

	const tc = findCase( 'right_trans_k1' );
	const M = 3;
	const N = 4;
	const K = 1;
	const L = 2;

	const V = buildV( K, L, [ 0.3, -0.4 ] );
	const T = buildT( K, [ 0.8 ] );
	const C = buildC( M, N, function fn( i, j ) {
		return ( 0.5 * i ) + ( 0.2 * j );
	});
	const WORK = new Float64Array( LDW * LDW );

	dlarzb( 'right', 'transpose', 'backward', 'rowwise', M, N, K, L, V, 1, LDV, 0, T, 1, LDT, 0, C, 1, LDC, 0, WORK, 1, LDW, 0 );
	assertArrayClose( extractC( C, M, N, LDC ), tc.C, 1e-12, 'C' );
});

test( 'dlarzb: M=0 returns early', function t() {
	const WORK = new Float64Array( 4 );
	const V = new Float64Array( 4 );
	const T = new Float64Array( 4 );
	const C = new Float64Array( [ 1.0, 2.0, 3.0, 4.0 ] );

	dlarzb( 'left', 'no-transpose', 'backward', 'rowwise', 0, 2, 1, 1, V, 1, 1, 0, T, 1, 1, 0, C, 1, 2, 0, WORK, 1, 2, 0 ); // eslint-disable-line max-len
	if ( C[0] !== 1 || C[1] !== 2 || C[2] !== 3 || C[3] !== 4 ) {
		throw new Error( 'C should be unchanged when M=0' );
	}
});

test( 'dlarzb: N=0 returns early', function t() {
	const WORK = new Float64Array( 4 );
	const V = new Float64Array( 4 );
	const T = new Float64Array( 4 );
	const C = new Float64Array( [ 1.0, 2.0, 3.0, 4.0 ] );

	dlarzb( 'left', 'no-transpose', 'backward', 'rowwise', 2, 0, 1, 1, V, 1, 1, 0, T, 1, 1, 0, C, 1, 2, 0, WORK, 1, 2, 0 ); // eslint-disable-line max-len
	if ( C[0] !== 1 || C[1] !== 2 || C[2] !== 3 || C[3] !== 4 ) {
		throw new Error( 'C should be unchanged when N=0' );
	}
});

test( 'dlarzb: unsupported direct throws TypeError', function t() {
	const WORK = new Float64Array( 4 );
	const V = new Float64Array( 4 );
	const T = new Float64Array( 4 );
	const C = new Float64Array( [ 1.0, 2.0, 3.0, 4.0 ] );

	assert.throws( function badCall() {
		dlarzb( 'left', 'no-transpose', 'forward', 'rowwise', 2, 2, 1, 1, V, 1, 1, 0, T, 1, 1, 0, C, 1, 2, 0, WORK, 1, 2, 0 ); // eslint-disable-line max-len
	}, TypeError );
});

test( 'dlarzb: unsupported storev throws TypeError', function t() {
	const WORK = new Float64Array( 4 );
	const V = new Float64Array( 4 );
	const T = new Float64Array( 4 );
	const C = new Float64Array( [ 1.0, 2.0, 3.0, 4.0 ] );

	assert.throws( function badCall() {
		dlarzb( 'left', 'no-transpose', 'backward', 'columnwise', 2, 2, 1, 1, V, 1, 1, 0, T, 1, 1, 0, C, 1, 2, 0, WORK, 1, 2, 0 ); // eslint-disable-line max-len
	}, TypeError );
});
