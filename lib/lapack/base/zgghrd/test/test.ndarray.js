/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

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

import test from 'node:test';
import assert from 'node:assert/strict';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import zgghrd from './../lib/index.js';
import base from './../lib/ndarray.js';

// FIXTURES //

import basic_4x4 from './fixtures/basic_4x4.json' with { type: 'json' };
import n_equals_1 from './fixtures/n_equals_1.json' with { type: 'json' };
import no_qz_3x3 from './fixtures/no_qz_3x3.json' with { type: 'json' };
import partial_5x5 from './fixtures/partial_5x5.json' with { type: 'json' };
import accumulate_3x3 from './fixtures/accumulate_3x3.json' with { type: 'json' };
import ilo_eq_ihi from './fixtures/ilo_eq_ihi.json' with { type: 'json' };
import empty_range from './fixtures/empty_range.json' with { type: 'json' };

// FUNCTIONS //

/**
* Asserts that two arrays are element-wise approximately equal.
*
* @private
* @param {*} actual - actual value
* @param {*} expected - expected value
* @param {string} msg - assertion message
*/
function assertArrayClose( actual, expected, msg ) {
	var relErr;
	var i;
	assert.strictEqual( actual.length, expected.length, msg + ': length mismatch (' + actual.length + ' vs ' + expected.length + ')' ); // eslint-disable-line max-len
	for ( i = 0; i < expected.length; i++ ) {
		if ( expected[ i ] === 0.0 ) {
			assert.ok( Math.abs( actual[ i ] ) <= 1e-14, msg + '[' + i + ']: expected ' + expected[ i ] + ', got ' + actual[ i ] ); // eslint-disable-line max-len
		} else {
			relErr = Math.abs( actual[ i ] - expected[ i ] ) / Math.max( Math.abs( expected[ i ] ), 1.0 ); // eslint-disable-line max-len
			assert.ok( relErr <= 1e-14, msg + '[' + i + ']: expected ' + expected[ i ] + ', got ' + actual[ i ] ); // eslint-disable-line max-len
		}
	}
}

/**
* ExtractCol.
*
* @private
* @param {*} M - M
* @param {*} j - j
* @param {*} nrows - nrows
* @param {*} LDA - LDA
* @returns {*} result
*/
function extractCol( M, j, nrows, LDA ) {
	var result = [];
	var start = j * 2 * LDA;
	var i;
	for ( i = 0; i < nrows; i++ ) {
		result.push( M[ start + i * 2 ] );
		result.push( M[ start + i * 2 + 1 ] );
	}
	return result;
}

/**
* Cset.
*
* @private
* @param {*} M - M
* @param {*} LDA - LDA
* @param {*} i - i
* @param {*} j - j
* @param {*} re - re
* @param {*} im - im
*/
function cset( M, LDA, i, j, re, im ) {
	var idx = j * 2 * LDA + i * 2;
	M[ idx ] = re;
	M[ idx + 1 ] = im;
}

// TESTS //

test( 'zgghrd: main export is a function', function t() {
	assert.strictEqual( typeof zgghrd, 'function' );
});

test( 'zgghrd: attached to the main export is an `ndarray` method', function t() { // eslint-disable-line max-len
	assert.strictEqual( typeof zgghrd.ndarray, 'function' );
});

