/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import dzsum1 from './../lib/ndarray.js';

// FIXTURES //

import basic_3 from './fixtures/basic_3.json' with { type: 'json' };
import stride2 from './fixtures/stride2.json' with { type: 'json' };
import n_zero from './fixtures/n_zero.json' with { type: 'json' };
import n_one from './fixtures/n_one.json' with { type: 'json' };
import all_zeros from './fixtures/all_zeros.json' with { type: 'json' };
import purely_real from './fixtures/purely_real.json' with { type: 'json' };
import purely_imag from './fixtures/purely_imag.json' with { type: 'json' };

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
	assert.ok( relErr <= tol, msg + ': expected ' + expected + ', got ' + actual + ' (relErr=' + relErr + ')' ); // eslint-disable-line max-len
}

// TESTS //

test( 'dzsum1: main export is a function', function t() {
	assert.strictEqual( typeof dzsum1, 'function' );
});

test( 'dzsum1: basic 3-element vector', function t() {

	const tc = basic_3;
	const zx = new Complex128Array( [ 3, 4, 1, 0, 0, 1 ] );
	const result = dzsum1( 3, zx, 1, 0 );
	assertClose( result, tc.result, 1e-14, 'result' );
});

test( 'dzsum1: stride=2', function t() {

	const tc = stride2;
	const zx = new Complex128Array( [ 3, 4, 99, 99, 5, 12, 99, 99, 8, 15 ] );
	const result = dzsum1( 3, zx, 2, 0 );
	assertClose( result, tc.result, 1e-14, 'result' );
});

test( 'dzsum1: N=0 returns 0', function t() {

	const tc = n_zero;
	const zx = new Complex128Array( [ 1, 2 ] );
	const result = dzsum1( 0, zx, 1, 0 );
	assertClose( result, tc.result, 1e-14, 'result' );
});

test( 'dzsum1: N=1', function t() {

	const tc = n_one;
	const zx = new Complex128Array( [ 6, 8 ] );
	const result = dzsum1( 1, zx, 1, 0 );
	assertClose( result, tc.result, 1e-14, 'result' );
});

test( 'dzsum1: all zeros', function t() {

	const tc = all_zeros;
	const zx = new Complex128Array( [ 0, 0, 0, 0, 0, 0 ] );
	const result = dzsum1( 3, zx, 1, 0 );
	assertClose( result, tc.result, 1e-14, 'result' );
});

test( 'dzsum1: purely real', function t() {

	const tc = purely_real;
	const zx = new Complex128Array( [ 3, 0, -4, 0, 5, 0 ] );
	const result = dzsum1( 3, zx, 1, 0 );
	assertClose( result, tc.result, 1e-14, 'result' );
});

test( 'dzsum1: purely imaginary', function t() {

	const tc = purely_imag;
	const zx = new Complex128Array( [ 0, 2, 0, -3 ] );
	const result = dzsum1( 2, zx, 1, 0 );
	assertClose( result, tc.result, 1e-14, 'result' );
});

test( 'dzsum1: nonzero offset', function t() {

	const zx = new Complex128Array( [ 99, 99, 3, 4, 1, 0, 0, 1 ] );
	const result = dzsum1( 3, zx, 1, 1 );
	assertClose( result, 7.0, 1e-14, 'result' );
});
