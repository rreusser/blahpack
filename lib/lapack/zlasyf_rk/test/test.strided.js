/* eslint-disable no-restricted-syntax */

// MODULES //

import { readFileSync } from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import assert from 'node:assert/strict';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import zlasyfRk from './../lib/strided.js';
import zsytrs3 from './../../zsytrs_3/lib/strided.js';


// FIXTURES //

const fixtureDir = path.join( import.meta.dirname, '..', '..', '..', '..', 'test', 'fixtures' );
const rawLines = readFileSync( path.join( fixtureDir, 'zlasyf_rk.jsonl' ), 'utf8' ).trim().split( '\n' ); // eslint-disable-line max-len
const FIXTURES = rawLines.map( function parse( line ) {
	return JSON.parse( line );
});


// FUNCTIONS //

/**
* Asserts that two numbers are approximately equal.
*
* @private
* @param {number} actual - actual value
* @param {number} expected - expected value
* @param {number} tol - tolerance
* @param {string} msg - assertion message
*/
function assertClose( actual, expected, tol, msg ) {
	const relErr = Math.abs( actual - expected ) / Math.max( Math.abs( expected ), 1.0 ); // eslint-disable-line max-len
	assert.ok( relErr <= tol, format( '%s: expected %s, got %s', msg, expected, actual ) );
}

/**
* Asserts that two arrays are element-wise approximately equal.
*
* @private
* @param {ArrayLikeObject} actual - actual value
* @param {ArrayLikeObject} expected - expected value
* @param {number} tol - tolerance
* @param {string} msg - assertion message
*/
function assertArrayClose( actual, expected, tol, msg ) {
	let i;
	assert.equal( actual.length, expected.length, format( '%s: length mismatch', msg ) );
	for ( i = 0; i < expected.length; i++ ) {
		assertClose( actual[ i ], expected[ i ], tol, format( '%s[%d]', msg, i ) );
	}
}

/**
* Converts Fortran 1-based IPIV with negative 2x2 encoding to JS 0-based IPIV.
*
* @private
* @param {ArrayLikeObject} fipiv - Fortran IPIV values
* @returns {Array} JS IPIV values
*/
function convertIPIV( fipiv ) {
	const out = [];
	let i;
	for ( i = 0; i < fipiv.length; i++ ) {
		if ( fipiv[ i ] > 0 ) {
			out.push( fipiv[ i ] - 1 );
		} else if ( fipiv[ i ] < 0 ) {
			out.push( fipiv[ i ] );
		} else {
			out.push( 0 );
		}
	}
	return out;
}

/**
* Converts a typed array to a plain array.
*
* @private
* @param {TypedArray} arr - input array
* @returns {Array} output array
*/
function toArray( arr ) {
	const out = [];
	let i;
	for ( i = 0; i < arr.length; i++ ) {
		out.push( arr[ i ] );
	}
	return out;
}

/**
* Returns a fixture by name.
*
* @private
* @param {string} name - case name
* @throws {Error} must be a known fixture
* @returns {Object} fixture record
*/
function findCase( name ) {
	let i;
	for ( i = 0; i < FIXTURES.length; i++ ) {
		if ( FIXTURES[ i ].name === name ) {
			return FIXTURES[ i ];
		}
	}
	throw new Error( format( 'fixture not found: %s', name ) );
}

/**
* Builds a Complex128Array from an (i, j, re, im) entry list (column-major, leading dimension n).
*
* @private
* @param {integer} n - matrix order
* @param {Array} entries - list of [i, j, re, im] entries
* @returns {Complex128Array} matrix
*/
function buildMatrix( n, entries ) {
	let idx, im, re, i, j, t;
	const arr = new Complex128Array( n * n );
	const view = reinterpret( arr, 0 );
	for ( t = 0; t < entries.length; t++ ) {
		i = entries[ t ][ 0 ];
		j = entries[ t ][ 1 ];
		re = entries[ t ][ 2 ];
		im = entries[ t ][ 3 ];
		idx = 2 * ( i + ( j * n ) );
		view[ idx ] = re;
		view[ idx + 1 ] = im;
	}
	return arr;
}


