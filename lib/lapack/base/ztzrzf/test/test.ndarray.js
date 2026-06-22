/**
* @license Apache-2.0
*
* Copyright (c) 2025 The Stdlib Authors.
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

/* eslint-disable no-restricted-syntax, stdlib/first-unit-test, max-len, max-params, max-statements, max-lines */

// MODULES //

import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import test from 'node:test';
import assert from 'node:assert/strict';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import ndarray from './../lib/ndarray.js';


// FIXTURES //

var FIXTURE_PATH = resolve( import.meta.dirname, '..', '..', '..', '..', '..', 'test', 'fixtures', 'ztzrzf.jsonl' );
var RAW = readFileSync( FIXTURE_PATH, 'utf8' );
var LINES = RAW.trim().split( '\n' );
var FIXTURES = LINES.map( parseLine );


// VARIABLES //

var FIXTURE_LDA = 200; // matches NMAX in test_ztzrzf.f90


// FUNCTIONS //

/**
* Parses a JSONL line.
*
* @private
* @param {string} line - JSONL line
* @returns {Object} parsed fixture object
*/
function parseLine( line ) {
	return JSON.parse( line );
}

/**
* Looks up a fixture by name.
*
* @private
* @param {string} name - fixture name
* @returns {Object} fixture
*/
function findCase( name ) {
	var i;
	for ( i = 0; i < FIXTURES.length; i++ ) {
		if ( FIXTURES[ i ].name === name ) {
			return FIXTURES[ i ];
		}
	}
	return null;
}

/**
* Converts a typed array (or array-like) to a plain array.
*
* @private
* @param {Object} arr - input array
* @returns {Array} output array
*/
function toArray( arr ) {
	var out;
	var i;
	out = [];
	for ( i = 0; i < arr.length; i++ ) {
		out.push( arr[ i ] );
	}
	return out;
}

/**
* Asserts that two real arrays agree elementwise within tolerance.
*
* @private
* @param {Array} actual - actual values
* @param {Array} expected - expected values
* @param {number} tol - tolerance
* @param {string} msg - message
*/
function assertArrayClose( actual, expected, tol, msg ) {
	var denom;
	var rel;
	var i;
	assert.equal( actual.length, expected.length, msg + ': length mismatch' );
	for ( i = 0; i < expected.length; i++ ) {
		denom = Math.max( Math.abs( expected[ i ] ), 1.0 );
		rel = Math.abs( actual[ i ] - expected[ i ] ) / denom;
		assert.ok( rel <= tol, msg + '[' + i + ']: expected ' + expected[ i ] + ', got ' + actual[ i ] );
	}
}

/**
* Asserts two scalars agree within a relative tolerance.
*
* @private
* @param {number} actual - observed value
* @param {number} expected - expected value
* @param {number} tol - relative tolerance
* @param {string} msg - failure message
*/
function assertClose( actual, expected, tol, msg ) {
	var rel = Math.abs( actual - expected ) / Math.max( Math.abs( expected ), 1.0 );
	assert.ok( rel <= tol, msg + ': expected ' + expected + ', got ' + actual );
}

/**
* Packs an M-by-N column-major Complex128Array view into a plain interleaved array (length `2*M*N`) for fixture comparison. The source buffer may have leading dimension `lda` larger than M.
*
* @private
* @param {Complex128Array} A - source matrix
* @param {NonNegativeInteger} M - rows
* @param {NonNegativeInteger} N - cols
* @param {NonNegativeInteger} lda - leading dimension (in complex elements)
* @returns {Array} packed real/imag interleaved values
*/
function packComplexBlock( A, M, N, lda ) {
	var out;
	var idx;
	var v;
	var i;
	var j;
	v = reinterpret( A, 0 );
	out = [];
	for ( j = 0; j < N; j++ ) {
		for ( i = 0; i < M; i++ ) {
			idx = ( ( j * lda ) + i ) * 2;
			out.push( v[ idx ] );
			out.push( v[ idx + 1 ] );
		}
	}
	return out;
}

