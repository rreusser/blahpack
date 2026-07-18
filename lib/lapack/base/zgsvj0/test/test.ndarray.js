/**
* @license Apache-2.0
*
* Copyright (c) 2026 Ricky Reusser.
*
* Derived from the LAPACK 3.12.0 reference implementation (BSD-3-Clause).
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/

/* eslint-disable no-restricted-syntax, stdlib/first-unit-test, max-lines */

// MODULES //

import test from 'node:test';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import ndarrayFn from './../lib/ndarray.js';


// FIXTURES //

const fixtureDir = path.join( import.meta.dirname, '..', '..', '..', '..', '..', 'test', 'fixtures' );
const lines = readFileSync( path.join( fixtureDir, 'zgsvj0.jsonl' ), 'utf8' ).trim().split( '\n' ); // eslint-disable-line node/no-sync
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
* Builds a Complex128Array from a flat re/im interleaved array.
*
* @private
* @param {Array} arr - array of interleaved re/im pairs
* @returns {Complex128Array} complex array
*/
function toComplex( arr ) {
	let i;
	const out = new Complex128Array( arr.length / 2 );
	const v = reinterpret( out, 0 );
	for ( i = 0; i < arr.length; i++ ) {
		v[ i ] = arr[ i ];
	}
	return out;
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
* @param {Float64Array} actual - actual values
* @param {Array} expected - expected values
* @param {number} tol - tolerance
* @param {string} msg - message
*/
function assertArrayClose( actual, expected, tol, msg ) {
	let i;
	assert.equal( actual.length, expected.length, msg + ': length mismatch (' + actual.length + ' vs ' + expected.length + ')' ); // eslint-disable-line max-len
	for ( i = 0; i < expected.length; i++ ) {
		assertClose( actual[ i ], expected[ i ], tol, msg + '[' + i + ']' );
	}
}

/**
* Computes initial column norms (real Euclidean) of an M-by-N column-major complex matrix.
*
* @private
* @param {Complex128Array} a - input complex matrix
* @param {integer} M - rows
* @param {integer} N - columns
* @returns {Float64Array} column norms
*/
function initialSva( a, M, N ) {
	let i, j, k, s;
	const av = reinterpret( a, 0 );
	const out = new Float64Array( N );
	for ( j = 0; j < N; j++ ) {
		s = 0;
		for ( i = 0; i < M; i++ ) {
			k = ( ( j * M ) + i ) * 2;
			s += ( av[ k ] * av[ k ] ) + ( av[ k + 1 ] * av[ k + 1 ] );
		}
		out[ j ] = Math.sqrt( s );
	}
	return out;
}


// TESTS //

test( 'ndarray is a function', function t() {
	assert.strictEqual( typeof ndarrayFn, 'function', 'is a function' );
});

test( 'ndarray: matches fixture novec_4x3 on unit stride', function t() {
	const tc = findCase( 'novec_4x3' );
	const M = 4;
	const N = 3;
	const src = [
		1.0,
		0.5,
		2.0,
		-0.5,
		3.0,
		1.0,
		4.0,
		-1.0,
		5.0,
		0.25,
		6.0,
		-0.25,
		7.0,
		0.75,
		8.0,
		-0.75,
		9.0,
		0.0,
		10.0,
		0.1,
		11.0,
		-0.2,
		12.0,
		0.3
	];
	const a = toComplex( src );
	const d = toComplex( [ 1, 0, 1, 0, 1, 0 ] );
	const sva = initialSva( a, M, N );
	const V = new Complex128Array( 1 );
	const work = new Complex128Array( M );
	const info = ndarrayFn( 'no-v', M, N, a, 1, M, 0, d, 1, 0, sva, 1, 0, 0, V, 1, 1, 0, EPS, SFMIN, TOL, 5, work, 1, 0 );
	const aR = reinterpret( a, 0 );
	const dR = reinterpret( d, 0 );
	assertArrayClose( aR, tc.a, 1e-11, 'a' );

	// `d` is a chain of complex multiplications by unit-modulus phase factors.

	// Order-of-operations differences with the Fortran reference (zdotc summation,

	// Hypot vs sqrt(re*re+im*im), divide-vs-reciprocal) accumulate over sweeps;

	// Individual entries differ by up to ~1e-8 while remaining numerically valid.
	assertArrayClose( dR, tc.d, 1e-6, 'd' );
	assertArrayClose( sva, tc.sva, 1e-12, 'sva' );
	assert.equal( info, tc.info, 'info' );
});

test( 'ndarray: matches fixture vec_5x4', function t() {
	let i;
	const tc = findCase( 'vec_5x4' );
	const M = 5;
	const N = 4;
	const src = [];
	for ( i = 1; i <= 20; i++ ) {
		src.push( ( ( i * 7 ) % 11 ) - 5.0 );
		src.push( ( ( i * 5 ) % 7 ) - 3.0 );
	}
	const a = toComplex( src );
	const d = toComplex( [ 1, 0, 1, 0, 1, 0, 1, 0 ] );
	const sva = initialSva( a, M, N );
	const Vsrc = [];
	for ( i = 0; i < 32; i++ ) {
		Vsrc.push( 0 );
	}
	Vsrc[ 0 ] = 1;
	Vsrc[ 10 ] = 1;
	Vsrc[ 20 ] = 1;
	Vsrc[ 30 ] = 1;
	const V = toComplex( Vsrc );
	const work = new Complex128Array( M );
	const info = ndarrayFn( 'compute-v', M, N, a, 1, M, 0, d, 1, 0, sva, 1, 0, 0, V, 1, N, 0, EPS, SFMIN, TOL, 5, work, 1, 0 );
	const aR = reinterpret( a, 0 );
	const vR = reinterpret( V, 0 );
	const dR = reinterpret( d, 0 );
	assertArrayClose( aR, tc.a, 1e-11, 'a' );
	assertArrayClose( vR, tc.v, 1e-11, 'v' );
	assertArrayClose( dR, tc.d, 1e-6, 'd' );
	assertArrayClose( sva, tc.sva, 1e-11, 'sva' );
	assert.equal( info, tc.info, 'info' );
});

test( 'ndarray: honors offsetA into a larger A buffer (apply_4x3)', function t() {
	let idx, i, j, k, s;
	const tc = findCase( 'apply_4x3' );
	const M = 4;
	const N = 3;
	const padA = 7;
	const aBuf = new Complex128Array( padA + ( M * N ) );
	const aR = reinterpret( aBuf, 0 );
	const src = [
		2.0,
		0.0,
		1.0,
		0.2,
		0.0,
		0.0,
		0.0,
		0.0,
		1.0,
		-0.2,
		2.0,
		0.0,
		1.0,
		0.1,
		0.0,
		0.0,
		0.0,
		0.0,
		1.0,
		-0.1,
		2.0,
		0.0,
		1.0,
		0.3
	];
	for ( i = 0; i < src.length; i++ ) {
		aR[ ( padA * 2 ) + i ] = src[ i ];
	}
	const d = toComplex( [ 1, 0, 1, 0, 1, 0 ] );
	const sva = new Float64Array( N );
	for ( j = 0; j < N; j++ ) {
		s = 0;
		for ( k = 0; k < M; k++ ) {
			idx = ( padA + ( j * M ) + k ) * 2;
			s += ( aR[ idx ] * aR[ idx ] ) + ( aR[ idx + 1 ] * aR[ idx + 1 ] );
		}
		sva[ j ] = Math.sqrt( s );
	}
	const V = toComplex( [ 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0 ] );
	const work = new Complex128Array( M );
	const info = ndarrayFn( 'apply-v', M, N, aBuf, 1, M, padA, d, 1, 0, sva, 1, 0, 3, V, 1, 3, 0, EPS, SFMIN, TOL, 3, work, 1, 0 );
	const aView = new Float64Array( M * N * 2 );
	for ( i = 0; i < M * N * 2; i++ ) {
		aView[ i ] = aR[ ( padA * 2 ) + i ];
	}
	const vR = reinterpret( V, 0 );
	const dR = reinterpret( d, 0 );
	assertArrayClose( aView, tc.a, 1e-11, 'a' );
	assertArrayClose( vR, tc.v, 1e-11, 'v' );
	assertArrayClose( dR, tc.d, 1e-6, 'd' );
	assertArrayClose( sva, tc.sva, 1e-11, 'sva' );
	assert.equal( info, tc.info, 'info' );
	for ( i = 0; i < padA * 2; i++ ) {
		assert.equal( aR[ i ], 0, 'pad[' + i + '] untouched' );
	}
});

test( 'ndarray: non-unit strideD and strideSVA with offsets (novec_n1)', function t() {
	const tc = findCase( 'novec_n1' );
	const M = 3;
	const N = 1;
	const a = toComplex( [ 3, 0, 4, 0, 0, 0 ] );
	const d = toComplex( [ -9, -9, 1, 0, -9, -9 ] );
	const sva = new Float64Array( [ -9, -9, 5 ] );
	const V = new Complex128Array( 1 );
	const work = new Complex128Array( M );
	const info = ndarrayFn( 'no-v', M, N, a, 1, M, 0, d, 2, 1, sva, 3, 2, 0, V, 1, 1, 0, EPS, SFMIN, TOL, 2, work, 1, 0 );
	const aR = reinterpret( a, 0 );
	const dR = reinterpret( d, 0 );
	assertArrayClose( aR, tc.a, 1e-13, 'a' );
	assert.equal( info, tc.info, 'info' );
	assertClose( dR[ 2 ], tc.d[ 0 ], 1e-13, 'd[1].re' );
	assertClose( dR[ 3 ], tc.d[ 1 ], 1e-13, 'd[1].im' );
	assert.equal( dR[ 0 ], -9, 'd[0].re untouched' );
	assert.equal( dR[ 1 ], -9, 'd[0].im untouched' );
	assert.equal( dR[ 4 ], -9, 'd[2].re untouched' );
	assert.equal( dR[ 5 ], -9, 'd[2].im untouched' );
	assertClose( sva[ 2 ], tc.sva[ 0 ], 1e-13, 'sva[2]' );
	assert.equal( sva[ 0 ], -9, 'sva[0] untouched' );
	assert.equal( sva[ 1 ], -9, 'sva[1] untouched' );
});

test( 'ndarray: non-unit work stride with offset (novec_4x3)', function t() {
	let i, k;
	const tc = findCase( 'novec_4x3' );
	const M = 4;
	const N = 3;
	const src = [
		1.0,
		0.5,
		2.0,
		-0.5,
		3.0,
		1.0,
		4.0,
		-1.0,
		5.0,
		0.25,
		6.0,
		-0.25,
		7.0,
		0.75,
		8.0,
		-0.75,
		9.0,
		0.0,
		10.0,
		0.1,
		11.0,
		-0.2,
		12.0,
		0.3
	];
	const a = toComplex( src );
	const d = toComplex( [ 1, 0, 1, 0, 1, 0 ] );
	const sva = initialSva( a, M, N );
	const V = new Complex128Array( 1 );
	const work = new Complex128Array( 3 + ( M * 2 ) );
	const wv = reinterpret( work, 0 );
	for ( k = 0; k < wv.length; k++ ) {
		wv[ k ] = -7;
	}
	const info = ndarrayFn( 'no-v', M, N, a, 1, M, 0, d, 1, 0, sva, 1, 0, 0, V, 1, 1, 0, EPS, SFMIN, TOL, 5, work, 2, 3 );
	const aR = reinterpret( a, 0 );
	const dR = reinterpret( d, 0 );
	assertArrayClose( aR, tc.a, 1e-11, 'a' );
	assertArrayClose( dR, tc.d, 1e-6, 'd' );
	assertArrayClose( sva, tc.sva, 1e-12, 'sva' );
	assert.equal( info, tc.info, 'info' );
	for ( i = 0; i < 6; i++ ) {
		assert.equal( wv[ i ], -7, 'work pad[' + i + '] untouched' );
	}
});

test( 'ndarray: matches fixture vec_10x9_block (off-diagonal blocks)', function t() {
	let dR, i;
	const tc = findCase( 'vec_10x9_block' );
	const M = 10;
	const N = 9;
	const src = [];
	for ( i = 1; i <= 90; i++ ) {
		src.push( ( ( ( ( i * 37 ) + 13 ) % 29 ) - 14.0 ) + Math.sin( i * 0.11 ) ); // eslint-disable-line max-len
		src.push( Math.cos( i * 0.07 ) - ( 0.3 * Math.sin( i * 0.19 ) ) );
	}
	const a = toComplex( src );
	const d = new Complex128Array( N );
	dR = reinterpret( d, 0 );
	for ( i = 0; i < N; i++ ) {
		dR[ ( i * 2 ) ] = 1.0;
	}
	const sva = initialSva( a, M, N );
	const Vsrc = [];
	for ( i = 0; i < N * N * 2; i++ ) {
		Vsrc.push( 0 );
	}
	for ( i = 0; i < N; i++ ) {
		Vsrc[ ( ( ( i * N ) + i ) * 2 ) ] = 1;
	}
	const V = toComplex( Vsrc );
	const work = new Complex128Array( M );
	const info = ndarrayFn( 'compute-v', M, N, a, 1, M, 0, d, 1, 0, sva, 1, 0, 0, V, 1, N, 0, EPS, SFMIN, TOL, 4, work, 1, 0 );
	const aR = reinterpret( a, 0 );
	const vR = reinterpret( V, 0 );
	dR = reinterpret( d, 0 );
	assertArrayClose( aR, tc.a, 1e-10, 'a' );
	assertArrayClose( vR, tc.v, 1e-10, 'v' );
	assertArrayClose( dR, tc.d, 1e-6, 'd' );
	assertArrayClose( sva, tc.sva, 1e-10, 'sva' );
	assert.equal( info, tc.info, 'info' );
});

test( 'ndarray: N=0 returns immediately with success', function t() {

	// N=0 has emptsw = (N*(N-1))/2 = 0 and notrot = 0 on entry, so the

	// Notrot >= emptsw convergence check trips on the first sweep.
	const a = new Complex128Array( 1 );
	const d = new Complex128Array( 1 );
	const sva = new Float64Array( 1 );
	const V = new Complex128Array( 1 );
	const work = new Complex128Array( 1 );
	const info = ndarrayFn( 'no-v', 1, 0, a, 1, 1, 0, d, 1, 0, sva, 1, 0, 0, V, 1, 1, 0, EPS, SFMIN, TOL, 2, work, 1, 0 );
	assert.equal( info, 0, 'info=0 on trivial N=0 problem' );
});

test( 'ndarray: validator rejects invalid jobv', function t() {
	let work, sva, a, d, V;
	a = new Complex128Array( 1 );
	d = new Complex128Array( 1 );
	sva = new Float64Array( 1 );
	V = new Complex128Array( 1 );
	work = new Complex128Array( 1 );
	assert.throws( function bad() {
		ndarrayFn( 'X', 1, 1, a, 1, 1, 0, d, 1, 0, sva, 1, 0, 0, V, 1, 1, 0, EPS, SFMIN, TOL, 2, work, 1, 0 );
	}, TypeError );
});

test( 'ndarray: returns negative info when tol <= eps', function t() {
	const a = new Complex128Array( 1 );
	const d = new Complex128Array( 1 );
	const sva = new Float64Array( 1 );
	const V = new Complex128Array( 1 );
	const work = new Complex128Array( 1 );
	const info = ndarrayFn( 'no-v', 1, 1, a, 1, 1, 0, d, 1, 0, sva, 1, 0, 0, V, 1, 1, 0, EPS, SFMIN, EPS, 2, work, 1, 0 );
	assert.equal( info, -19, 'tol <= eps yields info=-19' );
});

test( 'ndarray: returns negative info when lwork < M', function t() {
	const a = new Complex128Array( 2 );
	const d = new Complex128Array( 1 );
	const sva = new Float64Array( 1 );
	const V = new Complex128Array( 1 );
	const work = new Complex128Array( 1 );
	const info = ndarrayFn( 'no-v', 2, 1, a, 1, 2, 0, d, 1, 0, sva, 1, 0, 0, V, 1, 1, 0, EPS, SFMIN, TOL, 2, work, 1, 0 );
	assert.equal( info, -26, 'lwork < M yields info=-26' );
});
