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

/* eslint-disable no-restricted-syntax, stdlib/first-unit-test, max-lines, max-statements-per-line, require-jsdoc, stdlib/jsdoc-private-annotation, node/no-sync, max-len, max-statements */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import zsptrf from '../../zsptrf/lib/base.js';
import zsptri from './../lib/ndarray.js';

// VARIABLES //

// FIXTURES //

import n1_upper from './fixtures/n1_upper.json' with { type: 'json' };
import n1_lower from './fixtures/n1_lower.json' with { type: 'json' };
import _3x3_upper from './fixtures/3x3_upper.json' with { type: 'json' };
import _3x3_lower from './fixtures/3x3_lower.json' with { type: 'json' };
import _4x4_upper_indef from './fixtures/4x4_upper_indef.json' with { type: 'json' };
import _4x4_lower_indef from './fixtures/4x4_lower_indef.json' with { type: 'json' };
import singular_lower from './fixtures/singular_lower.json' with { type: 'json' };
import _4x4_upper_swap from './fixtures/4x4_upper_swap.json' with { type: 'json' };
import _4x4_lower_swap from './fixtures/4x4_lower_swap.json' with { type: 'json' };
import singular_upper from './fixtures/singular_upper.json' with { type: 'json' };

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
* Converts a typed array to a plain array.
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

test( 'zsptri is a function', function t() {
	assert.equal( typeof zsptri, 'function' );
});

test( 'zsptri: n0 (quick return)', function t() {
	var WORK;
	var IPIV;
	var info;
	var AP;

	AP = new Complex128Array( 0 );
	IPIV = new Int32Array( 0 );
	WORK = new Complex128Array( 0 );
	info = zsptri( 'upper', 0, AP, 1, 0, IPIV, 1, 0, WORK, 1, 0 );
	assert.equal( info, 0 );
});

test( 'zsptri: n1_upper', function t() {
	var WORK;
	var IPIV;
	var info;
	var APv;
	var tc;
	var AP;

	tc = n1_upper;
	AP = new Complex128Array( [ 4.0, 2.0 ] );
	IPIV = new Int32Array( 1 );
	WORK = new Complex128Array( 1 );
	zsptrf( 'upper', 1, AP, 1, 0, IPIV, 1, 0 );
	info = zsptri( 'upper', 1, AP, 1, 0, IPIV, 1, 0, WORK, 1, 0 );
	APv = reinterpret( AP, 0 );
	assertArrayClose( toArray( APv ), tc.ap, 1e-14, 'ap' );
	assert.equal( info, tc.info );
});

test( 'zsptri: n1_lower', function t() {
	var WORK;
	var IPIV;
	var info;
	var APv;
	var tc;
	var AP;

	tc = n1_lower;
	AP = new Complex128Array( [ 3.0, -1.0 ] );
	IPIV = new Int32Array( 1 );
	WORK = new Complex128Array( 1 );
	zsptrf( 'lower', 1, AP, 1, 0, IPIV, 1, 0 );
	info = zsptri( 'lower', 1, AP, 1, 0, IPIV, 1, 0, WORK, 1, 0 );
	APv = reinterpret( AP, 0 );
	assertArrayClose( toArray( APv ), tc.ap, 1e-14, 'ap' );
	assert.equal( info, tc.info );
});

test( 'zsptri: 3x3_upper', function t() {
	var WORK;
	var IPIV;
	var info;
	var APv;
	var tc;
	var AP;

	tc = _3x3_upper;
	AP = new Complex128Array([
		2.0,
		1.0,
		1.0,
		2.0,
		3.0,
		1.0,
		3.0,
		-1.0,
		2.0,
		1.0,
		4.0,
		-2.0
	]);
	IPIV = new Int32Array( 3 );
	WORK = new Complex128Array( 3 );
	zsptrf( 'upper', 3, AP, 1, 0, IPIV, 1, 0 );
	info = zsptri( 'upper', 3, AP, 1, 0, IPIV, 1, 0, WORK, 1, 0 );
	APv = reinterpret( AP, 0 );
	assertArrayClose( toArray( APv ), tc.ap, 1e-12, 'ap' );
	assert.equal( info, tc.info );
});

test( 'zsptri: 3x3_lower', function t() {
	var WORK;
	var IPIV;
	var info;
	var APv;
	var tc;
	var AP;

	tc = _3x3_lower;
	AP = new Complex128Array([
		2.0,
		1.0,
		1.0,
		2.0,
		3.0,
		-1.0,
		3.0,
		1.0,
		2.0,
		1.0,
		4.0,
		-2.0
	]);
	IPIV = new Int32Array( 3 );
	WORK = new Complex128Array( 3 );
	zsptrf( 'lower', 3, AP, 1, 0, IPIV, 1, 0 );
	info = zsptri( 'lower', 3, AP, 1, 0, IPIV, 1, 0, WORK, 1, 0 );
	APv = reinterpret( AP, 0 );
	assertArrayClose( toArray( APv ), tc.ap, 1e-12, 'ap' );
	assert.equal( info, tc.info );
});

