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

/* eslint-disable no-restricted-syntax, stdlib/first-unit-test, max-len, stdlib/vars-order, vars-on-top, max-statements-per-line, max-lines */

// MODULES //

import test from 'node:test';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dlatrs3 from './../lib/ndarray.js';


// FIXTURES //

const fixtureDir = path.join( import.meta.dirname, '..', '..', '..', '..', '..', 'test', 'fixtures' );
const lines = readFileSync( path.join( fixtureDir, 'dlatrs3.jsonl' ), 'utf8' ).trim().split( '\n' ); // eslint-disable-line node/no-sync
const fixture = lines.map( function parse( line ) { return JSON.parse( line ); } );


// FUNCTIONS //

/**
* Looks up a test case by name in the fixture array.
*
* @private
* @param {string} name - test case name
* @returns {Object} fixture case
*/
function findCase( name ) {
	return fixture.find( function find( t ) { return t.name === name; } );
}

/**
* Asserts that two scalar values agree within a relative tolerance.
*
* @private
* @param {number} actual - actual value
* @param {number} expected - expected value
* @param {number} tol - relative tolerance
* @param {string} msg - message
*/
function assertClose( actual, expected, tol, msg ) {
	const relErr = Math.abs( actual - expected ) / Math.max( Math.abs( expected ), 1.0 );
	assert.ok( relErr <= tol, msg + ': expected ' + expected + ', got ' + actual );
}

/**
* Asserts that two arrays agree within a relative tolerance.
*
* @private
* @param {Float64Array} actual - actual array
* @param {Array} expected - expected array
* @param {number} tol - relative tolerance
* @param {string} msg - message
*/
function assertArrayClose( actual, expected, tol, msg ) {
	let i;
	assert.equal( actual.length, expected.length, msg + ': length mismatch' );
	for ( i = 0; i < expected.length; i++ ) {
		assertClose( actual[ i ], expected[ i ], tol, msg + '[' + i + ']' );
	}
}

/**
* Allocates a workspace buffer of the size required by dlatrs3 for the given dimensions.
*
* @private
* @param {NonNegativeInteger} N - matrix order
* @param {NonNegativeInteger} nrhs - number of right-hand sides
* @returns {Float64Array} workspace
*/
function allocWork( N, nrhs ) {
	const NB = 8;
	const NBRHS = 32;
	const nba = Math.max( 1, Math.ceil( N / NB ) || 1 );
	const lscale = nba * Math.max( nba, Math.min( nrhs, NBRHS ) );
	return new Float64Array( lscale + ( nba * nba ) + NB + NBRHS );
}

/**
* Builds a 3x3 upper triangular A matrix (column-major) used by several tests.
*
* @private
* @returns {Float64Array} A 3x3 column-major upper triangular matrix
*/
function buildUpperA3() {
	const A = new Float64Array( 9 );
	A[ 0 ] = 2.0; A[ 3 ] = 1.0; A[ 6 ] = 1.0;
	A[ 4 ] = 3.0; A[ 7 ] = 2.0;
	A[ 8 ] = 4.0;
	return A;
}

/**
* Builds a 3x3 lower triangular A matrix (column-major) used by several tests.
*
* @private
* @returns {Float64Array} A 3x3 column-major lower triangular matrix
*/
function buildLowerA3() {
	const A = new Float64Array( 9 );
	A[ 0 ] = 2.0;
	A[ 1 ] = 1.0; A[ 4 ] = 3.0;
	A[ 2 ] = 1.0; A[ 5 ] = 2.0; A[ 8 ] = 4.0;
	return A;
}


// TESTS //

test( 'dlatrs3 ndarray export is a function', function t() {
	assert.strictEqual( typeof dlatrs3, 'function', 'is a function' );
});

