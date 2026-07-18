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

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dggbak from './../lib/index.js';
import base from './../lib/ndarray.js';

// VARIABLES //

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
import ilo_eq_ihi from './fixtures/ilo_eq_ihi.json' with { type: 'json' };
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
* @param {Array} actual - actual value
* @param {Array} expected - expected value
* @param {string} msg - assertion message
*/
function assertArrayClose( actual, expected, msg ) {
	let relErr, i;
	assert.strictEqual( actual.length, expected.length, msg + ': length mismatch (' + actual.length + ' vs ' + expected.length + ')' ); // eslint-disable-line max-len
	for ( i = 0; i < expected.length; i += 1 ) {
		if ( expected[ i ] === 0.0 ) {
			assert.ok( Math.abs( actual[ i ] ) <= 1e-14, msg + '[' + i + ']: expected ' + expected[ i ] + ', got ' + actual[ i ] ); // eslint-disable-line max-len
		} else {
			relErr = Math.abs( actual[ i ] - expected[ i ] ) / Math.max( Math.abs( expected[ i ] ), 1.0 ); // eslint-disable-line max-len
			assert.ok( relErr <= 1e-14, msg + '[' + i + ']: expected ' + expected[ i ] + ', got ' + actual[ i ] ); // eslint-disable-line max-len
		}
	}
}

/**
* Extracts a real matrix from a flat column-major Float64Array.
*
* @private
* @param {Float64Array} V - flat matrix
* @param {integer} LDV - leading dimension (allocated rows)
* @param {integer} n - number of rows to extract per column
* @param {integer} m - number of columns
* @returns {Array} flat array in column-major order
*/
function extractMatrix( V, LDV, n, m ) {
	const result = [];
	let i, j;
	for ( j = 0; j < m; j += 1 ) {
		for ( i = 0; i < n; i += 1 ) {
			result.push( V[ (j * LDV) + i ] );
		}
	}
	return result;
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
	for ( i = 0; i < arr.length; i += 1 ) {
		out.push( arr[ i ] );
	}
	return out;
}

// TESTS //

test( 'dggbak: main export is a function', function t() {
	assert.strictEqual( typeof dggbak, 'function' );
});

test( 'dggbak: attached to the main export is an `ndarray` method', function t() { // eslint-disable-line max-len
	assert.strictEqual( typeof dggbak.ndarray, 'function' );
});

test( 'dggbak: JOB=none quick return (no transformation)', function t() {

	const tc = job_n;
	const n = 3;
	const m = 2;
	const LDV = n;
	const V = new Float64Array( LDV * m );
	const lscale = new Float64Array( [ 2.0, 3.0, 4.0 ] );
	const rscale = new Float64Array( [ 5.0, 6.0, 7.0 ] );
	V[ 0 ] = 1.0;
	V[ 1 ] = 2.0;
	V[ 2 ] = 3.0;
	V[ 3 ] = 4.0;
	V[ 4 ] = 5.0;
	V[ 5 ] = 6.0;
	const info = base( 'none', 'right', n, 1, 3, lscale, 1, 0, rscale, 1, 0, m, V, 1, LDV, 0 ); // eslint-disable-line max-len
	assert.strictEqual( info, tc.info, 'info' );
	assertArrayClose( extractMatrix( V, LDV, n, m ), tc.v, 'v' );
});

test( 'dggbak: JOB=scale, SIDE=right (scale right eigenvectors by RSCALE)', function t() { // eslint-disable-line max-len

	const tc = scale_right;
	const n = 3;
	const m = 2;
	const LDV = n;
	const V = new Float64Array( LDV * m );
	const lscale = new Float64Array( 3 );
	const rscale = new Float64Array( [ 2.0, 3.0, 0.5 ] );
	V[ 0 ] = 1.0;
	V[ 1 ] = 2.0;
	V[ 2 ] = 3.0;
	V[ 3 ] = 4.0;
	V[ 4 ] = 5.0;
	V[ 5 ] = 6.0;
	const info = base( 'scale', 'right', n, 1, 3, lscale, 1, 0, rscale, 1, 0, m, V, 1, LDV, 0 ); // eslint-disable-line max-len
	assert.strictEqual( info, tc.info, 'info' );
	assertArrayClose( extractMatrix( V, LDV, n, m ), tc.v, 'v' );
});

