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
import zdrot from './../lib/index.js';
import base from './../lib/ndarray.js';


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

test( 'zdrot: main export is a function', function t() {
	assert.strictEqual( typeof zdrot, 'function' );
});

test( 'zdrot: attached to the main export is an `ndarray` method', function t() { // eslint-disable-line max-len
	assert.strictEqual( typeof zdrot.ndarray, 'function' );
});

test( 'zdrot: N=0 is a no-op', function t() {
	var result;
	var zx;
	var zy;

	zx = new Complex128Array( [ 1.0, 2.0, 3.0, 4.0 ] );
	zy = new Complex128Array( [ 5.0, 6.0, 7.0, 8.0 ] );
	result = base( 0, zx, 1, 0, zy, 1, 0, 0.6, 0.8 );
	assert.strictEqual( result, zx );
	assertArrayClose( toArray( reinterpret( zx, 0 ) ), [ 1.0, 2.0, 3.0, 4.0 ], 'zx unchanged' ); // eslint-disable-line max-len
	assertArrayClose( toArray( reinterpret( zy, 0 ) ), [ 5.0, 6.0, 7.0, 8.0 ], 'zy unchanged' ); // eslint-disable-line max-len
});

test( 'zdrot: throws RangeError for N<0', function t() {
	var zx = new Complex128Array( [ 1.0, 2.0 ] );
	var zy = new Complex128Array( [ 3.0, 4.0 ] );
	assert.throws( function () {
		base( -1, zx, 1, 0, zy, 1, 0, 0.6, 0.8 );
	}, RangeError );
});

test( 'zdrot: basic rotation (N=3, c=0.6, s=0.8)', function t() {
	var result;
	var zx;
	var zy;

	zx = new Complex128Array( [ 1.0, 2.0, 3.0, 4.0, 5.0, 6.0 ] );
	zy = new Complex128Array( [ 7.0, 8.0, 9.0, 10.0, 11.0, 12.0 ] );
	result = base( 3, zx, 1, 0, zy, 1, 0, 0.6, 0.8 );
	assert.strictEqual( result, zx );
	assertArrayClose( toArray( reinterpret( zx, 0 ) ), [ 6.2, 7.6, 9.0, 10.4, 11.8, 13.2 ], 'zx' ); // eslint-disable-line max-len
	assertArrayClose( toArray( reinterpret( zy, 0 ) ), [ 3.4, 3.2, 3.0, 2.8, 2.6, 2.4 ], 'zy' ); // eslint-disable-line max-len
});

test( 'zdrot: identity rotation (c=1, s=0)', function t() {
	var zx = new Complex128Array( [ 1.0, 2.0, 3.0, 4.0 ] );
	var zy = new Complex128Array( [ 5.0, 6.0, 7.0, 8.0 ] );
	base( 2, zx, 1, 0, zy, 1, 0, 1.0, 0.0 );
	assertArrayClose( toArray( reinterpret( zx, 0 ) ), [ 1.0, 2.0, 3.0, 4.0 ], 'zx unchanged' ); // eslint-disable-line max-len
	assertArrayClose( toArray( reinterpret( zy, 0 ) ), [ 5.0, 6.0, 7.0, 8.0 ], 'zy unchanged' ); // eslint-disable-line max-len
});

test( 'zdrot: swap rotation (c=0, s=1)', function t() {
	var zx = new Complex128Array( [ 1.0, 2.0, 3.0, 4.0 ] );
	var zy = new Complex128Array( [ 5.0, 6.0, 7.0, 8.0 ] );
	base( 2, zx, 1, 0, zy, 1, 0, 0.0, 1.0 );
	assertArrayClose( toArray( reinterpret( zx, 0 ) ), [ 5.0, 6.0, 7.0, 8.0 ], 'zx = old zy' ); // eslint-disable-line max-len
	assertArrayClose( toArray( reinterpret( zy, 0 ) ), [ -1.0, -2.0, -3.0, -4.0 ], 'zy = -old zx' ); // eslint-disable-line max-len
});

