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

/* eslint-disable no-restricted-syntax, stdlib/first-unit-test, max-len */

// MODULES //

import { readFileSync } from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dlaqz4 from './../lib/ndarray.js';


// FIXTURES //

var fixtureDir = path.join( import.meta.dirname, '..', '..', '..', '..', '..', 'test', 'fixtures' );
var lines = readFileSync( path.join( fixtureDir, 'dlaqz4.jsonl' ), 'utf8' ).trim().split( '\n' );


// FUNCTIONS //

/**
* Finds a fixture case by name.
*
* @private
* @param {string} name - case name
* @returns {Object} fixture record
*/
function findCase( name ) {
	var rec;
	var i;
	for ( i = 0; i < lines.length; i++ ) {
		rec = JSON.parse( lines[ i ] );
		if ( rec.name === name ) {
			return rec;
		}
	}
	return null;
}

/**
* Asserts that two arrays agree componentwise up to a relative tolerance.
*
* @private
* @param {ArrayLike} actual - actual values
* @param {ArrayLike} expected - expected values
* @param {number} tol - relative tolerance
* @param {string} msg - assertion message
*/
function assertArrayClose( actual, expected, tol, msg ) {
	var relErr;
	var i;
	assert.equal( actual.length, expected.length, msg + ': length mismatch' );
	for ( i = 0; i < expected.length; i++ ) {
		relErr = Math.abs( actual[ i ] - expected[ i ] ) / Math.max( Math.abs( expected[ i ] ), 1.0 );
		assert.ok( relErr <= tol, msg + '[' + i + ']: expected ' + expected[ i ] + ', got ' + actual[ i ] );
	}
}

/**
* Builds the same Hessenberg/triangular pencil as `test_dlaqz4.f90`'s `init_pencil`.
* Stored column-major into an `NMAX`-by-`NMAX` Float64Array.
*
* @private
* @param {NonNegativeInteger} N - logical size of the pencil
* @param {NonNegativeInteger} NMAX - leading dimension (storage)
* @returns {Object} `{ A, B }` arrays
*/
function buildPencil( N, NMAX ) {
	var out;
	var A;
	var B;
	var i;
	var j;
	A = new Float64Array( NMAX * NMAX );
	B = new Float64Array( NMAX * NMAX );
	for ( j = 1; j <= N; j++ ) {
		for ( i = 1; i <= N; i++ ) {
			if ( i <= j + 1 ) {
				A[ ( i - 1 ) + ( ( j - 1 ) * NMAX ) ] = 1.0 + ( 0.1 * ( i + ( 2 * j ) ) ) + ( 0.03 * i * j );
			}
			if ( i <= j ) {
				B[ ( i - 1 ) + ( ( j - 1 ) * NMAX ) ] = 2.0 + ( 0.2 * ( j - i ) ) + ( 0.05 * j );
			}
		}
	}
	out = {
		'A': A,
		'B': B
	};
	return out;
}

/**
* Builds an identity matrix of order `N` stored column-major into an `NMAX`-by-`NMAX` Float64Array.
*
* @private
* @param {NonNegativeInteger} N - logical size of the matrix
* @param {NonNegativeInteger} NMAX - leading dimension (storage)
* @returns {Float64Array} identity matrix
*/
function eye( N, NMAX ) {
	var M;
	var i;
	M = new Float64Array( NMAX * NMAX );
	for ( i = 0; i < N; i++ ) {
		M[ i + ( i * NMAX ) ] = 1.0;
	}
	return M;
}

/**
* Packs the leading `N`-by-`N` column-major submatrix of `M` (stored with leading dim `NMAX`) into a tightly-packed `N*N` array.
*
* @private
* @param {Float64Array} M - source matrix
* @param {NonNegativeInteger} N - logical size
* @param {NonNegativeInteger} NMAX - leading dimension
* @returns {Float64Array} tightly-packed `N*N` array
*/
function pack( M, N, NMAX ) {
	var P;
	var i;
	var j;
	var k;
	P = new Float64Array( N * N );
	k = 0;
	for ( j = 0; j < N; j++ ) {
		for ( i = 0; i < N; i++ ) {
			P[ k ] = M[ i + ( j * NMAX ) ];
			k += 1;
		}
	}
	return P;
}

