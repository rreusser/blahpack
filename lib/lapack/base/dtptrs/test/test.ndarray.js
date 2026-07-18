/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dtptrs from './../lib/ndarray.js';

// FIXTURES //

import upper_no_trans from './fixtures/upper_no_trans.json' with { type: 'json' };
import lower_no_trans from './fixtures/lower_no_trans.json' with { type: 'json' };
import upper_trans from './fixtures/upper_trans.json' with { type: 'json' };
import lower_trans from './fixtures/lower_trans.json' with { type: 'json' };
import upper_unit_diag from './fixtures/upper_unit_diag.json' with { type: 'json' };
import lower_unit_diag from './fixtures/lower_unit_diag.json' with { type: 'json' };
import n_zero from './fixtures/n_zero.json' with { type: 'json' };
import n_one from './fixtures/n_one.json' with { type: 'json' };
import singular_upper from './fixtures/singular_upper.json' with { type: 'json' };
import singular_lower from './fixtures/singular_lower.json' with { type: 'json' };
import singular_lower_last from './fixtures/singular_lower_last.json' with { type: 'json' };
import multi_rhs from './fixtures/multi_rhs.json' with { type: 'json' };
import upper_conj_trans from './fixtures/upper_conj_trans.json' with { type: 'json' };
import lower_4x4 from './fixtures/lower_4x4.json' with { type: 'json' };

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
	const relErr = Math.abs( actual - expected ) / Math.max( Math.abs( expected ), 1.0 ); // eslint-disable-line max-len
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
	let i;
	assert.equal( actual.length, expected.length, msg + ': length mismatch' );
	for ( i = 0; i < expected.length; i++ ) {
		assertClose( actual[ i ], expected[ i ], tol, msg + '[' + i + ']' );
	}
}

// TESTS //

test( 'dtptrs is a function', function t() {
	assert.equal( typeof dtptrs, 'function' );
});

test( 'dtptrs: upper_no_trans', function t() {

	const tc = upper_no_trans;
	const ap = new Float64Array( [ 2.0, 1.0, 4.0, 3.0, 5.0, 6.0 ] );
	const b = new Float64Array( [ 1.0, 2.0, 3.0 ] );
	const info = dtptrs( 'upper', 'no-transpose', 'non-unit', 3, 1, ap, 1, 0, b, 1, 3, 0 ); // eslint-disable-line max-len
	assert.equal( info, tc.info );
	assertArrayClose( b, tc.x, 1e-14, 'x' );
});

test( 'dtptrs: lower_no_trans', function t() {

	const tc = lower_no_trans;
	const ap = new Float64Array( [ 2.0, 1.0, 3.0, 4.0, 5.0, 6.0 ] );
	const b = new Float64Array( [ 1.0, 2.0, 3.0 ] );
	const info = dtptrs( 'lower', 'no-transpose', 'non-unit', 3, 1, ap, 1, 0, b, 1, 3, 0 ); // eslint-disable-line max-len
	assert.equal( info, tc.info );
	assertArrayClose( b, tc.x, 1e-14, 'x' );
});

test( 'dtptrs: upper_trans', function t() {

	const tc = upper_trans;
	const ap = new Float64Array( [ 2.0, 1.0, 4.0, 3.0, 5.0, 6.0 ] );
	const b = new Float64Array( [ 1.0, 2.0, 3.0 ] );
	const info = dtptrs( 'upper', 'transpose', 'non-unit', 3, 1, ap, 1, 0, b, 1, 3, 0 );
	assert.equal( info, tc.info );
	assertArrayClose( b, tc.x, 1e-14, 'x' );
});

test( 'dtptrs: lower_trans', function t() {

	const tc = lower_trans;
	const ap = new Float64Array( [ 2.0, 1.0, 3.0, 4.0, 5.0, 6.0 ] );
	const b = new Float64Array( [ 1.0, 2.0, 3.0 ] );
	const info = dtptrs( 'lower', 'transpose', 'non-unit', 3, 1, ap, 1, 0, b, 1, 3, 0 );
	assert.equal( info, tc.info );
	assertArrayClose( b, tc.x, 1e-14, 'x' );
});

test( 'dtptrs: upper_unit_diag', function t() {

	const tc = upper_unit_diag;
	const ap = new Float64Array( [ 1.0, 2.0, 1.0, 3.0, 4.0, 1.0 ] );
	const b = new Float64Array( [ 10.0, 5.0, 1.0 ] );
	const info = dtptrs( 'upper', 'no-transpose', 'unit', 3, 1, ap, 1, 0, b, 1, 3, 0 );
	assert.equal( info, tc.info );
	assertArrayClose( b, tc.x, 1e-14, 'x' );
});

