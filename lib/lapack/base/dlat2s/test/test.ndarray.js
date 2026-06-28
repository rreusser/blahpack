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
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Float32Array from '@stdlib/array/float32/lib/index.js';
import dlat2s from './../lib/ndarray.js';


// FIXTURES //

var fixtureDir = path.join( import.meta.dirname, '..', '..', '..', '..', '..', 'test', 'fixtures' );
var raw = readFileSync( path.join( fixtureDir, 'dlat2s.jsonl' ), 'utf8' ); // eslint-disable-line max-len
var lines = raw.trim().split( '\n' );
var fixture = lines.map( parseLine );


// FUNCTIONS //

/**
* Parses a single fixture line.
*
* @private
* @param {string} line - JSON line
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
	var i;
	for ( i = 0; i < fixture.length; i++ ) {
		if ( fixture[ i ].name === name ) {
			return fixture[ i ];
		}
	}
	return null;
}

/**
* Builds the 3x3 input matrix used by the upper_3x3 / lower_3x3 cases.
*
* @private
* @returns {Float64Array} column-major input `A`
*/
function buildA33() {
	var A;
	var i;
	A = new Float64Array( 9 );
	for ( i = 0; i < 9; i++ ) {
		A[ i ] = ( i + 1 ) * 1.25;
	}
	return A;
}


// TESTS //

test( 'dlat2s ndarray: is a function', function t() {
	assert.strictEqual( typeof dlat2s, 'function' );
});

test( 'dlat2s ndarray: throws for invalid uplo', function t() {
	assert.throws( function throws() {
		dlat2s( 'bogus', 2, new Float64Array( 4 ), 1, 2, 0, new Float32Array( 4 ), 1, 2, 0 );
	}, {
		'name': 'TypeError'
	});
});

test( 'dlat2s ndarray: throws for negative N', function t() {
	assert.throws( function throws() {
		dlat2s( 'upper', -1, new Float64Array( 4 ), 1, 2, 0, new Float32Array( 4 ), 1, 2, 0 );
	}, {
		'name': 'RangeError'
	});
});

test( 'dlat2s ndarray: upper_3x3 matches fixture', function t() {
	var info;
	var SA;
	var tc;
	var A;
	var i;
	tc = findCase( 'upper_3x3' );
	A = buildA33();
	SA = new Float32Array( 9 );
	info = dlat2s( 'upper', 3, A, 1, 3, 0, SA, 1, 3, 0 );
	assert.strictEqual( info, tc.info );
	for ( i = 0; i < 9; i++ ) {
		assert.strictEqual( SA[ i ], tc.sa[ i ] );
	}
});

test( 'dlat2s ndarray: lower_3x3 matches fixture', function t() {
	var info;
	var SA;
	var tc;
	var A;
	var i;
	tc = findCase( 'lower_3x3' );
	A = buildA33();
	SA = new Float32Array( 9 );
	info = dlat2s( 'lower', 3, A, 1, 3, 0, SA, 1, 3, 0 );
	assert.strictEqual( info, tc.info );
	for ( i = 0; i < 9; i++ ) {
		assert.strictEqual( SA[ i ], tc.sa[ i ] );
	}
});

test( 'dlat2s ndarray: n_zero quick return', function t() {
	var info;
	var SA;
	var tc;
	var A;
	var i;
	tc = findCase( 'n_zero' );
	A = buildA33();
	SA = new Float32Array( 9 );
	info = dlat2s( 'upper', 0, A, 1, 3, 0, SA, 1, 3, 0 );
	assert.strictEqual( info, tc.info );
	for ( i = 0; i < 9; i++ ) {
		assert.strictEqual( SA[ i ], tc.sa[ i ] );
	}
});

