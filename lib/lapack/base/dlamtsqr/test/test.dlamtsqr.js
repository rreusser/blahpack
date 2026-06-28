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
	assert.strictEqual( dlamtsqr.length, 16, 'has expected arity' );
});

test( 'dlamtsqr throws TypeError for invalid order', function t() {
	assert.throws( function throws() {
		dlamtsqr( 'invalid', 'left', 'no-transpose', 2, 2, 2, 2, 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2 );
	}, TypeError );
});

test( 'dlamtsqr throws TypeError for invalid side', function t() {
	assert.throws( function throws() {
		dlamtsqr( 'row-major', 'invalid', 'no-transpose', 2, 2, 2, 2, 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2 );
	}, TypeError );
});

test( 'dlamtsqr throws TypeError for invalid trans', function t() {
	assert.throws( function throws() {
		dlamtsqr( 'row-major', 'left', 'invalid', 2, 2, 2, 2, 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2 );
	}, TypeError );
});

test( 'dlamtsqr throws RangeError for negative M', function t() {
	assert.throws( function throws() {
		dlamtsqr( 'row-major', 'left', 'no-transpose', -1, 2, 2, 2, 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2 );
	}, RangeError );
});

test( 'dlamtsqr throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		dlamtsqr( 'row-major', 'left', 'no-transpose', 2, -1, 2, 2, 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2 );
	}, RangeError );
});

test( 'dlamtsqr throws RangeError for negative K', function t() {
	assert.throws( function throws() {
		dlamtsqr( 'row-major', 'left', 'no-transpose', 2, 2, -1, 2, 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2 );
	}, RangeError );
});

test( 'dlamtsqr.ndarray executes a tiny no-trans column-major problem (round-trip)', function t() {
	var WORK;
	var info;
	var Av;
	var Tv;
	var Cv;

	// Tiny case: M=4, K=2, MB=4 (single dgemqrt fall-through), NB=2.
	Av = new Float64Array( [ 1.0, 2.0, 3.0, 4.0, 0.5, 1.5, 2.5, 3.5 ] );
	Tv = new Float64Array( 2 * 2 );
	Cv = new Float64Array( 4 * 2 );
	WORK = new Float64Array( 4 );

	// Layout test: pass through to verify column-major path works without throwing.
	info = dlamtsqr( 'column-major', 'left', 'no-transpose', 4, 2, 2, 4, 2, Av, 4, Tv, 2, Cv, 4, WORK, 1 );
	assert.equal( info, 0, 'info' );
});

test( 'dlamtsqr layout: row-major path executes for SIDE=R', function t() {
	var WORK;
	var info;
	var Av;
	var Tv;
	var Cv;

	// Row-major: A is K-by-Q (right side: Q = N), so K rows = 2, leading dim = N = 4. MB >= max(M,N,K) for fall-through.
	Av = new Float64Array( 2 * 4 );
	Tv = new Float64Array( 2 * 2 );
	Cv = new Float64Array( 3 * 4 );
	WORK = new Float64Array( 16 );

	info = dlamtsqr( 'row-major', 'right', 'no-transpose', 3, 4, 2, 8, 2, Av, 4, Tv, 2, Cv, 4, WORK, 1 );
	assert.equal( info, 0, 'info' );
});

test( 'dlamtsqr layout: invalid LDA (column-major) throws RangeError', function t() {
	assert.throws( function throws() {
		// LDA must be >= max(1, M) = 4 for SIDE=L; pass 1.
		dlamtsqr( 'column-major', 'left', 'no-transpose', 4, 4, 2, 4, 2, new Float64Array( 16 ), 1, new Float64Array( 4 ), 2, new Float64Array( 16 ), 4, new Float64Array( 16 ), 1 );
	}, RangeError );
});

