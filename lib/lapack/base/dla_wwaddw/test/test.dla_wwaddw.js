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
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dla_wwaddw from './../lib/dla_wwaddw.js';


// TESTS //

test( 'main export is a function', function t() {
	assert.strictEqual( typeof dla_wwaddw, 'function', 'is a function' );
});

test( 'dla_wwaddw has expected arity', function t() {
	assert.strictEqual( dla_wwaddw.length, 7, 'has expected arity' );
});

test( 'dla_wwaddw throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		dla_wwaddw( -1, new Float64Array( 4 ), 1, new Float64Array( 4 ), 1, new Float64Array( 4 ), 1 );
	}, RangeError );
});

test( 'dla_wwaddw quick return for N=0 leaves arrays untouched', function t() {
	var x = new Float64Array( [ 1.0, 2.0 ] );
	var y = new Float64Array( [ 0.1, 0.2 ] );
	var w = new Float64Array( [ 5.0, 6.0 ] );
	dla_wwaddw( 0, x, 1, y, 1, w, 1 );
	assert.equal( x[ 0 ], 1.0 );
	assert.equal( x[ 1 ], 2.0 );
	assert.equal( y[ 0 ], 0.1 );
	assert.equal( y[ 1 ], 0.2 );
});

test( 'dla_wwaddw returns the X array', function t() {
	var out;
	var x;
	var y;
	var w;
	x = new Float64Array( [ 1.0, 2.0, 3.0 ] );
	y = new Float64Array( [ 0.1, 0.2, 0.3 ] );
	w = new Float64Array( [ 0.5, 0.5, 0.5 ] );
	out = dla_wwaddw( 3, x, 1, y, 1, w, 1 );
	assert.strictEqual( out, x );
});

test( 'dla_wwaddw preserves (X+Y)+W invariant', function t() {
	var before;
	var after;
	var rel;
	var n;
	var x;
	var y;
	var w;
	var i;
	n = 4;
	x = new Float64Array( [ 1.0e8, 2.0e8, 3.0e8, 4.0e8 ] );
	y = new Float64Array( [ 1.0e-4, 2.0e-4, 3.0e-4, 4.0e-4 ] );
	w = new Float64Array( [ 7.0, 8.0, 9.0, 10.0 ] );
	before = new Float64Array( n );
	for ( i = 0; i < n; i++ ) {
		before[ i ] = ( x[ i ] + y[ i ] ) + w[ i ];
	}
	dla_wwaddw( n, x, 1, y, 1, w, 1 );
	for ( i = 0; i < n; i++ ) {
		after = x[ i ] + y[ i ];
		rel = Math.abs( after - before[ i ] ) / Math.abs( before[ i ] );
		assert.ok( rel < 1e-14, 'invariant failed at ' + i );
	}
});

test( 'dla_wwaddw with negative stride', function t() {
	var x = new Float64Array( [ 1.0, 2.0, 3.0 ] );
	var y = new Float64Array( [ 0.1, 0.2, 0.3 ] );
	var w = new Float64Array( [ 10.0, 20.0, 30.0 ] );
	dla_wwaddw( 3, x, -1, y, -1, w, -1 );

	// x should be mutated (accumulator updated)
	assert.notEqual( x[ 0 ], 1.0 );
});
