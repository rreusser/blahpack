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
	var relErr;
	var i;
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
	var result = [];
	var i;
	var j;
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
	var out = [];
	var i;
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
	var lscale;
	var rscale;
	var info;
	var LDV;
	var tc;
	var n;
	var m;
	var V;

	tc = job_n;
	n = 3;
	m = 2;
	LDV = n;
	V = new Float64Array( LDV * m );
	lscale = new Float64Array( [ 2.0, 3.0, 4.0 ] );
	rscale = new Float64Array( [ 5.0, 6.0, 7.0 ] );
	V[ 0 ] = 1.0;
	V[ 1 ] = 2.0;
	V[ 2 ] = 3.0;
	V[ 3 ] = 4.0;
	V[ 4 ] = 5.0;
	V[ 5 ] = 6.0;
	info = base( 'none', 'right', n, 1, 3, lscale, 1, 0, rscale, 1, 0, m, V, 1, LDV, 0 ); // eslint-disable-line max-len
	assert.strictEqual( info, tc.info, 'info' );
	assertArrayClose( extractMatrix( V, LDV, n, m ), tc.v, 'v' );
});

test( 'dggbak: JOB=scale, SIDE=right (scale right eigenvectors by RSCALE)', function t() { // eslint-disable-line max-len
	var lscale;
	var rscale;
	var info;
	var LDV;
	var tc;
	var n;
	var m;
	var V;

	tc = scale_right;
	n = 3;
	m = 2;
	LDV = n;
	V = new Float64Array( LDV * m );
	lscale = new Float64Array( 3 );
	rscale = new Float64Array( [ 2.0, 3.0, 0.5 ] );
	V[ 0 ] = 1.0;
	V[ 1 ] = 2.0;
	V[ 2 ] = 3.0;
	V[ 3 ] = 4.0;
	V[ 4 ] = 5.0;
	V[ 5 ] = 6.0;
	info = base( 'scale', 'right', n, 1, 3, lscale, 1, 0, rscale, 1, 0, m, V, 1, LDV, 0 ); // eslint-disable-line max-len
	assert.strictEqual( info, tc.info, 'info' );
	assertArrayClose( extractMatrix( V, LDV, n, m ), tc.v, 'v' );
});

test( 'dggbak: JOB=scale, SIDE=left (scale left eigenvectors by LSCALE)', function t() { // eslint-disable-line max-len
	var lscale;
	var rscale;
	var info;
	var LDV;
	var tc;
	var n;
	var m;
	var V;

	tc = scale_left;
	n = 3;
	m = 2;
	LDV = n;
	V = new Float64Array( LDV * m );
	lscale = new Float64Array( [ 2.0, 0.5, 3.0 ] );
	rscale = new Float64Array( 3 );
	V[ 0 ] = 1.0;
	V[ 1 ] = 2.0;
	V[ 2 ] = 3.0;
	V[ 3 ] = 4.0;
	V[ 4 ] = 5.0;
	V[ 5 ] = 6.0;
	info = base( 'scale', 'left', n, 1, 3, lscale, 1, 0, rscale, 1, 0, m, V, 1, LDV, 0 ); // eslint-disable-line max-len
	assert.strictEqual( info, tc.info, 'info' );
	assertArrayClose( extractMatrix( V, LDV, n, m ), tc.v, 'v' );
});

test( 'dggbak: JOB=permute, SIDE=right (permute right eigenvectors)', function t() { // eslint-disable-line max-len
	var lscale;
	var rscale;
	var info;
	var LDV;
	var tc;
	var n;
	var m;
	var V;

	tc = permute_right;
	n = 4;
	m = 2;
	LDV = n;
	V = new Float64Array( LDV * m );
	lscale = new Float64Array( 4 );
	rscale = new Float64Array( [ 3.0, 0.0, 0.0, 2.0 ] );
	V[ 0 ] = 1.0;
	V[ 1 ] = 2.0;
	V[ 2 ] = 3.0;
	V[ 3 ] = 4.0;
	V[ 4 ] = 5.0;
	V[ 5 ] = 6.0;
	V[ 6 ] = 7.0;
	V[ 7 ] = 8.0;
	info = base( 'permute', 'right', n, 2, 3, lscale, 1, 0, rscale, 1, 0, m, V, 1, LDV, 0 ); // eslint-disable-line max-len
	assert.strictEqual( info, tc.info, 'info' );
	assertArrayClose( extractMatrix( V, LDV, n, m ), tc.v, 'v' );
});