test( 'zgghrd: basic 4x4 with COMPQ=I, COMPZ=I', function t() {
	var info;
	var LDA;
	var sa1;
	var sa2;
	var tc;
	var Av;
	var Bv;
	var Qv;
	var Zv;
	var n;
	var A;
	var B;
	var Q;
	var Z;

	tc = basic_4x4;
	n = 4;
	LDA = n;
	A = new Complex128Array( LDA * n );
	B = new Complex128Array( LDA * n );
	Q = new Complex128Array( LDA * n );
	Z = new Complex128Array( LDA * n );
	Av = reinterpret( A, 0 );
	Bv = reinterpret( B, 0 );
	Qv = reinterpret( Q, 0 );
	Zv = reinterpret( Z, 0 );
	sa1 = 1;
	sa2 = LDA;
	cset( Av, LDA, 0, 0, 2.0, 1.0 );
	cset( Av, LDA, 0, 1, 1.0, 0.5 );
	cset( Av, LDA, 0, 2, 0.5, -0.5 );
	cset( Av, LDA, 0, 3, 1.0, 1.0 );
	cset( Av, LDA, 1, 0, 1.0, -1.0 );
	cset( Av, LDA, 1, 1, 3.0, 0.0 );
	cset( Av, LDA, 1, 2, 1.0, 1.0 );
	cset( Av, LDA, 1, 3, 0.5, 0.5 );
	cset( Av, LDA, 2, 0, 0.5, 0.5 );
	cset( Av, LDA, 2, 1, 2.0, -1.0 );
	cset( Av, LDA, 2, 2, 4.0, 1.0 );
	cset( Av, LDA, 2, 3, 1.0, 0.0 );
	cset( Av, LDA, 3, 0, 0.0, 1.0 );
	cset( Av, LDA, 3, 1, 1.0, 1.0 );
	cset( Av, LDA, 3, 2, 0.5, -0.5 );
	cset( Av, LDA, 3, 3, 2.0, -1.0 );
	cset( Bv, LDA, 0, 0, 3.0, 0.0 );
	cset( Bv, LDA, 0, 1, 1.0, 0.5 );
	cset( Bv, LDA, 0, 2, 0.5, 0.5 );
	cset( Bv, LDA, 0, 3, 0.0, 1.0 );
	cset( Bv, LDA, 1, 1, 2.0, 1.0 );
	cset( Bv, LDA, 1, 2, 1.0, 0.0 );
	cset( Bv, LDA, 1, 3, 0.5, -0.5 );
	cset( Bv, LDA, 2, 2, 4.0, -1.0 );
	cset( Bv, LDA, 2, 3, 1.0, 1.0 );
	cset( Bv, LDA, 3, 3, 1.0, 0.0 );
	info = base( 'initialize', 'initialize', n, 1, 4, A, sa1, sa2, 0, B, sa1, sa2, 0, Q, sa1, sa2, 0, Z, sa1, sa2, 0 ); // eslint-disable-line max-len
	assert.strictEqual( info, tc.info, 'info' );
	assertArrayClose( extractCol( Av, 0, n, LDA ), tc.A_col1, 'A_col1' );
	assertArrayClose( extractCol( Av, 1, n, LDA ), tc.A_col2, 'A_col2' );
	assertArrayClose( extractCol( Av, 2, n, LDA ), tc.A_col3, 'A_col3' );
	assertArrayClose( extractCol( Av, 3, n, LDA ), tc.A_col4, 'A_col4' );
	assertArrayClose( extractCol( Bv, 0, n, LDA ), tc.B_col1, 'B_col1' );
	assertArrayClose( extractCol( Bv, 1, n, LDA ), tc.B_col2, 'B_col2' );
	assertArrayClose( extractCol( Bv, 2, n, LDA ), tc.B_col3, 'B_col3' );
	assertArrayClose( extractCol( Bv, 3, n, LDA ), tc.B_col4, 'B_col4' );
	assertArrayClose( extractCol( Qv, 0, n, LDA ), tc.Q_col1, 'Q_col1' );
	assertArrayClose( extractCol( Qv, 1, n, LDA ), tc.Q_col2, 'Q_col2' );
	assertArrayClose( extractCol( Qv, 2, n, LDA ), tc.Q_col3, 'Q_col3' );
	assertArrayClose( extractCol( Qv, 3, n, LDA ), tc.Q_col4, 'Q_col4' );
	assertArrayClose( extractCol( Zv, 0, n, LDA ), tc.Z_col1, 'Z_col1' );
	assertArrayClose( extractCol( Zv, 1, n, LDA ), tc.Z_col2, 'Z_col2' );
	assertArrayClose( extractCol( Zv, 2, n, LDA ), tc.Z_col3, 'Z_col3' );
	assertArrayClose( extractCol( Zv, 3, n, LDA ), tc.Z_col4, 'Z_col4' );
});

