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

/* eslint-disable no-restricted-syntax, stdlib/first-unit-test, max-len */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dlarrf from './../lib/index.js';


// VARIABLES //

var PIVMIN = 2.2250738585072014e-308;


// TESTS //

test( 'main export is a function', function t() {
	assert.strictEqual( typeof dlarrf, 'function', 'main export is a function' );
});

test( 'main export has an ndarray method', function t() {
	assert.strictEqual( typeof dlarrf.ndarray, 'function', 'has ndarray method' );
});

test( 'main export computes a valid RRR for a 4x4 cluster', function t() {
	var sigma = new Float64Array( 1 );
	var dplus = new Float64Array( 4 );
	var lplus = new Float64Array( 4 );
	var werr = new Float64Array( [ 1e-3, 1e-3, 1e-3, 1e-3 ] );
	var wgap = new Float64Array( [ 0.9, 0.9, 1.0, 0.0 ] );
	var work = new Float64Array( 8 );
	var info;
	var ld = new Float64Array( [ 0.4, 0.3, 0.2, 0.0 ] );
	var d = new Float64Array( [ 4.0, 3.0, 2.0, 1.0 ] );
	var l = new Float64Array( [ 0.1, 0.1, 0.1, 0.0 ] );
	var w = new Float64Array( [ 0.95, 1.95, 2.95, 4.05 ] );
	var N = 4;
	info = dlarrf( N, d, 1, l, 1, ld, 1, 1, 4, w, 1, wgap, 1, werr, 1, 4.0, 1.0, 1.0, PIVMIN, sigma, dplus, 1, lplus, 1, work, 1 );
	assert.strictEqual( info, 0, 'info is 0 on success' );
	assert.ok( sigma[ 0 ] >= 0.9 && sigma[ 0 ] <= 1.0, 'sigma is in the lower gap' );
	assert.ok( dplus[ 0 ] > 0, 'dplus[0] is positive' );
	assert.ok( Math.abs( lplus[ 0 ] ) < 1.0, 'lplus[0] is a reasonable magnitude' );
});

test( 'ndarray computes a valid RRR for a 4x4 cluster', function t() {
	var sigma = new Float64Array( 1 );
	var dplus = new Float64Array( 4 );
	var lplus = new Float64Array( 4 );
	var werr = new Float64Array( [ 1e-3, 1e-3, 1e-3, 1e-3 ] );
	var wgap = new Float64Array( [ 0.9, 0.9, 1.0, 0.0 ] );
	var work = new Float64Array( 8 );
	var info;
	var ld = new Float64Array( [ 0.4, 0.3, 0.2, 0.0 ] );
	var d = new Float64Array( [ 4.0, 3.0, 2.0, 1.0 ] );
	var l = new Float64Array( [ 0.1, 0.1, 0.1, 0.0 ] );
	var w = new Float64Array( [ 0.95, 1.95, 2.95, 4.05 ] );
	var N = 4;
	info = dlarrf.ndarray( N, d, 1, 0, l, 1, 0, ld, 1, 0, 1, 4, w, 1, 0, wgap, 1, 0, werr, 1, 0, 4.0, 1.0, 1.0, PIVMIN, sigma, dplus, 1, 0, lplus, 1, 0, work, 1, 0 );
	assert.strictEqual( info, 0, 'info is 0 on success' );
	assert.ok( sigma[ 0 ] >= 0.9 && sigma[ 0 ] <= 1.0, 'sigma is in the lower gap' );
	assert.ok( dplus[ 1 ] > 0, 'dplus[1] is positive' );
});
