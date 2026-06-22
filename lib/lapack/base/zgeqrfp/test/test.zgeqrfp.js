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
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import zgeqrfp from './../lib/zgeqrfp.js';


// TESTS //

test( 'zgeqrfp is a function', function t() {
	assert.strictEqual( typeof zgeqrfp, 'function', 'is a function' );
});

test( 'zgeqrfp has expected arity', function t() {
	assert.strictEqual( zgeqrfp.length, 9, 'has expected arity' );
});

test( 'zgeqrfp throws TypeError for invalid order', function t() {
	assert.throws( function throws() {
		zgeqrfp( 'invalid', 2, 2, new Complex128Array( 4 ), 2, new Complex128Array( 2 ), 1, new Complex128Array( 4 ), 1 );
	}, TypeError );
});

test( 'zgeqrfp throws RangeError for negative M', function t() {
	assert.throws( function throws() {
		zgeqrfp( 'row-major', -1, 2, new Complex128Array( 4 ), 2, new Complex128Array( 2 ), 1, new Complex128Array( 4 ), 1 );
	}, RangeError );
});

test( 'zgeqrfp throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		zgeqrfp( 'row-major', 2, -1, new Complex128Array( 4 ), 2, new Complex128Array( 2 ), 1, new Complex128Array( 4 ), 1 );
	}, RangeError );
});

test( 'zgeqrfp throws RangeError for small LDA (row-major)', function t() {
	assert.throws( function throws() {
		zgeqrfp( 'row-major', 2, 2, new Complex128Array( 4 ), 1, new Complex128Array( 2 ), 1, new Complex128Array( 4 ), 1 );
	}, RangeError );
});

test( 'zgeqrfp throws RangeError for small LDA (column-major)', function t() {
	assert.throws( function throws() {
		zgeqrfp( 'column-major', 2, 2, new Complex128Array( 4 ), 1, new Complex128Array( 2 ), 1, new Complex128Array( 4 ), 1 );
	}, RangeError );
});

test( 'zgeqrfp: row-major layout factors successfully', function t() {
	var work;
	var info;
	var tau;
	var a;

	a = new Complex128Array([
		1,
		0,
		2,
		1,
		3,
		0,
		4,
		2
	]);
	tau = new Complex128Array( 2 );
	work = new Complex128Array( 32 );
	info = zgeqrfp( 'row-major', 2, 2, a, 2, tau, 1, work, 1 );
	assert.strictEqual( info, 0, 'row-major info=0' );
});

test( 'zgeqrfp: column-major layout factors successfully', function t() {
	var work;
	var info;
	var tau;
	var a;

	a = new Complex128Array([
		1,
		0,
		2,
		1,
		3,
		0,
		4,
		2
	]);
	tau = new Complex128Array( 2 );
	work = new Complex128Array( 32 );
	info = zgeqrfp( 'column-major', 2, 2, a, 2, tau, 1, work, 1 );
	assert.strictEqual( info, 0, 'column-major info=0' );
});