test( 'zgghrd: n=1 quick return', function t() {
	var info;
	var tc;
	var Av;
	var Bv;
	var Qv;
	var Zv;
	var A;
	var B;
	var Q;
	var Z;

	tc = n_equals_1;
	A = new Complex128Array( 1 );
	B = new Complex128Array( 1 );
	Q = new Complex128Array( 1 );
	Z = new Complex128Array( 1 );
	Av = reinterpret( A, 0 );
	Bv = reinterpret( B, 0 );
	Qv = reinterpret( Q, 0 );
	Zv = reinterpret( Z, 0 );
	Av[ 0 ] = 5.0;
	Av[ 1 ] = 3.0;
	Bv[ 0 ] = 2.0;
	Bv[ 1 ] = 1.0;
	info = base( 'initialize', 'initialize', 1, 1, 1, A, 1, 1, 0, B, 1, 1, 0, Q, 1, 1, 0, Z, 1, 1, 0 ); // eslint-disable-line max-len
	assert.strictEqual( info, tc.info, 'info' );
	assertArrayClose( [ Av[ 0 ], Av[ 1 ] ], tc.A, 'A' );
	assertArrayClose( [ Bv[ 0 ], Bv[ 1 ] ], tc.B, 'B' );
	assertArrayClose( [ Qv[ 0 ], Qv[ 1 ] ], tc.Q, 'Q' );
	assertArrayClose( [ Zv[ 0 ], Zv[ 1 ] ], tc.Z, 'Z' );
});

test( 'zgghrd: no Q/Z accumulation (COMPQ=N, COMPZ=N) 3x3', function t() {
	var info;
	var LDA;
	var tc;
	var Av;
	var Bv;
	var n;
	var A;
	var B;
	var Q;
	var Z;

	tc = no_qz_3x3;
	n = 3;
	LDA = n;
	A = new Complex128Array( LDA * n );
	B = new Complex128Array( LDA * n );
	Q = new Complex128Array( LDA * n );
	Z = new Complex128Array( LDA * n );
	Av = reinterpret( A, 0 );
	Bv = reinterpret( B, 0 );
	cset( Av, LDA, 0, 0, 1.0, 0.0 );
	cset( Av, LDA, 0, 1, 2.0, 1.0 );
	cset( Av, LDA, 0, 2, 3.0, -1.0 );
	cset( Av, LDA, 1, 0, 4.0, 2.0 );
	cset( Av, LDA, 1, 1, 5.0, 0.0 );
	cset( Av, LDA, 1, 2, 6.0, 1.0 );
	cset( Av, LDA, 2, 0, 7.0, -1.0 );
	cset( Av, LDA, 2, 1, 8.0, 2.0 );
	cset( Av, LDA, 2, 2, 9.0, 0.0 );
	cset( Bv, LDA, 0, 0, 2.0, 0.0 );
	cset( Bv, LDA, 0, 1, 1.0, 1.0 );
	cset( Bv, LDA, 0, 2, 0.5, 0.0 );
	cset( Bv, LDA, 1, 1, 3.0, 0.0 );
	cset( Bv, LDA, 1, 2, 1.0, -1.0 );
	cset( Bv, LDA, 2, 2, 1.0, 0.0 );
	info = base( 'none', 'none', n, 1, 3, A, 1, LDA, 0, B, 1, LDA, 0, Q, 1, LDA, 0, Z, 1, LDA, 0 ); // eslint-disable-line max-len
	assert.strictEqual( info, tc.info, 'info' );
	assertArrayClose( extractCol( Av, 0, n, LDA ), tc.A_col1, 'A_col1' );
	assertArrayClose( extractCol( Av, 1, n, LDA ), tc.A_col2, 'A_col2' );
	assertArrayClose( extractCol( Av, 2, n, LDA ), tc.A_col3, 'A_col3' );
	assertArrayClose( extractCol( Bv, 0, n, LDA ), tc.B_col1, 'B_col1' );
	assertArrayClose( extractCol( Bv, 1, n, LDA ), tc.B_col2, 'B_col2' );
	assertArrayClose( extractCol( Bv, 2, n, LDA ), tc.B_col3, 'B_col3' );
});

