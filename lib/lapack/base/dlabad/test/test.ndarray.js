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
import dlabad from './../lib/index.js';

test( 'main export is a function', function t() {
	assert.strictEqual( typeof dlabad, 'function' );
});

test( 'attached to the main export is an `ndarray` method', function t() {
	assert.strictEqual( typeof dlabad.ndarray, 'function' );
});

test( 'dlabad returns an object with `small` and `large` properties', function t() { // eslint-disable-line max-len
	var out = dlabad( 1.0e-300, 1.0e+300 );
	assert.strictEqual( typeof out, 'object' );
	assert.strictEqual( 'small' in out, true );
	assert.strictEqual( 'large' in out, true );
});

test( 'dlabad returns the input values unchanged (no-op)', function t() {
	var out = dlabad( 2.2250738585072014e-308, 1.7976931348623157e+308 );
	assert.strictEqual( out.small, 2.2250738585072014e-308 );
	assert.strictEqual( out.large, 1.7976931348623157e+308 );
});

test( 'dlabad returns typical dlamch values unchanged', function t() {
	var out = dlabad( 1.0e-300, 1.0e+300 );
	assert.strictEqual( out.small, 1.0e-300 );
	assert.strictEqual( out.large, 1.0e+300 );
});

test( 'dlabad returns 1.0 unchanged', function t() {
	var out = dlabad( 1.0, 1.0 );
	assert.strictEqual( out.small, 1.0 );
	assert.strictEqual( out.large, 1.0 );
});

test( 'dlabad returns zero unchanged', function t() {
	var out = dlabad( 0.0, 0.0 );
	assert.strictEqual( out.small, 0.0 );
	assert.strictEqual( out.large, 0.0 );
});

test( 'dlabad returns subnormal values unchanged', function t() {
	var out = dlabad( 5e-324, 1.7976931348623157e+308 );
	assert.strictEqual( out.small, 5e-324 );
	assert.strictEqual( out.large, 1.7976931348623157e+308 );
});

test( 'dlabad returns Infinity unchanged', function t() {
	var out = dlabad( 0.0, Infinity );
	assert.strictEqual( out.small, 0.0 );
	assert.strictEqual( out.large, Infinity );
});

test( 'dlabad.ndarray returns values unchanged', function t() {
	var out = dlabad.ndarray( 2.2250738585072014e-308, 1.7976931348623157e+308 );
	assert.strictEqual( out.small, 2.2250738585072014e-308 );
	assert.strictEqual( out.large, 1.7976931348623157e+308 );
});

test( 'dlabad.ndarray returns typical values unchanged', function t() {
	var out = dlabad.ndarray( 1.0e-150, 1.0e+150 );
	assert.strictEqual( out.small, 1.0e-150 );
	assert.strictEqual( out.large, 1.0e+150 );
});
