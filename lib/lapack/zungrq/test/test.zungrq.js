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

/* eslint-disable no-restricted-syntax */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import zungrq from './../lib/zungrq.js';
import ndarray from './../lib/ndarray.js';


// TESTS //

test( 'zungrq is a function', function t() {
	assert.strictEqual( typeof zungrq, 'function', 'is a function' );
});

test( 'zungrq has expected arity', function t() {
	assert.strictEqual( zungrq.length, 9, 'has expected arity' );
});

test( 'zungrq throws TypeError for invalid order', function t() {
	assert.throws( function throws() {
		zungrq( 'invalid', 2, 2, 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ) ); // eslint-disable-line max-len
	}, TypeError );
});

test( 'zungrq throws RangeError for negative M', function t() {
	assert.throws( function throws() {
		zungrq( 'row-major', -1, 2, 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ) ); // eslint-disable-line max-len
	}, RangeError );
});

test( 'zungrq throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		zungrq( 'row-major', 2, -1, 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ) ); // eslint-disable-line max-len
	}, RangeError );
});

test( 'zungrq throws RangeError for negative K', function t() {
	assert.throws( function throws() {
		zungrq( 'row-major', 2, 2, -1, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ) ); // eslint-disable-line max-len
	}, RangeError );
});

test( 'zungrq allocates M*NB workspace elements for the blocked path when WORK is null (ticket 0074)', function t() {
	var expected;
	var actual;
	var TAU;
	var ev;
	var av;
	var A;
	var n;
	var i;

	// K = 140 > NX = 128 takes the blocked path, which needs M*NB workspace elements (not M):
	n = 140;
	A = new Float64Array( 2 * n * n );
	for ( i = 0; i < A.length; i++ ) {
		A[ i ] = ( ( ( i * 37 ) % 101 ) / 101.0 ) - 0.5;
	}
	TAU = new Float64Array( 2 * n );
	for ( i = 0; i < TAU.length; i++ ) {
		TAU[ i ] = ( ( ( i * 13 ) % 17 ) / 17.0 ) + 0.1;
	}
	TAU = new Complex128Array( TAU );
	expected = new Complex128Array( A );
	ndarray( n, n, n, expected, 1, n, 0, TAU, 1, 0, new Complex128Array( n * 64 ), 1, 0 );
	actual = new Complex128Array( A );
	zungrq( 'column-major', n, n, n, actual, n, TAU, 1, null );
	ev = reinterpret( expected, 0 );
	av = reinterpret( actual, 0 );
	for ( i = 0; i < ev.length; i++ ) {
		assert.ok( !Number.isNaN( ev[ i ] ), 'expected is finite' );
		assert.strictEqual( av[ i ], ev[ i ], 'A[' + i + ']' );
	}
});
