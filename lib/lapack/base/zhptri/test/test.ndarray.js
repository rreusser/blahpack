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

/* eslint-disable no-restricted-syntax, stdlib/first-unit-test, max-lines */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import zhptrf from '../../zhptrf/lib/base.js';
import zhptri from './../lib/ndarray.js';

// VARIABLES //

// FIXTURES //

import n1_upper from './fixtures/n1_upper.json' with { type: 'json' };
import n1_lower from './fixtures/n1_lower.json' with { type: 'json' };
import _3x3_upper from './fixtures/3x3_upper.json' with { type: 'json' };
import _3x3_lower from './fixtures/3x3_lower.json' with { type: 'json' };
import _4x4_upper_indef from './fixtures/4x4_upper_indef.json' with { type: 'json' };
import _4x4_lower_indef from './fixtures/4x4_lower_indef.json' with { type: 'json' };
import singular_upper from './fixtures/singular_upper.json' with { type: 'json' };
import singular_lower from './fixtures/singular_lower.json' with { type: 'json' };
import _4x4_upper_swap from './fixtures/4x4_upper_swap.json' with { type: 'json' };
import _4x4_lower_swap from './fixtures/4x4_lower_swap.json' with { type: 'json' };

// FUNCTIONS //

/**
* Asserts that two floating-point numbers are approximately equal.
*
* @private
* @param {number} actual - actual value
* @param {number} expected - expected value
* @param {number} tol - relative tolerance
* @param {string} msg - error message
*/
function assertClose( actual, expected, tol, msg ) {
	var relErr = Math.abs( actual - expected ) / Math.max( Math.abs( expected ), 1.0 ); // eslint-disable-line max-len
	assert.ok( relErr <= tol, msg + ': expected ' + expected + ', got ' + actual );
}

/**
* Asserts that two arrays are element-wise approximately equal.
*
* @private
* @param {Array} actual - actual values
* @param {Array} expected - expected values
* @param {number} tol - relative tolerance
* @param {string} msg - error message
*/
function assertArrayClose( actual, expected, tol, msg ) {
	var i;
	assert.equal( actual.length, expected.length, msg + ': length mismatch' );
	for ( i = 0; i < expected.length; i += 1 ) {
		assertClose( actual[ i ], expected[ i ], tol, msg + '[' + i + ']' );
	}
}

/**
* Converts an array to a plain array.
*
* @private
* @param {TypedArray} arr - typed array
* @returns {Array} plain array
*/
function toArray( arr ) {
	var out;
	var i;
	out = [];
	for ( i = 0; i < arr.length; i += 1 ) {
		out.push( arr[ i ] );
	}
	return out;
}

// TESTS //

test( 'zhptri is a function', function t() {
	assert.equal( typeof zhptri, 'function' );
});

test( 'zhptri: n0 (quick return)', function t() {
	var WORK;
	var IPIV;
	var info;
	var AP;

	AP = new Complex128Array( 0 );
	IPIV = new Int32Array( 0 );
	WORK = new Complex128Array( 0 );
	info = zhptri( 'upper', 0, AP, 1, 0, IPIV, 1, 0, WORK, 1, 0 );
	assert.equal( info, 0 );
});

test( 'zhptri: n1_upper', function t() {
	var WORK;
	var IPIV;
	var info;
	var APv;
	var tc;
	var AP;

	tc = n1_upper;
	AP = new Complex128Array( [ 4.0, 0.0 ] );
	IPIV = new Int32Array( 1 );
	WORK = new Complex128Array( 1 );
	zhptrf( 'upper', 1, AP, 1, 0, IPIV, 1, 0 );
	info = zhptri( 'upper', 1, AP, 1, 0, IPIV, 1, 0, WORK, 1, 0 );
	APv = reinterpret( AP, 0 );
	assertArrayClose( toArray( APv ), tc.ap, 1e-14, 'ap' );
	assert.equal( info, tc.info );
});

