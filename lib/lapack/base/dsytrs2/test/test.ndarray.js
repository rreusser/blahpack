/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import dsytrf from '../../dsytrf/lib/base.js';
import dsytrs2 from './../lib/ndarray.js';

// FIXTURES //

import _4x4_lower_1rhs from './fixtures/4x4_lower_1rhs.json' with { type: 'json' };
import _4x4_upper_1rhs from './fixtures/4x4_upper_1rhs.json' with { type: 'json' };
import _4x4_indef_lower_1rhs from './fixtures/4x4_indef_lower_1rhs.json' with { type: 'json' };
import _4x4_indef_upper_1rhs from './fixtures/4x4_indef_upper_1rhs.json' with { type: 'json' };
import _3x3_lower_2rhs from './fixtures/3x3_lower_2rhs.json' with { type: 'json' };
import _3x3_upper_2rhs from './fixtures/3x3_upper_2rhs.json' with { type: 'json' };
import n_one_lower from './fixtures/n_one_lower.json' with { type: 'json' };
import n_one_upper from './fixtures/n_one_upper.json' with { type: 'json' };
import _5x5_lower_solve from './fixtures/5x5_lower_solve.json' with { type: 'json' };
import _5x5_upper_solve from './fixtures/5x5_upper_solve.json' with { type: 'json' };

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

test( 'dsytrs2: 4x4_lower_1rhs', function t() {
	var work;
	var ipiv;
	var info;
	var tc;
	var A;
	var b;

	tc = _4x4_lower_1rhs;
	A = new Float64Array([
		4,
		2,
		1,
		0,
		0,
		5,
		2,
		1,
		0,
		0,
		6,
		3,
		0,
		0,
		0,
		8
	]);
	b = new Float64Array([ 7, 10, 12, 12 ]);
	ipiv = new Int32Array( 4 );
	work = new Float64Array( 4 );
	dsytrf( 'lower', 4, A, 1, 4, 0, ipiv, 1, 0 );
	info = dsytrs2( 'lower', 4, 1, A, 1, 4, 0, ipiv, 1, 0, b, 1, 4, 0, work, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, tc.info, 'info' );
	assertArrayClose( b, tc.b, 1e-12, 'b' );
});

test( 'dsytrs2: 4x4_upper_1rhs', function t() {
	var work;
	var ipiv;
	var info;
	var tc;
	var A;
	var b;

	tc = _4x4_upper_1rhs;
	A = new Float64Array( 16 );
	A[ 0 ] = 4;
	A[ 4 ] = 2;
	A[ 5 ] = 5;
	A[ 8 ] = 1;
	A[ 9 ] = 2;
	A[ 10 ] = 6;
	A[ 12 ] = 0;
	A[ 13 ] = 1;
	A[ 14 ] = 3;
	A[ 15 ] = 8;
	b = new Float64Array([ 7, 10, 12, 12 ]);
	ipiv = new Int32Array( 4 );
	work = new Float64Array( 4 );
	dsytrf( 'upper', 4, A, 1, 4, 0, ipiv, 1, 0 );
	info = dsytrs2( 'upper', 4, 1, A, 1, 4, 0, ipiv, 1, 0, b, 1, 4, 0, work, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, tc.info, 'info' );
	assertArrayClose( b, tc.b, 1e-12, 'b' );
});

test( 'dsytrs2: 4x4_indef_lower_1rhs', function t() {
	var work;
	var ipiv;
	var info;
	var tc;
	var A;
	var b;

	tc = _4x4_indef_lower_1rhs;
	A = new Float64Array([
		0,
		1,
		2,
		3,
		0,
		0,
		4,
		5,
		0,
		0,
		0,
		6,
		0,
		0,
		0,
		0
	]);
	b = new Float64Array([ 6, 10, 12, 14 ]);
	ipiv = new Int32Array( 4 );
	work = new Float64Array( 4 );
	dsytrf( 'lower', 4, A, 1, 4, 0, ipiv, 1, 0 );
	info = dsytrs2( 'lower', 4, 1, A, 1, 4, 0, ipiv, 1, 0, b, 1, 4, 0, work, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, tc.info, 'info' );
	assertArrayClose( b, tc.b, 1e-12, 'b' );
});