test( 'dtptrs: lower_unit_diag', function t() {

	const tc = lower_unit_diag;
	const ap = new Float64Array( [ 1.0, 2.0, 3.0, 1.0, 4.0, 1.0 ] );
	const b = new Float64Array( [ 10.0, 5.0, 1.0 ] );
	const info = dtptrs( 'lower', 'no-transpose', 'unit', 3, 1, ap, 1, 0, b, 1, 3, 0 );
	assert.equal( info, tc.info );
	assertArrayClose( b, tc.x, 1e-14, 'x' );
});

test( 'dtptrs: n_zero (quick return)', function t() {

	const tc = n_zero;
	const ap = new Float64Array( [ 1.0 ] );
	const b = new Float64Array( [ 99.0 ] );
	const info = dtptrs( 'upper', 'no-transpose', 'non-unit', 0, 1, ap, 1, 0, b, 1, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, tc.info );
});

test( 'dtptrs: n_one', function t() {

	const tc = n_one;
	const ap = new Float64Array( [ 5.0 ] );
	const b = new Float64Array( [ 15.0 ] );
	const info = dtptrs( 'upper', 'no-transpose', 'non-unit', 1, 1, ap, 1, 0, b, 1, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, tc.info );
	assertArrayClose( b, tc.x, 1e-14, 'x' );
});

test( 'dtptrs: singular_upper (info > 0)', function t() {

	const tc = singular_upper;
	const ap = new Float64Array( [ 2.0, 1.0, 0.0, 3.0, 5.0, 6.0 ] );
	const b = new Float64Array( [ 1.0, 2.0, 3.0 ] );
	const info = dtptrs( 'upper', 'no-transpose', 'non-unit', 3, 1, ap, 1, 0, b, 1, 3, 0 ); // eslint-disable-line max-len
	assert.equal( info, tc.info );
});

test( 'dtptrs: singular_lower (info > 0)', function t() {

	const tc = singular_lower;
	const ap = new Float64Array( [ 0.0, 1.0, 3.0, 4.0, 5.0, 6.0 ] );
	const b = new Float64Array( [ 1.0, 2.0, 3.0 ] );
	const info = dtptrs( 'lower', 'no-transpose', 'non-unit', 3, 1, ap, 1, 0, b, 1, 3, 0 ); // eslint-disable-line max-len
	assert.equal( info, tc.info );
});

test( 'dtptrs: singular_lower_last (info > 0)', function t() {

	const tc = singular_lower_last;
	const ap = new Float64Array( [ 2.0, 1.0, 3.0, 4.0, 5.0, 0.0 ] );
	const b = new Float64Array( [ 1.0, 2.0, 3.0 ] );
	const info = dtptrs( 'lower', 'no-transpose', 'non-unit', 3, 1, ap, 1, 0, b, 1, 3, 0 ); // eslint-disable-line max-len
	assert.equal( info, tc.info );
});

test( 'dtptrs: multi_rhs', function t() {

	const tc = multi_rhs;
	const ap = new Float64Array( [ 2.0, 1.0, 4.0, 3.0, 5.0, 6.0 ] );
	const b = new Float64Array( [ 1.0, 2.0, 3.0, 4.0, 5.0, 6.0 ] );
	const info = dtptrs( 'upper', 'no-transpose', 'non-unit', 3, 2, ap, 1, 0, b, 1, 3, 0 ); // eslint-disable-line max-len
	assert.equal( info, tc.info );
	assertArrayClose( b, tc.x, 1e-14, 'x' );
});

test( 'dtptrs: upper_conj_trans (same as transpose for real)', function t() {

	const tc = upper_conj_trans;
	const ap = new Float64Array( [ 2.0, 1.0, 4.0, 3.0, 5.0, 6.0 ] );
	const b = new Float64Array( [ 1.0, 2.0, 3.0 ] );
	const info = dtptrs( 'upper', 'transpose', 'non-unit', 3, 1, ap, 1, 0, b, 1, 3, 0 );
	assert.equal( info, tc.info );
	assertArrayClose( b, tc.x, 1e-14, 'x' );
});

test( 'dtptrs: lower_4x4', function t() {

	const tc = lower_4x4;
	const ap = new Float64Array( [ 3.0, 1.0, 4.0, 2.0, 2.0, 1.0, 3.0, 5.0, 1.0, 4.0 ] );
	const b = new Float64Array( [ 10.0, 20.0, 30.0, 40.0 ] );
	const info = dtptrs( 'lower', 'no-transpose', 'non-unit', 4, 1, ap, 1, 0, b, 1, 4, 0 ); // eslint-disable-line max-len
	assert.equal( info, tc.info );
	assertArrayClose( b, tc.x, 1e-14, 'x' );
});