/**
* Returns the interleaved data of a 6x6 symmetric matrix with a tiny diagonal and large off-diagonal entries, which forces rook-pivot searches ending in 2x2 pivots with row interchanges.
*
* @private
* @returns {Float64Array} column-major interleaved matrix data
*/
function rookMatrix() {
	const out = new Float64Array( 72 );
	let re;
	let im;
	let a;
	let b;
	let i;
	let j;
	for ( j = 0; j < 6; j++ ) {
		for ( i = 0; i < 6; i++ ) {
			if ( i === j ) {
				re = 0.01 * ( i + 1 );
				im = 0.02;
			} else {
				a = Math.max( i, j );
				b = Math.min( i, j );
				re = ( ( ( ( a * 7 ) + ( b * 3 ) + 1 ) % 11 ) - 5 ) / 5;
				im = ( ( ( a + ( 2 * b ) ) % 5 ) - 2 ) / 7;
			}
			out[ 2 * ( i + ( j * 6 ) ) ] = re;
			out[ ( 2 * ( i + ( j * 6 ) ) ) + 1 ] = im;
		}
	}
	return out;
}

/**
* Factors the full 6x6 rook matrix with a single panel (`nb = N`), solves `A*x = b` for a known `x`, and checks the solution and that a 2x2 pivot with a row interchange occurred.
*
* @private
* @param {string} uplo - `'upper'` or `'lower'`
*/
function checkRookSolve( uplo ) {
	const kbOut = new Int32Array( 1 );
	const full = rookMatrix();
	const ipiv = new Int32Array( 6 );
	const N = 6;
	const A = new Complex128Array( full.slice() );
	const E = new Complex128Array( N );
	const W = new Complex128Array( N * N );
	const B = new Complex128Array( N );
	const bv = reinterpret( B, 0 );
	let swapped;
	let res;
	let sr;
	let si;
	let xr;
	let xi;
	let i;
	let j;
	let q;

	res = zlasyfRk( uplo, N, N, kbOut, A, 1, N, 0, E, 1, 0, ipiv, 1, 0, W, 1, N, 0 );
	assert.equal( res, 0, 'info' );
	assert.equal( kbOut[ 0 ], N, 'kb' );
	swapped = false;
	for ( i = 0; i < N; i++ ) {
		if ( ipiv[ i ] < 0 && ~ipiv[ i ] !== i ) {
			swapped = true;
		}
	}
	assert.ok( swapped, 'a 2x2 pivot with an interchange occurred' );

	// b = A*x with x(i) = (i+1) + 0.5*i*j
	for ( i = 0; i < N; i++ ) {
		sr = 0.0;
		si = 0.0;
		for ( j = 0; j < N; j++ ) {
			q = 2 * ( i + ( j * N ) );
			xr = j + 1;
			xi = 0.5 * j;
			sr += ( full[ q ] * xr ) - ( full[ q + 1 ] * xi );
			si += ( full[ q ] * xi ) + ( full[ q + 1 ] * xr );
		}
		bv[ 2 * i ] = sr;
		bv[ ( 2 * i ) + 1 ] = si;
	}
	zsytrs3( uplo, N, 1, A, 1, N, 0, E, 1, 0, ipiv, 1, 0, B, 1, N, 0 );
	for ( i = 0; i < N; i++ ) {
		assertClose( bv[ 2 * i ], i + 1, 1e-12, format( 'x[%d].re', i ) );
		assertClose( bv[ ( 2 * i ) + 1 ], 0.5 * i, 1e-12, format( 'x[%d].im', i ) );
	}
}


// TESTS //

test( 'zlasyf_rk: lower_6x6_nb3', function t() {
	const kb = new Int32Array( 1 );

	const tc = findCase( 'lower_6x6_nb3' );
	const A = buildMatrix( 6, [
		[ 0, 0, 0.01, 0.01 ],
		[ 1, 0, 5.0, -1.0 ],
		[ 1, 1, 0.02, -0.02 ],
		[ 2, 0, 1.0, 1.0 ],
		[ 2, 1, 2.0, -1.0 ],
		[ 2, 2, 8.0, 0.5 ],
		[ 3, 0, 0.5, -0.5 ],
		[ 3, 1, 1.0, 1.0 ],
		[ 3, 2, 3.0, 0.3 ],
		[ 3, 3, 7.0, -0.2 ],
		[ 4, 0, 2.0, 0.2 ],
		[ 4, 1, 1.5, -0.5 ],
		[ 4, 2, 0.0, 2.0 ],
		[ 4, 3, 1.0, 0.5 ],
		[ 4, 4, 6.0, 0.1 ],
		[ 5, 0, 1.0, -1.0 ],
		[ 5, 1, 0.0, -3.0 ],
		[ 5, 2, 1.0, 0.4 ],
		[ 5, 3, 2.0, -2.0 ],
		[ 5, 4, 0.5, 1.0 ],
		[ 5, 5, 5.0, 0.3 ]
	]);
	const IPIV = new Int32Array( 6 );
	const W = new Complex128Array( 6 * 3 );
	const e = new Complex128Array( 6 );
	const result = zlasyfRk( 'lower', 6, 3, kb, A, 1, 6, 0, e, 1, 0, IPIV, 1, 0, W, 1, 6, 0 );
	const Av = reinterpret( A, 0 );
	const Ev = reinterpret( e, 0 );
	assertArrayClose( Av, tc.A, 1e-12, 'A' );
	assertArrayClose( Ev, tc.e, 1e-12, 'e' );
	assert.equal( result, tc.info, 'info' );
	assert.equal( kb[ 0 ], tc.kb, 'kb' );
	assert.deepEqual( toArray( IPIV ), convertIPIV( tc.ipiv ), 'ipiv' );
});

