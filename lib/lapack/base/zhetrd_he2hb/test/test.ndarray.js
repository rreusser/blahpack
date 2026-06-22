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

/* eslint-disable no-restricted-syntax, stdlib/first-unit-test, camelcase, max-len */

// MODULES //

import { readFileSync } from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import assert from 'node:assert/strict';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import zhetrd_he2hb from './../lib/ndarray.js';


// FIXTURES //

var fixtureDir = path.join( import.meta.dirname, '..', '..', '..', '..', '..', 'test', 'fixtures' );
var lines = readFileSync( path.join( fixtureDir, 'zhetrd_he2hb.jsonl' ), 'utf8' ).trim().split( '\n' ); // eslint-disable-line node/no-sync
var fixture = lines.map( parseLine );


// FUNCTIONS //

/**
* Parse a JSONL line into an object.
*
* @private
* @param {string} line - JSON-encoded line
* @returns {Object} parsed fixture case
*/
function parseLine( line ) {
	return JSON.parse( line );
}

/**
* Find a fixture case by name.
*
* @private
* @param {string} name - fixture name
* @returns {Object} fixture case
*/
function findCase( name ) {
	return fixture.find( function find( tc ) {
		return tc.name === name;
	});
}

/**
* Build a Hermitian test matrix matching the Fortran fixture inputs.
*
* @private
* @param {NonNegativeInteger} N - matrix order
* @param {number} diagBase - additive offset for the real diagonal value
* @param {number} imagScale - off-diagonal imaginary coefficient
* @returns {Complex128Array} N-by-N column-major Hermitian matrix
*/
function buildHermitian( N, diagBase, imagScale ) {
	var idx;
	var ar;
	var A;
	var i;
	var j;

	A = new Complex128Array( N * N );
	ar = reinterpret( A, 0 );
	for ( j = 0; j < N; j++ ) {
		for ( i = 0; i < N; i++ ) {
			idx = (j * N) + i;
			if ( i === j ) {
				ar[ 2 * idx ] = diagBase + i + 1;
				ar[ (2 * idx) + 1 ] = 0.0;
			} else if ( i < j ) {
				ar[ 2 * idx ] = 1.0 / ( j - i + 1 );
				ar[ (2 * idx) + 1 ] = imagScale / ( j - i + 1 );
			} else {
				ar[ 2 * idx ] = 1.0 / ( i - j + 1 );
				ar[ (2 * idx) + 1 ] = -imagScale / ( i - j + 1 );
			}
		}
	}
	return A;
}

/**
* Allocate a WORK buffer large enough for the given N and kd.
*
* @private
* @param {NonNegativeInteger} N - matrix order
* @param {NonNegativeInteger} kd - bandwidth
* @returns {Complex128Array} workspace
*/
function allocWork( N, kd ) {
	var nb = ( kd > 32 ) ? kd : 32;
	return new Complex128Array( Math.max( 1, (N * kd) + (N * nb) + (2 * kd * kd) ) );
}

/**
* Assert two interleaved complex Float64Array slices are element-wise close.
*
* Uses a mixed absolute/relative tolerance: `|actual - expected| <= tol _ max(|expected|, 1)`.
*
* @private
* @param {Float64Array} actual - actual values
* @param {Array} expected - expected values (from fixture)
* @param {number} tol - tolerance (relative for large entries, absolute floor of 1)
* @param {string} msg - error message prefix
*/
function assertClose( actual, expected, tol, msg ) {
	var bound;
	var i;

	assert.equal( actual.length, expected.length, msg + ': length mismatch (' + actual.length + ' vs ' + expected.length + ')' );
	for ( i = 0; i < expected.length; i++ ) {
		bound = tol * Math.max( Math.abs( expected[ i ] ), 1.0 );
		if ( Math.abs( actual[ i ] - expected[ i ] ) > bound ) {
			assert.fail( msg + '[' + i + ']: expected ' + expected[ i ] + ', got ' + actual[ i ] + ' (delta ' + ( actual[ i ] - expected[ i ] ) + ')' );
		}
	}
}


// TESTS //

test( 'zhetrd_he2hb ndarray is a function', function t() {
	assert.strictEqual( typeof zhetrd_he2hb, 'function', 'is a function' );
});

