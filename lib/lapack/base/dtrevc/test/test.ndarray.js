/* eslint-disable no-restricted-syntax, stdlib/first-unit-test, max-len */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import dtrevc from './../lib/ndarray.js';


// FIXTURES //

var fixtureDir = path.join( import.meta.dirname, '..', '..', '..', '..', '..', 'test', 'fixtures' );
var lines = readFileSync( path.join( fixtureDir, 'dtrevc.jsonl' ), 'utf8' ).trim().split( '\n' );
var fixture = lines.map( function parse( line ) { return JSON.parse( line ); } );


// FUNCTIONS //

function findCase( name ) {
	return fixture.find( function find( t ) { return t.name === name; } );
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
	var relErr = Math.abs( actual - expected ) / Math.max( Math.abs( expected ), 1.0 );
	assert.ok( relErr <= tol, msg + ': expected ' + expected + ', got ' + actual + ' (relErr=' + relErr + ')' );
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
	assert.equal( actual.length, expected.length, msg + ': length mismatch (' + actual.length + ' vs ' + expected.length + ')' );
	for ( i = 0; i < expected.length; i++ ) {
		assertClose( actual[ i ], expected[ i ], tol, msg + '[' + i + ']' );
	}
}

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

/**
* Build the 4x4 quasi-triangular test matrix T.
* T = [ 1   0.5  0.2  0.1  ]
*     [ 0   2    0.3  0.15 ]
*     [ 0   0    3   -0.5  ]
*     [ 0   0    0.8  3    ]
*/
function buildT4() {
	var N = 4;
	var T = new Float64Array( N * N );
	T[ 0 + 0*N ] = 1.0; T[ 0 + 1*N ] = 0.5; T[ 0 + 2*N ] = 0.2; T[ 0 + 3*N ] = 0.1;
	T[ 1 + 1*N ] = 2.0; T[ 1 + 2*N ] = 0.3; T[ 1 + 3*N ] = 0.15;
	T[ 2 + 2*N ] = 3.0; T[ 2 + 3*N ] = -0.5;
	T[ 3 + 2*N ] = 0.8; T[ 3 + 3*N ] = 3.0;
	return T;
}

/**
* Build the 4x4 all-real upper triangular test matrix T.
*/
function buildT4Real() {
	var N = 4;
	var T = new Float64Array( N * N );
	T[ 0 + 0*N ] = 5.0; T[ 0 + 1*N ] = 1.0; T[ 0 + 2*N ] = 0.5; T[ 0 + 3*N ] = 0.2;
	T[ 1 + 1*N ] = 3.0; T[ 1 + 2*N ] = 0.8; T[ 1 + 3*N ] = 0.3;
	T[ 2 + 2*N ] = 1.0; T[ 2 + 3*N ] = 0.6;
	T[ 3 + 3*N ] = -1.0;
	return T;
}

/**
* Build the 6x6 quasi-triangular test matrix T.
*/
function buildT6() {
	var N = 6;
	var T = new Float64Array( N * N );

	// 2x2 block at (0,0)-(1,1)
	T[ 0 + 0*N ] = 1.0; T[ 0 + 1*N ] = 0.6;
	T[ 1 + 0*N ] = -0.6; T[ 1 + 1*N ] = 1.0;

	// Upper part from rows 0-1
	T[ 0 + 2*N ] = 0.2; T[ 0 + 3*N ] = 0.1; T[ 0 + 4*N ] = 0.3; T[ 0 + 5*N ] = 0.05;
	T[ 1 + 2*N ] = 0.15; T[ 1 + 3*N ] = 0.08; T[ 1 + 4*N ] = 0.12; T[ 1 + 5*N ] = 0.04;

	// Real eigenvalue at (2,2)
	T[ 2 + 2*N ] = 4.0;
	T[ 2 + 3*N ] = 0.5; T[ 2 + 4*N ] = 0.2; T[ 2 + 5*N ] = 0.1;

	// Real eigenvalue at (3,3)
	T[ 3 + 3*N ] = 5.0;
	T[ 3 + 4*N ] = 0.3; T[ 3 + 5*N ] = 0.15;

	// 2x2 block at (4,4)-(5,5)
	T[ 4 + 4*N ] = 7.0; T[ 4 + 5*N ] = 0.5;
	T[ 5 + 4*N ] = -0.5; T[ 5 + 5*N ] = 7.0;
	return T;
}


