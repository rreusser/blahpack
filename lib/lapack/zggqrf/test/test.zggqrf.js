/* eslint-disable no-restricted-syntax */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import zggqrf from './../lib/zggqrf.js';
import { computeOptimalWorkSize } from './../lib/base.js';


// TESTS //

test( 'zggqrf is a function', function t() {
	assert.strictEqual( typeof zggqrf, 'function', 'is a function' );
});

test( 'zggqrf has expected arity', function t() {
	assert.strictEqual( zggqrf.length, 13, 'has expected arity' );
});

test( 'zggqrf throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		zggqrf( 'column-major', -1, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, new Float64Array( 4 ) );
	}, RangeError );
});

test( 'zggqrf throws RangeError for negative M', function t() {
	assert.throws( function throws() {
		zggqrf( 'column-major', new Float64Array( 4 ), -1, 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, new Float64Array( 4 ) );
	}, RangeError );
});

test( 'zggqrf: WORK = null allocates the optimal workspace (bit-exact with an optimal WORK, past the blocking threshold)', function t() { // eslint-disable-line max-len
	const N = 45;
	const M = 40;
	const P = 50;
	const A1 = new Complex128Array( N * M );
	const B1 = new Complex128Array( N * P );
	const av = reinterpret( A1, 0 );
	const bv = reinterpret( B1, 0 );
	let i;
	for ( i = 0; i < av.length; i++ ) {
		av[ i ] = Math.sin( ( i * 0.37 ) + 1.0 );
	}
	for ( i = 0; i < bv.length; i++ ) {
		bv[ i ] = Math.cos( ( i * 0.29 ) + 0.5 );
	}
	const A2 = new Complex128Array( av.slice() );
	const B2 = new Complex128Array( bv.slice() );
	const TA1 = new Complex128Array( Math.min( N, M ) );
	const TB1 = new Complex128Array( Math.min( N, P ) );
	const TA2 = new Complex128Array( TA1.length );
	const TB2 = new Complex128Array( TB1.length );
	const work = new Complex128Array( Math.max( Math.max( N, M, P ) * 32, ( P * 32 ) + 4160 ) );
	assert.strictEqual( zggqrf( 'column-major', N, M, P, A1, N, TA1, 1, B1, N, TB1, 1, null ), 0 );
	assert.strictEqual( zggqrf( 'column-major', N, M, P, A2, N, TA2, 1, B2, N, TB2, 1, work ), 0 );
	assert.deepStrictEqual( av, reinterpret( A2, 0 ) );
	assert.deepStrictEqual( bv, reinterpret( B2, 0 ) );
	assert.deepStrictEqual( reinterpret( TA1, 0 ), reinterpret( TA2, 0 ) );
	assert.deepStrictEqual( reinterpret( TB1, 0 ), reinterpret( TB2, 0 ) );
});

test( 'zggqrf: computeOptimalWorkSize returns max( max(N,M,P)*NB, P*NB + TSIZE ) (NB = max of ILAENV( 1, ZGEQRF, ZGERQF, ZUNMQR ) = 32, TSIZE = 4160)', function t() {
	assert.strictEqual( computeOptimalWorkSize( 5, 3, 4 ), 4288, 'T part dominates' );
	assert.strictEqual( computeOptimalWorkSize( 200, 3, 4 ), 6400, 'max(...)*NB dominates' );
	assert.strictEqual( computeOptimalWorkSize( 0, 0, 0 ), 4160, 'empty' );
});
