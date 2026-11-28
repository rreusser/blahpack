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

/* eslint-disable max-len, max-lines, max-lines-per-function, no-restricted-syntax */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import dlasd7 from './../lib/strided.js';

// FIXTURES //

import basic_icompq1 from './fixtures/basic_icompq1.json' with { type: 'json' };
import basic_icompq0 from './fixtures/basic_icompq0.json' with { type: 'json' };
import sqre1_icompq1 from './fixtures/sqre1_icompq1.json' with { type: 'json' };
import deflation from './fixtures/deflation.json' with { type: 'json' };
import min_size from './fixtures/min_size.json' with { type: 'json' };
import small_z_deflation from './fixtures/small_z_deflation.json' with { type: 'json' };
import all_deflated from './fixtures/all_deflated.json' with { type: 'json' };

// FUNCTIONS //

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
	const relErr = Math.abs( actual - expected ) / Math.max( Math.abs( expected ), 1.0 ); // eslint-disable-line max-len
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
	let i;
	assert.equal( actual.length, expected.length, msg + ': length mismatch' );
	for ( i = 0; i < expected.length; i += 1 ) {
		assertClose( actual[ i ], expected[ i ], tol, msg + '[' + i + ']' );
	}
}

/**
* Converts a typed array to a plain array.
*
* @private
* @param {TypedArray} arr - input array
* @returns {Array} output array
*/
function toArray( arr ) {
	const out = [];
	let i;
	for ( i = 0; i < arr.length; i++ ) {
		out.push( arr[ i ] );
	}
	return out;
}

// TESTS //

test( 'dlasd7 is a function', function t() {
	assert.equal( typeof dlasd7, 'function' );
});

test( 'dlasd7: basic_icompq1 - basic merge with icompq=1', function t() {
	const k = new Int32Array( 1 );
	const givptr = new Int32Array( 1 );
	const c = new Float64Array( 1 );
	const s = new Float64Array( 1 );
	let i;

	const tc = basic_icompq1;
	const N = 7;
	const M = 7;
	const d = new Float64Array( [ 1.0, 3.0, 5.0, 0.0, 2.0, 4.0, 6.0 ] );
	const z = new Float64Array( M );
	const ZW = new Float64Array( N );
	const VF = new Float64Array( [ 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7 ] );
	const VFW = new Float64Array( N );
	const VL = new Float64Array( [ 0.7, 0.6, 0.5, 0.4, 0.3, 0.2, 0.1 ] );
	const VLW = new Float64Array( N );
	const DSIGMA = new Float64Array( N );
	const IDX = new Int32Array( N );
	const IDXP = new Int32Array( N );
	const IDXQ = new Int32Array( [ 1, 2, 3, 0, 1, 2, 3 ] );
	const PERM = new Int32Array( N );
	const GIVCOL = new Int32Array( 2 * N );
	const GIVNUM = new Float64Array( 2 * N );
	const out = dlasd7( 1, 3, 3, 0, k, d, 1, 0, z, 1, 0, ZW, 1, 0, VF, 1, 0, VFW, 1, 0, VL, 1, 0, VLW, 1, 0, 0.5, 0.3, DSIGMA, 1, 0, IDX, 1, 0, IDXP, 1, 0, IDXQ, 1, 0, PERM, 1, 0, givptr, GIVCOL, 1, N, 0, GIVNUM, 1, N, 0, c, s ); // eslint-disable-line max-len
	assert.equal( out, tc.info );
	assert.equal( k[ 0 ], tc.K );
	assert.equal( givptr[ 0 ], tc.givptr );
	assertArrayClose( toArray( d ), tc.D, 1e-14, 'D' );
	assertArrayClose( toArray( z ), tc.Z, 1e-14, 'Z' );
	assertArrayClose( toArray( ZW ), tc.ZW, 1e-14, 'ZW' );
	assertArrayClose( toArray( VF ), tc.VF, 1e-14, 'VF' );
	assertArrayClose( toArray( VL ), tc.VL, 1e-14, 'VL' );
	assertArrayClose( toArray( VFW ), tc.VFW, 1e-14, 'VFW' );
	assertArrayClose( toArray( VLW ), tc.VLW, 1e-14, 'VLW' );
	assertArrayClose( toArray( DSIGMA ), tc.DSIGMA, 1e-14, 'DSIGMA' );
	assert.deepEqual( toArray( IDX ), tc.IDX );
	assert.deepEqual( toArray( IDXP ), tc.IDXP );
	assert.deepEqual( toArray( IDXQ ), tc.IDXQ );
	assert.deepEqual( toArray( PERM ), tc.PERM );
	const givcol1 = [];
	const givcol2 = [];
	const givnum1 = [];
	const givnum2 = [];
	for ( i = 0; i < N; i += 1 ) {
		givcol1.push( GIVCOL[ i ] );
		givcol2.push( GIVCOL[ i + N ] );
		givnum1.push( GIVNUM[ i ] );
		givnum2.push( GIVNUM[ i + N ] );
	}
	assert.deepEqual( givcol1, tc.GIVCOL1 );
	assert.deepEqual( givcol2, tc.GIVCOL2 );
	assertArrayClose( givnum1, tc.GIVNUM1, 1e-14, 'GIVNUM1' );
	assertArrayClose( givnum2, tc.GIVNUM2, 1e-14, 'GIVNUM2' );
});

