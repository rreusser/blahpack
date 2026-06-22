/**
* @license Apache-2.0
*
* Copyright (c) 2025 The Stdlib Authors.
*/

/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import Complex128 from '@stdlib/complex/float64/ctor/lib/index.js';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import zlaein from './../lib/base.js';


// FIXTURES //

var fixtureDir = path.join( import.meta.dirname, '..', '..', '..', '..', '..', 'test', 'fixtures' ); // eslint-disable-line max-len
var lines = readFileSync( path.join( fixtureDir, 'zlaein.jsonl' ), 'utf8' ).trim().split( '\n' ); // eslint-disable-line node/no-sync
var fixture = lines.map( function parse( line ) {
	return JSON.parse( line );
} );


// VARIABLES //

var NMAX = 5;
var DLAMCH_S = 2.2250738585072014e-308;
var DLAMCH_P = 2.220446049250313e-16;
var SMLNUM = DLAMCH_S / DLAMCH_P;
var EPS3 = 1.0e-4;
var TOL = 1.0e-12;

var H3 = [
	[ 1, 1, 2.0, 1.0 ],
	[ 1, 2, 1.0, 0.5 ],
	[ 1, 3, 0.5, 0.0 ],
	[ 2, 1, 0.1, 0.0 ],
	[ 2, 2, 3.0, 0.0 ],
	[ 2, 3, 1.0, -1.0 ],
	[ 3, 2, 0.05, 0.0 ],
	[ 3, 3, 4.0, -1.0 ]
];

var H4 = [
	[ 1, 1, 1.0, 0.5 ],
	[ 1, 2, 0.5, 0.0 ],
	[ 1, 3, 0.2, 0.1 ],
	[ 1, 4, 0.1, 0.0 ],
	[ 2, 1, 0.3, 0.0 ],
	[ 2, 2, 2.0, -0.5 ],
	[ 2, 3, 0.8, 0.2 ],
	[ 2, 4, 0.3, 0.1 ],
	[ 3, 2, 0.2, 0.0 ],
	[ 3, 3, 3.0, 1.0 ],
	[ 3, 4, 0.7, -0.3 ],
	[ 4, 3, 0.15, 0.0 ],
	[ 4, 4, 4.0, 0.5 ]
];

var H2 = [
	[ 1, 1, 1.0, 0.5 ],
	[ 1, 2, 0.7, -0.2 ],
	[ 2, 1, 0.3, 0.0 ],
	[ 2, 2, 2.5, 0.3 ]
];

var HD = [
	[ 1, 1, 1.0, 0.0 ],
	[ 2, 2, 2.0, 0.0 ],
	[ 3, 3, 3.0, 0.0 ],
	[ 2, 1, 0.001, 0.0 ],
	[ 3, 2, 0.001, 0.0 ],
	[ 1, 2, 0.01, 0.0 ],
	[ 1, 3, 0.01, 0.0 ],
	[ 2, 3, 0.01, 0.0 ]
];


// FUNCTIONS //

/**
* Returns a fixture test case by name.
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
* Asserts that two numbers are approximately equal.
*
* @private
* @param {number} actual - actual value
* @param {number} expected - expected value
* @param {number} tol - tolerance
* @param {string} msg - assertion message
*/
function assertClose( actual, expected, tol, msg ) {
	var relErr = Math.abs( actual - expected ) / Math.max( Math.abs( expected ), 1.0 ); // eslint-disable-line max-len
	assert.ok( relErr <= tol, msg + ': expected ' + expected + ', got ' + actual + ' (relErr=' + relErr + ')' ); // eslint-disable-line max-len
}

/**
* Asserts that two arrays are element-wise approximately equal.
*
* @private
* @param {Array} actual - actual value
* @param {Array} expected - expected value
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
* Builds an NMAX x NMAX column-major complex matrix from row/col/re/im tuples (1-based).
*
* @private
* @param {Array<Array>} entries - matrix entries
* @returns {Complex128Array} matrix
*/
function makeMatrix( entries ) {
	var idx;
	var mv;
	var M;
	var r;
	var c;
	var i;
	M = new Complex128Array( NMAX * NMAX );
	mv = reinterpret( M, 0 );
	for ( i = 0; i < entries.length; i++ ) {
		r = entries[ i ][ 0 ] - 1;
		c = entries[ i ][ 1 ] - 1;
		idx = 2 * ( r + ( c * NMAX ) );
		mv[ idx ] = entries[ i ][ 2 ];
		mv[ idx + 1 ] = entries[ i ][ 3 ];
	}
	return M;
}

