/* eslint-disable no-restricted-syntax */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import zggrqf from './../lib/zggrqf.js';
import { computeOptimalWorkSize } from './../lib/base.js';


// TESTS //

test( 'zggrqf is a function', function t() {
	assert.strictEqual( typeof zggrqf, 'function', 'is a function' );
});

test( 'zggrqf has expected arity', function t() {
	assert.strictEqual( zggrqf.length, 13, 'has expected arity' );
});

test( 'zggrqf throws RangeError for negative M', function t() {
	assert.throws( function throws() {
		zggrqf( 'column-major', -1, 2, new Float64Array( 4 ), new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, new Float64Array( 4 ) );
	}, RangeError );
});

test( 'zggrqf throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		zggrqf( 'column-major', new Float64Array( 4 ), 2, -1, new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, new Float64Array( 4 ) );
	}, RangeError );
});

test( 'zggrqf: WORK = null allocates the optimal workspace (bit-exact with an optimal WORK, past the blocking threshold)', function t() { // eslint-disable-line max-len
	const M = 45;
	const P = 50;
	const N = 40;
	const A1 = new Complex128Array( M * N );
	const B1 = new Complex128Array( P * N );
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
	const TA1 = new Complex128Array( Math.min( M, N ) );
	const TB1 = new Complex128Array( Math.min( P, N ) );
	const TA2 = new Complex128Array( TA1.length );
	const TB2 = new Complex128Array( TB1.length );
	const work = new Complex128Array( Math.max( Math.max( M, P, N ) * 32, ( P * 32 ) + 4160 ) );
	assert.strictEqual( zggrqf( 'column-major', M, P, N, A1, M, TA1, 1, B1, P, TB1, 1, null ), 0 );
	assert.strictEqual( zggrqf( 'column-major', M, P, N, A2, M, TA2, 1, B2, P, TB2, 1, work ), 0 );
	assert.deepStrictEqual( av, reinterpret( A2, 0 ) );
	assert.deepStrictEqual( bv, reinterpret( B2, 0 ) );
	assert.deepStrictEqual( reinterpret( TA1, 0 ), reinterpret( TA2, 0 ) );
	assert.deepStrictEqual( reinterpret( TB1, 0 ), reinterpret( TB2, 0 ) );
});

test( 'zggrqf: computeOptimalWorkSize returns max( max(M,P,N)*NB, P*NB + TSIZE ) (NB = max of ILAENV( 1, ZGERQF, ZGEQRF, ZUNMRQ ) = 32, TSIZE = 4160)', function t() {
	assert.strictEqual( computeOptimalWorkSize( 3, 4, 5 ), 4288, 'T part dominates' );
	assert.strictEqual( computeOptimalWorkSize( 200, 4, 3 ), 6400, 'max(...)*NB dominates' );
	assert.strictEqual( computeOptimalWorkSize( 0, 0, 0 ), 4160, 'empty' );
});
