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
import dcabs1 from './../lib/index.js';
import base from './../lib/ndarray.js';

// FIXTURES //

import basic from './fixtures/basic.json' with { type: 'json' };
import zero from './fixtures/zero.json' with { type: 'json' };
import negative from './fixtures/negative.json' with { type: 'json' };

// TESTS //

test( 'dcabs1: computes |Re(z)| + |Im(z)| for (3+4i)', function t() {
	var tc = basic;
	assert.equal( base( new Float64Array( [ 3, 4 ] ) ), tc.result );
});

test( 'dcabs1: returns 0 for (0+0i)', function t() {
	var tc = zero;
	assert.equal( base( new Float64Array( [ 0, 0 ] ) ), tc.result );
});

test( 'dcabs1: handles negative components', function t() {
	var tc = negative;
	assert.equal( base( new Float64Array( [ -5, 12 ] ) ), tc.result );
});
