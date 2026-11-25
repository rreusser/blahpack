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

/* eslint-disable no-restricted-syntax, stdlib/first-unit-test, max-len, stdlib/vars-order, vars-on-top, max-statements-per-line */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dlatrs3 from './../lib/dlatrs3.js';
import ndarray from './../lib/ndarray.js';


// FUNCTIONS //

/**
* Calls dlatrs3 with all-default valid arguments except for an overridable subset.
*
* @private
* @returns {void}
*/
function callValid() {
	const A = new Float64Array( 4 );
	A[ 0 ] = 1.0; A[ 3 ] = 1.0;
	const X = new Float64Array( 4 );
	const scale = new Float64Array( 2 );
	const cnorm = new Float64Array( 2 );
	return dlatrs3( 'column-major', 'upper', 'no-transpose', 'non-unit', 'no', 2, 2, A, 2, X, 2, scale, 1, cnorm, 1, new Float64Array( 64 ) );
}


// TESTS //

test( 'dlatrs3 is a function', function t() {
	assert.strictEqual( typeof dlatrs3, 'function', 'is a function' );
});

test( 'dlatrs3 returns 0 on a valid call', function t() {
	assert.equal( callValid(), 0, 'returns 0' );
});

test( 'dlatrs3 has expected arity', function t() {
	assert.strictEqual( dlatrs3.length, 16, 'has expected arity' );
});

test( 'dlatrs3 throws TypeError for invalid order', function t() {
	assert.throws( function throws() {
		const A = new Float64Array( 4 );
		const X = new Float64Array( 4 );
		const scale = new Float64Array( 2 );
		const cnorm = new Float64Array( 2 );
		dlatrs3( 'invalid', 'upper', 'no-transpose', 'non-unit', 'no', 2, 2, A, 2, X, 2, scale, 1, cnorm, 1, new Float64Array( 64 ) );
	}, TypeError );
});

test( 'dlatrs3 throws TypeError for invalid uplo', function t() {
	assert.throws( function throws() {
		const A = new Float64Array( 4 );
		const X = new Float64Array( 4 );
		const scale = new Float64Array( 2 );
		const cnorm = new Float64Array( 2 );
		dlatrs3( 'column-major', 'invalid', 'no-transpose', 'non-unit', 'no', 2, 2, A, 2, X, 2, scale, 1, cnorm, 1, new Float64Array( 64 ) );
	}, TypeError );
});

test( 'dlatrs3 throws TypeError for invalid trans', function t() {
	assert.throws( function throws() {
		const A = new Float64Array( 4 );
		const X = new Float64Array( 4 );
		const scale = new Float64Array( 2 );
		const cnorm = new Float64Array( 2 );
		dlatrs3( 'column-major', 'upper', 'invalid', 'non-unit', 'no', 2, 2, A, 2, X, 2, scale, 1, cnorm, 1, new Float64Array( 64 ) );
	}, TypeError );
});

test( 'dlatrs3 throws TypeError for invalid diag', function t() {
	assert.throws( function throws() {
		const A = new Float64Array( 4 );
		const X = new Float64Array( 4 );
		const scale = new Float64Array( 2 );
		const cnorm = new Float64Array( 2 );
		dlatrs3( 'column-major', 'upper', 'no-transpose', 'invalid', 'no', 2, 2, A, 2, X, 2, scale, 1, cnorm, 1, new Float64Array( 64 ) );
	}, TypeError );
});

test( 'dlatrs3 throws TypeError for invalid normin', function t() {
	assert.throws( function throws() {
		const A = new Float64Array( 4 );
		const X = new Float64Array( 4 );
		const scale = new Float64Array( 2 );
		const cnorm = new Float64Array( 2 );
		dlatrs3( 'column-major', 'upper', 'no-transpose', 'non-unit', 'invalid', 2, 2, A, 2, X, 2, scale, 1, cnorm, 1, new Float64Array( 64 ) );
	}, TypeError );
});

test( 'dlatrs3 throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		const A = new Float64Array( 4 );
		const X = new Float64Array( 4 );
		const scale = new Float64Array( 2 );
		const cnorm = new Float64Array( 2 );
		dlatrs3( 'column-major', 'upper', 'no-transpose', 'non-unit', 'no', -1, 2, A, 2, X, 2, scale, 1, cnorm, 1, new Float64Array( 64 ) );
	}, RangeError );
});

