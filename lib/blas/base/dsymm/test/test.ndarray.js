/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dsymm from './../lib/ndarray.js';

// FIXTURES //

import left_upper_basic from './fixtures/left_upper_basic.json' with { type: 'json' };
import left_lower_basic from './fixtures/left_lower_basic.json' with { type: 'json' };
import right_upper_basic from './fixtures/right_upper_basic.json' with { type: 'json' };
import right_lower_basic from './fixtures/right_lower_basic.json' with { type: 'json' };
import alpha_beta_scaling from './fixtures/alpha_beta_scaling.json' with { type: 'json' };
import alpha_zero from './fixtures/alpha_zero.json' with { type: 'json' };
import m_zero from './fixtures/m_zero.json' with { type: 'json' };
import n_zero from './fixtures/n_zero.json' with { type: 'json' };
import scalar from './fixtures/scalar.json' with { type: 'json' };
import beta_zero from './fixtures/beta_zero.json' with { type: 'json' };
import alpha_zero_beta_zero from './fixtures/alpha_zero_beta_zero.json' with { type: 'json' };
import left_lower_nonzero_beta from './fixtures/left_lower_nonzero_beta.json' with { type: 'json' };
import right_upper_nonzero_beta from './fixtures/right_upper_nonzero_beta.json' with { type: 'json' };

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

test( 'dsymm: left_upper_basic', function t() {
	var tc = left_upper_basic;

	// A is 3x3 symmetric (upper stored), col-major
	var A = new Float64Array([
		2.0,
		0.0,
		0.0, // col 1 (only A(1,1)=2 matters for upper)
		1.0,
		4.0,
		0.0, // col 2 (A(1,2)=1, A(2,2)=4)
		3.0,
		2.0,
		5.0  // col 3 (A(1,3)=3, A(2,3)=2, A(3,3)=5)
	]);
	var B = new Float64Array([
		1.0,
		2.0,
		3.0, // col 1
		4.0,
		5.0,
		6.0  // col 2
	]);
	var C = new Float64Array( 6 );

	dsymm( 'left', 'upper', 3, 2, 1.0, A, 1, 3, 0, B, 1, 3, 0, 0.0, C, 1, 3, 0 );
	assertArrayClose( toArray( C ), tc.C, 1e-14, 'C' );
});

test( 'dsymm: left_lower_basic', function t() {
	var tc = left_lower_basic;

	// Same symmetric matrix, lower stored
	var A = new Float64Array([
		2.0,
		1.0,
		3.0, // col 1 (A(1,1)=2, A(2,1)=1, A(3,1)=3)
		0.0,
		4.0,
		2.0, // col 2 (A(2,2)=4, A(3,2)=2)
		0.0,
		0.0,
		5.0  // col 3 (A(3,3)=5)
	]);
	var B = new Float64Array([
		1.0,
		2.0,
		3.0,
		4.0,
		5.0,
		6.0
	]);
	var C = new Float64Array( 6 );

	dsymm( 'left', 'lower', 3, 2, 1.0, A, 1, 3, 0, B, 1, 3, 0, 0.0, C, 1, 3, 0 );
	assertArrayClose( toArray( C ), tc.C, 1e-14, 'C' );
});

test( 'dsymm: right_upper_basic', function t() {
	var tc = right_upper_basic;

	// A is 3x3 symmetric (upper), B is 2x3, C is 2x3
	var A = new Float64Array([
		2.0,
		0.0,
		0.0,
		1.0,
		4.0,
		0.0,
		3.0,
		2.0,
		5.0
	]);
	var B = new Float64Array([
		1.0,
		2.0, // col 1
		3.0,
		4.0, // col 2
		5.0,
		6.0  // col 3
	]);
	var C = new Float64Array( 6 );

	dsymm( 'right', 'upper', 2, 3, 1.0, A, 1, 3, 0, B, 1, 2, 0, 0.0, C, 1, 2, 0 );
	assertArrayClose( toArray( C ), tc.C, 1e-14, 'C' );
});

test( 'dsymm: right_lower_basic', function t() {
	var tc = right_lower_basic;
	var A = new Float64Array([
		2.0,
		1.0,
		3.0,
		0.0,
		4.0,
		2.0,
		0.0,
		0.0,
		5.0
	]);
	var B = new Float64Array([
		1.0,
		2.0,
		3.0,
		4.0,
		5.0,
		6.0
	]);
	var C = new Float64Array( 6 );

	dsymm( 'right', 'lower', 2, 3, 1.0, A, 1, 3, 0, B, 1, 2, 0, 0.0, C, 1, 2, 0 );
	assertArrayClose( toArray( C ), tc.C, 1e-14, 'C' );
});

test( 'dsymm: alpha_beta_scaling', function t() {
	var tc = alpha_beta_scaling;
	var A = new Float64Array([
		2.0,
		0.0,
		0.0,
		1.0,
		4.0,
		0.0,
		3.0,
		2.0,
		5.0
	]);
	var B = new Float64Array([
		1.0,
		2.0,
		3.0,
		4.0,
		5.0,
		6.0
	]);
	var C = new Float64Array([
		1.0,
		1.0,
		1.0,
		1.0,
		1.0,
		1.0
	]);

	dsymm( 'left', 'upper', 3, 2, 2.0, A, 1, 3, 0, B, 1, 3, 0, 3.0, C, 1, 3, 0 );
	assertArrayClose( toArray( C ), tc.C, 1e-14, 'C' );
});

