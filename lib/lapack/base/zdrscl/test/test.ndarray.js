/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import zdrscl from './../lib/ndarray.js';

// FIXTURES //

import basic_scale_2 from './fixtures/basic_scale_2.json' with { type: 'json' };
import identity_scale from './fixtures/identity_scale.json' with { type: 'json' };
import scale_half from './fixtures/scale_half.json' with { type: 'json' };
import n_zero from './fixtures/n_zero.json' with { type: 'json' };
import n_one from './fixtures/n_one.json' with { type: 'json' };
import large_scalar from './fixtures/large_scalar.json' with { type: 'json' };
import small_scalar from './fixtures/small_scalar.json' with { type: 'json' };
import stride_2 from './fixtures/stride_2.json' with { type: 'json' };

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
	assert.ok( relErr <= tol, msg + ': expected ' + expected + ', got ' + actual + ' (relErr=' + relErr + ')' ); // eslint-disable-line max-len
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

test( 'zdrscl: main export is a function', function t() {
	assert.strictEqual( typeof zdrscl, 'function' );
});

test( 'zdrscl: basic scaling by 1/2 (sa=2)', function t() {
	var tc = basic_scale_2;
	var x = new Complex128Array( [ 2.0, 4.0, 6.0, 8.0, 10.0, 12.0 ] );
	zdrscl( 3, 2.0, x, 1, 0 );
	assertArrayClose( reinterpret( x, 0 ), tc.x, 1e-14, 'x' );
});

test( 'zdrscl: identity scale (sa=1)', function t() {
	var tc = identity_scale;
	var x = new Complex128Array( [ 1.0, 2.0, 3.0, 4.0, 5.0, 6.0 ] );
	zdrscl( 3, 1.0, x, 1, 0 );
	assertArrayClose( reinterpret( x, 0 ), tc.x, 1e-14, 'x' );
});

test( 'zdrscl: scale by 1/0.5 (multiply by 2)', function t() {
	var tc = scale_half;
	var x = new Complex128Array( [ 1.0, 3.0, 5.0, 7.0 ] );
	zdrscl( 2, 0.5, x, 1, 0 );
	assertArrayClose( reinterpret( x, 0 ), tc.x, 1e-14, 'x' );
});

test( 'zdrscl: N=0 quick return', function t() {
	var tc = n_zero;
	var x = new Complex128Array( [ 99.0, 88.0 ] );
	zdrscl( 0, 2.0, x, 1, 0 );
	assertArrayClose( reinterpret( x, 0 ), tc.x, 1e-14, 'x' );
});

test( 'zdrscl: N=1', function t() {
	var tc = n_one;
	var x = new Complex128Array( [ 4.0, -6.0 ] );
	zdrscl( 1, 2.0, x, 1, 0 );
	assertArrayClose( reinterpret( x, 0 ), tc.x, 1e-14, 'x' );
});

test( 'zdrscl: large scalar (overflow protection)', function t() {
	var tc = large_scalar;
	var x = new Complex128Array( [ 1.0, 2.0, 3.0, 4.0 ] );
	zdrscl( 2, 1.0e300, x, 1, 0 );
	assertArrayClose( reinterpret( x, 0 ), tc.x, 1e-10, 'x' );
});

test( 'zdrscl: small scalar (underflow protection)', function t() {
	var tc = small_scalar;
	var x = new Complex128Array( [ 1.0, 2.0, 3.0, 4.0 ] );
	zdrscl( 2, 1.0e-300, x, 1, 0 );
	assertArrayClose( reinterpret( x, 0 ), tc.x, 1e-10, 'x' );
});

test( 'zdrscl: non-unit stride (incx=2)', function t() {
	var tc = stride_2;
	var x = new Complex128Array( [ 1.0, 2.0, 99.0, 99.0, 3.0, 4.0, 99.0, 99.0 ] );
	zdrscl( 2, 4.0, x, 2, 0 );
	assertArrayClose( reinterpret( x, 0 ), tc.x, 1e-14, 'x' );
});

test( 'zdrscl: very large scalar triggers iterative SMLNUM scaling (line 69)', function t() { // eslint-disable-line max-len
	var xv;
	var sa;
	var x;

	x = new Complex128Array( [ 1.0, 2.0, 3.0, 4.0 ] );
	xv = reinterpret( x, 0 );
	sa = 1e308;
	zdrscl( 2, sa, x, 1, 0 );
	assertClose( xv[ 0 ], 1.0 / sa, 1e-10, 'x[0]' );
	assertClose( xv[ 1 ], 2.0 / sa, 1e-10, 'x[1]' );
	assertClose( xv[ 2 ], 3.0 / sa, 1e-10, 'x[2]' );
	assertClose( xv[ 3 ], 4.0 / sa, 1e-10, 'x[3]' );
});

test( 'zdrscl: very small scalar triggers iterative BIGNUM scaling (line 74)', function t() { // eslint-disable-line max-len
	var xv;
	var sa;
	var x;

	x = new Complex128Array( [ 1e-300, 2e-300, 3e-300, 4e-300 ] );
	xv = reinterpret( x, 0 );
	sa = 5e-309;
	zdrscl( 2, sa, x, 1, 0 );
	assertClose( xv[ 0 ], 1e-300 / sa, 1e-10, 'x[0]' );
	assertClose( xv[ 1 ], 2e-300 / sa, 1e-10, 'x[1]' );
	assertClose( xv[ 2 ], 3e-300 / sa, 1e-10, 'x[2]' );
	assertClose( xv[ 3 ], 4e-300 / sa, 1e-10, 'x[3]' );
});
