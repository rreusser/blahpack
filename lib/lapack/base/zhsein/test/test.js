/**
* @license Apache-2.0
*
* Copyright (c) 2025 The Stdlib Authors.
*/

/* eslint-disable no-restricted-syntax, stdlib/first-unit-test, max-len */

// MODULES //

import test from 'node:test';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import Uint8Array from '@stdlib/array/uint8/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import zhsein from './../lib/base.js';


// FIXTURES //

var fixtureDir = path.join( import.meta.dirname, '..', '..', '..', '..', '..', 'test', 'fixtures' );
var lines = readFileSync( path.join( fixtureDir, 'zhsein.jsonl' ), 'utf8' ).trim().split( '\n' ); // eslint-disable-line node/no-sync
var fixture = lines.map( function parse( line ) {
	return JSON.parse( line );
} );


// VARIABLES //

var LD = 6;
var TOL = 1.0e-10;


// FUNCTIONS //

/**
* Returns the fixture test case matching the given name.
*
* @private
* @param {string} name - test case name
* @returns {Object} test case
*/
function findCase( name ) {
	return fixture.find( function find( t ) {
		return t.name === name;
	} );
}

/**
* Asserts two numbers are approximately equal.
*
* @private
* @param {number} actual - actual
* @param {number} expected - expected
* @param {number} tol - tolerance
* @param {string} msg - message
*/
function assertClose( actual, expected, tol, msg ) {
	var relErr = Math.abs( actual - expected ) / Math.max( Math.abs( expected ), 1.0 );
	assert.ok( relErr <= tol, msg + ': expected ' + expected + ', got ' + actual + ' (relErr=' + relErr + ')' );
}

/**
* Asserts two arrays are element-wise approximately equal.
*
* @private
* @param {Array} actual - actual
* @param {Array} expected - expected
* @param {number} tol - tolerance
* @param {string} msg - message
*/
function assertArrayClose( actual, expected, tol, msg ) {
	var i;
	assert.equal( actual.length, expected.length, msg + ': length mismatch' );
	for ( i = 0; i < expected.length; i++ ) {
		assertClose( actual[ i ], expected[ i ], tol, msg + '[' + i + ']' );
	}
}

/**
* Builds an LD x LD column-major Complex128 matrix from (row, col, re, im) entries (1-based).
*
* @private
* @param {Array<Array>} entries - entries
* @returns {Complex128Array} matrix
*/
function makeMatrix( entries ) {
	var H;
	var hv;
	var r;
	var c;
	var i;
	H = new Complex128Array( LD * LD );
	hv = reinterpret( H, 0 );
	for ( i = 0; i < entries.length; i++ ) {
		r = entries[ i ][ 0 ] - 1;
		c = entries[ i ][ 1 ] - 1;
		hv[ 2 * ( r + ( c * LD ) ) ] = entries[ i ][ 2 ];
		hv[ ( 2 * ( r + ( c * LD ) ) ) + 1 ] = entries[ i ][ 3 ];
	}
	return H;
}

/**
* Builds a Complex128 vector of length `n` from (re, im) pairs.
*
* @private
* @param {Array<Array>} pairs - pairs
* @returns {Complex128Array} vector
*/
function makeW( pairs ) {
	var w;
	var wv;
	var i;
	w = new Complex128Array( pairs.length );
	wv = reinterpret( w, 0 );
	for ( i = 0; i < pairs.length; i++ ) {
		wv[ 2 * i ] = pairs[ i ][ 0 ];
		wv[ ( 2 * i ) + 1 ] = pairs[ i ][ 1 ];
	}
	return w;
}

/**
* Extracts column `k` of an LD x LD complex matrix as a 2n-element Float64 array.
*
* @private
* @param {Complex128Array} V - matrix
* @param {NonNegativeInteger} k - column (0-based)
* @param {NonNegativeInteger} n - rows to extract
* @returns {Array} extracted
*/
function column( V, k, n ) {
	var vv = reinterpret( V, 0 );
	var out = [];
	var i;
	for ( i = 0; i < n; i++ ) {
		out.push( vv[ 2 * ( i + ( k * LD ) ) ] );
		out.push( vv[ ( 2 * ( i + ( k * LD ) ) ) + 1 ] );
	}
	return out;
}

