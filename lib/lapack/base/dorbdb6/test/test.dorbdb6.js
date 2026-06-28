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
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dorbdb6 from './../lib/dorbdb6.js';


// TESTS //

test( 'dorbdb6 is a function', function t() {
	assert.strictEqual( typeof dorbdb6, 'function', 'is a function' );
});

test( 'dorbdb6 has expected arity', function t() {
	assert.strictEqual( dorbdb6.length, 14, 'has expected arity' );
});

test( 'dorbdb6 throws TypeError for invalid order', function t() {
	assert.throws( function throws() {
		dorbdb6( 'invalid', 2, 2, 2, new Float64Array( 2 ), 1, new Float64Array( 2 ), 1, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 2 ), 1 );
	}, TypeError );
});

test( 'dorbdb6 throws RangeError for negative m1', function t() {
	assert.throws( function throws() {
		dorbdb6( 'column-major', -1, 2, 2, new Float64Array( 2 ), 1, new Float64Array( 2 ), 1, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 2 ), 1 );
	}, RangeError );
});

test( 'dorbdb6 throws RangeError for negative m2', function t() {
	assert.throws( function throws() {
		dorbdb6( 'column-major', 2, -1, 2, new Float64Array( 2 ), 1, new Float64Array( 2 ), 1, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 2 ), 1 );
	}, RangeError );
});

test( 'dorbdb6 throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		dorbdb6( 'column-major', 2, 2, -1, new Float64Array( 2 ), 1, new Float64Array( 2 ), 1, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 2 ), 1 );
	}, RangeError );
});

test( 'dorbdb6 throws RangeError for zero strideX1', function t() {
	assert.throws( function throws() {
		dorbdb6( 'column-major', 2, 2, 2, new Float64Array( 2 ), 0, new Float64Array( 2 ), 1, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 2 ), 1 );
	}, RangeError );
});

test( 'dorbdb6 throws RangeError for zero strideX2', function t() {
	assert.throws( function throws() {
		dorbdb6( 'column-major', 2, 2, 2, new Float64Array( 2 ), 1, new Float64Array( 2 ), 0, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 2 ), 1 );
	}, RangeError );
});

test( 'dorbdb6 throws RangeError for LDQ1 too small (column-major)', function t() {
	assert.throws( function throws() {
		dorbdb6( 'column-major', 4, 4, 2, new Float64Array( 4 ), 1, new Float64Array( 4 ), 1, new Float64Array( 8 ), 1, new Float64Array( 8 ), 4, new Float64Array( 2 ), 1 );
	}, RangeError );
});

test( 'dorbdb6 throws RangeError for LDQ2 too small (column-major)', function t() {
	assert.throws( function throws() {
		dorbdb6( 'column-major', 4, 4, 2, new Float64Array( 4 ), 1, new Float64Array( 4 ), 1, new Float64Array( 8 ), 4, new Float64Array( 8 ), 1, new Float64Array( 2 ), 1 );
	}, RangeError );
});

test( 'dorbdb6 throws RangeError for LDQ1 too small (row-major)', function t() {
	assert.throws( function throws() {
		dorbdb6( 'row-major', 2, 2, 4, new Float64Array( 2 ), 1, new Float64Array( 2 ), 1, new Float64Array( 8 ), 1, new Float64Array( 8 ), 4, new Float64Array( 4 ), 1 );
	}, RangeError );
});

test( 'dorbdb6 throws RangeError for LDQ2 too small (row-major)', function t() {
	assert.throws( function throws() {
		dorbdb6( 'row-major', 2, 2, 4, new Float64Array( 2 ), 1, new Float64Array( 2 ), 1, new Float64Array( 8 ), 4, new Float64Array( 8 ), 1, new Float64Array( 4 ), 1 );
	}, RangeError );
});

test( 'dorbdb6 (column-major): basic projection', function t() {
	// Q has 1 orthonormal column = (e1; 0) -> Q1 = [1;0], Q2 = [0;0].
	// X = (3, 4 | 5, 6); after projection X1[0] -= 3*1 = 0.
	var WORK;
	var info;
	var Q1;
	var Q2;
	var X1;
	var X2;

	Q1 = new Float64Array( [ 1.0, 0.0 ] );
	Q2 = new Float64Array( [ 0.0, 0.0 ] );
	X1 = new Float64Array( [ 3.0, 4.0 ] );
	X2 = new Float64Array( [ 5.0, 6.0 ] );
	WORK = new Float64Array( 1 );

	info = dorbdb6( 'column-major', 2, 2, 1, X1, 1, X2, 1, Q1, 2, Q2, 2, WORK, 1 );
	assert.strictEqual( info, 0, 'info' );
	assert.ok( Math.abs( X1[ 0 ] - 0.0 ) < 1e-14, 'X1[0]' );
	assert.ok( Math.abs( X1[ 1 ] - 4.0 ) < 1e-14, 'X1[1]' );
	assert.ok( Math.abs( X2[ 0 ] - 5.0 ) < 1e-14, 'X2[0]' );
	assert.ok( Math.abs( X2[ 1 ] - 6.0 ) < 1e-14, 'X2[1]' );
});

test( 'dorbdb6 (row-major): basic projection', function t() {
	// Same Q as the column-major case, but stored row-major. Since Q has only 1 column it's just a vector, so the layout is irrelevant for values but we exercise the row-major LD branch and stride remapping.
	var WORK;
	var info;
	var Q1;
	var Q2;
	var X1;
	var X2;

	Q1 = new Float64Array( [ 1.0, 0.0 ] );
	Q2 = new Float64Array( [ 0.0, 0.0 ] );
	X1 = new Float64Array( [ 3.0, 4.0 ] );
	X2 = new Float64Array( [ 5.0, 6.0 ] );
	WORK = new Float64Array( 1 );

	info = dorbdb6( 'row-major', 2, 2, 1, X1, 1, X2, 1, Q1, 1, Q2, 1, WORK, 1 );
	assert.strictEqual( info, 0, 'info' );
	assert.ok( Math.abs( X1[ 0 ] - 0.0 ) < 1e-14, 'X1[0]' );
	assert.ok( Math.abs( X1[ 1 ] - 4.0 ) < 1e-14, 'X1[1]' );
});
