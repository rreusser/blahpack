/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dormhr from './../lib/dormhr.js';
import ndarray from './../lib/ndarray.js';
import dgehrd from '../../dgehrd/lib/base.js';


// TESTS //

test( 'dormhr is a function', function t() {
	assert.strictEqual( typeof dormhr, 'function', 'is a function' );
});

test( 'dormhr has expected arity', function t() {
	assert.strictEqual( dormhr.length, 14, 'has expected arity' );
});

test( 'dormhr throws TypeError for invalid side', function t() {
	assert.throws( function throws() {
		dormhr( 'column-major', 'invalid', 'no-transpose', new Float64Array( 4 ), new Float64Array( 4 ), 2, 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, new Float64Array( 4 ), 2, new Float64Array( 4 ) );
	}, TypeError );
});

test( 'dormhr throws TypeError for invalid trans', function t() {
	assert.throws( function throws() {
		dormhr( 'column-major', 'left', 'invalid', new Float64Array( 4 ), new Float64Array( 4 ), 2, 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, new Float64Array( 4 ), 2, new Float64Array( 4 ) );
	}, TypeError );
});

test( 'dormhr throws RangeError for negative M', function t() {
	assert.throws( function throws() {
		dormhr( 'column-major', 'left', 'no-transpose', -1, new Float64Array( 4 ), 2, 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, new Float64Array( 4 ), 2, new Float64Array( 4 ) );
	}, RangeError );
});

test( 'dormhr throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		dormhr( 'column-major', 'left', 'no-transpose', new Float64Array( 4 ), -1, 2, 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, new Float64Array( 4 ), 2, new Float64Array( 4 ) );
	}, RangeError );
});

test( 'dormhr allocates the optimal workspace when WORK is null (blocked, ihi-ilo > 32)', function t() {
	var sides;
	var TAU;
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
	A = new Float64Array( nq * nq );
	TAU = new Float64Array( nq - 1 );
	for ( i = 0; i < A.length; i++ ) {
		A[ i ] = Math.sin( ( 0.29 * i ) + 0.3 );
	}
	dgehrd( nq, 1, nq, A, 1, nq, 0, TAU, 1, 0, new Float64Array( ( nq * 32 ) + 4160 ), 1, 0 );
	sides = [ 'left', 'right' ];
	for ( k = 0; k < sides.length; k++ ) {
		M = ( sides[ k ] === 'left' ) ? nq : 7;
		N = ( sides[ k ] === 'left' ) ? 7 : nq;
		nw = ( sides[ k ] === 'left' ) ? N : M;
		C1 = new Float64Array( M * N );
		for ( i = 0; i < C1.length; i++ ) {
			C1[ i ] = Math.cos( ( 0.23 * i ) + 0.5 );
		}
		C2 = new Float64Array( C1 );
		ndarray( sides[ k ], 'no-transpose', M, N, 1, nq, A, 1, nq, 0, TAU, 1, 0, C1, 1, M, 0, new Float64Array( ( nw * 32 ) + 4160 ), 1, 0 );
		dormhr( 'column-major', sides[ k ], 'no-transpose', M, N, 1, nq, A, nq, TAU, 1, C2, M, null );
		for ( i = 0; i < C1.length; i++ ) {
			assert.ok( C2[ i ] === C2[ i ], sides[ k ] + ': finite at ' + i );
			assert.strictEqual( C2[ i ], C1[ i ], sides[ k ] + ': matches ndarray at ' + i );
		}
	}
});
