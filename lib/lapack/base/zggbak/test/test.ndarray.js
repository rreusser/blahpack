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
import Float64Array from '@stdlib/array/float64/lib/index.js';
import zggbak from './../lib/index.js';
import base from './../lib/ndarray.js';

// FIXTURES //

import job_n from './fixtures/job_n.json' with { type: 'json' };
import scale_right from './fixtures/scale_right.json' with { type: 'json' };
import scale_left from './fixtures/scale_left.json' with { type: 'json' };
import permute_right from './fixtures/permute_right.json' with { type: 'json' };
import permute_left from './fixtures/permute_left.json' with { type: 'json' };
import both_right from './fixtures/both_right.json' with { type: 'json' };
import both_left from './fixtures/both_left.json' with { type: 'json' };
import n_zero from './fixtures/n_zero.json' with { type: 'json' };
import m_zero from './fixtures/m_zero.json' with { type: 'json' };
import ilo_one_permute from './fixtures/ilo_one_permute.json' with { type: 'json' };
import ihi_n_permute from './fixtures/ihi_n_permute.json' with { type: 'json' };
import k_eq_i from './fixtures/k_eq_i.json' with { type: 'json' };
import n_one from './fixtures/n_one.json' with { type: 'json' };
import larger_both_right from './fixtures/larger_both_right.json' with { type: 'json' };

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
	let relErr, i;
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
* Set complex element (i, j) in interleaved matrix (Float64 view).
*/
function cset( M, LDV, i, j, re, im ) {
	const idx = j * 2 * LDV + i * 2;
	M[ idx ] = re;
	M[ idx + 1 ] = im;
}

/**
* Extract the complex matrix as a flat interleaved array (column-by-column,.
* matching Fortran fixture output format from print_cmatrix).
*
* @param {Float64Array} V - Float64 view of matrix
* @param {integer} LDV - leading dimension (allocated rows)
* @param {integer} n - number of rows to extract per column
* @param {integer} m - number of columns
* @returns {Array} flat array [col0_row0_re, col0_row0_im, col0_row1_re, ...]
*/
function extractCMatrix( V, LDV, n, m ) {
	const result = [];
	let i, j;
	for ( j = 0; j < m; j++ ) {
		for ( i = 0; i < n; i++ ) {
			result.push( V[ j * 2 * LDV + i * 2 ] );
			result.push( V[ j * 2 * LDV + i * 2 + 1 ] );
		}
	}
	return result;
}

// FUNCTIONS //

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

test( 'zggbak: main export is a function', function t() {
	assert.strictEqual( typeof zggbak, 'function' );
});

test( 'zggbak: attached to the main export is an `ndarray` method', function t() { // eslint-disable-line max-len
	assert.strictEqual( typeof zggbak.ndarray, 'function' );
});

test( 'zggbak: JOB=N quick return (no transformation)', function t() {

	const tc = job_n;
	const n = 3;
	const m = 2;
	const LDV = n;
	const V = new Complex128Array( LDV * m );
	const Vv = reinterpret( V, 0 );
	const lscale = new Float64Array( [ 2.0, 3.0, 4.0 ] );
	const rscale = new Float64Array( [ 5.0, 6.0, 7.0 ] );
	cset( Vv, LDV, 0, 0, 1.0, 2.0 );
	cset( Vv, LDV, 1, 0, 3.0, 4.0 );
	cset( Vv, LDV, 2, 0, 5.0, 6.0 );
	cset( Vv, LDV, 0, 1, 7.0, 8.0 );
	cset( Vv, LDV, 1, 1, 9.0, 10.0 );
	cset( Vv, LDV, 2, 1, 11.0, 12.0 );
	const info = base( 'none', 'right', n, 1, 3, lscale, 1, 0, rscale, 1, 0, m, V, 1, LDV, 0 ); // eslint-disable-line max-len
	assert.strictEqual( info, tc.info, 'info' );
	assertArrayClose( extractCMatrix( Vv, LDV, n, m ), tc.v, 'v' );
});

