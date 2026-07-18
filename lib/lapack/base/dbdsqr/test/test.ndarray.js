/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dbdsqr from './../lib/ndarray.js';

// FIXTURES //

import upper_4x4_values_only from './fixtures/upper_4x4_values_only.json' with { type: 'json' };
import upper_3x3_with_vt from './fixtures/upper_3x3_with_vt.json' with { type: 'json' };
import upper_3x3_with_vt_and_u from './fixtures/upper_3x3_with_vt_and_u.json' with { type: 'json' };
import lower_3x3_values_only from './fixtures/lower_3x3_values_only.json' with { type: 'json' };
import lower_3x3_with_u from './fixtures/lower_3x3_with_u.json' with { type: 'json' };
import n_1 from './fixtures/n_1.json' with { type: 'json' };
import n_0 from './fixtures/n_0.json' with { type: 'json' };
import upper_2x2_with_vectors from './fixtures/upper_2x2_with_vectors.json' with { type: 'json' };
import n_1_neg_with_vt from './fixtures/n_1_neg_with_vt.json' with { type: 'json' };
import upper_3x3_with_c from './fixtures/upper_3x3_with_c.json' with { type: 'json' };
import upper_4x4_idir2 from './fixtures/upper_4x4_idir2.json' with { type: 'json' };
import upper_3x3_zero_shift from './fixtures/upper_3x3_zero_shift.json' with { type: 'json' };
import lower_3x3_with_c from './fixtures/lower_3x3_with_c.json' with { type: 'json' };
import upper_3x3_idir2_with_vectors from './fixtures/upper_3x3_idir2_with_vectors.json' with { type: 'json' };
import upper_3x3_negative_d from './fixtures/upper_3x3_negative_d.json' with { type: 'json' };
import nearly_diagonal from './fixtures/nearly_diagonal.json' with { type: 'json' };
import lower_3x3_with_vt_and_u from './fixtures/lower_3x3_with_vt_and_u.json' with { type: 'json' };
import lower_3x3_all_vectors from './fixtures/lower_3x3_all_vectors.json' with { type: 'json' };
import upper_3x3_zero_d from './fixtures/upper_3x3_zero_d.json' with { type: 'json' };
import upper_3x3_zero_shift_all_vecs from './fixtures/upper_3x3_zero_shift_all_vecs.json' with { type: 'json' };
import upper_4x4_idir2_all_vecs from './fixtures/upper_4x4_idir2_all_vecs.json' with { type: 'json' };
import upper_4x4_idir1_zero_shift_all_vecs from './fixtures/upper_4x4_idir1_zero_shift_all_vecs.json' with { type: 'json' };
import upper_3x3_near_zero_shift from './fixtures/upper_3x3_near_zero_shift.json' with { type: 'json' };

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

/**
* Creates identity matrix of size n in column-major order.
*/
function eye( n ) {
	const A = new Float64Array( n * n );
	let i;
	for ( i = 0; i < n; i++ ) {
		A[ i + i * n ] = 1.0;
	}
	return A;
}

/**
* Extracts elements from a Float64Array into a plain array.
*/
function toArray( arr, len ) {
	const out = [];
	let i;
	for ( i = 0; i < len; i++ ) {
		out.push( arr[ i ] );
	}
	return out;
}

// TESTS //

test( 'dbdsqr: upper_4x4_values_only', function t() {

	const tc = upper_4x4_values_only;
	const n = 4;
	const d = new Float64Array( [ 4.0, 3.0, 2.0, 1.0 ] );
	const e = new Float64Array( [ 1.0, 1.0, 1.0 ] );
	const work = new Float64Array( 100 );
	const VT = new Float64Array( 1 );
	const U = new Float64Array( 1 );
	const C = new Float64Array( 1 );
	const info = dbdsqr( 'upper', n, 0, 0, 0, d, 1, 0, e, 1, 0, VT, 1, 1, 0, U, 1, 1, 0, C, 1, 1, 0, work, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, tc.info );
	assertArrayClose( toArray( d, n ), tc.d, 1e-14, 'd' );
});

