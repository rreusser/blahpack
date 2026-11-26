/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dorghr from './../lib/dorghr.js';
import ndarray from './../lib/ndarray.js';
import dgehrd from '../../dgehrd/lib/base.js';


// TESTS //

test( 'dorghr is a function', function t() {
	assert.strictEqual( typeof dorghr, 'function', 'is a function' );
});

test( 'dorghr has expected arity', function t() {
	assert.strictEqual( dorghr.length, 9, 'has expected arity' );
});

test( 'dorghr throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		dorghr( 'column-major', -1, 2, 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, new Float64Array( 4 ) );
	}, RangeError );
});

test( 'dorghr allocates the optimal workspace when WORK is null (blocked, ihi-ilo > 32)', function t() {
	var TAU;
	var A1;
	var A2;
	var N;
	var i;
	N = 40;
	A1 = new Float64Array( N * N );
	TAU = new Float64Array( N - 1 );
	for ( i = 0; i < A1.length; i++ ) {
		A1[ i ] = Math.sin( ( 0.29 * i ) + 0.3 );
	}
	dgehrd( N, 1, N, A1, 1, N, 0, TAU, 1, 0, new Float64Array( N * 64 ), 1, 0 );
	A2 = new Float64Array( A1 );
	ndarray( N, 1, N, A1, 1, N, 0, TAU, 1, 0, new Float64Array( ( N - 1 ) * 32 ), 1, 0 );
	dorghr( 'column-major', N, 1, N, A2, N, TAU, 1, null );
	for ( i = 0; i < A1.length; i++ ) {
		assert.ok( A2[ i ] === A2[ i ], 'finite at ' + i );
		assert.strictEqual( A2[ i ], A1[ i ], 'matches ndarray at ' + i );
	}
});
