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
import dormr3 from './../lib/index.js';


// TESTS //

test( 'main export is a function', function t() {
	assert.strictEqual( typeof dormr3, 'function', 'main export is a function' );
});

test( 'main export has an ndarray method', function t() {
	assert.strictEqual( typeof dormr3.ndarray, 'function', 'has ndarray method' );
});

test( 'main: quick return when M=0', function t() {
	var WORK;
	var info;
	var TAU;
	var A;
	var C;

	A = new Float64Array( 4 );
	TAU = new Float64Array( 2 );
	C = new Float64Array( 1 );
	WORK = new Float64Array( 1 );
	info = dormr3( 'column-major', 'left', 'no-transpose', 0, 2, 0, 0, A, 2, TAU, 1, C, 1, WORK, 1 ); // eslint-disable-line max-len
	assert.strictEqual( info, 0, 'returns INFO=0' );
});

test( 'main: quick return when N=0', function t() {
	var WORK;
	var info;
	var TAU;
	var A;
	var C;

	A = new Float64Array( 4 );
	TAU = new Float64Array( 2 );
	C = new Float64Array( 1 );
	WORK = new Float64Array( 1 );
	info = dormr3( 'column-major', 'left', 'no-transpose', 2, 0, 0, 0, A, 2, TAU, 1, C, 2, WORK, 1 ); // eslint-disable-line max-len
	assert.strictEqual( info, 0, 'returns INFO=0' );
});

test( 'main: quick return when K=0 leaves C unchanged', function t() {
	var Cexpected;
	var WORK;
	var info;
	var TAU;
	var A;
	var C;

	A = new Float64Array( 4 );
	TAU = new Float64Array( 2 );
	C = new Float64Array([ 1, 2, 3, 4 ]);
	Cexpected = new Float64Array([ 1, 2, 3, 4 ]);
	WORK = new Float64Array( 2 );
	info = dormr3( 'column-major', 'left', 'no-transpose', 2, 2, 0, 0, A, 2, TAU, 1, C, 2, WORK, 1 ); // eslint-disable-line max-len
	assert.strictEqual( info, 0, 'returns INFO=0' );
	assert.deepStrictEqual( C, Cexpected, 'C unchanged' );
});

test( 'main: ndarray method is the ndarray wrapper', function t() {
	var WORK;
	var info;
	var TAU;
	var A;
	var C;

	A = new Float64Array( 4 );
	TAU = new Float64Array( 2 );
	C = new Float64Array( 4 );
	WORK = new Float64Array( 2 );
	info = dormr3.ndarray( 'left', 'no-transpose', 2, 2, 0, 0, A, 1, 2, 0, TAU, 1, 0, C, 1, 2, 0, WORK, 1, 0 ); // eslint-disable-line max-len
	assert.strictEqual( info, 0, 'returns INFO=0' );
});
