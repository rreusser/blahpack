/* eslint-disable no-restricted-syntax, stdlib/first-unit-test, max-len, max-statements */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import ztgexc from './../lib/ndarray.js';
import ndarrayFn from './../lib/ndarray.js';


// FIXTURES //

var fixtureDir = path.join( import.meta.dirname, '..', '..', '..', '..', '..', 'test', 'fixtures' );
var lines = readFileSync( path.join( fixtureDir, 'ztgexc.jsonl' ), 'utf8' ).trim().split( '\n' );
var fixture = lines.map( function parse( line ) { return JSON.parse( line ); } );


// FUNCTIONS //

function findCase( name ) {
	return fixture.find( function find( t ) { return t.name === name; } );
}

function assertClose( actual, expected, tol, msg ) {
	var relErr = Math.abs( actual - expected ) / Math.max( Math.abs( expected ), 1.0 );
	assert.ok( relErr <= tol, msg + ': expected ' + expected + ', got ' + actual );
}

function assertArrayClose( actual, expected, tol, msg ) {
	var i;
	assert.equal( actual.length, expected.length, msg + ': length mismatch' );
	for ( i = 0; i < expected.length; i++ ) {
		assertClose( actual[ i ], expected[ i ], tol, msg + '[' + i + ']' );
	}
}

/**
* Creates an NxN identity matrix as a Complex128Array.
*
* @private
* @param {number} N - matrix order
* @returns {Complex128Array} identity matrix
*/
function eye( N ) {
	var out = new Complex128Array( N * N );
	var v = reinterpret( out, 0 );
	var i;
	for ( i = 0; i < N; i++ ) {
		v[ 2 * ( i * N + i ) ] = 1.0;
	}
	return out;
}

/**
* Runs a standard ztgexc test case with Q and Z accumulation.
*
* @private
* @param {string} name - fixture name
* @param {number} N - matrix order
* @param {Array} Adata - interleaved initial A data
* @param {Array} Bdata - interleaved initial B data
* @param {boolean} wantq - whether to accumulate Q
* @param {boolean} wantz - whether to accumulate Z
* @param {number} ifst - 0-based starting position
* @param {number} ilst - 0-based target position
*/
function runTest( name, N, Adata, Bdata, wantq, wantz, ifst, ilst ) {
	var result;
	var tc = findCase( name );
	var A = new Complex128Array( Adata );
	var B = new Complex128Array( Bdata );
	var Q = eye( N );
	var Z = eye( N );
	result = ztgexc( wantq, wantz, N, A, 1, N, 0, B, 1, N, 0, Q, 1, N, 0, Z, 1, N, 0, ifst, ilst );

	assertArrayClose( Array.from( reinterpret( A, 0 ) ), tc.A, 1e-13, 'A' );
	assertArrayClose( Array.from( reinterpret( B, 0 ) ), tc.B, 1e-13, 'B' );
	if ( wantq ) {
		assertArrayClose( Array.from( reinterpret( Q, 0 ) ), tc.Q, 1e-13, 'Q' );
	}
	if ( wantz ) {
		assertArrayClose( Array.from( reinterpret( Z, 0 ) ), tc.Z, 1e-13, 'Z' );
	}
	assert.equal( result.info, tc.info, 'info' );
	// Fortran uses 1-based, JS uses 0-based:
	assert.equal( result.ifst, tc.ifst - 1, 'ifst' );
	assert.equal( result.ilst, tc.ilst - 1, 'ilst' );
}


// DATA //

// 4x4 upper triangular A (column-major, interleaved re/im)
var A4 = [
	1.0, 0.5,  0.0, 0.0,  0.0, 0.0,  0.0, 0.0,
	0.3, 0.1,  2.0, -0.3, 0.0, 0.0,  0.0, 0.0,
	0.1, -0.1, 0.4, 0.3,  3.0, 1.0,  0.0, 0.0,
	0.05, 0.02, 0.2, -0.1, 0.6, 0.1, 4.0, 0.8
];

// 4x4 upper triangular B (column-major, interleaved re/im)
var B4 = [
	1.0, 0.0,  0.0, 0.0,  0.0, 0.0,  0.0, 0.0,
	0.1, 0.1,  1.0, 0.0,  0.0, 0.0,  0.0, 0.0,
	0.05, 0.0, 0.15, -0.05, 1.0, 0.0, 0.0, 0.0,
	0.02, -0.01, 0.08, 0.03, 0.12, 0.04, 1.0, 0.0
];

// 3x3 upper triangular A (column-major, interleaved re/im)
var A3 = [
	2.0, 1.0,  0.0, 0.0,  0.0, 0.0,
	0.5, -0.2, 4.0, 0.0,  0.0, 0.0,
	0.3, 0.1,  0.7, -0.3, 6.0, -1.0
];

// 3x3 upper triangular B (column-major, interleaved re/im)
var B3 = [
	1.0, 0.0,  0.0, 0.0,  0.0, 0.0,
	0.2, 0.1,  1.0, 0.0,  0.0, 0.0,
	0.1, -0.05, 0.3, 0.2, 1.0, 0.0
];

// 2x2 upper triangular A
var A2 = [
	1.0, 0.5,  0.0, 0.0,
	0.3, 0.1,  2.0, -0.3
];

// 2x2 upper triangular B
var B2 = [
	1.0, 0.0,   0.0, 0.0,
	0.2, -0.1,  0.5, 0.2
];