test( 'dlasd7: basic_icompq0 - singular values only (no vectors)', function t() { // eslint-disable-line max-len
	const k = new Int32Array( 1 );
	const givptr = new Int32Array( 1 );
	const c = new Float64Array( 1 );
	const s = new Float64Array( 1 );

	const tc = basic_icompq0;
	const N = 7;
	const M = 7;
	const d = new Float64Array( [ 1.0, 3.0, 5.0, 0.0, 2.0, 4.0, 6.0 ] );
	const z = new Float64Array( M );
	const ZW = new Float64Array( N );
	const VF = new Float64Array( [ 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7 ] );
	const VFW = new Float64Array( N );
	const VL = new Float64Array( [ 0.7, 0.6, 0.5, 0.4, 0.3, 0.2, 0.1 ] );
	const VLW = new Float64Array( N );
	const DSIGMA = new Float64Array( N );
	const IDX = new Int32Array( N );
	const IDXP = new Int32Array( N );
	const IDXQ = new Int32Array( [ 1, 2, 3, 0, 1, 2, 3 ] );
	const PERM = new Int32Array( N );
	const GIVCOL = new Int32Array( 2 * N );
	const GIVNUM = new Float64Array( 2 * N );
	const out = dlasd7( 0, 3, 3, 0, k, d, 1, 0, z, 1, 0, ZW, 1, 0, VF, 1, 0, VFW, 1, 0, VL, 1, 0, VLW, 1, 0, 0.5, 0.3, DSIGMA, 1, 0, IDX, 1, 0, IDXP, 1, 0, IDXQ, 1, 0, PERM, 1, 0, givptr, GIVCOL, 1, N, 0, GIVNUM, 1, N, 0, c, s ); // eslint-disable-line max-len
	assert.equal( out, tc.info );
	assert.equal( k[ 0 ], tc.K );
	assertArrayClose( toArray( d ), tc.D, 1e-14, 'D' );
	assertArrayClose( toArray( z ), tc.Z, 1e-14, 'Z' );
	assertArrayClose( toArray( DSIGMA ), tc.DSIGMA, 1e-14, 'DSIGMA' );
	assertArrayClose( toArray( VF ), tc.VF, 1e-14, 'VF' );
	assertArrayClose( toArray( VL ), tc.VL, 1e-14, 'VL' );
	assert.deepEqual( toArray( IDX ), tc.IDX );
	assert.deepEqual( toArray( IDXP ), tc.IDXP );
	assert.deepEqual( toArray( IDXQ ), tc.IDXQ );
});