test( 'dbdsqr: upper_3x3_with_vt', function t() {

	const tc = upper_3x3_with_vt;
	const n = 3;
	const d = new Float64Array( [ 3.0, 2.0, 1.0 ] );
	const e = new Float64Array( [ 0.5, 0.5 ] );
	const work = new Float64Array( 100 );
	const VT = eye( 3 );
	const U = new Float64Array( 1 );
	const C = new Float64Array( 1 );
	const info = dbdsqr( 'upper', n, 3, 0, 0, d, 1, 0, e, 1, 0, VT, 1, n, 0, U, 1, 1, 0, C, 1, 1, 0, work, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, tc.info );
	assertArrayClose( toArray( d, n ), tc.d, 1e-14, 'd' );
	assertArrayClose( toArray( VT, n * n ), tc.vt, 1e-14, 'vt' );
});

test( 'dbdsqr: upper_3x3_with_vt_and_u', function t() {

	const tc = upper_3x3_with_vt_and_u;
	const n = 3;
	const d = new Float64Array( [ 5.0, 3.0, 1.0 ] );
	const e = new Float64Array( [ 2.0, 1.0 ] );
	const work = new Float64Array( 100 );
	const VT = eye( 3 );
	const U = eye( 3 );
	const C = new Float64Array( 1 );
	const info = dbdsqr( 'upper', n, 3, 3, 0, d, 1, 0, e, 1, 0, VT, 1, n, 0, U, 1, n, 0, C, 1, 1, 0, work, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, tc.info );
	assertArrayClose( toArray( d, n ), tc.d, 1e-14, 'd' );
	assertArrayClose( toArray( VT, n * n ), tc.vt, 1e-14, 'vt' );
	assertArrayClose( toArray( U, n * n ), tc.u, 1e-14, 'u' );
});

test( 'dbdsqr: lower_3x3_values_only', function t() {

	const tc = lower_3x3_values_only;
	const n = 3;
	const d = new Float64Array( [ 4.0, 3.0, 2.0 ] );
	const e = new Float64Array( [ 1.5, 0.5 ] );
	const work = new Float64Array( 100 );
	const VT = new Float64Array( 1 );
	const U = new Float64Array( 1 );
	const C = new Float64Array( 1 );
	const info = dbdsqr( 'lower', n, 0, 0, 0, d, 1, 0, e, 1, 0, VT, 1, 1, 0, U, 1, 1, 0, C, 1, 1, 0, work, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, tc.info );
	assertArrayClose( toArray( d, n ), tc.d, 1e-14, 'd' );
});

test( 'dbdsqr: lower_3x3_with_u', function t() {

	const tc = lower_3x3_with_u;
	const n = 3;
	const d = new Float64Array( [ 4.0, 3.0, 2.0 ] );
	const e = new Float64Array( [ 1.5, 0.5 ] );
	const work = new Float64Array( 100 );
	const VT = new Float64Array( 1 );
	const U = eye( 3 );
	const C = new Float64Array( 1 );
	const info = dbdsqr( 'lower', n, 0, 3, 0, d, 1, 0, e, 1, 0, VT, 1, 1, 0, U, 1, n, 0, C, 1, 1, 0, work, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, tc.info );
	assertArrayClose( toArray( d, n ), tc.d, 1e-14, 'd' );
	assertArrayClose( toArray( U, n * n ), tc.u, 1e-14, 'u' );
});

test( 'dbdsqr: n_1', function t() {

	const tc = n_1;
	const d = new Float64Array( [ -5.0 ] );
	const e = new Float64Array( 1 );
	const work = new Float64Array( 10 );
	const VT = new Float64Array( 1 );
	const U = new Float64Array( 1 );
	const C = new Float64Array( 1 );
	const info = dbdsqr( 'upper', 1, 0, 0, 0, d, 1, 0, e, 1, 0, VT, 1, 1, 0, U, 1, 1, 0, C, 1, 1, 0, work, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, tc.info );
	assertArrayClose( toArray( d, 1 ), tc.d, 1e-14, 'd' );
});

