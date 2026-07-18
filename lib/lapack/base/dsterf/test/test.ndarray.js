/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dsterf from './../lib/ndarray.js';

// FIXTURES //

import n_one from './fixtures/n_one.json' with { type: 'json' };
import two_by_two from './fixtures/two_by_two.json' with { type: 'json' };
import four_by_four from './fixtures/four_by_four.json' with { type: 'json' };
import already_diagonal from './fixtures/already_diagonal.json' with { type: 'json' };
import six_by_six_mixed from './fixtures/six_by_six_mixed.json' with { type: 'json' };
import split_matrix from './fixtures/split_matrix.json' with { type: 'json' };
import identity_tridiag from './fixtures/identity_tridiag.json' with { type: 'json' };
import toeplitz from './fixtures/toeplitz.json' with { type: 'json' };
import eight_by_eight from './fixtures/eight_by_eight.json' with { type: 'json' };
import qr_path from './fixtures/qr_path.json' with { type: 'json' };
import large_values from './fixtures/large_values.json' with { type: 'json' };
import small_values from './fixtures/small_values.json' with { type: 'json' };
import qr_four_by_four from './fixtures/qr_four_by_four.json' with { type: 'json' };

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

test( 'dsterf: n_zero', function t() {

	const d = new Float64Array( 0 );
	const e = new Float64Array( 0 );
	const info = dsterf( 0, d, 1, 0, e, 1, 0 );
	assert.equal( info, 0, 'info' );
});

test( 'dsterf: n_one', function t() {

	const tc = n_one;
	const d = new Float64Array( [ 5.0 ] );
	const e = new Float64Array( 0 );
	const info = dsterf( 1, d, 1, 0, e, 1, 0 );
	assert.equal( info, 0, 'info' );
	assertArrayClose( d, tc.d, 1e-14, 'd' );
});

test( 'dsterf: two_by_two', function t() {

	const tc = two_by_two;
	const d = new Float64Array( [ 2.0, 3.0 ] );
	const e = new Float64Array( [ 1.0 ] );
	const info = dsterf( 2, d, 1, 0, e, 1, 0 );
	assert.equal( info, 0, 'info' );
	assertArrayClose( d, tc.d, 1e-14, 'd' );
});

test( 'dsterf: four_by_four', function t() {

	const tc = four_by_four;
	const d = new Float64Array( [ 4.0, 3.0, 2.0, 1.0 ] );
	const e = new Float64Array( [ 1.0, 1.0, 1.0 ] );
	const info = dsterf( 4, d, 1, 0, e, 1, 0 );
	assert.equal( info, 0, 'info' );
	assertArrayClose( d, tc.d, 1e-14, 'd' );
});

test( 'dsterf: already_diagonal', function t() {

	const tc = already_diagonal;
	const d = new Float64Array( [ 3.0, 1.0, 4.0, 2.0 ] );
	const e = new Float64Array( [ 0.0, 0.0, 0.0 ] );
	const info = dsterf( 4, d, 1, 0, e, 1, 0 );
	assert.equal( info, 0, 'info' );
	assertArrayClose( d, tc.d, 1e-14, 'd' );
});

test( 'dsterf: six_by_six_mixed', function t() {

	const tc = six_by_six_mixed;
	const d = new Float64Array( [ -2.0, 1.0, -3.0, 4.0, -1.0, 2.0 ] );
	const e = new Float64Array( [ 1.0, 2.0, 1.0, 3.0, 1.0 ] );
	const info = dsterf( 6, d, 1, 0, e, 1, 0 );
	assert.equal( info, 0, 'info' );
	assertArrayClose( d, tc.d, 1e-14, 'd' );
});

test( 'dsterf: split_matrix', function t() {

	const tc = split_matrix;
	const d = new Float64Array( [ 2.0, 3.0, 5.0, 7.0 ] );
	const e = new Float64Array( [ 1.0, 0.0, 2.0 ] );
	const info = dsterf( 4, d, 1, 0, e, 1, 0 );
	assert.equal( info, 0, 'info' );
	assertArrayClose( d, tc.d, 1e-14, 'd' );
});