/**
* Runs a zhsein test case.
*
* @private
* @param {string} side - side
* @param {string} eigsrc - eigsrc
* @param {Complex128Array} H - matrix
* @param {NonNegativeInteger} N - order
* @param {Complex128Array} w - eigenvalue array
* @param {Uint8Array} SELECT - selection
* @returns {Object} result
*/
function runCase( side, eigsrc, H, N, w, SELECT ) {
	var IFAILR;
	var IFAILL;
	var RWORK;
	var WORK;
	var VL;
	var VR;
	VL = new Complex128Array( LD * LD );
	VR = new Complex128Array( LD * LD );
	WORK = new Complex128Array( N * N );
	RWORK = new Float64Array( N );
	IFAILL = new Int32Array( LD );
	IFAILR = new Int32Array( LD );
	var res = zhsein( side, eigsrc, 'no', SELECT, 1, 0, N, H, 1, LD, 0, w, 1, 0, VL, 1, LD, 0, VR, 1, LD, 0, LD, 0, WORK, 1, 0, RWORK, 1, 0, IFAILL, 1, 0, IFAILR, 1, 0 );
	return {
		'info': res.info,
		'm': res.m,
		'VL': VL,
		'VR': VR,
		'IFAILL': IFAILL,
		'IFAILR': IFAILR
	};
}


// TESTS //

test( 'zhsein: is a function', function t() {
	assert.equal( typeof zhsein, 'function', 'is a function' );
} );

test( 'zhsein: right_all_3x3', function t() {
	var SELECT;
	var res;
	var tc;
	var H;
	var w;
	tc = findCase( 'right_all_3x3' );
	H = makeMatrix( [
		[ 1, 1, 2.0, 1.0 ], [ 1, 2, 1.0, 0.5 ], [ 1, 3, 0.5, 0.0 ],
		[ 2, 1, 0.1, 0.0 ], [ 2, 2, 3.0, 0.0 ], [ 2, 3, 1.0, -1.0 ],
		[ 3, 2, 0.05, 0.0 ], [ 3, 3, 4.0, -1.0 ]
	] );
	w = makeW( [ [ 2.0, 1.0 ], [ 3.0, 0.0 ], [ 4.0, -1.0 ] ] );
	SELECT = new Uint8Array( [ 1, 1, 1 ] );
	res = runCase( 'right', 'no', H, 3, w, SELECT );
	assert.equal( res.info, tc.info, 'info' );
	assert.equal( res.m, tc.m, 'm' );
	assertArrayClose( column( res.VR, 0, 3 ), tc.vr1, TOL, 'vr1' );
	assertArrayClose( column( res.VR, 1, 3 ), tc.vr2, TOL, 'vr2' );
	assertArrayClose( column( res.VR, 2, 3 ), tc.vr3, TOL, 'vr3' );
	assert.deepEqual( Array.from( res.IFAILR.slice( 0, 3 ) ), tc.ifailr, 'ifailr' );
} );