test( 'dbdsqr: n_0', function t() {

	const tc = n_0;
	const d = new Float64Array( 1 );
	const e = new Float64Array( 1 );
	const work = new Float64Array( 10 );
	const VT = new Float64Array( 1 );
	const U = new Float64Array( 1 );
	const C = new Float64Array( 1 );
	const info = dbdsqr( 'upper', 0, 0, 0, 0, d, 1, 0, e, 1, 0, VT, 1, 1, 0, U, 1, 1, 0, C, 1, 1, 0, work, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, tc.info );
});

test( 'dbdsqr: upper_2x2_with_vectors', function t() {

	const tc = upper_2x2_with_vectors;
	const n = 2;
	const d = new Float64Array( [ 3.0, 1.0 ] );
	const e = new Float64Array( [ 2.0 ] );
	const work = new Float64Array( 100 );
	const VT = eye( 2 );
	const U = eye( 2 );
	const C = new Float64Array( 1 );
	const info = dbdsqr( 'upper', n, 2, 2, 0, d, 1, 0, e, 1, 0, VT, 1, n, 0, U, 1, n, 0, C, 1, 1, 0, work, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, tc.info );
	assertArrayClose( toArray( d, n ), tc.d, 1e-14, 'd' );
	assertArrayClose( toArray( VT, n * n ), tc.vt, 1e-14, 'vt' );
	assertArrayClose( toArray( U, n * n ), tc.u, 1e-14, 'u' );
});

test( 'dbdsqr: n_1_neg_with_vt', function t() {

	const tc = n_1_neg_with_vt;
	const d = new Float64Array( [ -3.0 ] );
	const e = new Float64Array( 1 );
	const work = new Float64Array( 10 );
	const VT = new Float64Array( [ 1.0, 3.0 ] );
	const U = new Float64Array( 1 );
	const C = new Float64Array( 1 );
	const info = dbdsqr( 'upper', 1, 2, 0, 0, d, 1, 0, e, 1, 0, VT, 1, 1, 0, U, 1, 1, 0, C, 1, 1, 0, work, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, tc.info );
	assertArrayClose( toArray( d, 1 ), tc.d, 1e-14, 'd' );
	assertArrayClose( toArray( VT, 2 ), tc.vt, 1e-14, 'vt' );
});

test( 'dbdsqr: upper_3x3_with_c', function t() {

	const tc = upper_3x3_with_c;
	const n = 3;
	const ncc = 2;
	const d = new Float64Array( [ 4.0, 2.0, 1.0 ] );
	const e = new Float64Array( [ 1.0, 0.5 ] );
	const work = new Float64Array( 100 );
	const VT = new Float64Array( 1 );
	const U = new Float64Array( 1 );
	const C = new Float64Array( [ 1.0, 0.5, 1.5, 2.0, 0.25, 2.5 ] );
	const info = dbdsqr( 'upper', n, 0, 0, ncc, d, 1, 0, e, 1, 0, VT, 1, 1, 0, U, 1, 1, 0, C, 1, n, 0, work, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, tc.info );
	assertArrayClose( toArray( d, n ), tc.d, 1e-14, 'd' );
	assertArrayClose( toArray( C, n * ncc ), tc.c, 1e-14, 'c' );
});

test( 'dbdsqr: upper_4x4_idir2', function t() {

	const tc = upper_4x4_idir2;
	const n = 4;
	const d = new Float64Array( [ 0.5, 1.0, 2.0, 4.0 ] );
	const e = new Float64Array( [ 0.1, 0.1, 0.1 ] );
	const work = new Float64Array( 100 );
	const VT = new Float64Array( 1 );
	const U = new Float64Array( 1 );
	const C = new Float64Array( 1 );
	const info = dbdsqr( 'upper', n, 0, 0, 0, d, 1, 0, e, 1, 0, VT, 1, 1, 0, U, 1, 1, 0, C, 1, 1, 0, work, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, tc.info );
	assertArrayClose( toArray( d, n ), tc.d, 1e-14, 'd' );
});

