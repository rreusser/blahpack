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

/* eslint-disable no-restricted-syntax, stdlib/first-unit-test, camelcase */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import zgetrf from './../../zgetrf/lib/base.js';
import zla_gercond_x from './../lib/zla_gercond_x.js';
import zla_gercond_x_nd from './../lib/ndarray.js';


// FUNCTIONS //

/**
* Returns the 3x3 complex test matrix in column-major layout.
*
* @private
* @returns {Complex128Array} matrix A
*/
function make3x3A() {
	return new Complex128Array([
		2.0,
		1.0,
		1.0,
		-1.0,
		0.0,
		1.0,
		1.0,
		0.0,
		3.0,
		0.0,
		1.0,
		-0.5,
		0.0,
		-1.0,
		1.0,
		1.0,
		4.0,
		0.0
	]);
}


// TESTS //

test( 'zla_gercond_x is a function', function t() {
	assert.strictEqual( typeof zla_gercond_x, 'function', 'is a function' );
});

test( 'zla_gercond_x has expected arity', function t() {
	assert.strictEqual( zla_gercond_x.length, 16, 'has expected arity' );
});

test( 'zla_gercond_x throws TypeError for invalid order', function t() {
	assert.throws( function throws() {
		zla_gercond_x( 'invalid', 'no-transpose', 2, new Complex128Array( 4 ), 2, new Complex128Array( 4 ), 2, new Int32Array( 2 ), 1, 0, new Complex128Array( 2 ), 1, new Complex128Array( 4 ), 1, new Float64Array( 2 ), 1 ); // eslint-disable-line max-len
	}, TypeError );
});

test( 'zla_gercond_x throws TypeError for invalid trans', function t() {
	assert.throws( function throws() {
		zla_gercond_x( 'row-major', 'invalid', 2, new Complex128Array( 4 ), 2, new Complex128Array( 4 ), 2, new Int32Array( 2 ), 1, 0, new Complex128Array( 2 ), 1, new Complex128Array( 4 ), 1, new Float64Array( 2 ), 1 ); // eslint-disable-line max-len
	}, TypeError );
});

test( 'zla_gercond_x throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		zla_gercond_x( 'row-major', 'no-transpose', -1, new Complex128Array( 4 ), 2, new Complex128Array( 4 ), 2, new Int32Array( 2 ), 1, 0, new Complex128Array( 2 ), 1, new Complex128Array( 4 ), 1, new Float64Array( 2 ), 1 ); // eslint-disable-line max-len
	}, RangeError );
});

test( 'zla_gercond_x throws RangeError for LDA too small (row-major)', function t() {
	assert.throws( function throws() {
		zla_gercond_x( 'row-major', 'no-transpose', 3, new Complex128Array( 9 ), 1, new Complex128Array( 9 ), 3, new Int32Array( 3 ), 1, 0, new Complex128Array( 3 ), 1, new Complex128Array( 6 ), 1, new Float64Array( 3 ), 1 ); // eslint-disable-line max-len
	}, RangeError );
});

test( 'zla_gercond_x throws RangeError for LDAF too small (row-major)', function t() {
	assert.throws( function throws() {
		zla_gercond_x( 'row-major', 'no-transpose', 3, new Complex128Array( 9 ), 3, new Complex128Array( 9 ), 1, new Int32Array( 3 ), 1, 0, new Complex128Array( 3 ), 1, new Complex128Array( 6 ), 1, new Float64Array( 3 ), 1 ); // eslint-disable-line max-len
	}, RangeError );
});

test( 'zla_gercond_x column-major path returns a number', function t() {
	var RWORK;
	var IPIV;
	var WORK;
	var AF;
	var A;
	var X;
	var N;
	var r;

	N = 3;
	A = make3x3A();
	AF = new Complex128Array( A );
	IPIV = new Int32Array( N );
	zgetrf( N, N, AF, 1, N, 0, IPIV, 1, 0 );
	X = new Complex128Array( [ 1, 0, 1, 0, 1, 0 ] );
	WORK = new Complex128Array( 2 * N );
	RWORK = new Float64Array( N );
	r = zla_gercond_x( 'column-major', 'no-transpose', N, A, N, AF, N, IPIV, 1, 0, X, 1, WORK, 1, RWORK, 1 ); // eslint-disable-line max-len
	assert.ok( r > 0 && r <= 1, 'returns a reciprocal condition estimate' );
});

test( 'zla_gercond_x row-major path returns a number', function t() {
	var RWORK;
	var IPIV;
	var WORK;
	var AF;
	var A;
	var X;
	var N;
	var r;

	N = 2;
	A = new Complex128Array( [ 2, 0, 1, 0, 1, 0, 3, 0 ] );
	AF = new Complex128Array( A );
	IPIV = new Int32Array( N );
	zgetrf( N, N, AF, N, 1, 0, IPIV, 1, 0 );
	X = new Complex128Array( [ 1, 0, 1, 0 ] );
	WORK = new Complex128Array( 2 * N );
	RWORK = new Float64Array( N );
	r = zla_gercond_x( 'row-major', 'conjugate-transpose', N, A, N, AF, N, IPIV, 1, 0, X, 1, WORK, 1, RWORK, 1 ); // eslint-disable-line max-len
	assert.ok( r > 0, 'returns a positive estimate' );
});

test( 'zla_gercond_x ndarray wrapper throws for invalid trans', function t() {
	assert.throws( function throws() {
		zla_gercond_x_nd( 'invalid', 2, new Complex128Array( 4 ), 1, 2, 0, new Complex128Array( 4 ), 1, 2, 0, new Int32Array( 2 ), 1, 0, new Complex128Array( 2 ), 1, 0, new Complex128Array( 4 ), 1, 0, new Float64Array( 2 ), 1, 0 ); // eslint-disable-line max-len
	}, TypeError );
});

test( 'zla_gercond_x ndarray wrapper basic call', function t() {
	var RWORK;
	var IPIV;
	var WORK;
	var AF;
	var A;
	var X;
	var N;
	var r;

	N = 3;
	A = make3x3A();
	AF = new Complex128Array( A );
	IPIV = new Int32Array( N );
	zgetrf( N, N, AF, 1, N, 0, IPIV, 1, 0 );
	X = new Complex128Array( [ 1, 0, 1, 0, 1, 0 ] );
	WORK = new Complex128Array( 2 * N );
	RWORK = new Float64Array( N );
	r = zla_gercond_x_nd( 'no-transpose', N, A, 1, N, 0, AF, 1, N, 0, IPIV, 1, 0, X, 1, 0, WORK, 1, 0, RWORK, 1, 0 ); // eslint-disable-line max-len
	assert.ok( r > 0, 'returns a positive estimate' );
});
