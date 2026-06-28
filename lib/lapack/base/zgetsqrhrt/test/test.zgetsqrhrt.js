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

/* eslint-disable no-restricted-syntax, stdlib/first-unit-test, max-len */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import zgetsqrhrt from './../lib/zgetsqrhrt.js';


// TESTS //

test( 'zgetsqrhrt is a function', function t() {
	assert.strictEqual( typeof zgetsqrhrt, 'function', 'is a function' );
});

test( 'zgetsqrhrt has expected arity', function t() {
	assert.strictEqual( zgetsqrhrt.length, 10, 'has expected arity' );
});

test( 'zgetsqrhrt throws TypeError for invalid order', function t() {
	assert.throws( function throws() {
		zgetsqrhrt( 'invalid', 4, 2, 4, 2, 2, new Complex128Array( 8 ), 4, new Complex128Array( 4 ), 2 );
	}, TypeError );
});

test( 'zgetsqrhrt throws RangeError for negative M', function t() {
	assert.throws( function throws() {
		zgetsqrhrt( 'column-major', -1, 0, 1, 1, 1, new Complex128Array( 1 ), 1, new Complex128Array( 1 ), 1 );
	}, RangeError );
});

test( 'zgetsqrhrt throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		zgetsqrhrt( 'column-major', 2, -1, 3, 1, 1, new Complex128Array( 4 ), 2, new Complex128Array( 1 ), 1 );
	}, RangeError );
});

test( 'zgetsqrhrt throws RangeError when N > M', function t() {
	assert.throws( function throws() {
		zgetsqrhrt( 'column-major', 2, 4, 5, 1, 1, new Complex128Array( 8 ), 2, new Complex128Array( 4 ), 1 );
	}, RangeError );
});

test( 'zgetsqrhrt throws RangeError when mb1 <= N', function t() {
	assert.throws( function throws() {
		zgetsqrhrt( 'column-major', 4, 2, 2, 1, 1, new Complex128Array( 8 ), 4, new Complex128Array( 2 ), 1 );
	}, RangeError );
});

test( 'zgetsqrhrt throws RangeError for nb1 < 1', function t() {
	assert.throws( function throws() {
		zgetsqrhrt( 'column-major', 4, 2, 4, 0, 1, new Complex128Array( 8 ), 4, new Complex128Array( 2 ), 1 );
	}, RangeError );
});

test( 'zgetsqrhrt throws RangeError for nb2 < 1', function t() {
	assert.throws( function throws() {
		zgetsqrhrt( 'column-major', 4, 2, 4, 1, 0, new Complex128Array( 8 ), 4, new Complex128Array( 2 ), 1 );
	}, RangeError );
});

test( 'zgetsqrhrt throws RangeError when LDA too small (column-major)', function t() {
	assert.throws( function throws() {
		zgetsqrhrt( 'column-major', 4, 2, 4, 1, 1, new Complex128Array( 8 ), 1, new Complex128Array( 2 ), 1 );
	}, RangeError );
});

test( 'zgetsqrhrt throws RangeError when LDA too small (row-major)', function t() {
	assert.throws( function throws() {
		zgetsqrhrt( 'row-major', 4, 2, 4, 1, 1, new Complex128Array( 8 ), 1, new Complex128Array( 2 ), 1 );
	}, RangeError );
});

test( 'zgetsqrhrt throws RangeError when LDT too small', function t() {
	assert.throws( function throws() {
		zgetsqrhrt( 'column-major', 4, 2, 4, 1, 2, new Complex128Array( 8 ), 4, new Complex128Array( 4 ), 0 );
	}, RangeError );
});

test( 'zgetsqrhrt: column-major succeeds on a small problem', function t() {
	var view;
	var info;
	var data;
	var A;
	var T;
	var i;
	A = new Complex128Array( 8 );
	view = reinterpret( A, 0 );
	data = [ 2.0, 0.0, 1.0, 0.0, 3.0, 0.0, 1.0, 0.0, 1.0, 0.0, 4.0, 0.0, 2.0, 0.0, 3.0, 0.0 ];
	for ( i = 0; i < data.length; i++ ) {
		view[ i ] = data[ i ];
	}
	T = new Complex128Array( 2 * 2 );
	info = zgetsqrhrt( 'column-major', 4, 2, 4, 2, 2, A, 4, T, 2 );
	assert.strictEqual( info, 0, 'INFO == 0' );
});
