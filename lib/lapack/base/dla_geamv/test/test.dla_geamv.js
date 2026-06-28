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
import dla_geamv from './../lib/dla_geamv.js';


// TESTS //

test( 'dla_geamv is a function', function t() {
	assert.strictEqual( typeof dla_geamv, 'function', 'is a function' );
});

test( 'dla_geamv has expected arity', function t() {
	assert.strictEqual( dla_geamv.length, 12, 'has expected arity' );
});

test( 'dla_geamv throws for invalid order', function t() {
	assert.throws( function throws() {
		dla_geamv( 'bogus', 'no-transpose', 2, 2, 1.0, new Float64Array( 4 ), 2, new Float64Array( 2 ), 1, 0.0, new Float64Array( 2 ), 1 );
	}, /invalid argument/ );
});

test( 'dla_geamv throws for invalid trans', function t() {
	assert.throws( function throws() {
		dla_geamv( 'row-major', 'bogus', 2, 2, 1.0, new Float64Array( 4 ), 2, new Float64Array( 2 ), 1, 0.0, new Float64Array( 2 ), 1 );
	}, /invalid argument/ );
});

test( 'dla_geamv throws for negative M', function t() {
	assert.throws( function throws() {
		dla_geamv( 'row-major', 'no-transpose', -1, 2, 1.0, new Float64Array( 4 ), 2, new Float64Array( 2 ), 1, 0.0, new Float64Array( 2 ), 1 );
	}, /invalid argument/ );
});

test( 'dla_geamv throws for negative N', function t() {
	assert.throws( function throws() {
		dla_geamv( 'row-major', 'no-transpose', 2, -1, 1.0, new Float64Array( 4 ), 2, new Float64Array( 2 ), 1, 0.0, new Float64Array( 2 ), 1 );
	}, /invalid argument/ );
});

test( 'dla_geamv throws for invalid LDA (row-major)', function t() {
	assert.throws( function throws() {
		dla_geamv( 'row-major', 'no-transpose', 3, 3, 1.0, new Float64Array( 9 ), 1, new Float64Array( 3 ), 1, 0.0, new Float64Array( 3 ), 1 );
	}, /invalid argument/ );
});

test( 'dla_geamv throws for invalid LDA (column-major)', function t() {
	assert.throws( function throws() {
		dla_geamv( 'column-major', 'no-transpose', 3, 3, 1.0, new Float64Array( 9 ), 1, new Float64Array( 3 ), 1, 0.0, new Float64Array( 3 ), 1 );
	}, /invalid argument/ );
});

test( 'dla_geamv computes column-major no-transpose result', function t() {
	// A (column-major, LDA=3):
	//   [ 1 -2  3 ]
	//   [-4  5 -6 ]
	//   [ 7 -8  9 ]
	var A = new Float64Array( [ 1.0, -4.0, 7.0, -2.0, 5.0, -8.0, 3.0, -6.0, 9.0 ] );
	var x = new Float64Array( [ 1.0, -2.0, 3.0 ] );
	var y = new Float64Array( [ 0.0, 0.0, 0.0 ] );

	dla_geamv( 'column-major', 'no-transpose', 3, 3, 1.0, A, 3, x, 1, 0.0, y, 1 );

	// Expected: |A|*|x| = [14, 32, 50]
	assert.ok( Math.abs( y[ 0 ] - 14.0 ) < 1e-14 );
	assert.ok( Math.abs( y[ 1 ] - 32.0 ) < 1e-14 );
	assert.ok( Math.abs( y[ 2 ] - 50.0 ) < 1e-14 );
});

test( 'dla_geamv computes row-major transpose result', function t() {
	// Row-major LDA=3: row 0 = [1,-2,3], row 1 = [-4,5,-6], row 2 = [7,-8,9]
	var A = new Float64Array( [ 1.0, -2.0, 3.0, -4.0, 5.0, -6.0, 7.0, -8.0, 9.0 ] );
	var x = new Float64Array( [ 1.0, -2.0, 3.0 ] );
	var y = new Float64Array( [ 0.0, 0.0, 0.0 ] );

	dla_geamv( 'row-major', 'transpose', 3, 3, 1.0, A, 3, x, 1, 0.0, y, 1 );

	// Transpose: |A^T|*|x|; column 0 of A = [1,-4,7] so y[0] = 1+8+21 = 30.
	assert.ok( Math.abs( y[ 0 ] - 30.0 ) < 1e-14 );
	assert.ok( Math.abs( y[ 1 ] - 36.0 ) < 1e-14 );
	assert.ok( Math.abs( y[ 2 ] - 42.0 ) < 1e-14 );
});

test( 'dla_geamv quick return (M=0)', function t() {
	var y = new Float64Array( [ 5.0, 6.0 ] );
	dla_geamv( 'column-major', 'no-transpose', 0, 2, 1.0, new Float64Array( 0 ), 1, new Float64Array( 2 ), 1, 0.0, y, 1 );
	assert.strictEqual( y[ 0 ], 5.0 );
	assert.strictEqual( y[ 1 ], 6.0 );
});
