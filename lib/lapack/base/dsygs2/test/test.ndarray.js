/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dsygs2 from './../lib/ndarray.js';
import dpotrf from '../../dpotrf/lib/base.js';

// FIXTURES //

import itype1_upper from './fixtures/itype1_upper.json' with { type: 'json' };
import itype1_lower from './fixtures/itype1_lower.json' with { type: 'json' };
import itype2_upper from './fixtures/itype2_upper.json' with { type: 'json' };
import itype2_lower from './fixtures/itype2_lower.json' with { type: 'json' };
import itype3_upper from './fixtures/itype3_upper.json' with { type: 'json' };
import n_zero from './fixtures/n_zero.json' with { type: 'json' };
import n_one from './fixtures/n_one.json' with { type: 'json' };

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

// Build the symmetric positive definite B matrix and factorize it
// B = [4 2 0; 2 5 1; 0 1 3]
/**
* MakeBUpper.
*
* @private
* @returns {*} result
*/
function makeBUpper() {
	var B = new Float64Array([
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
	dpotrf( 'upper', 3, B, 1, 3, 0 );
	return B;
}

/**
* MakeBLower.
*
* @private
* @returns {*} result
*/
function makeBLower() {
	var B = new Float64Array([
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
	dpotrf( 'lower', 3, B, 1, 3, 0 );
	return B;
}

// A = [4 2 1; 2 5 3; 1 3 6]
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

test( 'dsygs2: itype1_upper', function t() {
	var info;
	var tc;
	var A;
	var B;

	tc = itype1_upper;
	A = makeAUpper();
	B = makeBUpper();
	info = dsygs2( 1, 'upper', 3, A, 1, 3, 0, B, 1, 3, 0 );
	assert.equal( info, tc.info );
	assertArrayClose( toArray( A ), tc.A, 1e-14, 'A' );
});

test( 'dsygs2: itype1_lower', function t() {
	var info;
	var tc;
	var A;
	var B;

	tc = itype1_lower;
	A = makeALower();
	B = makeBLower();
	info = dsygs2( 1, 'lower', 3, A, 1, 3, 0, B, 1, 3, 0 );
	assert.equal( info, tc.info );
	assertArrayClose( toArray( A ), tc.A, 1e-14, 'A' );
});

test( 'dsygs2: itype2_upper', function t() {
	var info;
	var tc;
	var A;
	var B;

	tc = itype2_upper;
	A = makeAUpper();
	B = makeBUpper();
	info = dsygs2( 2, 'upper', 3, A, 1, 3, 0, B, 1, 3, 0 );
	assert.equal( info, tc.info );
	assertArrayClose( toArray( A ), tc.A, 1e-14, 'A' );
});

test( 'dsygs2: itype2_lower', function t() {
	var info;
	var tc;
	var A;
	var B;

	tc = itype2_lower;
	A = makeALower();
	B = makeBLower();
	info = dsygs2( 2, 'lower', 3, A, 1, 3, 0, B, 1, 3, 0 );
	assert.equal( info, tc.info );
	assertArrayClose( toArray( A ), tc.A, 1e-14, 'A' );
});

test( 'dsygs2: itype3_upper', function t() {
	var info;
	var tc;
	var A;
	var B;

	tc = itype3_upper;
	A = makeAUpper();
	B = makeBUpper();
	info = dsygs2( 3, 'upper', 3, A, 1, 3, 0, B, 1, 3, 0 );
	assert.equal( info, tc.info );
	assertArrayClose( toArray( A ), tc.A, 1e-14, 'A' );
});

test( 'dsygs2: n_zero', function t() {
	var info;
	var tc;
	var A;
	var B;

	tc = n_zero;
	A = new Float64Array( 1 );
	B = new Float64Array( 1 );
	info = dsygs2( 1, 'upper', 0, A, 1, 1, 0, B, 1, 1, 0 );
	assert.equal( info, tc.info );
});

test( 'dsygs2: n_one', function t() {
	var info;
	var tc;
	var A;
	var B;

	tc = n_one;
	A = new Float64Array([ 9.0 ]);
	B = new Float64Array([ 3.0 ]);
	info = dsygs2( 1, 'upper', 1, A, 1, 1, 0, B, 1, 1, 0 );
	assert.equal( info, tc.info );
	assertClose( A[ 0 ], tc.A11, 1e-14, 'A11' );
});