test( 'zgghrd: partial reduction ILO=2, IHI=4 on 5x5', function t() {
	var info;
	var LDA;
	var tc;
	var Av;
	var Bv;
	var Qv;
	var Zv;
	var n;
	var A;
	var B;
	var Q;
	var Z;
	var i;
	var j;

	tc = partial_5x5;
	n = 5;
	LDA = n;
	A = new Complex128Array( LDA * n );
	B = new Complex128Array( LDA * n );
	Q = new Complex128Array( LDA * n );
	Z = new Complex128Array( LDA * n );
	Av = reinterpret( A, 0 );
	Bv = reinterpret( B, 0 );
	Qv = reinterpret( Q, 0 );
	Zv = reinterpret( Z, 0 );
	for ( j = 0; j < n; j++ ) {
		for ( i = 0; i < n; i++ ) {
			cset( Av, LDA, i, j, ( i + 1 ) + ( j + 1 ), ( ( i + 1 ) - ( j + 1 ) ) * 0.5 ); // eslint-disable-line max-len
		}
	}
	for ( j = 0; j < n; j++ ) {
		for ( i = 0; i <= j; i++ ) {
			cset( Bv, LDA, i, j, ( i + 1 ) + ( j + 1 ), ( ( j + 1 ) - ( i + 1 ) ) * 0.25 ); // eslint-disable-line max-len
		}
	}
	info = base( 'initialize', 'initialize', n, 2, 4, A, 1, LDA, 0, B, 1, LDA, 0, Q, 1, LDA, 0, Z, 1, LDA, 0 ); // eslint-disable-line max-len
	assert.strictEqual( info, tc.info, 'info' );
	assertArrayClose( extractCol( Av, 0, n, LDA ), tc.A_col1, 'A_col1' );
	assertArrayClose( extractCol( Av, 1, n, LDA ), tc.A_col2, 'A_col2' );
	assertArrayClose( extractCol( Av, 2, n, LDA ), tc.A_col3, 'A_col3' );
	assertArrayClose( extractCol( Av, 3, n, LDA ), tc.A_col4, 'A_col4' );
	assertArrayClose( extractCol( Av, 4, n, LDA ), tc.A_col5, 'A_col5' );
	assertArrayClose( extractCol( Bv, 0, n, LDA ), tc.B_col1, 'B_col1' );
	assertArrayClose( extractCol( Bv, 1, n, LDA ), tc.B_col2, 'B_col2' );
	assertArrayClose( extractCol( Bv, 2, n, LDA ), tc.B_col3, 'B_col3' );
	assertArrayClose( extractCol( Bv, 3, n, LDA ), tc.B_col4, 'B_col4' );
	assertArrayClose( extractCol( Bv, 4, n, LDA ), tc.B_col5, 'B_col5' );
	assertArrayClose( extractCol( Qv, 0, n, LDA ), tc.Q_col1, 'Q_col1' );
	assertArrayClose( extractCol( Qv, 1, n, LDA ), tc.Q_col2, 'Q_col2' );
	assertArrayClose( extractCol( Qv, 2, n, LDA ), tc.Q_col3, 'Q_col3' );
	assertArrayClose( extractCol( Qv, 3, n, LDA ), tc.Q_col4, 'Q_col4' );
	assertArrayClose( extractCol( Qv, 4, n, LDA ), tc.Q_col5, 'Q_col5' );
	assertArrayClose( extractCol( Zv, 0, n, LDA ), tc.Z_col1, 'Z_col1' );
	assertArrayClose( extractCol( Zv, 1, n, LDA ), tc.Z_col2, 'Z_col2' );
	assertArrayClose( extractCol( Zv, 2, n, LDA ), tc.Z_col3, 'Z_col3' );
	assertArrayClose( extractCol( Zv, 3, n, LDA ), tc.Z_col4, 'Z_col4' );
	assertArrayClose( extractCol( Zv, 4, n, LDA ), tc.Z_col5, 'Z_col5' );
});

