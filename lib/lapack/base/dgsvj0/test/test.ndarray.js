
/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dgsvj0 from './../lib/ndarray.js';
const ndarrayFn = dgsvj0;


// FIXTURES //

const fixtureDir = path.join( import.meta.dirname, '..', '..', '..', '..', '..', 'test', 'fixtures' );
const lines = readFileSync( path.join( fixtureDir, 'dgsvj0.jsonl' ), 'utf8' ).trim().split( '\n' );
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
	assert.ok( err <= tol, msg + ': expected ' + expected + ', got ' + actual + ' (err=' + err + ')' );
}

/**
* Asserts element-wise array closeness.
*
* @private
* @param {Float64Array} actual - actual values
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
* Computes initial column norms of an M x N column-major matrix.
*
* @private
* @param {Float64Array} a - input matrix
* @param {integer} M - number of rows
* @param {integer} N - number of columns
* @returns {Float64Array} column norms
*/
function initialSva( a, M, N ) {
	let s, j, i;
	const out = new Float64Array( N );
	for ( j = 0; j < N; j++ ) {
		s = 0;
		for ( i = 0; i < M; i++ ) {
			s += a[ (j*M) + i ] * a[ (j*M) + i ];
		}
		out[ j ] = Math.sqrt( s );
	}
	return out;
}


// TESTS //

test( 'base is a function', function t() {
	assert.strictEqual( typeof dgsvj0, 'function', 'is a function' );
});

test( 'ndarray is a function', function t() {
	assert.strictEqual( typeof ndarrayFn, 'function', 'is a function' );
});

test( 'ndarray: matches fixture novec_4x3 on unit stride', function t() {
	const tc = findCase( 'novec_4x3' );
	const M = 4;
	const N = 3;
	const a = new Float64Array( [ 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12 ] );
	const d = new Float64Array( [ 1, 1, 1 ] );
	const sva = initialSva( a, M, N );
	const V = new Float64Array( 1 );
	const work = new Float64Array( M );
	const info = ndarrayFn( 'no-v', M, N, a, 1, M, 0, d, 1, 0, sva, 1, 0, 0, V, 1, 1, 0, EPS, SFMIN, TOL, 5, work, 1, 0 );
	assertArrayClose( a, tc.a, 1e-12, 'a' );
	assertArrayClose( d, tc.d, 1e-12, 'd' );
	assertArrayClose( sva, tc.sva, 1e-12, 'sva' );
	assert.equal( info, tc.info, 'info' );
});

test( 'ndarray: honors offsetA into a larger A buffer (apply_4x3)', function t() {
	let i;
	const tc = findCase( 'apply_4x3' );
	const M = 4;
	const N = 3;
	const padA = 7;
	const a = new Float64Array( padA + ( M * N ) );
	const src = [ 2, 1, 0, 0, 1, 2, 1, 0, 0, 1, 2, 1 ];
	for ( i = 0; i < src.length; i++ ) {
		a[ padA + i ] = src[ i ];
	}
	const d = new Float64Array( [ 1, 1, 1 ] );
	const sva = new Float64Array( [ Math.sqrt( 5 ), Math.sqrt( 6 ), Math.sqrt( 6 ) ] );
	const V = new Float64Array( 9 );
	V[ 0 ] = 1;
	V[ 4 ] = 1;
	V[ 8 ] = 1;
	const work = new Float64Array( M );
	const info = ndarrayFn( 'apply-v', M, N, a, 1, M, padA, d, 1, 0, sva, 1, 0, 3, V, 1, 3, 0, EPS, SFMIN, TOL, 3, work, 1, 0 );
	const aView = new Float64Array( M * N );
	for ( i = 0; i < M * N; i++ ) {
		aView[ i ] = a[ padA + i ];
	}
	assertArrayClose( aView, tc.a, 1e-12, 'a' );
	assertArrayClose( V, tc.v, 1e-12, 'v' );
	assertArrayClose( d, tc.d, 1e-12, 'd' );
	assertArrayClose( sva, tc.sva, 1e-12, 'sva' );
	assert.equal( info, tc.info, 'info' );
	for ( i = 0; i < padA; i++ ) {
		assert.equal( a[ i ], 0, 'pad[' + i + '] untouched' );
	}
});

test( 'ndarray: non-unit strideD and strideSVA with offsets (novec_n1)', function t() {
	const tc = findCase( 'novec_n1' );
	const M = 3;
	const N = 1;
	const a = new Float64Array( [ 3, 4, 0 ] );
	const d = new Float64Array( [ -9, 1, -9 ] );
	const sva = new Float64Array( [ -9, -9, 5 ] );
	const V = new Float64Array( 1 );
	const work = new Float64Array( M );
	const info = ndarrayFn( 'no-v', M, N, a, 1, M, 0, d, 2, 1, sva, 3, 2, 0, V, 1, 1, 0, EPS, SFMIN, TOL, 2, work, 1, 0 );
	assertArrayClose( a, tc.a, 1e-13, 'a' );
	assert.equal( info, tc.info, 'info' );
	assertClose( d[ 1 ], tc.d[ 0 ], 1e-13, 'd[1]' );
	assert.equal( d[ 0 ], -9, 'd[0] untouched' );
	assert.equal( d[ 2 ], -9, 'd[2] untouched' );
	assertClose( sva[ 2 ], tc.sva[ 0 ], 1e-13, 'sva[2]' );
	assert.equal( sva[ 0 ], -9, 'sva[0] untouched' );
	assert.equal( sva[ 1 ], -9, 'sva[1] untouched' );
});