test( 'zlasyf_rk: upper_6x6_nb3', function t() {
	const kb = new Int32Array( 1 );

	const tc = findCase( 'upper_6x6_nb3' );
	const A = buildMatrix( 6, [
		[ 0, 0, 0.01, 0.01 ],
		[ 0, 1, 5.0, -1.0 ],
		[ 1, 1, 0.02, -0.02 ],
		[ 0, 2, 1.0, 1.0 ],
		[ 1, 2, 2.0, -1.0 ],
		[ 2, 2, 8.0, 0.5 ],
		[ 0, 3, 0.5, -0.5 ],
		[ 1, 3, 1.0, 1.0 ],
		[ 2, 3, 3.0, 0.3 ],
		[ 3, 3, 7.0, -0.2 ],
		[ 0, 4, 2.0, 0.2 ],
		[ 1, 4, 1.5, -0.5 ],
		[ 2, 4, 0.0, 2.0 ],
		[ 3, 4, 1.0, 0.5 ],
		[ 4, 4, 6.0, 0.1 ],
		[ 0, 5, 1.0, -1.0 ],
		[ 1, 5, 0.0, -3.0 ],
		[ 2, 5, 1.0, 0.4 ],
		[ 3, 5, 2.0, -2.0 ],
		[ 4, 5, 0.5, 1.0 ],
		[ 5, 5, 5.0, 0.3 ]
	]);
	const IPIV = new Int32Array( 6 );
	const W = new Complex128Array( 6 * 3 );
	const e = new Complex128Array( 6 );
	const result = zlasyfRk( 'upper', 6, 3, kb, A, 1, 6, 0, e, 1, 0, IPIV, 1, 0, W, 1, 6, 0 );
	const Av = reinterpret( A, 0 );
	const Ev = reinterpret( e, 0 );
	assertArrayClose( Av, tc.A, 1e-12, 'A' );
	assertArrayClose( Ev, tc.e, 1e-12, 'e' );
	assert.equal( result, tc.info, 'info' );
	assert.equal( kb[ 0 ], tc.kb, 'kb' );
	assert.deepEqual( toArray( IPIV ), convertIPIV( tc.ipiv ), 'ipiv' );
});

test( 'zlasyf_rk: lower_4x4_full_nb8', function t() {
	const kb = new Int32Array( 1 );

	const tc = findCase( 'lower_4x4_full_nb8' );
	const A = buildMatrix( 4, [
		[ 0, 0, 4.0, 0.2 ],
		[ 1, 0, 1.0, 0.5 ],
		[ 1, 1, 3.0, -0.1 ],
		[ 2, 0, 2.0, -1.0 ],
		[ 2, 1, 0.5, -0.2 ],
		[ 2, 2, 5.0, 0.3 ],
		[ 3, 0, 0.5, 0.1 ],
		[ 3, 1, 1.0, 0.3 ],
		[ 3, 2, 0.2, -0.4 ],
		[ 3, 3, 6.0, -0.25 ]
	]);
	const IPIV = new Int32Array( 4 );
	const W = new Complex128Array( 4 * 8 );
	const e = new Complex128Array( 4 );
	const result = zlasyfRk( 'lower', 4, 8, kb, A, 1, 4, 0, e, 1, 0, IPIV, 1, 0, W, 1, 4, 0 );
	const Av = reinterpret( A, 0 );
	const Ev = reinterpret( e, 0 );
	assertArrayClose( Av, tc.A, 1e-12, 'A' );
	assertArrayClose( Ev, tc.e, 1e-12, 'e' );
	assert.equal( result, tc.info, 'info' );
	assert.equal( kb[ 0 ], tc.kb, 'kb' );
	assert.deepEqual( toArray( IPIV ), convertIPIV( tc.ipiv ), 'ipiv' );
});