test( 'dlat2s ndarray: n_one matches fixture', function t() {
	var info;
	var SA;
	var tc;
	var A;
	tc = findCase( 'n_one' );
	A = buildA33();
	SA = new Float32Array( 9 );
	info = dlat2s( 'upper', 1, A, 1, 3, 0, SA, 1, 3, 0 );
	assert.strictEqual( info, tc.info );
	assert.strictEqual( SA[ 0 ], tc.sa[ 0 ] );
});

test( 'dlat2s ndarray: overflow_upper returns info=1', function t() {
	var info;
	var SA;
	var tc;
	var A;
	tc = findCase( 'overflow_upper' );
	A = new Float64Array( 9 );
	SA = new Float32Array( 9 );
	A[ 0 ] = 1.0;
	A[ 3 ] = 1e300;
	A[ 4 ] = 2.0;
	A[ 6 ] = 3.0;
	A[ 7 ] = 4.0;
	A[ 8 ] = 5.0;
	info = dlat2s( 'upper', 3, A, 1, 3, 0, SA, 1, 3, 0 );
	assert.strictEqual( info, tc.info );
});

test( 'dlat2s ndarray: overflow_lower returns info=1', function t() {
	var info;
	var SA;
	var tc;
	var A;
	tc = findCase( 'overflow_lower' );
	A = new Float64Array( 9 );
	SA = new Float32Array( 9 );
	A[ 0 ] = 1.0;
	A[ 1 ] = -1e300;
	A[ 2 ] = 2.0;
	A[ 4 ] = 3.0;
	A[ 5 ] = 4.0;
	A[ 8 ] = 5.0;
	info = dlat2s( 'lower', 3, A, 1, 3, 0, SA, 1, 3, 0 );
	assert.strictEqual( info, tc.info );
});

test( 'dlat2s ndarray: lower_4x4 matches fixture', function t() {
	var info;
	var SA;
	var tc;
	var A;
	var i;
	tc = findCase( 'lower_4x4' );
	A = new Float64Array( 16 );
	SA = new Float32Array( 16 );
	for ( i = 0; i < 16; i++ ) {
		A[ i ] = ( i + 1 ) * 0.5;
	}
	info = dlat2s( 'lower', 4, A, 1, 4, 0, SA, 1, 4, 0 );
	assert.strictEqual( info, tc.info );
	for ( i = 0; i < 16; i++ ) {
		assert.strictEqual( SA[ i ], tc.sa[ i ] );
	}
});

test( 'dlat2s ndarray: row-major upper via swapped strides', function t() {
	// Logical matrix identical to buildA33 (column-major) but stored row-major.
	var info;
	var SA;
	var A;
	A = new Float64Array([
		1.25,
		5.0,
		8.75,
		2.5,
		6.25,
		10.0,
		3.75,
		7.5,
		11.25
	]);
	SA = new Float32Array( 9 );
	info = dlat2s( 'upper', 3, A, 3, 1, 0, SA, 3, 1, 0 );
	assert.strictEqual( info, 0 );
	assert.strictEqual( SA[ 0 ], 1.25 );
	assert.strictEqual( SA[ 1 ], 5.0 );
	assert.strictEqual( SA[ 2 ], 8.75 );
	assert.strictEqual( SA[ 4 ], 6.25 );
	assert.strictEqual( SA[ 5 ], 10.0 );
	assert.strictEqual( SA[ 8 ], 11.25 );
});

test( 'dlat2s ndarray: fround rounds to single precision', function t() {
	// 0.1 is not exactly representable; f32 and f64 differ.
	var info;
	var SA;
	var A;
	A = new Float64Array( [ 0.1, 0.0, 0.0, 0.2 ] );
	SA = new Float32Array( 4 );
	info = dlat2s( 'upper', 2, A, 1, 2, 0, SA, 1, 2, 0 );
	assert.strictEqual( info, 0 );
	assert.strictEqual( SA[ 0 ], Math.fround( 0.1 ) );
	assert.strictEqual( SA[ 3 ], Math.fround( 0.2 ) );
});
