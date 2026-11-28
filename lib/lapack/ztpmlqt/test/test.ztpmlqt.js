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
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import ztpmlqt from './../lib/ztpmlqt.js';
import ndarray from './../lib/ndarray.js';
import { values } from '../../../../test/harness/nullwork.js';


// TESTS //

test( 'ztpmlqt is a function', function t() {
	assert.strictEqual( typeof ztpmlqt, 'function', 'is a function' );
});

test( 'ztpmlqt has expected arity', function t() {
	assert.strictEqual( ztpmlqt.length, 17, 'has expected arity' );
});

test( 'ztpmlqt throws TypeError for invalid order', function t() {
	assert.throws( function throws() {
		ztpmlqt( 'invalid', 'left', 'no-transpose', 2, 2, 2, 2, 2, new Complex128Array( 4 ), 2, new Complex128Array( 4 ), 2, new Complex128Array( 4 ), 2, new Complex128Array( 4 ), 2, new Complex128Array( 4 ) );
	}, TypeError );
});

test( 'ztpmlqt throws TypeError for invalid side', function t() {
	assert.throws( function throws() {
		ztpmlqt( 'row-major', 'invalid', 'no-transpose', 2, 2, 2, 2, 2, new Complex128Array( 4 ), 2, new Complex128Array( 4 ), 2, new Complex128Array( 4 ), 2, new Complex128Array( 4 ), 2, new Complex128Array( 4 ) );
	}, TypeError );
});

test( 'ztpmlqt throws TypeError for invalid trans', function t() {
	assert.throws( function throws() {
		ztpmlqt( 'row-major', 'left', 'invalid', 2, 2, 2, 2, 2, new Complex128Array( 4 ), 2, new Complex128Array( 4 ), 2, new Complex128Array( 4 ), 2, new Complex128Array( 4 ), 2, new Complex128Array( 4 ) );
	}, TypeError );
});

test( 'ztpmlqt throws TypeError for trans=transpose (only no-transpose and conjugate-transpose accepted)', function t() {
	assert.throws( function throws() {
		ztpmlqt( 'column-major', 'left', 'transpose', 2, 2, 2, 2, 2, new Complex128Array( 4 ), 2, new Complex128Array( 4 ), 2, new Complex128Array( 4 ), 2, new Complex128Array( 4 ), 2, new Complex128Array( 4 ) );
	}, TypeError );
});

test( 'ztpmlqt throws RangeError for negative M', function t() {
	assert.throws( function throws() {
		ztpmlqt( 'column-major', 'left', 'no-transpose', -1, 2, 2, 2, 2, new Complex128Array( 4 ), 2, new Complex128Array( 4 ), 2, new Complex128Array( 4 ), 2, new Complex128Array( 4 ), 2, new Complex128Array( 4 ) );
	}, RangeError );
});

test( 'ztpmlqt throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		ztpmlqt( 'column-major', 'left', 'no-transpose', 2, -1, 2, 2, 2, new Complex128Array( 4 ), 2, new Complex128Array( 4 ), 2, new Complex128Array( 4 ), 2, new Complex128Array( 4 ), 2, new Complex128Array( 4 ) );
	}, RangeError );
});

test( 'ztpmlqt throws RangeError for negative K', function t() {
	assert.throws( function throws() {
		ztpmlqt( 'column-major', 'left', 'no-transpose', 2, 2, -1, 2, 2, new Complex128Array( 4 ), 2, new Complex128Array( 4 ), 2, new Complex128Array( 4 ), 2, new Complex128Array( 4 ), 2, new Complex128Array( 4 ) );
	}, RangeError );
});

test( 'ztpmlqt throws RangeError for L > K', function t() {
	assert.throws( function throws() {
		ztpmlqt( 'column-major', 'left', 'no-transpose', 2, 2, 2, 5, 2, new Complex128Array( 4 ), 2, new Complex128Array( 4 ), 2, new Complex128Array( 4 ), 2, new Complex128Array( 4 ), 2, new Complex128Array( 4 ) );
	}, RangeError );
});

test( 'ztpmlqt throws RangeError for mb < 1', function t() {
	assert.throws( function throws() {
		ztpmlqt( 'column-major', 'left', 'no-transpose', 2, 2, 2, 2, 0, new Complex128Array( 4 ), 2, new Complex128Array( 4 ), 2, new Complex128Array( 4 ), 2, new Complex128Array( 4 ), 2, new Complex128Array( 4 ) );
	}, RangeError );
});

test( 'ztpmlqt throws RangeError for mb > K', function t() {
	assert.throws( function throws() {
		ztpmlqt( 'column-major', 'left', 'no-transpose', 2, 2, 2, 2, 5, new Complex128Array( 4 ), 2, new Complex128Array( 4 ), 2, new Complex128Array( 4 ), 2, new Complex128Array( 4 ), 2, new Complex128Array( 4 ) );
	}, RangeError );
});

test( 'ztpmlqt throws RangeError for LDV too small (column-major)', function t() {
	assert.throws( function throws() {
		ztpmlqt( 'column-major', 'left', 'no-transpose', 4, 3, 3, 2, 2, new Complex128Array( 12 ), 1, new Complex128Array( 6 ), 2, new Complex128Array( 9 ), 3, new Complex128Array( 12 ), 4, new Complex128Array( 6 ) );
	}, RangeError );
});

test( 'ztpmlqt throws RangeError for LDT too small (column-major)', function t() {
	assert.throws( function throws() {
		ztpmlqt( 'column-major', 'left', 'no-transpose', 4, 3, 3, 2, 2, new Complex128Array( 12 ), 3, new Complex128Array( 6 ), 1, new Complex128Array( 9 ), 3, new Complex128Array( 12 ), 4, new Complex128Array( 6 ) );
	}, RangeError );
});

