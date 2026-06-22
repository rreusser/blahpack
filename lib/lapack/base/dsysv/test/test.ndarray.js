/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import dsysv from './../lib/ndarray.js';

// FIXTURES //

import upper_4x4 from './fixtures/upper_4x4.json' with { type: 'json' };
import lower_4x4 from './fixtures/lower_4x4.json' with { type: 'json' };
import multi_rhs from './fixtures/multi_rhs.json' with { type: 'json' };
import n1 from './fixtures/n1.json' with { type: 'json' };
import pivot_2x2_upper from './fixtures/pivot_2x2_upper.json' with { type: 'json' };
import pivot_2x2_lower from './fixtures/pivot_2x2_lower.json' with { type: 'json' };

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
* Convert Fortran 1-based IPIV to 0-based JS convention.
* Positive values: subtract 1 (1-based to 0-based).
* Negative values: stay the same (Fortran -k maps to JS ~(k-1) = -k).
*/
function ipivTo0Based( ipiv ) {
	var out = [];
	var i;
	for ( i = 0; i < ipiv.length; i++ ) {
		if ( ipiv[ i ] > 0 ) {
			out.push( ipiv[ i ] - 1 );
		} else {
			out.push( ipiv[ i ] );
		}
	}
	return out;
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

test( 'dsysv: upper_4x4 - solves symmetric system with upper storage', function t() { // eslint-disable-line max-len
	var expectedIPIV;
	var IPIV;
	var info;
	var tc;
	var A;
	var B;

	tc = upper_4x4;
	expectedIPIV = ipivTo0Based( tc.ipiv );
	IPIV = new Int32Array( 4 );
	A = new Float64Array([
		4,
		1,
		2,
		3,
		1,
		5,
		1,
		2,
		2,
		1,
		6,
		1,
		3,
		2,
		1,
		7
	]);
	B = new Float64Array([ 24, 22, 26, 38 ]);
	info = dsysv( 'upper', 4, 1, A, 1, 4, 0, IPIV, 1, 0, B, 1, 4, 0 );
	assert.equal( info, tc.info, 'info' );
	assertArrayClose( toArray( B ), tc.x, 1e-14, 'x' );
	assert.deepStrictEqual( toArray( IPIV ), expectedIPIV, 'ipiv' );
});

test( 'dsysv: lower_4x4 - solves symmetric system with lower storage', function t() { // eslint-disable-line max-len
	var expectedIPIV;
	var IPIV;
	var info;
	var tc;
	var A;
	var B;

	tc = lower_4x4;
	expectedIPIV = ipivTo0Based( tc.ipiv );
	IPIV = new Int32Array( 4 );
	A = new Float64Array([
		4,
		1,
		2,
		3,
		1,
		5,
		1,
		2,
		2,
		1,
		6,
		1,
		3,
		2,
		1,
		7
	]);
	B = new Float64Array([ 24, 22, 26, 38 ]);
	info = dsysv( 'lower', 4, 1, A, 1, 4, 0, IPIV, 1, 0, B, 1, 4, 0 );
	assert.equal( info, tc.info, 'info' );
	assertArrayClose( toArray( B ), tc.x, 1e-14, 'x' );
	assert.deepStrictEqual( toArray( IPIV ), expectedIPIV, 'ipiv' );
});

test( 'dsysv: multi_rhs - multiple right-hand sides', function t() {
	var expectedIPIV;
	var IPIV;
	var info;
	var tc;
	var A;
	var B;

	tc = multi_rhs;
	expectedIPIV = ipivTo0Based( tc.ipiv );
	IPIV = new Int32Array( 2 );
	A = new Float64Array([
		2,
		-1,
		-1,
		3
	]);
	B = new Float64Array([ 1, 5, 4, 7 ]);
	info = dsysv( 'upper', 2, 2, A, 1, 2, 0, IPIV, 1, 0, B, 1, 2, 0 );
	assert.equal( info, tc.info, 'info' );
	assertArrayClose( toArray( B ), tc.x, 1e-14, 'x' );
	assert.deepStrictEqual( toArray( IPIV ), expectedIPIV, 'ipiv' );
});

test( 'dsysv: singular - returns info > 0 for singular matrix', function t() {
	var IPIV;
	var info;
	var A;
	var B;

	IPIV = new Int32Array( 2 );
	A = new Float64Array([ 1, 2, 2, 4 ]);
	B = new Float64Array([ 1, 2 ]);
	info = dsysv( 'upper', 2, 1, A, 1, 2, 0, IPIV, 1, 0, B, 1, 2, 0 );
	assert.ok( info > 0, 'info should be > 0 for singular matrix' );
});

test( 'dsysv: n1 - N=1 edge case', function t() {
	var expectedIPIV;
	var IPIV;
	var info;
	var tc;
	var A;
	var B;

	tc = n1;
	expectedIPIV = ipivTo0Based( tc.ipiv );
	IPIV = new Int32Array( 1 );
	A = new Float64Array([ 3 ]);
	B = new Float64Array([ 9 ]);
	info = dsysv( 'upper', 1, 1, A, 1, 1, 0, IPIV, 1, 0, B, 1, 1, 0 );
	assert.equal( info, tc.info, 'info' );
	assertArrayClose( toArray( B ), tc.x, 1e-14, 'x' );
	assert.deepStrictEqual( toArray( IPIV ), expectedIPIV, 'ipiv' );
});

test( 'dsysv: pivot_2x2_upper - matrix triggering 2x2 pivots (upper)', function t() { // eslint-disable-line max-len
	var expectedIPIV;
	var IPIV;
	var info;
	var tc;
	var A;
	var B;

	tc = pivot_2x2_upper;
	expectedIPIV = ipivTo0Based( tc.ipiv );
	IPIV = new Int32Array( 4 );
	A = new Float64Array([
		0,
		1,
		0,
		0,
		1,
		0,
		0,
		0,
		0,
		0,
		4,
		1,
		0,
		0,
		1,
		4
	]);
	B = new Float64Array([ 1, 1, 5, 5 ]);
	info = dsysv( 'upper', 4, 1, A, 1, 4, 0, IPIV, 1, 0, B, 1, 4, 0 );
	assert.equal( info, tc.info, 'info' );
	assertArrayClose( toArray( B ), tc.x, 1e-14, 'x' );
	assert.deepStrictEqual( toArray( IPIV ), expectedIPIV, 'ipiv' );
});

test( 'dsysv: pivot_2x2_lower - matrix triggering 2x2 pivots (lower)', function t() { // eslint-disable-line max-len
	var expectedIPIV;
	var IPIV;
	var info;
	var tc;
	var A;
	var B;

	tc = pivot_2x2_lower;
	expectedIPIV = ipivTo0Based( tc.ipiv );
	IPIV = new Int32Array( 4 );
	A = new Float64Array([
		0,
		1,
		0,
		0,
		1,
		0,
		0,
		0,
		0,
		0,
		4,
		1,
		0,
		0,
		1,
		4
	]);
	B = new Float64Array([ 1, 1, 5, 5 ]);
	info = dsysv( 'lower', 4, 1, A, 1, 4, 0, IPIV, 1, 0, B, 1, 4, 0 );
	assert.equal( info, tc.info, 'info' );
	assertArrayClose( toArray( B ), tc.x, 1e-14, 'x' );
	assert.deepStrictEqual( toArray( IPIV ), expectedIPIV, 'ipiv' );
});

test( 'dsysv: n_zero - N=0 quick return', function t() {
	var IPIV;
	var info;
	var A;
	var B;

	IPIV = new Int32Array( 1 );
	A = new Float64Array([ 1 ]);
	B = new Float64Array([ 1 ]);
	info = dsysv( 'upper', 0, 1, A, 1, 1, 0, IPIV, 1, 0, B, 1, 1, 0 );
	assert.equal( info, 0, 'info' );
});

test( 'dsysv: nrhs_zero - NRHS=0 quick return', function t() {
	var IPIV;
	var info;
	var A;
	var B;

	IPIV = new Int32Array( 1 );
	A = new Float64Array([ 5 ]);
	B = new Float64Array([ 10 ]);
	info = dsysv( 'upper', 1, 0, A, 1, 1, 0, IPIV, 1, 0, B, 1, 1, 0 );
	assert.equal( info, 0, 'info' );
});