test( 'dggbak: JOB=scale, SIDE=left (scale left eigenvectors by LSCALE)', function t() { // eslint-disable-line max-len

	const tc = scale_left;
	const n = 3;
	const m = 2;
	const LDV = n;
	const V = new Float64Array( LDV * m );
	const lscale = new Float64Array( [ 2.0, 0.5, 3.0 ] );
	const rscale = new Float64Array( 3 );
	V[ 0 ] = 1.0;
	V[ 1 ] = 2.0;
	V[ 2 ] = 3.0;
	V[ 3 ] = 4.0;
	V[ 4 ] = 5.0;
	V[ 5 ] = 6.0;
	const info = base( 'scale', 'left', n, 1, 3, lscale, 1, 0, rscale, 1, 0, m, V, 1, LDV, 0 ); // eslint-disable-line max-len
	assert.strictEqual( info, tc.info, 'info' );
	assertArrayClose( extractMatrix( V, LDV, n, m ), tc.v, 'v' );
});

test( 'dggbak: JOB=permute, SIDE=right (permute right eigenvectors)', function t() { // eslint-disable-line max-len

	const tc = permute_right;
	const n = 4;
	const m = 2;
	const LDV = n;
	const V = new Float64Array( LDV * m );
	const lscale = new Float64Array( 4 );
	const rscale = new Float64Array( [ 3.0, 0.0, 0.0, 2.0 ] );
	V[ 0 ] = 1.0;
	V[ 1 ] = 2.0;
	V[ 2 ] = 3.0;
	V[ 3 ] = 4.0;
	V[ 4 ] = 5.0;
	V[ 5 ] = 6.0;
	V[ 6 ] = 7.0;
	V[ 7 ] = 8.0;
	const info = base( 'permute', 'right', n, 2, 3, lscale, 1, 0, rscale, 1, 0, m, V, 1, LDV, 0 ); // eslint-disable-line max-len
	assert.strictEqual( info, tc.info, 'info' );
	assertArrayClose( extractMatrix( V, LDV, n, m ), tc.v, 'v' );
});

test( 'dggbak: JOB=permute, SIDE=left (permute left eigenvectors)', function t() { // eslint-disable-line max-len

	const tc = permute_left;
	const n = 4;
	const m = 2;
	const LDV = n;
	const V = new Float64Array( LDV * m );
	const lscale = new Float64Array( [ 4.0, 0.0, 0.0, 1.0 ] );
	const rscale = new Float64Array( 4 );
	V[ 0 ] = 1.0;
	V[ 1 ] = 2.0;
	V[ 2 ] = 3.0;
	V[ 3 ] = 4.0;
	V[ 4 ] = 5.0;
	V[ 5 ] = 6.0;
	V[ 6 ] = 7.0;
	V[ 7 ] = 8.0;
	const info = base( 'permute', 'left', n, 2, 3, lscale, 1, 0, rscale, 1, 0, m, V, 1, LDV, 0 ); // eslint-disable-line max-len
	assert.strictEqual( info, tc.info, 'info' );
	assertArrayClose( extractMatrix( V, LDV, n, m ), tc.v, 'v' );
});

test( 'dggbak: JOB=both, SIDE=right (both scale and permute, right)', function t() { // eslint-disable-line max-len

	const tc = both_right;
	const n = 4;
	const m = 2;
	const LDV = n;
	const V = new Float64Array( LDV * m );
	const lscale = new Float64Array( 4 );
	const rscale = new Float64Array( [ 3.0, 2.0, 0.5, 2.0 ] );
	V[ 0 ] = 1.0;
	V[ 1 ] = 2.0;
	V[ 2 ] = 3.0;
	V[ 3 ] = 4.0;
	V[ 4 ] = 5.0;
	V[ 5 ] = 6.0;
	V[ 6 ] = 7.0;
	V[ 7 ] = 8.0;
	const info = base( 'both', 'right', n, 2, 3, lscale, 1, 0, rscale, 1, 0, m, V, 1, LDV, 0 ); // eslint-disable-line max-len
	assert.strictEqual( info, tc.info, 'info' );
	assertArrayClose( extractMatrix( V, LDV, n, m ), tc.v, 'v' );
});

