
/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dlarrr from './../lib/index.js';


// TESTS //

test( 'main export is a function', function t() {
	assert.strictEqual( typeof dlarrr, 'function', 'main export is a function' );
});

test( 'main export has an ndarray method', function t() {
	assert.strictEqual( typeof dlarrr.ndarray, 'function', 'has ndarray method' );
});

test( 'dlarrr returns 0 for well-conditioned matrix', function t() {
	var info;
	var d;
	var e;

	d = new Float64Array( [ 4.0, 4.0, 4.0, 4.0, 4.0 ] );
	e = new Float64Array( [ 1.0, 1.0, 1.0, 1.0 ] );
	info = dlarrr( 5, d, 1, e, 1 );
	assert.strictEqual( info, 0 );
});

test( 'dlarrr returns 1 for poorly-conditioned matrix', function t() {
	var info;
	var d;
	var e;

	d = new Float64Array( [ 1.0, 1.0, 1.0, 1.0 ] );
	e = new Float64Array( [ 0.99, 0.99, 0.99 ] );
	info = dlarrr( 4, d, 1, e, 1 );
	assert.strictEqual( info, 1 );
});

test( 'dlarrr.ndarray returns 0 for well-conditioned matrix', function t() {
	var info;
	var d;
	var e;

	d = new Float64Array( [ 4.0, 4.0, 4.0, 4.0, 4.0 ] );
	e = new Float64Array( [ 1.0, 1.0, 1.0, 1.0 ] );
	info = dlarrr.ndarray( 5, d, 1, 0, e, 1, 0 );
	assert.strictEqual( info, 0 );
});

test( 'dlarrr.ndarray returns 1 for poorly-conditioned matrix', function t() {
	var info;
	var d;
	var e;

	d = new Float64Array( [ 1.0, 1.0, 1.0, 1.0 ] );
	e = new Float64Array( [ 0.99, 0.99, 0.99 ] );
	info = dlarrr.ndarray( 4, d, 1, 0, e, 1, 0 );
	assert.strictEqual( info, 1 );
});
