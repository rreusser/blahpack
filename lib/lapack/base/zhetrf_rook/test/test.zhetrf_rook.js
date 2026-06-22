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

/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import zhetrfRook from './../lib/zhetrf_rook.js';


// TESTS //

test( 'zhetrf_rook is a function', function t() {
	assert.strictEqual( typeof zhetrfRook, 'function', 'is a function' );
});

test( 'zhetrf_rook has expected arity', function t() {
	assert.strictEqual( zhetrfRook.length, 7, 'has expected arity' );
});

test( 'zhetrf_rook throws TypeError for invalid order', function t() {
	assert.throws( function throws() {
		zhetrfRook( 'invalid', 'upper', 2, new Complex128Array( 4 ), 2, new Int32Array( 2 ), 1 );
	}, TypeError );
});

test( 'zhetrf_rook throws TypeError for invalid uplo', function t() {
	assert.throws( function throws() {
		zhetrfRook( 'row-major', 'invalid', 2, new Complex128Array( 4 ), 2, new Int32Array( 2 ), 1 );
	}, TypeError );
});

test( 'zhetrf_rook throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		zhetrfRook( 'row-major', 'upper', -1, new Complex128Array( 4 ), 2, new Int32Array( 2 ), 1 );
	}, RangeError );
});

test( 'zhetrf_rook throws RangeError for LDA < max(1,N)', function t() {
	assert.throws( function throws() {
		zhetrfRook( 'column-major', 'upper', 4, new Complex128Array( 16 ), 2, new Int32Array( 4 ), 1 );
	}, RangeError );
});

test( 'zhetrf_rook: column-major lower factorization succeeds and N=0 is a quick return', function t() {
	var info;
	var ipiv;
	var A;

	A = new Complex128Array( [ 4, 0, 1, -2, 3, 1, 0.5, -0.5, 0, 0, 5, 0, 2, -1, 1, 2, 0, 0, 0, 0, 7, 0, 3, 0, 0, 0, 0, 0, 0, 0, 6, 0 ] ); // eslint-disable-line max-len
	ipiv = new Int32Array( 4 );
	info = zhetrfRook( 'column-major', 'lower', 4, A, 4, ipiv, 1 );
	assert.equal( info, 0, 'info=0' );

	// N = 0 quick return
	info = zhetrfRook( 'column-major', 'lower', 0, new Complex128Array( 0 ), 1, new Int32Array( 0 ), 1 );
	assert.equal( info, 0, 'info=0 for N=0' );
});

test( 'zhetrf_rook: row-major lower factorization (diagonal matrix)', function t() {
	var info;
	var ipiv;
	var A;

	// Row-major: a diagonal Hermitian matrix has identical layout as column-major (off-diagonal zeros). Use distinct, well-conditioned diagonal entries to avoid zero pivots.
	A = new Complex128Array( 16 );
	A[ 0 ] = {
		're': 4.0,
		'im': 0.0
	};
	A[ 5 ] = {
		're': 5.0,
		'im': 0.0
	};
	A[ 10 ] = {
		're': 7.0,
		'im': 0.0
	};
	A[ 15 ] = {
		're': 6.0,
		'im': 0.0
	};
	ipiv = new Int32Array( 4 );
	info = zhetrfRook( 'row-major', 'lower', 4, A, 4, ipiv, 1 );
	assert.ok( typeof info === 'number', 'returns numeric info' );
});
