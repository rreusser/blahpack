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
import zaxpy from './../lib/index.js';
import base from './../lib/ndarray.js';

// FIXTURES //

import zaxpy_basic from './fixtures/zaxpy_basic.json' with { type: 'json' };
import zaxpy_alpha_zero from './fixtures/zaxpy_alpha_zero.json' with { type: 'json' };
import zaxpy_alpha_one from './fixtures/zaxpy_alpha_one.json' with { type: 'json' };
import zaxpy_n_zero from './fixtures/zaxpy_n_zero.json' with { type: 'json' };
import zaxpy_n_one from './fixtures/zaxpy_n_one.json' with { type: 'json' };
import zaxpy_stride from './fixtures/zaxpy_stride.json' with { type: 'json' };
import zaxpy_neg_stride from './fixtures/zaxpy_neg_stride.json' with { type: 'json' };
import zaxpy_imag_alpha from './fixtures/zaxpy_imag_alpha.json' with { type: 'json' };

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

test( 'zaxpy: main export is a function', function t() {
	assert.strictEqual( typeof zaxpy, 'function' );
});

test( 'zaxpy: attached to the main export is an `ndarray` method', function t() { // eslint-disable-line max-len
	assert.strictEqual( typeof zaxpy.ndarray, 'function' );
});

test( 'zaxpy: basic (N=3, za=(2,3), strideX=1, strideY=1)', function t() {
	var result;
	var tc;
	var za;
	var zx;
	var zy;

	tc = zaxpy_basic;
	za = new Complex128( 2.0, 3.0 );
	zx = new Complex128Array( [ 1.0, 2.0, 3.0, 4.0, 5.0, 6.0 ] );
	zy = new Complex128Array( [ 10.0, 20.0, 30.0, 40.0, 50.0, 60.0 ] );
	result = base( 3, za, zx, 1, 0, zy, 1, 0 );
	assert.strictEqual( result, zy );
	assertArrayClose( toArray( reinterpret( zy, 0 ) ), tc.zy, 'zaxpy_basic zy' );
	assertArrayClose( toArray( reinterpret( zx, 0 ) ), tc.zx, 'zaxpy_basic zx' );
});

test( 'zaxpy: alpha=0 is a no-op', function t() {
	var result;
	var tc;
	var za;
	var zx;
	var zy;

	tc = zaxpy_alpha_zero;
	za = new Complex128( 0.0, 0.0 );
	zx = new Complex128Array( [ 1.0, 2.0, 3.0, 4.0 ] );
	zy = new Complex128Array( [ 10.0, 20.0, 30.0, 40.0 ] );
	result = base( 2, za, zx, 1, 0, zy, 1, 0 );
	assert.strictEqual( result, zy );
	assertArrayClose( toArray( reinterpret( zy, 0 ) ), tc.zy, 'zaxpy_alpha_zero' );
});

test( 'zaxpy: alpha=(1,0) adds x to y', function t() {
	var tc = zaxpy_alpha_one;
	var za = new Complex128( 1.0, 0.0 );
	var zx = new Complex128Array( [ 1.0, 2.0, 3.0, 4.0, 5.0, 6.0 ] );
	var zy = new Complex128Array( [ 10.0, 20.0, 30.0, 40.0, 50.0, 60.0 ] );
	base( 3, za, zx, 1, 0, zy, 1, 0 );
	assertArrayClose( toArray( reinterpret( zy, 0 ) ), tc.zy, 'zaxpy_alpha_one' );
});

test( 'zaxpy: N=0 is a no-op', function t() {
	var result;
	var tc;
	var za;
	var zx;
	var zy;

	tc = zaxpy_n_zero;
	za = new Complex128( 5.0, 6.0 );
	zx = new Complex128Array( [ 1.0, 2.0 ] );
	zy = new Complex128Array( [ 10.0, 20.0 ] );
	result = base( 0, za, zx, 1, 0, zy, 1, 0 );
	assert.strictEqual( result, zy );
	assertArrayClose( toArray( reinterpret( zy, 0 ) ), tc.zy, 'zaxpy_n_zero' );
});