test( 'dsytrs2: 4x4_indef_upper_1rhs', function t() {
	var work;
	var ipiv;
	var info;
	var tc;
	var A;
	var b;

	tc = _4x4_indef_upper_1rhs;
	A = new Float64Array( 16 );
	A[ 0 ] = 0;
	A[ 4 ] = 1;
	A[ 5 ] = 0;
	A[ 8 ] = 2;
	A[ 9 ] = 4;
	A[ 10 ] = 0;
	A[ 12 ] = 3;
	A[ 13 ] = 5;
	A[ 14 ] = 6;
	A[ 15 ] = 0;
	b = new Float64Array([ 6, 10, 12, 14 ]);
	ipiv = new Int32Array( 4 );
	work = new Float64Array( 4 );
	dsytrf( 'upper', 4, A, 1, 4, 0, ipiv, 1, 0 );
	info = dsytrs2( 'upper', 4, 1, A, 1, 4, 0, ipiv, 1, 0, b, 1, 4, 0, work, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, tc.info, 'info' );
	assertArrayClose( b, tc.b, 1e-12, 'b' );
});

test( 'dsytrs2: 3x3_lower_2rhs', function t() {
	var work;
	var ipiv;
	var info;
	var tc;
	var A;
	var b;

	tc = _3x3_lower_2rhs;
	A = new Float64Array([
		4,
		2,
		1,
		0,
		5,
		2,
		0,
		0,
		6
	]);
	b = new Float64Array([
		7,
		9,
		9,
		14,
		18,
		18
	]);
	ipiv = new Int32Array( 3 );
	work = new Float64Array( 3 );
	dsytrf( 'lower', 3, A, 1, 3, 0, ipiv, 1, 0 );
	info = dsytrs2( 'lower', 3, 2, A, 1, 3, 0, ipiv, 1, 0, b, 1, 3, 0, work, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, tc.info, 'info' );
	assertArrayClose( b, tc.b, 1e-12, 'b' );
});

test( 'dsytrs2: 3x3_upper_2rhs', function t() {
	var work;
	var ipiv;
	var info;
	var tc;
	var A;
	var b;

	tc = _3x3_upper_2rhs;
	A = new Float64Array( 9 );
	A[ 0 ] = 4;
	A[ 3 ] = 2;
	A[ 4 ] = 5;
	A[ 6 ] = 1;
	A[ 7 ] = 2;
	A[ 8 ] = 6;
	b = new Float64Array([
		7,
		9,
		9,
		14,
		18,
		18
	]);
	ipiv = new Int32Array( 3 );
	work = new Float64Array( 3 );
	dsytrf( 'upper', 3, A, 1, 3, 0, ipiv, 1, 0 );
	info = dsytrs2( 'upper', 3, 2, A, 1, 3, 0, ipiv, 1, 0, b, 1, 3, 0, work, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, tc.info, 'info' );
	assertArrayClose( b, tc.b, 1e-12, 'b' );
});

test( 'dsytrs2: n_zero', function t() {
	var work;
	var ipiv;
	var info;
	var A;
	var b;

	A = new Float64Array( 1 );
	b = new Float64Array( 1 );
	ipiv = new Int32Array( 1 );
	work = new Float64Array( 1 );
	info = dsytrs2( 'lower', 0, 1, A, 1, 1, 0, ipiv, 1, 0, b, 1, 1, 0, work, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, 0, 'info' );
});

test( 'dsytrs2: nrhs_zero', function t() {
	var work;
	var ipiv;
	var info;
	var A;
	var b;

	A = new Float64Array( 9 );
	b = new Float64Array( 3 );
	ipiv = new Int32Array( 3 );
	work = new Float64Array( 3 );
	info = dsytrs2( 'lower', 3, 0, A, 1, 3, 0, ipiv, 1, 0, b, 1, 3, 0, work, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, 0, 'info' );
});