/**
* Runs a single dlaqz4 case against the corresponding Fortran fixture. `opts` carries the per-case configuration (see fixture record).
*
* @private
* @param {string} caseName - fixture case name
* @param {Object} opts - configuration
* @param {NonNegativeInteger} opts.N - logical size of the pencil
* @param {NonNegativeInteger} opts.ilo - first index of the active region (1-based, matches the Fortran test)
* @param {NonNegativeInteger} opts.ihi - last index of the active region (1-based)
* @param {NonNegativeInteger} opts.nshifts - desired number of shifts
* @param {PositiveInteger} opts.nblockDesired - desired window size
* @param {boolean} opts.ilschur - update full Schur form
* @param {boolean} opts.ilq - update `Q`
* @param {boolean} opts.ilz - update `Z`
* @param {Float64Array} opts.SR - real parts of shifts
* @param {Float64Array} opts.SI - imaginary parts of shifts
* @param {Float64Array} opts.SS - shift scales
* @param {number} opts.tol - relative tolerance
*/
function runCase( caseName, opts ) {
	var pencil;
	var NMAX;
	var WORK;
	var info;
	var QC;
	var ZC;
	var tc;
	var Q;
	var Z;
	NMAX = 12;
	pencil = buildPencil( opts.N, NMAX );
	Q = eye( opts.N, NMAX );
	Z = eye( opts.N, NMAX );
	QC = eye( opts.N, NMAX );
	ZC = eye( opts.N, NMAX );
	WORK = new Float64Array( NMAX * NMAX );
	info = dlaqz4( opts.ilschur, opts.ilq, opts.ilz, opts.N, opts.ilo - 1, opts.ihi - 1, opts.nshifts, opts.nblockDesired, opts.SR, 1, 0, opts.SI, 1, 0, opts.SS, 1, 0, pencil.A, 1, NMAX, 0, pencil.B, 1, NMAX, 0, Q, 1, NMAX, 0, Z, 1, NMAX, 0, QC, 1, NMAX, 0, ZC, 1, NMAX, 0, WORK, 1, 0 );
	assert.equal( info, 0, caseName + ': info' );
	tc = findCase( caseName );
	assert.ok( tc, caseName + ': fixture record exists' );
	assertArrayClose( pack( pencil.A, opts.N, NMAX ), tc.A, opts.tol, caseName + ' A' );
	assertArrayClose( pack( pencil.B, opts.N, NMAX ), tc.B, opts.tol, caseName + ' B' );
	if ( tc.Q ) {
		assertArrayClose( pack( Q, opts.N, NMAX ), tc.Q, opts.tol, caseName + ' Q' );
	}
	if ( tc.Z ) {
		assertArrayClose( pack( Z, opts.N, NMAX ), tc.Z, opts.tol, caseName + ' Z' );
	}
}


// TESTS //

test( 'dlaqz4 ndarray is a function', function t() {
	assert.strictEqual( typeof dlaqz4, 'function', 'is a function' );
});

test( 'dlaqz4: basic_8x8_ns2', function t() {
	runCase( 'basic_8x8_ns2', {
		'N': 8,
		'ilo': 1,
		'ihi': 8,
		'nshifts': 2,
		'nblockDesired': 4,
		'ilschur': true,
		'ilq': true,
		'ilz': true,
		'SR': new Float64Array( [ 1.5, 1.5 ] ),
		'SI': new Float64Array( [ 0.3, -0.3 ] ),
		'SS': new Float64Array( [ 1.0, 1.0 ] ),
		'tol': 1e-12
	});
});

test( 'dlaqz4: multi_10x10_ns4', function t() {
	runCase( 'multi_10x10_ns4', {
		'N': 10,
		'ilo': 1,
		'ihi': 10,
		'nshifts': 4,
		'nblockDesired': 6,
		'ilschur': true,
		'ilq': true,
		'ilz': true,
		'SR': new Float64Array( [ 2.0, 2.0, 1.0, 1.0 ] ),
		'SI': new Float64Array( [ 0.5, -0.5, 0.2, -0.2 ] ),
		'SS': new Float64Array( [ 1.0, 1.0, 1.0, 1.0 ] ),
		'tol': 1e-12
	});
});

test( 'dlaqz4: partial_window_no_updates', function t() {
	runCase( 'partial_window_no_updates', {
		'N': 8,
		'ilo': 2,
		'ihi': 7,
		'nshifts': 2,
		'nblockDesired': 4,
		'ilschur': false,
		'ilq': false,
		'ilz': false,
		'SR': new Float64Array( [ 1.2, 1.2 ] ),
		'SI': new Float64Array( [ 0.4, -0.4 ] ),
		'SS': new Float64Array( [ 1.0, 1.0 ] ),
		'tol': 1e-12
	});
});