/**
* Builds an M-by-N column-major Complex128Array from a row-major list of entries.
*
* @private
* @param {NonNegativeInteger} M - rows
* @param {NonNegativeInteger} N - cols
* @param {NonNegativeInteger} lda - leading dimension (in complex elements)
* @param {Array} entries - array of `[i, j, re, im]` entries (1-indexed Fortran-style)
* @returns {Complex128Array} buffer (length `lda*N`)
*/
function buildSourceA( M, N, lda, entries ) {
	var A;
	var v;
	var i;
	var k;
	A = new Complex128Array( lda * N );
	v = reinterpret( A, 0 );
	for ( i = 0; i < entries.length; i++ ) {
		k = ( ( entries[ i ][ 0 ] - 1 ) + ( ( entries[ i ][ 1 ] - 1 ) * lda ) ) * 2;
		v[ k ] = entries[ i ][ 2 ];
		v[ k + 1 ] = entries[ i ][ 3 ];
	}
	return A;
}

/**
* Builds the upper trapezoidal matrix used by the `large_40x80` fixture (matching the Fortran generator pattern).
*
* @private
* @param {NonNegativeInteger} M - rows
* @param {NonNegativeInteger} N - cols
* @param {NonNegativeInteger} lda - leading dimension (in complex elements)
* @returns {Complex128Array} buffer
*/
function buildLargeFixtureMatrix( M, N, lda ) {
	var A;
	var v;
	var i;
	var j;
	var k;
	A = new Complex128Array( lda * N );
	v = reinterpret( A, 0 );
	for ( j = 0; j < N; j++ ) {
		for ( i = 0; i < M; i++ ) {
			if ( j >= i ) {
				k = ( ( j * lda ) + i ) * 2;
				if ( i === j ) {
					v[ k ] = 10.0 + ( i + 1 );
					v[ k + 1 ] = 0.1 * ( i + 1 );
				} else {
					v[ k ] = 1.0 / ( ( j - i ) + 1 );
					v[ k + 1 ] = 0.05 * ( j - i );
				}
			}
		}
	}
	return A;
}

/**
* Reconstructs `A = R*Z` given the factored output of ztzrzf. Returns the reconstructed matrix in row-major order (interleaved complex, length `2*M*N`).
*
* The reflectors are `H(k) = I - tau(k) * v(k) * v(k)^H` where `v(k)` has a unit leading element at position k and tail entries at columns `[M, M+L-1]`.
*
* @private
* @param {NonNegativeInteger} M - rows
* @param {NonNegativeInteger} N - cols
* @param {Complex128Array} A - factored matrix (column-major, leading dim `lda`)
* @param {NonNegativeInteger} lda - leading dimension (in complex elements)
* @param {Complex128Array} TAU - reflector scalar factors (length M)
* @returns {Array} reconstructed matrix in row-major (re, im interleaved)
*/
function reconstructA( M, N, A, lda, TAU ) {
	var aIdx;
	var vIdx;
	var dotR;
	var dotI;
	var tauR;
	var tauI;
	var out;
	var av;
	var tv;
	var pR;
	var pI;
	var vr;
	var vi;
	var L;
	var i;
	var j;
	var k;
	var r;

	av = reinterpret( A, 0 );
	tv = reinterpret( TAU, 0 );
	L = N - M;
	out = [];
	for ( i = 0; i < 2 * M * N; i++ ) {
		out.push( 0.0 );
	}

	// Initialize `out` (row-major) with R in the leading M-by-M block (column j has nonzeros for i <= j).
	for ( j = 0; j < M; j++ ) {
		for ( i = 0; i <= j; i++ ) {
			aIdx = ( ( j * lda ) + i ) * 2;
			out[ ( ( i * N ) + j ) * 2 ] = av[ aIdx ];
			out[ ( ( ( i * N ) + j ) * 2 ) + 1 ] = av[ aIdx + 1 ];
		}
	}

	// Apply H(0), H(1), ..., H(M-1) on the right (Z = H(0)*H(1)*...*H(M-1)). Each H(k) = I - tau(k) * v(k) * v(k)^H. v(k) has 1 at position k and tail entries v(M+j) = A[k, M+j] (in column-major buffer: offset = ((M+j)*lda + k)*2). For a row vector y: y*H = y - tau*(y*v)*v^H, so dot = y(k) + sum_j y(M+j)*v(M+j) (no conjugation in the dot), and we subtract tau*dot * conj(v(M+j)) from y(M+j).
	for ( k = 0; k < M; k++ ) {
		tauR = tv[ k * 2 ];
		tauI = tv[ ( k * 2 ) + 1 ];
		if ( tauR === 0.0 && tauI === 0.0 ) {
			continue;
		}
		for ( r = 0; r < M; r++ ) {
			pR = ( ( r * N ) + k ) * 2;
			dotR = out[ pR ];
			dotI = out[ pR + 1 ];
			for ( j = 0; j < L; j++ ) {
				vIdx = ( ( ( M + j ) * lda ) + k ) * 2;
				vr = av[ vIdx ];
				vi = av[ vIdx + 1 ];
				pI = ( ( r * N ) + M + j ) * 2;
				dotR += ( out[ pI ] * vr ) - ( out[ pI + 1 ] * vi );
				dotI += ( out[ pI ] * vi ) + ( out[ pI + 1 ] * vr );
			}

			// Scale dot by tau (NOT yet by v): vr + i*vi = tau * dot
			vr = ( tauR * dotR ) - ( tauI * dotI );
			vi = ( tauR * dotI ) + ( tauI * dotR );

			// Subtract from y(k): v(k) = 1, conj(v(k)) = 1.
			out[ pR ] -= vr;
			out[ pR + 1 ] -= vi;

			// Subtract tau*dot * conj(v(M+j)) from y(M+j).
			for ( j = 0; j < L; j++ ) {
				vIdx = ( ( ( M + j ) * lda ) + k ) * 2;
				dotR = av[ vIdx ];
				dotI = -av[ vIdx + 1 ]; // conj(v(M+j))
				pI = ( ( r * N ) + M + j ) * 2;
				out[ pI ] -= ( vr * dotR ) - ( vi * dotI );
				out[ pI + 1 ] -= ( vr * dotI ) + ( vi * dotR );
			}
		}
	}
	return out;
}


