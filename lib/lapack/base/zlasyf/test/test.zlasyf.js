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

import test from 'node:test';
import assert from 'node:assert/strict';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import zlasyf from './../lib/zlasyf.js';


// FIXTURES //

var MAXN = 10; // must match Fortran test LDA
import upper_4x4 from './fixtures/upper_4x4.json' with { type: 'json' };
import lower_3x3 from './fixtures/lower_3x3.json' with { type: 'json' };


// FUNCTIONS //

/**
* Extract NxN complex matrix from fixture with leading dimension MAXN.
* Returns flat Float64 array with LDA=N (column-major).
*/
function extractA( fixtureA, N ) {
	var result = [];
	var i;
	var j;
	for ( j = 0; j < N; j++ ) {
		for ( i = 0; i < N; i++ ) {
			result.push( fixtureA[ ( i + ( j * MAXN ) ) * 2 ] );
			result.push( fixtureA[ ( ( i + ( j * MAXN ) ) * 2 ) + 1 ] );
		}
	}
	return result;
}

function assertClose( actual, expected, tol, msg ) {
	var relErr = Math.abs( actual - expected ) / Math.max( Math.abs( expected ), 1.0 );
	assert.ok( relErr <= tol, msg + ': expected ' + expected + ', got ' + actual + ' (relErr=' + relErr + ')' );
}

function assertArrayClose( actual, expected, tol, msg ) {
	var i;
	assert.equal( actual.length, expected.length, msg + ': length mismatch' );
	for ( i = 0; i < expected.length; i++ ) {
		assertClose( actual[ i ], expected[ i ], tol, msg + '[' + i + ']' );
	}
}

function fortranIPIVtoJS( ipiv ) {
	return ipiv.map( function convert( v ) {
		if ( v > 0 ) {
			return v - 1;
		}
		return v;
	});
}

function fillUpper( Av, N, entries ) {
	var i;
	for ( i = 0; i < entries.length; i++ ) {
		Av[ ( entries[ i ][ 0 ] + ( entries[ i ][ 1 ] * N ) ) * 2 ] = entries[ i ][ 2 ];
		Av[ ( ( entries[ i ][ 0 ] + ( entries[ i ][ 1 ] * N ) ) * 2 ) + 1 ] = entries[ i ][ 3 ];
	}
}

function fillLower( Av, N, entries ) {
	var i;
	for ( i = 0; i < entries.length; i++ ) {
		Av[ ( entries[ i ][ 0 ] + ( entries[ i ][ 1 ] * N ) ) * 2 ] = entries[ i ][ 2 ];
		Av[ ( ( entries[ i ][ 0 ] + ( entries[ i ][ 1 ] * N ) ) * 2 ) + 1 ] = entries[ i ][ 3 ];
	}
}


// TESTS //

test( 'main export is a function', function t() {
	assert.strictEqual( typeof zlasyf, 'function', 'is a function' );
});

test( 'has expected arity', function t() {
	assert.strictEqual( zlasyf.length, 10, 'has expected arity' );
});

test( 'throws TypeError for invalid order', function t() {
	assert.throws( function throws() {
		zlasyf( 'invalid', 'upper', 2, 2, new Complex128Array( 4 ), 2, new Int32Array( 2 ), 1, new Complex128Array( 4 ), 2 );
	}, TypeError );
});

test( 'throws TypeError for invalid uplo', function t() {
	assert.throws( function throws() {
		zlasyf( 'column-major', 'invalid', 2, 2, new Complex128Array( 4 ), 2, new Int32Array( 2 ), 1, new Complex128Array( 4 ), 2 );
	}, TypeError );
});

test( 'throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		zlasyf( 'column-major', 'upper', -1, 2, new Complex128Array( 4 ), 2, new Int32Array( 2 ), 1, new Complex128Array( 4 ), 2 );
	}, RangeError );
});

test( 'throws RangeError for LDA < max(1, N)', function t() {
	assert.throws( function throws() {
		zlasyf( 'column-major', 'upper', 4, 4, new Complex128Array( 16 ), 2, new Int32Array( 4 ), 1, new Complex128Array( 16 ), 4 );
	}, RangeError );
});

test( 'throws RangeError for LDW < max(1, N)', function t() {
	assert.throws( function throws() {
		zlasyf( 'column-major', 'upper', 4, 4, new Complex128Array( 16 ), 4, new Int32Array( 4 ), 1, new Complex128Array( 16 ), 2 );
	}, RangeError );
});

test( 'returns {info:0, kb:0} for N=0', function t() {
	var result = zlasyf( 'column-major', 'upper', 0, 0, new Complex128Array( 0 ), 1, new Int32Array( 0 ), 1, new Complex128Array( 0 ), 1 );
	assert.strictEqual( result.info, 0, 'info' );
	assert.strictEqual( result.kb, 0, 'kb' );
});

test( 'zlasyf: 4x4 upper, nb=4 (column-major)', function t() {
	var tc = upper_4x4;
	var N = 4;
	var nb = 4;
	var A = new Complex128Array( N * N );
	var Av = reinterpret( A, 0 );
	var W = new Complex128Array( N * nb );
	var IPIV = new Int32Array( N );
	var expectedA;
	var expected;
	var result;
	var i;

	fillUpper( Av, N, [
		[ 0, 0, 4, 1 ], [ 0, 1, 1, 2 ], [ 1, 1, 5, 0 ], [ 0, 2, 2, 0 ], [ 1, 2, 1, 1 ], [ 2, 2, 6, 2 ],
		[ 0, 3, 0, 1 ], [ 1, 3, 0, 0 ], [ 2, 3, 1, -1 ], [ 3, 3, 3, 0 ]
	]);

	result = zlasyf( 'column-major', 'upper', N, nb, A, N, IPIV, 1, W, N );
	assert.strictEqual( result.info, tc.info, 'info' );
	assert.strictEqual( result.kb, tc.kb, 'kb' );

	expectedA = extractA( tc.A, N );
	assertArrayClose( Array.from( Av ), expectedA, 1e-10, 'A' );
	expected = fortranIPIVtoJS( tc.ipiv );
	for ( i = 0; i < N; i++ ) {
		assert.strictEqual( IPIV[ i ], expected[ i ], 'ipiv[' + i + ']' );
	}
});

test( 'zlasyf: 3x3 lower (column-major)', function t() {
	var tc = lower_3x3;
	var N = 3;
	var nb = 3;
	var A = new Complex128Array( N * N );
	var Av = reinterpret( A, 0 );
	var W = new Complex128Array( N * nb );
	var IPIV = new Int32Array( N );
	var expectedA;
	var expected;
	var result;
	var i;

	fillLower( Av, N, [
		[ 0, 0, 5, 0 ], [ 1, 0, 2, 1 ], [ 2, 0, 1, 0 ],
		[ 1, 1, 4, 0 ], [ 2, 1, 1, -1 ],
		[ 2, 2, 6, 1 ]
	]);

	result = zlasyf( 'column-major', 'lower', N, nb, A, N, IPIV, 1, W, N );
	assert.strictEqual( result.info, tc.info, 'info' );
	assert.strictEqual( result.kb, tc.kb, 'kb' );

	expectedA = extractA( tc.A, N );
	assertArrayClose( Array.from( Av ), expectedA, 1e-10, 'A' );
	expected = fortranIPIVtoJS( tc.ipiv );
	for ( i = 0; i < N; i++ ) {
		assert.strictEqual( IPIV[ i ], expected[ i ], 'ipiv[' + i + ']' );
	}
});