test( 'dbdsqr: upper_3x3_zero_shift', function t() {

	const tc = upper_3x3_zero_shift;
	const n = 3;
	const d = new Float64Array( [ 1.0, 1e-15, 1.0 ] );
	const e = new Float64Array( [ 1.0, 1.0 ] );
	const work = new Float64Array( 100 );
	const VT = eye( 3 );
	const U = eye( 3 );
	const C = new Float64Array( 1 );
	const info = dbdsqr( 'upper', n, 3, 3, 0, d, 1, 0, e, 1, 0, VT, 1, n, 0, U, 1, n, 0, C, 1, 1, 0, work, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, tc.info );
	assertArrayClose( toArray( d, n ), tc.d, 1e-14, 'd' );
	assertArrayClose( toArray( VT, n * n ), tc.vt, 1e-14, 'vt' );
	assertArrayClose( toArray( U, n * n ), tc.u, 1e-14, 'u' );
});

test( 'dbdsqr: lower_3x3_with_c', function t() {

	const tc = lower_3x3_with_c;
	const n = 3;
	const ncc = 2;
	const d = new Float64Array( [ 3.0, 2.0, 1.0 ] );
	const e = new Float64Array( [ 0.5, 0.5 ] );
	const work = new Float64Array( 100 );
	const VT = new Float64Array( 1 );
	const U = new Float64Array( 1 );
	const C = new Float64Array( [ 1.0, 0.0, 0.0, 0.0, 1.0, 0.0 ] );
	const info = dbdsqr( 'lower', n, 0, 0, ncc, d, 1, 0, e, 1, 0, VT, 1, 1, 0, U, 1, 1, 0, C, 1, n, 0, work, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, tc.info );
	assertArrayClose( toArray( d, n ), tc.d, 1e-14, 'd' );
	assertArrayClose( toArray( C, n * ncc ), tc.c, 1e-14, 'c' );
});

test( 'dbdsqr: upper_3x3_idir2_with_vectors', function t() {

	const tc = upper_3x3_idir2_with_vectors;
	const n = 3;
	const d = new Float64Array( [ 0.1, 0.5, 3.0 ] );
	const e = new Float64Array( [ 0.2, 0.3 ] );
	const work = new Float64Array( 100 );
	const VT = eye( 3 );
	const U = eye( 3 );
	const C = new Float64Array( 1 );
	const info = dbdsqr( 'upper', n, 3, 3, 0, d, 1, 0, e, 1, 0, VT, 1, n, 0, U, 1, n, 0, C, 1, 1, 0, work, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, tc.info );
	assertArrayClose( toArray( d, n ), tc.d, 1e-14, 'd' );
	assertArrayClose( toArray( VT, n * n ), tc.vt, 1e-14, 'vt' );
	assertArrayClose( toArray( U, n * n ), tc.u, 1e-14, 'u' );
});

test( 'dbdsqr: upper_3x3_negative_d', function t() {

	const tc = upper_3x3_negative_d;
	const n = 3;
	const d = new Float64Array( [ -3.0, 2.0, -1.0 ] );
	const e = new Float64Array( [ 0.5, 0.5 ] );
	const work = new Float64Array( 100 );
	const VT = eye( 3 );
	const U = new Float64Array( 1 );
	const C = new Float64Array( 1 );
	const info = dbdsqr( 'upper', n, 3, 0, 0, d, 1, 0, e, 1, 0, VT, 1, n, 0, U, 1, 1, 0, C, 1, 1, 0, work, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, tc.info );
	assertArrayClose( toArray( d, n ), tc.d, 1e-14, 'd' );
	assertArrayClose( toArray( VT, n * n ), tc.vt, 1e-14, 'vt' );
});