test( 'zgghrd: accumulate into existing Q, Z (COMPQ=V, COMPZ=V) 3x3', function t() { // eslint-disable-line max-len
	var info;
	var LDA;
	var tc;
	var Av;
	var Bv;
	var Qv;
	var Zv;
	var n;
	var A;
	var B;
	var Q;
	var Z;
	var i;

	tc = accumulate_3x3;
	n = 3;
	LDA = n;
	A = new Complex128Array( LDA * n );
	B = new Complex128Array( LDA * n );
	Q = new Complex128Array( LDA * n );
	Z = new Complex128Array( LDA * n );
	Av = reinterpret( A, 0 );
	Bv = reinterpret( B, 0 );
	Qv = reinterpret( Q, 0 );
	Zv = reinterpret( Z, 0 );
	cset( Av, LDA, 0, 0, 2.0, 0.0 );
	cset( Av, LDA, 0, 1, 1.0, 1.0 );
	cset( Av, LDA, 0, 2, 0.0, 1.0 );
	cset( Av, LDA, 1, 0, 3.0, -1.0 );
	cset( Av, LDA, 1, 1, 1.0, 0.0 );
	cset( Av, LDA, 1, 2, 2.0, 0.5 );
	cset( Av, LDA, 2, 0, 1.0, 2.0 );
	cset( Av, LDA, 2, 1, 0.0, -1.0 );
	cset( Av, LDA, 2, 2, 3.0, 1.0 );
	cset( Bv, LDA, 0, 0, 1.0, 0.0 );
	cset( Bv, LDA, 0, 1, 0.5, 0.5 );
	cset( Bv, LDA, 0, 2, 0.0, 1.0 );
	cset( Bv, LDA, 1, 1, 2.0, 0.0 );
	cset( Bv, LDA, 1, 2, 1.0, 0.0 );
	cset( Bv, LDA, 2, 2, 3.0, 0.0 );
	for ( i = 0; i < n; i++ ) {
		cset( Qv, LDA, i, i, 1.0, 0.0 );
		cset( Zv, LDA, i, i, 1.0, 0.0 );
	}
	info = base( 'update', 'update', n, 1, 3, A, 1, LDA, 0, B, 1, LDA, 0, Q, 1, LDA, 0, Z, 1, LDA, 0 ); // eslint-disable-line max-len
	assert.strictEqual( info, tc.info, 'info' );
	assertArrayClose( extractCol( Av, 0, n, LDA ), tc.A_col1, 'A_col1' );
	assertArrayClose( extractCol( Av, 1, n, LDA ), tc.A_col2, 'A_col2' );
	assertArrayClose( extractCol( Av, 2, n, LDA ), tc.A_col3, 'A_col3' );
	assertArrayClose( extractCol( Bv, 0, n, LDA ), tc.B_col1, 'B_col1' );
	assertArrayClose( extractCol( Bv, 1, n, LDA ), tc.B_col2, 'B_col2' );
	assertArrayClose( extractCol( Bv, 2, n, LDA ), tc.B_col3, 'B_col3' );
	assertArrayClose( extractCol( Qv, 0, n, LDA ), tc.Q_col1, 'Q_col1' );
	assertArrayClose( extractCol( Qv, 1, n, LDA ), tc.Q_col2, 'Q_col2' );
	assertArrayClose( extractCol( Qv, 2, n, LDA ), tc.Q_col3, 'Q_col3' );
	assertArrayClose( extractCol( Zv, 0, n, LDA ), tc.Z_col1, 'Z_col1' );
	assertArrayClose( extractCol( Zv, 1, n, LDA ), tc.Z_col2, 'Z_col2' );
	assertArrayClose( extractCol( Zv, 2, n, LDA ), tc.Z_col3, 'Z_col3' );
});

