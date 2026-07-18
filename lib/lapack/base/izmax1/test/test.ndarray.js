/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import izmax1 from './../lib/ndarray.js';

// FIXTURES //

import basic_3 from './fixtures/basic_3.json' with { type: 'json' };
import max_first from './fixtures/max_first.json' with { type: 'json' };
import max_last from './fixtures/max_last.json' with { type: 'json' };
import n_one from './fixtures/n_one.json' with { type: 'json' };
import stride2 from './fixtures/stride2.json' with { type: 'json' };
import equal_magnitudes from './fixtures/equal_magnitudes.json' with { type: 'json' };

// TESTS //

test( 'izmax1: main export is a function', function t() {
	assert.strictEqual( typeof izmax1, 'function' );
});

test( 'izmax1: basic 3-element vector', function t() {

	const tc = basic_3;
	const zx = new Complex128Array( [ 1, 0, 3, 4, 2, 0 ] );
	const result = izmax1( 3, zx, 1, 0 );
	assert.strictEqual( result, tc.result - 1, 'result (0-based)' );
});

test( 'izmax1: max at first element', function t() {

	const tc = max_first;
	const zx = new Complex128Array( [ 5, 12, 3, 4, 1, 0 ] );
	const result = izmax1( 3, zx, 1, 0 );
	assert.strictEqual( result, tc.result - 1, 'result (0-based)' );
});

test( 'izmax1: max at last element', function t() {

	const tc = max_last;
	const zx = new Complex128Array( [ 1, 0, 2, 0, 3, 0, 0, 10 ] );
	const result = izmax1( 4, zx, 1, 0 );
	assert.strictEqual( result, tc.result - 1, 'result (0-based)' );
});

test( 'izmax1: N=1', function t() {

	const tc = n_one;
	const zx = new Complex128Array( [ 7, 3 ] );
	const result = izmax1( 1, zx, 1, 0 );
	assert.strictEqual( result, tc.result - 1, 'result (0-based)' );
});

test( 'izmax1: stride=2', function t() {

	const tc = stride2;
	const zx = new Complex128Array( [ 1, 0, 99, 99, 3, 4, 99, 99, 2, 0 ] );
	const result = izmax1( 3, zx, 2, 0 );
	assert.strictEqual( result, tc.result - 1, 'result (0-based)' );
});

test( 'izmax1: all equal magnitudes returns first', function t() {

	const tc = equal_magnitudes;
	const zx = new Complex128Array( [ 3, 4, 0, 5, 5, 0 ] );
	const result = izmax1( 3, zx, 1, 0 );
	assert.strictEqual( result, tc.result - 1, 'result (0-based)' );
});

test( 'izmax1: N < 1 returns -1', function t() {

	const zx = new Complex128Array( [ 1, 0 ] );
	const result = izmax1( 0, zx, 1, 0 );
	assert.strictEqual( result, -1 );
});

test( 'izmax1: nonzero offset', function t() {

	const zx = new Complex128Array( [ 99, 99, 1, 0, 3, 4, 2, 0 ] );
	const result = izmax1( 3, zx, 1, 1 );
	assert.strictEqual( result, 1 );
});
