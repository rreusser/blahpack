/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import zsysv from './../lib/zsysv.js';


// TESTS //

test( 'zsysv is a function', function t() {
	assert.strictEqual( typeof zsysv, 'function', 'is a function' );
});

test( 'zsysv has expected arity', function t() {
	assert.strictEqual( zsysv.length, 11, 'has expected arity' );
});

test( 'zsysv throws TypeError for invalid uplo', function t() {
	assert.throws( function throws() {
		zsysv( 'column-major', 'invalid', new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, new Float64Array( 4 ), 2 );
	}, TypeError );
});

test( 'zsysv throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		zsysv( 'column-major', 'upper', -1, 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, new Float64Array( 4 ), 2 );
	}, RangeError );
});

test( 'zsysv throws RangeError for negative nrhs', function t() {
	assert.throws( function throws() {
		zsysv( 'column-major', 'upper', new Float64Array( 4 ), -1, new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, new Float64Array( 4 ), 2 );
	}, RangeError );
});

test( 'zsysv: WORK = null allocates the optimal workspace (N*NB) and solves at blocked N=70', function t() {
	const N = 70;
	const A = new Complex128Array( N * N );
	const av = reinterpret( A, 0 );
	const A0 = new Float64Array( 2 * N * N );
	const B = new Complex128Array( N );
	const bv = reinterpret( B, 0 );
	let rr;
	let ri;
	let i;
	let j;
	let k;
	for ( j = 0; j < N; j++ ) {
		for ( i = 0; i < N; i++ ) {
			k = 2 * ( i + ( j * N ) );
			A0[ k ] = ( i === j ) ? 0.5 : 1.0 / ( 1 + i + j );
			A0[ k + 1 ] = ( i === j ) ? 0.25 : 0.1 / ( 1 + i + j );
		}
		bv[ 2 * j ] = j - 30;
		bv[ ( 2 * j ) + 1 ] = 1;
	}
	av.set( A0 );
	const B0 = new Float64Array( bv );
	const info = zsysv( 'column-major', 'upper', N, 1, A, N, new Int32Array( N ), 1, B, N, null );
	assert.strictEqual( info, 0, 'info' );
	for ( i = 0; i < N; i++ ) {
		rr = -B0[ 2 * i ];
		ri = -B0[ ( 2 * i ) + 1 ];
		for ( j = 0; j < N; j++ ) {
			k = 2 * ( i + ( j * N ) );
			rr += ( A0[ k ] * bv[ 2 * j ] ) - ( A0[ k + 1 ] * bv[ ( 2 * j ) + 1 ] );
			ri += ( A0[ k ] * bv[ ( 2 * j ) + 1 ] ) + ( A0[ k + 1 ] * bv[ 2 * j ] );
		}
		assert.ok( Math.abs( rr ) + Math.abs( ri ) < 1e-9, 'residual row ' + i + ': ' + rr + ',' + ri );
	}
});

test( 'zsysv: WORK = null allocates zsytrf\'s optimum N*64 (NB from ilaenv): bit-identical to an explicit WORK of N*64 at N = 140 (ticket 0049)', function t() {
	const N = 140;
	const A1 = new Complex128Array( N * N );
	const B1 = new Complex128Array( N );
	const av = reinterpret( A1, 0 );
	const bv = reinterpret( B1, 0 );
	let i;
	let j;
	let k;
	for ( j = 0; j < N; j++ ) {
		for ( i = 0; i < N; i++ ) {
			k = 2 * ( i + ( j * N ) );
			av[ k ] = ( i === j ) ? 0.5 : 1.0 / ( 1 + i + j );
			av[ k + 1 ] = ( i === j ) ? 0.25 : 0.1 / ( 1 + i + j );
		}
		bv[ 2 * j ] = j - 30;
		bv[ ( 2 * j ) + 1 ] = 1;
	}
	const A2 = new Complex128Array( reinterpret( A1, 0 ) );
	const B2 = new Complex128Array( reinterpret( B1, 0 ) );
	const P1 = new Int32Array( N );
	const P2 = new Int32Array( N );
	zsysv( 'column-major', 'lower', N, 1, A1, N, P1, 1, B1, N, null );
	zsysv( 'column-major', 'lower', N, 1, A2, N, P2, 1, B2, N, new Complex128Array( N * 64 ) );
	assert.deepStrictEqual( reinterpret( A1, 0 ), reinterpret( A2, 0 ), 'factor' );
	assert.deepStrictEqual( P1, P2, 'IPIV' );
	assert.deepStrictEqual( reinterpret( B1, 0 ), reinterpret( B2, 0 ), 'X' );
});
