/* eslint-disable no-restricted-syntax */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import zgeev from './../lib/zgeev.js';
import ndarray from './../lib/ndarray.js';
import { computeOptimalWorkSize } from './../lib/base.js';


// TESTS //

test( 'zgeev is a function', function t() {
	assert.strictEqual( typeof zgeev, 'function', 'is a function' );
});

test( 'zgeev has expected arity', function t() {
	assert.strictEqual( zgeev.length, 14, 'has expected arity' );
});

test( 'zgeev throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		zgeev( 'column-major', 'no-vectors', 'no-vectors', -1, new Float64Array( 4 ), 2, 2, 1, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), new Float64Array( 4 ) );
	}, RangeError );
});

test( 'zgeev allocates a sufficient workspace when WORK and RWORK are null (the optimum; tickets 0096, 0100)', function t() { // eslint-disable-line max-len
	const sizes = [ 3, 40 ];
	let seed = 11;
	let Av0, A1, A2, w1, w2, V1, V2, U1, U2, N, i, s;
	for ( s = 0; s < sizes.length; s++ ) {
		N = sizes[ s ];
		Av0 = new Float64Array( 2 * N * N );
		for ( i = 0; i < Av0.length; i++ ) {
			seed = ( seed * 16807 ) % 2147483647;
			Av0[ i ] = ( seed / 2147483647 ) - 0.5;
		}
		A1 = new Complex128Array( Av0 );
		A2 = new Complex128Array( Av0 );
		w1 = new Complex128Array( N );
		w2 = new Complex128Array( N );
		V1 = new Complex128Array( N * N );
		V2 = new Complex128Array( N * N );
		U1 = new Complex128Array( N * N );
		U2 = new Complex128Array( N * N );
		assert.equal( zgeev( 'column-major', 'compute-vectors', 'compute-vectors', N, A1, N, w1, 1, U1, N, V1, N, null, null ), 0 ); // eslint-disable-line max-len
		ndarray( 'compute-vectors', 'compute-vectors', N, A2, 1, N, 0, w2, 1, 0, U2, 1, N, 0, V2, 1, N, 0, new Complex128Array( computeOptimalWorkSize( 'compute-vectors', 'compute-vectors', N ) ), 1, 0, new Float64Array( 2 * N ), 1, 0 ); // eslint-disable-line max-len
		assert.deepEqual( reinterpret( w1, 0 ), reinterpret( w2, 0 ), 'w' );
		assert.deepEqual( reinterpret( U1, 0 ), reinterpret( U2, 0 ), 'VL' );
		assert.deepEqual( reinterpret( V1, 0 ), reinterpret( V2, 0 ), 'VR' );
	}
});
