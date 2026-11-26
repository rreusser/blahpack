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
import dlamtsqr from './../lib/dlamtsqr.js';


// TESTS //

test( 'dlamtsqr is a function', function t() {
	assert.strictEqual( typeof dlamtsqr, 'function', 'is a function' );
});

test( 'dlamtsqr has expected arity', function t() {
	assert.strictEqual( dlamtsqr.length, 15, 'has expected arity' );
});

test( 'dlamtsqr throws TypeError for invalid order', function t() {
	assert.throws( function throws() {
		dlamtsqr( 'invalid', 'left', 'no-transpose', 2, 2, 2, 2, 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ) );
	}, TypeError );
});

test( 'dlamtsqr throws TypeError for invalid side', function t() {
	assert.throws( function throws() {
		dlamtsqr( 'row-major', 'invalid', 'no-transpose', 2, 2, 2, 2, 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ) );
	}, TypeError );
});

test( 'dlamtsqr throws TypeError for invalid trans', function t() {
	assert.throws( function throws() {
		dlamtsqr( 'row-major', 'left', 'invalid', 2, 2, 2, 2, 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ) );
	}, TypeError );
});

test( 'dlamtsqr throws RangeError for negative M', function t() {
	assert.throws( function throws() {
		dlamtsqr( 'row-major', 'left', 'no-transpose', -1, 2, 2, 2, 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ) );
	}, RangeError );
});

test( 'dlamtsqr throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		dlamtsqr( 'row-major', 'left', 'no-transpose', 2, -1, 2, 2, 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ) );
	}, RangeError );
});

test( 'dlamtsqr throws RangeError for negative K', function t() {
	assert.throws( function throws() {
		dlamtsqr( 'row-major', 'left', 'no-transpose', 2, 2, -1, 2, 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ) );
	}, RangeError );
});

test( 'dlamtsqr.ndarray executes a tiny no-trans column-major problem (round-trip)', function t() {

	// Tiny case: M=4, K=2, MB=4 (single dgemqrt fall-through), NB=2.
	const Av = new Float64Array( [ 1.0, 2.0, 3.0, 4.0, 0.5, 1.5, 2.5, 3.5 ] );
	const Tv = new Float64Array( 2 * 2 );
	const Cv = new Float64Array( 4 * 2 );
	const WORK = new Float64Array( 4 );

	// Layout test: pass through to verify column-major path works without throwing.
	const info = dlamtsqr( 'column-major', 'left', 'no-transpose', 4, 2, 2, 4, 2, Av, 4, Tv, 2, Cv, 4, WORK );
	assert.equal( info, 0, 'info' );
});

test( 'dlamtsqr layout: row-major path executes for SIDE=R', function t() {

	// Row-major: A is K-by-Q (right side: Q = N), so K rows = 2, leading dim = N = 4. MB >= max(M,N,K) for fall-through.
	const Av = new Float64Array( 2 * 4 );
	const Tv = new Float64Array( 2 * 2 );
	const Cv = new Float64Array( 3 * 4 );
	const WORK = new Float64Array( 16 );

	const info = dlamtsqr( 'row-major', 'right', 'no-transpose', 3, 4, 2, 8, 2, Av, 4, Tv, 2, Cv, 4, WORK );
	assert.equal( info, 0, 'info' );
});

test( 'dlamtsqr layout: invalid LDA (column-major) throws RangeError', function t() {
	assert.throws( function throws() {
		// LDA must be >= max(1, M) = 4 for SIDE=L; pass 1.
		dlamtsqr( 'column-major', 'left', 'no-transpose', 4, 4, 2, 4, 2, new Float64Array( 16 ), 1, new Float64Array( 4 ), 2, new Float64Array( 16 ), 4, new Float64Array( 16 ) );
	}, RangeError );
});

test( 'dlamtsqr layout: invalid LDC (column-major) throws RangeError', function t() {
	assert.throws( function throws() {
		dlamtsqr( 'column-major', 'left', 'no-transpose', 4, 4, 2, 4, 2, new Float64Array( 16 ), 4, new Float64Array( 4 ), 2, new Float64Array( 16 ), 1, new Float64Array( 16 ) );
	}, RangeError );
});

test( 'dlamtsqr layout: invalid LDT (column-major) throws RangeError', function t() {
	assert.throws( function throws() {
		// LDT must be >= nb = 2; pass 1.
		dlamtsqr( 'column-major', 'left', 'no-transpose', 4, 4, 2, 4, 2, new Float64Array( 16 ), 4, new Float64Array( 4 ), 1, new Float64Array( 16 ), 4, new Float64Array( 16 ) );
	}, RangeError );
});

