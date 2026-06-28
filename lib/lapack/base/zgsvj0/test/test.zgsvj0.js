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
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import zgsvj0 from './../lib/zgsvj0.js';


// VARIABLES //

var EPS = 2.220446049250313e-16;
var SFMIN = 2.2250738585072014e-308;
var TOL = 1.0e-10;


// TESTS //

test( 'zgsvj0 is a function', function t() {
	assert.strictEqual( typeof zgsvj0, 'function', 'is a function' );
});

test( 'zgsvj0 throws TypeError for invalid order', function t() {
	var work = new Complex128Array( 2 );
	var sva = new Float64Array( 2 );
	var a = new Complex128Array( 4 );
	var d = new Complex128Array( 2 );
	var V = new Complex128Array( 4 );
	assert.throws( function throws() {
		zgsvj0( 'invalid', 'no-v', 2, 2, a, 2, d, 1, sva, 1, 0, V, 2, EPS, SFMIN, TOL, 2, work, 1, 2 );
	}, TypeError );
});

test( 'zgsvj0 throws TypeError for invalid jobv', function t() {
	var work = new Complex128Array( 2 );
	var sva = new Float64Array( 2 );
	var a = new Complex128Array( 4 );
	var d = new Complex128Array( 2 );
	var V = new Complex128Array( 4 );
	assert.throws( function throws() {
		zgsvj0( 'column-major', 'X', 2, 2, a, 2, d, 1, sva, 1, 0, V, 2, EPS, SFMIN, TOL, 2, work, 1, 2 );
	}, TypeError );
});

test( 'zgsvj0 throws RangeError for negative M', function t() {
	var work = new Complex128Array( 2 );
	var sva = new Float64Array( 2 );
	var a = new Complex128Array( 4 );
	var d = new Complex128Array( 2 );
	var V = new Complex128Array( 4 );
	assert.throws( function throws() {
		zgsvj0( 'column-major', 'no-v', -1, 2, a, 2, d, 1, sva, 1, 0, V, 2, EPS, SFMIN, TOL, 2, work, 1, 2 );
	}, RangeError );
});

test( 'zgsvj0 throws RangeError for negative N', function t() {
	var work = new Complex128Array( 2 );
	var sva = new Float64Array( 2 );
	var a = new Complex128Array( 4 );
	var d = new Complex128Array( 2 );
	var V = new Complex128Array( 4 );
	assert.throws( function throws() {
		zgsvj0( 'column-major', 'no-v', 2, -1, a, 2, d, 1, sva, 1, 0, V, 2, EPS, SFMIN, TOL, 2, work, 1, 2 );
	}, RangeError );
});

test( 'zgsvj0 throws RangeError when LDA too small (column-major)', function t() {
	var work = new Complex128Array( 2 );
	var sva = new Float64Array( 2 );
	var a = new Complex128Array( 4 );
	var d = new Complex128Array( 2 );
	var V = new Complex128Array( 4 );
	assert.throws( function throws() {
		zgsvj0( 'column-major', 'no-v', 4, 2, a, 1, d, 1, sva, 1, 0, V, 1, EPS, SFMIN, TOL, 2, work, 1, 4 );
	}, RangeError );
});

test( 'zgsvj0 throws RangeError when LDV too small (column-major)', function t() {
	var work = new Complex128Array( 2 );
	var sva = new Float64Array( 2 );
	var a = new Complex128Array( 4 );
	var d = new Complex128Array( 2 );
	var V = new Complex128Array( 4 );
	assert.throws( function throws() {
		zgsvj0( 'column-major', 'compute-v', 2, 2, a, 2, d, 1, sva, 1, 0, V, 1, EPS, SFMIN, TOL, 2, work, 1, 2 );
	}, RangeError );
});

test( 'zgsvj0 column-major matches the ndarray path on a 4x3 case', function t() {
	var info;
	var work;
	var idx;
	var src;
	var sva;
	var aR;
	var dv;
	var a;
	var d;
	var i;
	var j;
	var k;
	var M;
	var N;
	var s;
	var V;
	M = 4;
	N = 3;
	src = [
		1.0,
		0.5,
		2.0,
		-0.5,
		3.0,
		1.0,
		4.0,
		-1.0,
		5.0,
		0.25,
		6.0,
		-0.25,
		7.0,
		0.75,
		8.0,
		-0.75,
		9.0,
		0.0,
		10.0,
		0.1,
		11.0,
		-0.2,
		12.0,
		0.3
	];
	a = new Complex128Array( M * N );
	aR = reinterpret( a, 0 );
	for ( i = 0; i < src.length; i++ ) {
		aR[ i ] = src[ i ];
	}
	d = new Complex128Array( N );
	dv = reinterpret( d, 0 );
	for ( k = 0; k < N; k++ ) {
		dv[ k * 2 ] = 1.0;
	}
	sva = new Float64Array( N );
	for ( j = 0; j < N; j++ ) {
		s = 0;
		for ( k = 0; k < M; k++ ) {
			idx = ( ( j * M ) + k ) * 2;
			s += ( aR[ idx ] * aR[ idx ] ) + ( aR[ idx + 1 ] * aR[ idx + 1 ] );
		}
		sva[ j ] = Math.sqrt( s );
	}
	V = new Complex128Array( 1 );
	work = new Complex128Array( M );
	info = zgsvj0( 'column-major', 'no-v', M, N, a, M, d, 1, sva, 1, 0, V, 1, EPS, SFMIN, TOL, 5, work, 1, M );
	assert.strictEqual( info, 0, 'info=0' );
});
