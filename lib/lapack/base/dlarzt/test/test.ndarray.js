/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import format from '@stdlib/string/format/lib/index.js';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dlarzt from './../lib/ndarray.js';


// VARIABLES //

var fixtureDir = path.join( import.meta.dirname, '..', '..', '..', '..', '..', 'test', 'fixtures' );
var fixtureData = readFileSync( path.join( fixtureDir, 'dlarzt.jsonl' ), 'utf8' ).trim().split( '\n' ); // eslint-disable-line node/no-sync, max-len
var fixture = fixtureData.map( function parse( line ) {
	return JSON.parse( line );
});


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
* Converts a typed array to a plain array.
*
* @private
* @param {Float64Array} arr - input array
* @returns {Array} output array
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
	var relErr;
	var i;
	for ( i = 0; i < expected.length; i++ ) {
		relErr = Math.abs( actual[ i ] - expected[ i ] ) / Math.max( Math.abs( expected[ i ] ), 1.0 ); // eslint-disable-line max-len
		if ( relErr > tol ) {
			throw new Error( format( '%s[%d]: expected %f, got %f', msg, i, expected[ i ], actual[ i ] ) ); // eslint-disable-line max-len
		}
	}
}

/**
* Extracts a K-by-K submatrix from column-major storage.
*
* @private
* @param {Float64Array} A - source array
* @param {integer} K - dimension
* @param {integer} ld - leading dimension
* @param {integer} offset - starting offset
* @returns {Array} packed K*K array in column-major order
*/
function extractSubmatrix( A, K, ld, offset ) {
	var out;
	var i;
	var j;
	out = [];
	for ( j = 0; j < K; j++ ) {
		for ( i = 0; i < K; i++ ) {
			out.push( A[ offset + i + ( j * ld ) ] );
		}
	}
	return out;
}


// TESTS //

test( 'dlarzt: K=1, N=4 - single reflector', function t() {
	var TAU;
	var tc;
	var V;
	var T;

	tc = findCase( 'k1_n4' );
	V = new Float64Array( [ 1.0, 0.5, -0.3, 0.7 ] );
	TAU = new Float64Array( [ 0.8 ] );
	T = new Float64Array( 1 );

	dlarzt( 'backward', 'rowwise', 4, 1, V, 1, 1, 0, TAU, 1, 0, T, 1, 1, 0 );
	assertArrayClose( toArray( T ), tc.T, 1e-14, 'T' );
});

test( 'dlarzt: K=3, N=5 - multiple reflectors', function t() {
	var TAU;
	var tc;
	var K;
	var N;
	var V;
	var T;

	tc = findCase( 'k3_n5' );
	K = 3;
	N = 5;

	// V is K-by-N rowwise, column-major: strideV1=1, strideV2=K
	V = new Float64Array( K * N );

	// Row 0: 1.0, 0.3, -0.2, 0.5, 0.1
	V[ 0 + (0 * K) ] = 1.0;
	V[ 0 + (1 * K) ] = 0.3;
	V[ 0 + (2 * K) ] = -0.2;
	V[ 0 + (3 * K) ] = 0.5;
	V[ 0 + (4 * K) ] = 0.1;

	// Row 1: 0.4, 1.0, -0.6, 0.2, 0.8
	V[ 1 + (0 * K) ] = 0.4;
	V[ 1 + (1 * K) ] = 1.0;
	V[ 1 + (2 * K) ] = -0.6;
	V[ 1 + (3 * K) ] = 0.2;
	V[ 1 + (4 * K) ] = 0.8;

	// Row 2: -0.1, 0.7, 1.0, -0.3, 0.4
	V[ 2 + (0 * K) ] = -0.1;
	V[ 2 + (1 * K) ] = 0.7;
	V[ 2 + (2 * K) ] = 1.0;
	V[ 2 + (3 * K) ] = -0.3;
	V[ 2 + (4 * K) ] = 0.4;

	TAU = new Float64Array( [ 0.5, 0.7, 0.9 ] );
	T = new Float64Array( K * K );

	dlarzt( 'backward', 'rowwise', N, K, V, 1, K, 0, TAU, 1, 0, T, 1, K, 0 );
	assertArrayClose( extractSubmatrix( T, K, K, 0 ), tc.T, 1e-14, 'T' );
});

