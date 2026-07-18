/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import { readFileSync } from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import dsytrfRook from './../lib/ndarray.js';


// VARIABLES //

const fixtureDir = path.join( import.meta.dirname, '..', '..', '..', '..', '..', 'test', 'fixtures' ); // eslint-disable-line max-len
const lines = readFileSync( path.join( fixtureDir, 'dsytrf_rook.jsonl' ), 'utf8' ).trim().split( '\n' ); // eslint-disable-line node/no-sync, max-len
const fixture = lines.map( function parse( line ) {
	return JSON.parse( line );
});


// FUNCTIONS //

/**
* Find a test case in the fixture by name.
*
* @private
* @param {string} name - case name
* @returns {Object} fixture case
*/
function findCase( name ) {
	return fixture.find( function find( t ) {
		return t.name === name;
	});
}

/**
* Asserts that two numbers are approximately equal.
*
* @private
* @param {number} actual - actual value
* @param {number} expected - expected value
* @param {number} tol - relative tolerance
* @param {string} msg - assertion message
*/
function assertClose( actual, expected, tol, msg ) {
	const relErr = Math.abs( actual - expected ) / Math.max( Math.abs( expected ), 1.0 ); // eslint-disable-line max-len
	assert.ok( relErr <= tol, msg + ': expected ' + expected + ', got ' + actual );
}

/**
* Asserts that two arrays are element-wise approximately equal.
*
* @private
* @param {Object} actual - actual array-like
* @param {Array} expected - expected values
* @param {number} tol - relative tolerance
* @param {string} msg - assertion message
*/
function assertArrayClose( actual, expected, tol, msg ) {
	let i;
	assert.equal( actual.length, expected.length, msg + ': length mismatch' );
	for ( i = 0; i < expected.length; i++ ) {
		assertClose( actual[ i ], expected[ i ], tol, msg + '[' + i + ']' );
	}
}

/**
* Convert Fortran 1-based IPIV to 0-based bitwise-NOT convention.
*
* @private
* @param {Array} fipiv - Fortran-style pivot array
* @returns {Array} converted pivot array
*/
function convertIPIV( fipiv ) {
	const out = [];
	let i;
	for ( i = 0; i < fipiv.length; i++ ) {
		if ( fipiv[ i ] > 0 ) {
			out.push( fipiv[ i ] - 1 );
		} else {
			// Fortran negative is 1-based: -p_1based; JS encoding is `~(p-1) = -p`, which is the same numeric value.
			out.push( fipiv[ i ] );
		}
	}
	return out;
}

/**
* Convert a typed array to a plain array.
*
* @private
* @param {TypedArray} arr - input array
* @returns {Array} plain array
*/
function toArray( arr ) {
	const out = [];
	let i;
	for ( i = 0; i < arr.length; i++ ) {
		out.push( arr[ i ] );
	}
	return out;
}


// TESTS //

test( 'dsytrf_rook ndarray is a function', function t() {
	assert.strictEqual( typeof dsytrfRook, 'function', 'is a function' );
});

test( 'dsytrf_rook: 4x4_lower', function t() {
	const ipiv = new Int32Array( 4 );
	const tc = findCase( '4x4_lower' );
	const A = new Float64Array( [ 4, 2, 1, 0, 0, 5, 2, 1, 0, 0, 6, 3, 0, 0, 0, 8 ] );
	const info = dsytrfRook( 'lower', 4, A, 1, 4, 0, ipiv, 1, 0, new Float64Array( 1280 ), 1, 0 );
	assertArrayClose( A, tc.a, 1e-14, 'a' );
	assert.equal( info, tc.info, 'info' );
	assert.deepEqual( toArray( ipiv ), convertIPIV( tc.ipiv ), 'ipiv' );
});

test( 'dsytrf_rook: 4x4_upper', function t() {
	const ipiv = new Int32Array( 4 );
	const tc = findCase( '4x4_upper' );
	const A = new Float64Array( 16 );
	A[ 0 ] = 4;
	A[ 4 ] = 2; A[ 5 ] = 5; // eslint-disable-line max-statements-per-line
	A[ 8 ] = 1; A[ 9 ] = 2; A[ 10 ] = 6; // eslint-disable-line max-statements-per-line
	A[ 12 ] = 0; A[ 13 ] = 1; A[ 14 ] = 3; A[ 15 ] = 8; // eslint-disable-line max-statements-per-line
	const info = dsytrfRook( 'upper', 4, A, 1, 4, 0, ipiv, 1, 0, new Float64Array( 1280 ), 1, 0 );
	assertArrayClose( A, tc.a, 1e-14, 'a' );
	assert.equal( info, tc.info, 'info' );
	assert.deepEqual( toArray( ipiv ), convertIPIV( tc.ipiv ), 'ipiv' );
});

