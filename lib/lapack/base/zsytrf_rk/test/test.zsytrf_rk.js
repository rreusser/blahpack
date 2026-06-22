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

/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import zsytrfrk from './../lib/zsytrf_rk.js';


// TESTS //

test( 'zsytrf_rk is a function', function t() {
	assert.strictEqual( typeof zsytrfrk, 'function', 'is a function' );
});

test( 'zsytrf_rk has expected arity', function t() {
	assert.strictEqual( zsytrfrk.length, 9, 'has expected arity' );
});

test( 'zsytrf_rk throws TypeError for invalid order', function t() {
	assert.throws( function throws() {
		zsytrfrk( 'invalid', 'upper', 2, new Complex128Array( 4 ), 2, new Complex128Array( 2 ), 1, new Int32Array( 2 ), 1 );
	}, TypeError );
});

test( 'zsytrf_rk throws TypeError for invalid uplo', function t() {
	assert.throws( function throws() {
		zsytrfrk( 'row-major', 'invalid', 2, new Complex128Array( 4 ), 2, new Complex128Array( 2 ), 1, new Int32Array( 2 ), 1 );
	}, TypeError );
});

test( 'zsytrf_rk throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		zsytrfrk( 'row-major', 'upper', -1, new Complex128Array( 4 ), 2, new Complex128Array( 2 ), 1, new Int32Array( 2 ), 1 );
	}, RangeError );
});

test( 'zsytrf_rk throws RangeError for LDA < max(1,N)', function t() {
	assert.throws( function throws() {
		zsytrfrk( 'column-major', 'upper', 4, new Complex128Array( 16 ), 2, new Complex128Array( 4 ), 1, new Int32Array( 4 ), 1 );
	}, RangeError );
});

test( 'zsytrf_rk: row-major / column-major produce equivalent factorizations', function t() {
	var info1;
	var info2;
	var ipcm;
	var iprm;
	var Acm;
	var Arm;
	var ecm;
	var erm;
	var av;
	var rv;
	var i;

	// Build a 4x4 complex symmetric matrix; lower triangle filled. Column-major and row-major both store the matrix the same way for symmetric data, so factorizing the lower triangle in either layout should produce the same factorization.
	Acm = new Complex128Array( [ 4, 0.2, 1, -0.3, -2, 0.1, 0.5, 0, 0, 0, -3, 0.5, 1, 0.4, 2, -0.1, 0, 0, 0, 0, 5, -0.2, -1, 0.3, 0, 0, 0, 0, 0, 0, 2, 0.5 ] ); // eslint-disable-line max-len
	Arm = new Complex128Array( [ 4, 0.2, 0, 0, 0, 0, 0, 0, 1, -0.3, -3, 0.5, 0, 0, 0, 0, -2, 0.1, 1, 0.4, 5, -0.2, 0, 0, 0.5, 0, 2, -0.1, -1, 0.3, 2, 0.5 ] ); // eslint-disable-line max-len
	ecm = new Complex128Array( 4 );
	erm = new Complex128Array( 4 );
	ipcm = new Int32Array( 4 );
	iprm = new Int32Array( 4 );
	info1 = zsytrfrk( 'column-major', 'lower', 4, Acm, 4, ecm, 1, ipcm, 1 );
	info2 = zsytrfrk( 'row-major', 'lower', 4, Arm, 4, erm, 1, iprm, 1 );
	assert.equal( info1, info2, 'info matches' );
	assert.equal( info1, 0, 'info=0' );
	av = reinterpret( ecm, 0 );
	rv = reinterpret( erm, 0 );
	for ( i = 0; i < 4; i++ ) {
		assert.equal( ipcm[ i ], iprm[ i ], 'ipiv[' + i + ']' );
		assert.ok( Math.abs( av[ 2*i ] - rv[ 2*i ] ) < 1e-13, 'e[' + i + '].re' );
		assert.ok( Math.abs( av[ ( 2*i ) + 1 ] - rv[ ( 2*i ) + 1 ] ) < 1e-13, 'e[' + i + '].im' );
	}
});
