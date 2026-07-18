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
import Float64Array from '@stdlib/array/float64/lib/index.js';
import zgsvj1 from './../lib/zgsvj1.js';


// VARIABLES //

const EPS = 2.220446049250313e-16;
const SFMIN = 2.2250738585072014e-308;
const TOL = 1.0e-10;


// TESTS //

test( 'zgsvj1 is a function', function t() {
	assert.strictEqual( typeof zgsvj1, 'function', 'is a function' );
});

test( 'zgsvj1 has expected arity', function t() {
	assert.strictEqual( zgsvj1.length, 20, 'has expected arity' );
});

test( 'zgsvj1 throws TypeError for invalid order', function t() {
	assert.throws( function throws() {
		zgsvj1( 'invalid', 'no-v', 2, 2, 1, new Complex128Array( 4 ), 2, new Complex128Array( 2 ), 1, new Float64Array( 2 ), 1, 0, new Complex128Array( 1 ), 1, EPS, SFMIN, TOL, 1, new Complex128Array( 2 ), 1 );
	}, TypeError );
});

test( 'zgsvj1 throws TypeError for invalid jobv', function t() {
	assert.throws( function throws() {
		zgsvj1( 'column-major', 'invalid', 2, 2, 1, new Complex128Array( 4 ), 2, new Complex128Array( 2 ), 1, new Float64Array( 2 ), 1, 0, new Complex128Array( 1 ), 1, EPS, SFMIN, TOL, 1, new Complex128Array( 2 ), 1 );
	}, TypeError );
});

test( 'zgsvj1 throws RangeError for negative M', function t() {
	assert.throws( function throws() {
		zgsvj1( 'column-major', 'no-v', -1, 2, 1, new Complex128Array( 4 ), 2, new Complex128Array( 2 ), 1, new Float64Array( 2 ), 1, 0, new Complex128Array( 1 ), 1, EPS, SFMIN, TOL, 1, new Complex128Array( 2 ), 1 );
	}, RangeError );
});

test( 'zgsvj1 throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		zgsvj1( 'column-major', 'no-v', 2, -1, 1, new Complex128Array( 4 ), 2, new Complex128Array( 2 ), 1, new Float64Array( 2 ), 1, 0, new Complex128Array( 1 ), 1, EPS, SFMIN, TOL, 1, new Complex128Array( 2 ), 1 );
	}, RangeError );
});

test( 'zgsvj1 throws RangeError for LDA < M (column-major)', function t() {
	assert.throws( function throws() {
		zgsvj1( 'column-major', 'no-v', 4, 2, 1, new Complex128Array( 8 ), 2, new Complex128Array( 2 ), 1, new Float64Array( 2 ), 1, 0, new Complex128Array( 1 ), 1, EPS, SFMIN, TOL, 1, new Complex128Array( 4 ), 1 );
	}, RangeError );
});

test( 'zgsvj1 throws RangeError for LDA < N (row-major)', function t() {
	assert.throws( function throws() {
		zgsvj1( 'row-major', 'no-v', 2, 4, 1, new Complex128Array( 8 ), 2, new Complex128Array( 4 ), 1, new Float64Array( 4 ), 1, 0, new Complex128Array( 1 ), 1, EPS, SFMIN, TOL, 1, new Complex128Array( 2 ), 1 );
	}, RangeError );
});

test( 'zgsvj1 throws RangeError for LDV < M (column-major)', function t() {
	assert.throws( function throws() {
		zgsvj1( 'column-major', 'compute-v', 4, 2, 1, new Complex128Array( 8 ), 4, new Complex128Array( 2 ), 1, new Float64Array( 2 ), 1, 0, new Complex128Array( 4 ), 1, EPS, SFMIN, TOL, 1, new Complex128Array( 4 ), 1 );
	}, RangeError );
});

test( 'zgsvj1 throws RangeError for LDV < N (row-major)', function t() {
	assert.throws( function throws() {
		zgsvj1( 'row-major', 'compute-v', 2, 4, 1, new Complex128Array( 8 ), 4, new Complex128Array( 4 ), 1, new Float64Array( 4 ), 1, 0, new Complex128Array( 8 ), 1, EPS, SFMIN, TOL, 1, new Complex128Array( 2 ), 1 );
	}, RangeError );
});

test( 'zgsvj1 column-major with N=1 returns valid info', function t() {
	const a = new Complex128Array( [ 3, 0, 4, 0, 0, 0 ] );
	const d = new Complex128Array( [ 1, 0 ] );
	const sva = new Float64Array( [ 5 ] );
	const V = new Complex128Array( 9 );
	const work = new Complex128Array( 3 );
	const info = zgsvj1( 'column-major', 'no-v', 3, 1, 0, a, 3, d, 1, sva, 1, 0, V, 3, EPS, SFMIN, TOL, 2, work, 1 );
	assert.equal( typeof info, 'number', 'returns a number' );
});

test( 'zgsvj1 row-major basic call', function t() {
	const a = new Complex128Array( 4 );
	const d = new Complex128Array( [ 1, 0, 1, 0 ] );
	const sva = new Float64Array( [ 1, 1 ] );
	const V = new Complex128Array( 4 );
	const work = new Complex128Array( 2 );
	const info = zgsvj1( 'row-major', 'no-v', 2, 2, 1, a, 2, d, 1, sva, 1, 0, V, 2, EPS, SFMIN, TOL, 1, work, 1 );
	assert.equal( typeof info, 'number', 'returns a number' );
});
