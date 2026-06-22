/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dtrttp from './../lib/index.js';

// FIXTURES //

import lower_3x3 from './fixtures/lower_3x3.json' with { type: 'json' };
import upper_3x3 from './fixtures/upper_3x3.json' with { type: 'json' };
import lower_4x4 from './fixtures/lower_4x4.json' with { type: 'json' };
import upper_4x4 from './fixtures/upper_4x4.json' with { type: 'json' };
import n_one_lower from './fixtures/n_one_lower.json' with { type: 'json' };
import n_one_upper from './fixtures/n_one_upper.json' with { type: 'json' };
import lower_3x3_lda4 from './fixtures/lower_3x3_lda4.json' with { type: 'json' };
import upper_3x3_lda4 from './fixtures/upper_3x3_lda4.json' with { type: 'json' };

// FUNCTIONS //

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
	var relErr;
	var i;
	assert.equal( actual.length, expected.length, msg + ': length mismatch' );
	for ( i = 0; i < expected.length; i++ ) {
		relErr = Math.abs( actual[i] - expected[i] ) / Math.max( Math.abs( expected[i] ), 1.0 ); // eslint-disable-line max-len
		assert.ok( relErr <= tol, msg + '[' + i + ']: expected ' + expected[i] + ', got ' + actual[i] ); // eslint-disable-line max-len
	}
}

// TESTS //

test( 'dtrttp: main export is a function', function t() {
	assert.strictEqual( typeof dtrttp, 'function' );
});

test( 'dtrttp: attached to the main export is an `ndarray` method', function t() { // eslint-disable-line max-len
	assert.strictEqual( typeof dtrttp.ndarray, 'function' );
});

test( 'dtrttp.ndarray: lower triangular 3x3', function t() {
	var info;
	var tc;
	var AP;
	var A;

	tc = lower_3x3;
	A = new Float64Array( [ 1, 2, 3, 4, 5, 6, 7, 8, 9 ] );
	AP = new Float64Array( 6 );
	info = dtrttp.ndarray( 'lower', 3, A, 1, 3, 0, AP, 1, 0 );
	assert.equal( info, tc.info );
	assertArrayClose( AP, tc.AP, 1e-14, 'lower_3x3 AP' );
});

test( 'dtrttp.ndarray: upper triangular 3x3', function t() {
	var info;
	var tc;
	var AP;
	var A;

	tc = upper_3x3;
	A = new Float64Array( [ 1, 2, 3, 4, 5, 6, 7, 8, 9 ] );
	AP = new Float64Array( 6 );
	info = dtrttp.ndarray( 'upper', 3, A, 1, 3, 0, AP, 1, 0 );
	assert.equal( info, tc.info );
	assertArrayClose( AP, tc.AP, 1e-14, 'upper_3x3 AP' );
});

test( 'dtrttp.ndarray: lower triangular 4x4', function t() {
	var info;
	var tc;
	var AP;
	var A;

	tc = lower_4x4;
	A = new Float64Array( [ 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16 ] ); // eslint-disable-line max-len
	AP = new Float64Array( 10 );
	info = dtrttp.ndarray( 'lower', 4, A, 1, 4, 0, AP, 1, 0 );
	assert.equal( info, tc.info );
	assertArrayClose( AP, tc.AP, 1e-14, 'lower_4x4 AP' );
});

test( 'dtrttp.ndarray: upper triangular 4x4', function t() {
	var info;
	var tc;
	var AP;
	var A;

	tc = upper_4x4;
	A = new Float64Array( [ 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16 ] ); // eslint-disable-line max-len
	AP = new Float64Array( 10 );
	info = dtrttp.ndarray( 'upper', 4, A, 1, 4, 0, AP, 1, 0 );
	assert.equal( info, tc.info );
	assertArrayClose( AP, tc.AP, 1e-14, 'upper_4x4 AP' );
});

test( 'dtrttp.ndarray: N=0 quick return', function t() {
	var info;
	var AP;

	AP = new Float64Array( [ -1.0 ] );
	info = dtrttp.ndarray( 'lower', 0, new Float64Array( 1 ), 1, 1, 0, AP, 1, 0 );
	assert.equal( info, 0 );
	assert.equal( AP[ 0 ], -1.0 );
});

