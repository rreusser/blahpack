/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dgerqf from './../lib/dgerqf.js';
import dgerqfNd from './../lib/ndarray.js';


// TESTS //

test( 'dgerqf is a function', function t() {
	assert.strictEqual( typeof dgerqf, 'function', 'is a function' );
});

test( 'dgerqf has expected arity', function t() {
	assert.strictEqual( dgerqf.length, 8, 'has expected arity' );
});

test( 'dgerqf throws RangeError for negative M', function t() {
	assert.throws( function throws() {
		dgerqf( 'column-major', -1, new Float64Array( 4 ), new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, new Float64Array( 4 ) );
	}, RangeError );
});

test( 'dgerqf throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		dgerqf( 'column-major', new Float64Array( 4 ), -1, new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, new Float64Array( 4 ) );
	}, RangeError );
});

test( 'dgerqf allocates the optimal WORK when WORK is null (70x80, blocked)', function t() {
	const M = 70;
	const N = 80;
	const A = new Float64Array( M * N );
	let i;
	for ( i = 0; i < M * N; i++ ) {
		A[ i ] = Math.cos( ( 0.29 * i ) + 0.5 ) + ( ( i % ( M + 1 ) === 0 ) ? 3.0 : 0.0 );
	}
	const B = new Float64Array( A );
	const TAU = new Float64Array( M );
	const TAU2 = new Float64Array( M );
	const info = dgerqf( 'column-major', M, N, A, M, TAU, 1, null );
	assert.strictEqual( info, 0 );
	dgerqfNd( M, N, B, 1, M, 0, TAU2, 1, 0, new Float64Array( M * 32 ), 1, 0 );
	assert.deepStrictEqual( A, B );
	assert.deepStrictEqual( TAU, TAU2 );
});