test( 'dlatrs3: nrhs1_upper_N_nonunit (fallback to unblocked dlatrs)', function t() {
	const tc = findCase( 'nrhs1_upper_N_nonunit' );
	const A = buildUpperA3();
	const X = new Float64Array( [ 1.0, 2.0, 3.0 ] );
	const scale = new Float64Array( 1 );
	const cnorm = new Float64Array( 3 );
	const info = dlatrs3( 'upper', 'no-transpose', 'non-unit', 'no', 3, 1, A, 1, 3, 0, X, 1, 3, 0, scale, 1, 0, cnorm, 1, 0, allocWork(3, 1), 1, 0 );
	assert.equal( info, tc.info, 'info' );
	assertArrayClose( X, tc.x, 1e-14, 'x' );
	assertArrayClose( scale, tc.scale, 1e-14, 'scale' );
});

test( 'dlatrs3: nrhs2_upper_N_nonunit (blocked path, NBA=1)', function t() {
	const tc = findCase( 'nrhs2_upper_N_nonunit' );
	const A = buildUpperA3();
	const X = new Float64Array( [ 1.0, 2.0, 3.0, 4.0, 5.0, 6.0 ] );
	const scale = new Float64Array( 2 );
	const cnorm = new Float64Array( 3 );
	const info = dlatrs3( 'upper', 'no-transpose', 'non-unit', 'no', 3, 2, A, 1, 3, 0, X, 1, 3, 0, scale, 1, 0, cnorm, 1, 0, allocWork(3, 2), 1, 0 );
	assert.equal( info, tc.info, 'info' );
	assertArrayClose( X, tc.x, 1e-14, 'x' );
	assertArrayClose( scale, tc.scale, 1e-14, 'scale' );
});

test( 'dlatrs3: nrhs3_lower_N_nonunit', function t() {
	const tc = findCase( 'nrhs3_lower_N_nonunit' );
	const A = buildLowerA3();
	const X = new Float64Array( [ 1.0, 2.0, 3.0, 1.0, 0.0, -1.0, 4.0, 5.0, 6.0 ] );
	const scale = new Float64Array( 3 );
	const cnorm = new Float64Array( 3 );
	const info = dlatrs3( 'lower', 'no-transpose', 'non-unit', 'no', 3, 3, A, 1, 3, 0, X, 1, 3, 0, scale, 1, 0, cnorm, 1, 0, allocWork(3, 3), 1, 0 );
	assert.equal( info, tc.info, 'info' );
	assertArrayClose( X, tc.x, 1e-14, 'x' );
	assertArrayClose( scale, tc.scale, 1e-14, 'scale' );
});

test( 'dlatrs3: nrhs2_upper_T_nonunit', function t() {
	const tc = findCase( 'nrhs2_upper_T_nonunit' );
	const A = buildUpperA3();
	const X = new Float64Array( [ 1.0, 2.0, 3.0, 4.0, 5.0, 6.0 ] );
	const scale = new Float64Array( 2 );
	const cnorm = new Float64Array( 3 );
	const info = dlatrs3( 'upper', 'transpose', 'non-unit', 'no', 3, 2, A, 1, 3, 0, X, 1, 3, 0, scale, 1, 0, cnorm, 1, 0, allocWork(3, 2), 1, 0 );
	assert.equal( info, tc.info, 'info' );
	assertArrayClose( X, tc.x, 1e-14, 'x' );
	assertArrayClose( scale, tc.scale, 1e-14, 'scale' );
});

test( 'dlatrs3: nrhs2_lower_T_nonunit', function t() {
	const tc = findCase( 'nrhs2_lower_T_nonunit' );
	const A = buildLowerA3();
	const X = new Float64Array( [ 1.0, 2.0, 3.0, 6.0, 7.0, 8.0 ] );
	const scale = new Float64Array( 2 );
	const cnorm = new Float64Array( 3 );
	const info = dlatrs3( 'lower', 'transpose', 'non-unit', 'no', 3, 2, A, 1, 3, 0, X, 1, 3, 0, scale, 1, 0, cnorm, 1, 0, allocWork(3, 2), 1, 0 );
	assert.equal( info, tc.info, 'info' );
	assertArrayClose( X, tc.x, 1e-14, 'x' );
	assertArrayClose( scale, tc.scale, 1e-14, 'scale' );
});

