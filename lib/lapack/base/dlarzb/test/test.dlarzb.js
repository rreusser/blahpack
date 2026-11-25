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
import dlarzb from './../lib/dlarzb.js';
import dlarzbNd from './../lib/ndarray.js';


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
	const x = makeInputs();
	assert.throws( function throws() {
		dlarzb( 'invalid', 'left', 'no-transpose', 'backward', 'rowwise', 2, 3, 1, 2, x.V, 1, x.T, 1, x.C, 2, x.WORK, 3 );
	}, TypeError );
});

test( 'dlarzb throws TypeError for invalid side', function t() {
	const x = makeInputs();
	assert.throws( function throws() {
		dlarzb( 'column-major', 'invalid', 'no-transpose', 'backward', 'rowwise', 2, 3, 1, 2, x.V, 1, x.T, 1, x.C, 2, x.WORK, 3 );
	}, TypeError );
});

test( 'dlarzb throws TypeError for invalid trans', function t() {
	const x = makeInputs();
	assert.throws( function throws() {
		dlarzb( 'column-major', 'left', 'invalid', 'backward', 'rowwise', 2, 3, 1, 2, x.V, 1, x.T, 1, x.C, 2, x.WORK, 3 );
	}, TypeError );
});

test( 'dlarzb throws TypeError for invalid direct', function t() {
	const x = makeInputs();
	assert.throws( function throws() {
		dlarzb( 'column-major', 'left', 'no-transpose', 'forward', 'rowwise', 2, 3, 1, 2, x.V, 1, x.T, 1, x.C, 2, x.WORK, 3 );
	}, TypeError );
});

test( 'dlarzb throws TypeError for invalid storev', function t() {
	const x = makeInputs();
	assert.throws( function throws() {
		dlarzb( 'column-major', 'left', 'no-transpose', 'backward', 'columnwise', 2, 3, 1, 2, x.V, 1, x.T, 1, x.C, 2, x.WORK, 3 );
	}, TypeError );
});

test( 'dlarzb throws RangeError for negative M', function t() {
	const x = makeInputs();
	assert.throws( function throws() {
		dlarzb( 'column-major', 'left', 'no-transpose', 'backward', 'rowwise', -1, 3, 1, 2, x.V, 1, x.T, 1, x.C, 2, x.WORK, 3 );
	}, RangeError );
});

test( 'dlarzb throws RangeError for negative N', function t() {
	const x = makeInputs();
	assert.throws( function throws() {
		dlarzb( 'column-major', 'left', 'no-transpose', 'backward', 'rowwise', 2, -1, 1, 2, x.V, 1, x.T, 1, x.C, 2, x.WORK, 3 );
	}, RangeError );
});

test( 'dlarzb throws RangeError for negative K', function t() {
	const x = makeInputs();
	assert.throws( function throws() {
		dlarzb( 'column-major', 'left', 'no-transpose', 'backward', 'rowwise', 2, 3, -1, 2, x.V, 1, x.T, 1, x.C, 2, x.WORK, 3 );
	}, RangeError );
});

test( 'dlarzb throws RangeError for negative L', function t() {
	const x = makeInputs();
	assert.throws( function throws() {
		dlarzb( 'column-major', 'left', 'no-transpose', 'backward', 'rowwise', 2, 3, 1, -1, x.V, 1, x.T, 1, x.C, 2, x.WORK, 3 );
	}, RangeError );
});

test( 'dlarzb throws RangeError for LDT < K', function t() {
	const x = makeInputs();
	assert.throws( function throws() {
		dlarzb( 'column-major', 'left', 'no-transpose', 'backward', 'rowwise', 2, 3, 2, 2, x.V, 2, x.T, 1, x.C, 2, x.WORK, 3 );
	}, RangeError );
});

test( 'dlarzb throws RangeError for LDC < M (column-major)', function t() {
	const x = makeInputs();
	assert.throws( function throws() {
		dlarzb( 'column-major', 'left', 'no-transpose', 'backward', 'rowwise', 2, 3, 1, 2, x.V, 1, x.T, 1, x.C, 1, x.WORK, 3 );
	}, RangeError );
});

test( 'dlarzb returns C unchanged for M=0', function t() {

	const V = new Float64Array( [ 0.3, -0.4 ] );
	const T = new Float64Array( [ 0.8 ] );
	const C = new Float64Array( [ 1.0, 2.0, 3.0, 4.0 ] );
	const WORK = new Float64Array( 2 );
	const out = dlarzb( 'column-major', 'left', 'no-transpose', 'backward', 'rowwise', 0, 2, 1, 2, V, 1, T, 1, C, 1, WORK, 2 );
	assert.strictEqual( out, C, 'returns C' );
	assert.strictEqual( C[ 0 ], 1.0 );
	assert.strictEqual( C[ 1 ], 2.0 );
	assert.strictEqual( C[ 2 ], 3.0 );
	assert.strictEqual( C[ 3 ], 4.0 );
});

test( 'dlarzb applies a single reflector (column-major, side=left)', function t() {

	// Applies H*C where H = I - V^T * T * V, V = [0.3, -0.4], T = [0.8], M=3, N=2, K=1, L=2.
	const V = new Float64Array( [ 0.3, -0.4 ] );
	const T = new Float64Array( [ 0.8 ] );
	const C = new Float64Array( [ 1.0, 2.0, 3.0, 4.0, 5.0, 6.0 ] );
	const WORK = new Float64Array( 2 );

	// Expected: j=1 gives [0.68, 1.904, 3.128]; j=2 gives [1.52, 4.256, 6.992].
	dlarzb( 'column-major', 'left', 'no-transpose', 'backward', 'rowwise', 3, 2, 1, 2, V, 1, T, 1, C, 3, WORK, 2 );
	const tol = 1e-13;
	assert.ok( Math.abs( C[ 0 ] - 0.68 ) < tol, 'C[0]' );
	assert.ok( Math.abs( C[ 1 ] - 1.904 ) < tol, 'C[1]' );
	assert.ok( Math.abs( C[ 2 ] - 3.128 ) < tol, 'C[2]' );
	assert.ok( Math.abs( C[ 3 ] - 1.52 ) < tol, 'C[3]' );
	assert.ok( Math.abs( C[ 4 ] - 4.256 ) < tol, 'C[4]' );
	assert.ok( Math.abs( C[ 5 ] - 6.992 ) < tol, 'C[5]' );
});