test( 'dlarzt: K=2, N=3 - one zero tau', function t() {
	var TAU;
	var tc;
	var K;
	var V;
	var T;

	tc = findCase( 'k2_n3_zero_tau' );
	K = 2;

	V = new Float64Array( K * 3 );

	// Row 0: 1.0, 0.4, -0.6
	V[ 0 + (0 * K) ] = 1.0;
	V[ 0 + (1 * K) ] = 0.4;
	V[ 0 + (2 * K) ] = -0.6;

	// Row 1: 0.3, 1.0, 0.5
	V[ 1 + (0 * K) ] = 0.3;
	V[ 1 + (1 * K) ] = 1.0;
	V[ 1 + (2 * K) ] = 0.5;

	TAU = new Float64Array( [ 0.0, 0.6 ] );
	T = new Float64Array( K * K );

	dlarzt( 'backward', 'rowwise', 3, K, V, 1, K, 0, TAU, 1, 0, T, 1, K, 0 );
	assertArrayClose( extractSubmatrix( T, K, K, 0 ), tc.T, 1e-14, 'T' );
});

test( 'dlarzt: K=1, N=1 - edge case single element', function t() {
	var TAU;
	var tc;
	var V;
	var T;

	tc = findCase( 'k1_n1' );
	V = new Float64Array( [ 1.0 ] );
	TAU = new Float64Array( [ 0.3 ] );
	T = new Float64Array( 1 );

	dlarzt( 'backward', 'rowwise', 1, 1, V, 1, 1, 0, TAU, 1, 0, T, 1, 1, 0 );
	assertArrayClose( toArray( T ), tc.T, 1e-14, 'T' );
});

test( 'dlarzt: K=2, N=4 - all zero taus', function t() {
	var TAU;
	var tc;
	var K;
	var V;
	var T;

	tc = findCase( 'k2_n4_all_zero_tau' );
	K = 2;

	V = new Float64Array( K * 4 );
	V[ 0 + (0 * K) ] = 1.0;
	V[ 0 + (1 * K) ] = 0.2;
	V[ 0 + (2 * K) ] = 0.3;
	V[ 0 + (3 * K) ] = 0.4;
	V[ 1 + (0 * K) ] = 0.5;
	V[ 1 + (1 * K) ] = 1.0;
	V[ 1 + (2 * K) ] = 0.6;
	V[ 1 + (3 * K) ] = 0.7;

	TAU = new Float64Array( [ 0.0, 0.0 ] );
	T = new Float64Array( K * K );

	dlarzt( 'backward', 'rowwise', 4, K, V, 1, K, 0, TAU, 1, 0, T, 1, K, 0 );
	assertArrayClose( extractSubmatrix( T, K, K, 0 ), tc.T, 1e-14, 'T' );
});

test( 'dlarzt: non-unit strides for V', function t() {
	var TAU;
	var V;
	var T;

	// V with stride 2 between columns (padding)
	V = new Float64Array( [ 1.0, 99.0, 0.5, 99.0, -0.3, 99.0, 0.7, 99.0 ] );
	TAU = new Float64Array( [ 0.8 ] );
	T = new Float64Array( 1 );

	dlarzt( 'backward', 'rowwise', 4, 1, V, 1, 2, 0, TAU, 1, 0, T, 1, 1, 0 );

	// Same as k1_n4 case: T should be 0.8
	if ( Math.abs( T[ 0 ] - 0.8 ) > 1e-14 ) {
		throw new Error( format( 'T[0] should be 0.8, got %f', T[ 0 ] ) );
	}
});

test( 'dlarzt: non-unit stride for TAU', function t() {
	var TAU;
	var V;
	var T;

	V = new Float64Array( [ 1.0, 0.5, -0.3, 0.7 ] );

	// TAU with stride 2
	TAU = new Float64Array( [ 0.8, 99.0 ] );
	T = new Float64Array( 1 );

	dlarzt( 'backward', 'rowwise', 4, 1, V, 1, 1, 0, TAU, 2, 0, T, 1, 1, 0 );
	if ( Math.abs( T[ 0 ] - 0.8 ) > 1e-14 ) {
		throw new Error( format( 'T[0] should be 0.8, got %f', T[ 0 ] ) );
	}
});

test( 'dlarzt: offset for V and TAU', function t() {
	var TAU;
	var V;
	var T;

	// V with offset=2
	V = new Float64Array( [ 99.0, 99.0, 1.0, 0.5, -0.3, 0.7 ] );
	TAU = new Float64Array( [ 99.0, 0.8 ] );
	T = new Float64Array( 1 );

	dlarzt( 'backward', 'rowwise', 4, 1, V, 1, 1, 2, TAU, 1, 1, T, 1, 1, 0 );
	if ( Math.abs( T[ 0 ] - 0.8 ) > 1e-14 ) {
		throw new Error( format( 'T[0] should be 0.8, got %f', T[ 0 ] ) );
	}
});
