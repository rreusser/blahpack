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

/* eslint-disable no-restricted-syntax, stdlib/first-unit-test, max-len, max-statements */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import ztpqrt2 from './../lib/ztpqrt2.js';


// FUNCTIONS //

/**
* Builds a Complex128Array from an interleaved real/imag pair list.
*
* @private
* @param {Array<number>} arr - interleaved real/imag pairs
* @returns {Complex128Array} packed array
*/
function packC( arr ) {
	var out;
	out = new Complex128Array( arr.length / 2 );
	reinterpret( out, 0 ).set( arr );
	return out;
}

/**
* Builds the column-major test inputs for the small complex case (M=N=L=3).
*
* @private
* @returns {Object} `{ A, B, T }`
*/
function buildColMajor() {
	var out;
	out = {};
	out.A = packC([
		2.0,
		0.1,
		0.0,
		0.0,
		0.0,
		0.0,
		0.5,
		-0.2,
		3.0,
		0.3,
		0.0,
		0.0,
		0.25,
		0.2,
		0.75,
		-0.1,
		4.0,
		0.4
	]);
	out.B = packC([
		1.1,
		0.5,
		0.0,
		0.0,
		0.0,
		0.0,
		0.4,
		-0.3,
		1.5,
		0.2,
		0.0,
		0.0,
		0.6,
		0.1,
		0.3,
		-0.4,
		1.7,
		0.3
	]);
	out.T = new Complex128Array( 9 );
	return out;
}

/**
* Builds the row-major test inputs for the small complex case (M=N=L=3).
*
* @private
* @returns {Object} `{ A, B, T }`
*/
function buildRowMajor() {
	var out;
	out = {};
	out.A = packC([
		2.0,
		0.1,
		0.5,
		-0.2,
		0.25,
		0.2,
		0.0,
		0.0,
		3.0,
		0.3,
		0.75,
		-0.1,
		0.0,
		0.0,
		0.0,
		0.0,
		4.0,
		0.4
	]);
	out.B = packC([
		1.1,
		0.5,
		0.4,
		-0.3,
		0.6,
		0.1,
		0.0,
		0.0,
		1.5,
		0.2,
		0.3,
		-0.4,
		0.0,
		0.0,
		0.0,
		0.0,
		1.7,
		0.3
	]);
	out.T = new Complex128Array( 9 );
	return out;
}


// TESTS //

test( 'ztpqrt2 is a function', function t() {
	assert.strictEqual( typeof ztpqrt2, 'function', 'is a function' );
});

test( 'ztpqrt2 has expected arity', function t() {
	assert.strictEqual( ztpqrt2.length, 10, 'has expected arity' );
});

test( 'ztpqrt2 throws TypeError for invalid order', function t() {
	assert.throws( function bad() {
		ztpqrt2( 'invalid', 2, 2, 2, new Complex128Array( 4 ), 2, new Complex128Array( 4 ), 2, new Complex128Array( 4 ), 2 );
	}, TypeError );
});

test( 'ztpqrt2 throws RangeError for negative M', function t() {
	assert.throws( function bad() {
		ztpqrt2( 'row-major', -1, 2, 2, new Complex128Array( 4 ), 2, new Complex128Array( 4 ), 2, new Complex128Array( 4 ), 2 );
	}, RangeError );
});

test( 'ztpqrt2 throws RangeError for negative N', function t() {
	assert.throws( function bad() {
		ztpqrt2( 'row-major', 2, -1, 2, new Complex128Array( 4 ), 2, new Complex128Array( 4 ), 2, new Complex128Array( 4 ), 2 );
	}, RangeError );
});

test( 'ztpqrt2 throws RangeError for invalid l (negative)', function t() {
	assert.throws( function bad() {
		ztpqrt2( 'row-major', 2, 2, -1, new Complex128Array( 4 ), 2, new Complex128Array( 4 ), 2, new Complex128Array( 4 ), 2 );
	}, RangeError );
});

test( 'ztpqrt2 throws RangeError for invalid l (> min(M,N))', function t() {
	assert.throws( function bad() {
		ztpqrt2( 'row-major', 2, 2, 5, new Complex128Array( 4 ), 2, new Complex128Array( 4 ), 2, new Complex128Array( 4 ), 2 );
	}, RangeError );
});

test( 'ztpqrt2 throws RangeError for LDA too small', function t() {
	assert.throws( function bad() {
		ztpqrt2( 'column-major', 2, 3, 2, new Complex128Array( 9 ), 1, new Complex128Array( 6 ), 2, new Complex128Array( 9 ), 3 );
	}, RangeError );
});

test( 'ztpqrt2 throws RangeError for LDB too small (column-major)', function t() {
	assert.throws( function bad() {
		ztpqrt2( 'column-major', 3, 2, 2, new Complex128Array( 4 ), 2, new Complex128Array( 6 ), 2, new Complex128Array( 4 ), 2 );
	}, RangeError );
});

test( 'ztpqrt2 throws RangeError for LDB too small (row-major)', function t() {
	assert.throws( function bad() {
		ztpqrt2( 'row-major', 3, 2, 2, new Complex128Array( 4 ), 2, new Complex128Array( 6 ), 1, new Complex128Array( 4 ), 2 );
	}, RangeError );
});

test( 'ztpqrt2 throws RangeError for LDT too small', function t() {
	assert.throws( function bad() {
		ztpqrt2( 'row-major', 2, 3, 2, new Complex128Array( 9 ), 3, new Complex128Array( 6 ), 3, new Complex128Array( 9 ), 1 );
	}, RangeError );
});

test( 'ztpqrt2 column-major: produces R, V, T (small complex case)', function t() {
	var info;
	var inp;
	var Av;
	inp = buildColMajor();
	info = ztpqrt2( 'column-major', 3, 3, 3, inp.A, 3, inp.B, 3, inp.T, 3 );
	Av = reinterpret( inp.A, 0 );
	assert.strictEqual( info, 0 );

	// Diagonal of R should be non-zero (Householder produces non-zero diagonal).
	assert.ok( ( Math.abs( Av[ 0 ] ) + Math.abs( Av[ 1 ] ) ) > 0 );
	assert.ok( ( Math.abs( Av[ 8 ] ) + Math.abs( Av[ 9 ] ) ) > 0 );
	assert.ok( ( Math.abs( Av[ 16 ] ) + Math.abs( Av[ 17 ] ) ) > 0 );
});

test( 'ztpqrt2 row-major: produces R, V, T (small complex case)', function t() {
	var info;
	var inp;
	var Av;
	inp = buildRowMajor();
	info = ztpqrt2( 'row-major', 3, 3, 3, inp.A, 3, inp.B, 3, inp.T, 3 );
	Av = reinterpret( inp.A, 0 );
	assert.strictEqual( info, 0 );
	assert.ok( ( Math.abs( Av[ 0 ] ) + Math.abs( Av[ 1 ] ) ) > 0 );
});
