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

/* eslint-disable no-restricted-syntax, stdlib/first-unit-test, max-len */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dtpmqrt from './../lib/dtpmqrt.js';
import { assertNullWorkspaceSufficient, values } from './../../../../../test/harness/nullwork.js';


// TESTS //

test( 'dtpmqrt is a function', function t() {
	assert.strictEqual( typeof dtpmqrt, 'function', 'is a function' );
});

test( 'dtpmqrt has expected arity', function t() {
	assert.strictEqual( dtpmqrt.length, 17, 'has expected arity' );
});

test( 'dtpmqrt throws TypeError for invalid order', function t() {
	assert.throws( function throws() {
		dtpmqrt( 'invalid', 'left', 'no-transpose', 2, 2, 2, 2, 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ) );
	}, TypeError );
});

test( 'dtpmqrt throws TypeError for invalid side', function t() {
	assert.throws( function throws() {
		dtpmqrt( 'row-major', 'invalid', 'no-transpose', 2, 2, 2, 2, 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ) );
	}, TypeError );
});

test( 'dtpmqrt throws TypeError for invalid trans', function t() {
	assert.throws( function throws() {
		dtpmqrt( 'row-major', 'left', 'invalid', 2, 2, 2, 2, 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ) );
	}, TypeError );
});

test( 'dtpmqrt throws RangeError for negative M', function t() {
	assert.throws( function throws() {
		dtpmqrt( 'row-major', 'left', 'no-transpose', -1, 2, 2, 2, 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ) );
	}, RangeError );
});

test( 'dtpmqrt throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		dtpmqrt( 'row-major', 'left', 'no-transpose', 2, -1, 2, 2, 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ) );
	}, RangeError );
});

test( 'dtpmqrt throws RangeError for negative K', function t() {
	assert.throws( function throws() {
		dtpmqrt( 'row-major', 'left', 'no-transpose', 2, 2, -1, 2, 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ) );
	}, RangeError );
});

// CONVENTIONS D5c (ticket 0060): with WORK = null the wrapper must allocate a
// sufficient workspace, so results are identical to an ample caller buffer.
test( 'dtpmqrt: WORK = null allocates a sufficient workspace (both sides)', function t() {
	const M = 5;
	const N = 4;
	const K = 3;
	[ 'left', 'right' ].forEach( function each( side ) {
		const nq = ( side === 'left' ) ? M : N;
		assertNullWorkspaceSufficient( dtpmqrt, function args() {
			return [ 'column-major', side, 'no-transpose', M, N, K, 1, 2, values( nq * K, 1 ), nq, values( 2 * K, 3 ), 2, values( ( side === 'left' ) ? K * N : M * K, 4 ), ( side === 'left' ) ? K : M, values( M * N, 2 ), M, null ];
		}, 16, function ample() {
			return new Float64Array( 1000 );
		}, 'dtpmqrt ' + side );
	});
});