test( 'dlasd7: sqre1_icompq1 - rectangular lower block (sqre=1)', function t() {
	const k = new Int32Array( 1 );
	const givptr = new Int32Array( 1 );
	const c = new Float64Array( 1 );
	const s = new Float64Array( 1 );

	const tc = sqre1_icompq1;
	const N = 5;
	const M = 6;
	const d = new Float64Array( [ 1.0, 4.0, 0.0, 2.0, 5.0, 0.0 ] );
	const z = new Float64Array( M );
	const ZW = new Float64Array( M );
	const VF = new Float64Array( [ 0.1, 0.3, 0.5, 0.7, 0.9, 0.2 ] );
	const VFW = new Float64Array( M );
	const VL = new Float64Array( [ 0.9, 0.7, 0.5, 0.3, 0.1, 0.4 ] );
	const VLW = new Float64Array( M );
	const DSIGMA = new Float64Array( N );
	const IDX = new Int32Array( N );
	const IDXP = new Int32Array( N );
	const IDXQ = new Int32Array( [ 1, 2, 0, 1, 2 ] );
	const PERM = new Int32Array( N );
	const GIVCOL = new Int32Array( 2 * N );
	const GIVNUM = new Float64Array( 2 * N );
	const out = dlasd7( 1, 2, 2, 1, k, d, 1, 0, z, 1, 0, ZW, 1, 0, VF, 1, 0, VFW, 1, 0, VL, 1, 0, VLW, 1, 0, 0.8, 0.6, DSIGMA, 1, 0, IDX, 1, 0, IDXP, 1, 0, IDXQ, 1, 0, PERM, 1, 0, givptr, GIVCOL, 1, N, 0, GIVNUM, 1, N, 0, c, s ); // eslint-disable-line max-len
	assert.equal( out, tc.info );
	assert.equal( k[ 0 ], tc.K );
	assert.equal( givptr[ 0 ], tc.givptr );
	assertClose( c[ 0 ], tc.c, 1e-14, 'c' );
	assertClose( s[ 0 ], tc.s, 1e-14, 's' );
	assertArrayClose( toArray( d ).slice( 0, N ), tc.D, 1e-14, 'D' );
	assertArrayClose( toArray( z ), tc.Z, 1e-14, 'Z' );
	assertArrayClose( toArray( DSIGMA ), tc.DSIGMA, 1e-14, 'DSIGMA' );
	assertArrayClose( toArray( VF ), tc.VF, 1e-14, 'VF' );
	assertArrayClose( toArray( VL ), tc.VL, 1e-14, 'VL' );
	assert.deepEqual( toArray( IDX ).slice( 0, N ), tc.IDX );
	assert.deepEqual( toArray( IDXP ).slice( 0, N ), tc.IDXP );
	assert.deepEqual( toArray( IDXQ ).slice( 0, N ), tc.IDXQ );
	assert.deepEqual( toArray( PERM ).slice( 0, N ), tc.PERM );
});

