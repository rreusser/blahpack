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
import dlarzb from './../lib/index.js';


// TESTS //

test( 'main export is a function', function t() {
	assert.strictEqual( typeof dlarzb, 'function', 'main export is a function' );
});

test( 'main export has an ndarray method', function t() {
	assert.strictEqual( typeof dlarzb.ndarray, 'function', 'has ndarray method' );
});

test( 'main export arity', function t() {
	assert.strictEqual( dlarzb.length, 17, 'main has arity 17' );
});

test( 'ndarray export arity', function t() {
	assert.strictEqual( dlarzb.ndarray.length, 24, 'ndarray has arity 24' );
});

test( 'dlarzb.ndarray applies a single reflector', function t() {
	var WORK;
	var out;
	var tol;
	var V;
	var T;
	var C;

	V = new Float64Array( [ 0.3, -0.4 ] );
	T = new Float64Array( [ 0.8 ] );
	C = new Float64Array( [ 1.0, 2.0, 3.0, 4.0, 5.0, 6.0 ] );
	WORK = new Float64Array( 2 );
	out = dlarzb.ndarray( 'left', 'no-transpose', 'backward', 'rowwise', 3, 2, 1, 2, V, 1, 1, 0, T, 1, 1, 0, C, 1, 3, 0, WORK, 1, 2, 0 ); // eslint-disable-line max-len
	assert.strictEqual( out, C, 'returns C' );
	tol = 1e-13;
	assert.ok( Math.abs( C[ 0 ] - 0.68 ) < tol );
	assert.ok( Math.abs( C[ 1 ] - 1.904 ) < tol );
	assert.ok( Math.abs( C[ 2 ] - 3.128 ) < tol );
});

test( 'dlarzb.ndarray throws TypeError for invalid side', function t() {
	assert.throws( function throws() {
		dlarzb.ndarray( 'invalid', 'no-transpose', 'backward', 'rowwise', 2, 2, 1, 1, new Float64Array( 1 ), 1, 1, 0, new Float64Array( 1 ), 1, 1, 0, new Float64Array( 4 ), 1, 2, 0, new Float64Array( 2 ), 1, 2, 0 ); // eslint-disable-line max-len
	}, TypeError );
});

test( 'dlarzb.ndarray throws TypeError for invalid trans', function t() {
	assert.throws( function throws() {
		dlarzb.ndarray( 'left', 'invalid', 'backward', 'rowwise', 2, 2, 1, 1, new Float64Array( 1 ), 1, 1, 0, new Float64Array( 1 ), 1, 1, 0, new Float64Array( 4 ), 1, 2, 0, new Float64Array( 2 ), 1, 2, 0 ); // eslint-disable-line max-len
	}, TypeError );
});

test( 'dlarzb.ndarray throws TypeError for invalid direct', function t() {
	assert.throws( function throws() {
		dlarzb.ndarray( 'left', 'no-transpose', 'forward', 'rowwise', 2, 2, 1, 1, new Float64Array( 1 ), 1, 1, 0, new Float64Array( 1 ), 1, 1, 0, new Float64Array( 4 ), 1, 2, 0, new Float64Array( 2 ), 1, 2, 0 ); // eslint-disable-line max-len
	}, TypeError );
});

test( 'dlarzb.ndarray throws TypeError for invalid storev', function t() {
	assert.throws( function throws() {
		dlarzb.ndarray( 'left', 'no-transpose', 'backward', 'columnwise', 2, 2, 1, 1, new Float64Array( 1 ), 1, 1, 0, new Float64Array( 1 ), 1, 1, 0, new Float64Array( 4 ), 1, 2, 0, new Float64Array( 2 ), 1, 2, 0 ); // eslint-disable-line max-len
	}, TypeError );
});

test( 'dlarzb.ndarray throws RangeError for negative M', function t() {
	assert.throws( function throws() {
		dlarzb.ndarray( 'left', 'no-transpose', 'backward', 'rowwise', -1, 2, 1, 1, new Float64Array( 1 ), 1, 1, 0, new Float64Array( 1 ), 1, 1, 0, new Float64Array( 4 ), 1, 2, 0, new Float64Array( 2 ), 1, 2, 0 ); // eslint-disable-line max-len
	}, RangeError );
});

test( 'dlarzb.ndarray throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		dlarzb.ndarray( 'left', 'no-transpose', 'backward', 'rowwise', 2, -1, 1, 1, new Float64Array( 1 ), 1, 1, 0, new Float64Array( 1 ), 1, 1, 0, new Float64Array( 4 ), 1, 2, 0, new Float64Array( 2 ), 1, 2, 0 ); // eslint-disable-line max-len
	}, RangeError );
});

test( 'dlarzb.ndarray throws RangeError for negative K', function t() {
	assert.throws( function throws() {
		dlarzb.ndarray( 'left', 'no-transpose', 'backward', 'rowwise', 2, 2, -1, 1, new Float64Array( 1 ), 1, 1, 0, new Float64Array( 1 ), 1, 1, 0, new Float64Array( 4 ), 1, 2, 0, new Float64Array( 2 ), 1, 2, 0 ); // eslint-disable-line max-len
	}, RangeError );
});

test( 'dlarzb.ndarray throws RangeError for negative L', function t() {
	assert.throws( function throws() {
		dlarzb.ndarray( 'left', 'no-transpose', 'backward', 'rowwise', 2, 2, 1, -1, new Float64Array( 1 ), 1, 1, 0, new Float64Array( 1 ), 1, 1, 0, new Float64Array( 4 ), 1, 2, 0, new Float64Array( 2 ), 1, 2, 0 ); // eslint-disable-line max-len
	}, RangeError );
});