test( 'zhptri: n1_lower', function t() {
	var WORK;
	var IPIV;
	var info;
	var APv;
	var tc;
	var AP;

	tc = n1_lower;
	AP = new Complex128Array( [ 9.0, 0.0 ] );
	IPIV = new Int32Array( 1 );
	WORK = new Complex128Array( 1 );
	zhptrf( 'lower', 1, AP, 1, 0, IPIV, 1, 0 );
	info = zhptri( 'lower', 1, AP, 1, 0, IPIV, 1, 0, WORK, 1, 0 );
	APv = reinterpret( AP, 0 );
	assertArrayClose( toArray( APv ), tc.ap, 1e-14, 'ap' );
	assert.equal( info, tc.info );
});

test( 'zhptri: 3x3_upper', function t() {
	var WORK;
	var IPIV;
	var info;
	var APv;
	var tc;
	var AP;

	tc = _3x3_upper;
	AP = new Complex128Array([
		4.0,
		0.0,
		1.0,
		2.0,
		5.0,
		0.0,
		3.0,
		-1.0,
		2.0,
		1.0,
		7.0,
		0.0
	]);
	IPIV = new Int32Array( 3 );
	WORK = new Complex128Array( 3 );
	zhptrf( 'upper', 3, AP, 1, 0, IPIV, 1, 0 );
	info = zhptri( 'upper', 3, AP, 1, 0, IPIV, 1, 0, WORK, 1, 0 );
	APv = reinterpret( AP, 0 );
	assertArrayClose( toArray( APv ), tc.ap, 1e-12, 'ap' );
	assert.equal( info, tc.info );
});

test( 'zhptri: 3x3_lower', function t() {
	var WORK;
	var IPIV;
	var info;
	var APv;
	var tc;
	var AP;

	tc = _3x3_lower;
	AP = new Complex128Array([
		4.0,
		0.0,
		1.0,
		-2.0,
		3.0,
		1.0,
		5.0,
		0.0,
		2.0,
		-1.0,
		7.0,
		0.0
	]);
	IPIV = new Int32Array( 3 );
	WORK = new Complex128Array( 3 );
	zhptrf( 'lower', 3, AP, 1, 0, IPIV, 1, 0 );
	info = zhptri( 'lower', 3, AP, 1, 0, IPIV, 1, 0, WORK, 1, 0 );
	APv = reinterpret( AP, 0 );
	assertArrayClose( toArray( APv ), tc.ap, 1e-12, 'ap' );
	assert.equal( info, tc.info );
});

test( 'zhptri: 4x4_upper_indef (2x2 pivots)', function t() {
	var WORK;
	var IPIV;
	var info;
	var APv;
	var tc;
	var AP;

	tc = _4x4_upper_indef;
	AP = new Complex128Array([
		0.0,
		0.0,
		1.0,
		1.0,
		0.0,
		0.0,
		2.0,
		-1.0,
		4.0,
		2.0,
		0.0,
		0.0,
		3.0,
		0.5,
		5.0,
		-1.0,
		6.0,
		1.0,
		0.0,
		0.0
	]);
	IPIV = new Int32Array( 4 );
	WORK = new Complex128Array( 4 );
	zhptrf( 'upper', 4, AP, 1, 0, IPIV, 1, 0 );
	info = zhptri( 'upper', 4, AP, 1, 0, IPIV, 1, 0, WORK, 1, 0 );
	APv = reinterpret( AP, 0 );
	assertArrayClose( toArray( APv ), tc.ap, 1e-12, 'ap' );
	assert.equal( info, tc.info );
});

test( 'zhptri: 4x4_lower_indef (2x2 pivots)', function t() {
	var WORK;
	var IPIV;
	var info;
	var APv;
	var tc;
	var AP;

	tc = _4x4_lower_indef;
	AP = new Complex128Array([
		0.0,
		0.0,
		1.0,
		-1.0,
		2.0,
		1.0,
		3.0,
		-0.5,
		0.0,
		0.0,
		4.0,
		-2.0,
		5.0,
		1.0,
		0.0,
		0.0,
		6.0,
		-1.0,
		0.0,
		0.0
	]);
	IPIV = new Int32Array( 4 );
	WORK = new Complex128Array( 4 );
	zhptrf( 'lower', 4, AP, 1, 0, IPIV, 1, 0 );
	info = zhptri( 'lower', 4, AP, 1, 0, IPIV, 1, 0, WORK, 1, 0 );
	APv = reinterpret( AP, 0 );
	assertArrayClose( toArray( APv ), tc.ap, 1e-12, 'ap' );
	assert.equal( info, tc.info );
});

