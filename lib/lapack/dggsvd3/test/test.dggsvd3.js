/* eslint-disable no-restricted-syntax */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import dggsvd3 from './../lib/dggsvd3.js';


// TESTS //

test( 'dggsvd3 is a function', function t() {
	assert.strictEqual( typeof dggsvd3, 'function', 'is a function' );
});

test( 'dggsvd3 has expected arity', function t() {
	assert.strictEqual( dggsvd3.length, 25, 'has expected arity' );
});

test( 'dggsvd3 throws RangeError for negative M', function t() {
	assert.throws( function throws() {
		dggsvd3( 'column-major', 'none', 'none', 'none', -1, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, new Float64Array( 4 ), 1, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), new Float64Array( 4 ) );
	}, RangeError );
});

test( 'dggsvd3 throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		dggsvd3( 'column-major', 'none', 'none', 'none', new Float64Array( 4 ), -1, 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, new Float64Array( 4 ), 1, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), new Float64Array( 4 ) );
	}, RangeError );
});

test( 'dggsvd3: WORK = null allocates N + the dggsvp3 workspace (ticket 0096)', function t() {
	// M = N = p = 3: the dggsvp3 call (TAU in WORK(1:N), its WORK from N on) needs N + 3N = 12, not 2N.
	const N = 3;
	const out = [];
	let K;
	let l;
	let k;
	const works = [ null, new Float64Array( 200 ) ];
	for ( k = 0; k < works.length; k++ ) {
		const A = new Float64Array( [ 1, 2, 3, 4, 5, 6, 7, 8, 10 ] );
		const B = new Float64Array( [ 2, 0, 1, 1, 3, 0, 0, 1, 4 ] );
		const ALPHA = new Float64Array( N );
		const BETA = new Float64Array( N );
		K = new Int32Array( 1 );
		l = new Int32Array( 1 );
		dggsvd3( 'column-major', 'none', 'none', 'none', N, N, N, K, l, A, N, B, N, ALPHA, 1, BETA, 1, new Float64Array( 1 ), 1, new Float64Array( 1 ), 1, new Float64Array( 1 ), 1, works[ k ], null ); // eslint-disable-line max-len
		out.push( [ K[ 0 ], l[ 0 ], Array.from( ALPHA ), Array.from( BETA ) ] );
	}
	assert.deepStrictEqual( out[ 0 ], out[ 1 ] );
	assert.strictEqual( out[ 0 ][ 0 ] + out[ 0 ][ 1 ], N );
});