test( 'dlasd7: deflation - duplicate singular values cause deflation', function t() { // eslint-disable-line max-len
	const k = new Int32Array( 1 );
	const givptr = new Int32Array( 1 );
	const c = new Float64Array( 1 );
	const s = new Float64Array( 1 );
	let i;

	const tc = deflation;
	const N = 7;
	const M = 7;
	const d = new Float64Array( [ 1.0, 2.0, 3.0, 0.0, 1.0, 2.0, 4.0 ] );
	const z = new Float64Array( M );
	const ZW = new Float64Array( N );
	const VF = new Float64Array( [ 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7 ] );
	const VFW = new Float64Array( N );
	const VL = new Float64Array( [ 0.7, 0.6, 0.5, 0.4, 0.3, 0.2, 0.1 ] );
	const VLW = new Float64Array( N );
	const DSIGMA = new Float64Array( N );
	const IDX = new Int32Array( N );
	const IDXP = new Int32Array( N );
	const IDXQ = new Int32Array( [ 1, 2, 3, 0, 1, 2, 3 ] );
	const PERM = new Int32Array( N );
	const GIVCOL = new Int32Array( 2 * N );
	const GIVNUM = new Float64Array( 2 * N );
	const out = dlasd7( 1, 3, 3, 0, k, d, 1, 0, z, 1, 0, ZW, 1, 0, VF, 1, 0, VFW, 1, 0, VL, 1, 0, VLW, 1, 0, 0.5, 0.3, DSIGMA, 1, 0, IDX, 1, 0, IDXP, 1, 0, IDXQ, 1, 0, PERM, 1, 0, givptr, GIVCOL, 1, N, 0, GIVNUM, 1, N, 0, c, s ); // eslint-disable-line max-len
	assert.equal( out, tc.info );
	assert.equal( k[ 0 ], tc.K );
	assert.equal( givptr[ 0 ], tc.givptr );
	assertArrayClose( toArray( d ), tc.D, 1e-14, 'D' );
	assertArrayClose( toArray( z ), tc.Z, 1e-14, 'Z' );
	assertArrayClose( toArray( DSIGMA ), tc.DSIGMA, 1e-14, 'DSIGMA' );
	assert.deepEqual( toArray( IDX ), tc.IDX );
	assert.deepEqual( toArray( IDXP ), tc.IDXP );
	assert.deepEqual( toArray( PERM ), tc.PERM );
	const givcol1 = [];
	const givcol2 = [];
	const givnum1 = [];
	const givnum2 = [];
	for ( i = 0; i < N; i += 1 ) {
		givcol1.push( GIVCOL[ i ] );
		givcol2.push( GIVCOL[ i + N ] );
		givnum1.push( GIVNUM[ i ] );
		givnum2.push( GIVNUM[ i + N ] );
	}
	assert.deepEqual( givcol1, tc.GIVCOL1 );
	assert.deepEqual( givcol2, tc.GIVCOL2 );
	assertArrayClose( givnum1, tc.GIVNUM1, 1e-14, 'GIVNUM1' );
	assertArrayClose( givnum2, tc.GIVNUM2, 1e-14, 'GIVNUM2' );
});

test( 'dlasd7: min_size - NL=1, NR=1 minimum size', function t() {
	const k = new Int32Array( 1 );
	const givptr = new Int32Array( 1 );
	const c = new Float64Array( 1 );
	const s = new Float64Array( 1 );

	const tc = min_size;
	const N = 3;
	const M = 3;
	const d = new Float64Array( [ 3.0, 0.0, 7.0 ] );
	const z = new Float64Array( M );
	const ZW = new Float64Array( N );
	const VF = new Float64Array( [ 0.5, 0.3, 0.8 ] );
	const VFW = new Float64Array( N );
	const VL = new Float64Array( [ 0.4, 0.6, 0.9 ] );
	const VLW = new Float64Array( N );
	const DSIGMA = new Float64Array( N );
	const IDX = new Int32Array( N );
	const IDXP = new Int32Array( N );
	const IDXQ = new Int32Array( [ 1, 0, 1 ] );
	const PERM = new Int32Array( N );
	const GIVCOL = new Int32Array( 2 * N );
	const GIVNUM = new Float64Array( 2 * N );
	const out = dlasd7( 1, 1, 1, 0, k, d, 1, 0, z, 1, 0, ZW, 1, 0, VF, 1, 0, VFW, 1, 0, VL, 1, 0, VLW, 1, 0, 1.0, 2.0, DSIGMA, 1, 0, IDX, 1, 0, IDXP, 1, 0, IDXQ, 1, 0, PERM, 1, 0, givptr, GIVCOL, 1, N, 0, GIVNUM, 1, N, 0, c, s ); // eslint-disable-line max-len
	assert.equal( out, tc.info );
	assert.equal( k[ 0 ], tc.K );
	assert.equal( givptr[ 0 ], tc.givptr );
	assertArrayClose( toArray( d ), tc.D, 1e-14, 'D' );
	assertArrayClose( toArray( z ), tc.Z, 1e-14, 'Z' );
	assertArrayClose( toArray( DSIGMA ), tc.DSIGMA, 1e-14, 'DSIGMA' );
	assert.deepEqual( toArray( IDX ), tc.IDX );
	assert.deepEqual( toArray( IDXP ), tc.IDXP );
	assert.deepEqual( toArray( PERM ), tc.PERM );
});

