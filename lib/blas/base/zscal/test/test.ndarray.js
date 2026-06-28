/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

/**
* @license Apache-2.0
*
* Copyright (c) 2026 Ricky Reusser.
*
* Derived from the BLAS 3.12.0 reference implementation (BSD-3-Clause).
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
import Complex128 from '@stdlib/complex/float64/ctor/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import zscal from './../lib/index.js';
import base from './../lib/ndarray.js';

// FIXTURES //

import zscal_basic from './fixtures/zscal_basic.json' with { type: 'json' };
import zscal_n_zero from './fixtures/zscal_n_zero.json' with { type: 'json' };
import zscal_za_zero from './fixtures/zscal_za_zero.json' with { type: 'json' };
import zscal_stride from './fixtures/zscal_stride.json' with { type: 'json' };
import zscal_za_one from './fixtures/zscal_za_one.json' with { type: 'json' };

// FUNCTIONS //

/**
* Asserts that two numbers are approximately equal.
*
* @private
* @param {*} actual - actual value
* @param {*} expected - expected value
* @param {string} msg - assertion message
*/
function assertClose( actual, expected, msg ) {
	var relErr = Math.abs( actual - expected ) / Math.max( Math.abs( expected ), 1.0 ); // eslint-disable-line max-len
	assert.ok( relErr <= 1e-14, msg + ': expected ' + expected + ', got ' + actual ); // eslint-disable-line max-len
}

/**
* Asserts that two arrays are element-wise approximately equal.
*
* @private
* @param {*} actual - actual value
* @param {*} expected - expected value
* @param {string} msg - assertion message
*/
function assertArrayClose( actual, expected, msg ) {
	var i;
	assert.strictEqual( actual.length, expected.length, msg + ': length mismatch' ); // eslint-disable-line max-len
	for ( i = 0; i < expected.length; i++ ) {
		assertClose( actual[ i ], expected[ i ], msg + '[' + i + ']' );
	}
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
	var out = [];
	var i;
	for ( i = 0; i < arr.length; i++ ) {
		out.push( arr[ i ] );
	}
	return out;
}

// TESTS //

test( 'zscal: main export is a function', function t() {
	assert.strictEqual( typeof zscal, 'function' );
});

test( 'zscal: attached to the main export is an `ndarray` method', function t() { // eslint-disable-line max-len
	assert.strictEqual( typeof zscal.ndarray, 'function' );
});

test( 'zscal: basic scale (N=3, za=(2,3), strideX=1)', function t() {
	var result;
	var tc;
	var za;
	var zx;

	tc = zscal_basic;
	za = new Complex128( 2.0, 3.0 );
	zx = new Complex128Array( [ 1.0, 2.0, 3.0, 4.0, 5.0, 6.0 ] );
	result = base( 3, za, zx, 1, 0 );
	assert.strictEqual( result, zx );
	assertArrayClose( toArray( reinterpret( zx, 0 ) ), tc.zx, 'zscal_basic' );
});

test( 'zscal: N=0 is a no-op', function t() {
	var result;
	var tc;
	var za;
	var zx;

	tc = zscal_n_zero;
	za = new Complex128( 5.0, 6.0 );
	zx = new Complex128Array( [ 1.0, 2.0, 3.0, 4.0 ] );
	result = base( 0, za, zx, 1, 0 );
	assert.strictEqual( result, zx );
	assertArrayClose( toArray( reinterpret( zx, 0 ) ), tc.zx, 'zscal_n_zero' );
});

test( 'zscal: za=(0,0) zeros out vector', function t() {
	var result;
	var tc;
	var za;
	var zx;

	tc = zscal_za_zero;
	za = new Complex128( 0.0, 0.0 );
	zx = new Complex128Array( [ 1.0, 2.0, 3.0, 4.0, 5.0, 6.0 ] );
	result = base( 3, za, zx, 1, 0 );
	assert.strictEqual( result, zx );
	assertArrayClose( toArray( reinterpret( zx, 0 ) ), tc.zx, 'zscal_za_zero' );
});

test( 'zscal: non-unit stride (strideX=2, za=(0,1))', function t() {
	var result;
	var tc;
	var za;
	var zx;

	tc = zscal_stride;
	za = new Complex128( 0.0, 1.0 );
	zx = new Complex128Array([
		1.0, 2.0, 99.0, 99.0, 3.0, 4.0, 99.0, 99.0, 5.0, 6.0
	]);
	result = base( 3, za, zx, 2, 0 );
	assert.strictEqual( result, zx );
	assertArrayClose( toArray( reinterpret( zx, 0 ) ), tc.zx, 'zscal_stride' );
});

test( 'zscal: za=(1,0) is identity (no-op)', function t() {
	var result;
	var tc;
	var za;
	var zx;

	tc = zscal_za_one;
	za = new Complex128( 1.0, 0.0 );
	zx = new Complex128Array( [ 7.0, 8.0, 9.0, 10.0 ] );
	result = base( 2, za, zx, 1, 0 );
	assert.strictEqual( result, zx );
	assertArrayClose( toArray( reinterpret( zx, 0 ) ), tc.zx, 'zscal_za_one' );
});

test( 'zscal: throws RangeError for N<0', function t() {
	var za = new Complex128( 2.0, 3.0 );
	var zx = new Complex128Array( [ 1.0, 2.0 ] );
	assert.throws( function() {
		base( -1, za, zx, 1, 0 );
	}, RangeError );
});
