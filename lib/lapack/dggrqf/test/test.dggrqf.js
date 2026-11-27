/* eslint-disable no-restricted-syntax */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dggrqf from './../lib/dggrqf.js';
import { computeOptimalWorkSize } from './../lib/base.js';


// TESTS //

test( 'dggrqf is a function', function t() {
	assert.strictEqual( typeof dggrqf, 'function', 'is a function' );
});

test( 'dggrqf has expected arity', function t() {
	assert.strictEqual( dggrqf.length, 13, 'has expected arity' );
});

test( 'dggrqf throws RangeError for negative M', function t() {
	assert.throws( function throws() {
		dggrqf( 'column-major', -1, 2, new Float64Array( 4 ), new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, new Float64Array( 4 ), 2, new Float64Array( 4 ), 1 );
	}, RangeError );
});

test( 'dggrqf throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		dggrqf( 'column-major', new Float64Array( 4 ), 2, -1, new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, new Float64Array( 4 ), 2, new Float64Array( 4 ), 1 );
	}, RangeError );
});

test( 'dggrqf: WORK = null allocates the optimal workspace (bit-exact with an optimal WORK, past the blocking threshold)', function t() { // eslint-disable-line max-len
	const M = 45;
	const P = 50;
	const N = 40;
	const A1 = new Float64Array( M * N );
	const B1 = new Float64Array( P * N );
	let i;
	for ( i = 0; i < A1.length; i++ ) {
		A1[ i ] = Math.sin( ( i * 0.37 ) + 1.0 );
	}
	for ( i = 0; i < B1.length; i++ ) {
		B1[ i ] = Math.cos( ( i * 0.29 ) + 0.5 );
	}
	const A2 = new Float64Array( A1 );
	const B2 = new Float64Array( B1 );
	const TA1 = new Float64Array( Math.min( M, N ) );
	const TB1 = new Float64Array( Math.min( P, N ) );
	const TA2 = new Float64Array( TA1.length );
	const TB2 = new Float64Array( TB1.length );
	const work = new Float64Array( Math.max( Math.max( M, P, N ) * 32, ( P * 32 ) + 4160 ) );
	assert.strictEqual( dggrqf( 'column-major', M, P, N, A1, M, TA1, 1, B1, P, TB1, 1, null ), 0 );
	assert.strictEqual( dggrqf( 'column-major', M, P, N, A2, M, TA2, 1, B2, P, TB2, 1, work ), 0 );
	assert.deepStrictEqual( A1, A2 );
	assert.deepStrictEqual( B1, B2 );
	assert.deepStrictEqual( TA1, TA2 );
	assert.deepStrictEqual( TB1, TB2 );
});

test( 'dggrqf: computeOptimalWorkSize returns max( max(M,P,N)*NB, P*NB + TSIZE ) (NB = max of ILAENV( 1, DGERQF, DGEQRF, DORMRQ ) = 32, TSIZE = 4160)', function t() {
	assert.strictEqual( computeOptimalWorkSize( 3, 4, 5 ), 4288, 'T part dominates' );
	assert.strictEqual( computeOptimalWorkSize( 200, 4, 3 ), 6400, 'max(...)*NB dominates' );
	assert.strictEqual( computeOptimalWorkSize( 0, 0, 0 ), 4160, 'empty' );
});