test( 'dtrttp.ndarray: N=1 lower', function t() {
	var info;
	var tc;
	var AP;
	var A;

	tc = n_one_lower;
	A = new Float64Array( [ 42.0 ] );
	AP = new Float64Array( 1 );
	info = dtrttp.ndarray( 'lower', 1, A, 1, 1, 0, AP, 1, 0 );
	assert.equal( info, tc.info );
	assertArrayClose( AP, tc.AP, 1e-14, 'n_one_lower AP' );
});

test( 'dtrttp.ndarray: N=1 upper', function t() {
	var info;
	var tc;
	var AP;
	var A;

	tc = n_one_upper;
	A = new Float64Array( [ 42.0 ] );
	AP = new Float64Array( 1 );
	info = dtrttp.ndarray( 'upper', 1, A, 1, 1, 0, AP, 1, 0 );
	assert.equal( info, tc.info );
	assertArrayClose( AP, tc.AP, 1e-14, 'n_one_upper AP' );
});

test( 'dtrttp.ndarray: lower 3x3 with LDA > N (LDA=4)', function t() {
	var info;
	var tc;
	var AP;
	var A;

	tc = lower_3x3_lda4;
	A = new Float64Array( [ 1, 2, 3, 99, 5, 6, 7, 99, 9, 10, 11, 99 ] );
	AP = new Float64Array( 6 );
	info = dtrttp.ndarray( 'lower', 3, A, 1, 4, 0, AP, 1, 0 );
	assert.equal( info, tc.info );
	assertArrayClose( AP, tc.AP, 1e-14, 'lower_3x3_lda4 AP' );
});

test( 'dtrttp.ndarray: upper 3x3 with LDA > N (LDA=4)', function t() {
	var info;
	var tc;
	var AP;
	var A;

	tc = upper_3x3_lda4;
	A = new Float64Array( [ 1, 2, 3, 99, 5, 6, 7, 99, 9, 10, 11, 99 ] );
	AP = new Float64Array( 6 );
	info = dtrttp.ndarray( 'upper', 3, A, 1, 4, 0, AP, 1, 0 );
	assert.equal( info, tc.info );
	assertArrayClose( AP, tc.AP, 1e-14, 'upper_3x3_lda4 AP' );
});

test( 'dtrttp.ndarray: supports non-unit strides for AP', function t() {
	var info;
	var AP;
	var A;

	A = new Float64Array( [ 1, 2, 3, 4, 5, 6, 7, 8, 9 ] );
	AP = new Float64Array( 12 );
	info = dtrttp.ndarray( 'lower', 3, A, 1, 3, 0, AP, 2, 0 );
	assert.equal( info, 0 );
	assert.equal( AP[ 0 ], 1.0 );
	assert.equal( AP[ 2 ], 2.0 );
	assert.equal( AP[ 4 ], 3.0 );
	assert.equal( AP[ 6 ], 5.0 );
	assert.equal( AP[ 8 ], 6.0 );
	assert.equal( AP[ 10 ], 9.0 );
});

test( 'dtrttp.ndarray: supports offset for A and AP', function t() {
	var info;
	var AP;
	var A;

	A = new Float64Array( [ 99, 99, 1, 2, 3, 4, 5, 6, 7, 8, 9 ] );
	AP = new Float64Array( 8 );
	info = dtrttp.ndarray( 'upper', 3, A, 1, 3, 2, AP, 1, 1 );
	assert.equal( info, 0 );
	assert.equal( AP[ 0 ], 0.0 );
	assert.equal( AP[ 1 ], 1.0 );
	assert.equal( AP[ 2 ], 4.0 );
	assert.equal( AP[ 3 ], 5.0 );
	assert.equal( AP[ 4 ], 7.0 );
	assert.equal( AP[ 5 ], 8.0 );
	assert.equal( AP[ 6 ], 9.0 );
});

test( 'dtrttp.ndarray: supports row-major stride for A', function t() {
	var info;
	var AP;
	var A;

	A = new Float64Array( [ 1, 4, 7, 2, 5, 8, 3, 6, 9 ] );
	AP = new Float64Array( 6 );
	info = dtrttp.ndarray( 'lower', 3, A, 3, 1, 0, AP, 1, 0 );
	assert.equal( info, 0 );
	assert.equal( AP[ 0 ], 1.0 );
	assert.equal( AP[ 1 ], 2.0 );
	assert.equal( AP[ 2 ], 3.0 );
	assert.equal( AP[ 3 ], 5.0 );
	assert.equal( AP[ 4 ], 6.0 );
	assert.equal( AP[ 5 ], 9.0 );
});