test( 'dlatrs3: nrhs2_upper_N_unit (unit diagonal)', function t() {
	const tc = findCase( 'nrhs2_upper_N_unit' );
	const A = new Float64Array( 9 );
	A[ 0 ] = 99.0; A[ 3 ] = 1.0; A[ 6 ] = 1.0;
	A[ 4 ] = 99.0; A[ 7 ] = 2.0;
	A[ 8 ] = 99.0;
	const X = new Float64Array( [ 1.0, 2.0, 3.0, 4.0, 5.0, 6.0 ] );
	const scale = new Float64Array( 2 );
	const cnorm = new Float64Array( 3 );
	const info = dlatrs3( 'upper', 'no-transpose', 'unit', 'no', 3, 2, A, 1, 3, 0, X, 1, 3, 0, scale, 1, 0, cnorm, 1, 0, allocWork(3, 2), 1, 0 );
	assert.equal( info, tc.info, 'info' );
	assertArrayClose( X, tc.x, 1e-14, 'x' );
	assertArrayClose( scale, tc.scale, 1e-14, 'scale' );
});

test( 'dlatrs3: nrhs2_lower_T_unit', function t() {
	const tc = findCase( 'nrhs2_lower_T_unit' );
	const A = new Float64Array( 9 );
	A[ 0 ] = 99.0;
	A[ 1 ] = 1.0; A[ 4 ] = 99.0;
	A[ 2 ] = 2.0; A[ 5 ] = 3.0; A[ 8 ] = 99.0;
	const X = new Float64Array( [ 6.0, 5.0, 4.0, 3.0, 2.0, 1.0 ] );
	const scale = new Float64Array( 2 );
	const cnorm = new Float64Array( 3 );
	const info = dlatrs3( 'lower', 'transpose', 'unit', 'no', 3, 2, A, 1, 3, 0, X, 1, 3, 0, scale, 1, 0, cnorm, 1, 0, allocWork(3, 2), 1, 0 );
	assert.equal( info, tc.info, 'info' );
	assertArrayClose( X, tc.x, 1e-14, 'x' );
	assertArrayClose( scale, tc.scale, 1e-14, 'scale' );
});

test( 'dlatrs3: N=0 quick return', function t() {
	const A = new Float64Array( 1 );
	const X = new Float64Array( 1 );
	const scale = new Float64Array( [ 99.0, 99.0 ] );
	const cnorm = new Float64Array( 1 );
	const info = dlatrs3( 'upper', 'no-transpose', 'non-unit', 'no', 0, 2, A, 1, 1, 0, X, 1, 1, 0, scale, 1, 0, cnorm, 1, 0, allocWork(0, 2), 1, 0 );
	assert.equal( info, 0, 'info' );

	// SCALE is initialized to 1.0 even when N=0.
	assert.equal( scale[ 0 ], 1.0, 'scale[0]' );
	assert.equal( scale[ 1 ], 1.0, 'scale[1]' );
});

test( 'dlatrs3: NRHS=0 quick return', function t() {
	const A = buildUpperA3();
	const X = new Float64Array( 1 );
	const scale = new Float64Array( [ 99.0 ] );
	const cnorm = new Float64Array( 3 );
	const info = dlatrs3( 'upper', 'no-transpose', 'non-unit', 'no', 3, 0, A, 1, 3, 0, X, 1, 3, 0, scale, 1, 0, cnorm, 1, 0, allocWork(3, 0), 1, 0 );
	assert.equal( info, 0, 'info' );

	// NRHS=0: scale is untouched
	assert.equal( scale[ 0 ], 99.0, 'scale untouched' );
});

