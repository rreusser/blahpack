/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dpftrf from './../lib/ndarray.js';


// FIXTURES //

import lowerOddNormal from './fixtures/lower_odd_normal.json' with { type: 'json' };
import upperOddNormal from './fixtures/upper_odd_normal.json' with { type: 'json' };
import lowerOddTrans from './fixtures/lower_odd_trans.json' with { type: 'json' };
import upperOddTrans from './fixtures/upper_odd_trans.json' with { type: 'json' };
import lowerEvenNormal from './fixtures/lower_even_normal.json' with { type: 'json' };
import upperEvenNormal from './fixtures/upper_even_normal.json' with { type: 'json' };
import lowerEvenTrans from './fixtures/lower_even_trans.json' with { type: 'json' };
import upperEvenTrans from './fixtures/upper_even_trans.json' with { type: 'json' };
import nOne from './fixtures/n_one.json' with { type: 'json' };
import notPosdef from './fixtures/not_posdef.json' with { type: 'json' };
import lower5Normal from './fixtures/lower_5_normal.json' with { type: 'json' };
import upper5Trans from './fixtures/upper_5_trans.json' with { type: 'json' };
import notpdOddNormalUpper from './fixtures/notpd_odd_normal_upper.json' with { type: 'json' };
import notpdOddTransLower from './fixtures/notpd_odd_trans_lower.json' with { type: 'json' };
import notpdOddTransUpper from './fixtures/notpd_odd_trans_upper.json' with { type: 'json' };
import notpdEvenNormalLower from './fixtures/notpd_even_normal_lower.json' with { type: 'json' };
import notpdEvenNormalUpper from './fixtures/notpd_even_normal_upper.json' with { type: 'json' };
import notpdEvenTransLower from './fixtures/notpd_even_trans_lower.json' with { type: 'json' };
import notpdEvenTransUpper from './fixtures/notpd_even_trans_upper.json' with { type: 'json' };

var fixtures = {
	'lower_odd_normal': lowerOddNormal,
	'upper_odd_normal': upperOddNormal,
	'lower_odd_trans': lowerOddTrans,
	'upper_odd_trans': upperOddTrans,
	'lower_even_normal': lowerEvenNormal,
	'upper_even_normal': upperEvenNormal,
	'lower_even_trans': lowerEvenTrans,
	'upper_even_trans': upperEvenTrans,
	'n_one': nOne,
	'not_posdef': notPosdef,
	'lower_5_normal': lower5Normal,
	'upper_5_trans': upper5Trans,
	'notpd_odd_normal_upper': notpdOddNormalUpper,
	'notpd_odd_trans_lower': notpdOddTransLower,
	'notpd_odd_trans_upper': notpdOddTransUpper,
	'notpd_even_normal_lower': notpdEvenNormalLower,
	'notpd_even_normal_upper': notpdEvenNormalUpper,
	'notpd_even_trans_lower': notpdEvenTransLower,
	'notpd_even_trans_upper': notpdEvenTransUpper
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
* RunTest.
*
* @private
* @param {string} name - test case name
* @param {*} transr - transr
* @param {*} uplo - uplo
* @param {*} N - N
*/
function runTest( name, transr, uplo, N ) {
	var expected;
	var actual;
	var info;
	var tc;
	var a;
	var i;

	tc = fixtures[ name ];
	a = new Float64Array( tc.input.length );
	for ( i = 0; i < tc.input.length; i++ ) {
		a[ i ] = tc.input[ i ];
	}

	info = dpftrf( transr, uplo, N, a, 1, 0 );
	assert.equal( info, tc.info, 'info' );

	if ( tc.a ) {
		expected = tc.a;
		actual = [];
		for ( i = 0; i < expected.length; i++ ) {
			actual.push( a[ i ] );
		}
		assertArrayClose( actual, expected, 1e-14, 'a' );
	}
}

/**
* RunNotPDTest.
*
* @private
* @param {string} name - test case name
* @param {*} transr - transr
* @param {*} uplo - uplo
* @param {*} N - N
*/
function runNotPDTest( name, transr, uplo, N ) {
	var info;
	var tc;
	var a;
	var i;

	tc = fixtures[ name ];
	a = new Float64Array( tc.input.length );
	for ( i = 0; i < tc.input.length; i++ ) {
		a[ i ] = tc.input[ i ];
	}

	info = dpftrf( transr, uplo, N, a, 1, 0 );
	assert.equal( info, tc.info, 'info should indicate not positive definite' );
}


// TESTS //

test( 'dpftrf: lower_odd_normal', function t() {
	runTest( 'lower_odd_normal', 'no-transpose', 'lower', 3 );
});

test( 'dpftrf: upper_odd_normal', function t() {
	runTest( 'upper_odd_normal', 'no-transpose', 'upper', 3 );
});

test( 'dpftrf: lower_odd_trans', function t() {
	runTest( 'lower_odd_trans', 'transpose', 'lower', 3 );
});

test( 'dpftrf: upper_odd_trans', function t() {
	runTest( 'upper_odd_trans', 'transpose', 'upper', 3 );
});

test( 'dpftrf: lower_even_normal', function t() {
	runTest( 'lower_even_normal', 'no-transpose', 'lower', 4 );
});

test( 'dpftrf: upper_even_normal', function t() {
	runTest( 'upper_even_normal', 'no-transpose', 'upper', 4 );
});

test( 'dpftrf: lower_even_trans', function t() {
	runTest( 'lower_even_trans', 'transpose', 'lower', 4 );
});

test( 'dpftrf: upper_even_trans', function t() {
	runTest( 'upper_even_trans', 'transpose', 'upper', 4 );
});

test( 'dpftrf: n_zero', function t() {
	var info = dpftrf( 'no-transpose', 'lower', 0, new Float64Array( 0 ), 1, 0 );
	assert.equal( info, 0, 'info should be 0 for N=0' );
});

test( 'dpftrf: n_one', function t() {
	runTest( 'n_one', 'no-transpose', 'lower', 1 );
});

test( 'dpftrf: not_posdef', function t() {
	runNotPDTest( 'not_posdef', 'no-transpose', 'lower', 3 );
});

test( 'dpftrf: lower_5_normal', function t() {
	runTest( 'lower_5_normal', 'no-transpose', 'lower', 5 );
});

test( 'dpftrf: upper_5_trans', function t() {
	runTest( 'upper_5_trans', 'transpose', 'upper', 5 );
});

test( 'dpftrf: notpd_odd_normal_upper', function t() {
	runNotPDTest( 'notpd_odd_normal_upper', 'no-transpose', 'upper', 3 );
});

test( 'dpftrf: notpd_odd_trans_lower', function t() {
	runNotPDTest( 'notpd_odd_trans_lower', 'transpose', 'lower', 3 );
});

test( 'dpftrf: notpd_odd_trans_upper', function t() {
	runNotPDTest( 'notpd_odd_trans_upper', 'transpose', 'upper', 3 );
});

test( 'dpftrf: notpd_even_normal_lower', function t() {
	runNotPDTest( 'notpd_even_normal_lower', 'no-transpose', 'lower', 4 );
});

test( 'dpftrf: notpd_even_normal_upper', function t() {
	runNotPDTest( 'notpd_even_normal_upper', 'no-transpose', 'upper', 4 );
});

test( 'dpftrf: notpd_even_trans_lower', function t() {
	runNotPDTest( 'notpd_even_trans_lower', 'transpose', 'lower', 4 );
});

test( 'dpftrf: notpd_even_trans_upper', function t() {
	runNotPDTest( 'notpd_even_trans_upper', 'transpose', 'upper', 4 );
});
