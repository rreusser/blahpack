/**
* @license Apache-2.0
*
* Copyright (c) 2026 Ricky Reusser.
*
* Derived from the LAPACK 3.12.0 reference implementation (BSD-3-Clause).
*/

/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import ndarrayFn from './../lib/ndarray.js';


// FIXTURES //

var fixtureDir = path.join( import.meta.dirname, '..', '..', '..', '..', '..', 'test', 'fixtures' ); // eslint-disable-line max-len
var lines = readFileSync( path.join( fixtureDir, 'zgsvj1.jsonl' ), 'utf8' ).trim().split( '\n' ); // eslint-disable-line node/no-sync
var fixture = lines.map( function parse( line ) {
	return JSON.parse( line );
});


// VARIABLES //

var EPS = 2.220446049250313e-16;
var SFMIN = 2.2250738585072014e-308;
var TOL = 1.0e-10;


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
* Asserts relative closeness.
*
* @private
* @param {number} actual - actual value
* @param {number} expected - expected value
* @param {number} tol - tolerance
* @param {string} msg - message
*/
function assertClose( actual, expected, tol, msg ) {
	var denom = Math.max( Math.abs( expected ), 1.0 );
	var err = Math.abs( actual - expected ) / denom;
	assert.ok( err <= tol, msg + ': expected ' + expected + ', got ' + actual + ' (err=' + err + ')' ); // eslint-disable-line max-len
}

/**
* Asserts element-wise array closeness.
*
* @private
* @param {Array|Float64Array} actual - actual values
* @param {Array} expected - expected values
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
* Builds an interleaved Float64 view of a Complex128Array (re/im pairs).
*
* @private
* @param {Complex128Array} z - complex array
* @returns {Array} interleaved values
*/
function toRePairs( z ) {
	var view = reinterpret( z, 0 );
	var out = [];
	var i;
	for ( i = 0; i < view.length; i++ ) {
		out.push( view[ i ] );
	}
	return out;
}

/**
* Computes initial column norms of an `M x N` column-major complex matrix.
*
* @private
* @param {Complex128Array} a - input matrix
* @param {integer} M - number of rows
* @param {integer} N - number of columns
* @returns {Float64Array} column norms
*/
function initialSva( a, M, N ) {
	var view;
	var out;
	var idx;
	var s;
	var j;
	var i;
	view = reinterpret( a, 0 );
	out = new Float64Array( N );
	for ( j = 0; j < N; j++ ) {
		s = 0;
		for ( i = 0; i < M; i++ ) {
			idx = 2 * ( ( j * M ) + i );
			s += ( view[ idx ] * view[ idx ] ) + ( view[ idx + 1 ] * view[ idx + 1 ] ); // eslint-disable-line max-len
		}
		out[ j ] = Math.sqrt( s );
	}
	return out;
}

/**
* Builds the column-major matrix used by Fortran test 1 (M=4, N=3, n1=1).
*
* @private
* @returns {Complex128Array} matrix
*/
function buildMatrix1() {
	var imags;
	var view;
	var a;
	var k;

	// Column-major M=4 N=3, real parts 1..12, imaginary parts as a pattern.
	imags = [ 0.5, -0.5, 1.0, -1.0, 0.25, -0.25, 0.75, -0.75, 0.0, 0.1, -0.2, 0.3 ]; // eslint-disable-line max-len
	a = new Complex128Array( 12 );
	view = reinterpret( a, 0 );
	for ( k = 0; k < 12; k++ ) {
		view[ 2 * k ] = k + 1.0;
		view[ ( 2 * k ) + 1 ] = imags[ k ];
	}
	return a;
}

/**
* Builds the column-major matrix used by Fortran test 2 (M=5, N=4, n1=2).
*
* @private
* @returns {Complex128Array} matrix
*/
function buildMatrix2() {
	var view;
	var a;
	var k;
	a = new Complex128Array( 20 );
	view = reinterpret( a, 0 );
	for ( k = 1; k <= 20; k++ ) {
		view[ 2 * ( k - 1 ) ] = ( ( k * 7 ) % 11 ) - 5.0;
		view[ ( 2 * ( k - 1 ) ) + 1 ] = ( ( k * 5 ) % 7 ) - 3.0;
	}
	return a;
}

