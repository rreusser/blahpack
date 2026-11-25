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
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import ndarray from './../lib/ndarray.js';
import zhetrd_he2hb from './../lib/zhetrd_he2hb.js';


// FUNCTIONS //

/**
* Returns a dense Hermitian test matrix (full storage, both triangles).
*
* @private
* @param {NonNegativeInteger} N - order
* @returns {Complex128Array} matrix (symmetric index pattern, so valid in either layout up to conjugation)
*/
function hermitian( N ) {
	const A = new Complex128Array( N * N );
	const v = reinterpret( A, 0 );
	let re;
	let im;
	let i;
	let j;
	for ( j = 0; j < N; j++ ) {
		v[ 2 * ( j + ( j * N ) ) ] = 2.0 + Math.cos( j );
		for ( i = 0; i < j; i++ ) {
			re = Math.sin( ( 3 * i ) + j + 1 );
			im = 0.5 * Math.cos( i + ( 2 * j ) + 1 );
			v[ 2 * ( i + ( j * N ) ) ] = re;
			v[ ( 2 * ( i + ( j * N ) ) ) + 1 ] = im;
			v[ 2 * ( j + ( i * N ) ) ] = re;
			v[ ( 2 * ( j + ( i * N ) ) ) + 1 ] = -im;
		}
	}
	return A;
}

/**
* Returns the squared Frobenius norm of a complex array.
*
* @private
* @param {Float64Array} v - interleaved data
* @returns {number} squared norm
*/
function sumsq( v ) {
	let s = 0.0;
	let i;
	for ( i = 0; i < v.length; i++ ) {
		s += v[ i ] * v[ i ];
	}
	return s;
}

/**
* Runs the wrapper (with a `null` workspace) and the ndarray interface on identical data and compares outputs.
*
* @private
* @param {string} order - storage layout
* @param {string} uplo - triangle
* @param {NonNegativeInteger} N - order
* @param {NonNegativeInteger} kd - bandwidth
* @returns {Object} wrapper outputs
*/
function compare( order, uplo, N, kd ) {
	const s1 = ( order === 'column-major' );
	const LDAB = ( s1 ) ? kd + 1 : N;
	const A1 = hermitian( N );
	const A2 = hermitian( N );
	const AB1 = new Complex128Array( ( kd + 1 ) * N );
	const AB2 = new Complex128Array( ( kd + 1 ) * N );
	const TAU1 = new Complex128Array( N );
	const TAU2 = new Complex128Array( N );
	const nb = Math.max( kd, 32 );
	const WORK = new Complex128Array( ( N * kd ) + ( N * nb ) + ( 2 * kd * kd ) );
	const info1 = zhetrd_he2hb( order, uplo, N, kd, A1, N, AB1, LDAB, TAU1, 1, null );
	const info2 = ndarray( uplo, N, kd, A2, ( s1 ) ? 1 : N, ( s1 ) ? N : 1, 0, AB2, ( s1 ) ? 1 : LDAB, ( s1 ) ? LDAB : 1, 0, TAU2, 1, 0, WORK, 1, 0 );
	assert.strictEqual( info1, 0, 'info' );
	assert.strictEqual( info1, info2, 'info matches' );
	assert.deepStrictEqual( reinterpret( A1, 0 ), reinterpret( A2, 0 ), 'A' );
	assert.deepStrictEqual( reinterpret( AB1, 0 ), reinterpret( AB2, 0 ), 'AB' );
	assert.deepStrictEqual( reinterpret( TAU1, 0 ), reinterpret( TAU2, 0 ), 'TAU' );
	return {
		'AB': AB1,
		'LDAB': LDAB
	};
}

/**
* Checks that the band matrix has the same Frobenius norm as the input (unitary similarity).
*
* @private
* @param {string} order - storage layout
* @param {string} uplo - triangle
* @param {NonNegativeInteger} N - order
* @param {NonNegativeInteger} kd - bandwidth
* @param {Object} out - outputs from `compare`
*/
function checkNorm( order, uplo, N, kd, out ) {
	const v = reinterpret( out.AB, 0 );
	const expected = sumsq( reinterpret( hermitian( N ), 0 ) );
	let actual = 0.0;
	let idx;
	let r;
	let j;
	for ( j = 0; j < N; j++ ) {
		for ( r = 0; r <= kd; r++ ) {
			// Diagonal row is r=kd (upper) or r=0 (lower):
			if ( ( uplo === 'upper' && j - kd + r < 0 ) || ( uplo === 'lower' && j + r >= N ) ) {
				continue;
			}
			idx = ( order === 'column-major' ) ? r + ( j * out.LDAB ) : ( r * out.LDAB ) + j;
			const t = ( v[ 2 * idx ] * v[ 2 * idx ] ) + ( v[ ( 2 * idx ) + 1 ] * v[ ( 2 * idx ) + 1 ] );
			actual += ( ( uplo === 'upper' && r === kd ) || ( uplo === 'lower' && r === 0 ) ) ? t : 2.0 * t;
		}
	}
	assert.ok( Math.abs( actual - expected ) <= 1e-10 * expected, 'Frobenius norm preserved: expected ' + expected + ', got ' + actual );
}


