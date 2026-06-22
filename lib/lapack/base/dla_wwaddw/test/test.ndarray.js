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

/* eslint-disable no-restricted-syntax, stdlib/first-unit-test, camelcase, max-len, node/no-sync */

// MODULES //

import { readFileSync } from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import ndarray from './../lib/ndarray.js';


// FIXTURES //

var FIXTURE_PATH = path.join( import.meta.dirname, '..', '..', '..', '..', '..', 'test', 'fixtures', 'dla_wwaddw.jsonl' );
var FIXTURE = loadFixture();


// FUNCTIONS //

/**
* Loads fixture cases from the JSONL fixture file.
*
* @private
* @returns {Object} map from case name to case
*/
function loadFixture() {
	var lines;
	var raw;
	var out;
	var ln;
	var tc;
	var i;
	out = {};
	raw = readFileSync( FIXTURE_PATH, 'utf8' );
	lines = raw.split( '\n' );
	for ( i = 0; i < lines.length; i++ ) {
		ln = lines[ i ];
		if ( ln && ln.length > 0 ) {
			tc = JSON.parse( ln );
			out[ tc.name ] = tc;
		}
	}
	return out;
}

/**
* Asserts two doubles are within a relative tolerance.
*
* @private
* @param {number} actual - actual value
* @param {number} expected - expected value
* @param {number} tol - tolerance
* @param {string} msg - message
*/
function assertClose( actual, expected, tol, msg ) {
	var relErr = Math.abs( actual - expected ) / Math.max( Math.abs( expected ), 1.0 );
	assert.ok( relErr <= tol, msg + ': expected ' + expected + ', got ' + actual );
}

/**
* Asserts two arrays are element-wise close.
*
* @private
* @param {Object} actual - actual array
* @param {Object} expected - expected array
* @param {number} tol - tolerance
* @param {string} msg - message
*/
function assertArrayClose( actual, expected, tol, msg ) {
	var i;
	assert.equal( actual.length, expected.length, msg + ': length mismatch' );
	for ( i = 0; i < expected.length; i++ ) {
		assertClose( actual[ i ], expected[ i ], tol, msg + '[' + i + ']' );
	}
}


// TESTS //

test( 'main export is a function', function t() {
	assert.strictEqual( typeof ndarray, 'function', 'is a function' );
});

test( 'dla_wwaddw.ndarray throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		ndarray( -1, new Float64Array( 4 ), 1, 0, new Float64Array( 4 ), 1, 0, new Float64Array( 4 ), 1, 0 );
	}, RangeError );
});

test( 'dla_wwaddw.ndarray: basic', function t() {
	var tc = FIXTURE.basic;
	var x = new Float64Array( [ 1.0, 2.0, 3.0, 4.0, 5.0 ] );
	var y = new Float64Array( [ 0.1, 0.2, 0.3, 0.4, 0.5 ] );
	var w = new Float64Array( [ 10.0, 20.0, 30.0, 40.0, 50.0 ] );
	ndarray( 5, x, 1, 0, y, 1, 0, w, 1, 0 );
	assertArrayClose( x, tc.x, 1e-14, 'x' );
	assertArrayClose( y, tc.y, 1e-14, 'y' );
});

test( 'dla_wwaddw.ndarray: n=0 quick return', function t() {
	var tc = FIXTURE.n_zero;
	var x = new Float64Array( [ 1.0, 2.0, 3.0, 4.0, 5.0 ] );
	var y = new Float64Array( [ 0.1, 0.2, 0.3, 0.4, 0.5 ] );
	var w = new Float64Array( [ 10.0, 20.0, 30.0, 40.0, 50.0 ] );
	ndarray( 0, x, 1, 0, y, 1, 0, w, 1, 0 );
	assertArrayClose( x, tc.x, 1e-14, 'x' );
	assertArrayClose( y, tc.y, 1e-14, 'y' );
});

test( 'dla_wwaddw.ndarray: n=1', function t() {
	var tc = FIXTURE.n_one;
	var x = new Float64Array( [ 1.0 ] );
	var y = new Float64Array( [ 0.1 ] );
	var w = new Float64Array( [ 10.0 ] );
	ndarray( 1, x, 1, 0, y, 1, 0, w, 1, 0 );
	assertArrayClose( x, tc.x, 1e-14, 'x' );
	assertArrayClose( y, tc.y, 1e-14, 'y' );
});

