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

import __imp0 from './fixtures/basic.json' with { type: 'json' };
import __imp1 from './fixtures/n_zero.json' with { type: 'json' };
import __imp2 from './fixtures/n_one.json' with { type: 'json' };
import __imp3 from './fixtures/identity.json' with { type: 'json' };
import __imp4 from './fixtures/swap.json' with { type: 'json' };
import __imp5 from './fixtures/stride.json' with { type: 'json' };
import __imp6 from './fixtures/neg_stride.json' with { type: 'json' };
import __imp7 from './fixtures/imag_cs.json' with { type: 'json' };
import __imp8 from './fixtures/mixed_stride.json' with { type: 'json' };

import test from 'node:test';
import assert from 'node:assert/strict';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import Complex128 from '@stdlib/complex/float64/ctor/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import zlacrt from './../lib/index.js';
import base from './../lib/ndarray.js';


// FIXTURES //

var fixture = {
	basic: __imp0,
	n_zero: __imp1,
	n_one: __imp2,
	identity: __imp3,
	swap: __imp4,
	stride: __imp5,
	neg_stride: __imp6,
	imag_cs: __imp7,
	mixed_stride: __imp8
};


// FUNCTIONS //

/**
* @private
*/
function assertClose( actual, expected, tol, msg ) {
	var relErr = Math.abs( actual - expected ) / Math.max( Math.abs( expected ), 1.0 );
	assert.ok( relErr <= tol, msg + ': expected ' + expected + ', got ' + actual );
}

/**
* @private
*/
function assertArrayClose( actual, expected, tol, msg ) {
	var i;
	assert.equal( actual.length, expected.length, msg + ': length mismatch' );
	for ( i = 0; i < expected.length; i++ ) {
		assertClose( actual[ i ], expected[ i ], tol, msg + '[' + i + ']' );
	}
}

/**
* @private
*/
function toFloat64( arr ) {
	return Array.prototype.slice.call( reinterpret( arr, 0 ) );
}


// TESTS //

test( 'zlacrt: main export is a function', function t() {
	assert.strictEqual( typeof zlacrt, 'function' );
});

test( 'zlacrt: attached to the main export is an `ndarray` method', function t() {
	assert.strictEqual( typeof zlacrt.ndarray, 'function' );
});

test( 'zlacrt: base is a function', function t() {
	assert.strictEqual( typeof base, 'function' );
});

test( 'zlacrt: basic (N=3, c=(0.6,0.1), s=(0.8,0.2))', function t() {
	var result;
	var tc;
	var cx;
	var cy;
	var c;
	var s;

	tc = fixture.basic;
	cx = new Complex128Array( [ 1.0, 2.0, 3.0, 4.0, 5.0, 6.0 ] );
	cy = new Complex128Array( [ 7.0, 8.0, 9.0, 10.0, 11.0, 12.0 ] );
	c = new Complex128( 0.6, 0.1 );
	s = new Complex128( 0.8, 0.2 );
	result = base( 3, cx, 1, 0, cy, 1, 0, c, s );
	assert.strictEqual( result, cx );
	assertArrayClose( toFloat64( cx ), tc.cx, 1e-14, 'cx' );
	assertArrayClose( toFloat64( cy ), tc.cy, 1e-14, 'cy' );
});

test( 'zlacrt: n=0 is a no-op', function t() {
	var result;
	var tc;
	var cx;
	var cy;
	var c;
	var s;

	tc = fixture.n_zero;
	cx = new Complex128Array( [ 1.0, 2.0 ] );
	cy = new Complex128Array( [ 3.0, 4.0 ] );
	c = new Complex128( 0.6, 0.1 );
	s = new Complex128( 0.8, 0.2 );
	result = base( 0, cx, 1, 0, cy, 1, 0, c, s );
	assert.strictEqual( result, cx );
	assertArrayClose( toFloat64( cx ), tc.cx, 1e-14, 'cx unchanged' );
	assertArrayClose( toFloat64( cy ), tc.cy, 1e-14, 'cy unchanged' );
});

