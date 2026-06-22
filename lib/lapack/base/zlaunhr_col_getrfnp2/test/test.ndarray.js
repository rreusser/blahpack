/* eslint-disable no-restricted-syntax, stdlib/first-unit-test, camelcase, max-len */

// MODULES //

import { readFileSync } from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import assert from 'node:assert/strict';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import zlaunhr_col_getrfnp2 from './../lib/ndarray.js';


// FIXTURES //

var fixtureDir = path.join( import.meta.dirname, '..', '..', '..', '..', '..', 'test', 'fixtures' );
var lines = readFileSync( path.join( fixtureDir, 'zlaunhr_col_getrfnp2.jsonl' ), 'utf8' ).trim().split( '\n' );
var fixture = lines.map( function parse( line ) {
	return JSON.parse( line );
});


// FUNCTIONS //

/**
* Finds a fixture case by name.
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
* Asserts two arrays are element-wise approximately equal.
*
* @private
* @param {*} actual - actual values
* @param {*} expected - expected values
* @param {number} tol - tolerance
* @param {string} msg - message
*/
function assertArrayClose( actual, expected, tol, msg ) {
	var relErr;
	var i;
	assert.equal( actual.length, expected.length, msg + ': length mismatch' );
	for ( i = 0; i < expected.length; i++ ) {
		relErr = Math.abs( actual[ i ] - expected[ i ] ) / Math.max( Math.abs( expected[ i ] ), 1.0 );
		assert.ok( relErr <= tol, msg + '[' + i + ']: expected ' + expected[ i ] + ', got ' + actual[ i ] );
	}
}

/**
* Builds a Complex128Array from an interleaved real/imag flat array.
*
* @private
* @param {Array<number>} flat - interleaved values
* @returns {Complex128Array} complex array
*/
function fromInterleaved( flat ) {
	var c;
	var v;
	var i;
	c = new Complex128Array( flat.length / 2 );
	v = reinterpret( c, 0 );
	for ( i = 0; i < flat.length; i++ ) {
		v[ i ] = flat[ i ];
	}
	return c;
}


// TESTS //

test( 'zlaunhr_col_getrfnp2: 3x3', function t() {
	var info;
	var tc;
	var a;
	var d;
	tc = findCase( '3x3' );
	a = fromInterleaved( [ 0.5, 0.3, 0.2, -0.1, -0.3, 0.2, -0.1, 0.4, 0.6, -0.2, 0.1, 0.3, 0.2, -0.3, -0.4, 0.1, 0.5, 0.2 ] );
	d = new Complex128Array( 3 );
	info = zlaunhr_col_getrfnp2( 3, 3, a, 1, 3, 0, d, 1, 0 );
	assert.equal( info, tc.info, 'info' );
	assertArrayClose( reinterpret( a, 0 ), tc.a, 1e-13, 'a' );
	assertArrayClose( reinterpret( d, 0 ), tc.d, 1e-14, 'd' );
});

test( 'zlaunhr_col_getrfnp2: 4x3 (M>N)', function t() {
	var info;
	var tc;
	var a;
	var d;
	tc = findCase( '4x3' );
	a = fromInterleaved( [ 0.3, 0.2, 0.1, -0.4, -0.2, 0.3, 0.4, 0.1, -0.1, 0.5, 0.5, -0.2, 0.2, 0.3, -0.3, 0.1, 0.2, -0.2, -0.4, 0.2, 0.6, 0.1, 0.1, -0.3 ] );
	d = new Complex128Array( 3 );
	info = zlaunhr_col_getrfnp2( 4, 3, a, 1, 4, 0, d, 1, 0 );
	assert.equal( info, tc.info, 'info' );
	assertArrayClose( reinterpret( a, 0 ), tc.a, 1e-13, 'a' );
	assertArrayClose( reinterpret( d, 0 ), tc.d, 1e-14, 'd' );
});

test( 'zlaunhr_col_getrfnp2: 3x4 (M<N)', function t() {
	var info;
	var tc;
	var a;
	var d;
	tc = findCase( '3x4' );
	a = fromInterleaved( [ 0.4, 0.2, 0.1, -0.3, -0.2, 0.4, -0.1, 0.3, 0.5, -0.2, 0.2, 0.1, 0.2, -0.1, -0.3, 0.2, 0.6, 0.3, 0.1, 0.4, -0.2, -0.1, 0.3, 0.2 ] );
	d = new Complex128Array( 3 );
	info = zlaunhr_col_getrfnp2( 3, 4, a, 1, 3, 0, d, 1, 0 );
	assert.equal( info, tc.info, 'info' );
	assertArrayClose( reinterpret( a, 0 ), tc.a, 1e-13, 'a' );
	assertArrayClose( reinterpret( d, 0 ), tc.d, 1e-14, 'd' );
});

