/* eslint-disable no-restricted-syntax */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dormlq from './../lib/dormlq.js';
import strided from './../lib/strided.js';


// TESTS //

test( 'dormlq is a function', function t() {
	assert.strictEqual( typeof dormlq, 'function', 'is a function' );
});

test( 'dormlq has expected arity', function t() {
	assert.strictEqual( dormlq.length, 13, 'has expected arity' );
});

test( 'dormlq throws TypeError for invalid order', function t() {
	assert.throws( function throws() {
		dormlq( 'invalid', 'left', 'no-transpose', new Float64Array( 4 ), new Float64Array( 4 ), new Float64Array( 4 ), new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, new Float64Array( 4 ), 2, new Float64Array( 4 ) );
	}, TypeError );
});

test( 'dormlq throws TypeError for invalid side', function t() {
	assert.throws( function throws() {
		dormlq( 'row-major', 'invalid', 'no-transpose', new Float64Array( 4 ), new Float64Array( 4 ), new Float64Array( 4 ), new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, new Float64Array( 4 ), 2, new Float64Array( 4 ) );
	}, TypeError );
});

test( 'dormlq throws TypeError for invalid trans', function t() {
	assert.throws( function throws() {
		dormlq( 'row-major', 'left', 'invalid', new Float64Array( 4 ), new Float64Array( 4 ), new Float64Array( 4 ), new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, new Float64Array( 4 ), 2, new Float64Array( 4 ) );
	}, TypeError );
});

test( 'dormlq throws RangeError for negative M', function t() {
	assert.throws( function throws() {
		dormlq( 'row-major', 'left', 'no-transpose', -1, new Float64Array( 4 ), new Float64Array( 4 ), new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, new Float64Array( 4 ), 2, new Float64Array( 4 ) );
	}, RangeError );
});

test( 'dormlq throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		dormlq( 'row-major', 'left', 'no-transpose', new Float64Array( 4 ), -1, new Float64Array( 4 ), new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, new Float64Array( 4 ), 2, new Float64Array( 4 ) );
	}, RangeError );
});

test( 'dormlq throws RangeError for negative K', function t() {
	assert.throws( function throws() {
		dormlq( 'row-major', 'left', 'no-transpose', new Float64Array( 4 ), new Float64Array( 4 ), -1, new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, new Float64Array( 4 ), 2, new Float64Array( 4 ) );
	}, RangeError );
});

test( 'dormlq: WORK = null allocates enough for the blocked path (K > 32, ticket 0096)', function t() {
	const sides = [ 'left', 'right' ];
	const N = 40;
	const K = 35;
	let TAU;
	let C1;
	let C2;
	let A;
	let s;
	let i;
	for ( s = 0; s < sides.length; s++ ) {
		A = new Float64Array( K * N );
		TAU = new Float64Array( K );
		C1 = new Float64Array( N * N );
		for ( i = 0; i < A.length; i++ ) {
			A[ i ] = Math.sin( i + 1 ) * 0.5;
		}
		for ( i = 0; i < K; i++ ) {
			TAU[ i ] = 1.0 + ( 0.5 * Math.cos( i ) );
		}
		for ( i = 0; i < C1.length; i++ ) {
			C1[ i ] = Math.cos( 3 * i );
		}
		C2 = new Float64Array( C1 );
		dormlq( 'column-major', sides[ s ], 'no-transpose', N, N, K, A, K, TAU, 1, C1, N, null );
		strided( sides[ s ], 'no-transpose', N, N, K, A, 1, K, 0, TAU, 1, 0, C2, 1, N, 0, new Float64Array( 10000 ), 1, 0 );
		assert.deepStrictEqual( Array.from( C1 ), Array.from( C2 ), sides[ s ] );
	}
});