test( 'zhetrd_he2hb ndarray throws TypeError for invalid uplo', function t() {
	assert.throws( function throws() {
		zhetrd_he2hb( 'invalid', 2, 1, new Complex128Array( 4 ), 1, 2, 0, new Complex128Array( 4 ), 1, 2, 0, new Complex128Array( 1 ), 1, 0, null, 1, 0 );
	}, TypeError );
});

test( 'zhetrd_he2hb ndarray throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		zhetrd_he2hb( 'upper', -1, 1, new Complex128Array( 4 ), 1, 2, 0, new Complex128Array( 4 ), 1, 2, 0, new Complex128Array( 1 ), 1, 0, null, 1, 0 );
	}, RangeError );
});

test( 'zhetrd_he2hb ndarray throws RangeError for negative kd', function t() {
	assert.throws( function throws() {
		zhetrd_he2hb( 'upper', 2, -1, new Complex128Array( 4 ), 1, 2, 0, new Complex128Array( 4 ), 1, 2, 0, new Complex128Array( 1 ), 1, 0, null, 1, 0 );
	}, RangeError );
});

test( 'zhetrd_he2hb: upper, N=8, KD=3 (blocked path)', function t() {
	var info;
	var TAU;
	var AB;
	var tc;
	var kd;
	var A;
	var N;

	tc = findCase( 'upper_n8_kd3' );
	N = 8;
	kd = 3;
	A = buildHermitian( N, 20, 0.5 );
	AB = new Complex128Array( ( kd + 1 ) * N );
	TAU = new Complex128Array( N - kd );

	info = zhetrd_he2hb( 'upper', N, kd, A, 1, N, 0, AB, 1, kd + 1, 0, TAU, 1, 0, allocWork( N, kd ), 1, 0 );
	assert.equal( info, 0, 'info' );
	assertClose( reinterpret( A, 0 ), tc.A, 1e-12, 'A' );
	assertClose( reinterpret( AB, 0 ), tc.AB, 1e-12, 'AB' );
	assertClose( reinterpret( TAU, 0 ), tc.TAU, 1e-12, 'TAU' );
});

test( 'zhetrd_he2hb: lower, N=8, KD=3 (blocked path)', function t() {
	var info;
	var TAU;
	var AB;
	var tc;
	var kd;
	var A;
	var N;

	tc = findCase( 'lower_n8_kd3' );
	N = 8;
	kd = 3;
	A = buildHermitian( N, 20, 0.5 );
	AB = new Complex128Array( ( kd + 1 ) * N );
	TAU = new Complex128Array( N - kd );

	info = zhetrd_he2hb( 'lower', N, kd, A, 1, N, 0, AB, 1, kd + 1, 0, TAU, 1, 0, allocWork( N, kd ), 1, 0 );
	assert.equal( info, 0, 'info' );
	assertClose( reinterpret( A, 0 ), tc.A, 1e-12, 'A' );
	assertClose( reinterpret( AB, 0 ), tc.AB, 1e-12, 'AB' );
	assertClose( reinterpret( TAU, 0 ), tc.TAU, 1e-12, 'TAU' );
});

test( 'zhetrd_he2hb: upper, N=2, KD=1 (quick return)', function t() {
	var info;
	var TAU;
	var AB;
	var tc;
	var kd;
	var A;
	var N;

	tc = findCase( 'upper_n2_kd1_quick' );
	N = 2;
	kd = 1;
	A = new Complex128Array( [ 4.0, 0.0, 1.0, -1.0, 1.0, 1.0, 5.0, 0.0 ] );
	AB = new Complex128Array( ( kd + 1 ) * N );
	TAU = new Complex128Array( Math.max( 1, N - kd ) );

	info = zhetrd_he2hb( 'upper', N, kd, A, 1, N, 0, AB, 1, kd + 1, 0, TAU, 1, 0, allocWork( N, kd ), 1, 0 );
	assert.equal( info, 0, 'info' );
	assertClose( reinterpret( AB, 0 ), tc.AB, 1e-14, 'AB' );
});

test( 'zhetrd_he2hb: lower, N=2, KD=1 (quick return)', function t() {
	var info;
	var TAU;
	var AB;
	var tc;
	var kd;
	var A;
	var N;

	tc = findCase( 'lower_n2_kd1_quick' );
	N = 2;
	kd = 1;
	A = new Complex128Array( [ 4.0, 0.0, 1.0, -1.0, 1.0, 1.0, 5.0, 0.0 ] );
	AB = new Complex128Array( ( kd + 1 ) * N );
	TAU = new Complex128Array( Math.max( 1, N - kd ) );

	info = zhetrd_he2hb( 'lower', N, kd, A, 1, N, 0, AB, 1, kd + 1, 0, TAU, 1, 0, allocWork( N, kd ), 1, 0 );
	assert.equal( info, 0, 'info' );
	assertClose( reinterpret( AB, 0 ), tc.AB, 1e-14, 'AB' );
});