test( 'ndarray: non-unit work stride with offset (novec_4x3)', function t() {
	let i;
	const tc = findCase( 'novec_4x3' );
	const M = 4;
	const N = 3;
	const a = new Float64Array( [ 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12 ] );
	const d = new Float64Array( [ 1, 1, 1 ] );
	const sva = initialSva( a, M, N );
	const V = new Float64Array( 1 );
	const work = new Float64Array( 3 + ( M * 2 ) );
	for ( i = 0; i < work.length; i++ ) {
		work[ i ] = -7;
	}
	const info = ndarrayFn( 'no-v', M, N, a, 1, M, 0, d, 1, 0, sva, 1, 0, 0, V, 1, 1, 0, EPS, SFMIN, TOL, 5, work, 2, 3 );
	assertArrayClose( a, tc.a, 1e-12, 'a' );
	assertArrayClose( d, tc.d, 1e-12, 'd' );
	assertArrayClose( sva, tc.sva, 1e-12, 'sva' );
	assert.equal( info, tc.info, 'info' );
	assert.equal( work[ 0 ], -7, 'work[0] untouched' );
	assert.equal( work[ 1 ], -7, 'work[1] untouched' );
	assert.equal( work[ 2 ], -7, 'work[2] untouched' );
});

test( 'ndarray: offsetV into a larger V buffer (vec_5x4)', function t() {
	let i;
	const tc = findCase( 'vec_5x4' );
	const M = 5;
	const N = 4;
	const a = new Float64Array( 20 );
	for ( i = 1; i <= 20; i++ ) {
		a[ i - 1 ] = ( ( i * 7 ) % 11 ) - 5.0;
	}
	const d = new Float64Array( [ 1, 1, 1, 1 ] );
	const sva = initialSva( a, M, N );
	const padV = 5;
	const V = new Float64Array( padV + ( N * N ) );
	V[ padV + 0 ] = 1;
	V[ padV + 5 ] = 1;
	V[ padV + 10 ] = 1;
	V[ padV + 15 ] = 1;
	const work = new Float64Array( M );
	const info = ndarrayFn( 'compute-v', M, N, a, 1, M, 0, d, 1, 0, sva, 1, 0, 0, V, 1, N, padV, EPS, SFMIN, TOL, 5, work, 1, 0 );
	assertArrayClose( a, tc.a, 1e-11, 'a' );
	assertArrayClose( d, tc.d, 1e-11, 'd' );
	assertArrayClose( sva, tc.sva, 1e-11, 'sva' );
	assert.equal( info, tc.info, 'info' );
	const vView = new Float64Array( N * N );
	for ( i = 0; i < N * N; i++ ) {
		vView[ i ] = V[ padV + i ];
	}
	assertArrayClose( vView, tc.v, 1e-11, 'v' );
	for ( i = 0; i < padV; i++ ) {
		assert.equal( V[ i ], 0, 'V pad[' + i + '] untouched' );
	}
});

test( 'ndarray: matches base identically (vec_5x4)', function t() {
	let i;
	const M = 5;
	const N = 4;
	const aB = new Float64Array( 20 );
	const aN = new Float64Array( 20 );
	for ( i = 1; i <= 20; i++ ) {
		aB[ i - 1 ] = ( ( i * 7 ) % 11 ) - 5.0;
		aN[ i - 1 ] = ( ( i * 7 ) % 11 ) - 5.0;
	}
	const dB = new Float64Array( [ 1, 1, 1, 1 ] );
	const dN = new Float64Array( [ 1, 1, 1, 1 ] );
	const svaB = initialSva( aB, M, N );
	const svaN = initialSva( aN, M, N );
	const VB = new Float64Array( 16 );
	const VN = new Float64Array( 16 );
	VB[ 0 ] = 1;
	VB[ 5 ] = 1;
	VB[ 10 ] = 1;
	VB[ 15 ] = 1;
	VN[ 0 ] = 1;
	VN[ 5 ] = 1;
	VN[ 10 ] = 1;
	VN[ 15 ] = 1;
	const workB = new Float64Array( M );
	const workN = new Float64Array( M );
	const baseInfo = dgsvj0( 'compute-v', M, N, aB, 1, M, 0, dB, 1, 0, svaB, 1, 0, 0, VB, 1, 4, 0, EPS, SFMIN, TOL, 5, workB, 1, 0 );
	const ndInfo = ndarrayFn( 'compute-v', M, N, aN, 1, M, 0, dN, 1, 0, svaN, 1, 0, 0, VN, 1, 4, 0, EPS, SFMIN, TOL, 5, workN, 1, 0 );
	assert.equal( ndInfo, baseInfo, 'info' );
	for ( i = 0; i < aB.length; i++ ) {
		assertClose( aN[ i ], aB[ i ], 1e-14, 'a[' + i + ']' );
	}
	for ( i = 0; i < dB.length; i++ ) {
		assertClose( dN[ i ], dB[ i ], 1e-14, 'd[' + i + ']' );
	}
	for ( i = 0; i < svaB.length; i++ ) {
		assertClose( svaN[ i ], svaB[ i ], 1e-14, 'sva[' + i + ']' );
	}
	for ( i = 0; i < VB.length; i++ ) {
		assertClose( VN[ i ], VB[ i ], 1e-14, 'V[' + i + ']' );
	}
});