test( 'ztpmlqt throws RangeError for LDA too small (column-major, side=left)', function t() {
	assert.throws( function throws() {
		ztpmlqt( 'column-major', 'left', 'no-transpose', 4, 3, 3, 2, 2, new Complex128Array( 12 ), 3, new Complex128Array( 6 ), 2, new Complex128Array( 9 ), 1, new Complex128Array( 12 ), 4, new Complex128Array( 6 ) );
	}, RangeError );
});

test( 'ztpmlqt throws RangeError for LDB too small (column-major)', function t() {
	assert.throws( function throws() {
		ztpmlqt( 'column-major', 'left', 'no-transpose', 4, 3, 3, 2, 2, new Complex128Array( 12 ), 3, new Complex128Array( 6 ), 2, new Complex128Array( 9 ), 3, new Complex128Array( 12 ), 1, new Complex128Array( 6 ) );
	}, RangeError );
});

test( 'ztpmlqt accepts column-major call (smoke)', function t() {
	const V = new Complex128Array( 12 );
	const T = new Complex128Array( 6 );
	const A = new Complex128Array( 9 );
	const B = new Complex128Array( 12 );
	const WORK = new Complex128Array( 6 );
	const info = ztpmlqt( 'column-major', 'left', 'no-transpose', 4, 3, 3, 2, 2, V, 3, T, 2, A, 3, B, 4, WORK );
	assert.strictEqual( info, 0, 'info' );
});

test( 'ztpmlqt accepts row-major call (smoke)', function t() {
	const V = new Complex128Array( 16 );
	const T = new Complex128Array( 9 );
	const A = new Complex128Array( 9 );
	const B = new Complex128Array( 12 );
	const WORK = new Complex128Array( 6 );
	const info = ztpmlqt( 'row-major', 'left', 'no-transpose', 4, 3, 3, 2, 2, V, 4, T, 3, A, 3, B, 3, WORK );
	assert.strictEqual( info, 0, 'info' );
});

test( 'ztpmlqt throws RangeError for an undersized WORK (side=left)', function t() {
	// Needs mb*N = 6 complex elements; provide 5:
	assert.throws( function throws() {
		ztpmlqt( 'column-major', 'left', 'no-transpose', 4, 3, 3, 2, 2, new Complex128Array( 12 ), 3, new Complex128Array( 6 ), 2, new Complex128Array( 9 ), 3, new Complex128Array( 12 ), 4, new Complex128Array( 5 ) );
	}, RangeError );
});

test( 'ztpmlqt throws RangeError for an undersized WORK (side=right)', function t() {
	// Needs M*mb = 8 complex elements; provide 7:
	assert.throws( function throws() {
		ztpmlqt( 'column-major', 'right', 'no-transpose', 4, 3, 3, 2, 2, new Complex128Array( 9 ), 3, new Complex128Array( 6 ), 2, new Complex128Array( 12 ), 4, new Complex128Array( 12 ), 4, new Complex128Array( 7 ) );
	}, RangeError );
});

test( 'ztpmlqt matches ndarray (column-major and row-major, WORK = null)', function t() {
	const M = 4;
	const N = 3;
	const K = 3;
	const l = 2;
	const mb = 2;
	[ 'left', 'right' ].forEach( function eachSide( side ) {
		[ 'no-transpose', 'conjugate-transpose' ].forEach( function eachTrans( trans ) {
			const nq = ( side === 'left' ) ? M : N;
			const ar = ( side === 'left' ) ? K : M;
			const ac = ( side === 'left' ) ? N : K;
			[ 'column-major', 'row-major' ].forEach( function eachOrder( order ) {
				const label = side + '/' + trans + '/' + order;
				const V1 = new Complex128Array( values( 2 * K * nq, 1 ) );
				const T1 = new Complex128Array( values( 2 * mb * K, 2 ) );
				const A1 = new Complex128Array( values( 2 * ar * ac, 3 ) );
				const B1 = new Complex128Array( values( 2 * M * N, 4 ) );
				const A2 = new Complex128Array( values( 2 * ar * ac, 3 ) );
				const B2 = new Complex128Array( values( 2 * M * N, 4 ) );
				const W2 = new Complex128Array( 100 );
				let info1;
				let info2;
				if ( order === 'column-major' ) {
					info1 = ztpmlqt( order, side, trans, M, N, K, l, mb, V1, K, T1, mb, A1, ar, B1, M, null );
					info2 = ndarray( side, trans, M, N, K, l, mb, V1, 1, K, 0, T1, 1, mb, 0, A2, 1, ar, 0, B2, 1, M, 0, W2, 1, 0 );
				} else {
					info1 = ztpmlqt( order, side, trans, M, N, K, l, mb, V1, nq, T1, K, A1, ac, B1, N, null );
					info2 = ndarray( side, trans, M, N, K, l, mb, V1, nq, 1, 0, T1, K, 1, 0, A2, ac, 1, 0, B2, N, 1, 0, W2, 1, 0 );
				}
				assert.strictEqual( info1, info2, label + ' info' );
				assert.deepStrictEqual( reinterpret( A1, 0 ), reinterpret( A2, 0 ), label + ' A' );
				assert.deepStrictEqual( reinterpret( B1, 0 ), reinterpret( B2, 0 ), label + ' B' );
				assert.notDeepStrictEqual( reinterpret( B1, 0 ), values( 2 * M * N, 4 ), label + ' B changed' );
			});
		});
	});
});
