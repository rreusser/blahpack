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

/* eslint-disable no-restricted-syntax, max-len */

// MODULES //

import { readFileSync } from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import zunbdb4 from './../lib/strided.js';


// FIXTURES //

const fixtureDir = path.join( import.meta.dirname, '..', '..', '..', '..', 'test', 'fixtures' );
const lines = readFileSync( path.join( fixtureDir, 'zunbdb4.jsonl' ), 'utf8' ).trim().split( '\n' );
const fixture = lines.map( function parse( line ) {
	return JSON.parse( line );
});


// VARIABLES //

// Match NMAX in test_zunbdb4.f90 — leading dimension of the X11/X21 buffers
const LDX_PAD = 16;


// FUNCTIONS //

/**
* Locates a fixture record by name.
*
* @private
* @param {string} name - test case name
* @returns {Object} fixture record
*/
function findCase( name ) {
	return fixture.find( function find( t ) {
		return t.name === name;
	});
}

/**
* Builds an `LDX_PAD`-by-`Q` column-major Complex128Array buffer holding a packed `P`-by-`Q` complex matrix.
*
* @private
* @param {Array} packedInterleaved - interleaved `[re,im,re,im,...]` values from the fixture (length `2*P*Q`)
* @param {NonNegativeInteger} P - number of rows in the source matrix
* @param {NonNegativeInteger} Q - number of columns in the source matrix
* @returns {Complex128Array} padded column-major buffer
*/
function buildBuffer( packedInterleaved, P, Q ) {
	let srcIdx, dstIdx, i, j;

	const buf = new Complex128Array( LDX_PAD * Q );
	const bv = reinterpret( buf, 0 );
	for ( j = 0; j < Q; j++ ) {
		for ( i = 0; i < P; i++ ) {
			srcIdx = 2 * ( i + ( j * P ) );
			dstIdx = 2 * ( i + ( j * LDX_PAD ) );
			bv[ dstIdx ] = packedInterleaved[ srcIdx ];
			bv[ dstIdx + 1 ] = packedInterleaved[ srcIdx + 1 ];
		}
	}
	return buf;
}

/**
* Packs the leading `P`-by-`Q` complex submatrix from a column-major Complex128Array (leading dim `LDX_PAD`) into an interleaved `[re,im,...]` Array of length `2*P*Q`.
*
* @private
* @param {Complex128Array} A - source buffer (column-major, `LDX_PAD` rows)
* @param {NonNegativeInteger} P - number of rows in the submatrix
* @param {NonNegativeInteger} Q - number of columns in the submatrix
* @returns {Array} packed interleaved values (length `2*P*Q`)
*/
function packMatrix( A, P, Q ) {
	let srcIdx, dstIdx, i, j;

	const av = reinterpret( A, 0 );
	const out = [];
	for ( j = 0; j < Q; j++ ) {
		for ( i = 0; i < P; i++ ) {
			srcIdx = 2 * ( i + ( j * LDX_PAD ) );
			dstIdx = 2 * ( i + ( j * P ) );
			out[ dstIdx ] = av[ srcIdx ];
			out[ dstIdx + 1 ] = av[ srcIdx + 1 ];
		}
	}
	return out;
}

/**
* Packs the leading `N` complex elements of a Complex128Array into an interleaved `[re,im,...]` Array of length `2*N`.
*
* @private
* @param {Complex128Array} v - source vector
* @param {NonNegativeInteger} N - number of complex elements
* @returns {Array} packed interleaved values
*/
function packVector( v, N ) {
	let i;

	const av = reinterpret( v, 0 );
	const out = [];
	for ( i = 0; i < 2 * N; i++ ) {
		out[ i ] = av[ i ];
	}
	return out;
}

/**
* Compares two arrays element-wise to within a tolerance.
*
* @private
* @param {Array} actual - actual values
* @param {Array} expected - expected values
* @param {number} tol - absolute tolerance
* @param {string} msg - assertion message
*/
function assertArrayClose( actual, expected, tol, msg ) {
	let i;
	assert.strictEqual( actual.length, expected.length, msg + ': length' );
	for ( i = 0; i < expected.length; i++ ) {
		assert.ok( Math.abs( actual[ i ] - expected[ i ] ) <= tol, msg + '[' + i + ']: expected ' + expected[ i ] + ', got ' + actual[ i ] );
	}
}