test( 'dlatrs3: blocked_upper_N_n10_nrhs4 (genuine blocked NBA=2)', function t() {
	const tc = findCase( 'blocked_upper_N_n10_nrhs4' );
	const n = 10;
	const nrhs = 4;
	let i, j;
	const A = new Float64Array( n * n );
	for ( j = 1; j <= n; j++ ) {
		for ( i = 1; i <= j; i++ ) {
			if ( i === j ) {
				A[ ( ( j - 1 ) * n ) + ( i - 1 ) ] = j + 1;
			} else {
				A[ ( ( j - 1 ) * n ) + ( i - 1 ) ] = ( i + j ) * 0.1;
			}
		}
	}
	const X = new Float64Array( n * nrhs );
	for ( j = 1; j <= nrhs; j++ ) {
		for ( i = 1; i <= n; i++ ) {
			X[ ( ( j - 1 ) * n ) + ( i - 1 ) ] = i + ( 0.5 * j );
		}
	}
	const scale = new Float64Array( nrhs );
	const cnorm = new Float64Array( n );
	const info = dlatrs3( 'upper', 'no-transpose', 'non-unit', 'no', n, nrhs, A, 1, n, 0, X, 1, n, 0, scale, 1, 0, cnorm, 1, 0, allocWork(n, nrhs), 1, 0 );
	assert.equal( info, tc.info, 'info' );
	assertArrayClose( X, tc.x, 1e-12, 'x' );
	assertArrayClose( scale, tc.scale, 1e-14, 'scale' );
});

test( 'dlatrs3: blocked_lower_T_n10_nrhs3 (blocked NBA=2, transpose, lower)', function t() {
	const tc = findCase( 'blocked_lower_T_n10_nrhs3' );
	const n = 10;
	const nrhs = 3;
	let i, j;
	const A = new Float64Array( n * n );
	for ( j = 1; j <= n; j++ ) {
		for ( i = j; i <= n; i++ ) {
			if ( i === j ) {
				A[ ( ( j - 1 ) * n ) + ( i - 1 ) ] = j + 1;
			} else {
				A[ ( ( j - 1 ) * n ) + ( i - 1 ) ] = ( i + j ) * 0.1;
			}
		}
	}
	const X = new Float64Array( n * nrhs );
	for ( j = 1; j <= nrhs; j++ ) {
		for ( i = 1; i <= n; i++ ) {
			X[ ( ( j - 1 ) * n ) + ( i - 1 ) ] = i + ( 0.5 * j );
		}
	}
	const scale = new Float64Array( nrhs );
	const cnorm = new Float64Array( n );
	const info = dlatrs3( 'lower', 'transpose', 'non-unit', 'no', n, nrhs, A, 1, n, 0, X, 1, n, 0, scale, 1, 0, cnorm, 1, 0, allocWork(n, nrhs), 1, 0 );
	assert.equal( info, tc.info, 'info' );
	assertArrayClose( X, tc.x, 1e-12, 'x' );
	assertArrayClose( scale, tc.scale, 1e-14, 'scale' );
});

test( 'dlatrs3: n_one_nrhs3 (N=1)', function t() {
	const tc = findCase( 'n_one_nrhs3' );
	const A = new Float64Array( [ 5.0 ] );
	const X = new Float64Array( [ 10.0, 20.0, 30.0 ] );
	const scale = new Float64Array( 3 );
	const cnorm = new Float64Array( 1 );
	const info = dlatrs3( 'upper', 'no-transpose', 'non-unit', 'no', 1, 3, A, 1, 1, 0, X, 1, 1, 0, scale, 1, 0, cnorm, 1, 0, allocWork(1, 3), 1, 0 );
	assert.equal( info, tc.info, 'info' );
	assertArrayClose( X, tc.x, 1e-14, 'x' );
	assertArrayClose( scale, tc.scale, 1e-14, 'scale' );
});

