/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dtptri from './../lib/ndarray.js';

// FIXTURES //

import upper_nonunit_3x3 from './fixtures/upper_nonunit_3x3.json' with { type: 'json' };
import lower_nonunit_3x3 from './fixtures/lower_nonunit_3x3.json' with { type: 'json' };
import upper_unit_3x3 from './fixtures/upper_unit_3x3.json' with { type: 'json' };
import lower_unit_3x3 from './fixtures/lower_unit_3x3.json' with { type: 'json' };
import n_zero from './fixtures/n_zero.json' with { type: 'json' };
import n_one from './fixtures/n_one.json' with { type: 'json' };
import upper_nonunit_4x4 from './fixtures/upper_nonunit_4x4.json' with { type: 'json' };
import lower_nonunit_4x4 from './fixtures/lower_nonunit_4x4.json' with { type: 'json' };
import singular_upper from './fixtures/singular_upper.json' with { type: 'json' };
import singular_lower from './fixtures/singular_lower.json' with { type: 'json' };
import singular_lower_last from './fixtures/singular_lower_last.json' with { type: 'json' };
import singular_upper_first from './fixtures/singular_upper_first.json' with { type: 'json' };
import identity_upper from './fixtures/identity_upper.json' with { type: 'json' };

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

test( 'dtptri: upper_nonunit_3x3', function t() {
	var info;
	var tc;
	var ap;

	tc = upper_nonunit_3x3;
	ap = new Float64Array( [ 2.0, 1.0, 4.0, 3.0, 5.0, 6.0 ] );
	info = dtptri( 'upper', 'non-unit', 3, ap, 1, 0 );
	assert.equal( info, tc.info );
	assertArrayClose( ap, tc.ap, 1e-14, 'ap' );
});

test( 'dtptri: lower_nonunit_3x3', function t() {
	var info;
	var tc;
	var ap;

	tc = lower_nonunit_3x3;
	ap = new Float64Array( [ 2.0, 1.0, 3.0, 4.0, 5.0, 6.0 ] );
	info = dtptri( 'lower', 'non-unit', 3, ap, 1, 0 );
	assert.equal( info, tc.info );
	assertArrayClose( ap, tc.ap, 1e-14, 'ap' );
});

test( 'dtptri: upper_unit_3x3', function t() {
	var info;
	var tc;
	var ap;

	tc = upper_unit_3x3;
	ap = new Float64Array( [ 99.0, 1.0, 99.0, 3.0, 5.0, 99.0 ] );
	info = dtptri( 'upper', 'unit', 3, ap, 1, 0 );
	assert.equal( info, tc.info );
	assertArrayClose( ap, tc.ap, 1e-14, 'ap' );
});

test( 'dtptri: lower_unit_3x3', function t() {
	var info;
	var tc;
	var ap;

	tc = lower_unit_3x3;
	ap = new Float64Array( [ 99.0, 1.0, 3.0, 99.0, 5.0, 99.0 ] );
	info = dtptri( 'lower', 'unit', 3, ap, 1, 0 );
	assert.equal( info, tc.info );
	assertArrayClose( ap, tc.ap, 1e-14, 'ap' );
});

test( 'dtptri: n_zero', function t() {
	var info;
	var tc;
	var ap;

	tc = n_zero;
	ap = new Float64Array( [ 1.0 ] );
	info = dtptri( 'upper', 'non-unit', 0, ap, 1, 0 );
	assert.equal( info, tc.info );
});

test( 'dtptri: n_one', function t() {
	var info;
	var tc;
	var ap;

	tc = n_one;
	ap = new Float64Array( [ 4.0 ] );
	info = dtptri( 'upper', 'non-unit', 1, ap, 1, 0 );
	assert.equal( info, tc.info );
	assertArrayClose( ap, tc.ap, 1e-14, 'ap' );
});

test( 'dtptri: upper_nonunit_4x4', function t() {
	var info;
	var tc;
	var ap;

	tc = upper_nonunit_4x4;
	ap = new Float64Array( [ 2.0, 1.0, 4.0, 3.0, 5.0, 6.0, 7.0, 2.0, 1.0, 3.0 ] );
	info = dtptri( 'upper', 'non-unit', 4, ap, 1, 0 );
	assert.equal( info, tc.info );
	assertArrayClose( ap, tc.ap, 1e-14, 'ap' );
});

test( 'dtptri: lower_nonunit_4x4', function t() {
	var info;
	var tc;
	var ap;

	tc = lower_nonunit_4x4;
	ap = new Float64Array( [ 3.0, 1.0, 4.0, 2.0, 2.0, 1.0, 3.0, 5.0, 1.0, 4.0 ] );
	info = dtptri( 'lower', 'non-unit', 4, ap, 1, 0 );
	assert.equal( info, tc.info );
	assertArrayClose( ap, tc.ap, 1e-14, 'ap' );
});

test( 'dtptri: singular_upper', function t() {
	var info;
	var tc;
	var ap;

	tc = singular_upper;
	ap = new Float64Array( [ 2.0, 1.0, 0.0, 3.0, 5.0, 6.0 ] );
	info = dtptri( 'upper', 'non-unit', 3, ap, 1, 0 );
	assert.equal( info, tc.info );
});

test( 'dtptri: singular_lower', function t() {
	var info;
	var tc;
	var ap;

	tc = singular_lower;
	ap = new Float64Array( [ 0.0, 1.0, 3.0, 4.0, 5.0, 6.0 ] );
	info = dtptri( 'lower', 'non-unit', 3, ap, 1, 0 );
	assert.equal( info, tc.info );
});

test( 'dtptri: singular_lower_last', function t() {
	var info;
	var tc;
	var ap;

	tc = singular_lower_last;
	ap = new Float64Array( [ 2.0, 1.0, 3.0, 4.0, 5.0, 0.0 ] );
	info = dtptri( 'lower', 'non-unit', 3, ap, 1, 0 );
	assert.equal( info, tc.info );
});

test( 'dtptri: singular_upper_first', function t() {
	var info;
	var tc;
	var ap;

	tc = singular_upper_first;
	ap = new Float64Array( [ 0.0, 1.0, 4.0, 3.0, 5.0, 6.0 ] );
	info = dtptri( 'upper', 'non-unit', 3, ap, 1, 0 );
	assert.equal( info, tc.info );
});

test( 'dtptri: identity_upper', function t() {
	var info;
	var tc;
	var ap;

	tc = identity_upper;
	ap = new Float64Array( [ 1.0, 0.0, 1.0, 0.0, 0.0, 1.0 ] );
	info = dtptri( 'upper', 'non-unit', 3, ap, 1, 0 );
	assert.equal( info, tc.info );
	assertArrayClose( ap, tc.ap, 1e-14, 'ap' );
});

test( 'dtptri: supports stride and offset', function t() {
	var result;
	var info;
	var ap;
	var tc;
	var i;

	ap = new Float64Array( [ 0.0, 0.0, 2.0, 0.0, 1.0, 0.0, 4.0, 0.0, 3.0, 0.0, 5.0, 0.0, 6.0, 0.0 ] ); // eslint-disable-line max-len
	tc = upper_nonunit_3x3;
	info = dtptri( 'upper', 'non-unit', 3, ap, 2, 2 );
	result = new Float64Array( 6 );
	assert.equal( info, tc.info );
	for ( i = 0; i < 6; i++ ) {
		result[ i ] = ap[ 2 + ( i * 2 ) ];
	}
	assertArrayClose( result, tc.ap, 1e-14, 'ap with stride/offset' );
});
