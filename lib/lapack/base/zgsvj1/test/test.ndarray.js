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

const fixtureDir = path.join( import.meta.dirname, '..', '..', '..', '..', '..', 'test', 'fixtures' ); // eslint-disable-line max-len
const lines = readFileSync( path.join( fixtureDir, 'zgsvj1.jsonl' ), 'utf8' ).trim().split( '\n' ); // eslint-disable-line node/no-sync
const fixture = lines.map( function parse( line ) {
	return JSON.parse( line );
});


// VARIABLES //

const EPS = 2.220446049250313e-16;
const SFMIN = 2.2250738585072014e-308;
const TOL = 1.0e-10;


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
	const denom = Math.max( Math.abs( expected ), 1.0 );
	const err = Math.abs( actual - expected ) / denom;
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
	let i;
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
	const view = reinterpret( z, 0 );
	const out = [];
	let i;
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
	let idx, s, j, i;
	const view = reinterpret( a, 0 );
	const out = new Float64Array( N );
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
	let k;

	// Column-major M=4 N=3, real parts 1..12, imaginary parts as a pattern.
	const imags = [ 0.5, -0.5, 1.0, -1.0, 0.25, -0.25, 0.75, -0.75, 0.0, 0.1, -0.2, 0.3 ]; // eslint-disable-line max-len
	const a = new Complex128Array( 12 );
	const view = reinterpret( a, 0 );
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
	let k;
	const a = new Complex128Array( 20 );
	const view = reinterpret( a, 0 );
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
	let k;
	const reals = [ 2.0, 1.0, 0.0, 0.0, 1.0, 2.0, 1.0, 0.0, 0.0, 1.0, 2.0, 1.0 ];
	const imags = [ 0.0, 0.2, 0.0, 0.0, -0.2, 0.0, 0.1, 0.0, 0.0, -0.1, 0.0, 0.3 ];
	const a = new Complex128Array( 12 );
	const view = reinterpret( a, 0 );
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
	let k;
	const a = new Complex128Array( 14 * 14 );
	const view = reinterpret( a, 0 );
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
	let k;
	const a = new Complex128Array( M * N );
	const view = reinterpret( a, 0 );
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
	const out = [];
	let i;
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
		ndarrayFn( 'invalid', 2, 2, 1, new Complex128Array( 4 ), 1, 2, 0, new Complex128Array( 2 ), 1, 0, new Float64Array( 2 ), 1, 0, 0, new Complex128Array( 1 ), 1, 1, 0, EPS, SFMIN, TOL, 1, new Complex128Array( 2 ), 1, 0 ); // eslint-disable-line max-len
	}, TypeError );
});

test( 'ndarray: matches fixture novec_4x3_n1_1 on unit stride', function t() {

	const tc = findCase( 'novec_4x3_n1_1' );
	const M = 4;
	const N = 3;
	const a = buildMatrix1();
	const d = new Complex128Array( [ 1, 0, 1, 0, 1, 0 ] );
	const sva = initialSva( a, M, N );
	const V = new Complex128Array( 1 );
	const work = new Complex128Array( M );
	const info = ndarrayFn( 'no-v', M, N, 1, a, 1, M, 0, d, 1, 0, sva, 1, 0, 0, V, 1, 1, 0, EPS, SFMIN, TOL, 5, work, 1, 0 ); // eslint-disable-line max-len
	assertArrayClose( toRePairs( a ), tc.a, 1e-12, 'a' );
	assertArrayClose( toRePairs( d ), tc.d, 1e-12, 'd' );
	assertArrayClose( toArray( sva ), tc.sva, 1e-12, 'sva' );
	assert.equal( info, tc.info, 'info' );
});

