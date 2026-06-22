/* eslint-disable no-restricted-syntax, stdlib/first-unit-test, max-lines */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import zpbstf from './../lib/ndarray.js';

// FIXTURES //

import upper_tridiag_5 from './fixtures/upper_tridiag_5.json' with { type: 'json' };
import lower_tridiag_5 from './fixtures/lower_tridiag_5.json' with { type: 'json' };
import upper_penta_4 from './fixtures/upper_penta_4.json' with { type: 'json' };
import lower_penta_4 from './fixtures/lower_penta_4.json' with { type: 'json' };
import n_one from './fixtures/n_one.json' with { type: 'json' };
import not_hpd_upper from './fixtures/not_hpd_upper.json' with { type: 'json' };
import not_hpd_lower from './fixtures/not_hpd_lower.json' with { type: 'json' };
import upper_7x7_kd2 from './fixtures/upper_7x7_kd2.json' with { type: 'json' };
import lower_7x7_kd2 from './fixtures/lower_7x7_kd2.json' with { type: 'json' };

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

/**
* Converts a typed array to a plain array.
*
* @private
* @param {TypedArray} arr - input array
* @returns {Array} output array
*/
function toArray( arr ) {
	var out = [];
	var i;
	for ( i = 0; i < arr.length; i++ ) {
		out.push( arr[ i ] );
	}
	return out;
}

// TESTS //

test( 'zpbstf: upper_tridiag_5 (UPLO=U, N=5, KD=1)', function t() {
	var info;
	var tc;
	var AB;

	tc = upper_tridiag_5;
	AB = new Complex128Array([
		0,
		0,
		4,
		0,
		-1,
		0.5,
		4,
		0,
		-1,
		0.5,
		4,
		0,
		-1,
		0.5,
		4,
		0,
		-1,
		0.5,
		4,
		0
	]);
	info = zpbstf( 'upper', 5, 1, AB, 1, 2, 0 );
	assert.equal( info, tc.info );
	assertArrayClose( toArray( reinterpret( AB, 0 ) ), tc.ab, 1e-14, 'AB' );
});

test( 'zpbstf: lower_tridiag_5 (UPLO=L, N=5, KD=1)', function t() {
	var info;
	var tc;
	var AB;

	tc = lower_tridiag_5;
	AB = new Complex128Array([
		4,
		0,
		-1,
		-0.5,
		4,
		0,
		-1,
		-0.5,
		4,
		0,
		-1,
		-0.5,
		4,
		0,
		-1,
		-0.5,
		4,
		0,
		0,
		0
	]);
	info = zpbstf( 'lower', 5, 1, AB, 1, 2, 0 );
	assert.equal( info, tc.info );
	assertArrayClose( toArray( reinterpret( AB, 0 ) ), tc.ab, 1e-14, 'AB' );
});

test( 'zpbstf: upper_penta_4 (UPLO=U, N=4, KD=2)', function t() {
	var info;
	var tc;
	var AB;

	tc = upper_penta_4;
	AB = new Complex128Array([
		0,
		0,
		0,
		0,
		10,
		0,
		0,
		0,
		1,
		1,
		8,
		0,
		0.5,
		-0.5,
		2,
		0.5,
		6,
		0,
		0,
		0,
		1,
		-0.5,
		7,
		0
	]);
	info = zpbstf( 'upper', 4, 2, AB, 1, 3, 0 );
	assert.equal( info, tc.info );
	assertArrayClose( toArray( reinterpret( AB, 0 ) ), tc.ab, 1e-14, 'AB' );
});

test( 'zpbstf: lower_penta_4 (UPLO=L, N=4, KD=2)', function t() {
	var info;
	var tc;
	var AB;

	tc = lower_penta_4;
	AB = new Complex128Array([
		10,
		0,
		1,
		-1,
		0.5,
		0.5,
		8,
		0,
		2,
		-0.5,
		1,
		0.5,
		6,
		0,
		1,
		-1,
		0,
		0,
		7,
		0,
		0,
		0,
		0,
		0
	]);
	info = zpbstf( 'lower', 4, 2, AB, 1, 3, 0 );
	assert.equal( info, tc.info );
	assertArrayClose( toArray( reinterpret( AB, 0 ) ), tc.ab, 1e-14, 'AB' );
});