test( 'zgghrd: ILO=IHI (already reduced, near no-op)', function t() {
	var info;
	var LDA;
	var tc;
	var Av;
	var Bv;
	var Qv;
	var Zv;
	var n;
	var A;
	var B;
	var Q;
	var Z;

	tc = ilo_eq_ihi;
	n = 3;
	LDA = n;
	A = new Complex128Array( LDA * n );
	B = new Complex128Array( LDA * n );
	Q = new Complex128Array( LDA * n );
	Z = new Complex128Array( LDA * n );
	Av = reinterpret( A, 0 );
	Bv = reinterpret( B, 0 );
	Qv = reinterpret( Q, 0 );
	Zv = reinterpret( Z, 0 );
	cset( Av, LDA, 0, 0, 1.0, 0.0 );
	cset( Av, LDA, 0, 1, 2.0, 0.0 );
	cset( Av, LDA, 0, 2, 3.0, 0.0 );
	cset( Av, LDA, 1, 0, 4.0, 0.0 );
	cset( Av, LDA, 1, 1, 5.0, 0.0 );
	cset( Av, LDA, 1, 2, 6.0, 0.0 );
	cset( Av, LDA, 2, 0, 7.0, 0.0 );
	cset( Av, LDA, 2, 1, 8.0, 0.0 );
	cset( Av, LDA, 2, 2, 9.0, 0.0 );
	cset( Bv, LDA, 0, 0, 1.0, 0.0 );
	cset( Bv, LDA, 0, 1, 1.0, 0.0 );
	cset( Bv, LDA, 0, 2, 1.0, 0.0 );
	cset( Bv, LDA, 1, 1, 2.0, 0.0 );
	cset( Bv, LDA, 1, 2, 1.0, 0.0 );
	cset( Bv, LDA, 2, 2, 3.0, 0.0 );
	info = base( 'initialize', 'initialize', n, 2, 2, A, 1, LDA, 0, B, 1, LDA, 0, Q, 1, LDA, 0, Z, 1, LDA, 0 ); // eslint-disable-line max-len
	assert.strictEqual( info, tc.info, 'info' );
	assertArrayClose( extractCol( Av, 0, n, LDA ), tc.A_col1, 'A_col1' );
	assertArrayClose( extractCol( Av, 1, n, LDA ), tc.A_col2, 'A_col2' );
	assertArrayClose( extractCol( Av, 2, n, LDA ), tc.A_col3, 'A_col3' );
	assertArrayClose( extractCol( Bv, 0, n, LDA ), tc.B_col1, 'B_col1' );
	assertArrayClose( extractCol( Bv, 1, n, LDA ), tc.B_col2, 'B_col2' );
	assertArrayClose( extractCol( Bv, 2, n, LDA ), tc.B_col3, 'B_col3' );
	assertArrayClose( extractCol( Qv, 0, n, LDA ), tc.Q_col1, 'Q_col1' );
	assertArrayClose( extractCol( Qv, 1, n, LDA ), tc.Q_col2, 'Q_col2' );
	assertArrayClose( extractCol( Qv, 2, n, LDA ), tc.Q_col3, 'Q_col3' );
	assertArrayClose( extractCol( Zv, 0, n, LDA ), tc.Z_col1, 'Z_col1' );
	assertArrayClose( extractCol( Zv, 1, n, LDA ), tc.Z_col2, 'Z_col2' );
	assertArrayClose( extractCol( Zv, 2, n, LDA ), tc.Z_col3, 'Z_col3' );
});

test( 'zgghrd: throws TypeError for invalid COMPQ', function t() {
	var A;
	var B;
	var Q;
	var Z;

	A = new Complex128Array( 1 );
	B = new Complex128Array( 1 );
	Q = new Complex128Array( 1 );
	Z = new Complex128Array( 1 );
	assert.throws( function () {
		base( 'X', 'initialize', 1, 1, 1, A, 1, 1, 0, B, 1, 1, 0, Q, 1, 1, 0, Z, 1, 1, 0 );
	}, TypeError );
});

test( 'zgghrd: throws TypeError for invalid COMPZ', function t() {
	var A;
	var B;
	var Q;
	var Z;

	A = new Complex128Array( 1 );
	B = new Complex128Array( 1 );
	Q = new Complex128Array( 1 );
	Z = new Complex128Array( 1 );
	assert.throws( function () {
		base( 'initialize', 'X', 1, 1, 1, A, 1, 1, 0, B, 1, 1, 0, Q, 1, 1, 0, Z, 1, 1, 0 );
	}, TypeError );
});

test( 'zgghrd: negative N returns -3', function t() {
	var info;
	var A;
	var B;
	var Q;
	var Z;

	A = new Complex128Array( 1 );
	B = new Complex128Array( 1 );
	Q = new Complex128Array( 1 );
	Z = new Complex128Array( 1 );
	info = base( 'initialize', 'initialize', -1, 1, 1, A, 1, 1, 0, B, 1, 1, 0, Q, 1, 1, 0, Z, 1, 1, 0 ); // eslint-disable-line max-len
	assert.strictEqual( info, -3, 'negative N returns -3' );
});

