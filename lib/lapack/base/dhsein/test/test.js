/**
* @license Apache-2.0
*
* Copyright (c) 2026 Ricky Reusser.
*
* Derived from the LAPACK 3.12.0 reference implementation (BSD-3-Clause).
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

const fixtureDir = path.join( import.meta.dirname, '..', '..', '..', '..', '..', 'test', 'fixtures' ); // eslint-disable-line max-len
const lines = readFileSync( path.join( fixtureDir, 'dhsein.jsonl' ), 'utf8' ).trim().split( '\n' ); // eslint-disable-line node/no-sync
const fixture = lines.map( function parse( line ) {
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
	const relErr = Math.abs( actual - expected ) / Math.max( Math.abs( expected ), 1.0 ); // eslint-disable-line max-len
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
	let i;
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
	const arr = new Float64Array( rows * cols );
	let i, j;
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
	const c = new Float64Array( n );
	let i;
	for ( i = 0; i < n; i++ ) {
		c[ i ] = mat[ j * rows + i ];
	}
	return c;
}

// The 4x4 matrix used in tests 1-2
const H4SYM = [
	[ 4.0, 3.0, 2.0, 1.0 ],
	[ 1.0, 4.0, 3.0, 2.0 ],
	[ 0.0, 1.0, 4.0, 3.0 ],
	[ 0.0, 0.0, 1.0, 4.0 ]
];

// The 4x4 matrix with complex eigenvalues
const H4CPX = [
	[ 0.0, -1.0, 2.0, 1.0 ],
	[ 1.0, 0.0, 1.0, 2.0 ],
	[ 0.0, 1.0, 0.0, -1.0 ],
	[ 0.0, 0.0, 1.0, 0.0 ]
];

// The 5x5 upper-triangular matrix
const H5TRI = [
	[ 1.0, 2.0, 1.0, 3.0, 0.5 ],
	[ 0.0, 2.0, 1.5, 1.0, 0.5 ],
	[ 0.0, 0.0, 3.0, 2.0, 1.0 ],
	[ 0.0, 0.0, 0.0, 4.0, 1.0 ],
	[ 0.0, 0.0, 0.0, 0.0, 5.0 ]
];

// 5x5 block matrix with H(4,3)=0
const H5BLK = [
	[ 2.0, 1.0, 0.5, 0.2, 0.1 ],
	[ 1.0, 3.0, 1.0, 0.3, 0.2 ],
	[ 0.0, 1.0, 4.0, 0.4, 0.3 ],
	[ 0.0, 0.0, 0.0, 5.0, 1.0 ],
	[ 0.0, 0.0, 0.0, 1.0, 6.0 ]
];

// 3x3 upper triangular
const H3TRI = [
	[ 1.0, 2.0, 3.0 ],
	[ 0.0, 4.0, 5.0 ],
	[ 0.0, 0.0, 6.0 ]
];

const TOL = 1e-12;

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


// TESTS //

test( 'dhsein: right_all_4x4', function t() {

	const tc = findCase( 'right_all_4x4' );
	const N = 4;
	const mm = 4;
	const H = packCM( N, N, H4SYM );
	const WR = new Float64Array( [ 8.290547, 4.735207, 2.285640, 0.688606 ] );
	const WI = new Float64Array( N );
	const SELECT = new Uint8Array( [ 1, 1, 1, 1 ] );
	const VL = new Float64Array( N * mm );
	const VR = new Float64Array( N * mm );
	const WORK = new Float64Array( ( N + 2 ) * N );
	const IFAILL = new Int32Array( mm );
	const IFAILR = new Int32Array( mm );
	const res = dhsein( 'right', 'no-source', 'no-init', SELECT, 1, 0, N, H, 1, N, 0, WR, 1, 0, WI, 1, 0, VL, 1, N, 0, VR, 1, N, 0, mm, 0, WORK, 1, 0, IFAILL, 1, 0, IFAILR, 1, 0 ); // eslint-disable-line max-len
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

	const tc = findCase( 'left_all_4x4' );
	const N = 4;
	const mm = 4;
	const H = packCM( N, N, H4SYM );
	const WR = new Float64Array( [ 8.290547, 4.735207, 2.285640, 0.688606 ] );
	const WI = new Float64Array( N );
	const SELECT = new Uint8Array( [ 1, 1, 1, 1 ] );
	const VL = new Float64Array( N * mm );
	const VR = new Float64Array( N * mm );
	const WORK = new Float64Array( ( N + 2 ) * N );
	const IFAILL = new Int32Array( mm );
	const IFAILR = new Int32Array( mm );
	const res = dhsein( 'left', 'no-source', 'no-init', SELECT, 1, 0, N, H, 1, N, 0, WR, 1, 0, WI, 1, 0, VL, 1, N, 0, VR, 1, N, 0, mm, 0, WORK, 1, 0, IFAILL, 1, 0, IFAILR, 1, 0 ); // eslint-disable-line max-len
	assert.equal( res.info, tc.info, 'info' );
	assert.equal( res.m, tc.m, 'm' );
	assertArrayClose( toArray( col( VL, N, 0, N ) ), tc.vl1, TOL, 'vl1' );
	assertArrayClose( toArray( col( VL, N, 1, N ) ), tc.vl2, TOL, 'vl2' );
	assertArrayClose( toArray( col( VL, N, 2, N ) ), tc.vl3, TOL, 'vl3' );
	assertArrayClose( toArray( col( VL, N, 3, N ) ), tc.vl4, TOL, 'vl4' );
	assertArrayClose( toArray( IFAILL ), tc.ifaill, TOL, 'ifaill' );
});

test( 'dhsein: both_complex_4x4', function t() {

	const tc = findCase( 'both_complex_4x4' );
	const N = 4;
	const mm = 4;
	const H = packCM( N, N, H4CPX );
	const WR = new Float64Array( [ 0.0, 0.0, 0.0, 0.0 ] );
	const WI = new Float64Array( [ 1.732051, -1.732051, 0.816497, -0.816497 ] );
	const SELECT = new Uint8Array( [ 1, 1, 1, 1 ] );
	const VL = new Float64Array( N * mm );
	const VR = new Float64Array( N * mm );
	const WORK = new Float64Array( ( N + 2 ) * N );
	const IFAILL = new Int32Array( mm );
	const IFAILR = new Int32Array( mm );
	const res = dhsein( 'both', 'no-source', 'no-init', SELECT, 1, 0, N, H, 1, N, 0, WR, 1, 0, WI, 1, 0, VL, 1, N, 0, VR, 1, N, 0, mm, 0, WORK, 1, 0, IFAILL, 1, 0, IFAILR, 1, 0 ); // eslint-disable-line max-len
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

	const tc = findCase( 'right_selective_5x5' );
	const N = 5;
	const mm = 3;
	const H = packCM( N, N, H5TRI );
	const WR = new Float64Array( [ 1.0, 2.0, 3.0, 4.0, 5.0 ] );
	const WI = new Float64Array( N );
	const SELECT = new Uint8Array( [ 1, 0, 1, 0, 1 ] );
	const VL = new Float64Array( N * mm );
	const VR = new Float64Array( N * mm );
	const WORK = new Float64Array( ( N + 2 ) * N );
	const IFAILL = new Int32Array( mm );
	const IFAILR = new Int32Array( mm );
	const res = dhsein( 'right', 'no-source', 'no-init', SELECT, 1, 0, N, H, 1, N, 0, WR, 1, 0, WI, 1, 0, VL, 1, N, 0, VR, 1, N, 0, mm, 0, WORK, 1, 0, IFAILL, 1, 0, IFAILR, 1, 0 ); // eslint-disable-line max-len
	assert.equal( res.info, tc.info, 'info' );
	assert.equal( res.m, tc.m, 'm' );
	assertArrayClose( toArray( col( VR, N, 0, N ) ), tc.vr1, TOL, 'vr1' );
	assertArrayClose( toArray( col( VR, N, 1, N ) ), tc.vr2, TOL, 'vr2' );
	assertArrayClose( toArray( col( VR, N, 2, N ) ), tc.vr3, TOL, 'vr3' );
	assertArrayClose( toArray( IFAILR.slice( 0, 3 ) ), tc.ifailr, TOL, 'ifailr' );
});

test( 'dhsein: both_fromqr_block_5x5', function t() {

	const tc = findCase( 'both_fromqr_block_5x5' );
	const N = 5;
	const mm = 5;
	const H = packCM( N, N, H5BLK );
	const WR = new Float64Array( [ 1.381966, 3.0, 4.618034, 5.5, 5.5 ] );
	const WI = new Float64Array( [ 0.0, 0.0, 0.0, 1.0, -1.0 ] );
	const SELECT = new Uint8Array( [ 1, 1, 1, 1, 1 ] );
	const VL = new Float64Array( N * mm );
	const VR = new Float64Array( N * mm );
	const WORK = new Float64Array( ( N + 2 ) * N );
	const IFAILL = new Int32Array( mm );
	const IFAILR = new Int32Array( mm );
	const res = dhsein( 'both', 'qr', 'no-init', SELECT, 1, 0, N, H, 1, N, 0, WR, 1, 0, WI, 1, 0, VL, 1, N, 0, VR, 1, N, 0, mm, 0, WORK, 1, 0, IFAILL, 1, 0, IFAILR, 1, 0 ); // eslint-disable-line max-len
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

	const tc = findCase( 'n1_both' );
	const N = 1;
	const mm = 1;
	const H = new Float64Array( [ 3.5 ] );
	const WR = new Float64Array( [ 3.5 ] );
	const WI = new Float64Array( [ 0.0 ] );
	const SELECT = new Uint8Array( [ 1 ] );
	const VL = new Float64Array( 1 );
	const VR = new Float64Array( 1 );
	const WORK = new Float64Array( ( N + 2 ) * N );
	const IFAILL = new Int32Array( 1 );
	const IFAILR = new Int32Array( 1 );
	const res = dhsein( 'both', 'no-source', 'no-init', SELECT, 1, 0, N, H, 1, 1, 0, WR, 1, 0, WI, 1, 0, VL, 1, 1, 0, VR, 1, 1, 0, mm, 0, WORK, 1, 0, IFAILL, 1, 0, IFAILR, 1, 0 ); // eslint-disable-line max-len
	assert.equal( res.info, tc.info, 'info' );
	assert.equal( res.m, tc.m, 'm' );
	assertArrayClose( toArray( VR ), tc.vr1, TOL, 'vr1' );
	assertArrayClose( toArray( VL ), tc.vl1, TOL, 'vl1' );
});

test( 'dhsein: right_triangular_3x3', function t() {

	const tc = findCase( 'right_triangular_3x3' );
	const N = 3;
	const mm = 3;
	const H = packCM( N, N, H3TRI );
	const WR = new Float64Array( [ 1.0, 4.0, 6.0 ] );
	const WI = new Float64Array( N );
	const SELECT = new Uint8Array( [ 1, 1, 1 ] );
	const VL = new Float64Array( N * mm );
	const VR = new Float64Array( N * mm );
	const WORK = new Float64Array( ( N + 2 ) * N );
	const IFAILL = new Int32Array( mm );
	const IFAILR = new Int32Array( mm );
	const res = dhsein( 'right', 'no-source', 'no-init', SELECT, 1, 0, N, H, 1, N, 0, WR, 1, 0, WI, 1, 0, VL, 1, N, 0, VR, 1, N, 0, mm, 0, WORK, 1, 0, IFAILL, 1, 0, IFAILR, 1, 0 ); // eslint-disable-line max-len
	assert.equal( res.info, tc.info, 'info' );
	assert.equal( res.m, tc.m, 'm' );
	assertArrayClose( toArray( col( VR, N, 0, N ) ), tc.vr1, TOL, 'vr1' );
	assertArrayClose( toArray( col( VR, N, 1, N ) ), tc.vr2, TOL, 'vr2' );
	assertArrayClose( toArray( col( VR, N, 2, N ) ), tc.vr3, TOL, 'vr3' );
});

test( 'dhsein: N=0 quick return', function t() {

	const H = new Float64Array( 0 );
	const WR = new Float64Array( 0 );
	const WI = new Float64Array( 0 );
	const SELECT = new Uint8Array( 0 );
	const VL = new Float64Array( 0 );
	const VR = new Float64Array( 0 );
	const WORK = new Float64Array( 0 );
	const IFAILL = new Int32Array( 0 );
	const IFAILR = new Int32Array( 0 );
	const res = dhsein( 'both', 'no-source', 'no-init', SELECT, 1, 0, 0, H, 1, 1, 0, WR, 1, 0, WI, 1, 0, VL, 1, 1, 0, VR, 1, 1, 0, 0, 0, WORK, 1, 0, IFAILL, 1, 0, IFAILR, 1, 0 ); // eslint-disable-line max-len
	assert.equal( res.info, 0, 'info' );
	assert.equal( res.m, 0, 'm' );
});
