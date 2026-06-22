/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import dpstf2 from './../lib/ndarray.js';

// FIXTURES //

import upper_3x3 from './fixtures/upper_3x3.json' with { type: 'json' };
import lower_3x3 from './fixtures/lower_3x3.json' with { type: 'json' };
import upper_4x4 from './fixtures/upper_4x4.json' with { type: 'json' };
import lower_4x4 from './fixtures/lower_4x4.json' with { type: 'json' };
import rank_deficient_upper from './fixtures/rank_deficient_upper.json' with { type: 'json' };
import rank_deficient_lower from './fixtures/rank_deficient_lower.json' with { type: 'json' };
import n_one from './fixtures/n_one.json' with { type: 'json' };
import rank_deficient_4x4_upper from './fixtures/rank_deficient_4x4_upper.json' with { type: 'json' };
import rank_deficient_4x4_lower from './fixtures/rank_deficient_4x4_lower.json' with { type: 'json' };

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
* Runs a test case against the Fortran fixture.
*
* @private
* @param {string} uplo - 'upper' or 'lower'
* @param {number} N - matrix order
* @param {Float64Array} Ain - column-major input matrix
* @param {Object} tc - test case from fixture
*/
function runTestCase( uplo, N, Ain, tc ) {
	var RANK;
	var WORK;
	var info;
	var PIV;
	var A;
	var i;

	A = new Float64Array( Ain );
	PIV = new Int32Array( N );
	RANK = new Int32Array( 1 );
	WORK = new Float64Array( 2 * N );

	info = dpstf2( uplo, N, A, 1, N, 0, PIV, 1, 0, RANK, -1.0, WORK );

	assert.equal( info, tc.info, 'info' );
	assert.equal( RANK[ 0 ], tc.rank, 'rank' );

	// Compare A (factorized matrix)
	assertArrayClose( A, new Float64Array( tc.a ), 1e-14, 'A' );

	// Compare PIV (Fortran is 1-based, JS is 0-based)
	for ( i = 0; i < N; i++ ) {
		assert.equal( PIV[ i ], tc.piv[ i ] - 1, 'piv[' + i + ']' );
	}
}

// TESTS //

test( 'dpstf2: upper_3x3', function t() {
	var tc = upper_3x3;
	var A = new Float64Array([
		4.0,
		2.0,
		1.0,
		2.0,
		5.0,
		3.0,
		1.0,
		3.0,
		6.0
	]);
	runTestCase( 'upper', 3, A, tc );
});

test( 'dpstf2: lower_3x3', function t() {
	var tc = lower_3x3;
	var A = new Float64Array([
		4.0,
		2.0,
		1.0,
		2.0,
		5.0,
		3.0,
		1.0,
		3.0,
		6.0
	]);
	runTestCase( 'lower', 3, A, tc );
});

test( 'dpstf2: upper_4x4', function t() {
	var tc = upper_4x4;
	var A = new Float64Array([
		10.0,
		3.0,
		2.0,
		1.0,
		3.0,
		8.0,
		4.0,
		2.0,
		2.0,
		4.0,
		9.0,
		5.0,
		1.0,
		2.0,
		5.0,
		7.0
	]);
	runTestCase( 'upper', 4, A, tc );
});

test( 'dpstf2: lower_4x4', function t() {
	var tc = lower_4x4;
	var A = new Float64Array([
		10.0,
		3.0,
		2.0,
		1.0,
		3.0,
		8.0,
		4.0,
		2.0,
		2.0,
		4.0,
		9.0,
		5.0,
		1.0,
		2.0,
		5.0,
		7.0
	]);
	runTestCase( 'lower', 4, A, tc );
});

test( 'dpstf2: rank_deficient_upper', function t() {
	var tc = rank_deficient_upper;
	var A = new Float64Array([
		1.0,
		1.0,
		1.0,
		1.0,
		1.0,
		1.0,
		1.0,
		1.0,
		1.0
	]);
	runTestCase( 'upper', 3, A, tc );
});

test( 'dpstf2: rank_deficient_lower', function t() {
	var tc = rank_deficient_lower;
	var A = new Float64Array([
		1.0,
		1.0,
		1.0,
		1.0,
		1.0,
		1.0,
		1.0,
		1.0,
		1.0
	]);
	runTestCase( 'lower', 3, A, tc );
});

test( 'dpstf2: n_zero', function t() {
	var RANK;
	var WORK;
	var info;
	var PIV;
	var A;

	RANK = new Int32Array( 1 );
	WORK = new Float64Array( 0 );
	PIV = new Int32Array( 0 );
	A = new Float64Array( 0 );
	info = dpstf2( 'upper', 0, A, 1, 0, 0, PIV, 1, 0, RANK, -1.0, WORK );
	assert.equal( info, 0, 'info' );
});

test( 'dpstf2: n_one', function t() {
	var tc = n_one;
	var A = new Float64Array([ 9.0 ]);
	runTestCase( 'upper', 1, A, tc );
});

test( 'dpstf2: rank_deficient_4x4_upper', function t() {
	var tc = rank_deficient_4x4_upper;
	var A = new Float64Array([
		2.0,
		1.0,
		4.0,
		3.0,
		1.0,
		5.0,
		5.0,
		7.0,
		4.0,
		5.0,
		10.0,
		11.0,
		3.0,
		7.0,
		11.0,
		17.0
	]);
	runTestCase( 'upper', 4, A, tc );
});

test( 'dpstf2: rank_deficient_4x4_lower', function t() {
	var tc = rank_deficient_4x4_lower;
	var A = new Float64Array([
		2.0,
		1.0,
		4.0,
		3.0,
		1.0,
		5.0,
		5.0,
		7.0,
		4.0,
		5.0,
		10.0,
		11.0,
		3.0,
		7.0,
		11.0,
		17.0
	]);
	runTestCase( 'lower', 4, A, tc );
});