test( 'dsytrf_rook: 4x4_indef_lower (forces 2x2 pivots)', function t() {
	const ipiv = new Int32Array( 4 );
	const tc = findCase( '4x4_indef_lower' );
	const A = new Float64Array( [ 0, 1, 2, 3, 0, 0, 4, 5, 0, 0, 0, 6, 0, 0, 0, 0 ] );
	const info = dsytrfRook( 'lower', 4, A, 1, 4, 0, ipiv, 1, 0, new Float64Array( 1280 ), 1, 0 );
	assertArrayClose( A, tc.a, 1e-14, 'a' );
	assert.equal( info, tc.info, 'info' );
	assert.deepEqual( toArray( ipiv ), convertIPIV( tc.ipiv ), 'ipiv' );
});

test( 'dsytrf_rook: 4x4_indef_upper (forces 2x2 pivots)', function t() {
	const ipiv = new Int32Array( 4 );
	const tc = findCase( '4x4_indef_upper' );
	const A = new Float64Array( 16 );
	A[ 0 ] = 0;
	A[ 4 ] = 1; A[ 5 ] = 0; // eslint-disable-line max-statements-per-line
	A[ 8 ] = 2; A[ 9 ] = 4; A[ 10 ] = 0; // eslint-disable-line max-statements-per-line
	A[ 12 ] = 3; A[ 13 ] = 5; A[ 14 ] = 6; A[ 15 ] = 0; // eslint-disable-line max-statements-per-line
	const info = dsytrfRook( 'upper', 4, A, 1, 4, 0, ipiv, 1, 0, new Float64Array( 1280 ), 1, 0 );
	assertArrayClose( A, tc.a, 1e-14, 'a' );
	assert.equal( info, tc.info, 'info' );
	assert.deepEqual( toArray( ipiv ), convertIPIV( tc.ipiv ), 'ipiv' );
});

test( 'dsytrf_rook: n_zero', function t() {
	const ipiv = new Int32Array( 1 );
	const A = new Float64Array( 1 );
	const info = dsytrfRook( 'lower', 0, A, 1, 1, 0, ipiv, 1, 0, new Float64Array( 1280 ), 1, 0 );
	assert.equal( info, 0, 'info' );
});

test( 'dsytrf_rook: n_one', function t() {
	const ipiv = new Int32Array( 1 );
	const tc = findCase( 'n_one' );
	const A = new Float64Array( [ 7.0 ] );
	const info = dsytrfRook( 'lower', 1, A, 1, 1, 0, ipiv, 1, 0, new Float64Array( 1280 ), 1, 0 );
	assertArrayClose( A, tc.a, 1e-14, 'a' );
	assert.equal( info, tc.info, 'info' );
	assert.deepEqual( toArray( ipiv ), convertIPIV( tc.ipiv ), 'ipiv' );
});

test( 'dsytrf_rook: singular', function t() {
	const ipiv = new Int32Array( 2 );
	const tc = findCase( 'singular' );
	const A = new Float64Array( [ 0, 0, 0, 0 ] );
	const info = dsytrfRook( 'lower', 2, A, 1, 2, 0, ipiv, 1, 0, new Float64Array( 1280 ), 1, 0 );
	assertArrayClose( A, tc.a, 1e-14, 'a' );
	assert.equal( info, tc.info, 'info' );
	assert.deepEqual( toArray( ipiv ), convertIPIV( tc.ipiv ), 'ipiv' );
});

test( 'dsytrf_rook: 5x5_lower (mixed pivots)', function t() {
	const ipiv = new Int32Array( 5 );
	const tc = findCase( '5x5_lower' );
	const A = new Float64Array( [ 1, -2, 0, 3, 1, 0, 0, 4, -1, 2, 0, 0, -3, 2, 0, 0, 0, 0, 1, -2, 0, 0, 0, 0, 4 ] ); // eslint-disable-line max-len
	const info = dsytrfRook( 'lower', 5, A, 1, 5, 0, ipiv, 1, 0, new Float64Array( 1280 ), 1, 0 );
	assertArrayClose( A, tc.a, 1e-14, 'a' );
	assert.equal( info, tc.info, 'info' );
	assert.deepEqual( toArray( ipiv ), convertIPIV( tc.ipiv ), 'ipiv' );
});

