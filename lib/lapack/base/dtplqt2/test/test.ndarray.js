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
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dtplqt2 from './../lib/ndarray.js';


// TESTS //

test( 'ndarray is a function', function t() {
	assert.strictEqual( typeof dtplqt2, 'function', 'is a function' );
});

test( 'ndarray: throws when M is negative', function t() {
	assert.throws( function bad() {
		dtplqt2( -1, 3, 0, new Float64Array( 9 ), 1, 3, 0, new Float64Array( 9 ), 1, 3, 0, new Float64Array( 9 ), 1, 3, 0 );
	}, RangeError );
});

test( 'ndarray: throws when N is negative', function t() {
	assert.throws( function bad() {
		dtplqt2( 3, -1, 0, new Float64Array( 9 ), 1, 3, 0, new Float64Array( 9 ), 1, 3, 0, new Float64Array( 9 ), 1, 3, 0 );
	}, RangeError );
});

test( 'ndarray: throws when l is out of range', function t() {
	assert.throws( function bad() {
		dtplqt2( 3, 3, 5, new Float64Array( 9 ), 1, 3, 0, new Float64Array( 9 ), 1, 3, 0, new Float64Array( 9 ), 1, 3, 0 );
	}, RangeError );
});

test( 'ndarray: delegates to base on valid input', function t() {
	var info;
	var LD;
	var M;
	var N;
	var A;
	var B;
	var T;
	M = 3;
	N = 3;
	LD = 3;
	A = new Float64Array( LD * M );
	B = new Float64Array( LD * N );
	T = new Float64Array( LD * M );
	A[ 0 ] = 2.0;
	A[ 1 ] = 0.5;
	A[ 2 ] = 0.25;
	A[ 4 ] = 3.0;
	A[ 5 ] = 0.75;
	A[ 8 ] = 4.0;
	B[ 0 ] = 0.9;
	B[ 1 ] = 0.2;
	B[ 2 ] = 0.6;
	B[ 4 ] = 1.3;
	B[ 5 ] = 0.4;
	B[ 8 ] = 1.1;
	info = dtplqt2( M, N, 2, A, 1, LD, 0, B, 1, LD, 0, T, 1, LD, 0 );
	assert.strictEqual( info, 0 );
});