// TESTS //

test( 'ztzrzf (ndarray) is a function', function t() {
	assert.strictEqual( typeof ndarray, 'function', 'is a function' );
});

test( 'ztzrzf (ndarray): throws RangeError for negative M', function t() {
	assert.throws( function throws() {
		ndarray( -1, 5, new Complex128Array( 5 ), 1, 1, 0, new Complex128Array( 1 ), 1, 0, new Complex128Array( 1 ), 1, 0 );
	}, RangeError );
});

test( 'ztzrzf (ndarray): throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		ndarray( 2, -1, new Complex128Array( 4 ), 1, 2, 0, new Complex128Array( 2 ), 1, 0, new Complex128Array( 2 ), 1, 0 );
	}, RangeError );
});

test( 'ztzrzf (ndarray): throws RangeError for N < M', function t() {
	assert.throws( function throws() {
		ndarray( 4, 2, new Complex128Array( 8 ), 1, 4, 0, new Complex128Array( 4 ), 1, 0, new Complex128Array( 8 ), 1, 0 );
	}, RangeError );
});

test( 'ztzrzf: m_zero (M = 0 quick return)', function t() {
	var WORK;
	var info;
	var TAU;
	var A;
	A = new Complex128Array( FIXTURE_LDA * 5 );
	TAU = new Complex128Array( 1 );
	WORK = new Complex128Array( 1 );
	info = ndarray( 0, 5, A, 1, FIXTURE_LDA, 0, TAU, 1, 0, WORK, 1, 0 );
	assert.equal( info, 0, 'INFO' );
});

test( 'ztzrzf: m_n_zero (M = N = 0)', function t() {
	var WORK;
	var info;
	var TAU;
	var A;
	A = new Complex128Array( 1 );
	TAU = new Complex128Array( 1 );
	WORK = new Complex128Array( 1 );
	info = ndarray( 0, 0, A, 1, 1, 0, TAU, 1, 0, WORK, 1, 0 );
	assert.equal( info, 0, 'INFO' );
});

test( 'ztzrzf: 3x5', function t() {
	var WORK;
	var info;
	var TAU;
	var tc;
	var A;
	tc = findCase( '3x5' );
	A = buildSourceA( 3, 5, FIXTURE_LDA, [
		[ 1, 1, 4.0, 0.5 ],
		[ 1, 2, 1.0, -0.2 ],
		[ 1, 3, 2.0, 0.3 ],
		[ 1, 4, 3.0, 0.1 ],
		[ 1, 5, 1.0, -0.4 ],
		[ 2, 2, 5.0, 0.3 ],
		[ 2, 3, 1.0, 0.1 ],
		[ 2, 4, 2.0, 0.2 ],
		[ 2, 5, 4.0, -0.5 ],
		[ 3, 3, 6.0, 0.4 ],
		[ 3, 4, 1.0, -0.2 ],
		[ 3, 5, 2.0, 0.6 ]
	]);
	TAU = new Complex128Array( 3 );
	WORK = new Complex128Array( 3 * 32 );
	info = ndarray( 3, 5, A, 1, FIXTURE_LDA, 0, TAU, 1, 0, WORK, 1, 0 );
	assert.equal( info, 0, 'INFO' );
	assertArrayClose( packComplexBlock( A, 3, 5, FIXTURE_LDA ), tc.A, 1e-13, 'A' );
	assertArrayClose( toArray( reinterpret( TAU, 0 ) ), tc.TAU, 1e-13, 'TAU' );
});

