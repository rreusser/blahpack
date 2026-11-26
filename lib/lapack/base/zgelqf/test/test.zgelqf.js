/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import zgelqf from './../lib/zgelqf.js';
import zgelqfNd from './../lib/ndarray.js';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';


// TESTS //

test( 'zgelqf is a function', function t() {
	assert.strictEqual( typeof zgelqf, 'function', 'is a function' );
});

test( 'zgelqf has expected arity', function t() {
	assert.strictEqual( zgelqf.length, 8, 'has expected arity' );
});

test( 'zgelqf throws TypeError for invalid order', function t() {
	assert.throws( function throws() {
		zgelqf( 'invalid', new Float64Array( 4 ), new Float64Array( 4 ), new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, new Float64Array( 4 ) );
	}, TypeError );
});

test( 'zgelqf throws RangeError for negative M', function t() {
	assert.throws( function throws() {
		zgelqf( 'row-major', -1, new Float64Array( 4 ), new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, new Float64Array( 4 ) );
	}, RangeError );
});

test( 'zgelqf throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		zgelqf( 'row-major', new Float64Array( 4 ), -1, new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, new Float64Array( 4 ) );
	}, RangeError );
});


test( 'zgelqf allocates the optimal WORK when WORK is null (140x140, blocked)', function t() {
	const A = new Complex128Array( 140 * 140 );
	let i;
	const Av = reinterpret( A, 0 );
	for ( i = 0; i < 2 * 140 * 140; i++ ) {
		Av[ i ] = Math.sin( ( 0.37 * i ) + 1.0 ) + ( ( i % ( 2 * 141 ) === 0 ) ? 4.0 : 0.0 );
	}
	const B = new Complex128Array( A );
	const TAU = new Complex128Array( 140 );
	const TAU2 = new Complex128Array( 140 );
	const info = zgelqf( 'column-major', 140, 140, A, 140, TAU, 1, null );
	assert.strictEqual( info, 0 );
	zgelqfNd( 140, 140, B, 1, 140, 0, TAU2, 1, 0, new Complex128Array( 140 * 32 ), 1, 0 );
	assert.deepStrictEqual( reinterpret( A, 0 ), reinterpret( B, 0 ) );
	assert.deepStrictEqual( reinterpret( TAU, 0 ), reinterpret( TAU2, 0 ) );
});