// TESTS //

test( 'zhetrd_he2hb is a function', function t() {
	assert.strictEqual( typeof zhetrd_he2hb, 'function', 'is a function' );
});

test( 'zhetrd_he2hb has expected arity', function t() {
	assert.strictEqual( zhetrd_he2hb.length, 11, 'has expected arity' );
});

test( 'zhetrd_he2hb throws TypeError for invalid order', function t() {
	assert.throws( function throws() {
		zhetrd_he2hb( 'invalid', 'upper', 2, 1, new Complex128Array( 4 ), 2, new Complex128Array( 4 ), 2, new Complex128Array( 1 ), 1, null );
	}, TypeError );
});

test( 'zhetrd_he2hb throws TypeError for invalid uplo', function t() {
	assert.throws( function throws() {
		zhetrd_he2hb( 'column-major', 'invalid', 2, 1, new Complex128Array( 4 ), 2, new Complex128Array( 4 ), 2, new Complex128Array( 1 ), 1, null );
	}, TypeError );
});

test( 'zhetrd_he2hb throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		zhetrd_he2hb( 'column-major', 'upper', -1, 1, new Complex128Array( 4 ), 2, new Complex128Array( 4 ), 2, new Complex128Array( 1 ), 1, null );
	}, RangeError );
});

test( 'zhetrd_he2hb throws RangeError for negative kd', function t() {
	assert.throws( function throws() {
		zhetrd_he2hb( 'column-major', 'upper', 2, -1, new Complex128Array( 4 ), 2, new Complex128Array( 4 ), 2, new Complex128Array( 1 ), 1, null );
	}, RangeError );
});

test( 'zhetrd_he2hb throws RangeError for LDA < max(1,N)', function t() {
	assert.throws( function throws() {
		zhetrd_he2hb( 'column-major', 'upper', 4, 1, new Complex128Array( 16 ), 1, new Complex128Array( 8 ), 2, new Complex128Array( 3 ), 1, null );
	}, RangeError );
});

test( 'zhetrd_he2hb throws RangeError for LDAB < kd+1', function t() {
	assert.throws( function throws() {
		zhetrd_he2hb( 'column-major', 'upper', 4, 2, new Complex128Array( 16 ), 4, new Complex128Array( 8 ), 2, new Complex128Array( 2 ), 1, null );
	}, RangeError );
});

test( 'zhetrd_he2hb accepts a caller-provided WORK buffer', function t() {

	const N = 8;
	const kd = 3;
	const nb = 32;
	const A = new Complex128Array( N * N );
	const AB = new Complex128Array( ( kd + 1 ) * N );
	const TAU = new Complex128Array( N - kd );
	const WORK = new Complex128Array( ( N * kd ) + ( N * nb ) + ( 2 * kd * kd ) );

	const info = zhetrd_he2hb( 'column-major', 'lower', N, kd, A, N, AB, kd+1, TAU, 1, WORK );
	assert.equal( info, 0, 'info' );
});

test( 'zhetrd_he2hb returns 0 for the quick-return N=2, kd=1 case (column-major, lower)', function t() {

	const N = 2;
	const kd = 1;
	const A = new Complex128Array( [ 4.0, 0.0, 1.0, -1.0, 1.0, 1.0, 5.0, 0.0 ] );
	const AB = new Complex128Array( ( kd + 1 ) * N );
	const TAU = new Complex128Array( 1 );
	const info = zhetrd_he2hb( 'column-major', 'lower', N, kd, A, N, AB, kd+1, TAU, 1, null );
	assert.equal( info, 0, 'info' );

	// Lower band copies the diagonal and sub-diagonal columns of A into AB rows 0 and 1:
	const abr = reinterpret( AB, 0 );
	assert.equal( abr[ 0 ], 4.0, 'AB[0,0].re' );
	assert.equal( abr[ 1 ], 0.0, 'AB[0,0].im' );
	assert.equal( abr[ 2 ], 1.0, 'AB[1,0].re' );
	assert.equal( abr[ 3 ], -1.0, 'AB[1,0].im' );
});

test( 'zhetrd_he2hb: column-major, lower, kd > 32 with null WORK matches ndarray and preserves the norm', function t() {
	const out = compare( 'column-major', 'lower', 36, 33 );
	checkNorm( 'column-major', 'lower', 36, 33, out );
});

test( 'zhetrd_he2hb: row-major, upper, kd > 32 with null WORK matches ndarray and preserves the norm', function t() {
	const out = compare( 'row-major', 'upper', 36, 33 );
	checkNorm( 'row-major', 'upper', 36, 33, out );
});

test( 'zhetrd_he2hb: column-major, upper, kd < 32 with null WORK matches ndarray and preserves the norm', function t() {
	const out = compare( 'column-major', 'upper', 10, 3 );
	checkNorm( 'column-major', 'upper', 10, 3, out );
});

test( 'zhetrd_he2hb: row-major, lower, kd < 32 with null WORK matches ndarray and preserves the norm', function t() {
	const out = compare( 'row-major', 'lower', 10, 3 );
	checkNorm( 'row-major', 'lower', 10, 3, out );
});