test( 'ztzrzf: 4x6', function t() {
	var WORK;
	var info;
	var TAU;
	var tc;
	var A;
	tc = findCase( '4x6' );
	A = buildSourceA( 4, 6, FIXTURE_LDA, [
		[ 1, 1, 5.0, 0.1 ],
		[ 1, 2, 1.0, -0.3 ],
		[ 1, 3, 2.0, 0.5 ],
		[ 1, 4, 3.0, 0.2 ],
		[ 1, 5, 1.0, 0.4 ],
		[ 1, 6, 2.0, -0.1 ],
		[ 2, 2, 6.0, -0.2 ],
		[ 2, 3, 1.0, 0.3 ],
		[ 2, 4, 2.0, -0.4 ],
		[ 2, 5, 3.0, 0.1 ],
		[ 2, 6, 1.0, -0.3 ],
		[ 3, 3, 7.0, 0.4 ],
		[ 3, 4, 1.0, 0.2 ],
		[ 3, 5, 2.0, -0.5 ],
		[ 3, 6, 3.0, 0.3 ],
		[ 4, 4, 8.0, -0.1 ],
		[ 4, 5, 1.0, 0.6 ],
		[ 4, 6, 2.0, 0.2 ]
	]);
	TAU = new Complex128Array( 4 );
	WORK = new Complex128Array( 4 * 32 );
	info = ndarray( 4, 6, A, 1, FIXTURE_LDA, 0, TAU, 1, 0, WORK, 1, 0 );
	assert.equal( info, 0, 'INFO' );
	assertArrayClose( packComplexBlock( A, 4, 6, FIXTURE_LDA ), tc.A, 1e-13, 'A' );
	assertArrayClose( toArray( reinterpret( TAU, 0 ) ), tc.TAU, 1e-13, 'TAU' );
});

test( 'ztzrzf: square_3x3 (M = N)', function t() {
	var WORK;
	var info;
	var TAU;
	var tv;
	var tc;
	var A;
	var i;
	tc = findCase( 'square_3x3' );
	A = buildSourceA( 3, 3, FIXTURE_LDA, [
		[ 1, 1, 3.0, 0.5 ],
		[ 1, 2, 1.0, -0.2 ],
		[ 1, 3, 2.0, 0.3 ],
		[ 2, 2, 4.0, 0.1 ],
		[ 2, 3, 1.0, 0.4 ],
		[ 3, 3, 5.0, -0.2 ]
	]);
	TAU = new Complex128Array( 3 );
	tv = reinterpret( TAU, 0 );
	for ( i = 0; i < 6; i++ ) {
		tv[ i ] = 7.0;
	}
	WORK = new Complex128Array( 3 );
	info = ndarray( 3, 3, A, 1, FIXTURE_LDA, 0, TAU, 1, 0, WORK, 1, 0 );
	assert.equal( info, 0, 'INFO' );
	assertArrayClose( packComplexBlock( A, 3, 3, FIXTURE_LDA ), tc.A, 1e-13, 'A' );
	assertArrayClose( toArray( reinterpret( TAU, 0 ) ), tc.TAU, 1e-13, 'TAU' );
});