/**
* Builds a Complex128Array vector from re/im pairs.
*
* @private
* @param {Array<Array>} pairs - vector entries
* @returns {Complex128Array} vector
*/
function makeV( pairs ) {
	var view;
	var v;
	var i;
	v = new Complex128Array( NMAX );
	view = reinterpret( v, 0 );
	for ( i = 0; i < pairs.length; i++ ) {
		view[ 2 * i ] = pairs[ i ][ 0 ];
		view[ ( 2 * i ) + 1 ] = pairs[ i ][ 1 ];
	}
	return v;
}

/**
* Runs a zlaein test case.
*
* @private
* @param {Complex128Array} H - input matrix
* @param {NonNegativeInteger} N - order
* @param {number} wre - real part of eigenvalue
* @param {number} wim - imaginary part of eigenvalue
* @param {boolean} rightv - right eigenvector flag
* @param {boolean} noinit - noinit flag
* @param {Complex128Array} [vInit] - initial vector
* @returns {Object} result
*/
function runCase( H, N, wre, wim, rightv, noinit, vInit ) {
	var rwork;
	var info;
	var view;
	var out;
	var w;
	var v;
	var B;
	var i;
	v = vInit || new Complex128Array( NMAX );
	B = new Complex128Array( NMAX * NMAX );
	rwork = new Float64Array( NMAX );
	w = new Complex128( wre, wim );
	info = zlaein( rightv, noinit, N, H, 1, NMAX, 0, w, v, 1, 0, B, 1, NMAX, 0, rwork, 1, 0, EPS3, SMLNUM ); // eslint-disable-line max-len
	view = reinterpret( v, 0 );
	out = [];
	for ( i = 0; i < 2 * N; i++ ) {
		out.push( view[ i ] );
	}
	return {
		'info': info,
		'v': out
	};
}


// TESTS //

test( 'zlaein: right_noinit_3x3', function t() {
	var res;
	var tc;
	var H;
	tc = findCase( 'right_noinit_3x3' );
	H = makeMatrix( H3 );
	res = runCase( H, 3, 3.9, -0.95, true, true );
	assert.equal( res.info, tc.info, 'info' );
	assertArrayClose( res.v, tc.v, TOL, 'v' );
} );

test( 'zlaein: left_noinit_3x3', function t() {
	var res;
	var tc;
	var H;
	tc = findCase( 'left_noinit_3x3' );
	H = makeMatrix( H3 );
	res = runCase( H, 3, 3.9, -0.95, false, true );
	assert.equal( res.info, tc.info, 'info' );
	assertArrayClose( res.v, tc.v, TOL, 'v' );
} );

test( 'zlaein: right_init_3x3', function t() {
	var res;
	var tc;
	var H;
	var v;
	tc = findCase( 'right_init_3x3' );
	H = makeMatrix( H3 );
	v = makeV( [ [ 0.1, 0.0 ], [ 0.2, 0.1 ], [ 0.9, -0.2 ] ] );
	res = runCase( H, 3, 3.9, -0.95, true, false, v );
	assert.equal( res.info, tc.info, 'info' );
	assertArrayClose( res.v, tc.v, TOL, 'v' );
} );

test( 'zlaein: right_noinit_4x4', function t() {
	var res;
	var tc;
	var H;
	tc = findCase( 'right_noinit_4x4' );
	H = makeMatrix( H4 );
	res = runCase( H, 4, 3.95, 0.45, true, true );
	assert.equal( res.info, tc.info, 'info' );
	assertArrayClose( res.v, tc.v, TOL, 'v' );
} );

test( 'zlaein: left_noinit_4x4', function t() {
	var res;
	var tc;
	var H;
	tc = findCase( 'left_noinit_4x4' );
	H = makeMatrix( H4 );
	res = runCase( H, 4, 3.95, 0.45, false, true );
	assert.equal( res.info, tc.info, 'info' );
	assertArrayClose( res.v, tc.v, TOL, 'v' );
} );

test( 'zlaein: right_noinit_2x2', function t() {
	var res;
	var tc;
	var H;
	tc = findCase( 'right_noinit_2x2' );
	H = makeMatrix( H2 );
	res = runCase( H, 2, 2.45, 0.28, true, true );
	assert.equal( res.info, tc.info, 'info' );
	assertArrayClose( res.v, tc.v, TOL, 'v' );
} );

