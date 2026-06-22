/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dsygv from './../lib/ndarray.js';

// FIXTURES //

import itype1_v_upper from './fixtures/itype1_v_upper.json' with { type: 'json' };
import itype1_v_lower from './fixtures/itype1_v_lower.json' with { type: 'json' };
import itype1_n_lower from './fixtures/itype1_n_lower.json' with { type: 'json' };
import itype2_v_upper from './fixtures/itype2_v_upper.json' with { type: 'json' };
import itype3_v_lower from './fixtures/itype3_v_lower.json' with { type: 'json' };
import n_zero from './fixtures/n_zero.json' with { type: 'json' };
import n_one from './fixtures/n_one.json' with { type: 'json' };
import not_posdef from './fixtures/not_posdef.json' with { type: 'json' };

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

// A = [4 2 1; 2 5 3; 1 3 6], B = [4 2 0; 2 5 1; 0 1 3]

/**
* MakeAUpper.
*
* @private
* @returns {*} result
*/
function makeAUpper( ) {
	return new Float64Array([
		4.0,
		0.0,
		0.0,
		2.0,
		5.0,
		0.0,
		1.0,
		3.0,
		6.0
	]);
}

/**
* MakeALower.
*
* @private
* @returns {*} result
*/
function makeALower( ) {
	return new Float64Array([
		4.0,
		2.0,
		1.0,
		0.0,
		5.0,
		3.0,
		0.0,
		0.0,
		6.0
	]);
}

/**
* MakeBUpper.
*
* @private
* @returns {*} result
*/
function makeBUpper( ) {
	return new Float64Array([
		4.0,
		0.0,
		0.0,
		2.0,
		5.0,
		0.0,
		0.0,
		1.0,
		3.0
	]);
}

/**
* MakeBLower.
*
* @private
* @returns {*} result
*/
function makeBLower( ) {
	return new Float64Array([
		4.0,
		2.0,
		0.0,
		0.0,
		5.0,
		1.0,
		0.0,
		0.0,
		3.0
	]);
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

test( 'dsygv: itype1_v_upper', function t() {
	var absExpected;
	var WORK;
	var info;
	var absA;
	var tc;
	var A;
	var B;
	var w;

	tc = itype1_v_upper;
	A = makeAUpper();
	B = makeBUpper();
	w = new Float64Array( 3 );
	WORK = new Float64Array( 100 );
	info = dsygv( 1, 'compute-vectors', 'upper', 3, A, 1, 3, 0, B, 1, 3, 0, w, 1, 0, WORK, 1, 0, 100 ); // eslint-disable-line max-len
	assert.equal( info, tc.info );
	assertArrayClose( toArray( w ), tc.w, 1e-14, 'w' );
	absA = toArray( A ).map( Math.abs );
	absExpected = tc.A.map( Math.abs );
	assertArrayClose( absA, absExpected, 1e-12, 'A' );
});

test( 'dsygv: itype1_v_lower', function t() {
	var absExpected;
	var WORK;
	var info;
	var absA;
	var tc;
	var A;
	var B;
	var w;

	tc = itype1_v_lower;
	A = makeALower();
	B = makeBLower();
	w = new Float64Array( 3 );
	WORK = new Float64Array( 100 );
	info = dsygv( 1, 'compute-vectors', 'lower', 3, A, 1, 3, 0, B, 1, 3, 0, w, 1, 0, WORK, 1, 0, 100 ); // eslint-disable-line max-len
	assert.equal( info, tc.info );
	assertArrayClose( toArray( w ), tc.w, 1e-14, 'w' );
	absA = toArray( A ).map( Math.abs );
	absExpected = tc.A.map( Math.abs );
	assertArrayClose( absA, absExpected, 1e-12, 'A' );
});

test( 'dsygv: itype1_n_lower (eigenvalues only)', function t() {
	var WORK;
	var info;
	var tc;
	var A;
	var B;
	var w;

	tc = itype1_n_lower;
	A = makeALower();
	B = makeBLower();
	w = new Float64Array( 3 );
	WORK = new Float64Array( 100 );
	info = dsygv( 1, 'no-vectors', 'lower', 3, A, 1, 3, 0, B, 1, 3, 0, w, 1, 0, WORK, 1, 0, 100 ); // eslint-disable-line max-len
	assert.equal( info, tc.info );
	assertArrayClose( toArray( w ), tc.w, 1e-14, 'w' );
});

test( 'dsygv: itype2_v_upper', function t() {
	var WORK;
	var info;
	var tc;
	var A;
	var B;
	var w;

	tc = itype2_v_upper;
	A = makeAUpper();
	B = makeBUpper();
	w = new Float64Array( 3 );
	WORK = new Float64Array( 100 );
	info = dsygv( 2, 'compute-vectors', 'upper', 3, A, 1, 3, 0, B, 1, 3, 0, w, 1, 0, WORK, 1, 0, 100 ); // eslint-disable-line max-len
	assert.equal( info, tc.info );
	assertArrayClose( toArray( w ), tc.w, 1e-13, 'w' );
});

test( 'dsygv: itype3_v_lower', function t() {
	var WORK;
	var info;
	var tc;
	var A;
	var B;
	var w;

	tc = itype3_v_lower;
	A = makeALower();
	B = makeBLower();
	w = new Float64Array( 3 );
	WORK = new Float64Array( 100 );
	info = dsygv( 3, 'compute-vectors', 'lower', 3, A, 1, 3, 0, B, 1, 3, 0, w, 1, 0, WORK, 1, 0, 100 ); // eslint-disable-line max-len
	assert.equal( info, tc.info );
	assertArrayClose( toArray( w ), tc.w, 1e-13, 'w' );
});

test( 'dsygv: n_zero', function t() {
	var WORK;
	var info;
	var tc;
	var A;
	var B;
	var w;

	tc = n_zero;
	A = new Float64Array( 1 );
	B = new Float64Array( 1 );
	w = new Float64Array( 1 );
	WORK = new Float64Array( 1 );
	info = dsygv( 1, 'compute-vectors', 'upper', 0, A, 1, 1, 0, B, 1, 1, 0, w, 1, 0, WORK, 1, 0, 1 ); // eslint-disable-line max-len
	assert.equal( info, tc.info );
});

test( 'dsygv: n_one', function t() {
	var WORK;
	var info;
	var tc;
	var A;
	var B;
	var w;

	tc = n_one;
	A = new Float64Array([ 6.0 ]);
	B = new Float64Array([ 2.0 ]);
	w = new Float64Array( 1 );
	WORK = new Float64Array( 100 );
	info = dsygv( 1, 'compute-vectors', 'upper', 1, A, 1, 1, 0, B, 1, 1, 0, w, 1, 0, WORK, 1, 0, 100 ); // eslint-disable-line max-len
	assert.equal( info, tc.info );
	assertClose( w[ 0 ], tc.w1, 1e-14, 'w1' );
	assertClose( A[ 0 ], tc.A1, 1e-14, 'A1' );
});

test( 'dsygv: not_posdef', function t() {
	var WORK;
	var info;
	var tc;
	var A;
	var B;
	var w;

	tc = not_posdef;
	A = new Float64Array([ 1.0, 0.0, 0.0, 1.0 ]);
	B = new Float64Array([ -1.0, 0.0, 0.0, 1.0 ]);
	w = new Float64Array( 2 );
	WORK = new Float64Array( 100 );
	info = dsygv( 1, 'compute-vectors', 'lower', 2, A, 1, 2, 0, B, 1, 2, 0, w, 1, 0, WORK, 1, 0, 100 ); // eslint-disable-line max-len
	assert.equal( info, tc.info );
});
