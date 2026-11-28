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

/* eslint-disable no-restricted-syntax, max-len */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dtpmqrt from './../lib/dtpmqrt.js';
import ndarray from './../lib/ndarray.js';
import { assertNullWorkspaceSufficient, values } from '../../../../test/harness/nullwork.js';


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

test( 'dtpmqrt throws RangeError for an undersized WORK (side=left)', function t() {
	// Needs nb*N = 8 elements; provide 7:
	assert.throws( function throws() {
		dtpmqrt( 'column-major', 'left', 'no-transpose', 5, 4, 3, 1, 2, values( 15, 1 ), 5, values( 6, 3 ), 2, values( 12, 4 ), 3, values( 20, 2 ), 5, new Float64Array( 7 ) );
	}, RangeError );
});

test( 'dtpmqrt throws RangeError for an undersized WORK (side=right)', function t() {
	// Needs M*nb = 10 elements; provide 9:
	assert.throws( function throws() {
		dtpmqrt( 'column-major', 'right', 'no-transpose', 5, 4, 3, 1, 2, values( 12, 1 ), 4, values( 6, 3 ), 2, values( 15, 4 ), 5, values( 20, 2 ), 5, new Float64Array( 9 ) );
	}, RangeError );
});

test( 'dtpmqrt matches ndarray (column-major and row-major, WORK = null)', function t() {
	const M = 5;
	const N = 4;
	const K = 3;
	const l = 1;
	const nb = 2;
	[ 'left', 'right' ].forEach( function eachSide( side ) {
		[ 'no-transpose', 'transpose' ].forEach( function eachTrans( trans ) {
			const nq = ( side === 'left' ) ? M : N;
			const ar = ( side === 'left' ) ? K : M;
			const ac = ( side === 'left' ) ? N : K;
			[ 'column-major', 'row-major' ].forEach( function eachOrder( order ) {
				const label = side + '/' + trans + '/' + order;
				const V = values( nq * K, 1 );
				const T = values( nb * K, 3 );
				const A1 = values( ar * ac, 4 );
				const B1 = values( M * N, 2 );
				const A2 = values( ar * ac, 4 );
				const B2 = values( M * N, 2 );
				const W2 = new Float64Array( 100 );
				let info1;
				let info2;
				if ( order === 'column-major' ) {
					info1 = dtpmqrt( order, side, trans, M, N, K, l, nb, V, nq, T, nb, A1, ar, B1, M, null );
					info2 = ndarray( side, trans, M, N, K, l, nb, V, 1, nq, 0, T, 1, nb, 0, A2, 1, ar, 0, B2, 1, M, 0, W2, 1, 0 );
				} else {
					info1 = dtpmqrt( order, side, trans, M, N, K, l, nb, V, K, T, K, A1, ac, B1, N, null );
					info2 = ndarray( side, trans, M, N, K, l, nb, V, K, 1, 0, T, K, 1, 0, A2, ac, 1, 0, B2, N, 1, 0, W2, 1, 0 );
				}
				assert.strictEqual( info1, info2, label + ' info' );
				assert.deepStrictEqual( A1, A2, label + ' A' );
				assert.deepStrictEqual( B1, B2, label + ' B' );
				assert.notDeepStrictEqual( B1, values( M * N, 2 ), label + ' B changed' );
			});
		});
	});
});
