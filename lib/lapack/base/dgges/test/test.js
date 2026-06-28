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

/* eslint-disable max-lines-per-function, no-restricted-syntax, stdlib/first-unit-test */


// MODULES //

import test from 'node:test';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Uint8Array from '@stdlib/array/uint8/lib/index.js';
import dgges from './../lib/base.js';


// FIXTURES //

var fixtureDir = path.join( import.meta.dirname, '..', '..', '..', '..', '..', 'test', 'fixtures' ); // eslint-disable-line max-len
var lines = readFileSync( path.join( fixtureDir, 'dgges.jsonl' ), 'utf8' ).trim().split( '\n' ); // eslint-disable-line node/no-sync
var fixture = lines.map( function parse( line ) {
		return JSON.parse( line );
	} );


// FUNCTIONS //

/**
* Returns a test case from the fixture data.
*
* @private
* @param {string} name - test case name
* @returns {*} result
*/
function findCase( name ) {
		return fixture.find( function find( t ) { return t.name === name;
	} );
}

/**
* Asserts that two numbers are approximately equal.
*
* @private
* @param {*} actual - actual value
* @param {*} expected - expected value
* @param {number} tol - tolerance
* @param {string} msg - assertion message
*/
function assertClose( actual, expected, tol, msg ) {
	var relErr = Math.abs( actual - expected ) / Math.max( Math.abs( expected ), 1.0 ); // eslint-disable-line max-len
	assert.ok( relErr <= tol, msg + ': expected ' + expected + ', got ' + actual );
}

/**
* Asserts that two arrays are element-wise approximately equal.
*
* @private
* @param {*} actual - actual value
* @param {*} expected - expected value
* @param {number} tol - tolerance
* @param {string} msg - assertion message
*/
function assertArrayClose( actual, expected, tol, msg ) {
	var i;
	assert.equal( actual.length, expected.length, msg + ': length mismatch' );
	for ( i = 0; i < expected.length; i++ ) {
		assertClose( actual[ i ], expected[ i ], tol, msg + '[' + i + ']' );
	}
}

/**
* Noop.
*
* @private
* @returns {*} result
*/
function noop() { return false; }

/**
* Asserts that two matrices match column-wise up to sign flips.
* Schur vectors have sign ambiguity: each column can be negated.
*
* @private
* @param {Float64Array} actual - actual matrix (column-major flat)
* @param {Array} expected - expected matrix (column-major flat)
* @param {NonNegativeInteger} n - matrix dimension
* @param {number} tol - tolerance
* @param {string} msg - message prefix
*/
function assertMatrixColumnsClose( actual, expected, n, tol, msg ) {
	var matchPos;
	var matchNeg;
	var relErr;
	var j;
	var i;
	for ( j = 0; j < n; j++ ) {
		// Check if column matches with positive or negative sign
		matchPos = true;
		matchNeg = true;
		for ( i = 0; i < n; i++ ) {
			relErr = Math.abs( actual[ j * n + i ] - expected[ j * n + i ] ) / Math.max( Math.abs( expected[ j * n + i ] ), 1.0 ); // eslint-disable-line max-len
			if ( relErr > tol ) {
				matchPos = false;
			}
			relErr = Math.abs( actual[ j * n + i ] + expected[ j * n + i ] ) / Math.max( Math.abs( expected[ j * n + i ] ), 1.0 ); // eslint-disable-line max-len
			if ( relErr > tol ) {
				matchNeg = false;
			}
		}
		assert.ok( matchPos || matchNeg, msg + ' column ' + j + ' does not match (even with sign flip)' ); // eslint-disable-line max-len
	}
}

/**
* RunTest.
*
* @private
* @param {*} tc - tc
*/
function runTest( tc ) {
	var ALPHAR;
	var ALPHAI;
	var result;
	var jobvsl;
	var jobvsr;
	var BWORK;
	var WORK;
	var BETA;
	var VSL;
	var VSR;
	var n;
	var A;
	var B;

	n = tc.n;
	jobvsl = ( tc.jobvsl === 'V' ) ? 'compute-vectors' : 'no-vectors';
	jobvsr = ( tc.jobvsr === 'V' ) ? 'compute-vectors' : 'no-vectors';

	A = new Float64Array( tc.Ain );
	B = new Float64Array( tc.Bin );
	ALPHAR = new Float64Array( n );
	ALPHAI = new Float64Array( n );
	BETA = new Float64Array( n );
	VSL = new Float64Array( ( tc.jobvsl === 'V' ) ? n * n : 1 );
	VSR = new Float64Array( ( tc.jobvsr === 'V' ) ? n * n : 1 );
	WORK = new Float64Array( Math.max( 8 * n, ( 6 * n ) + 16, 1 ) );
	BWORK = new Uint8Array( Math.max( 1, n ) );

	result = dgges( jobvsl, jobvsr, 'not-sorted', noop, n, A, 1, n, 0, B, 1, n, 0, ALPHAR, 1, 0, ALPHAI, 1, 0, BETA, 1, 0, VSL, 1, n, 0, VSR, 1, n, 0, WORK, 1, 0, BWORK, 1, 0 ); // eslint-disable-line max-len

	assert.equal( result.info, tc.info, 'info' );
	assert.equal( result.sdim, tc.sdim, 'sdim' );

	// Check Schur form S (A overwritten) and T (B overwritten)
	assertArrayClose( A, tc.S, 1e-12, 'S' );
	assertArrayClose( B, tc.T, 1e-12, 'T' );

	// Check eigenvalue arrays
	assertArrayClose( ALPHAR, tc.alphar, 1e-12, 'alphar' );
	assertArrayClose( ALPHAI, tc.alphai, 1e-12, 'alphai' );
	assertArrayClose( BETA, tc.beta, 1e-12, 'beta' );

	// Check Schur vectors if computed (with sign ambiguity)
	if ( tc.VSL ) {
		assertMatrixColumnsClose( VSL, tc.VSL, n, 1e-12, 'VSL' );
	}
	if ( tc.VSR ) {
		assertMatrixColumnsClose( VSR, tc.VSR, n, 1e-12, 'VSR' );
	}
}


