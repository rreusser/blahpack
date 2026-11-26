/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dtrevc3 from './../lib/dtrevc3.js';


// TESTS //

test( 'dtrevc3 is a function', function t() {
	assert.strictEqual( typeof dtrevc3, 'function', 'is a function' );
});

test( 'dtrevc3 has expected arity', function t() {
	assert.strictEqual( dtrevc3.length, 15, 'has expected arity' );
});

test( 'dtrevc3 throws TypeError for invalid side', function t() {
	assert.throws( function throws() {
		const m = new Int32Array( 1 );
		dtrevc3( 'column-major', 'invalid', 2, new Float64Array( 4 ), 1, new Float64Array( 4 ), new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, 2, m, new Float64Array( 4 ) );
	}, TypeError );
});

test( 'dtrevc3 throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		const m = new Int32Array( 1 );
		dtrevc3( 'column-major', 'left', 'all', new Float64Array( 4 ), 1, -1, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, 2, m, new Float64Array( 4 ) );
	}, RangeError );
});


test( 'dtrevc3: WORK = null allocates the optimal workspace and back-transforms at N=70 (blocked)', function t() {
	const N = 70;
	const T = new Float64Array( N * N );
	const VR = new Float64Array( N * N );
	const VL = new Float64Array( N * N );
	const M = new Int32Array( 1 );
	let i;
	for ( i = 0; i < N; i++ ) {
		T[ i + ( i * N ) ] = i + 1;
		VR[ i + ( i * N ) ] = 1.0;
		VL[ i + ( i * N ) ] = 1.0;
		if ( i > 0 ) {
			T[ ( i - 1 ) + ( i * N ) ] = 0.5;
		}
	}
	const info = dtrevc3( 'column-major', 'both', 'backtransform', new Uint8Array( N ), 1, N, T, N, VL, N, VR, N, N, M, null );
	assert.strictEqual( info, 0, 'info' );
	assert.strictEqual( M[ 0 ], N, 'M' );

	// With Q = I, column 0 of VR is e_0, and the last column of VL is e_(N-1):
	assert.strictEqual( VR[ 0 ], 1.0, 'VR(0,0)' );
	assert.strictEqual( VL[ ( N - 1 ) + ( ( N - 1 ) * N ) ], 1.0, 'VL(N-1,N-1)' );
	for ( i = 0; i < N * N; i++ ) {
		assert.ok( Number.isFinite( VR[ i ] ) && Number.isFinite( VL[ i ] ), 'finite at ' + i );
	}
});
