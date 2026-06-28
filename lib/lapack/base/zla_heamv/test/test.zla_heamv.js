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

/* eslint-disable no-restricted-syntax, stdlib/first-unit-test, camelcase, max-len */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import zla_heamv from './../lib/zla_heamv.js';


// TESTS //

test( 'zla_heamv is a function', function t() {
	assert.strictEqual( typeof zla_heamv, 'function', 'is a function' );
});

test( 'zla_heamv has expected arity', function t() {
	assert.strictEqual( zla_heamv.length, 11, 'has expected arity' );
});

test( 'zla_heamv throws TypeError for invalid order', function t() {
	assert.throws( function throws() {
		zla_heamv( 'invalid', 'upper', 2, 1.0, new Complex128Array( 4 ), 2, new Complex128Array( 2 ), 1, 0.0, new Float64Array( 2 ), 1 );
	}, TypeError );
});

test( 'zla_heamv throws TypeError for invalid uplo', function t() {
	assert.throws( function throws() {
		zla_heamv( 'column-major', 'invalid', 2, 1.0, new Complex128Array( 4 ), 2, new Complex128Array( 2 ), 1, 0.0, new Float64Array( 2 ), 1 );
	}, TypeError );
});

test( 'zla_heamv throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		zla_heamv( 'column-major', 'upper', -1, 1.0, new Complex128Array( 4 ), 2, new Complex128Array( 2 ), 1, 0.0, new Float64Array( 2 ), 1 );
	}, RangeError );
});

test( 'zla_heamv throws RangeError for invalid LDA', function t() {
	assert.throws( function throws() {
		zla_heamv( 'column-major', 'upper', 3, 1.0, new Complex128Array( 9 ), 2, new Complex128Array( 3 ), 1, 0.0, new Float64Array( 3 ), 1 );
	}, RangeError );
});

test( 'zla_heamv throws RangeError for zero strideX', function t() {
	assert.throws( function throws() {
		zla_heamv( 'column-major', 'upper', 2, 1.0, new Complex128Array( 4 ), 2, new Complex128Array( 2 ), 0, 0.0, new Float64Array( 2 ), 1 );
	}, RangeError );
});

test( 'zla_heamv throws RangeError for zero strideY', function t() {
	assert.throws( function throws() {
		zla_heamv( 'column-major', 'upper', 2, 1.0, new Complex128Array( 4 ), 2, new Complex128Array( 2 ), 1, 0.0, new Float64Array( 2 ), 0 );
	}, RangeError );
});

test( 'zla_heamv computes y (column-major, upper)', function t() {
	var A = new Complex128Array( new Float64Array([
		2.0,
		0.0,
		0.0,
		0.0,
		1.0,
		2.0,
		5.0,
		0.0
	]).buffer );
	var x = new Complex128Array( new Float64Array( [ 1.0, 1.0, 2.0, 0.0 ] ).buffer );
	var y = new Float64Array( 2 );
	zla_heamv( 'column-major', 'upper', 2, 1.0, A, 2, x, 1, 0.0, y, 1 );
	assert.ok( Math.abs( y[ 0 ] - 10.0 ) < 0.01, 'y[0] approx 10' );
	assert.ok( Math.abs( y[ 1 ] - 16.0 ) < 0.01, 'y[1] approx 16' );
});

test( 'zla_heamv computes y (column-major, lower)', function t() {
	var A = new Complex128Array( new Float64Array([
		2.0,
		0.0,
		1.0,
		-2.0,
		0.0,
		0.0,
		5.0,
		0.0
	]).buffer );
	var x = new Complex128Array( new Float64Array( [ 1.0, 1.0, 2.0, 0.0 ] ).buffer );
	var y = new Float64Array( 2 );
	zla_heamv( 'column-major', 'lower', 2, 1.0, A, 2, x, 1, 0.0, y, 1 );
	assert.ok( Math.abs( y[ 0 ] - 10.0 ) < 0.01, 'y[0] approx 10' );
	assert.ok( Math.abs( y[ 1 ] - 16.0 ) < 0.01, 'y[1] approx 16' );
});
