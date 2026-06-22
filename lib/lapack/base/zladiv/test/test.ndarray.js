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

import test from 'node:test';
import assert from 'node:assert/strict';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import base from './../lib/ndarray.js';

// FIXTURES //

import zladiv_basic from './fixtures/zladiv_basic.json' with { type: 'json' };
import zladiv_pure_imag_denom from './fixtures/zladiv_pure_imag_denom.json' with { type: 'json' };
import zladiv_real_div from './fixtures/zladiv_real_div.json' with { type: 'json' };
import zladiv_zero_numer from './fixtures/zladiv_zero_numer.json' with { type: 'json' };
import zladiv_neg_denom from './fixtures/zladiv_neg_denom.json' with { type: 'json' };
import zladiv_large from './fixtures/zladiv_large.json' with { type: 'json' };
import zladiv_small from './fixtures/zladiv_small.json' with { type: 'json' };
// HELPERS //

function assertClose( actual, expected, msg ) {
	var relErr = Math.abs( actual - expected ) / Math.max( Math.abs( expected ), 1.0 );
	assert.ok( relErr <= 1e-14, msg + ': expected ' + expected + ', got ' + actual );
}

function assertArrayClose( actual, expected, msg ) {
	var i;
	assert.strictEqual( actual.length, expected.length, msg + ': length mismatch' );
	for ( i = 0; i < expected.length; i++ ) {
		assertClose( actual[ i ], expected[ i ], msg + '[' + i + ']' );
	}
}

// TESTS //

test( 'zladiv: main export is a function', function t() {
	assert.strictEqual( typeof base, 'function' );
});

test( 'zladiv: (4+2i)/(1+1i) = 3-1i', function t() {
	var tc = zladiv_basic;
	var x = new Complex128Array( [ 4.0, 2.0 ] );
	var y = new Complex128Array( [ 1.0, 1.0 ] );
	var out = new Complex128Array( 1 );
	var ov;
	base( x, 0, y, 0, out, 0 );
	ov = reinterpret( out, 0 );
	assertArrayClose( Array.from( ov ), tc.result, 'zladiv_basic' );
});

test( 'zladiv: (1+0i)/(0+1i) = 0-1i', function t() {
	var tc = zladiv_pure_imag_denom;
	var x = new Complex128Array( [ 1.0, 0.0 ] );
	var y = new Complex128Array( [ 0.0, 1.0 ] );
	var out = new Complex128Array( 1 );
	var ov;
	base( x, 0, y, 0, out, 0 );
	ov = reinterpret( out, 0 );
	assertArrayClose( Array.from( ov ), tc.result, 'zladiv_pure_imag_denom' );
});

test( 'zladiv: (1+0i)/(1+0i) = 1+0i', function t() {
	var tc = zladiv_real_div;
	var x = new Complex128Array( [ 1.0, 0.0 ] );
	var y = new Complex128Array( [ 1.0, 0.0 ] );
	var out = new Complex128Array( 1 );
	var ov;
	base( x, 0, y, 0, out, 0 );
	ov = reinterpret( out, 0 );
	assertArrayClose( Array.from( ov ), tc.result, 'zladiv_real_div' );
});

test( 'zladiv: (0+0i)/(1+1i) = 0+0i', function t() {
	var tc = zladiv_zero_numer;
	var x = new Complex128Array( [ 0.0, 0.0 ] );
	var y = new Complex128Array( [ 1.0, 1.0 ] );
	var out = new Complex128Array( 1 );
	var ov;
	base( x, 0, y, 0, out, 0 );
	ov = reinterpret( out, 0 );
	assertArrayClose( Array.from( ov ), tc.result, 'zladiv_zero_numer' );
});

test( 'zladiv: (3+4i)/(1-2i) = -1+2i', function t() {
	var tc = zladiv_neg_denom;
	var x = new Complex128Array( [ 3.0, 4.0 ] );
	var y = new Complex128Array( [ 1.0, -2.0 ] );
	var out = new Complex128Array( 1 );
	var ov;
	base( x, 0, y, 0, out, 0 );
	ov = reinterpret( out, 0 );
	assertArrayClose( Array.from( ov ), tc.result, 'zladiv_neg_denom' );
});

test( 'zladiv: large values', function t() {
	var tc = zladiv_large;
	var x = new Complex128Array( [ 1.0e300, 1.0e300 ] );
	var y = new Complex128Array( [ 1.0e300, 1.0e300 ] );
	var out = new Complex128Array( 1 );
	var ov;
	base( x, 0, y, 0, out, 0 );
	ov = reinterpret( out, 0 );
	assertArrayClose( Array.from( ov ), tc.result, 'zladiv_large' );
});

test( 'zladiv: small values', function t() {
	var tc = zladiv_small;
	var x = new Complex128Array( [ 1.0e-300, 1.0e-300 ] );
	var y = new Complex128Array( [ 1.0e-300, 1.0e-300 ] );
	var out = new Complex128Array( 1 );
	var ov;
	base( x, 0, y, 0, out, 0 );
	ov = reinterpret( out, 0 );
	assertArrayClose( Array.from( ov ), tc.result, 'zladiv_small' );
});