test( 'ztzrzf: square_4x4 (M = N)', function t() {
	var WORK;
	var info;
	var TAU;
	var tv;
	var tc;
	var A;
	var i;
	tc = findCase( 'square_4x4' );
	A = buildSourceA( 4, 4, FIXTURE_LDA, [
		[ 1, 1, 4.0, 0.2 ],
		[ 1, 2, 1.0, -0.1 ],
		[ 1, 3, 2.0, 0.3 ],
		[ 1, 4, 3.0, -0.4 ],
		[ 2, 2, 5.0, 0.4 ],
		[ 2, 3, 1.0, 0.5 ],
		[ 2, 4, 2.0, -0.2 ],
		[ 3, 3, 6.0, -0.3 ],
		[ 3, 4, 1.0, 0.1 ],
		[ 4, 4, 7.0, 0.2 ]
	]);
	TAU = new Complex128Array( 4 );
	tv = reinterpret( TAU, 0 );
	for ( i = 0; i < 8; i++ ) {
		tv[ i ] = ( i % 2 === 0 ) ? 9.9 : -1.0;
	}
	WORK = new Complex128Array( 4 );
	info = ndarray( 4, 4, A, 1, FIXTURE_LDA, 0, TAU, 1, 0, WORK, 1, 0 );
	assert.equal( info, 0, 'INFO' );
	assertArrayClose( packComplexBlock( A, 4, 4, FIXTURE_LDA ), tc.A, 1e-13, 'A' );
	assertArrayClose( toArray( reinterpret( TAU, 0 ) ), tc.TAU, 1e-13, 'TAU' );
});

test( 'ztzrzf: 1x4', function t() {
	var WORK;
	var info;
	var TAU;
	var tc;
	var A;
	tc = findCase( '1x4' );
	A = buildSourceA( 1, 4, FIXTURE_LDA, [
		[ 1, 1, 3.0, 0.7 ],
		[ 1, 2, 1.0, -0.4 ],
		[ 1, 3, 2.0, 0.5 ],
		[ 1, 4, 1.0, 0.3 ]
	]);
	TAU = new Complex128Array( 1 );
	WORK = new Complex128Array( 32 );
	info = ndarray( 1, 4, A, 1, FIXTURE_LDA, 0, TAU, 1, 0, WORK, 1, 0 );
	assert.equal( info, 0, 'INFO' );
	assertArrayClose( packComplexBlock( A, 1, 4, FIXTURE_LDA ), tc.A, 1e-13, 'A' );
	assertArrayClose( toArray( reinterpret( TAU, 0 ) ), tc.TAU, 1e-13, 'TAU' );
});

test( 'ztzrzf: 2x4', function t() {
	var WORK;
	var info;
	var TAU;
	var tc;
	var A;
	tc = findCase( '2x4' );
	A = buildSourceA( 2, 4, FIXTURE_LDA, [
		[ 1, 1, 2.0, 0.2 ],
		[ 1, 2, 1.0, -0.1 ],
		[ 1, 3, 3.0, 0.4 ],
		[ 1, 4, 1.0, -0.3 ],
		[ 2, 2, 3.0, 0.3 ],
		[ 2, 3, 1.0, -0.2 ],
		[ 2, 4, 2.0, 0.5 ]
	]);
	TAU = new Complex128Array( 2 );
	WORK = new Complex128Array( 2 * 32 );
	info = ndarray( 2, 4, A, 1, FIXTURE_LDA, 0, TAU, 1, 0, WORK, 1, 0 );
	assert.equal( info, 0, 'INFO' );
	assertArrayClose( packComplexBlock( A, 2, 4, FIXTURE_LDA ), tc.A, 1e-13, 'A' );
	assertArrayClose( toArray( reinterpret( TAU, 0 ) ), tc.TAU, 1e-13, 'TAU' );
});

test( 'ztzrzf: large_40x80 (still unblocked: M < NX=128)', function t() {
	var WORK;
	var info;
	var TAU;
	var tc;
	var A;
	var M;
	var N;
	tc = findCase( 'large_40x80' );
	M = 40;
	N = 80;
	A = buildLargeFixtureMatrix( M, N, FIXTURE_LDA );
	TAU = new Complex128Array( M );
	WORK = new Complex128Array( M * 32 );
	info = ndarray( M, N, A, 1, FIXTURE_LDA, 0, TAU, 1, 0, WORK, 1, 0 );
	assert.equal( info, 0, 'INFO' );
	assertArrayClose( packComplexBlock( A, M, N, FIXTURE_LDA ), tc.A, 1e-12, 'A' );
	assertArrayClose( toArray( reinterpret( TAU, 0 ) ), tc.TAU, 1e-12, 'TAU' );
});