// TESTS //

test( 'dgges: 2x2_diag_no_vectors', function t() {
	runTest( findCase( '2x2_diag_no_vectors' ) );
});

test( 'dgges: 2x2_both_vectors', function t() {
	runTest( findCase( '2x2_both_vectors' ) );
});

test( 'dgges: 3x3_right_only', function t() {
	runTest( findCase( '3x3_right_only' ) );
});

test( 'dgges: 3x3_left_only', function t() {
	runTest( findCase( '3x3_left_only' ) );
});

test( 'dgges: 4x4_complex_eigs', function t() {
	runTest( findCase( '4x4_complex_eigs' ) );
});

test( 'dgges: 1x1_trivial', function t() {
	runTest( findCase( '1x1_trivial' ) );
});

test( 'dgges: 4x4_general', function t() {
	runTest( findCase( '4x4_general' ) );
});

test( 'dgges: N=0 quick return', function t() {
	var result = dgges( 'compute-vectors', 'compute-vectors', 'not-sorted', noop, 0, new Float64Array( 0 ), 1, 1, 0, new Float64Array( 0 ), 1, 1, 0, new Float64Array( 0 ), 1, 0, new Float64Array( 0 ), 1, 0, new Float64Array( 0 ), 1, 0, new Float64Array( 0 ), 1, 1, 0, new Float64Array( 0 ), 1, 1, 0, new Float64Array( 1 ), 1, 0, new Uint8Array( 1 ), 1, 0 ); // eslint-disable-line max-len
	assert.equal( result.info, 0, 'info' );
	assert.equal( result.sdim, 0, 'sdim' );
});

test( 'dgges: sorted eigenvalues with selection function', function t() {
	var ALPHAR;
	var ALPHAI;
	var result;
	var BETA;
	var VSL;
	var VSR;
	var n;
	var A;
	var B;

	function selectPositive( alphar, alphai, beta ) {
		if ( beta === 0.0 ) {
			return false;
		}
		return ( alphar / beta ) > 1.5;
	}
	n = 3;
	A = new Float64Array( [ 1, 0, 0, 0, 2, 0, 0, 0, 3 ] );
	B = new Float64Array( [ 1, 0, 0, 0, 1, 0, 0, 0, 1 ] );
	ALPHAR = new Float64Array( n );
	ALPHAI = new Float64Array( n );
	BETA = new Float64Array( n );
	VSL = new Float64Array( n * n );
	VSR = new Float64Array( n * n );
	result = dgges( 'compute-vectors', 'compute-vectors', 'sorted', selectPositive, n, A, 1, n, 0, B, 1, n, 0, ALPHAR, 1, 0, ALPHAI, 1, 0, BETA, 1, 0, VSL, 1, n, 0, VSR, 1, n, 0, new Float64Array( Math.max( 8 * n, ( 6 * n ) + 16 ) ), 1, 0, new Uint8Array( n ), 1, 0 ); // eslint-disable-line max-len
	assert.equal( result.info, 0, 'info' );
	assert.equal( result.sdim, 2, 'sdim should be 2 (eigenvalues 2 and 3 selected)' ); // eslint-disable-line max-len
});

test( 'dgges: sorted with no eigenvalues selected', function t() {
	var ALPHAR;
	var ALPHAI;
	var result;
	var BETA;
	var VSL;
	var VSR;
	var n;
	var A;
	var B;

	n = 2;
	A = new Float64Array( [ 1, 0, 0, 2 ] );
	B = new Float64Array( [ 1, 0, 0, 1 ] );
	ALPHAR = new Float64Array( n );
	ALPHAI = new Float64Array( n );
	BETA = new Float64Array( n );
	VSL = new Float64Array( n * n );
	VSR = new Float64Array( n * n );
	result = dgges( 'compute-vectors', 'compute-vectors', 'sorted', noop, n, A, 1, n, 0, B, 1, n, 0, ALPHAR, 1, 0, ALPHAI, 1, 0, BETA, 1, 0, VSL, 1, n, 0, VSR, 1, n, 0, new Float64Array( Math.max( 8 * n, ( 6 * n ) + 16 ) ), 1, 0, new Uint8Array( n ), 1, 0 ); // eslint-disable-line max-len
	assert.equal( result.info, 0, 'info' );
	assert.equal( result.sdim, 0, 'sdim should be 0 (no eigenvalues selected)' );
});

