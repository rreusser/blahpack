/**
* @license Apache-2.0
*
* Copyright (c) 2025 The Stdlib Authors.
*/

/* eslint-disable no-restricted-syntax, stdlib/first-unit-test, max-len, max-statements */


// MODULES //

import test from 'node:test';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import dhsein from './../lib/base.js';


// FIXTURES //

var fixtureDir = path.join( import.meta.dirname, '..', '..', '..', '..', '..', 'test', 'fixtures' ); // eslint-disable-line max-len
var lines = readFileSync( path.join( fixtureDir, 'dhsein.jsonl' ), 'utf8' ).trim().split( '\n' ); // eslint-disable-line node/no-sync
var fixture = lines.map( function parse( line ) {
		return JSON.parse( line );
	} );


// FUNCTIONS //

/**
* Returns a test case from the fixture data.
*
* @private
* @param {string} name - test case name
* @returns {*} result
*/
function findCase( name ) {
		return fixture.find( function find( t ) { return t.name === name;
	} );
}

/**
* Asserts that two numbers are approximately equal.
*
* @private
* @param {*} actual - actual value
* @param {*} expected - expected value
* @param {number} tol - tolerance
* @param {string} msg - assertion message
*/
function assertClose( actual, expected, tol, msg ) {
	var relErr = Math.abs( actual - expected ) / Math.max( Math.abs( expected ), 1.0 ); // eslint-disable-line max-len
	assert.ok( relErr <= tol, msg + ': expected ' + expected + ', got ' + actual );
}

/**
* Asserts that two arrays are element-wise approximately equal.
*
* @private
* @param {*} actual - actual value
* @param {*} expected - expected value
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

// Pack a column-major matrix of size rows x cols into a Float64Array.
/**
* PackCM.
*
* @private
* @param {*} rows - rows
* @param {*} cols - cols
* @param {*} data - data
* @returns {*} result
*/
function packCM( rows, cols, data ) {
	var arr = new Float64Array( rows * cols );
	var i;
	var j;
	for ( j = 0; j < cols; j++ ) {
		for ( i = 0; i < rows; i++ ) {
			arr[ j * rows + i ] = data[ i ][ j ];
		}
	}
	return arr;
}

/**
* Col.
*
* @private
* @param {*} mat - mat
* @param {*} rows - rows
* @param {*} j - j
* @param {*} n - n
* @returns {*} result
*/
function col( mat, rows, j, n ) {
	var c = new Float64Array( n );
	var i;
	for ( i = 0; i < n; i++ ) {
		c[ i ] = mat[ j * rows + i ];
	}
	return c;
}

// The 4x4 matrix used in tests 1-2
var H4SYM = [
	[ 4.0, 3.0, 2.0, 1.0 ],
	[ 1.0, 4.0, 3.0, 2.0 ],
	[ 0.0, 1.0, 4.0, 3.0 ],
	[ 0.0, 0.0, 1.0, 4.0 ]
];

// The 4x4 matrix with complex eigenvalues
var H4CPX = [
	[ 0.0, -1.0, 2.0, 1.0 ],
	[ 1.0, 0.0, 1.0, 2.0 ],
	[ 0.0, 1.0, 0.0, -1.0 ],
	[ 0.0, 0.0, 1.0, 0.0 ]
];

// The 5x5 upper-triangular matrix
var H5TRI = [
	[ 1.0, 2.0, 1.0, 3.0, 0.5 ],
	[ 0.0, 2.0, 1.5, 1.0, 0.5 ],
	[ 0.0, 0.0, 3.0, 2.0, 1.0 ],
	[ 0.0, 0.0, 0.0, 4.0, 1.0 ],
	[ 0.0, 0.0, 0.0, 0.0, 5.0 ]
];

