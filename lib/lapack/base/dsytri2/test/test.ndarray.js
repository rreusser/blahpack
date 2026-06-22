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

/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import path from 'node:path';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import dsytri2 from './../lib/ndarray.js';


// FIXTURES //

var fixtureDir = path.join( import.meta.dirname, '..', '..', '..', '..', '..', 'test', 'fixtures' ); // eslint-disable-line max-len
var lines = readFileSync( path.join( fixtureDir, 'dsytri2.jsonl' ), 'utf8' ).trim().split( '\n' ); // eslint-disable-line max-len
var fixture = lines.map( function parse( line ) {
	return JSON.parse( line );
});

// The Fortran test uses NMAX=40 as the declared leading dimension.
var LDA = 40;

// Block size used by base.js dispatch (must match `lib/base.js`).
var NBMAX = 32;


// FUNCTIONS //

/**
* Finds a fixture by name.
*
* @private
* @param {string} name - test case name
* @returns {Object} fixture entry
*/
function findCase( name ) {
	return fixture.find( function find( t ) {
		return t.name === name;
	});
}

/**
* Converts a Fortran 1-based IPIV array into the JS convention used by `dsyconv`/`dsytri2x`: non-negative `0`-based indices for `1x1` blocks and bitwise-NOT-encoded indices for `2x2` blocks.
*
* @private
* @param {Array<number>} ipivF - Fortran 1-based pivot array
* @returns {Int32Array} JS-convention pivot array
*/
function convertIpiv( ipivF ) {
	var out;
	var i;
	out = new Int32Array( ipivF.length );
	for ( i = 0; i < ipivF.length; i++ ) {
		out[ i ] = ( ipivF[ i ] > 0 ) ? ( ipivF[ i ] - 1 ) : ipivF[ i ];
	}
	return out;
}

/**
* Asserts approximate scalar equality.
*
* @private
* @param {number} actual - actual value
* @param {number} expected - expected value
* @param {number} tol - tolerance
* @param {string} msg - assertion message
*/
function assertClose( actual, expected, tol, msg ) {
	var relErr = Math.abs( actual - expected ) / Math.max( Math.abs( expected ), 1.0 ); // eslint-disable-line max-len
	assert.ok( relErr <= tol, msg + ': expected ' + expected + ', got ' + actual );
}

/**
* Asserts triangle equality against a reference column-major buffer with `LDA`-row storage.
*
* @private
* @param {Float64Array} actual - computed array
* @param {Array<number>} expected - reference array
* @param {string} uplo - `'upper'` or `'lower'`
* @param {NonNegativeInteger} N - order
* @param {number} tol - tolerance
* @param {string} msg - assertion message
*/
function assertTriangleClose( actual, expected, uplo, N, tol, msg ) {
	var idx;
	var i;
	var j;
	if ( uplo === 'upper' ) {
		for ( j = 0; j < N; j++ ) {
			for ( i = 0; i <= j; i++ ) {
				idx = i + ( j * LDA );
				assertClose( actual[ idx ], expected[ idx ], tol, msg + '[' + i + ',' + j + ']' ); // eslint-disable-line max-len
			}
		}
	} else {
		for ( j = 0; j < N; j++ ) {
			for ( i = j; i < N; i++ ) {
				idx = i + ( j * LDA );
				assertClose( actual[ idx ], expected[ idx ], tol, msg + '[' + i + ',' + j + ']' ); // eslint-disable-line max-len
			}
		}
	}
}

/**
* Allocates a workspace sized for the worst case (matches the `dsytri2.js` BLAS-style wrapper).
*
* @private
* @param {NonNegativeInteger} N - order of the matrix
* @returns {Float64Array} workspace
*/
function makeWork( N ) {
	var ldwork;
	if ( NBMAX >= N ) {
		return new Float64Array( Math.max( 1, N ) );
	}
	ldwork = N + NBMAX + 1;
	return new Float64Array( ldwork * ( NBMAX + 3 ) );
}

