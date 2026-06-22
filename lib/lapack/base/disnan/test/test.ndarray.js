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
import disnan from './../lib/index.js';
import base from './../lib/ndarray.js';

// FIXTURES //

import disnan_nan from './fixtures/disnan_nan.json' with { type: 'json' };
import disnan_zero from './fixtures/disnan_zero.json' with { type: 'json' };
import disnan_one from './fixtures/disnan_one.json' with { type: 'json' };
import disnan_inf from './fixtures/disnan_inf.json' with { type: 'json' };
import disnan_neginf from './fixtures/disnan_neginf.json' with { type: 'json' };
import disnan_large from './fixtures/disnan_large.json' with { type: 'json' };

// TESTS //

test( 'disnan: main export is a function', function t() {
	assert.strictEqual( typeof disnan, 'function' );
});

test( 'disnan: attached to the main export is an `ndarray` method', function t() { // eslint-disable-line max-len
	assert.strictEqual( typeof disnan.ndarray, 'function' );
});

test( 'disnan: returns true for NaN', function t() {
	var result = base( NaN );
	var tc = disnan_nan;
	assert.strictEqual( result, tc.result === 1 );
});

test( 'disnan: returns false for zero', function t() {
	var result = base( 0.0 );
	var tc = disnan_zero;
	assert.strictEqual( result, tc.result === 1 );
});

test( 'disnan: returns false for one', function t() {
	var result = base( 1.0 );
	var tc = disnan_one;
	assert.strictEqual( result, tc.result === 1 );
});

test( 'disnan: returns false for Infinity', function t() {
	var result = base( Infinity );
	var tc = disnan_inf;
	assert.strictEqual( result, tc.result === 1 );
});

test( 'disnan: returns false for -Infinity', function t() {
	var result = base( -Infinity );
	var tc = disnan_neginf;
	assert.strictEqual( result, tc.result === 1 );
});

test( 'disnan: returns false for large values', function t() {
	var result = base( 1.0e300 );
	var tc = disnan_large;
	assert.strictEqual( result, tc.result === 1 );
});
