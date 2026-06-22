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
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dgetsqrhrt from './../lib/dgetsqrhrt.js';


// TESTS //

test( 'dgetsqrhrt is a function', function t() {
	assert.strictEqual( typeof dgetsqrhrt, 'function', 'is a function' );
});

test( 'dgetsqrhrt has expected arity', function t() {
	assert.strictEqual( dgetsqrhrt.length, 11, 'has expected arity' );
});

test( 'dgetsqrhrt throws TypeError for invalid order', function t() {
	assert.throws( function throws() {
		dgetsqrhrt( 'invalid', 2, 2, 3, 2, 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 64 ) );
	}, TypeError );
});

test( 'dgetsqrhrt throws RangeError for negative M', function t() {
	assert.throws( function throws() {
		dgetsqrhrt( 'column-major', -1, 2, 3, 2, 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 64 ) );
	}, RangeError );
});

test( 'dgetsqrhrt throws RangeError for N < 0', function t() {
	assert.throws( function throws() {
		dgetsqrhrt( 'column-major', 2, -1, 3, 2, 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 64 ) );
	}, RangeError );
});

test( 'dgetsqrhrt throws RangeError when M < N', function t() {
	assert.throws( function throws() {
		dgetsqrhrt( 'column-major', 2, 3, 4, 2, 2, new Float64Array( 6 ), 2, new Float64Array( 6 ), 2, new Float64Array( 64 ) );
	}, RangeError );
});

test( 'dgetsqrhrt throws RangeError when mb1 <= N', function t() {
	assert.throws( function throws() {
		dgetsqrhrt( 'column-major', 4, 3, 3, 2, 2, new Float64Array( 12 ), 4, new Float64Array( 6 ), 2, new Float64Array( 64 ) );
	}, RangeError );
});

test( 'dgetsqrhrt throws RangeError when nb1 < 1', function t() {
	assert.throws( function throws() {
		dgetsqrhrt( 'column-major', 4, 3, 4, 0, 2, new Float64Array( 12 ), 4, new Float64Array( 6 ), 2, new Float64Array( 64 ) );
	}, RangeError );
});

test( 'dgetsqrhrt throws RangeError when nb2 < 1', function t() {
	assert.throws( function throws() {
		dgetsqrhrt( 'column-major', 4, 3, 4, 2, 0, new Float64Array( 12 ), 4, new Float64Array( 6 ), 2, new Float64Array( 64 ) );
	}, RangeError );
});

test( 'dgetsqrhrt throws RangeError for too small LDA (column-major)', function t() {
	assert.throws( function throws() {
		dgetsqrhrt( 'column-major', 4, 3, 4, 2, 2, new Float64Array( 12 ), 2, new Float64Array( 6 ), 2, new Float64Array( 64 ) );
	}, RangeError );
});

test( 'dgetsqrhrt throws RangeError for too small LDA (row-major)', function t() {
	assert.throws( function throws() {
		dgetsqrhrt( 'row-major', 4, 3, 4, 2, 2, new Float64Array( 12 ), 2, new Float64Array( 6 ), 3, new Float64Array( 64 ) );
	}, RangeError );
});

test( 'dgetsqrhrt throws RangeError for too small LDT (column-major)', function t() {
	assert.throws( function throws() {
		dgetsqrhrt( 'column-major', 4, 3, 4, 2, 2, new Float64Array( 12 ), 4, new Float64Array( 6 ), 1, new Float64Array( 64 ) );
	}, RangeError );
});

test( 'dgetsqrhrt throws RangeError for too small LDT (row-major)', function t() {
	assert.throws( function throws() {
		dgetsqrhrt( 'row-major', 4, 3, 4, 2, 2, new Float64Array( 12 ), 3, new Float64Array( 6 ), 2, new Float64Array( 64 ) );
	}, RangeError );
});

test( 'dgetsqrhrt computes a QR factorization on a small matrix (column-major)', function t() {
	var info;
	var A;
	var T;
	var W;
	A = new Float64Array( [ 2.0, 1.0, 3.0, 1.0, 1.0, 4.0, 2.0, 3.0, 3.0, 2.0, 5.0, 1.0 ] ); // eslint-disable-line max-len
	T = new Float64Array( 6 );
	W = new Float64Array( 256 );
	info = dgetsqrhrt( 'column-major', 4, 3, 4, 2, 2, A, 4, T, 2, W );
	assert.strictEqual( info, 0, 'INFO returned 0' );
});

test( 'dgetsqrhrt computes a QR factorization on a small matrix (row-major)', function t() {
	// Row-major M=4, N=3. Same logical matrix as the column-major test, transposed in memory.
	var info;
	var A;
	var T;
	var W;
	A = new Float64Array( [ 2.0, 1.0, 3.0, 1.0, 4.0, 2.0, 3.0, 2.0, 5.0, 1.0, 3.0, 1.0 ] ); // eslint-disable-line max-len
	T = new Float64Array( 6 );
	W = new Float64Array( 256 );
	info = dgetsqrhrt( 'row-major', 4, 3, 4, 2, 2, A, 3, T, 3, W );
	assert.strictEqual( info, 0, 'INFO returned 0' );
});
