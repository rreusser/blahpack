/* eslint-disable no-restricted-syntax */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import zunghr from './../lib/zunghr.js';
import strided from './../lib/strided.js';
import zgehrd from '../../zgehrd/lib/base.js';
import { computeOptimalWorkSize } from './../lib/base.js';


// TESTS //

test( 'zunghr is a function', function t() {
	assert.strictEqual( typeof zunghr, 'function', 'is a function' );
});

test( 'zunghr has expected arity', function t() {
	assert.strictEqual( zunghr.length, 9, 'has expected arity' );
});

test( 'zunghr throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		zunghr( 'column-major', -1, 2, 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, new Float64Array( 4 ) );
	}, RangeError );
});

test( 'zunghr allocates the optimal workspace when WORK is null (blocked, ihi-ilo > 32)', function t() {
	var TAU;
	var A1;
	var A2;
	var v1;
	var v2;
	var N;
	var i;
	N = 40;
	A1 = new Complex128Array( N * N );
	v1 = reinterpret( A1, 0 );
	TAU = new Complex128Array( N - 1 );
	for ( i = 0; i < v1.length; i++ ) {
		v1[ i ] = Math.sin( ( 0.29 * i ) + 0.3 );
	}
	zgehrd( N, 1, N, A1, 1, N, 0, TAU, 1, 0, new Complex128Array( N * 64 ), 1, 0 );
	A2 = new Complex128Array( v1 );
	v2 = reinterpret( A2, 0 );
	strided( N, 1, N, A1, 1, N, 0, TAU, 1, 0, new Complex128Array( ( N - 1 ) * 32 ), 1, 0 );
	zunghr( 'column-major', N, 1, N, A2, N, TAU, 1, null );
	for ( i = 0; i < v1.length; i++ ) {
		assert.ok( !Number.isNaN( v2[ i ] ), 'finite at ' + i );
		assert.strictEqual( v2[ i ], v1[ i ], 'matches strided at ' + i );
	}
});

test( 'zunghr: computeOptimalWorkSize returns the reference LWKOPT (NB = ILAENV( 1, ZUNGQR ) = 32)', function t() {
	assert.strictEqual( computeOptimalWorkSize( 1, 1 ), 32, '1, 1' );
	assert.strictEqual( computeOptimalWorkSize( 2, 7 ), 160, '2, 7' );
});
