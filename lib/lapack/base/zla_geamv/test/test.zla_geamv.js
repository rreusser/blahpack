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

/* eslint-disable no-restricted-syntax, stdlib/first-unit-test, camelcase, max-len */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import zla_geamv from './../lib/zla_geamv.js';


// TESTS //

test( 'zla_geamv is a function', function t() {
	assert.strictEqual( typeof zla_geamv, 'function', 'is a function' );
});

test( 'zla_geamv has expected arity', function t() {
	assert.strictEqual( zla_geamv.length, 12, 'has expected arity' );
});

test( 'zla_geamv throws TypeError for invalid order', function t() {
	assert.throws( function throws() {
		zla_geamv( 'bogus', 'no-transpose', 2, 2, 1.0, new Complex128Array( 4 ), 2, new Complex128Array( 2 ), 1, 0.0, new Float64Array( 2 ), 1 );
	}, /invalid argument/ );
});

test( 'zla_geamv throws TypeError for invalid trans', function t() {
	assert.throws( function throws() {
		zla_geamv( 'row-major', 'bogus', 2, 2, 1.0, new Complex128Array( 4 ), 2, new Complex128Array( 2 ), 1, 0.0, new Float64Array( 2 ), 1 );
	}, /invalid argument/ );
});

test( 'zla_geamv throws RangeError for negative M', function t() {
	assert.throws( function throws() {
		zla_geamv( 'row-major', 'no-transpose', -1, 2, 1.0, new Complex128Array( 4 ), 2, new Complex128Array( 2 ), 1, 0.0, new Float64Array( 2 ), 1 );
	}, /invalid argument/ );
});

test( 'zla_geamv throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		zla_geamv( 'row-major', 'no-transpose', 2, -1, 1.0, new Complex128Array( 4 ), 2, new Complex128Array( 2 ), 1, 0.0, new Float64Array( 2 ), 1 );
	}, /invalid argument/ );
});

test( 'zla_geamv throws RangeError for invalid LDA (row-major)', function t() {
	assert.throws( function throws() {
		zla_geamv( 'row-major', 'no-transpose', 3, 3, 1.0, new Complex128Array( 9 ), 1, new Complex128Array( 3 ), 1, 0.0, new Float64Array( 3 ), 1 );
	}, /invalid argument/ );
});

test( 'zla_geamv throws RangeError for invalid LDA (column-major)', function t() {
	assert.throws( function throws() {
		zla_geamv( 'column-major', 'no-transpose', 3, 3, 1.0, new Complex128Array( 9 ), 1, new Complex128Array( 3 ), 1, 0.0, new Float64Array( 3 ), 1 );
	}, /invalid argument/ );
});

test( 'zla_geamv computes column-major no-transpose result (real inputs)', function t() {
	// A (column-major, LDA=3), all real entries; CABS1 reduces to abs.
	//   [ 1 -2  3 ]
	//   [-4  5 -6 ]
	//   [ 7 -8  9 ]
	var A = new Complex128Array([
		1.0,
		0.0,
		-4.0,
		0.0,
		7.0,
		0.0,
		-2.0,
		0.0,
		5.0,
		0.0,
		-8.0,
		0.0,
		3.0,
		0.0,
		-6.0,
		0.0,
		9.0,
		0.0
	]);
	var x = new Complex128Array([
		1.0,
		0.0,
		-2.0,
		0.0,
		3.0,
		0.0
	]);
	var y = new Float64Array([
		0.0,
		0.0,
		0.0
	]);
	zla_geamv( 'column-major', 'no-transpose', 3, 3, 1.0, A, 3, x, 1, 0.0, y, 1 );

	// Expected: |A|*|x| = [14, 32, 50]
	assert.ok( Math.abs( y[ 0 ] - 14.0 ) < 1e-14 );
	assert.ok( Math.abs( y[ 1 ] - 32.0 ) < 1e-14 );
	assert.ok( Math.abs( y[ 2 ] - 50.0 ) < 1e-14 );
});

test( 'zla_geamv computes row-major transpose with complex inputs', function t() {
	// A row-major, 2x2: row 0 = [(1,1),(2,-1)], row 1 = [(0,3),(4,0)]
	var A = new Complex128Array([
		1.0,
		1.0,
		2.0,
		-1.0,
		0.0,
		3.0,
		4.0,
		0.0
	]);
	var x = new Complex128Array([
		1.0,
		0.0,
		0.0,
		1.0
	]);
	var y = new Float64Array([
		0.0,
		0.0
	]);
	zla_geamv( 'row-major', 'transpose', 2, 2, 1.0, A, 2, x, 1, 0.0, y, 1 );

	// |A^T| = [[2, 3], [3, 4]] applied to |x| = [1, 1]

	// y[0] = 2 + 3 = 5; y[1] = 3 + 4 = 7
	assert.ok( Math.abs( y[ 0 ] - 5.0 ) < 1e-12 );
	assert.ok( Math.abs( y[ 1 ] - 7.0 ) < 1e-12 );
});

test( 'zla_geamv quick return (M=0)', function t() {
	var y = new Float64Array([
		5.0,
		6.0
	]);
	zla_geamv( 'column-major', 'no-transpose', 0, 2, 1.0, new Complex128Array( 0 ), 1, new Complex128Array( 2 ), 1, 0.0, y, 1 );
	assert.strictEqual( y[ 0 ], 5.0 );
	assert.strictEqual( y[ 1 ], 6.0 );
});