test( 'dggbak: JOB=both, SIDE=left (both scale and permute, left)', function t() { // eslint-disable-line max-len

	const tc = both_left;
	const n = 4;
	const m = 2;
	const LDV = n;
	const V = new Float64Array( LDV * m );
	const lscale = new Float64Array( [ 4.0, 3.0, 0.25, 1.0 ] );
	const rscale = new Float64Array( 4 );
	V[ 0 ] = 1.0;
	V[ 1 ] = 2.0;
	V[ 2 ] = 3.0;
	V[ 3 ] = 4.0;
	V[ 4 ] = 5.0;
	V[ 5 ] = 6.0;
	V[ 6 ] = 7.0;
	V[ 7 ] = 8.0;
	const info = base( 'both', 'left', n, 2, 3, lscale, 1, 0, rscale, 1, 0, m, V, 1, LDV, 0 ); // eslint-disable-line max-len
	assert.strictEqual( info, tc.info, 'info' );
	assertArrayClose( extractMatrix( V, LDV, n, m ), tc.v, 'v' );
});

test( 'dggbak: N=0 quick return', function t() {

	const tc = n_zero;
	const V = new Float64Array( 2 );
	const lscale = new Float64Array( 1 );
	const rscale = new Float64Array( 1 );
	const info = base( 'both', 'right', 0, 1, 0, lscale, 1, 0, rscale, 1, 0, 2, V, 1, 1, 0 ); // eslint-disable-line max-len
	assert.strictEqual( info, tc.info, 'info' );
});

test( 'dggbak: M=0 quick return', function t() {

	const tc = m_zero;
	const V = new Float64Array( 2 );
	const lscale = new Float64Array( 3 );
	const rscale = new Float64Array( 3 );
	const info = base( 'both', 'right', 3, 1, 3, lscale, 1, 0, rscale, 1, 0, 0, V, 1, 3, 0 ); // eslint-disable-line max-len
	assert.strictEqual( info, tc.info, 'info' );
});

test( 'dggbak: ILO=IHI (skip scaling, permutation still applies)', function t() { // eslint-disable-line max-len

	const tc = ilo_eq_ihi;
	const n = 4;
	const m = 2;
	const LDV = n;
	const V = new Float64Array( LDV * m );
	const lscale = new Float64Array( 4 );
	const rscale = new Float64Array( [ 3.0, 2.0, 4.0, 1.0 ] );
	V[ 0 ] = 1.0;
	V[ 1 ] = 2.0;
	V[ 2 ] = 3.0;
	V[ 3 ] = 4.0;
	V[ 4 ] = 5.0;
	V[ 5 ] = 6.0;
	V[ 6 ] = 7.0;
	V[ 7 ] = 8.0;
	const info = base( 'both', 'right', n, 2, 2, lscale, 1, 0, rscale, 1, 0, m, V, 1, LDV, 0 ); // eslint-disable-line max-len
	assert.strictEqual( info, tc.info, 'info' );
	assertArrayClose( extractMatrix( V, LDV, n, m ), tc.v, 'v' );
});

test( 'dggbak: ILO=1 (skip first permutation loop)', function t() {

	const tc = ilo_one_permute;
	const n = 3;
	const m = 2;
	const LDV = n;
	const V = new Float64Array( LDV * m );
	const lscale = new Float64Array( 3 );
	const rscale = new Float64Array( [ 1.0, 2.0, 1.0 ] );
	V[ 0 ] = 1.0;
	V[ 1 ] = 2.0;
	V[ 2 ] = 3.0;
	V[ 3 ] = 4.0;
	V[ 4 ] = 5.0;
	V[ 5 ] = 6.0;
	const info = base( 'permute', 'right', n, 1, 2, lscale, 1, 0, rscale, 1, 0, m, V, 1, LDV, 0 ); // eslint-disable-line max-len
	assert.strictEqual( info, tc.info, 'info' );
	assertArrayClose( extractMatrix( V, LDV, n, m ), tc.v, 'v' );
});