// TESTS //

test( 'base is a function', function t() {
	assert.strictEqual( typeof ztgexc, 'function', 'is a function' );
});

test( 'ndarray is a function', function t() {
	assert.strictEqual( typeof ndarrayFn, 'function', 'is a function' );
});

test( 'ztgexc: move forward ifst=1 ilst=3 wantq=T wantz=T', function t() {
	// Fortran: IFST=1, ILST=3 (1-based) -> JS: ifst=0, ilst=2 (0-based)
	runTest( 'move forward ifst=1 ilst=3 wantq=T wantz=T', 4, A4, B4, true, true, 0, 2 );
});

test( 'ztgexc: move backward ifst=3 ilst=1 wantq=T wantz=T', function t() {
	// Fortran: IFST=3, ILST=1 -> JS: ifst=2, ilst=0
	runTest( 'move backward ifst=3 ilst=1 wantq=T wantz=T', 4, A4, B4, true, true, 2, 0 );
});

test( 'ztgexc: move forward ifst=1 ilst=3 wantq=F wantz=F', function t() {
	var tc = findCase( 'move forward ifst=1 ilst=3 wantq=F wantz=F' );
	var A = new Complex128Array( A3 );
	var B = new Complex128Array( B3 );
	var Q = eye( 3 );
	var Z = eye( 3 );
	var result = ztgexc( false, false, 3, A, 1, 3, 0, B, 1, 3, 0, Q, 1, 3, 0, Z, 1, 3, 0, 0, 2 );

	assertArrayClose( Array.from( reinterpret( A, 0 ) ), tc.A, 1e-13, 'A' );
	assertArrayClose( Array.from( reinterpret( B, 0 ) ), tc.B, 1e-13, 'B' );
	assert.equal( result.info, tc.info, 'info' );
	assert.equal( result.ifst, tc.ifst - 1, 'ifst' );
	assert.equal( result.ilst, tc.ilst - 1, 'ilst' );
});

test( 'ztgexc: no-op ifst=ilst=2', function t() {
	var tc = findCase( 'no-op ifst=ilst=2' );
	var A = new Complex128Array( A3 );
	var B = new Complex128Array( B3 );
	var Q = eye( 3 );
	var Z = eye( 3 );
	// Fortran: IFST=2, ILST=2 -> JS: ifst=1, ilst=1
	var result = ztgexc( true, true, 3, A, 1, 3, 0, B, 1, 3, 0, Q, 1, 3, 0, Z, 1, 3, 0, 1, 1 );

	assertArrayClose( Array.from( reinterpret( A, 0 ) ), tc.A, 1e-13, 'A' );
	assertArrayClose( Array.from( reinterpret( B, 0 ) ), tc.B, 1e-13, 'B' );
	assert.equal( result.info, tc.info, 'info' );
	assert.equal( result.ifst, tc.ifst - 1, 'ifst' );
	assert.equal( result.ilst, tc.ilst - 1, 'ilst' );
});

test( 'ztgexc: N=1 trivial', function t() {
	var tc = findCase( 'N=1 trivial' );
	var A = new Complex128Array( [ 5.0, 2.0 ] );
	var B = new Complex128Array( [ 1.0, 0.0 ] );
	var Q = new Complex128Array( [ 1.0, 0.0 ] );
	var Z = new Complex128Array( [ 1.0, 0.0 ] );
	var result = ztgexc( true, true, 1, A, 1, 1, 0, B, 1, 1, 0, Q, 1, 1, 0, Z, 1, 1, 0, 0, 0 );

	assertArrayClose( Array.from( reinterpret( A, 0 ) ), tc.A, 1e-13, 'A' );
	assertArrayClose( Array.from( reinterpret( B, 0 ) ), tc.B, 1e-13, 'B' );
	assert.equal( result.info, tc.info, 'info' );
	assert.equal( result.ifst, tc.ifst - 1, 'ifst' );
	assert.equal( result.ilst, tc.ilst - 1, 'ilst' );
});

test( 'ztgexc: move last to first ifst=4 ilst=1 wantq=T wantz=T', function t() {
	// Fortran: IFST=4, ILST=1 -> JS: ifst=3, ilst=0
	runTest( 'move last to first ifst=4 ilst=1 wantq=T wantz=T', 4, A4, B4, true, true, 3, 0 );
});

test( 'ztgexc: move first to last ifst=1 ilst=4 wantq=T wantz=T', function t() {
	// Fortran: IFST=1, ILST=4 -> JS: ifst=0, ilst=3
	runTest( 'move first to last ifst=1 ilst=4 wantq=T wantz=T', 4, A4, B4, true, true, 0, 3 );
});

test( 'ztgexc: N=2 move backward ifst=2 ilst=1', function t() {
	// Fortran: IFST=2, ILST=1 -> JS: ifst=1, ilst=0
	runTest( 'N=2 move backward ifst=2 ilst=1', 2, A2, B2, true, true, 1, 0 );
});

test( 'ztgexc: N=0 returns immediately', function t() {
	var A = new Complex128Array( 0 );
	var B = new Complex128Array( 0 );
	var Q = new Complex128Array( 0 );
	var Z = new Complex128Array( 0 );
	var result = ztgexc( true, true, 0, A, 1, 0, 0, B, 1, 0, 0, Q, 1, 0, 0, Z, 1, 0, 0, 0, 0 );
	assert.equal( result.info, 0, 'info' );
});
