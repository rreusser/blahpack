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

/* eslint-disable no-restricted-syntax, stdlib/first-unit-test, max-len */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dlarzb from './../lib/dlarzb.js';


// FIXTURES //

/**
* Returns a fresh set of valid inputs for a 2-by-3 column-major problem.
*
* @private
* @returns {Object} input buffers
*/
function makeInputs() {
	return {
		'V': new Float64Array( [ 0.3, -0.4 ] ),
		'T': new Float64Array( [ 0.8 ] ),
		'C': new Float64Array( [ 1.0, 2.0, 3.0, 4.0, 5.0, 6.0 ] ),
		'WORK': new Float64Array( 3 )
	};
}


// TESTS //

test( 'dlarzb is a function', function t() {
	assert.strictEqual( typeof dlarzb, 'function', 'is a function' );
});

test( 'dlarzb has expected arity', function t() {
	assert.strictEqual( dlarzb.length, 17, 'has expected arity' );
});

test( 'dlarzb throws TypeError for invalid order', function t() {
	var x = makeInputs();
	assert.throws( function throws() {
		dlarzb( 'invalid', 'left', 'no-transpose', 'backward', 'rowwise', 2, 3, 1, 2, x.V, 1, x.T, 1, x.C, 2, x.WORK, 3 );
	}, TypeError );
});

test( 'dlarzb throws TypeError for invalid side', function t() {
	var x = makeInputs();
	assert.throws( function throws() {
		dlarzb( 'column-major', 'invalid', 'no-transpose', 'backward', 'rowwise', 2, 3, 1, 2, x.V, 1, x.T, 1, x.C, 2, x.WORK, 3 );
	}, TypeError );
});

test( 'dlarzb throws TypeError for invalid trans', function t() {
	var x = makeInputs();
	assert.throws( function throws() {
		dlarzb( 'column-major', 'left', 'invalid', 'backward', 'rowwise', 2, 3, 1, 2, x.V, 1, x.T, 1, x.C, 2, x.WORK, 3 );
	}, TypeError );
});

test( 'dlarzb throws TypeError for invalid direct', function t() {
	var x = makeInputs();
	assert.throws( function throws() {
		dlarzb( 'column-major', 'left', 'no-transpose', 'forward', 'rowwise', 2, 3, 1, 2, x.V, 1, x.T, 1, x.C, 2, x.WORK, 3 );
	}, TypeError );
});

test( 'dlarzb throws TypeError for invalid storev', function t() {
	var x = makeInputs();
	assert.throws( function throws() {
		dlarzb( 'column-major', 'left', 'no-transpose', 'backward', 'columnwise', 2, 3, 1, 2, x.V, 1, x.T, 1, x.C, 2, x.WORK, 3 );
	}, TypeError );
});

test( 'dlarzb throws RangeError for negative M', function t() {
	var x = makeInputs();
	assert.throws( function throws() {
		dlarzb( 'column-major', 'left', 'no-transpose', 'backward', 'rowwise', -1, 3, 1, 2, x.V, 1, x.T, 1, x.C, 2, x.WORK, 3 );
	}, RangeError );
});

test( 'dlarzb throws RangeError for negative N', function t() {
	var x = makeInputs();
	assert.throws( function throws() {
		dlarzb( 'column-major', 'left', 'no-transpose', 'backward', 'rowwise', 2, -1, 1, 2, x.V, 1, x.T, 1, x.C, 2, x.WORK, 3 );
	}, RangeError );
});

test( 'dlarzb throws RangeError for negative K', function t() {
	var x = makeInputs();
	assert.throws( function throws() {
		dlarzb( 'column-major', 'left', 'no-transpose', 'backward', 'rowwise', 2, 3, -1, 2, x.V, 1, x.T, 1, x.C, 2, x.WORK, 3 );
	}, RangeError );
});

test( 'dlarzb throws RangeError for negative L', function t() {
	var x = makeInputs();
	assert.throws( function throws() {
		dlarzb( 'column-major', 'left', 'no-transpose', 'backward', 'rowwise', 2, 3, 1, -1, x.V, 1, x.T, 1, x.C, 2, x.WORK, 3 );
	}, RangeError );
});

test( 'dlarzb throws RangeError for LDV < K (column-major)', function t() {
	var x = makeInputs();
	assert.throws( function throws() {
		dlarzb( 'column-major', 'left', 'no-transpose', 'backward', 'rowwise', 2, 3, 2, 2, x.V, 1, x.T, 2, x.C, 2, x.WORK, 3 );
	}, RangeError );
});

test( 'dlarzb throws RangeError for LDT < K', function t() {
	var x = makeInputs();
	assert.throws( function throws() {
		dlarzb( 'column-major', 'left', 'no-transpose', 'backward', 'rowwise', 2, 3, 2, 2, x.V, 2, x.T, 1, x.C, 2, x.WORK, 3 );
	}, RangeError );
});