test( 'dggbak: IHI=N (skip second permutation loop)', function t() {

	const tc = ihi_n_permute;
	const n = 3;
	const m = 2;
	const LDV = n;
	const V = new Float64Array( LDV * m );
	const lscale = new Float64Array( 3 );
	const rscale = new Float64Array( [ 3.0, 2.0, 3.0 ] );
	V[ 0 ] = 1.0;
	V[ 1 ] = 2.0;
	V[ 2 ] = 3.0;
	V[ 3 ] = 4.0;
	V[ 4 ] = 5.0;
	V[ 5 ] = 6.0;
	const info = base( 'permute', 'right', n, 2, 3, lscale, 1, 0, rscale, 1, 0, m, V, 1, LDV, 0 ); // eslint-disable-line max-len
	assert.strictEqual( info, tc.info, 'info' );
	assertArrayClose( extractMatrix( V, LDV, n, m ), tc.v, 'v' );
});

test( 'dggbak: K=I (no-swap, continue case)', function t() {

	const tc = k_eq_i;
	const n = 3;
	const m = 2;
	const LDV = n;
	const V = new Float64Array( LDV * m );
	const lscale = new Float64Array( 3 );
	const rscale = new Float64Array( [ 1.0, 2.0, 3.0 ] );
	V[ 0 ] = 1.0;
	V[ 1 ] = 2.0;
	V[ 2 ] = 3.0;
	V[ 3 ] = 4.0;
	V[ 4 ] = 5.0;
	V[ 5 ] = 6.0;
	const info = base( 'permute', 'right', n, 2, 2, lscale, 1, 0, rscale, 1, 0, m, V, 1, LDV, 0 ); // eslint-disable-line max-len
	assert.strictEqual( info, tc.info, 'info' );
	assertArrayClose( extractMatrix( V, LDV, n, m ), tc.v, 'v' );
});

test( 'dggbak: JOB=permute, SIDE=left, self-permutation (k===i) in both loops', function t() { // eslint-disable-line max-len

	const n = 4;
	const m = 2;
	const LDV = n;
	const V = new Float64Array( LDV * m );
	const lscale = new Float64Array( [ 1.0, 0.0, 0.0, 4.0 ] );
	const rscale = new Float64Array( 4 );
	V[ 0 ] = 1.0;
	V[ 1 ] = 2.0;
	V[ 2 ] = 3.0;
	V[ 3 ] = 4.0;
	V[ 4 ] = 5.0;
	V[ 5 ] = 6.0;
	V[ 6 ] = 7.0;
	V[ 7 ] = 8.0;
	const origV = toArray( V );
	const info = base( 'permute', 'left', n, 2, 3, lscale, 1, 0, rscale, 1, 0, m, V, 1, LDV, 0 ); // eslint-disable-line max-len
	assert.strictEqual( info, 0, 'info' );
	assertArrayClose( extractMatrix( V, LDV, n, m ), extractMatrix( new Float64Array( origV ), LDV, n, m ), 'v unchanged' ); // eslint-disable-line max-len
});

test( 'dggbak: N=1 edge case', function t() {

	const tc = n_one;
	const V = new Float64Array( 1 );
	const lscale = new Float64Array( 1 );
	const rscale = new Float64Array( [ 1.0 ] );
	V[ 0 ] = 5.0;
	const info = base( 'both', 'right', 1, 1, 1, lscale, 1, 0, rscale, 1, 0, 1, V, 1, 1, 0 ); // eslint-disable-line max-len
	assert.strictEqual( info, tc.info, 'info' );
	assertArrayClose( [ V[ 0 ] ], tc.v, 'v' );
});