test( 'dlamtsqr layout: invalid LDA (row-major) throws RangeError', function t() {
	assert.throws( function throws() {
		// row-major LDA must be >= K = 2; pass 1.
		dlamtsqr( 'row-major', 'left', 'no-transpose', 4, 4, 2, 4, 2, new Float64Array( 16 ), 1, new Float64Array( 4 ), 2, new Float64Array( 16 ), 4, new Float64Array( 16 ) );
	}, RangeError );
});

test( 'dlamtsqr layout: invalid LDC (row-major) throws RangeError', function t() {
	assert.throws( function throws() {
		// row-major LDC must be >= N = 4; pass 1.
		dlamtsqr( 'row-major', 'left', 'no-transpose', 4, 4, 2, 4, 2, new Float64Array( 16 ), 4, new Float64Array( 4 ), 2, new Float64Array( 16 ), 1, new Float64Array( 16 ) );
	}, RangeError );
});

test( 'dlamtsqr layout: K > M when SIDE=R, K > N when SIDE=L throw RangeError', function t() {
	assert.throws( function throws() {
		dlamtsqr( 'column-major', 'left', 'no-transpose', 2, 2, 5, 2, 2, new Float64Array( 16 ), 2, new Float64Array( 4 ), 2, new Float64Array( 16 ), 2, new Float64Array( 16 ) );
	}, RangeError );
	assert.throws( function throws() {
		dlamtsqr( 'column-major', 'right', 'no-transpose', 2, 2, 5, 2, 2, new Float64Array( 16 ), 2, new Float64Array( 4 ), 2, new Float64Array( 16 ), 2, new Float64Array( 16 ) );
	}, RangeError );
});

test( 'dlamtsqr layout: invalid mb/nb throws RangeError', function t() {
	assert.throws( function throws() {
		dlamtsqr( 'column-major', 'left', 'no-transpose', 4, 4, 2, 4, 0, new Float64Array( 16 ), 4, new Float64Array( 4 ), 2, new Float64Array( 16 ), 4, new Float64Array( 16 ) );
	}, RangeError );
	assert.throws( function throws() {
		dlamtsqr( 'column-major', 'left', 'no-transpose', 4, 4, 2, 4, 5, new Float64Array( 16 ), 4, new Float64Array( 4 ), 2, new Float64Array( 16 ), 4, new Float64Array( 16 ) );
	}, RangeError );
});

/**
* Returns a Float64Array of `n` deterministic pseudo-random values in (-1, 1).
*
* @private
* @param {NonNegativeInteger} n - length
* @param {integer} seed - seed
* @returns {Float64Array} values
*/
function values( n, seed ) {
	const out = new Float64Array( n );
	let s = seed;
	let i;
	for ( i = 0; i < n; i++ ) {
		s = ( ( s * 1103515245 ) + 12345 ) % 2147483648;
		out[ i ] = ( 2.0 * ( s / 2147483648 ) ) - 1.0;
	}
	return out;
}

test( 'dlamtsqr: WORK = null for side = right allocates the M-by-nb WORK dgemqrt/dtpmqrt address (M > mb)', function t() {
	const cases = [ [ 8, 6, 2, 3, 2, 'no-transpose' ], [ 8, 6, 2, 1, 1, 'transpose' ], [ 8, 12, 2, 5, 2, 'no-transpose' ], [ 8, 12, 2, 5, 2, 'transpose' ] ];
	let expected;
	let actual;
	let info;
	let c;
	let i;
	for ( i = 0; i < cases.length; i++ ) {
		c = cases[ i ];
		const A = values( c[ 1 ] * c[ 2 ], 7 );
		const T = values( c[ 4 ] * c[ 2 ] * c[ 1 ], 11 );
		expected = values( c[ 0 ] * c[ 1 ], 13 );
		actual = values( c[ 0 ] * c[ 1 ], 13 );
		info = dlamtsqr( 'column-major', 'right', c[ 5 ], c[ 0 ], c[ 1 ], c[ 2 ], c[ 3 ], c[ 4 ], A, c[ 1 ], T, c[ 4 ], expected, c[ 0 ], new Float64Array( c[ 0 ] * c[ 4 ] ) );
		assert.strictEqual( info, 0, 'info' );
		info = dlamtsqr( 'column-major', 'right', c[ 5 ], c[ 0 ], c[ 1 ], c[ 2 ], c[ 3 ], c[ 4 ], A, c[ 1 ], T, c[ 4 ], actual, c[ 0 ], null );
		assert.strictEqual( info, 0, 'info' );
		assert.deepStrictEqual( actual, expected, 'matches an explicit M*nb WORK: ' + c.join( ',' ) );
	}
});

test( 'dlamtsqr: side = right with K > N throws RangeError (the reference\'s DGEMQRT rejects it)', function t() {
	const C = values( 12, 3 );
	assert.throws( function throws() {
		dlamtsqr( 'column-major', 'right', 'no-transpose', 6, 2, 3, 1, 1, values( 9, 5 ), 3, values( 3, 9 ), 1, C, 6, null );
	}, RangeError );
});
