/* eslint-disable no-restricted-syntax, stdlib/first-unit-test, max-len, node/no-sync */

// MODULES //

import test from 'node:test';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import dsytf2Rook from './../lib/ndarray.js';


// FIXTURES //

var fixtureDir = path.join( import.meta.dirname, '..', '..', '..', '..', '..', 'test', 'fixtures' );
var lines = readFileSync( path.join( fixtureDir, 'dsytf2_rook.jsonl' ), 'utf8' ).trim().split( '\n' );
var fixture = lines.map( function parse( line ) {
	return JSON.parse( line );
});


// FUNCTIONS //

/**
* Find a fixture case by name.
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
* Assert that two numbers are approximately equal.
*
* @private
* @param {number} actual - actual value
* @param {number} expected - expected value
* @param {number} tol - tolerance
* @param {string} msg - assertion message
*/
function assertClose( actual, expected, tol, msg ) {
	var relErr = Math.abs( actual - expected ) / Math.max( Math.abs( expected ), 1.0 );
	assert.ok( relErr <= tol, msg + ': expected ' + expected + ', got ' + actual );
}

/**
* Assert that two arrays are element-wise approximately equal.
*
* @private
* @param {Object} actual - actual array
* @param {Array} expected - expected array
* @param {number} tol - tolerance
* @param {string} msg - assertion message
*/
function assertArrayClose( actual, expected, tol, msg ) {
	var i;
	assert.equal( actual.length, expected.length, msg + ': length mismatch' );
	for ( i = 0; i < expected.length; i++ ) {
		assertClose( actual[ i ], expected[ i ], tol, msg + '[' + i + ']' );
	}
}