test( 'dggbak: larger matrix, JOB=both, SIDE=right', function t() {

	const tc = larger_both_right;
	const n = 5;
	const m = 3;
	const LDV = n;
	const V = new Float64Array( LDV * m );
	const lscale = new Float64Array( 5 );
	const rscale = new Float64Array( [ 4.0, 2.0, 0.5, 3.0, 1.0 ] );
	V[ 0 ] = 1.0;
	V[ 1 ] = 2.0;
	V[ 2 ] = 3.0;
	V[ 3 ] = 4.0;
	V[ 4 ] = 5.0;
	V[ 5 ] = 6.0;
	V[ 6 ] = 7.0;
	V[ 7 ] = 8.0;
	V[ 8 ] = 9.0;
	V[ 9 ] = 10.0;
	V[ 10 ] = 11.0;
	V[ 11 ] = 12.0;
	V[ 12 ] = 13.0;
	V[ 13 ] = 14.0;
	V[ 14 ] = 15.0;
	const info = base( 'both', 'right', n, 2, 4, lscale, 1, 0, rscale, 1, 0, m, V, 1, LDV, 0 ); // eslint-disable-line max-len
	assert.strictEqual( info, tc.info, 'info' );
	assertArrayClose( extractMatrix( V, LDV, n, m ), tc.v, 'v' );
});

test( 'dggbak: ndarray wrapper validates job argument', function t() {
	let lscale, rscale, V;

	V = new Float64Array( 4 );
	lscale = new Float64Array( 2 );
	rscale = new Float64Array( 2 );
	assert.throws( function throws() {
		dggbak.ndarray( 'invalid', 'right', 2, 1, 2, lscale, 1, 0, rscale, 1, 0, 2, V, 1, 2, 0 ); // eslint-disable-line max-len
	}, {
		'name': 'TypeError'
	});
});

test( 'dggbak: ndarray wrapper validates side argument', function t() {
	let lscale, rscale, V;

	V = new Float64Array( 4 );
	lscale = new Float64Array( 2 );
	rscale = new Float64Array( 2 );
	assert.throws( function throws() {
		dggbak.ndarray( 'none', 'invalid', 2, 1, 2, lscale, 1, 0, rscale, 1, 0, 2, V, 1, 2, 0 ); // eslint-disable-line max-len
	}, {
		'name': 'TypeError'
	});
});

test( 'dggbak: ndarray wrapper validates N >= 0', function t() {
	let lscale, rscale, V;

	V = new Float64Array( 4 );
	lscale = new Float64Array( 2 );
	rscale = new Float64Array( 2 );
	assert.throws( function throws() {
		dggbak.ndarray( 'none', 'right', -1, 1, 2, lscale, 1, 0, rscale, 1, 0, 2, V, 1, 2, 0 ); // eslint-disable-line max-len
	}, {
		'name': 'RangeError'
	});
});

test( 'dggbak: ndarray wrapper validates M >= 0', function t() {
	let lscale, rscale, V;

	V = new Float64Array( 4 );
	lscale = new Float64Array( 2 );
	rscale = new Float64Array( 2 );
	assert.throws( function throws() {
		dggbak.ndarray( 'none', 'right', 2, 1, 2, lscale, 1, 0, rscale, 1, 0, -1, V, 1, 2, 0 ); // eslint-disable-line max-len
	}, {
		'name': 'RangeError'
	});
});

test( 'dggbak: BLAS-style wrapper validates order argument', function t() {
	let lscale, rscale, V;

	V = new Float64Array( 4 );
	lscale = new Float64Array( 2 );
	rscale = new Float64Array( 2 );
	assert.throws( function throws() {
		dggbak( 'invalid', 'none', 'right', 2, 1, 2, lscale, 1, rscale, 1, 2, V, 2 ); // eslint-disable-line max-len
	}, {
		'name': 'TypeError'
	});
});

test( 'dggbak: BLAS-style wrapper with column-major layout', function t() {

	const tc = scale_right;
	const V = new Float64Array( 6 );
	const lscale = new Float64Array( 3 );
	const rscale = new Float64Array( [ 2.0, 3.0, 0.5 ] );
	V[ 0 ] = 1.0;
	V[ 1 ] = 2.0;
	V[ 2 ] = 3.0;
	V[ 3 ] = 4.0;
	V[ 4 ] = 5.0;
	V[ 5 ] = 6.0;
	const info = dggbak( 'column-major', 'scale', 'right', 3, 1, 3, lscale, 1, rscale, 1, 2, V, 3 ); // eslint-disable-line max-len
	assert.strictEqual( info, tc.info, 'info' );
	assertArrayClose( extractMatrix( V, 3, 3, 2 ), tc.v, 'v' );
});