test( 'zlacrt: n=1 with purely imaginary s', function t() {
	var tc;
	var cx;
	var cy;
	var c;
	var s;

	tc = fixture.n_one;
	cx = new Complex128Array( [ 2.0, 3.0 ] );
	cy = new Complex128Array( [ 4.0, 5.0 ] );
	c = new Complex128( 1.0, 0.0 );
	s = new Complex128( 0.0, 1.0 );
	base( 1, cx, 1, 0, cy, 1, 0, c, s );
	assertArrayClose( toFloat64( cx ), tc.cx, 1e-14, 'cx' );
	assertArrayClose( toFloat64( cy ), tc.cy, 1e-14, 'cy' );
});

test( 'zlacrt: identity rotation c=(1,0), s=(0,0)', function t() {
	var tc;
	var cx;
	var cy;
	var c;
	var s;

	tc = fixture.identity;
	cx = new Complex128Array( [ 1.0, 2.0, 3.0, 4.0 ] );
	cy = new Complex128Array( [ 5.0, 6.0, 7.0, 8.0 ] );
	c = new Complex128( 1.0, 0.0 );
	s = new Complex128( 0.0, 0.0 );
	base( 2, cx, 1, 0, cy, 1, 0, c, s );
	assertArrayClose( toFloat64( cx ), tc.cx, 1e-14, 'cx unchanged' );
	assertArrayClose( toFloat64( cy ), tc.cy, 1e-14, 'cy unchanged' );
});

test( 'zlacrt: swap rotation c=(0,0), s=(1,0)', function t() {
	var tc;
	var cx;
	var cy;
	var c;
	var s;

	tc = fixture.swap;
	cx = new Complex128Array( [ 1.0, 2.0, 3.0, 4.0 ] );
	cy = new Complex128Array( [ 5.0, 6.0, 7.0, 8.0 ] );
	c = new Complex128( 0.0, 0.0 );
	s = new Complex128( 1.0, 0.0 );
	base( 2, cx, 1, 0, cy, 1, 0, c, s );
	assertArrayClose( toFloat64( cx ), tc.cx, 1e-14, 'cx = old cy' );
	assertArrayClose( toFloat64( cy ), tc.cy, 1e-14, 'cy = -old cx' );
});

test( 'zlacrt: non-unit strides (incx=2, incy=2)', function t() {
	var tc;
	var cx;
	var cy;
	var c;
	var s;

	tc = fixture.stride;
	cx = new Complex128Array( [ 1.0, 2.0, 99.0, 99.0, 3.0, 4.0, 99.0, 99.0, 5.0, 6.0 ] );
	cy = new Complex128Array( [ 7.0, 8.0, 88.0, 88.0, 9.0, 10.0, 88.0, 88.0, 11.0, 12.0 ] );
	c = new Complex128( 0.6, 0.1 );
	s = new Complex128( 0.8, 0.2 );
	base( 3, cx, 2, 0, cy, 2, 0, c, s );
	assertArrayClose( toFloat64( cx ), tc.cx, 1e-14, 'cx' );
	assertArrayClose( toFloat64( cy ), tc.cy, 1e-14, 'cy' );
});

test( 'zlacrt: negative stride (incx=-1, incy=1)', function t() {
	var tc;
	var cx;
	var cy;
	var c;
	var s;

	// Fortran with incx=-1, n=3: starts at index (-3+1)*(-1)+1 = 3 (1-based) = 2 (0-based)
	tc = fixture.neg_stride;
	cx = new Complex128Array( [ 1.0, 2.0, 3.0, 4.0, 5.0, 6.0 ] );
	cy = new Complex128Array( [ 7.0, 8.0, 9.0, 10.0, 11.0, 12.0 ] );
	c = new Complex128( 0.6, 0.1 );
	s = new Complex128( 0.8, 0.2 );
	base( 3, cx, -1, 2, cy, 1, 0, c, s );
	assertArrayClose( toFloat64( cx ), tc.cx, 1e-14, 'cx' );
	assertArrayClose( toFloat64( cy ), tc.cy, 1e-14, 'cy' );
});

