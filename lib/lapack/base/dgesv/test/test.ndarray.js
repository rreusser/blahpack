/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import dgesv from './../lib/ndarray.js';

// FIXTURES //

import solve_3x3 from './fixtures/solve_3x3.json' with { type: 'json' };
import singular from './fixtures/singular.json' with { type: 'json' };
import n_zero from './fixtures/n_zero.json' with { type: 'json' };
import nrhs_zero from './fixtures/nrhs_zero.json' with { type: 'json' };
import multi_rhs from './fixtures/multi_rhs.json' with { type: 'json' };
import _1x1 from './fixtures/1x1.json' with { type: 'json' };
import _4x4 from './fixtures/4x4.json' with { type: 'json' };

// FUNCTIONS //

/**
* Asserts that two numbers are approximately equal.
*
* @private
* @param {*} actual - actual value
* @param {*} expected - expected value
* @param {number} tol - tolerance
* @param {string} msg - assertion message
*/
function assertClose( actual, expected, tol, msg ) {
	var relErr = Math.abs( actual - expected ) / Math.max( Math.abs( expected ), 1.0 ); // eslint-disable-line max-len
	assert.ok( relErr <= tol, msg + ': expected ' + expected + ', got ' + actual );
}

/**
* Asserts that two arrays are element-wise approximately equal.
*
* @private
* @param {*} actual - actual value
* @param {*} expected - expected value
* @param {number} tol - tolerance
* @param {string} msg - assertion message
*/
function assertArrayClose( actual, expected, tol, msg ) {
	var i;
	assert.equal( actual.length, expected.length, msg + ': length mismatch' );
	for ( i = 0; i < expected.length; i++ ) {
		assertClose( actual[ i ], expected[ i ], tol, msg + '[' + i + ']' );
	}
}

/**
* Computes matrix-matrix product C = A*B (col-major, N x N times N x NRHS).
*/
function matmat( A, B, N, nrhs ) {
	var C = new Float64Array( N * nrhs );
	var i;
	var j;
	var k;
	for ( j = 0; j < nrhs; j++ ) {
		for ( i = 0; i < N; i++ ) {
			for ( k = 0; k < N; k++ ) {
				C[ i + j * N ] += A[ i + k * N ] * B[ k + j * N ];
			}
		}
	}
	return C;
}

/**
* Converts a typed array to a plain array.
*
* @private
* @param {TypedArray} arr - input array
* @returns {Array} output array
*/
function toArray( arr ) {
	var out = [];
	var i;
	for ( i = 0; i < arr.length; i++ ) {
		out.push( arr[ i ] );
	}
	return out;
}

// TESTS //

test( 'dgesv: solve_3x3', function t() {
	var Aorig;
	var Borig;
	var IPIV;
	var info;
	var tc;
	var AB;
	var A;
	var B;

	tc = solve_3x3;
	Aorig = new Float64Array( [ 2.0, 4.0, 8.0, 1.0, 3.0, 7.0, 1.0, 3.0, 9.0 ] );
	A = new Float64Array( Aorig );
	IPIV = new Int32Array( 3 );
	Borig = new Float64Array( [ 4.0, 10.0, 24.0 ] );
	B = new Float64Array( Borig );
	info = dgesv( 3, 1, A, 1, 3, 0, IPIV, 1, 0, B, 1, 3, 0 );
	assert.equal( info, tc.info, 'info' );
	assertArrayClose( toArray( B ), tc.x, 1e-14, 'x' );
	AB = matmat( Aorig, B, 3, 1 );
	assertArrayClose( toArray( AB ), toArray( Borig ), 1e-14, 'A*x=b' );
});