test( 'dsymm: alpha_zero', function t() {
	var tc = alpha_zero;
	var A = new Float64Array( 9 );
	var B = new Float64Array( 4 );
	var C = new Float64Array([ 1.0, 2.0, 3.0, 4.0 ]);

	dsymm( 'left', 'upper', 2, 2, 0.0, A, 1, 2, 0, B, 1, 2, 0, 2.0, C, 1, 2, 0 );
	assertArrayClose( toArray( C ), tc.C, 1e-14, 'C' );
});

test( 'dsymm: m_zero', function t() {
	var tc = m_zero;
	var A = new Float64Array( 1 );
	var B = new Float64Array( 1 );
	var C = new Float64Array([ 99.0 ]);

	dsymm( 'left', 'upper', 0, 2, 1.0, A, 1, 1, 0, B, 1, 1, 0, 0.0, C, 1, 1, 0 );
	assertClose( C[ 0 ], tc.C1, 1e-14, 'C1' );
});

test( 'dsymm: n_zero', function t() {
	var tc = n_zero;
	var A = new Float64Array( 4 );
	var B = new Float64Array( 4 );
	var C = new Float64Array([ 99.0 ]);

	dsymm( 'left', 'upper', 2, 0, 1.0, A, 1, 2, 0, B, 1, 2, 0, 0.0, C, 1, 2, 0 );
	assertClose( C[ 0 ], tc.C1, 1e-14, 'C1' );
});

test( 'dsymm: scalar', function t() {
	var tc = scalar;
	var A = new Float64Array([ 3.0 ]);
	var B = new Float64Array([ 5.0 ]);
	var C = new Float64Array( 1 );

	dsymm( 'left', 'upper', 1, 1, 2.0, A, 1, 1, 0, B, 1, 1, 0, 0.0, C, 1, 1, 0 );
	assertClose( C[ 0 ], tc.C1, 1e-14, 'C1' );
});

test( 'dsymm: beta_zero', function t() {
	var tc = beta_zero;

	// A = I (2x2), B = [2 4; 3 5]
	var A = new Float64Array([ 1.0, 0.0, 0.0, 1.0 ]);
	var B = new Float64Array([ 2.0, 3.0, 4.0, 5.0 ]);
	var C = new Float64Array([ 999.0, 999.0, 999.0, 999.0 ]);

	dsymm( 'left', 'lower', 2, 2, 1.0, A, 1, 2, 0, B, 1, 2, 0, 0.0, C, 1, 2, 0 );
	assertArrayClose( toArray( C ), tc.C, 1e-14, 'C' );
});

test( 'dsymm: alpha_zero_beta_zero (zeros C)', function t() {
	var tc = alpha_zero_beta_zero;
	var A = new Float64Array( 4 );
	var B = new Float64Array( 4 );
	var C = new Float64Array([ 99.0, 88.0, 77.0, 66.0 ]);

	dsymm( 'left', 'upper', 2, 2, 0.0, A, 1, 2, 0, B, 1, 2, 0, 0.0, C, 1, 2, 0 );
	assertArrayClose( toArray( C ), tc.C, 1e-14, 'C' );
});

test( 'dsymm: left_lower_nonzero_beta', function t() {
	var tc = left_lower_nonzero_beta;
	var A = new Float64Array([
		2.0,
		1.0,
		3.0,
		0.0,
		4.0,
		2.0,
		0.0,
		0.0,
		5.0
	]);
	var B = new Float64Array([
		1.0,
		2.0,
		3.0,
		4.0,
		5.0,
		6.0
	]);
	var C = new Float64Array([
		1.0,
		1.0,
		1.0,
		1.0,
		1.0,
		1.0
	]);

	dsymm( 'left', 'lower', 3, 2, 2.0, A, 1, 3, 0, B, 1, 3, 0, 0.5, C, 1, 3, 0 );
	assertArrayClose( toArray( C ), tc.C, 1e-14, 'C' );
});

test( 'dsymm: right_upper_nonzero_beta', function t() {
	var tc = right_upper_nonzero_beta;
	var A = new Float64Array([
		2.0,
		0.0,
		0.0,
		1.0,
		4.0,
		0.0,
		3.0,
		2.0,
		5.0
	]);
	var B = new Float64Array([
		1.0,
		2.0,
		3.0,
		4.0,
		5.0,
		6.0
	]);
	var C = new Float64Array([
		1.0,
		2.0,
		3.0,
		4.0,
		5.0,
		6.0
	]);

	dsymm( 'right', 'upper', 2, 3, 1.0, A, 1, 3, 0, B, 1, 2, 0, 0.5, C, 1, 2, 0 );
	assertArrayClose( toArray( C ), tc.C, 1e-14, 'C' );
});
