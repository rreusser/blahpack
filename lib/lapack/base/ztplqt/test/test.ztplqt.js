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

import test from 'node:test';
import assert from 'node:assert/strict';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import ztplqt from './../lib/ztplqt.js';


// TESTS //

test( 'ztplqt is a function', function t() {
	assert.strictEqual( typeof ztplqt, 'function', 'is a function' );
});

test( 'ztplqt has expected arity', function t() {
	assert.strictEqual( ztplqt.length, 12, 'has expected arity' );
});

test( 'ztplqt throws TypeError for invalid order', function t() {
	assert.throws( function bad() {
		ztplqt( 'invalid', 2, 2, 0, 1, new Complex128Array( 4 ), 2, new Complex128Array( 4 ), 2, new Complex128Array( 4 ), 1, new Complex128Array( 4 ) );
	}, TypeError );
});

test( 'ztplqt throws RangeError for negative M', function t() {
	assert.throws( function bad() {
		ztplqt( 'column-major', -1, 2, 0, 1, new Complex128Array( 4 ), 2, new Complex128Array( 4 ), 2, new Complex128Array( 4 ), 1, new Complex128Array( 4 ) );
	}, RangeError );
});

test( 'ztplqt throws RangeError for negative N', function t() {
	assert.throws( function bad() {
		ztplqt( 'column-major', 2, -1, 0, 1, new Complex128Array( 4 ), 2, new Complex128Array( 4 ), 2, new Complex128Array( 4 ), 1, new Complex128Array( 4 ) );
	}, RangeError );
});

test( 'ztplqt throws RangeError when l is out of range', function t() {
	assert.throws( function bad() {
		ztplqt( 'column-major', 2, 2, 5, 1, new Complex128Array( 4 ), 2, new Complex128Array( 4 ), 2, new Complex128Array( 4 ), 1, new Complex128Array( 4 ) );
	}, RangeError );
});

test( 'ztplqt throws RangeError when mb < 1', function t() {
	assert.throws( function bad() {
		ztplqt( 'column-major', 2, 2, 0, 0, new Complex128Array( 4 ), 2, new Complex128Array( 4 ), 2, new Complex128Array( 4 ), 1, new Complex128Array( 4 ) );
	}, RangeError );
});

test( 'ztplqt throws RangeError when LDA is too small (column-major)', function t() {
	assert.throws( function bad() {
		ztplqt( 'column-major', 3, 3, 0, 1, new Complex128Array( 9 ), 1, new Complex128Array( 9 ), 3, new Complex128Array( 3 ), 1, new Complex128Array( 3 ) );
	}, RangeError );
});

test( 'ztplqt throws RangeError when LDA is too small (row-major)', function t() {
	assert.throws( function bad() {
		ztplqt( 'row-major', 3, 3, 0, 1, new Complex128Array( 9 ), 1, new Complex128Array( 9 ), 3, new Complex128Array( 3 ), 1, new Complex128Array( 3 ) );
	}, RangeError );
});

test( 'ztplqt throws RangeError when LDB is too small (column-major)', function t() {
	assert.throws( function bad() {
		ztplqt( 'column-major', 3, 3, 0, 1, new Complex128Array( 9 ), 3, new Complex128Array( 9 ), 1, new Complex128Array( 3 ), 1, new Complex128Array( 3 ) );
	}, RangeError );
});

test( 'ztplqt throws RangeError when LDB is too small (row-major)', function t() {
	assert.throws( function bad() {
		ztplqt( 'row-major', 3, 3, 0, 1, new Complex128Array( 9 ), 3, new Complex128Array( 9 ), 1, new Complex128Array( 3 ), 1, new Complex128Array( 3 ) );
	}, RangeError );
});