test( 'zpbstf: n_one (N=1)', function t() {
	var info;
	var tc;
	var AB;

	tc = n_one;
	AB = new Complex128Array( [ 9, 0 ] );
	info = zpbstf( 'upper', 1, 0, AB, 1, 1, 0 );
	assert.equal( info, tc.info );
	assertArrayClose( toArray( reinterpret( AB, 0 ) ), tc.ab, 1e-14, 'AB' );
});

test( 'zpbstf: n_zero (N=0 quick return)', function t() {
	var info;
	var AB;

	AB = new Complex128Array( 4 );
	info = zpbstf( 'upper', 0, 1, AB, 1, 2, 0 );
	assert.equal( info, 0 );
});

test( 'zpbstf: not_hpd_upper (not positive definite, upper)', function t() {
	var info;
	var tc;
	var AB;

	tc = not_hpd_upper;
	AB = new Complex128Array([
		0,
		0,
		1,
		0,
		2,
		1,
		1,
		0
	]);
	info = zpbstf( 'upper', 2, 1, AB, 1, 2, 0 );
	assert.equal( info, tc.info );
});

test( 'zpbstf: not_hpd_lower (not positive definite, lower)', function t() {
	var info;
	var tc;
	var AB;

	tc = not_hpd_lower;
	AB = new Complex128Array([
		1,
		0,
		2,
		-1,
		1,
		0,
		0,
		0
	]);
	info = zpbstf( 'lower', 2, 1, AB, 1, 2, 0 );
	assert.equal( info, tc.info );
});

test( 'zpbstf: upper_7x7_kd2 (UPLO=U, N=7, KD=2)', function t() {
	var info;
	var tc;
	var AB;

	tc = upper_7x7_kd2;
	AB = new Complex128Array([
		0,
		0,
		0,
		0,
		10,
		0,
		0,
		0,
		-1,
		0.5,
		10,
		0,
		0.3,
		-0.2,
		-1,
		0.5,
		10,
		0,
		0.3,
		-0.2,
		-1,
		0.5,
		10,
		0,
		0.3,
		-0.2,
		-1,
		0.5,
		10,
		0,
		0.3,
		-0.2,
		-1,
		0.5,
		10,
		0,
		0.3,
		-0.2,
		-1,
		0.5,
		10,
		0
	]);
	info = zpbstf( 'upper', 7, 2, AB, 1, 3, 0 );
	assert.equal( info, tc.info );
	assertArrayClose( toArray( reinterpret( AB, 0 ) ), tc.ab, 1e-14, 'AB' );
});

test( 'zpbstf: lower_7x7_kd2 (UPLO=L, N=7, KD=2)', function t() {
	var info;
	var tc;
	var AB;

	tc = lower_7x7_kd2;
	AB = new Complex128Array([
		10,
		0,
		-1,
		-0.5,
		0.3,
		0.2,
		10,
		0,
		-1,
		-0.5,
		0.3,
		0.2,
		10,
		0,
		-1,
		-0.5,
		0.3,
		0.2,
		10,
		0,
		-1,
		-0.5,
		0.3,
		0.2,
		10,
		0,
		-1,
		-0.5,
		0.3,
		0.2,
		10,
		0,
		-1,
		-0.5,
		0,
		0,
		10,
		0,
		0,
		0,
		0,
		0
	]);
	info = zpbstf( 'lower', 7, 2, AB, 1, 3, 0 );
	assert.equal( info, tc.info );
	assertArrayClose( toArray( reinterpret( AB, 0 ) ), tc.ab, 1e-14, 'AB' );
});
