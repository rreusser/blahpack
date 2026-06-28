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

/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import { readFileSync } from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import assert from 'node:assert/strict';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import zlarzt from './../lib/ndarray.js';


// VARIABLES //

var fixtureDir = path.join( import.meta.dirname, '..', '..', '..', '..', '..', 'test', 'fixtures' );
var lines = readFileSync( path.join( fixtureDir, 'zlarzt.jsonl' ), 'utf8' ).trim().split( '\n' ); // eslint-disable-line max-len, node/no-sync
var fixture = lines.map( function parse( line ) {
	return JSON.parse( line );
});


// FUNCTIONS //

/**
* Looks up a fixture test case by name.
*
* @private
* @param {string} name - test case name
* @returns {Object} test case
*/
function findCase( name ) {
	return fixture.find( function find( t ) {
		return t.name === name;
	});
}

/**
* Converts a typed array to a plain array.
*
* @private
* @param {Float64Array} arr - input array
* @returns {Array} output array
*/
function toArray( arr ) {
	var out;
	var i;

	out = [];
	for ( i = 0; i < arr.length; i += 1 ) {
		out.push( arr[ i ] );
	}
	return out;
}

/**
* Asserts that two values are approximately equal.
*
* @private
* @param {number} actual - actual value
* @param {number} expected - expected value
* @param {number} tol - tolerance
* @param {string} msg - error message
*/
function assertClose( actual, expected, tol, msg ) {
	var denom;
	var err;

	denom = Math.max( Math.abs( expected ), 1.0 );
	err = Math.abs( actual - expected ) / denom;
	assert.ok( err <= tol, msg + ': expected ' + expected + ', got ' + actual ); // eslint-disable-line max-len
}

/**
* Asserts that two arrays are approximately equal element-wise.
*
* @private
* @param {Array} actual - actual values
* @param {Array} expected - expected values
* @param {number} tol - tolerance
* @param {string} msg - error message
*/
function assertArrayClose( actual, expected, tol, msg ) {
	var i;

	assert.equal( actual.length, expected.length, msg + ': length mismatch' );
	for ( i = 0; i < expected.length; i += 1 ) {
		assertClose( actual[ i ], expected[ i ], tol, msg + '[' + i + ']' );
	}
}


// TESTS //

test( 'zlarzt: K=1, backward/rowwise', function t() {
	var TAU;
	var tc;
	var Tv;
	var K;
	var N;
	var V;
	var T;

	tc = findCase( 'k1_backward_rowwise' );
	K = 1;
	N = 5;

	// Column-major packing: strideV1=1 (rows), strideV2=K (columns)
	V = new Complex128Array( new Float64Array( tc.V ) );
	TAU = new Complex128Array( new Float64Array( tc.TAU ) );
	T = new Complex128Array( K * K );

	zlarzt( 'backward', 'rowwise', N, K, V, 1, K, 0, TAU, 1, 0, T, 1, K, 0 );

	Tv = reinterpret( T, 0 );
	assertArrayClose( toArray( Tv ), tc.T, 1e-14, 'T' );
});

test( 'zlarzt: K=3, backward/rowwise', function t() {
	var TAU;
	var tc;
	var Tv;
	var K;
	var N;
	var V;
	var T;

	tc = findCase( 'k3_backward_rowwise' );
	K = 3;
	N = 8;

	// Column-major packing: strideV1=1 (rows), strideV2=K (columns)
	V = new Complex128Array( new Float64Array( tc.V ) );
	TAU = new Complex128Array( new Float64Array( tc.TAU ) );
	T = new Complex128Array( K * K );

	zlarzt( 'backward', 'rowwise', N, K, V, 1, K, 0, TAU, 1, 0, T, 1, K, 0 );

	Tv = reinterpret( T, 0 );
	assertArrayClose( toArray( Tv ), tc.T, 1e-14, 'T' );
});