test( 'ndarray: matches fixture vec_5x4_n1_2 with compute-v', function t() {
	let i;

	const tc = findCase( 'vec_5x4_n1_2' );
	const M = 5;
	const N = 4;
	const a = buildMatrix2();
	const d = new Complex128Array( [ 1, 0, 1, 0, 1, 0, 1, 0 ] );
	const sva = initialSva( a, M, N );
	const V = new Complex128Array( N * N );
	for ( i = 0; i < N; i++ ) {
		reinterpret( V, 0 )[ 2 * ( ( i * N ) + i ) ] = 1;
	}
	const work = new Complex128Array( M );
	const info = ndarrayFn( 'compute-v', M, N, 2, a, 1, M, 0, d, 1, 0, sva, 1, 0, 0, V, 1, N, 0, EPS, SFMIN, TOL, 5, work, 1, 0 ); // eslint-disable-line max-len
	assertArrayClose( toRePairs( a ), tc.a, 1e-11, 'a' );
	assertArrayClose( toRePairs( V ), tc.v, 1e-11, 'v' );
	assertArrayClose( toRePairs( d ), tc.d, 1e-11, 'd' );
	assertArrayClose( toArray( sva ), tc.sva, 1e-11, 'sva' );
	assert.equal( info, tc.info, 'info' );
});

test( 'ndarray: honors offsetA into a larger A buffer (apply_4x3_n1_1)', function t() { // eslint-disable-line max-len
	let i;

	const tc = findCase( 'apply_4x3_n1_1' );
	const M = 4;
	const N = 3;
	const padA = 5;
	const src = buildMatrix3();
	const a = new Complex128Array( padA + ( M * N ) );
	for ( i = 0; i < M * N; i++ ) {
		reinterpret( a, 0 )[ 2 * ( padA + i ) ] = reinterpret( src, 0 )[ 2 * i ];
		reinterpret( a, 0 )[ ( 2 * ( padA + i ) ) + 1 ] = reinterpret( src, 0 )[ ( 2 * i ) + 1 ]; // eslint-disable-line max-len
	}
	const d = new Complex128Array( [ 1, 0, 1, 0, 1, 0 ] );
	const sva = initialSva( src, M, N );
	const V = new Complex128Array( 9 );
	reinterpret( V, 0 )[ 0 ] = 1;
	reinterpret( V, 0 )[ 8 ] = 1;
	reinterpret( V, 0 )[ 16 ] = 1;
	const work = new Complex128Array( M );
	const info = ndarrayFn( 'apply-v', M, N, 1, a, 1, M, padA, d, 1, 0, sva, 1, 0, 3, V, 1, 3, 0, EPS, SFMIN, TOL, 3, work, 1, 0 ); // eslint-disable-line max-len
	const aSlice = [];
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
	let i;

	const tc = findCase( 'novec_4x3_n1_1' );
	const M = 4;
	const N = 3;
	const a = buildMatrix1();
	const d = new Complex128Array( 1 + ( N * 2 ) );
	const dv = reinterpret( d, 0 );
	for ( i = 0; i < N; i++ ) {
		dv[ 2 * ( 1 + ( i * 2 ) ) ] = 1;
	}
	const sva = new Float64Array( 2 + ( N * 3 ) );
	const sv0 = initialSva( a, M, N );
	for ( i = 0; i < N; i++ ) {
		sva[ 2 + ( i * 3 ) ] = sv0[ i ];
	}
	const V = new Complex128Array( 1 );
	const work = new Complex128Array( M );
	const info = ndarrayFn( 'no-v', M, N, 1, a, 1, M, 0, d, 2, 1, sva, 3, 2, 0, V, 1, 1, 0, EPS, SFMIN, TOL, 5, work, 1, 0 ); // eslint-disable-line max-len
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
	let i;

	const tc = findCase( 'novec_4x3_n1_1' );
	const M = 4;
	const N = 3;
	const a = buildMatrix1();
	const d = new Complex128Array( [ 1, 0, 1, 0, 1, 0 ] );
	const sva = initialSva( a, M, N );
	const V = new Complex128Array( 1 );
	const work = new Complex128Array( 3 + ( M * 2 ) );
	const wv = reinterpret( work, 0 );
	for ( i = 0; i < wv.length; i++ ) {
		wv[ i ] = -7;
	}
	const info = ndarrayFn( 'no-v', M, N, 1, a, 1, M, 0, d, 1, 0, sva, 1, 0, 0, V, 1, 1, 0, EPS, SFMIN, TOL, 5, work, 2, 3 ); // eslint-disable-line max-len
	assertArrayClose( toRePairs( a ), tc.a, 1e-12, 'a' );
	assertArrayClose( toRePairs( d ), tc.d, 1e-12, 'd' );
	assertArrayClose( toArray( sva ), tc.sva, 1e-12, 'sva' );
	assert.equal( info, tc.info, 'info' );
	for ( i = 0; i < 6; i++ ) {
		assert.equal( wv[ i ], -7, 'work[' + i + '] untouched' );
	}
});

