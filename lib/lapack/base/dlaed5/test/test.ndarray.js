/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */


// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dlaed5 from './../lib/index.js';


// FIXTURES //

import i1_w_positive from './fixtures/i1_w_positive.json' with { type: 'json' };
import i1_w_neg_b_positive from './fixtures/i1_w_neg_b_positive.json' with { type: 'json' };
import i1_w_neg_b_neg from './fixtures/i1_w_neg_b_neg.json' with { type: 'json' };
import i2_b_positive from './fixtures/i2_b_positive.json' with { type: 'json' };
import i2_b_neg from './fixtures/i2_b_neg.json' with { type: 'json' };
import i1_rho3 from './fixtures/i1_rho3.json' with { type: 'json' };
import i2_rho3 from './fixtures/i2_rho3.json' with { type: 'json' };
import i1_small_rho from './fixtures/i1_small_rho.json' with { type: 'json' };
import i2_small_rho from './fixtures/i2_small_rho.json' with { type: 'json' };
import i1_large_rho from './fixtures/i1_large_rho.json' with { type: 'json' };
import i2_large_rho from './fixtures/i2_large_rho.json' with { type: 'json' };

var fixtures = {
	'i1_w_positive': i1_w_positive,
	'i1_w_neg_b_positive': i1_w_neg_b_positive,
	'i1_w_neg_b_neg': i1_w_neg_b_neg,
	'i2_b_positive': i2_b_positive,
	'i2_b_neg': i2_b_neg,
	'i1_rho3': i1_rho3,
	'i2_rho3': i2_rho3,
	'i1_small_rho': i1_small_rho,
	'i2_small_rho': i2_small_rho,
	'i1_large_rho': i1_large_rho,
	'i2_large_rho': i2_large_rho
};


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
	assert.ok( relErr <= tol, msg + ': expected ' + expected + ', got ' + actual + ' (rel err: ' + relErr + ')' ); // eslint-disable-line max-len
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
* RunTest.
*
* @private
* @param {string} name - test case name
* @param {*} idx - idx
*/
function runTest( name, idx ) {
	var DELTA;
	var dlam;
	var tc;
	var D;
	var Z;

	tc = fixtures[ name ];
	D = new Float64Array( tc.D );
	Z = new Float64Array( tc.Z );
	DELTA = new Float64Array( 2 );
	dlam = new Float64Array( 1 );
	dlaed5.ndarray( idx, D, 1, 0, Z, 1, 0, DELTA, 1, 0, tc.RHO, dlam );
	assertClose( dlam[ 0 ], tc.DLAM, 1e-14, 'DLAM' );
	assertArrayClose( DELTA, tc.DELTA, 1e-14, 'DELTA' );
}


// TESTS //

test( 'dlaed5: main export is a function', function t() {
	assert.strictEqual( typeof dlaed5, 'function' );
});

test( 'dlaed5: attached to the main export is an `ndarray` method', function t() { // eslint-disable-line max-len
	assert.strictEqual( typeof dlaed5.ndarray, 'function' );
});

test( 'dlaed5: I=1, W > 0 branch', function t() {
	runTest( 'i1_w_positive', 1 );
});

test( 'dlaed5: I=1, W <= 0, B > 0 branch', function t() {
	runTest( 'i1_w_neg_b_positive', 1 );
});

test( 'dlaed5: I=1, W <= 0, B <= 0 branch', function t() {
	runTest( 'i1_w_neg_b_neg', 1 );
});

test( 'dlaed5: I=2, B > 0 branch', function t() {
	runTest( 'i2_b_positive', 2 );
});

test( 'dlaed5: I=2, B <= 0 branch', function t() {
	runTest( 'i2_b_neg', 2 );
});

test( 'dlaed5: I=1, rho=3', function t() {
	runTest( 'i1_rho3', 1 );
});

test( 'dlaed5: I=2, rho=3', function t() {
	runTest( 'i2_rho3', 2 );
});

test( 'dlaed5: I=1, small rho (near-zero perturbation)', function t() {
	runTest( 'i1_small_rho', 1 );
});

test( 'dlaed5: I=2, small rho (near-zero perturbation)', function t() {
	runTest( 'i2_small_rho', 2 );
});

test( 'dlaed5: I=1, large rho', function t() {
	runTest( 'i1_large_rho', 1 );
});

test( 'dlaed5: I=2, large rho', function t() {
	runTest( 'i2_large_rho', 2 );
});

test( 'dlaed5: non-unit strides', function t() {
	var DELTA;
	var dlam;
	var tc;
	var D;
	var Z;

	tc = i1_w_positive;
	D = new Float64Array( [ tc.D[ 0 ], 0.0, tc.D[ 1 ], 0.0 ] );
	Z = new Float64Array( [ tc.Z[ 0 ], 0.0, tc.Z[ 1 ], 0.0 ] );
	DELTA = new Float64Array( 4 );
	dlam = new Float64Array( 1 );
	dlaed5.ndarray( 1, D, 2, 0, Z, 2, 0, DELTA, 2, 0, tc.RHO, dlam );
	assertClose( dlam[ 0 ], tc.DLAM, 1e-14, 'DLAM (stride 2)' );
	assertClose( DELTA[ 0 ], tc.DELTA[ 0 ], 1e-14, 'DELTA[0] (stride 2)' );
	assertClose( DELTA[ 2 ], tc.DELTA[ 1 ], 1e-14, 'DELTA[1] (stride 2)' );
});

test( 'dlaed5: non-zero offsets', function t() {
	var DELTA;
	var dlam;
	var tc;
	var D;
	var Z;

	tc = i2_b_positive;
	D = new Float64Array( [ 0.0, 0.0, 0.0, tc.D[ 0 ], tc.D[ 1 ] ] );
	Z = new Float64Array( [ 0.0, 0.0, 0.0, tc.Z[ 0 ], tc.Z[ 1 ] ] );
	DELTA = new Float64Array( 5 );
	dlam = new Float64Array( 1 );
	dlaed5.ndarray( 2, D, 1, 3, Z, 1, 3, DELTA, 1, 3, tc.RHO, dlam );
	assertClose( dlam[ 0 ], tc.DLAM, 1e-14, 'DLAM (offset 3)' );
	assertClose( DELTA[ 3 ], tc.DELTA[ 0 ], 1e-14, 'DELTA[0] (offset 3)' );
	assertClose( DELTA[ 4 ], tc.DELTA[ 1 ], 1e-14, 'DELTA[1] (offset 3)' );
});