test( 'zggbak: JOB=S, SIDE=R (scale right eigenvectors by RSCALE)', function t() { // eslint-disable-line max-len

	const tc = scale_right;
	const n = 3;
	const m = 2;
	const LDV = n;
	const V = new Complex128Array( LDV * m );
	const Vv = reinterpret( V, 0 );
	const lscale = new Float64Array( 3 );
	const rscale = new Float64Array( [ 2.0, 3.0, 0.5 ] );
	cset( Vv, LDV, 0, 0, 1.0, 2.0 );
	cset( Vv, LDV, 1, 0, 3.0, 4.0 );
	cset( Vv, LDV, 2, 0, 5.0, 6.0 );
	cset( Vv, LDV, 0, 1, 7.0, 8.0 );
	cset( Vv, LDV, 1, 1, 9.0, 10.0 );
	cset( Vv, LDV, 2, 1, 11.0, 12.0 );
	const info = base( 'scale', 'right', n, 1, 3, lscale, 1, 0, rscale, 1, 0, m, V, 1, LDV, 0 ); // eslint-disable-line max-len
	assert.strictEqual( info, tc.info, 'info' );
	assertArrayClose( extractCMatrix( Vv, LDV, n, m ), tc.v, 'v' );
});

test( 'zggbak: JOB=S, SIDE=L (scale left eigenvectors by LSCALE)', function t() { // eslint-disable-line max-len

	const tc = scale_left;
	const n = 3;
	const m = 2;
	const LDV = n;
	const V = new Complex128Array( LDV * m );
	const Vv = reinterpret( V, 0 );
	const lscale = new Float64Array( [ 2.0, 0.5, 3.0 ] );
	const rscale = new Float64Array( 3 );
	cset( Vv, LDV, 0, 0, 1.0, 2.0 );
	cset( Vv, LDV, 1, 0, 3.0, 4.0 );
	cset( Vv, LDV, 2, 0, 5.0, 6.0 );
	cset( Vv, LDV, 0, 1, 7.0, 8.0 );
	cset( Vv, LDV, 1, 1, 9.0, 10.0 );
	cset( Vv, LDV, 2, 1, 11.0, 12.0 );
	const info = base( 'scale', 'left', n, 1, 3, lscale, 1, 0, rscale, 1, 0, m, V, 1, LDV, 0 ); // eslint-disable-line max-len
	assert.strictEqual( info, tc.info, 'info' );
	assertArrayClose( extractCMatrix( Vv, LDV, n, m ), tc.v, 'v' );
});

test( 'zggbak: JOB=P, SIDE=R (permute right eigenvectors)', function t() {

	const tc = permute_right;
	const n = 4;
	const m = 2;
	const LDV = n;
	const V = new Complex128Array( LDV * m );
	const Vv = reinterpret( V, 0 );
	const lscale = new Float64Array( 4 );
	const rscale = new Float64Array( [ 3.0, 0.0, 0.0, 2.0 ] );
	cset( Vv, LDV, 0, 0, 1.0, 0.0 );
	cset( Vv, LDV, 1, 0, 2.0, 0.0 );
	cset( Vv, LDV, 2, 0, 3.0, 0.0 );
	cset( Vv, LDV, 3, 0, 4.0, 0.0 );
	cset( Vv, LDV, 0, 1, 5.0, 0.0 );
	cset( Vv, LDV, 1, 1, 6.0, 0.0 );
	cset( Vv, LDV, 2, 1, 7.0, 0.0 );
	cset( Vv, LDV, 3, 1, 8.0, 0.0 );
	const info = base( 'permute', 'right', n, 2, 3, lscale, 1, 0, rscale, 1, 0, m, V, 1, LDV, 0 ); // eslint-disable-line max-len
	assert.strictEqual( info, tc.info, 'info' );
	assertArrayClose( extractCMatrix( Vv, LDV, n, m ), tc.v, 'v' );
});

test( 'zggbak: JOB=P, SIDE=L (permute left eigenvectors)', function t() {

	const tc = permute_left;
	const n = 4;
	const m = 2;
	const LDV = n;
	const V = new Complex128Array( LDV * m );
	const Vv = reinterpret( V, 0 );
	const lscale = new Float64Array( [ 4.0, 0.0, 0.0, 1.0 ] );
	const rscale = new Float64Array( 4 );
	cset( Vv, LDV, 0, 0, 1.0, 0.0 );
	cset( Vv, LDV, 1, 0, 2.0, 0.0 );
	cset( Vv, LDV, 2, 0, 3.0, 0.0 );
	cset( Vv, LDV, 3, 0, 4.0, 0.0 );
	cset( Vv, LDV, 0, 1, 5.0, 0.0 );
	cset( Vv, LDV, 1, 1, 6.0, 0.0 );
	cset( Vv, LDV, 2, 1, 7.0, 0.0 );
	cset( Vv, LDV, 3, 1, 8.0, 0.0 );
	const info = base( 'permute', 'left', n, 2, 3, lscale, 1, 0, rscale, 1, 0, m, V, 1, LDV, 0 ); // eslint-disable-line max-len
	assert.strictEqual( info, tc.info, 'info' );
	assertArrayClose( extractCMatrix( Vv, LDV, n, m ), tc.v, 'v' );
});

