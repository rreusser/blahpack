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

/* eslint-disable no-restricted-syntax, max-lines */

// MODULES //

import test from 'node:test';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import ndarrayFn from './../lib/ndarray.js';
import base from './../lib/base.js';


// FIXTURES //

const fixtureDir = path.join( import.meta.dirname, '..', '..', '..', '..', '..', 'test', 'fixtures' );
const lines = readFileSync( path.join( fixtureDir, 'zgsvj0.jsonl' ), 'utf8' ).trim().split( '\n' );
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

test( 'ndarray: work at a nonzero offset (novec_4x3)', function t() {
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
	const info = ndarrayFn( 'no-v', M, N, a, 1, M, 0, d, 1, 0, sva, 1, 0, 0, V, 1, 1, 0, EPS, SFMIN, TOL, 5, work, 1, 3 );
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

test( 'ndarray: throws RangeError when tol <= eps', function t() {
	const a = new Complex128Array( 1 );
	const d = new Complex128Array( 1 );
	const sva = new Float64Array( 1 );
	const V = new Complex128Array( 1 );
	const work = new Complex128Array( 1 );
	assert.throws( function throws() {
		ndarrayFn( 'no-v', 1, 1, a, 1, 1, 0, d, 1, 0, sva, 1, 0, 0, V, 1, 1, 0, EPS, SFMIN, EPS, 2, work, 1, 0 );
	}, RangeError );
});

test( 'ndarray: throws RangeError when work holds fewer than M elements (the reference returns INFO = -16)', function t() {
	const a = new Complex128Array( 2 );
	const d = new Complex128Array( 1 );
	const sva = new Float64Array( 1 );
	const V = new Complex128Array( 1 );
	const work = new Complex128Array( 1 );
	assert.throws( function bad() {
		ndarrayFn( 'no-v', 2, 1, a, 1, 2, 0, d, 1, 0, sva, 1, 0, 0, V, 1, 1, 0, EPS, SFMIN, TOL, 2, work, 1, 0 );
	}, RangeError );
});

test( 'ndarray: N=20 (three column blocks) orthogonalizes every block pair, incl. (1,3)', function t() { // eslint-disable-line max-len
	let maxcos;
	let info;
	let src;
	let dre;
	let dim;
	let avr;
	let avi;
	let ia;
	let iv;
	let s;
	let i;
	let j;
	let k;
	const M = 20;
	const N = 20;
	src = [];
	for ( i = 0; i < M * N; i++ ) {
		src.push( ( ( ( i * 37 ) + 11 ) % 23 ) - 11.0 + ( 0.1 * ( i % 7 ) ) );
		src.push( ( ( ( i * 13 ) + 5 ) % 17 ) - 8.0 );
	}
	const a0 = new Float64Array( src );
	const a = toComplex( src );
	src = [];
	for ( i = 0; i < N; i++ ) {
		src.push( 1.0, 0.0 );
	}
	const d = toComplex( src );
	const sva = initialSva( a, M, N );
	src = [];
	for ( i = 0; i < 2 * N * N; i++ ) {
		src.push( 0.0 );
	}
	for ( i = 0; i < N; i++ ) {
		src[ 2 * ( ( i * N ) + i ) ] = 1.0;
	}
	const V = toComplex( src );
	const work = new Complex128Array( M );
	info = ndarrayFn( 'compute-v', M, N, a, 1, M, 0, d, 1, 0, sva, 1, 0, 0, V, 1, N, 0, EPS, SFMIN, 1.0e-13, 30, work, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, 0, 'info (converged)' );
	const aR = reinterpret( a, 0 );
	const vR = reinterpret( V, 0 );
	const dR = reinterpret( d, 0 );

	// The same transformations are applied to A and V, so A_out == A_in * V:
	for ( j = 0; j < N; j++ ) {
		for ( i = 0; i < M; i++ ) {
			avr = 0.0;
			avi = 0.0;
			for ( k = 0; k < N; k++ ) {
				ia = 2 * ( ( k * M ) + i );
				iv = 2 * ( ( j * N ) + k );
				avr += ( a0[ ia ] * vR[ iv ] ) - ( a0[ ia + 1 ] * vR[ iv + 1 ] );
				avi += ( a0[ ia ] * vR[ iv + 1 ] ) + ( a0[ ia + 1 ] * vR[ iv ] );
			}
			ia = 2 * ( ( j * M ) + i );
			assertClose( aR[ ia ], avr, 1e-10, 'Re A vs A0*V (' + i + ',' + j + ')' );
			assertClose( aR[ ia + 1 ], avi, 1e-10, 'Im A vs A0*V (' + i + ',' + j + ')' );
		}
	}

	// D stays unimodular and SVA(p) is the 2-norm of column p of A:
	for ( j = 0; j < N; j++ ) {
		dre = dR[ 2 * j ];
		dim = dR[ ( 2 * j ) + 1 ];
		assertClose( Math.sqrt( ( dre * dre ) + ( dim * dim ) ), 1.0, 1e-12, '|d[' + j + ']|' );
		s = 0.0;
		for ( i = 0; i < M; i++ ) {
			ia = 2 * ( ( j * M ) + i );
			s += ( aR[ ia ] * aR[ ia ] ) + ( aR[ ia + 1 ] * aR[ ia + 1 ] );
		}
		assertClose( sva[ j ], Math.sqrt( s ), 1e-10, 'sva[' + j + ']' );
	}

	// Columns are mutually orthogonal (every block pair was rotated):
	maxcos = 0.0;
	for ( j = 0; j < N; j++ ) {
		for ( k = j + 1; k < N; k++ ) {
			avr = 0.0;
			avi = 0.0;
			for ( i = 0; i < M; i++ ) {
				ia = 2 * ( ( j * M ) + i );
				iv = 2 * ( ( k * M ) + i );
				avr += ( aR[ ia ] * aR[ iv ] ) + ( aR[ ia + 1 ] * aR[ iv + 1 ] );
				avi += ( aR[ ia ] * aR[ iv + 1 ] ) - ( aR[ ia + 1 ] * aR[ iv ] );
			}
			maxcos = Math.max( maxcos, Math.sqrt( ( avr * avr ) + ( avi * avi ) ) / ( sva[ j ] * sva[ k ] ) ); // eslint-disable-line max-len
		}
	}
	assert.ok( maxcos < 1e-10, 'columns orthogonal: max |cos| = ' + maxcos );
});


// Property checks for the base-level INFO codes and the zero-column, near-parallel, Gram-Schmidt and extreme-range branches. //

/**
* Generates a deterministic interleaved (re,im) M-by-N column-major test matrix.
*
* @private
* @param {integer} M - number of rows
* @param {integer} N - number of columns
* @param {integer} seed - seed
* @returns {Array} interleaved matrix
*/
function genMatrix( M, N, seed ) {
	let i;
	const a = [];
	for ( i = 0; i < M * N; i++ ) {
		a.push( ( ( ( ( i * 37 ) + 11 + seed ) % 23 ) - 11.0 ) + ( 0.1 * ( i % 7 ) ) );
		a.push( ( ( ( i * 13 ) + 5 + seed ) % 17 ) - 8.0 );
	}
	return a;
}

/**
* Scales column `j` of an interleaved M-by-N column-major matrix in place.
*
* @private
* @param {Array} a - interleaved matrix
* @param {integer} M - number of rows
* @param {integer} j - column index
* @param {number} s - scale factor
*/
function scaleColumn( a, M, j, s ) {
	let i;
	for ( i = 0; i < 2 * M; i++ ) {
		a[ ( 2 * j * M ) + i ] *= s;
	}
}

/**
* Returns the largest absolute real or imaginary part in column `j`.
*
* @private
* @param {Float64Array} a - interleaved matrix
* @param {integer} M - number of rows
* @param {integer} j - column index
* @returns {number} max absolute component
*/
function colMax( a, M, j ) {
	let m;
	let i;
	m = 0.0;
	for ( i = 0; i < 2 * M; i++ ) {
		m = Math.max( m, Math.abs( a[ ( 2 * j * M ) + i ] ) );
	}
	return m;
}

/**
* Returns the 2-norm of column `j`, scaled by its own largest component to avoid over/underflow.
*
* @private
* @param {Float64Array} a - interleaved matrix
* @param {integer} M - number of rows
* @param {integer} j - column index
* @returns {number} column norm
*/
function colNorm( a, M, j ) {
	let v;
	let t;
	let i;
	const m = colMax( a, M, j );
	if ( m === 0.0 ) {
		return 0.0;
	}
	t = 0.0;
	for ( i = 0; i < 2 * M; i++ ) {
		v = a[ ( 2 * j * M ) + i ] / m;
		t += v * v;
	}
	return Math.sqrt( t ) * m;
}

/**
* Runs `zgsvj0` with JOBV='compute-v' (V = I, D = 1 on entry) and checks the defining properties of the one-sided Jacobi sweep.
*
* -   `A_out = A_in * V_out` (A and V receive the same rotations), unless `opts.prod` is `null` (the Gram-Schmidt branch does not update V).
* -   `V_out` is unitary and `D_out` stays unimodular.
* -   `SVA(j) = ||A_out(:,j)||`, sorted non-increasingly.
* -   On convergence, the columns of `A_out` are mutually orthogonal.
*
* @private
* @param {Array} src - interleaved input matrix
* @param {integer} M - number of rows
* @param {integer} N - number of columns
* @param {Object} opts - tolerances `{ prod, orth, sva, cos }`, plus optional `nsweep` (default 30) and expected `info` (default 0)
* @returns {Object} outputs
*/
function runAndCheck( src, M, N, opts ) {
	let maxcos;
	let info;
	let avr;
	let avi;
	let mj;
	let mk;
	let ia;
	let iv;
	let s;
	let i;
	let j;
	let k;
	const a0 = new Float64Array( src );
	const a = toComplex( src );
	const d = new Complex128Array( N );
	const sva = new Float64Array( N );
	const V = new Complex128Array( N * N );
	const work = new Complex128Array( M );
	const aR = reinterpret( a, 0 );
	const vR = reinterpret( V, 0 );
	const dR = reinterpret( d, 0 );

	s = 0.0;
	for ( i = 0; i < 2 * M * N; i++ ) {
		s = Math.max( s, Math.abs( a0[ i ] ) );
	}
	for ( j = 0; j < N; j++ ) {
		sva[ j ] = colNorm( a0, M, j );
		vR[ 2 * ( ( j * N ) + j ) ] = 1.0;
		dR[ 2 * j ] = 1.0;
	}
	info = ndarrayFn( 'compute-v', M, N, a, 1, M, 0, d, 1, 0, sva, 1, 0, 0, V, 1, N, 0, EPS, SFMIN, 1.0e-13, ( opts.nsweep === void 0 ) ? 30 : opts.nsweep, work, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, ( opts.info === void 0 ) ? 0 : opts.info, 'info' );

	// A_out = A_in * V_out (in units of max|A_in|):
	for ( j = 0; j < N && opts.prod !== null; j++ ) {
		for ( i = 0; i < M; i++ ) {
			avr = 0.0;
			avi = 0.0;
			for ( k = 0; k < N; k++ ) {
				ia = 2 * ( ( k * M ) + i );
				iv = 2 * ( ( j * N ) + k );
				avr += ( ( a0[ ia ] / s ) * vR[ iv ] ) - ( ( a0[ ia + 1 ] / s ) * vR[ iv + 1 ] );
				avi += ( ( a0[ ia ] / s ) * vR[ iv + 1 ] ) + ( ( a0[ ia + 1 ] / s ) * vR[ iv ] );
			}
			ia = 2 * ( ( j * M ) + i );
			assert.ok( Math.abs( ( aR[ ia ] / s ) - avr ) <= opts.prod, 'Re A_out = A_in*V_out at (' + i + ',' + j + ')' );
			assert.ok( Math.abs( ( aR[ ia + 1 ] / s ) - avi ) <= opts.prod, 'Im A_out = A_in*V_out at (' + i + ',' + j + ')' );
		}
	}

	// V_out is unitary and D_out is unimodular:
	for ( j = 0; j < N; j++ ) {
		for ( k = 0; k < N; k++ ) {
			avr = 0.0;
			avi = 0.0;
			for ( i = 0; i < N; i++ ) {
				ia = 2 * ( ( j * N ) + i );
				iv = 2 * ( ( k * N ) + i );
				avr += ( vR[ ia ] * vR[ iv ] ) + ( vR[ ia + 1 ] * vR[ iv + 1 ] );
				avi += ( vR[ ia ] * vR[ iv + 1 ] ) - ( vR[ ia + 1 ] * vR[ iv ] );
			}
			assert.ok( Math.abs( avr - ( ( j === k ) ? 1.0 : 0.0 ) ) <= opts.orth && Math.abs( avi ) <= opts.orth, 'V^H V = I at (' + j + ',' + k + ')' );
		}
		assertClose( Math.hypot( dR[ 2 * j ], dR[ ( 2 * j ) + 1 ] ), 1.0, 1e-12, '|d[' + j + ']|' );
	}

	// SVA(j) = ||A_out(:,j)||, sorted non-increasingly:
	for ( j = 0; j < N; j++ ) {
		avr = colNorm( aR, M, j );
		assert.ok( Math.abs( sva[ j ] - avr ) <= opts.sva * avr, 'sva[' + j + ']: ' + sva[ j ] + ' vs ' + avr );
		if ( j > 0 ) {
			assert.ok( sva[ j ] <= sva[ j - 1 ], 'sva sorted at ' + j );
		}
	}

	// Columns of A_out are mutually orthogonal (skipped when `opts.cos` is `null`, i.e. the sweeps were exhausted):
	maxcos = 0.0;
	for ( j = 0; j < N && opts.cos !== null; j++ ) {
		for ( k = j + 1; k < N; k++ ) {
			if ( sva[ j ] === 0.0 || sva[ k ] === 0.0 ) {
				continue;
			}
			mj = colMax( aR, M, j );
			mk = colMax( aR, M, k );
			avr = 0.0;
			avi = 0.0;
			for ( i = 0; i < M; i++ ) {
				ia = 2 * ( ( j * M ) + i );
				iv = 2 * ( ( k * M ) + i );
				avr += ( ( aR[ ia ] / mj ) * ( aR[ iv ] / mk ) ) + ( ( aR[ ia + 1 ] / mj ) * ( aR[ iv + 1 ] / mk ) );
				avi += ( ( aR[ ia ] / mj ) * ( aR[ iv + 1 ] / mk ) ) - ( ( aR[ ia + 1 ] / mj ) * ( aR[ iv ] / mk ) );
			}
			maxcos = Math.max( maxcos, Math.hypot( avr, avi ) / ( ( colNorm( aR, M, j ) / mj ) * ( colNorm( aR, M, k ) / mk ) ) ); // eslint-disable-line max-len
		}
	}
	assert.ok( opts.cos === null || maxcos <= opts.cos, 'columns orthogonal: max |cos| = ' + maxcos );
	return {
		'a': aR,
		'sva': sva,
		'V': vR
	};
}

test( 'base: returns the reference INFO for invalid arguments', function t() {
	const a = new Complex128Array( 4 );
	const d = new Complex128Array( 2 );
	const sva = new Float64Array( 2 );
	const V = new Complex128Array( 4 );
	const work = new Complex128Array( 2 );
	assert.equal( base( 'bogus', 2, 2, a, 1, 2, 0, d, 1, 0, sva, 1, 0, 0, V, 1, 2, 0, EPS, SFMIN, TOL, 1, work, 1, 0 ), -1, 'invalid jobv' ); // eslint-disable-line max-len
	assert.equal( base( 'no-v', -1, 2, a, 1, 2, 0, d, 1, 0, sva, 1, 0, 0, V, 1, 2, 0, EPS, SFMIN, TOL, 1, work, 1, 0 ), -2, 'negative M' ); // eslint-disable-line max-len
	assert.equal( base( 'no-v', 1, 2, a, 1, 2, 0, d, 1, 0, sva, 1, 0, 0, V, 1, 2, 0, EPS, SFMIN, TOL, 1, work, 1, 0 ), -3, 'N > M' ); // eslint-disable-line max-len
	assert.equal( base( 'no-v', 2, -1, a, 1, 2, 0, d, 1, 0, sva, 1, 0, 0, V, 1, 2, 0, EPS, SFMIN, TOL, 1, work, 1, 0 ), -3, 'negative N' ); // eslint-disable-line max-len
	assert.equal( base( 'apply-v', 2, 2, a, 1, 2, 0, d, 1, 0, sva, 1, 0, -1, V, 1, 2, 0, EPS, SFMIN, TOL, 1, work, 1, 0 ), -14, 'negative mv' ); // eslint-disable-line max-len
	assert.equal( base( 'no-v', 2, 2, a, 1, 2, 0, d, 1, 0, sva, 1, 0, 0, V, 1, 2, 0, EPS, SFMIN, EPS, 1, work, 1, 0 ), -19, 'tol <= eps' ); // eslint-disable-line max-len
	assert.equal( base( 'no-v', 2, 2, a, 1, 2, 0, d, 1, 0, sva, 1, 0, 0, V, 1, 2, 0, EPS, SFMIN, TOL, -1, work, 1, 0 ), -22, 'negative nsweep' ); // eslint-disable-line max-len
	assert.equal( base( 'no-v', 3, 2, new Complex128Array( 6 ), 1, 3, 0, d, 1, 0, sva, 1, 0, 0, V, 1, 2, 0, EPS, SFMIN, TOL, 1, work, 1, 0 ), -26, 'work shorter than M' ); // eslint-disable-line max-len
});

test( 'ndarray: huge columns (norms above sqrt(big)) use the scaled dot product and zlassq', function t() {
	let src;
	let i;
	for ( i = 0; i < 2; i++ ) {
		src = genMatrix( [ 5, 12 ][ i ], [ 4, 10 ][ i ], 1 ).map( function scale( x ) {
			return x * 1e160;
		});
		runAndCheck( src, [ 5, 12 ][ i ], [ 4, 10 ][ i ], {
			'prod': 1e-12,
			'orth': 1e-12,
			'sva': 1e-12,
			'cos': 1e-12
		});
	}
});

test( 'ndarray: tiny columns (norms below sqrt(sfmin)) use the scaled dot product and zlassq', function t() {
	let src;
	let i;
	for ( i = 0; i < 2; i++ ) {
		src = genMatrix( [ 5, 12 ][ i ], [ 4, 10 ][ i ], 2 ).map( function scale( x ) {
			return x * 1e-160;
		});
		runAndCheck( src, [ 5, 12 ][ i ], [ 4, 10 ][ i ], {
			'prod': 1e-12,
			'orth': 1e-12,
			'sva': 1e-12,
			'cos': 1e-12
		});
	}
});

test( 'ndarray: Gram-Schmidt step for columns with a norm ratio beyond 1/small (N=2 closed form)', function t() {
	let out;
	let dre;
	let dim;
	let nrm;
	let pr;
	let pi;
	let qr;
	let qi;
	let i;
	const src = genMatrix( 3, 2, 5 );
	scaleColumn( src, 3, 0, 1e150 );
	scaleColumn( src, 3, 1, 1e-150 );
	out = runAndCheck( src, 3, 2, {
		'prod': null,
		'orth': 0.0,
		'sva': 1e-14,
		'cos': 1e-14
	});

	// The huge column p is untouched and the tiny one becomes q - (p^H q / p^H p) p:
	nrm = 0.0;
	dre = 0.0;
	dim = 0.0;
	for ( i = 0; i < 3; i++ ) {
		pr = src[ 2 * i ] / 1e150;
		pi = src[ ( 2 * i ) + 1 ] / 1e150;
		qr = src[ 6 + ( 2 * i ) ] * 1e150;
		qi = src[ 7 + ( 2 * i ) ] * 1e150;
		nrm += ( pr * pr ) + ( pi * pi );
		dre += ( pr * qr ) + ( pi * qi );
		dim += ( pr * qi ) - ( pi * qr );
	}
	for ( i = 0; i < 3; i++ ) {
		pr = src[ 2 * i ] / 1e150;
		pi = src[ ( 2 * i ) + 1 ] / 1e150;
		assert.equal( out.a[ 2 * i ], src[ 2 * i ], 'Re p unchanged' );
		assert.equal( out.a[ ( 2 * i ) + 1 ], src[ ( 2 * i ) + 1 ], 'Im p unchanged' );
		assertClose( out.a[ 6 + ( 2 * i ) ] * 1e150, ( src[ 6 + ( 2 * i ) ] * 1e150 ) - ( ( ( dre * pr ) - ( dim * pi ) ) / nrm ), 1e-14, 'Re q' );
		assertClose( out.a[ 7 + ( 2 * i ) ] * 1e150, ( src[ 7 + ( 2 * i ) ] * 1e150 ) - ( ( ( dre * pi ) + ( dim * pr ) ) / nrm ), 1e-14, 'Im q' );
	}
	assert.deepEqual( Array.from( out.V ), [ 1.0, 0.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0 ], 'V unchanged by the Gram-Schmidt step' );
});

test( 'ndarray: Gram-Schmidt steps in the off-diagonal blocks orthogonalize the columns', function t() {
	const src = genMatrix( 12, 10, 4 );
	scaleColumn( src, 12, 0, 1e-150 );
	scaleColumn( src, 12, 1, 1e150 );
	scaleColumn( src, 12, 8, 1e-150 );
	scaleColumn( src, 12, 9, 1e150 );
	runAndCheck( src, 12, 10, {
		'prod': null,
		'orth': 1e-12,
		'sva': 1e-12,
		'cos': 1e-12
	});
});

test( 'ndarray: nearly parallel columns recompute SVA after cancellation (dznrm2 and zlassq paths)', function t() {
	let scale;
	let src;
	let i;
	for ( scale = 1.0; scale <= 1e160; scale *= 1e160 ) {
		src = genMatrix( 6, 4, 6 );
		for ( i = 0; i < 12; i++ ) {
			src[ 12 + i ] = src[ i ] * ( 1.0 + ( 1e-8 * ( ( i >> 1 ) % 3 ) ) );
			src[ 36 + i ] = src[ 24 + i ] + ( 1e-8 * ( ( i * 5 ) % 7 ) );
		}
		for ( i = 0; i < src.length; i++ ) {
			src[ i ] *= scale;
		}
		runAndCheck( src, 6, 4, {
			'prod': 1e-12,
			'orth': 1e-9,
			'sva': 1e-8,
			'cos': 1e-6
		});
	}
});

test( 'ndarray: zero columns are skipped and sorted last', function t() {
	let out;
	let src;
	src = genMatrix( 6, 5, 7 );
	scaleColumn( src, 6, 2, 0.0 );
	out = runAndCheck( src, 6, 5, {
		'prod': 1e-12,
		'orth': 1e-12,
		'sva': 1e-12,
		'cos': 1e-12
	});
	assert.equal( out.sva[ 4 ], 0.0, 'zero column sorted last' );
	src = genMatrix( 12, 10, 7 );
	scaleColumn( src, 12, 1, 0.0 );
	scaleColumn( src, 12, 4, 0.0 );
	scaleColumn( src, 12, 6, 0.0 );
	out = runAndCheck( src, 12, 10, {
		'prod': 1e-12,
		'orth': 1e-12,
		'sva': 1e-12,
		'cos': 1e-12
	});
	assert.deepEqual( Array.from( out.sva.slice( 7 ) ), [ 0.0, 0.0, 0.0 ], 'zero columns sorted last' );
});

test( 'ndarray: returns INFO = NSWEEP-1 when the sweeps are exhausted, and sorts the columns by SVA', function t() {
	let nsweep;

	// A single sweep leaves SVA unsorted, so the final sort swaps columns:
	for ( nsweep = 1; nsweep <= 3; nsweep++ ) {
		runAndCheck( genMatrix( 12, 10, 1 ), 12, 10, {
			'prod': 1e-12,
			'orth': 1e-12,
			'sva': 1e-12,
			'cos': null,
			'nsweep': nsweep,
			'info': nsweep - 1
		});
	}
});

test( 'ndarray: work shorter than the reference minimum M throws RangeError; at exactly M (NaN-poisoned, offset) the result matches an ample workspace', function t() {
	const M = 7;
	const N = 4;
	const off = 3;
	let ample;
	let exact;
	let i;

	/**
	* Runs zgsvj0 on a fixed M-by-N matrix with the given workspace.
	*
	* @private
	* @param {Complex128Array} work - workspace
	* @param {NonNegativeInteger} ow - workspace offset
	* @returns {Object} outputs
	*/
	function run( work, ow ) {
		const A = new Complex128Array( M * N );
		const Av = reinterpret( A, 0 );
		const d = new Complex128Array( N );
		const dv = reinterpret( d, 0 );
		const sva = new Float64Array( N );
		const V = new Complex128Array( N * N );
		const Vv = reinterpret( V, 0 );
		let j;
		let k;
		for ( k = 0; k < Av.length; k++ ) {
			Av[ k ] = Math.sin( ( 3 * k ) + 1 ) + ( ( k % 5 ) * 0.25 );
		}
		for ( j = 0; j < N; j++ ) {
			dv[ 2 * j ] = 1.0;
			Vv[ 2 * ( j + ( j * N ) ) ] = 1.0;
			sva[ j ] = 0.0;
			for ( k = 0; k < 2 * M; k++ ) {
				sva[ j ] += Av[ ( 2 * j * M ) + k ] * Av[ ( 2 * j * M ) + k ];
			}
			sva[ j ] = Math.sqrt( sva[ j ] );
		}
		const info = ndarrayFn( 'compute-v', M, N, A, 1, M, 0, d, 1, 0, sva, 1, 0, N, V, 1, N, 0, EPS, SFMIN, TOL, 3, work, 1, ow );
		return {
			'info': info,
			'A': Array.from( Av ),
			'd': Array.from( dv ),
			'sva': Array.from( sva ),
			'V': Array.from( Vv )
		};
	}

	assert.throws( function bad() {
		run( new Complex128Array( off + M - 1 ), off );
	}, RangeError );
	ample = run( new Complex128Array( M + 20 ), 0 );
	const work = new Complex128Array( off + M );
	const wv = reinterpret( work, 0 );
	for ( i = 0; i < wv.length; i++ ) {
		wv[ i ] = NaN;
	}
	exact = run( work, off );
	assert.deepEqual( exact, ample, 'same result at the minimum' );
	assert.ok( Number.isNaN( wv[ 0 ] ), 'nothing written before the offset' );
	for ( i = 0; i < ample.sva.length; i++ ) {
		assert.ok( Number.isFinite( ample.sva[ i ] ), 'finite' );
	}
});


// Reference fixtures for the scaling, rotation, Gram-Schmidt, zero-column, cancellation and sweep-exhaustion branches (ticket 0110). //

/**
* Asserts that `actual` matches `expected` column by column (interleaved re/im, `rows` doubles per column), each column relative to its largest expected entry.
*
* @private
* @param {Array} actual - actual values
* @param {Array} expected - expected values
* @param {integer} rows - doubles per column
* @param {integer} cols - number of columns
* @param {number} tol - relative tolerance
* @param {string} msg - message
*/
function assertColumnsClose( actual, expected, rows, cols, tol, msg ) {
	let err;
	let s;
	let i;
	let j;
	for ( j = 0; j < cols; j++ ) {
		s = 0.0;
		for ( i = 0; i < rows; i++ ) {
			s = Math.max( s, Math.abs( expected[ ( j * rows ) + i ] ) );
		}
		for ( i = 0; i < rows; i++ ) {
			err = Math.abs( actual[ ( j * rows ) + i ] - expected[ ( j * rows ) + i ] );
			assert.ok( err <= tol * s, msg + '(' + i + ',' + j + '): expected ' + expected[ ( j * rows ) + i ] + ', got ' + actual[ ( j * rows ) + i ] );
		}
	}
}

/**
* Returns the moduli of interleaved complex values.
*
* @private
* @param {Array} v - interleaved re/im values
* @returns {Array} moduli
*/
function moduli( v ) {
	let i;
	const out = [];
	for ( i = 0; i < v.length; i += 2 ) {
		out.push( Math.hypot( v[ i ], v[ i + 1 ] ) );
	}
	return out;
}

/**
* Places complex `values` (interleaved re/im) at element `offset + i*stride` of a NaN-filled Complex128Array with `pad` trailing elements.
*
* @private
* @param {Array} values - interleaved re/im values
* @param {NonNegativeInteger} offset - index of the first element
* @param {PositiveInteger} stride - stride (in complex elements)
* @param {NonNegativeInteger} pad - trailing elements past the last value
* @returns {Complex128Array} buffer
*/
function embedZ( values, offset, stride, pad ) {
	let i;
	const n = values.length / 2;
	const out = new Complex128Array( offset + ( ( n - 1 ) * stride ) + 1 + pad );
	const v = reinterpret( out, 0 );
	v.fill( NaN );
	for ( i = 0; i < n; i++ ) {
		v[ 2 * ( offset + ( i * stride ) ) ] = values[ 2 * i ];
		v[ ( 2 * ( offset + ( i * stride ) ) ) + 1 ] = values[ ( 2 * i ) + 1 ];
	}
	return out;
}

/**
* Extracts `n` complex values (interleaved) at element `offset + i*stride` from a buffer made by `embedZ`, and asserts that every other element is still NaN.
*
* @private
* @param {Complex128Array} buf - buffer
* @param {NonNegativeInteger} n - number of complex values
* @param {NonNegativeInteger} offset - index of the first element
* @param {PositiveInteger} stride - stride
* @param {string} msg - message
* @returns {Array} interleaved values
*/
function extractZ( buf, n, offset, stride, msg ) {
	let i;
	const v = reinterpret( buf, 0 );
	const out = [];
	for ( i = 0; i < buf.length; i++ ) {
		if ( i >= offset && ( i - offset ) % stride === 0 && ( i - offset ) / stride < n ) {
			out.push( v[ 2 * i ], v[ ( 2 * i ) + 1 ] );
		} else {
			assert.ok( Number.isNaN( v[ 2 * i ] ) && Number.isNaN( v[ ( 2 * i ) + 1 ] ), msg + ': element ' + i + ' outside the array overwritten' );
		}
	}
	return out;
}

/**
* Asserts that two arrays are identical, bit for bit.
*
* @private
* @param {Array} actual - actual values
* @param {Array} expected - expected values
* @param {string} msg - message
*/
function assertIdentical( actual, expected, msg ) {
	let i;
	assert.equal( actual.length, expected.length, msg + ': length' );
	for ( i = 0; i < expected.length; i++ ) {
		assert.ok( Object.is( actual[ i ], expected[ i ] ), msg + '[' + i + ']: expected ' + expected[ i ] + ', got ' + actual[ i ] );
	}
}

test( 'ndarray: matches the reference (A, V, D, SVA, INFO) on every ref* fixture, in offset and strided storage, writing nothing outside each array', function t() {
	const JOBV = {
		'V': 'compute-v',
		'A': 'apply-v',
		'N': 'no-v'
	};

	// Cases this build reproduces bit for bit (by name without its `ref`, `ref1` or `ref2` prefix, plus full names); the others agree to rounding:
	const EXACT = [ 'gs_n2', 'offdiag_larger_unit', 'offdiag_larger_huge', 'offdiag_larger_tiny', 'offdiag_larger_small', 'offdiag_smaller_huge', 'offdiag_smaller_tiny', 'gs_first_if', 'gs_first_else', 'nsweep0', 'conv_sweep1', 'ref1_par9_1blk_tiny', 'ref1_offdiag_smaller_unit' ]; // eslint-disable-line max-len
	const cases = fixture.filter( function ref( tc ) {
		return tc.name.indexOf( 'ref' ) === 0;
	});
	let vrows;
	let info;
	let ill;
	let out;
	let tol;
	let tc;
	let k;
	assert.equal( cases.length, 117, 'number of reference cases' );
	for ( k = 0; k < cases.length; k++ ) {
		tc = cases[ k ];

		// Nearly parallel columns amplify rounding differences (by up to 1e9 for the 1e-9 perturbations), and the phases of D with them:
		ill = ( tc.name.indexOf( '_par' ) !== -1 || tc.name.indexOf( 'phase_small' ) !== -1 );
		tol = ( ill ) ? 1e-6 : 1e-12;
		const a = embedZ( tc.a0, 2, 1, 3 );
		const d = embedZ( tc.d0, 1, 2, 2 );
		const sva = new Float64Array( 3 + tc.N + 2 );
		sva.fill( NaN );
		sva.set( tc.sva0, 3 );
		const V = embedZ( tc.v0, 1, 1, 3 );
		const work = new Complex128Array( tc.M );
		info = ndarrayFn( JOBV[ tc.jobv ], tc.M, tc.N, a, 1, tc.M, 2, d, 2, 1, sva, 1, 3, tc.mv, V, 1, tc.ldv, 1, EPS, SFMIN, tc.tol, tc.nsweep, work, 1, 0 ); // eslint-disable-line max-len
		assert.equal( info, tc.info, tc.name + ': info' );
		out = {
			'a': extractZ( a, tc.a0.length / 2, 2, 1, tc.name + ': A' ),
			'd': extractZ( d, tc.N, 1, 2, tc.name + ': d' ),
			'sva': Array.from( sva.slice( 3, 3 + tc.N ) ),
			'v': extractZ( V, tc.v0.length / 2, 1, 1, tc.name + ': V' )
		};
		assert.ok( Number.isNaN( sva[ 2 ] ) && Number.isNaN( sva[ 3 + tc.N ] ), tc.name + ': nothing written next to sva' );
		if ( EXACT.indexOf( tc.name.slice( tc.name.indexOf( '_' ) + 1 ) ) !== -1 || EXACT.indexOf( tc.name ) !== -1 ) {
			assertIdentical( out.a, tc.a, tc.name + ': A' );
			assertIdentical( out.d, tc.d, tc.name + ': d' );
			assertIdentical( out.sva, tc.sva, tc.name + ': sva' );
			assertIdentical( out.v, tc.v, tc.name + ': V' );
			continue;
		}
		assertColumnsClose( out.a, tc.a, 2 * tc.M, tc.N, tol, tc.name + ': A' );
		assertColumnsClose( out.sva, tc.sva, 1, tc.N, tol, tc.name + ': sva' );
		if ( tc.jobv !== 'N' ) {
			vrows = ( tc.jobv === 'V' ) ? tc.N : tc.mv;
			assertColumnsClose( out.v, tc.v, 2 * vrows, tc.N, tol, tc.name + ': V' );
		}

		// D(p) = -D(q)*OMPQ takes the phase of each rotation's AAPQ, which in a converged run (or with nearly parallel columns) is the phase of an inner product dominated by rounding, so only the moduli are well conditioned there:
		if ( tc.nsweep === 30 || ill ) {
			assertColumnsClose( moduli( out.d ), moduli( tc.d ), 1, tc.N, 1e-12, tc.name + ': |d|' );
		} else {
			assertColumnsClose( out.d, tc.d, 2, tc.N, 1e-10, tc.name + ': d' );
		}
	}
});

test( 'ndarray: N = 0 returns 0 and writes nothing, also at nonzero offsets (regression: it wrote SVA(0), outside the array)', function t() {
	const sva = new Float64Array( [ 7.0, 7.0, 7.0 ] );
	const d = new Complex128Array( [ 5.0, 1.0, 5.0, 1.0, 5.0, 1.0 ] );
	const info = ndarrayFn( 'compute-v', 2, 0, new Complex128Array( 4 ), 1, 2, 2, d, 1, 1, sva, 1, 2, 0, new Complex128Array( 2 ), 1, 1, 1, EPS, SFMIN, TOL, 3, new Complex128Array( 2 ), 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, 0, 'info' );
	assert.deepEqual( Array.from( sva ), [ 7.0, 7.0, 7.0 ], 'sva untouched' );
	assert.deepEqual( Array.from( reinterpret( d, 0 ) ), [ 5.0, 1.0, 5.0, 1.0, 5.0, 1.0 ], 'd untouched' );
});

test( 'base: M = 0 and N = 0 returns 0', function t() {
	const sva = new Float64Array( [ 7.0, 7.0 ] );
	const info = base( 'no-v', 0, 0, new Complex128Array( 1 ), 1, 1, 0, new Complex128Array( 1 ), 1, 0, sva, 1, 1, 0, new Complex128Array( 1 ), 1, 1, 0, EPS, SFMIN, TOL, 3, new Complex128Array( 1 ), 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, 0, 'info' );
	assert.deepEqual( Array.from( sva ), [ 7.0, 7.0 ], 'sva untouched' );
});
