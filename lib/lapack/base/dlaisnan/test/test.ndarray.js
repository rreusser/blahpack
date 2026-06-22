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
import dlaisnan from './../lib/index.js';
import base from './../lib/ndarray.js';

// FIXTURES //

import dlaisnan_nan from './fixtures/dlaisnan_nan.json' with { type: 'json' };
import dlaisnan_zero from './fixtures/dlaisnan_zero.json' with { type: 'json' };
import dlaisnan_one from './fixtures/dlaisnan_one.json' with { type: 'json' };
import dlaisnan_inf from './fixtures/dlaisnan_inf.json' with { type: 'json' };

// TESTS //

test( 'dlaisnan: main export is a function', function t() {
	assert.strictEqual( typeof dlaisnan, 'function' );
});

test( 'dlaisnan: attached to the main export is an `ndarray` method', function t() { // eslint-disable-line max-len
	assert.strictEqual( typeof dlaisnan.ndarray, 'function' );
});

test( 'dlaisnan: returns true for NaN != NaN', function t() {
	var result = base( NaN, NaN );
	var tc = dlaisnan_nan;
	assert.strictEqual( result, tc.result === 1 );
});

test( 'dlaisnan: returns false for 0 == 0', function t() {
	var result = base( 0.0, 0.0 );
	var tc = dlaisnan_zero;
	assert.strictEqual( result, tc.result === 1 );
});

test( 'dlaisnan: returns false for 1 == 1', function t() {
	var result = base( 1.0, 1.0 );
	var tc = dlaisnan_one;
	assert.strictEqual( result, tc.result === 1 );
});

test( 'dlaisnan: returns false for Inf == Inf', function t() {
	var result = base( Infinity, Infinity );
	var tc = dlaisnan_inf;
	assert.strictEqual( result, tc.result === 1 );
});