test( 'zdrot: N=1 single element', function t() {
	var zx = new Complex128Array( [ 3.0, 4.0 ] );
	var zy = new Complex128Array( [ 1.0, 2.0 ] );
	base( 1, zx, 1, 0, zy, 1, 0, 0.6, 0.8 );
	assertArrayClose( toArray( reinterpret( zx, 0 ) ), [ 2.6, 4.0 ], 'zx' );
	assertArrayClose( toArray( reinterpret( zy, 0 ) ), [ -1.8, -2.0 ], 'zy' );
});

test( 'zdrot: non-unit stride (strideX=2, strideY=2)', function t() {
	var xv;
	var yv;
	var zx;
	var zy;

	zx = new Complex128Array([
		1.0, 2.0, 99.0, 99.0, 3.0, 4.0, 99.0, 99.0, 5.0, 6.0
	]);
	zy = new Complex128Array([
		10.0, 20.0, 88.0, 88.0, 30.0, 40.0, 88.0, 88.0, 50.0, 60.0
	]);
	base( 3, zx, 2, 0, zy, 2, 0, 0.6, 0.8 );
	xv = reinterpret( zx, 0 );
	yv = reinterpret( zy, 0 );
	assertClose( xv[ 2 ], 99.0, 'zx gap[2]' );
	assertClose( xv[ 3 ], 99.0, 'zx gap[3]' );
	assertClose( xv[ 6 ], 99.0, 'zx gap[6]' );
	assertClose( xv[ 7 ], 99.0, 'zx gap[7]' );
	assertClose( yv[ 2 ], 88.0, 'zy gap[2]' );
	assertClose( yv[ 3 ], 88.0, 'zy gap[3]' );
	assertClose( yv[ 6 ], 88.0, 'zy gap[6]' );
	assertClose( yv[ 7 ], 88.0, 'zy gap[7]' );
	assertArrayClose([ xv[ 0 ], xv[ 1 ], xv[ 4 ], xv[ 5 ], xv[ 8 ], xv[ 9 ] ], [ 8.6, 17.2, 25.8, 34.4, 43.0, 51.6 ], 'zx rotated');
	assertArrayClose([ yv[ 0 ], yv[ 1 ], yv[ 4 ], yv[ 5 ], yv[ 8 ], yv[ 9 ] ], [ 5.2, 10.4, 15.6, 20.8, 26.0, 31.2 ], 'zy rotated');
});

test( 'zdrot: negative stride (strideX=-1, strideY=1)', function t() {
	// With strideX=-1 and offsetX=2 (complex element index for 3rd element),
	// Element 0 is at complex index 2 = (5+6i),
	// Element 1 at complex index 1 = (3+4i),
	// Element 2 at complex index 0 = (1+2i)
	var zx = new Complex128Array( [ 1.0, 2.0, 3.0, 4.0, 5.0, 6.0 ] );
	var zy = new Complex128Array( [ 10.0, 20.0, 30.0, 40.0, 50.0, 60.0 ] );
	base( 3, zx, -1, 2, zy, 1, 0, 0.6, 0.8 );
	assertArrayClose( toArray( reinterpret( zx, 0 ) ), [ 40.6, 49.2, 25.8, 34.4, 11.0, 19.6 ], 'zx' ); // eslint-disable-line max-len
	assertArrayClose( toArray( reinterpret( zy, 0 ) ), [ 2.0, 7.2, 15.6, 20.8, 29.2, 34.4 ], 'zy' ); // eslint-disable-line max-len
});