test( 'dlasd7: small_z_deflation - small alpha causes z-deflation with sqre=1', function t() { // eslint-disable-line max-len
	const k = new Int32Array( 1 );
	const givptr = new Int32Array( 1 );
	const c = new Float64Array( 1 );
	const s = new Float64Array( 1 );

	const tc = small_z_deflation;
	const N = 5;
	const M = 6;
	const d = new Float64Array( [ 1.0, 3.0, 0.0, 2.0, 5.0, 0.0 ] );
	const z = new Float64Array( M );
	const ZW = new Float64Array( M );
	const VF = new Float64Array( [ 0.1, 0.2, 0.3, 0.4, 0.5, 0.6 ] );
	const VFW = new Float64Array( M );
	const VL = new Float64Array( [ 0.6, 0.5, 0.4, 0.3, 0.2, 0.1 ] );
	const VLW = new Float64Array( M );
	const DSIGMA = new Float64Array( N );
	const IDX = new Int32Array( N );
	const IDXP = new Int32Array( N );
	const IDXQ = new Int32Array( [ 1, 2, 0, 1, 2 ] );
	const PERM = new Int32Array( N );
	const GIVCOL = new Int32Array( 2 * N );
	const GIVNUM = new Float64Array( 2 * N );
	const out = dlasd7( 1, 2, 2, 1, k, d, 1, 0, z, 1, 0, ZW, 1, 0, VF, 1, 0, VFW, 1, 0, VL, 1, 0, VLW, 1, 0, 1e-20, 0.5, DSIGMA, 1, 0, IDX, 1, 0, IDXP, 1, 0, IDXQ, 1, 0, PERM, 1, 0, givptr, GIVCOL, 1, N, 0, GIVNUM, 1, N, 0, c, s ); // eslint-disable-line max-len
	assert.equal( out, tc.info );
	assert.equal( k[ 0 ], tc.K );
	assert.equal( givptr[ 0 ], tc.givptr );
	assertClose( c[ 0 ], tc.c, 1e-14, 'c' );
	assertClose( s[ 0 ], tc.s, 1e-14, 's' );
	assertArrayClose( toArray( d ).slice( 0, N ), tc.D, 1e-14, 'D' );
	assertArrayClose( toArray( z ), tc.Z, 1e-14, 'Z' );
	assertArrayClose( toArray( DSIGMA ), tc.DSIGMA, 1e-14, 'DSIGMA' );
	assert.deepEqual( toArray( IDX ).slice( 0, N ), tc.IDX );
	assert.deepEqual( toArray( IDXP ).slice( 0, N ), tc.IDXP );
	assert.deepEqual( toArray( PERM ).slice( 0, N ), tc.PERM );
});

test( 'dlasd7: all_deflated - complete deflation (all z values small)', function t() { // eslint-disable-line max-len
	const k = new Int32Array( 1 );
	const givptr = new Int32Array( 1 );
	const c = new Float64Array( 1 );
	const s = new Float64Array( 1 );

	const tc = all_deflated;
	const N = 5;
	const M = 5;
	const d = new Float64Array( [ 1.0, 3.0, 0.0, 2.0, 5.0 ] );
	const z = new Float64Array( M );
	const ZW = new Float64Array( N );
	const VF = new Float64Array( [ 0.1, 0.2, 0.3, 0.4, 0.5 ] );
	const VFW = new Float64Array( N );
	const VL = new Float64Array( [ 0.5, 0.4, 0.3, 0.2, 0.1 ] );
	const VLW = new Float64Array( N );
	const DSIGMA = new Float64Array( N );
	const IDX = new Int32Array( N );
	const IDXP = new Int32Array( N );
	const IDXQ = new Int32Array( [ 1, 2, 0, 1, 2 ] );
	const PERM = new Int32Array( N );
	const GIVCOL = new Int32Array( 2 * N );
	const GIVNUM = new Float64Array( 2 * N );
	const out = dlasd7( 0, 2, 2, 0, k, d, 1, 0, z, 1, 0, ZW, 1, 0, VF, 1, 0, VFW, 1, 0, VL, 1, 0, VLW, 1, 0, 1e-20, 1e-20, DSIGMA, 1, 0, IDX, 1, 0, IDXP, 1, 0, IDXQ, 1, 0, PERM, 1, 0, givptr, GIVCOL, 1, N, 0, GIVNUM, 1, N, 0, c, s ); // eslint-disable-line max-len
	assert.equal( out, tc.info );
	assert.equal( k[ 0 ], tc.K );
	assertArrayClose( toArray( d ), tc.D, 1e-14, 'D' );
	assertArrayClose( toArray( z ), tc.Z, 1e-14, 'Z' );
	assertArrayClose( toArray( DSIGMA ), tc.DSIGMA, 1e-14, 'DSIGMA' );
	assert.deepEqual( toArray( IDX ), tc.IDX );
	assert.deepEqual( toArray( IDXP ), tc.IDXP );
});

