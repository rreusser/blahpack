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
import dlag2s from './../lib/dlag2s.js';


// TESTS //

test( 'dlag2s is a function', function t() {
	assert.strictEqual( typeof dlag2s, 'function', 'is a function' );
});

test( 'dlag2s has expected arity', function t() {
	assert.strictEqual( dlag2s.length, 7, 'has expected arity' );
});

test( 'dlag2s throws TypeError for invalid order', function t() {
	assert.throws( function throws() {
		dlag2s( 'invalid', 2, 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2 );
	}, TypeError );
});

test( 'dlag2s throws RangeError for negative M', function t() {
	assert.throws( function throws() {
		dlag2s( 'row-major', -1, 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2 );
	}, RangeError );
});

test( 'dlag2s throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		dlag2s( 'row-major', 2, -1, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2 );
	}, RangeError );
});

test( 'dlag2s throws RangeError for LDA < max(1,M) in column-major', function t() {
	assert.throws( function throws() {
		dlag2s( 'column-major', 3, 2, new Float64Array( 6 ), 2, new Float64Array( 6 ), 3 );
	}, RangeError );
});

test( 'dlag2s throws RangeError for LDSA < max(1,M) in column-major', function t() {
	assert.throws( function throws() {
		dlag2s( 'column-major', 3, 2, new Float64Array( 6 ), 3, new Float64Array( 6 ), 2 );
	}, RangeError );
});

test( 'dlag2s throws RangeError for LDA < max(1,N) in row-major', function t() {
	assert.throws( function throws() {
		dlag2s( 'row-major', 2, 3, new Float64Array( 6 ), 2, new Float64Array( 6 ), 3 );
	}, RangeError );
});

test( 'dlag2s throws RangeError for LDSA < max(1,N) in row-major', function t() {
	assert.throws( function throws() {
		dlag2s( 'row-major', 2, 3, new Float64Array( 6 ), 3, new Float64Array( 6 ), 2 );
	}, RangeError );
});

test( 'dlag2s column-major converts a 2x2 matrix', function t() {
	var info;
	var SA;
	var A;
	A = new Float64Array( [ 1.5, 2.5, -3.75, 4.125 ] );
	SA = new Float64Array( 4 );
	info = dlag2s( 'column-major', 2, 2, A, 2, SA, 2 );
	assert.strictEqual( info, 0, 'info' );
	assert.strictEqual( SA[ 0 ], 1.5 );
	assert.strictEqual( SA[ 1 ], 2.5 );
	assert.strictEqual( SA[ 2 ], -3.75 );
	assert.strictEqual( SA[ 3 ], 4.125 );
});

test( 'dlag2s row-major converts a 2x3 matrix', function t() {
	var info;
	var SA;
	var A;
	A = new Float64Array( [ 1.0, 2.0, 3.0, 4.0, 5.0, 6.0 ] );
	SA = new Float64Array( 6 );
	info = dlag2s( 'row-major', 2, 3, A, 3, SA, 3 );
	assert.strictEqual( info, 0, 'info' );
	assert.strictEqual( SA[ 0 ], 1.0 );
	assert.strictEqual( SA[ 5 ], 6.0 );
});

test( 'dlag2s returns info=1 on overflow', function t() {
	var info;
	var SA;
	var A;
	A = new Float64Array( [ 1.0, 1.0e40, 3.0, 4.0 ] );
	SA = new Float64Array( 4 );
	info = dlag2s( 'column-major', 2, 2, A, 2, SA, 2 );
	assert.strictEqual( info, 1, 'overflow' );
});