test( 'dlaqz4: nshifts_0_noop', function t() {
	runCase( 'nshifts_0_noop', {
		'N': 6,
		'ilo': 1,
		'ihi': 6,
		'nshifts': 0,
		'nblockDesired': 4,
		'ilschur': true,
		'ilq': true,
		'ilz': true,
		'SR': new Float64Array( [ 0.0, 0.0 ] ),
		'SI': new Float64Array( [ 0.0, 0.0 ] ),
		'SS': new Float64Array( [ 0.0, 0.0 ] ),
		'tol': 1e-14
	});
});

test( 'dlaqz4: ilo_eq_ihi_noop', function t() {
	runCase( 'ilo_eq_ihi_noop', {
		'N': 6,
		'ilo': 4,
		'ihi': 4,
		'nshifts': 2,
		'nblockDesired': 4,
		'ilschur': true,
		'ilq': true,
		'ilz': true,
		'SR': new Float64Array( [ 1.0, 1.0 ] ),
		'SI': new Float64Array( [ 0.1, -0.1 ] ),
		'SS': new Float64Array( [ 1.0, 1.0 ] ),
		'tol': 1e-14
	});
});

test( 'dlaqz4: odd_nshifts_3', function t() {
	runCase( 'odd_nshifts_3', {
		'N': 8,
		'ilo': 1,
		'ihi': 8,
		'nshifts': 3,
		'nblockDesired': 4,
		'ilschur': true,
		'ilq': true,
		'ilz': true,
		'SR': new Float64Array( [ 2.0, 2.0, 1.0 ] ),
		'SI': new Float64Array( [ 0.5, -0.5, 0.0 ] ),
		'SS': new Float64Array( [ 1.0, 1.0, 1.0 ] ),
		'tol': 1e-12
	});
});

test( 'dlaqz4: shuffle_path_ns4', function t() {
	runCase( 'shuffle_path_ns4', {
		'N': 8,
		'ilo': 1,
		'ihi': 8,
		'nshifts': 4,
		'nblockDesired': 5,
		'ilschur': true,
		'ilq': true,
		'ilz': true,
		'SR': new Float64Array( [ 1.0, 1.5, 1.5, 0.5 ] ),
		'SI': new Float64Array( [ 0.0, 0.4, -0.4, 0.0 ] ),
		'SS': new Float64Array( [ 1.0, 1.0, 1.0, 1.0 ] ),
		'tol': 1e-12
	});
});

test( 'dlaqz4: ilschur_inner_window', function t() {
	runCase( 'ilschur_inner_window', {
		'N': 10,
		'ilo': 3,
		'ihi': 8,
		'nshifts': 2,
		'nblockDesired': 4,
		'ilschur': true,
		'ilq': true,
		'ilz': true,
		'SR': new Float64Array( [ 1.2, 1.2 ] ),
		'SI': new Float64Array( [ 0.4, -0.4 ] ),
		'SS': new Float64Array( [ 1.0, 1.0 ] ),
		'tol': 1e-12
	});
});

test( 'dlaqz4: large_12x12_ns4', function t() {
	runCase( 'large_12x12_ns4', {
		'N': 12,
		'ilo': 1,
		'ihi': 12,
		'nshifts': 4,
		'nblockDesired': 8,
		'ilschur': true,
		'ilq': true,
		'ilz': true,
		'SR': new Float64Array( [ 3.0, 3.0, 1.5, 0.8 ] ),
		'SI': new Float64Array( [ 0.7, -0.7, 0.0, 0.0 ] ),
		'SS': new Float64Array( [ 1.0, 1.0, 1.0, 1.0 ] ),
		'tol': 1e-12
	});
});

test( 'dlaqz4: returns info=-8 when nblockDesired < nshifts+1', function t() {
	var WORK;
	var info;
	var QC;
	var ZC;
	var A;
	var B;
	var Q;
	var Z;
	A = new Float64Array( 16 );
	B = new Float64Array( 16 );
	Q = new Float64Array( 16 );
	Z = new Float64Array( 16 );
	QC = new Float64Array( 16 );
	ZC = new Float64Array( 16 );
	WORK = new Float64Array( 16 );
	info = dlaqz4( true, true, true, 4, 0, 3, 4, 4, new Float64Array( 4 ), 1, 0, new Float64Array( 4 ), 1, 0, new Float64Array( 4 ), 1, 0, A, 1, 4, 0, B, 1, 4, 0, Q, 1, 4, 0, Z, 1, 4, 0, QC, 1, 4, 0, ZC, 1, 4, 0, WORK, 1, 0 );
	assert.equal( info, -8, 'info' );
});
