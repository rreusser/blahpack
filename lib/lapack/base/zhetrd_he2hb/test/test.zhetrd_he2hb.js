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
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import zhetrd_he2hb from './../lib/zhetrd_he2hb.js';


// TESTS //

test( 'zhetrd_he2hb is a function', function t() {
	assert.strictEqual( typeof zhetrd_he2hb, 'function', 'is a function' );
});

test( 'zhetrd_he2hb has expected arity', function t() {
	assert.strictEqual( zhetrd_he2hb.length, 12, 'has expected arity' );
});

test( 'zhetrd_he2hb throws TypeError for invalid order', function t() {
	assert.throws( function throws() {
		zhetrd_he2hb( 'invalid', 'upper', 2, 1, new Complex128Array( 4 ), 2, new Complex128Array( 4 ), 2, new Complex128Array( 1 ), 1, null, 1 );
	}, TypeError );
});

test( 'zhetrd_he2hb throws TypeError for invalid uplo', function t() {
	assert.throws( function throws() {
		zhetrd_he2hb( 'column-major', 'invalid', 2, 1, new Complex128Array( 4 ), 2, new Complex128Array( 4 ), 2, new Complex128Array( 1 ), 1, null, 1 );
	}, TypeError );
});

test( 'zhetrd_he2hb throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		zhetrd_he2hb( 'column-major', 'upper', -1, 1, new Complex128Array( 4 ), 2, new Complex128Array( 4 ), 2, new Complex128Array( 1 ), 1, null, 1 );
	}, RangeError );
});

test( 'zhetrd_he2hb throws RangeError for negative kd', function t() {
	assert.throws( function throws() {
		zhetrd_he2hb( 'column-major', 'upper', 2, -1, new Complex128Array( 4 ), 2, new Complex128Array( 4 ), 2, new Complex128Array( 1 ), 1, null, 1 );
	}, RangeError );
});

test( 'zhetrd_he2hb throws RangeError for LDA < max(1,N)', function t() {
	assert.throws( function throws() {
		zhetrd_he2hb( 'column-major', 'upper', 4, 1, new Complex128Array( 16 ), 1, new Complex128Array( 8 ), 2, new Complex128Array( 3 ), 1, null, 1 );
	}, RangeError );
});

test( 'zhetrd_he2hb throws RangeError for LDAB < kd+1', function t() {
	assert.throws( function throws() {
		zhetrd_he2hb( 'column-major', 'upper', 4, 2, new Complex128Array( 16 ), 4, new Complex128Array( 8 ), 2, new Complex128Array( 2 ), 1, null, 1 );
	}, RangeError );
});

test( 'zhetrd_he2hb accepts a caller-provided WORK buffer', function t() {
	var info;
	var WORK;
	var TAU;
	var AB;
	var kd;
	var nb;
	var A;
	var N;

	N = 8;
	kd = 3;
	nb = 32;
	A = new Complex128Array( N * N );
	AB = new Complex128Array( ( kd + 1 ) * N );
	TAU = new Complex128Array( N - kd );
	WORK = new Complex128Array( ( N * kd ) + ( N * nb ) + ( 2 * kd * kd ) );

	info = zhetrd_he2hb( 'column-major', 'lower', N, kd, A, N, AB, kd+1, TAU, 1, WORK, 1 );
	assert.equal( info, 0, 'info' );
});

test( 'zhetrd_he2hb returns 0 for the quick-return N=2, kd=1 case (column-major, lower)', function t() {
	var info;
	var TAU;
	var abr;
	var AB;
	var kd;
	var A;
	var N;

	N = 2;
	kd = 1;
	A = new Complex128Array( [ 4.0, 0.0, 1.0, -1.0, 1.0, 1.0, 5.0, 0.0 ] );
	AB = new Complex128Array( ( kd + 1 ) * N );
	TAU = new Complex128Array( 1 );
	info = zhetrd_he2hb( 'column-major', 'lower', N, kd, A, N, AB, kd+1, TAU, 1, null, 1 );
	assert.equal( info, 0, 'info' );

	// Lower band copies the diagonal and sub-diagonal columns of A into AB rows 0 and 1:
	abr = reinterpret( AB, 0 );
	assert.equal( abr[ 0 ], 4.0, 'AB[0,0].re' );
	assert.equal( abr[ 1 ], 0.0, 'AB[0,0].im' );
	assert.equal( abr[ 2 ], 1.0, 'AB[1,0].re' );
	assert.equal( abr[ 3 ], -1.0, 'AB[1,0].im' );
});
