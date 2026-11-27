/* eslint-disable no-restricted-syntax */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import zunmhr from './../lib/zunmhr.js';
import ndarray from './../lib/ndarray.js';
import zgehrd from '../../zgehrd/lib/base.js';
import { computeOptimalWorkSize } from './../lib/base.js';


// TESTS //

test( 'zunmhr is a function', function t() {
	assert.strictEqual( typeof zunmhr, 'function', 'is a function' );
});

test( 'zunmhr has expected arity', function t() {
	assert.strictEqual( zunmhr.length, 14, 'has expected arity' );
});

test( 'zunmhr throws TypeError for invalid side', function t() {
	assert.throws( function throws() {
		zunmhr( 'column-major', 'invalid', 'no-transpose', new Float64Array( 4 ), new Float64Array( 4 ), 2, 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, new Float64Array( 4 ), 2, new Float64Array( 4 ) );
	}, TypeError );
});

test( 'zunmhr throws TypeError for invalid trans', function t() {
	assert.throws( function throws() {
		zunmhr( 'column-major', 'left', 'invalid', new Float64Array( 4 ), new Float64Array( 4 ), 2, 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, new Float64Array( 4 ), 2, new Float64Array( 4 ) );
	}, TypeError );
});

test( 'zunmhr throws RangeError for negative M', function t() {
	assert.throws( function throws() {
		zunmhr( 'column-major', 'left', 'no-transpose', -1, new Float64Array( 4 ), 2, 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, new Float64Array( 4 ), 2, new Float64Array( 4 ) );
	}, RangeError );
});

test( 'zunmhr throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		zunmhr( 'column-major', 'left', 'no-transpose', new Float64Array( 4 ), -1, 2, 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, new Float64Array( 4 ), 2, new Float64Array( 4 ) );
	}, RangeError );
});

test( 'zunmhr allocates the optimal workspace when WORK is null (blocked, ihi-ilo > 32)', function t() {
	var sides;
	var TAU;
	var C1v;
	var C2v;
	var Av;
	var C1;
	var C2;
	var nq;
	var nw;
	var A;
	var M;
	var N;
	var i;
	var k;
	nq = 40;
	A = new Complex128Array( nq * nq );
	Av = reinterpret( A, 0 );
	TAU = new Complex128Array( nq - 1 );
	for ( i = 0; i < Av.length; i++ ) {
		Av[ i ] = Math.sin( ( 0.29 * i ) + 0.3 );
	}
	zgehrd( nq, 1, nq, A, 1, nq, 0, TAU, 1, 0, new Complex128Array( ( nq * 32 ) + 4160 ), 1, 0 );
	sides = [ 'left', 'right' ];
	for ( k = 0; k < sides.length; k++ ) {
		M = ( sides[ k ] === 'left' ) ? nq : 7;
		N = ( sides[ k ] === 'left' ) ? 7 : nq;
		nw = ( sides[ k ] === 'left' ) ? N : M;
		C1 = new Complex128Array( M * N );
		C1v = reinterpret( C1, 0 );
		for ( i = 0; i < C1v.length; i++ ) {
			C1v[ i ] = Math.cos( ( 0.23 * i ) + 0.5 );
		}
		C2 = new Complex128Array( C1v );
		C2v = reinterpret( C2, 0 );
		ndarray( sides[ k ], 'no-transpose', M, N, 1, nq, A, 1, nq, 0, TAU, 1, 0, C1, 1, M, 0, new Complex128Array( ( nw * 32 ) + 4160 ), 1, 0 );
		zunmhr( 'column-major', sides[ k ], 'no-transpose', M, N, 1, nq, A, nq, TAU, 1, C2, M, null );
		for ( i = 0; i < C1v.length; i++ ) {
			assert.ok( !Number.isNaN( C2v[ i ] ), sides[ k ] + ': finite at ' + i );
			assert.strictEqual( C2v[ i ], C1v[ i ], sides[ k ] + ': matches ndarray at ' + i );
		}
	}
});

test( 'zunmhr: computeOptimalWorkSize returns the reference LWKOPT (NB = ILAENV( 1, ZUNMQR ) = 32)', function t() {
	assert.strictEqual( computeOptimalWorkSize( 'left', 'conjugate-transpose', 6, 4, 2, 5 ), 128, 'left, conjugate-transpose, 6, 4, 2, 5' );
	assert.strictEqual( computeOptimalWorkSize( 'right', 'no-transpose', 6, 4, 2, 3 ), 192, 'right, no-transpose, 6, 4, 2, 3' );
});
