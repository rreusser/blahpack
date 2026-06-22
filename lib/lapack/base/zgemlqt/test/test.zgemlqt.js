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

import { readFileSync } from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import zgemlqt from './../lib/zgemlqt.js';


// FIXTURES //

var fixtureDir = path.join( import.meta.dirname, '..', '..', '..', '..', '..', 'test', 'fixtures' );
var rawLines = readFileSync( path.join( fixtureDir, 'zgemlqt.jsonl' ), 'utf8' ).trim().split( '\n' );
var fixture = rawLines.map( parseLine );


// FUNCTIONS //

/**
* Parse a JSON line into a fixture case.
*
* @private
* @param {string} line - a JSON-encoded fixture case
* @returns {Object} parsed fixture case
*/
function parseLine( line ) {
	return JSON.parse( line );
}

/**
* Locate a fixture case by name.
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
* Build a `Complex128Array` from an interleaved `[re,im,...]` array.
*
* @private
* @param {Array} arr - interleaved real/imaginary values
* @returns {Complex128Array} complex array view over a fresh buffer
*/
function toComplex( arr ) {
	var out = new Float64Array( arr.length );
	var i;
	for ( i = 0; i < arr.length; i++ ) {
		out[ i ] = arr[ i ];
	}
	return new Complex128Array( out.buffer );
}

/**
* Build a complex M-by-N column-major identity.
*
* @private
* @param {NonNegativeInteger} m - rows
* @param {NonNegativeInteger} n - columns
* @param {NonNegativeInteger} ld - leading dimension
* @returns {Complex128Array} identity matrix in column-major form
*/
function eye( m, n, ld ) {
	var Cv;
	var C;
	var k;
	var i;
	C = new Complex128Array( ld * n );
	Cv = reinterpret( C, 0 );
	k = ( m < n ) ? m : n;
	for ( i = 0; i < k; i++ ) {
		Cv[ ( ( ( i * ld ) + i ) * 2 ) ] = 1.0;
	}
	return C;
}

/**
* Asserts that two numbers are approximately equal.
*
* @private
* @param {number} actual - actual value
* @param {number} expected - expected value
* @param {number} tol - relative tolerance
* @param {string} msg - assertion message
*/
function assertClose( actual, expected, tol, msg ) {
	var relErr = Math.abs( actual - expected ) / Math.max( Math.abs( expected ), 1.0 );
	assert.ok( relErr <= tol, msg + ': expected ' + expected + ', got ' + actual );
}


// TESTS //

test( 'zgemlqt is a function', function t() {
	assert.strictEqual( typeof zgemlqt, 'function', 'is a function' );
});

test( 'zgemlqt has expected arity', function t() {
	assert.strictEqual( zgemlqt.length, 15, 'has expected arity' );
});

test( 'zgemlqt throws TypeError for invalid order', function t() {
	assert.throws( function throws() {
		zgemlqt( 'invalid', 'left', 'no-transpose', 2, 2, 2, 2, new Complex128Array( 4 ), 2, new Complex128Array( 4 ), 2, new Complex128Array( 4 ), 2, new Complex128Array( 4 ), 2 );
	}, TypeError );
});

test( 'zgemlqt throws TypeError for invalid side', function t() {
	assert.throws( function throws() {
		zgemlqt( 'row-major', 'invalid', 'no-transpose', 2, 2, 2, 2, new Complex128Array( 4 ), 2, new Complex128Array( 4 ), 2, new Complex128Array( 4 ), 2, new Complex128Array( 4 ), 2 );
	}, TypeError );
});

test( 'zgemlqt throws TypeError for invalid trans (transpose)', function t() {
	assert.throws( function throws() {
		zgemlqt( 'row-major', 'left', 'transpose', 2, 2, 2, 2, new Complex128Array( 4 ), 2, new Complex128Array( 4 ), 2, new Complex128Array( 4 ), 2, new Complex128Array( 4 ), 2 );
	}, TypeError );
});

test( 'zgemlqt throws RangeError for negative M', function t() {
	assert.throws( function throws() {
		zgemlqt( 'row-major', 'left', 'no-transpose', -1, 2, 2, 2, new Complex128Array( 4 ), 2, new Complex128Array( 4 ), 2, new Complex128Array( 4 ), 2, new Complex128Array( 4 ), 2 );
	}, RangeError );
});

test( 'zgemlqt throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		zgemlqt( 'column-major', 'left', 'no-transpose', 2, -1, 2, 2, new Complex128Array( 4 ), 2, new Complex128Array( 4 ), 2, new Complex128Array( 4 ), 2, new Complex128Array( 4 ), 2 );
	}, RangeError );
});

test( 'zgemlqt throws RangeError for negative K', function t() {
	assert.throws( function throws() {
		zgemlqt( 'column-major', 'left', 'no-transpose', 2, 2, -1, 2, new Complex128Array( 4 ), 2, new Complex128Array( 4 ), 2, new Complex128Array( 4 ), 2, new Complex128Array( 4 ), 2 );
	}, RangeError );
});

test( 'zgemlqt throws RangeError for mb < 1', function t() {
	assert.throws( function throws() {
		zgemlqt( 'column-major', 'left', 'no-transpose', 4, 4, 3, 0, new Complex128Array( 12 ), 3, new Complex128Array( 6 ), 2, new Complex128Array( 16 ), 4, new Complex128Array( 8 ), 1 );
	}, RangeError );
});