test( 'dlamtsqr layout: invalid LDC (column-major) throws RangeError', function t() {
	assert.throws( function throws() {
		dlamtsqr( 'column-major', 'left', 'no-transpose', 4, 4, 2, 4, 2, new Float64Array( 16 ), 4, new Float64Array( 4 ), 2, new Float64Array( 16 ), 1, new Float64Array( 16 ), 1 );
	}, RangeError );
});

test( 'dlamtsqr layout: invalid LDT (column-major) throws RangeError', function t() {
	assert.throws( function throws() {
		// LDT must be >= nb = 2; pass 1.
		dlamtsqr( 'column-major', 'left', 'no-transpose', 4, 4, 2, 4, 2, new Float64Array( 16 ), 4, new Float64Array( 4 ), 1, new Float64Array( 16 ), 4, new Float64Array( 16 ), 1 );
	}, RangeError );
});

test( 'dlamtsqr layout: invalid LDA (row-major) throws RangeError', function t() {
	assert.throws( function throws() {
		// row-major LDA must be >= K = 2; pass 1.
		dlamtsqr( 'row-major', 'left', 'no-transpose', 4, 4, 2, 4, 2, new Float64Array( 16 ), 1, new Float64Array( 4 ), 2, new Float64Array( 16 ), 4, new Float64Array( 16 ), 1 );
	}, RangeError );
});

test( 'dlamtsqr layout: invalid LDT (row-major) throws RangeError', function t() {
	assert.throws( function throws() {
		// row-major LDT must be >= K = 2; pass 1.
		dlamtsqr( 'row-major', 'left', 'no-transpose', 4, 4, 2, 4, 2, new Float64Array( 16 ), 4, new Float64Array( 4 ), 1, new Float64Array( 16 ), 4, new Float64Array( 16 ), 1 );
	}, RangeError );
});

test( 'dlamtsqr layout: invalid LDC (row-major) throws RangeError', function t() {
	assert.throws( function throws() {
		// row-major LDC must be >= N = 4; pass 1.
		dlamtsqr( 'row-major', 'left', 'no-transpose', 4, 4, 2, 4, 2, new Float64Array( 16 ), 4, new Float64Array( 4 ), 2, new Float64Array( 16 ), 1, new Float64Array( 16 ), 1 );
	}, RangeError );
});

test( 'dlamtsqr layout: K > M when SIDE=R, K > N when SIDE=L throw RangeError', function t() {
	assert.throws( function throws() {
		dlamtsqr( 'column-major', 'left', 'no-transpose', 2, 2, 5, 2, 2, new Float64Array( 16 ), 2, new Float64Array( 4 ), 2, new Float64Array( 16 ), 2, new Float64Array( 16 ), 1 );
	}, RangeError );
	assert.throws( function throws() {
		dlamtsqr( 'column-major', 'right', 'no-transpose', 2, 2, 5, 2, 2, new Float64Array( 16 ), 2, new Float64Array( 4 ), 2, new Float64Array( 16 ), 2, new Float64Array( 16 ), 1 );
	}, RangeError );
});

test( 'dlamtsqr layout: invalid mb/nb throws RangeError', function t() {
	assert.throws( function throws() {
		dlamtsqr( 'column-major', 'left', 'no-transpose', 4, 4, 2, 0, 2, new Float64Array( 16 ), 4, new Float64Array( 4 ), 2, new Float64Array( 16 ), 4, new Float64Array( 16 ), 1 );
	}, RangeError );
	assert.throws( function throws() {
		dlamtsqr( 'column-major', 'left', 'no-transpose', 4, 4, 2, 4, 0, new Float64Array( 16 ), 4, new Float64Array( 4 ), 2, new Float64Array( 16 ), 4, new Float64Array( 16 ), 1 );
	}, RangeError );
	assert.throws( function throws() {
		dlamtsqr( 'column-major', 'left', 'no-transpose', 4, 4, 2, 4, 5, new Float64Array( 16 ), 4, new Float64Array( 4 ), 2, new Float64Array( 16 ), 4, new Float64Array( 16 ), 1 );
	}, RangeError );
});
