/* eslint-disable no-restricted-syntax */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import zgeqp3 from './../lib/zgeqp3.js';
import rect_4x3 from './fixtures/rect_4x3.json' with { type: 'json' };


// TESTS //

test( 'zgeqp3 is a function', function t() {
	assert.strictEqual( typeof zgeqp3, 'function', 'is a function' );
});

test( 'zgeqp3 has expected arity', function t() {
	assert.strictEqual( zgeqp3.length, 11, 'has expected arity' );
});

test( 'zgeqp3 throws TypeError for invalid order', function t() {
	assert.throws( function throws() {
		zgeqp3( 'invalid', new Float64Array( 4 ), new Float64Array( 4 ), new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, new Float64Array( 4 ), 1, new Float64Array( 4 ), new Float64Array( 4 ) );
	}, TypeError );
});

test( 'zgeqp3 throws RangeError for negative M', function t() {
	assert.throws( function throws() {
		zgeqp3( 'row-major', -1, new Float64Array( 4 ), new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, new Float64Array( 4 ), 1, new Float64Array( 4 ), new Float64Array( 4 ) );
	}, RangeError );
});

test( 'zgeqp3 throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		zgeqp3( 'row-major', new Float64Array( 4 ), -1, new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, new Float64Array( 4 ), 1, new Float64Array( 4 ), new Float64Array( 4 ) );
	}, RangeError );
});

test( 'zgeqp3: allocates WORK and RWORK when null (column-major 4x3)', function t() {
	const tc = rect_4x3;
	const LDA = 8;
	const A = new Complex128Array( LDA * 3 );
	const Av = reinterpret( A, 0 );
	const vals = [
		[ 1, 0, 2, 1, 0, 0, 1, 1 ],
		[ 0, 2, 1, 0, 3, 1, 2, 0 ],
		[ 3, 1, 0, 0, 1, 0, 2, 1 ]
	];
	let i;
	let j;
	for ( j = 0; j < 3; j++ ) {
		for ( i = 0; i < 8; i++ ) {
			Av[ ( 2 * LDA * j ) + i ] = vals[ j ][ i ];
		}
	}
	const JPVT = new Int32Array( 3 );
	const TAU = new Complex128Array( 3 );
	const info = zgeqp3( 'column-major', 4, 3, A, LDA, JPVT, 1, TAU, 1, null, null );
	assert.strictEqual( info, 0, 'info' );
	assert.deepStrictEqual( Array.from( JPVT ), tc.jpvt, 'jpvt' );
	for ( i = 0; i < tc.tau.length; i++ ) {
		assert.ok( Math.abs( reinterpret( TAU, 0 )[ i ] - tc.tau[ i ] ) <= 1e-10, 'tau[' + i + ']' );
	}
	for ( i = 0; i < tc.a.length; i++ ) {
		assert.ok( Math.abs( Av[ i ] - tc.a[ i ] ) <= 1e-10, 'a[' + i + ']' );
	}
});