test( 'dlasd7: throws for invalid icompq', function t() {
	const k = new Int32Array( 1 );
	const givptr = new Int32Array( 1 );
	const c = new Float64Array( 1 );
	const s = new Float64Array( 1 );
	assert.throws( function throws() {
		dlasd7( -1, 1, 1, 0, k, new Float64Array( 3 ), 1, 0, new Float64Array( 3 ), 1, 0, new Float64Array( 3 ), 1, 0, new Float64Array( 3 ), 1, 0, new Float64Array( 3 ), 1, 0, new Float64Array( 3 ), 1, 0, new Float64Array( 3 ), 1, 0, 1.0, 1.0, new Float64Array( 3 ), 1, 0, new Int32Array( 3 ), 1, 0, new Int32Array( 3 ), 1, 0, new Int32Array( 3 ), 1, 0, new Int32Array( 3 ), 1, 0, givptr, new Int32Array( 6 ), 1, 3, 0, new Float64Array( 6 ), 1, 3, 0, c, s ); // eslint-disable-line max-len
	}, RangeError );

	assert.throws( function throws() {
		dlasd7( 2, 1, 1, 0, k, new Float64Array( 3 ), 1, 0, new Float64Array( 3 ), 1, 0, new Float64Array( 3 ), 1, 0, new Float64Array( 3 ), 1, 0, new Float64Array( 3 ), 1, 0, new Float64Array( 3 ), 1, 0, new Float64Array( 3 ), 1, 0, 1.0, 1.0, new Float64Array( 3 ), 1, 0, new Int32Array( 3 ), 1, 0, new Int32Array( 3 ), 1, 0, new Int32Array( 3 ), 1, 0, new Int32Array( 3 ), 1, 0, givptr, new Int32Array( 6 ), 1, 3, 0, new Float64Array( 6 ), 1, 3, 0, c, s ); // eslint-disable-line max-len
	}, RangeError );
});

test( 'dlasd7: throws for invalid nl', function t() {
	const k = new Int32Array( 1 );
	const givptr = new Int32Array( 1 );
	const c = new Float64Array( 1 );
	const s = new Float64Array( 1 );
	assert.throws( function throws() {
		dlasd7( 0, 0, 1, 0, k, new Float64Array( 3 ), 1, 0, new Float64Array( 3 ), 1, 0, new Float64Array( 3 ), 1, 0, new Float64Array( 3 ), 1, 0, new Float64Array( 3 ), 1, 0, new Float64Array( 3 ), 1, 0, new Float64Array( 3 ), 1, 0, 1.0, 1.0, new Float64Array( 3 ), 1, 0, new Int32Array( 3 ), 1, 0, new Int32Array( 3 ), 1, 0, new Int32Array( 3 ), 1, 0, new Int32Array( 3 ), 1, 0, givptr, new Int32Array( 6 ), 1, 3, 0, new Float64Array( 6 ), 1, 3, 0, c, s ); // eslint-disable-line max-len
	}, RangeError );
});

test( 'dlasd7: throws for invalid nr', function t() {
	const k = new Int32Array( 1 );
	const givptr = new Int32Array( 1 );
	const c = new Float64Array( 1 );
	const s = new Float64Array( 1 );
	assert.throws( function throws() {
		dlasd7( 0, 1, 0, 0, k, new Float64Array( 3 ), 1, 0, new Float64Array( 3 ), 1, 0, new Float64Array( 3 ), 1, 0, new Float64Array( 3 ), 1, 0, new Float64Array( 3 ), 1, 0, new Float64Array( 3 ), 1, 0, new Float64Array( 3 ), 1, 0, 1.0, 1.0, new Float64Array( 3 ), 1, 0, new Int32Array( 3 ), 1, 0, new Int32Array( 3 ), 1, 0, new Int32Array( 3 ), 1, 0, new Int32Array( 3 ), 1, 0, givptr, new Int32Array( 6 ), 1, 3, 0, new Float64Array( 6 ), 1, 3, 0, c, s ); // eslint-disable-line max-len
	}, RangeError );
});