test( 'zggbak: JOB=B, SIDE=R (both scale and permute, right)', function t() {

	const tc = both_right;
	const n = 4;
	const m = 2;
	const LDV = n;
	const V = new Complex128Array( LDV * m );
	const Vv = reinterpret( V, 0 );
	const lscale = new Float64Array( 4 );
	const rscale = new Float64Array( [ 3.0, 2.0, 0.5, 2.0 ] );
	cset( Vv, LDV, 0, 0, 1.0, 1.0 );
	cset( Vv, LDV, 1, 0, 2.0, 2.0 );
	cset( Vv, LDV, 2, 0, 3.0, 3.0 );
	cset( Vv, LDV, 3, 0, 4.0, 4.0 );
	cset( Vv, LDV, 0, 1, 5.0, 5.0 );
	cset( Vv, LDV, 1, 1, 6.0, 6.0 );
	cset( Vv, LDV, 2, 1, 7.0, 7.0 );
	cset( Vv, LDV, 3, 1, 8.0, 8.0 );
	const info = base( 'both', 'right', n, 2, 3, lscale, 1, 0, rscale, 1, 0, m, V, 1, LDV, 0 ); // eslint-disable-line max-len
	assert.strictEqual( info, tc.info, 'info' );
	assertArrayClose( extractCMatrix( Vv, LDV, n, m ), tc.v, 'v' );
});

test( 'zggbak: JOB=B, SIDE=L (both scale and permute, left)', function t() {

	const tc = both_left;
	const n = 4;
	const m = 2;
	const LDV = n;
	const V = new Complex128Array( LDV * m );
	const Vv = reinterpret( V, 0 );
	const lscale = new Float64Array( [ 4.0, 3.0, 0.25, 1.0 ] );
	const rscale = new Float64Array( 4 );
	cset( Vv, LDV, 0, 0, 1.0, 1.0 );
	cset( Vv, LDV, 1, 0, 2.0, 2.0 );
	cset( Vv, LDV, 2, 0, 3.0, 3.0 );
	cset( Vv, LDV, 3, 0, 4.0, 4.0 );
	cset( Vv, LDV, 0, 1, 5.0, 5.0 );
	cset( Vv, LDV, 1, 1, 6.0, 6.0 );
	cset( Vv, LDV, 2, 1, 7.0, 7.0 );
	cset( Vv, LDV, 3, 1, 8.0, 8.0 );
	const info = base( 'both', 'left', n, 2, 3, lscale, 1, 0, rscale, 1, 0, m, V, 1, LDV, 0 ); // eslint-disable-line max-len
	assert.strictEqual( info, tc.info, 'info' );
	assertArrayClose( extractCMatrix( Vv, LDV, n, m ), tc.v, 'v' );
});

test( 'zggbak: N=0 quick return', function t() {

	const tc = n_zero;
	const V = new Complex128Array( 2 );
	const lscale = new Float64Array( 1 );
	const rscale = new Float64Array( 1 );
	const info = base( 'both', 'right', 0, 1, 0, lscale, 1, 0, rscale, 1, 0, 2, V, 1, 1, 0 ); // eslint-disable-line max-len
	assert.strictEqual( info, tc.info, 'info' );
});

test( 'zggbak: M=0 quick return', function t() {

	const tc = m_zero;
	const V = new Complex128Array( 2 );
	const lscale = new Float64Array( 3 );
	const rscale = new Float64Array( 3 );
	const info = base( 'both', 'right', 3, 1, 3, lscale, 1, 0, rscale, 1, 0, 0, V, 1, 3, 0 ); // eslint-disable-line max-len
	assert.strictEqual( info, tc.info, 'info' );
});