// 5x5 block matrix with H(4,3)=0
var H5BLK = [
	[ 2.0, 1.0, 0.5, 0.2, 0.1 ],
	[ 1.0, 3.0, 1.0, 0.3, 0.2 ],
	[ 0.0, 1.0, 4.0, 0.4, 0.3 ],
	[ 0.0, 0.0, 0.0, 5.0, 1.0 ],
	[ 0.0, 0.0, 0.0, 1.0, 6.0 ]
];

// 3x3 upper triangular
var H3TRI = [
	[ 1.0, 2.0, 3.0 ],
	[ 0.0, 4.0, 5.0 ],
	[ 0.0, 0.0, 6.0 ]
];

var TOL = 1e-12;

/**
* Converts a typed array to a plain array.
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

test( 'dhsein: right_all_4x4', function t() {
	var SELECT;
	var IFAILL;
	var IFAILR;
	var WORK;
	var res;
	var tc;
	var mm;
	var WR;
	var WI;
	var VL;
	var VR;
	var N;
	var H;

	tc = findCase( 'right_all_4x4' );
	N = 4;
	mm = 4;
	H = packCM( N, N, H4SYM );
	WR = new Float64Array( [ 8.290547, 4.735207, 2.285640, 0.688606 ] );
	WI = new Float64Array( N );
	SELECT = new Uint8Array( [ 1, 1, 1, 1 ] );
	VL = new Float64Array( N * mm );
	VR = new Float64Array( N * mm );
	WORK = new Float64Array( ( N + 2 ) * N );
	IFAILL = new Int32Array( mm );
	IFAILR = new Int32Array( mm );
	res = dhsein( 'right', 'no-source', 'no-init', SELECT, 1, 0, N, H, 1, N, 0, WR, 1, 0, WI, 1, 0, VL, 1, N, 0, VR, 1, N, 0, mm, 0, WORK, 1, 0, IFAILL, 1, 0, IFAILR, 1, 0 ); // eslint-disable-line max-len
	assert.equal( res.info, tc.info, 'info' );
	assert.equal( res.m, tc.m, 'm' );
	assertArrayClose( toArray( WR ), tc.wr, TOL, 'wr' );
	assertArrayClose( toArray( col( VR, N, 0, N ) ), tc.vr1, TOL, 'vr1' );
	assertArrayClose( toArray( col( VR, N, 1, N ) ), tc.vr2, TOL, 'vr2' );
	assertArrayClose( toArray( col( VR, N, 2, N ) ), tc.vr3, TOL, 'vr3' );
	assertArrayClose( toArray( col( VR, N, 3, N ) ), tc.vr4, TOL, 'vr4' );
	assertArrayClose( toArray( IFAILR ), tc.ifailr, TOL, 'ifailr' );
});

test( 'dhsein: left_all_4x4', function t() {
	var SELECT;
	var IFAILL;
	var IFAILR;
	var WORK;
	var res;
	var tc;
	var mm;
	var WR;
	var WI;
	var VL;
	var VR;
	var N;
	var H;

	tc = findCase( 'left_all_4x4' );
	N = 4;
	mm = 4;
	H = packCM( N, N, H4SYM );
	WR = new Float64Array( [ 8.290547, 4.735207, 2.285640, 0.688606 ] );
	WI = new Float64Array( N );
	SELECT = new Uint8Array( [ 1, 1, 1, 1 ] );
	VL = new Float64Array( N * mm );
	VR = new Float64Array( N * mm );
	WORK = new Float64Array( ( N + 2 ) * N );
	IFAILL = new Int32Array( mm );
	IFAILR = new Int32Array( mm );
	res = dhsein( 'left', 'no-source', 'no-init', SELECT, 1, 0, N, H, 1, N, 0, WR, 1, 0, WI, 1, 0, VL, 1, N, 0, VR, 1, N, 0, mm, 0, WORK, 1, 0, IFAILL, 1, 0, IFAILR, 1, 0 ); // eslint-disable-line max-len
	assert.equal( res.info, tc.info, 'info' );
	assert.equal( res.m, tc.m, 'm' );
	assertArrayClose( toArray( col( VL, N, 0, N ) ), tc.vl1, TOL, 'vl1' );
	assertArrayClose( toArray( col( VL, N, 1, N ) ), tc.vl2, TOL, 'vl2' );
	assertArrayClose( toArray( col( VL, N, 2, N ) ), tc.vl3, TOL, 'vl3' );
	assertArrayClose( toArray( col( VL, N, 3, N ) ), tc.vl4, TOL, 'vl4' );
	assertArrayClose( toArray( IFAILL ), tc.ifaill, TOL, 'ifaill' );
});

test( 'dhsein: both_complex_4x4', function t() {
	var SELECT;
	var IFAILL;
	var IFAILR;
	var WORK;
	var res;
	var tc;
	var mm;
	var WR;
	var WI;
	var VL;
	var VR;
	var N;
	var H;

	tc = findCase( 'both_complex_4x4' );
	N = 4;
	mm = 4;
	H = packCM( N, N, H4CPX );
	WR = new Float64Array( [ 0.0, 0.0, 0.0, 0.0 ] );
	WI = new Float64Array( [ 1.732051, -1.732051, 0.816497, -0.816497 ] );
	SELECT = new Uint8Array( [ 1, 1, 1, 1 ] );
	VL = new Float64Array( N * mm );
	VR = new Float64Array( N * mm );
	WORK = new Float64Array( ( N + 2 ) * N );
	IFAILL = new Int32Array( mm );
	IFAILR = new Int32Array( mm );
	res = dhsein( 'both', 'no-source', 'no-init', SELECT, 1, 0, N, H, 1, N, 0, WR, 1, 0, WI, 1, 0, VL, 1, N, 0, VR, 1, N, 0, mm, 0, WORK, 1, 0, IFAILL, 1, 0, IFAILR, 1, 0 ); // eslint-disable-line max-len
	assert.equal( res.info, tc.info, 'info' );
	assert.equal( res.m, tc.m, 'm' );
	assertArrayClose( toArray( col( VR, N, 0, N ) ), tc.vr1, TOL, 'vr1' );
	assertArrayClose( toArray( col( VR, N, 1, N ) ), tc.vr2, TOL, 'vr2' );
	assertArrayClose( toArray( col( VR, N, 2, N ) ), tc.vr3, TOL, 'vr3' );
	assertArrayClose( toArray( col( VR, N, 3, N ) ), tc.vr4, TOL, 'vr4' );
	assertArrayClose( toArray( col( VL, N, 0, N ) ), tc.vl1, TOL, 'vl1' );
	assertArrayClose( toArray( col( VL, N, 1, N ) ), tc.vl2, TOL, 'vl2' );
	assertArrayClose( toArray( col( VL, N, 2, N ) ), tc.vl3, TOL, 'vl3' );
	assertArrayClose( toArray( col( VL, N, 3, N ) ), tc.vl4, TOL, 'vl4' );
	assertArrayClose( toArray( IFAILR ), tc.ifailr, TOL, 'ifailr' );
	assertArrayClose( toArray( IFAILL ), tc.ifaill, TOL, 'ifaill' );
});

test( 'dhsein: right_selective_5x5', function t() {
	var SELECT;
	var IFAILL;
	var IFAILR;
	var WORK;
	var res;
	var tc;
	var mm;
	var WR;
	var WI;
	var VL;
	var VR;
	var N;
	var H;

	tc = findCase( 'right_selective_5x5' );
	N = 5;
	mm = 3;
	H = packCM( N, N, H5TRI );
	WR = new Float64Array( [ 1.0, 2.0, 3.0, 4.0, 5.0 ] );
	WI = new Float64Array( N );
	SELECT = new Uint8Array( [ 1, 0, 1, 0, 1 ] );
	VL = new Float64Array( N * mm );
	VR = new Float64Array( N * mm );
	WORK = new Float64Array( ( N + 2 ) * N );
	IFAILL = new Int32Array( mm );
	IFAILR = new Int32Array( mm );
	res = dhsein( 'right', 'no-source', 'no-init', SELECT, 1, 0, N, H, 1, N, 0, WR, 1, 0, WI, 1, 0, VL, 1, N, 0, VR, 1, N, 0, mm, 0, WORK, 1, 0, IFAILL, 1, 0, IFAILR, 1, 0 ); // eslint-disable-line max-len
	assert.equal( res.info, tc.info, 'info' );
	assert.equal( res.m, tc.m, 'm' );
	assertArrayClose( toArray( col( VR, N, 0, N ) ), tc.vr1, TOL, 'vr1' );
	assertArrayClose( toArray( col( VR, N, 1, N ) ), tc.vr2, TOL, 'vr2' );
	assertArrayClose( toArray( col( VR, N, 2, N ) ), tc.vr3, TOL, 'vr3' );
	assertArrayClose( toArray( IFAILR.slice( 0, 3 ) ), tc.ifailr, TOL, 'ifailr' );
});

test( 'dhsein: both_fromqr_block_5x5', function t() {
	var SELECT;
	var IFAILL;
	var IFAILR;
	var WORK;
	var res;
	var tc;
	var mm;
	var WR;
	var WI;
	var VL;
	var VR;
	var N;
	var H;

	tc = findCase( 'both_fromqr_block_5x5' );
	N = 5;
	mm = 5;
	H = packCM( N, N, H5BLK );
	WR = new Float64Array( [ 1.381966, 3.0, 4.618034, 5.5, 5.5 ] );
	WI = new Float64Array( [ 0.0, 0.0, 0.0, 1.0, -1.0 ] );
	SELECT = new Uint8Array( [ 1, 1, 1, 1, 1 ] );
	VL = new Float64Array( N * mm );
	VR = new Float64Array( N * mm );
	WORK = new Float64Array( ( N + 2 ) * N );
	IFAILL = new Int32Array( mm );
	IFAILR = new Int32Array( mm );
	res = dhsein( 'both', 'qr', 'no-init', SELECT, 1, 0, N, H, 1, N, 0, WR, 1, 0, WI, 1, 0, VL, 1, N, 0, VR, 1, N, 0, mm, 0, WORK, 1, 0, IFAILL, 1, 0, IFAILR, 1, 0 ); // eslint-disable-line max-len
	assert.equal( res.info, tc.info, 'info' );
	assert.equal( res.m, tc.m, 'm' );
	assertArrayClose( toArray( col( VR, N, 0, N ) ), tc.vr1, TOL, 'vr1' );
	assertArrayClose( toArray( col( VR, N, 1, N ) ), tc.vr2, TOL, 'vr2' );
	assertArrayClose( toArray( col( VR, N, 2, N ) ), tc.vr3, TOL, 'vr3' );
	assertArrayClose( toArray( col( VR, N, 3, N ) ), tc.vr4, TOL, 'vr4' );
	assertArrayClose( toArray( col( VR, N, 4, N ) ), tc.vr5, TOL, 'vr5' );
	assertArrayClose( toArray( col( VL, N, 0, N ) ), tc.vl1, TOL, 'vl1' );
	assertArrayClose( toArray( col( VL, N, 1, N ) ), tc.vl2, TOL, 'vl2' );
	assertArrayClose( toArray( col( VL, N, 2, N ) ), tc.vl3, TOL, 'vl3' );
	assertArrayClose( toArray( col( VL, N, 3, N ) ), tc.vl4, TOL, 'vl4' );
	assertArrayClose( toArray( col( VL, N, 4, N ) ), tc.vl5, TOL, 'vl5' );
});

test( 'dhsein: n1_both', function t() {
	var SELECT;
	var IFAILL;
	var IFAILR;
	var WORK;
	var res;
	var tc;
	var mm;
	var WR;
	var WI;
	var VL;
	var VR;
	var N;
	var H;

	tc = findCase( 'n1_both' );
	N = 1;
	mm = 1;
	H = new Float64Array( [ 3.5 ] );
	WR = new Float64Array( [ 3.5 ] );
	WI = new Float64Array( [ 0.0 ] );
	SELECT = new Uint8Array( [ 1 ] );
	VL = new Float64Array( 1 );
	VR = new Float64Array( 1 );
	WORK = new Float64Array( ( N + 2 ) * N );
	IFAILL = new Int32Array( 1 );
	IFAILR = new Int32Array( 1 );
	res = dhsein( 'both', 'no-source', 'no-init', SELECT, 1, 0, N, H, 1, 1, 0, WR, 1, 0, WI, 1, 0, VL, 1, 1, 0, VR, 1, 1, 0, mm, 0, WORK, 1, 0, IFAILL, 1, 0, IFAILR, 1, 0 ); // eslint-disable-line max-len
	assert.equal( res.info, tc.info, 'info' );
	assert.equal( res.m, tc.m, 'm' );
	assertArrayClose( toArray( VR ), tc.vr1, TOL, 'vr1' );
	assertArrayClose( toArray( VL ), tc.vl1, TOL, 'vl1' );
});

test( 'dhsein: right_triangular_3x3', function t() {
	var SELECT;
	var IFAILL;
	var IFAILR;
	var WORK;
	var res;
	var tc;
	var mm;
	var WR;
	var WI;
	var VL;
	var VR;
	var N;
	var H;

	tc = findCase( 'right_triangular_3x3' );
	N = 3;
	mm = 3;
	H = packCM( N, N, H3TRI );
	WR = new Float64Array( [ 1.0, 4.0, 6.0 ] );
	WI = new Float64Array( N );
	SELECT = new Uint8Array( [ 1, 1, 1 ] );
	VL = new Float64Array( N * mm );
	VR = new Float64Array( N * mm );
	WORK = new Float64Array( ( N + 2 ) * N );
	IFAILL = new Int32Array( mm );
	IFAILR = new Int32Array( mm );
	res = dhsein( 'right', 'no-source', 'no-init', SELECT, 1, 0, N, H, 1, N, 0, WR, 1, 0, WI, 1, 0, VL, 1, N, 0, VR, 1, N, 0, mm, 0, WORK, 1, 0, IFAILL, 1, 0, IFAILR, 1, 0 ); // eslint-disable-line max-len
	assert.equal( res.info, tc.info, 'info' );
	assert.equal( res.m, tc.m, 'm' );
	assertArrayClose( toArray( col( VR, N, 0, N ) ), tc.vr1, TOL, 'vr1' );
	assertArrayClose( toArray( col( VR, N, 1, N ) ), tc.vr2, TOL, 'vr2' );
	assertArrayClose( toArray( col( VR, N, 2, N ) ), tc.vr3, TOL, 'vr3' );
});

test( 'dhsein: N=0 quick return', function t() {
	var SELECT;
	var IFAILL;
	var IFAILR;
	var WORK;
	var res;
	var WR;
	var WI;
	var VL;
	var VR;
	var H;

	H = new Float64Array( 0 );
	WR = new Float64Array( 0 );
	WI = new Float64Array( 0 );
	SELECT = new Uint8Array( 0 );
	VL = new Float64Array( 0 );
	VR = new Float64Array( 0 );
	WORK = new Float64Array( 0 );
	IFAILL = new Int32Array( 0 );
	IFAILR = new Int32Array( 0 );
	res = dhsein( 'both', 'no-source', 'no-init', SELECT, 1, 0, 0, H, 1, 1, 0, WR, 1, 0, WI, 1, 0, VL, 1, 1, 0, VR, 1, 1, 0, 0, 0, WORK, 1, 0, IFAILL, 1, 0, IFAILR, 1, 0 ); // eslint-disable-line max-len
	assert.equal( res.info, 0, 'info' );
	assert.equal( res.m, 0, 'm' );
});