/**
* Runs a fixture-driven test case end-to-end.
*
* @private
* @param {string} name - test case name (must match a fixture record)
* @param {NonNegativeInteger} M - total rows
* @param {NonNegativeInteger} P - rows in `X11`
* @param {NonNegativeInteger} Q - columns
* @param {boolean} hasPhi - whether the fixture has a `PHI` array
* @param {boolean} hasPhantom - whether the fixture has a `PHANTOM` array (only present when M > Q)
*/
function runFixtureCase( name, M, P, Q, hasPhi, hasPhantom ) {

	const tc = findCase( name );
	const X11 = buildBuffer( tc.X11in, P, Q );
	const X21 = buildBuffer( tc.X21in, M - P, Q );

	const THETA = new Float64Array( LDX_PAD );
	const PHI = new Float64Array( LDX_PAD );
	const TAUP1 = new Complex128Array( LDX_PAD );
	const TAUP2 = new Complex128Array( LDX_PAD );
	const TAUQ1 = new Complex128Array( LDX_PAD );
	const PHANTOM = new Complex128Array( 2 * LDX_PAD );
	const WORK = new Complex128Array( LDX_PAD * LDX_PAD );

	const info = zunbdb4( M, P, Q, X11, 1, LDX_PAD, 0, X21, 1, LDX_PAD, 0, THETA, 1, 0, PHI, 1, 0, TAUP1, 1, 0, TAUP2, 1, 0, TAUQ1, 1, 0, PHANTOM, 1, 0, WORK, 1, 0 );
	assert.strictEqual( info, 0, name + ': info' );

	assertArrayClose( THETA.subarray( 0, Q ), tc.THETA, 1e-12, name + ': THETA' );
	assertArrayClose( packVector( TAUQ1, Q ), tc.TAUQ1, 1e-12, name + ': TAUQ1' );
	assertArrayClose( packMatrix( X11, P, Q ), tc.X11, 1e-10, name + ': X11' );
	assertArrayClose( packMatrix( X21, M - P, Q ), tc.X21, 1e-10, name + ': X21' );

	if ( hasPhi ) {
		assertArrayClose( PHI.subarray( 0, Q - 1 ), tc.PHI, 1e-12, name + ': PHI' );
	}
	if ( hasPhantom ) {
		assertArrayClose( packVector( TAUP1, M - Q ), tc.TAUP1, 1e-12, name + ': TAUP1' );
		assertArrayClose( packVector( TAUP2, M - Q ), tc.TAUP2, 1e-12, name + ': TAUP2' );
		assertArrayClose( packVector( PHANTOM, M ), tc.PHANTOM, 1e-10, name + ': PHANTOM' );
	}
}


// TESTS //

test( 'zunbdb4.strided: basic_8x4x6 (all three loops exercised)', function t() {
	runFixtureCase( 'basic_8x4x6', 8, 4, 6, true, true );
});

test( 'zunbdb4.strided: m10_p5_q7 (larger general case)', function t() {
	runFixtureCase( 'm10_p5_q7', 10, 5, 7, true, true );
});

test( 'zunbdb4.strided: p_eq_q_no_third (third cleanup loop empty when P=Q)', function t() {
	runFixtureCase( 'p_eq_q_no_third', 8, 6, 6, true, true );
});

test( 'zunbdb4.strided: p_small_q_large (third cleanup loop wider than second)', function t() {
	runFixtureCase( 'p_small_q_large', 10, 4, 8, true, true );
});

test( 'zunbdb4.strided: m_eq_q_no_phantom (M=Q so phantom outer loop is skipped)', function t() {
	runFixtureCase( 'm_eq_q_no_phantom', 4, 2, 4, true, false );
});

test( 'zunbdb4.strided: throws RangeError for negative M', function t() {
	const X = new Complex128Array( 1 );
	const Y = new Float64Array( 1 );
	assert.throws( function throws() {
		zunbdb4( -1, 0, 0, X, 1, 1, 0, X, 1, 1, 0, Y, 1, 0, Y, 1, 0, X, 1, 0, X, 1, 0, X, 1, 0, X, 1, 0, X, 1, 0 );
	}, RangeError );
});

test( 'zunbdb4.strided: throws RangeError when P < M-Q', function t() {
	const X = new Complex128Array( 16 );
	const Y = new Float64Array( 16 );
	assert.throws( function throws() {
		// M=8, Q=4, M-Q=4, P=2 violates P >= M-Q
		zunbdb4( 8, 2, 4, X, 1, 4, 0, X, 1, 4, 0, Y, 1, 0, Y, 1, 0, X, 1, 0, X, 1, 0, X, 1, 0, X, 1, 0, X, 1, 0 );
	}, RangeError );
});

test( 'zunbdb4.strided: throws RangeError when M-Q > Q', function t() {
	const X = new Complex128Array( 16 );
	const Y = new Float64Array( 16 );
	assert.throws( function throws() {
		// M=4, Q=1, M-Q=3 > Q=1 violates M-Q <= Q
		zunbdb4( 4, 2, 1, X, 1, 4, 0, X, 1, 4, 0, Y, 1, 0, Y, 1, 0, X, 1, 0, X, 1, 0, X, 1, 0, X, 1, 0, X, 1, 0 );
	}, RangeError );
});