test( 'zgghrd: COMPQ=N, COMPZ=I (Z only, no Q accumulation) 3x3', function t() {
	var info;
	var LDA;
	var tc;
	var Av;
	var Bv;
	var Zv;
	var n;
	var A;
	var B;
	var Q;
	var Z;

	tc = no_qz_3x3;
	n = 3;
	LDA = n;
	A = new Complex128Array( LDA * n );
	B = new Complex128Array( LDA * n );
	Q = new Complex128Array( LDA * n );
	Z = new Complex128Array( LDA * n );
	Av = reinterpret( A, 0 );
	Bv = reinterpret( B, 0 );
	Zv = reinterpret( Z, 0 );
	cset( Av, LDA, 0, 0, 1.0, 0.0 );
	cset( Av, LDA, 0, 1, 2.0, 1.0 );
	cset( Av, LDA, 0, 2, 3.0, -1.0 );
	cset( Av, LDA, 1, 0, 4.0, 2.0 );
	cset( Av, LDA, 1, 1, 5.0, 0.0 );
	cset( Av, LDA, 1, 2, 6.0, 1.0 );
	cset( Av, LDA, 2, 0, 7.0, -1.0 );
	cset( Av, LDA, 2, 1, 8.0, 2.0 );
	cset( Av, LDA, 2, 2, 9.0, 0.0 );
	cset( Bv, LDA, 0, 0, 2.0, 0.0 );
	cset( Bv, LDA, 0, 1, 1.0, 1.0 );
	cset( Bv, LDA, 0, 2, 0.5, 0.0 );
	cset( Bv, LDA, 1, 1, 3.0, 0.0 );
	cset( Bv, LDA, 1, 2, 1.0, -1.0 );
	cset( Bv, LDA, 2, 2, 1.0, 0.0 );
	info = base( 'none', 'initialize', n, 1, 3, A, 1, LDA, 0, B, 1, LDA, 0, Q, 1, LDA, 0, Z, 1, LDA, 0 ); // eslint-disable-line max-len
	assert.strictEqual( info, 0, 'info' );
	assertArrayClose( extractCol( Av, 0, n, LDA ), tc.A_col1, 'A_col1' );
	assertArrayClose( extractCol( Av, 1, n, LDA ), tc.A_col2, 'A_col2' );
	assertArrayClose( extractCol( Av, 2, n, LDA ), tc.A_col3, 'A_col3' );
	assertArrayClose( extractCol( Bv, 0, n, LDA ), tc.B_col1, 'B_col1' );
	assertArrayClose( extractCol( Bv, 1, n, LDA ), tc.B_col2, 'B_col2' );
	assertArrayClose( extractCol( Bv, 2, n, LDA ), tc.B_col3, 'B_col3' );
	assert.ok( Zv[ 0 ] !== 0.0 || Zv[ 1 ] !== 0.0, 'Z is not all zeros' );
});

test( 'zgghrd: COMPQ=I, COMPZ=N (Q only, no Z accumulation) 3x3', function t() {
	var info;
	var LDA;
	var tc;
	var Av;
	var Bv;
	var Qv;
	var n;
	var A;
	var B;
	var Q;
	var Z;

	tc = no_qz_3x3;
	n = 3;
	LDA = n;
	A = new Complex128Array( LDA * n );
	B = new Complex128Array( LDA * n );
	Q = new Complex128Array( LDA * n );
	Z = new Complex128Array( LDA * n );
	Av = reinterpret( A, 0 );
	Bv = reinterpret( B, 0 );
	Qv = reinterpret( Q, 0 );
	cset( Av, LDA, 0, 0, 1.0, 0.0 );
	cset( Av, LDA, 0, 1, 2.0, 1.0 );
	cset( Av, LDA, 0, 2, 3.0, -1.0 );
	cset( Av, LDA, 1, 0, 4.0, 2.0 );
	cset( Av, LDA, 1, 1, 5.0, 0.0 );
	cset( Av, LDA, 1, 2, 6.0, 1.0 );
	cset( Av, LDA, 2, 0, 7.0, -1.0 );
	cset( Av, LDA, 2, 1, 8.0, 2.0 );
	cset( Av, LDA, 2, 2, 9.0, 0.0 );
	cset( Bv, LDA, 0, 0, 2.0, 0.0 );
	cset( Bv, LDA, 0, 1, 1.0, 1.0 );
	cset( Bv, LDA, 0, 2, 0.5, 0.0 );
	cset( Bv, LDA, 1, 1, 3.0, 0.0 );
	cset( Bv, LDA, 1, 2, 1.0, -1.0 );
	cset( Bv, LDA, 2, 2, 1.0, 0.0 );
	info = base( 'initialize', 'none', n, 1, 3, A, 1, LDA, 0, B, 1, LDA, 0, Q, 1, LDA, 0, Z, 1, LDA, 0 ); // eslint-disable-line max-len
	assert.strictEqual( info, 0, 'info' );
	assertArrayClose( extractCol( Av, 0, n, LDA ), tc.A_col1, 'A_col1' );
	assertArrayClose( extractCol( Av, 1, n, LDA ), tc.A_col2, 'A_col2' );
	assertArrayClose( extractCol( Av, 2, n, LDA ), tc.A_col3, 'A_col3' );
	assertArrayClose( extractCol( Bv, 0, n, LDA ), tc.B_col1, 'B_col1' );
	assertArrayClose( extractCol( Bv, 1, n, LDA ), tc.B_col2, 'B_col2' );
	assertArrayClose( extractCol( Bv, 2, n, LDA ), tc.B_col3, 'B_col3' );
	assert.ok( Qv[ 0 ] !== 0.0 || Qv[ 1 ] !== 0.0, 'Q is not all zeros' );
});

