/* eslint-disable no-restricted-syntax */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dgeqrf from './../lib/dgeqrf.js';
import dgeqrfNd from './../lib/ndarray.js';


// TESTS //

test( 'dgeqrf is a function', function t() {
	assert.strictEqual( typeof dgeqrf, 'function', 'is a function' );
});

test( 'dgeqrf has expected arity', function t() {
	assert.strictEqual( dgeqrf.length, 8, 'has expected arity' );
});

test( 'dgeqrf throws TypeError for invalid order', function t() {
	assert.throws( function throws() {
		dgeqrf( 'invalid', new Float64Array( 4 ), new Float64Array( 4 ), new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, new Float64Array( 4 ) );
	}, TypeError );
});

test( 'dgeqrf throws RangeError for negative M', function t() {
	assert.throws( function throws() {
		dgeqrf( 'row-major', -1, new Float64Array( 4 ), new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, new Float64Array( 4 ) );
	}, RangeError );
});

test( 'dgeqrf throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		dgeqrf( 'row-major', new Float64Array( 4 ), -1, new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, new Float64Array( 4 ) );
	}, RangeError );
});

test( 'dgeqrf allocates the optimal WORK when WORK is null (140x140, blocked)', function t() {
	const N = 140;
	const A = new Float64Array( N * N );
	let i;
	for ( i = 0; i < N * N; i++ ) {
		A[ i ] = Math.cos( ( 0.29 * i ) + 0.5 ) + ( ( i % ( N + 1 ) === 0 ) ? 3.0 : 0.0 );
	}
	const B = new Float64Array( A );
	const TAU = new Float64Array( N );
	const TAU2 = new Float64Array( N );
	const info = dgeqrf( 'column-major', N, N, A, N, TAU, 1, null );
	assert.strictEqual( info, 0 );
	dgeqrfNd( N, N, B, 1, N, 0, TAU2, 1, 0, new Float64Array( N * 32 ), 1, 0 );
	assert.deepStrictEqual( A, B );
	assert.deepStrictEqual( TAU, TAU2 );
});

test( 'dgeqrf: a caller WORK one element short of the reference minimum throws RangeError through the wrapper (CONVENTIONS D5d; ticket 0077)', function t() {
	// The minimum is max( 1, N ) = 3.
	assert.throws( function throws() {
		dgeqrf( 'column-major', 4, 3, new Float64Array( 12 ).fill( 1.0 ), 4, new Float64Array( 3 ), 1, new Float64Array( 2 ) );
	}, /WORK array must have at least 3 elements/ );
	assert.strictEqual( dgeqrf( 'column-major', 4, 3, new Float64Array( 12 ).fill( 1.0 ), 4, new Float64Array( 3 ), 1, new Float64Array( 3 ) ), 0, 'the minimum suffices' );
});