test( 'zgemlqt throws RangeError for mb > K', function t() {
	assert.throws( function throws() {
		zgemlqt( 'column-major', 'left', 'no-transpose', 4, 4, 3, 5, new Complex128Array( 12 ), 3, new Complex128Array( 6 ), 2, new Complex128Array( 16 ), 4, new Complex128Array( 8 ), 1 );
	}, RangeError );
});

test( 'zgemlqt throws RangeError for K > M when side=left', function t() {
	assert.throws( function throws() {
		zgemlqt( 'column-major', 'left', 'no-transpose', 2, 4, 3, 2, new Complex128Array( 12 ), 3, new Complex128Array( 6 ), 2, new Complex128Array( 16 ), 4, new Complex128Array( 8 ), 1 );
	}, RangeError );
});

test( 'zgemlqt throws RangeError for K > N when side=right', function t() {
	assert.throws( function throws() {
		zgemlqt( 'column-major', 'right', 'no-transpose', 4, 2, 3, 2, new Complex128Array( 12 ), 3, new Complex128Array( 6 ), 2, new Complex128Array( 16 ), 4, new Complex128Array( 8 ), 1 );
	}, RangeError );
});

test( 'zgemlqt throws RangeError for LDV too small (column-major)', function t() {
	assert.throws( function throws() {
		zgemlqt( 'column-major', 'left', 'no-transpose', 4, 4, 3, 2, new Complex128Array( 12 ), 1, new Complex128Array( 6 ), 2, new Complex128Array( 16 ), 4, new Complex128Array( 8 ), 1 );
	}, RangeError );
});

test( 'zgemlqt throws RangeError for LDV too small (row-major)', function t() {
	assert.throws( function throws() {
		zgemlqt( 'row-major', 'left', 'no-transpose', 4, 4, 3, 2, new Complex128Array( 12 ), 1, new Complex128Array( 6 ), 2, new Complex128Array( 16 ), 4, new Complex128Array( 8 ), 1 );
	}, RangeError );
});

test( 'zgemlqt throws RangeError for LDT too small (column-major)', function t() {
	assert.throws( function throws() {
		zgemlqt( 'column-major', 'left', 'no-transpose', 4, 4, 3, 2, new Complex128Array( 12 ), 3, new Complex128Array( 6 ), 1, new Complex128Array( 16 ), 4, new Complex128Array( 8 ), 1 );
	}, RangeError );
});

test( 'zgemlqt throws RangeError for LDT too small (row-major)', function t() {
	assert.throws( function throws() {
		zgemlqt( 'row-major', 'left', 'no-transpose', 4, 4, 3, 2, new Complex128Array( 12 ), 4, new Complex128Array( 6 ), 1, new Complex128Array( 16 ), 4, new Complex128Array( 8 ), 1 );
	}, RangeError );
});

test( 'zgemlqt throws RangeError for LDC too small (column-major)', function t() {
	assert.throws( function throws() {
		zgemlqt( 'column-major', 'left', 'no-transpose', 4, 4, 3, 2, new Complex128Array( 12 ), 3, new Complex128Array( 6 ), 2, new Complex128Array( 16 ), 1, new Complex128Array( 8 ), 1 );
	}, RangeError );
});

test( 'zgemlqt throws RangeError for LDC too small (row-major)', function t() {
	assert.throws( function throws() {
		zgemlqt( 'row-major', 'left', 'no-transpose', 4, 4, 3, 2, new Complex128Array( 12 ), 4, new Complex128Array( 6 ), 3, new Complex128Array( 16 ), 1, new Complex128Array( 8 ), 1 );
	}, RangeError );
});

test( 'zgemlqt: row-major succeeds (K=0 quick return on row-major path)', function t() {
	// K=0 short-circuits immediately so we just need the row-major LD remap to be exercised.
	var WORK;
	var info;
	var V;
	var T;
	var C;
	WORK = new Complex128Array( 8 );
	V = new Complex128Array( 16 );
	T = new Complex128Array( 16 );
	C = new Complex128Array( 16 );
	info = zgemlqt( 'row-major', 'left', 'no-transpose', 4, 4, 0, 1, V, 4, T, 1, C, 4, WORK, 1 );
	assert.equal( info, 0 );
});

test( 'zgemlqt: column-major succeeds (Q*I via small fixture)', function t() {
	var WORK;
	var info;
	var tc;
	var Cv;
	var f;
	var V;
	var T;
	var C;
	var i;

	tc = findCase( 'left_notrans' );
	f = findCase( 'lq_factors_small' );
	V = toComplex( f.v );
	T = toComplex( f.t );
	C = eye( 4, 4, 4 );
	WORK = new Complex128Array( 4 * 2 );
	info = zgemlqt( 'column-major', 'left', 'no-transpose', 4, 4, 3, 2, V, 3, T, 2, C, 4, WORK, 1 );
	assert.equal( info, tc.info );
	Cv = reinterpret( C, 0 );
	for ( i = 0; i < tc.c.length; i++ ) {
		assertClose( Cv[ i ], tc.c[ i ], 1e-13, 'c[' + i + ']' );
	}
});