test( 'ndarray: 14x14 block-tiled (vec_14x14_block)', function t() {
	let i;

	const tc = findCase( 'vec_14x14_block' );
	const M = 14;
	const N = 14;
	const a = buildMatrix4();
	const d = new Complex128Array( N );
	for ( i = 0; i < N; i++ ) {
		reinterpret( d, 0 )[ 2 * i ] = 1;
	}
	const sva = initialSva( a, M, N );
	const V = new Complex128Array( N * N );
	const Vv = reinterpret( V, 0 );
	for ( i = 0; i < N; i++ ) {
		Vv[ 2 * ( ( i * N ) + i ) ] = 1;
	}
	const work = new Complex128Array( M );
	const info = ndarrayFn( 'compute-v', M, N, 5, a, 1, M, 0, d, 1, 0, sva, 1, 0, 0, V, 1, N, 0, EPS, SFMIN, TOL, 4, work, 1, 0 ); // eslint-disable-line max-len
	assertArrayClose( toRePairs( a ), tc.a, 1e-10, 'a' );
	assertArrayClose( toRePairs( V ), tc.v, 1e-10, 'v' );
	assertArrayClose( toRePairs( d ), tc.d, 1e-10, 'd' );
	assertArrayClose( toArray( sva ), tc.sva, 1e-10, 'sva' );
	assert.equal( info, tc.info, 'info' );
});

test( 'ndarray: n1=N (no off-diagonal block — early convergence)', function t() { // eslint-disable-line max-len

	const tc = findCase( 'novec_n1_eq_n' );
	const M = 6;
	const N = 4;
	const a = buildMatrix5( M, N );
	const d = new Complex128Array( [ 1, 0, 1, 0, 1, 0, 1, 0 ] );
	const sva = initialSva( a, M, N );
	const V = new Complex128Array( 1 );
	const work = new Complex128Array( M );
	const info = ndarrayFn( 'no-v', M, N, N, a, 1, M, 0, d, 1, 0, sva, 1, 0, 0, V, 1, 1, 0, EPS, SFMIN, TOL, 3, work, 1, 0 ); // eslint-disable-line max-len
	assertArrayClose( toRePairs( a ), tc.a, 1e-12, 'a' );
	assertArrayClose( toRePairs( d ), tc.d, 1e-12, 'd' );
	assertArrayClose( toArray( sva ), tc.sva, 1e-12, 'sva' );
	assert.equal( info, tc.info, 'info' );
});

test( 'ndarray: n1=0 (no first block — immediate convergence)', function t() {

	const tc = findCase( 'novec_n1_0' );
	const M = 4;
	const N = 3;
	const a = buildMatrix1();
	const d = new Complex128Array( [ 1, 0, 1, 0, 1, 0 ] );
	const sva = initialSva( a, M, N );
	const V = new Complex128Array( 1 );
	const work = new Complex128Array( M );
	const info = ndarrayFn( 'no-v', M, N, 0, a, 1, M, 0, d, 1, 0, sva, 1, 0, 0, V, 1, 1, 0, EPS, SFMIN, TOL, 2, work, 1, 0 ); // eslint-disable-line max-len
	assertArrayClose( toRePairs( a ), tc.a, 1e-12, 'a' );
	assertArrayClose( toRePairs( d ), tc.d, 1e-12, 'd' );
	assertArrayClose( toArray( sva ), tc.sva, 1e-12, 'sva' );
	assert.equal( info, tc.info, 'info' );
});

// Argument-error codes (negative info), exercised via the ndarray wrapper.

test( 'ndarray: returns -2 for negative M', function t() {
	const info = ndarrayFn( 'no-v', -1, 1, 0, new Complex128Array( 1 ), 1, 1, 0, new Complex128Array( 1 ), 1, 0, new Float64Array( 1 ), 1, 0, 0, new Complex128Array( 1 ), 1, 1, 0, EPS, SFMIN, TOL, 1, new Complex128Array( 1 ), 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, -2 );
});

