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
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import zswap from './../lib/index.js';
import base from './../lib/ndarray.js';

// FIXTURES //

import basic from './fixtures/basic.json' with { type: 'json' };
import n_zero from './fixtures/n_zero.json' with { type: 'json' };
import n_one from './fixtures/n_one.json' with { type: 'json' };
import stride from './fixtures/stride.json' with { type: 'json' };
import mixed_stride from './fixtures/mixed_stride.json' with { type: 'json' };

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

test( 'zswap: main export is a function', function t() {
	assert.strictEqual( typeof zswap, 'function' );
});

test( 'zswap: attached to the main export is an `ndarray` method', function t() { // eslint-disable-line max-len
	assert.strictEqual( typeof zswap.ndarray, 'function' );
});

test( 'zswap: basic swap (N=3, strideX=1, strideY=1)', function t() {
	var result;
	var tc;
	var zx;
	var zy;

	tc = basic;
	zx = new Complex128Array( [ 1.0, 2.0, 3.0, 4.0, 5.0, 6.0 ] );
	zy = new Complex128Array( [ 7.0, 8.0, 9.0, 10.0, 11.0, 12.0 ] );
	result = base( 3, zx, 1, 0, zy, 1, 0 );
	assert.strictEqual( result, zx );
	assertArrayClose( toArray( reinterpret( zx, 0 ) ), tc.zx, 'zx' );
	assertArrayClose( toArray( reinterpret( zy, 0 ) ), tc.zy, 'zy' );
});

test( 'zswap: N=0 is a no-op', function t() {
	var result;
	var tc;
	var zx;
	var zy;

	tc = n_zero;
	zx = new Complex128Array( [ 1.0, 2.0, 3.0, 4.0 ] );
	zy = new Complex128Array( [ 5.0, 6.0, 7.0, 8.0 ] );
	result = base( 0, zx, 1, 0, zy, 1, 0 );
	assert.strictEqual( result, zx );
	assertArrayClose( toArray( reinterpret( zx, 0 ) ), tc.zx, 'zx' );
	assertArrayClose( toArray( reinterpret( zy, 0 ) ), tc.zy, 'zy' );
});

test( 'zswap: N=1', function t() {
	var result;
	var tc;
	var zx;
	var zy;

	tc = n_one;
	zx = new Complex128Array( [ 10.0, 20.0 ] );
	zy = new Complex128Array( [ 30.0, 40.0 ] );
	result = base( 1, zx, 1, 0, zy, 1, 0 );
	assert.strictEqual( result, zx );
	assertArrayClose( toArray( reinterpret( zx, 0 ) ), tc.zx, 'zx' );
	assertArrayClose( toArray( reinterpret( zy, 0 ) ), tc.zy, 'zy' );
});

test( 'zswap: non-unit strides (strideX=2, strideY=2)', function t() {
	var result;
	var tc;
	var zx;
	var zy;

	tc = stride;
	zx = new Complex128Array([
		1.0, 2.0, 99.0, 99.0, 3.0, 4.0, 99.0, 99.0, 5.0, 6.0
	]);
	zy = new Complex128Array([
		10.0, 20.0, 88.0, 88.0, 30.0, 40.0, 88.0, 88.0, 50.0, 60.0
	]);
	result = base( 3, zx, 2, 0, zy, 2, 0 );
	assert.strictEqual( result, zx );
	assertArrayClose( toArray( reinterpret( zx, 0 ) ), tc.zx, 'zx' );
	assertArrayClose( toArray( reinterpret( zy, 0 ) ), tc.zy, 'zy' );
});

test( 'zswap: mixed strides (strideX=1, strideY=2)', function t() {
	var result;
	var tc;
	var zx;
	var zy;

	tc = mixed_stride;
	zx = new Complex128Array([
		1.0, 1.0, 2.0, 2.0, 3.0, 3.0
	]);
	zy = new Complex128Array([
		10.0, 10.0, 77.0, 77.0, 20.0, 20.0, 77.0, 77.0, 30.0, 30.0
	]);
	result = base( 3, zx, 1, 0, zy, 2, 0 );
	assert.strictEqual( result, zx );
	assertArrayClose( toArray( reinterpret( zx, 0 ) ), tc.zx, 'zx' );
	assertArrayClose( toArray( reinterpret( zy, 0 ) ), tc.zy, 'zy' );
});