test( 'zggbak: ILO=IHI with valid permutation indices', function t() {

	const n = 4;
	const m = 2;
	const LDV = n;
	const V = new Complex128Array( LDV * m );
	const Vv = reinterpret( V, 0 );
	const lscale = new Float64Array( 4 );
	const rscale = new Float64Array( [ 3.0, 2.0, 3.0, 1.0 ] );
	cset( Vv, LDV, 0, 0, 1.0, 0.0 );
	cset( Vv, LDV, 1, 0, 2.0, 0.0 );
	cset( Vv, LDV, 2, 0, 3.0, 0.0 );
	cset( Vv, LDV, 3, 0, 4.0, 0.0 );
	cset( Vv, LDV, 0, 1, 5.0, 0.0 );
	cset( Vv, LDV, 1, 1, 6.0, 0.0 );
	cset( Vv, LDV, 2, 1, 7.0, 0.0 );
	cset( Vv, LDV, 3, 1, 8.0, 0.0 );
	const info = base( 'both', 'right', n, 2, 2, lscale, 1, 0, rscale, 1, 0, m, V, 1, LDV, 0 ); // eslint-disable-line max-len
	assert.strictEqual( info, 0, 'info' );
	assert.strictEqual( Vv[ 2 ], 2.0, 'row 1 col 0 re' );
	assert.strictEqual( Vv[ 3 ], 0.0, 'row 1 col 0 im' );
	assert.strictEqual( Vv[ 10 ], 6.0, 'row 1 col 1 re' );
	assert.strictEqual( Vv[ 11 ], 0.0, 'row 1 col 1 im' );
});

test( 'zggbak: ILO=1 (skip first permutation loop)', function t() {

	const tc = ilo_one_permute;
	const n = 3;
	const m = 2;
	const LDV = n;
	const V = new Complex128Array( LDV * m );
	const Vv = reinterpret( V, 0 );
	const lscale = new Float64Array( 3 );
	const rscale = new Float64Array( [ 1.0, 2.0, 1.0 ] );
	cset( Vv, LDV, 0, 0, 1.0, 0.0 );
	cset( Vv, LDV, 1, 0, 2.0, 0.0 );
	cset( Vv, LDV, 2, 0, 3.0, 0.0 );
	cset( Vv, LDV, 0, 1, 4.0, 0.0 );
	cset( Vv, LDV, 1, 1, 5.0, 0.0 );
	cset( Vv, LDV, 2, 1, 6.0, 0.0 );
	const info = base( 'permute', 'right', n, 1, 2, lscale, 1, 0, rscale, 1, 0, m, V, 1, LDV, 0 ); // eslint-disable-line max-len
	assert.strictEqual( info, tc.info, 'info' );
	assertArrayClose( extractCMatrix( Vv, LDV, n, m ), tc.v, 'v' );
});

test( 'zggbak: IHI=N (skip second permutation loop)', function t() {

	const tc = ihi_n_permute;
	const n = 3;
	const m = 2;
	const LDV = n;
	const V = new Complex128Array( LDV * m );
	const Vv = reinterpret( V, 0 );
	const lscale = new Float64Array( 3 );
	const rscale = new Float64Array( [ 3.0, 2.0, 3.0 ] );
	cset( Vv, LDV, 0, 0, 1.0, 0.0 );
	cset( Vv, LDV, 1, 0, 2.0, 0.0 );
	cset( Vv, LDV, 2, 0, 3.0, 0.0 );
	cset( Vv, LDV, 0, 1, 4.0, 0.0 );
	cset( Vv, LDV, 1, 1, 5.0, 0.0 );
	cset( Vv, LDV, 2, 1, 6.0, 0.0 );
	const info = base( 'permute', 'right', n, 2, 3, lscale, 1, 0, rscale, 1, 0, m, V, 1, LDV, 0 ); // eslint-disable-line max-len
	assert.strictEqual( info, tc.info, 'info' );
	assertArrayClose( extractCMatrix( Vv, LDV, n, m ), tc.v, 'v' );
});

test( 'zggbak: K=I (no-swap, continue case)', function t() {

	const tc = k_eq_i;
	const n = 3;
	const m = 2;
	const LDV = n;
	const V = new Complex128Array( LDV * m );
	const Vv = reinterpret( V, 0 );
	const lscale = new Float64Array( 3 );
	const rscale = new Float64Array( [ 1.0, 2.0, 3.0 ] );
	cset( Vv, LDV, 0, 0, 1.0, 0.0 );
	cset( Vv, LDV, 1, 0, 2.0, 0.0 );
	cset( Vv, LDV, 2, 0, 3.0, 0.0 );
	cset( Vv, LDV, 0, 1, 4.0, 0.0 );
	cset( Vv, LDV, 1, 1, 5.0, 0.0 );
	cset( Vv, LDV, 2, 1, 6.0, 0.0 );
	const info = base( 'permute', 'right', n, 2, 2, lscale, 1, 0, rscale, 1, 0, m, V, 1, LDV, 0 ); // eslint-disable-line max-len
	assert.strictEqual( info, tc.info, 'info' );
	assertArrayClose( extractCMatrix( Vv, LDV, n, m ), tc.v, 'v' );
});