test( 'ndarray: returns -3 when N > M', function t() {
	const info = ndarrayFn( 'no-v', 2, 3, 0, new Complex128Array( 6 ), 1, 2, 0, new Complex128Array( 3 ), 1, 0, new Float64Array( 3 ), 1, 0, 0, new Complex128Array( 1 ), 1, 1, 0, EPS, SFMIN, TOL, 1, new Complex128Array( 2 ), 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, -3 );
});

test( 'ndarray: returns -4 for negative n1', function t() {
	const info = ndarrayFn( 'no-v', 2, 2, -1, new Complex128Array( 4 ), 1, 2, 0, new Complex128Array( 2 ), 1, 0, new Float64Array( 2 ), 1, 0, 0, new Complex128Array( 1 ), 1, 1, 0, EPS, SFMIN, TOL, 1, new Complex128Array( 2 ), 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, -4 );
});

test( 'ndarray: returns -15 for negative mv with apply-v', function t() {
	const info = ndarrayFn( 'apply-v', 2, 2, 1, new Complex128Array( 4 ), 1, 2, 0, new Complex128Array( 2 ), 1, 0, new Float64Array( 2 ), 1, 0, -1, new Complex128Array( 4 ), 1, 2, 0, EPS, SFMIN, TOL, 1, new Complex128Array( 2 ), 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, -15 );
});

test( 'ndarray: returns -21 for tol <= eps', function t() {
	const info = ndarrayFn( 'no-v', 2, 2, 1, new Complex128Array( 4 ), 1, 2, 0, new Complex128Array( 2 ), 1, 0, new Float64Array( 2 ), 1, 0, 0, new Complex128Array( 1 ), 1, 1, 0, EPS, SFMIN, EPS, 1, new Complex128Array( 2 ), 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, -21 );
});

test( 'ndarray: returns -24 for negative nsweep', function t() {
	const info = ndarrayFn( 'no-v', 2, 2, 1, new Complex128Array( 4 ), 1, 2, 0, new Complex128Array( 2 ), 1, 0, new Float64Array( 2 ), 1, 0, 0, new Complex128Array( 1 ), 1, 1, 0, EPS, SFMIN, TOL, -1, new Complex128Array( 2 ), 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, -24 );
});

test( 'ndarray: returns -28 for undersized work', function t() {
	const info = ndarrayFn( 'no-v', 2, 2, 1, new Complex128Array( 4 ), 1, 2, 0, new Complex128Array( 2 ), 1, 0, new Float64Array( 2 ), 1, 0, 0, new Complex128Array( 1 ), 1, 1, 0, EPS, SFMIN, TOL, 1, new Complex128Array( 1 ), 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, -28 );
});

test( 'ndarray: returns nsweep-1 when not converged', function t() {
	let i;

	const M = 14;
	const N = 14;
	const a = buildMatrix4();
	const d = new Complex128Array( N );
	for ( i = 0; i < N; i++ ) {
		reinterpret( d, 0 )[ 2 * i ] = 1;
	}
	const sva = initialSva( a, M, N );
	const V = new Complex128Array( N * N );
	const Vv = reinterpret( V, 0 );
	for ( i = 0; i < N; i++ ) {
		Vv[ 2 * ( ( i * N ) + i ) ] = 1;
	}
	const work = new Complex128Array( M );
	const info = ndarrayFn( 'compute-v', M, N, 5, a, 1, M, 0, d, 1, 0, sva, 1, 0, 0, V, 1, N, 0, EPS, SFMIN, TOL, 1, work, 1, 0 ); // eslint-disable-line max-len
	assert.equal( typeof info, 'number', 'returns a number' );
});

