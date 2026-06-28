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
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dgelqt3 from './../lib/dgelqt3.js';


// TESTS //

test( 'dgelqt3 is a function', function t() {
	assert.strictEqual( typeof dgelqt3, 'function', 'is a function' );
});

test( 'dgelqt3 has expected arity', function t() {
	assert.strictEqual( dgelqt3.length, 7, 'has expected arity' );
});

test( 'dgelqt3 throws TypeError for invalid order', function t() {
	assert.throws( function throws() {
		dgelqt3( 'invalid', 2, 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2 );
	}, TypeError );
});

test( 'dgelqt3 throws RangeError for negative M', function t() {
	assert.throws( function throws() {
		dgelqt3( 'row-major', -1, 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2 );
	}, RangeError );
});

test( 'dgelqt3 throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		dgelqt3( 'row-major', 2, -1, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2 );
	}, RangeError );
});