test( 'dlatrs3 throws RangeError for negative NRHS', function t() {
	assert.throws( function throws() {
		const A = new Float64Array( 4 );
		const X = new Float64Array( 4 );
		const scale = new Float64Array( 2 );
		const cnorm = new Float64Array( 2 );
		dlatrs3( 'column-major', 'upper', 'no-transpose', 'non-unit', 'no', 2, -1, A, 2, X, 2, scale, 1, cnorm, 1, new Float64Array( 64 ) );
	}, RangeError );
});

test( 'dlatrs3 throws RangeError for LDA < max(1,N)', function t() {
	assert.throws( function throws() {
		const A = new Float64Array( 4 );
		const X = new Float64Array( 4 );
		const scale = new Float64Array( 2 );
		const cnorm = new Float64Array( 2 );
		dlatrs3( 'column-major', 'upper', 'no-transpose', 'non-unit', 'no', 2, 2, A, 1, X, 2, scale, 1, cnorm, 1, new Float64Array( 64 ) );
	}, RangeError );
});

test( 'dlatrs3 throws RangeError for LDX < max(1,N)', function t() {
	assert.throws( function throws() {
		const A = new Float64Array( 4 );
		const X = new Float64Array( 4 );
		const scale = new Float64Array( 2 );
		const cnorm = new Float64Array( 2 );
		dlatrs3( 'column-major', 'upper', 'no-transpose', 'non-unit', 'no', 2, 2, A, 2, X, 1, scale, 1, cnorm, 1, new Float64Array( 64 ) );
	}, RangeError );
});

test( 'dlatrs3 has ndarray property assignable via main.js export', function t() {
	// Surface check: the BLAS-style dlatrs3 here is the bare wrapper. The
	// .ndarray property is attached by main.js, not by lib/dlatrs3.js.
	assert.equal( typeof dlatrs3.ndarray, 'undefined', 'no ndarray on bare wrapper' );
});

test( 'dlatrs3: work=null allocates the workspace base.js needs (matches ndarray; ticket 0074)', function t() {
	const n = 10;
	[ [ 2, false ], [ 4, false ], [ 2, true ] ].forEach( function run( c ) {
		const nrhs = c[ 0 ];
		let i, j;
		const A = new Float64Array( n * n );
		for ( j = 0; j < n; j++ ) {
			for ( i = 0; i <= j; i++ ) {
				A[ ( j * n ) + i ] = ( i === j ) ? j + 2 : ( i + j ) * 0.1;
			}
		}
		if ( c[ 1 ] ) {
			A[ 8 * n ] = Infinity;
		}
		const X1 = new Float64Array( n * nrhs );
		for ( i = 0; i < X1.length; i++ ) {
			X1[ i ] = 1.0 + ( 0.25 * i );
		}
		const X2 = new Float64Array( X1 );
		const s1 = new Float64Array( nrhs );
		const s2 = new Float64Array( nrhs );
		const c1 = new Float64Array( n );
		const c2 = new Float64Array( n );
		const info1 = dlatrs3( 'column-major', 'upper', 'no-transpose', 'non-unit', 'no', n, nrhs, A, n, X1, n, s1, 1, c1, 1, null );
		const info2 = ndarray( 'upper', 'no-transpose', 'non-unit', 'no', n, nrhs, A, 1, n, 0, X2, 1, n, 0, s2, 1, 0, c2, 1, 0, new Float64Array( 256 ), 1, 0 );
		assert.strictEqual( info1, info2, 'info' );
		for ( i = 0; i < X2.length; i++ ) {
			assert.strictEqual( X1[ i ], X2[ i ], 'X[' + i + ']' );
		}
		for ( i = 0; i < nrhs; i++ ) {
			assert.strictEqual( s1[ i ], s2[ i ], 'SCALE[' + i + ']' );
		}
		for ( i = 0; i < n; i++ ) {
			assert.strictEqual( c1[ i ], c2[ i ], 'CNORM[' + i + ']' );
		}
	});
});