test( 'zhsein: left_all_3x3', function t() {
	var SELECT;
	var res;
	var tc;
	var H;
	var w;
	tc = findCase( 'left_all_3x3' );
	H = makeMatrix( [
		[ 1, 1, 2.0, 1.0 ], [ 1, 2, 1.0, 0.5 ], [ 1, 3, 0.5, 0.0 ],
		[ 2, 1, 0.1, 0.0 ], [ 2, 2, 3.0, 0.0 ], [ 2, 3, 1.0, -1.0 ],
		[ 3, 2, 0.05, 0.0 ], [ 3, 3, 4.0, -1.0 ]
	] );
	w = makeW( [ [ 2.0, 1.0 ], [ 3.0, 0.0 ], [ 4.0, -1.0 ] ] );
	SELECT = new Uint8Array( [ 1, 1, 1 ] );
	res = runCase( 'left', 'no', H, 3, w, SELECT );
	assert.equal( res.info, tc.info, 'info' );
	assert.equal( res.m, tc.m, 'm' );
	assertArrayClose( column( res.VL, 0, 3 ), tc.vl1, TOL, 'vl1' );
	assertArrayClose( column( res.VL, 1, 3 ), tc.vl2, TOL, 'vl2' );
	assertArrayClose( column( res.VL, 2, 3 ), tc.vl3, TOL, 'vl3' );
	assert.deepEqual( Array.from( res.IFAILL.slice( 0, 3 ) ), tc.ifaill, 'ifaill' );
} );

test( 'zhsein: both_4x4', function t() {
	var SELECT;
	var res;
	var tc;
	var H;
	var w;
	tc = findCase( 'both_4x4' );
	H = makeMatrix( [
		[ 1, 1, 1.0, 0.5 ], [ 1, 2, 0.5, 0.0 ], [ 1, 3, 0.2, 0.1 ], [ 1, 4, 0.1, 0.0 ],
		[ 2, 1, 0.3, 0.0 ], [ 2, 2, 2.0, -0.5 ], [ 2, 3, 0.8, 0.2 ], [ 2, 4, 0.3, 0.1 ],
		[ 3, 2, 0.2, 0.0 ], [ 3, 3, 3.0, 1.0 ], [ 3, 4, 0.7, -0.3 ],
		[ 4, 3, 0.15, 0.0 ], [ 4, 4, 4.0, 0.5 ]
	] );
	w = makeW( [ [ 1.0, 0.5 ], [ 2.0, -0.5 ], [ 3.0, 1.0 ], [ 4.0, 0.5 ] ] );
	SELECT = new Uint8Array( [ 1, 1, 1, 1 ] );
	res = runCase( 'both', 'no', H, 4, w, SELECT );
	assert.equal( res.info, tc.info, 'info' );
	assert.equal( res.m, tc.m, 'm' );
	assertArrayClose( column( res.VR, 0, 4 ), tc.vr1, TOL, 'vr1' );
	assertArrayClose( column( res.VR, 1, 4 ), tc.vr2, TOL, 'vr2' );
	assertArrayClose( column( res.VR, 2, 4 ), tc.vr3, TOL, 'vr3' );
	assertArrayClose( column( res.VR, 3, 4 ), tc.vr4, TOL, 'vr4' );
	assertArrayClose( column( res.VL, 0, 4 ), tc.vl1, TOL, 'vl1' );
	assertArrayClose( column( res.VL, 1, 4 ), tc.vl2, TOL, 'vl2' );
	assertArrayClose( column( res.VL, 2, 4 ), tc.vl3, TOL, 'vl3' );
	assertArrayClose( column( res.VL, 3, 4 ), tc.vl4, TOL, 'vl4' );
	assert.deepEqual( Array.from( res.IFAILR.slice( 0, 4 ) ), tc.ifailr, 'ifailr' );
	assert.deepEqual( Array.from( res.IFAILL.slice( 0, 4 ) ), tc.ifaill, 'ifaill' );
} );