test( 'dlatrs3: identity matrix', function t() {
	const tc = findCase( 'identity' );
	const A = new Float64Array( 9 );
	A[ 0 ] = 1.0; A[ 4 ] = 1.0; A[ 8 ] = 1.0;
	const X = new Float64Array( [ 7.0, 8.0, 9.0, 1.0, 2.0, 3.0 ] );
	const scale = new Float64Array( 2 );
	const cnorm = new Float64Array( 3 );
	const info = dlatrs3( 'upper', 'no-transpose', 'non-unit', 'no', 3, 2, A, 1, 3, 0, X, 1, 3, 0, scale, 1, 0, cnorm, 1, 0, allocWork(3, 2), 1, 0 );
	assert.equal( info, tc.info, 'info' );
	assertArrayClose( X, tc.x, 1e-14, 'x' );
	assertArrayClose( scale, tc.scale, 1e-14, 'scale' );
});

test( 'dlatrs3: normin_Y_upper_N (precomputed column norms)', function t() {
	const tc = findCase( 'normin_Y_upper_N' );
	const n = 4;
	const nrhs = 4;
	const A = new Float64Array( n * n );
	A[ 0 ] = 3.0; A[ 4 ] = 1.0; A[ 8 ] = 2.0; A[ 12 ] = 1.0;
	A[ 5 ] = 4.0; A[ 9 ] = 1.0; A[ 13 ] = 2.0;
	A[ 10 ] = 2.0; A[ 14 ] = 1.0;
	A[ 15 ] = 5.0;
	const X = new Float64Array( n * nrhs );
	let i, j;
	for ( j = 1; j <= nrhs; j++ ) {
		for ( i = 1; i <= n; i++ ) {
			X[ ( ( j - 1 ) * n ) + ( i - 1 ) ] = i + j;
		}
	}
	// Pre-computed off-diagonal column norms (1-norm of off-diag part of column).
	const cnorm = new Float64Array( [ 0.0, 1.0, 3.0, 4.0 ] );
	const scale = new Float64Array( nrhs );
	const info = dlatrs3( 'upper', 'no-transpose', 'non-unit', 'yes', n, nrhs, A, 1, n, 0, X, 1, n, 0, scale, 1, 0, cnorm, 1, 0, allocWork(n, nrhs), 1, 0 );
	assert.equal( info, tc.info, 'info' );
	assertArrayClose( X, tc.x, 1e-13, 'x' );
	assertArrayClose( scale, tc.scale, 1e-14, 'scale' );
});

test( 'dlatrs3: singular matrix returns SCALE=0 and a non-trivial null vector', function t() {
	// Upper triangular with a zero diagonal in column 1: A * x = 0 must have
	// A non-trivial solution. dlatrs3 should set SCALE(rhs)=0 and produce x
	// Such that A*x = 0 (approximately).
	const A = new Float64Array( 9 );
	A[ 0 ] = 2.0; A[ 3 ] = 1.0; A[ 6 ] = 1.0;
	A[ 4 ] = 0.0; A[ 7 ] = 2.0;     // zero diagonal at j=2
	A[ 8 ] = 4.0;
	const X = new Float64Array( [ 1.0, 1.0, 1.0, 2.0, 3.0, 4.0 ] );
	const scale = new Float64Array( 2 );
	const cnorm = new Float64Array( 3 );
	const info = dlatrs3( 'upper', 'no-transpose', 'non-unit', 'no', 3, 2, A, 1, 3, 0, X, 1, 3, 0, scale, 1, 0, cnorm, 1, 0, allocWork(3, 2), 1, 0 );
	assert.equal( info, 0, 'info' );
	assert.equal( scale[ 0 ], 0.0, 'scale[0] === 0 for singular' );
	assert.equal( scale[ 1 ], 0.0, 'scale[1] === 0 for singular' );

	// Verify A*x[:,0] = 0 (the null vector property).
	const Axr0 = ( ( A[ 0 ] * X[ 0 ] ) + ( A[ 3 ] * X[ 1 ] ) ) + ( A[ 6 ] * X[ 2 ] );
	const Axr1 = ( A[ 4 ] * X[ 1 ] ) + ( A[ 7 ] * X[ 2 ] );
	const Axr2 = A[ 8 ] * X[ 2 ];
	assert.ok( Math.abs( Axr0 ) < 1e-13, 'A*x row 0 = 0' );
	assert.ok( Math.abs( Axr1 ) < 1e-13, 'A*x row 1 = 0' );
	assert.ok( Math.abs( Axr2 ) < 1e-13, 'A*x row 2 = 0' );
});

