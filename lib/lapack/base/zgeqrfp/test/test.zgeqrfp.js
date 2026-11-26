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
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import zgeqrfp from './../lib/zgeqrfp.js';
import zgeqrfpNd from './../lib/ndarray.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';


// TESTS //

test( 'zgeqrfp is a function', function t() {
	assert.strictEqual( typeof zgeqrfp, 'function', 'is a function' );
});

test( 'zgeqrfp has expected arity', function t() {
	assert.strictEqual( zgeqrfp.length, 8, 'has expected arity' );
});

test( 'zgeqrfp throws TypeError for invalid order', function t() {
	assert.throws( function throws() {
		zgeqrfp( 'invalid', 2, 2, new Complex128Array( 4 ), 2, new Complex128Array( 2 ), 1, new Complex128Array( 4 ) );
	}, TypeError );
});

test( 'zgeqrfp throws RangeError for negative M', function t() {
	assert.throws( function throws() {
		zgeqrfp( 'row-major', -1, 2, new Complex128Array( 4 ), 2, new Complex128Array( 2 ), 1, new Complex128Array( 4 ) );
	}, RangeError );
});

test( 'zgeqrfp throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		zgeqrfp( 'row-major', 2, -1, new Complex128Array( 4 ), 2, new Complex128Array( 2 ), 1, new Complex128Array( 4 ) );
	}, RangeError );
});

test( 'zgeqrfp throws RangeError for small LDA (row-major)', function t() {
	assert.throws( function throws() {
		zgeqrfp( 'row-major', 2, 2, new Complex128Array( 4 ), 1, new Complex128Array( 2 ), 1, new Complex128Array( 4 ) );
	}, RangeError );
});

test( 'zgeqrfp throws RangeError for small LDA (column-major)', function t() {
	assert.throws( function throws() {
		zgeqrfp( 'column-major', 2, 2, new Complex128Array( 4 ), 1, new Complex128Array( 2 ), 1, new Complex128Array( 4 ) );
	}, RangeError );
});

test( 'zgeqrfp: row-major layout factors successfully', function t() {

	const a = new Complex128Array([
		1,
		0,
		2,
		1,
		3,
		0,
		4,
		2
	]);
	const tau = new Complex128Array( 2 );
	const work = new Complex128Array( 32 );
	const info = zgeqrfp( 'row-major', 2, 2, a, 2, tau, 1, work );
	assert.strictEqual( info, 0, 'row-major info=0' );
});

test( 'zgeqrfp: column-major layout factors successfully', function t() {

	const a = new Complex128Array([
		1,
		0,
		2,
		1,
		3,
		0,
		4,
		2
	]);
	const tau = new Complex128Array( 2 );
	const work = new Complex128Array( 32 );
	const info = zgeqrfp( 'column-major', 2, 2, a, 2, tau, 1, work );
	assert.strictEqual( info, 0, 'column-major info=0' );
});


test( 'zgeqrfp allocates the optimal WORK when WORK is null (70x70, blocked)', function t() {
	const A = new Complex128Array( 70 * 70 );
	let i;
	const Av = reinterpret( A, 0 );
	for ( i = 0; i < 2 * 70 * 70; i++ ) {
		Av[ i ] = Math.sin( ( 0.37 * i ) + 1.0 ) + ( ( i % ( 2 * 71 ) === 0 ) ? 4.0 : 0.0 );
	}
	const B = new Complex128Array( A );
	const TAU = new Complex128Array( 70 );
	const TAU2 = new Complex128Array( 70 );
	const info = zgeqrfp( 'column-major', 70, 70, A, 70, TAU, 1, null );
	assert.strictEqual( info, 0 );
	zgeqrfpNd( 70, 70, B, 1, 70, 0, TAU2, 1, 0, new Complex128Array( 70 * 32 ), 1, 0 );
	assert.deepStrictEqual( reinterpret( A, 0 ), reinterpret( B, 0 ) );
	assert.deepStrictEqual( reinterpret( TAU, 0 ), reinterpret( TAU2, 0 ) );
});