test( 'dsytrf_rook: 40x40 blocked lower (exercise dlasyf_rook + offset adjustment)', function t() {
	let i, j;
	const N = 40;
	const A = new Float64Array( N * N );
	const ipiv = new Int32Array( N );
	for ( j = 0; j < N; j++ ) {
		for ( i = j; i < N; i++ ) {
			if ( i === j ) {
				A[ i + ( j * N ) ] = 3.0 * N;
			} else {
				A[ i + ( j * N ) ] = ( ( i + j ) % 7 ) - 3.0;
			}
		}
	}
	const info = dsytrfRook( 'lower', N, A, 1, N, 0, ipiv, 1, 0, new Float64Array( 1280 ), 1, 0 );
	assert.equal( info, 0, 'factor info' );
	for ( i = 0; i < N; i++ ) {
		assert.ok( ipiv[ i ] >= -N && ipiv[ i ] < N, 'ipiv[' + i + '] in range' );
	}
	for ( i = 0; i < N * N; i++ ) {
		assert.ok( !Number.isNaN( A[ i ] ), 'A[' + i + '] not NaN' );
	}
});

test( 'dsytrf_rook: 40x40 blocked upper (exercise dlasyf_rook upper path)', function t() {
	let i, j;
	const N = 40;
	const A = new Float64Array( N * N );
	const ipiv = new Int32Array( N );
	for ( j = 0; j < N; j++ ) {
		for ( i = 0; i <= j; i++ ) {
			if ( i === j ) {
				A[ i + ( j * N ) ] = 3.0 * N;
			} else {
				A[ i + ( j * N ) ] = ( ( i + j ) % 7 ) - 3.0;
			}
		}
	}
	const info = dsytrfRook( 'upper', N, A, 1, N, 0, ipiv, 1, 0, new Float64Array( 1280 ), 1, 0 );
	assert.equal( info, 0, 'factor info' );
	for ( i = 0; i < N; i++ ) {
		assert.ok( ipiv[ i ] >= -N && ipiv[ i ] < N, 'ipiv[' + i + '] in range' );
	}
	for ( i = 0; i < N * N; i++ ) {
		assert.ok( !Number.isNaN( A[ i ] ), 'A[' + i + '] not NaN' );
	}
});

test( 'dsytrf_rook: 40x40 indefinite lower (exercises 2x2 pivots in blocked path + IPIV offset adjustment)', function t() {
	let seen2x2, i, j;
	const N = 40;
	const A = new Float64Array( N * N );
	const ipiv = new Int32Array( N );

	// Build a hard-to-factor symmetric matrix with zeros on the diagonal — forces 2x2 pivots:
	for ( j = 0; j < N; j++ ) {
		for ( i = j; i < N; i++ ) {
			if ( i === j ) {
				A[ i + ( j * N ) ] = 0.0;
			} else {
				A[ i + ( j * N ) ] = Math.sin( ( ( i + 1 ) * 0.7 ) + ( ( j + 1 ) * 1.3 ) ); // eslint-disable-line max-len
			}
		}
	}
	const info = dsytrfRook( 'lower', N, A, 1, N, 0, ipiv, 1, 0, new Float64Array( 1280 ), 1, 0 );
	assert.equal( info, 0, 'factor info' );
	seen2x2 = false;
	for ( i = 0; i < N; i++ ) {
		assert.ok( ipiv[ i ] >= -N && ipiv[ i ] < N, 'ipiv[' + i + '] in range' );
		if ( ipiv[ i ] < 0 ) {
			seen2x2 = true;
		}
	}
	assert.ok( seen2x2, 'at least one 2x2 pivot encountered (negative IPIV entry)' );
});

test( 'dsytrf_rook: 40x40 indefinite upper (exercises 2x2 pivots in blocked path)', function t() {
	let seen2x2, i, j;
	const N = 40;
	const A = new Float64Array( N * N );
	const ipiv = new Int32Array( N );
	for ( j = 0; j < N; j++ ) {
		for ( i = 0; i <= j; i++ ) {
			if ( i === j ) {
				A[ i + ( j * N ) ] = 0.0;
			} else {
				A[ i + ( j * N ) ] = Math.sin( ( ( i + 1 ) * 0.7 ) + ( ( j + 1 ) * 1.3 ) ); // eslint-disable-line max-len
			}
		}
	}
	const info = dsytrfRook( 'upper', N, A, 1, N, 0, ipiv, 1, 0, new Float64Array( 1280 ), 1, 0 );
	assert.equal( info, 0, 'factor info' );
	seen2x2 = false;
	for ( i = 0; i < N; i++ ) {
		assert.ok( ipiv[ i ] >= -N && ipiv[ i ] < N, 'ipiv[' + i + '] in range' );
		if ( ipiv[ i ] < 0 ) {
			seen2x2 = true;
		}
	}
	assert.ok( seen2x2, 'at least one 2x2 pivot encountered (negative IPIV entry)' );
});