// TESTS //

test( 'dtrevc: right eigenvectors, all, 4x4', function t() {
	var SELECT;
	var WORK;
	var info;
	var tc;
	var VL;
	var VR;
	var N;
	var T;

	tc = findCase( 'right all 4x4' );
	N = 4;
	T = buildT4();
	VL = new Float64Array( N * N );
	VR = new Float64Array( N * N );
	SELECT = new Uint8Array( N );
	WORK = new Float64Array( 3 * N );
	info = dtrevc( 'right', 'all', SELECT, 1, 0, N, T, 1, N, 0, VL, 1, N, 0, VR, 1, N, 0, N, 0, WORK, 1, 0 );
	assert.strictEqual( info, tc.info, 'info' );
	assertArrayClose( toArray( VR ), tc.VR, 1e-12, 'VR' );
});

test( 'dtrevc: left eigenvectors, all, 4x4', function t() {
	var SELECT;
	var WORK;
	var info;
	var tc;
	var VL;
	var VR;
	var N;
	var T;

	tc = findCase( 'left all 4x4' );
	N = 4;
	T = buildT4();
	VL = new Float64Array( N * N );
	VR = new Float64Array( N * N );
	SELECT = new Uint8Array( N );
	WORK = new Float64Array( 3 * N );
	info = dtrevc( 'left', 'all', SELECT, 1, 0, N, T, 1, N, 0, VL, 1, N, 0, VR, 1, N, 0, N, 0, WORK, 1, 0 );
	assert.strictEqual( info, tc.info, 'info' );
	assertArrayClose( toArray( VL ), tc.VL, 1e-12, 'VL' );
});

test( 'dtrevc: both eigenvectors, all, 4x4', function t() {
	var SELECT;
	var WORK;
	var info;
	var tc;
	var VL;
	var VR;
	var N;
	var T;

	tc = findCase( 'both all 4x4' );
	N = 4;
	T = buildT4();
	VL = new Float64Array( N * N );
	VR = new Float64Array( N * N );
	SELECT = new Uint8Array( N );
	WORK = new Float64Array( 3 * N );
	info = dtrevc( 'both', 'all', SELECT, 1, 0, N, T, 1, N, 0, VL, 1, N, 0, VR, 1, N, 0, N, 0, WORK, 1, 0 );
	assert.strictEqual( info, tc.info, 'info' );
	assertArrayClose( toArray( VR ), tc.VR, 1e-12, 'VR' );
	assertArrayClose( toArray( VL ), tc.VL, 1e-12, 'VL' );
});

test( 'dtrevc: right eigenvectors, selected, 4x4', function t() {
	var SELECT;
	var WORK;
	var info;
	var tc;
	var VL;
	var VR;
	var N;
	var T;

	tc = findCase( 'right selected 4x4' );
	N = 4;
	T = buildT4();
	VL = new Float64Array( N * N );
	VR = new Float64Array( N * tc.M );
	SELECT = new Uint8Array( N );
	SELECT[ 0 ] = 1;
	SELECT[ 1 ] = 0;
	SELECT[ 2 ] = 1;
	SELECT[ 3 ] = 1;
	WORK = new Float64Array( 3 * N );
	info = dtrevc( 'right', 'selected', SELECT, 1, 0, N, T, 1, N, 0, VL, 1, N, 0, VR, 1, N, 0, N, 0, WORK, 1, 0 );
	assert.strictEqual( info, tc.info, 'info' );
	assertArrayClose( toArray( VR ), tc.VR, 1e-12, 'VR' );
});

test( 'dtrevc: right backtransform, 4x4', function t() {
	var SELECT;
	var WORK;
	var info;
	var tc;
	var VL;
	var VR;
	var N;
	var T;
	var i;

	tc = findCase( 'right backtransform 4x4' );
	N = 4;
	T = buildT4();
	VL = new Float64Array( N * N );
	VR = new Float64Array( N * N );
	for ( i = 0; i < N; i++ ) {
		VR[ i + i*N ] = 1.0;
	}
	SELECT = new Uint8Array( N );
	WORK = new Float64Array( 3 * N );
	info = dtrevc( 'right', 'backtransform', SELECT, 1, 0, N, T, 1, N, 0, VL, 1, N, 0, VR, 1, N, 0, N, 0, WORK, 1, 0 );
	assert.strictEqual( info, tc.info, 'info' );
	assertArrayClose( toArray( VR ), tc.VR, 1e-12, 'VR' );
});