test( 'ndarray: handles zero-norm column sentinel (aapp = 0)', function t() {
	let i;

	const M = 6;
	const N = 4;
	const a = new Complex128Array( M * N );
	const view = reinterpret( a, 0 );
	for ( i = 0; i < M; i++ ) {
		view[ 2 * i ] = i + 1.0;
	}
	for ( i = 0; i < M; i++ ) {
		view[ 2 * ( ( 2 * M ) + i ) ] = Math.sin( i + 1.0 );
		view[ 2 * ( ( 3 * M ) + i ) ] = Math.cos( i + 1.0 );
	}
	const d = new Complex128Array( [ 1, 0, 1, 0, 1, 0, 1, 0 ] );
	const sva = initialSva( a, M, N );
	const V = new Complex128Array( 1 );
	const work = new Complex128Array( M );
	const info = ndarrayFn( 'no-v', M, N, 2, a, 1, M, 0, d, 1, 0, sva, 1, 0, 0, V, 1, 1, 0, EPS, SFMIN, TOL, 3, work, 1, 0 ); // eslint-disable-line max-len
	assert.equal( typeof info, 'number', 'returns a number' );
	for ( i = 0; i < N; i++ ) {
		assert.ok( sva[ i ] >= 0, 'sva[' + i + '] >= 0' );
	}
});

test( 'ndarray: small-norm branch (aaqq < 1)', function t() {
	let i;

	const M = 4;
	const N = 4;
	const a = new Complex128Array( M * N );
	const view = reinterpret( a, 0 );
	for ( i = 1; i <= M * N; i++ ) {
		view[ 2 * ( i - 1 ) ] = ( Math.sin( i * 0.31 ) + 0.05 ) * 0.01;
		view[ ( 2 * ( i - 1 ) ) + 1 ] = ( Math.cos( i * 0.17 ) - 0.02 ) * 0.01;
	}
	const d = new Complex128Array( [ 1, 0, 1, 0, 1, 0, 1, 0 ] );
	const sva = initialSva( a, M, N );
	const V = new Complex128Array( N * N );
	for ( i = 0; i < N; i++ ) {
		reinterpret( V, 0 )[ 2 * ( ( i * N ) + i ) ] = 1;
	}
	const work = new Complex128Array( M );
	const info = ndarrayFn( 'compute-v', M, N, 2, a, 1, M, 0, d, 1, 0, sva, 1, 0, 0, V, 1, N, 0, EPS, SFMIN, TOL, 4, work, 1, 0 ); // eslint-disable-line max-len
	assert.equal( typeof info, 'number', 'returns a number' );
	for ( i = 0; i < N; i++ ) {
		assert.ok( sva[ i ] >= 0 && isFinite( sva[ i ] ), 'sva[' + i + '] finite' );
	}
});

test( 'ndarray: large-norm branch (aaqq >= big/aapp triggers ZCOPY+ZLASCL)', function t() { // eslint-disable-line max-len
	let i;

	const M = 4;
	const N = 3;
	const a = new Complex128Array( M * N );
	const view = reinterpret( a, 0 );
	const s = 1e155;
	for ( i = 1; i <= M * N; i++ ) {
		view[ 2 * ( i - 1 ) ] = s * Math.sin( i * 0.31 );
		view[ ( 2 * ( i - 1 ) ) + 1 ] = s * Math.cos( i * 0.17 );
	}
	const d = new Complex128Array( [ 1, 0, 1, 0, 1, 0 ] );
	const sva = initialSva( a, M, N );
	const V = new Complex128Array( 1 );
	const work = new Complex128Array( M );
	const info = ndarrayFn( 'no-v', M, N, 1, a, 1, M, 0, d, 1, 0, sva, 1, 0, 0, V, 1, 1, 0, EPS, SFMIN, TOL, 3, work, 1, 0 ); // eslint-disable-line max-len
	assert.equal( typeof info, 'number', 'returns a number' );
});

test( 'ndarray: pair already orthogonal (|aapq| <= tol skip branch)', function t() { // eslint-disable-line max-len

	const M = 4;
	const N = 2;
	const a = new Complex128Array( M * N );
	const view = reinterpret( a, 0 );
	view[ 0 ] = 1;
	view[ 2 * ( M ) ] = 0;
	view[ ( 2 * ( M ) ) + 2 ] = 1;
	const d = new Complex128Array( [ 1, 0, 1, 0 ] );
	const sva = new Float64Array( [ 1, 1 ] );
	const V = new Complex128Array( 1 );
	const work = new Complex128Array( M );
	const info = ndarrayFn( 'no-v', M, N, 1, a, 1, M, 0, d, 1, 0, sva, 1, 0, 0, V, 1, 1, 0, EPS, SFMIN, TOL, 3, work, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, 0, 'info should be 0 (converged)' );
});
