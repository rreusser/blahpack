/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dspr from './../lib/ndarray.js';

// FIXTURES //

import upper_basic from './fixtures/upper_basic.json' with { type: 'json' };
import lower_basic from './fixtures/lower_basic.json' with { type: 'json' };
import alpha2 from './fixtures/alpha2.json' with { type: 'json' };
import n_zero from './fixtures/n_zero.json' with { type: 'json' };
import alpha_zero from './fixtures/alpha_zero.json' with { type: 'json' };
import stride from './fixtures/stride.json' with { type: 'json' };

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

// TESTS //

test( 'dspr: upper_basic (uplo=U, N=3, alpha=1, unit stride)', function t() {
	var tc = upper_basic;

	// AP = upper triangle of identity: diag at positions 0,2,5
	var AP = new Float64Array( [ 1, 0, 1, 0, 0, 1 ] );
	var x = new Float64Array( [ 1, 2, 3 ] );

	dspr( 'upper', 3, 1.0, x, 1, 0, AP, 1, 0 );
	assertArrayClose( AP, tc.ap, 1e-14, 'ap' );
});

test( 'dspr: lower_basic (uplo=L, N=3, alpha=1, unit stride)', function t() {
	var tc = lower_basic;

	// AP = lower triangle of identity: diag at positions 0,3,5
	var AP = new Float64Array( [ 1, 0, 0, 1, 0, 1 ] );
	var x = new Float64Array( [ 1, 2, 3 ] );

	dspr( 'lower', 3, 1.0, x, 1, 0, AP, 1, 0 );
	assertArrayClose( AP, tc.ap, 1e-14, 'ap' );
});

test( 'dspr: alpha2 (uplo=U, N=3, alpha=2)', function t() {
	var tc = alpha2;
	var AP = new Float64Array( [ 0, 0, 0, 0, 0, 0 ] );
	var x = new Float64Array( [ 1, 2, 3 ] );

	dspr( 'upper', 3, 2.0, x, 1, 0, AP, 1, 0 );
	assertArrayClose( AP, tc.ap, 1e-14, 'ap' );
});

test( 'dspr: n_zero (quick return)', function t() {
	var tc = n_zero;
	var AP = new Float64Array( [ 99 ] );
	var x = new Float64Array( [ 1 ] );

	dspr( 'upper', 0, 1.0, x, 1, 0, AP, 1, 0 );
	assertArrayClose( AP, tc.ap, 1e-14, 'ap' );
});

test( 'dspr: alpha_zero (alpha=0, quick return)', function t() {
	var tc = alpha_zero;
	var AP = new Float64Array( [ 5, 0, 0, 0, 0, 0 ] );
	var x = new Float64Array( [ 1, 2, 3 ] );

	dspr( 'upper', 3, 0.0, x, 1, 0, AP, 1, 0 );
	assertArrayClose( AP, tc.ap, 1e-14, 'ap' );
});

test( 'dspr: stride (uplo=U, N=3, incx=2)', function t() {
	var tc = stride;
	var AP = new Float64Array( [ 0, 0, 0, 0, 0, 0 ] );
	var x = new Float64Array( [ 1, 0, 2, 0, 3, 0 ] );

	dspr( 'upper', 3, 1.0, x, 2, 0, AP, 1, 0 );
	assertArrayClose( AP, tc.ap, 1e-14, 'ap' );
});

test( 'dspr: returns AP', function t() {
	var result;
	var AP;
	var x;

	AP = new Float64Array( [ 1 ] );
	x = new Float64Array( [ 1 ] );
	result = dspr( 'upper', 1, 1.0, x, 1, 0, AP, 1, 0 );
	assert.equal( result, AP );
});

test( 'dspr: x element zero skips update for that column', function t() {
	// When x[j] === 0, that column should not be updated
	var expected = new Float64Array( [ 1, 2, 3, 4, 5, 6 ] );
	var AP = new Float64Array( [ 1, 2, 3, 4, 5, 6 ] );
	var x = new Float64Array( [ 0, 0, 0 ] );

	dspr( 'upper', 3, 1.0, x, 1, 0, AP, 1, 0 );
	assertArrayClose( AP, expected, 1e-14, 'ap unchanged' );
});