test( 'dtrevc: right eigenvectors, all real, 4x4', function t() {
	var SELECT;
	var WORK;
	var info;
	var tc;
	var VL;
	var VR;
	var N;
	var T;

	tc = findCase( 'right all real 4x4' );
	N = 4;
	T = buildT4Real();
	VL = new Float64Array( N * N );
	VR = new Float64Array( N * N );
	SELECT = new Uint8Array( N );
	WORK = new Float64Array( 3 * N );
	info = dtrevc( 'right', 'all', SELECT, 1, 0, N, T, 1, N, 0, VL, 1, N, 0, VR, 1, N, 0, N, 0, WORK, 1, 0 );
	assert.strictEqual( info, tc.info, 'info' );
	assertArrayClose( toArray( VR ), tc.VR, 1e-12, 'VR' );
});

test( 'dtrevc: right eigenvectors, N=1', function t() {
	var SELECT;
	var WORK;
	var info;
	var tc;
	var VL;
	var VR;
	var T;

	tc = findCase( 'right N=1' );
	T = new Float64Array( [ 7.0 ] );
	VL = new Float64Array( 1 );
	VR = new Float64Array( 1 );
	SELECT = new Uint8Array( 1 );
	WORK = new Float64Array( 3 );
	info = dtrevc( 'right', 'all', SELECT, 1, 0, 1, T, 1, 1, 0, VL, 1, 1, 0, VR, 1, 1, 0, 1, 0, WORK, 1, 0 );
	assert.strictEqual( info, tc.info, 'info' );
	assertArrayClose( toArray( VR ), tc.VR, 1e-12, 'VR' );
});

test( 'dtrevc: left selected complex, 4x4', function t() {
	var SELECT;
	var WORK;
	var info;
	var tc;
	var VL;
	var VR;
	var N;
	var T;

	tc = findCase( 'left selected complex 4x4' );
	N = 4;
	T = buildT4();
	VL = new Float64Array( N * tc.M );
	VR = new Float64Array( N * N );
	SELECT = new Uint8Array( N );
	SELECT[ 0 ] = 0;
	SELECT[ 1 ] = 0;
	SELECT[ 2 ] = 1;
	SELECT[ 3 ] = 1;
	WORK = new Float64Array( 3 * N );
	info = dtrevc( 'left', 'selected', SELECT, 1, 0, N, T, 1, N, 0, VL, 1, N, 0, VR, 1, N, 0, N, 0, WORK, 1, 0 );
	assert.strictEqual( info, tc.info, 'info' );
	assertArrayClose( toArray( VL ), tc.VL, 1e-12, 'VL' );
});

test( 'dtrevc: left backtransform, 4x4', function t() {
	var SELECT;
	var WORK;
	var info;
	var tc;
	var VL;
	var VR;
	var N;
	var T;
	var i;

	tc = findCase( 'left backtransform 4x4' );
	N = 4;
	T = buildT4();
	VL = new Float64Array( N * N );
	VR = new Float64Array( N * N );
	for ( i = 0; i < N; i++ ) {
		VL[ i + i*N ] = 1.0;
	}
	SELECT = new Uint8Array( N );
	WORK = new Float64Array( 3 * N );
	info = dtrevc( 'left', 'backtransform', SELECT, 1, 0, N, T, 1, N, 0, VL, 1, N, 0, VR, 1, N, 0, N, 0, WORK, 1, 0 );
	assert.strictEqual( info, tc.info, 'info' );
	assertArrayClose( toArray( VL ), tc.VL, 1e-12, 'VL' );
});

test( 'dtrevc: right eigenvectors, all, 6x6 mixed', function t() {
	var SELECT;
	var WORK;
	var info;
	var tc;
	var VL;
	var VR;
	var N;
	var T;

	tc = findCase( 'right all 6x6 mixed' );
	N = 6;
	T = buildT6();
	VL = new Float64Array( N * N );
	VR = new Float64Array( N * N );
	SELECT = new Uint8Array( N );
	WORK = new Float64Array( 3 * N );
	info = dtrevc( 'right', 'all', SELECT, 1, 0, N, T, 1, N, 0, VL, 1, N, 0, VR, 1, N, 0, N, 0, WORK, 1, 0 );
	assert.strictEqual( info, tc.info, 'info' );
	assertArrayClose( toArray( VR ), tc.VR, 1e-12, 'VR' );
});