test( 'dla_wwaddw.ndarray: negative values', function t() {
	var tc = FIXTURE.negative;
	var x = new Float64Array( [ -1.0, -2.0, -3.0, -4.0 ] );
	var y = new Float64Array( [ 0.01, -0.02, 0.03, -0.04 ] );
	var w = new Float64Array( [ 0.5, -0.5, 1.5, -1.5 ] );
	ndarray( 4, x, 1, 0, y, 1, 0, w, 1, 0 );
	assertArrayClose( x, tc.x, 1e-14, 'x' );
	assertArrayClose( y, tc.y, 1e-14, 'y' );
});

test( 'dla_wwaddw.ndarray: large values (precision behavior)', function t() {
	var tc = FIXTURE.large_values;
	var x = new Float64Array( [ 1.0e15, 2.0e15, 3.0e15 ] );
	var y = new Float64Array( [ 1.0, 2.0, 3.0 ] );
	var w = new Float64Array( [ 1.0, 2.0, 3.0 ] );
	ndarray( 3, x, 1, 0, y, 1, 0, w, 1, 0 );
	assertArrayClose( x, tc.x, 1e-14, 'x' );
	assertArrayClose( y, tc.y, 1e-14, 'y' );
});

test( 'dla_wwaddw.ndarray: zeros', function t() {
	var tc = FIXTURE.zeros;
	var x = new Float64Array( [ 0.0, 0.0, 0.0 ] );
	var y = new Float64Array( [ 0.0, 0.0, 0.0 ] );
	var w = new Float64Array( [ 0.0, 0.0, 0.0 ] );
	ndarray( 3, x, 1, 0, y, 1, 0, w, 1, 0 );
	assertArrayClose( x, tc.x, 1e-14, 'x' );
	assertArrayClose( y, tc.y, 1e-14, 'y' );
});

test( 'dla_wwaddw.ndarray: stride 2 with offsets', function t() {
	var x = new Float64Array( [ 1.0, -1.0, 2.0, -1.0, 3.0, -1.0 ] );
	var y = new Float64Array( [ 0.1, -1.0, 0.2, -1.0, 0.3, -1.0 ] );
	var w = new Float64Array( [ 10.0, -1.0, 20.0, -1.0, 30.0, -1.0 ] );
	ndarray( 3, x, 2, 0, y, 2, 0, w, 2, 0 );

	// Untouched slots preserved
	assert.equal( x[ 1 ], -1.0 );
	assert.equal( x[ 3 ], -1.0 );
	assert.equal( x[ 5 ], -1.0 );

	// Basic mutation occurred at stride positions
	assert.notEqual( x[ 0 ], 1.0 );
});

test( 'dla_wwaddw.ndarray: nonzero offset respected', function t() {
	var origSum1;
	var origSum2;
	var x;
	var y;
	var w;
	x = new Float64Array( [ 0.0, 1.0, 2.0 ] );
	y = new Float64Array( [ 0.0, 0.1, 0.2 ] );
	w = new Float64Array( [ 0.0, 10.0, 20.0 ] );
	ndarray( 2, x, 1, 1, y, 1, 1, w, 1, 1 );

	// Element 0 must be untouched
	assert.equal( x[ 0 ], 0.0 );
	assert.equal( y[ 0 ], 0.0 );

	// Doubled-single invariant
	origSum1 = 1.0 + 0.1 + 10.0;
	origSum2 = 2.0 + 0.2 + 20.0;
	assertClose( x[ 1 ] + y[ 1 ], origSum1, 1e-14, 'sum1' );
	assertClose( x[ 2 ] + y[ 2 ], origSum2, 1e-14, 'sum2' );
});

test( 'dla_wwaddw.ndarray: (X+Y)+W invariant preserved', function t() {
	var before;
	var n;
	var x;
	var y;
	var w;
	var i;
	n = 5;
	x = new Float64Array( [ 1.23e10, 4.56e10, 7.89e10, 1.11e10, 2.22e10 ] );
	y = new Float64Array( [ 1.5e-6, 2.5e-6, 3.5e-6, 4.5e-6, 5.5e-6 ] );
	w = new Float64Array( [ 1.0, 2.0, 3.0, 4.0, 5.0 ] );
	before = new Float64Array( n );
	for ( i = 0; i < n; i++ ) {
		before[ i ] = ( x[ i ] + y[ i ] ) + w[ i ];
	}
	ndarray( n, x, 1, 0, y, 1, 0, w, 1, 0 );
	for ( i = 0; i < n; i++ ) {
		assertClose( x[ i ] + y[ i ], before[ i ], 1e-14, 'invariant[' + i + ']' );
	}
});
