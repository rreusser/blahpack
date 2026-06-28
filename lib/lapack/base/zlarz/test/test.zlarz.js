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

/* eslint-disable no-restricted-syntax, stdlib/first-unit-test, max-len, max-params, max-statements */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import ndarray from './../lib/ndarray.js';
import zlarz from './../lib/zlarz.js';


// FUNCTIONS //

/**
* Returns a fresh 4x3 column-major interleaved matrix.
*
* @private
* @returns {Complex128Array} complex matrix
*/
function buildC4x3() {
	var out = new Complex128Array( 12 );
	var v = reinterpret( out, 0 );
	v[ 0 ] = 1.0;
	v[ 1 ] = 0.0;
	v[ 2 ] = 2.0;
	v[ 3 ] = 1.0;
	v[ 4 ] = 3.0;
	v[ 5 ] = -1.0;
	v[ 6 ] = 4.0;
	v[ 7 ] = 0.5;
	v[ 8 ] = -1.0;
	v[ 9 ] = 2.0;
	v[ 10 ] = 0.5;
	v[ 11 ] = 0.5;
	v[ 12 ] = 1.5;
	v[ 13 ] = -0.5;
	v[ 14 ] = -2.0;
	v[ 15 ] = 1.0;
	v[ 16 ] = 0.0;
	v[ 17 ] = 1.0;
	v[ 18 ] = 1.0;
	v[ 19 ] = 1.0;
	v[ 20 ] = -0.5;
	v[ 21 ] = 0.0;
	v[ 22 ] = 2.0;
	v[ 23 ] = -2.0;
	return out;
}

/**
* Returns a length-2 reflector.
*
* @private
* @returns {Complex128Array} v
*/
function buildV2() {
	var out = new Complex128Array( 2 );
	var v = reinterpret( out, 0 );
	v[ 0 ] = 0.5;
	v[ 1 ] = 0.2;
	v[ 2 ] = -0.3;
	v[ 3 ] = 0.4;
	return out;
}

/**
* Returns a Complex128Array wrapping a single complex scalar.
*
* @private
* @param {number} re - real part
* @param {number} im - imag part
* @returns {Complex128Array} tau
*/
function buildTau( re, im ) {
	var out = new Complex128Array( 1 );
	var v = reinterpret( out, 0 );
	v[ 0 ] = re;
	v[ 1 ] = im;
	return out;
}

/**
* Asserts that two real arrays agree elementwise within tolerance.
*
* @private
* @param {Array} actual - actual values
* @param {Array} expected - expected values
* @param {number} tol - tolerance
* @param {string} msg - message
*/
function assertArrayClose( actual, expected, tol, msg ) {
	var relErr;
	var denom;
	var i;
	assert.equal( actual.length, expected.length, msg + ': length mismatch' );
	for ( i = 0; i < expected.length; i++ ) {
		denom = Math.max( Math.abs( expected[ i ] ), 1.0 );
		relErr = Math.abs( actual[ i ] - expected[ i ] ) / denom;
		assert.ok( relErr <= tol, msg + '[' + i + ']' );
	}
}

/**
* Converts a typed array (or array-like) to a plain array.
*
* @private
* @param {Object} arr - input array
* @returns {Array} output array
*/
function toArray( arr ) {
	var out;
	var i;
	out = [];
	for ( i = 0; i < arr.length; i++ ) {
		out.push( arr[ i ] );
	}
	return out;
}


// TESTS //

test( 'zlarz is a function', function t() {
	assert.strictEqual( typeof zlarz, 'function', 'is a function' );
});

test( 'zlarz has expected arity', function t() {
	assert.strictEqual( zlarz.length, 13, 'has expected arity' );
});

test( 'zlarz throws TypeError for invalid order', function t() {
	var WORK = new Complex128Array( 2 );
	var tau = new Complex128Array( 1 );
	var C = new Complex128Array( 4 );
	var v = new Complex128Array( 2 );
	assert.throws( function throws() {
		zlarz( 'invalid', 'left', 2, 2, 1, v, 1, tau, 0, C, 2, WORK, 1 );
	}, TypeError );
});

test( 'zlarz throws TypeError for invalid side', function t() {
	var WORK = new Complex128Array( 2 );
	var tau = new Complex128Array( 1 );
	var C = new Complex128Array( 4 );
	var v = new Complex128Array( 2 );
	assert.throws( function throws() {
		zlarz( 'column-major', 'invalid', 2, 2, 1, v, 1, tau, 0, C, 2, WORK, 1 );
	}, TypeError );
});

