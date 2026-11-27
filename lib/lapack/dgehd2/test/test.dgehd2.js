/* eslint-disable no-restricted-syntax */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dgehd2 from './../lib/dgehd2.js';

// FIXTURES //

import _4x4_full from './fixtures/4x4_full.json' with { type: 'json' };


// TESTS //

test( 'dgehd2 is a function', function t() {
	assert.strictEqual( typeof dgehd2, 'function', 'is a function' );
});

test( 'dgehd2 has expected arity', function t() {
	assert.strictEqual( dgehd2.length, 9, 'has expected arity' );
});

test( 'dgehd2 throws TypeError for invalid order', function t() {
	assert.throws( function throws() {
		dgehd2( 'invalid', new Float64Array( 4 ), 2, 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, new Float64Array( 4 ) );
	}, TypeError );
});

test( 'dgehd2 throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		dgehd2( 'row-major', -1, 2, 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, new Float64Array( 4 ) );
	}, RangeError );
});

test( 'dgehd2 allocates the workspace when WORK is null (4x4 full range, column-major)', function t() {
	const tc = _4x4_full;
	const A = new Float64Array( [ 1, 5, 9, 13, 2, 6, 10, 14, 3, 7, 11, 15, 4, 8, 12, 16 ] );
	const TAU = new Float64Array( 3 );
	const info = dgehd2( 'column-major', 4, 1, 4, A, 4, TAU, 1, null );
	let i;
	assert.strictEqual( info, tc.INFO, 'returns expected value' );
	for ( i = 0; i < tc.A.length; i++ ) {
		assert.ok( Math.abs( A[ i ] - tc.A[ i ] ) <= 1e-10 * Math.max( Math.abs( tc.A[ i ] ), 1.0 ), 'A[' + i + ']' );
	}
	for ( i = 0; i < tc.TAU.length; i++ ) {
		assert.ok( Math.abs( TAU[ i ] - tc.TAU[ i ] ) <= 1e-10 * Math.max( Math.abs( tc.TAU[ i ] ), 1.0 ), 'TAU[' + i + ']' );
	}
});