test( 'dlarzb throws RangeError for LDC < M (column-major)', function t() {
	var x = makeInputs();
	assert.throws( function throws() {
		dlarzb( 'column-major', 'left', 'no-transpose', 'backward', 'rowwise', 2, 3, 1, 2, x.V, 1, x.T, 1, x.C, 1, x.WORK, 3 );
	}, RangeError );
});

test( 'dlarzb throws RangeError for LDWORK < N (side=left, column-major)', function t() {
	var x = makeInputs();
	assert.throws( function throws() {
		dlarzb( 'column-major', 'left', 'no-transpose', 'backward', 'rowwise', 2, 3, 1, 2, x.V, 1, x.T, 1, x.C, 2, x.WORK, 1 );
	}, RangeError );
});

test( 'dlarzb throws RangeError for LDWORK < M (side=right, column-major)', function t() {
	var WORK;
	var V;
	var T;
	var C;

	// C is 3-by-2; V is 1-by-2; WORK must have LDWORK >= M = 3.
	V = new Float64Array( [ 0.3, -0.4 ] );
	T = new Float64Array( [ 0.8 ] );
	C = new Float64Array( [ 1.0, 2.0, 3.0, 4.0, 5.0, 6.0 ] );
	WORK = new Float64Array( 3 );
	assert.throws( function throws() {
		dlarzb( 'column-major', 'right', 'no-transpose', 'backward', 'rowwise', 3, 2, 1, 2, V, 1, T, 1, C, 3, WORK, 1 );
	}, RangeError );
});

test( 'dlarzb returns C unchanged for M=0', function t() {
	var WORK;
	var out;
	var V;
	var T;
	var C;

	V = new Float64Array( [ 0.3, -0.4 ] );
	T = new Float64Array( [ 0.8 ] );
	C = new Float64Array( [ 1.0, 2.0, 3.0, 4.0 ] );
	WORK = new Float64Array( 2 );
	out = dlarzb( 'column-major', 'left', 'no-transpose', 'backward', 'rowwise', 0, 2, 1, 2, V, 1, T, 1, C, 1, WORK, 2 );
	assert.strictEqual( out, C, 'returns C' );
	assert.strictEqual( C[ 0 ], 1.0 );
	assert.strictEqual( C[ 1 ], 2.0 );
	assert.strictEqual( C[ 2 ], 3.0 );
	assert.strictEqual( C[ 3 ], 4.0 );
});

test( 'dlarzb applies a single reflector (column-major, side=left)', function t() {
	var WORK;
	var tol;
	var V;
	var T;
	var C;

	// Applies H*C where H = I - V^T * T * V, V = [0.3, -0.4], T = [0.8], M=3, N=2, K=1, L=2.
	V = new Float64Array( [ 0.3, -0.4 ] );
	T = new Float64Array( [ 0.8 ] );
	C = new Float64Array( [ 1.0, 2.0, 3.0, 4.0, 5.0, 6.0 ] );
	WORK = new Float64Array( 2 );

	// Expected: j=1 gives [0.68, 1.904, 3.128]; j=2 gives [1.52, 4.256, 6.992].
	dlarzb( 'column-major', 'left', 'no-transpose', 'backward', 'rowwise', 3, 2, 1, 2, V, 1, T, 1, C, 3, WORK, 2 );
	tol = 1e-13;
	assert.ok( Math.abs( C[ 0 ] - 0.68 ) < tol, 'C[0]' );
	assert.ok( Math.abs( C[ 1 ] - 1.904 ) < tol, 'C[1]' );
	assert.ok( Math.abs( C[ 2 ] - 3.128 ) < tol, 'C[2]' );
	assert.ok( Math.abs( C[ 3 ] - 1.52 ) < tol, 'C[3]' );
	assert.ok( Math.abs( C[ 4 ] - 4.256 ) < tol, 'C[4]' );
	assert.ok( Math.abs( C[ 5 ] - 6.992 ) < tol, 'C[5]' );
});

test( 'dlarzb with row-major layout matches column-major result', function t() {
	var WORK;
	var tol;
	var V;
	var T;
	var C;

	// Same problem as previous test but with row-major C storage: [ 1, 4, 2, 5, 3, 6 ].
	V = new Float64Array( [ 0.3, -0.4 ] );
	T = new Float64Array( [ 0.8 ] );
	C = new Float64Array( [ 1.0, 4.0, 2.0, 5.0, 3.0, 6.0 ] );
	WORK = new Float64Array( 2 );

	dlarzb( 'row-major', 'left', 'no-transpose', 'backward', 'rowwise', 3, 2, 1, 2, V, 2, T, 1, C, 2, WORK, 1 );
	tol = 1e-13;
	assert.ok( Math.abs( C[ 0 ] - 0.68 ) < tol );
	assert.ok( Math.abs( C[ 1 ] - 1.52 ) < tol );
	assert.ok( Math.abs( C[ 2 ] - 1.904 ) < tol );
	assert.ok( Math.abs( C[ 3 ] - 4.256 ) < tol );
	assert.ok( Math.abs( C[ 4 ] - 3.128 ) < tol );
	assert.ok( Math.abs( C[ 5 ] - 6.992 ) < tol );
});