test( 'zhsein: right_selective_5x5', function t() {
	var SELECT;
	var res;
	var tc;
	var H;
	var w;
	tc = findCase( 'right_selective_5x5' );
	H = makeMatrix( [
		[ 1, 1, 1.0, 0.0 ], [ 1, 2, 2.0, 0.0 ], [ 1, 3, 1.0, 0.0 ], [ 1, 4, 3.0, 0.0 ], [ 1, 5, 0.5, 0.0 ],
		[ 2, 2, 2.0, 1.0 ], [ 2, 3, 1.5, 0.0 ], [ 2, 4, 1.0, 0.0 ], [ 2, 5, 0.5, 0.0 ],
		[ 3, 3, 3.0, -1.0 ], [ 3, 4, 2.0, 0.0 ], [ 3, 5, 1.0, 0.0 ],
		[ 4, 4, 4.0, 0.5 ], [ 4, 5, 1.0, 0.0 ],
		[ 5, 5, 5.0, -0.5 ]
	] );
	w = makeW( [ [ 1.0, 0.0 ], [ 2.0, 1.0 ], [ 3.0, -1.0 ], [ 4.0, 0.5 ], [ 5.0, -0.5 ] ] );
	SELECT = new Uint8Array( [ 1, 0, 1, 0, 0 ] );
	res = runCase( 'right', 'no', H, 5, w, SELECT );
	assert.equal( res.info, tc.info, 'info' );
	assert.equal( res.m, tc.m, 'm' );
	assertArrayClose( column( res.VR, 0, 5 ), tc.vr1, TOL, 'vr1' );
	assertArrayClose( column( res.VR, 1, 5 ), tc.vr2, TOL, 'vr2' );
	assert.deepEqual( Array.from( res.IFAILR.slice( 0, 2 ) ), tc.ifailr, 'ifailr' );
} );

test( 'zhsein: n1_both', function t() {
	var SELECT;
	var res;
	var tc;
	var H;
	var w;
	tc = findCase( 'n1_both' );
	H = makeMatrix( [ [ 1, 1, 3.5, -1.2 ] ] );
	w = makeW( [ [ 3.5, -1.2 ] ] );
	SELECT = new Uint8Array( [ 1 ] );
	res = runCase( 'both', 'no', H, 1, w, SELECT );
	assert.equal( res.info, tc.info, 'info' );
	assert.equal( res.m, tc.m, 'm' );
	assertArrayClose( column( res.VR, 0, 1 ), tc.vr1, TOL, 'vr1' );
	assertArrayClose( column( res.VL, 0, 1 ), tc.vl1, TOL, 'vl1' );
} );

test( 'zhsein: both_fromqr_block_5x5', function t() {
	var SELECT;
	var res;
	var tc;
	var H;
	var w;
	tc = findCase( 'both_fromqr_block_5x5' );
	H = makeMatrix( [
		[ 1, 1, 2.0, 0.5 ], [ 1, 2, 1.0, 0.0 ], [ 1, 3, 0.5, 0.1 ], [ 1, 4, 0.2, 0.0 ], [ 1, 5, 0.1, 0.0 ],
		[ 2, 1, 0.3, 0.0 ], [ 2, 2, 3.0, -0.5 ], [ 2, 3, 1.0, 0.2 ], [ 2, 4, 0.3, 0.0 ], [ 2, 5, 0.2, 0.0 ],
		[ 3, 2, 0.2, 0.0 ], [ 3, 3, 4.0, 1.0 ], [ 3, 4, 0.4, 0.0 ], [ 3, 5, 0.3, 0.0 ],
		[ 4, 4, 5.0, -1.0 ], [ 4, 5, 1.0, 0.5 ],
		[ 5, 4, 0.3, 0.0 ], [ 5, 5, 6.0, 0.5 ]
	] );
	w = makeW( [ [ 2.0, 0.5 ], [ 3.0, -0.5 ], [ 4.0, 1.0 ], [ 5.0, -1.0 ], [ 6.0, 0.5 ] ] );
	SELECT = new Uint8Array( [ 1, 1, 1, 1, 1 ] );
	res = runCase( 'both', 'qr', H, 5, w, SELECT );
	assert.equal( res.info, tc.info, 'info' );
	assert.equal( res.m, tc.m, 'm' );
	assertArrayClose( column( res.VR, 0, 5 ), tc.vr1, TOL, 'vr1' );
	assertArrayClose( column( res.VR, 1, 5 ), tc.vr2, TOL, 'vr2' );
	assertArrayClose( column( res.VR, 2, 5 ), tc.vr3, TOL, 'vr3' );
	assertArrayClose( column( res.VR, 3, 5 ), tc.vr4, TOL, 'vr4' );
	assertArrayClose( column( res.VR, 4, 5 ), tc.vr5, TOL, 'vr5' );
	assertArrayClose( column( res.VL, 0, 5 ), tc.vl1, TOL, 'vl1' );
	assertArrayClose( column( res.VL, 1, 5 ), tc.vl2, TOL, 'vl2' );
	assertArrayClose( column( res.VL, 2, 5 ), tc.vl3, TOL, 'vl3' );
	assertArrayClose( column( res.VL, 3, 5 ), tc.vl4, TOL, 'vl4' );
	assertArrayClose( column( res.VL, 4, 5 ), tc.vl5, TOL, 'vl5' );
} );

