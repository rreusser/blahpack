/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import dlaswp from './../lib/dlaswp.js';


// TESTS //

test( 'dlaswp is a function', function t() {
	assert.strictEqual( typeof dlaswp, 'function', 'is a function' );
});

test( 'dlaswp has expected arity', function t() {
	assert.strictEqual( dlaswp.length, 9, 'has expected arity' );
});

test( 'dlaswp throws TypeError for invalid order', function t() {
	assert.throws( function throws() {
		dlaswp( 'invalid', 2, new Float64Array( 4 ), 2, 0, 1, 1, new Int32Array( [ 1, 0 ] ), 1 );
	}, TypeError );
});

test( 'dlaswp applies pivots in order when inck is nonnegative', function t() {
	let a = new Float64Array( [ 10, 20, 30 ] );
	let out = dlaswp( 'column-major', 1, a, 3, 0, 2, 1, new Int32Array( [ 1, 2, 2 ] ), 1 );
	assert.deepStrictEqual( Array.from( out ), [ 20, 30, 10 ] );

	// Applying pivots `[ 1, 0 ]` in order to two rows swaps and then swaps back:
	a = new Float64Array( [ 1, 2, 3, 4 ] );
	out = dlaswp( 'row-major', 2, a, 2, 0, 1, 0, new Int32Array( [ 1, 0 ] ), 1 );
	assert.deepStrictEqual( Array.from( out ), [ 1, 2, 3, 4 ] );
});

test( 'dlaswp applies pivots in reverse order when inck is negative', function t() {
	const a = new Float64Array( [ 10, 20, 30 ] );
	const out = dlaswp( 'column-major', 1, a, 3, 0, 2, -1, new Int32Array( [ 1, 2, 2 ] ), 1 );
	assert.deepStrictEqual( Array.from( out ), [ 30, 10, 20 ] );
});

test( 'dlaswp supports non-unit and negative IPIV strides', function t() {
	let a = new Float64Array( [ 10, 20, 30 ] );
	let out = dlaswp( 'column-major', 1, a, 3, 0, 2, 1, new Int32Array( [ 1, 99, 2, 99, 2 ] ), 2 );
	assert.deepStrictEqual( Array.from( out ), [ 20, 30, 10 ] );

	a = new Float64Array( [ 10, 20, 30 ] );
	out = dlaswp( 'column-major', 1, a, 3, 0, 2, 1, new Int32Array( [ 2, 2, 1 ] ), -1 );
	assert.deepStrictEqual( Array.from( out ), [ 20, 30, 10 ] );

	a = new Float64Array( [ 10, 20, 30 ] );
	out = dlaswp( 'column-major', 1, a, 3, 0, 2, -1, new Int32Array( [ 2, 2, 1 ] ), -1 );
	assert.deepStrictEqual( Array.from( out ), [ 30, 10, 20 ] );
});

test( 'dlaswp supports row-major layout', function t() {
	// 3x2 row-major matrix:
	const a = new Float64Array( [ 1, 2, 3, 4, 5, 6 ] );
	const out = dlaswp( 'row-major', 2, a, 2, 0, 2, 1, new Int32Array( [ 1, 2, 2 ] ), 1 );
	assert.deepStrictEqual( Array.from( out ), [ 3, 4, 5, 6, 1, 2 ] );
});
