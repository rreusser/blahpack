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
import zlacgv from './../lib/index.js';
import base from './../lib/ndarray.js';

// FIXTURES //

import zlacgv_basic from './fixtures/zlacgv_basic.json' with { type: 'json' };
import zlacgv_n_zero from './fixtures/zlacgv_n_zero.json' with { type: 'json' };
import zlacgv_n_one from './fixtures/zlacgv_n_one.json' with { type: 'json' };
import zlacgv_stride2 from './fixtures/zlacgv_stride2.json' with { type: 'json' };
import zlacgv_neg_stride from './fixtures/zlacgv_neg_stride.json' with { type: 'json' };
import zlacgv_zeros from './fixtures/zlacgv_zeros.json' with { type: 'json' };
import zlacgv_pure_imag from './fixtures/zlacgv_pure_imag.json' with { type: 'json' };
// HELPERS //

function assertArrayClose( actual, expected, msg ) {
	var relErr;
	var i;
	assert.strictEqual( actual.length, expected.length, msg + ': length mismatch' );
	for ( i = 0; i < expected.length; i++ ) {
		if ( expected[ i ] === 0.0 ) {
			// For zero, check absolute: allow -0 to match 0
			assert.ok( Math.abs( actual[ i ] ) <= 1e-14, msg + '[' + i + ']: expected ' + expected[ i ] + ', got ' + actual[ i ] );
		} else {
			relErr = Math.abs( actual[ i ] - expected[ i ] ) / Math.max( Math.abs( expected[ i ] ), 1.0 );
			assert.ok( relErr <= 1e-14, msg + '[' + i + ']: expected ' + expected[ i ] + ', got ' + actual[ i ] );
		}
	}
}

// TESTS //

test( 'zlacgv: main export is a function', function t() {
	assert.strictEqual( typeof zlacgv, 'function' );
});

test( 'zlacgv: attached to the main export is an `ndarray` method', function t() {
	assert.strictEqual( typeof zlacgv.ndarray, 'function' );
});

test( 'zlacgv: basic conjugation (N=3, stride=1)', function t() {
	var tc = zlacgv_basic;
	var x = new Complex128Array( [ 1.0, 2.0, 3.0, -4.0, 5.0, 0.0 ] );
	base( 3, x, 1, 0 );
	assertArrayClose( Array.from( reinterpret( x, 0 ) ), tc.x, 'zlacgv_basic' );
});

test( 'zlacgv: N=0 is a no-op', function t() {
	var tc = zlacgv_n_zero;
	var x = new Complex128Array( [ 1.0, 2.0, 3.0, 4.0 ] );
	base( 0, x, 1, 0 );
	assertArrayClose( Array.from( reinterpret( x, 0 ) ), tc.x, 'zlacgv_n_zero' );
});

test( 'zlacgv: N=1', function t() {
	var tc = zlacgv_n_one;
	var x = new Complex128Array( [ 7.0, -3.0 ] );
	base( 1, x, 1, 0 );
	assertArrayClose( Array.from( reinterpret( x, 0 ) ), tc.x, 'zlacgv_n_one' );
});

test( 'zlacgv: non-unit stride (stride=2)', function t() {
	var tc = zlacgv_stride2;
	var x = new Complex128Array( [
		1.0, 2.0, 99.0, 99.0, 3.0, 4.0, 99.0, 99.0, 5.0, 6.0
	] );
	base( 3, x, 2, 0 );
	assertArrayClose( Array.from( reinterpret( x, 0 ) ), tc.x, 'zlacgv_stride2' );
});

test( 'zlacgv: negative stride (stride=-1)', function t() {
	var tc = zlacgv_neg_stride;
	// With stride=-1, offset is now in complex elements: 2 (was Float64 index 4)
	var x = new Complex128Array( [ 1.0, 2.0, 3.0, 4.0, 5.0, 6.0 ] );
	base( 3, x, -1, 2 );
	assertArrayClose( Array.from( reinterpret( x, 0 ) ), tc.x, 'zlacgv_neg_stride' );
});

test( 'zlacgv: all zeros', function t() {
	var tc = zlacgv_zeros;
	var x = new Complex128Array( [ 0.0, 0.0, 0.0, 0.0 ] );
	base( 2, x, 1, 0 );
	assertArrayClose( Array.from( reinterpret( x, 0 ) ), tc.x, 'zlacgv_zeros' );
});

test( 'zlacgv: pure imaginary', function t() {
	var tc = zlacgv_pure_imag;
	var x = new Complex128Array( [ 0.0, 5.0, 0.0, -3.0 ] );
	base( 2, x, 1, 0 );
	assertArrayClose( Array.from( reinterpret( x, 0 ) ), tc.x, 'zlacgv_pure_imag' );
});