test( 'dlatrs3: non-zero offsets and unit strides for column-major X (interface stress)', function t() {
	// Same problem as nrhs2_upper_N_nonunit but with offsetX = 2 and a
	// Padded X buffer to confirm offsets propagate.
	const tc = findCase( 'nrhs2_upper_N_nonunit' );
	const A = buildUpperA3();
	const X = new Float64Array( 2 + 6 );
	X[ 2 ] = 1.0; X[ 3 ] = 2.0; X[ 4 ] = 3.0;
	X[ 5 ] = 4.0; X[ 6 ] = 5.0; X[ 7 ] = 6.0;
	const scale = new Float64Array( 2 );
	const cnorm = new Float64Array( 3 );
	const info = dlatrs3( 'upper', 'no-transpose', 'non-unit', 'no', 3, 2, A, 1, 3, 0, X, 1, 3, 2, scale, 1, 0, cnorm, 1, 0, allocWork(3, 2), 1, 0 );
	assert.equal( info, 0, 'info' );
	let i;
	for ( i = 0; i < 6; i++ ) {
		assertClose( X[ 2 + i ], tc.x[ i ], 1e-14, 'x[' + i + ']' );
	}
	assertArrayClose( scale, tc.scale, 1e-14, 'scale' );
});

test( 'dlatrs3: scaled diagonal block triggers global SCALE < 1 (exercises realize-scale path)', function t() {
	// Set up a 1-block (NBA=1) problem with a tiny diagonal element so that
	// Dlatrs returns SCALOC < 1 (to keep the divide overflow-safe). This
	// Exercises the SCALE reduction (lines 401-406) and the realize-scaling
	// (lines 412-423) branches.
	const n = 4;
	const nrhs = 2;
	const tiny = 1.0e-300;
	const BIG = 1.0e300;
	const A = new Float64Array( n * n );

	// Upper triangular, last diagonal entry is extremely tiny.
	A[ 0 ] = 1.0;
	A[ 4 ] = 0.0; A[ 5 ] = 1.0;
	A[ 8 ] = 0.0; A[ 9 ] = 0.0; A[ 10 ] = 1.0;
	A[ 12 ] = 0.0; A[ 13 ] = 0.0; A[ 14 ] = 0.0; A[ 15 ] = tiny;

	// B = [1, 1, 1, BIG] → solving A*x = scale*b. With A[3,3]=tiny and b[3]=BIG,

	// Dlatrs scales scale[0] to keep x[3] = BIG/tiny representable.
	const X = new Float64Array( [ 1.0, 1.0, 1.0, BIG, 0.5, 0.5, 0.5, BIG ] );
	const scale = new Float64Array( nrhs );
	const cnorm = new Float64Array( n );
	const info = dlatrs3( 'upper', 'no-transpose', 'non-unit', 'no', n, nrhs, A, 1, n, 0, X, 1, n, 0, scale, 1, 0, cnorm, 1, 0, allocWork(n, nrhs), 1, 0 );
	assert.equal( info, 0, 'info' );

	// SCALE must end up < 1.0 (the dlatrs solve on the diagonal block had to

	// scale the right-hand side down to avoid overflow when dividing by tiny).
	assert.ok( scale[ 0 ] < 1.0 && scale[ 0 ] > 0.0, 'scale[0] in (0,1)' );
	assert.ok( scale[ 1 ] < 1.0 && scale[ 1 ] > 0.0, 'scale[1] in (0,1)' );
	let i;
	for ( i = 0; i < X.length; i++ ) {
		assert.ok( Number.isFinite( X[ i ] ), 'X[' + i + '] finite' );
	}
});