test( 'zlarzt: K=3, backward/rowwise, zero tau', function t() {
	var TAU;
	var tc2;
	var tc;
	var Tv;
	var K;
	var N;
	var V;
	var T;

	tc = findCase( 'k3_zero_tau' );
	K = 3;
	N = 8;

	// Same V entries as test 2
	tc2 = findCase( 'k3_backward_rowwise' );
	V = new Complex128Array( new Float64Array( tc2.V ) );
	TAU = new Complex128Array( new Float64Array( tc.TAU ) );
	T = new Complex128Array( K * K );

	// Column-major packing: strideV1=1 (rows), strideV2=K (columns)
	zlarzt( 'backward', 'rowwise', N, K, V, 1, K, 0, TAU, 1, 0, T, 1, K, 0 );

	Tv = reinterpret( T, 0 );
	assertArrayClose( toArray( Tv ), tc.T, 1e-14, 'T' );
});

test( 'zlarzt: N=0 quick return', function t() {
	var TAU;
	var Tv;
	var K;
	var V;
	var T;

	K = 2;
	T = new Complex128Array( K * K );
	V = new Complex128Array( K * 4 );
	TAU = new Complex128Array( K );
	Tv = reinterpret( T, 0 );

	// Fill T with sentinel values
	Tv[ 0 ] = 99.0;
	Tv[ 1 ] = 99.0;

	zlarzt( 'backward', 'rowwise', 0, K, V, K, 1, 0, TAU, 1, 0, T, K, 1, 0 );

	// T should be unchanged
	assert.equal( Tv[ 0 ], 99.0, 'T unchanged after N=0' );
	assert.equal( Tv[ 1 ], 99.0, 'T unchanged after N=0' );
});

test( 'zlarzt: all-zero tau', function t() {
	var TAU;
	var Tv;
	var Vv;
	var K;
	var N;
	var V;
	var T;
	var i;

	K = 2;
	N = 4;

	V = new Complex128Array( K * N );
	TAU = new Complex128Array( K ); // all zero
	T = new Complex128Array( K * K );

	// Fill V with some values
	Vv = reinterpret( V, 0 );
	Vv[ 0 ] = 1.0;
	Vv[ 1 ] = 0.5;
	Vv[ 2 ] = -0.3;
	Vv[ 3 ] = 0.2;

	// Column-major: strideV1=1 (rows), strideV2=K (columns)
	zlarzt( 'backward', 'rowwise', N, K, V, 1, K, 0, TAU, 1, 0, T, 1, K, 0 );

	// With all-zero TAU, T should be all zeros
	Tv = reinterpret( T, 0 );
	for ( i = 0; i < (2 * K * K); i += 1 ) {
		assert.equal( Tv[ i ], 0.0, 'T[' + i + '] should be zero' );
	}
});

test( 'zlarzt: non-unit strides for V', function t() {
	var Vrefv;
	var Vref;
	var TAU;
	var tc;
	var Tv;
	var Vv;
	var K;
	var N;
	var V;
	var T;
	var i;

	tc = findCase( 'k1_backward_rowwise' );
	K = 1;
	N = 5;

	// With K=1, add padding so strideV2=2 instead of 1:
	V = new Complex128Array( 2 * N );
	Vref = new Complex128Array( new Float64Array( tc.V ) );
	Vv = reinterpret( V, 0 );
	Vrefv = reinterpret( Vref, 0 );

	// Copy column-major with stride 2 between columns
	for ( i = 0; i < N; i += 1 ) {
		Vv[ (i * 4) ] = Vrefv[ (i * 2) ]; // eslint-disable-line no-mixed-operators
		Vv[ (i * 4) + 1 ] = Vrefv[ (i * 2) + 1 ]; // eslint-disable-line no-mixed-operators
	}

	TAU = new Complex128Array( new Float64Array( tc.TAU ) );
	T = new Complex128Array( K * K );

	// strideV1=1 (row stride), strideV2=2 (column stride with padding)
	zlarzt( 'backward', 'rowwise', N, K, V, 1, 2, 0, TAU, 1, 0, T, 1, K, 0 );

	Tv = reinterpret( T, 0 );
	assertArrayClose( toArray( Tv ), tc.T, 1e-14, 'T with non-unit strides' );
});