test( 'dgesv: singular', function t() {
	var IPIV;
	var info;
	var tc;
	var A;
	var B;

	tc = singular;
	A = new Float64Array( [ 1.0, 2.0, 3.0, 2.0, 4.0, 6.0, 3.0, 6.0, 9.0 ] );
	IPIV = new Int32Array( 3 );
	B = new Float64Array( [ 1.0, 2.0, 3.0 ] );
	info = dgesv( 3, 1, A, 1, 3, 0, IPIV, 1, 0, B, 1, 3, 0 );
	assert.ok( info > 0, 'info > 0 for singular matrix' );
});

test( 'dgesv: n_zero', function t() {
	var IPIV;
	var info;
	var tc;
	var A;
	var B;

	tc = n_zero;
	A = new Float64Array( 1 );
	IPIV = new Int32Array( 1 );
	B = new Float64Array( 1 );
	info = dgesv( 0, 1, A, 1, 1, 0, IPIV, 1, 0, B, 1, 1, 0 );
	assert.equal( info, tc.info, 'info' );
});

test( 'dgesv: nrhs_zero', function t() {
	var IPIV;
	var info;
	var tc;
	var A;
	var B;

	tc = nrhs_zero;
	A = new Float64Array( [ 5.0 ] );
	IPIV = new Int32Array( 1 );
	B = new Float64Array( 1 );
	info = dgesv( 1, 0, A, 1, 1, 0, IPIV, 1, 0, B, 1, 1, 0 );
	assert.equal( info, tc.info, 'info' );
});

test( 'dgesv: multi_rhs', function t() {
	var Aorig;
	var Borig;
	var IPIV;
	var info;
	var tc;
	var AB;
	var A;
	var B;

	tc = multi_rhs;
	Aorig = new Float64Array( [ 1.0, 3.0, 2.0, 4.0 ] );
	A = new Float64Array( Aorig );
	IPIV = new Int32Array( 2 );
	Borig = new Float64Array( [ 5.0, 6.0, 11.0, 12.0 ] );
	B = new Float64Array( Borig );
	info = dgesv( 2, 2, A, 1, 2, 0, IPIV, 1, 0, B, 1, 2, 0 );
	assert.equal( info, tc.info, 'info' );
	assertArrayClose( toArray( B ), tc.x, 1e-14, 'x' );
	AB = matmat( Aorig, B, 2, 2 );
	assertArrayClose( toArray( AB ), toArray( Borig ), 1e-14, 'A*X=B' );
});

test( 'dgesv: 1x1', function t() {
	var IPIV;
	var info;
	var tc;
	var A;
	var B;

	tc = _1x1;
	A = new Float64Array( [ 5.0 ] );
	IPIV = new Int32Array( 1 );
	B = new Float64Array( [ 10.0 ] );
	info = dgesv( 1, 1, A, 1, 1, 0, IPIV, 1, 0, B, 1, 1, 0 );
	assert.equal( info, tc.info, 'info' );
	assertArrayClose( toArray( B ), tc.x, 1e-14, 'x' );
});

test( 'dgesv: 4x4', function t() {
	var Aorig;
	var Borig;
	var IPIV;
	var info;
	var tc;
	var AB;
	var A;
	var B;

	tc = _4x4;
	Aorig = new Float64Array([
		4.0,
		1.0,
		2.0,
		3.0,
		1.0,
		5.0,
		1.0,
		2.0,
		2.0,
		1.0,
		6.0,
		1.0,
		3.0,
		2.0,
		1.0,
		7.0
	]);
	A = new Float64Array( Aorig );
	IPIV = new Int32Array( 4 );
	Borig = new Float64Array( [ 24.0, 22.0, 26.0, 38.0 ] );
	B = new Float64Array( Borig );
	info = dgesv( 4, 1, A, 1, 4, 0, IPIV, 1, 0, B, 1, 4, 0 );
	assert.equal( info, tc.info, 'info' );
	assertArrayClose( toArray( B ), tc.x, 1e-14, 'x' );
	AB = matmat( Aorig, B, 4, 1 );
	assertArrayClose( toArray( AB ), toArray( Borig ), 1e-14, 'A*x=b' );
});