test( 'zlacrt: purely imaginary c and s', function t() {
	var tc;
	var cx;
	var cy;
	var c;
	var s;

	tc = fixture.imag_cs;
	cx = new Complex128Array( [ 1.0, 0.0, 0.0, 1.0 ] );
	cy = new Complex128Array( [ 1.0, 0.0, 0.0, 1.0 ] );
	c = new Complex128( 0.0, 1.0 );
	s = new Complex128( 0.0, 1.0 );
	base( 2, cx, 1, 0, cy, 1, 0, c, s );
	assertArrayClose( toFloat64( cx ), tc.cx, 1e-14, 'cx' );
	assertArrayClose( toFloat64( cy ), tc.cy, 1e-14, 'cy' );
});

test( 'zlacrt: mixed strides (incx=2, incy=-1)', function t() {
	var tc;
	var cx;
	var cy;
	var c;
	var s;

	// Fortran: incx=2, incy=-1, n=2.
	// IX starts at 1 (0-based: 0), stride 2.
	// IY starts at (-2+1)*(-1)+1 = 2 (1-based) = 1 (0-based), stride -1.
	tc = fixture.mixed_stride;
	cx = new Complex128Array( [ 1.0, 1.0, 99.0, 99.0, 2.0, 2.0 ] );
	cy = new Complex128Array( [ 3.0, 3.0, 4.0, 4.0 ] );
	c = new Complex128( 0.5, 0.5 );
	s = new Complex128( 0.5, -0.5 );
	base( 2, cx, 2, 0, cy, -1, 1, c, s );
	assertArrayClose( toFloat64( cx ), tc.cx, 1e-14, 'cx' );
	assertArrayClose( toFloat64( cy ), tc.cy, 1e-14, 'cy' );
});

test( 'zlacrt: throws RangeError for N<0', function t() {
	var cx = new Complex128Array( [ 1.0, 2.0 ] );
	var cy = new Complex128Array( [ 3.0, 4.0 ] );
	var c = new Complex128( 0.6, 0.1 );
	var s = new Complex128( 0.8, 0.2 );
	assert.throws( function() {
		base( -1, cx, 1, 0, cy, 1, 0, c, s );
	}, RangeError );
});

test( 'zlacrt: with offset (offsetX=1, offsetY=1)', function t() {
	var cx;
	var cy;
	var c;
	var s;

	// Pad the arrays and use offset to skip the first element
	cx = new Complex128Array( [ 99.0, 99.0, 1.0, 2.0, 3.0, 4.0 ] );
	cy = new Complex128Array( [ 88.0, 88.0, 5.0, 6.0, 7.0, 8.0 ] );
	c = new Complex128( 1.0, 0.0 );
	s = new Complex128( 0.0, 0.0 );
	base( 2, cx, 1, 1, cy, 1, 1, c, s );

	// Identity rotation: arrays should be unchanged
	assertArrayClose( toFloat64( cx ), [ 99.0, 99.0, 1.0, 2.0, 3.0, 4.0 ], 1e-14, 'cx with offset' );
	assertArrayClose( toFloat64( cy ), [ 88.0, 88.0, 5.0, 6.0, 7.0, 8.0 ], 1e-14, 'cy with offset' );
});

test( 'zlacrt: ndarray wrapper validates N', function t() {
	var cx;
	var cy;
	var c;
	var s;

	cx = new Complex128Array( [ 1.0, 2.0 ] );
	cy = new Complex128Array( [ 3.0, 4.0 ] );
	c = new Complex128( 1.0, 0.0 );
	s = new Complex128( 0.0, 0.0 );
	assert.throws( function throws() {
		zlacrt.ndarray( -1, cx, 1, 0, cy, 1, 0, c, s );
	}, /nonnegative integer/ );
});
