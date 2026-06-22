/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dtrtri from './../lib/ndarray.js';

// FIXTURES //

import upper_nonunit_3 from './fixtures/upper_nonunit_3.json' with { type: 'json' };
import lower_nonunit_3 from './fixtures/lower_nonunit_3.json' with { type: 'json' };
import upper_nonunit_4 from './fixtures/upper_nonunit_4.json' with { type: 'json' };
import lower_nonunit_4 from './fixtures/lower_nonunit_4.json' with { type: 'json' };
import singular from './fixtures/singular.json' with { type: 'json' };
import upper_unit from './fixtures/upper_unit.json' with { type: 'json' };
import identity from './fixtures/identity.json' with { type: 'json' };
import upper_5x5 from './fixtures/upper_5x5.json' with { type: 'json' };
import lower_5x5 from './fixtures/lower_5x5.json' with { type: 'json' };

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

test( 'dtrtri: upper, non-unit, 3x3', function t() {
	var info;
	var tc;
	var A;

	tc = upper_nonunit_3;
	A = new Float64Array( [ 2, 0, 0, 1, 4, 0, 3, 5, 6 ] );
	info = dtrtri( 'upper', 'non-unit', 3, A, 1, 3, 0 );
	assert.equal( info, tc.info );
	assertArrayClose( A, tc.a, 1e-14, 'a' );
});

test( 'dtrtri: lower, non-unit, 3x3', function t() {
	var info;
	var tc;
	var A;

	tc = lower_nonunit_3;
	A = new Float64Array( [ 2, 1, 3, 0, 4, 5, 0, 0, 6 ] );
	info = dtrtri( 'lower', 'non-unit', 3, A, 1, 3, 0 );
	assert.equal( info, tc.info );
	assertArrayClose( A, tc.a, 1e-14, 'a' );
});

test( 'dtrtri: upper, non-unit, 4x4', function t() {
	var info;
	var tc;
	var A;

	tc = upper_nonunit_4;
	A = new Float64Array([
		1,
		0,
		0,
		0,
		2,
		5,
		0,
		0,
		3,
		6,
		8,
		0,
		4,
		7,
		9,
		10
	]);
	info = dtrtri( 'upper', 'non-unit', 4, A, 1, 4, 0 );
	assert.equal( info, tc.info );
	assertArrayClose( A, tc.a, 1e-14, 'a' );
});

test( 'dtrtri: lower, non-unit, 4x4', function t() {
	var info;
	var tc;
	var A;

	tc = lower_nonunit_4;
	A = new Float64Array([
		1,
		2,
		3,
		4,
		0,
		5,
		6,
		7,
		0,
		0,
		8,
		9,
		0,
		0,
		0,
		10
	]);
	info = dtrtri( 'lower', 'non-unit', 4, A, 1, 4, 0 );
	assert.equal( info, tc.info );
	assertArrayClose( A, tc.a, 1e-14, 'a' );
});

test( 'dtrtri: N=0', function t() {
	var info = dtrtri( 'upper', 'non-unit', 0, new Float64Array( 0 ), 1, 1, 0 );
	assert.equal( info, 0 );
});

test( 'dtrtri: singular (zero diagonal)', function t() {
	var info;
	var tc;
	var A;

	tc = singular;
	A = new Float64Array( [ 2, 0, 0, 3, 0, 0, 0, 0, 6 ] );
	info = dtrtri( 'upper', 'non-unit', 3, A, 1, 3, 0 );
	assert.equal( info, tc.info );
});

test( 'dtrtri: upper, unit diag, 3x3', function t() {
	var info;
	var tc;
	var A;

	tc = upper_unit;
	A = new Float64Array( [ 99, 0, 0, 1, 99, 0, 3, 5, 99 ] );
	info = dtrtri( 'upper', 'unit', 3, A, 1, 3, 0 );
	assert.equal( info, tc.info );
	assertArrayClose( A, tc.a, 1e-14, 'a' );
});

test( 'dtrtri: identity 3x3', function t() {
	var info;
	var tc;
	var A;

	tc = identity;
	A = new Float64Array( [ 1, 0, 0, 0, 1, 0, 0, 0, 1 ] );
	info = dtrtri( 'upper', 'non-unit', 3, A, 1, 3, 0 );
	assert.equal( info, tc.info );
	assertArrayClose( A, tc.a, 1e-14, 'a' );
});

test( 'dtrtri: N=1 (unblocked path)', function t() {
	var info;
	var A;

	A = new Float64Array( [ 4 ] );
	info = dtrtri( 'upper', 'non-unit', 1, A, 1, 1, 0 );
	assert.equal( info, 0 );
	assertClose( A[ 0 ], 0.25, 1e-14, 'a[0]' );
});

test( 'dtrtri: upper 5x5', function t() {
	var info;
	var tc;
	var A;

	tc = upper_5x5;
	A = new Float64Array([
		2,
		0,
		0,
		0,
		0,
		1,
		4,
		0,
		0,
		0,
		3,
		1,
		5,
		0,
		0,
		2,
		3,
		1,
		6,
		0,
		1,
		2,
		4,
		1,
		3
	]);
	info = dtrtri( 'upper', 'non-unit', 5, A, 1, 5, 0 );
	assert.equal( info, tc.info );
	assertArrayClose( A, tc.a, 1e-14, 'a' );
});

test( 'dtrtri: lower 5x5', function t() {
	var info;
	var tc;
	var A;

	tc = lower_5x5;
	A = new Float64Array([
		2,
		1,
		3,
		2,
		1,
		0,
		4,
		1,
		3,
		2,
		0,
		0,
		5,
		1,
		4,
		0,
		0,
		0,
		6,
		1,
		0,
		0,
		0,
		0,
		3
	]);
	info = dtrtri( 'lower', 'non-unit', 5, A, 1, 5, 0 );
	assert.equal( info, tc.info );
	assertArrayClose( A, tc.a, 1e-14, 'a' );
});
