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

/* eslint-disable no-restricted-syntax, stdlib/first-unit-test, max-lines-per-function, max-statements, max-lines */

// MODULES //

import test from 'node:test';
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import zsytrfAa from './../lib/ndarray.js';


// FIXTURES //

var FIXTURE_PATH = path.resolve( import.meta.dirname, '../../../../../test/fixtures/zsytrf_aa.jsonl' );
var FIXTURES = loadFixtures( FIXTURE_PATH );


// FUNCTIONS //

/**
* Loads JSONL fixtures from disk.
*
* @private
* @param {string} fp - file path
* @returns {Object} map of name to fixture object
*/
function loadFixtures( fp ) {
	var lines = fs.readFileSync( fp, 'utf8' ).split( '\n' ); // eslint-disable-line node/no-sync
	var out = {};
	var rec;
	var i;
	for ( i = 0; i < lines.length; i++ ) {
		if ( lines[ i ].length === 0 ) {
			continue;
		}
		rec = JSON.parse( lines[ i ] );
		out[ rec.name ] = rec;
	}
	return out;
}

/**
* Asserts that two scalars are approximately equal.
*
* @private
* @param {number} actual - actual value
* @param {number} expected - expected value
* @param {number} tol - tolerance
* @param {string} msg - assertion message
*/
function assertClose( actual, expected, tol, msg ) {
	var rel = Math.abs( actual - expected ) / Math.max( Math.abs( expected ), 1.0 ); // eslint-disable-line max-len
	assert.ok( rel <= tol, msg + ': expected ' + expected + ', got ' + actual );
}

