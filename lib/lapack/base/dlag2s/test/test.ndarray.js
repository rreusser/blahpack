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

/* eslint-disable no-restricted-syntax, stdlib/first-unit-test, max-len */

// MODULES //

import test from 'node:test';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dlag2s from './../lib/ndarray.js';
var ndarrayFn = dlag2s;


// FIXTURES //

var fixtureDir = path.join( import.meta.dirname, '..', '..', '..', '..', '..', 'test', 'fixtures' );
var lines = readFileSync( path.join( fixtureDir, 'dlag2s.jsonl' ), 'utf8' ).trim().split( '\n' ); // eslint-disable-line node/no-sync
var fixture = lines.map( parseLine );


// FUNCTIONS //

/**
* Parses a single fixture line.
*
* @private
* @param {string} line - raw JSON line
* @returns {Object} parsed case
*/
function parseLine( line ) {
	return JSON.parse( line );
}

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
* Asserts that two arrays agree to within an absolute tolerance.
*
* @private
* @param {Float64Array} actual - actual values
* @param {Array<number>} expected - expected values
* @param {number} tol - absolute tolerance
* @param {string} msg - failure message
*/
function assertArrayClose( actual, expected, tol, msg ) {
	var i;
	assert.equal( actual.length, expected.length, msg + ': length mismatch' );
	for ( i = 0; i < expected.length; i++ ) {
		assert.ok( Math.abs( actual[ i ] - expected[ i ] ) <= tol, msg + '[' + i + ']: expected ' + expected[ i ] + ', got ' + actual[ i ] );
	}
}


// TESTS //

test( 'base is a function', function t() {
	assert.strictEqual( typeof dlag2s, 'function', 'is a function' );
});

test( 'ndarray is a function', function t() {
	assert.strictEqual( typeof ndarrayFn, 'function', 'is a function' );
});

test( 'dlag2s: basic_3x3 (column-major)', function t() {
	var info;
	var tc = findCase( 'basic_3x3' );
	var SA = new Float64Array( 9 );
	var A = new Float64Array( 9 );
	var i;
	for ( i = 0; i < 9; i++ ) {
		A[ i ] = ( i + 1 ) * 0.5;
	}
	info = dlag2s( 3, 3, A, 1, 3, 0, SA, 1, 3, 0 );
	assert.strictEqual( info, tc.info, 'info' );
	assertArrayClose( SA, tc.sa, 0.0, 'sa' );
});

test( 'dlag2s: rect_2x4 (column-major)', function t() {
	var info;
	var tc = findCase( 'rect_2x4' );
	var SA = new Float64Array( 8 );
	var A = new Float64Array( 8 );
	var i;
	for ( i = 0; i < 8; i++ ) {
		A[ i ] = ( i + 1 ) - 4.5;
	}
	info = dlag2s( 2, 4, A, 1, 2, 0, SA, 1, 2, 0 );
	assert.strictEqual( info, tc.info, 'info' );
	assertArrayClose( SA, tc.sa, 0.0, 'sa' );
});

test( 'dlag2s: rect_4x2 (column-major)', function t() {
	var info;
	var tc = findCase( 'rect_4x2' );
	var SA = new Float64Array( 8 );
	var A = new Float64Array( 8 );
	var i;
	for ( i = 0; i < 8; i++ ) {
		A[ i ] = ( i + 1 ) * 2.0;
	}
	info = dlag2s( 4, 2, A, 1, 4, 0, SA, 1, 4, 0 );
	assert.strictEqual( info, tc.info, 'info' );
	assertArrayClose( SA, tc.sa, 0.0, 'sa' );
});

test( 'dlag2s: padded_lda (LDA=4, M=2, N=3)', function t() {
	var info;
	var tc = findCase( 'padded_lda' );
	var SA = new Float64Array( 12 );
	var A = new Float64Array( 12 );
	A[ 0 ] = 1.25;
	A[ 1 ] = 2.5;
	A[ 4 ] = -3.75;
	A[ 5 ] = 4.125;
	A[ 8 ] = 5.0;
	A[ 9 ] = -6.5;
	info = dlag2s( 2, 3, A, 1, 4, 0, SA, 1, 4, 0 );
	assert.strictEqual( info, tc.info, 'info' );

	// Only the M-by-N "live" portion of SA is written; padding stays at the zero-initialized value (matches fixture).
	assertArrayClose( SA, tc.sa, 0.0, 'sa' );
});

test( 'dlag2s: m_zero leaves SA untouched and returns 0', function t() {
	var info;
	var tc = findCase( 'm_zero' );
	var SA = new Float64Array( 3 );
	var A = new Float64Array( 3 );
	SA[ 0 ] = 99.0;
	info = dlag2s( 0, 3, A, 1, 1, 0, SA, 1, 1, 0 );
	assert.strictEqual( info, tc.info, 'info' );
	assert.strictEqual( SA[ 0 ], 99.0, 'SA untouched' );
});

