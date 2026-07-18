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
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import zlag2c from './../lib/zlag2c.js';


// TESTS //

test( 'zlag2c is a function', function t() {
	assert.strictEqual( typeof zlag2c, 'function', 'is a function' );
});

test( 'zlag2c has expected arity', function t() {
	assert.strictEqual( zlag2c.length, 7, 'has expected arity' );
});

test( 'zlag2c throws TypeError for invalid order', function t() {
	assert.throws( function throwsBad() {
		zlag2c( 'invalid', 2, 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2 );
	}, TypeError );
});

test( 'zlag2c throws RangeError for negative M', function t() {
	assert.throws( function throwsBad() {
		zlag2c( 'row-major', -1, 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2 );
	}, RangeError );
});

test( 'zlag2c throws RangeError for negative N', function t() {
	assert.throws( function throwsBad() {
		zlag2c( 'row-major', 2, -1, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2 );
	}, RangeError );
});

test( 'zlag2c throws RangeError for small LDA (column-major)', function t() {
	const A = new Complex128Array( 4 );
	const SA = new Complex128Array( 4 );
	assert.throws( function throwsBad() {
		zlag2c( 'column-major', 3, 2, A, 2, SA, 3 );
	}, RangeError );
});

test( 'zlag2c throws RangeError for small LDA (row-major)', function t() {
	const A = new Complex128Array( 4 );
	const SA = new Complex128Array( 4 );
	assert.throws( function throwsBad() {
		zlag2c( 'row-major', 2, 3, A, 2, SA, 3 );
	}, RangeError );
});

test( 'zlag2c throws RangeError for small LDSA (column-major)', function t() {
	const A = new Complex128Array( 9 );
	const SA = new Complex128Array( 9 );
	assert.throws( function throwsBad() {
		zlag2c( 'column-major', 3, 2, A, 3, SA, 2 );
	}, RangeError );
});

test( 'zlag2c throws RangeError for small LDSA (row-major)', function t() {
	const A = new Complex128Array( 9 );
	const SA = new Complex128Array( 9 );
	assert.throws( function throwsBad() {
		zlag2c( 'row-major', 2, 3, A, 3, SA, 2 );
	}, RangeError );
});

test( 'zlag2c: column-major basic conversion', function t() {
	const M = 2;
	const N = 2;
	const LDA = 2;
	const LDSA = 2;
	const A = new Complex128Array( LDA * N );
	const v = reinterpret( A, 0 );
	v[ 0 ] = 1.5;
	v[ 1 ] = -0.25;
	v[ 2 ] = 2.5;
	v[ 3 ] = 1.75;
	v[ 4 ] = 3.5;
	v[ 5 ] = -2.25;
	v[ 6 ] = 4.5;
	v[ 7 ] = 0.125;
	const SA = new Complex128Array( LDSA * N );
	const info = zlag2c( 'column-major', M, N, A, LDA, SA, LDSA );
	assert.equal( info, 0, 'info' );
	const sv = reinterpret( SA, 0 );
	assert.equal( sv[ 0 ], Math.fround( 1.5 ), 're[0,0]' );
	assert.equal( sv[ 1 ], Math.fround( -0.25 ), 'im[0,0]' );
	assert.equal( sv[ 6 ], Math.fround( 4.5 ), 're[1,1]' );
	assert.equal( sv[ 7 ], Math.fround( 0.125 ), 'im[1,1]' );
});

test( 'zlag2c: row-major basic conversion', function t() {
	const M = 2;
	const N = 2;
	const LDA = 2;
	const LDSA = 2;
	const A = new Complex128Array( M * LDA );
	const v = reinterpret( A, 0 );
	v[ 0 ] = 1.0;
	v[ 1 ] = 2.0;
	v[ 2 ] = 3.0;
	v[ 3 ] = 4.0;
	v[ 4 ] = 5.0;
	v[ 5 ] = 6.0;
	v[ 6 ] = 7.0;
	v[ 7 ] = 8.0;
	const SA = new Complex128Array( M * LDSA );
	const info = zlag2c( 'row-major', M, N, A, LDA, SA, LDSA );
	assert.equal( info, 0, 'info' );
	const sv = reinterpret( SA, 0 );
	assert.equal( sv[ 0 ], Math.fround( 1.0 ), 're[0,0]' );
	assert.equal( sv[ 7 ], Math.fround( 8.0 ), 'im[1,1]' );
});

test( 'zlag2c: overflow returns 1 in wrapper', function t() {
	const A = new Complex128Array( 4 );
	const v = reinterpret( A, 0 );
	v[ 0 ] = 1e300;
	v[ 1 ] = 0;
	const SA = new Complex128Array( 4 );
	const info = zlag2c( 'column-major', 2, 2, A, 2, SA, 2 );
	assert.equal( info, 1, 'info' );
});
