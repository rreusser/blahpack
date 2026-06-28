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
import dlaswlq from './../lib/dlaswlq.js';


// TESTS //

test( 'dlaswlq is a function', function t() {
	assert.strictEqual( typeof dlaswlq, 'function', 'is a function' );
});

test( 'dlaswlq has expected arity', function t() {
	assert.strictEqual( dlaswlq.length, 10, 'has expected arity' );
});

test( 'dlaswlq throws TypeError for invalid order', function t() {
	assert.throws( function throws() {
		dlaswlq( 'invalid', 2, 4, 2, 4, new Float64Array( 8 ), 2, new Float64Array( 8 ), 2, new Float64Array( 4 ) ); // eslint-disable-line max-len
	}, TypeError );
});

test( 'dlaswlq throws RangeError for negative M', function t() {
	assert.throws( function throws() {
		dlaswlq( 'column-major', -1, 2, 2, 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ) ); // eslint-disable-line max-len
	}, RangeError );
});

test( 'dlaswlq throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		dlaswlq( 'column-major', 2, -1, 2, 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ) ); // eslint-disable-line max-len
	}, RangeError );
});

test( 'dlaswlq throws RangeError for N < M', function t() {
	assert.throws( function throws() {
		dlaswlq( 'column-major', 4, 2, 2, 2, new Float64Array( 8 ), 4, new Float64Array( 8 ), 2, new Float64Array( 8 ) ); // eslint-disable-line max-len
	}, RangeError );
});

test( 'dlaswlq throws RangeError for mb < 1', function t() {
	assert.throws( function throws() {
		dlaswlq( 'column-major', 2, 4, 0, 2, new Float64Array( 8 ), 2, new Float64Array( 4 ), 1, new Float64Array( 4 ) ); // eslint-disable-line max-len
	}, RangeError );
});

test( 'dlaswlq throws RangeError for mb > M', function t() {
	assert.throws( function throws() {
		dlaswlq( 'column-major', 2, 4, 3, 2, new Float64Array( 8 ), 2, new Float64Array( 12 ), 3, new Float64Array( 6 ) ); // eslint-disable-line max-len
	}, RangeError );
});

test( 'dlaswlq throws RangeError for nb < 0', function t() {
	assert.throws( function throws() {
		dlaswlq( 'column-major', 2, 4, 2, -1, new Float64Array( 8 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ) ); // eslint-disable-line max-len
	}, RangeError );
});

test( 'dlaswlq throws RangeError for LDA < M (column-major)', function t() {
	assert.throws( function throws() {
		dlaswlq( 'column-major', 3, 4, 2, 4, new Float64Array( 12 ), 2, new Float64Array( 12 ), 2, new Float64Array( 6 ) ); // eslint-disable-line max-len
	}, RangeError );
});

test( 'dlaswlq throws RangeError for LDA < N (row-major)', function t() {
	assert.throws( function throws() {
		dlaswlq( 'row-major', 2, 4, 2, 4, new Float64Array( 8 ), 2, new Float64Array( 8 ), 2, new Float64Array( 4 ) ); // eslint-disable-line max-len
	}, RangeError );
});

test( 'dlaswlq throws RangeError for LDT < mb', function t() {
	assert.throws( function throws() {
		dlaswlq( 'column-major', 2, 4, 2, 4, new Float64Array( 8 ), 2, new Float64Array( 4 ), 1, new Float64Array( 4 ) ); // eslint-disable-line max-len
	}, RangeError );
});

test( 'dlaswlq returns 0 for a basic blocked TSLQ (column-major)', function t() {
	var WORK;
	var info;
	var A;
	var T;

	// M=3, N=8, MB=2, NB=4 -> blocked TSLQ; NUMBLK = ceil(5/1) = 5; T cols = 5*M = 15.
	A = new Float64Array( 3 * 8 );
	T = new Float64Array( 2 * 5 * 3 );
	WORK = new Float64Array( 2 * 3 );
	info = dlaswlq( 'column-major', 3, 8, 2, 4, A, 3, T, 2, WORK );
	assert.strictEqual( info, 0, 'INFO is 0' );
});
