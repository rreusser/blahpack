/* eslint-disable no-restricted-syntax */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dggsvp3 from './../lib/dggsvp3.js';


// TESTS //

test( 'dggsvp3 is a function', function t() {
	assert.strictEqual( typeof dggsvp3, 'function', 'is a function' );
});

test( 'dggsvp3 has expected arity', function t() {
	assert.strictEqual( dggsvp3.length, 25, 'has expected arity' );
});

test( 'dggsvp3 throws RangeError for negative M', function t() {
	assert.throws( function throws() {
		dggsvp3( 'column-major', 'none', 'none', 'none', -1, 2, new Float64Array( 4 ), new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, 2, 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), new Float64Array( 4 ), 1, new Float64Array( 4 ) );
	}, RangeError );
});

test( 'dggsvp3 throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		dggsvp3( 'column-major', 'none', 'none', 'none', new Float64Array( 4 ), 2, -1, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, 2, 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), new Float64Array( 4 ), 1, new Float64Array( 4 ) );
	}, RangeError );
});

test( 'dggsvp3: WORK = null allocates enough for the blocked dgeqp3 path (ticket 0096)', function t() {
	// min(M,N) = 130 > 128 selects the blocked dgeqp3, whose workspace (2N + (N+1)*32) the wrapper must allocate.
	const N = 130;
	const p = 2;
	const out = [];
	let A;
	let B;
	let K;
	let l;
	let k;
	let i;
	const works = [ null, new Float64Array( ( 2 * N ) + ( ( N + 1 ) * 32 ) + 100 ) ];
	for ( k = 0; k < works.length; k++ ) {
		A = new Float64Array( N * N );
		B = new Float64Array( p * N );
		for ( i = 0; i < N * N; i++ ) {
			A[ i ] = Math.sin( ( 3 * i ) + 1 );
		}
		for ( i = 0; i < p * N; i++ ) {
			B[ i ] = Math.cos( ( 5 * i ) + 2 );
		}
		K = [ 0 ];
		l = [ 0 ];
		dggsvp3( 'column-major', 'none', 'none', 'none', N, p, N, A, N, B, p, 1e-12, 1e-12, K, l, new Float64Array( 1 ), 1, new Float64Array( 1 ), 1, new Float64Array( 1 ), 1, null, new Float64Array( N ), 1, works[ k ] ); // eslint-disable-line max-len
		out.push( [ K[ 0 ], l[ 0 ], Array.from( A ), Array.from( B ) ] );
	}
	assert.deepStrictEqual( out[ 0 ], out[ 1 ] );
});