test( 'dlatrs3: tmax > overflow fallback (NaN/Inf in A)', function t() {
	// Inject an Inf in an off-diagonal block of A so that the block-norm
	// Computation reports a non-finite TMAX. dlatrs3 must fall back to
	// per-RHS dlatrs invocations and still return INFO=0.
	const n = 10;
	const nrhs = 2;
	let i, j;
	const A = new Float64Array( n * n );
	for ( j = 1; j <= n; j++ ) {
		for ( i = 1; i <= j; i++ ) {
			if ( i === j ) {
				A[ ( ( j - 1 ) * n ) + ( i - 1 ) ] = 2.0;
			} else {
				A[ ( ( j - 1 ) * n ) + ( i - 1 ) ] = 0.1;
			}
		}
	}
	// Put an Infinity in the off-diagonal block (block row 1, block col 2)
	A[ ( 8 * n ) + 0 ] = Infinity; // A(1,9): block row 1, block col 2
	const X = new Float64Array( n * nrhs );
	for ( i = 0; i < n * nrhs; i++ ) {
		X[ i ] = 1.0;
	}
	const scale = new Float64Array( nrhs );
	const cnorm = new Float64Array( n );
	const info = dlatrs3( 'upper', 'no-transpose', 'non-unit', 'no', n, nrhs, A, 1, n, 0, X, 1, n, 0, scale, 1, 0, cnorm, 1, 0, allocWork(n, nrhs), 1, 0 );
	assert.equal( info, 0, 'info' );

	// We can't check correctness, but at least dlatrs3 returned without error.
});

test( 'dlatrs3: row-major layout via ndarray strides matches column-major problem', function t() {
	// Set up upper triangular A and a single RHS in row-major layout and
	// Verify the solution. For row-major, strideA1=N, strideA2=1.
	const n = 3;
	const nrhs = 2;

	// A (col-major upper) = [[2,1,1],[0,3,2],[0,0,4]]

	// Row-major same matrix: row 0 = [2,1,1], row 1 = [0,3,2], row 2 = [0,0,4]
	const A = new Float64Array( [ 2.0, 1.0, 1.0, 0.0, 3.0, 2.0, 0.0, 0.0, 4.0 ] );

	// Row-major X: row 0 = [1,4], row 1 = [2,5], row 2 = [3,6]
	const X = new Float64Array( [ 1.0, 4.0, 2.0, 5.0, 3.0, 6.0 ] );
	const scale = new Float64Array( nrhs );
	const cnorm = new Float64Array( n );
	const info = dlatrs3( 'upper', 'no-transpose', 'non-unit', 'no', n, nrhs, A, n, 1, 0, X, nrhs, 1, 0, scale, 1, 0, cnorm, 1, 0, allocWork(n, nrhs), 1, 0 );
	assert.equal( info, 0, 'info' );
	const expected = findCase( 'nrhs2_upper_N_nonunit' ).x;

	// Expected fixture is column-major flattening: [x[0,0], x[1,0], x[2,0], x[0,1], x[1,1], x[2,1]].

	// Our row-major X stores [x[0,0], x[0,1], x[1,0], x[1,1], x[2,0], x[2,1]].
	assertClose( X[ 0 ], expected[ 0 ], 1e-14, 'x[0,0]' );
	assertClose( X[ 2 ], expected[ 1 ], 1e-14, 'x[1,0]' );
	assertClose( X[ 4 ], expected[ 2 ], 1e-14, 'x[2,0]' );
	assertClose( X[ 1 ], expected[ 3 ], 1e-14, 'x[0,1]' );
	assertClose( X[ 3 ], expected[ 4 ], 1e-14, 'x[1,1]' );
	assertClose( X[ 5 ], expected[ 5 ], 1e-14, 'x[2,1]' );
});