test( 'zlaunhr_col_getrfnp2: 1x1', function t() {
	var info;
	var tc;
	var a;
	var d;
	tc = findCase( '1x1' );
	a = fromInterleaved( [ 0.7, 0.3 ] );
	d = new Complex128Array( 1 );
	info = zlaunhr_col_getrfnp2( 1, 1, a, 1, 1, 0, d, 1, 0 );
	assert.equal( info, tc.info, 'info' );
	assertArrayClose( reinterpret( a, 0 ), tc.a, 1e-14, 'a' );
	assertArrayClose( reinterpret( d, 0 ), tc.d, 1e-14, 'd' );
});

test( 'zlaunhr_col_getrfnp2: 1x1 negative', function t() {
	var info;
	var tc;
	var a;
	var d;
	tc = findCase( '1x1_neg' );
	a = fromInterleaved( [ -0.5, 0.4 ] );
	d = new Complex128Array( 1 );
	info = zlaunhr_col_getrfnp2( 1, 1, a, 1, 1, 0, d, 1, 0 );
	assert.equal( info, tc.info, 'info' );
	assertArrayClose( reinterpret( a, 0 ), tc.a, 1e-14, 'a' );
	assertArrayClose( reinterpret( d, 0 ), tc.d, 1e-14, 'd' );
});

test( 'zlaunhr_col_getrfnp2: 5x1 column vector', function t() {
	var info;
	var tc;
	var a;
	var d;
	tc = findCase( '5x1' );
	a = fromInterleaved( [ 0.6, 0.2, 0.3, -0.1, -0.2, 0.4, 0.1, 0.3, -0.4, -0.2 ] );
	d = new Complex128Array( 1 );
	info = zlaunhr_col_getrfnp2( 5, 1, a, 1, 5, 0, d, 1, 0 );
	assert.equal( info, tc.info, 'info' );
	assertArrayClose( reinterpret( a, 0 ), tc.a, 1e-13, 'a' );
	assertArrayClose( reinterpret( d, 0 ), tc.d, 1e-14, 'd' );
});

test( 'zlaunhr_col_getrfnp2: 1x5 row vector', function t() {
	var info;
	var tc;
	var a;
	var d;
	tc = findCase( '1x5' );
	a = fromInterleaved( [ 0.6, 0.2, 0.3, -0.1, -0.2, 0.4, 0.1, 0.3, -0.4, -0.2 ] );
	d = new Complex128Array( 1 );
	info = zlaunhr_col_getrfnp2( 1, 5, a, 1, 1, 0, d, 1, 0 );
	assert.equal( info, tc.info, 'info' );
	assertArrayClose( reinterpret( a, 0 ), tc.a, 1e-14, 'a' );
	assertArrayClose( reinterpret( d, 0 ), tc.d, 1e-14, 'd' );
});

test( 'zlaunhr_col_getrfnp2: 5x5 (recursive)', function t() {
	var info;
	var tc;
	var a;
	var d;
	tc = findCase( '5x5' );
	a = fromInterleaved( [ 0.50, 0.30, 0.20, -0.10, -0.30, 0.20, 0.10, 0.40, -0.20, -0.30, -0.10, 0.40, 0.60, -0.20, 0.10, 0.30, -0.20, -0.40, 0.30, 0.10, 0.20, -0.30, -0.40, 0.10, 0.50, 0.20, 0.30, -0.10, -0.10, 0.40, -0.30, 0.10, 0.20, 0.30, -0.10, -0.40, 0.60, 0.20, 0.40, -0.10, 0.40, -0.20, 0.10, 0.30, -0.20, 0.40, -0.30, -0.10, 0.50, 0.30 ] );
	d = new Complex128Array( 5 );
	info = zlaunhr_col_getrfnp2( 5, 5, a, 1, 5, 0, d, 1, 0 );
	assert.equal( info, tc.info, 'info' );
	assertArrayClose( reinterpret( a, 0 ), tc.a, 1e-13, 'a' );
	assertArrayClose( reinterpret( d, 0 ), tc.d, 1e-14, 'd' );
});

test( 'zlaunhr_col_getrfnp2: M=0 quick return', function t() {
	var info;
	var a;
	var d;
	a = fromInterleaved( [ 1.0, 2.0, 3.0, 4.0 ] );
	d = new Complex128Array( 1 );
	info = zlaunhr_col_getrfnp2( 0, 2, a, 1, 1, 0, d, 1, 0 );
	assert.equal( info, 0, 'info' );
	assert.equal( reinterpret( a, 0 )[ 0 ], 1.0, 'a unchanged' );
});

test( 'zlaunhr_col_getrfnp2: N=0 quick return', function t() {
	var info;
	var a;
	var d;
	a = fromInterleaved( [ 1.0, 2.0, 3.0, 4.0 ] );
	d = new Complex128Array( 1 );
	info = zlaunhr_col_getrfnp2( 2, 0, a, 1, 2, 0, d, 1, 0 );
	assert.equal( info, 0, 'info' );
	assert.equal( reinterpret( a, 0 )[ 0 ], 1.0, 'a unchanged' );
});