test( 'zdrot: offset (strideX=1, offsetX=1)', function t() {
	var xv;
	var zx;
	var zy;

	zx = new Complex128Array( [ 99.0, 99.0, 1.0, 2.0, 3.0, 4.0 ] );
	zy = new Complex128Array( [ 5.0, 6.0, 7.0, 8.0 ] );
	base( 2, zx, 1, 1, zy, 1, 0, 0.6, 0.8 );
	xv = reinterpret( zx, 0 );
	assertClose( xv[ 0 ], 99.0, 'zx pad[0]' );
	assertClose( xv[ 1 ], 99.0, 'zx pad[1]' );
	assertArrayClose([ xv[ 2 ], xv[ 3 ], xv[ 4 ], xv[ 5 ] ], [ 4.6, 6.0, 7.4, 8.8 ], 'zx rotated');
	assertArrayClose( toArray( reinterpret( zy, 0 ) ), [ 2.2, 2.0, 1.8, 1.6 ], 'zy' ); // eslint-disable-line max-len
});

test( 'zdrot: 45-degree rotation (c=s=sqrt(2)/2)', function t() {
	var SQRT2_2 = Math.sqrt( 2.0 ) / 2.0;
	var zx = new Complex128Array( [ 1.0, 0.0 ] );
	var zy = new Complex128Array( [ 0.0, 1.0 ] );
	base( 1, zx, 1, 0, zy, 1, 0, SQRT2_2, SQRT2_2 );
	assertArrayClose( toArray( reinterpret( zx, 0 ) ), [ SQRT2_2, SQRT2_2 ], 'zx' ); // eslint-disable-line max-len
	assertArrayClose( toArray( reinterpret( zy, 0 ) ), [ -SQRT2_2, SQRT2_2 ], 'zy' ); // eslint-disable-line max-len
});

test( 'zdrot: returns zx', function t() {
	var result;
	var zx;
	var zy;

	zx = new Complex128Array( [ 1.0, 2.0, 3.0, 4.0 ] );
	zy = new Complex128Array( [ 5.0, 6.0, 7.0, 8.0 ] );
	result = base( 2, zx, 1, 0, zy, 1, 0, 0.6, 0.8 );
	assert.strictEqual( result, zx );
});

test( 'zdrot: ndarray method works', function t() {
	var result;
	var zx;
	var zy;

	zx = new Complex128Array( [ 1.0, 2.0, 3.0, 4.0, 5.0, 6.0 ] );
	zy = new Complex128Array( [ 7.0, 8.0, 9.0, 10.0, 11.0, 12.0 ] );
	result = zdrot.ndarray( 3, zx, 1, 0, zy, 1, 0, 0.6, 0.8 );
	assert.strictEqual( result, zx );
	assertArrayClose( toArray( reinterpret( zx, 0 ) ), [ 6.2, 7.6, 9.0, 10.4, 11.8, 13.2 ], 'zx' ); // eslint-disable-line max-len
	assertArrayClose( toArray( reinterpret( zy, 0 ) ), [ 3.4, 3.2, 3.0, 2.8, 2.6, 2.4 ], 'zy' ); // eslint-disable-line max-len
});

test( 'zdrot: mixed strides (strideX=1, strideY=2)', function t() {
	var yv;
	var zx;
	var zy;

	zx = new Complex128Array( [ 1.0, 2.0, 3.0, 4.0, 5.0, 6.0 ] );
	zy = new Complex128Array([
		10.0, 20.0, 77.0, 77.0, 30.0, 40.0, 77.0, 77.0, 50.0, 60.0
	]);
	base( 3, zx, 1, 0, zy, 2, 0, 0.6, 0.8 );
	assertArrayClose( toArray( reinterpret( zx, 0 ) ), [ 8.6, 17.2, 25.8, 34.4, 43.0, 51.6 ], 'zx' ); // eslint-disable-line max-len
	yv = reinterpret( zy, 0 );
	assertClose( yv[ 2 ], 77.0, 'zy gap[2]' );
	assertClose( yv[ 3 ], 77.0, 'zy gap[3]' );
	assertClose( yv[ 6 ], 77.0, 'zy gap[6]' );
	assertClose( yv[ 7 ], 77.0, 'zy gap[7]' );
	assertArrayClose([ yv[ 0 ], yv[ 1 ], yv[ 4 ], yv[ 5 ], yv[ 8 ], yv[ 9 ] ], [ 5.2, 10.4, 15.6, 20.8, 26.0, 31.2 ], 'zy rotated');
});