test( 'zlasyf_rk: upper_4x4_full_nb8', function t() {
	const kb = new Int32Array( 1 );

	const tc = findCase( 'upper_4x4_full_nb8' );
	const A = buildMatrix( 4, [
		[ 0, 0, 4.0, 0.2 ],
		[ 0, 1, 1.0, 0.5 ],
		[ 1, 1, 3.0, -0.1 ],
		[ 0, 2, 2.0, -1.0 ],
		[ 1, 2, 0.5, -0.2 ],
		[ 2, 2, 5.0, 0.3 ],
		[ 0, 3, 0.5, 0.1 ],
		[ 1, 3, 1.0, 0.3 ],
		[ 2, 3, 0.2, -0.4 ],
		[ 3, 3, 6.0, -0.25 ]
	]);
	const IPIV = new Int32Array( 4 );
	const W = new Complex128Array( 4 * 8 );
	const e = new Complex128Array( 4 );
	const result = zlasyfRk( 'upper', 4, 8, kb, A, 1, 4, 0, e, 1, 0, IPIV, 1, 0, W, 1, 4, 0 );
	const Av = reinterpret( A, 0 );
	const Ev = reinterpret( e, 0 );
	assertArrayClose( Av, tc.A, 1e-12, 'A' );
	assertArrayClose( Ev, tc.e, 1e-12, 'e' );
	assert.equal( result, tc.info, 'info' );
	assert.equal( kb[ 0 ], tc.kb, 'kb' );
	assert.deepEqual( toArray( IPIV ), convertIPIV( tc.ipiv ), 'ipiv' );
});

test( 'zlasyf_rk: upper 6x6 full panel with rook 2x2 interchanges solves A*x = b', function t() {
	checkRookSolve( 'upper' );
});

test( 'zlasyf_rk: lower 6x6 full panel with rook 2x2 interchanges solves A*x = b', function t() {
	checkRookSolve( 'lower' );
});


// HEAVY ROOK PIVOTING (ticket 0102) //

/**
* Returns an N-by-N complex symmetric matrix, `a_ij = sin((i+1)(j+1)+i+j) + i*cos((i+1)(j+1)-i-j)` (0-based `i`, `j`), whose rook-pivot searches take many 2x2 pivots with `p != k`.
*
* @private
* @param {NonNegativeInteger} N - order
* @returns {Complex128Array} column-major matrix
*/
function pivotMatrix( N ) {
	const A = new Complex128Array( N * N );
	const v = reinterpret( A, 0 );
	let i;
	let j;
	for ( j = 0; j < N; j++ ) {
		for ( i = 0; i < N; i++ ) {
			v[ 2 * ( i + ( j * N ) ) ] = Math.sin( ( ( i + 1 ) * ( j + 1 ) ) + i + j );
			v[ ( 2 * ( i + ( j * N ) ) ) + 1 ] = Math.cos( ( ( i + 1 ) * ( j + 1 ) ) - i - j );
		}
	}
	return A;
}

/**
* Runs one 40x40, NB = 32 panel on the heavy-pivoting matrix and compares it with the reference fixture.
*
* @private
* @param {string} uplo - `'upper'` or `'lower'`
*/
function checkPivot40( uplo ) {
	const tc = findCase( uplo + '_40x40_pivot40_nb32' );
	const kb = new Int32Array( 1 );
	const N = 40;
	const A = pivotMatrix( N );
	const IPIV = new Int32Array( N );
	const W = new Complex128Array( N * 32 );
	const e = new Complex128Array( N );
	const info = zlasyfRk( uplo, N, 32, kb, A, 1, N, 0, e, 1, 0, IPIV, 1, 0, W, 1, N, 0 );
	assertArrayClose( reinterpret( A, 0 ), tc.A, 1e-12, 'A' );
	assertArrayClose( reinterpret( e, 0 ), tc.e, 1e-12, 'e' );
	assert.equal( info, tc.info, 'info' );
	assert.equal( kb[ 0 ], tc.kb, 'kb' );
	assert.deepEqual( toArray( IPIV ), convertIPIV( tc.ipiv ), 'ipiv' );
}

test( 'zlasyf_rk: upper 40x40 nb=32 with heavy rook pivoting (2x2 pivots with p != k) matches the reference', function t() {
	checkPivot40( 'upper' );
});

test( 'zlasyf_rk: lower 40x40 nb=32 with heavy rook pivoting (2x2 pivots with p != k) matches the reference', function t() {
	checkPivot40( 'lower' );
});