test( 'dtrevc: left eigenvectors, all, 6x6 mixed', function t() {
	var SELECT;
	var WORK;
	var info;
	var tc;
	var VL;
	var VR;
	var N;
	var T;

	tc = findCase( 'left all 6x6 mixed' );
	N = 6;
	T = buildT6();
	VL = new Float64Array( N * N );
	VR = new Float64Array( N * N );
	SELECT = new Uint8Array( N );
	WORK = new Float64Array( 3 * N );
	info = dtrevc( 'left', 'all', SELECT, 1, 0, N, T, 1, N, 0, VL, 1, N, 0, VR, 1, N, 0, N, 0, WORK, 1, 0 );
	assert.strictEqual( info, tc.info, 'info' );
	assertArrayClose( toArray( VL ), tc.VL, 1e-12, 'VL' );
});

test( 'dtrevc: both backtransform, 6x6', function t() {
	var SELECT;
	var WORK;
	var info;
	var tc;
	var VL;
	var VR;
	var N;
	var T;
	var i;

	tc = findCase( 'both backtransform 6x6' );
	N = 6;
	T = buildT6();
	VL = new Float64Array( N * N );
	VR = new Float64Array( N * N );
	for ( i = 0; i < N; i++ ) {
		VR[ i + i*N ] = 1.0;
		VL[ i + i*N ] = 1.0;
	}
	SELECT = new Uint8Array( N );
	WORK = new Float64Array( 3 * N );
	info = dtrevc( 'both', 'backtransform', SELECT, 1, 0, N, T, 1, N, 0, VL, 1, N, 0, VR, 1, N, 0, N, 0, WORK, 1, 0 );
	assert.strictEqual( info, tc.info, 'info' );
	assertArrayClose( toArray( VR ), tc.VR, 1e-12, 'VR' );
	assertArrayClose( toArray( VL ), tc.VL, 1e-12, 'VL' );
});

test( 'dtrevc: right selected real, 6x6', function t() {
	var SELECT;
	var WORK;
	var info;
	var tc;
	var VL;
	var VR;
	var N;
	var T;

	tc = findCase( 'right selected real 6x6' );
	N = 6;
	T = buildT6();
	VL = new Float64Array( N * N );
	VR = new Float64Array( N * tc.M );
	SELECT = new Uint8Array( N );
	SELECT[ 0 ] = 0;
	SELECT[ 1 ] = 0;
	SELECT[ 2 ] = 1;
	SELECT[ 3 ] = 1;
	SELECT[ 4 ] = 0;
	SELECT[ 5 ] = 0;
	WORK = new Float64Array( 3 * N );
	info = dtrevc( 'right', 'selected', SELECT, 1, 0, N, T, 1, N, 0, VL, 1, N, 0, VR, 1, N, 0, N, 0, WORK, 1, 0 );
	assert.strictEqual( info, tc.info, 'info' );
	assertArrayClose( toArray( VR ), tc.VR, 1e-12, 'VR' );
});

test( 'dtrevc: left selected complex first, 6x6', function t() {
	var SELECT;
	var WORK;
	var info;
	var tc;
	var VL;
	var VR;
	var N;
	var T;

	tc = findCase( 'left selected complex first 6x6' );
	N = 6;
	T = buildT6();
	VL = new Float64Array( N * tc.M );
	VR = new Float64Array( N * N );
	SELECT = new Uint8Array( N );
	SELECT[ 0 ] = 1;
	SELECT[ 1 ] = 1;
	SELECT[ 2 ] = 0;
	SELECT[ 3 ] = 0;
	SELECT[ 4 ] = 0;
	SELECT[ 5 ] = 0;
	WORK = new Float64Array( 3 * N );
	info = dtrevc( 'left', 'selected', SELECT, 1, 0, N, T, 1, N, 0, VL, 1, N, 0, VR, 1, N, 0, N, 0, WORK, 1, 0 );
	assert.strictEqual( info, tc.info, 'info' );
	assertArrayClose( toArray( VL ), tc.VL, 1e-12, 'VL' );
});

