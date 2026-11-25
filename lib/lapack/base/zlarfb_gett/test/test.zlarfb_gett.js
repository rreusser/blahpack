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

/* eslint-disable no-restricted-syntax, stdlib/first-unit-test, camelcase, max-len */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import zlarfb_gett from './../lib/zlarfb_gett.js';


// TESTS //

test( 'zlarfb_gett is a function', function t() {
	assert.strictEqual( typeof zlarfb_gett, 'function', 'is a function' );
});

test( 'zlarfb_gett has expected arity', function t() {
	assert.strictEqual( zlarfb_gett.length, 13, 'has expected arity' );
});

test( 'zlarfb_gett throws TypeError for invalid order', function t() {
	assert.throws( function throws() {
		zlarfb_gett( 'invalid', 'identity', 2, 2, 2, new Complex128Array( 4 ), 2, new Complex128Array( 4 ), 2, new Complex128Array( 4 ), 2, new Complex128Array( 4 ), 2 );
	}, TypeError );
});

test( 'zlarfb_gett throws TypeError for invalid ident', function t() {
	assert.throws( function throws() {
		zlarfb_gett( 'column-major', 'invalid', 2, 2, 2, new Complex128Array( 4 ), 2, new Complex128Array( 4 ), 2, new Complex128Array( 4 ), 2, new Complex128Array( 4 ), 2 );
	}, TypeError );
});

test( 'zlarfb_gett throws RangeError for negative M', function t() {
	assert.throws( function throws() {
		zlarfb_gett( 'column-major', 'identity', -1, 2, 2, new Complex128Array( 4 ), 2, new Complex128Array( 4 ), 2, new Complex128Array( 4 ), 2, new Complex128Array( 4 ), 2 );
	}, RangeError );
});

test( 'zlarfb_gett throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		zlarfb_gett( 'column-major', 'identity', 2, -1, 2, new Complex128Array( 4 ), 2, new Complex128Array( 4 ), 2, new Complex128Array( 4 ), 2, new Complex128Array( 4 ), 2 );
	}, RangeError );
});

test( 'zlarfb_gett throws RangeError for negative K', function t() {
	assert.throws( function throws() {
		zlarfb_gett( 'column-major', 'identity', 2, 2, -1, new Complex128Array( 4 ), 2, new Complex128Array( 4 ), 2, new Complex128Array( 4 ), 2, new Complex128Array( 4 ), 2 );
	}, RangeError );
});

test( 'zlarfb_gett throws RangeError for LDT < max(1,M) when column-major', function t() {
	assert.throws( function throws() {
		zlarfb_gett( 'column-major', 'identity', 4, 4, 2, new Complex128Array( 16 ), 1, new Complex128Array( 16 ), 4, new Complex128Array( 16 ), 4, new Complex128Array( 16 ), 4 );
	}, RangeError );
});

test( 'zlarfb_gett runs without throwing for valid input', function t() {

	const K = 2;
	const M = 3;
	const N = 3;
	const T = new Complex128Array( K * K );
	const A = new Complex128Array( K * N );
	const B = new Complex128Array( M * N );
	const WORK = new Complex128Array( K * N );
	const out = zlarfb_gett( 'column-major', 'identity', M, N, K, T, M, A, M, B, M, WORK, M );
	assert.ok( out, 'returns A' );
});

test( 'zlarfb_gett: leading-dimension bounds follow the array extents (ticket 0087)', function t() {
	// T is K by K, A is K by N, WORK is K by max(K,N-K) (ZLARFB_GETT).
	function F() {
		return new Float64Array( 1024 );
	}
	function Z() {
		return new Complex128Array( 1024 );
	}
	function call( order, ld ) {
		const L = { 'LDT': 16, 'LDA': 16, 'LDB': 16, 'LDWORK': 16 };
		Object.assign( L, ld );
		return zlarfb_gett( order, 'not-identity', 6, 5, 2, Z(), L.LDT, Z(), L.LDA, Z(), L.LDB, Z(), L.LDWORK );
	}
	assert.doesNotThrow( function ok() {
		call( 'column-major', { 'LDT': 2 } );
	}, 'column-major LDT = 2 is accepted' );
	assert.throws( function bad() {
		call( 'column-major', { 'LDT': 1 } );
	}, RangeError, 'column-major LDT = 1 is rejected' );
	assert.doesNotThrow( function ok() {
		call( 'column-major', { 'LDA': 2 } );
	}, 'column-major LDA = 2 is accepted' );
	assert.throws( function bad() {
		call( 'column-major', { 'LDA': 1 } );
	}, RangeError, 'column-major LDA = 1 is rejected' );
	assert.doesNotThrow( function ok() {
		call( 'column-major', { 'LDWORK': 2 } );
	}, 'column-major LDWORK = 2 is accepted' );
	assert.throws( function bad() {
		call( 'column-major', { 'LDWORK': 1 } );
	}, RangeError, 'column-major LDWORK = 1 is rejected' );
	assert.doesNotThrow( function ok() {
		call( 'row-major', { 'LDT': 2 } );
	}, 'row-major LDT = 2 is accepted' );
	assert.throws( function bad() {
		call( 'row-major', { 'LDT': 1 } );
	}, RangeError, 'row-major LDT = 1 is rejected' );
	assert.doesNotThrow( function ok() {
		call( 'row-major', { 'LDWORK': 3 } );
	}, 'row-major LDWORK = 3 is accepted' );
	assert.throws( function bad() {
		call( 'row-major', { 'LDWORK': 2 } );
	}, RangeError, 'row-major LDWORK = 2 is rejected' );
});