/**
* Builds the apply matrix (Fortran test 3).
*
* @private
* @returns {Complex128Array} matrix
*/
function buildMatrix3() {
	var reals;
	var imags;
	var view;
	var a;
	var k;
	reals = [ 2.0, 1.0, 0.0, 0.0, 1.0, 2.0, 1.0, 0.0, 0.0, 1.0, 2.0, 1.0 ];
	imags = [ 0.0, 0.2, 0.0, 0.0, -0.2, 0.0, 0.1, 0.0, 0.0, -0.1, 0.0, 0.3 ];
	a = new Complex128Array( 12 );
	view = reinterpret( a, 0 );
	for ( k = 0; k < 12; k++ ) {
		view[ 2 * k ] = reals[ k ];
		view[ ( 2 * k ) + 1 ] = imags[ k ];
	}
	return a;
}

/**
* Builds the 14x14 test matrix (Fortran test 4).
*
* @private
* @returns {Complex128Array} matrix
*/
function buildMatrix4() {
	var view;
	var a;
	var k;
	a = new Complex128Array( 14 * 14 );
	view = reinterpret( a, 0 );
	for ( k = 1; k <= 14 * 14; k++ ) {
		view[ 2 * ( k - 1 ) ] = ( ( ( ( k * 37 ) + 13 ) % 29 ) - 14.0 ) + Math.sin( k * 0.11 ); // eslint-disable-line max-len
		view[ ( 2 * ( k - 1 ) ) + 1 ] = Math.cos( k * 0.07 ) - ( 0.3 * Math.sin( k * 0.19 ) ); // eslint-disable-line max-len
	}
	return a;
}

