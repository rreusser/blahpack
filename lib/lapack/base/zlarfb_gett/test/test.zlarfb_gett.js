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
import zlarfb_gettNd from './../lib/ndarray.js';


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

test( 'zlarfb_gett matches ndarray (both layouts, both ident values, allocated and provided WORK)', function t() {
	const orders = [ 'column-major', 'row-major' ];
	let i;
	for ( i = 0; i < orders.length; i++ ) {
		checkAgainstNdarray( orders[ i ], 'not-identity', null );
		checkAgainstNdarray( orders[ i ], 'identity', null );
		checkAgainstNdarray( orders[ i ], 'not-identity', new Complex128Array( 128 ) );
	}
});


// FUNCTIONS //

/**
* Returns a deterministic pseudo-random array.
*
* @private
* @param {NonNegativeInteger} n - number of elements
* @param {integer} seed - seed
* @returns {Complex128Array} array
*/
function fill( n, seed ) {
	const out = new Float64Array( 2 * n );
	let s = seed;
	let i;
	for ( i = 0; i < out.length; i++ ) {
		s = ( ( s * 1103515245 ) + 12345 ) % 2147483648;
		out[ i ] = ( s / 1073741824 ) - 1.0;
	}
	return new Complex128Array( out.buffer );
}

/**
* Returns a real view of an array.
*
* @private
* @param {Complex128Array} x - array
* @returns {Float64Array} view
*/
function view( x ) {
	return new Float64Array( x.buffer, x.byteOffset, x.byteLength / 8 );
}

/**
* Calls the layout wrapper and `ndarray` on the same data and asserts identical outputs.
*
* @private
* @param {string} order - layout
* @param {string} ident - whether the unit lower triangular part of A is the identity
* @param {(Complex128Array|null)} WORK - workspace passed to the wrapper
*/
function checkAgainstNdarray( order, ident, WORK ) {
	const M = 6;
	const N = 5;
	const K = 2;
	const LD = 8;
	const T = fill( 128, 3 );
	const A1 = fill( 128, 5 );
	const A2 = fill( 128, 5 );
	const B1 = fill( 128, 7 );
	const B2 = fill( 128, 7 );
	const W2 = new Complex128Array( 128 );
	let s1 = 1;
	let s2 = LD;
	let a1;
	let a2;
	let b1;
	let b2;
	let i;
	if ( order === 'row-major' ) {
		s1 = LD;
		s2 = 1;
	}
	zlarfb_gett( order, ident, M, N, K, T, LD, A1, LD, B1, LD, WORK, LD );
	zlarfb_gettNd( ident, M, N, K, T, s1, s2, 0, A2, s1, s2, 0, B2, s1, s2, 0, W2, s1, s2, 0 );
	a1 = view( A1 );
	a2 = view( A2 );
	b1 = view( B1 );
	b2 = view( B2 );
	for ( i = 0; i < a1.length; i++ ) {
		assert.strictEqual( a1[ i ], a2[ i ], order + ' ' + ident + ' A[' + i + ']' );
	}
	for ( i = 0; i < b1.length; i++ ) {
		assert.strictEqual( b1[ i ], b2[ i ], order + ' ' + ident + ' B[' + i + ']' );
	}
	assert.notDeepStrictEqual( b1, view( fill( 128, 7 ) ), 'B was modified' );
}