test( 'dlarzb with row-major layout matches column-major result', function t() {

	// Same problem as previous test but with row-major C storage: [ 1, 4, 2, 5, 3, 6 ].
	const V = new Float64Array( [ 0.3, -0.4 ] );
	const T = new Float64Array( [ 0.8 ] );
	const C = new Float64Array( [ 1.0, 4.0, 2.0, 5.0, 3.0, 6.0 ] );
	const WORK = new Float64Array( 2 );

	dlarzb( 'row-major', 'left', 'no-transpose', 'backward', 'rowwise', 3, 2, 1, 2, V, 2, T, 1, C, 2, WORK, 1 );
	const tol = 1e-13;
	assert.ok( Math.abs( C[ 0 ] - 0.68 ) < tol );
	assert.ok( Math.abs( C[ 1 ] - 1.52 ) < tol );
	assert.ok( Math.abs( C[ 2 ] - 1.904 ) < tol );
	assert.ok( Math.abs( C[ 3 ] - 4.256 ) < tol );
	assert.ok( Math.abs( C[ 4 ] - 3.128 ) < tol );
	assert.ok( Math.abs( C[ 5 ] - 6.992 ) < tol );
});

test( 'dlarzb: leading-dimension bounds follow the array extents (ticket 0087)', function t() {
	// rowwise V is K by L (DLARZB: LDV >= K).
	function F() {
		return new Float64Array( 1024 );
	}
	function call( order, ld ) {
		const L = { 'LDV': 16, 'LDT': 16, 'LDC': 16, 'LDWORK': 16 };
		Object.assign( L, ld );
		return dlarzb( order, 'left', 'no-transpose', 'backward', 'rowwise', 6, 5, 2, 3, F(), L.LDV, F(), L.LDT, F(), L.LDC, F(), L.LDWORK );
	}
	assert.doesNotThrow( function ok() {
		call( 'column-major', { 'LDV': 2 } );
	}, 'column-major LDV = 2 is accepted' );
});

test( 'dlarzb matches ndarray (both layouts, both sides, allocated and provided WORK)', function t() {
	const sides = [ 'left', 'right' ];
	const orders = [ 'column-major', 'row-major' ];
	let order;
	let side;
	let i;
	let j;
	for ( i = 0; i < orders.length; i++ ) {
		order = orders[ i ];
		for ( j = 0; j < sides.length; j++ ) {
			side = sides[ j ];
			checkAgainstNdarray( order, side, 'transpose', null );
			checkAgainstNdarray( order, side, 'no-transpose', new Float64Array( 64 ) );
		}
	}
});


// FUNCTIONS //

/**
* Returns a deterministic pseudo-random array.
*
* @private
* @param {NonNegativeInteger} n - length
* @param {integer} seed - seed
* @returns {Float64Array} array
*/
function fill( n, seed ) {
	const out = new Float64Array( n );
	let s = seed;
	let i;
	for ( i = 0; i < n; i++ ) {
		s = ( ( s * 1103515245 ) + 12345 ) % 2147483648;
		out[ i ] = ( s / 1073741824 ) - 1.0;
	}
	return out;
}

/**
* Calls the layout wrapper and `ndarray` on the same data and asserts identical outputs.
*
* @private
* @param {string} order - layout
* @param {string} side - side
* @param {string} trans - transpose operation
* @param {(Float64Array|null)} WORK - workspace passed to the wrapper
*/
function checkAgainstNdarray( order, side, trans, WORK ) {
	const M = 6;
	const N = 5;
	const K = 2;
	const L = 3;
	const LDV = 7;
	const LDT = 3;
	const LDC = 8;
	const LDWORK = 7;
	const V = fill( 64, 3 );
	const T = fill( 16, 5 );
	const C1 = fill( 64, 7 );
	const C2 = fill( 64, 7 );
	const W2 = new Float64Array( 64 );
	let sv1 = 1;
	let sv2 = LDV;
	let st1 = 1;
	let st2 = LDT;
	let sc1 = 1;
	let sc2 = LDC;
	let sw1 = 1;
	let sw2 = LDWORK;
	let out;
	let i;
	if ( order === 'row-major' ) {
		sv1 = LDV;
		sv2 = 1;
		st1 = LDT;
		st2 = 1;
		sc1 = LDC;
		sc2 = 1;
		sw1 = LDWORK;
		sw2 = 1;
	}
	out = dlarzb( order, side, trans, 'backward', 'rowwise', M, N, K, L, V, LDV, T, LDT, C1, LDC, WORK, LDWORK );
	assert.strictEqual( out, C1, 'returns C' );
	dlarzbNd( side, trans, 'backward', 'rowwise', M, N, K, L, V, sv1, sv2, 0, T, st1, st2, 0, C2, sc1, sc2, 0, W2, sw1, sw2, 0 );
	for ( i = 0; i < C1.length; i++ ) {
		assert.strictEqual( C1[ i ], C2[ i ], order + ' ' + side + ' ' + trans + ' C[' + i + ']' );
	}
	assert.notDeepStrictEqual( C1, fill( 64, 7 ), 'C was modified' );
}