/**
* Convert Fortran 1-based IPIV to 0-based JS IPIV. Positive values are decremented; negative values are preserved (they already encode `~(p-1) = -p` in both conventions).
*
* @private
* @param {Array} fipiv - Fortran IPIV values
* @returns {Array} JS IPIV values
*/
function convertIPIV( fipiv ) {
	var out = [];
	var i;
	for ( i = 0; i < fipiv.length; i++ ) {
		if ( fipiv[ i ] > 0 ) {
			out.push( fipiv[ i ] - 1 );
		} else {
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
* @returns {Array} output array
*/
function toArray( arr ) {
	var out = [];
	var i;
	for ( i = 0; i < arr.length; i++ ) {
		out.push( arr[ i ] );
	}
	return out;
}


// TESTS //

test( 'dsytf2Rook: 4x4_lower', function t() {
	var ipiv;
	var info;
	var tc;
	var A;

	tc = findCase( '4x4_lower' );
	ipiv = new Int32Array( 4 );
	A = new Float64Array([
		2,
		-1,
		0,
		0,
		0,
		2,
		-1,
		0,
		0,
		0,
		2,
		-1,
		0,
		0,
		0,
		2
	]);
	info = dsytf2Rook( 'lower', 4, A, 1, 4, 0, ipiv, 1, 0 );
	assertArrayClose( A, tc.a, 1e-14, 'a' );
	assert.equal( info, tc.info, 'info' );
	assert.deepEqual( toArray( ipiv ), convertIPIV( tc.ipiv ), 'ipiv' );
});

test( 'dsytf2Rook: 4x4_upper', function t() {
	var ipiv;
	var info;
	var tc;
	var A;

	tc = findCase( '4x4_upper' );
	ipiv = new Int32Array( 4 );
	A = new Float64Array([
		2,
		0,
		0,
		0,
		-1,
		2,
		0,
		0,
		0,
		-1,
		2,
		0,
		0,
		0,
		-1,
		2
	]);
	info = dsytf2Rook( 'upper', 4, A, 1, 4, 0, ipiv, 1, 0 );
	assertArrayClose( A, tc.a, 1e-14, 'a' );
	assert.equal( info, tc.info, 'info' );
	assert.deepEqual( toArray( ipiv ), convertIPIV( tc.ipiv ), 'ipiv' );
});

test( 'dsytf2Rook: 4x4_indef_lower', function t() {
	var ipiv;
	var info;
	var tc;
	var A;

	tc = findCase( '4x4_indef_lower' );
	ipiv = new Int32Array( 4 );
	A = new Float64Array([
		0,
		1,
		2,
		3,
		0,
		0,
		4,
		5,
		0,
		0,
		0,
		6,
		0,
		0,
		0,
		0
	]);
	info = dsytf2Rook( 'lower', 4, A, 1, 4, 0, ipiv, 1, 0 );
	assertArrayClose( A, tc.a, 1e-14, 'a' );
	assert.equal( info, tc.info, 'info' );
	assert.deepEqual( toArray( ipiv ), convertIPIV( tc.ipiv ), 'ipiv' );
});

test( 'dsytf2Rook: 4x4_indef_upper', function t() {
	var ipiv;
	var info;
	var tc;
	var A;

	tc = findCase( '4x4_indef_upper' );
	ipiv = new Int32Array( 4 );
	A = new Float64Array([
		0,
		0,
		0,
		0,
		1,
		0,
		0,
		0,
		2,
		4,
		0,
		0,
		3,
		5,
		6,
		0
	]);
	info = dsytf2Rook( 'upper', 4, A, 1, 4, 0, ipiv, 1, 0 );
	assertArrayClose( A, tc.a, 1e-14, 'a' );
	assert.equal( info, tc.info, 'info' );
	assert.deepEqual( toArray( ipiv ), convertIPIV( tc.ipiv ), 'ipiv' );
});

test( 'dsytf2Rook: n_zero', function t() {
	var ipiv;
	var info;
	var A;

	ipiv = new Int32Array( 1 );
	A = new Float64Array( 1 );
	info = dsytf2Rook( 'lower', 0, A, 1, 1, 0, ipiv, 1, 0 );
	assert.equal( info, 0, 'info' );
});

test( 'dsytf2Rook: n_one', function t() {
	var ipiv;
	var info;
	var tc;
	var A;

	tc = findCase( 'n_one' );
	ipiv = new Int32Array( 1 );
	A = new Float64Array([ 5.0 ]);
	info = dsytf2Rook( 'lower', 1, A, 1, 1, 0, ipiv, 1, 0 );
	assertArrayClose( A, tc.a, 1e-14, 'a' );
	assert.equal( info, tc.info, 'info' );
	assert.deepEqual( toArray( ipiv ), convertIPIV( tc.ipiv ), 'ipiv' );
});

test( 'dsytf2Rook: singular', function t() {
	var ipiv;
	var info;
	var tc;
	var A;

	tc = findCase( 'singular' );
	ipiv = new Int32Array( 2 );
	A = new Float64Array([ 0, 0, 0, 0 ]);
	info = dsytf2Rook( 'lower', 2, A, 1, 2, 0, ipiv, 1, 0 );
	assertArrayClose( A, tc.a, 1e-14, 'a' );
	assert.equal( info, tc.info, 'info' );
	assert.deepEqual( toArray( ipiv ), convertIPIV( tc.ipiv ), 'ipiv' );
});

test( 'dsytf2Rook: 5x5_lower', function t() {
	var ipiv;
	var info;
	var tc;
	var A;

	tc = findCase( '5x5_lower' );
	ipiv = new Int32Array( 5 );
	A = new Float64Array([
		1,
		-2,
		0,
		3,
		1,
		0,
		0,
		4,
		-1,
		2,
		0,
		0,
		-3,
		2,
		0,
		0,
		0,
		0,
		1,
		-2,
		0,
		0,
		0,
		0,
		4
	]);
	info = dsytf2Rook( 'lower', 5, A, 1, 5, 0, ipiv, 1, 0 );
	assertArrayClose( A, tc.a, 1e-14, 'a' );
	assert.equal( info, tc.info, 'info' );
	assert.deepEqual( toArray( ipiv ), convertIPIV( tc.ipiv ), 'ipiv' );
});

test( 'dsytf2Rook: 5x5_upper', function t() {
	var ipiv;
	var info;
	var tc;
	var A;

	tc = findCase( '5x5_upper' );
	ipiv = new Int32Array( 5 );
	A = new Float64Array( 25 );
	A[ 0 ] = 1;
	A[ 5 ] = -2;
	A[ 10 ] = 0;
	A[ 11 ] = 4;
	A[ 12 ] = -3;
	A[ 15 ] = 3;
	A[ 16 ] = -1;
	A[ 17 ] = 2;
	A[ 18 ] = 1;
	A[ 20 ] = 1;
	A[ 21 ] = 2;
	A[ 22 ] = 0;
	A[ 23 ] = -2;
	A[ 24 ] = 4;
	info = dsytf2Rook( 'upper', 5, A, 1, 5, 0, ipiv, 1, 0 );
	assertArrayClose( A, tc.a, 1e-14, 'a' );
	assert.equal( info, tc.info, 'info' );
	assert.deepEqual( toArray( ipiv ), convertIPIV( tc.ipiv ), 'ipiv' );
});

test( 'dsytf2Rook: 6x6_rook_lower', function t() {
	var ipiv;
	var info;
	var tc;
	var A;

	tc = findCase( '6x6_rook_lower' );
	ipiv = new Int32Array( 6 );
	A = new Float64Array([
		0.5,
		1.0,
		2.0,
		3.0,
		4.0,
		5.0,
		0.0,
		0.5,
		1.5,
		2.5,
		3.5,
		4.5,
		0.0,
		0.0,
		0.5,
		1.2,
		2.2,
		3.2,
		0.0,
		0.0,
		0.0,
		0.5,
		1.1,
		2.1,
		0.0,
		0.0,
		0.0,
		0.0,
		0.5,
		1.3,
		0.0,
		0.0,
		0.0,
		0.0,
		0.0,
		0.5
	]);
	info = dsytf2Rook( 'lower', 6, A, 1, 6, 0, ipiv, 1, 0 );
	assertArrayClose( A, tc.a, 1e-13, 'a' );
	assert.equal( info, tc.info, 'info' );
	assert.deepEqual( toArray( ipiv ), convertIPIV( tc.ipiv ), 'ipiv' );
});

test( 'dsytf2Rook: 6x6_rook_upper', function t() {
	var ipiv;
	var info;
	var tc;
	var A;

	tc = findCase( '6x6_rook_upper' );
	ipiv = new Int32Array( 6 );
	A = new Float64Array( 36 );
	A[ 0 ] = 0.5;
	A[ 6 ] = 1.0;
	A[ 7 ] = 0.5;
	A[ 12 ] = 2.0;
	A[ 13 ] = 1.5;
	A[ 14 ] = 0.5;
	A[ 18 ] = 3.0;
	A[ 19 ] = 2.5;
	A[ 20 ] = 1.2;
	A[ 21 ] = 0.5;
	A[ 24 ] = 4.0;
	A[ 25 ] = 3.5;
	A[ 26 ] = 2.2;
	A[ 27 ] = 1.1;
	A[ 28 ] = 0.5;
	A[ 30 ] = 5.0;
	A[ 31 ] = 4.5;
	A[ 32 ] = 3.2;
	A[ 33 ] = 2.1;
	A[ 34 ] = 1.3;
	A[ 35 ] = 0.5;
	info = dsytf2Rook( 'upper', 6, A, 1, 6, 0, ipiv, 1, 0 );
	assertArrayClose( A, tc.a, 1e-13, 'a' );
	assert.equal( info, tc.info, 'info' );
	assert.deepEqual( toArray( ipiv ), convertIPIV( tc.ipiv ), 'ipiv' );
});

test( 'dsytf2Rook: 3x3_indef_lower', function t() {
	var ipiv;
	var info;
	var tc;
	var A;

	tc = findCase( '3x3_indef_lower' );
	ipiv = new Int32Array( 3 );
	A = new Float64Array([
		0,
		1,
		2,
		0,
		0,
		3,
		0,
		0,
		0
	]);
	info = dsytf2Rook( 'lower', 3, A, 1, 3, 0, ipiv, 1, 0 );
	assertArrayClose( A, tc.a, 1e-14, 'a' );
	assert.equal( info, tc.info, 'info' );
	assert.deepEqual( toArray( ipiv ), convertIPIV( tc.ipiv ), 'ipiv' );
});

test( 'dsytf2Rook: singular_upper', function t() {
	var ipiv;
	var info;
	var tc;
	var A;

	tc = findCase( 'singular_upper' );
	ipiv = new Int32Array( 2 );
	A = new Float64Array([ 0, 0, 0, 0 ]);
	info = dsytf2Rook( 'upper', 2, A, 1, 2, 0, ipiv, 1, 0 );
	assertArrayClose( A, tc.a, 1e-14, 'a' );
	assert.equal( info, tc.info, 'info' );
	assert.deepEqual( toArray( ipiv ), convertIPIV( tc.ipiv ), 'ipiv' );
});

test( 'dsytf2Rook: 5x5_chase_upper', function t() {
	var ipiv;
	var info;
	var tc;
	var A;

	tc = findCase( '5x5_chase_upper' );
	ipiv = new Int32Array( 5 );
	A = new Float64Array( 25 );
	A[ 0 ] = 0.1;
	A[ 5 ] = 1.0;
	A[ 6 ] = 0.1;
	A[ 10 ] = 2.0;
	A[ 11 ] = 5.0;
	A[ 12 ] = 0.1;
	A[ 15 ] = 3.0;
	A[ 16 ] = 10.0;
	A[ 17 ] = 50.0;
	A[ 18 ] = 0.1;
	A[ 20 ] = 4.0;
	A[ 21 ] = 20.0;
	A[ 22 ] = 100.0;
	A[ 23 ] = 500.0;
	A[ 24 ] = 0.1;
	info = dsytf2Rook( 'upper', 5, A, 1, 5, 0, ipiv, 1, 0 );
	assertArrayClose( A, tc.a, 1e-12, 'a' );
	assert.equal( info, tc.info, 'info' );
	assert.deepEqual( toArray( ipiv ), convertIPIV( tc.ipiv ), 'ipiv' );
});

test( 'dsytf2Rook: 5x5_chase_lower', function t() {
	var ipiv;
	var info;
	var tc;
	var A;

	tc = findCase( '5x5_chase_lower' );
	ipiv = new Int32Array( 5 );
	A = new Float64Array([
		0.1,
		1.0,
		2.0,
		3.0,
		4.0,
		0.0,
		0.1,
		5.0,
		10.0,
		20.0,
		0.0,
		0.0,
		0.1,
		50.0,
		100.0,
		0.0,
		0.0,
		0.0,
		0.1,
		500.0,
		0.0,
		0.0,
		0.0,
		0.0,
		0.1
	]);
	info = dsytf2Rook( 'lower', 5, A, 1, 5, 0, ipiv, 1, 0 );
	assertArrayClose( A, tc.a, 1e-12, 'a' );
	assert.equal( info, tc.info, 'info' );
	assert.deepEqual( toArray( ipiv ), convertIPIV( tc.ipiv ), 'ipiv' );
});

test( 'dsytf2Rook: 3x3_indef_upper', function t() {
	var ipiv;
	var info;
	var tc;
	var A;

	tc = findCase( '3x3_indef_upper' );
	ipiv = new Int32Array( 3 );
	A = new Float64Array([
		0,
		0,
		0,
		1,
		0,
		0,
		2,
		3,
		0
	]);
	info = dsytf2Rook( 'upper', 3, A, 1, 3, 0, ipiv, 1, 0 );
	assertArrayClose( A, tc.a, 1e-14, 'a' );
	assert.equal( info, tc.info, 'info' );
	assert.deepEqual( toArray( ipiv ), convertIPIV( tc.ipiv ), 'ipiv' );
});