test( 'zlarz throws RangeError for negative M', function t() {
	var WORK = new Complex128Array( 2 );
	var tau = new Complex128Array( 1 );
	var C = new Complex128Array( 4 );
	var v = new Complex128Array( 2 );
	assert.throws( function throws() {
		zlarz( 'column-major', 'left', -1, 2, 1, v, 1, tau, 0, C, 2, WORK, 1 );
	}, RangeError );
});

test( 'zlarz throws RangeError for negative N', function t() {
	var WORK = new Complex128Array( 2 );
	var tau = new Complex128Array( 1 );
	var C = new Complex128Array( 4 );
	var v = new Complex128Array( 2 );
	assert.throws( function throws() {
		zlarz( 'column-major', 'left', 2, -1, 1, v, 1, tau, 0, C, 2, WORK, 1 );
	}, RangeError );
});

test( 'zlarz throws RangeError for LDC too small (column-major)', function t() {
	var WORK = new Complex128Array( 3 );
	var tau = new Complex128Array( 1 );
	var C = new Complex128Array( 12 );
	var v = new Complex128Array( 2 );
	assert.throws( function throws() {
		zlarz( 'column-major', 'left', 4, 3, 2, v, 1, tau, 0, C, 2, WORK, 1 );
	}, RangeError );
});

test( 'zlarz throws RangeError for LDC too small (row-major)', function t() {
	var WORK = new Complex128Array( 3 );
	var tau = new Complex128Array( 1 );
	var C = new Complex128Array( 12 );
	var v = new Complex128Array( 2 );
	assert.throws( function throws() {
		zlarz( 'row-major', 'left', 4, 3, 2, v, 1, tau, 0, C, 2, WORK, 1 );
	}, RangeError );
});

test( 'zlarz column-major left matches ndarray', function t() {
	var WORK2;
	var WORK;
	var tau2;
	var out;
	var tau;
	var C2;
	var v2;
	var C;
	var v;
	WORK2 = new Complex128Array( 3 );
	WORK = new Complex128Array( 3 );
	tau2 = buildTau( 1.2, -0.4 );
	tau = buildTau( 1.2, -0.4 );
	C2 = buildC4x3();
	v2 = buildV2();
	C = buildC4x3();
	v = buildV2();
	out = zlarz( 'column-major', 'left', 4, 3, 2, v, 1, tau, 0, C, 4, WORK, 1 );
	assert.strictEqual( out, C, 'returns C' );
	ndarray( 'left', 4, 3, 2, v2, 1, 0, tau2, 0, C2, 1, 4, 0, WORK2, 1, 0 );
	assertArrayClose( toArray( reinterpret( C, 0 ) ), toArray( reinterpret( C2, 0 ) ), 1e-14, 'C' );
});

test( 'zlarz row-major left matches ndarray with transposed strides', function t() {
	var WORK2;
	var WORK;
	var tau2;
	var tau;
	var C2;
	var v2;
	var C;
	var v;
	WORK2 = new Complex128Array( 3 );
	WORK = new Complex128Array( 3 );
	tau2 = buildTau( 1.2, -0.4 );
	tau = buildTau( 1.2, -0.4 );
	C2 = buildC4x3();
	v2 = buildV2();
	C = buildC4x3();
	v = buildV2();
	zlarz( 'row-major', 'left', 4, 3, 2, v, 1, tau, 0, C, 3, WORK, 1 );
	ndarray( 'left', 4, 3, 2, v2, 1, 0, tau2, 0, C2, 3, 1, 0, WORK2, 1, 0 );
	assertArrayClose( toArray( reinterpret( C, 0 ) ), toArray( reinterpret( C2, 0 ) ), 1e-14, 'C' );
});

test( 'zlarz right side column-major returns C', function t() {
	var WORK;
	var out;
	var tau;
	var C;
	var v;
	WORK = new Complex128Array( 3 );
	tau = buildTau( 0.8, 0.5 );
	C = buildC4x3();
	v = buildV2();
	out = zlarz( 'column-major', 'right', 3, 4, 2, v, 1, tau, 0, C, 3, WORK, 1 );
	assert.strictEqual( out, C, 'returns C' );
});

test( 'zlarz returns C unchanged when M=0', function t() {
	var WORK;
	var out;
	var tau;
	var C;
	var v;
	WORK = new Complex128Array( 1 );
	tau = new Complex128Array( 1 );
	C = new Complex128Array( 1 );
	v = new Complex128Array( 1 );
	out = zlarz( 'column-major', 'left', 0, 1, 0, v, 1, tau, 0, C, 1, WORK, 1 );
	assert.strictEqual( out, C, 'returns C' );
});