test( 'dlasd7: throws for invalid sqre', function t() {
	const k = new Int32Array( 1 );
	const givptr = new Int32Array( 1 );
	const c = new Float64Array( 1 );
	const s = new Float64Array( 1 );
	assert.throws( function throws() {
		dlasd7( 0, 1, 1, 2, k, new Float64Array( 3 ), 1, 0, new Float64Array( 3 ), 1, 0, new Float64Array( 3 ), 1, 0, new Float64Array( 3 ), 1, 0, new Float64Array( 3 ), 1, 0, new Float64Array( 3 ), 1, 0, new Float64Array( 3 ), 1, 0, 1.0, 1.0, new Float64Array( 3 ), 1, 0, new Int32Array( 3 ), 1, 0, new Int32Array( 3 ), 1, 0, new Int32Array( 3 ), 1, 0, new Int32Array( 3 ), 1, 0, givptr, new Int32Array( 6 ), 1, 3, 0, new Float64Array( 6 ), 1, 3, 0, c, s ); // eslint-disable-line max-len
	}, RangeError );
});

test( 'dlasd7: two close singular values from the SAME (upper) subproblem deflate by a Givens rotation', function t() {
	// Upper block d = [1, 2, 2] has a repeated value, so after the merge both the kept (J) and the deflated (JPREV) entries come from rows <= NL+1 and both GIVCOL entries are shifted down by one.
	const N = 7;
	const k = new Int32Array( 1 );
	const givptr = new Int32Array( 1 );
	const c = new Float64Array( 1 );
	const s = new Float64Array( 1 );
	const d = new Float64Array( [ 1.0, 2.0, 2.0, 0.0, 1.5, 2.5, 4.0 ] );
	const z = new Float64Array( N );
	const ZW = new Float64Array( N );
	const VF = new Float64Array( [ 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7 ] );
	const VFW = new Float64Array( N );
	const VL = new Float64Array( [ 0.7, 0.6, 0.5, 0.4, 0.3, 0.2, 0.1 ] );
	const VLW = new Float64Array( N );
	const DSIGMA = new Float64Array( N );
	const IDX = new Int32Array( N );
	const IDXP = new Int32Array( N );
	const IDXQ = new Int32Array( [ 1, 2, 3, 0, 1, 2, 3 ] );
	const PERM = new Int32Array( N );
	const GIVCOL = new Int32Array( 2 * N );
	const GIVNUM = new Float64Array( 2 * N );
	const info = dlasd7( 1, 3, 3, 0, k, d, 1, 0, z, 1, 0, ZW, 1, 0, VF, 1, 0, VFW, 1, 0, VL, 1, 0, VLW, 1, 0, 0.5, 0.3, DSIGMA, 1, 0, IDX, 1, 0, IDXP, 1, 0, IDXQ, 1, 0, PERM, 1, 0, givptr, GIVCOL, 1, N, 0, GIVNUM, 1, N, 0, c, s ); // eslint-disable-line max-len

	// The two z entries of the repeated value are alpha*VL(2) = 0.3 (JPREV) and alpha*VL(3) = 0.25 (J):
	const tau = Math.sqrt( ( 0.25 * 0.25 ) + ( 0.3 * 0.3 ) );
	assert.equal( info, 0 );
	assert.equal( k[ 0 ], 6, 'one value deflated' );
	assert.equal( givptr[ 0 ], 1, 'one rotation' );

	// Rotation between original columns 2 (JPREV) and 3 (J), both in the upper block:
	assert.equal( GIVCOL[ 0 ], 3, 'GIVCOL(1,1)' );
	assert.equal( GIVCOL[ N ], 2, 'GIVCOL(1,2)' );
	assertClose( GIVNUM[ N ], 0.25 / tau, 1e-15, 'GIVNUM(1,2) = c' );
	assertClose( GIVNUM[ 0 ], -0.3 / tau, 1e-15, 'GIVNUM(1,1) = s' );
	assertClose( ( GIVNUM[ 0 ] * GIVNUM[ 0 ] ) + ( GIVNUM[ N ] * GIVNUM[ N ] ), 1.0, 1e-15, 'c^2 + s^2' );

	// The surviving z entry carries the combined norm; the non-deflated values are sorted and the deflated one is moved to the end:
	assertArrayClose( toArray( z ).slice( 0, 6 ), [ 0.2, 0.35, 0.15, tau, 0.18, 0.21 ], 1e-15, 'z' );
	assertArrayClose( toArray( DSIGMA ), [ 0.0, 1.0, 1.5, 2.0, 2.5, 4.0, 2.0 ], 0.0, 'DSIGMA' );
	assert.equal( d[ 6 ], 2.0, 'deflated value stored in D(N)' );

	// Bookkeeping matches reference DLASD7 (LAPACK 3.12.0) on these inputs:
	assert.deepEqual( toArray( IDXP ), [ 0, 2, 3, 5, 6, 7, 4 ] );
	assert.deepEqual( toArray( PERM ), [ 0, 1, 5, 3, 6, 7, 2 ] );
});

