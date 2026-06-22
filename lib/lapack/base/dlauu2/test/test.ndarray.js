/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dlauu2 from './../lib/ndarray.js';

// FIXTURES //

import upper_3x3 from './fixtures/upper_3x3.json' with { type: 'json' };
import lower_3x3 from './fixtures/lower_3x3.json' with { type: 'json' };
import n_one from './fixtures/n_one.json' with { type: 'json' };
import n_zero from './fixtures/n_zero.json' with { type: 'json' };
import lower_n_one from './fixtures/lower_n_one.json' with { type: 'json' };
import upper_4x4 from './fixtures/upper_4x4.json' with { type: 'json' };
import identity_upper from './fixtures/identity_upper.json' with { type: 'json' };
import identity_lower from './fixtures/identity_lower.json' with { type: 'json' };

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

test( 'dlauu2: upper_3x3', function t() {
	var info;
	var tc;
	var A;

	tc = upper_3x3;
	A = new Float64Array([
		2.0,
		0.0,
		0.0,
		1.0,
		4.0,
		0.0,
		3.0,
		5.0,
		6.0
	]);
	info = dlauu2( 'upper', 3, A, 1, 3, 0 );
	assert.equal( info, tc.info );
	assertArrayClose( A, tc.a, 1e-14, 'a' );
});

test( 'dlauu2: lower_3x3', function t() {
	var info;
	var tc;
	var A;

	tc = lower_3x3;
	A = new Float64Array([
		2.0,
		1.0,
		3.0,
		0.0,
		4.0,
		5.0,
		0.0,
		0.0,
		6.0
	]);
	info = dlauu2( 'lower', 3, A, 1, 3, 0 );
	assert.equal( info, tc.info );
	assertArrayClose( A, tc.a, 1e-14, 'a' );
});

test( 'dlauu2: n_one', function t() {
	var info;
	var tc;
	var A;

	tc = n_one;
	A = new Float64Array([ 5.0 ]);
	info = dlauu2( 'upper', 1, A, 1, 1, 0 );
	assert.equal( info, tc.info );
	assertArrayClose( A, tc.a, 1e-14, 'a' );
});

test( 'dlauu2: n_zero', function t() {
	var info;
	var tc;
	var A;

	tc = n_zero;
	A = new Float64Array([ 99.0 ]);
	info = dlauu2( 'upper', 0, A, 1, 1, 0 );
	assert.equal( info, tc.info );
	assert.equal( A[ 0 ], 99.0 );
});

test( 'dlauu2: lower_n_one', function t() {
	var info;
	var tc;
	var A;

	tc = lower_n_one;
	A = new Float64Array([ 3.0 ]);
	info = dlauu2( 'lower', 1, A, 1, 1, 0 );
	assert.equal( info, tc.info );
	assertArrayClose( A, tc.a, 1e-14, 'a' );
});

test( 'dlauu2: upper_4x4', function t() {
	var info;
	var tc;
	var A;

	tc = upper_4x4;
	A = new Float64Array([
		1.0,
		0.0,
		0.0,
		0.0,
		2.0,
		5.0,
		0.0,
		0.0,
		3.0,
		6.0,
		8.0,
		0.0,
		4.0,
		7.0,
		9.0,
		10.0
	]);
	info = dlauu2( 'upper', 4, A, 1, 4, 0 );
	assert.equal( info, tc.info );
	assertArrayClose( A, tc.a, 1e-14, 'a' );
});

test( 'dlauu2: identity_upper', function t() {
	var info;
	var tc;
	var A;

	tc = identity_upper;
	A = new Float64Array([
		1.0,
		0.0,
		0.0,
		0.0,
		1.0,
		0.0,
		0.0,
		0.0,
		1.0
	]);
	info = dlauu2( 'upper', 3, A, 1, 3, 0 );
	assert.equal( info, tc.info );
	assertArrayClose( A, tc.a, 1e-14, 'a' );
});

test( 'dlauu2: identity_lower', function t() {
	var info;
	var tc;
	var A;

	tc = identity_lower;
	A = new Float64Array([
		1.0,
		0.0,
		0.0,
		0.0,
		1.0,
		0.0,
		0.0,
		0.0,
		1.0
	]);
	info = dlauu2( 'lower', 3, A, 1, 3, 0 );
	assert.equal( info, tc.info );
	assertArrayClose( A, tc.a, 1e-14, 'a' );
});

test( 'dlauu2: supports offset', function t() {
	var info;
	var A;

	A = new Float64Array([
		999.0,
		999.0,
		999.0,  // padding
		3.0,
		0.0,
		2.0,
		4.0
	]);
	info = dlauu2( 'upper', 2, A, 1, 2, 3 );
	assert.equal( info, 0 );
	assertClose( A[ 3 ], 13.0, 1e-14, 'A(0,0)' );
	assertClose( A[ 4 ], 0.0, 1e-14, 'A(1,0)' );
	assertClose( A[ 5 ], 8.0, 1e-14, 'A(0,1)' );
	assertClose( A[ 6 ], 16.0, 1e-14, 'A(1,1)' );
});

test( 'dlauu2: supports row-major via strides', function t() {
	var info;
	var tc;
	var A;

	tc = upper_3x3;
	A = new Float64Array([
		2.0,
		1.0,
		3.0,
		0.0,
		4.0,
		5.0,
		0.0,
		0.0,
		6.0
	]);
	info = dlauu2( 'upper', 3, A, 3, 1, 0 );
	assert.equal( info, 0 );
	assertClose( A[ 0 ], 14.0, 1e-14, 'A(0,0)' );
	assertClose( A[ 1 ], 19.0, 1e-14, 'A(0,1)' );
	assertClose( A[ 2 ], 18.0, 1e-14, 'A(0,2)' );
	assertClose( A[ 4 ], 41.0, 1e-14, 'A(1,1)' );
	assertClose( A[ 5 ], 30.0, 1e-14, 'A(1,2)' );
	assertClose( A[ 8 ], 36.0, 1e-14, 'A(2,2)' );
});
