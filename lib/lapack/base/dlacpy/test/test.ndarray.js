/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

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
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dlacpy from './../lib/index.js';

// FIXTURES //

import all_3x3 from './fixtures/all_3x3.json' with { type: 'json' };
import upper_3x3 from './fixtures/upper_3x3.json' with { type: 'json' };
import lower_3x3 from './fixtures/lower_3x3.json' with { type: 'json' };
import all_2x3 from './fixtures/all_2x3.json' with { type: 'json' };
import upper_4x3 from './fixtures/upper_4x3.json' with { type: 'json' };

// FUNCTIONS //

/**
* Asserts that two arrays are element-wise approximately equal.
*
* @private
* @param {*} actual - actual value
* @param {*} expected - expected value
* @param {string} msg - assertion message
*/
function assertArrayClose( actual, expected, msg ) {
	var relErr;
	var i;
	assert.equal( actual.length, expected.length, msg + ': length mismatch' );
	for ( i = 0; i < expected.length; i++ ) {
		relErr = Math.abs( actual[i] - expected[i] ) / Math.max( Math.abs( expected[i] ), 1.0 ); // eslint-disable-line max-len
		assert.ok( relErr <= 1e-14, msg + '[' + i + ']: expected ' + expected[i] + ', got ' + actual[i] ); // eslint-disable-line max-len
	}
}

// TESTS //

test( 'dlacpy.ndarray copies all of a 3x3 matrix', function t() {
	var tc = all_3x3;
	var a = new Float64Array( [ 1, 2, 3, 4, 5, 6, 7, 8, 9 ] );
	var b = new Float64Array( 9 );
	dlacpy.ndarray( 'all', 3, 3, a, 1, 3, 0, b, 1, 3, 0 );
	assertArrayClose( b, tc.b, 'all_3x3' );
});

test( 'dlacpy.ndarray copies upper triangle of a 3x3 matrix', function t() {
	var tc = upper_3x3;
	var a = new Float64Array( [ 1, 2, 3, 4, 5, 6, 7, 8, 9 ] );
	var b = new Float64Array( 9 );
	dlacpy.ndarray( 'upper', 3, 3, a, 1, 3, 0, b, 1, 3, 0 );
	assertArrayClose( b, tc.b, 'upper_3x3' );
});

test( 'dlacpy.ndarray copies lower triangle of a 3x3 matrix', function t() {
	var tc = lower_3x3;
	var a = new Float64Array( [ 1, 2, 3, 4, 5, 6, 7, 8, 9 ] );
	var b = new Float64Array( 9 );
	dlacpy.ndarray( 'lower', 3, 3, a, 1, 3, 0, b, 1, 3, 0 );
	assertArrayClose( b, tc.b, 'lower_3x3' );
});

test( 'dlacpy.ndarray copies all of a 2x3 rectangular matrix', function t() {
	var tc = all_2x3;
	var a = new Float64Array( [ 1, 2, 3, 4, 5, 6, 7, 8, 9 ] );
	var b = new Float64Array( 9 );
	dlacpy.ndarray( 'all', 2, 3, a, 1, 3, 0, b, 1, 3, 0 );
	assertArrayClose( b, tc.b, 'all_2x3' );
});

test( 'dlacpy.ndarray handles M=0', function t() {
	var b = new Float64Array( [ 99.0 ] );
	dlacpy.ndarray( 'all', 0, 3, new Float64Array( 9 ), 1, 3, 0, b, 1, 1, 0 );
	assert.equal( b[0], 99.0 );
});

test( 'dlacpy.ndarray handles N=0', function t() {
	var b = new Float64Array( [ 99.0 ] );
	dlacpy.ndarray( 'all', 3, 0, new Float64Array( 9 ), 1, 3, 0, b, 1, 3, 0 );
	assert.equal( b[0], 99.0 );
});

test( 'dlacpy.ndarray copies upper triangle of a 4x3 matrix', function t() {
	var tc = upper_4x3;
	var a = new Float64Array( [ 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12 ] );
	var b = new Float64Array( 12 );
	dlacpy.ndarray( 'upper', 4, 3, a, 1, 4, 0, b, 1, 4, 0 );
	assertArrayClose( b, tc.b, 'upper_4x3' );
});
