/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dgehrd from './../lib/dgehrd.js';


// TESTS //

test( 'dgehrd is a function', function t() {
	assert.strictEqual( typeof dgehrd, 'function', 'is a function' );
});

test( 'dgehrd has expected arity', function t() {
	assert.strictEqual( dgehrd.length, 9, 'has expected arity' );
});

test( 'dgehrd throws TypeError for invalid order', function t() {
	assert.throws( function throws() {
		dgehrd( 'invalid', new Float64Array( 4 ), 2, 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, new Float64Array( 4 ) );
	}, TypeError );
});

test( 'dgehrd throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		dgehrd( 'row-major', -1, 2, 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, new Float64Array( 4 ) );
	}, RangeError );
});

test( 'dgehrd: WORK = null allocates enough for the blocked path (N = 140)', function t() {
	const N = 140;
	const A1 = new Float64Array( N * N );
	const A2 = new Float64Array( N * N );
	const T1 = new Float64Array( N );
	const T2 = new Float64Array( N );
	let i;
	for ( i = 0; i < N * N; i++ ) {
		A1[ i ] = Math.sin( ( 0.37 * i * i ) + 1.3 );
		A2[ i ] = A1[ i ];
	}
	dgehrd( 'column-major', N, 1, N, A1, N, T1, 1, null );
	dgehrd( 'column-major', N, 1, N, A2, N, T2, 1, new Float64Array( ( N * 32 ) + 4160 ) );
	assert.deepStrictEqual( A1, A2, 'A matches caller-allocated WORK' );
	assert.deepStrictEqual( T1, T2, 'TAU matches caller-allocated WORK' );
	for ( i = 0; i < N * N; i++ ) {
		assert.ok( A1[ i ] === A1[ i ], 'no NaN' );
	}
});