test( 'dsytrs2: n_one_lower', function t() {
	var work;
	var ipiv;
	var info;
	var tc;
	var A;
	var b;

	tc = n_one_lower;
	A = new Float64Array([ 4 ]);
	b = new Float64Array([ 8 ]);
	ipiv = new Int32Array( 1 );
	work = new Float64Array( 1 );
	dsytrf( 'lower', 1, A, 1, 1, 0, ipiv, 1, 0 );
	info = dsytrs2( 'lower', 1, 1, A, 1, 1, 0, ipiv, 1, 0, b, 1, 1, 0, work, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, tc.info, 'info' );
	assertArrayClose( b, tc.b, 1e-12, 'b' );
});

test( 'dsytrs2: n_one_upper', function t() {
	var work;
	var ipiv;
	var info;
	var tc;
	var A;
	var b;

	tc = n_one_upper;
	A = new Float64Array([ 4 ]);
	b = new Float64Array([ 8 ]);
	ipiv = new Int32Array( 1 );
	work = new Float64Array( 1 );
	dsytrf( 'upper', 1, A, 1, 1, 0, ipiv, 1, 0 );
	info = dsytrs2( 'upper', 1, 1, A, 1, 1, 0, ipiv, 1, 0, b, 1, 1, 0, work, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, tc.info, 'info' );
	assertArrayClose( b, tc.b, 1e-12, 'b' );
});

test( 'dsytrs2: 5x5_lower_solve', function t() {
	var work;
	var ipiv;
	var info;
	var tc;
	var A;
	var b;

	tc = _5x5_lower_solve;
	A = new Float64Array( 25 );
	A[ 0 ] = 1;
	A[ 1 ] = -2;
	A[ 2 ] = 0;
	A[ 3 ] = 3;
	A[ 4 ] = 1;
	A[ 5 ] = 0;
	A[ 6 ] = 0;
	A[ 7 ] = 4;
	A[ 8 ] = -1;
	A[ 9 ] = 2;
	A[ 10 ] = 0;
	A[ 11 ] = 0;
	A[ 12 ] = -3;
	A[ 13 ] = 2;
	A[ 14 ] = 0;
	A[ 15 ] = 0;
	A[ 16 ] = 0;
	A[ 17 ] = 0;
	A[ 18 ] = 1;
	A[ 19 ] = -2;
	A[ 20 ] = 0;
	A[ 21 ] = 0;
	A[ 22 ] = 0;
	A[ 23 ] = 0;
	A[ 24 ] = 4;
	b = new Float64Array([ 14, 16, 7, 1, 17 ]);
	ipiv = new Int32Array( 5 );
	work = new Float64Array( 5 );
	dsytrf( 'lower', 5, A, 1, 5, 0, ipiv, 1, 0 );
	info = dsytrs2( 'lower', 5, 1, A, 1, 5, 0, ipiv, 1, 0, b, 1, 5, 0, work, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, tc.info, 'info' );
	assertArrayClose( b, tc.b, 1e-12, 'b' );
});

test( 'dsytrs2: 5x5_upper_solve', function t() {
	var work;
	var ipiv;
	var info;
	var tc;
	var A;
	var b;

	tc = _5x5_upper_solve;
	A = new Float64Array( 25 );
	A[ 0 ] = 1;
	A[ 5 ] = -2;
	A[ 6 ] = 0;
	A[ 10 ] = 0;
	A[ 11 ] = 4;
	A[ 12 ] = -3;
	A[ 15 ] = 3;
	A[ 16 ] = -1;
	A[ 17 ] = 2;
	A[ 18 ] = 1;
	A[ 20 ] = 1;
	A[ 21 ] = 2;
	A[ 22 ] = 0;
	A[ 23 ] = -2;
	A[ 24 ] = 4;
	b = new Float64Array([ 14, 16, 7, 1, 17 ]);
	ipiv = new Int32Array( 5 );
	work = new Float64Array( 5 );
	dsytrf( 'upper', 5, A, 1, 5, 0, ipiv, 1, 0 );
	info = dsytrs2( 'upper', 5, 1, A, 1, 5, 0, ipiv, 1, 0, b, 1, 5, 0, work, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, tc.info, 'info' );
	assertArrayClose( b, tc.b, 1e-12, 'b' );
});
