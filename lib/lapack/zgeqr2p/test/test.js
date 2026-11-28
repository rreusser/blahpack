/* eslint-disable no-restricted-syntax */

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


// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import zgeqr2p from './../lib/index.js';


// TESTS //

test( 'main export is a function', function t() {
	assert.strictEqual( typeof zgeqr2p, 'function', 'main export is a function' );
});

test( 'main export has an strided method', function t() {
	assert.strictEqual( typeof zgeqr2p.strided, 'function', 'has strided method' );
});

test( 'main export has expected arity (9)', function t() {
	assert.strictEqual( zgeqr2p.length, 8, 'main has arity 9' );
});

test( 'strided method has expected arity (12)', function t() {
	assert.strictEqual( zgeqr2p.strided.length, 12, 'strided has arity 12' );
});