test( 'zggbak: JOB=P, SIDE=L, self-permutation (k===i) in both loops', function t() { // eslint-disable-line max-len

	const n = 4;
	const m = 2;
	const LDV = n;
	const V = new Complex128Array( LDV * m );
	const Vv = reinterpret( V, 0 );
	const lscale = new Float64Array( [ 1.0, 0.0, 0.0, 4.0 ] );
	const rscale = new Float64Array( 4 );
	cset( Vv, LDV, 0, 0, 1.0, 0.0 );
	cset( Vv, LDV, 1, 0, 2.0, 0.0 );
	cset( Vv, LDV, 2, 0, 3.0, 0.0 );
	cset( Vv, LDV, 3, 0, 4.0, 0.0 );
	cset( Vv, LDV, 0, 1, 5.0, 0.0 );
	cset( Vv, LDV, 1, 1, 6.0, 0.0 );
	cset( Vv, LDV, 2, 1, 7.0, 0.0 );
	cset( Vv, LDV, 3, 1, 8.0, 0.0 );
	const origV = toArray( Vv );
	const info = base( 'permute', 'left', n, 2, 3, lscale, 1, 0, rscale, 1, 0, m, V, 1, LDV, 0 ); // eslint-disable-line max-len
	assert.strictEqual( info, 0, 'info' );
	assertArrayClose( extractCMatrix( Vv, LDV, n, m ), origV, 'v unchanged' );
});

test( 'zggbak: N=1 edge case', function t() {

	const tc = n_one;
	const n = 1;
	const m = 1;
	const LDV = n;
	const V = new Complex128Array( 1 );
	const Vv = reinterpret( V, 0 );
	const lscale = new Float64Array( 1 );
	const rscale = new Float64Array( [ 1.0 ] );
	Vv[ 0 ] = 5.0;
	Vv[ 1 ] = 3.0;
	const info = base( 'both', 'right', n, 1, 1, lscale, 1, 0, rscale, 1, 0, m, V, 1, 1, 0 ); // eslint-disable-line max-len
	assert.strictEqual( info, tc.info, 'info' );
	assertArrayClose( [ Vv[ 0 ], Vv[ 1 ] ], tc.v, 'v' );
});

test( 'zggbak: larger matrix with complex values, JOB=B, SIDE=R', function t() {
	let v, k;

	const tc = larger_both_right;
	const n = 5;
	const m = 3;
	const LDV = n;
	const V = new Complex128Array( LDV * m );
	const Vv = reinterpret( V, 0 );
	const lscale = new Float64Array( 5 );
	const rscale = new Float64Array( [ 4.0, 2.0, 0.5, 3.0, 1.0 ] );
	const vals = [
		[ 0, 0, 1, 1 ],
		[ 1, 0, 2, 2 ],
		[ 2, 0, 3, 3 ],
		[ 3, 0, 4, 4 ],
		[ 4, 0, 5, 5 ], // eslint-disable-line max-len
		[ 0, 1, 6, 6 ],
		[ 1, 1, 7, 7 ],
		[ 2, 1, 8, 8 ],
		[ 3, 1, 9, 9 ],
		[ 4, 1, 10, 10 ], // eslint-disable-line max-len
		[ 0, 2, 11, 11 ],
		[ 1, 2, 12, 12 ],
		[ 2, 2, 13, 13 ],
		[ 3, 2, 14, 14 ],
		[ 4, 2, 15, 15 ] // eslint-disable-line max-len
	];
	for ( k = 0; k < vals.length; k++ ) {
		v = vals[ k ];
		cset( Vv, LDV, v[ 0 ], v[ 1 ], v[ 2 ], v[ 3 ] );
	}
	const info = base( 'both', 'right', n, 2, 4, lscale, 1, 0, rscale, 1, 0, m, V, 1, LDV, 0 ); // eslint-disable-line max-len
	assert.strictEqual( info, tc.info, 'info' );
	assertArrayClose( extractCMatrix( Vv, LDV, n, m ), tc.v, 'v' );
});
