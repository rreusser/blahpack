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

/* eslint-disable no-restricted-syntax, stdlib/first-unit-test, max-len */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import ztpmlqt from './../lib/ztpmlqt.js';


// TESTS //

test( 'ztpmlqt is a function', function t() {
	assert.strictEqual( typeof ztpmlqt, 'function', 'is a function' );
});

test( 'ztpmlqt has expected arity', function t() {
	assert.strictEqual( ztpmlqt.length, 18, 'has expected arity' );
});

test( 'ztpmlqt throws TypeError for invalid order', function t() {
	assert.throws( function throws() {
		ztpmlqt( 'invalid', 'left', 'no-transpose', 2, 2, 2, 2, 2, new Complex128Array( 4 ), 2, new Complex128Array( 4 ), 2, new Complex128Array( 4 ), 2, new Complex128Array( 4 ), 2, new Complex128Array( 4 ), 2 );
	}, TypeError );
});

test( 'ztpmlqt throws TypeError for invalid side', function t() {
	assert.throws( function throws() {
		ztpmlqt( 'row-major', 'invalid', 'no-transpose', 2, 2, 2, 2, 2, new Complex128Array( 4 ), 2, new Complex128Array( 4 ), 2, new Complex128Array( 4 ), 2, new Complex128Array( 4 ), 2, new Complex128Array( 4 ), 2 );
	}, TypeError );
});

test( 'ztpmlqt throws TypeError for invalid trans', function t() {
	assert.throws( function throws() {
		ztpmlqt( 'row-major', 'left', 'invalid', 2, 2, 2, 2, 2, new Complex128Array( 4 ), 2, new Complex128Array( 4 ), 2, new Complex128Array( 4 ), 2, new Complex128Array( 4 ), 2, new Complex128Array( 4 ), 2 );
	}, TypeError );
});

test( 'ztpmlqt throws TypeError for trans=transpose (only no-transpose and conjugate-transpose accepted)', function t() {
	assert.throws( function throws() {
		ztpmlqt( 'column-major', 'left', 'transpose', 2, 2, 2, 2, 2, new Complex128Array( 4 ), 2, new Complex128Array( 4 ), 2, new Complex128Array( 4 ), 2, new Complex128Array( 4 ), 2, new Complex128Array( 4 ), 2 );
	}, TypeError );
});

test( 'ztpmlqt throws RangeError for negative M', function t() {
	assert.throws( function throws() {
		ztpmlqt( 'column-major', 'left', 'no-transpose', -1, 2, 2, 2, 2, new Complex128Array( 4 ), 2, new Complex128Array( 4 ), 2, new Complex128Array( 4 ), 2, new Complex128Array( 4 ), 2, new Complex128Array( 4 ), 2 );
	}, RangeError );
});

test( 'ztpmlqt throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		ztpmlqt( 'column-major', 'left', 'no-transpose', 2, -1, 2, 2, 2, new Complex128Array( 4 ), 2, new Complex128Array( 4 ), 2, new Complex128Array( 4 ), 2, new Complex128Array( 4 ), 2, new Complex128Array( 4 ), 2 );
	}, RangeError );
});

test( 'ztpmlqt throws RangeError for negative K', function t() {
	assert.throws( function throws() {
		ztpmlqt( 'column-major', 'left', 'no-transpose', 2, 2, -1, 2, 2, new Complex128Array( 4 ), 2, new Complex128Array( 4 ), 2, new Complex128Array( 4 ), 2, new Complex128Array( 4 ), 2, new Complex128Array( 4 ), 2 );
	}, RangeError );
});

test( 'ztpmlqt throws RangeError for L > K', function t() {
	assert.throws( function throws() {
		ztpmlqt( 'column-major', 'left', 'no-transpose', 2, 2, 2, 5, 2, new Complex128Array( 4 ), 2, new Complex128Array( 4 ), 2, new Complex128Array( 4 ), 2, new Complex128Array( 4 ), 2, new Complex128Array( 4 ), 2 );
	}, RangeError );
});