test( 'dggbak: JOB=permute, SIDE=left (permute left eigenvectors)', function t() { // eslint-disable-line max-len
	var lscale;
	var rscale;
	var info;
	var LDV;
	var tc;
	var n;
	var m;
	var V;

	tc = permute_left;
	n = 4;
	m = 2;
	LDV = n;
	V = new Float64Array( LDV * m );
	lscale = new Float64Array( [ 4.0, 0.0, 0.0, 1.0 ] );
	rscale = new Float64Array( 4 );
	V[ 0 ] = 1.0;
	V[ 1 ] = 2.0;
	V[ 2 ] = 3.0;
	V[ 3 ] = 4.0;
	V[ 4 ] = 5.0;
	V[ 5 ] = 6.0;
	V[ 6 ] = 7.0;
	V[ 7 ] = 8.0;
	info = base( 'permute', 'left', n, 2, 3, lscale, 1, 0, rscale, 1, 0, m, V, 1, LDV, 0 ); // eslint-disable-line max-len
	assert.strictEqual( info, tc.info, 'info' );
	assertArrayClose( extractMatrix( V, LDV, n, m ), tc.v, 'v' );
});

test( 'dggbak: JOB=both, SIDE=right (both scale and permute, right)', function t() { // eslint-disable-line max-len
	var lscale;
	var rscale;
	var info;
	var LDV;
	var tc;
	var n;
	var m;
	var V;

	tc = both_right;
	n = 4;
	m = 2;
	LDV = n;
	V = new Float64Array( LDV * m );
	lscale = new Float64Array( 4 );
	rscale = new Float64Array( [ 3.0, 2.0, 0.5, 2.0 ] );
	V[ 0 ] = 1.0;
	V[ 1 ] = 2.0;
	V[ 2 ] = 3.0;
	V[ 3 ] = 4.0;
	V[ 4 ] = 5.0;
	V[ 5 ] = 6.0;
	V[ 6 ] = 7.0;
	V[ 7 ] = 8.0;
	info = base( 'both', 'right', n, 2, 3, lscale, 1, 0, rscale, 1, 0, m, V, 1, LDV, 0 ); // eslint-disable-line max-len
	assert.strictEqual( info, tc.info, 'info' );
	assertArrayClose( extractMatrix( V, LDV, n, m ), tc.v, 'v' );
});

test( 'dggbak: JOB=both, SIDE=left (both scale and permute, left)', function t() { // eslint-disable-line max-len
	var lscale;
	var rscale;
	var info;
	var LDV;
	var tc;
	var n;
	var m;
	var V;

	tc = both_left;
	n = 4;
	m = 2;
	LDV = n;
	V = new Float64Array( LDV * m );
	lscale = new Float64Array( [ 4.0, 3.0, 0.25, 1.0 ] );
	rscale = new Float64Array( 4 );
	V[ 0 ] = 1.0;
	V[ 1 ] = 2.0;
	V[ 2 ] = 3.0;
	V[ 3 ] = 4.0;
	V[ 4 ] = 5.0;
	V[ 5 ] = 6.0;
	V[ 6 ] = 7.0;
	V[ 7 ] = 8.0;
	info = base( 'both', 'left', n, 2, 3, lscale, 1, 0, rscale, 1, 0, m, V, 1, LDV, 0 ); // eslint-disable-line max-len
	assert.strictEqual( info, tc.info, 'info' );
	assertArrayClose( extractMatrix( V, LDV, n, m ), tc.v, 'v' );
});

test( 'dggbak: N=0 quick return', function t() {
	var lscale;
	var rscale;
	var info;
	var tc;
	var V;

	tc = n_zero;
	V = new Float64Array( 2 );
	lscale = new Float64Array( 1 );
	rscale = new Float64Array( 1 );
	info = base( 'both', 'right', 0, 1, 0, lscale, 1, 0, rscale, 1, 0, 2, V, 1, 1, 0 ); // eslint-disable-line max-len
	assert.strictEqual( info, tc.info, 'info' );
});