/**
* Runs a fixture-driven test.
*
* @private
* @param {string} uplo - `'upper'` or `'lower'`
* @param {NonNegativeInteger} N - order
* @param {Object} tc - fixture entry
* @param {number} tol - tolerance
*/
function runFixture( uplo, N, tc, tol ) {
	var ipiv;
	var work;
	var info;
	var A;
	var i;

	A = new Float64Array( tc.a_factored.length );
	for ( i = 0; i < tc.a_factored.length; i++ ) {
		A[ i ] = tc.a_factored[ i ];
	}
	ipiv = convertIpiv( tc.ipiv );
	work = makeWork( N );
	info = dsytri2( uplo, N, A, 1, LDA, 0, ipiv, 1, 0, work, 1, 0 );
	assert.equal( info, tc.info, 'info' );
	assertTriangleClose( A, tc.a_inv, uplo, N, tol, 'a_inv' );
}


// TESTS //

test( 'dsytri2 ndarray is a function', function t() {
	assert.strictEqual( typeof dsytri2, 'function', 'is a function' );
});

test( 'dsytri2: 4x4 upper definite (unblocked path)', function t() {
	runFixture( 'upper', 4, findCase( '4x4_upper_def' ), 1e-10 );
});

test( 'dsytri2: 4x4 lower definite (unblocked path)', function t() {
	runFixture( 'lower', 4, findCase( '4x4_lower_def' ), 1e-10 );
});

test( 'dsytri2: 4x4 upper indefinite (2x2 pivots, unblocked path)', function t() {
	runFixture( 'upper', 4, findCase( '4x4_upper_indef' ), 1e-10 );
});

test( 'dsytri2: 4x4 lower indefinite (2x2 pivots, unblocked path)', function t() {
	runFixture( 'lower', 4, findCase( '4x4_lower_indef' ), 1e-10 );
});

test( 'dsytri2: 5x5 lower mixed pivots (unblocked path)', function t() {
	runFixture( 'lower', 5, findCase( '5x5_lower_mixed' ), 1e-10 );
});

test( 'dsytri2: 5x5 upper mixed pivots (unblocked path)', function t() {
	runFixture( 'upper', 5, findCase( '5x5_upper_mixed' ), 1e-10 );
});

test( 'dsytri2: N=1 trivial inverse (unblocked path)', function t() {
	var ipiv;
	var work;
	var info;
	var tc;
	var A;
	var i;
	tc = findCase( 'n_one_upper' );
	A = new Float64Array( tc.a_factored.length );
	for ( i = 0; i < tc.a_factored.length; i++ ) {
		A[ i ] = tc.a_factored[ i ];
	}
	ipiv = convertIpiv( tc.ipiv );
	work = makeWork( 1 );
	info = dsytri2( 'upper', 1, A, 1, LDA, 0, ipiv, 1, 0, work, 1, 0 );
	assert.equal( info, tc.info, 'info' );
	assertClose( A[ 0 ], tc.a_inv[ 0 ], 1e-14, 'A[0,0]' );
});

test( 'dsytri2: N=0 quick return', function t() {
	var ipiv;
	var work;
	var info;
	var A;
	A = new Float64Array( 0 );
	ipiv = new Int32Array( 0 );
	work = new Float64Array( 1 );
	info = dsytri2( 'lower', 0, A, 1, 1, 0, ipiv, 1, 0, work, 1, 0 );
	assert.equal( info, 0, 'info' );
});

test( 'dsytri2: 40x40 lower well-conditioned (blocked path)', function t() {
	runFixture( 'lower', 40, findCase( '40x40_lower_dd' ), 1e-8 );
});

test( 'dsytri2: 40x40 upper well-conditioned (blocked path)', function t() {
	runFixture( 'upper', 40, findCase( '40x40_upper_dd' ), 1e-8 );
});

test( 'dsytri2: validation throws on invalid uplo', function t() {
	var ipiv;
	var work;
	var A;
	A = new Float64Array( 4 );
	ipiv = new Int32Array( 2 );
	work = new Float64Array( 10 );
	assert.throws( function fn() {
		dsytri2( 'invalid', 2, A, 1, 2, 0, ipiv, 1, 0, work, 1, 0 );
	}, TypeError );
});

test( 'dsytri2: validation throws on negative N', function t() {
	var ipiv;
	var work;
	var A;
	A = new Float64Array( 4 );
	ipiv = new Int32Array( 2 );
	work = new Float64Array( 10 );
	assert.throws( function fn() {
		dsytri2( 'upper', -1, A, 1, 2, 0, ipiv, 1, 0, work, 1, 0 );
	}, RangeError );
});