test( 'zhptri: singular_upper (INFO > 0)', function t() {
	var WORK;
	var IPIV;
	var info;
	var tc;
	var AP;

	tc = singular_upper;
	AP = new Complex128Array([
		1.0,
		0.0,
		1.0,
		0.0,
		1.0,
		0.0
	]);
	IPIV = new Int32Array( 2 );
	WORK = new Complex128Array( 2 );
	zhptrf( 'upper', 2, AP, 1, 0, IPIV, 1, 0 );
	info = zhptri( 'upper', 2, AP, 1, 0, IPIV, 1, 0, WORK, 1, 0 );
	assert.equal( info, tc.info );
});

test( 'zhptri: singular_lower (INFO > 0)', function t() {
	var WORK;
	var IPIV;
	var info;
	var tc;
	var AP;

	tc = singular_lower;
	AP = new Complex128Array([
		1.0,
		0.0,
		1.0,
		0.0,
		1.0,
		0.0
	]);
	IPIV = new Int32Array( 2 );
	WORK = new Complex128Array( 2 );
	zhptrf( 'lower', 2, AP, 1, 0, IPIV, 1, 0 );
	info = zhptri( 'lower', 2, AP, 1, 0, IPIV, 1, 0, WORK, 1, 0 );
	assert.equal( info, tc.info );
});

test( 'zhptri: 4x4_upper_swap (forces pivot interchange)', function t() {
	var WORK;
	var IPIV;
	var info;
	var APv;
	var tc;
	var AP;

	tc = _4x4_upper_swap;
	AP = new Complex128Array([ // eslint-disable-line max-len
		4.93366403009790755e+0,
		0.0,
		3.82327484853487928e-2,
		-4.10644333378360205e-2,
		8.75000000000000083e-2,
		0.0,
		2.20706320260555082e-2,
		-2.57978497205837536e-2,
		9.96000000000000085e+0,
		9.94999999999999996e-1,
		2.87000000000000011e+0,
		0.0,
		2.50000000000000014e-2,
		5.00000000000000028e-2,
		7.49999999999999972e-2,
		-2.50000000000000014e-2,
		1.00000000000000006e-1,
		1.49999999999999994e-1,
		4.0,
		0.0
	]);
	IPIV = new Int32Array( [ 0, -1, -1, 3 ] );
	WORK = new Complex128Array( 4 );
	info = zhptri( 'upper', 4, AP, 1, 0, IPIV, 1, 0, WORK, 1, 0 );
	APv = reinterpret( AP, 0 );
	assertArrayClose( toArray( APv ), tc.ap, 1e-12, 'ap' );
	assert.equal( info, tc.info );
});

test( 'zhptri: 4x4_lower_swap (forces pivot interchange)', function t() {
	var WORK;
	var IPIV;
	var info;
	var APv;
	var tc;
	var AP;

	tc = _4x4_lower_swap;
	AP = new Complex128Array([ // eslint-disable-line max-len
		1.00000000000000006e-1,
		0.0,
		1.0e+1,
		-1.0,
		3.87288977159880865e-2,
		-4.56802383316782662e-2,
		3.07845084409136098e-2,
		-5.75968222442899760e-2,
		3.0,
		0.0,
		2.23435948361469724e-2,
		-2.73088381330685269e-2,
		1.15193644488579949e-2,
		-1.82720953326713023e-2,
		4.95372393247269116e+0,
		0.0,
		5.28225483120840222e-2,
		2.13294844038168542e-2,
		3.95375551278967219e+0,
		0.0
	]);
	IPIV = new Int32Array( [ -3, -3, 2, 3 ] );
	WORK = new Complex128Array( 4 );
	info = zhptri( 'lower', 4, AP, 1, 0, IPIV, 1, 0, WORK, 1, 0 );
	APv = reinterpret( AP, 0 );
	assertArrayClose( toArray( APv ), tc.ap, 1e-12, 'ap' );
	assert.equal( info, tc.info );
});