test( 'dlasd7: a zero singular value in a subproblem makes DSIGMA(2) equal to half the deflation tolerance', function t() {
	const N = 7;
	const EPS = 1.1102230246251565e-16;
	const k = new Int32Array( 1 );
	const givptr = new Int32Array( 1 );
	const c = new Float64Array( 1 );
	const s = new Float64Array( 1 );
	const d = new Float64Array( [ 0.0, 2.0, 3.0, 0.0, 1.0, 2.5, 4.0 ] );
	const z = new Float64Array( N );
	const ZW = new Float64Array( N );
	const VF = new Float64Array( [ 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7 ] );
	const VFW = new Float64Array( N );
	const VL = new Float64Array( [ 0.7, 0.6, 0.5, 0.4, 0.3, 0.2, 0.1 ] );
	const VLW = new Float64Array( N );
	const DSIGMA = new Float64Array( N );
	const IDX = new Int32Array( N );
	const IDXP = new Int32Array( N );
	const IDXQ = new Int32Array( [ 1, 2, 3, 0, 1, 2, 3 ] );
	const PERM = new Int32Array( N );
	const GIVCOL = new Int32Array( 2 * N );
	const GIVNUM = new Float64Array( 2 * N );
	const info = dlasd7( 1, 3, 3, 0, k, d, 1, 0, z, 1, 0, ZW, 1, 0, VF, 1, 0, VFW, 1, 0, VL, 1, 0, VLW, 1, 0, 0.5, 0.3, DSIGMA, 1, 0, IDX, 1, 0, IDXP, 1, 0, IDXQ, 1, 0, PERM, 1, 0, givptr, GIVCOL, 1, N, 0, GIVNUM, 1, N, 0, c, s ); // eslint-disable-line max-len

	// tol = 64 * eps * max( |d(N)|, |alpha|, |beta| ) = 64 * eps * 4:
	const hlftol = ( 64.0 * EPS * 4.0 ) / 2.0;
	assert.equal( info, 0 );
	assert.equal( k[ 0 ], N, 'nothing deflated' );
	assert.equal( givptr[ 0 ], 0 );
	assert.equal( DSIGMA[ 1 ], hlftol, 'DSIGMA(2) replaced by tol/2' );
	assertArrayClose( toArray( DSIGMA ), [ 0.0, hlftol, 1.0, 2.0, 2.5, 3.0, 4.0 ], 0.0, 'DSIGMA' );
	assertArrayClose( toArray( z ), [ 0.2, 0.35, 0.15, 0.3, 0.18, 0.25, 0.21 ], 1e-15, 'z' );
	assert.deepEqual( toArray( PERM ), [ 0, 1, 5, 2, 6, 3, 7 ] );
});
