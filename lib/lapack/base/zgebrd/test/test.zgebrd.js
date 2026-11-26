/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import zgebrd from './../lib/zgebrd.js';


// TESTS //

test( 'zgebrd is a function', function t() {
	assert.strictEqual( typeof zgebrd, 'function', 'is a function' );
});

test( 'zgebrd has expected arity', function t() {
	assert.strictEqual( zgebrd.length, 14, 'has expected arity' );
});

test( 'zgebrd throws TypeError for invalid order', function t() {
	assert.throws( function throws() {
		zgebrd( 'invalid', new Float64Array( 4 ), new Float64Array( 4 ), new Float64Array( 4 ), 2, 2, 1, 2, 1, new Float64Array( 4 ), 1, new Float64Array( 4 ), 1, new Float64Array( 4 ) );
	}, TypeError );
});

test( 'zgebrd throws RangeError for negative M', function t() {
	assert.throws( function throws() {
		zgebrd( 'row-major', -1, new Float64Array( 4 ), new Float64Array( 4 ), 2, 2, 1, 2, 1, new Float64Array( 4 ), 1, new Float64Array( 4 ), 1, new Float64Array( 4 ) );
	}, RangeError );
});

test( 'zgebrd throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		zgebrd( 'row-major', new Float64Array( 4 ), -1, new Float64Array( 4 ), 2, 2, 1, 2, 1, new Float64Array( 4 ), 1, new Float64Array( 4 ), 1, new Float64Array( 4 ) );
	}, RangeError );
});

test( 'zgebrd: WORK = null allocates a workspace and matches a caller-provided one', function t() {
	const M = 5;
	const N = 4;
	const A1 = new Complex128Array( M * N );
	const A2 = new Complex128Array( M * N );
	const a1 = reinterpret( A1, 0 );
	const a2 = reinterpret( A2, 0 );
	const d1 = new Float64Array( N );
	const d2 = new Float64Array( N );
	let i;
	for ( i = 0; i < 2 * M * N; i++ ) {
		a1[ i ] = Math.sin( ( 0.37 * i * i ) + 1.3 );
		a2[ i ] = a1[ i ];
	}
	assert.strictEqual( zgebrd( 'column-major', M, N, A1, M, d1, 1, new Float64Array( N - 1 ), 1, new Complex128Array( N ), 1, new Complex128Array( N ), 1, null ), 0, 'returns 0' );
	zgebrd( 'column-major', M, N, A2, M, d2, 1, new Float64Array( N - 1 ), 1, new Complex128Array( N ), 1, new Complex128Array( N ), 1, new Complex128Array( M ) );
	assert.deepStrictEqual( a1, a2, 'A' );
	assert.deepStrictEqual( d1, d2, 'd' );
});

test( 'zgebrd: WORK = null allocates the optimum (M+N)*NB and blocks past the crossover, bit-identical to an explicit optimal WORK (ticket 0049)', function t() {
	const M = 140;
	const N = 132;
	const A1 = new Complex128Array( M * N );
	const A2 = new Complex128Array( M * N );
	const a1 = reinterpret( A1, 0 );
	const a2 = reinterpret( A2, 0 );
	const d1 = new Float64Array( N );
	const d2 = new Float64Array( N );
	let i;
	for ( i = 0; i < 2 * M * N; i++ ) {
		a1[ i ] = Math.sin( ( 0.37 * i * i ) + 1.3 );
		a2[ i ] = a1[ i ];
	}
	zgebrd( 'column-major', M, N, A1, M, d1, 1, new Float64Array( N - 1 ), 1, new Complex128Array( N ), 1, new Complex128Array( N ), 1, null );
	zgebrd( 'column-major', M, N, A2, M, d2, 1, new Float64Array( N - 1 ), 1, new Complex128Array( N ), 1, new Complex128Array( N ), 1, new Complex128Array( ( M + N ) * 32 ) );
	assert.deepStrictEqual( a1, a2, 'A' );
	assert.deepStrictEqual( d1, d2, 'd' );
});