test( 'ztplqt throws RangeError when LDT < mb', function t() {
	assert.throws( function bad() {
		ztplqt( 'column-major', 3, 3, 0, 2, new Complex128Array( 9 ), 3, new Complex128Array( 9 ), 3, new Complex128Array( 6 ), 1, new Complex128Array( 6 ) );
	}, RangeError );
});

test( 'ztplqt: column-major dispatch', function t() {
	const A = new Complex128Array( [ 2.0, 0.1, 0.5, -0.2, 0.25, 0.1, 0.0, 0.0, 3.0, 0.3, 0.75, -0.1, 0.0, 0.0, 0.0, 0.0, 4.0, 0.2 ] );  // 3x3 col-major
	const B = new Complex128Array( [ 1.0, 0.3, 0.3, -0.1, 0.7, 0.2, 0.5, 0.2, 1.1, 0.4, 0.4, -0.2, 0.25, -0.1, 0.6, 0.1, 1.2, 0.3, 0.1, 0.05, 0.2, -0.2, 0.9, 0.1 ] );  // 3x4 col-major
	const T = new Complex128Array( 2 * 3 );
	const W = new Complex128Array( 2 * 3 );
	const info = ztplqt( 'column-major', 3, 4, 0, 2, A, 3, B, 3, T, 2, W );
	assert.strictEqual( info, 0, 'INFO=0' );
});

test( 'ztplqt: row-major dispatch', function t() {

	// Row-major 3x3 lower for A
	const A = new Complex128Array( [ 2.0, 0.1, 0.0, 0.0, 0.0, 0.0, 0.5, -0.2, 3.0, 0.3, 0.0, 0.0, 0.25, 0.1, 0.75, -0.1, 4.0, 0.2 ] );
	const B = new Complex128Array( [ 1.0, 0.3, 0.5, 0.2, 0.25, -0.1, 0.1, 0.05, 0.3, -0.1, 1.1, 0.4, 0.6, 0.1, 0.2, -0.2, 0.7, 0.2, 0.4, -0.2, 1.2, 0.3, 0.9, 0.1 ] );  // 3x4 row-major
	const T = new Complex128Array( 2 * 3 );
	const W = new Complex128Array( 2 * 3 );
	// Row-major T is mb-by-M = 2x3, so LDT must cover its 3 columns (LDT = 2 would alias rows).
	const info = ztplqt( 'row-major', 3, 4, 0, 2, A, 3, B, 4, T, 3, W );
	assert.strictEqual( info, 0, 'INFO=0' );

	// Same factorization in column-major (identical matrix): T must agree entrywise.
	const Ac = new Complex128Array( [ 2.0, 0.1, 0.5, -0.2, 0.25, 0.1, 0.0, 0.0, 3.0, 0.3, 0.75, -0.1, 0.0, 0.0, 0.0, 0.0, 4.0, 0.2 ] );
	const Bc = new Complex128Array( [ 1.0, 0.3, 0.3, -0.1, 0.7, 0.2, 0.5, 0.2, 1.1, 0.4, 0.4, -0.2, 0.25, -0.1, 0.6, 0.1, 1.2, 0.3, 0.1, 0.05, 0.2, -0.2, 0.9, 0.1 ] );
	const Tc = new Complex128Array( 2 * 3 );
	ztplqt( 'column-major', 3, 4, 0, 2, Ac, 3, Bc, 3, Tc, 2, new Complex128Array( 2 * 3 ) );
	const tr = ( X ) => new Float64Array( X.buffer );
	const R = tr( T );
	const Cm = tr( Tc );
	let i;
	let j;
	let k;
	for ( i = 0; i < 2; i++ ) {
		for ( j = 0; j < 3; j++ ) {
			for ( k = 0; k < 2; k++ ) {
				assert.ok( Math.abs( R[ ( ( ( i * 3 ) + j ) * 2 ) + k ] - Cm[ ( ( i + ( j * 2 ) ) * 2 ) + k ] ) < 1e-14, 'T(' + i + ',' + j + ')' );
			}
		}
	}
});
