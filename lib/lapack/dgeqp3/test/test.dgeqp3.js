/* eslint-disable no-restricted-syntax */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import dgeqp3 from './../lib/dgeqp3.js';


// TESTS //

test( 'dgeqp3 is a function', function t() {
	assert.strictEqual( typeof dgeqp3, 'function', 'is a function' );
});

test( 'dgeqp3 has expected arity', function t() {
	assert.strictEqual( dgeqp3.length, 10, 'has expected arity' );
});

test( 'dgeqp3 throws RangeError for negative M', function t() {
	assert.throws( function throws() {
		dgeqp3( 'column-major', -1, new Float64Array( 4 ), new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, new Float64Array( 4 ), 1 );
	}, RangeError );
});

test( 'dgeqp3 throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		dgeqp3( 'column-major', new Float64Array( 4 ), -1, new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, new Float64Array( 4 ), 1 );
	}, RangeError );
});

test( 'dgeqp3: WORK = null allocates the optimum, matching a caller-allocated optimal WORK (200x200, blocked)', function t() {
	const N = 200;
	const A1 = new Float64Array( N * N );
	let seed = 3;
	let i;
	for ( i = 0; i < N * N; i++ ) {
		seed = ( seed * 16807 ) % 2147483647;
		A1[ i ] = ( seed / 2147483647 ) - 0.5;
	}
	const A2 = new Float64Array( A1 );
	const J1 = new Int32Array( N );
	const J2 = new Int32Array( N );
	const T1 = new Float64Array( N );
	const T2 = new Float64Array( N );
	assert.strictEqual( dgeqp3( 'column-major', N, N, A1, N, J1, 1, T1, 1, null ), 0, 'info' );
	dgeqp3( 'column-major', N, N, A2, N, J2, 1, T2, 1, new Float64Array( ( 2 * N ) + ( ( N + 1 ) * 32 ) ) );
	assert.deepStrictEqual( A1, A2, 'A' );
	assert.deepStrictEqual( J1, J2, 'JPVT' );
	assert.deepStrictEqual( T1, T2, 'TAU' );
});
