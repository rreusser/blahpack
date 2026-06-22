/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dtrti2 from './../lib/ndarray.js';

// FIXTURES //

import upper_nonunit from './fixtures/upper_nonunit.json' with { type: 'json' };
import lower_nonunit from './fixtures/lower_nonunit.json' with { type: 'json' };
import upper_unit from './fixtures/upper_unit.json' with { type: 'json' };
import lower_unit from './fixtures/lower_unit.json' with { type: 'json' };
import n_one from './fixtures/n_one.json' with { type: 'json' };
import identity from './fixtures/identity.json' with { type: 'json' };

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

test( 'dtrti2: upper, non-unit, 3x3', function t() {
	var info;
	var tc;
	var A;

	tc = upper_nonunit;
	A = new Float64Array( [ 2, 0, 0, 1, 4, 0, 3, 5, 6 ] );
	info = dtrti2( 'upper', 'non-unit', 3, A, 1, 3, 0 );
	assert.equal( info, tc.info );
	assertArrayClose( A, tc.a, 1e-14, 'a' );
});

test( 'dtrti2: lower, non-unit, 3x3', function t() {
	var info;
	var tc;
	var A;

	tc = lower_nonunit;
	A = new Float64Array( [ 2, 1, 3, 0, 4, 5, 0, 0, 6 ] );
	info = dtrti2( 'lower', 'non-unit', 3, A, 1, 3, 0 );
	assert.equal( info, tc.info );
	assertArrayClose( A, tc.a, 1e-14, 'a' );
});

test( 'dtrti2: upper, unit diag, 3x3', function t() {
	var info;
	var tc;
	var A;

	tc = upper_unit;
	A = new Float64Array( [ 99, 0, 0, 1, 99, 0, 3, 5, 99 ] );
	info = dtrti2( 'upper', 'unit', 3, A, 1, 3, 0 );
	assert.equal( info, tc.info );
	assertArrayClose( A, tc.a, 1e-14, 'a' );
});

test( 'dtrti2: lower, unit diag, 3x3', function t() {
	var info;
	var tc;
	var A;

	tc = lower_unit;
	A = new Float64Array( [ 99, 1, 3, 0, 99, 5, 0, 0, 99 ] );
	info = dtrti2( 'lower', 'unit', 3, A, 1, 3, 0 );
	assert.equal( info, tc.info );
	assertArrayClose( A, tc.a, 1e-14, 'a' );
});

test( 'dtrti2: N=0', function t() {
	var info = dtrti2( 'upper', 'non-unit', 0, new Float64Array( 0 ), 1, 1, 0 );
	assert.equal( info, 0 );
});

test( 'dtrti2: N=1', function t() {
	var info;
	var tc;
	var A;

	tc = n_one;
	A = new Float64Array( [ 4 ] );
	info = dtrti2( 'upper', 'non-unit', 1, A, 1, 1, 0 );
	assert.equal( info, tc.info );
	assertArrayClose( A, tc.a, 1e-14, 'a' );
});

test( 'dtrti2: identity 3x3', function t() {
	var info;
	var tc;
	var A;

	tc = identity;
	A = new Float64Array( [ 1, 0, 0, 0, 1, 0, 0, 0, 1 ] );
	info = dtrti2( 'upper', 'non-unit', 3, A, 1, 3, 0 );
	assert.equal( info, tc.info );
	assertArrayClose( A, tc.a, 1e-14, 'a' );
});
