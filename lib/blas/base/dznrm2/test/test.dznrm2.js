/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import dznrm2 from './../lib/dznrm2.js';


// FUNCTIONS //

/**
* Asserts that two numbers are approximately equal.
*
* @private
* @param {number} actual - actual value
* @param {number} expected - expected value
* @param {number} tol - relative tolerance
* @param {string} msg - assertion message
*/
function assertClose( actual, expected, tol, msg ) {
	var relErr = Math.abs( actual - expected ) / Math.max( Math.abs( expected ), 1.0 );
	assert.ok( relErr <= tol, msg + ': expected ' + expected + ', got ' + actual + ' (relErr=' + relErr + ')' );
}


// TESTS //

test( 'dznrm2 is a function', function t() {
	assert.strictEqual( typeof dznrm2, 'function', 'is a function' );
});

test( 'dznrm2 has expected arity', function t() {
	assert.strictEqual( dznrm2.length, 3, 'has expected arity' );
});

test( 'dznrm2 throws RangeError for negative N', function t() {
	var zx = new Complex128Array( [ 1, 2 ] );
	assert.throws( function throws() {
		dznrm2( -1, zx, 1 );
	}, RangeError );
});

test( 'dznrm2 returns 0 for N=0', function t() {
	var zx = new Complex128Array( 1 );
	assert.strictEqual( dznrm2( 0, zx, 1 ), 0.0 );
});

test( 'dznrm2 computes the norm of (3+4i): expected 5', function t() {
	var zx = new Complex128Array( [ 3, 4 ] );
	assertClose( dznrm2( 1, zx, 1 ), 5.0, 1e-14, 'norm of 3+4i' );
});

test( 'dznrm2 computes the norm of [(1+0i), (0+1i)]: expected sqrt(2)', function t() {
	var zx = new Complex128Array( [ 1, 0, 0, 1 ] );
	assertClose( dznrm2( 2, zx, 1 ), Math.sqrt( 2.0 ), 1e-14, 'norm of [1, i]' );
});

test( 'dznrm2 supports non-unit stride', function t() {
	// x = [(1+0i), (99+99i), (0+1i)] with strideX=2 → norm = sqrt(2)
	var zx = new Complex128Array( [ 1, 0, 99, 99, 0, 1 ] );
	assertClose( dznrm2( 2, zx, 2 ), Math.sqrt( 2.0 ), 1e-14, 'stride 2' );
});
