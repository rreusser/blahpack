/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dggqrf from './../lib/dggqrf.js';


// TESTS //

test( 'dggqrf is a function', function t() {
	assert.strictEqual( typeof dggqrf, 'function', 'is a function' );
});

test( 'dggqrf has expected arity', function t() {
	assert.strictEqual( dggqrf.length, 13, 'has expected arity' );
});

test( 'dggqrf throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		dggqrf( 'column-major', -1, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, new Float64Array( 4 ) );
	}, RangeError );
});

test( 'dggqrf throws RangeError for negative M', function t() {
	assert.throws( function throws() {
		dggqrf( 'column-major', new Float64Array( 4 ), -1, 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, new Float64Array( 4 ) );
	}, RangeError );
});

test( 'dggqrf: WORK = null allocates the optimal workspace (bit-exact with an optimal WORK, past the blocking threshold)', function t() { // eslint-disable-line max-len
	const N = 45;
	const M = 40;
	const P = 50;
	const A1 = new Float64Array( N * M );
	const B1 = new Float64Array( N * P );
	let i;
	for ( i = 0; i < A1.length; i++ ) {
		A1[ i ] = Math.sin( ( i * 0.37 ) + 1.0 );
	}
	for ( i = 0; i < B1.length; i++ ) {
		B1[ i ] = Math.cos( ( i * 0.29 ) + 0.5 );
	}
	const A2 = new Float64Array( A1 );
	const B2 = new Float64Array( B1 );
	const TA1 = new Float64Array( Math.min( N, M ) );
	const TB1 = new Float64Array( Math.min( N, P ) );
	const TA2 = new Float64Array( TA1.length );
	const TB2 = new Float64Array( TB1.length );
	const work = new Float64Array( Math.max( Math.max( N, M, P ) * 32, ( P * 32 ) + 4160 ) );
	assert.strictEqual( dggqrf( 'column-major', N, M, P, A1, N, TA1, 1, B1, N, TB1, 1, null ), 0 );
	assert.strictEqual( dggqrf( 'column-major', N, M, P, A2, N, TA2, 1, B2, N, TB2, 1, work ), 0 );
	assert.deepStrictEqual( A1, A2 );
	assert.deepStrictEqual( B1, B2 );
	assert.deepStrictEqual( TA1, TA2 );
	assert.deepStrictEqual( TB1, TB2 );
});
