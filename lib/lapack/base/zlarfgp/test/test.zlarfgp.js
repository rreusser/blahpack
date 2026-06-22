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

/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import zlarfgpMain from './../lib/index.js';
import zlarfgp from './../lib/zlarfgp.js';


// TESTS //

test( 'zlarfgp is a function', function t() {
	assert.strictEqual( typeof zlarfgp, 'function', 'is a function' );
});

test( 'zlarfgp has expected arity', function t() {
	assert.strictEqual( zlarfgp.length, 7, 'has expected arity' );
});

test( 'zlarfgp throws RangeError for negative N', function t() {
	var alpha = new Complex128Array( [ 2.0, 0.0 ] );
	var tau = new Complex128Array( 1 );
	var x = new Complex128Array( [ 1.0, 0.0, 2.0, 0.0 ] );
	assert.throws( function throws() {
		zlarfgp( -1, alpha, 0, x, 1, tau, 0 );
	}, RangeError );
});

test( 'zlarfgp quick-returns for N=0 without throwing', function t() {
	var alpha = new Complex128Array( [ 2.0, 0.0 ] );
	var tau = new Complex128Array( 1 );
	var tv;
	var x = new Complex128Array( 0 );
	zlarfgp( 0, alpha, 0, x, 1, tau, 0 );
	tv = reinterpret( tau, 0 );
	assert.strictEqual( tv[ 0 ], 0.0 );
	assert.strictEqual( tv[ 1 ], 0.0 );
});

test( 'zlarfgp main and ndarray entry points produce the same result', function t() {
	var alpha1 = new Complex128Array( [ 3.0, 0.0 ] );
	var alpha2 = new Complex128Array( [ 3.0, 0.0 ] );
	var tau1 = new Complex128Array( 1 );
	var tau2 = new Complex128Array( 1 );
	var x1 = new Complex128Array( [ 1.0, 0.0, 2.0, 0.0 ] );
	var x2 = new Complex128Array( [ 1.0, 0.0, 2.0, 0.0 ] );
	zlarfgp( 3, alpha1, 0, x1, 1, tau1, 0 );
	zlarfgpMain.ndarray( 3, alpha2, 0, x2, 1, 0, tau2, 0 );
	assert.deepStrictEqual( reinterpret( alpha1, 0 ), reinterpret( alpha2, 0 ) );
	assert.deepStrictEqual( reinterpret( x1, 0 ), reinterpret( x2, 0 ) );
	assert.deepStrictEqual( reinterpret( tau1, 0 ), reinterpret( tau2, 0 ) );
});