test( 'ztpmlqt throws RangeError for mb < 1', function t() {
	assert.throws( function throws() {
		ztpmlqt( 'column-major', 'left', 'no-transpose', 2, 2, 2, 2, 0, new Complex128Array( 4 ), 2, new Complex128Array( 4 ), 2, new Complex128Array( 4 ), 2, new Complex128Array( 4 ), 2, new Complex128Array( 4 ), 2 );
	}, RangeError );
});

test( 'ztpmlqt throws RangeError for mb > K', function t() {
	assert.throws( function throws() {
		ztpmlqt( 'column-major', 'left', 'no-transpose', 2, 2, 2, 2, 5, new Complex128Array( 4 ), 2, new Complex128Array( 4 ), 2, new Complex128Array( 4 ), 2, new Complex128Array( 4 ), 2, new Complex128Array( 4 ), 2 );
	}, RangeError );
});

test( 'ztpmlqt throws RangeError for LDV too small (column-major)', function t() {
	assert.throws( function throws() {
		ztpmlqt( 'column-major', 'left', 'no-transpose', 4, 3, 3, 2, 2, new Complex128Array( 12 ), 1, new Complex128Array( 6 ), 2, new Complex128Array( 9 ), 3, new Complex128Array( 12 ), 4, new Complex128Array( 6 ), 1 );
	}, RangeError );
});

test( 'ztpmlqt throws RangeError for LDT too small (column-major)', function t() {
	assert.throws( function throws() {
		ztpmlqt( 'column-major', 'left', 'no-transpose', 4, 3, 3, 2, 2, new Complex128Array( 12 ), 3, new Complex128Array( 6 ), 1, new Complex128Array( 9 ), 3, new Complex128Array( 12 ), 4, new Complex128Array( 6 ), 1 );
	}, RangeError );
});

test( 'ztpmlqt throws RangeError for LDA too small (column-major, side=left)', function t() {
	assert.throws( function throws() {
		ztpmlqt( 'column-major', 'left', 'no-transpose', 4, 3, 3, 2, 2, new Complex128Array( 12 ), 3, new Complex128Array( 6 ), 2, new Complex128Array( 9 ), 1, new Complex128Array( 12 ), 4, new Complex128Array( 6 ), 1 );
	}, RangeError );
});

test( 'ztpmlqt throws RangeError for LDB too small (column-major)', function t() {
	assert.throws( function throws() {
		ztpmlqt( 'column-major', 'left', 'no-transpose', 4, 3, 3, 2, 2, new Complex128Array( 12 ), 3, new Complex128Array( 6 ), 2, new Complex128Array( 9 ), 3, new Complex128Array( 12 ), 1, new Complex128Array( 6 ), 1 );
	}, RangeError );
});

test( 'ztpmlqt accepts column-major call (smoke)', function t() {
	var WORK;
	var info;
	var V;
	var T;
	var A;
	var B;
	V = new Complex128Array( 12 );
	T = new Complex128Array( 6 );
	A = new Complex128Array( 9 );
	B = new Complex128Array( 12 );
	WORK = new Complex128Array( 6 );
	info = ztpmlqt( 'column-major', 'left', 'no-transpose', 4, 3, 3, 2, 2, V, 3, T, 2, A, 3, B, 4, WORK, 1 );
	assert.strictEqual( info, 0, 'info' );
});

test( 'ztpmlqt accepts row-major call (smoke)', function t() {
	var WORK;
	var info;
	var V;
	var T;
	var A;
	var B;
	V = new Complex128Array( 16 );
	T = new Complex128Array( 9 );
	A = new Complex128Array( 9 );
	B = new Complex128Array( 12 );
	WORK = new Complex128Array( 6 );
	info = ztpmlqt( 'row-major', 'left', 'no-transpose', 4, 3, 3, 2, 2, V, 4, T, 3, A, 3, B, 3, WORK, 1 );
	assert.strictEqual( info, 0, 'info' );
});