test( 'ztzrzf: blocked path (M=140, N=200) — verify A = R*Z reconstruction', function t() {
	var WORK;
	var info;
	var TAU;
	var av0;
	var lda;
	var rec;
	var idx;
	var A0;
	var A;
	var M;
	var N;
	var i;
	var j;
	M = 140;
	N = 200;
	lda = M;
	A0 = buildLargeFixtureMatrix( M, N, lda );
	A = buildLargeFixtureMatrix( M, N, lda );
	TAU = new Complex128Array( M );
	WORK = new Complex128Array( M * 32 );
	info = ndarray( M, N, A, 1, lda, 0, TAU, 1, 0, WORK, 1, 0 );
	assert.equal( info, 0, 'INFO' );
	rec = reconstructA( M, N, A, lda, TAU );
	av0 = reinterpret( A0, 0 );
	for ( j = 0; j < N; j++ ) {
		for ( i = 0; i < M; i++ ) {
			idx = ( ( j * lda ) + i ) * 2;
			assertClose( rec[ ( ( ( i * N ) + j ) * 2 ) ], av0[ idx ], 1e-10, 'recA[' + i + ',' + j + '].re' );
			assertClose( rec[ ( ( ( i * N ) + j ) * 2 ) + 1 ], av0[ idx + 1 ], 1e-10, 'recA[' + i + ',' + j + '].im' );
		}
	}
});

test( 'ztzrzf: throws RangeError when WORK is undersized (blocked path, M=140)', function t() {
	var TAU = new Complex128Array( 140 );
	var A = buildLargeFixtureMatrix( 140, 200, 140 );
	assert.throws( function() {
		ndarray( 140, 200, A, 1, 140, 0, TAU, 1, 0, new Complex128Array( 8 ), 1, 0 );
	}, RangeError );
});

test( 'ztzrzf: row-major small (3x5) — verify A = R*Z reconstruction', function t() {
	var WORK;
	var info;
	var Acol;
	var rows;
	var a0v;
	var TAU;
	var acv;
	var lda;
	var rec;
	var A0;
	var A;
	var M;
	var N;
	var i;
	var j;
	var k;
	var v;
	M = 3;
	N = 5;
	lda = N;

	// 3x5 entries (re, im): row-major
	rows = [
		[ [ 4.0, 0.5 ], [ 1.0, -0.2 ], [ 2.0, 0.3 ], [ 3.0, 0.1 ], [ 1.0, -0.4 ] ],
		[ [ 0.0, 0.0 ], [ 5.0, 0.3 ], [ 1.0, 0.1 ], [ 2.0, 0.2 ], [ 4.0, -0.5 ] ],
		[ [ 0.0, 0.0 ], [ 0.0, 0.0 ], [ 6.0, 0.4 ], [ 1.0, -0.2 ], [ 2.0, 0.6 ] ]
	];
	A = new Complex128Array( M * lda );
	A0 = new Complex128Array( M * lda );
	v = reinterpret( A, 0 );
	a0v = reinterpret( A0, 0 );
	for ( i = 0; i < M; i++ ) {
		for ( j = 0; j < N; j++ ) {
			k = ( ( i * lda ) + j ) * 2;
			v[ k ] = rows[ i ][ j ][ 0 ];
			v[ k + 1 ] = rows[ i ][ j ][ 1 ];
			a0v[ k ] = rows[ i ][ j ][ 0 ];
			a0v[ k + 1 ] = rows[ i ][ j ][ 1 ];
		}
	}
	TAU = new Complex128Array( M );
	WORK = new Complex128Array( M );

	// Row-major: strideA1 = N, strideA2 = 1.
	info = ndarray( M, N, A, N, 1, 0, TAU, 1, 0, WORK, 1, 0 );
	assert.equal( info, 0, 'INFO' );

	// Convert row-major buffer into a column-major view (lda=M) for reconstructA.
	Acol = new Complex128Array( M * N );
	acv = reinterpret( Acol, 0 );
	for ( i = 0; i < M; i++ ) {
		for ( j = 0; j < N; j++ ) {
			k = ( ( j * M ) + i ) * 2; // column-major index in Acol
			acv[ k ] = v[ ( ( i * lda ) + j ) * 2 ];
			acv[ k + 1 ] = v[ ( ( ( i * lda ) + j ) * 2 ) + 1 ];
		}
	}
	rec = reconstructA( M, N, Acol, M, TAU );
	for ( i = 0; i < M; i++ ) {
		for ( j = 0; j < N; j++ ) {
			k = ( ( i * lda ) + j ) * 2;
			assertClose( rec[ ( ( ( i * N ) + j ) * 2 ) ], a0v[ k ], 1e-12, 'recA[' + i + ',' + j + '].re' );
			assertClose( rec[ ( ( ( i * N ) + j ) * 2 ) + 1 ], a0v[ k + 1 ], 1e-12, 'recA[' + i + ',' + j + '].im' );
		}
	}
});
