/* eslint-disable no-restricted-syntax, stdlib/first-unit-test, max-len, max-statements-per-line */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import zgerqf from './../lib/zgerqf.js';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import zgerqfNd from './../lib/ndarray.js';


// TESTS //

test( 'zgerqf is a function', function t() {
	assert.strictEqual( typeof zgerqf, 'function', 'is a function' );
});

test( 'zgerqf has expected arity', function t() {
	assert.strictEqual( zgerqf.length, 8, 'has expected arity' );
});

test( 'zgerqf throws TypeError for invalid order', function t() {
	assert.throws( function throws() {
		zgerqf( 'invalid', 2, 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ) );
	}, TypeError );
});

test( 'zgerqf throws RangeError for negative M', function t() {
	assert.throws( function throws() {
		zgerqf( 'row-major', -1, 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ) );
	}, RangeError );
});

test( 'zgerqf throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		zgerqf( 'row-major', 2, -1, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ) );
	}, RangeError );
});

test( 'zgerqf allocates the optimal WORK when WORK is null (140x150, blocked)', function t() {
	const M = 140;
	const N = 150;
	const A = new Complex128Array( M * N );
	let i;
	const av = reinterpret( A, 0 );
	for ( i = 0; i < av.length; i++ ) {
		av[ i ] = Math.cos( ( 0.29 * i ) + 0.5 ) + ( ( i % ( 2 * ( M + 1 ) ) === 0 ) ? 3.0 : 0.0 );
	}
	const B = new Complex128Array( A );
	const TAU = new Complex128Array( M );
	const TAU2 = new Complex128Array( M );
	const info = zgerqf( 'column-major', M, N, A, M, TAU, 1, null );
	assert.strictEqual( info, 0 );
	zgerqfNd( M, N, B, 1, M, 0, TAU2, 1, 0, new Complex128Array( M * 32 ), 1, 0 );
	assert.deepStrictEqual( reinterpret( A, 0 ), reinterpret( B, 0 ) );
	assert.deepStrictEqual( reinterpret( TAU, 0 ), reinterpret( TAU2, 0 ) );
});