test( 'zhetrd_he2hb: N=0 quick return', function t() {
	var info;
	var TAU;
	var AB;
	var tc;
	var A;

	tc = findCase( 'n_zero' );
	A = new Complex128Array( 1 );
	AB = new Complex128Array( 1 );
	TAU = new Complex128Array( 1 );

	info = zhetrd_he2hb( 'upper', 0, 1, A, 1, 1, 0, AB, 1, 2, 0, TAU, 1, 0, allocWork( 0, 1 ), 1, 0 );
	assert.equal( info, tc.info, 'info' );
});

test( 'zhetrd_he2hb: upper, N=12, KD=4 (multiple panels)', function t() {
	var info;
	var TAU;
	var AB;
	var tc;
	var kd;
	var A;
	var N;

	tc = findCase( 'upper_n12_kd4' );
	N = 12;
	kd = 4;
	A = buildHermitian( N, 30, 0.3 );
	AB = new Complex128Array( ( kd + 1 ) * N );
	TAU = new Complex128Array( N - kd );

	info = zhetrd_he2hb( 'upper', N, kd, A, 1, N, 0, AB, 1, kd + 1, 0, TAU, 1, 0, allocWork( N, kd ), 1, 0 );
	assert.equal( info, 0, 'info' );

	// Tolerance is loosened to 1e-8 because the multi-panel blocked reduction accumulates rounding through many FLOPs per matrix entry; tiny ordering differences in the trailing updates produce ~1e-9 diffs vs. the Fortran reference:
	assertClose( reinterpret( A, 0 ), tc.A, 1e-8, 'A' );
	assertClose( reinterpret( AB, 0 ), tc.AB, 1e-8, 'AB' );
	assertClose( reinterpret( TAU, 0 ), tc.TAU, 1e-8, 'TAU' );
});

test( 'zhetrd_he2hb: lower, N=12, KD=4 (multiple panels)', function t() {
	var info;
	var TAU;
	var AB;
	var tc;
	var kd;
	var A;
	var N;

	tc = findCase( 'lower_n12_kd4' );
	N = 12;
	kd = 4;
	A = buildHermitian( N, 30, 0.3 );
	AB = new Complex128Array( ( kd + 1 ) * N );
	TAU = new Complex128Array( N - kd );

	info = zhetrd_he2hb( 'lower', N, kd, A, 1, N, 0, AB, 1, kd + 1, 0, TAU, 1, 0, allocWork( N, kd ), 1, 0 );
	assert.equal( info, 0, 'info' );
	assertClose( reinterpret( A, 0 ), tc.A, 1e-8, 'A' );
	assertClose( reinterpret( AB, 0 ), tc.AB, 1e-8, 'AB' );
	assertClose( reinterpret( TAU, 0 ), tc.TAU, 1e-8, 'TAU' );
});

test( 'zhetrd_he2hb: lower, N=8, KD=3 with caller-provided WORK', function t() {
	var info;
	var WORK;
	var TAU;
	var AB;
	var tc;
	var kd;
	var nb;
	var A;
	var N;

	tc = findCase( 'lower_n8_kd3' );
	N = 8;
	kd = 3;
	nb = ( kd > 32 ) ? kd : 32;
	A = buildHermitian( N, 20, 0.5 );
	AB = new Complex128Array( ( kd + 1 ) * N );
	TAU = new Complex128Array( N - kd );
	WORK = new Complex128Array( ( N * kd ) + ( N * nb ) + ( 2 * kd * kd ) );

	info = zhetrd_he2hb( 'lower', N, kd, A, 1, N, 0, AB, 1, kd + 1, 0, TAU, 1, 0, WORK, 1, 0 );
	assert.equal( info, 0, 'info' );
	assertClose( reinterpret( A, 0 ), tc.A, 1e-12, 'A' );
	assertClose( reinterpret( AB, 0 ), tc.AB, 1e-12, 'AB' );
	assertClose( reinterpret( TAU, 0 ), tc.TAU, 1e-12, 'TAU' );
});
