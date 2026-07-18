/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dtpttr from './../lib/ndarray.js';

// FIXTURES //

import lower_4x4 from './fixtures/lower_4x4.json' with { type: 'json' };
import upper_4x4 from './fixtures/upper_4x4.json' with { type: 'json' };
import n_one_lower from './fixtures/n_one_lower.json' with { type: 'json' };
import n_one_upper from './fixtures/n_one_upper.json' with { type: 'json' };
import lower_3x3 from './fixtures/lower_3x3.json' with { type: 'json' };
import upper_3x3 from './fixtures/upper_3x3.json' with { type: 'json' };

// TESTS //

test( 'dtpttr is a function', function t() {
	assert.equal( typeof dtpttr, 'function' );
});

test( 'dtpttr: lower_4x4', function t() {

	const tc = lower_4x4;
	const N = 4;
	const AP = new Float64Array( tc.AP );
	const A = new Float64Array( N * N );
	const info = dtpttr( 'lower', N, AP, 1, 0, A, 1, N, 0 );
	const expected = new Float64Array( tc.A );
	const actual = A;
	assert.equal( info, tc.info );
	assert.deepEqual( actual, expected );
});

test( 'dtpttr: upper_4x4', function t() {

	const tc = upper_4x4;
	const N = 4;
	const AP = new Float64Array( tc.AP );
	const A = new Float64Array( N * N );
	const info = dtpttr( 'upper', N, AP, 1, 0, A, 1, N, 0 );
	const expected = new Float64Array( tc.A );
	const actual = A;
	assert.equal( info, tc.info );
	assert.deepEqual( actual, expected );
});

test( 'dtpttr: n_zero', function t() {

	const AP = new Float64Array( 0 );
	const A = new Float64Array( 0 );
	const info = dtpttr( 'lower', 0, AP, 1, 0, A, 1, 1, 0 );
	assert.equal( info, 0 );
});

test( 'dtpttr: n_one_lower', function t() {

	const tc = n_one_lower;
	const AP = new Float64Array( [ 42.0 ] );
	const A = new Float64Array( 1 );
	const info = dtpttr( 'lower', 1, AP, 1, 0, A, 1, 1, 0 );
	assert.equal( info, tc.info );
	assert.equal( A[ 0 ], tc.A[ 0 ] );
});

test( 'dtpttr: n_one_upper', function t() {

	const tc = n_one_upper;
	const AP = new Float64Array( [ 77.0 ] );
	const A = new Float64Array( 1 );
	const info = dtpttr( 'upper', 1, AP, 1, 0, A, 1, 1, 0 );
	assert.equal( info, tc.info );
	assert.equal( A[ 0 ], tc.A[ 0 ] );
});

test( 'dtpttr: lower_3x3', function t() {

	const tc = lower_3x3;
	const N = 3;
	const AP = new Float64Array( tc.AP );
	const A = new Float64Array( N * N );
	const info = dtpttr( 'lower', N, AP, 1, 0, A, 1, N, 0 );
	const expected = new Float64Array( tc.A );
	const actual = A;
	assert.equal( info, tc.info );
	assert.deepEqual( actual, expected );
});

test( 'dtpttr: upper_3x3', function t() {

	const tc = upper_3x3;
	const N = 3;
	const AP = new Float64Array( tc.AP );
	const A = new Float64Array( N * N );
	const info = dtpttr( 'upper', N, AP, 1, 0, A, 1, N, 0 );
	const expected = new Float64Array( tc.A );
	const actual = A;
	assert.equal( info, tc.info );
	assert.deepEqual( actual, expected );
});

test( 'dtpttr: supports AP stride', function t() {

	const AP = new Float64Array( [ 1.0, 0.0, 2.0, 0.0, 3.0 ] );
	const A = new Float64Array( 4 );
	const info = dtpttr( 'lower', 2, AP, 2, 0, A, 1, 2, 0 );
	assert.equal( info, 0 );
	assert.equal( A[ 0 ], 1.0 );
	assert.equal( A[ 1 ], 2.0 );
	assert.equal( A[ 2 ], 0.0 );
	assert.equal( A[ 3 ], 3.0 );
});

test( 'dtpttr: supports AP offset', function t() {

	const AP = new Float64Array( [ 0.0, 0.0, 5.0, 6.0, 7.0 ] );
	const A = new Float64Array( 4 );
	const info = dtpttr( 'lower', 2, AP, 1, 2, A, 1, 2, 0 );
	assert.equal( info, 0 );
	assert.equal( A[ 0 ], 5.0 );
	assert.equal( A[ 1 ], 6.0 );
	assert.equal( A[ 2 ], 0.0 );
	assert.equal( A[ 3 ], 7.0 );
});

test( 'dtpttr: supports A offset', function t() {

	const AP = new Float64Array( [ 10.0, 20.0, 30.0 ] );
	const A = new Float64Array( 8 );
	const info = dtpttr( 'upper', 2, AP, 1, 0, A, 1, 2, 4 );
	assert.equal( info, 0 );
	assert.equal( A[ 4 ], 10.0 );
	assert.equal( A[ 5 ], 0.0 );
	assert.equal( A[ 6 ], 20.0 );
	assert.equal( A[ 7 ], 30.0 );
});

test( 'dtpttr: supports non-unit A strides', function t() {

	const AP = new Float64Array( [ 1.0, 2.0, 3.0 ] );
	const A = new Float64Array( 8 );
	const info = dtpttr( 'lower', 2, AP, 1, 0, A, 2, 4, 0 );
	assert.equal( info, 0 );
	assert.equal( A[ 0 ], 1.0 );
	assert.equal( A[ 2 ], 2.0 );
	assert.equal( A[ 4 ], 0.0 );
	assert.equal( A[ 6 ], 3.0 );
});