/**
* Builds the n1=N test matrix (Fortran test 5).
*
* @private
* @param {integer} M - row count
* @param {integer} N - column count
* @returns {Complex128Array} matrix
*/
function buildMatrix5( M, N ) {
	var view;
	var a;
	var k;
	a = new Complex128Array( M * N );
	view = reinterpret( a, 0 );
	for ( k = 1; k <= M * N; k++ ) {
		view[ 2 * ( k - 1 ) ] = Math.sin( k * 0.7 ) + 0.5;
		view[ ( 2 * ( k - 1 ) ) + 1 ] = Math.cos( k * 0.4 ) - 0.2;
	}
	return a;
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


// TESTS //

test( 'ndarray is a function', function t() {
	assert.strictEqual( typeof ndarrayFn, 'function', 'is a function' );
});

test( 'ndarray: throws TypeError for invalid jobv', function t() {
	assert.throws( function throws() {
		ndarrayFn( 'invalid', 2, 2, 1, new Complex128Array( 4 ), 1, 2, 0, new Complex128Array( 2 ), 1, 0, new Float64Array( 2 ), 1, 0, 0, new Complex128Array( 1 ), 1, 1, 0, EPS, SFMIN, TOL, 1, new Complex128Array( 2 ), 1, 0, 2 ); // eslint-disable-line max-len
	}, TypeError );
});

test( 'ndarray: matches fixture novec_4x3_n1_1 on unit stride', function t() {
	var info;
	var work;
	var sva;
	var tc;
	var a;
	var d;
	var V;
	var M;
	var N;

	tc = findCase( 'novec_4x3_n1_1' );
	M = 4;
	N = 3;
	a = buildMatrix1();
	d = new Complex128Array( [ 1, 0, 1, 0, 1, 0 ] );
	sva = initialSva( a, M, N );
	V = new Complex128Array( 1 );
	work = new Complex128Array( M );
	info = ndarrayFn( 'no-v', M, N, 1, a, 1, M, 0, d, 1, 0, sva, 1, 0, 0, V, 1, 1, 0, EPS, SFMIN, TOL, 5, work, 1, 0, M ); // eslint-disable-line max-len
	assertArrayClose( toRePairs( a ), tc.a, 1e-12, 'a' );
	assertArrayClose( toRePairs( d ), tc.d, 1e-12, 'd' );
	assertArrayClose( toArray( sva ), tc.sva, 1e-12, 'sva' );
	assert.equal( info, tc.info, 'info' );
});

test( 'ndarray: matches fixture vec_5x4_n1_2 with compute-v', function t() {
	var info;
	var work;
	var sva;
	var tc;
	var a;
	var d;
	var V;
	var M;
	var N;
	var i;

	tc = findCase( 'vec_5x4_n1_2' );
	M = 5;
	N = 4;
	a = buildMatrix2();
	d = new Complex128Array( [ 1, 0, 1, 0, 1, 0, 1, 0 ] );
	sva = initialSva( a, M, N );
	V = new Complex128Array( N * N );
	for ( i = 0; i < N; i++ ) {
		reinterpret( V, 0 )[ 2 * ( ( i * N ) + i ) ] = 1;
	}
	work = new Complex128Array( M );
	info = ndarrayFn( 'compute-v', M, N, 2, a, 1, M, 0, d, 1, 0, sva, 1, 0, 0, V, 1, N, 0, EPS, SFMIN, TOL, 5, work, 1, 0, M ); // eslint-disable-line max-len
	assertArrayClose( toRePairs( a ), tc.a, 1e-11, 'a' );
	assertArrayClose( toRePairs( V ), tc.v, 1e-11, 'v' );
	assertArrayClose( toRePairs( d ), tc.d, 1e-11, 'd' );
	assertArrayClose( toArray( sva ), tc.sva, 1e-11, 'sva' );
	assert.equal( info, tc.info, 'info' );
});

test( 'ndarray: honors offsetA into a larger A buffer (apply_4x3_n1_1)', function t() { // eslint-disable-line max-len
	var aSlice;
	var padA;
	var info;
	var work;
	var src;
	var sva;
	var tc;
	var a;
	var d;
	var V;
	var M;
	var N;
	var i;

	tc = findCase( 'apply_4x3_n1_1' );
	M = 4;
	N = 3;
	padA = 5;
	src = buildMatrix3();
	a = new Complex128Array( padA + ( M * N ) );
	for ( i = 0; i < M * N; i++ ) {
		reinterpret( a, 0 )[ 2 * ( padA + i ) ] = reinterpret( src, 0 )[ 2 * i ];
		reinterpret( a, 0 )[ ( 2 * ( padA + i ) ) + 1 ] = reinterpret( src, 0 )[ ( 2 * i ) + 1 ]; // eslint-disable-line max-len
	}
	d = new Complex128Array( [ 1, 0, 1, 0, 1, 0 ] );
	sva = initialSva( src, M, N );
	V = new Complex128Array( 9 );
	reinterpret( V, 0 )[ 0 ] = 1;
	reinterpret( V, 0 )[ 8 ] = 1;
	reinterpret( V, 0 )[ 16 ] = 1;
	work = new Complex128Array( M );
	info = ndarrayFn( 'apply-v', M, N, 1, a, 1, M, padA, d, 1, 0, sva, 1, 0, 3, V, 1, 3, 0, EPS, SFMIN, TOL, 3, work, 1, 0, M ); // eslint-disable-line max-len
	aSlice = [];
	for ( i = 0; i < 2 * M * N; i++ ) {
		aSlice.push( reinterpret( a, 0 )[ ( 2 * padA ) + i ] );
	}
	assertArrayClose( aSlice, tc.a, 1e-12, 'a' );
	assertArrayClose( toRePairs( V ), tc.v, 1e-12, 'v' );
	assertArrayClose( toRePairs( d ), tc.d, 1e-12, 'd' );
	assertArrayClose( toArray( sva ), tc.sva, 1e-12, 'sva' );
	assert.equal( info, tc.info, 'info' );
	for ( i = 0; i < 2 * padA; i++ ) {
		assert.equal( reinterpret( a, 0 )[ i ], 0, 'pad[' + i + '] untouched' );
	}
});

test( 'ndarray: non-unit strideD and strideSVA with offsets', function t() {
	var info;
	var work;
	var sv0;
	var sva;
	var dv;
	var tc;
	var a;
	var d;
	var V;
	var M;
	var N;
	var i;

	tc = findCase( 'novec_4x3_n1_1' );
	M = 4;
	N = 3;
	a = buildMatrix1();
	d = new Complex128Array( 1 + ( N * 2 ) );
	dv = reinterpret( d, 0 );
	for ( i = 0; i < N; i++ ) {
		dv[ 2 * ( 1 + ( i * 2 ) ) ] = 1;
	}
	sva = new Float64Array( 2 + ( N * 3 ) );
	sv0 = initialSva( a, M, N );
	for ( i = 0; i < N; i++ ) {
		sva[ 2 + ( i * 3 ) ] = sv0[ i ];
	}
	V = new Complex128Array( 1 );
	work = new Complex128Array( M );
	info = ndarrayFn( 'no-v', M, N, 1, a, 1, M, 0, d, 2, 1, sva, 3, 2, 0, V, 1, 1, 0, EPS, SFMIN, TOL, 5, work, 1, 0, M ); // eslint-disable-line max-len
	assertArrayClose( toRePairs( a ), tc.a, 1e-12, 'a' );
	for ( i = 0; i < N; i++ ) {
		assertClose( dv[ 2 * ( 1 + ( i * 2 ) ) ], tc.d[ 2 * i ], 1e-12, 'd.re[' + i + ']' ); // eslint-disable-line max-len
		assertClose( dv[ ( 2 * ( 1 + ( i * 2 ) ) ) + 1 ], tc.d[ ( 2 * i ) + 1 ], 1e-12, 'd.im[' + i + ']' ); // eslint-disable-line max-len
		assertClose( sva[ 2 + ( i * 3 ) ], tc.sva[ i ], 1e-12, 'sva[' + i + ']' );
	}
	assert.equal( dv[ 0 ], 0, 'd[0].re untouched' );
	assert.equal( dv[ 1 ], 0, 'd[0].im untouched' );
	assert.equal( sva[ 0 ], 0, 'sva[0] untouched' );
	assert.equal( sva[ 1 ], 0, 'sva[1] untouched' );
	assert.equal( info, tc.info, 'info' );
});

test( 'ndarray: non-unit work stride with offset (novec_4x3_n1_1)', function t() { // eslint-disable-line max-len
	var info;
	var work;
	var sva;
	var wv;
	var tc;
	var a;
	var d;
	var V;
	var M;
	var N;
	var i;

	tc = findCase( 'novec_4x3_n1_1' );
	M = 4;
	N = 3;
	a = buildMatrix1();
	d = new Complex128Array( [ 1, 0, 1, 0, 1, 0 ] );
	sva = initialSva( a, M, N );
	V = new Complex128Array( 1 );
	work = new Complex128Array( 3 + ( M * 2 ) );
	wv = reinterpret( work, 0 );
	for ( i = 0; i < wv.length; i++ ) {
		wv[ i ] = -7;
	}
	info = ndarrayFn( 'no-v', M, N, 1, a, 1, M, 0, d, 1, 0, sva, 1, 0, 0, V, 1, 1, 0, EPS, SFMIN, TOL, 5, work, 2, 3, M ); // eslint-disable-line max-len
	assertArrayClose( toRePairs( a ), tc.a, 1e-12, 'a' );
	assertArrayClose( toRePairs( d ), tc.d, 1e-12, 'd' );
	assertArrayClose( toArray( sva ), tc.sva, 1e-12, 'sva' );
	assert.equal( info, tc.info, 'info' );
	for ( i = 0; i < 6; i++ ) {
		assert.equal( wv[ i ], -7, 'work[' + i + '] untouched' );
	}
});

test( 'ndarray: 14x14 block-tiled (vec_14x14_block)', function t() {
	var info;
	var work;
	var sva;
	var tc;
	var Vv;
	var a;
	var d;
	var V;
	var M;
	var N;
	var i;

	tc = findCase( 'vec_14x14_block' );
	M = 14;
	N = 14;
	a = buildMatrix4();
	d = new Complex128Array( N );
	for ( i = 0; i < N; i++ ) {
		reinterpret( d, 0 )[ 2 * i ] = 1;
	}
	sva = initialSva( a, M, N );
	V = new Complex128Array( N * N );
	Vv = reinterpret( V, 0 );
	for ( i = 0; i < N; i++ ) {
		Vv[ 2 * ( ( i * N ) + i ) ] = 1;
	}
	work = new Complex128Array( M );
	info = ndarrayFn( 'compute-v', M, N, 5, a, 1, M, 0, d, 1, 0, sva, 1, 0, 0, V, 1, N, 0, EPS, SFMIN, TOL, 4, work, 1, 0, M ); // eslint-disable-line max-len
	assertArrayClose( toRePairs( a ), tc.a, 1e-10, 'a' );
	assertArrayClose( toRePairs( V ), tc.v, 1e-10, 'v' );
	assertArrayClose( toRePairs( d ), tc.d, 1e-10, 'd' );
	assertArrayClose( toArray( sva ), tc.sva, 1e-10, 'sva' );
	assert.equal( info, tc.info, 'info' );
});

test( 'ndarray: n1=N (no off-diagonal block — early convergence)', function t() { // eslint-disable-line max-len
	var info;
	var work;
	var sva;
	var tc;
	var a;
	var d;
	var V;
	var M;
	var N;

	tc = findCase( 'novec_n1_eq_n' );
	M = 6;
	N = 4;
	a = buildMatrix5( M, N );
	d = new Complex128Array( [ 1, 0, 1, 0, 1, 0, 1, 0 ] );
	sva = initialSva( a, M, N );
	V = new Complex128Array( 1 );
	work = new Complex128Array( M );
	info = ndarrayFn( 'no-v', M, N, N, a, 1, M, 0, d, 1, 0, sva, 1, 0, 0, V, 1, 1, 0, EPS, SFMIN, TOL, 3, work, 1, 0, M ); // eslint-disable-line max-len
	assertArrayClose( toRePairs( a ), tc.a, 1e-12, 'a' );
	assertArrayClose( toRePairs( d ), tc.d, 1e-12, 'd' );
	assertArrayClose( toArray( sva ), tc.sva, 1e-12, 'sva' );
	assert.equal( info, tc.info, 'info' );
});

test( 'ndarray: n1=0 (no first block — immediate convergence)', function t() {
	var info;
	var work;
	var sva;
	var tc;
	var a;
	var d;
	var V;
	var M;
	var N;

	tc = findCase( 'novec_n1_0' );
	M = 4;
	N = 3;
	a = buildMatrix1();
	d = new Complex128Array( [ 1, 0, 1, 0, 1, 0 ] );
	sva = initialSva( a, M, N );
	V = new Complex128Array( 1 );
	work = new Complex128Array( M );
	info = ndarrayFn( 'no-v', M, N, 0, a, 1, M, 0, d, 1, 0, sva, 1, 0, 0, V, 1, 1, 0, EPS, SFMIN, TOL, 2, work, 1, 0, M ); // eslint-disable-line max-len
	assertArrayClose( toRePairs( a ), tc.a, 1e-12, 'a' );
	assertArrayClose( toRePairs( d ), tc.d, 1e-12, 'd' );
	assertArrayClose( toArray( sva ), tc.sva, 1e-12, 'sva' );
	assert.equal( info, tc.info, 'info' );
});

// Argument-error codes (negative info), exercised via the ndarray wrapper.

test( 'ndarray: returns -2 for negative M', function t() {
	var info = ndarrayFn( 'no-v', -1, 1, 0, new Complex128Array( 1 ), 1, 1, 0, new Complex128Array( 1 ), 1, 0, new Float64Array( 1 ), 1, 0, 0, new Complex128Array( 1 ), 1, 1, 0, EPS, SFMIN, TOL, 1, new Complex128Array( 1 ), 1, 0, 1 ); // eslint-disable-line max-len
	assert.equal( info, -2 );
});

test( 'ndarray: returns -3 when N > M', function t() {
	var info = ndarrayFn( 'no-v', 2, 3, 0, new Complex128Array( 6 ), 1, 2, 0, new Complex128Array( 3 ), 1, 0, new Float64Array( 3 ), 1, 0, 0, new Complex128Array( 1 ), 1, 1, 0, EPS, SFMIN, TOL, 1, new Complex128Array( 2 ), 1, 0, 2 ); // eslint-disable-line max-len
	assert.equal( info, -3 );
});

test( 'ndarray: returns -4 for negative n1', function t() {
	var info = ndarrayFn( 'no-v', 2, 2, -1, new Complex128Array( 4 ), 1, 2, 0, new Complex128Array( 2 ), 1, 0, new Float64Array( 2 ), 1, 0, 0, new Complex128Array( 1 ), 1, 1, 0, EPS, SFMIN, TOL, 1, new Complex128Array( 2 ), 1, 0, 2 ); // eslint-disable-line max-len
	assert.equal( info, -4 );
});

test( 'ndarray: returns -15 for negative mv with apply-v', function t() {
	var info = ndarrayFn( 'apply-v', 2, 2, 1, new Complex128Array( 4 ), 1, 2, 0, new Complex128Array( 2 ), 1, 0, new Float64Array( 2 ), 1, 0, -1, new Complex128Array( 4 ), 1, 2, 0, EPS, SFMIN, TOL, 1, new Complex128Array( 2 ), 1, 0, 2 ); // eslint-disable-line max-len
	assert.equal( info, -15 );
});

test( 'ndarray: returns -21 for tol <= eps', function t() {
	var info = ndarrayFn( 'no-v', 2, 2, 1, new Complex128Array( 4 ), 1, 2, 0, new Complex128Array( 2 ), 1, 0, new Float64Array( 2 ), 1, 0, 0, new Complex128Array( 1 ), 1, 1, 0, EPS, SFMIN, EPS, 1, new Complex128Array( 2 ), 1, 0, 2 ); // eslint-disable-line max-len
	assert.equal( info, -21 );
});

test( 'ndarray: returns -24 for negative nsweep', function t() {
	var info = ndarrayFn( 'no-v', 2, 2, 1, new Complex128Array( 4 ), 1, 2, 0, new Complex128Array( 2 ), 1, 0, new Float64Array( 2 ), 1, 0, 0, new Complex128Array( 1 ), 1, 1, 0, EPS, SFMIN, TOL, -1, new Complex128Array( 2 ), 1, 0, 2 ); // eslint-disable-line max-len
	assert.equal( info, -24 );
});

test( 'ndarray: returns -28 for lwork < M', function t() {
	var info = ndarrayFn( 'no-v', 2, 2, 1, new Complex128Array( 4 ), 1, 2, 0, new Complex128Array( 2 ), 1, 0, new Float64Array( 2 ), 1, 0, 0, new Complex128Array( 1 ), 1, 1, 0, EPS, SFMIN, TOL, 1, new Complex128Array( 2 ), 1, 0, 1 ); // eslint-disable-line max-len
	assert.equal( info, -28 );
});

test( 'ndarray: returns nsweep-1 when not converged', function t() {
	var info;
	var work;
	var sva;
	var Vv;
	var a;
	var d;
	var V;
	var M;
	var N;
	var i;

	M = 14;
	N = 14;
	a = buildMatrix4();
	d = new Complex128Array( N );
	for ( i = 0; i < N; i++ ) {
		reinterpret( d, 0 )[ 2 * i ] = 1;
	}
	sva = initialSva( a, M, N );
	V = new Complex128Array( N * N );
	Vv = reinterpret( V, 0 );
	for ( i = 0; i < N; i++ ) {
		Vv[ 2 * ( ( i * N ) + i ) ] = 1;
	}
	work = new Complex128Array( M );
	info = ndarrayFn( 'compute-v', M, N, 5, a, 1, M, 0, d, 1, 0, sva, 1, 0, 0, V, 1, N, 0, EPS, SFMIN, TOL, 1, work, 1, 0, M ); // eslint-disable-line max-len
	assert.equal( typeof info, 'number', 'returns a number' );
});

test( 'ndarray: handles zero-norm column sentinel (aapp = 0)', function t() {
	var info;
	var work;
	var view;
	var sva;
	var a;
	var d;
	var V;
	var M;
	var N;
	var i;

	M = 6;
	N = 4;
	a = new Complex128Array( M * N );
	view = reinterpret( a, 0 );
	for ( i = 0; i < M; i++ ) {
		view[ 2 * i ] = i + 1.0;
	}
	for ( i = 0; i < M; i++ ) {
		view[ 2 * ( ( 2 * M ) + i ) ] = Math.sin( i + 1.0 );
		view[ 2 * ( ( 3 * M ) + i ) ] = Math.cos( i + 1.0 );
	}
	d = new Complex128Array( [ 1, 0, 1, 0, 1, 0, 1, 0 ] );
	sva = initialSva( a, M, N );
	V = new Complex128Array( 1 );
	work = new Complex128Array( M );
	info = ndarrayFn( 'no-v', M, N, 2, a, 1, M, 0, d, 1, 0, sva, 1, 0, 0, V, 1, 1, 0, EPS, SFMIN, TOL, 3, work, 1, 0, M ); // eslint-disable-line max-len
	assert.equal( typeof info, 'number', 'returns a number' );
	for ( i = 0; i < N; i++ ) {
		assert.ok( sva[ i ] >= 0, 'sva[' + i + '] >= 0' );
	}
});

test( 'ndarray: small-norm branch (aaqq < 1)', function t() {
	var info;
	var work;
	var view;
	var sva;
	var a;
	var d;
	var V;
	var M;
	var N;
	var i;

	M = 4;
	N = 4;
	a = new Complex128Array( M * N );
	view = reinterpret( a, 0 );
	for ( i = 1; i <= M * N; i++ ) {
		view[ 2 * ( i - 1 ) ] = ( Math.sin( i * 0.31 ) + 0.05 ) * 0.01;
		view[ ( 2 * ( i - 1 ) ) + 1 ] = ( Math.cos( i * 0.17 ) - 0.02 ) * 0.01;
	}
	d = new Complex128Array( [ 1, 0, 1, 0, 1, 0, 1, 0 ] );
	sva = initialSva( a, M, N );
	V = new Complex128Array( N * N );
	for ( i = 0; i < N; i++ ) {
		reinterpret( V, 0 )[ 2 * ( ( i * N ) + i ) ] = 1;
	}
	work = new Complex128Array( M );
	info = ndarrayFn( 'compute-v', M, N, 2, a, 1, M, 0, d, 1, 0, sva, 1, 0, 0, V, 1, N, 0, EPS, SFMIN, TOL, 4, work, 1, 0, M ); // eslint-disable-line max-len
	assert.equal( typeof info, 'number', 'returns a number' );
	for ( i = 0; i < N; i++ ) {
		assert.ok( sva[ i ] >= 0 && isFinite( sva[ i ] ), 'sva[' + i + '] finite' );
	}
});

test( 'ndarray: large-norm branch (aaqq >= big/aapp triggers ZCOPY+ZLASCL)', function t() { // eslint-disable-line max-len
	var info;
	var work;
	var view;
	var sva;
	var a;
	var d;
	var V;
	var M;
	var N;
	var i;
	var s;

	M = 4;
	N = 3;
	a = new Complex128Array( M * N );
	view = reinterpret( a, 0 );
	s = 1e155;
	for ( i = 1; i <= M * N; i++ ) {
		view[ 2 * ( i - 1 ) ] = s * Math.sin( i * 0.31 );
		view[ ( 2 * ( i - 1 ) ) + 1 ] = s * Math.cos( i * 0.17 );
	}
	d = new Complex128Array( [ 1, 0, 1, 0, 1, 0 ] );
	sva = initialSva( a, M, N );
	V = new Complex128Array( 1 );
	work = new Complex128Array( M );
	info = ndarrayFn( 'no-v', M, N, 1, a, 1, M, 0, d, 1, 0, sva, 1, 0, 0, V, 1, 1, 0, EPS, SFMIN, TOL, 3, work, 1, 0, M ); // eslint-disable-line max-len
	assert.equal( typeof info, 'number', 'returns a number' );
});

test( 'ndarray: pair already orthogonal (|aapq| <= tol skip branch)', function t() { // eslint-disable-line max-len
	var info;
	var work;
	var view;
	var sva;
	var a;
	var d;
	var V;
	var M;
	var N;

	M = 4;
	N = 2;
	a = new Complex128Array( M * N );
	view = reinterpret( a, 0 );
	view[ 0 ] = 1;
	view[ 2 * ( M ) ] = 0;
	view[ ( 2 * ( M ) ) + 2 ] = 1;
	d = new Complex128Array( [ 1, 0, 1, 0 ] );
	sva = new Float64Array( [ 1, 1 ] );
	V = new Complex128Array( 1 );
	work = new Complex128Array( M );
	info = ndarrayFn( 'no-v', M, N, 1, a, 1, M, 0, d, 1, 0, sva, 1, 0, 0, V, 1, 1, 0, EPS, SFMIN, TOL, 3, work, 1, 0, M ); // eslint-disable-line max-len
	assert.equal( info, 0, 'info should be 0 (converged)' );
});
