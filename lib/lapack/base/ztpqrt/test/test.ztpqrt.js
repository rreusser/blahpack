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

import test from 'node:test';
import assert from 'node:assert/strict';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import ztpqrt from './../lib/ztpqrt.js';


// FUNCTIONS //

/**
* Build a packed column-major complex matrix of shape `m`-by-`n` from row-major dense complex entries (each entry is `[re, im]`).
*
* @private
* @param {NonNegativeInteger} m - number of rows
* @param {NonNegativeInteger} n - number of columns
* @param {Array<Array<Array<number>>>} rows - dense entries laid out row-by-row
* @returns {Complex128Array} packed matrix (column-major)
*/
function packCol( m, n, rows ) {
	var view;
	var out;
	var idx;
	var i;
	var j;
	out = new Complex128Array( m * n );
	view = reinterpret( out, 0 );
	for ( i = 0; i < m; i++ ) {
		for ( j = 0; j < n; j++ ) {
			idx = ( ( j * m ) + i ) * 2;
			view[ idx ] = rows[ i ][ j ][ 0 ];
			view[ idx + 1 ] = rows[ i ][ j ][ 1 ];
		}
	}
	return out;
}

/**
* Build a packed row-major complex matrix of shape `m`-by-`n` from row-major dense complex entries.
*
* @private
* @param {NonNegativeInteger} m - number of rows
* @param {NonNegativeInteger} n - number of columns
* @param {Array<Array<Array<number>>>} rows - dense entries laid out row-by-row
* @returns {Complex128Array} packed matrix (row-major)
*/
function packRow( m, n, rows ) {
	var view;
	var out;
	var idx;
	var i;
	var j;
	out = new Complex128Array( m * n );
	view = reinterpret( out, 0 );
	for ( i = 0; i < m; i++ ) {
		for ( j = 0; j < n; j++ ) {
			idx = ( ( i * n ) + j ) * 2;
			view[ idx ] = rows[ i ][ j ][ 0 ];
			view[ idx + 1 ] = rows[ i ][ j ][ 1 ];
		}
	}
	return out;
}


// TESTS //

test( 'ztpqrt is a function', function t() {
	assert.strictEqual( typeof ztpqrt, 'function', 'is a function' );
});

test( 'ztpqrt has expected arity', function t() {
	assert.strictEqual( ztpqrt.length, 12, 'has expected arity' );
});

test( 'ztpqrt throws TypeError for invalid order', function t() {
	assert.throws( function bad() {
		ztpqrt( 'invalid', 2, 2, 0, 1, new Complex128Array( 4 ), 2, new Complex128Array( 4 ), 2, new Complex128Array( 4 ), 1, new Complex128Array( 4 ) );
	}, TypeError );
});

test( 'ztpqrt throws RangeError for negative M', function t() {
	assert.throws( function bad() {
		ztpqrt( 'column-major', -1, 2, 0, 1, new Complex128Array( 4 ), 2, new Complex128Array( 4 ), 2, new Complex128Array( 4 ), 1, new Complex128Array( 4 ) );
	}, RangeError );
});

test( 'ztpqrt throws RangeError for negative N', function t() {
	assert.throws( function bad() {
		ztpqrt( 'column-major', 2, -1, 0, 1, new Complex128Array( 4 ), 2, new Complex128Array( 4 ), 2, new Complex128Array( 4 ), 1, new Complex128Array( 4 ) );
	}, RangeError );
});

test( 'ztpqrt throws RangeError when l is out of range', function t() {
	assert.throws( function bad() {
		ztpqrt( 'column-major', 2, 2, 5, 1, new Complex128Array( 4 ), 2, new Complex128Array( 4 ), 2, new Complex128Array( 4 ), 1, new Complex128Array( 4 ) );
	}, RangeError );
});

test( 'ztpqrt throws RangeError when nb < 1', function t() {
	assert.throws( function bad() {
		ztpqrt( 'column-major', 2, 2, 0, 0, new Complex128Array( 4 ), 2, new Complex128Array( 4 ), 2, new Complex128Array( 4 ), 1, new Complex128Array( 4 ) );
	}, RangeError );
});

