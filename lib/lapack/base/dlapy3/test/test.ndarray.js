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
import dlapy3 from './../lib/index.js';
import base from './../lib/ndarray.js';

// FIXTURES //

import dlapy3_3_4_0 from './fixtures/dlapy3_3_4_0.json' with { type: 'json' };
import dlapy3_1_1_1 from './fixtures/dlapy3_1_1_1.json' with { type: 'json' };
import dlapy3_0_0_0 from './fixtures/dlapy3_0_0_0.json' with { type: 'json' };
import dlapy3_large from './fixtures/dlapy3_large.json' with { type: 'json' };
import dlapy3_small from './fixtures/dlapy3_small.json' with { type: 'json' };
import dlapy3_2_3_6 from './fixtures/dlapy3_2_3_6.json' with { type: 'json' };
import dlapy3_neg from './fixtures/dlapy3_neg.json' with { type: 'json' };
import dlapy3_single from './fixtures/dlapy3_single.json' with { type: 'json' };

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

// TESTS //

test( 'dlapy3: main export is a function', function t() {
	assert.strictEqual( typeof dlapy3, 'function' );
});

test( 'dlapy3: attached to the main export is an `ndarray` method', function t() { // eslint-disable-line max-len
	assert.strictEqual( typeof dlapy3.ndarray, 'function' );
});

test( 'dlapy3: (3,4,0) -> 5', function t() {
	var tc = dlapy3_3_4_0;
	assertClose( base( 3.0, 4.0, 0.0 ), tc.result, 'dlapy3(3,4,0)' );
});

test( 'dlapy3: (1,1,1) -> sqrt(3)', function t() {
	var tc = dlapy3_1_1_1;
	assertClose( base( 1.0, 1.0, 1.0 ), tc.result, 'dlapy3(1,1,1)' );
});

test( 'dlapy3: (0,0,0) -> 0', function t() {
	var tc = dlapy3_0_0_0;
	assert.strictEqual( base( 0.0, 0.0, 0.0 ), tc.result );
});

test( 'dlapy3: large values (overflow-safe)', function t() {
	var tc = dlapy3_large;
	assertClose( base( 1.0e300, 1.0e300, 1.0e300 ), tc.result, 'dlapy3(large)' );
});

test( 'dlapy3: small values', function t() {
	var tc = dlapy3_small;
	assertClose( base( 1.0e-300, 2.0e-300, 3.0e-300 ), tc.result, 'dlapy3(small)' ); // eslint-disable-line max-len
});

test( 'dlapy3: (2,3,6) -> 7', function t() {
	var tc = dlapy3_2_3_6;
	assertClose( base( 2.0, 3.0, 6.0 ), tc.result, 'dlapy3(2,3,6)' );
});

test( 'dlapy3: negative values', function t() {
	var tc = dlapy3_neg;
	assertClose( base( -3.0, -4.0, 0.0 ), tc.result, 'dlapy3(neg)' );
});

test( 'dlapy3: single non-zero', function t() {
	var tc = dlapy3_single;
	assertClose( base( 5.0, 0.0, 0.0 ), tc.result, 'dlapy3(single)' );
});
