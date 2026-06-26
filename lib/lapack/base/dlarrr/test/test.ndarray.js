
/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dlarrr from './../lib/ndarray.js';


// TESTS //

test( 'dlarrr is a function', function t() {
	assert.strictEqual( typeof dlarrr, 'function' );
});

test( 'dlarrr returns 0 for N <= 0', function t() {
	var d = new Float64Array( 0 );
	var e = new Float64Array( 0 );

	assert.strictEqual( dlarrr( 0, d, 1, 0, e, 1, 0 ), 0 );
	assert.strictEqual( dlarrr( -1, d, 1, 0, e, 1, 0 ), 0 );
});

test( 'dlarrr returns 0 for N = 1 (quick return)', function t() {
	var d = new Float64Array( [ 5.0 ] );
	var e = new Float64Array( 0 );

	assert.strictEqual( dlarrr( 1, d, 1, 0, e, 1, 0 ), 0 );
});

test( 'dlarrr returns 0 for a well-conditioned tridiagonal matrix', function t() {
	var d = new Float64Array( [ 4.0, 4.0, 4.0, 4.0, 4.0 ] );
	var e = new Float64Array( [ 1.0, 1.0, 1.0, 1.0 ] );

	assert.strictEqual( dlarrr( 5, d, 1, 0, e, 1, 0 ), 0 );
});

test( 'dlarrr returns 1 for a matrix with a tiny diagonal element', function t() {
	var d = new Float64Array( [ 4.0, 1.0e-320, 4.0 ] );
	var e = new Float64Array( [ 1.0, 1.0 ] );

	assert.strictEqual( dlarrr( 3, d, 1, 0, e, 1, 0 ), 1 );
});

test( 'dlarrr returns 1 when off-diagonal accumulation exceeds RELCOND', function t() {
	var d = new Float64Array( [ 1.0, 1.0, 1.0, 1.0 ] );
	var e = new Float64Array( [ 0.99, 0.99, 0.99 ] );

	assert.strictEqual( dlarrr( 4, d, 1, 0, e, 1, 0 ), 1 );
});

test( 'dlarrr returns 0 for an identity-like matrix with small off-diagonal', function t() {
	var d = new Float64Array( [ 1.0, 1.0, 1.0, 1.0 ] );
	var e = new Float64Array( [ 0.1, 0.1, 0.1 ] );

	assert.strictEqual( dlarrr( 4, d, 1, 0, e, 1, 0 ), 0 );
});

test( 'dlarrr supports strides and offsets', function t() {
	var d;
	var e;

	// Well-conditioned matrix embedded with stride 2 and offset 1
	d = new Float64Array( [ 0.0, 4.0, 0.0, 4.0, 0.0, 4.0 ] );
	e = new Float64Array( [ 0.0, 1.0, 0.0, 1.0 ] );

	assert.strictEqual( dlarrr( 3, d, 2, 1, e, 2, 1 ), 0 );
});

test( 'dlarrr supports negative strides', function t() {
	var d;
	var e;

	// Reversed order via negative stride
	d = new Float64Array( [ 4.0, 4.0, 4.0 ] );
	e = new Float64Array( [ 1.0, 1.0 ] );

	assert.strictEqual( dlarrr( 3, d, -1, 2, e, -1, 1 ), 0 );
});

test( 'dlarrr returns 1 when first diagonal is tiny', function t() {
	var d = new Float64Array( [ 1.0e-320, 4.0, 4.0 ] );
	var e = new Float64Array( [ 1.0, 1.0 ] );

	assert.strictEqual( dlarrr( 3, d, 1, 0, e, 1, 0 ), 1 );
});