test( 'dtrevc: selected last real eigenvalue (N=3, select only last)', function t() {
	var SELECT;
	var WORK;
	var info;
	var VL;
	var VR;
	var N;
	var T;

	// 3x3 upper triangular with all real eigenvalues, select only the last
	N = 3;
	T = new Float64Array( N * N );
	T[ 0 + 0*N ] = 1.0; T[ 0 + 1*N ] = 0.5; T[ 0 + 2*N ] = 0.2;
	T[ 1 + 1*N ] = 2.0; T[ 1 + 2*N ] = 0.3;
	T[ 2 + 2*N ] = 3.0;
	VL = new Float64Array( N * N );
	VR = new Float64Array( N * 1 );
	SELECT = new Uint8Array( N );
	SELECT[ 0 ] = 0;
	SELECT[ 1 ] = 0;
	SELECT[ 2 ] = 1;
	WORK = new Float64Array( 3 * N );
	info = dtrevc( 'right', 'selected', SELECT, 1, 0, N, T, 1, N, 0, VL, 1, N, 0, VR, 1, N, 0, 1, 0, WORK, 1, 0 );
	assert.strictEqual( info, 0, 'info' );
	// Last eigenvalue is 3.0; its right eigenvector should be [*, *, 1] normalized
	assert.ok( Math.abs( VR[ 2 ] ) > 0, 'eigenvector component is nonzero' );
});

test( 'dtrevc: N=2 complex pair, right and left', function t() {
	var SELECT;
	var WORK;
	var info;
	var VL;
	var VR;
	var N;
	var T;

	// 2x2 block with complex eigenvalues
	N = 2;
	T = new Float64Array( N * N );
	T[ 0 + 0*N ] = 1.0; T[ 0 + 1*N ] = 2.0;
	T[ 1 + 0*N ] = -3.0; T[ 1 + 1*N ] = 1.0;
	VL = new Float64Array( N * N );
	VR = new Float64Array( N * N );
	SELECT = new Uint8Array( N );
	WORK = new Float64Array( 3 * N );
	info = dtrevc( 'both', 'all', SELECT, 1, 0, N, T, 1, N, 0, VL, 1, N, 0, VR, 1, N, 0, N, 0, WORK, 1, 0 );
	assert.strictEqual( info, 0, 'info' );
	// Should produce 2 columns for the complex pair
	assert.ok( !isNaN( VR[ 0 ] ), 'VR[0] is a number' );
	assert.ok( !isNaN( VL[ 0 ] ), 'VL[0] is a number' );
});

test( 'dtrevc: left selected with last eigenvalue, 3x3', function t() {
	var SELECT;
	var WORK;
	var info;
	var VL;
	var VR;
	var N;
	var T;

	// 3x3 upper triangular, select only the last eigenvalue for left eigenvectors
	N = 3;
	T = new Float64Array( N * N );
	T[ 0 + 0*N ] = 1.0; T[ 0 + 1*N ] = 0.5; T[ 0 + 2*N ] = 0.2;
	T[ 1 + 1*N ] = 2.0; T[ 1 + 2*N ] = 0.3;
	T[ 2 + 2*N ] = 3.0;
	VL = new Float64Array( N * 1 );
	VR = new Float64Array( N * N );
	SELECT = new Uint8Array( N );
	SELECT[ 0 ] = 0;
	SELECT[ 1 ] = 0;
	SELECT[ 2 ] = 1;
	WORK = new Float64Array( 3 * N );
	info = dtrevc( 'left', 'selected', SELECT, 1, 0, N, T, 1, N, 0, VL, 1, N, 0, VR, 1, N, 0, 1, 0, WORK, 1, 0 );
	assert.strictEqual( info, 0, 'info' );
	assert.ok( Math.abs( VL[ 2 ] ) > 0, 'eigenvector component is nonzero' );
});

test( 'dtrevc: N=0 quick return', function t() {
	var SELECT;
	var WORK;
	var info;
	var VL;
	var VR;
	var T;

	T = new Float64Array( 0 );
	VL = new Float64Array( 0 );
	VR = new Float64Array( 0 );
	SELECT = new Uint8Array( 0 );
	WORK = new Float64Array( 0 );
	info = dtrevc( 'right', 'all', SELECT, 1, 0, 0, T, 1, 0, 0, VL, 1, 0, 0, VR, 1, 0, 0, 0, 0, WORK, 1, 0 );
	assert.strictEqual( info, 0, 'info' );
});
