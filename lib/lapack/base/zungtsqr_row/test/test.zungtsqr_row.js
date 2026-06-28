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

/* eslint-disable no-restricted-syntax, stdlib/first-unit-test, max-len, camelcase */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import zlatsqr from './../../zlatsqr/lib/zlatsqr.js';
import zungtsqr_row from './../lib/zungtsqr_row.js';


// TESTS //

test( 'main export is a function', function t() {
	assert.strictEqual( typeof zungtsqr_row, 'function', 'is a function' );
});

test( 'the function has expected arity', function t() {
	assert.strictEqual( zungtsqr_row.length, 10, 'has expected arity' );
});

test( 'the function throws a TypeError for an invalid order', function t() {
	assert.throws( function throws() {
		zungtsqr_row( 'invalid', 2, 2, 3, 2, new Complex128Array( 4 ), 2, new Complex128Array( 4 ), 2, new Complex128Array( 4 ) );
	}, TypeError );
});

test( 'the function throws a RangeError for a negative M', function t() {
	assert.throws( function throws() {
		zungtsqr_row( 'column-major', -1, 0, 1, 1, new Complex128Array( 1 ), 1, new Complex128Array( 1 ), 1, new Complex128Array( 1 ) );
	}, RangeError );
});

test( 'the function throws a RangeError for a negative N', function t() {
	assert.throws( function throws() {
		zungtsqr_row( 'column-major', 2, -1, 1, 1, new Complex128Array( 4 ), 2, new Complex128Array( 4 ), 1, new Complex128Array( 4 ) );
	}, RangeError );
});

test( 'the function throws a RangeError when M < N', function t() {
	assert.throws( function throws() {
		zungtsqr_row( 'column-major', 2, 3, 4, 2, new Complex128Array( 6 ), 2, new Complex128Array( 6 ), 2, new Complex128Array( 6 ) );
	}, RangeError );
});

test( 'the function throws a RangeError for mb < 1', function t() {
	assert.throws( function throws() {
		zungtsqr_row( 'column-major', 4, 2, 0, 1, new Complex128Array( 8 ), 4, new Complex128Array( 4 ), 1, new Complex128Array( 4 ) );
	}, RangeError );
});

test( 'the function throws a RangeError for nb < 1', function t() {
	assert.throws( function throws() {
		zungtsqr_row( 'column-major', 4, 2, 3, 0, new Complex128Array( 8 ), 4, new Complex128Array( 4 ), 1, new Complex128Array( 4 ) );
	}, RangeError );
});

test( 'the function throws a RangeError for nb > N (when N > 0)', function t() {
	assert.throws( function throws() {
		zungtsqr_row( 'column-major', 4, 2, 3, 3, new Complex128Array( 8 ), 4, new Complex128Array( 4 ), 2, new Complex128Array( 4 ) );
	}, RangeError );
});

test( 'the function throws a RangeError for LDA too small (column-major)', function t() {
	assert.throws( function throws() {
		zungtsqr_row( 'column-major', 4, 2, 3, 1, new Complex128Array( 8 ), 1, new Complex128Array( 4 ), 1, new Complex128Array( 4 ) );
	}, RangeError );
});

test( 'the function throws a RangeError for LDA too small (row-major)', function t() {
	assert.throws( function throws() {
		zungtsqr_row( 'row-major', 4, 2, 3, 1, new Complex128Array( 8 ), 1, new Complex128Array( 4 ), 1, new Complex128Array( 4 ) );
	}, RangeError );
});

test( 'the function throws a RangeError for LDT too small (column-major)', function t() {
	assert.throws( function throws() {
		zungtsqr_row( 'column-major', 4, 2, 3, 2, new Complex128Array( 8 ), 4, new Complex128Array( 4 ), 1, new Complex128Array( 4 ) );
	}, RangeError );
});

test( 'the function throws a RangeError for LDT too small (row-major)', function t() {
	assert.throws( function throws() {
		zungtsqr_row( 'row-major', 4, 2, 3, 2, new Complex128Array( 8 ), 2, new Complex128Array( 4 ), 1, new Complex128Array( 4 ) );
	}, RangeError );
});

test( 'the function returns 0 for the M=0 quick-return case', function t() {
	var info = zungtsqr_row( 'column-major', 0, 0, 1, 1, new Complex128Array( 1 ), 1, new Complex128Array( 1 ), 1, new Complex128Array( 1 ) );
	assert.strictEqual( info, 0, 'returns 0' );
});

test( 'the function returns 0 for the N=0 quick-return case', function t() {
	var info = zungtsqr_row( 'column-major', 3, 0, 1, 1, new Complex128Array( 3 ), 3, new Complex128Array( 1 ), 1, new Complex128Array( 1 ) );
	assert.strictEqual( info, 0, 'returns 0' );
});

test( 'the function produces orthonormal columns in column-major layout', function t() {
	var expected;
	var WORK;
	var view;
	var info;
	var dotR;
	var dotI;
	var aR;
	var aI;
	var bR;
	var bI;
	var A;
	var T;
	var i;
	var j;
	var k;

	A = new Complex128Array( 24 ); // 8 x 3
	view = reinterpret( A, 0 );
	for ( j = 0; j < 3; j++ ) {
		for ( i = 0; i < 8; i++ ) {
			if ( i === j ) {
				view[ ( ( j * 8 ) + i ) * 2 ] = 5.0 + j;
				view[ ( ( ( j * 8 ) + i ) * 2 ) + 1 ] = 0.1 * ( j + 1 );
			} else {
				view[ ( ( j * 8 ) + i ) * 2 ] = 1.0 / ( Math.abs( i - j ) + 1 );
				view[ ( ( ( j * 8 ) + i ) * 2 ) + 1 ] = 0.05 * ( i - j );
			}
		}
	}
	T = new Complex128Array( 2 * 3 * 5 ); // nb * N * nblk
	WORK = new Complex128Array( 2 * 3 );
	info = zlatsqr( 'column-major', 8, 3, 4, 2, A, 8, T, 2, WORK );
	assert.strictEqual( info, 0, 'zlatsqr INFO' );

	WORK = new Complex128Array( 2 * Math.max( 2, 3 - 2 ) );
	info = zungtsqr_row( 'column-major', 8, 3, 4, 2, A, 8, T, 2, WORK );
	assert.strictEqual( info, 0, 'zungtsqr_row INFO' );

	// Verify Q^H * Q = I.
	for ( j = 0; j < 3; j++ ) {
		for ( i = 0; i < 3; i++ ) {
			dotR = 0.0;
			dotI = 0.0;
			for ( k = 0; k < 8; k++ ) {
				aR = view[ ( ( i * 8 ) + k ) * 2 ];
				aI = view[ ( ( ( i * 8 ) + k ) * 2 ) + 1 ];
				bR = view[ ( ( j * 8 ) + k ) * 2 ];
				bI = view[ ( ( ( j * 8 ) + k ) * 2 ) + 1 ];
				dotR += ( aR * bR ) + ( aI * bI );
				dotI += ( aR * bI ) - ( aI * bR );
			}
			expected = ( i === j ) ? 1.0 : 0.0;
			assert.ok( Math.abs( dotR - expected ) <= 1e-12, 'col-major Q^H*Q[' + i + ',' + j + '].re' );
			assert.ok( Math.abs( dotI ) <= 1e-12, 'col-major Q^H*Q[' + i + ',' + j + '].im' );
		}
	}
});
