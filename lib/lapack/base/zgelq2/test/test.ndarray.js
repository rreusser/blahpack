/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import zgelq2 from './../lib/ndarray.js';

// FIXTURES //

import basic_2x3 from './fixtures/basic_2x3.json' with { type: 'json' };
import basic_3x4 from './fixtures/basic_3x4.json' with { type: 'json' };
import one_by_one from './fixtures/one_by_one.json' with { type: 'json' };
import square_2x2 from './fixtures/square_2x2.json' with { type: 'json' };
import square_3x3 from './fixtures/square_3x3.json' with { type: 'json' };

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

test( 'zgelq2: basic 2x3 matrix', function t() {

	const tc = basic_2x3;
	const a = new Complex128Array([
		1,
		0,
		4,
		1,
		2,
		1,
		5,
		0,
		3,
		0,
		6,
		-1
	]);
	const tau = new Complex128Array( 2 );
	const work = new Complex128Array( 10 );
	const info = zgelq2( 2, 3, a, 1, 2, 0, tau, 1, 0, work, 1, 0 );
	assertClose( info, tc.info, 1e-14, 'info' );
	assertArrayClose( reinterpret( a, 0 ), tc.a, 1e-10, 'a' );
	assertArrayClose( reinterpret( tau, 0 ), tc.tau, 1e-10, 'tau' );
});

test( 'zgelq2: basic 3x4 matrix', function t() {

	const tc = basic_3x4;
	const a = new Complex128Array([
		1,
		1,
		5,
		0,
		9,
		1,
		2,
		0,
		6,
		1,
		10,
		0,
		3,
		-1,
		7,
		0,
		11,
		1,
		4,
		0,
		8,
		-1,
		12,
		0
	]);
	const tau = new Complex128Array( 3 );
	const work = new Complex128Array( 10 );
	const info = zgelq2( 3, 4, a, 1, 3, 0, tau, 1, 0, work, 1, 0 );
	assertClose( info, tc.info, 1e-14, 'info' );
	assertArrayClose( reinterpret( a, 0 ), tc.a, 1e-10, 'a' );
	assertArrayClose( reinterpret( tau, 0 ), tc.tau, 1e-10, 'tau' );
});

test( 'zgelq2: M=0 quick return', function t() {

	const a = new Complex128Array( 2 );
	const tau = new Complex128Array( 2 );
	const work = new Complex128Array( 2 );
	const info = zgelq2( 0, 3, a, 1, 1, 0, tau, 1, 0, work, 1, 0 );
	assertClose( info, 0, 1e-14, 'info' );
});

test( 'zgelq2: N=0 quick return', function t() {

	const a = new Complex128Array( 6 );
	const tau = new Complex128Array( 2 );
	const work = new Complex128Array( 2 );
	const info = zgelq2( 2, 0, a, 1, 2, 0, tau, 1, 0, work, 1, 0 );
	assertClose( info, 0, 1e-14, 'info' );
});

test( 'zgelq2: 1x1 matrix', function t() {

	const tc = one_by_one;
	const a = new Complex128Array( [ 5, 3 ] );
	const tau = new Complex128Array( 1 );
	const work = new Complex128Array( 2 );
	const info = zgelq2( 1, 1, a, 1, 1, 0, tau, 1, 0, work, 1, 0 );
	assertClose( info, tc.info, 1e-14, 'info' );
	assertArrayClose( reinterpret( a, 0 ), tc.a, 1e-10, 'a' );
	assertArrayClose( reinterpret( tau, 0 ), tc.tau, 1e-10, 'tau' );
});

test( 'zgelq2: square 2x2 matrix', function t() {

	const tc = square_2x2;
	const a = new Complex128Array( [ 1, 1, 0, 1, 1, 0, 1, 1 ] );
	const tau = new Complex128Array( 2 );
	const work = new Complex128Array( 10 );
	const info = zgelq2( 2, 2, a, 1, 2, 0, tau, 1, 0, work, 1, 0 );
	assertClose( info, tc.info, 1e-14, 'info' );
	assertArrayClose( reinterpret( a, 0 ), tc.a, 1e-10, 'a' );
	assertArrayClose( reinterpret( tau, 0 ), tc.tau, 1e-10, 'tau' );
});

test( 'zgelq2: square 3x3 matrix', function t() {

	const tc = square_3x3;
	const a = new Complex128Array([
		2,
		1,
		1,
		-1,
		0,
		0.5,
		1,
		0,
		3,
		2,
		1,
		-1,
		-1,
		1,
		0,
		1,
		4,
		0
	]);
	const tau = new Complex128Array( 3 );
	const work = new Complex128Array( 10 );
	const info = zgelq2( 3, 3, a, 1, 3, 0, tau, 1, 0, work, 1, 0 );
	assertClose( info, tc.info, 1e-14, 'info' );
	assertArrayClose( reinterpret( a, 0 ), tc.a, 1e-10, 'a' );
	assertArrayClose( reinterpret( tau, 0 ), tc.tau, 1e-10, 'tau' );
});