test( 'zhsein: N=0 returns immediately', function t() {
	var res = runCase( 'both', 'no', new Complex128Array( 1 ), 0, new Complex128Array( 1 ), new Uint8Array( [ 0 ] ) );
	assert.equal( res.info, 0, 'info' );
	assert.equal( res.m, 0, 'm' );
} );

test( 'zhsein: invalid side returns info=-1', function t() {
	var SELECT = new Uint8Array( [ 1 ] );
	var H = makeMatrix( [ [ 1, 1, 1.0, 0.0 ] ] );
	var w = makeW( [ [ 1.0, 0.0 ] ] );
	var res = runCase( 'invalid', 'no', H, 1, w, SELECT );
	assert.equal( res.info, -1, 'info' );
} );

test( 'zhsein: invalid eigsrc returns info=-2', function t() {
	var SELECT = new Uint8Array( [ 1 ] );
	var H = makeMatrix( [ [ 1, 1, 1.0, 0.0 ] ] );
	var w = makeW( [ [ 1.0, 0.0 ] ] );
	var res = runCase( 'right', 'bad', H, 1, w, SELECT );
	assert.equal( res.info, -2, 'info' );
} );

test( 'zhsein: invalid initv returns info=-3', function t() {
	var SELECT = new Uint8Array( [ 1 ] );
	var H = makeMatrix( [ [ 1, 1, 1.0, 0.0 ] ] );
	var w = makeW( [ [ 1.0, 0.0 ] ] );
	var VL = new Complex128Array( LD * LD );
	var VR = new Complex128Array( LD * LD );
	var WORK = new Complex128Array( 1 );
	var RWORK = new Float64Array( 1 );
	var IFAILL = new Int32Array( LD );
	var IFAILR = new Int32Array( LD );
	var res = zhsein( 'right', 'no', 'bad', SELECT, 1, 0, 1, H, 1, LD, 0, w, 1, 0, VL, 1, LD, 0, VR, 1, LD, 0, LD, 0, WORK, 1, 0, RWORK, 1, 0, IFAILL, 1, 0, IFAILR, 1, 0 );
	assert.equal( res.info, -3, 'info' );
} );

test( 'zhsein: mm < m returns info=-13', function t() {
	var SELECT = new Uint8Array( [ 1, 1 ] );
	var H = makeMatrix( [ [ 1, 1, 1.0, 0.0 ], [ 2, 2, 2.0, 0.0 ] ] );
	var w = makeW( [ [ 1.0, 0.0 ], [ 2.0, 0.0 ] ] );
	var VL = new Complex128Array( LD * LD );
	var VR = new Complex128Array( LD * LD );
	var WORK = new Complex128Array( 4 );
	var RWORK = new Float64Array( 2 );
	var IFAILL = new Int32Array( LD );
	var IFAILR = new Int32Array( LD );
	var res = zhsein( 'right', 'no', 'no', SELECT, 1, 0, 2, H, 1, LD, 0, w, 1, 0, VL, 1, LD, 0, VR, 1, LD, 0, 1, 0, WORK, 1, 0, RWORK, 1, 0, IFAILL, 1, 0, IFAILR, 1, 0 );
	assert.equal( res.info, -13, 'info' );
} );
