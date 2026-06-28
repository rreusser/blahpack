/**
* @license Apache-2.0
*
* Copyright (c) 2026 Ricky Reusser.
*
* Derived from the LAPACK 3.12.0 reference implementation (BSD-3-Clause).
*/

/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */


// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js'; // eslint-disable-line max-len
import zlag2c from './../lib/index.js';


// TESTS //

test( 'main export is a function', function t() {
	assert.strictEqual( typeof zlag2c, 'function', 'main export is a function' );
});

test( 'main export has an ndarray method', function t() {
	assert.strictEqual( typeof zlag2c.ndarray, 'function', 'has ndarray method' );
});

test( 'main export performs a basic conversion', function t() {
	var info;
	var A;
	var v;
	var SA;
	var sv;
	A = new Complex128Array( 4 );
	v = reinterpret( A, 0 );
	v[ 0 ] = 1.5;
	v[ 1 ] = -2.25;
	v[ 2 ] = 3.125;
	v[ 3 ] = 4.0;
	v[ 4 ] = -0.5;
	v[ 5 ] = 0.75;
	v[ 6 ] = 100.0;
	v[ 7 ] = -200.0;
	SA = new Complex128Array( 4 );
	info = zlag2c( 'column-major', 2, 2, A, 2, SA, 2 );
	assert.strictEqual( info, 0, 'info is zero' );
	sv = reinterpret( SA, 0 );
	assert.strictEqual( sv[ 0 ], Math.fround( 1.5 ), 'element [0,0] re' );
	assert.strictEqual( sv[ 7 ], Math.fround( -200.0 ), 'element [1,1] im' );
});

test( 'main export reports overflow via INFO=1', function t() {
	var info;
	var A;
	var v;
	var SA;
	A = new Complex128Array( 1 );
	v = reinterpret( A, 0 );
	v[ 0 ] = 1e300;
	v[ 1 ] = 0;
	SA = new Complex128Array( 1 );
	info = zlag2c( 'column-major', 1, 1, A, 1, SA, 1 );
	assert.strictEqual( info, 1, 'info is one on overflow' );
});

test( 'ndarray method performs a basic conversion', function t() {
	var info;
	var A;
	var v;
	var SA;
	var sv;
	A = new Complex128Array( 2 );
	v = reinterpret( A, 0 );
	v[ 0 ] = 2.5;
	v[ 1 ] = -1.25;
	v[ 2 ] = 0.75;
	v[ 3 ] = 3.0;
	SA = new Complex128Array( 2 );
	info = zlag2c.ndarray( 1, 2, A, 1, 1, 0, SA, 1, 1, 0 );
	assert.strictEqual( info, 0, 'info is zero' );
	sv = reinterpret( SA, 0 );
	assert.strictEqual( sv[ 0 ], Math.fround( 2.5 ), 'element [0,0] re' );
	assert.strictEqual( sv[ 3 ], Math.fround( 3.0 ), 'element [0,1] im' );
});