test( 'zsptri: 4x4_upper_indef (2x2 pivots)', function t() {
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
	zsptrf( 'upper', 4, AP, 1, 0, IPIV, 1, 0 );
	info = zsptri( 'upper', 4, AP, 1, 0, IPIV, 1, 0, WORK, 1, 0 );
	APv = reinterpret( AP, 0 );
	assertArrayClose( toArray( APv ), tc.ap, 1e-12, 'ap' );
	assert.equal( info, tc.info );
});

test( 'zsptri: 4x4_lower_indef (2x2 pivots)', function t() {
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
		1.0,
		2.0,
		-1.0,
		3.0,
		0.5,
		0.0,
		0.0,
		4.0,
		2.0,
		5.0,
		-1.0,
		0.0,
		0.0,
		6.0,
		1.0,
		0.0,
		0.0
	]);
	IPIV = new Int32Array( 4 );
	WORK = new Complex128Array( 4 );
	zsptrf( 'lower', 4, AP, 1, 0, IPIV, 1, 0 );
	info = zsptri( 'lower', 4, AP, 1, 0, IPIV, 1, 0, WORK, 1, 0 );
	APv = reinterpret( AP, 0 );
	assertArrayClose( toArray( APv ), tc.ap, 1e-12, 'ap' );
	assert.equal( info, tc.info );
});

test( 'zsptri: singular_lower (INFO > 0)', function t() {
	var WORK;
	var IPIV;
	var info;
	var tc;
	var AP;

	tc = singular_lower;
	AP = new Complex128Array([
		1.0,
		1.0,
		1.0,
		1.0,
		1.0,
		1.0
	]);
	IPIV = new Int32Array( 2 );
	WORK = new Complex128Array( 2 );
	zsptrf( 'lower', 2, AP, 1, 0, IPIV, 1, 0 );
	info = zsptri( 'lower', 2, AP, 1, 0, IPIV, 1, 0, WORK, 1, 0 );
	assert.equal( info, tc.info );
});

test( 'zsptri: 4x4_upper_swap (pivot interchange)', function t() {
	var WORK;
	var IPIV;
	var info;
	var APv;
	var tc;
	var AP;

	tc = _4x4_upper_swap;
	AP = new Complex128Array([
		0.1,
		0.1,
		0.2,
		0.3,
		5.0,
		1.0,
		10.0,
		1.0,
		0.5,
		-0.5,
		3.0,
		-1.0,
		0.1,
		0.2,
		0.3,
		-0.1,
		0.4,
		0.6,
		4.0,
		2.0
	]);
	IPIV = new Int32Array( 4 );
	WORK = new Complex128Array( 4 );
	zsptrf( 'upper', 4, AP, 1, 0, IPIV, 1, 0 );
	info = zsptri( 'upper', 4, AP, 1, 0, IPIV, 1, 0, WORK, 1, 0 );
	APv = reinterpret( AP, 0 );
	assertArrayClose( toArray( APv ), tc.ap, 1e-12, 'ap' );
	assert.equal( info, tc.info );
});

test( 'zsptri: 4x4_lower_swap (pivot interchange)', function t() {
	var WORK;
	var IPIV;
	var info;
	var APv;
	var tc;
	var AP;

	tc = _4x4_lower_swap;
	AP = new Complex128Array([
		0.1,
		0.1,
		0.2,
		0.3,
		10.0,
		1.0,
		0.1,
		0.2,
		5.0,
		1.0,
		0.5,
		-0.5,
		0.3,
		-0.1,
		3.0,
		-1.0,
		0.4,
		0.6,
		4.0,
		2.0
	]);
	IPIV = new Int32Array( 4 );
	WORK = new Complex128Array( 4 );
	zsptrf( 'lower', 4, AP, 1, 0, IPIV, 1, 0 );
	info = zsptri( 'lower', 4, AP, 1, 0, IPIV, 1, 0, WORK, 1, 0 );
	APv = reinterpret( AP, 0 );
	assertArrayClose( toArray( APv ), tc.ap, 1e-12, 'ap' );
	assert.equal( info, tc.info );
});

test( 'zsptri: singular_upper (INFO > 0)', function t() {
	var WORK;
	var IPIV;
	var info;
	var tc;
	var AP;

	tc = singular_upper;
	AP = new Complex128Array([
		1.0,
		1.0,
		1.0,
		1.0,
		1.0,
		1.0
	]);
	IPIV = new Int32Array( 2 );
	WORK = new Complex128Array( 2 );
	zsptrf( 'upper', 2, AP, 1, 0, IPIV, 1, 0 );
	info = zsptri( 'upper', 2, AP, 1, 0, IPIV, 1, 0, WORK, 1, 0 );
	assert.equal( info, tc.info );
});