test( 'zgghrd: empty range IHI=ILO-1', function t() {
	var info;
	var LDA;
	var tc;
	var Av;
	var Bv;
	var Qv;
	var Zv;
	var n;
	var A;
	var B;
	var Q;
	var Z;

	tc = empty_range;
	n = 3;
	LDA = n;
	A = new Complex128Array( LDA * n );
	B = new Complex128Array( LDA * n );
	Q = new Complex128Array( LDA * n );
	Z = new Complex128Array( LDA * n );
	Av = reinterpret( A, 0 );
	Bv = reinterpret( B, 0 );
	Qv = reinterpret( Q, 0 );
	Zv = reinterpret( Z, 0 );
	cset( Av, LDA, 0, 0, 1.0, 0.0 );
	cset( Av, LDA, 0, 1, 2.0, 0.0 );
	cset( Av, LDA, 0, 2, 3.0, 0.0 );
	cset( Av, LDA, 1, 0, 4.0, 0.0 );
	cset( Av, LDA, 1, 1, 5.0, 0.0 );
	cset( Av, LDA, 1, 2, 6.0, 0.0 );
	cset( Av, LDA, 2, 0, 7.0, 0.0 );
	cset( Av, LDA, 2, 1, 8.0, 0.0 );
	cset( Av, LDA, 2, 2, 9.0, 0.0 );
	cset( Bv, LDA, 0, 0, 1.0, 0.0 );
	cset( Bv, LDA, 1, 1, 2.0, 0.0 );
	cset( Bv, LDA, 2, 2, 3.0, 0.0 );
	info = base( 'initialize', 'initialize', n, 2, 1, A, 1, LDA, 0, B, 1, LDA, 0, Q, 1, LDA, 0, Z, 1, LDA, 0 ); // eslint-disable-line max-len
	assert.strictEqual( info, tc.info, 'info' );
	assertArrayClose( extractCol( Av, 0, n, LDA ), tc.A_col1, 'A_col1' );
	assertArrayClose( extractCol( Av, 1, n, LDA ), tc.A_col2, 'A_col2' );
	assertArrayClose( extractCol( Av, 2, n, LDA ), tc.A_col3, 'A_col3' );
	assertArrayClose( extractCol( Bv, 0, n, LDA ), tc.B_col1, 'B_col1' );
	assertArrayClose( extractCol( Bv, 1, n, LDA ), tc.B_col2, 'B_col2' );
	assertArrayClose( extractCol( Bv, 2, n, LDA ), tc.B_col3, 'B_col3' );
	assertArrayClose( extractCol( Qv, 0, n, LDA ), tc.Q_col1, 'Q_col1' );
	assertArrayClose( extractCol( Qv, 1, n, LDA ), tc.Q_col2, 'Q_col2' );
	assertArrayClose( extractCol( Qv, 2, n, LDA ), tc.Q_col3, 'Q_col3' );
	assertArrayClose( extractCol( Zv, 0, n, LDA ), tc.Z_col1, 'Z_col1' );
	assertArrayClose( extractCol( Zv, 1, n, LDA ), tc.Z_col2, 'Z_col2' );
	assertArrayClose( extractCol( Zv, 2, n, LDA ), tc.Z_col3, 'Z_col3' );
});
