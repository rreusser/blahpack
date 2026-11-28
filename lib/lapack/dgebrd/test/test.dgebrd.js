/* eslint-disable no-restricted-syntax */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dgebrd from './../lib/dgebrd.js';


// TESTS //

test( 'dgebrd is a function', function t() {
	assert.strictEqual( typeof dgebrd, 'function', 'is a function' );
});

test( 'dgebrd has expected arity', function t() {
	assert.strictEqual( dgebrd.length, 14, 'has expected arity' );
});

test( 'dgebrd throws TypeError for invalid order', function t() {
	assert.throws( function throws() {
		dgebrd( 'invalid', new Float64Array( 4 ), new Float64Array( 4 ), new Float64Array( 4 ), 2, 2, 1, 2, 1, new Float64Array( 4 ), 1, new Float64Array( 4 ), 1, new Float64Array( 4 ) );
	}, TypeError );
});

test( 'dgebrd throws RangeError for negative M', function t() {
	assert.throws( function throws() {
		dgebrd( 'row-major', -1, new Float64Array( 4 ), new Float64Array( 4 ), 2, 2, 1, 2, 1, new Float64Array( 4 ), 1, new Float64Array( 4 ), 1, new Float64Array( 4 ) );
	}, RangeError );
});

test( 'dgebrd throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		dgebrd( 'row-major', new Float64Array( 4 ), -1, new Float64Array( 4 ), 2, 2, 1, 2, 1, new Float64Array( 4 ), 1, new Float64Array( 4 ), 1, new Float64Array( 4 ) );
	}, RangeError );
});

test( 'dgebrd: WORK = null allocates a workspace and matches a caller-provided one', function t() {
	const M = 5;
	const N = 4;
	const A1 = new Float64Array( M * N );
	const A2 = new Float64Array( M * N );
	const d1 = new Float64Array( N );
	const d2 = new Float64Array( N );
	let i;
	for ( i = 0; i < M * N; i++ ) {
		A1[ i ] = Math.sin( ( 0.37 * i * i ) + 1.3 );
		A2[ i ] = A1[ i ];
	}
	assert.strictEqual( dgebrd( 'column-major', M, N, A1, M, d1, 1, new Float64Array( N - 1 ), 1, new Float64Array( N ), 1, new Float64Array( N ), 1, null ), 0, 'returns 0' );
	dgebrd( 'column-major', M, N, A2, M, d2, 1, new Float64Array( N - 1 ), 1, new Float64Array( N ), 1, new Float64Array( N ), 1, new Float64Array( M ) );
	assert.deepStrictEqual( A1, A2, 'A' );
	assert.deepStrictEqual( d1, d2, 'd' );
});

test( 'dgebrd: WORK = null allocates the optimum (M+N)*NB and blocks past the crossover, bit-identical to an explicit optimal WORK (ticket 0049)', function t() {
	const M = 140;
	const N = 132;
	const A1 = new Float64Array( M * N );
	const A2 = new Float64Array( M * N );
	const d1 = new Float64Array( N );
	const d2 = new Float64Array( N );
	let i;
	for ( i = 0; i < M * N; i++ ) {
		A1[ i ] = Math.sin( ( 0.37 * i * i ) + 1.3 );
		A2[ i ] = A1[ i ];
	}
	dgebrd( 'column-major', M, N, A1, M, d1, 1, new Float64Array( N - 1 ), 1, new Float64Array( N ), 1, new Float64Array( N ), 1, null );
	dgebrd( 'column-major', M, N, A2, M, d2, 1, new Float64Array( N - 1 ), 1, new Float64Array( N ), 1, new Float64Array( N ), 1, new Float64Array( ( M + N ) * 32 ) );
	assert.deepStrictEqual( A1, A2, 'A' );
	assert.deepStrictEqual( d1, d2, 'd' );
});
