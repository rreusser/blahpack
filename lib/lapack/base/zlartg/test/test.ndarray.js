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

import zlartg_g_zero from './fixtures/zlartg_g_zero.json' with { type: 'json' };
import zlartg_f_zero from './fixtures/zlartg_f_zero.json' with { type: 'json' };
import zlartg_real from './fixtures/zlartg_real.json' with { type: 'json' };
import zlartg_general from './fixtures/zlartg_general.json' with { type: 'json' };
import zlartg_pure_imag from './fixtures/zlartg_pure_imag.json' with { type: 'json' };
import zlartg_f_zero_g_imag from './fixtures/zlartg_f_zero_g_imag.json' with { type: 'json' };
import zlartg_f_zero_g_real from './fixtures/zlartg_f_zero_g_real.json' with { type: 'json' };
import zlartg_large_f from './fixtures/zlartg_large_f.json' with { type: 'json' };
import zlartg_small_f from './fixtures/zlartg_small_f.json' with { type: 'json' };
import zlartg_both_large from './fixtures/zlartg_both_large.json' with { type: 'json' };
import zlartg_large_g from './fixtures/zlartg_large_g.json' with { type: 'json' };
import zlartg_f_zero_g_large from './fixtures/zlartg_f_zero_g_large.json' with { type: 'json' };
import zlartg_both_small from './fixtures/zlartg_both_small.json' with { type: 'json' };
import zlartg_large_f_small_g from './fixtures/zlartg_large_f_small_g.json' with { type: 'json' };
import zlartg_tiny_f_g_zero from './fixtures/zlartg_tiny_f_g_zero.json' with { type: 'json' };
import zlartg_f_zero_g_small from './fixtures/zlartg_f_zero_g_small.json' with { type: 'json' };
import zlartg_unscaled_tiny_f from './fixtures/zlartg_unscaled_tiny_f.json' with { type: 'json' };
import zlartg_unscaled_f2_small from './fixtures/zlartg_unscaled_f2_small.json' with { type: 'json' };
import zlartg_scaled_tiny_f from './fixtures/zlartg_scaled_tiny_f.json' with { type: 'json' };
import zlartg_scaled_large_both from './fixtures/zlartg_scaled_large_both.json' with { type: 'json' };
import zlartg_scaled_f2_lt_safmin from './fixtures/zlartg_scaled_f2_lt_safmin.json' with { type: 'json' };
// HELPERS //

function assertClose( actual, expected, msg ) {
	var relErr = Math.abs( actual - expected ) / Math.max( Math.abs( expected ), 1.0 );
	assert.ok( relErr <= 1e-14, msg + ': expected ' + expected + ', got ' + actual );
}

function makeComplex( re, im ) {
	var arr = new Complex128Array( 1 );
	var v = reinterpret( arr, 0 );
	v[ 0 ] = re;
	v[ 1 ] = im;
	return arr;
}

function runTest( fRe, fIm, gRe, gIm, tc, label ) {
	var cArr = new Float64Array( 1 );
	var sArr = new Complex128Array( 1 );
	var rArr = new Complex128Array( 1 );
	var sv = reinterpret( sArr, 0 );
	var rv = reinterpret( rArr, 0 );
	var f = makeComplex( fRe, fIm );
	var g = makeComplex( gRe, gIm );

	base( f, 0, g, 0, cArr, 0, sArr, 0, rArr, 0 );

	assertClose( cArr[ 0 ], tc.c, label + ' c' );
	assertClose( sv[ 0 ], tc.s[ 0 ], label + ' s[0]' );
	assertClose( sv[ 1 ], tc.s[ 1 ], label + ' s[1]' );
	assertClose( rv[ 0 ], tc.r[ 0 ], label + ' r[0]' );
	assertClose( rv[ 1 ], tc.r[ 1 ], label + ' r[1]' );
}

// TESTS //

test( 'zlartg: main export is a function', function t() {
	assert.strictEqual( typeof base, 'function' );
});

test( 'zlartg: g=0 => c=1, s=0, r=f', function t() {
	var tc = zlartg_g_zero;
	runTest( 3.0, 4.0, 0.0, 0.0, tc, 'zlartg_g_zero' );
});

test( 'zlartg: f=0, g=(3+4i)', function t() {
	var tc = zlartg_f_zero;
	runTest( 0.0, 0.0, 3.0, 4.0, tc, 'zlartg_f_zero' );
});

test( 'zlartg: both real f=3, g=4', function t() {
	var tc = zlartg_real;
	runTest( 3.0, 0.0, 4.0, 0.0, tc, 'zlartg_real' );
});

