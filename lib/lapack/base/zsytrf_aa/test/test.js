/**
* @license Apache-2.0
*
* Copyright (c) 2026 Ricky Reusser.
*
* Derived from the LAPACK 3.12.0 reference implementation (BSD-3-Clause).
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
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import zsytrfAa from './../lib/index.js';
import base from './../lib/base.js';


// TESTS //

test( 'main export is a function', function t() {
	assert.strictEqual( typeof zsytrfAa, 'function', 'main export is a function' );
});

test( 'main export has an ndarray method', function t() {
	assert.strictEqual( typeof zsytrfAa.ndarray, 'function', 'has ndarray method' ); // eslint-disable-line max-len
});

test( 'base returns 0 for N=0 (direct call bypassing wrapper short-circuit)', function t() { // eslint-disable-line max-len
	var info = base( 'lower', 0, new Complex128Array( 0 ), 1, 1, 0, new Int32Array( 0 ), 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, 0, 'info=0 for N=0' );
});
