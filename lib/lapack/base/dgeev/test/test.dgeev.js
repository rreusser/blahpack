/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dgeev from './../lib/dgeev.js';
import ndarray from './../lib/ndarray.js';
import { computeOptimalWorkSize } from './../lib/base.js';


// TESTS //

test( 'dgeev is a function', function t() {
	assert.strictEqual( typeof dgeev, 'function', 'is a function' );
});

test( 'dgeev has expected arity', function t() {
	assert.strictEqual( dgeev.length, 15, 'has expected arity' );
});

test( 'dgeev throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		dgeev( 'column-major', 'no-vectors', 'no-vectors', -1, new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, new Float64Array( 4 ), 1, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, null );
	}, RangeError );
});

test( 'dgeev allocates a sufficient workspace when work is null (the optimum; tickets 0096, 0100)', function t() { // eslint-disable-line max-len
	const sizes = [ 3, 40 ];
	let seed = 11;
	let A0, A1, A2, r1, r2, i1, i2, V1, V2, U1, U2, N, i, s;
	for ( s = 0; s < sizes.length; s++ ) {
		N = sizes[ s ];
		A0 = new Float64Array( N * N );
		for ( i = 0; i < A0.length; i++ ) {
			seed = ( seed * 16807 ) % 2147483647;
			A0[ i ] = ( seed / 2147483647 ) - 0.5;
		}
		A1 = new Float64Array( A0 );
		A2 = new Float64Array( A0 );
		r1 = new Float64Array( N );
		r2 = new Float64Array( N );
		i1 = new Float64Array( N );
		i2 = new Float64Array( N );
		V1 = new Float64Array( N * N );
		V2 = new Float64Array( N * N );
		U1 = new Float64Array( N * N );
		U2 = new Float64Array( N * N );
		assert.equal( dgeev( 'column-major', 'compute-vectors', 'compute-vectors', N, A1, N, r1, 1, i1, 1, U1, N, V1, N, null ), 0 ); // eslint-disable-line max-len
		ndarray( 'compute-vectors', 'compute-vectors', N, A2, 1, N, 0, r2, 1, 0, i2, 1, 0, U2, 1, N, 0, V2, 1, N, 0, new Float64Array( computeOptimalWorkSize( 'compute-vectors', 'compute-vectors', N ) ), 1, 0 ); // eslint-disable-line max-len
		assert.deepEqual( r1, r2, 'WR' );
		assert.deepEqual( i1, i2, 'WI' );
		assert.deepEqual( U1, U2, 'VL' );
		assert.deepEqual( V1, V2, 'VR' );
	}
});