test( 'zunbdb4.strided: throws RangeError when Q > M', function t() {
	const X = new Complex128Array( 16 );
	const Y = new Float64Array( 16 );
	assert.throws( function throws() {
		// M=4, P=4, Q=5: Q > M violates Q <= M
		zunbdb4( 4, 4, 5, X, 1, 4, 0, X, 1, 4, 0, Y, 1, 0, Y, 1, 0, X, 1, 0, X, 1, 0, X, 1, 0, X, 1, 0, X, 1, 0 );
	}, RangeError );
});

test( 'zunbdb4.strided: returns info=0 when called with M=Q=0 (degenerate)', function t() {

	const X11 = new Complex128Array( 1 );
	const X21 = new Complex128Array( 1 );
	const THETA = new Float64Array( 1 );
	const PHI = new Float64Array( 1 );
	const TAUP1 = new Complex128Array( 1 );
	const TAUP2 = new Complex128Array( 1 );
	const TAUQ1 = new Complex128Array( 1 );
	const PHANTOM = new Complex128Array( 1 );
	const WORK = new Complex128Array( 1 );

	const info = zunbdb4( 0, 0, 0, X11, 1, 1, 0, X21, 1, 1, 0, THETA, 1, 0, PHI, 1, 0, TAUP1, 1, 0, TAUP2, 1, 0, TAUQ1, 1, 0, PHANTOM, 1, 0, WORK, 1, 0 );
	assert.strictEqual( info, 0, 'info' );
});


// Regression tests for ticket 0096: the declared minimum WORK used to be `M-Q`, which is smaller than the `max(1,P-1,M-P-1,Q)` elements the reflector applications touch; a WORK of exactly that length silently produced NaN in `X11`.

/**
* Runs `zunbdb4` on a fixed 6-by-4 input (`P = 3`) with a WORK of the given length.
*
* @private
* @param {NonNegativeInteger} lwork - WORK length
* @param {boolean} [poison] - whether to fill WORK with NaN before the call
* @returns {Array} flattened outputs
*/
function runWithWork( lwork, poison ) {
	const M = 6;
	const P = 3;
	const Q = 4;
	let i;

	const X11 = new Complex128Array( P * Q );
	const X21 = new Complex128Array( ( M - P ) * Q );
	const x11 = reinterpret( X11, 0 );
	const x21 = reinterpret( X21, 0 );
	for ( i = 0; i < x11.length; i++ ) {
		x11[ i ] = Math.sin( i + 1 );
	}
	for ( i = 0; i < x21.length; i++ ) {
		x21[ i ] = 0.5 * Math.cos( i + 1 );
	}
	const PHANTOM = new Complex128Array( M );
	const phv = reinterpret( PHANTOM, 0 );
	for ( i = 0; i < phv.length; i++ ) {
		phv[ i ] = Math.cos( 0.7 * ( i + 1 ) );
	}
	const THETA = new Float64Array( Q );
	const PHI = new Float64Array( Q );
	const TAUP1 = new Complex128Array( M );
	const TAUP2 = new Complex128Array( M );
	const TAUQ1 = new Complex128Array( M );
	const WORK = new Complex128Array( lwork );
	if ( poison ) {
		reinterpret( WORK, 0 ).fill( NaN );
	}
	const info = zunbdb4( M, P, Q, X11, 1, P, 0, X21, 1, M - P, 0, THETA, 1, 0, PHI, 1, 0, TAUP1, 1, 0, TAUP2, 1, 0, TAUQ1, 1, 0, PHANTOM, 1, 0, WORK, 1, 0 );
	return [ info, Array.from( x11 ), Array.from( x21 ), Array.from( THETA ), Array.from( PHI ), Array.from( reinterpret( TAUP1, 0 ) ), Array.from( reinterpret( TAUP2, 0 ) ), Array.from( reinterpret( TAUQ1, 0 ) ), Array.from( phv ) ];
}

test( 'zunbdb4.strided: a NaN-poisoned WORK of exactly the reference minimum `max(P, M-P, Q+1)` (5) gives the same result as a large WORK (ticket 0016)', function t() {
	const expected = runWithWork( 64 );
	const actual = runWithWork( 5, true );
	assert.deepStrictEqual( actual, expected );
	assert.ok( expected[ 1 ].every( Number.isFinite ), 'X11 is finite' );
});

test( 'zunbdb4.strided: rejects a WORK one below the reference minimum `max(P, M-P, Q+1)` (4) (ticket 0016)', function t() {
	assert.throws( function throws() {
		runWithWork( 4 );
	}, RangeError );
});

test( 'zunbdb4.strided: rejects a WORK of the old minimum `M-Q` (2) when more is needed (ticket 0096)', function t() {
	assert.throws( function throws() {
		runWithWork( 2 );
	}, RangeError );
});
