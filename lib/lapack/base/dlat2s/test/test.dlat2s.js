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
import Float32Array from '@stdlib/array/float32/lib/index.js';
import dlat2s from './../lib/dlat2s.js';


// TESTS //

test( 'dlat2s is a function', function t() {
	assert.strictEqual( typeof dlat2s, 'function', 'is a function' );
});

test( 'dlat2s has expected arity', function t() {
	assert.strictEqual( dlat2s.length, 7, 'has expected arity' );
});

test( 'dlat2s throws TypeError for invalid order', function t() {
	assert.throws( function throws() {
		dlat2s( 'invalid', 'upper', 2, new Float64Array( 4 ), 2, new Float32Array( 4 ), 2 );
	}, {
		'name': 'TypeError'
	});
});

test( 'dlat2s throws TypeError for invalid uplo', function t() {
	assert.throws( function throws() {
		dlat2s( 'row-major', 'invalid', 2, new Float64Array( 4 ), 2, new Float32Array( 4 ), 2 );
	}, {
		'name': 'TypeError'
	});
});

test( 'dlat2s throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		dlat2s( 'row-major', 'upper', -1, new Float64Array( 4 ), 2, new Float32Array( 4 ), 2 );
	}, {
		'name': 'RangeError'
	});
});

test( 'dlat2s throws RangeError for LDA < N', function t() {
	assert.throws( function throws() {
		dlat2s( 'column-major', 'upper', 3, new Float64Array( 9 ), 2, new Float32Array( 9 ), 3 );
	}, {
		'name': 'RangeError'
	});
});

test( 'dlat2s throws RangeError for LDSA < N', function t() {
	assert.throws( function throws() {
		dlat2s( 'column-major', 'upper', 3, new Float64Array( 9 ), 3, new Float32Array( 9 ), 2 );
	}, {
		'name': 'RangeError'
	});
});

test( 'dlat2s returns 0 for N=0 quick return', function t() {
	var SA = new Float32Array( 4 );
	var A = new Float64Array( 4 );
	assert.strictEqual( dlat2s( 'column-major', 'upper', 0, A, 2, SA, 2 ), 0 );
});

test( 'dlat2s column-major upper converts values', function t() {
	// A = [[1.25,5.0,8.75],[0,6.25,10],[0,0,11.25]] stored column-major.
	var info;
	var SA;
	var A;
	A = new Float64Array([
		1.25,
		2.5,
		3.75,
		5.0,
		6.25,
		7.5,
		8.75,
		10.0,
		11.25
	]);
	SA = new Float32Array( 9 );
	info = dlat2s( 'column-major', 'upper', 3, A, 3, SA, 3 );
	assert.strictEqual( info, 0 );
	assert.strictEqual( SA[ 0 ], 1.25 );
	assert.strictEqual( SA[ 3 ], 5.0 );
	assert.strictEqual( SA[ 4 ], 6.25 );
	assert.strictEqual( SA[ 6 ], 8.75 );
	assert.strictEqual( SA[ 7 ], 10.0 );
	assert.strictEqual( SA[ 8 ], 11.25 );
});

test( 'dlat2s row-major lower converts values', function t() {
	var info;
	var SA;
	var A;
	A = new Float64Array( [ 1.0, 0.0, 0.0, 2.0, 3.0, 0.0, 4.0, 5.0, 6.0 ] );
	SA = new Float32Array( 9 );
	info = dlat2s( 'row-major', 'lower', 3, A, 3, SA, 3 );
	assert.strictEqual( info, 0 );
	assert.strictEqual( SA[ 0 ], 1.0 );
	assert.strictEqual( SA[ 3 ], 2.0 );
	assert.strictEqual( SA[ 4 ], 3.0 );
	assert.strictEqual( SA[ 6 ], 4.0 );
	assert.strictEqual( SA[ 7 ], 5.0 );
	assert.strictEqual( SA[ 8 ], 6.0 );
});

test( 'dlat2s returns info=1 on overflow', function t() {
	var info;
	var SA;
	var A;
	A = new Float64Array( [ 1.0, 2.0, 1e300, 4.0 ] );
	SA = new Float32Array( 4 );
	info = dlat2s( 'column-major', 'upper', 2, A, 2, SA, 2 );
	assert.strictEqual( info, 1 );
});
