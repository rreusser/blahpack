/**
* @license Apache-2.0
*
* Copyright (c) 2025 The Stdlib Authors.
*/

/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dgsvj1 from './../lib/dgsvj1.js';


// VARIABLES //

var EPS = 2.220446049250313e-16;
var SFMIN = 2.2250738585072014e-308;
var TOL = 1.0e-10;


// TESTS //

test( 'dgsvj1 is a function', function t() {
	assert.strictEqual( typeof dgsvj1, 'function', 'is a function' );
});

test( 'dgsvj1 has expected arity', function t() {
	assert.strictEqual( dgsvj1.length, 21, 'has expected arity' );
});

test( 'dgsvj1 throws TypeError for invalid order', function t() {
	assert.throws( function throws() {
		dgsvj1( 'invalid', 'no-v', 2, 2, 1, new Float64Array( 4 ), 2, new Float64Array( 2 ), 1, new Float64Array( 2 ), 1, 0, new Float64Array( 1 ), 1, EPS, SFMIN, TOL, 1, new Float64Array( 2 ), 1, 2 );
	}, TypeError );
});

test( 'dgsvj1 throws TypeError for invalid jobv', function t() {
	assert.throws( function throws() {
		dgsvj1( 'column-major', 'invalid', 2, 2, 1, new Float64Array( 4 ), 2, new Float64Array( 2 ), 1, new Float64Array( 2 ), 1, 0, new Float64Array( 1 ), 1, EPS, SFMIN, TOL, 1, new Float64Array( 2 ), 1, 2 );
	}, TypeError );
});

test( 'dgsvj1 throws RangeError for negative M', function t() {
	assert.throws( function throws() {
		dgsvj1( 'column-major', 'no-v', -1, 2, 1, new Float64Array( 4 ), 2, new Float64Array( 2 ), 1, new Float64Array( 2 ), 1, 0, new Float64Array( 1 ), 1, EPS, SFMIN, TOL, 1, new Float64Array( 2 ), 1, 2 );
	}, RangeError );
});

test( 'dgsvj1 throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		dgsvj1( 'column-major', 'no-v', 2, -1, 1, new Float64Array( 4 ), 2, new Float64Array( 2 ), 1, new Float64Array( 2 ), 1, 0, new Float64Array( 1 ), 1, EPS, SFMIN, TOL, 1, new Float64Array( 2 ), 1, 2 );
	}, RangeError );
});

test( 'dgsvj1 throws RangeError for LDA < M (column-major)', function t() {
	assert.throws( function throws() {
		dgsvj1( 'column-major', 'no-v', 4, 2, 1, new Float64Array( 8 ), 2, new Float64Array( 2 ), 1, new Float64Array( 2 ), 1, 0, new Float64Array( 1 ), 1, EPS, SFMIN, TOL, 1, new Float64Array( 4 ), 1, 4 );
	}, RangeError );
});

test( 'dgsvj1 throws RangeError for LDA < N (row-major)', function t() {
	assert.throws( function throws() {
		dgsvj1( 'row-major', 'no-v', 2, 4, 1, new Float64Array( 8 ), 2, new Float64Array( 4 ), 1, new Float64Array( 4 ), 1, 0, new Float64Array( 1 ), 1, EPS, SFMIN, TOL, 1, new Float64Array( 2 ), 1, 2 );
	}, RangeError );
});

test( 'dgsvj1 throws RangeError for LDV < M (column-major)', function t() {
	assert.throws( function throws() {
		dgsvj1( 'column-major', 'compute-v', 4, 2, 1, new Float64Array( 8 ), 4, new Float64Array( 2 ), 1, new Float64Array( 2 ), 1, 0, new Float64Array( 4 ), 1, EPS, SFMIN, TOL, 1, new Float64Array( 4 ), 1, 4 );
	}, RangeError );
});

test( 'dgsvj1 throws RangeError for LDV < N (row-major)', function t() {
	assert.throws( function throws() {
		dgsvj1( 'row-major', 'compute-v', 2, 4, 1, new Float64Array( 8 ), 4, new Float64Array( 4 ), 1, new Float64Array( 4 ), 1, 0, new Float64Array( 8 ), 1, EPS, SFMIN, TOL, 1, new Float64Array( 2 ), 1, 2 );
	}, RangeError );
});

test( 'dgsvj1 column-major with N=1 returns valid info', function t() {
	var info;
	var work;
	var sva;
	var V;
	var d;
	var a;
	a = new Float64Array( [ 3, 4, 0 ] );
	d = new Float64Array( [ 1 ] );
	sva = new Float64Array( [ 5 ] );
	V = new Float64Array( 9 );
	work = new Float64Array( 3 );
	info = dgsvj1( 'column-major', 'no-v', 3, 1, 0, a, 3, d, 1, sva, 1, 0, V, 3, EPS, SFMIN, TOL, 2, work, 1, 3 );
	assert.equal( typeof info, 'number', 'returns a number' );
});