test( 'zlaein: right_near_eig_diag', function t() {
	var res;
	var tc;
	var H;
	tc = findCase( 'right_near_eig_diag' );
	H = makeMatrix( HD );
	res = runCase( H, 3, 2.0001, 0.0, true, true );
	assert.equal( res.info, tc.info, 'info' );
	assertArrayClose( res.v, tc.v, TOL, 'v' );
} );

test( 'zlaein: left_near_eig_diag', function t() {
	var res;
	var tc;
	var H;
	tc = findCase( 'left_near_eig_diag' );
	H = makeMatrix( HD );
	res = runCase( H, 3, 2.0001, 0.0, false, true );
	assert.equal( res.info, tc.info, 'info' );
	assertArrayClose( res.v, tc.v, TOL, 'v' );
} );

test( 'zlaein: right with zero subdiagonal (reducible H)', function t() {
	var rwork;
	var info;
	var res;
	var w;
	var v;
	var H;
	var B;
	var i;
	H = new Complex128Array( NMAX * NMAX );
	( function setup() {
		var mv = reinterpret( H, 0 );
		// H(1,1)=1+0i, H(2,2)=2+0i, H(3,3)=3+0i; no subdiagonal (EI=0).
		mv[ 0 ] = 1.0;
		mv[ 2 * ( 1 + NMAX ) ] = 2.0;
		mv[ 2 * ( 2 + ( 2 * NMAX ) ) ] = 3.0;
	} )();
	v = new Complex128Array( NMAX );
	B = new Complex128Array( NMAX * NMAX );
	rwork = new Float64Array( NMAX );
	w = new Complex128( 3.0, 0.0 );
	info = zlaein( true, true, 3, H, 1, NMAX, 0, w, v, 1, 0, B, 1, NMAX, 0, rwork, 1, 0, EPS3, SMLNUM ); // eslint-disable-line max-len
	res = reinterpret( v, 0 );
	// Eigenvalue 3 is exact — eigenvector is e_3. After perturbation by eps3,
	// inverse iteration converges to (0,0,1) (normalized). Just check it's
	// finite and info in {0,1}.
	assert.ok( info === 0 || info === 1, 'info is 0 or 1' );
	for ( i = 0; i < 6; i++ ) {
		assert.ok( Number.isFinite( res[ i ] ), 'v[' + i + '] finite' );
	}
} );

test( 'zlaein: left with zero subdiagonal (reducible H)', function t() {
	var rwork;
	var info;
	var res;
	var w;
	var v;
	var H;
	var B;
	var i;
	H = new Complex128Array( NMAX * NMAX );
	( function setup() {
		var mv = reinterpret( H, 0 );
		mv[ 0 ] = 1.0;
		mv[ 2 * ( 1 + NMAX ) ] = 2.0;
		mv[ 2 * ( 2 + ( 2 * NMAX ) ) ] = 3.0;
	} )();
	v = new Complex128Array( NMAX );
	B = new Complex128Array( NMAX * NMAX );
	rwork = new Float64Array( NMAX );
	w = new Complex128( 3.0, 0.0 );
	info = zlaein( false, true, 3, H, 1, NMAX, 0, w, v, 1, 0, B, 1, NMAX, 0, rwork, 1, 0, EPS3, SMLNUM ); // eslint-disable-line max-len
	res = reinterpret( v, 0 );
	assert.ok( info === 0 || info === 1, 'info is 0 or 1' );
	for ( i = 0; i < 6; i++ ) {
		assert.ok( Number.isFinite( res[ i ] ), 'v[' + i + '] finite' );
	}
} );

test( 'zlaein: N<=0 returns 0 immediately', function t() {
	var rwork;
	var info;
	var w;
	var v;
	var H;
	var B;
	H = makeMatrix( H3 );
	v = new Complex128Array( NMAX );
	B = new Complex128Array( NMAX * NMAX );
	rwork = new Float64Array( NMAX );
	w = new Complex128( 1.0, 0.0 );
	info = zlaein( true, true, 0, H, 1, NMAX, 0, w, v, 1, 0, B, 1, NMAX, 0, rwork, 1, 0, EPS3, SMLNUM ); // eslint-disable-line max-len
	assert.equal( info, 0, 'info is 0 for N=0' );
} );