test( 'dlag2s: n_zero leaves SA untouched and returns 0', function t() {
	var info;
	var tc = findCase( 'n_zero' );
	var SA = new Float64Array( 9 );
	var A = new Float64Array( 9 );
	SA[ 0 ] = 77.0;
	info = dlag2s( 3, 0, A, 1, 3, 0, SA, 1, 3, 0 );
	assert.strictEqual( info, tc.info, 'info' );
	assert.strictEqual( SA[ 0 ], 77.0, 'SA untouched' );
});

test( 'dlag2s: positive overflow returns info=1', function t() {
	var info;
	var tc = findCase( 'overflow_pos' );
	var SA = new Float64Array( 4 );
	var A = new Float64Array( 4 );
	A[ 0 ] = 1.0;
	A[ 1 ] = 2.0;
	A[ 2 ] = 1.0e40; // > 3.4028e38
	A[ 3 ] = 4.0;
	info = dlag2s( 2, 2, A, 1, 2, 0, SA, 1, 2, 0 );
	assert.strictEqual( info, tc.info, 'info' );
	assert.strictEqual( info, 1, 'overflow detected' );
});

test( 'dlag2s: negative overflow returns info=1', function t() {
	var info;
	var tc = findCase( 'overflow_neg' );
	var SA = new Float64Array( 4 );
	var A = new Float64Array( 4 );
	A[ 0 ] = 1.0;
	A[ 1 ] = -1.0e40;
	A[ 2 ] = 3.0;
	A[ 3 ] = 4.0;
	info = dlag2s( 2, 2, A, 1, 2, 0, SA, 1, 2, 0 );
	assert.strictEqual( info, tc.info, 'info' );
	assert.strictEqual( info, 1, 'overflow detected' );
});

test( 'dlag2s: scalar 1x1 rounds to single precision', function t() {
	var info;
	var tc = findCase( 'scalar_1x1' );
	var SA = new Float64Array( 1 );
	var A = new Float64Array( 1 );
	A[ 0 ] = 3.14159265358979;
	info = dlag2s( 1, 1, A, 1, 1, 0, SA, 1, 1, 0 );
	assert.strictEqual( info, tc.info, 'info' );

	// Must match the Fortran REAL() cast, which rounds to binary32.
	assert.strictEqual( SA[ 0 ], tc.sa[ 0 ], 'single-precision rounded value' );
	assert.notStrictEqual( SA[ 0 ], 3.14159265358979, 'differs from double input' );
});

test( 'dlag2s: row-major via ndarray wrapper', function t() {
	var info;
	var SA = new Float64Array( 6 );
	var A = new Float64Array( 6 );

	// 2x3 row-major: rows = {{1.5, -2.25, 3.125}, {4.0, -5.5, 6.75}}
	A[ 0 ] = 1.5;
	A[ 1 ] = -2.25;
	A[ 2 ] = 3.125;
	A[ 3 ] = 4.0;
	A[ 4 ] = -5.5;
	A[ 5 ] = 6.75;
	info = ndarrayFn( 2, 3, A, 3, 1, 0, SA, 3, 1, 0 );
	assert.strictEqual( info, 0, 'info' );
	assert.strictEqual( SA[ 0 ], Math.fround( 1.5 ), 'sa[0]' );
	assert.strictEqual( SA[ 2 ], Math.fround( 3.125 ), 'sa[2]' );
	assert.strictEqual( SA[ 5 ], Math.fround( 6.75 ), 'sa[5]' );
});

test( 'dlag2s: offsets are honored', function t() {
	var info;
	var SA = new Float64Array( 10 );
	var A = new Float64Array( 10 );
	A[ 4 ] = 1.25;
	A[ 5 ] = -2.5;
	A[ 6 ] = 3.75;
	A[ 7 ] = -4.5;
	info = dlag2s( 2, 2, A, 1, 2, 4, SA, 1, 2, 4 );
	assert.strictEqual( info, 0, 'info' );
	assert.strictEqual( SA[ 4 ], 1.25, 'sa[4]' );
	assert.strictEqual( SA[ 5 ], -2.5, 'sa[5]' );
	assert.strictEqual( SA[ 6 ], 3.75, 'sa[6]' );
	assert.strictEqual( SA[ 7 ], -4.5, 'sa[7]' );
	assert.strictEqual( SA[ 0 ], 0.0, 'untouched prefix' );
});

test( 'dlag2s: ndarray validates M and N', function t() {
	var SA = new Float64Array( 4 );
	var A = new Float64Array( 4 );
	assert.throws( function throws() {
		ndarrayFn( -1, 2, A, 1, 2, 0, SA, 1, 2, 0 );
	}, RangeError );
	assert.throws( function throws() {
		ndarrayFn( 2, -1, A, 1, 2, 0, SA, 1, 2, 0 );
	}, RangeError );
});
