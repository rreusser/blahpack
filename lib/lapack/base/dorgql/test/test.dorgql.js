/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dgeqlf from '../../dgeqlf/lib/base.js';
import dorgql from './../lib/dorgql.js';


// TESTS //

test( 'dorgql is a function', function t() {
	assert.strictEqual( typeof dorgql, 'function', 'is a function' );
});

test( 'dorgql has expected arity', function t() {
	assert.strictEqual( dorgql.length, 9, 'has expected arity' );
});

test( 'dorgql throws TypeError for invalid order', function t() {
	assert.throws( function throws() {
		dorgql( 'invalid', new Float64Array( 4 ), new Float64Array( 4 ), new Float64Array( 4 ), new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, new Float64Array( 4 ) );
	}, TypeError );
});

test( 'dorgql throws RangeError for negative M', function t() {
	assert.throws( function throws() {
		dorgql( 'row-major', -1, new Float64Array( 4 ), new Float64Array( 4 ), new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, new Float64Array( 4 ) );
	}, RangeError );
});

test( 'dorgql throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		dorgql( 'row-major', new Float64Array( 4 ), -1, new Float64Array( 4 ), new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, new Float64Array( 4 ) );
	}, RangeError );
});

test( 'dorgql throws RangeError for negative K', function t() {
	assert.throws( function throws() {
		dorgql( 'row-major', new Float64Array( 4 ), new Float64Array( 4 ), -1, new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, new Float64Array( 4 ) );
	}, RangeError );
});

test( 'dorgql: WORK = null allocates the optimal workspace (blocked path, K = 140 > NX = 128)', function t() {
	const N = 140;
	const A = new Float64Array( N * N );
	const TAU = new Float64Array( N );
	let err, dot, i, j, k;
	for ( i = 0; i < A.length; i++ ) {
		A[ i ] = Math.sin( ( ( i + 1 ) * 7 ) + ( Math.floor( i / N ) * 13 ) );
	}
	dgeqlf( N, N, A, 1, N, 0, TAU, 1, 0, new Float64Array( ( N * 64 ) + 4096 ), 1, 0 );
	const info = dorgql( 'column-major', N, N, N, A, N, TAU, 1, null );
	assert.strictEqual( info, 0, 'returns 0' );
	err = 0.0;
	for ( i = 0; i < N; i++ ) {
		for ( j = 0; j < N; j++ ) {
			dot = ( i === j ) ? -1.0 : 0.0;
			for ( k = 0; k < N; k++ ) {
				dot += A[ ( i * N ) + k ] * A[ ( j * N ) + k ];
			}
			err = Math.max( err, Math.abs( dot ) );
		}
	}
	assert.ok( err <= 1e-12, 'Q^T Q = I: ' + err );
});