test( 'zaxpy: N=1', function t() {
	var tc = zaxpy_n_one;
	var za = new Complex128( 1.0, 1.0 );
	var zx = new Complex128Array( [ 2.0, 3.0 ] );
	var zy = new Complex128Array( [ 4.0, 5.0 ] );
	base( 1, za, zx, 1, 0, zy, 1, 0 );
	assertArrayClose( toArray( reinterpret( zy, 0 ) ), tc.zy, 'zaxpy_n_one' );
});

test( 'zaxpy: non-unit stride (strideX=2, strideY=2)', function t() {
	var result;
	var tc;
	var za;
	var zx;
	var zy;

	tc = zaxpy_stride;
	za = new Complex128( 2.0, 3.0 );
	zx = new Complex128Array([
		1.0, 2.0, 99.0, 99.0, 3.0, 4.0, 99.0, 99.0, 5.0, 6.0
	]);
	zy = new Complex128Array([
		10.0, 20.0, 88.0, 88.0, 30.0, 40.0, 88.0, 88.0, 50.0, 60.0
	]);
	result = base( 3, za, zx, 2, 0, zy, 2, 0 );
	assert.strictEqual( result, zy );
	assertArrayClose( toArray( reinterpret( zy, 0 ) ), tc.zy, 'zaxpy_stride zy' );
	assertArrayClose( toArray( reinterpret( zx, 0 ) ), tc.zx, 'zaxpy_stride zx' );
});

test( 'zaxpy: negative stride (strideX=-1 reverses x)', function t() {
	var tc = zaxpy_neg_stride;

	// Fortran with incx=-1, n=3: ix = (-3+1)*(-1)+1 = 3, reads x(3), x(2), x(1)

	// In stdlib JS: strideX=-1, offsetX=2 (start at last element)
	var za = new Complex128( 1.0, 0.0 );
	var zx = new Complex128Array( [ 1.0, 2.0, 3.0, 4.0, 5.0, 6.0 ] );
	var zy = new Complex128Array( [ 10.0, 20.0, 30.0, 40.0, 50.0, 60.0 ] );
	base( 3, za, zx, -1, 2, zy, 1, 0 );
	assertArrayClose( toArray( reinterpret( zy, 0 ) ), tc.zy, 'zaxpy_neg_stride' );
});

test( 'zaxpy: purely imaginary alpha', function t() {
	var tc = zaxpy_imag_alpha;
	var za = new Complex128( 0.0, 2.0 );
	var zx = new Complex128Array( [ 1.0, 0.0, 0.0, 1.0, 1.0, 1.0 ] );
	var zy = new Complex128Array( [ 0.0, 0.0, 0.0, 0.0, 0.0, 0.0 ] );
	base( 3, za, zx, 1, 0, zy, 1, 0 );
	assertArrayClose( toArray( reinterpret( zy, 0 ) ), tc.zy, 'zaxpy_imag_alpha' );
});

test( 'zaxpy: throws RangeError for N<0', function t() {
	var za = new Complex128( 2.0, 3.0 );
	var zx = new Complex128Array( [ 1.0, 2.0 ] );
	var zy = new Complex128Array( [ 10.0, 20.0 ] );
	assert.throws( function() {
		base( -1, za, zx, 1, 0, zy, 1, 0 );
	}, RangeError );
});

test( 'zaxpy: offset support', function t() {
	var za;
	var zx;
	var zy;
	var yv;

	za = new Complex128( 1.0, 0.0 );
	zx = new Complex128Array( [ 99.0, 99.0, 1.0, 2.0, 3.0, 4.0 ] );
	zy = new Complex128Array( [ 88.0, 88.0, 10.0, 20.0, 30.0, 40.0 ] );
	base( 2, za, zx, 1, 1, zy, 1, 1 );
	yv = reinterpret( zy, 0 );
	assert.strictEqual( yv[ 0 ], 88.0 );
	assert.strictEqual( yv[ 1 ], 88.0 );
	assertClose( yv[ 2 ], 11.0, 'offset y[1] real' );
	assertClose( yv[ 3 ], 22.0, 'offset y[1] imag' );
	assertClose( yv[ 4 ], 33.0, 'offset y[2] real' );
	assertClose( yv[ 5 ], 44.0, 'offset y[2] imag' );
});
