/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

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

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dlarfgp from './../lib/dlarfgp.js';


// TESTS //

test( 'dlarfgp is a function', function t() {
	assert.strictEqual( typeof dlarfgp, 'function', 'is a function' );
});

test( 'dlarfgp has expected arity', function t() {
	assert.strictEqual( dlarfgp.length, 7, 'has expected arity' );
});

test( 'dlarfgp throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		dlarfgp( -1, new Float64Array( 1 ), 0, new Float64Array( 1 ), 1, new Float64Array( 1 ), 0 ); // eslint-disable-line max-len
	}, RangeError );
});

test( 'dlarfgp: basic call via wrapper produces non-negative beta', function t() {
	var alpha = new Float64Array( [ 3.0 ] );
	var tau = new Float64Array( 1 );
	var x = new Float64Array( [ 4.0, 0.0, 0.0 ] );

	dlarfgp( 4, alpha, 0, x, 1, tau, 0 );

	assert.ok( alpha[ 0 ] >= 0.0, 'beta non-negative' );
	assert.ok( tau[ 0 ] >= 0.0 && tau[ 0 ] <= 2.0, 'tau in [0, 2]' );
});

test( 'dlarfgp: N=0 quick return via wrapper', function t() {
	var alpha = new Float64Array( [ 5.0 ] );
	var tau = new Float64Array( [ 99.0 ] );
	var x = new Float64Array( 1 );
	dlarfgp( 0, alpha, 0, x, 1, tau, 0 );
	assert.strictEqual( alpha[ 0 ], 5.0 );
	assert.strictEqual( tau[ 0 ], 0.0 );
});
