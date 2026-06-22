/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import idamax from './../lib/ndarray.js';

// FIXTURES //

import basic from './fixtures/basic.json' with { type: 'json' };
import negative from './fixtures/negative.json' with { type: 'json' };
import stride from './fixtures/stride.json' with { type: 'json' };
import first_max from './fixtures/first_max.json' with { type: 'json' };
import last_max from './fixtures/last_max.json' with { type: 'json' };

// TESTS //

test( 'idamax: main export is a function', function t() {
	assert.strictEqual( typeof idamax, 'function' );
});

test( 'idamax: basic (N=5, stride=1)', function t() {
	var result;
	var tc;
	var x;

	tc = basic;
	x = new Float64Array( [ 1.0, -3.0, 2.0, 5.0, -4.0 ] );
	result = idamax( 5, x, 1, 0 );
	assert.strictEqual( result, tc.result - 1 );
});

test( 'idamax: n_zero returns -1', function t() {
	var result;
	var x;

	x = new Float64Array( [ 1.0, 2.0, 3.0 ] );
	result = idamax( 0, x, 1, 0 );
	assert.strictEqual( result, -1 );
});

test( 'idamax: n_one returns 0', function t() {
	var result;
	var x;

	x = new Float64Array( [ 42.0 ] );
	result = idamax( 1, x, 1, 0 );
	assert.strictEqual( result, 0 );
});

test( 'idamax: negative values (N=4, stride=1)', function t() {
	var result;
	var tc;
	var x;

	tc = negative;
	x = new Float64Array( [ -2.0, -7.0, -1.0, -3.0 ] );
	result = idamax( 4, x, 1, 0 );
	assert.strictEqual( result, tc.result - 1 );
});

test( 'idamax: non-unit stride (N=3, stride=2)', function t() {
	var result;
	var tc;
	var x;

	tc = stride;
	x = new Float64Array( [ 1.0, 99.0, 10.0, 99.0, 2.0 ] );
	result = idamax( 3, x, 2, 0 );
	assert.strictEqual( result, tc.result - 1 );
});

test( 'idamax: first element is max', function t() {
	var result;
	var tc;
	var x;

	tc = first_max;
	x = new Float64Array( [ 100.0, 1.0, 2.0 ] );
	result = idamax( 3, x, 1, 0 );
	assert.strictEqual( result, tc.result - 1 );
});

test( 'idamax: last element is max', function t() {
	var result;
	var tc;
	var x;

	tc = last_max;
	x = new Float64Array( [ 1.0, 2.0, 100.0 ] );
	result = idamax( 3, x, 1, 0 );
	assert.strictEqual( result, tc.result - 1 );
});

test( 'idamax: throws RangeError for N<0', function t() {
	var x = new Float64Array( [ 1.0, 2.0, 3.0 ] );
	assert.throws( function() {
		idamax( -1, x, 1, 0 );
	}, RangeError );
});

test( 'idamax: stride <= 0 returns -1', function t() {
	var x = new Float64Array( [ 1.0, 2.0, 3.0 ] );
	assert.strictEqual( idamax( 3, x, 0, 0 ), -1 );
	assert.strictEqual( idamax( 3, x, -1, 0 ), -1 );
});

test( 'idamax: offset parameter works', function t() {
	var result;
	var x;

	x = new Float64Array( [ 99.0, 1.0, 10.0, 2.0 ] );
	result = idamax( 3, x, 1, 1 );
	assert.strictEqual( result, 1 );
});

test( 'idamax: all equal elements returns 0', function t() {
	var result;
	var x;

	x = new Float64Array( [ 5.0, 5.0, 5.0, 5.0 ] );
	result = idamax( 4, x, 1, 0 );
	assert.strictEqual( result, 0 );
});