test( 'dbdsqr: nearly_diagonal', function t() {

	const tc = nearly_diagonal;
	const n = 4;
	const d = new Float64Array( [ 5.0, 3.0, 2.0, 1.0 ] );
	const e = new Float64Array( [ 1e-16, 1e-16, 1e-16 ] );
	const work = new Float64Array( 100 );
	const VT = new Float64Array( 1 );
	const U = new Float64Array( 1 );
	const C = new Float64Array( 1 );
	const info = dbdsqr( 'upper', n, 0, 0, 0, d, 1, 0, e, 1, 0, VT, 1, 1, 0, U, 1, 1, 0, C, 1, 1, 0, work, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, tc.info );
	assertArrayClose( toArray( d, n ), tc.d, 1e-14, 'd' );
});

test( 'dbdsqr: lower_3x3_with_vt_and_u', function t() {

	const tc = lower_3x3_with_vt_and_u;
	const n = 3;
	const d = new Float64Array( [ 3.0, 2.0, 1.0 ] );
	const e = new Float64Array( [ 0.5, 0.5 ] );
	const work = new Float64Array( 100 );
	const VT = eye( 3 );
	const U = eye( 3 );
	const C = new Float64Array( 1 );
	const info = dbdsqr( 'lower', n, 3, 3, 0, d, 1, 0, e, 1, 0, VT, 1, n, 0, U, 1, n, 0, C, 1, 1, 0, work, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, tc.info );
	assertArrayClose( toArray( d, n ), tc.d, 1e-14, 'd' );
	assertArrayClose( toArray( VT, n * n ), tc.vt, 1e-14, 'vt' );
	assertArrayClose( toArray( U, n * n ), tc.u, 1e-14, 'u' );
});

test( 'dbdsqr: lower_3x3_all_vectors', function t() {

	const tc = lower_3x3_all_vectors;
	const n = 3;
	const ncc = 2;
	const d = new Float64Array( [ 4.0, 2.0, 1.0 ] );
	const e = new Float64Array( [ 1.0, 0.5 ] );
	const work = new Float64Array( 100 );
	const VT = eye( 3 );
	const U = eye( 3 );
	const C = new Float64Array( [ 1.0, 0.5, 1.5, 2.0, 0.25, 2.5 ] );
	const info = dbdsqr( 'lower', n, 3, 3, ncc, d, 1, 0, e, 1, 0, VT, 1, n, 0, U, 1, n, 0, C, 1, n, 0, work, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, tc.info );
	assertArrayClose( toArray( d, n ), tc.d, 1e-14, 'd' );
	assertArrayClose( toArray( VT, n * n ), tc.vt, 1e-14, 'vt' );
	assertArrayClose( toArray( U, n * n ), tc.u, 1e-14, 'u' );
	assertArrayClose( toArray( C, n * ncc ), tc.c, 1e-14, 'c' );
});

test( 'dbdsqr: upper_3x3_zero_d', function t() {

	const tc = upper_3x3_zero_d;
	const n = 3;
	const d = new Float64Array( [ 2.0, 0.0, 3.0 ] );
	const e = new Float64Array( [ 1.0, 1.0 ] );
	const work = new Float64Array( 100 );
	const VT = eye( 3 );
	const U = eye( 3 );
	const C = new Float64Array( 1 );
	const info = dbdsqr( 'upper', n, 3, 3, 0, d, 1, 0, e, 1, 0, VT, 1, n, 0, U, 1, n, 0, C, 1, 1, 0, work, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, tc.info );
	assertArrayClose( toArray( d, n ), tc.d, 1e-14, 'd' );
	assertArrayClose( toArray( VT, n * n ), tc.vt, 1e-14, 'vt' );
	assertArrayClose( toArray( U, n * n ), tc.u, 1e-14, 'u' );
});