test( 'dgges: sorted with complex conjugate eigenvalue pair', function t() {
	var ALPHAR;
	var ALPHAI;
	var result;
	var BETA;
	var VSL;
	var VSR;
	var n;
	var A;
	var B;

	function selectAll(  ) {
		return true;
	}
	n = 2;
	A = new Float64Array( [ 0, 1, -1, 0 ] );
	B = new Float64Array( [ 1, 0, 0, 1 ] );
	ALPHAR = new Float64Array( n );
	ALPHAI = new Float64Array( n );
	BETA = new Float64Array( n );
	VSL = new Float64Array( n * n );
	VSR = new Float64Array( n * n );
	result = dgges( 'compute-vectors', 'compute-vectors', 'sorted', selectAll, n, A, 1, n, 0, B, 1, n, 0, ALPHAR, 1, 0, ALPHAI, 1, 0, BETA, 1, 0, VSL, 1, n, 0, VSR, 1, n, 0, new Float64Array( Math.max( 8 * n, ( 6 * n ) + 16 ) ), 1, 0, new Uint8Array( n ), 1, 0 ); // eslint-disable-line max-len
	assert.equal( result.info, 0, 'info' );
	assert.equal( result.sdim, 2, 'sdim should be 2 (complex pair selected)' );
});

test( 'dgges: small-norm matrix triggers scaling', function t() {
	var ALPHAR;
	var ALPHAI;
	var result;
	var BETA;
	var eig0;
	var eig1;
	var eigs;
	var VSL;
	var VSR;
	var n;
	var A;
	var B;
	var s;

	n = 2;
	s = 1e-200;
	A = new Float64Array( [ 2 * s, 0, 0, 3 * s ] );
	B = new Float64Array( [ s, 0, 0, s ] );
	ALPHAR = new Float64Array( n );
	ALPHAI = new Float64Array( n );
	BETA = new Float64Array( n );
	VSL = new Float64Array( n * n );
	VSR = new Float64Array( n * n );
	result = dgges( 'compute-vectors', 'compute-vectors', 'not-sorted', noop, n, A, 1, n, 0, B, 1, n, 0, ALPHAR, 1, 0, ALPHAI, 1, 0, BETA, 1, 0, VSL, 1, n, 0, VSR, 1, n, 0, new Float64Array( Math.max( 8 * n, ( 6 * n ) + 16 ) ), 1, 0, new Uint8Array( n ), 1, 0 ); // eslint-disable-line max-len
	assert.equal( result.info, 0, 'info' );
	eig0 = ALPHAR[ 0 ] / BETA[ 0 ];
	eig1 = ALPHAR[ 1 ] / BETA[ 1 ];
	eigs = [ eig0, eig1 ].sort();
	assertClose( eigs[ 0 ], 2.0, 1e-10, 'first eigenvalue' );
	assertClose( eigs[ 1 ], 3.0, 1e-10, 'second eigenvalue' );
});

test( 'dgges: large-norm matrix triggers scaling', function t() {
	var ALPHAR;
	var ALPHAI;
	var result;
	var BETA;
	var eig0;
	var eig1;
	var eigs;
	var VSL;
	var VSR;
	var n;
	var A;
	var B;
	var s;

	n = 2;
	s = 1e200;
	A = new Float64Array( [ 2 * s, 0, 0, 3 * s ] );
	B = new Float64Array( [ s, 0, 0, s ] );
	ALPHAR = new Float64Array( n );
	ALPHAI = new Float64Array( n );
	BETA = new Float64Array( n );
	VSL = new Float64Array( n * n );
	VSR = new Float64Array( n * n );
	result = dgges( 'compute-vectors', 'compute-vectors', 'not-sorted', noop, n, A, 1, n, 0, B, 1, n, 0, ALPHAR, 1, 0, ALPHAI, 1, 0, BETA, 1, 0, VSL, 1, n, 0, VSR, 1, n, 0, new Float64Array( Math.max( 8 * n, ( 6 * n ) + 16 ) ), 1, 0, new Uint8Array( n ), 1, 0 ); // eslint-disable-line max-len
	assert.equal( result.info, 0, 'info' );
	eig0 = ALPHAR[ 0 ] / BETA[ 0 ];
	eig1 = ALPHAR[ 1 ] / BETA[ 1 ];
	eigs = [ eig0, eig1 ].sort();
	assertClose( eigs[ 0 ], 2.0, 1e-10, 'first eigenvalue' );
	assertClose( eigs[ 1 ], 3.0, 1e-10, 'second eigenvalue' );
});
