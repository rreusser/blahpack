/* eslint-disable no-restricted-syntax */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import Complex128 from '@stdlib/complex/float64/ctor/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import zspr from './../lib/zspr.js';
import zsprNd from './../lib/ndarray.js';


// TESTS //

test( 'zspr is a function', function t() {
	assert.strictEqual( typeof zspr, 'function', 'is a function' );
});

test( 'zspr has expected arity', function t() {
	assert.strictEqual( zspr.length, 7, 'has expected arity' );
});

test( 'zspr throws TypeError for invalid uplo', function t() {
	assert.throws( function throws() {
		zspr( 'column-major', 'invalid', new Float64Array( 4 ), 2, 2, 1, new Float64Array( 4 ) );
	}, TypeError );
});

test( 'zspr throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		zspr( 'column-major', 'upper', -1, 2, 2, 1, new Float64Array( 4 ) );
	}, RangeError );
});

test( 'zspr throws TypeError for invalid order', function t() {
	assert.throws( function throws() {
		zspr( 'invalid', 'upper', 2, new Complex128( 1.0, 0.0 ), new Complex128Array( 2 ), 1, new Complex128Array( 3 ) );
	}, TypeError );
});

test( 'zspr throws RangeError for zero strideX', function t() {
	assert.throws( function throws() {
		zspr( 'column-major', 'upper', 2, new Complex128( 1.0, 0.0 ), new Complex128Array( 2 ), 0, new Complex128Array( 3 ) );
	}, RangeError );
});

test( 'zspr throws TypeError for row-major order (packed storage is column-major only)', function t() {
	assert.throws( function throws() {
		zspr( 'row-major', 'upper', 2, new Complex128( 1.0, 0.0 ), new Complex128Array( 2 ), 1, new Complex128Array( 3 ) );
	}, TypeError );
});

test( 'zspr (column-major) matches ndarray for both triangles and positive/negative strides', function t() {
	const alpha = new Complex128( 1.5, -0.5 );
	const xdata = [ 1.0, 0.5, 2.0, -1.0, 3.0, 1.0, -0.5, 0.25, 0.7, -1.3, 0.4, 2.2 ];
	const apdata = [
		2.0, 0.5, 1.0, 1.0, 4.0, -0.5,
		3.0, -2.0, 2.0, 1.0, 5.0, 0.3
	];
	const cases = [
		[ 'upper', 1 ], [ 'lower', 1 ], [ 'upper', -2 ], [ 'lower', 2 ]
	];
	let APe;
	let APa;
	let out;
	let N;
	let i;
	let k;
	N = 3;
	for ( k = 0; k < cases.length; k += 1 ) {
		APa = new Complex128Array( apdata );
		APe = new Complex128Array( apdata );
		out = zspr( 'column-major', cases[ k ][ 0 ], N, alpha, new Complex128Array( xdata ), cases[ k ][ 1 ], APa );
		assert.strictEqual( out, APa );
		zsprNd( cases[ k ][ 0 ], N, alpha, new Complex128Array( xdata ), cases[ k ][ 1 ], ( cases[ k ][ 1 ] < 0 ) ? ( 1 - N ) * cases[ k ][ 1 ] : 0, APe, 1, 0 );
		const a = reinterpret( APa, 0 );
		const e = reinterpret( APe, 0 );
		for ( i = 0; i < e.length; i += 1 ) {
			assert.strictEqual( a[ i ], e[ i ], cases[ k ].join( ',' ) + ' AP[' + i + ']' );
		}
		// The update must actually change AP (alpha != 0, x != 0):
		assert.notStrictEqual( a[ 0 ], apdata[ 0 ] );
	}
});
