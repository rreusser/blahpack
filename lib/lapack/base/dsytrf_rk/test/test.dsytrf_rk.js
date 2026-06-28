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

/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import dsytrfrk from './../lib/dsytrf_rk.js';


// TESTS //

test( 'dsytrf_rk is a function', function t() {
	assert.strictEqual( typeof dsytrfrk, 'function', 'is a function' );
});

test( 'dsytrf_rk has expected arity', function t() {
	assert.strictEqual( dsytrfrk.length, 9, 'has expected arity' );
});

test( 'dsytrf_rk throws TypeError for invalid order', function t() {
	assert.throws( function throws() {
		dsytrfrk( 'invalid', 'upper', 2, new Float64Array( 4 ), 2, new Float64Array( 2 ), 1, new Int32Array( 2 ), 1 );
	}, TypeError );
});

test( 'dsytrf_rk throws TypeError for invalid uplo', function t() {
	assert.throws( function throws() {
		dsytrfrk( 'row-major', 'invalid', 2, new Float64Array( 4 ), 2, new Float64Array( 2 ), 1, new Int32Array( 2 ), 1 );
	}, TypeError );
});

test( 'dsytrf_rk throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		dsytrfrk( 'row-major', 'upper', -1, new Float64Array( 4 ), 2, new Float64Array( 2 ), 1, new Int32Array( 2 ), 1 );
	}, RangeError );
});

test( 'dsytrf_rk throws RangeError for LDA < max(1,N)', function t() {
	assert.throws( function throws() {
		dsytrfrk( 'column-major', 'upper', 4, new Float64Array( 16 ), 2, new Float64Array( 4 ), 1, new Int32Array( 4 ), 1 );
	}, RangeError );
});

test( 'dsytrf_rk: row-major / column-major produce equivalent factorizations', function t() {
	var info1;
	var info2;
	var ipcm;
	var iprm;
	var Acm;
	var Arm;
	var ecm;
	var erm;
	var i;

	// Build a 4x4 symmetric matrix; lower triangle filled. Column-major and row-major both store the matrix the same way for symmetric data, so factorizing the lower triangle in either layout should produce the same factorization.
	Acm = new Float64Array( [ 4, 1, -2, 0.5, 0, -3, 1, 2, 0, 0, 5, -1, 0, 0, 0, 2 ] ); // eslint-disable-line max-len
	Arm = new Float64Array( [ 4, 0, 0, 0, 1, -3, 0, 0, -2, 1, 5, 0, 0.5, 2, -1, 2 ] ); // eslint-disable-line max-len
	ecm = new Float64Array( 4 );
	erm = new Float64Array( 4 );
	ipcm = new Int32Array( 4 );
	iprm = new Int32Array( 4 );
	info1 = dsytrfrk( 'column-major', 'lower', 4, Acm, 4, ecm, 1, ipcm, 1 );
	info2 = dsytrfrk( 'row-major', 'lower', 4, Arm, 4, erm, 1, iprm, 1 );
	assert.equal( info1, info2, 'info matches' );
	assert.equal( info1, 0, 'info=0' );
	for ( i = 0; i < 4; i++ ) {
		assert.equal( ipcm[ i ], iprm[ i ], 'ipiv[' + i + ']' );
		assert.ok( Math.abs( ecm[ i ] - erm[ i ] ) < 1e-13, 'e[' + i + ']' );
	}
});