test( 'ztpqrt throws RangeError when LDA is too small', function t() {
	// A is N-by-N (square), so LDA >= N for both layouts
	assert.throws( function bad() {
		ztpqrt( 'column-major', 3, 3, 0, 1, new Complex128Array( 9 ), 1, new Complex128Array( 9 ), 3, new Complex128Array( 3 ), 1, new Complex128Array( 3 ) );
	}, RangeError );
});

test( 'ztpqrt throws RangeError when LDB is too small (column-major)', function t() {
	// LDB >= M for column-major
	assert.throws( function bad() {
		ztpqrt( 'column-major', 3, 3, 0, 1, new Complex128Array( 9 ), 3, new Complex128Array( 9 ), 1, new Complex128Array( 3 ), 1, new Complex128Array( 3 ) );
	}, RangeError );
});

test( 'ztpqrt throws RangeError when LDB is too small (row-major)', function t() {
	// LDB >= N for row-major
	assert.throws( function bad() {
		ztpqrt( 'row-major', 3, 3, 0, 1, new Complex128Array( 9 ), 3, new Complex128Array( 9 ), 1, new Complex128Array( 3 ), 1, new Complex128Array( 3 ) );
	}, RangeError );
});

test( 'ztpqrt throws RangeError when LDT < nb (column-major)', function t() {
	assert.throws( function bad() {
		ztpqrt( 'column-major', 3, 3, 0, 2, new Complex128Array( 9 ), 3, new Complex128Array( 9 ), 3, new Complex128Array( 6 ), 1, new Complex128Array( 6 ) );
	}, RangeError );
});

test( 'ztpqrt: column-major dispatch', function t() {
	var info;
	var A;
	var B;
	var T;
	var W;
	A = packCol( 3, 3, [
		[ [ 2.0, 0.1 ], [ 0.5, 0.0 ], [ 0.25, -0.1 ] ],
		[ [ 0.0, 0.0 ], [ 3.0, -0.2 ], [ 0.75, 0.0 ] ],
		[ [ 0.0, 0.0 ], [ 0.0, 0.0 ], [ 4.0, 0.3 ] ]
	]);
	B = packCol( 4, 3, [
		[ [ 1.0, 0.3 ], [ 0.5, 0.2 ], [ 0.25, -0.1 ] ],
		[ [ 0.3, -0.1 ], [ 1.1, 0.0 ], [ 0.6, 0.1 ] ],
		[ [ 0.7, 0.2 ], [ 0.4, 0.0 ], [ 1.2, 0.3 ] ],
		[ [ 0.2, 0.0 ], [ 0.3, -0.1 ], [ 0.4, 0.2 ] ]
	]);
	T = new Complex128Array( 2 * 3 );
	W = new Complex128Array( 2 * 3 );
	info = ztpqrt( 'column-major', 4, 3, 0, 2, A, 3, B, 4, T, 2, W );
	assert.strictEqual( info, 0, 'INFO=0' );
});

test( 'ztpqrt: row-major dispatch', function t() {
	var info;
	var A;
	var B;
	var T;
	var W;
	A = packRow( 3, 3, [
		[ [ 2.0, 0.1 ], [ 0.5, 0.0 ], [ 0.25, -0.1 ] ],
		[ [ 0.0, 0.0 ], [ 3.0, -0.2 ], [ 0.75, 0.0 ] ],
		[ [ 0.0, 0.0 ], [ 0.0, 0.0 ], [ 4.0, 0.3 ] ]
	]);
	B = packRow( 4, 3, [
		[ [ 1.0, 0.3 ], [ 0.5, 0.2 ], [ 0.25, -0.1 ] ],
		[ [ 0.3, -0.1 ], [ 1.1, 0.0 ], [ 0.6, 0.1 ] ],
		[ [ 0.7, 0.2 ], [ 0.4, 0.0 ], [ 1.2, 0.3 ] ],
		[ [ 0.2, 0.0 ], [ 0.3, -0.1 ], [ 0.4, 0.2 ] ]
	]);
	T = new Complex128Array( 2 * 3 );
	W = new Complex128Array( 2 * 3 );
	info = ztpqrt( 'row-major', 4, 3, 0, 2, A, 3, B, 3, T, 3, W );
	assert.strictEqual( info, 0, 'INFO=0' );
});