test( 'dggbak: M=0 quick return', function t() {
	var lscale;
	var rscale;
	var info;
	var tc;
	var V;

	tc = m_zero;
	V = new Float64Array( 2 );
	lscale = new Float64Array( 3 );
	rscale = new Float64Array( 3 );
	info = base( 'both', 'right', 3, 1, 3, lscale, 1, 0, rscale, 1, 0, 0, V, 1, 3, 0 ); // eslint-disable-line max-len
	assert.strictEqual( info, tc.info, 'info' );
});

test( 'dggbak: ILO=IHI (skip scaling, permutation still applies)', function t() { // eslint-disable-line max-len
	var lscale;
	var rscale;
	var info;
	var LDV;
	var tc;
	var n;
	var m;
	var V;

	tc = ilo_eq_ihi;
	n = 4;
	m = 2;
	LDV = n;
	V = new Float64Array( LDV * m );
	lscale = new Float64Array( 4 );
	rscale = new Float64Array( [ 3.0, 2.0, 4.0, 1.0 ] );
	V[ 0 ] = 1.0;
	V[ 1 ] = 2.0;
	V[ 2 ] = 3.0;
	V[ 3 ] = 4.0;
	V[ 4 ] = 5.0;
	V[ 5 ] = 6.0;
	V[ 6 ] = 7.0;
	V[ 7 ] = 8.0;
	info = base( 'both', 'right', n, 2, 2, lscale, 1, 0, rscale, 1, 0, m, V, 1, LDV, 0 ); // eslint-disable-line max-len
	assert.strictEqual( info, tc.info, 'info' );
	assertArrayClose( extractMatrix( V, LDV, n, m ), tc.v, 'v' );
});

test( 'dggbak: ILO=1 (skip first permutation loop)', function t() {
	var lscale;
	var rscale;
	var info;
	var LDV;
	var tc;
	var n;
	var m;
	var V;

	tc = ilo_one_permute;
	n = 3;
	m = 2;
	LDV = n;
	V = new Float64Array( LDV * m );
	lscale = new Float64Array( 3 );
	rscale = new Float64Array( [ 1.0, 2.0, 1.0 ] );
	V[ 0 ] = 1.0;
	V[ 1 ] = 2.0;
	V[ 2 ] = 3.0;
	V[ 3 ] = 4.0;
	V[ 4 ] = 5.0;
	V[ 5 ] = 6.0;
	info = base( 'permute', 'right', n, 1, 2, lscale, 1, 0, rscale, 1, 0, m, V, 1, LDV, 0 ); // eslint-disable-line max-len
	assert.strictEqual( info, tc.info, 'info' );
	assertArrayClose( extractMatrix( V, LDV, n, m ), tc.v, 'v' );
});

test( 'dggbak: IHI=N (skip second permutation loop)', function t() {
	var lscale;
	var rscale;
	var info;
	var LDV;
	var tc;
	var n;
	var m;
	var V;

	tc = ihi_n_permute;
	n = 3;
	m = 2;
	LDV = n;
	V = new Float64Array( LDV * m );
	lscale = new Float64Array( 3 );
	rscale = new Float64Array( [ 3.0, 2.0, 3.0 ] );
	V[ 0 ] = 1.0;
	V[ 1 ] = 2.0;
	V[ 2 ] = 3.0;
	V[ 3 ] = 4.0;
	V[ 4 ] = 5.0;
	V[ 5 ] = 6.0;
	info = base( 'permute', 'right', n, 2, 3, lscale, 1, 0, rscale, 1, 0, m, V, 1, LDV, 0 ); // eslint-disable-line max-len
	assert.strictEqual( info, tc.info, 'info' );
	assertArrayClose( extractMatrix( V, LDV, n, m ), tc.v, 'v' );
});

test( 'dggbak: K=I (no-swap, continue case)', function t() {
	var lscale;
	var rscale;
	var info;
	var LDV;
	var tc;
	var n;
	var m;
	var V;

	tc = k_eq_i;
	n = 3;
	m = 2;
	LDV = n;
	V = new Float64Array( LDV * m );
	lscale = new Float64Array( 3 );
	rscale = new Float64Array( [ 1.0, 2.0, 3.0 ] );
	V[ 0 ] = 1.0;
	V[ 1 ] = 2.0;
	V[ 2 ] = 3.0;
	V[ 3 ] = 4.0;
	V[ 4 ] = 5.0;
	V[ 5 ] = 6.0;
	info = base( 'permute', 'right', n, 2, 2, lscale, 1, 0, rscale, 1, 0, m, V, 1, LDV, 0 ); // eslint-disable-line max-len
	assert.strictEqual( info, tc.info, 'info' );
	assertArrayClose( extractMatrix( V, LDV, n, m ), tc.v, 'v' );
});