/**
* Asserts that two arrays are element-wise approximately equal.
*
* @private
* @param {*} actual - actual values
* @param {*} expected - expected values
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
* Converts Fortran 1-based IPIV to JS 0-based IPIV.
*
* @private
* @param {Array} fipiv - Fortran IPIV array (1-based)
* @returns {Array} 0-based IPIV
*/
function convertIPIV( fipiv ) {
	var out = [];
	var i;
	for ( i = 0; i < fipiv.length; i++ ) {
		if ( fipiv[ i ] > 0 ) {
			out.push( fipiv[ i ] - 1 );
		} else {
			out.push( fipiv[ i ] );
		}
	}
	return out;
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

/**
* Builds a Complex128Array of length `n` (in complex elements) from interleaved re/im pairs.
*
* @private
* @param {Array<number>} vals - interleaved [re, im, re, im, ...]
* @returns {Complex128Array} resulting array
*/
function fromInterleaved( vals ) {
	var view;
	var arr;
	var i;

	arr = new Complex128Array( vals.length / 2 );
	view = reinterpret( arr, 0 );
	for ( i = 0; i < vals.length; i++ ) {
		view[ i ] = vals[ i ];
	}
	return arr;
}


// TESTS //

test( 'zsytrf_aa: 4x4 lower (well-conditioned)', function t() {
	var info;
	var ipiv;
	var view;
	var tc;
	var A;

	tc = FIXTURES[ '4x4_lower' ];
	A = new Complex128Array( 16 );
	view = reinterpret( A, 0 );

	// Column 0.
	view[ 0 ] = 4.0;
	view[ 1 ] = 0.1;
	view[ 2 ] = 2.0;
	view[ 3 ] = -0.2;
	view[ 4 ] = 1.0;
	view[ 5 ] = 0.3;
	view[ 6 ] = 0.0;
	view[ 7 ] = 0.0;

	// Column 1.
	view[ 10 ] = 5.0;
	view[ 11 ] = -0.1;
	view[ 12 ] = 2.0;
	view[ 13 ] = 0.4;
	view[ 14 ] = 1.0;
	view[ 15 ] = 0.0;

	// Column 2.
	view[ 20 ] = 6.0;
	view[ 21 ] = 0.2;
	view[ 22 ] = 3.0;
	view[ 23 ] = -0.3;

	// Column 3.
	view[ 30 ] = 8.0;
	view[ 31 ] = 0.1;
	ipiv = new Int32Array( 4 );
	info = zsytrfAa( 'lower', 4, A, 1, 4, 0, ipiv, 1, 0 );
	assert.equal( info, tc.info, 'info' );
	assertArrayClose( view, tc.a, 1e-13, 'a' );
	assert.deepEqual( toArray( ipiv ), convertIPIV( tc.ipiv ), 'ipiv' );
});

test( 'zsytrf_aa: 4x4 upper (well-conditioned)', function t() {
	var info;
	var ipiv;
	var view;
	var tc;
	var A;

	tc = FIXTURES[ '4x4_upper' ];
	A = new Complex128Array( 16 );
	view = reinterpret( A, 0 );

	// Column 0.
	view[ 0 ] = 4.0;
	view[ 1 ] = 0.1;

	// Column 1.
	view[ 8 ] = 2.0;
	view[ 9 ] = -0.2;
	view[ 10 ] = 5.0;
	view[ 11 ] = -0.1;

	// Column 2.
	view[ 16 ] = 1.0;
	view[ 17 ] = 0.3;
	view[ 18 ] = 2.0;
	view[ 19 ] = 0.4;
	view[ 20 ] = 6.0;
	view[ 21 ] = 0.2;

	// Column 3.
	view[ 24 ] = 0.0;
	view[ 25 ] = 0.0;
	view[ 26 ] = 1.0;
	view[ 27 ] = 0.0;
	view[ 28 ] = 3.0;
	view[ 29 ] = -0.3;
	view[ 30 ] = 8.0;
	view[ 31 ] = 0.1;
	ipiv = new Int32Array( 4 );
	info = zsytrfAa( 'upper', 4, A, 1, 4, 0, ipiv, 1, 0 );
	assert.equal( info, tc.info, 'info' );
	assertArrayClose( view, tc.a, 1e-13, 'a' );
	assert.deepEqual( toArray( ipiv ), convertIPIV( tc.ipiv ), 'ipiv' );
});

test( 'zsytrf_aa: 4x4 indefinite lower', function t() {
	var info;
	var ipiv;
	var view;
	var tc;
	var A;

	tc = FIXTURES[ '4x4_indef_lower' ];
	A = new Complex128Array( 16 );
	view = reinterpret( A, 0 );

	// Column 0.
	view[ 2 ] = 1.0;
	view[ 3 ] = 0.5;
	view[ 4 ] = 2.0;
	view[ 5 ] = -0.3;
	view[ 6 ] = 3.0;
	view[ 7 ] = 0.2;

	// Column 1.
	view[ 12 ] = 4.0;
	view[ 13 ] = 0.1;
	view[ 14 ] = 5.0;
	view[ 15 ] = -0.4;

	// Column 2.
	view[ 22 ] = 6.0;
	view[ 23 ] = 0.3;
	ipiv = new Int32Array( 4 );
	info = zsytrfAa( 'lower', 4, A, 1, 4, 0, ipiv, 1, 0 );
	assert.equal( info, tc.info, 'info' );
	assertArrayClose( view, tc.a, 1e-13, 'a' );
	assert.deepEqual( toArray( ipiv ), convertIPIV( tc.ipiv ), 'ipiv' );
});

test( 'zsytrf_aa: 4x4 indefinite upper', function t() {
	var info;
	var ipiv;
	var view;
	var tc;
	var A;

	tc = FIXTURES[ '4x4_indef_upper' ];
	A = new Complex128Array( 16 );
	view = reinterpret( A, 0 );

	// Column 1.
	view[ 8 ] = 1.0;
	view[ 9 ] = 0.5;

	// Column 2.
	view[ 16 ] = 2.0;
	view[ 17 ] = -0.3;
	view[ 18 ] = 4.0;
	view[ 19 ] = 0.1;

	// Column 3.
	view[ 24 ] = 3.0;
	view[ 25 ] = 0.2;
	view[ 26 ] = 5.0;
	view[ 27 ] = -0.4;
	view[ 28 ] = 6.0;
	view[ 29 ] = 0.3;
	ipiv = new Int32Array( 4 );
	info = zsytrfAa( 'upper', 4, A, 1, 4, 0, ipiv, 1, 0 );
	assert.equal( info, tc.info, 'info' );
	assertArrayClose( view, tc.a, 1e-13, 'a' );
	assert.deepEqual( toArray( ipiv ), convertIPIV( tc.ipiv ), 'ipiv' );
});

test( 'zsytrf_aa: N=0 quick return', function t() {
	var info = zsytrfAa( 'lower', 0, new Complex128Array( 0 ), 1, 1, 0, new Int32Array( 0 ), 1, 0 );
	assert.equal( info, 0, 'info' );
});

test( 'zsytrf_aa: N=1 quick return', function t() {
	var view;
	var ipiv;
	var info;
	var tc;
	var A;

	tc = FIXTURES.n_one;
	A = fromInterleaved( [ 7.0, -0.5 ] );
	ipiv = new Int32Array( 1 );
	info = zsytrfAa( 'lower', 1, A, 1, 1, 0, ipiv, 1, 0 );
	view = reinterpret( A, 0 );
	assert.equal( info, tc.info, 'info' );
	assertArrayClose( view, tc.a, 1e-13, 'a' );
	assert.deepEqual( toArray( ipiv ), convertIPIV( tc.ipiv ), 'ipiv' );
});

test( 'zsytrf_aa: 5x5 lower', function t() {
	var info;
	var ipiv;
	var view;
	var tc;
	var A;

	tc = FIXTURES[ '5x5_lower' ];
	A = new Complex128Array( 25 );
	view = reinterpret( A, 0 );

	// Col 0.
	view[ 0 ] = 1.0;
	view[ 1 ] = 0.1;
	view[ 2 ] = -2.0;
	view[ 3 ] = 0.2;
	view[ 6 ] = 3.0;
	view[ 7 ] = -0.1;
	view[ 8 ] = 1.0;
	view[ 9 ] = 0.4;

	// Col 1.
	view[ 14 ] = 4.0;
	view[ 15 ] = -0.3;
	view[ 16 ] = -1.0;
	view[ 17 ] = 0.5;
	view[ 18 ] = 2.0;
	view[ 19 ] = 0.0;

	// Col 2.
	view[ 24 ] = -3.0;
	view[ 25 ] = 0.2;
	view[ 26 ] = 2.0;
	view[ 27 ] = -0.1;

	// Col 3.
	view[ 36 ] = 1.0;
	view[ 37 ] = 0.3;
	view[ 38 ] = -2.0;
	view[ 39 ] = 0.0;

	// Col 4.
	view[ 48 ] = 4.0;
	view[ 49 ] = -0.2;
	ipiv = new Int32Array( 5 );
	info = zsytrfAa( 'lower', 5, A, 1, 5, 0, ipiv, 1, 0 );
	assert.equal( info, tc.info, 'info' );
	assertArrayClose( view, tc.a, 1e-12, 'a' );
	assert.deepEqual( toArray( ipiv ), convertIPIV( tc.ipiv ), 'ipiv' );
});

test( 'zsytrf_aa: 5x5 upper', function t() {
	var info;
	var ipiv;
	var view;
	var tc;
	var A;

	tc = FIXTURES[ '5x5_upper' ];
	A = new Complex128Array( 25 );
	view = reinterpret( A, 0 );

	// Col 0.
	view[ 0 ] = 1.0;
	view[ 1 ] = 0.1;

	// Col 1.
	view[ 10 ] = -2.0;
	view[ 11 ] = 0.2;

	// Col 2.
	view[ 22 ] = 4.0;
	view[ 23 ] = -0.3;
	view[ 24 ] = -3.0;
	view[ 25 ] = 0.2;

	// Col 3.
	view[ 30 ] = 3.0;
	view[ 31 ] = -0.1;
	view[ 32 ] = -1.0;
	view[ 33 ] = 0.5;
	view[ 34 ] = 2.0;
	view[ 35 ] = -0.1;
	view[ 36 ] = 1.0;
	view[ 37 ] = 0.3;

	// Col 4.
	view[ 40 ] = 1.0;
	view[ 41 ] = 0.4;
	view[ 42 ] = 2.0;
	view[ 43 ] = 0.0;
	view[ 46 ] = -2.0;
	view[ 47 ] = 0.0;
	view[ 48 ] = 4.0;
	view[ 49 ] = -0.2;
	ipiv = new Int32Array( 5 );
	info = zsytrfAa( 'upper', 5, A, 1, 5, 0, ipiv, 1, 0 );
	assert.equal( info, tc.info, 'info' );
	assertArrayClose( view, tc.a, 1e-12, 'a' );
	assert.deepEqual( toArray( ipiv ), convertIPIV( tc.ipiv ), 'ipiv' );
});

test( 'zsytrf_aa: 40x40 lower (exercise blocked path)', function t() {
	var info;
	var ipiv;
	var view;
	var tc;
	var A;
	var i;
	var j;

	tc = FIXTURES[ '40x40_lower' ];
	A = new Complex128Array( 1600 );
	view = reinterpret( A, 0 );
	for ( j = 0; j < 40; j++ ) {
		for ( i = j; i < 40; i++ ) {
			if ( i === j ) {
				view[ ( ( j * 40 ) + i ) * 2 ] = 3.0 * 40.0;
				view[ ( ( ( j * 40 ) + i ) * 2 ) + 1 ] = 0.5;
			} else {
				view[ ( ( j * 40 ) + i ) * 2 ] = ( ( i + j + 2 ) % 7 ) - 3.0;

				// Fortran mod( i+1 + 2*(j+1), 5 ) - 2 ) * 0.1
				view[ ( ( ( j * 40 ) + i ) * 2 ) + 1 ] = ( ( ( ( i + 1 ) + ( 2 * ( j + 1 ) ) ) % 5 ) - 2 ) * 0.1; // eslint-disable-line max-len
			}
		}
	}
	ipiv = new Int32Array( 40 );
	info = zsytrfAa( 'lower', 40, A, 1, 40, 0, ipiv, 1, 0 );
	assert.equal( info, tc.info, 'info' );

	// IPIV may diverge in tied-pivot cases; verify A factor only on this large fixture.
	assertArrayClose( view, tc.a, 1e-10, 'a' );
});

test( 'zsytrf_aa: 40x40 upper (exercise blocked path)', function t() {
	var info;
	var ipiv;
	var view;
	var tc;
	var A;
	var i;
	var j;

	tc = FIXTURES[ '40x40_upper' ];
	A = new Complex128Array( 1600 );
	view = reinterpret( A, 0 );
	for ( j = 0; j < 40; j++ ) {
		for ( i = 0; i <= j; i++ ) {
			if ( i === j ) {
				view[ ( ( j * 40 ) + i ) * 2 ] = 3.0 * 40.0;
				view[ ( ( ( j * 40 ) + i ) * 2 ) + 1 ] = 0.5;
			} else {
				view[ ( ( j * 40 ) + i ) * 2 ] = ( ( i + j + 2 ) % 7 ) - 3.0;
				view[ ( ( ( j * 40 ) + i ) * 2 ) + 1 ] = ( ( ( ( i + 1 ) + ( 2 * ( j + 1 ) ) ) % 5 ) - 2 ) * 0.1; // eslint-disable-line max-len
			}
		}
	}
	ipiv = new Int32Array( 40 );
	info = zsytrfAa( 'upper', 40, A, 1, 40, 0, ipiv, 1, 0 );
	assert.equal( info, tc.info, 'info' );
	assertArrayClose( view, tc.a, 1e-10, 'a' );
});

test( 'zsytrf_aa: 70x70 lower (3-panel: J1>1 trailing-update branch)', function t() {
	var info;
	var ipiv;
	var view;
	var tc;
	var A;
	var i;
	var j;

	tc = FIXTURES[ '70x70_lower' ];
	A = new Complex128Array( 4900 );
	view = reinterpret( A, 0 );
	for ( j = 0; j < 70; j++ ) {
		for ( i = j; i < 70; i++ ) {
			if ( i === j ) {
				view[ ( ( j * 70 ) + i ) * 2 ] = 5.0 * 70.0;
				view[ ( ( ( j * 70 ) + i ) * 2 ) + 1 ] = 0.5;
			} else {
				view[ ( ( j * 70 ) + i ) * 2 ] = ( ( i + j + 2 ) % 7 ) - 3.0;
				view[ ( ( ( j * 70 ) + i ) * 2 ) + 1 ] = ( ( ( ( i + 1 ) + ( 2 * ( j + 1 ) ) ) % 5 ) - 2 ) * 0.1; // eslint-disable-line max-len
			}
		}
	}
	ipiv = new Int32Array( 70 );
	info = zsytrfAa( 'lower', 70, A, 1, 70, 0, ipiv, 1, 0 );
	assert.equal( info, tc.info, 'info' );
	assertArrayClose( view, tc.a, 1e-10, 'a' );
});

test( 'zsytrf_aa: 70x70 upper (3-panel: J1>1 trailing-update branch)', function t() {
	var info;
	var ipiv;
	var view;
	var tc;
	var A;
	var i;
	var j;

	tc = FIXTURES[ '70x70_upper' ];
	A = new Complex128Array( 4900 );
	view = reinterpret( A, 0 );
	for ( j = 0; j < 70; j++ ) {
		for ( i = 0; i <= j; i++ ) {
			if ( i === j ) {
				view[ ( ( j * 70 ) + i ) * 2 ] = 5.0 * 70.0;
				view[ ( ( ( j * 70 ) + i ) * 2 ) + 1 ] = 0.5;
			} else {
				view[ ( ( j * 70 ) + i ) * 2 ] = ( ( i + j + 2 ) % 7 ) - 3.0;
				view[ ( ( ( j * 70 ) + i ) * 2 ) + 1 ] = ( ( ( ( i + 1 ) + ( 2 * ( j + 1 ) ) ) % 5 ) - 2 ) * 0.1; // eslint-disable-line max-len
			}
		}
	}
	ipiv = new Int32Array( 70 );
	info = zsytrfAa( 'upper', 70, A, 1, 70, 0, ipiv, 1, 0 );
	assert.equal( info, tc.info, 'info' );
	assertArrayClose( view, tc.a, 1e-10, 'a' );
});

test( 'zsytrf_aa: ndarray non-trivial offset (lower)', function t() {
	var ipiv;
	var info;
	var view;
	var pad;
	var tc;
	var A;
	var k;

	pad = 3;
	tc = FIXTURES[ '5x5_lower' ];
	A = new Complex128Array( 25 + pad );
	view = reinterpret( A, 0 );

	// Same 5x5 lower data starting at complex offset `pad`.
	view[ ( pad * 2 ) + 0 ] = 1.0;
	view[ ( pad * 2 ) + 1 ] = 0.1;
	view[ ( pad * 2 ) + 2 ] = -2.0;
	view[ ( pad * 2 ) + 3 ] = 0.2;
	view[ ( pad * 2 ) + 6 ] = 3.0;
	view[ ( pad * 2 ) + 7 ] = -0.1;
	view[ ( pad * 2 ) + 8 ] = 1.0;
	view[ ( pad * 2 ) + 9 ] = 0.4;
	view[ ( pad * 2 ) + 14 ] = 4.0;
	view[ ( pad * 2 ) + 15 ] = -0.3;
	view[ ( pad * 2 ) + 16 ] = -1.0;
	view[ ( pad * 2 ) + 17 ] = 0.5;
	view[ ( pad * 2 ) + 18 ] = 2.0;
	view[ ( pad * 2 ) + 19 ] = 0.0;
	view[ ( pad * 2 ) + 24 ] = -3.0;
	view[ ( pad * 2 ) + 25 ] = 0.2;
	view[ ( pad * 2 ) + 26 ] = 2.0;
	view[ ( pad * 2 ) + 27 ] = -0.1;
	view[ ( pad * 2 ) + 36 ] = 1.0;
	view[ ( pad * 2 ) + 37 ] = 0.3;
	view[ ( pad * 2 ) + 38 ] = -2.0;
	view[ ( pad * 2 ) + 39 ] = 0.0;
	view[ ( pad * 2 ) + 48 ] = 4.0;
	view[ ( pad * 2 ) + 49 ] = -0.2;
	ipiv = new Int32Array( 5 + 1 );
	info = zsytrfAa( 'lower', 5, A, 1, 5, pad, ipiv, 1, 1 );
	assert.equal( info, tc.info, 'info' );
	for ( k = 0; k < 50; k++ ) {
		assertClose( view[ ( pad * 2 ) + k ], tc.a[ k ], 1e-12, 'a[' + k + ']' );
	}
});

test( 'zsytrf_aa: row-major upper layout produces finite output', function t() {
	var info;
	var ipiv;
	var view;
	var A;
	var i;
	var j;

	// Row-major upper: strideA1 = N, strideA2 = 1.
	A = new Complex128Array( 25 );
	view = reinterpret( A, 0 );
	view[ 0 ] = 1.0;
	view[ 10 ] = -2.0;
	view[ 11 ] = 0.2;
	view[ 22 ] = 4.0;
	view[ 23 ] = -0.3;
	view[ 24 ] = -3.0;
	view[ 25 ] = 0.2;
	view[ 30 ] = 3.0;
	view[ 31 ] = -0.1;
	view[ 32 ] = -1.0;
	view[ 33 ] = 0.5;
	view[ 34 ] = 2.0;
	view[ 35 ] = -0.1;
	view[ 36 ] = 1.0;
	view[ 37 ] = 0.3;
	view[ 40 ] = 1.0;
	view[ 41 ] = 0.4;
	view[ 42 ] = 2.0;
	view[ 43 ] = 0.0;
	view[ 46 ] = -2.0;
	view[ 47 ] = 0.0;
	view[ 48 ] = 4.0;
	view[ 49 ] = -0.2;
	ipiv = new Int32Array( 5 );
	info = zsytrfAa( 'upper', 5, A, 5, 1, 0, ipiv, 1, 0 );
	assert.equal( info, 0, 'info' );

	// Verify referenced upper-triangle entries are finite (sanity check stride-swap path).
	for ( i = 0; i < 5; i++ ) {
		for ( j = i; j < 5; j++ ) {
			assert.ok( isFinite( view[ ( ( i * 5 ) + j ) * 2 ] ), 'a re finite' );
			assert.ok( isFinite( view[ ( ( ( i * 5 ) + j ) * 2 ) + 1 ] ), 'a im finite' );
		}
	}
});
