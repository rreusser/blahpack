/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import dsysv from './../lib/dsysv.js';


// TESTS //

test( 'dsysv is a function', function t() {
	assert.strictEqual( typeof dsysv, 'function', 'is a function' );
});

test( 'dsysv has expected arity', function t() {
	assert.strictEqual( dsysv.length, 11, 'has expected arity' );
});

test( 'dsysv throws TypeError for invalid uplo', function t() {
	assert.throws( function throws() {
		dsysv( 'column-major', 'invalid', new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, new Float64Array( 4 ), 2 );
	}, TypeError );
});

test( 'dsysv throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		dsysv( 'column-major', 'upper', -1, 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, new Float64Array( 4 ), 2 );
	}, RangeError );
});

test( 'dsysv throws RangeError for negative nrhs', function t() {
	assert.throws( function throws() {
		dsysv( 'column-major', 'upper', new Float64Array( 4 ), -1, new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, new Float64Array( 4 ), 2 );
	}, RangeError );
});

test( 'dsysv: WORK = null allocates the optimal workspace (N*32) and solves at blocked N=70', function t() {
	const N = 70;
	const A = new Float64Array( N * N );
	const A0 = new Float64Array( N * N );
	const B = new Float64Array( N );
	let resid;
	let i;
	let j;
	for ( j = 0; j < N; j++ ) {
		for ( i = 0; i < N; i++ ) {
			A0[ i + ( j * N ) ] = ( i === j ) ? 0.5 : 1.0 / ( 1 + i + j );
		}
		B[ j ] = j - 30;
	}
	A.set( A0 );
	const B0 = new Float64Array( B );
	const info = dsysv( 'column-major', 'lower', N, 1, A, N, new Int32Array( N ), 1, B, N, null );
	assert.strictEqual( info, 0, 'info' );
	for ( i = 0; i < N; i++ ) {
		resid = -B0[ i ];
		for ( j = 0; j < N; j++ ) {
			resid += A0[ i + ( j * N ) ] * B[ j ];
		}
		assert.ok( Math.abs( resid ) < 1e-9, 'residual row ' + i + ': ' + resid );
	}
});