test( 'dggbak: JOB=permute, SIDE=left, self-permutation (k===i) in both loops', function t() { // eslint-disable-line max-len
	var lscale;
	var rscale;
	var origV;
	var info;
	var LDV;
	var n;
	var m;
	var V;

	n = 4;
	m = 2;
	LDV = n;
	V = new Float64Array( LDV * m );
	lscale = new Float64Array( [ 1.0, 0.0, 0.0, 4.0 ] );
	rscale = new Float64Array( 4 );
	V[ 0 ] = 1.0;
	V[ 1 ] = 2.0;
	V[ 2 ] = 3.0;
	V[ 3 ] = 4.0;
	V[ 4 ] = 5.0;
	V[ 5 ] = 6.0;
	V[ 6 ] = 7.0;
	V[ 7 ] = 8.0;
	origV = toArray( V );
	info = base( 'permute', 'left', n, 2, 3, lscale, 1, 0, rscale, 1, 0, m, V, 1, LDV, 0 ); // eslint-disable-line max-len
	assert.strictEqual( info, 0, 'info' );
	assertArrayClose( extractMatrix( V, LDV, n, m ), extractMatrix( new Float64Array( origV ), LDV, n, m ), 'v unchanged' ); // eslint-disable-line max-len
});

test( 'dggbak: N=1 edge case', function t() {
	var lscale;
	var rscale;
	var info;
	var tc;
	var V;

	tc = n_one;
	V = new Float64Array( 1 );
	lscale = new Float64Array( 1 );
	rscale = new Float64Array( [ 1.0 ] );
	V[ 0 ] = 5.0;
	info = base( 'both', 'right', 1, 1, 1, lscale, 1, 0, rscale, 1, 0, 1, V, 1, 1, 0 ); // eslint-disable-line max-len
	assert.strictEqual( info, tc.info, 'info' );
	assertArrayClose( [ V[ 0 ] ], tc.v, 'v' );
});

test( 'dggbak: larger matrix, JOB=both, SIDE=right', function t() {
	var lscale;
	var rscale;
	var info;
	var LDV;
	var tc;
	var n;
	var m;
	var V;

	tc = larger_both_right;
	n = 5;
	m = 3;
	LDV = n;
	V = new Float64Array( LDV * m );
	lscale = new Float64Array( 5 );
	rscale = new Float64Array( [ 4.0, 2.0, 0.5, 3.0, 1.0 ] );
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
	info = base( 'both', 'right', n, 2, 4, lscale, 1, 0, rscale, 1, 0, m, V, 1, LDV, 0 ); // eslint-disable-line max-len
	assert.strictEqual( info, tc.info, 'info' );
	assertArrayClose( extractMatrix( V, LDV, n, m ), tc.v, 'v' );
});

test( 'dggbak: ndarray wrapper validates job argument', function t() {
	var lscale;
	var rscale;
	var V;

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
	var lscale;
	var rscale;
	var V;

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
	var lscale;
	var rscale;
	var V;

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
	var lscale;
	var rscale;
	var V;

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
	var lscale;
	var rscale;
	var V;

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
	var lscale;
	var rscale;
	var info;
	var tc;
	var V;

	tc = scale_right;
	V = new Float64Array( 6 );
	lscale = new Float64Array( 3 );
	rscale = new Float64Array( [ 2.0, 3.0, 0.5 ] );
	V[ 0 ] = 1.0;
	V[ 1 ] = 2.0;
	V[ 2 ] = 3.0;
	V[ 3 ] = 4.0;
	V[ 4 ] = 5.0;
	V[ 5 ] = 6.0;
	info = dggbak( 'column-major', 'scale', 'right', 3, 1, 3, lscale, 1, rscale, 1, 2, V, 3 ); // eslint-disable-line max-len
	assert.strictEqual( info, tc.info, 'info' );
	assertArrayClose( extractMatrix( V, 3, 3, 2 ), tc.v, 'v' );
});