test( 'zlartg: general complex case f=(1+2i), g=(3+4i)', function t() {
	var tc = zlartg_general;
	runTest( 1.0, 2.0, 3.0, 4.0, tc, 'zlartg_general' );
});

test( 'zlartg: purely imaginary f=(0+2i), g=(0+3i)', function t() {
	var tc = zlartg_pure_imag;
	runTest( 0.0, 2.0, 0.0, 3.0, tc, 'zlartg_pure_imag' );
});

test( 'zlartg: f=0, g purely imaginary (0+5i)', function t() {
	var tc = zlartg_f_zero_g_imag;
	runTest( 0.0, 0.0, 0.0, 5.0, tc, 'zlartg_f_zero_g_imag' );
});

test( 'zlartg: f=0, g purely real (5+0i)', function t() {
	var tc = zlartg_f_zero_g_real;
	runTest( 0.0, 0.0, 5.0, 0.0, tc, 'zlartg_f_zero_g_real' );
});

test( 'zlartg: very large f (scaled algorithm)', function t() {
	var tc = zlartg_large_f;
	runTest( 1e200, 1e200, 1.0, 1.0, tc, 'zlartg_large_f' );
});

test( 'zlartg: very small f (scaled algorithm, f not well-scaled)', function t() {
	var tc = zlartg_small_f;
	runTest( 1e-200, 1e-200, 1.0, 1.0, tc, 'zlartg_small_f' );
});

test( 'zlartg: both very large (scaled algorithm, same scale)', function t() {
	var tc = zlartg_both_large;
	runTest( 3e200, 4e200, 1e200, 2e200, tc, 'zlartg_both_large' );
});

test( 'zlartg: normal f, very large g (scaled algorithm)', function t() {
	var tc = zlartg_large_g;
	runTest( 1.0, 1.0, 1e200, 1e200, tc, 'zlartg_large_g' );
});

test( 'zlartg: f=0, very large g (scaled f=0 path)', function t() {
	var tc = zlartg_f_zero_g_large;
	runTest( 0.0, 0.0, 1e200, 2e200, tc, 'zlartg_f_zero_g_large' );
});

test( 'zlartg: both very small (scaled algorithm)', function t() {
	var tc = zlartg_both_small;
	runTest( 3e-200, 4e-200, 1e-200, 2e-200, tc, 'zlartg_both_small' );
});

test( 'zlartg: large f, very small g', function t() {
	var tc = zlartg_large_f_small_g;
	runTest( 1e200, 0.0, 1e-200, 0.0, tc, 'zlartg_large_f_small_g' );
});

test( 'zlartg: tiny f, g=0', function t() {
	var tc = zlartg_tiny_f_g_zero;
	runTest( 1e-300, 1e-300, 0.0, 0.0, tc, 'zlartg_tiny_f_g_zero' );
});

test( 'zlartg: f=0, very small g (scaled f=0 path)', function t() {
	var tc = zlartg_f_zero_g_small;
	runTest( 0.0, 0.0, 1e-200, 2e-200, tc, 'zlartg_f_zero_g_small' );
});

test( 'zlartg: unscaled, f2 < h2*SAFMIN (tiny f relative to g)', function t() {
	var tc = zlartg_unscaled_tiny_f;
	runTest( 1e-54, 0.0, 1e100, 0.0, tc, 'zlartg_unscaled_tiny_f' );
});

test( 'zlartg: unscaled, f2 small (else branch of f2>rtmin)', function t() {
	var tc = zlartg_unscaled_f2_small;
	runTest( 1e-100, 0.0, 1.0, 0.0, tc, 'zlartg_unscaled_f2_small' );
});

test( 'zlartg: scaled, f2 < h2*SAFMIN (tiny f in scaled path)', function t() {
	var tc = zlartg_scaled_tiny_f;
	runTest( 1e-100, 0.0, 1e200, 1e200, tc, 'zlartg_scaled_tiny_f' );
});

test( 'zlartg: scaled, large both, h2 >= rtmax (else branch in scaled)', function t() {
	var tc = zlartg_scaled_large_both;
	runTest( 5e152, 5e152, 5e152, 5e152, tc, 'zlartg_scaled_large_both' );
});

test( 'zlartg: scaled, same scaling, f2 < h2*SAFMIN', function t() {
	var tc = zlartg_scaled_f2_lt_safmin;
	runTest( 2e46, 0.0, 1e200, 1e200, tc, 'zlartg_scaled_f2_lt_safmin' );
});