test( 'dsterf: identity_tridiag', function t() {

	const tc = identity_tridiag;
	const d = new Float64Array( [ 1.0, 1.0, 1.0 ] );
	const e = new Float64Array( [ 0.0, 0.0 ] );
	const info = dsterf( 3, d, 1, 0, e, 1, 0 );
	assert.equal( info, 0, 'info' );
	assertArrayClose( d, tc.d, 1e-14, 'd' );
});

test( 'dsterf: toeplitz', function t() {

	const tc = toeplitz;
	const d = new Float64Array( [ 2.0, 2.0, 2.0, 2.0, 2.0 ] );
	const e = new Float64Array( [ 1.0, 1.0, 1.0, 1.0 ] );
	const info = dsterf( 5, d, 1, 0, e, 1, 0 );
	assert.equal( info, 0, 'info' );
	assertArrayClose( d, tc.d, 1e-14, 'd' );
});

test( 'dsterf: eight_by_eight', function t() {

	const tc = eight_by_eight;
	const d = new Float64Array( [ 10.0, 1.0, 8.0, 3.0, 6.0, 5.0, 4.0, 7.0 ] );
	const e = new Float64Array( [ 2.0, 3.0, 1.0, 4.0, 2.0, 1.0, 3.0 ] );
	const info = dsterf( 8, d, 1, 0, e, 1, 0 );
	assert.equal( info, 0, 'info' );
	assertArrayClose( d, tc.d, 1e-14, 'd' );
});

test( 'dsterf: qr_path', function t() {

	const tc = qr_path;
	const d = new Float64Array( [ 0.1, 0.5, 10.0 ] );
	const e = new Float64Array( [ 1.0, 1.0 ] );
	const info = dsterf( 3, d, 1, 0, e, 1, 0 );
	assert.equal( info, 0, 'info' );
	assertArrayClose( d, tc.d, 1e-14, 'd' );
});

test( 'dsterf: large_values', function t() {

	const tc = large_values;
	const d = new Float64Array( [ 1.0e154, 2.0e154, 3.0e154 ] );
	const e = new Float64Array( [ 0.5e154, 0.5e154 ] );
	const info = dsterf( 3, d, 1, 0, e, 1, 0 );
	assert.equal( info, 0, 'info' );
	assertArrayClose( d, tc.d, 1e-14, 'd' );
});

test( 'dsterf: small_values', function t() {

	const tc = small_values;
	const d = new Float64Array( [ 1.0e-155, 2.0e-155, 3.0e-155 ] );
	const e = new Float64Array( [ 0.5e-155, 0.5e-155 ] );
	const info = dsterf( 3, d, 1, 0, e, 1, 0 );
	assert.equal( info, 0, 'info' );
	assertArrayClose( d, tc.d, 1e-14, 'd' );
});

test( 'dsterf: qr_four_by_four', function t() {

	const tc = qr_four_by_four;
	const d = new Float64Array( [ 1.0, 2.0, 3.0, 100.0 ] );
	const e = new Float64Array( [ 5.0, 5.0, 5.0 ] );
	const info = dsterf( 4, d, 1, 0, e, 1, 0 );
	assert.equal( info, 0, 'info' );
	assertArrayClose( d, tc.d, 1e-14, 'd' );
});

test( 'dsterf: strided input', function t() {

	const tc = two_by_two;
	const d = new Float64Array( [ 0.0, 2.0, 0.0, 3.0 ] );
	const e = new Float64Array( [ 0.0, 1.0 ] );
	const info = dsterf( 2, d, 2, 1, e, 1, 1 );
	assert.equal( info, 0, 'info' );
	assertClose( d[ 1 ], tc.d[ 0 ], 1e-14, 'd[0]' );
	assertClose( d[ 3 ], tc.d[ 1 ], 1e-14, 'd[1]' );
});