test( 'dbdsqr: upper_3x3_zero_shift_all_vecs', function t() {

	const tc = upper_3x3_zero_shift_all_vecs;
	const n = 3;
	const ncc = 2;
	const d = new Float64Array( [ 1e-15, 1.0, 1.0 ] );
	const e = new Float64Array( [ 1.0, 1.0 ] );
	const work = new Float64Array( 100 );
	const VT = eye( 3 );
	const U = eye( 3 );
	const C = new Float64Array( [ 1.0, 0.5, 1.5, 2.0, 0.25, 2.5 ] );
	const info = dbdsqr( 'upper', n, 3, 3, ncc, d, 1, 0, e, 1, 0, VT, 1, n, 0, U, 1, n, 0, C, 1, n, 0, work, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, tc.info );
	assertArrayClose( toArray( d, n ), tc.d, 1e-14, 'd' );
	assertArrayClose( toArray( VT, n * n ), tc.vt, 1e-14, 'vt' );
	assertArrayClose( toArray( U, n * n ), tc.u, 1e-14, 'u' );
	assertArrayClose( toArray( C, n * ncc ), tc.c, 1e-14, 'c' );
});

test( 'dbdsqr: upper_4x4_idir2_all_vecs', function t() {

	const tc = upper_4x4_idir2_all_vecs;
	const n = 4;
	const ncc = 2;
	const d = new Float64Array( [ 0.5, 1.0, 2.0, 4.0 ] );
	const e = new Float64Array( [ 0.1, 0.1, 0.1 ] );
	const work = new Float64Array( 100 );
	const VT = eye( 4 );
	const U = eye( 4 );
	const C = new Float64Array( [ 1.0, 0.5, 1.5, 0.25, 2.0, 0.75, 2.5, 1.0 ] );
	const info = dbdsqr( 'upper', n, 4, 4, ncc, d, 1, 0, e, 1, 0, VT, 1, n, 0, U, 1, n, 0, C, 1, n, 0, work, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, tc.info );
	assertArrayClose( toArray( d, n ), tc.d, 1e-14, 'd' );
	assertArrayClose( toArray( VT, n * n ), tc.vt, 1e-14, 'vt' );
	assertArrayClose( toArray( U, n * n ), tc.u, 1e-14, 'u' );
	assertArrayClose( toArray( C, n * ncc ), tc.c, 1e-14, 'c' );
});

test( 'dbdsqr: upper_4x4_idir1_zero_shift_all_vecs', function t() {

	const tc = upper_4x4_idir1_zero_shift_all_vecs;
	const n = 4;
	const ncc = 2;
	const d = new Float64Array( [ 10.0, 1e-15, 5.0, 1.0 ] );
	const e = new Float64Array( [ 0.1, 0.1, 0.1 ] );
	const work = new Float64Array( 100 );
	const VT = eye( 4 );
	const U = eye( 4 );
	const C = new Float64Array( [ 1.0, 0.5, 1.5, 0.25, 2.0, 0.75, 2.5, 1.0 ] );
	const info = dbdsqr( 'upper', n, 4, 4, ncc, d, 1, 0, e, 1, 0, VT, 1, n, 0, U, 1, n, 0, C, 1, n, 0, work, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, tc.info );
	assertArrayClose( toArray( d, n ), tc.d, 1e-14, 'd' );
	assertArrayClose( toArray( VT, n * n ), tc.vt, 1e-14, 'vt' );
	assertArrayClose( toArray( U, n * n ), tc.u, 1e-14, 'u' );
	assertArrayClose( toArray( C, n * ncc ), tc.c, 1e-14, 'c' );
});

test( 'dbdsqr: upper_3x3_near_zero_shift', function t() {

	const tc = upper_3x3_near_zero_shift;
	const n = 3;
	const d = new Float64Array( [ 1e8, 1.0, 1.0 ] );
	const e = new Float64Array( [ 0.5, 0.5 ] );
	const work = new Float64Array( 100 );
	const VT = eye( 3 );
	const U = eye( 3 );
	const C = new Float64Array( 1 );
	const info = dbdsqr( 'upper', n, 3, 3, 0, d, 1, 0, e, 1, 0, VT, 1, n, 0, U, 1, n, 0, C, 1, 1, 0, work, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, tc.info );
	assertArrayClose( toArray( d, n ), tc.d, 1e-14, 'd' );
	assertArrayClose( toArray( VT, n * n ), tc.vt, 1e-14, 'vt' );
	assertArrayClose( toArray( U, n * n ), tc.u, 1e-14, 'u' );
});
