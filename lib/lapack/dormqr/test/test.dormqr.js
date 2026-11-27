/* eslint-disable no-restricted-syntax */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dormqr from './../lib/dormqr.js';
import dgeqr2 from '../../dgeqr2/lib/base.js';
import dormqrNd from './../lib/ndarray.js';


// TESTS //

test( 'dormqr is a function', function t() {
	assert.strictEqual( typeof dormqr, 'function', 'is a function' );
});

test( 'dormqr has expected arity', function t() {
	assert.strictEqual( dormqr.length, 13, 'has expected arity' );
});

test( 'dormqr throws TypeError for invalid order', function t() {
	assert.throws( function throws() {
		dormqr( 'invalid', 'left', 'no-transpose', new Float64Array( 4 ), new Float64Array( 4 ), new Float64Array( 4 ), new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, new Float64Array( 4 ), 2, new Float64Array( 4 ) );
	}, TypeError );
});

test( 'dormqr throws TypeError for invalid side', function t() {
	assert.throws( function throws() {
		dormqr( 'row-major', 'invalid', 'no-transpose', new Float64Array( 4 ), new Float64Array( 4 ), new Float64Array( 4 ), new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, new Float64Array( 4 ), 2, new Float64Array( 4 ) );
	}, TypeError );
});

test( 'dormqr throws TypeError for invalid trans', function t() {
	assert.throws( function throws() {
		dormqr( 'row-major', 'left', 'invalid', new Float64Array( 4 ), new Float64Array( 4 ), new Float64Array( 4 ), new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, new Float64Array( 4 ), 2, new Float64Array( 4 ) );
	}, TypeError );
});

test( 'dormqr throws RangeError for negative M', function t() {
	assert.throws( function throws() {
		dormqr( 'row-major', 'left', 'no-transpose', -1, new Float64Array( 4 ), new Float64Array( 4 ), new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, new Float64Array( 4 ), 2, new Float64Array( 4 ) );
	}, RangeError );
});

test( 'dormqr throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		dormqr( 'row-major', 'left', 'no-transpose', new Float64Array( 4 ), -1, new Float64Array( 4 ), new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, new Float64Array( 4 ), 2, new Float64Array( 4 ) );
	}, RangeError );
});

test( 'dormqr throws RangeError for negative K', function t() {
	assert.throws( function throws() {
		dormqr( 'row-major', 'left', 'no-transpose', new Float64Array( 4 ), new Float64Array( 4 ), -1, new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, new Float64Array( 4 ), 2, new Float64Array( 4 ) );
	}, RangeError );
});

test( 'dormqr: WORK = null allocates the optimal workspace (blocked path, K > NB)', function t() {
	const N = 40;
	const TAU = new Float64Array( N );
	const A = new Float64Array( N * N );
	const C0 = new Float64Array( N * N );
	let i;
	for ( i = 0; i < N * N; i++ ) {
		A[ i ] = Math.sin( ( 0.37 * i * i ) + 1.3 );
		C0[ i ] = Math.cos( ( 0.23 * i ) + 0.7 );
	}
	dgeqr2( N, N, A, 1, N, 0, TAU, 1, 0, new Float64Array( N ), 1, 0 );
	[ 'left', 'right' ].forEach( function eachSide( side ) {
		[ 'no-transpose', 'transpose' ].forEach( function eachTrans( trans ) {
			const expected = new Float64Array( C0 );
			const C = new Float64Array( C0 );
			dormqrNd( side, trans, N, N, N, A, 1, N, 0, TAU, 1, 0, expected, 1, N, 0, new Float64Array( ( N * 32 ) + 4160 ), 1, 0 );
			const info = dormqr( 'column-major', side, trans, N, N, N, A, N, TAU, 1, C, N, null );
			assert.strictEqual( info, 0, 'info' );
			assert.deepStrictEqual( C, expected, side + '/' + trans );
		});
	});
});
